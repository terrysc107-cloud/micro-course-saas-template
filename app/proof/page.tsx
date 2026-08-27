import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND, DISCLAIMER } from "@/lib/course-config";
import { getProofSnapshot } from "@/lib/proof";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: `Numbers — ${BRAND.name}`,
  description:
    "The real numbers behind this business, read live from the database on every request. " +
    DISCLAIMER,
};

/**
 * The public proof dashboard.
 *
 * Dynamic on purpose, for the same reason the Build Lab page is: a cached
 * number on a page whose entire claim is "these are live" would be a lie with a
 * timestamp on it.
 *
 * Density is deliberately higher than the marketing pages and the numbers are
 * mono. This is a data surface, not a pitch. The persuasion is that the numbers
 * are unflattering and shown anyway.
 */
export const dynamic = "force-dynamic";

function formatValue(value: number | null): string {
  // A failed read and a genuine zero look identical to a reader and mean
  // opposite things, so they must never render the same.
  return value === null ? "not available" : value.toLocaleString("en-US");
}

export default async function ProofPage() {
  const snapshot = await getProofSnapshot();
  const readAt = new Date(snapshot.readAt);

  return (
    <>
      <MarketingNav />

      <main className="bg-background">
        <header className="mx-auto max-w-5xl px-4 pt-24 pb-12 sm:px-6">
          <h1 className="max-w-[20ch] text-4xl font-semibold leading-[1.05] tracking-tight text-slate-50 sm:text-5xl">
            The numbers, including the bad ones.
          </h1>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-slate-400">
            Read from the database when you loaded this page. Nothing here is
            typed by hand or rounded up.
          </p>
        </header>

        <section
          aria-label="Live metrics"
          className="mx-auto max-w-5xl px-4 pb-16 sm:px-6"
        >
          <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.metrics.map((m) => (
              <div
                key={m.label}
                className="border-t border-slate-800 py-6"
              >
                <dt className="text-sm text-slate-400">{m.label}</dt>
                <dd
                  className={[
                    "mt-2 font-mono tracking-tight",
                    m.value === null
                      ? "text-lg text-slate-500"
                      : "text-4xl text-slate-50",
                  ].join(" ")}
                >
                  {formatValue(m.value)}
                </dd>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {m.basis}
                </p>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-slate-50">
              Why this page exists
            </h2>
            <p className="mt-3 max-w-[62ch] leading-relaxed text-slate-400">
              Every course about building with AI shows you the wins. The useful
              part is the maintenance: what breaks, what a bad week looks like,
              and whether the thing is still being kept current. So the curriculum
              carries a verification date and this page carries live counts.
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border-t border-slate-800 pt-4">
                <dt className="text-sm text-slate-400">Curriculum verified against official docs</dt>
                <dd className="mt-1 font-mono text-slate-200">
                  {snapshot.curriculumVerified}
                </dd>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <dt className="text-sm text-slate-400">This page read at</dt>
                <dd className="mt-1 font-mono text-slate-200">
                  <time dateTime={snapshot.readAt}>
                    {readAt.toISOString().replace("T", " ").slice(0, 16)} UTC
                  </time>
                </dd>
              </div>
            </dl>

            <Link
              href="/ladder"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-gold-border px-6 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-gold hover:text-slate-50"
            >
              See the ladder
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
