"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Application, Cohort } from "@/lib/labs/types";
import { APPLICATION_FIELDS, INTAKE_FIELDS } from "@/lib/labs/intake";
import { LABS, formatPrice } from "@/lib/labs/catalog";
import { labRequest } from "./client";
import PlanEditor from "./PlanEditor";
import type { Submission } from "./Deliverables";
type Data = {
  applications: Application[];
  cohorts: Cohort[];
  enrollments: { application_id: string; status: string }[];
  submissions: Submission[];
  interest: { program_slug: string }[];
  reservations: {
    id: string;
    application_id: string;
    status: string;
    checkout_expires_at: string;
  }[];
};
export default function Instructor() {
  const [data, setData] = useState<Data | null>(null),
    [selected, setSelected] = useState(""),
    [tab, setTab] = useState("application"),
    [filter, setFilter] = useState("all"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const reload = useCallback(async () => {
    try {
      setData(await labRequest("instructor"));
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load instructor workspace.",
      );
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  const app = data?.applications.find((a) => a.id === selected);
  async function act(action: string, body: unknown) {
    setBusy(true);
    setError("");
    try {
      const result = await labRequest(action, body);
      setMessage(result.message ?? "Saved.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="lab-container">
      <header className="lab-page-head">
        <p className="lab-eyebrow">Instructor workspace</p>
        <h1>
          See the person.
          <br />
          Prepare the right work.
        </h1>
        <p>
          Review applications, understand each business, and publish objectives
          you can teach against.
        </p>
      </header>
      {error && (
        <p role="alert" className="lab-error">
          {error}{" "}
          <Link
            href="/sign-in?redirect=/lab-studio/instructor"
            className="lab-text-link"
          >
            Sign in
          </Link>
        </p>
      )}
      {message && (
        <p className="lab-success" role="status">
          {message}
        </p>
      )}
      {!data && !error ? (
        <div className="lab-panel" role="status">
          Loading instructor workspace…
        </div>
      ) : (
        data && (
          <>
            <div className="lab-stats">
              {[
                [
                  data.applications.filter((a) => a.status === "submitted")
                    .length,
                  "Applications to review",
                ],
                [
                  data.enrollments.filter((e) => e.status === "paid").length,
                  "Enrolled owners",
                ],
                [
                  data.applications.filter(
                    (a) =>
                      a.intake_status === "submitted" &&
                      a.published_revision !== a.intake_revision,
                  ).length,
                  "Plans needing review",
                ],
                [
                  data.submissions.filter((s) => s.status === "submitted")
                    .length,
                  "Deliverables to review",
                ],
              ].map(([n, label]) => (
                <div className="lab-stat" key={label}>
                  <strong>{n}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="lab-workspace">
              <aside className="lab-side">
                <button
                  className={!app ? "active" : ""}
                  onClick={() => setSelected("")}
                >
                  All applications
                </button>
                <Link href="/lab-studio">My student workspace</Link>
                <a href="/api/labs/export">Download interest list</a>
                <p>
                  Private instructor data. Student downloads exclude your notes
                  and unpublished plans.
                </p>
              </aside>
              <div>
                {!app ? (
                  <>
                    <section className="lab-panel">
                      <h2>Your review queue</h2>
                      <div className="lab-tabs">
                        {[
                          "all",
                          "submitted",
                          "accepted",
                          "plans",
                          "deliverables",
                        ].map((f) => (
                          <button
                            key={f}
                            className={filter === f ? "active" : ""}
                            onClick={() => setFilter(f)}
                          >
                            {f[0].toUpperCase() + f.slice(1)}
                          </button>
                        ))}
                      </div>
                      <div className="lab-app-list">
                        {data.applications
                          .filter(
                            (a) =>
                              filter === "all" ||
                              (filter === "plans"
                                ? a.intake_status === "submitted" &&
                                  a.published_revision !== a.intake_revision
                                : filter === "deliverables"
                                  ? data.submissions.some(
                                      (s) =>
                                        s.application_id === a.id &&
                                        s.status === "submitted",
                                    )
                                  : a.status === filter),
                          )
                          .map((a) => (
                            <button
                              key={a.id}
                              onClick={() => {
                                setSelected(a.id);
                                setTab(
                                  filter === "plans"
                                    ? "plan"
                                    : filter === "deliverables"
                                      ? "deliverables"
                                      : "application",
                                );
                              }}
                            >
                              <span>
                                <strong>{a.answers.business}</strong>
                                <small>
                                  {a.answers.owner} ·{" "}
                                  {
                                    data.cohorts.find(
                                      (c) => c.id === a.cohort_id,
                                    )?.title
                                  }
                                </small>
                              </span>
                              <span className="lab-chip">{a.status}</span>
                            </button>
                          ))}
                      </div>
                      {!data.applications.length && (
                        <div className="lab-empty">
                          <h2>Ready for the first application.</h2>
                          <p className="lab-small">
                            Applications will appear here after owners submit
                            them.
                          </p>
                        </div>
                      )}
                    </section>
                    <section className="lab-panel" style={{ marginTop: 20 }}>
                      <h2>Cohort readiness</h2>
                      {data.cohorts.map((c) => (
                        <div key={c.id}>
                          <h3>{c.title}</h3>
                          <p className="lab-prose">
                            {formatPrice(c.price_cents)} · capacity {c.capacity}{" "}
                            · {c.status.replaceAll("_", " ")}
                          </p>
                          <p className="lab-small">
                            {[
                              c.session_dates.length === 4
                                ? "Four dates set"
                                : "Dates needed",
                              c.stripe_price_id
                                ? "Stripe price set"
                                : "Stripe price needed",
                              c.terms ? "Terms set" : "Terms needed",
                            ].join(" · ")}
                          </p>
                        </div>
                      ))}
                      <h3>Interest by future lab</h3>
                      {LABS.map((l) => (
                        <p key={l.slug} className="lab-prose">
                          {l.title}:{" "}
                          {
                            data.interest.filter(
                              (i) => i.program_slug === l.slug,
                            ).length
                          }
                        </p>
                      ))}
                      <h3>Checkout holds</h3>
                      <p className="lab-small">
                        {data.reservations.length} active holds. Reconcile with
                        Stripe before releasing capacity.
                      </p>
                      <button
                        className="lab-button secondary"
                        disabled={busy}
                        onClick={() => void act("reconcile", {})}
                      >
                        Reconcile expired checkout holds
                      </button>
                    </section>
                  </>
                ) : (
                  <section className="lab-panel">
                    <button
                      className="lab-text-link"
                      onClick={() => setSelected("")}
                    >
                      ← All applications
                    </button>
                    <h2 style={{ marginTop: 20 }}>{app.answers.business}</h2>
                    <p>
                      {app.answers.owner} · {app.email}
                    </p>
                    <div className="lab-tabs">
                      {[
                        "application",
                        "questionnaire",
                        "plan",
                        "deliverables",
                      ].map((t) => (
                        <button
                          key={t}
                          className={tab === t ? "active" : ""}
                          onClick={() => setTab(t)}
                        >
                          {t[0].toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                    {tab === "application" && (
                      <>
                        <dl className="lab-definition">
                          {APPLICATION_FIELDS.map((f) => (
                            <div key={f.key}>
                              <dt>{f.label}</dt>
                              <dd>{app.answers[f.key] || "Not provided"}</dd>
                            </div>
                          ))}
                        </dl>
                        <ReviewApplication
                          key={app.id + app.status}
                          app={app}
                          busy={busy}
                          onSave={(status, notes) =>
                            void act("review", {
                              applicationId: app.id,
                              status,
                              notes,
                            })
                          }
                        />
                      </>
                    )}
                    {tab === "questionnaire" && (
                      <>
                        <span className="lab-chip">
                          {app.intake_status} · revision {app.intake_revision}
                        </span>
                        <dl className="lab-definition">
                          {INTAKE_FIELDS.map((f) => (
                            <div key={f.key}>
                              <dt>{f.label}</dt>
                              <dd>{app.intake[f.key] || "Not provided"}</dd>
                            </div>
                          ))}
                        </dl>
                      </>
                    )}
                    {tab === "plan" && (
                      <PlanEditor
                        key={`${app.id}-${app.plan_revision}-${app.published_at}-${JSON.stringify(app.draft_plan)}`}
                        app={app}
                        reload={() => void reload()}
                      />
                    )}
                    {tab === "deliverables" && (
                      <>
                        {data.submissions
                          .filter((s) => s.application_id === app.id)
                          .map((s) => (
                            <ReviewWork
                              key={`${s.id}-${s.version}-${s.status}`}
                              submission={s}
                              busy={busy}
                              onSave={(status, feedback) =>
                                void act("feedback", {
                                  applicationId: app.id,
                                  submissionId: s.id,
                                  version: s.version,
                                  status,
                                  feedback,
                                })
                              }
                            />
                          ))}
                        {!data.submissions.some(
                          (s) => s.application_id === app.id,
                        ) && (
                          <p className="lab-prose">
                            No deliverables submitted yet.
                          </p>
                        )}
                      </>
                    )}
                  </section>
                )}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
function ReviewApplication({
  app,
  busy,
  onSave,
}: {
  app: Application;
  busy: boolean;
  onSave: (status: string, notes: string) => void;
}) {
  const [status, setStatus] = useState(app.status),
    [notes, setNotes] = useState(app.instructor_notes);
  return (
    <>
      <hr className="lab-divider" />
      <div className="lab-field">
        <label htmlFor="review-status">Application decision</label>
        <select
          id="review-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {["submitted", "accepted", "waitlisted", "declined"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="lab-field">
        <label htmlFor="review-notes">Private instructor notes</label>
        <textarea
          id="review-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={4000}
        />
      </div>
      <button
        className="lab-button"
        disabled={busy}
        onClick={() => onSave(status, notes)}
      >
        {busy ? "Saving…" : "Save decision"}
      </button>
      <p className="lab-small" style={{ marginTop: 12 }}>
        Updates the owner’s workspace. This action does not send an email.
      </p>
    </>
  );
}
function ReviewWork({
  submission: s,
  busy,
  onSave,
}: {
  submission: Submission;
  busy: boolean;
  onSave: (status: string, feedback: string) => void;
}) {
  const [feedback, setFeedback] = useState(s.feedback),
    [status, setStatus] = useState(
      s.status === "submitted" ? "approved" : s.status,
    );
  return (
    <div>
      <h3>
        Week {s.week} · version {s.version}
      </h3>
      <span className="lab-chip">{s.status.replaceAll("_", " ")}</span>
      <p className="lab-prose" style={{ marginTop: 15 }}>
        {s.notes}
      </p>
      {s.evidence_url && (
        <a
          className="lab-text-link"
          href={s.evidence_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open submitted evidence ↗
        </a>
      )}
      <div className="lab-field" style={{ marginTop: 20 }}>
        <label htmlFor={`feedback-${s.id}`}>Feedback for the owner</label>
        <textarea
          id={`feedback-${s.id}`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={4000}
        />
      </div>
      <div className="lab-field">
        <label htmlFor={`status-${s.id}`}>Review outcome</label>
        <select
          id={`status-${s.id}`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="approved">Ready</option>
          <option value="revision_requested">Revision requested</option>
        </select>
      </div>
      <button
        className="lab-button"
        disabled={busy || !feedback.trim()}
        onClick={() => onSave(status, feedback)}
      >
        Save feedback
      </button>
      <hr className="lab-divider" />
    </div>
  );
}
