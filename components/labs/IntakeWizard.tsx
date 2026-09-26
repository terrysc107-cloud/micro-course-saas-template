"use client";
import { useEffect, useState } from "react";
import {
  INTAKE_SECTIONS,
  INTAKE_FIELDS,
  validateAnswers,
  type Answers,
} from "@/lib/labs/intake";
import type { Application } from "@/lib/labs/types";
import Fields from "./Fields";
import { labRequest, RequestError } from "./client";
export default function IntakeWizard({
  application,
  onSubmitted,
  onDirty,
}: {
  application: Application;
  onSubmitted: () => void;
  onDirty: (dirty: boolean) => void;
}) {
  const [answers, setAnswers] = useState<Answers>(application.intake),
    [revision, setRevision] = useState(application.intake_revision),
    [step, setStep] = useState(0),
    [consent, setConsent] = useState(application.ai_consent),
    [pending, setPending] = useState(false),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [fields, setFields] = useState<Record<string, string>>({});
  useEffect(() => {
    onDirty(dirty);
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      onDirty(false);
    };
  }, [dirty, onDirty]);
  async function save(submit = false, next = false) {
    const checked = validateAnswers(
      answers,
      submit ? INTAKE_FIELDS : INTAKE_SECTIONS[step].fields,
      submit || next,
    );
    setFields(checked.errors);
    if (Object.keys(checked.errors).length) {
      setError("Complete the highlighted answers before continuing.");
      if (submit) {
        const index = INTAKE_SECTIONS.findIndex((s) =>
          s.fields.some((f) => checked.errors[f.key]),
        );
        setStep(Math.max(index, 0));
      }
      return;
    }
    if (next && !dirty) {
      setStep((s) => s + 1);
      return;
    }
    setPending(true);
    setError("");
    setStatus("");
    try {
      const result = await labRequest("intake", {
        applicationId: application.id,
        answers,
        revision,
        submit,
        aiConsent: consent,
      });
      setRevision(result.revision);
      setDirty(false);
      setStatus(
        submit ? "Submitted for instructor review." : "Your draft is saved.",
      );
      if (submit) onSubmitted();
      else if (next) setStep((s) => s + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      if (e instanceof RequestError) setFields(e.fields);
    } finally {
      setPending(false);
    }
  }
  const section = INTAKE_SECTIONS[step];
  return (
    <section className="lab-panel">
      <p className="lab-eyebrow">
        Your business questionnaire · {step + 1} of {INTAKE_SECTIONS.length}
      </p>
      <div
        className="lab-progress"
        aria-label={`Section ${step + 1} of ${INTAKE_SECTIONS.length}`}
      >
        {INTAKE_SECTIONS.map((s, i) => (
          <span className={i <= step ? "done" : ""} key={s.title} />
        ))}
      </div>
      <h2>{section.title}</h2>
      <p>{section.description}</p>
      {application.published_plan && (
        <p className="lab-notice">
          Saving changes sends your current plan back for review.
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save(
            step === INTAKE_SECTIONS.length - 1,
            step < INTAKE_SECTIONS.length - 1,
          );
        }}
      >
        <Fields
          fields={section.fields}
          answers={answers}
          onChange={(k, v) => {
            setAnswers((a) => ({ ...a, [k]: v }));
            setDirty(true);
            setStatus("");
          }}
          errors={fields}
        />
        {step === INTAKE_SECTIONS.length - 1 && (
          <label className="lab-check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setDirty(true);
              }}
            />
            <span>
              Use AI-assisted preparation. I agree to share my business answers
              with Anthropic (Claude) to draft my learning plan for instructor review. I can
              leave this unchecked for manual preparation.
            </span>
          </label>
        )}
        {error && (
          <p className="lab-error" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p className="lab-success" role="status">
            {status}
          </p>
        )}
        <div className="lab-form-actions">
          <div>
            {step > 0 && (
              <button
                className="lab-button secondary"
                type="button"
                disabled={pending}
                onClick={() => {
                  setStep((s) => s - 1);
                  setError("");
                }}
              >
                Back
              </button>
            )}
            <button
              className="lab-button secondary"
              type="button"
              disabled={pending || !dirty}
              onClick={() => void save()}
            >
              Save draft
            </button>
          </div>
          <button className="lab-button" disabled={pending}>
            {pending
              ? "Saving…"
              : step === INTAKE_SECTIONS.length - 1
                ? "Submit for review"
                : "Save & continue"}
          </button>
        </div>
        <p className="lab-small" style={{ marginTop: 14 }}>
          {dirty
            ? "You have unsaved changes."
            : "Saved answers are available when you return."}
        </p>
      </form>
    </section>
  );
}
