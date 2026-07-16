import { CalendarClock } from "lucide-react";
import { WORKSHOP } from "@/lib/course-config";
import Section from "./Section";

/**
 * The Build Lab is planned only. This block must never gain a date, a price, a
 * seat count, or a checkout button without Terry's explicit approval — that is
 * the difference between anticipation and false scarcity.
 */
export default function BuildLabSection() {
  return (
    <Section width="narrow" className="border-b border-slate-800/60">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{WORKSHOP.name}</h2>
            <p className="text-slate-500 text-sm">{WORKSHOP.status}</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed mb-3">{WORKSHOP.description}</p>
        <p className="text-slate-500 text-sm leading-relaxed">{WORKSHOP.note}</p>
      </div>
    </Section>
  );
}
