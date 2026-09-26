import type { LearningPlan } from "@/lib/labs/intake";
export default function PlanView({
  plan,
  applicationId,
}: {
  plan: LearningPlan;
  applicationId: string;
}) {
  return (
    <section className="lab-panel">
      <p className="lab-eyebrow">Reviewed by your instructor</p>
      <h2>Your learning plan</h2>
      <p>{plan.objective}</p>
      <div className="lab-actions" style={{ marginTop: 0, marginBottom: 25 }}>
        <a
          className="lab-button secondary"
          href={`/api/labs/document?applicationId=${applicationId}`}
        >
          Download your guides
        </a>
      </div>
      <h3>Your business brief</h3>
      <p className="lab-prose">{plan.businessBrief}</p>
      <h3>Before the first session</h3>
      <ul style={{ paddingLeft: 20 }}>
        {plan.preparation.map((s, i) => (
          <li className="lab-prose" key={i}>
            {s}
          </li>
        ))}
      </ul>
      <h3>Confirm these assumptions</h3>
      <ul style={{ paddingLeft: 20 }}>
        {plan.assumptions.map((s, i) => (
          <li className="lab-prose" key={i}>
            {s}
          </li>
        ))}
      </ul>
      {plan.weeks.map((w) => (
        <div key={w.week}>
          <hr className="lab-divider" />
          <span className="lab-chip blue">WEEK {w.week}</span>
          <h3>{w.objective}</h3>
          <p className="lab-prose">{w.deliverable}</p>
          <p className="lab-prose" style={{ marginTop: 12 }}>
            <strong>Ready when:</strong> {w.acceptance}
          </p>
        </div>
      ))}
      <hr className="lab-divider" />
      <h3>Your agent charter</h3>
      <p className="lab-prose">{plan.agentCharter}</p>
      <h3>Your operating guide</h3>
      <p className="lab-prose">{plan.operatingGuide}</p>
    </section>
  );
}
