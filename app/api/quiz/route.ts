import { createClient } from "@/lib/supabase/server";
import { getLesson } from "@/lib/content";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleSlug, lessonSlug, answers } = await request.json();

  if (!moduleSlug || !lessonSlug || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lesson = getLesson(moduleSlug, lessonSlug);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const questions = lesson.frontmatter.quiz ?? [];
  const correct = questions.map((q, i) => answers[i] === q.answer);
  const score = questions.length > 0
    ? Math.round((correct.filter(Boolean).length / questions.length) * 100)
    : 100;
  const passed = score >= 70;

  // Store quiz result
  await supabase.from("quiz_results").insert({
    user_id: user.id,
    module_slug: moduleSlug,
    lesson_slug: lessonSlug,
    score,
    passed,
    answers: answers,
  });

  // If passed, mark lesson complete + update state
  if (passed) {
    await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        module_slug: moduleSlug,
        lesson_slug: lessonSlug,
      },
      { onConflict: "user_id,module_slug,lesson_slug" }
    );

    await supabase.from("user_course_state").upsert(
      {
        user_id: user.id,
        last_module_slug: moduleSlug,
        last_lesson_slug: lessonSlug,
      },
      { onConflict: "user_id" }
    );
  }

  return NextResponse.json({ score, passed, correct });
}
