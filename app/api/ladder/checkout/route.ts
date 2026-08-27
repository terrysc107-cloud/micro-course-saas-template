import { createClient } from "@/lib/supabase/server";
import { getStripe, StripeConfigError } from "@/lib/stripe";
import { getRung, type LadderRung } from "@/lib/course-config";
import { hasEntitlement, type EntitlementProduct } from "@/lib/entitlements";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Checkout for the ladder rungs that live in ccc_entitlements — the Kit and the
 * Board Room.
 *
 * NOT a replacement for /api/stripe/checkout or /api/build-lab/checkout. Those
 * two are live, each has product-specific rules (course: one per user ever;
 * Lab: a dated session row with real seat counting), and folding them into a
 * generic handler would mean rewriting the payment path of a selling product to
 * ship a new one. This handles the rungs whose only question is "does this user
 * have it or not".
 *
 * FAIL CLOSED, in this order, before Stripe is ever called:
 *   1. Signed in? A grant needs a user id to attach to.
 *   2. Is the id a real rung, and is it one this route is allowed to sell?
 *   3. Is the rung marked available in config? An unreleased rung cannot be
 *      bought by POSTing its id — the config flag is the gate, not the UI.
 *   4. Is the price id actually configured in this deploy?
 *   5. Does the live Stripe price match the price in config? If the two ever
 *      disagree, refuse rather than charge someone a number we did not show
 *      them. This is the same assertion the Lab checkout makes.
 */

const SELLABLE_HERE: readonly EntitlementProduct[] = ["kit", "board-room"] as const;

function isSellableHere(id: string): id is EntitlementProduct {
  return (SELLABLE_HERE as readonly string[]).includes(id);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rung?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rungId = body.rung;
  if (!rungId || !isSellableHere(rungId)) {
    return NextResponse.json({ error: "Unknown rung" }, { status: 400 });
  }

  const rung = getRung(rungId) as LadderRung | undefined;
  if (!rung) {
    return NextResponse.json({ error: "Unknown rung" }, { status: 400 });
  }

  // The config flag is the release gate. Flipping `available` is what opens
  // sales; the UI hiding a button is a presentation detail, not a control.
  if (!rung.available) {
    return NextResponse.json({ error: "Not available yet" }, { status: 409 });
  }

  if (await hasEntitlement(rungId)) {
    return NextResponse.json(
      { error: "Already purchased", alreadyOwned: true },
      { status: 409 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const priceId = rung.priceIdEnvVar ? process.env[rung.priceIdEnvVar] : undefined;

  if (!siteUrl || !priceId) {
    const missing = [
      !siteUrl && "NEXT_PUBLIC_SITE_URL",
      !priceId && rung.priceIdEnvVar,
    ].filter(Boolean);
    console.error(
      `[ladder/checkout] refusing to sell ${rungId}: missing ${missing.join(", ")}`
    );
    return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
  }

  try {
    const stripe = getStripe();

    // Assert the live price against config before charging anyone. A typo in
    // course-config.ts must not be able to take a different amount than the
    // page displayed.
    const price = await stripe.prices.retrieve(priceId);
    if (rung.priceCents !== null && price.unit_amount !== rung.priceCents) {
      console.error(
        `[ladder/checkout] price mismatch for ${rungId}: stripe=${price.unit_amount} ` +
          `config=${rung.priceCents} (price ${priceId})`
      );
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }

    const isRecurring = rung.kind === "recurring";
    if (isRecurring !== (price.type === "recurring")) {
      console.error(
        `[ladder/checkout] mode mismatch for ${rungId}: config kind=${rung.kind} ` +
          `stripe price type=${price.type}`
      );
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?purchased=${rungId}`,
      cancel_url: `${siteUrl}/ladder?checkout=cancelled`,
      // The webhook branches on `product` and attaches the grant to `userId`.
      // Stripe signs the payload, so these cannot be tampered with in transit.
      metadata: { userId: user.id, product: rungId },
      client_reference_id: user.id,
      customer_email: user.email,
    });

    if (!session.url) {
      console.error(`[ladder/checkout] session created without a url: ${session.id}`);
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof StripeConfigError) {
      console.error("[ladder/checkout] refusing to create session:", err.message);
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }
    console.error("[ladder/checkout] stripe error:", err);
    return NextResponse.json({ error: "Checkout is not available" }, { status: 500 });
  }
}
