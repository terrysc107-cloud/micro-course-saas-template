import type { Answers, LearningPlan } from "./intake";

export type Cohort = {
  id: string;
  slug: string;
  program_slug: string;
  title: string;
  status: string;
  capacity: number;
  price_cents: number;
  currency: string;
  starts_at: string | null;
  timezone: string;
  session_dates: string[];
  stripe_price_id: string | null;
  terms: string;
};
export type Application = {
  id: string;
  cohort_id: string;
  user_id: string;
  email: string;
  answers: Answers;
  status: string;
  intake: Answers;
  intake_status: string;
  intake_revision: number;
  ai_consent: boolean;
  draft_plan: LearningPlan | null;
  plan_revision: number | null;
  published_plan: LearningPlan | null;
  published_revision: number | null;
  published_at: string | null;
  generation_started_at: string | null;
  generation_error: string | null;
  instructor_notes: string;
  created_at: string;
};
