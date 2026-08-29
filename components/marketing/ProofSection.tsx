import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "./Section";

/**
 * PROOF. Real board meetings from a business that has run one weekly for three
 * months, redacted by an enforced gate in scripts/proof/render.mjs.
 *
 * This is the only thing on the site a competitor cannot manufacture. Anyone
 * can write a course about AI agents; nobody can retroactively produce three
 * months of a board reporting its own scheduled job dead for 40 days and its
 * paying customers falling.
 *
 * Which is why the cards lead with the bad weeks. A curated highlight reel
 * would be less persuasive AND less true, and the whole product is built on the
 * claim that we only publish what we can support.
 */

const CARDS = [
  {
    src: "/proof/headline.png",
    alt: "A board report headline reporting its own scheduled job dead for 40 days",
    title: "It reports its own failures first",
    body: "The standing order is that a dead scheduled run becomes the headline, above anything good that happened. This report opens by saying the daily job has been dead for 40 days, then that paying customers fell from 17 to 12.",
  },
  {
    src: "/proof/metrics.png",
    alt: "A metrics table with each number measured against its floor",
    title: "Every number sits against a floor",
    body: "Not percent to target. Distance to the minimum you said you would accept, with misses marked as misses. The source of each number is recorded, and what was not pulled is named.",
  },
  {
    src: "/proof/asks.png",
    alt: "The asks section of a board report, limited to three items",
    title: "It ends with decisions, not a summary",
    body: "Three asks, ordered by what they unblock, each one something only a person can do. And a promotion section it is not allowed to skip, where it explains why it is not asking for more autonomy.",
  },
];

export default function ProofSection() {
  return (
    <Section
      eyebrow="Proof"
      title="This is a real board, running a real business"
      subtitle="Not a demo. Three months of weekly meetings from the business that also sells this course, including the weeks it was wrong. Redacted, otherwise unedited."
      className="border-b border-slate-800/60"
    >
      <div className="space-y-14">
        {CARDS.map((c, i) => (
          <div
            key={c.src}
            className={`grid items-center gap-8 lg:grid-cols-2 ${
              i % 2 === 1 ? "lg:[&>figure]:order-2" : ""
            }`}
          >
            <figure className="overflow-hidden rounded-2xl border border-slate-800">
              <Image
                src={c.src}
                alt={c.alt}
                width={1376}
                height={768}
                className="w-full h-auto block"
              />
            </figure>

            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
                {c.title}
              </h3>
              <p className="mt-3 max-w-[52ch] leading-relaxed text-slate-400">
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-gold-border bg-slate-900 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-slate-50">
          The same board runs this course
        </h3>
        <p className="mt-3 max-w-[62ch] leading-relaxed text-slate-400">
          Not just the sibling business. This product has its own board, with its
          own charter, floors, and weekly meeting, and its numbers are published
          whether or not they flatter us.
        </p>
        <Link
          href="/proof"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-ink underline-offset-4 hover:underline"
        >
          See this product&apos;s live numbers
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}
