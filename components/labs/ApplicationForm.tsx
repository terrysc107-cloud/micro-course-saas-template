"use client";
import { useState } from "react";
import Link from "next/link";
import {
  APPLICATION_FIELDS,
  validateAnswers,
  type Answers,
} from "@/lib/labs/intake";
import { formatPrice } from "@/lib/labs/catalog";
import type { Cohort } from "@/lib/labs/types";
import Fields from "./Fields";
import { labRequest, RequestError } from "./client";
export default function ApplicationForm({
  cohorts,
  onSaved,
}: {
  cohorts: Cohort[];
  onSaved: () => void;
}) {
  const [answers, setAnswers] = useState<Answers>({}),
    [cohortId, setCohort] = useState(cohorts[0]?.id ?? ""),
    [consent, setConsent] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [fields, setFields] = useState<Record<string, string>>({});
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const checked = validateAnswers(answers, APPLICATION_FIELDS, true);
    setFields(checked.errors);
    if (Object.keys(checked.errors).length) return;
    setPending(true);
    setError("");
    try {
      await labRequest("apply", { answers, cohortId, consent });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      if (e instanceof RequestError) setFields(e.fields);
    } finally {
      setPending(false);
    }
  }
  if (!cohorts.length)
    return (
      <div className="lab-empty">
        <h2>The next cohort is being prepared.</h2>
        <p className="lab-small">
          Applications will open when the cohort is ready. Join the topic
          interest list for an update.
        </p>
        <Link
          className="lab-button"
          style={{ marginTop: 20 }}
          href="/build-lab#labs"
        >
          Explore the labs
        </Link>
      </div>
    );
  return (
    <section className="lab-panel">
      <p className="lab-eyebrow">Start with your business</p>
      <h2>Your application</h2>
      <p>
        Tell Terry where you are starting and what you want to build. This is a
        fit review. There is no charge or seat reservation when you apply.
      </p>
      <form onSubmit={submit}>
        <div className="lab-field">
          <label htmlFor="cohort">Choose a cohort</label>
          <select
            id="cohort"
            value={cohortId}
            onChange={(e) => setCohort(e.target.value)}
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} · {formatPrice(c.price_cents)}
              </option>
            ))}
          </select>
        </div>
        <Fields
          fields={APPLICATION_FIELDS}
          answers={answers}
          onChange={(k, v) => setAnswers((a) => ({ ...a, [k]: v }))}
          errors={fields}
        />
        <label className="lab-check">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I agree that AI by Design can use these answers to review my
            application and contact me about this lab.{" "}
            <Link className="lab-text-link" href="/build-lab/privacy">
              How my information is used
            </Link>
          </span>
        </label>
        {error && (
          <p className="lab-error" role="alert">
            {error}
          </p>
        )}
        <button className="lab-button" disabled={pending}>
          {pending ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </section>
  );
}
