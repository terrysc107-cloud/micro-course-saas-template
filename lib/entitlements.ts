import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { LadderRung } from "@/lib/course-config";

/**
 * Entitlement reads and writes for the ladder rungs stored in ccc_entitlements
 * (the Kit and the Board Room).
 *
 * Deliberately NOT the gate for the course or a Lab seat. Those live in
 * course_purchases and ccc_lab_registrations respectively, and asking this file
 * about them would create a second answer to "did they pay", which is how gates
 * get bypassed. `hasLadderAccess` refuses those ids at the type level.
 */

export type EntitlementProduct = Extract<LadderRung["id"], "kit" | "board-room">;

export interface Entitlement {
  product: EntitlementProduct;
  status: "active" | "canceled" | "past_due";
  granted_at: string;
}

/**
 * Every entitlement the signed-in user holds. Uses the request-scoped client,
 * so RLS applies and a caller can only ever see their own rows — the query has
 * no user_id filter because the policy is the filter.
 */
export async function getMyEntitlements(): Promise<Entitlement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ccc_entitlements")
    .select("product, status, granted_at");

  if (error) {
    // A read failure must not be mistaken for "no access" in a way that hides
    // the cause. Log and return empty: the caller degrades to locked, which is
    // the safe direction.
    console.error("[entitlements] read failed:", error.message);
    return [];
  }
  return (data ?? []) as Entitlement[];
}

export async function hasEntitlement(product: EntitlementProduct): Promise<boolean> {
  const all = await getMyEntitlements();
  return all.some((e) => e.product === product && e.status === "active");
}

/**
 * Grant or refresh an entitlement. Service role only — reached exclusively from
 * the verified Stripe webhook.
 *
 * Idempotent: (user_id, product) is UNIQUE, so a redelivered event updates the
 * same row instead of granting twice.
 */
export async function recordEntitlement(input: {
  userId: string;
  product: EntitlementProduct;
  amountCents: number;
  currency: string;
  stripeSessionId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("ccc_entitlements").upsert(
    {
      user_id: input.userId,
      product: input.product,
      status: "active",
      amount_cents: input.amountCents,
      currency: input.currency,
      stripe_session_id: input.stripeSessionId,
      stripe_customer_id: input.stripeCustomerId,
      stripe_subscription_id: input.stripeSubscriptionId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product" }
  );

  if (error) {
    console.error("[entitlements] grant failed:", error.message);
    return false;
  }
  return true;
}

/**
 * Move a subscription entitlement out of 'active'. Called from subscription
 * lifecycle webhook events so a cancelled Board Room stops granting access
 * without deleting the record of it having existed.
 */
export async function setEntitlementStatusBySubscription(
  stripeSubscriptionId: string,
  status: Entitlement["status"]
): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("ccc_entitlements")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    console.error("[entitlements] status update failed:", error.message);
    return false;
  }
  return true;
}
