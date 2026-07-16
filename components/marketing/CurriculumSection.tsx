import { BookOpen } from "lucide-react";
import type { Module } from "@/lib/content";
import Section from "./Section";

interface CurriculumSectionProps {
  modules: Module[];
}

/** Module list is rendered from the real content tree, so the curriculum shown
 *  to buyers is the curriculum that exists. */
export default function CurriculumSection({ modules }: CurriculumSectionProps) {
  return (
    <Section
      id="curriculum"
      eyebrow="Curriculum"
      title="Every module, in order"
      subtitle="Written lessons with per-lesson quizzes and progress tracking. Facts are checked against the official documentation and dated."
      className="border-b border-slate-800/60"
    >
      <div className="space-y-2.5">
        {modules.map((mod) => (
          <div
            key={mod.slug}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-slate-700 transition-colors"
          >
            <div className="w-9 h-9 bg-slate-800/80 rounded-lg flex items-center justify-center text-slate-400 text-sm font-bold shrink-0 tabular-nums">
              {String(mod.order).padStart(2, "0")}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold">{mod.title}</h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed text-pretty">
                {mod.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm shrink-0">
              <BookOpen className="w-4 h-4" />
              {mod.lessons.length} {mod.lessons.length === 1 ? "lesson" : "lessons"}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
