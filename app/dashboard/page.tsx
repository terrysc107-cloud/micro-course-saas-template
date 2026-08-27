import { BRAND } from "@/lib/course-config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllModules } from "@/lib/content";
import { getCompletedLessons } from "@/lib/progress";
import SignOutButton from "@/components/ui/SignOutButton";
import LadderNext from "@/components/course/LadderNext";
import { getMyEntitlements, entitlementStatus } from "@/lib/entitlements";
import { Zap, BookOpen, ChevronRight, CheckCircle2, PlayCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const [completed, entitlements, devPack] = await Promise.all([
    getCompletedLessons(user.id),
    getMyEntitlements(),
    entitlementStatus("dev-pack"),
  ]);

  // The board path is the product. Developer lessons appear only for someone
  // who owns the Dev Pack, or while the gate is not yet in service.
  const track = devPack === "owned" || devPack === "ungated" ? "developer" : "board";
  const modules = getAllModules(track);

  // Show the rung above the HIGHEST one they already hold, so the card is never
  // selling something they own. Reaching the dashboard at all means they bought
  // the course, so "course" is the floor.
  const active = new Set(
    entitlements.filter((e) => e.status === "active").map((e) => e.product)
  );
  const currentRungId = active.has("board-room")
    ? ("board-room" as const)
    : active.has("kit")
      ? ("kit" as const)
      : ("course" as const);

  const completedSet = new Set(completed);
  const allLessons = modules.flatMap((m) =>
    m.lessons.map((l) => `${l.moduleSlug}/${l.lessonSlug}`)
  );
  const totalLessons = allLessons.length;
  const completedCount = completed.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Resume from first incomplete lesson
  const resumeLesson = allLessons.find((k) => !completedSet.has(k)) ?? allLessons[0];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold">
            <Zap className="w-5 h-5 text-brand-400" />
            {BRAND.name}
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Welcome */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-slate-400">
            {completedCount === 0
              ? "Welcome! Start with Lesson 1 to begin your Claude Code journey."
              : `You've completed ${completedCount} of ${totalLessons} lessons. Keep going!`}
          </p>
        </div>

        {/* Progress banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8">
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
                className="inline-flex items-center gap-2 bg-gold hover:bg-brand-400 text-background px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                {completedCount === 0 ? "Start Course" : "Continue Learning"}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Module grid — all unlocked */}
        <h2 className="text-xl font-bold text-white mb-4">All Modules</h2>
        <div className="grid gap-3 sm:gap-4">
          {modules.map((mod) => {
            const modCompleted = mod.lessons.filter((l) =>
              completedSet.has(`${l.moduleSlug}/${l.lessonSlug}`)
            ).length;
            const firstLesson = mod.lessons[0];
            const href = firstLesson
              ? `/learn/${firstLesson.moduleSlug}/${firstLesson.lessonSlug}`
              : "#";
            const done = modCompleted === mod.lessons.length && mod.lessons.length > 0;

            return (
              <div
                key={mod.slug}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base truncate">{mod.title}</h3>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      {mod.lessons.length} lessons · {modCompleted}/{mod.lessons.length} complete
                    </p>
                    <div className="mt-1.5 h-1 bg-slate-800 rounded-full w-28 sm:w-40 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${mod.lessons.length ? (modCompleted / mod.lessons.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors shrink-0 ml-3"
                >
                  {done ? (
                    <><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="hidden sm:inline">Done</span></>
                  ) : modCompleted > 0 ? (
                    <><span className="hidden sm:inline">Continue</span><ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <><span className="hidden sm:inline">Start</span><ChevronRight className="w-4 h-4" /></>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* The ladder's in-app entry point. Sits below the modules so it never
            competes with the reason they signed in, which is to keep learning. */}
        <div className="mt-10">
          <LadderNext currentRungId={currentRungId} />
        </div>
      </main>
    </div>
  );
}
