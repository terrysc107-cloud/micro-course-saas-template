-- Run this in your Supabase SQL editor
-- (Same project as SPD Ready — adds course tables)

-- Payment gating
CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  stripe_session_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

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

CREATE POLICY "own rows" ON course_purchases
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own rows" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own rows" ON quiz_results
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own rows" ON user_course_state
  FOR ALL USING (auth.uid() = user_id);
