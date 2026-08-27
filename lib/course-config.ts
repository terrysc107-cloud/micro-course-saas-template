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
  /**
   * RENAMED to "Claude Code AI" (2026-08-26, Terry's call).
   *
   * ⚠️ CROSS-REPO SYNC REQUIRED: by-design-ai's `lib/education.ts` still sets
   * COURSE_NAME = "Claude Code Class". Two spellings of one product is two
   * products — that repo must be updated to match before the next marketing
   * push. The domain stays claudecodeclass.com; a domain and a brand name are
   * allowed to differ, but two brand names are not.
   */
  name: "Claude Code AI",
  tagline: "An AI by Design course",
  siteUrl: "https://claudecodeclass.com",
  supportEmail: "terrysc107@gmail.com",
} as const;

export const PARENT_BRAND = {
  name: "AI by Design",
  url: "https://aixdesign.dev",
  /** Shown on the landing page to explain who teaches this and why. */
  blurb:
    "AI by Design is Terry Scott's practice helping teams put AI to work in real production systems. Claude Code AI is the self-paced course arm of that practice: the same workflow, written down.",
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
export const LAST_VERIFIED = "2026-08-26";

export const PRODUCT = {
  priceDisplay: "$97",
  priceNote: "One-time payment. Lifetime access, including future updates.",
  ctaLabel: "Get the course — $97",
  /** Stripe price is read from env at runtime; never hardcode a price id. */
  priceIdEnvVar: "NEXT_PUBLIC_STRIPE_PRICE_ID",
} as const;

/**
 * The Build Lab — the live session the course funnels up to.
 *
 * Terry approved a price and a checkout on 2026-07-16. He has NOT approved a
 * date, and that distinction is the whole design: a checkout you build ahead of
 * time is preparation, a date you invented is false scarcity.
 *
 * TWO SOURCES OF TRUTH, DELIBERATELY:
 *   - This config decides what RENDERS.
 *   - The `ccc_lab_sessions` row decides what CHARGES.
 * They are asserted against each other at request time, so a typo here cannot
 * take someone's money, and a date here without a dated row sells nothing.
 *
 * TO OPEN REGISTRATION, all three must happen together:
 *   1. Create the Stripe price; set NEXT_PUBLIC_STRIPE_BUILD_LAB_PRICE_ID.
 *   2. UPDATE ccc_lab_sessions SET status='scheduled', starts_at=…, capacity=…,
 *      stripe_price_id=…, price_cents=… WHERE slug='founding-run';
 *      (a CHECK constraint refuses 'scheduled' without a real date and price)
 *   3. Set status:'scheduled' + dateDisplay here.
 *
 * SCARCITY: real only. Seats remaining are computed from capacity minus actual
 * paid registrations, server-side. Never write a seat count, a date, or a
 * countdown as a literal — check-content.mjs fails the build on it.
 */
export const BUILD_LAB = {
  name: "The Build Lab",
  /** Must match LIVE_LAB_NAME in by-design-ai's lib/education.ts. Two
   *  spellings of one product is two products. */
  sessionSlug: "founding-run",

  /** 'waitlist' | 'scheduled' — the single switch for the whole funnel. */
  status: "waitlist" as "waitlist" | "scheduled",

  /** MUST be null while status is 'waitlist'. Enforced by check-content.mjs. */
  dateDisplay: null as string | null,

  /** $497 for the founding run.
   *
   *  REPRICED when the ladder landed. $297 was set when the Lab sat directly
   *  above a $97 course with nothing between them. The Kit now occupies $297,
   *  and the Lab's promise grew — it is no longer "watch one feature get
   *  built", it is "stand up your own operating company with me, live, on your
   *  repo, Kit included". A rung cannot cost the same as the rung below it.
   *
   *  Still a founding number: there is no social proof yet, and this is the
   *  first run. Asserted against the live Stripe price at checkout — if they
   *  disagree, checkout refuses rather than surprising someone. Changing it is
   *  this line plus a new Stripe price id plus the ccc_lab_sessions row. */
  priceDisplay: "$497",
  priceCents: 49700,
  priceIdEnvVar: "NEXT_PUBLIC_STRIPE_BUILD_LAB_PRICE_ID",

  description:
    "A live, small-group session where we build one real feature end to end and you watch every decision, including the ones that go wrong.",

  waitlistNote:
    "No date is set yet. Join the list and you'll hear when there is one, before it goes anywhere else. The waitlist costs nothing and holds nothing — no deposit.",
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

// ── Tracks ───────────────────────────────────────────────────────────────────

/**
 * THE TWO PATHS THROUGH THIS COURSE.
 *
 * WHY THIS EXISTS: the curriculum was written for developers, and an audit of
 * all 49 lessons found only 6 that a non-coder could complete unmodified.
 * Nineteen more (all of modules 03, 04, 06 and 09) exist purely to exercise the
 * workflow on source code. Meanwhile the actual buyer is a solopreneur who
 * wants an AI board running their small business and has never written code.
 *
 * The fix is not to soften the copy. Copy that welcomes a beginner into
 * lessons about Vitest and RLS policies produces refunds. Instead every lesson
 * declares which path it is on, and the board path is the product.
 *
 * "both" is the honest default for a lesson that genuinely serves either
 * reader. It is also the fail-open value in lib/content.ts, so a lesson
 * missing its frontmatter is shown rather than silently hidden from a paying
 * customer.
 */
export type TrackId = "board" | "developer";
export type LessonTrack = TrackId | "both";

export interface TrackMeta {
  id: TrackId;
  name: string;
  promise: string;
  forWho: string;
  /** What this path does NOT cover. Rendered beside the promise, never buried. */
  notFor: string;
  /** Plain words, or "" when there is genuinely no prerequisite. */
  prerequisite: string;
}

export const TRACKS: readonly TrackMeta[] = [
  {
    id: "board",
    name: "The Board Path",
    promise:
      "Go from an empty folder to an AI board that reads your real numbers on a schedule and hands you a meeting you can act on.",
    forWho:
      "You run something small, you have never written code, and you want AI doing standing work instead of one-off chats.",
    notFor:
      "It does not teach you to build software. If you want that too, the Dev Pack is a separate add-on.",
    prerequisite: "",
  },
  {
    id: "developer",
    name: "The Dev Pack",
    promise:
      "The disciplined agentic coding workflow: inspect, plan, build, review, test, ship, on real code in real stacks.",
    forWho:
      "You already write software and want an AI workflow you can defend in review.",
    notFor:
      "It does not teach programming. It assumes you can read a diff and run a test suite.",
    prerequisite: "You can read code and use a terminal.",
  },
] as const;

/** What a buyer is on unless they own the Dev Pack. */
export const DEFAULT_TRACK: TrackId = "board";

export function getTrackMeta(id: TrackId): TrackMeta | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function isTrackId(value: unknown): value is TrackId {
  return value === "board" || value === "developer";
}

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
    // Said "that is the only thing on sale" — true until the Lab got a price.
    // Kept the useful half: the course does not depend on the Lab.
    a:
      "It is a separate, live, one-off session — we build one real feature end to end and you watch every decision, including the ones that go wrong. It is not scheduled yet, so there is a waitlist rather than a date, and the waitlist costs nothing. The $97 course is self-paced, complete on its own, and does not depend on the Lab.",
  },
  {
    q: "Can I get a refund?",
    a: "Email " + BRAND.supportEmail + " within 14 days and we will refund you. No form to fill out and no questions designed to talk you out of it.",
  },
];

// ── The ladder ───────────────────────────────────────────────────────────────

/**
 * THE LADDER — the single source of truth for what aixdesign.dev sells and in
 * what order.
 *
 * Everything above this comment describes ONE product ($97 course) plus ONE
 * upsell (the Lab). That shape sold each thing in isolation. The ladder exists
 * to make each rung the obvious next step from the one below it, so a buyer
 * moves up rather than being re-acquired from cold every time.
 *
 * THE SPINE: the course teaches you to build with Claude Code. The kit hands
 * you the machine that runs a business with it. The Lab builds YOUR machine
 * with you, live. The Board Room keeps it current every month. The Install is
 * us doing it for you. Each rung is the same idea at a higher level of
 * done-for-you — that is what makes it a ladder and not a catalogue.
 *
 * RULES THIS OBJECT ENFORCES (all checked by scripts/check-content.mjs):
 *  - No rung promises an income, an outcome, or a timeline. We sell a system
 *    and the work, never a result. See BANNED in check-content.mjs.
 *  - Prices render from here. Stripe price ids come from env, never hardcoded.
 *  - `kind: "application"` rungs have NO checkout by design — a five-figure
 *    engagement is a conversation, and a Buy button on one is a lie about how
 *    it actually gets sold.
 *  - A rung with `available: false` renders as "what's next", never as a thing
 *    you can buy today. Nothing here manufactures urgency.
 *
 * ORDERING: `rung` is the display order and the upgrade path. Keep it dense.
 */

export type LadderKind = "onetime" | "recurring" | "application";

export interface LadderRung {
  /** Stable id. Also the Stripe `product` metadata value the webhook branches on. */
  id: "course" | "kit" | "build-lab" | "board-room" | "install";
  rung: number;
  name: string;
  /** One line. What this rung IS. */
  promise: string;
  /** Who has outgrown the rung below and is ready for this one. */
  forWho: string;
  kind: LadderKind;
  priceDisplay: string;
  /** Cents. Asserted against the live Stripe price at checkout. null for application rungs. */
  priceCents: number | null;
  /** Env var holding the Stripe price id. null when there is nothing to charge. */
  priceIdEnvVar: string | null;
  /** Can someone buy this right now? False renders as "next", never as a CTA. */
  available: boolean;
  /** Where the CTA goes. */
  href: string;
  ctaLabel: string;
  /** What you get. Concrete deliverables only — no adjectives, no outcomes. */
  includes: readonly string[];
}

export const LADDER: readonly LadderRung[] = [
  {
    id: "course",
    rung: 1,
    name: "The Course",
    promise:
      "Learn to build real software with Claude Code, from install to shipping something you can hand to someone else.",
    forWho: "You have an idea and a terminal you are not yet comfortable in.",
    kind: "onetime",
    // Derived from PRODUCT for the same reason — the course is live and
    // selling; its price must not be able to disagree with itself.
    priceDisplay: PRODUCT.priceDisplay,
    priceCents: 9700,
    priceIdEnvVar: PRODUCT.priceIdEnvVar,
    available: true,
    href: "/#pricing",
    ctaLabel: "Get the course — $97",
    includes: [
      "48 lessons across 10 modules, self-paced",
      "The capstone build, start to finish",
      "Downloads: preflight checklist, skill template",
      "Lifetime access, including updates as Claude Code changes",
    ],
  },
  {
    id: "kit",
    rung: 2,
    name: "The Operating Company Kit",
    promise:
      "The actual files behind an AI board: the agents, the scheduled runs, and the documents they read and write.",
    forWho:
      "You finished the course and want the machine, not another tutorial about the machine.",
    kind: "onetime",
    priceDisplay: "$297",
    priceCents: 29700,
    priceIdEnvVar: "NEXT_PUBLIC_STRIPE_KIT_PRICE_ID",
    available: false,
    href: "/ladder#kit",
    ctaLabel: "Get the Kit — $297",
    includes: [
      "Agent definitions for a CEO, CMO, and CFO seat",
      "The scheduled daily pulse and weekly board meeting",
      "Templates: goals, metrics snapshot, decision log, pipeline",
      "The freshness routine that keeps your context from rotting",
      "A worked example from a business that actually runs on it",
    ],
  },
  {
    id: "build-lab",
    rung: 3,
    name: "The Build Lab",
    promise:
      "A live, small-group run where you stand up your own AI operating company and watch every decision, including the ones that go wrong.",
    forWho: "You want it built with you, in your business, not adapted from a template alone.",
    kind: "onetime",
    // Derived, not repeated. BUILD_LAB is what checkout asserts against, so it
    // stays the authority for the Lab's price; this rung only displays it.
    priceDisplay: BUILD_LAB.priceDisplay,
    priceCents: BUILD_LAB.priceCents,
    priceIdEnvVar: BUILD_LAB.priceIdEnvVar,
    available: false,
    href: "/build-lab",
    ctaLabel: "Join the Build Lab list",
    includes: [
      "Live small-group sessions, working on your repo",
      "Your board configured against your real numbers",
      "The Kit included",
      "Recordings and the working files afterward",
    ],
  },
  {
    id: "board-room",
    rung: 4,
    name: "The Board Room",
    promise:
      "Your board keeps meeting. Every month: a fresh run against your numbers, and the updates that keep your setup current as the tools change.",
    forWho: "You have a board running and do not want to be the one maintaining it.",
    kind: "recurring",
    priceDisplay: "$49/mo",
    priceCents: 4900,
    priceIdEnvVar: "NEXT_PUBLIC_STRIPE_BOARD_ROOM_PRICE_ID",
    available: false,
    href: "/ladder#board-room",
    ctaLabel: "Join the Board Room",
    includes: [
      "A monthly board meeting run against your submitted metrics",
      "The freshness report — what changed in the tools, and what it breaks",
      "Kit updates as they ship",
      "A members' channel",
    ],
  },
  {
    id: "install",
    rung: 5,
    name: "The Install",
    promise:
      "We build your AI operating company with you over a few weeks, then hand you the keys and the documentation.",
    forWho: "You would rather buy the outcome of the work than do the work.",
    kind: "application",
    priceDisplay: "By application",
    priceCents: null,
    priceIdEnvVar: null,
    available: false,
    href: "/ladder#install",
    ctaLabel: "Start a conversation",
    includes: [
      "A working board wired to your real data",
      "Your agents written against your business, not a template",
      "Documentation your team can maintain",
      "A handover session, recorded",
    ],
  },
] as const;

export function getRung(id: LadderRung["id"]): LadderRung | undefined {
  return LADDER.find((r) => r.id === id);
}

/** The rung above `id`, or undefined at the top. Drives every in-app upsell. */
export function nextRung(id: LadderRung["id"]): LadderRung | undefined {
  const current = getRung(id);
  if (!current) return undefined;
  return LADDER.find((r) => r.rung === current.rung + 1);
}
