import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getLabSession } from "@/lib/build-lab";
import { PARENT_BRAND } from "@/lib/course-config";

export const runtime = "nodejs";

/**
 * POST /api/build-lab/waitlist  { email, source? }
 *
 * The only write path to ccc_lab_waitlist. The table grants nothing to anon or
 * authenticated — see supabase/migrations/20260717010000_build_lab.sql — so
 * this route holds the service role and is the whole door.
 *
 * WHY THIS IS A ROUTE AND NOT AN anon INSERT POLICY:
 * An INSERT-only RLS policy looks safe and isn't. PostgREST honours
 * `Prefer: return=representation`, and ON CONFLICT behaves observably
 * differently for a row that already exists. Either one turns a write-only
 * table into an email enumeration oracle: POST bob@corp.com, read the
 * response, learn whether Bob is on the list.
 *
 * WHY IT ALWAYS RETURNS THE SAME 200:
 * For the same reason. A 409 on "already joined" is the same leak moved up a
 * layer — it confirms membership to anyone who can guess an address. Joining
 * twice is not an error worth reporting; it is the same outcome as joining
 * once, and that is exactly what the caller is told.
 *
 * NO ACCOUNT REQUIRED: the waitlist measures demand. Requiring a sign-up first
 * would measure sign-ups instead, and the whole point of shipping this ahead of
 * checkout is to learn whether anyone wants the thing.
 *
 * WHAT A SIGNUP DOES, IN ORDER:
 *   1. Records the row here — session-scoped, with placement attribution. This
 *      is the durable record of demand and the only step that can fail loudly.
 *   2. Hands off to aixdesign.dev/api/subscribe, which sends the Build Lab
 *      confirmation from the verified brand sender and adds them to the
 *      AI by Design newsletter list. Best-effort; see enrollWithParentBrand.
 */

/** Deliberately permissive. This is shape validation, not deliverability. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_EMAIL_LEN = 254; // RFC 5321
const MAX_SOURCE_LEN = 120;

/**
 * Hand the signup to AI by Design, which owns the email identity.
 *
 * aixdesign.dev has Resend, the verified sender (hello@aixdesign.dev), the
 * subscriber table with unsubscribe tokens, and the owner notification — the
 * whole pipeline. This repo has none of it, and adding a second Resend
 * integration here would mean two senders claiming to be the same brand and
 * two unsubscribe stories. So the Lab confirmation and the newsletter
 * enrolment both happen there, keyed off source:'build-lab'.
 *
 * BEST-EFFORT BY DESIGN. The ccc_lab_waitlist row is the record of demand and
 * it is already committed by the time this runs. If aixdesign is down, the
 * person is still on the list and Terry can reconcile from the table — losing
 * the signup because the welcome email failed would be the worse trade.
 */
async function enrollWithParentBrand(email: string): Promise<void> {
  // Override to point at a local or preview aixdesign. Without it the only way
  // to exercise this path is to post a real signup to production.
  const base = process.env.PARENT_BRAND_URL || PARENT_BRAND.url;
  try {
    const res = await fetch(`${base}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "build-lab" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(
        `[build-lab/waitlist] parent-brand enrol failed (${res.status}) for ${email} — row is saved; reconcile from ccc_lab_waitlist`
      );
    }
  } catch (err) {
    console.error(
      `[build-lab/waitlist] parent-brand enrol threw for ${email} — row is saved; reconcile from ccc_lab_waitlist:`,
      err instanceof Error ? err.message : err
    );
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const { email, source } = (body ?? {}) as { email?: unknown; source?: unknown };

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()) || email.length > MAX_EMAIL_LEN) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  const session = await getLabSession();
  if (!session) {
    // The seed row is missing. That is our problem, not the visitor's, and it
    // is not something they can fix by retrying.
    console.error("[build-lab/waitlist] no session row — cannot record signups");
    return NextResponse.json({ error: "Waitlist is unavailable right now." }, { status: 503 });
  }

  // Attach the account if they happen to be signed in; never require it.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // No session cookie. Expected for most visitors.
  }

  const cleanEmail = email.trim().toLowerCase();

  const db = createServiceClient();
  const { error } = await db.from("ccc_lab_waitlist").insert({
    session_id: session.id,
    email: cleanEmail,
    user_id: userId,
    source: typeof source === "string" ? source.slice(0, MAX_SOURCE_LEN) : null,
  });

  // 23505 = unique_violation, i.e. already on the list. Not an error worth
  // surfacing: the caller asked to be on the list and they are on the list.
  //
  // Plain insert rather than upsert, on purpose. The unique index is on
  // (session_id, lower(email)) — a functional index — and ON CONFLICT requires
  // an exactly matching constraint, so an upsert with onConflict:"session_id,
  // email" throws at runtime. Swallowing 23505 also keeps the original
  // created_at intact, so "when did they join" stays true.
  const alreadyOnList = error?.code === "23505";
  if (error && !alreadyOnList) {
    console.error("[build-lab/waitlist] insert failed:", error.message);
    return NextResponse.json({ error: "Could not add you just now. Try again?" }, { status: 500 });
  }

  // Only on a genuinely new row. aixdesign's /api/subscribe upserts with
  // ignoreDuplicates:false and re-sends the welcome on every call, so calling
  // it for a repeat submit would email the same person again. Gating on the
  // insert result makes a double-submit a no-op — and the caller cannot tell,
  // because the response below is identical either way.
  if (!alreadyOnList) {
    await enrollWithParentBrand(cleanEmail);
  }

  // Identical response either way. See the header: anything else is an
  // enumeration oracle.
  return NextResponse.json({ joined: true });
}
