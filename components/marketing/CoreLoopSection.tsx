import { CORE_LOOP } from "@/lib/course-config";
import Section from "./Section";

export default function CoreLoopSection() {
  return (
    <Section
      eyebrow="The method"
      title="One loop, taught until it's a habit"
      subtitle="Every module, lab, and the capstone run this same sequence. By the end it should feel automatic — including the parts most people skip."
      className="border-b border-slate-800/60"
    >
      <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CORE_LOOP.map(({ step, detail }, i) => (
          <li
            key={step}
            className="relative bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-brand-500/50 text-sm font-bold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-white font-semibold">{step}</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{detail}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
