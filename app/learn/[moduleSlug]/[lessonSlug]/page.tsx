import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getAllModules, getAdjacentLessons } from "@/lib/content";
import { getCompletedLessons } from "@/lib/progress";
import LessonLayout from "@/components/course/LessonLayout";
import CourseSidebar from "@/components/course/CourseSidebar";
import LessonContent from "@/components/course/LessonContent";
import LessonQuiz from "@/components/course/LessonQuiz";
import LessonNav from "@/components/course/LessonNav";

interface PageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { moduleSlug, lessonSlug } = await params;

  const lesson = getLesson(moduleSlug, lessonSlug);
  if (!lesson) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const completed = user ? await getCompletedLessons(user.id) : [];
  const modules = getAllModules();
  const { prev, next } = getAdjacentLessons(moduleSlug, lessonSlug);

  const lessonKey = `${moduleSlug}/${lessonSlug}`;
  const alreadyPassed = completed.includes(lessonKey);

  return (
    <LessonLayout sidebar={<CourseSidebar modules={modules} completed={completed} />}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Breadcrumb */}
        <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">
          {moduleSlug.replace(/^\d+-/, "").replace(/-/g, " ")}
        </p>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {lesson.frontmatter.title}
          </h1>
          <p className="text-slate-400">{lesson.frontmatter.description}</p>
          <p className="text-sm text-slate-600 mt-2">{lesson.frontmatter.duration} read</p>
        </div>

        {/* Cover image */}
        {lesson.frontmatter.coverImage && (
          <div className="mb-8 rounded-xl overflow-hidden border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lesson.frontmatter.coverImage}
              alt={lesson.frontmatter.title}
              className="w-full h-48 sm:h-64 object-cover"
              loading="eager"
            />
          </div>
        )}

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
        <LessonNav prev={prev} next={next} nextUnlocked={true} />
      </div>
    </LessonLayout>
  );
}
