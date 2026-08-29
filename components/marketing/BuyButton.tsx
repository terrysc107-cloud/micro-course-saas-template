"use client";

import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyButtonProps {
  label: string;
  className?: string;
  showChevron?: boolean;
  children?: React.ReactNode;
}

/**
 * Starts Stripe Checkout. Anonymous visitors are sent to sign-up first — the
 * checkout route needs a user id to attach the purchase to.
 */
export default function BuyButton({ label, className, showChevron, children }: BuyButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });

      if (res.status === 401) {
        window.location.href = "/sign-up";
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
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className
        )}
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
        {pending ? "Starting checkout…" : label}
        {!pending && showChevron && <ChevronRight className="w-5 h-5" />}
      </button>
      {/* red, not amber: this is a checkout failure (role="alert"), not a
          caution. Amber also sat one hue-step from brand gold and read as a
          broken accent rather than a problem. */}
      {error && (
        <p role="alert" className="text-red-800 text-sm mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
