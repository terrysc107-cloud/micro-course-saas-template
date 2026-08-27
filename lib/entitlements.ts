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

/**
 * Products stored in ccc_entitlements. "dev-pack" is not a LadderRung: it is an
 * off-ladder add-on, because a solopreneur's next step is the Kit, not learning
 * Next.js. Keeping it out of LADDER is what stops the ladder implying beginners
 * graduate into writing software.
 */
export type EntitlementProduct =
  | Extract<LadderRung["id"], "kit" | "board-room">
  | "dev-pack";

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

/**
 * PostgREST's code for "that table is not in the schema cache", i.e. the
 * migration has not been applied yet.
 */
const TABLE_MISSING = "PGRST205";

/**
 * Three-state answer for gating paid content, because "no row" and "no table"
 * mean opposite things and must not collapse into the same boolean.
 *
 *   "owned"       - they have it
 *   "locked"      - the gate is live and they do not have it
 *   "ungated"     - the entitlements table does not exist yet, so the gate is
 *                   not in service and must not lock anyone out
 *
 * WHY THIS EXISTS: ccc_entitlements is written but unapplied in production. A
 * plain boolean would read `false` for everyone, and the Dev Pack gate would
 * lock all ~50 developer lessons for every existing purchaser the moment this
 * deploys, including people who bought the course when it was the whole thing.
 * Failing closed on a missing table punishes customers for our migration
 * backlog. Failing closed on any OTHER error is still correct, because that is
 * a real gate that failed.
 */
export async function entitlementStatus(
  product: EntitlementProduct
): Promise<"owned" | "locked" | "ungated"> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ccc_entitlements")
    .select("product, status")
    .eq("product", product)
    .eq("status", "active");

  if (error) {
    if (error.code === TABLE_MISSING) {
      console.warn(
        `[entitlements] ccc_entitlements is missing; ${product} gate is not in service.`
      );
      return "ungated";
    }
    // A real failure against a real table. Fail closed.
    console.error(`[entitlements] ${product} check failed:`, error.message);
    return "locked";
  }

  return (data?.length ?? 0) > 0 ? "owned" : "locked";
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
