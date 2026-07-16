/**
 * Single source of truth for product identity, pricing, curriculum, and the
 * claims we are allowed to make. Marketing copy imports from here so a fact
 * only has to be corrected once.
 *
 * Truth rules enforced by this file:
 * - No testimonial, student count, or income claim appears anywhere until Terry
 *   has a verifiable source for it.
 * - Speed/outcome language describes a workflow, never a multiplier.
 * - The Anthropic disclaimer ships on every page via the shared footer.
 */

export const BRAND = {
  name: "Claude Code Class",
  tagline: "An AI by Design course",
  siteUrl: "https://claudecodeclass.com",
  supportEmail: "terrysc107@gmail.com",
} as const;

export const PARENT_BRAND = {
  name: "AI by Design",
  url: "https://aixdesign.dev",
  /** Shown on the landing page to explain who teaches this and why. */
  blurb:
    "AI by Design is Terry Scott's practice helping teams put AI to work in real production systems. Claude Code Class is the self-paced course arm of that practice — the same workflow, written down.",
} as const;

/**
 * Required on every public page. Non-negotiable: this product is independent
 * and must never imply an Anthropic partnership or endorsement.
 */
export const DISCLAIMER =
  "Independent educational product by AI by Design. Not affiliated with or endorsed by Anthropic.";

/**
 * Claude Code ships changes weekly. Every lesson that states a fact about the
 * tool carries this note plus a link to the official docs.
 */
export const DOCS_NOTE = {
  text: "Claude Code changes fast. Official documentation is the final word — if a lesson and the docs disagree, trust the docs and tell us.",
  url: "https://code.claude.com/docs/en/overview",
} as const;

/** Bump whenever curriculum facts are re-verified against the official docs. */
export const LAST_VERIFIED = "2026-07-16";

export const PRODUCT = {
  priceDisplay: "$97",
  priceNote: "One-time payment. Lifetime access, including future updates.",
  ctaLabel: "Get the course — $97",
  /** Stripe price is read from env at runtime; never hardcode a price id. */
  priceIdEnvVar: "NEXT_PUBLIC_STRIPE_PRICE_ID",
} as const;

/**
 * The live Build Lab is PLANNED ONLY. There is no date, no checkout, and no
 * registration. Do not add a price or a Stripe product for this until Terry
 * explicitly approves one.
 */
export const WORKSHOP = {
  name: "The Build Lab",
  status: "Planned — no date yet",
  description:
    "A live, small-group session where we build one real feature end to end and you watch every decision, including the ones that go wrong.",
  note: "Not open for registration. No date has been set and there is nothing to buy yet. Course members will hear about it first.",
} as const;

// ── Curriculum ───────────────────────────────────────────────────────────────

export interface ModuleMeta {
  slug: string;
  title: string;
  description: string;
}

/**
 * Titles and descriptions for each module folder. `lib/content.ts` reads this
 * so the sidebar, dashboard, and landing page can never drift apart. Lesson
 * counts are derived from the filesystem, not hardcoded.
 */
export const MODULE_META: ModuleMeta[] = [
  {
    slug: "01-getting-started",
    title: "Getting Started",
    description:
      "Install Claude Code the way the official docs recommend, log in with your Claude account, and run a first session with permissions you understand.",
  },
  {
    slug: "02-core-concepts",
    title: "Core Concepts",
    description:
      "How context actually works, how to write a prompt that gets the change you meant, and how to manage a session over hours instead of minutes.",
  },
  {
    slug: "03-working-with-files",
    title: "Working with Files",
    description:
      "Open a real project, create files, refactor safely, and get an honest explanation of code nobody on your team wrote.",
  },
  {
    slug: "04-real-dev-workflows",
    title: "Real Dev Workflows",
    description:
      "The core loop: build a feature, debug a failure, write tests that mean something, and keep Git history reviewable.",
  },
  {
    slug: "05-advanced-prompting",
    title: "Project Context & Scope",
    description:
      "Write a CLAUDE.md worth loading, chain work across steps, run review passes, and stop scope creep before it lands in your diff.",
  },
  {
    slug: "06-specific-stacks",
    title: "Specific Stacks",
    description:
      "Stack-specific tactics for Next.js, Python, SQL, REST APIs, and CLI tools.",
  },
  {
    slug: "07-productivity-best-practices",
    title: "Practice & Safety",
    description:
      "Daily habits, a security mindset for an agent that can run commands, usage awareness, and shipping with a review you trust.",
  },
  {
    slug: "08-extending-claude-code",
    title: "Extending Claude Code",
    description:
      "Skills, hooks, MCP, subagents and agent teams, plugins, and running Claude Code beyond the terminal — IDE, desktop, web, and CI/CD.",
  },
  {
    slug: "09-capstone",
    title: "Capstone: Lead Follow-Up Command Center",
    description:
      "One guided build, start to finish, using the standard loop: brief, inspect, plan, scaffold, data, feature, tests, browser QA, ship, roll back.",
  },
  {
    slug: "10-professional-practice",
    title: "Professional Practice",
    description:
      "Using this workflow in client and team settings: scoping honestly, internal tools, and turning a repeatable process into a service.",
  },
];

export function getModuleMeta(slug: string): ModuleMeta | undefined {
  return MODULE_META.find((m) => m.slug === slug);
}

// ── Landing page content ─────────────────────────────────────────────────────

/**
 * The one workflow the whole course teaches. Referenced by the landing page,
 * the capstone, and the ship checklist so learners see the same spine
 * everywhere.
 */
export const CORE_LOOP = [
  { step: "Inspect", detail: "Read the code before changing it. Make Claude prove it understands." },
  { step: "Plan", detail: "Agree on the approach in plan mode, before a single file is edited." },
  { step: "Build", detail: "Small, reviewable changes — not a thousand-line drop." },
  { step: "Review", detail: "Read every diff. You are still the engineer of record." },
  { step: "Test", detail: "Prove it works with tests and a real browser pass." },
  { step: "Ship", detail: "Deploy behind a plan you can undo." },
] as const;

export const OUTCOMES = [
  "Install and log in to Claude Code the way the current docs actually recommend",
  "Pick the right permission mode for the task instead of approving everything",
  "Run long sessions without losing context or your place",
  "Write a CLAUDE.md that measurably improves what Claude produces",
  "Review an AI-written diff critically enough to sign your name to it",
  "Debug a real failure instead of regenerating and hoping",
  "Write tests that would actually catch the bug you just fixed",
  "Package a repeatable workflow as a Skill your team can share",
  "Wire Claude Code to your own tools with MCP",
  "Split work across subagents and agent teams when a task is too big for one context",
  "Ship a complete feature end to end in the capstone, with a rollback plan",
] as const;

export const WHO_ITS_FOR = [
  "Developers who already write code and want a disciplined AI workflow, not a magic button",
  "Freelancers and consultants who need output they can defend to a client",
  "Team leads deciding how their team should adopt an agentic coding tool safely",
] as const;

/**
 * Being explicit about who should not buy is a trust feature and a refund
 * reducer. Do not soften this into a second "who it's for" list.
 */
export const WHO_ITS_NOT_FOR = [
  "Complete beginners who have never written code — learn programming fundamentals first; this course assumes you can read a diff",
  "Anyone looking for passive income or a guaranteed outcome — this teaches a skill, and what you do with it is on you",
  "Teams needing Anthropic's official enterprise training or support — that comes from Anthropic, not from us",
] as const;

export const INCLUDED = [
  "10 modules of written lessons, kept current against the official docs",
  "A guided capstone build with a standardized workflow",
  "Downloadable templates: CLAUDE.md, build brief, preflight and ship checklists, and a Skill starter",
  "Per-lesson quizzes and progress tracking",
  "Lifetime access, including future updates as Claude Code changes",
] as const;

/**
 * Downloadable starter assets. These are our own material — never describe or
 * imply that any of them is an Anthropic-provided asset.
 * `path` is served from /public/downloads and must be linked from `lesson`.
 */
export interface TemplateAsset {
  name: string;
  path: string;
  description: string;
  /** Lesson route that links this download, so nothing ships orphaned. */
  lesson: string;
}

export const TEMPLATES: TemplateAsset[] = [
  {
    name: "CLAUDE.md template",
    path: "/downloads/claude-md-template.md",
    description:
      "A starting CLAUDE.md with the sections that actually change Claude's output, and notes on what to leave out.",
    lesson: "/learn/05-advanced-prompting/claude-md-setup",
  },
  {
    name: "Build brief template",
    path: "/downloads/build-brief-template.md",
    description:
      "The one-page brief you write before any feature, so plan mode has something real to work from.",
    lesson: "/learn/09-capstone/brief-and-inspect",
  },
  {
    name: "Preflight checklist",
    path: "/downloads/preflight-checklist.md",
    description: "What to verify before you let an agent touch a repository.",
    lesson: "/learn/01-getting-started/permission-modes",
  },
  {
    name: "Ship checklist",
    path: "/downloads/ship-checklist.md",
    description: "The review, test, deploy, and rollback gate before anything reaches production.",
    lesson: "/learn/09-capstone/qa-ship-and-rollback",
  },
  {
    name: "Skill starter",
    path: "/downloads/skill-template/SKILL.md",
    description: "A commented SKILL.md skeleton you can copy into .claude/skills/ and adapt.",
    lesson: "/learn/08-extending-claude-code/skills",
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: "Do I need an Anthropic API key?",
    a: "No. Claude Code requires an account, and most learners log in with a Claude subscription (Pro, Max, Team, or Enterprise). A Claude Console account with pre-paid credits also works, as does access through a cloud provider your employer configures. The course covers logging in; the subscription or credits are billed by Anthropic, not by us.",
  },
  {
    q: "Is this affiliated with Anthropic?",
    a: DISCLAIMER + " Everything here is our own material, and we link to the official documentation as the authoritative source.",
  },
  {
    q: "Are there videos?",
    a: "Not yet. The written lessons are complete and are the course. We are recording original walkthroughs now, and they will be added to the relevant lessons as they ship — included at no extra cost, because your purchase covers future updates. We would rather ship no video than someone else's video.",
  },
  {
    q: "Will this go out of date?",
    a: "Parts of it, constantly — Claude Code ships changes weekly. That is why every factual lesson links to the official docs and carries a last-verified date, and why updates are included for life. Lessons were last verified against the official documentation on " + LAST_VERIFIED + ".",
  },
  {
    q: "What experience do I need?",
    a: "You should be able to read code, use a terminal, and understand a Git diff. You do not need to be senior. If you have never programmed, start with programming fundamentals first — this course will not land.",
  },
  {
    q: "What about the live Build Lab?",
    a: WORKSHOP.note + " The $97 course is self-paced and available today; that is the only thing on sale.",
  },
  {
    q: "Can I get a refund?",
    a: "Email " + BRAND.supportEmail + " within 14 days and we will refund you. No form to fill out and no questions designed to talk you out of it.",
  },
];
