"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";

interface WaitlistFormProps {
  /** Placement slug, stored so we can tell which surface drove signups. */
  source?: string;
}

/**
 * Build Lab waitlist signup.
 *
 * No account required — the waitlist exists to measure demand, and requiring a
 * sign-up first would measure sign-ups instead.
 *
 * The endpoint answers identically whether or not the address was already on
 * the list, so this component cannot report "you're already on it" — and
 * shouldn't. That would leak exactly what the API refuses to: whether a given
 * address is a member. "You're on the list" is true in both cases.
 */
export default function WaitlistForm({ source }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/build-lab/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Try again?");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("Network problem. Try again?");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-gold/25 bg-gold/[0.06] px-5 py-4">
        <Check className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-50 text-sm font-medium">You&rsquo;re on the list.</p>
          <p className="text-slate-400 text-sm leading-relaxed mt-1">
            When a date is set, you&rsquo;ll hear before it goes anywhere else. Nothing
            has been charged and nothing is reserved, it&rsquo;s a list, not a ticket.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-gold/60 focus:outline-none text-slate-50 placeholder-slate-500 px-4 py-3 rounded-lg text-sm transition-colors"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="cta-btn px-6 py-3 text-xs rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === "sending" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Joining…
            </>
          ) : (
            "Join the waitlist"
          )}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-red-300 text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
