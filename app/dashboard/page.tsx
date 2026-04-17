import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllModules } from "@/lib/content";
import { getCompletedLessons, getLastLesson } from "@/lib/progress";
import SignOutButton from "@/components/ui/SignOutButton";
import { Zap, BookOpen, ChevronRight, CheckCircle2, Lock, PlayCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const [modules, completed, lastLesson] = await Promise.all([
    Promise.resolve(getAllModules()),
    getCompletedLessons(user.id),
    getLastLesson(user.id),
  ]);

  const completedSet = new Set(completed);
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => `${l.moduleSlug}/${l.lessonSlug}`)
  );
  const totalLessons = allLessons.length;
  const completedCount = completed.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Find resume lesson (first incomplete, or first overall)
  let resumeLesson = allLessons.find((k) => !completedSet.has(k));
  if (!resumeLesson && allLessons.length > 0) resumeLesson = allLessons[0];

  // Build accessible set
  const accessibleKeys = new Set<string>();
  if (allLessons.length > 0) {
    accessibleKeys.add(allLessons[0]);
    for (let i = 1; i < allLessons.length; i++) {
      if (completedSet.has(allLessons[i - 1])) accessibleKeys.add(allLessons[i]);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold">
            <Zap className="w-5 h-5 text-brand-400" />
            Claude Code Mastery
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-slate-400">
            {completedCount === 0
              ? "Welcome! Start with Lesson 1 to begin your Claude Code journey."
              : `You've completed ${completedCount} of ${totalLessons} lessons. Keep going!`}
          </p>
        </div>

        {/* Progress banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold text-lg">Overall Progress</p>
              <p className="text-slate-400 text-sm mt-0.5">
                {completedCount}/{totalLessons} lessons complete
              </p>
            </div>
            <span className="text-3xl font-bold text-brand-400">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {resumeLesson && (
            <div className="mt-4">
              <Link
                href={`/learn/${resumeLesson.split("/")[0]}/${resumeLesson.split("/")[1]}`}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                {completedCount === 0 ? "Start Course" : "Continue Learning"}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Module grid */}
        <h2 className="text-xl font-bold text-white mb-4">All Modules</h2>
        <div className="grid gap-4">
          {modules.map((mod) => {
            const modCompleted = mod.lessons.filter((l) =>
              completedSet.has(`${l.moduleSlug}/${l.lessonSlug}`)
            ).length;
            const firstLesson = mod.lessons[0];
            const href = firstLesson
              ? `/learn/${firstLesson.moduleSlug}/${firstLesson.lessonSlug}`
              : "#";
            const isModuleAccessible = firstLesson
              ? accessibleKeys.has(`${firstLesson.moduleSlug}/${firstLesson.lessonSlug}`)
              : false;

            return (
              <div
                key={mod.slug}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">{mod.title}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {mod.lessons.length} lessons · {modCompleted}/{mod.lessons.length} complete
                    </p>
                    {/* Mini progress */}
                    <div className="mt-2 h-1 bg-slate-800 rounded-full w-40 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{
                          width: `${mod.lessons.length ? (modCompleted / mod.lessons.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {isModuleAccessible ? (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors shrink-0 ml-4"
                  >
                    {modCompleted === mod.lessons.length ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-400" /> Completed
                      </>
                    ) : modCompleted > 0 ? (
                      <>Continue <ChevronRight className="w-4 h-4" /></>
                    ) : (
                      <>Start <ChevronRight className="w-4 h-4" /></>
                    )}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-600 text-sm shrink-0 ml-4">
                    <Lock className="w-4 h-4" /> Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
