import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { BUILD_LAB } from "@/lib/course-config";

/**
 * Build Lab server helpers.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: every number the page shows about
 * seats, dates, or availability originates here, from a row. Nothing renders a
 * seat count or a date that a component typed. Real scarcity is wanted — the
 * Lab is a live session and the cap is genuine — but "real" means traceable to
 * ccc_lab_sessions.capacity minus actual paid registrations.
 *
 * Config vs database, deliberately split:
 *   - lib/course-config.ts BUILD_LAB decides what RENDERS
 *   - ccc_lab_sessions decides what CHARGES
 * Both must agree before checkout will create a Stripe session. A typo in
 * config cannot take money; a date in config with no dated row sells nothing.
 */

export interface LabSession {
  id: string;
  slug: string;
  title: string;
  status: "waitlist" | "scheduled" | "sold_out" | "running" | "complete" | "cancelled";
  starts_at: string | null;
  duration_minutes: number | null;
  timezone: string | null;
  capacity: number | null;
  stripe_price_id: string | null;
  price_cents: number | null;
  currency: string;
}

export interface LabAvailability {
  session: LabSession | null;
  /** Seats sold. Counted, never assumed. */
  taken: number;
  /** capacity - taken, or null when there is no cap yet (i.e. no date yet). */
  seatsLeft: number | null;
  /** True only when a real cap exists and is genuinely full. */
  soldOut: boolean;
  /** Registration is actually open: config AND the row agree, and seats exist. */
  open: boolean;
}

/** The current run. Returns null if the seed row is missing. */
export async function getLabSession(): Promise<LabSession | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const db = createServiceClient();
  const { data, error } = await db
    .from("ccc_lab_sessions")
    .select("*")
    .eq("slug", BUILD_LAB.sessionSlug)
    .maybeSingle();

  if (error) {
    console.error("[build-lab] session lookup failed:", error.message);
    return null;
  }
  return (data as LabSession) ?? null;
}

/**
 * Availability, computed per request.
 *
 * `taken` is a real count of paid registrations — which is what makes
 * "N seats left" and "sold out" honest rather than theatre. Refunded and
 * cancelled seats are excluded, so they return to the pool, which is the
 * behaviour a buyer would expect if they asked.
 */
export async function getLabAvailability(): Promise<LabAvailability> {
  const session = await getLabSession();
  if (!session) {
    return { session: null, taken: 0, seatsLeft: null, soldOut: false, open: false };
  }

  const db = createServiceClient();
  const { count, error } = await db
    .from("ccc_lab_registrations")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("status", "paid");

  if (error) {
    // Fail closed. If we cannot count seats we do not know whether the room is
    // full, and guessing here either oversells a live session or invents
    // scarcity. Both are worse than showing nothing.
    console.error("[build-lab] seat count failed:", error.message);
    return { session, taken: 0, seatsLeft: null, soldOut: false, open: false };
  }

  const taken = count ?? 0;
  const seatsLeft = session.capacity === null ? null : Math.max(0, session.capacity - taken);
  const soldOut = seatsLeft !== null && seatsLeft === 0;

  // Both sources must say yes. Config alone cannot open the door.
  const open =
    BUILD_LAB.status === "scheduled" &&
    session.status === "scheduled" &&
    !!session.starts_at &&
    !!session.stripe_price_id &&
    !soldOut;

  return { session, taken, seatsLeft, soldOut, open };
}

/**
 * Record a paid seat. Called ONLY by the Stripe webhook, after signature
 * verification and a payment_status === 'paid' check.
 *
 * Returns true when the seat is safely recorded (including when it already
 * was). Returns false only for errors worth a Stripe retry.
 *
 * IDEMPOTENT TWO WAYS, because Stripe retries on any non-2xx and can deliver
 * the same event more than once:
 *   - same stripe_session_id  → upsert updates the one row (unique index)
 *   - same (session_id, user_id) via a DIFFERENT stripe session → 23505, which
 *     is NOT retried. That state means someone paid twice for one seat, and no
 *     amount of retrying fixes it. Retrying would only wedge the queue; the log
 *     line is the thing that gets them a refund.
 */
export async function recordLabRegistration(input: {
  labSessionId: string;
  userId: string;
  email: string;
  amountCents: number;
  currency: string;
  stripeSessionId: string;
  stripeCustomerId: string | null;
  stripePaymentIntentId: string | null;
}): Promise<boolean> {
  const db = createServiceClient();

  const { error } = await db.from("ccc_lab_registrations").upsert(
    {
      session_id: input.labSessionId,
      user_id: input.userId,
      email: input.email,
      status: "paid",
      amount_cents: input.amountCents,
      currency: input.currency,
      stripe_session_id: input.stripeSessionId,
      stripe_customer_id: input.stripeCustomerId,
      stripe_payment_intent_id: input.stripePaymentIntentId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_session_id" }
  );

  if (!error) return true;

  // 23505 here can only be the (session_id, user_id) constraint — the
  // stripe_session_id collision is what the upsert above absorbs.
  if (error.code === "23505") {
    console.error(
      `[build-lab] DOUBLE PAYMENT — user ${input.userId} already holds a seat on run ` +
        `${input.labSessionId}; stripe session ${input.stripeSessionId} paid ` +
        `${input.amountCents} and needs a REFUND. Seat is intact; not retrying.`
    );
    return true;
  }

  console.error("[build-lab] failed to record registration:", error.message);
  return false;
}

/** Has this user already got a seat on this run? Used to avoid double-charging. */
export async function hasLabRegistration(userId: string, sessionId: string): Promise<boolean> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("ccc_lab_registrations")
    .select("id")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("status", "paid")
    .maybeSingle();

  if (error) {
    console.error("[build-lab] registration lookup failed:", error.message);
    return false;
  }
  return !!data;
}
