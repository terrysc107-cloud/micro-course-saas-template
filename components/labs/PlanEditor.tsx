"use client";
import { useState } from "react";
import type { Application } from "@/lib/labs/types";
import type { LearningPlan } from "@/lib/labs/intake";
import { labRequest } from "./client";
export default function PlanEditor({
  app,
  reload,
}: {
  app: Application;
  reload: () => void;
}) {
  const [plan, setPlan] = useState<LearningPlan | null>(app.draft_plan),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function generate(mode: string) {
    setBusy(true);
    setError("");
    try {
      await labRequest("generate", { applicationId: app.id, mode });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not prepare draft.");
    } finally {
      setBusy(false);
    }
  }
  async function save(publish: boolean) {
    setBusy(true);
    setError("");
    try {
      await labRequest("publish", {
        applicationId: app.id,
        plan,
        revision: app.plan_revision,
        publish,
      });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  const stale = app.plan_revision !== app.intake_revision;
  return (
    <>
      <p className="lab-small">
        Review the business facts, scope, software assumptions, and acceptance
        criteria before publishing. Only published plans reach the learner.
        Private instructor notes are excluded.
      </p>
      <div className="lab-actions">
        <button
          className="lab-button secondary"
          disabled={busy || app.intake_status !== "submitted"}
          onClick={() => void generate("manual")}
        >
          {busy ? "Working…" : "Create template draft"}
        </button>
        <button
          className="lab-button"
          disabled={
            busy || !app.ai_consent || app.intake_status !== "submitted"
          }
          onClick={() => void generate("ai")}
        >
          {busy ? "Working…" : "Prepare with AI"}
        </button>
      </div>
      <p className="lab-small" style={{ marginTop: 10 }}>
        AI preparation:{" "}
        {app.ai_consent ? "owner opted in" : "owner has not opted in"}.
        Generating a new draft replaces unsaved editor changes.
      </p>
      {app.generation_error && (
        <p className="lab-error">{app.generation_error}</p>
      )}
      {error && (
        <p className="lab-error" role="alert">
          {error}
        </p>
      )}
      {plan && (
        <div style={{ marginTop: 25 }}>
          {stale && (
            <p className="lab-error">
              This draft is based on an older questionnaire. Generate a fresh
              draft before publishing.
            </p>
          )}
          {(
            [
              ["businessBrief", "Business brief"],
              ["objective", "Four-week objective"],
              ["agentCharter", "Agent charter"],
              ["operatingGuide", "Operating guide"],
              ["instructorNotes", "Private instructor notes"],
            ] as const
          ).map(([key, label]) => (
            <div className="lab-field" key={key}>
              <label htmlFor={`plan-${key}`}>{label}</label>
              <textarea
                id={`plan-${key}`}
                rows={key === "objective" ? 3 : 6}
                maxLength={10000}
                value={plan[key]}
                onChange={(e) => setPlan({ ...plan, [key]: e.target.value })}
              />
            </div>
          ))}
          {(
            [
              ["preparation", "Preparation checklist"],
              ["assumptions", "Assumptions to confirm"],
            ] as const
          ).map(([key, label]) => (
            <div className="lab-field" key={key}>
              <label htmlFor={`plan-${key}`}>{label} (one per line)</label>
              <textarea
                id={`plan-${key}`}
                rows={5}
                value={plan[key].join("\n")}
                onChange={(e) =>
                  setPlan({ ...plan, [key]: e.target.value.split("\n") })
                }
              />
            </div>
          ))}
          {plan.weeks.map((w, i) => (
            <div key={w.week}>
              <h3>Week {w.week}</h3>
              {(
                [
                  ["objective", "Objective"],
                  ["deliverable", "Deliverable"],
                  ["acceptance", "Ready when"],
                ] as const
              ).map(([key, label]) => (
                <div className="lab-field" key={key}>
                  <label htmlFor={`week-${i}-${key}`}>{label}</label>
                  <textarea
                    id={`week-${i}-${key}`}
                    rows={3}
                    maxLength={2500}
                    value={w[key]}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        weeks: plan.weeks.map((v, j) =>
                          j === i ? { ...v, [key]: e.target.value } : v,
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          ))}
          <div className="lab-form-actions">
            <button
              className="lab-button secondary"
              disabled={busy || stale}
              onClick={() => void save(false)}
            >
              Save draft
            </button>
            <button
              className="lab-button"
              disabled={busy || stale}
              onClick={() => void save(true)}
            >
              Publish reviewed plan
            </button>
          </div>
        </div>
      )}
    </>
  );
}
