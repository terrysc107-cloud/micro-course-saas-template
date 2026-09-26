import { BRAND, BOARD_ARTIFACTS, TEMPLATE_REPO, TEMPLATES, LAST_VERIFIED } from "@/lib/course-config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllModules } from "@/lib/content";
import { getCompletedLessons } from "@/lib/progress";
import SignOutButton from "@/components/ui/SignOutButton";
import LadderNext from "@/components/course/LadderNext";
import { getMyEntitlements, entitlementStatus } from "@/lib/entitlements";
import { Zap, BookOpen, ChevronRight, CheckCircle2, PlayCircle, FolderGit2, FileCheck2, Circle, Download, PlayCircle as Play, CalendarCheck } from "lucide-react";

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

  // Resume from first incomplete lesson, and carry its title so the primary
  // action can name the thing rather than saying "Continue".
  const resumeLesson = allLessons.find((k) => !completedSet.has(k)) ?? allLessons[0];
  const resumeMeta = resumeLesson
    ? modules
        .flatMap((m) => m.lessons)
        .find((l) => `${l.moduleSlug}/${l.lessonSlug}` === resumeLesson)
    : undefined;

  // WHAT THEY HAVE BUILT, not what they have read. An artifact counts as held
  // once the lesson that produces it is complete. This is the accumulation
  // promise made visible, and it is the one thing a lessons-completed counter
  // cannot show.
  const artifacts = BOARD_ARTIFACTS.map((a) => {
    const key = a.lesson.replace("/learn/", "");
    return { ...a, held: completedSet.has(key) };
  });
  const heldCount = artifacts.filter((a) => a.held).length;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-50 font-bold">
            <Zap className="w-5 h-5 text-brand-400" />
            {BRAND.name}
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Link href="/lab-studio" className="inline-flex mb-6 text-brand-400 font-semibold text-sm">Open your Build Lab workspace →</Link>
        {/*
          ONE PRIMARY ACTION, FIRST. A dashboard answers "where am I, what do I
          do next, is it working" in that order. The previous version opened
          with a module list, which made the student do the deciding every time
          they arrived.
        */}
        <section className="mb-8 rounded-2xl border border-gold-border bg-slate-900 p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold-ink">
            {completedCount === 0 ? "Start here" : "Pick up where you left off"}
          </p>

          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
            {resumeMeta?.frontmatter.title ?? "Your board"}
          </h1>

          {resumeMeta?.frontmatter.description && (
            <p className="mt-2 max-w-[60ch] text-slate-400 leading-relaxed">
              {resumeMeta.frontmatter.description}
            </p>
          )}

          {resumeLesson && (
            <Link
              href={`/learn/${resumeLesson.split("/")[0]}/${resumeLesson.split("/")[1]}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-slate-50 transition-transform hover:brightness-95 active:scale-[0.98]"
            >
              <PlayCircle className="w-4 h-4" />
              {completedCount === 0 ? "Start the first lesson" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          {/* Progress reads as a fact, not a trophy. */}
          <div className="mt-7 border-t border-slate-800 pt-5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-slate-400">
                {completedCount} of {totalLessons} lessons
              </span>
              <span className="font-mono text-slate-400">{progressPct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </section>

        {/* WHAT YOU HAVE BUILT — the differentiated panel. */}
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-50">Your board so far</h2>
            <span className="font-mono text-sm text-slate-400">
              {heldCount} of {artifacts.length} files
            </span>
          </div>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-slate-400">
            The files your board is built from. Each one lights up when you finish
            the lesson that explains it.
          </p>

          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {artifacts.map((a) => (
              <li key={a.file} className="flex items-start gap-3">
                {a.held ? (
                  <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
                )}
                <span className="min-w-0">
                  <Link
                    href={a.lesson}
                    className={`font-mono text-sm ${a.held ? "text-slate-50" : "text-slate-400"} hover:underline underline-offset-4`}
                  >
                    {a.file}
                  </Link>
                  <span className="block text-xs text-slate-500">{a.purpose}</span>
                </span>
              </li>
            ))}
          </ul>

          {TEMPLATE_REPO.published && (
            <a
              href={TEMPLATE_REPO.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-gold-border hover:text-slate-50"
            >
              <FolderGit2 className="h-4 w-4" aria-hidden />
              Open the {TEMPLATE_REPO.name} template
            </a>
          )}
        </section>

        {/* RESOURCES. The dashboard previously offered nothing to take away, so
            anyone wanting the templates had to remember which lesson linked
            them. Board downloads only: the Dev Pack ones are filtered out. */}
        <section className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-50">
              <Download className="h-4 w-4 text-gold-ink" aria-hidden />
              Downloads
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              The starting files, with the notes explaining each section.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {TEMPLATES.filter((t) => !t.devPackOnly).map((t) => (
                <li key={t.path}>
                  <a
                    href={t.path}
                    download
                    className="font-mono text-sm text-slate-300 underline-offset-4 hover:text-slate-50 hover:underline"
                  >
                    {t.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-50">
              <Play className="h-4 w-4 text-gold-ink" aria-hidden />
              See one run
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              A real weekly meeting, start to finish, from the board that runs
              this business. Including the week it reported its own scheduled job
              dead for 40 days.
            </p>
            <video
              className="mt-4 w-full rounded-lg border border-slate-800"
              src="/proof/board-run.webm"
              controls
              muted
              playsInline
              preload="metadata"
            />
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
              Course verified against the official docs on {LAST_VERIFIED}
            </p>
          </div>
        </section>

        {/* The full curriculum, secondary: for jumping around, not deciding. */}
        <h2 className="mb-4 text-lg font-semibold text-slate-50">All modules</h2>
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
                    <h3 className="text-slate-50 font-semibold text-sm sm:text-base truncate">{mod.title}</h3>
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
                    <><CheckCircle2 className="w-4 h-4 text-green-700" /><span className="hidden sm:inline">Done</span></>
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
