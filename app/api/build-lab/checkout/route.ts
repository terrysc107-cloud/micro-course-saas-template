import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getLabCheckoutConfig, StripeConfigError } from "@/lib/stripe";
import { getLabAvailability, hasLabRegistration } from "@/lib/build-lab";
import { BUILD_LAB } from "@/lib/course-config";

export const runtime = "nodejs";

/**
 * POST /api/build-lab/checkout — buy a seat at the current Build Lab run.
 *
 * A SECOND ROUTE, NOT A BRANCH IN /api/stripe/checkout. That route sells the
 * live $97 course and works today. Adding a product switch to it would put every
 * Lab bug in the path of course revenue for no benefit — the two share nothing
 * but a Stripe client.
 *
 * SHIPS COLD. BUILD_LAB.status is 'waitlist', so the config gate below returns
 * 503 on every call until Terry schedules a run. The code is live and testable
 * before it can take a cent.
 *
 * GUARDS, CHEAPEST FIRST — each one is a way this can wrongly charge someone:
 *   1. config gate   — is the funnel even switched on?
 *   2. db gate       — does a real, dated, priced, non-full run exist?
 *   3. auth          — we need a user id to attach the seat to
 *   4. already-paid  — never sell the same person a second seat on one run
 *   5. price drift   — if Stripe and config disagree on the number, refuse
 */
export async function POST() {
  // 1. Config gate. The single switch for the whole funnel; free to check.
  if (BUILD_LAB.status !== "scheduled") {
    return NextResponse.json({ error: "Registration is not open." }, { status: 503 });
  }

  // 2. Database gate. Config says a run is on; the row has to agree — with a
  // real date, a real price, and a seat left. getLabAvailability fails closed,
  // so a broken seat count refuses the sale rather than overselling the room.
  const { session: labSession, open, soldOut } = await getLabAvailability();

  if (!labSession) {
    console.error("[build-lab/checkout] no session row — cannot sell seats");
    return NextResponse.json({ error: "Registration is not open." }, { status: 503 });
  }
  if (soldOut) {
    return NextResponse.json({ error: "This run is sold out.", soldOut: true }, { status: 409 });
  }
  if (!open) {
    return NextResponse.json({ error: "Registration is not open." }, { status: 503 });
  }

  // 3. Auth. LabBuyButton turns a 401 into a redirect to sign-up.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Already holding a seat on THIS run. Scoped to the session, because
  // attending a second run later is a sale we want, not a duplicate.
  if (await hasLabRegistration(user.id, labSession.id)) {
    return NextResponse.json(
      { error: "You already have a seat on this run.", alreadyRegistered: true },
      { status: 409 }
    );
  }

  let config;
  try {
    config = getLabCheckoutConfig();
  } catch (err) {
    if (err instanceof StripeConfigError) {
      console.error("[build-lab/checkout] refusing to create session:", err.message);
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }
    throw err;
  }

  try {
    // 5. Price drift. Three places carry the number — the page (config), the
    // row, and Stripe — and only Stripe's is charged. If they disagree, someone
    // is about to be billed an amount the page never showed them. Refuse: a
    // failed checkout is recoverable, a surprise charge is not.
    const price = await getStripe().prices.retrieve(config.priceId);

    if (price.unit_amount !== BUILD_LAB.priceCents || price.unit_amount !== labSession.price_cents) {
      console.error(
        `[build-lab/checkout] PRICE DRIFT — refusing to charge. stripe=${price.unit_amount} ` +
          `config=${BUILD_LAB.priceCents} row=${labSession.price_cents} (price ${config.priceId})`
      );
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }
    if (!price.active) {
      console.error(`[build-lab/checkout] price ${config.priceId} is archived; refusing`);
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }
    // The row's price id is what the flip procedure recorded. Charging a
    // different one means the env var and the run have drifted apart.
    if (labSession.stripe_price_id !== config.priceId) {
      console.error(
        `[build-lab/checkout] price id mismatch — env=${config.priceId} row=${labSession.stripe_price_id}`
      );
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }

    const checkout = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Card only, matching the course checkout. The webhook grants only on
      // payment_status === 'paid'; async methods would need
      // async_payment_succeeded handling that does not exist.
      payment_method_types: ["card"],
      line_items: [{ price: config.priceId, quantity: 1 }],
      success_url: `${config.siteUrl}/build-lab/legacy?registered=true`,
      cancel_url: `${config.siteUrl}/build-lab/legacy?checkout=cancelled`,
      // Stripe signs the webhook payload, so metadata set here cannot be
      // tampered with in transit. `product` is what the webhook branches on;
      // `labSessionId` pins the seat to THIS run, so a seat bought for the
      // founding run can never land on a later one.
      metadata: {
        product: "build-lab",
        userId: user.id,
        labSessionId: labSession.id,
      },
      client_reference_id: user.id,
      customer_email: user.email,
    });

    if (!checkout.url) {
      console.error("[build-lab/checkout] session created without a url:", checkout.id);
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[build-lab/checkout] failed to create session:", err);
    return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
  }
}
