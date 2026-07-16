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

const { MODULE_META, TEMPLATES, DISCLAIMER } = await import(
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

  for (const key of ["title", "description", "order", "duration"]) {
    if (!new RegExp(`^${key}:`, "m").test(block)) {
      fail(rel(file), `Frontmatter missing required key: ${key}`);
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
    if (!/claude code class|ai by design/i.test(body)) {
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
