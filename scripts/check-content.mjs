/**
 * Content integrity + truth-rule check.
 *
 *   npm run check:content
 *
 * These rules exist because V1 shipped violating every one of them: unlicensed
 * video embeds, fabricated testimonials, "10x" claims, stale model names, and an
 * income-promise module. A build passing is not evidence that the content is
 * honest, so this runs the checks a compiler can't.
 *
 * Exits non-zero on any violation. Wire it into CI before this course goes near
 * a marketing push.
 *
 * Node 24 strips TypeScript types natively, so course-config.ts imports directly.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODULES_DIR = path.join(ROOT, "content", "modules");
const PUBLIC_DIR = path.join(ROOT, "public");

const { MODULE_META, TEMPLATES, DISCLAIMER, BUILD_LAB } = await import(
  path.join(ROOT, "lib", "course-config.ts")
);

const failures = [];
const warnings = [];

const fail = (file, msg) => failures.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

// ── Banned patterns ──────────────────────────────────────────────────────────
// Each entry: why it's banned, so a future maintainer can judge a false positive
// rather than just deleting the rule.
const BANNED = [
  {
    re: /\b\d+\s*[x×]\s*(faster|more|output|productive)/gi,
    why: "Speed multiplier claim — unverifiable, and V1's central dishonesty.",
  },
  {
    re: /\b(10x|10×)\s*(developer|engineer|dev)\b/gi,
    why: '"10x developer" framing.',
  },
  {
    re: /claude\s*-?\s*3[.-](5|7)|sonnet\s*3[.-]/gi,
    why: "Named model version — dates the course. Teach /model and /status instead.",
  },
  {
    re: /\b(we|this course|it)\s+(guarantees?|will guarantee)\b|\bguaranteed\s+(income|earnings|results?|outcomes?)\b/gi,
    why: "Outcome guarantee — legally exposed, unsupportable.",
  },
  {
    re: /\bpays? for (the|this|itself in|your) (course|class|program|purchase)|make \$[\d,]+|earn \$[\d,]+|replace your salary/gi,
    why: 'Income promise. V1 shipped "Module 8 alone will pay for the course".',
  },
  {
    re: /youtube\.com\/watch|youtu\.be\//gi,
    why: "Third-party video link. All 35 embeds were removed for licensing; Terry has no permission.",
  },
  {
    re: /^videoUrl:/gim,
    why: "videoUrl in frontmatter. Only Terry-owned recordings may be added (docs/VIDEO-RECORDING-PLAN.md).",
  },
  {
    // Scoped to claims about US. "official Anthropic marketplace" and "not an
    // official Anthropic template" are legitimate references to Anthropic's own
    // things and must stay allowed.
    re: /\b(endorsed|certified|approved|affiliated|partnered)\s+by\s+anthropic|official\s+anthropic\s+(course|class|training|partner|product|curriculum)|in\s+partnership\s+with\s+anthropic/gi,
    why: "Implies Anthropic affiliation/endorsement. This is an independent product.",
  },
  {
    re: /\b(Marcus T\.|Priya S\.|Derek L\.)/g,
    why: "Fabricated V1 testimonial.",
  },

  // ── Scarcity ───────────────────────────────────────────────────────────────
  // Real scarcity is allowed and wanted: the Build Lab is a live session, so
  // the seat cap is genuine. What is banned is a number no row can back. Every
  // count must come from ccc_lab_sessions.capacity minus actual paid
  // registrations, rendered from data — never typed into a component.
  //
  // These rules did not exist before 2026-07-17. The no-invented-dates rule was
  // documented in BRAND-KIT and the integration doc and enforced by nothing,
  // which is the same as not existing.
  {
    re: /\b(only|just)\s+\d+\s+(seats?|spots?|places?|tickets?)\s+(left|remaining|available)/gi,
    why: "Hardcoded seat count. Real counts render from ccc_lab_sessions.capacity minus registrations.",
  },
  {
    re: /\b\d+\s+(seats?|spots?)\s+(left|remaining)\b/gi,
    why: "Hardcoded seat count — must be computed from real registrations.",
  },
  {
    re: /\b(last chance|doors close|ends (tonight|today)|act now|hurry|don'?t miss out|final hours?)\b/gi,
    why: "Urgency theatre. If the deadline is real it comes from starts_at; if it isn't, it's manufactured.",
  },
  {
    re: /\b\d{1,3}(,\d{3})*\+?\s+(students|developers|engineers|people|founders)\s+(have|already|enrolled|joined|trust)/gi,
    why: "Student count. There is no verifiable number, so there is no number.",
  },
  {
    re: /\b(join|trusted by)\s+\d{2,}(,\d{3})*\+?\s+(students|developers|engineers|people)/gi,
    why: "Social proof by headcount — unverifiable.",
  },
];

// Lines that are *about* a banned pattern rather than committing it: a lesson
// correcting the API-key myth, our own disclaimer stating non-affiliation, or a
// "who this is NOT for" entry disclaiming guarantees. Negation is the common
// thread — these lines exist precisely because the claim is false.
const CORRECTION_MARKERS =
  /not affiliated|not an official|no longer|used to|older tutorials|v1 |the first version of this course|do not teach|deliberately not taught|corrected|myth|that is wrong|banned|why:|looking for|skip it if|isn't for|is not for|rather than|instead of/i;

/** A YAML list item indented under `options:` — i.e. a multiple-choice answer. */
const isQuizOption = (line) => /^\s{4,}- ["']/.test(line);

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full, ext);
    return e.name.endsWith(ext) ? [full] : [];
  });
}

const rel = (f) => path.relative(ROOT, f);

// ── 1. Lesson content ────────────────────────────────────────────────────────
const lessons = walk(MODULES_DIR, ".mdx");

if (lessons.length === 0) fail("content/modules", "No lessons found.");

for (const file of lessons) {
  const raw = fs.readFileSync(file, "utf8");

  for (const { re, why } of BANNED) {
    for (const m of raw.matchAll(re)) {
      const line = raw.slice(0, m.index).split("\n").length;
      const lineText = raw.split("\n")[line - 1] ?? "";
      // A lesson explicitly correcting a V1 error must be allowed to quote it.
      if (CORRECTION_MARKERS.test(lineText)) continue;
      // Quiz distractors are deliberately false — "It guarantees the product
      // will sell" is a wrong answer, which is the point.
      if (isQuizOption(lineText)) continue;
      fail(`${rel(file)}:${line}`, `"${m[0].trim()}" — ${why}`);
    }
  }

  // Frontmatter shape. Deliberately not using gray-matter: this check should
  // still run if the content pipeline itself is broken.
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    fail(rel(file), "Missing frontmatter block.");
    continue;
  }
  const block = fm[1];

  for (const key of ["title", "description", "order", "duration", "track"]) {
    if (!new RegExp(`^${key}:`, "m").test(block)) {
      fail(rel(file), `Frontmatter missing required key: ${key}`);
    }
  }

  // track must be one of the three known values. A typo here silently changes
  // which learners see the lesson, so it is a hard failure rather than a warn.
  const trackMatch = block.match(/^track:\s*["']?(board|developer|both)["']?\s*$/m);
  if (!trackMatch) {
    fail(rel(file), "track: must be exactly board, developer, or both.");
  }

  // ── Board-shibboleth sweep ────────────────────────────────────────────────
  //
  // A lesson on the board path is read by someone who has never written code.
  // These patterns are the tells that a lesson still assumes otherwise: a code
  // fence in a programming language, a git command, a package manager, or the
  // "cd into your project" instruction that is the single hardest stop a
  // non-coder hits in this course.
  //
  // PROMOTED TO FAILURES once the last of the original 25 warnings was cleared.
  // The exit code is now the guarantee: a board-path lesson cannot acquire a
  // code fence, a git command, or a "cd into your project" instruction without
  // failing the build. That is the whole enforcement mechanism behind claiming
  // this path needs no coding.
  //
  // ONE ESCAPE, AND IT IS DELIBERATELY NARROW. `teaches: <tool>` in frontmatter
  // exempts a lesson from the sweep. The gate exists to stop a lesson ASSUMING
  // coding ability; a lesson whose entire job is to TEACH a tool gently is the
  // opposite of that, and without the escape the course could never teach git
  // at all. The value is recorded so the exemptions are greppable, and a lesson
  // claiming it must actually be about that tool — a reviewer's job, not a
  // regex's.
  const trackValue = trackMatch ? trackMatch[1] : "both";
  const teaches = block.match(/^teaches:\s*["']?([a-z-]+)["']?\s*$/m);
  if (!teaches && (trackValue === "board" || trackValue === "both")) {
    const SHIBBOLETHS = [
      { re: /```(ts|tsx|js|jsx|py|sql|go|rb|java|sh|bash)\b/g, why: "Code fence in a language a board-path reader cannot read." },
      { re: /cd \/path\/to\/your\/project|your (repo|repository|codebase)/gi, why: "Assumes the reader has a code project. A board reader's workspace is their business folder." },
      { re: /\bgit (diff|commit|branch|rebase|merge|push|add)\b/gi, why: "Git command on a board-path lesson." },
      { re: /\bnpm (run|install|test)\b|\byarn\b|\bpnpm\b|\bnpx\b/gi, why: "Package manager command on a board-path lesson." },
    ];
    for (const { re, why } of SHIBBOLETHS) {
      for (const m of raw.matchAll(re)) {
        const line = raw.slice(0, m.index).split("\n").length;
        const lineText = raw.split("\n")[line - 1] ?? "";
        if (CORRECTION_MARKERS.test(lineText)) continue;
        if (isQuizOption(lineText)) continue;
        fail(`${rel(file)}:${line}`, `"${m[0].trim()}" — ${why}`);
      }
    }
  }

  // order must match the filename prefix, or the sidebar lies about sequence.
  const filePrefix = path.basename(file).match(/^(\d+)-/);
  const orderMatch = block.match(/^order:\s*(\d+)/m);
  if (filePrefix && orderMatch && Number(filePrefix[1]) !== Number(orderMatch[1])) {
    fail(rel(file), `order: ${orderMatch[1]} does not match filename prefix ${filePrefix[1]}.`);
  }

  // Quiz answers must be in range, or the lesson is unpassable.
  const quizBlock = block.match(/^quiz:\n([\s\S]*)$/m);
  if (quizBlock) {
    const questions = quizBlock[1].split(/^\s*- question:/m).slice(1);
    questions.forEach((q, i) => {
      const optionCount = (q.match(/^\s{6}- /gm) ?? []).length;
      const answer = q.match(/^\s*answer:\s*(\d+)/m);
      if (!answer) {
        fail(rel(file), `Quiz question ${i + 1} has no answer.`);
      } else if (optionCount > 0 && Number(answer[1]) >= optionCount) {
        fail(
          rel(file),
          `Quiz question ${i + 1}: answer ${answer[1]} out of range (${optionCount} options).`
        );
      }
    });
  }

  if (/<LessonImage/.test(raw)) {
    warn(rel(file), "Uses <LessonImage> — confirm the image is Terry-owned, not hotlinked.");
  }
  if (/coverImage:\s*["']https:\/\/images\.unsplash/.test(raw)) {
    warn(rel(file), "Third-party Unsplash cover image (licensed, but generic filler).");
  }
}

// ── 2. MODULE_META covers every module folder ────────────────────────────────
const folders = fs.existsSync(MODULES_DIR)
  ? fs.readdirSync(MODULES_DIR, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : [];

for (const folder of folders) {
  if (!MODULE_META.some((m) => m.slug === folder)) {
    fail(
      "lib/course-config.ts",
      `Module folder "${folder}" has no MODULE_META entry — it renders with a derived title and an empty description.`
    );
  }
}
for (const meta of MODULE_META) {
  if (!folders.includes(meta.slug)) {
    fail("lib/course-config.ts", `MODULE_META references "${meta.slug}", which does not exist on disk.`);
  }
}

// ── 3. Downloads exist and are linked ────────────────────────────────────────
const slugify = (f) => f.replace(/^\d+-/, "").replace(/\.mdx$/, "");
const allLessonRoutes = new Set(
  lessons.map((f) => `/learn/${path.basename(path.dirname(f))}/${slugify(path.basename(f))}`)
);
const allLessonText = lessons.map((f) => fs.readFileSync(f, "utf8")).join("\n");

for (const t of TEMPLATES) {
  const onDisk = path.join(PUBLIC_DIR, t.path);
  if (!fs.existsSync(onDisk)) {
    fail("public/downloads", `TEMPLATES entry "${t.name}" → ${t.path} does not exist. The link 404s.`);
  } else {
    const body = fs.readFileSync(onDisk, "utf8");
    if (!/claude code class|claude code ai|ai by design/i.test(body)) {
      fail(rel(onDisk), "Download does not identify itself as course material — it could read as an Anthropic asset.");
    }
  }

  if (!allLessonRoutes.has(t.lesson)) {
    fail("lib/course-config.ts", `TEMPLATES "${t.name}" claims lesson ${t.lesson}, which is not a real lesson route.`);
  }
  if (!allLessonText.includes(t.path)) {
    fail("content/modules", `Download ${t.path} is linked from no lesson (expected in ${t.lesson}).`);
  }
}

// ── 4. Marketing surfaces ────────────────────────────────────────────────────
const marketing = [
  ...walk(path.join(ROOT, "components", "marketing"), ".tsx"),
  ...walk(path.join(ROOT, "app", "(marketing)"), ".tsx"),
  path.join(ROOT, "app", "layout.tsx"),
  path.join(ROOT, "lib", "course-config.ts"),
].filter((f) => fs.existsSync(f));

for (const file of marketing) {
  const raw = fs.readFileSync(file, "utf8");
  for (const { re, why } of BANNED) {
    for (const m of raw.matchAll(re)) {
      const line = raw.slice(0, m.index).split("\n").length;
      const lineText = raw.split("\n")[line - 1] ?? "";
      if (CORRECTION_MARKERS.test(lineText)) continue;
      fail(`${rel(file)}:${line}`, `"${m[0].trim()}" — ${why}`);
    }
  }
}

// ── 4b. The Build Lab date guarantee ─────────────────────────────────────────
// Regexes catch phrasings. These two catch the actual failure: a date existing
// when there is no session to attend.
//
// The invariant: BUILD_LAB.dateDisplay is null unless status is 'scheduled',
// and a scheduled run must say when. The database enforces the other half —
// ccc_lab_sessions has a CHECK refusing 'scheduled' without a real starts_at
// and price — so config and data cannot drift into selling a run that does not
// exist.
if (BUILD_LAB.status === "waitlist" && BUILD_LAB.dateDisplay !== null) {
  fail(
    "lib/course-config.ts",
    `BUILD_LAB.dateDisplay is "${BUILD_LAB.dateDisplay}" while status is 'waitlist'. ` +
      "A date with no scheduled session is an invented date — the one thing this file exists to prevent."
  );
}
if (BUILD_LAB.status === "scheduled" && !BUILD_LAB.dateDisplay) {
  fail(
    "lib/course-config.ts",
    "BUILD_LAB.status is 'scheduled' but dateDisplay is empty. A run people can pay for must say when it is."
  );
}
if (!["waitlist", "scheduled"].includes(BUILD_LAB.status)) {
  fail("lib/course-config.ts", `BUILD_LAB.status "${BUILD_LAB.status}" is not 'waitlist' or 'scheduled'.`);
}

// A date literal in a marketing component is by definition invented: real dates
// render from BUILD_LAB.dateDisplay, which is fed by ccc_lab_sessions.starts_at.
const DATE_LITERAL =
  /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(st|nd|rd|th)?\b|\b\d{4}-\d{2}-\d{2}\b/g;
for (const file of walk(path.join(ROOT, "components", "marketing"), ".tsx")) {
  const raw = fs.readFileSync(file, "utf8");
  for (const m of raw.matchAll(DATE_LITERAL)) {
    const line = raw.slice(0, m.index).split("\n").length;
    const lineText = raw.split("\n")[line - 1] ?? "";
    // Comments are how we explain the rule; they aren't shipping the claim.
    if (/^\s*(\/\/|\*|\/\*)/.test(lineText)) continue;
    fail(
      `${rel(file)}:${line}`,
      `Date literal "${m[0]}" in a marketing component. Dates render from BUILD_LAB.dateDisplay, never a literal.`
    );
  }
}

// The disclaimer must actually reach the page, not just exist in config.
const footer = path.join(ROOT, "components", "marketing", "MarketingFooter.tsx");
if (!fs.existsSync(footer)) {
  fail("components/marketing/MarketingFooter.tsx", "Missing — the disclaimer has nowhere to render.");
} else if (!/DISCLAIMER/.test(fs.readFileSync(footer, "utf8"))) {
  fail("components/marketing/MarketingFooter.tsx", "Does not render DISCLAIMER. The Anthropic disclaimer is non-negotiable.");
}
if (!/not affiliated with or endorsed by anthropic/i.test(DISCLAIMER)) {
  fail("lib/course-config.ts", "DISCLAIMER no longer states non-affiliation with Anthropic.");
}

// ── Report ───────────────────────────────────────────────────────────────────
const lessonCount = lessons.length;
console.log(`\nChecked ${lessonCount} lessons across ${folders.length} modules, ${TEMPLATES.length} downloads.\n`);

if (warnings.length) {
  console.log(`⚠  ${warnings.length} warning(s) — not blocking:`);
  for (const w of warnings) console.log(`   ${w.file}\n     ${w.msg}`);
  console.log("");
}

if (failures.length) {
  console.error(`✗ ${failures.length} failure(s):\n`);
  for (const f of failures) console.error(`   ${f.file}\n     ${f.msg}`);
  console.error("");
  process.exit(1);
}

console.log("✓ Content checks passed.\n");
