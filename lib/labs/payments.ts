import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { checkDb, LabError } from "./server";

export type Reservation = {
  id: string;
  application_id: string;
  cohort_id: string;
  user_id: string;
  status: string;
  price_cents: number;
  currency: string;
  stripe_price_id: string;
  stripe_session_id: string | null;
  checkout_url: string | null;
  checkout_expires_at: string;
  terms: string;
};
export async function syncLabCheckout(session: Stripe.Checkout.Session) {
  const id = session.metadata?.reservationId;
  if (session.metadata?.product !== "build-lab-series" || !id)
    throw new LabError("Unknown lab checkout.");
  const db = createServiceClient();
  const { data: r, error } = await db
    .from("ccc_bl_reservations")
    .select("*")
    .eq("id", id)
    .single();
  checkDb(error);
  if (
    !r ||
    (r.stripe_session_id && r.stripe_session_id !== session.id) ||
    r.user_id !== session.metadata?.userId
  )
    throw new LabError("Checkout identity mismatch.");
  if (r.status === "refunded") return;
  if (session.payment_status === "paid") {
    const intentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!intentId) throw new LabError("Payment is still being confirmed.", 409);
    const intent = await getStripe().paymentIntents.retrieve(intentId, {
      expand: ["latest_charge"],
    });
    const charge = intent.latest_charge as Stripe.Charge | null;
    // Any refund ends access; see the refund terms on the cohort.
    if (charge && typeof charge !== "string" && charge.amount_refunded > 0) {
      checkDb(
        (
          await db.rpc("ccc_bl_refund", {
            p_intent: intentId,
            p_reservation: id,
          })
        ).error,
      );
      return;
    }
    checkDb(
      (
        await db.rpc("ccc_bl_fulfill", {
          p_reservation: id,
          p_session: session.id,
          p_amount: session.amount_total,
          p_currency: session.currency,
          p_intent: intentId,
        })
      ).error,
    );
  } else if (session.status === "expired") {
    checkDb(
      (
        await db
          .from("ccc_bl_reservations")
          .update({ status: "released", stripe_session_id: session.id })
          .eq("id", id)
          .eq("status", "held")
      ).error,
    );
  }
}

export async function beginLabCheckout(
  applicationId: string,
  userId: string,
  email: string,
  priceCents: number,
  terms: string,
) {
  if (process.env.LAB_CHECKOUT_ENABLED !== "true")
    throw new LabError(
      "Enrollment will open after dates and payment setup are confirmed.",
      503,
    );
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (!site || !process.env.LAB_STRIPE_WEBHOOK_SECRET?.trim())
    throw new LabError("Enrollment is not ready yet.", 503);
  const db = createServiceClient();
  const { data, error } = await db.rpc("ccc_bl_reserve", {
    p_application: applicationId,
    p_user: userId,
    p_price: priceCents,
    p_terms: terms,
  });
  if (error)
    throw new LabError(
      "A seat could not be reserved. Check your acceptance and cohort availability.",
      409,
    );
  const r = data as Reservation;
  if (r.status === "paid") return { url: `${site}/lab-studio?enrolled=true` };
  const stripe = getStripe();
  if (r.stripe_session_id) {
    const existing = await stripe.checkout.sessions.retrieve(
      r.stripe_session_id,
    );
    await syncLabCheckout(existing);
    if (existing.status === "open" && existing.url)
      return { url: existing.url };
    if (existing.payment_status === "paid")
      return { url: `${site}/lab-studio?enrolled=true` };
    throw new LabError(
      "Your previous checkout expired. Try once more to reserve a fresh seat.",
      409,
    );
  }
  // Do not silently recycle an uncertain Stripe request. Its idempotency key
  // must be reconciled before another reservation can take this capacity.
  if (new Date(r.checkout_expires_at).getTime() - Date.now() < 31 * 60000)
    throw new LabError(
      "Your checkout needs a quick reconciliation. Contact the instructor before retrying.",
      409,
    );
  const price = await stripe.prices.retrieve(r.stripe_price_id);
  if (
    !price.active ||
    price.type !== "one_time" ||
    price.unit_amount !== r.price_cents ||
    price.currency !== r.currency
  )
    throw new LabError(
      "Enrollment pricing is being updated. Please contact the instructor.",
      503,
    );
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: r.stripe_price_id, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId,
      success_url: `${site}/lab-studio?checkout=complete`,
      cancel_url: `${site}/lab-studio?checkout=cancelled`,
      expires_at: Math.floor(new Date(r.checkout_expires_at).getTime() / 1000),
      metadata: { product: "build-lab-series", reservationId: r.id, userId },
      payment_intent_data: {
        metadata: { product: "build-lab-series", reservationId: r.id },
      },
    },
    { idempotencyKey: `build-lab:${r.id}` },
  );
  checkDb(
    (
      await db
        .from("ccc_bl_reservations")
        .update({ stripe_session_id: session.id, checkout_url: session.url })
        .eq("id", r.id)
    ).error,
  );
  if (!session.url)
    throw new LabError("Checkout did not return a payment link.", 503);
  return { url: session.url };
}
