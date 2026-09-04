import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LADDER, BRAND, DISCLAIMER, DEV_PACK } from "@/lib/course-config";
import LadderBuyButton from "@/components/marketing/LadderBuyButton";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: `The Ladder — ${BRAND.name}`,
  description:
    "Learn the tool, get the machine, build yours live, keep it running. Five steps, each one the obvious next move from the one below it. " +
    DISCLAIMER,
};

/**
 * The ladder page: the whole business model on one surface.
 *
 * The composition is deliberately a vertical spine rather than a pricing table
 * of equal columns. Equal columns say "pick one of these alternatives". A spine
 * says "these are steps, and you are somewhere on it" — which is the actual
 * offer. Rungs you cannot buy yet render as steps, not as CTAs with fake dates.
 */

export default function LadderPage() {
  return (
    <>
      <MarketingNav />

      <main className="bg-background">
        {/* Hero: 3 text elements, no eyebrow, no scroll cue, no version label. */}
        <header className="mx-auto max-w-5xl px-4 pt-24 pb-16 sm:px-6">
          <h1 className="max-w-[18ch] text-4xl font-semibold leading-[1.05] tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
            Learn the tool. Then build the machine.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-slate-400">
            Five steps. Each one is the obvious next move from the step below it,
            not a different product.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-slate-50 transition-transform hover:brightness-110 active:scale-[0.98]"
            >
              Start at step one
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </header>

        {/* The spine. One rung per row, number rail on the left. */}
        <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <ol className="relative">
            {LADDER.map((rung, i) => {
              const last = i === LADDER.length - 1;
              return (
                <li
                  key={rung.id}
                  id={rung.id}
                  className="relative grid scroll-mt-24 grid-cols-1 gap-x-8 gap-y-4 py-10 sm:grid-cols-[auto_1fr]"
                >
                  {/* Rail: the connecting line IS the ladder, so it earns its place. */}
                  <div className="relative flex sm:flex-col sm:items-center">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-border bg-slate-900 font-mono text-sm text-gold-ink"
                    >
                      {rung.rung}
                    </span>
                    {!last && (
                      <span
                        aria-hidden
                        className="ml-4 mt-0 hidden w-px flex-1 bg-slate-800 sm:ml-0 sm:mt-4 sm:block"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                        {rung.name}
                      </h2>
                      <span className="font-mono text-sm text-gold-ink">
                        {rung.priceDisplay}
                      </span>
                      {!rung.available && (
                        <span className="rounded-full border border-slate-700 px-2.5 py-0.5 text-[11px] text-slate-400">
                          Not open yet
                        </span>
                      )}
                    </div>

                    <p className="mt-3 max-w-[62ch] leading-relaxed text-slate-400">
                      {rung.promise}
                    </p>

                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                      {rung.includes.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-sm leading-relaxed text-slate-300"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink"
                            aria-hidden
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-5 text-sm text-slate-500">{rung.forWho}</p>

                    {rung.available && (
                      <Link
                        href={rung.href}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-slate-50 transition-transform hover:brightness-110 active:scale-[0.98]"
                      >
                        {rung.ctaLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* The Dev Pack.
              OFF THE SPINE ON PURPOSE, and visually separated for the reason
              DEV_PACK's own comment gives: the ladder is what a solopreneur
              climbs, and their next step after building a board is the Kit, not
              learning Next.js and SQL. Rendering it as rung six would say
              beginners graduate into writing software, which is the exact
              mistake that made the original course unsellable to the people
              actually asking for it.

              It still needs to live here, because DEV_PACK.href points at
              #dev-pack and DevPackGate sends locked-lesson readers to it. Until
              this section existed that link landed at the top of the ladder
              with no Dev Pack anywhere on the page. */}
          <div
            id="dev-pack"
            className="mt-8 scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 sm:p-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Off the ladder, for people who write software
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
              {DEV_PACK.name}
            </h2>
            <p className="mt-3 max-w-[56ch] leading-relaxed text-slate-400">
              {DEV_PACK.promise}
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {DEV_PACK.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-sm text-slate-500">{DEV_PACK.forWho}</p>

            <div className="mt-7 flex flex-wrap items-baseline gap-4">
              {DEV_PACK.available ? (
                <LadderBuyButton
                  rung="dev-pack"
                  label={DEV_PACK.ctaLabel}
                  next="/ladder#dev-pack"
                  className="rounded-full bg-gold px-6 py-3 text-sm text-slate-50 hover:brightness-110 active:scale-[0.98]"
                />
              ) : (
                <span className="rounded-full border border-slate-700 px-5 py-2.5 text-sm text-slate-400">
                  Not on sale yet
                </span>
              )}
              <span className="text-sm text-slate-500">
                One-time. Unlocks inside the course you already have.
              </span>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
