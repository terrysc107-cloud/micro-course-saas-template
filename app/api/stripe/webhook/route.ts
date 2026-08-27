import { getStripe, getWebhookConfig, StripeConfigError } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { recordLabRegistration } from "@/lib/build-lab";
import {
  recordEntitlement,
  setEntitlementStatusBySubscription,
  type EntitlementProduct,
} from "@/lib/entitlements";
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Grant a Build Lab seat. Reached only via the `product === "build-lab"` branch
 * below, which means the signature is verified and the session is paid.
 *
 * Deliberately separate from the course grant: a Lab seat and a course
 * entitlement are different rows in different tables with different shapes, and
 * course_purchases must not be touched by a Lab purchase.
 */
async function grantLabSeat(session: Stripe.Checkout.Session, userId: string) {
  const labSessionId = session.metadata?.labSessionId;

  if (!labSessionId) {
    // Should be unreachable — /api/build-lab/checkout always sets it. If it
    // happens, someone paid and there is no way to know which run they bought.
    // 200 because a retry cannot add metadata that was never set; the log is
    // what gets them seated or refunded by hand.
    console.error(
      `[stripe/webhook] CRITICAL: build-lab session ${session.id} has no labSessionId. ` +
        `User ${userId} PAID and has NO SEAT. Reconcile manually.`
    );
    return NextResponse.json({ received: true, ignored: "missing labSessionId" });
  }

  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    console.error(
      `[stripe/webhook] CRITICAL: build-lab session ${session.id} has no email. ` +
        `User ${userId} PAID and has NO SEAT. Reconcile manually.`
    );
    return NextResponse.json({ received: true, ignored: "missing email" });
  }

  const ok = await recordLabRegistration({
    labSessionId,
    userId,
    email,
    // amount_total is what Stripe actually charged. Trust it over any local
    // constant — if they ever disagree, the charge is the truth.
    amountCents: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    stripeSessionId: session.id,
    stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
  });

  if (!ok) {
    // 500 so Stripe retries — a paying attendee must not lose their seat to a
    // transient database error.
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Grant a ladder entitlement (the Kit, the Board Room). Reached only from the
 * `product` branch below, which means the signature is verified and Stripe
 * reported the session paid.
 *
 * Separate from both the course grant and the Lab grant on purpose: three
 * products, three tables, three shapes. A Kit purchase must never be able to
 * write to course_purchases.
 */
async function grantEntitlement(
  session: Stripe.Checkout.Session,
  userId: string,
  product: EntitlementProduct
) {
  const ok = await recordEntitlement({
    userId,
    product,
    // amount_total is what Stripe actually charged. Trust it over any local
    // constant — if they ever disagree, the charge is the truth.
    amountCents: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    stripeSessionId: session.id,
    stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
    stripeSubscriptionId:
      typeof session.subscription === "string" ? session.subscription : null,
  });

  if (!ok) {
    // 500 so Stripe retries — a paying customer must not lose access to a
    // transient database error.
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

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

  // Subscription lifecycle for the Board Room. Without these, a cancelled or
  // failed subscription would keep granting access forever, because the only
  // other write path is the initial checkout.
  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const status =
      event.type === "customer.subscription.deleted" || sub.status === "canceled"
        ? "canceled"
        : sub.status === "past_due" || sub.status === "unpaid"
          ? "past_due"
          : sub.status === "active" || sub.status === "trialing"
            ? "active"
            : null;

    // Statuses we do not map (e.g. incomplete) are left alone rather than
    // guessed at — a wrong guess either revokes a paying member or grants a
    // lapsed one.
    if (status) {
      const ok = await setEntitlementStatusBySubscription(sub.id, status);
      if (!ok) return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
    return NextResponse.json({ received: true });
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

  // ── The one branch between a customer's money and their access ────────────
  //
  // `?? "course"` IS LOAD-BEARING. Sessions created BEFORE this deploy carry no
  // `product` metadata. Without the default, anyone mid-checkout during rollout
  // pays and gets nothing — and Stripe retries a 200 exactly zero times. Do not
  // "tidy" this into a required field.
  const product = session.metadata?.product ?? "course";

  if (product === "build-lab") {
    return await grantLabSeat(session, userId);
  }

  if (product === "kit" || product === "board-room" || product === "dev-pack") {
    return await grantEntitlement(session, userId, product);
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
