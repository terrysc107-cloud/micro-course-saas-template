import { createClient } from "@/lib/supabase/server";
import { getStripe, getCheckoutConfig, StripeConfigError } from "@/lib/stripe";
import { hasPurchased } from "@/lib/progress";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // BuyButton turns a 401 into a redirect to sign-up. We need a user id to
  // attach the purchase to, so there is no anonymous checkout path.
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Don't let someone pay twice for a course they already own.
  if (await hasPurchased(user.id)) {
    return NextResponse.json({ error: "Already purchased", alreadyOwned: true }, { status: 409 });
  }

  let config;
  try {
    config = getCheckoutConfig();
  } catch (err) {
    // Fail closed and loudly: a misconfigured deploy must never render a broken
    // Stripe page to a buyer.
    if (err instanceof StripeConfigError) {
      console.error("[stripe/checkout] refusing to create session:", err.message);
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }
    throw err;
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Restrict to immediate card payments. The webhook intentionally grants only
      // when checkout.session.completed reports payment_status === "paid"; enabling
      // asynchronous methods would also require handling async_payment_succeeded.
      payment_method_types: ["card"],
      line_items: [{ price: config.priceId, quantity: 1 }],
      success_url: `${config.siteUrl}/dashboard?success=true`,
      cancel_url: `${config.siteUrl}/?checkout=cancelled`,
      // The webhook trusts this to identify the buyer. Stripe signs the webhook
      // payload, so metadata set here can't be tampered with in transit.
      metadata: { userId: user.id },
      client_reference_id: user.id,
      customer_email: user.email,
    });

    if (!session.url) {
      console.error("[stripe/checkout] session created without a url:", session.id);
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] failed to create session:", err);
    return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
  }
}
