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
