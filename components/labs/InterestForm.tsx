"use client";
import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
export default function InterestForm({ program }: { program: string }) {
  const id = useId(),
    [email, setEmail] = useState(""),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/labs/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program,
          email,
          website: new FormData(event.currentTarget).get("website"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDone(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "We could not save your interest. Try again.",
      );
    } finally {
      setPending(false);
    }
  }
  if (done)
    return (
      <div className="lab-success" role="status">
        <Check size={16} style={{ display: "inline", marginRight: 8 }} />
        You’re on the list for this lab. Joining does not reserve a seat.
      </div>
    );
  return (
    <form className="lab-interest" onSubmit={submit}>
      <label htmlFor={id} className="lab-hidden">
        Your email for {program.replaceAll("-", " ")}
      </label>
      <div className="lab-interest-row">
        <input
          id={id}
          className="lab-input"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="lab-button secondary" disabled={pending}>
          {pending ? "Saving…" : "Get the next dates"}
          <ArrowRight size={14} />
        </button>
      </div>
      <div className="lab-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="lab-small" style={{ marginTop: 9 }}>
        Updates about this lab only. Free to join.
      </p>
      {error && (
        <p className="lab-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
