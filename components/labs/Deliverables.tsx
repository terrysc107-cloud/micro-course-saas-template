"use client";
import { useState } from "react";
import type { Application } from "@/lib/labs/types";
import { FOUNDATION } from "@/lib/labs/catalog";
import { labRequest } from "./client";
export type Submission = {
  id: string;
  application_id: string;
  week: number;
  notes: string;
  evidence_url: string;
  status: string;
  feedback: string;
  version: number;
};
export default function Deliverables({
  app,
  submissions,
  reload,
}: {
  app: Application;
  submissions: Submission[];
  reload: () => void;
}) {
  const [week, setWeek] = useState(1);
  const existing = submissions.find((s) => s.week === week);
  return (
    <section className="lab-panel">
      <p className="lab-eyebrow">Build · Review · Adjust</p>
      <h2>Your weekly deliverables</h2>
      <p>
        Share what you built, what happened, and where you need help. Use a
        sanitized example and an evidence link your instructor can open.
      </p>
      <div className="lab-tabs" role="group" aria-label="Choose a week">
        {FOUNDATION.weeks.map((_, i) => (
          <button
            key={i}
            className={week === i + 1 ? "active" : ""}
            onClick={() => setWeek(i + 1)}
          >
            Week {i + 1}
          </button>
        ))}
      </div>
      <SubmissionForm
        key={`${week}-${existing?.version ?? 0}-${existing?.status ?? "new"}`}
        app={app}
        week={week}
        existing={existing}
        reload={reload}
      />
    </section>
  );
}
function SubmissionForm({
  app,
  week,
  existing,
  reload,
}: {
  app: Application;
  week: number;
  existing?: Submission;
  reload: () => void;
}) {
  const [notes, setNotes] = useState(existing?.notes ?? ""),
    [link, setLink] = useState(existing?.evidence_url ?? ""),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const target = app.published_plan?.weeks[week - 1];
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await labRequest("submit", {
        applicationId: app.id,
        week,
        notes,
        evidenceUrl: link,
        version: existing?.version,
      });
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <h3>{target?.objective ?? FOUNDATION.weeks[week - 1].title}</h3>
      <p className="lab-prose">
        {target?.deliverable ?? FOUNDATION.weeks[week - 1].deliverable}
      </p>
      {existing && (
        <div className="lab-notice" style={{ marginTop: 20 }}>
          <strong>{existing.status.replaceAll("_", " ")}</strong>
          {existing.feedback && (
            <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
              {existing.feedback}
            </p>
          )}
        </div>
      )}
      <form onSubmit={submit}>
        <div className="lab-field" style={{ marginTop: 20 }}>
          <label htmlFor="submission-notes">
            What did you build, test, or get stuck on?
          </label>
          <textarea
            id="submission-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            maxLength={4000}
            rows={6}
          />
        </div>
        <div className="lab-field">
          <label htmlFor="evidence">Evidence link (optional)</label>
          <input
            id="evidence"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            maxLength={2000}
            placeholder="https://…"
          />
        </div>
        {error && (
          <p className="lab-error" role="alert">
            {error}
          </p>
        )}
        <button className="lab-button" disabled={pending}>
          {pending
            ? "Submitting…"
            : existing
              ? "Submit revised work"
              : "Submit for review"}
        </button>
      </form>
    </>
  );
}
