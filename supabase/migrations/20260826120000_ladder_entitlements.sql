-- Entitlements for the ladder rungs that are neither the course nor a Lab seat.
--
-- WHY A NEW TABLE RATHER THAN REUSING course_purchases
-- course_purchases is the live gate on a product that is selling today. It is
-- shaped for exactly one entitlement per user (user_id is UNIQUE) and it is
-- read on every gated request. Widening it to carry a product column would mean
-- changing the hot path and the UNIQUE constraint on a paid, live product to
-- ship an unrelated rung. Not worth it. The Lab made the same call with
-- ccc_lab_registrations, and this follows that precedent.
--
-- WHAT THIS COVERS
-- The Kit (one-time) and the Board Room (recurring). Both are "does this user
-- have access to X" questions with no per-session shape, so one generic table
-- serves both and any future rung of the same kind.
--
-- The Install is deliberately absent: it is an application, not a checkout, so
-- there is nothing to grant.
--
-- SECURITY, following supabase/migrations/20260716124800_secure_course_purchase_rls.sql:
-- authenticated clients get SELECT on their own rows and NOTHING else. The
-- Stripe webhook (service role, bypasses RLS) is the only write path. SELECT is
-- granted with an explicit WITH CHECK-less SELECT-only policy so the
-- USING-doubles-as-WITH-CHECK trap that opened the course_purchases hole cannot
-- recur here.
--
-- STATUS: NOT YET APPLIED. Apply with the same verification procedure in
-- docs/PAYMENT-GATE-SECURITY.md before selling either rung.

BEGIN;

CREATE TABLE IF NOT EXISTS ccc_entitlements (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Matches LadderRung['id'] in lib/course-config.ts for the purchasable,
  -- non-session rungs. 'course' and 'build-lab' are intentionally excluded:
  -- they have their own tables, and allowing them here would create a second
  -- place to ask "did they pay for the course", which is how gates get bypassed.
  product                 TEXT NOT NULL CHECK (product IN ('kit', 'board-room')),

  -- 'active' is the only value that grants access. Subscriptions move to
  -- 'canceled' or 'past_due' from webhook events; one-time grants stay 'active'
  -- unless refunded by hand.
  status                  TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'canceled', 'past_due')),

  stripe_session_id       TEXT,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,

  -- What Stripe actually charged. Trusted over any local constant.
  amount_cents            INTEGER,
  currency                TEXT NOT NULL DEFAULT 'usd',

  granted_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One entitlement per user per product. Makes the webhook upsert idempotent:
  -- Stripe can and does deliver the same event twice, and a replay must update
  -- the same row rather than granting twice.
  UNIQUE (user_id, product)
);

CREATE INDEX IF NOT EXISTS ccc_entitlements_user_active_idx
  ON ccc_entitlements (user_id, product) WHERE status = 'active';

-- Idempotency for one-time purchases at the Stripe-session level, matching the
-- course_purchases precedent.
CREATE UNIQUE INDEX IF NOT EXISTS ccc_entitlements_stripe_session_id_key
  ON ccc_entitlements (stripe_session_id) WHERE stripe_session_id IS NOT NULL;

ALTER TABLE ccc_entitlements ENABLE ROW LEVEL SECURITY;

-- SELECT only, own rows only. No INSERT/UPDATE/DELETE policy exists, so no
-- write is permitted to anon or authenticated at all.
DROP POLICY IF EXISTS ccc_entitlements_select_own ON ccc_entitlements;
CREATE POLICY ccc_entitlements_select_own
  ON ccc_entitlements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Table-level grants tightened too, so a future permissive policy cannot
-- silently re-open writes on its own.
REVOKE ALL ON ccc_entitlements FROM anon, authenticated;
GRANT SELECT ON ccc_entitlements TO authenticated;

COMMIT;
