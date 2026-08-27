import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import { nextRung, type LadderRung } from "@/lib/course-config";

/**
 * The "what's next" card. Renders the rung directly above whatever the learner
 * currently holds.
 *
 * WHY THIS EXISTS: before this component, the Build Lab CTA appeared in exactly
 * four files, all of them under components/marketing — the pre-purchase landing
 * page. Someone who finished all 48 lessons, the single most motivated buyer in
 * the funnel, was offered nothing at the moment they felt most capable. The
 * ladder only works if a rung is visible from inside the rung below it.
 *
 * HONESTY RULES, matching scripts/check-content.mjs:
 *  - An unavailable rung renders as "what's next", never as a purchase. No
 *    countdown, no seat count, no invented date.
 *  - No outcome or income language. The card states what the rung IS and what
 *    it includes. That is the whole pitch.
 */

export default function LadderNext({
  currentRungId,
  variant = "card",
}: {
  currentRungId: LadderRung["id"];
  /** "card" for the dashboard, "banner" for the end of the final lesson. */
  variant?: "card" | "banner";
}) {
  const next = nextRung(currentRungId);
  if (!next) return null;

  const isBanner = variant === "banner";

  return (
    <section
      aria-labelledby="ladder-next-heading"
      className={[
        "rounded-2xl border border-gold-border bg-slate-900",
        isBanner ? "mt-12 p-6 sm:p-8" : "p-6",
      ].join(" ")}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold-ink">
        Next on the ladder
      </p>

      <h2
        id="ladder-next-heading"
        className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50"
      >
        {next.name}
      </h2>

      <p className="mt-3 max-w-[62ch] text-slate-400 leading-relaxed">
        {next.promise}
      </p>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {next.includes.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-slate-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        {next.available ? (
          <Link
            href={next.href}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-slate-50 transition-transform active:scale-[0.98] hover:brightness-110"
          >
            {next.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <Link
            href={next.href}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-gold-border hover:text-slate-50"
          >
            <Lock className="h-4 w-4 text-slate-400" aria-hidden />
            See what it covers
          </Link>
        )}

        <span className="text-sm text-slate-400">
          {next.available ? next.priceDisplay : "Not open yet"}
        </span>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">{next.forWho}</p>
    </section>
  );
}
