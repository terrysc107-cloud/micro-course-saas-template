import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) {
      return NextResponse.json({ error: "No userId in metadata" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("course_purchases").upsert(
      {
        user_id: userId,
        stripe_session_id: session.id,
        is_active: true,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Failed to insert purchase:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
