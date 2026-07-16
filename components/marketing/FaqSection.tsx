import { ChevronDown } from "lucide-react";
import { FAQ } from "@/lib/course-config";
import Section from "./Section";

export default function FaqSection() {
  return (
    <Section
      id="faq"
      width="narrow"
      eyebrow="FAQ"
      title="Straight answers"
      subtitle="Including the questions that don't flatter us."
    >
      <div className="space-y-2.5">
        {FAQ.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 open:bg-slate-900"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-white font-medium text-sm">
              {q}
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-4 text-slate-400 text-sm leading-relaxed text-pretty">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
