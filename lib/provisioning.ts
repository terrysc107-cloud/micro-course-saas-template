import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Turns a paid Stripe checkout into an account.
 *
 * WHY THIS EXISTS: the funnel used to demand an account BEFORE payment. A
 * stranger who clicked buy was sent to sign-up, made a password, and then hit
 * "check your email" — which pushed them off the site to their inbox before
 * they had paid anything. They then had to return, find the page again, and
 * click buy a second time. Ten steps with an exit in the middle, and the exit
 * came before the money.
 *
 * Now Stripe collects the email, the payment happens first, and the account is
 * provisioned from the receipt. Same end state, no detour at the worst moment.
 *
 * THE RULE: this runs inside the verified webhook, after Stripe has confirmed
 * payment. It must never be reachable from a client.
 */

export interface ProvisionResult {
  userId: string;
  /** True when we created the account just now and sent a set-password email. */
  created: boolean;
}

/**
 * Finds the account for an email, creating and inviting one if absent.
 *
 * Returns null only when the account could neither be found nor created, which
 * the caller must treat as a hard failure: somebody has paid and has no way in.
 */
export async function findOrCreateUser(email: string): Promise<ProvisionResult | null> {
  const supabase = createServiceClient();
  const normalized = email.trim().toLowerCase();

  // Existing account? Buying while signed out with an email you already used is
  // ordinary, and inviting them again would be confusing.
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) {
      console.error("[provisioning] listUsers failed:", error.message);
      return null;
    }
    const existing = data.users.find(
      (u) => u.email?.trim().toLowerCase() === normalized
    );
    if (existing) return { userId: existing.id, created: false };
  } catch (err) {
    console.error("[provisioning] listUsers threw:", err);
    return null;
  }

  // No account. Invite creates the user AND sends a set-password email through
  // the mail Supabase is already configured with, so this needs no new provider.
  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(normalized);
    if (error || !data?.user) {
      console.error("[provisioning] invite failed:", error?.message);
      return null;
    }
    return { userId: data.user.id, created: true };
  } catch (err) {
    console.error("[provisioning] invite threw:", err);
    return null;
  }
}
