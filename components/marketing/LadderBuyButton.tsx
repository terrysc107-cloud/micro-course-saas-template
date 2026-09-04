"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Starts Stripe Checkout for a ladder rung or the Dev Pack.
 *
 * A SIBLING OF BuyButton AND LabBuyButton, for the reason LabBuyButton already
 * gives: BuyButton is the live course money path, and threading an endpoint
 * prop through it would put add-on changes in front of course revenue. The
 * duplication is the cheaper risk.
 *
 * `/api/ladder/checkout` is a real endpoint that nothing called until now. It
 * was built ahead of the products it sells, which is why the Dev Pack could be
 * switched on by flipping one config flag plus adding this button, rather than
 * by writing a payment path under time pressure.
 *
 * 409 means the config says this is not on sale. That is a deployment state
 * rather than something the buyer did, so it reloads: the page re-reads config
 * server-side and renders whatever is actually true now.
 */
export default function LadderBuyButton({
  rung,
  label,
  next,
  className,
}: {
  /** Rung id, or "dev-pack". Must match what the route accepts. */
  rung: string;
  label: string;
  /** Where to send someone who has to sign up first. */
  next: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/ladder/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rung }),
      });

      if (res.status === 401) {
        window.location.href = `/sign-up?next=${encodeURIComponent(next)}`;
        return;
      }

      if (res.status === 409) {
        window.location.reload();
        return;
      }

      const data = await res.json().catch(() => null);

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
          "disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {pending ? "Starting checkout…" : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
