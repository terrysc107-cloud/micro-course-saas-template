import Link from "next/link";
import { CalendarCheck, GitCompareArrows, ArrowRight } from "lucide-react";
import { LAST_VERIFIED } from "@/lib/course-config";
import Section from "./Section";

/**
 * The maintenance pitch.
 *
 * Every buyer of an AI course has the same unspoken objection: this will be
 * wrong in six weeks. No amount of copy answers it, because it is usually true.
 * So this section does not argue. It shows the verification date, names a real
 * correction, and links to the live numbers.
 *
 * The date renders from LAST_VERIFIED, so this section cannot claim freshness
 * the codebase does not have. If the date goes stale, the page says so.
 */
export default function MaintenanceSection() {
  return (
    <Section
      eyebrow="Maintenance"
      title="The part that usually rots"
      subtitle="These tools change weekly. Most courses quietly go wrong and nobody tells you. This one carries a date you can check before you buy."
      className="border-b border-slate-800/60"
    >
      <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-gold-border bg-slate-900 p-6 sm:p-7">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold-ink">
            <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
            Verified against the official docs
          </p>
          <p className="mt-4 font-mono text-3xl tracking-tight text-slate-50">
            {LAST_VERIFIED}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Not a launch date. The last time every factual claim in the
            curriculum was re-checked against the source and the changes were
            published.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
            <GitCompareArrows className="h-3.5 w-3.5" aria-hidden />
            What that actually catches
          </p>

          <p className="mt-4 leading-relaxed text-slate-300">
            The last pass found that sessions now start in a different
            permission mode than the course described. That is the first screen a
            new reader sees, and it would have contradicted the lesson before
            they finished it.
          </p>

          <p className="mt-4 leading-relaxed text-slate-400">
            It also found a correction that had itself gone stale: a note saying
            a command had been removed, when the command had come back. Being
            wrong about your own fix is the failure mode nobody checks for, which
            is exactly why the check is scheduled instead of remembered.
          </p>

          <Link
            href="/proof"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-ink underline-offset-4 hover:underline"
          >
            See the live numbers, including the unflattering ones
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </Section>
  );
}
