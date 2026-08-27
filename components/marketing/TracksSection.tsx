import { Check, Compass, Code2 } from "lucide-react";
import { TRACKS, DEV_PACK, PRODUCT } from "@/lib/course-config";
import Section from "./Section";

/**
 * What the course is, and what it deliberately is not.
 *
 * The old site had one product aimed at developers, and a "who this is not
 * for" list whose first entry excluded people who have never written code,
 * which is most of the people asking. This section replaces that with an
 * honest split: the board path is the product, and the developer material is
 * an add-on that is named rather than hidden.
 *
 * Two cards, not three, and deliberately unequal in weight. Equal columns
 * would read as "pick one", when the truth is that one of these is the course
 * and the other is an optional extra.
 */
export default function TracksSection() {
  const board = TRACKS[0];

  return (
    <Section
      title="One path, and one optional add-on"
      subtitle="The course is the board path. The developer material is separate, so you are not paying for lessons about SQL you will never open."
      className="border-b border-slate-800/60"
    >
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* The product */}
        <div className="rounded-2xl border border-gold-border bg-slate-900 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold-ink">
            <Compass className="h-3.5 w-3.5" aria-hidden />
            Included, this is the course
          </p>

          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            {board.name}
          </h3>
          <p className="mt-3 max-w-[58ch] leading-relaxed text-slate-400">
            {board.promise}
          </p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {[
              "Start from an empty folder, not a codebase",
              "The four files your board reads",
              "Define seats and what each may not do",
              "Put a run on a schedule",
              "Permissions, before anything runs unattended",
              "Tell a useful run from a plausible one",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-slate-500">{board.forWho}</p>
          <p className="mt-4 font-mono text-sm text-gold-ink">{PRODUCT.priceDisplay}</p>
        </div>

        {/* The add-on, visibly secondary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
            <Code2 className="h-3.5 w-3.5" aria-hidden />
            Optional add-on
          </p>

          <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
            {DEV_PACK.name}
          </h3>
          <p className="mt-3 leading-relaxed text-slate-400">{DEV_PACK.promise}</p>

          <ul className="mt-6 grid gap-2">
            {DEV_PACK.includes.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-slate-500">{DEV_PACK.forWho}</p>
          <p className="mt-4 font-mono text-sm text-slate-400">
            {DEV_PACK.priceDisplay}
            {!DEV_PACK.available && " · not on sale yet"}
          </p>
        </div>
      </div>
    </Section>
  );
}
