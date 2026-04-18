"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react";
import type { Module } from "@/lib/content";

interface CourseSidebarProps {
  modules: Module[];
  completed: string[];   // "moduleSlug/lessonSlug"
}

export default function CourseSidebar({ modules, completed }: CourseSidebarProps) {
  const pathname = usePathname();
  const completedSet = new Set(completed);

  // All lessons accessible — paid users can jump to any lesson freely
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({ key: `${l.moduleSlug}/${l.lessonSlug}`, ...l }))
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    modules.forEach((m) => (init[m.slug] = true));
    return init;
  });

  function toggle(slug: string) {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  return (
    <nav className="w-72 shrink-0 bg-slate-900 border-r border-slate-800 h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Course Content
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {completed.length} / {allLessons.length} lessons complete
        </p>
        {/* progress bar */}
        <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${allLessons.length ? (completed.length / allLessons.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="py-2">
        {modules.map((mod) => {
          const isOpen = expanded[mod.slug] ?? true;
          const modCompleted = mod.lessons.filter((l) =>
            completedSet.has(`${l.moduleSlug}/${l.lessonSlug}`)
          ).length;

          return (
            <div key={mod.slug} className="mb-1">
              <button
                onClick={() => toggle(mod.slug)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-slate-300 truncate">{mod.title}</span>
                </div>
                <span className="text-xs text-slate-600 shrink-0 ml-2">
                  {modCompleted}/{mod.lessons.length}
                </span>
              </button>

              {isOpen && (
                <ul>
                  {mod.lessons.map((lesson) => {
                    const key = `${lesson.moduleSlug}/${lesson.lessonSlug}`;
                    const isComplete = completedSet.has(key);
                    const href = `/learn/${lesson.moduleSlug}/${lesson.lessonSlug}`;
                    const isActive = pathname === href;

                    return (
                      <li key={key}>
                        <Link
                          href={href}
                          className={cn(
                            "flex items-center gap-3 pl-8 pr-4 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-brand-600/20 text-brand-300 border-r-2 border-brand-500"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{lesson.frontmatter.title}</span>
                          <span className="ml-auto text-xs text-slate-600 shrink-0">
                            {lesson.frontmatter.duration}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
