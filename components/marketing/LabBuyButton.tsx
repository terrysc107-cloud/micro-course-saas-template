"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Starts Stripe Checkout for a Build Lab seat.
 *
 * A SIBLING OF BuyButton, NOT A PROP ON IT. BuyButton is the live $97 course
 * money path; threading an `endpoint` prop through it would put Lab changes in
 * front of course revenue. The duplication is the cheaper risk.
 *
 * Unlike the course, a seat can run out between page render and click — the
 * page is force-dynamic but a person can sit on it. So 409 is a real, expected
 * answer here and says something specific rather than "try again".
 */
export default function LabBuyButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/build-lab/checkout", { method: "POST" });

      if (res.status === 401) {
        window.location.href = "/sign-up?redirect=/build-lab/legacy";
        return;
      }

      const data = await res.json().catch(() => null);

      if (res.status === 409) {
        // The room filled up, or they already hold a seat. Reload rather than
        // patch state: the page recounts seats server-side and will render the
        // sold-out or registered view from real rows.
        window.location.reload();
        return;
      }

      if (!res.ok || !data?.url) {
        setError("Checkout is unavailable right now. Please try again in a moment.");
        setPending(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Couldn't reach checkout. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <div className="contents">
      <button
        onClick={handleClick}
        disabled={pending}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-colors",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className
        )}
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        {pending ? "Starting checkout…" : "Take a seat"}
      </button>
      {error && (
        <p role="alert" className="text-red-800 text-sm mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
