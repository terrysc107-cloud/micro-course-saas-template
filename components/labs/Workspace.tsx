"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import type { Application, Cohort } from "@/lib/labs/types";
import { formatPrice } from "@/lib/labs/catalog";
import { labRequest, RequestError } from "./client";
import ApplicationForm from "./ApplicationForm";
import IntakeWizard from "./IntakeWizard";
import PlanView from "./PlanView";
import Deliverables, { type Submission } from "./Deliverables";
type Data = {
  applications: Application[];
  cohorts: Cohort[];
  enrollments: { application_id: string; status: string }[];
  submissions: Submission[];
  instructor: boolean;
};
export default function Workspace() {
  const [data, setData] = useState<Data | null>(null),
    [cohorts, setCohorts] = useState<Cohort[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [unauthorized, setUnauthorized] = useState(false),
    [view, setView] = useState("overview"),
    [selected, setSelected] = useState(""),
    [dirty, setDirty] = useState(false);
  const reload = useCallback(async () => {
    setError("");
    try {
      const [workspace, open] = await Promise.all([
        labRequest("workspace"),
        labRequest("cohorts"),
      ]);
      setData(workspace);
      setCohorts(open.cohorts);
      setUnauthorized(false);
    } catch (e) {
      if (e instanceof RequestError && e.status === 401) setUnauthorized(true);
      else
        setError(
          e instanceof Error ? e.message : "Could not load your workspace.",
        );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  function navigate(next: string) {
    if (
      dirty &&
      !window.confirm(
        "You have unsaved questionnaire changes. Leave without saving?",
      )
    )
      return;
    setDirty(false);
    setView(next);
  }
  const app =
    data?.applications.find((a) => a.id === selected) ?? data?.applications[0];
  const paid = !!data?.enrollments.some(
    (e) => e.application_id === app?.id && e.status === "paid",
  );
  const cohort = data?.cohorts.find((c) => c.id === app?.cohort_id);
  const submissions =
    data?.submissions.filter((s) => s.application_id === app?.id) ?? [];
  const refresh = () => {
    setDirty(false);
    void reload();
  };
  return (
    <div className="lab-container">
      <header className="lab-page-head">
        <p className="lab-eyebrow">The Build Lab workspace</p>
        <h1>
          {app
            ? `Let’s build ${app.answers.business}.`
            : "Your business starts here."}
        </h1>
        <p>
          Your application, preparation, learning plan, and weekly work—in one
          place.
        </p>
      </header>
      {loading ? (
        <div className="lab-panel" role="status" style={{ marginBottom: 80 }}>
          Loading your workspace…
        </div>
      ) : unauthorized ? (
        <div className="lab-panel" style={{ maxWidth: 660, marginBottom: 80 }}>
          <h2>A workspace for your business.</h2>
          <p>
            Create a free account to apply and keep your answers in one place.
            If you already have a My AI Board account, use that account.
          </p>
          <div className="lab-actions">
            <Link className="lab-button" href="/sign-up?redirect=/lab-studio">
              Create free account <ArrowRight size={16} />
            </Link>
            <Link
              className="lab-button secondary"
              href="/sign-in?redirect=/lab-studio"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : (
        <div className="lab-workspace">
          <aside className="lab-side">
            {[
              "overview",
              ...(paid
                ? ["questionnaire", "learning plan", "deliverables"]
                : []),
              "new application",
            ].map((v, i) => (
              <button
                className={view === v ? "active" : ""}
                key={v}
                onClick={() => navigate(v)}
              >
                <span>0{i + 1}</span>
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
            {data?.instructor && (
              <Link href="/lab-studio/instructor">
                Instructor workspace <ArrowRight size={13} />
              </Link>
            )}
            <p>
              Your progress is saved to your account. Only you and your
              instructor can access your business answers.
            </p>
          </aside>
          <div>
            {error && (
              <div className="lab-error" role="alert">
                {error}
                <button
                  className="lab-text-link"
                  style={{ marginLeft: 15 }}
                  onClick={() => void reload()}
                >
                  Retry
                </button>
              </div>
            )}
            {data && data.applications.length > 1 && (
              <div className="lab-field">
                <label htmlFor="application-selector">Your application</label>
                <select
                  id="application-selector"
                  value={app?.id}
                  onChange={(e) => {
                    if (dirty && !window.confirm("Leave unsaved changes?"))
                      return;
                    setSelected(e.target.value);
                    setView("overview");
                  }}
                >
                  {data.applications.map((a) => (
                    <option value={a.id} key={a.id}>
                      {a.answers.business} ·{" "}
                      {data.cohorts.find((c) => c.id === a.cohort_id)?.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {data && (view === "new application" || !app) ? (
              <ApplicationForm
                cohorts={cohorts.filter(
                  (c) => !data.applications.some((a) => a.cohort_id === c.id),
                )}
                onSaved={() => {
                  setView("overview");
                  void reload();
                }}
              />
            ) : (
              app && (
                <>
                  {view === "overview" && (
                    <section className="lab-panel">
                      <p className="lab-eyebrow">Your next step</p>
                      <span
                        className={`lab-chip ${paid ? "green" : app.status === "accepted" ? "blue" : "amber"}`}
                      >
                        {paid ? "ENROLLED" : app.status.toUpperCase()}
                      </span>
                      <h2 style={{ marginTop: 20 }}>
                        {paid
                          ? "Let’s prepare for your business."
                          : app.status === "accepted"
                            ? "Your application is accepted."
                            : app.status === "waitlisted"
                              ? "You’re on the cohort waitlist."
                              : app.status === "declined"
                                ? "This cohort isn’t the right fit yet."
                                : "Your application is with Terry."}
                      </h2>
                      <p>
                        {paid
                          ? "Complete your business questionnaire so your instructor can review your objectives and preparation."
                          : app.status === "accepted"
                            ? "Review the dates and terms below. Payment confirms your place when enrollment opens."
                            : app.status === "waitlisted"
                              ? "No payment is required. Check here for updates or contact the instructor."
                              : app.status === "declined"
                                ? "Contact the instructor to discuss preparation or another lab."
                                : "We’ll review your business, starting point, and proposed outcome. Check this workspace for the decision."}
                      </p>
                      {cohort && (
                        <p className="lab-small">
                          {cohort.title} · {formatPrice(cohort.price_cents)}
                        </p>
                      )}
                      {paid ? (
                        <>
                          <div
                            className="lab-stats"
                            style={{ gridTemplateColumns: "repeat(3,1fr)" }}
                          >
                            <div className="lab-stat">
                              <strong>
                                {app.intake_status === "submitted"
                                  ? "Ready"
                                  : "Draft"}
                              </strong>
                              <span>Business questionnaire</span>
                            </div>
                            <div className="lab-stat">
                              <strong>
                                {app.published_plan ? "Ready" : "Pending"}
                              </strong>
                              <span>Reviewed plan</span>
                            </div>
                            <div className="lab-stat">
                              <strong>
                                {
                                  submissions.filter(
                                    (s) => s.status === "approved",
                                  ).length
                                }
                                /4
                              </strong>
                              <span>Deliverables approved</span>
                            </div>
                          </div>
                          <button
                            className="lab-button"
                            onClick={() =>
                              navigate(
                                app.published_plan
                                  ? "learning plan"
                                  : "questionnaire",
                              )
                            }
                          >
                            {app.published_plan
                              ? "Open your learning plan"
                              : "Open questionnaire"}
                            <ArrowRight size={15} />
                          </button>
                          <Link
                            href="/dashboard"
                            className="lab-text-link"
                            style={{ marginLeft: 18 }}
                          >
                            Foundation course
                          </Link>
                        </>
                      ) : app.status === "accepted" && cohort ? (
                        <Enrollment
                          app={app}
                          cohort={cohort}
                          refresh={refresh}
                        />
                      ) : null}
                      <button
                        className="lab-text-link"
                        style={{ display: "flex", marginTop: 24 }}
                        onClick={() => void reload()}
                      >
                        <RefreshCw size={13} />
                        Refresh status
                      </button>
                    </section>
                  )}
                  {paid && view === "questionnaire" && (
                    <IntakeWizard
                      key={app.id}
                      application={app}
                      onSubmitted={() => {
                        refresh();
                        setView("overview");
                      }}
                      onDirty={setDirty}
                    />
                  )}
                  {paid &&
                    view === "learning plan" &&
                    (app.published_plan ? (
                      <PlanView
                        plan={app.published_plan}
                        applicationId={app.id}
                      />
                    ) : (
                      <div className="lab-panel">
                        <h2>Your plan is being prepared.</h2>
                        <p>
                          {app.intake_status === "submitted"
                            ? "Your instructor will review and publish your objectives here. You can refresh your workspace to check for updates."
                            : "Submit your business questionnaire to start your preparation plan."}
                        </p>
                        <button
                          className="lab-button secondary"
                          onClick={() => navigate("questionnaire")}
                        >
                          Open questionnaire
                        </button>
                      </div>
                    ))}
                  {paid && view === "deliverables" && (
                    <Deliverables
                      app={app}
                      submissions={submissions}
                      reload={refresh}
                    />
                  )}
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function Enrollment({
  app,
  cohort,
  refresh,
}: {
  app: Application;
  cohort: Cohort;
  refresh: () => void;
}) {
  const [accept, setAccept] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const data = await labRequest("checkout", {
        applicationId: app.id,
        acceptTerms: accept,
        priceCents: cohort.price_cents,
        terms: cohort.terms,
      });
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open checkout.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div style={{ marginTop: 20 }}>
      {cohort.status === "enrollment_open" ? (
        <>
          <h3>The four sessions</h3>
          <ul style={{ paddingLeft: 20 }}>
            {cohort.session_dates.map((date) => (
              <li key={date} className="lab-prose">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                  timeZone: cohort.timezone,
                }).format(new Date(date))}{" "}
                · {cohort.timezone}
              </li>
            ))}
          </ul>
          <h3>Enrollment terms</h3>
          <p className="lab-prose">{cohort.terms}</p>
          <label className="lab-check">
            <input
              type="checkbox"
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
            />
            <span>
              I have reviewed the session dates, tuition, and enrollment terms.
            </span>
          </label>
          <button
            disabled={!accept || busy}
            className="lab-button"
            onClick={() => void checkout()}
          >
            {busy
              ? "Reserving your seat…"
              : `Enroll · ${formatPrice(cohort.price_cents)}`}
          </button>
        </>
      ) : (
        <p className="lab-notice">
          Dates and enrollment are being finalized. You will see checkout here
          when enrollment opens.
        </p>
      )}
      {error && (
        <p className="lab-error" role="alert">
          {error}
        </p>
      )}
      <p className="lab-small" style={{ marginTop: 15 }}>
        Returned from payment?{" "}
        <button className="lab-text-link" onClick={refresh}>
          Refresh enrollment
        </button>
        . Payment confirmation may take a moment.
      </p>
    </div>
  );
}
