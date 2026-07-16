-- Secure the purchase gate on course_purchases.
--
-- PROBLEM
-- The original policy was:
--     CREATE POLICY "own rows" ON course_purchases FOR ALL USING (auth.uid() = user_id);
--
-- In Postgres, when a policy specifies USING but not WITH CHECK, the USING
-- expression is ALSO used as the WITH CHECK expression for rows being added.
-- So `FOR ALL USING (auth.uid() = user_id)` permits an authenticated client to
-- INSERT a row for its own user_id. Any signed-up user could grant themselves
-- the course for free with a single PostgREST call against the anon key:
--
--     await supabase.from('course_purchases')
--       .insert({ user_id: <their own id>, stripe_session_id: 'x', is_active: true });
--
-- It also permitted UPDATE (e.g. reactivating a refunded purchase) and DELETE.
--
-- FIX
-- Authenticated clients get SELECT on their own row and nothing else. The
-- Stripe webhook is the only write path, and it uses the service role, which
-- bypasses RLS. Table-level grants are tightened too, so a future permissive
-- policy cannot silently re-open writes on its own.
--
-- STATUS: NOT APPLIED TO PRODUCTION. Requires Terry's approval.
-- See docs/PAYMENT-GATE-SECURITY.md for the verification procedure.

BEGIN;

ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

-- 1. Drop the over-permissive policy.
-- Named "own rows" in course-schema.sql; the other names are defensive in case
-- an environment drifted.
DROP POLICY IF EXISTS "own rows" ON course_purchases;
DROP POLICY IF EXISTS "course_purchases_select_own" ON course_purchases;
DROP POLICY IF EXISTS "course_purchases_read_own" ON course_purchases;

-- 2. Read-only access to your own purchase row. No INSERT/UPDATE/DELETE policy
--    exists for any client role, so those commands are denied by default:
--    RLS denies anything not explicitly permitted by a policy.
CREATE POLICY "course_purchases_select_own"
  ON course_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Defense in depth. Supabase grants broad table privileges to `anon` and
--    `authenticated` by default and relies on RLS to filter. Removing the write
--    privileges means that even if someone later adds a permissive policy by
--    mistake, the grant layer still blocks writes.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON course_purchases FROM anon, authenticated;
GRANT SELECT ON course_purchases TO authenticated;

-- `service_role` is intentionally untouched: it bypasses RLS and is the sole
-- grant path, used only by the Stripe webhook running server-side.

-- 4. Idempotency + reconciliation support for the webhook.
--    Stripe retries webhooks, and `checkout.session.completed` can arrive more
--    than once for the same session. These columns let us record which Stripe
--    objects granted access so a purchase can be traced or refunded.
ALTER TABLE course_purchases
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- The webhook upserts on user_id (which already has a UNIQUE constraint).
-- This index makes replayed sessions cheap to look up and makes a duplicate
-- session id visible rather than silently creating a second grant.
CREATE UNIQUE INDEX IF NOT EXISTS course_purchases_stripe_session_id_key
  ON course_purchases (stripe_session_id);

COMMIT;

-- Verification (run as an AUTHENTICATED user, not service_role):
--
--   -- Expect: 0 rows, and specifically NOT an error.
--   SELECT * FROM course_purchases;
--
--   -- Expect: ERROR — permission denied / new row violates row-level security.
--   INSERT INTO course_purchases (user_id, stripe_session_id, is_active)
--   VALUES (auth.uid(), 'forged_session', true);
--
--   -- Expect: 0 rows updated.
--   UPDATE course_purchases SET is_active = true WHERE user_id = auth.uid();
--
-- Expect exactly one policy, SELECT only:
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE tablename = 'course_purchases';
