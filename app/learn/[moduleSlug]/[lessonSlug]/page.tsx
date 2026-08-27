import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLesson, getAllModules, getAdjacentLessons } from "@/lib/content";
import type { TrackId } from "@/lib/course-config";
import { getCompletedLessons } from "@/lib/progress";
import LessonLayout from "@/components/course/LessonLayout";
import CourseSidebar from "@/components/course/CourseSidebar";
import LessonContent from "@/components/course/LessonContent";
import LessonVideo from "@/components/course/LessonVideo";
import LessonQuiz from "@/components/course/LessonQuiz";
import LessonNav from "@/components/course/LessonNav";
import LadderNext from "@/components/course/LadderNext";
import DevPackGate from "@/components/course/DevPackGate";
import { entitlementStatus } from "@/lib/entitlements";

interface PageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { moduleSlug, lessonSlug } = await params;

  const lesson = getLesson(moduleSlug, lessonSlug);
  if (!lesson) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Which half of the course is this reader entitled to? The base purchase buys
  // the board path; the Dev Pack unlocks the developer lessons.
  // "ungated" means the entitlements table does not exist yet, so the Dev Pack
  // gate is not in service and nobody is locked out by our migration backlog.
  const devPack = user ? await entitlementStatus("dev-pack") : "locked";
  const seesDeveloperContent = devPack === "owned" || devPack === "ungated";
  const track: TrackId = seesDeveloperContent ? "developer" : "board";

  const locked = lesson.frontmatter.track === "developer" && !seesDeveloperContent;

  const completed = user ? await getCompletedLessons(user.id) : [];
  // Sidebar and prev/next follow the reader's own path, so a board learner is
  // never walked into a wall by clicking Next.
  const modules = getAllModules(track);
  const { prev, next } = getAdjacentLessons(moduleSlug, lessonSlug, track);

  const lessonKey = `${moduleSlug}/${lessonSlug}`;
  const alreadyPassed = completed.includes(lessonKey);

  // A REAL gate. Returning before the body is built means the lesson text is
  // never serialised to the client. A blurred overlay would leak it.
  if (locked) {
    return (
      <LessonLayout sidebar={<CourseSidebar modules={modules} completed={completed} />}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <DevPackGate lessonTitle={lesson.frontmatter.title} />
        </div>
      </LessonLayout>
    );
  }

  return (
    <LessonLayout sidebar={<CourseSidebar modules={modules} completed={completed} />}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Breadcrumb */}
        <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">
          {moduleSlug.replace(/^\d+-/, "").replace(/-/g, " ")}
        </p>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-3">
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

        {/* Renders nothing until a Terry-owned recording exists for this lesson */}
        <LessonVideo videoUrl={lesson.frontmatter.videoUrl} title={lesson.frontmatter.title} />

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

        {/*
          Final lesson only. `next` is null exactly once in the course, at the
          end of the last module, which is the highest-intent moment a buyer
          reaches: they just finished, and they feel capable. Before this, that
          moment offered nothing at all.
        */}
        {!next && <LadderNext currentRungId="course" variant="banner" />}
      </div>
    </LessonLayout>
  );
}
