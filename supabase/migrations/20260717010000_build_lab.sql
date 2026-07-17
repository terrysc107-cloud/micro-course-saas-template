-- The Build Lab: live sessions, a waitlist, and paid registrations.
--
-- PREFIX
-- This Supabase project (supabase-crimson-ladder, acouuzccqkcpyrckrgwg) is
-- shared. It already holds AI by Design's bda_* tables, MyQualifiedResume's
-- resume_*, and others. The unprefixed course_purchases / lesson_progress /
-- quiz_results / user_course_state predate that convention and are deliberately
-- NOT renamed here — they gate a live paid product and the rename buys nothing
-- but risk. Everything new gets ccc_.
--
-- SHAPE
-- course_purchases.user_id is UNIQUE: one lifetime entitlement per person. A
-- repeatable live session is the opposite shape — many runs, many people, and
-- the same person may attend more than one. Hence UNIQUE(session_id, user_id)
-- on registrations, never UNIQUE(user_id). That one line is the difference
-- between an entitlement and an event, and getting it wrong would permanently
-- bar a returning attendee from a second run.
--
-- SECURITY
-- Read 20260716124800_secure_course_purchase_rls.sql before touching the
-- policies below. The exploit it documents is not hypothetical: a policy with
-- USING and no WITH CHECK reuses USING as the check, so `FOR ALL USING
-- (auth.uid() = user_id)` let any authenticated client INSERT its own
-- entitlement row and take the course for free. The same mistake here means
-- free seats at a paid live session. Every write below goes through the service
-- role or does not happen.
--
-- SCARCITY
-- capacity is a real number Terry sets, because a live session genuinely holds
-- only so many people. Seats remaining are computed from capacity minus actual
-- paid registrations. Nothing in the app may render a seat count that does not
-- come from these rows.

BEGIN;

-- ── Sessions ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ccc_lab_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,        -- 'founding-run'
  title            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'waitlist'
                   CHECK (status IN ('waitlist','scheduled','sold_out','running','complete','cancelled')),

  -- All NULL while status is 'waitlist'. There is no date yet, so there is no
  -- date in the database. Nothing to leak, nothing to accidentally render.
  starts_at        TIMESTAMPTZ,
  duration_minutes INTEGER,
  timezone         TEXT,
  capacity         INTEGER CHECK (capacity IS NULL OR capacity > 0),

  stripe_price_id  TEXT,
  price_cents      INTEGER CHECK (price_cents IS NULL OR price_cents > 0),
  currency         TEXT NOT NULL DEFAULT 'usd',

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- The claim rule, enforced by the database rather than by good intentions.
  -- A run cannot become purchasable without a real date AND a real price. This
  -- is what turns "no invented dates" from a comment into a constraint: even a
  -- careless UPDATE cannot open a session that does not exist.
  CONSTRAINT ccc_lab_sessions_scheduled_is_real CHECK (
    status <> 'scheduled'
    OR (starts_at IS NOT NULL AND stripe_price_id IS NOT NULL AND price_cents IS NOT NULL)
  ),

  -- Selling seats requires knowing how many there are.
  CONSTRAINT ccc_lab_sessions_scheduled_has_capacity CHECK (
    status <> 'scheduled' OR capacity IS NOT NULL
  )
);

-- ── Waitlist ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ccc_lab_waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES ccc_lab_sessions(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  -- Nullable on purpose: someone who has never signed up must be able to join.
  -- Demand is the whole point of the waitlist; requiring an account first would
  -- measure account creation instead.
  user_id     UUID REFERENCES auth.users(id),
  source      TEXT,                              -- utm_content / placement slug
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  converted_registration_id UUID
);

-- Case-insensitive dedupe without depending on the citext extension.
CREATE UNIQUE INDEX IF NOT EXISTS ccc_lab_waitlist_session_email_key
  ON ccc_lab_waitlist (session_id, lower(email));

-- ── Registrations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ccc_lab_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES ccc_lab_sessions(id),
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  email         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'paid'
                CHECK (status IN ('paid','refunded','cancelled')),
  amount_cents  INTEGER NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'usd',

  stripe_session_id        TEXT NOT NULL,
  stripe_customer_id       TEXT,
  stripe_payment_intent_id TEXT,

  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One seat per person per run. NOT UNIQUE(user_id) — see the header.
  UNIQUE (session_id, user_id)
);

-- Webhook idempotency: Stripe retries, and a retry must not double-book.
CREATE UNIQUE INDEX IF NOT EXISTS ccc_lab_registrations_stripe_session_id_key
  ON ccc_lab_registrations (stripe_session_id);

-- Seats-remaining is counted per request; this keeps that cheap.
CREATE INDEX IF NOT EXISTS ccc_lab_registrations_session_paid_idx
  ON ccc_lab_registrations (session_id) WHERE status = 'paid';

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE ccc_lab_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ccc_lab_waitlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ccc_lab_registrations ENABLE ROW LEVEL SECURITY;

-- sessions: public read. The marketing page needs status, date, and capacity
-- before anyone signs in. No client writes — note this is FOR SELECT, not FOR
-- ALL, so there is no USING-as-WITH-CHECK trapdoor.
DROP POLICY IF EXISTS ccc_lab_sessions_select_public ON ccc_lab_sessions;
CREATE POLICY ccc_lab_sessions_select_public
  ON ccc_lab_sessions FOR SELECT TO anon, authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ccc_lab_sessions FROM anon, authenticated;
GRANT SELECT ON ccc_lab_sessions TO anon, authenticated;

-- registrations: you may read your own seat and nothing else. No INSERT/UPDATE/
-- DELETE policy exists for any client role, so RLS denies those by default.
-- The Stripe webhook (service role) is the only thing that creates a seat.
DROP POLICY IF EXISTS ccc_lab_registrations_select_own ON ccc_lab_registrations;
CREATE POLICY ccc_lab_registrations_select_own
  ON ccc_lab_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ccc_lab_registrations FROM anon, authenticated;
GRANT SELECT ON ccc_lab_registrations TO authenticated;

-- waitlist: no client access in either direction, and deliberately no anon
-- INSERT policy. An INSERT-only policy looks safe but leaks: PostgREST honours
-- `Prefer: return=representation`, and ON CONFLICT behaves observably
-- differently for a row that already exists. Either turns a write-only table
-- into an email enumeration oracle — ask "is bob@corp.com on the list?" and
-- the response tells you. Joining goes through POST /api/build-lab/waitlist,
-- server-side, service role, which always answers the same way.
REVOKE ALL ON ccc_lab_waitlist FROM anon, authenticated;

-- service_role is untouched: it bypasses RLS and is reachable only from
-- server-side route handlers holding SUPABASE_SERVICE_ROLE_KEY.

-- ── Seed ─────────────────────────────────────────────────────────────────────
-- The founding run exists so the page has something to point at. It has no
-- date, no capacity, and no price — those arrive together when Terry schedules
-- it, and the CHECK constraints above refuse anything less.
INSERT INTO ccc_lab_sessions (slug, title, status)
VALUES ('founding-run', 'The Build Lab — founding run', 'waitlist')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- ── Verification ─────────────────────────────────────────────────────────────
-- Run as an AUTHENTICATED user (not service_role), against a preview branch.
-- Mirrors the procedure in docs/PAYMENT-GATE-SECURITY.md.
--
--   -- Expect: the founding-run row.
--   SELECT slug, status, starts_at, capacity FROM ccc_lab_sessions;
--
--   -- Expect: ERROR permission denied. If this succeeds, seats are free.
--   INSERT INTO ccc_lab_registrations
--     (session_id, user_id, email, amount_cents, stripe_session_id)
--   VALUES ((SELECT id FROM ccc_lab_sessions WHERE slug='founding-run'),
--           auth.uid(), 'x@y.z', 0, 'forged');
--
--   -- Expect: ERROR permission denied. An empty result is a FAILURE — it means
--   -- the table is readable and merely happens to have no rows in it.
--   SELECT * FROM ccc_lab_waitlist;
--
--   -- Expect: exactly one policy per table, SELECT only.
--   SELECT tablename, policyname, cmd, roles FROM pg_policies
--   WHERE tablename LIKE 'ccc_lab_%' ORDER BY tablename;
--
--   -- Expect: ERROR — violates ccc_lab_sessions_scheduled_is_real.
--   UPDATE ccc_lab_sessions SET status='scheduled' WHERE slug='founding-run';
