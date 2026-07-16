import { Check, X } from "lucide-react";
import { WHO_ITS_FOR, WHO_ITS_NOT_FOR } from "@/lib/course-config";
import Section from "./Section";

export default function AudienceSection() {
  return (
    <Section
      eyebrow="Fit"
      title="Who this is for — and who it isn't"
      subtitle="We would rather you skip this than buy it and feel misled."
      className="border-b border-slate-800/60"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Check className="w-4 h-4 text-brand-400" />
            Buy this if you&apos;re…
          </h3>
          <ul className="space-y-3">
            {WHO_ITS_FOR.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <X className="w-4 h-4 text-slate-500" />
            Skip it if you&apos;re…
          </h3>
          <ul className="space-y-3">
            {WHO_ITS_NOT_FOR.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                <X className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
