import { getStripe, getWebhookConfig, StripeConfigError } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * The ONLY path that grants course access.
 *
 * Clients cannot write to course_purchases (see
 * supabase/migrations/20260716124800_secure_course_purchase_rls.sql), so this
 * handler and the service role behind it are the whole gate. Two rules follow:
 *
 *  1. Never grant without a verified Stripe signature.
 *  2. Never grant unless Stripe says the session was actually paid.
 */
export async function POST(request: NextRequest) {
  let webhookSecret: string;
  try {
    ({ webhookSecret } = getWebhookConfig());
  } catch (err) {
    if (err instanceof StripeConfigError) {
      // 500, not 400: the request may be perfectly valid — we are the broken
      // party. A non-2xx makes Stripe retry, so a grant isn't lost to a
      // temporarily misconfigured deploy.
      console.error("[stripe/webhook] refusing to process:", err.message);
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    throw err;
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    // 400 here is correct: don't ask Stripe to retry an unverifiable payload.
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId ?? session.client_reference_id;

  if (!userId) {
    // 200: retrying won't add metadata that was never set. Log and move on so
    // the event doesn't wedge the Stripe retry queue.
    console.error("[stripe/webhook] no userId on session:", session.id);
    return NextResponse.json({ received: true, ignored: "missing userId" });
  }

  // A completed session is not necessarily a paid one (e.g. async payment
  // methods). Only `paid` grants access.
  if (session.payment_status !== "paid") {
    console.warn(
      `[stripe/webhook] session ${session.id} completed with payment_status=${session.payment_status}; not granting`
    );
    return NextResponse.json({ received: true, ignored: "not paid" });
  }

  const supabase = createServiceClient();

  // Idempotent by design: Stripe retries on any non-2xx, and can deliver the
  // same event more than once. user_id is UNIQUE, so a replay updates the same
  // row instead of creating a second grant.
  const { error } = await supabase.from("course_purchases").upsert(
    {
      user_id: userId,
      stripe_session_id: session.id,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    // 500 so Stripe retries — a paying customer must not lose access to a
    // transient database error.
    console.error("[stripe/webhook] failed to record purchase:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
