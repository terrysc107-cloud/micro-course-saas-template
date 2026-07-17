import Link from "next/link";
import { CalendarClock, ArrowRight } from "lucide-react";
import { BUILD_LAB } from "@/lib/course-config";
import Section from "./Section";

/**
 * The Build Lab. Terry approved a price and a checkout on 2026-07-16. He has
 * NOT approved a date — and that distinction is the entire point of this file:
 * a checkout built in advance is preparation, a date you invented is false
 * scarcity.
 *
 * The guardrail moved, it did not disappear. This block may render a date, a
 * seat count, or a countdown ONLY from BUILD_LAB.dateDisplay and the
 * ccc_lab_sessions row — never from a literal written here. check-content.mjs
 * fails the build on a date literal in this directory, and on BUILD_LAB
 * carrying a dateDisplay while its status is still 'waitlist'.
 *
 * Real scarcity is wanted and fine: the seat cap is genuine, because it is a
 * live session with one person teaching it. It just has to trace to a row.
 */
export default function BuildLabSection() {
  const scheduled = BUILD_LAB.status === "scheduled";

  return (
    <Section width="narrow" className="border-b border-slate-800/60">
      <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{BUILD_LAB.name}</h2>
            <p className="text-slate-500 text-sm">
              {scheduled && BUILD_LAB.dateDisplay ? BUILD_LAB.dateDisplay : "Live · no date set yet"}
            </p>
          </div>
          <div className="sm:ml-auto">
            <span className="text-2xl font-bold text-white">{BUILD_LAB.priceDisplay}</span>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-3">{BUILD_LAB.description}</p>
        <p className="text-slate-500 text-sm leading-relaxed mb-5">{BUILD_LAB.waitlistNote}</p>

        <Link
          href="/build-lab"
          className="inline-flex items-center gap-2 text-brand-400 hover:text-gold text-sm font-medium transition-colors"
        >
          {scheduled ? "See the details" : "Join the waitlist"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}
