import { createClient } from "@/lib/supabase/server";
import { getStripe, getCheckoutConfig, StripeConfigError } from "@/lib/stripe";
import { hasPurchased } from "@/lib/progress";
import { PRODUCT } from "@/lib/course-config";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ANONYMOUS CHECKOUT IS ALLOWED, and that is the point of this route now.
  //
  // This used to 401 anyone without an account, and BuyButton turned that into
  // a redirect to sign-up. A stranger who clicked buy therefore had to create a
  // password and then leave for their inbox to confirm it, all BEFORE paying.
  // The account is no longer a precondition: Stripe collects the email, and the
  // webhook provisions the account from the receipt.
  //
  // A signed-in buyer still gets their id attached, which skips provisioning
  // entirely and keeps their purchase on the account they are already using.
  if (user && (await hasPurchased(user.id))) {
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
    // ASSERT THE LIVE PRICE AGAINST CONFIG BEFORE CHARGING ANYONE.
    //
    // This route previously trusted the price id blindly, which was survivable
    // while the page and Stripe had both said $97 since launch. It stopped
    // being survivable when the course was repriced: a config change without a
    // matching Stripe price would quietly charge the old amount while the page
    // advertised the new one. Refusing is the only acceptable behaviour when
    // the two disagree. The Lab and ladder checkouts already do this.
    const price = await getStripe().prices.retrieve(config.priceId);
    if (price.unit_amount !== PRODUCT.priceCents) {
      console.error(
        `[stripe/checkout] price mismatch: stripe=${price.unit_amount} ` +
          `config=${PRODUCT.priceCents} (price ${config.priceId}). Refusing to charge.`
      );
      return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Restrict to immediate card payments. The webhook intentionally grants only
      // when checkout.session.completed reports payment_status === "paid"; enabling
      // asynchronous methods would also require handling async_payment_succeeded.
      payment_method_types: ["card"],
      line_items: [{ price: config.priceId, quantity: 1 }],
      // Anonymous buyers have no session, so /dashboard would bounce them to
      // sign-in the moment they land. /welcome explains what happens next and
      // works signed in or out.
      success_url: `${config.siteUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.siteUrl}/?checkout=cancelled`,
      // The webhook trusts this to identify the buyer. Stripe signs the webhook
      // payload, so metadata set here can't be tampered with in transit.
      // userId only when we have one. Its absence is the webhook's signal to
      // provision an account from customer_details.email.
      metadata: user ? { userId: user.id } : {},
      client_reference_id: user?.id,
      customer_email: user?.email,
      // Required for anonymous checkout: this is the address the account gets
      // created against, so Stripe must ask for it.
      customer_creation: "always",
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
