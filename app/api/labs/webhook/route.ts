import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { syncLabCheckout } from "@/lib/labs/payments";
import { createServiceClient } from "@/lib/supabase/server";
import { checkDb } from "@/lib/labs/server";
export const runtime = "nodejs";

/** Dedicated endpoint and signing secret. Legacy course/ladder webhook is unchanged. */
export async function POST(request: Request) {
  const secret = process.env.LAB_STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret)
    return Response.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return Response.json({ error: "Missing signature." }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }
  try {
    if (
      ["checkout.session.completed", "checkout.session.expired"].includes(
        event.type,
      )
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.product === "build-lab-series") {
        // Retrieve current state so delayed/out-of-order events are harmless.
        await syncLabCheckout(
          await getStripe().checkout.sessions.retrieve(session.id),
        );
      }
    }
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const id =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (id) {
        const intent = await getStripe().paymentIntents.retrieve(id, {
          expand: ["latest_charge"],
        });
        const current = intent.latest_charge as Stripe.Charge | null;
        if (
          intent.metadata.product === "build-lab-series" &&
          current &&
          typeof current !== "string" &&
          current.refunded
        ) {
          checkDb(
            (
              await createServiceClient().rpc("ccc_bl_refund", {
                p_intent: id,
                p_reservation: intent.metadata.reservationId,
              })
            ).error,
          );
        }
      }
    }
    return Response.json({ received: true });
  } catch {
    console.error("[labs/webhook] reconciliation failed; Stripe must retry");
    return Response.json({ error: "Reconciliation failed." }, { status: 500 });
  }
}
