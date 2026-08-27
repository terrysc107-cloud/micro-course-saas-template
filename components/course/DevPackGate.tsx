import Link from "next/link";
import { Check, Code2 } from "lucide-react";
import { DEV_PACK } from "@/lib/course-config";

/**
 * Rendered INSTEAD OF the lesson body when someone opens a developer-track
 * lesson without the Dev Pack.
 *
 * A real gate, not an overlay. The lesson content is never sent to the client,
 * because a blurred div with the text underneath is not a paywall, it is a
 * decoration on top of a leak.
 *
 * The tone matters here: this reader bought the board course and did nothing
 * wrong. They wandered into the developer half. Nothing scolds them, and the
 * page says plainly that this is not part of what they bought rather than
 * implying they are missing out on something they should already have.
 */
export default function DevPackGate({ lessonTitle }: { lessonTitle: string }) {
  return (
    <section
      aria-labelledby="devpack-heading"
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"
    >
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
        <Code2 className="h-3.5 w-3.5" aria-hidden />
        Developer track
      </p>

      <h1
        id="devpack-heading"
        className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl"
      >
        {lessonTitle}
      </h1>

      <p className="mt-4 max-w-[62ch] leading-relaxed text-slate-400">
        This lesson is part of {DEV_PACK.name}, which is a separate add-on. It
        is not missing from your course. It assumes you can read code and run a
        test suite, so it sits outside the board path on purpose.
      </p>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {DEV_PACK.includes.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-slate-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        {DEV_PACK.available ? (
          <Link
            href={DEV_PACK.href}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-slate-50 transition-transform hover:brightness-110 active:scale-[0.98]"
          >
            {DEV_PACK.ctaLabel}
          </Link>
        ) : (
          <span className="rounded-full border border-slate-700 px-5 py-2.5 text-sm text-slate-400">
            Not on sale yet
          </span>
        )}

        <Link
          href="/dashboard"
          className="text-sm text-slate-400 underline underline-offset-4 transition-colors hover:text-slate-200"
        >
          Back to the board path
        </Link>
      </div>
    </section>
  );
}
