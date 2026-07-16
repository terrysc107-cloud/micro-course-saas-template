import { Check } from "lucide-react";
import { OUTCOMES } from "@/lib/course-config";
import Section from "./Section";

export default function OutcomesSection() {
  return (
    <Section
      eyebrow="Outcomes"
      title="What you'll be able to do"
      subtitle="Concrete capabilities, not vibes. Each one maps to a lesson you can point at."
      className="border-b border-slate-800/60"
    >
      <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
        {OUTCOMES.map((item) => (
          <li key={item} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
            <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </Section>
  );
}
