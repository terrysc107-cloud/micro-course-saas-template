import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LessonNavProps {
  prev: { moduleSlug: string; lessonSlug: string; frontmatter: { title: string } } | null;
  next: { moduleSlug: string; lessonSlug: string; frontmatter: { title: string } } | null;
  nextUnlocked: boolean;
}

export default function LessonNav({ prev, next, nextUnlocked }: LessonNavProps) {
  return (
    <div className="flex justify-between items-center mt-10 pt-8 border-t border-slate-800">
      {prev ? (
        <Link
          href={`/learn/${prev.moduleSlug}/${prev.lessonSlug}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <div>
            <div className="text-xs text-slate-600 mb-0.5">Previous</div>
            <div>{prev.frontmatter.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next && nextUnlocked && (
        <Link
          href={`/learn/${next.moduleSlug}/${next.lessonSlug}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group text-right"
        >
          <div>
            <div className="text-xs text-slate-600 mb-0.5">Next</div>
            <div>{next.frontmatter.title}</div>
          </div>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
