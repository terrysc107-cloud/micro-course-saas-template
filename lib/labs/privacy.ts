import type { Application } from "./types";

/** Explicit allowlist: new instructor fields never become public by accident. */
export function ownerApplication(app: Application) {
  const plan =
    app.published_revision === app.intake_revision ? app.published_plan : null;
  return {
    id: app.id,
    cohort_id: app.cohort_id,
    user_id: app.user_id,
    email: app.email,
    answers: app.answers,
    status: app.status,
    intake: app.intake,
    intake_status: app.intake_status,
    intake_revision: app.intake_revision,
    ai_consent: app.ai_consent,
    published_revision: app.published_revision,
    published_at: app.published_at,
    created_at: app.created_at,
    published_plan: plan
      ? {
          businessBrief: plan.businessBrief,
          objective: plan.objective,
          assumptions: plan.assumptions,
          preparation: plan.preparation,
          weeks: plan.weeks,
          agentCharter: plan.agentCharter,
          operatingGuide: plan.operatingGuide,
          instructorNotes: "",
        }
      : null,
  };
}
