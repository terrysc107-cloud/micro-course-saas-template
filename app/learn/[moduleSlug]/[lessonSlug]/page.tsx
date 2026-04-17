import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getAllModules, getAdjacentLessons } from "@/lib/content";
import { getCompletedLessons } from "@/lib/progress";
import CourseSidebar from "@/components/course/CourseSidebar";
import LessonContent from "@/components/course/LessonContent";
import LessonQuiz from "@/components/course/LessonQuiz";
import LessonNav from "@/components/course/LessonNav";
import SignOutButton from "@/components/ui/SignOutButton";
import Link from "next/link";
import { Zap } from "lucide-react";

interface PageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { moduleSlug, lessonSlug } = await params;

  const lesson = getLesson(moduleSlug, lessonSlug);
  if (!lesson) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const completed = user ? await getCompletedLessons(user.id) : [];
  const modules = getAllModules();
  const { prev, next } = getAdjacentLessons(moduleSlug, lessonSlug);

  // Check if quiz already passed for this lesson
  const lessonKey = `${moduleSlug}/${lessonSlug}`;
  const alreadyPassed = completed.includes(lessonKey);

  // Next lesson accessible only if this one is complete
  const completedSet = new Set(completed);
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => `${l.moduleSlug}/${l.lessonSlug}`)
  );
  const nextIdx = next ? allLessons.indexOf(`${next.moduleSlug}/${next.lessonSlug}`) : -1;
  const nextUnlocked = nextIdx > 0 ? completedSet.has(allLessons[nextIdx - 1]) : false;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <CourseSidebar modules={modules} completed={completed} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top nav */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-semibold text-sm">
            <Zap className="w-4 h-4 text-brand-400" />
            Claude Code Mastery
          </Link>
          <SignOutButton />
        </header>

        {/* Lesson body */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Breadcrumb */}
            <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">
              {moduleSlug.replace(/^\d+-/, "").replace(/-/g, " ")}
            </p>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">
                {lesson.frontmatter.title}
              </h1>
              <p className="text-slate-400">{lesson.frontmatter.description}</p>
              <p className="text-sm text-slate-600 mt-2">{lesson.frontmatter.duration} read</p>
            </div>

            {/* Video embed */}
            {lesson.frontmatter.videoUrl && (
              <div className="mb-8 rounded-xl overflow-hidden aspect-video bg-slate-800">
                <iframe
                  src={lesson.frontmatter.videoUrl.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {/* Lesson content */}
            <LessonContent content={lesson.content} />

            {/* Quiz */}
            {lesson.frontmatter.quiz?.length > 0 && (
              <LessonQuiz
                moduleSlug={moduleSlug}
                lessonSlug={lessonSlug}
                questions={lesson.frontmatter.quiz}
                nextLesson={next}
                alreadyPassed={alreadyPassed}
              />
            )}

            {/* Nav */}
            <LessonNav
              prev={prev}
              next={next}
              nextUnlocked={nextUnlocked || alreadyPassed}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
