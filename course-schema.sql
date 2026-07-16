-- Run this in your Supabase SQL editor
-- (Same project as SPD Ready — adds course tables)

-- Payment gating
CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  stripe_session_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS course_purchases_stripe_session_id_key
  ON course_purchases (stripe_session_id);

-- Lesson completion
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_slug, lesson_slug)
);

-- Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume state
CREATE TABLE IF NOT EXISTS user_course_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  last_module_slug TEXT,
  last_lesson_slug TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_state ENABLE ROW LEVEL SECURITY;

-- course_purchases is READ-ONLY for clients.
--
-- Do NOT change this to `FOR ALL`. A policy with USING but no WITH CHECK reuses
-- the USING expression to validate inserted rows, so `FOR ALL USING (auth.uid()
-- = user_id)` lets any authenticated user insert their own purchase row and
-- self-grant the course for free.
--
-- Writes happen only in the Stripe webhook via the service role, which bypasses
-- RLS. With no INSERT/UPDATE/DELETE policy, those commands are denied by
-- default.
CREATE POLICY "course_purchases_select_own" ON course_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON course_purchases FROM anon, authenticated;
GRANT SELECT ON course_purchases TO authenticated;

-- Progress tables are different: the app writes these from the browser session
-- with the user's own JWT, so authenticated write access is required and
-- appropriate. They gate nothing that was paid for.
CREATE POLICY "own rows" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own rows" ON quiz_results
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own rows" ON user_course_state
  FOR ALL USING (auth.uid() = user_id);
