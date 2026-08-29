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
   * RENAMED again, 2026-08-28: "Claude Code AI" -> "My AI Board".
   *
   * The product stopped being about one tool. It teaches a system of files,
   * seats and schedules that runs on any capable agent, so a name built around
   * a single vendor was describing something we had already moved past. It also
   * put us third in a lane two competitors already own ("Two Hour CEO",
   * "Bionic CEO"), where "board" is genuinely ours: it is the repo name, the
   * vocabulary of every lesson, and the method itself.
   *
   * ⚠️ CROSS-REPO SYNC still required: by-design-ai's `lib/education.ts`
   * COURSE_NAME. Two spellings of one product is two products.
   */
  name: "My AI Board",
  tagline: "An AI by Design course",
  /**
   * Canonical since 2026-08-28. claudecodeclass.com stays attached to the
   * project and keeps resolving, so no existing link breaks.
   */
  siteUrl: "https://runyouraiboard.com",
  supportEmail: "terrysc107@gmail.com",
} as const;

export const PARENT_BRAND = {
  name: "AI by Design",
  url: "https://aixdesign.dev",
  /** Shown on the landing page to explain who teaches this and why. */
  blurb:
    // Interpolated rather than written out, so the next rename cannot leave a
    // stale brand name buried in a paragraph the way this one did.
    `AI by Design is Terry Scott's practice helping teams put AI to work in real production systems. ${BRAND.name} is the self-paced course arm of that practice: the same workflow, written down.`,
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
  text: "Claude Code changes fast. Official documentation is the final word, if a lesson and the docs disagree, trust the docs and tell us.",
  url: "https://code.claude.com/docs/en/overview",
} as const;

/** Bump whenever curriculum facts are re-verified against the official docs. */
export const LAST_VERIFIED = "2026-08-26";

export const PRODUCT = {
  /**
   * REPRICED $97 -> $57 when the course became the board path.
   *
   * The $97 buyer was a developer buying a developer course. The $57 buyer is a
   * solopreneur buying a narrower product: the board path, with the developer
   * curriculum moved to the DEV_PACK add-on at the old price. Less content for
   * less money, aimed at the person actually asking.
   *
   * ⚠️ priceCents is asserted against the live Stripe price in
   * app/api/stripe/checkout/route.ts. Changing this line WITHOUT creating the
   * matching Stripe price and updating NEXT_PUBLIC_STRIPE_PRICE_ID makes
   * checkout refuse with a 503 rather than charge the wrong amount. That is the
   * intended failure: a page advertising $57 must never take $97.
   */
  priceDisplay: "$57",
  priceCents: 5700,
  /**
  * "Corrections", NOT "future updates", and the distinction is load-bearing.
  *
  * The Board Room sells updates: my board's archive, new seats and playbooks,
  * the freshness report. If the one-time purchase already promised "future
  * updates", the subscription would be selling something the buyer had been
  * told they already own, and the ladder would contradict itself on the pricing
  * page.
  *
  * The honest line is the one software has used for decades: fixes to what you
  * bought are free forever, new material is not. We cannot sell a course with a
  * lesson we know to be false, so corrections were never a bonus.
  */
  priceNote:
    "One-time payment. Lifetime access, and the lessons stay correct as the tools change.",
  ctaLabel: "Get the course, $57",
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
    "No date is set yet. Join the list and you'll hear when there is one, before it goes anywhere else. The waitlist costs nothing and holds nothing, no deposit.",
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
    slug: "00-start-here",
    title: "Start Here: Your AI Board",
    description:
      "Go from an empty folder to a working AI board. What a board is, where it lives, how to open it, and how to tell a useful run from a plausible one. No code.",
  },
  {
    slug: "20-memory",
    title: "Memory: How the System Remembers",
    description:
      "Four files in a folder work for about six weeks. Tiers, an index, an inbox that drains, dated archives, and the split between what your board proposes and what you promote.",
  },
  {
    slug: "21-seats",
    title: "Seats: Charters, Goals, and Promotions",
    description:
      "Who a seat is, what it may do alone, what floors it is measured against, and how it earns more autonomy without you getting burned.",
  },
  {
    slug: "22-the-meeting",
    title: "The Meeting",
    description:
      "The weekly ritual: the report your board writes, the inbox you write back through, and what a useful meeting actually contains.",
  },
  {
    slug: "23-review-loop",
    title: "Review and Improve",
    description:
      "How the system gets better instead of just longer. Candidates, promotion by evidence, and treating your own corrections as output.",
  },
  {
    slug: "24-real-data",
    title: "Connecting Real Data",
    description:
      "Hand-typed numbers rot silently. Give a seat a read-only window onto a system of record, and record the query beside the number.",
  },
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
      "Skills, hooks, MCP, subagents and agent teams, plugins, and running Claude Code beyond the terminal, IDE, desktop, web, and CI/CD.",
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

// ── The starter template ─────────────────────────────────────────────────────

/**
 * The repo a student forks to get their board.
 *
 * NAMED `ai-board`, not `ai-board-starter`, and the reason is what happens on
 * fork. A fork of `ai-board-starter` leaves someone owning a repo called
 * "ai-board-starter" forever, which reads like a template they never made their
 * own. A fork of `ai-board` leaves them owning `ai-board`. The name is already
 * correct for them on day one.
 *
 * It also matches the folder name the curriculum already teaches in
 * `00-start-here/02-your-workspace`, so forking produces exactly the folder
 * every later lesson refers to. And it says nothing about which AI, which tool,
 * or which course, so it survives the tool-agnostic direction intact.
 *
 * ⚠️ The TEMPLATE is public so it can be forked. A student's FORK must be
 * private: it fills with real revenue, pipeline, and customer names. That
 * warning lives in `20-memory/03-version-history-with-git`.
 */
export const TEMPLATE_REPO = {
  name: "ai-board",
  owner: "terrysc107-cloud",
  url: "https://github.com/terrysc107-cloud/ai-board",
  /** The GitHub About field. The slug is permanent; this can change freely. */
  tagline:
    "A folder of markdown files that becomes an AI board for your business.",
  /** Set true once the repo exists. Until then, nothing links to it. */
  published: false,
} as const;

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
/**
 * The board path's spine, as CORE_LOOP is the developer path's.
 *
 * "Act" is a step because 10/06 and 00/01 both say plainly that the machine
 * does not act. A loop ending at "Decide" would quietly imply otherwise, and
 * the most common way a board fails is that nobody does anything with it.
 */
export const BOARD_LOOP = [
  { step: "Brief", detail: "Say what the run is for, what to read, and what not to do." },
  { step: "Gather", detail: "Keep the four files true. Stale inputs produce confident nonsense." },
  { step: "Run", detail: "On a schedule, so it happens on days you never sit down." },
  { step: "Review", detail: "Trace every claim to a number. Expect it to name what it did not have." },
  { step: "Decide", detail: "Log the decision and what would reverse it." },
  { step: "Act", detail: "The board does not do this part. You do." },
] as const;

export const CORE_LOOP = [
  { step: "Inspect", detail: "Read the code before changing it. Make Claude prove it understands." },
  { step: "Plan", detail: "Agree on the approach in plan mode, before a single file is edited." },
  { step: "Build", detail: "Small, reviewable changes, not a thousand-line drop." },
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
  "Solopreneurs and small-business owners who have never written code and want AI doing standing work, not one-off chats",
  "Operators and consultants who want to run this on their own business before they run it for anyone else",
  "Anyone tired of AI that only helps on the days they remember to open it",
] as const;

/**
 * Being explicit about who should not buy is a trust feature and a refund
 * reducer. Do not soften this into a second "who it's for" list.
 */
export const WHO_ITS_NOT_FOR = [
  "Anyone who wants AI to run the business for them. This builds a board that produces analysis and drafts. The decisions and the work stay yours",
  "Anyone looking for passive income or a guaranteed outcome. This teaches a system, and what you do with it is on you",
  "Anyone who wants to learn to program. The Dev Pack assumes you can already read code, and nothing here teaches you to write it from zero",
  "Teams needing Anthropic's official enterprise training or support. That comes from Anthropic, not from us",
] as const;

export const INCLUDED = [
  "The board path: from an empty folder to a board that runs on a schedule",
  "Written lessons, kept current against the official docs and dated so you can check",
  "The four board files as downloads, ready to fill in",
  "Per-lesson quizzes and progress tracking",
  "Lifetime access, and corrections whenever the tools move under a lesson",
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
  /**
   * True when the download belongs to the developer curriculum and hangs off a
   * `developer` lesson. Board buyers are never shown or promised these, and
   * check-content.mjs fails the build on any entry that is neither reachable
   * from a board lesson nor marked here.
   */
  devPackOnly?: boolean;
}

export const TEMPLATES: TemplateAsset[] = [
  // ── The board files ───────────────────────────────────────────────────────
  // These four are what the $57 buyer actually needs, and they are attached to
  // a board-track lesson so they are reachable without the Dev Pack.
  //
  // THE BUG THIS FIXES: INCLUDED promised "build brief, preflight and ship
  // checklists" to a board buyer, and all three hang off `developer` lessons
  // behind the Dev Pack gate. The files existed and resolved; the buyer could
  // not reach the lessons that link them.
  {
    name: "GOALS.md",
    path: "/downloads/board/GOALS.md",
    description:
      "Your goals file, written as floors rather than targets, with the section for what you have ruled out.",
    lesson: "/learn/00-start-here/your-workspace",
  },
  {
    name: "METRICS.md",
    path: "/downloads/board/METRICS.md",
    description:
      "The metrics table with the source column, which is the one that stops a stale number reading like a current one.",
    lesson: "/learn/00-start-here/your-workspace",
  },
  {
    name: "DECISION-LOG.md",
    path: "/downloads/board/DECISION-LOG.md",
    description:
      "Decisions with reversal conditions, so your board stops re-proposing things you already ruled out.",
    lesson: "/learn/00-start-here/your-workspace",
  },
  {
    name: "PIPELINE.md",
    path: "/downloads/board/PIPELINE.md",
    description:
      "An honest pipeline with stages. The file most likely to flatter you if you let it.",
    lesson: "/learn/00-start-here/your-workspace",
  },
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
    devPackOnly: true,
  },
  {
    name: "Preflight checklist",
    path: "/downloads/preflight-checklist.md",
    description: "What to verify before you let an agent touch a repository.",
    lesson: "/learn/01-getting-started/permission-modes",
    devPackOnly: true,
  },
  {
    name: "Ship checklist",
    path: "/downloads/ship-checklist.md",
    description: "The review, test, deploy, and rollback gate before anything reaches production.",
    lesson: "/learn/09-capstone/qa-ship-and-rollback",
    devPackOnly: true,
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
    a: "Not yet. The written lessons are complete and are the course. We are recording original walkthroughs now, and they will be added to the relevant lessons as they ship, included at no extra cost, because they are lessons you already bought presented another way, not new material. We would rather ship no video than someone else's video.",
  },
  {
    q: "Will this go out of date?",
    a: "Parts of it, constantly, Claude Code ships changes weekly. That is why every factual lesson links to the official docs and carries a last-verified date, and why updates are included for life. Lessons were last verified against the official documentation on " + LAST_VERIFIED + ".",
  },
  {
    q: "What experience do I need?",
    a: "For the board path, none. It starts with an empty folder and assumes you have never written a line of code. The Dev Pack is the other half, and that one does assume you can read code and use a terminal.",
  },
  {
    q: "I already use ChatGPT every day. Why do I need this?",
    a: "Because ChatGPT cannot start work without you. It waits for you to open it, and it cannot read or write the files your business actually lives in. This teaches you to build something that runs on a schedule against your real numbers and hands you a decision when you sit down. If what you want is a better chat, keep the one you have. This is for when you want work to happen on days you never log in.",
  },
  {
    q: "Is this only for one AI tool?",
    a: "No. The system is a folder of markdown files and a schedule, so it runs on any agent that can read your folder and act on a schedule. The lessons are written and verified against one implementation so the instructions are concrete rather than vague, and each one names the capability it needs so you can map it onto whatever you use.",
  },
  {
    q: "Will this still be right in six months?",
    a: "That is the actual product. These tools change weekly, so the course carries a verification date, the corrections are published rather than quietly patched, and you can check the date before you buy. It has already caught its own stale correction once: a note saying a command had been removed, when the command had come back.",
  },
  {
    q: "Do I need to use a terminal?",
    a: "No. The Desktop app is the recommended way in, and it looks like an ordinary application. The terminal is one of three doors and the board path never requires it. If you want to use it, the Dev Pack covers it properly.",
  },
  {
    q: "What is the Dev Pack?",
    a: "The developer half of the material: working with real codebases, debugging, tests, Git, stack-specific tactics, and the full capstone build. It is a separate add-on rather than part of the course, because a solopreneur building a board should not be paying for lessons about SQL indexes.",
  },
  {
    q: "What about the live Build Lab?",
    // Said "that is the only thing on sale" — true until the Lab got a price.
    // Kept the useful half: the course does not depend on the Lab.
    a:
      "It is a separate, live, one-off session, we build one real feature end to end and you watch every decision, including the ones that go wrong. It is not scheduled yet, so there is a waitlist rather than a date, and the waitlist costs nothing. The $97 course is self-paced, complete on its own, and does not depend on the Lab.",
  },
  {
    q: "Can I get a refund?",
    a: "Email " + BRAND.supportEmail + " within 14 days and we will refund you. No form to fill out and no questions designed to talk you out of it.",
  },
];

// ── The Dev Pack (off-ladder add-on) ─────────────────────────────────────────

/**
 * The developer curriculum, sold separately from the board course.
 *
 * DELIBERATELY NOT A LADDER RUNG. The ladder is what a solopreneur climbs, and
 * their next step after building a board is the Kit, not learning Next.js and
 * SQL. Putting this on the ladder would imply beginners graduate into writing
 * software, which is precisely the mistake that made the original course
 * unsellable to the people who were actually asking for it.
 *
 * $97 is the price the market has already seen for this material, which is what
 * makes it a clean story: the course got cheaper and narrower, and the
 * developer content kept its price as an add-on.
 *
 * `available: false` until NEXT_PUBLIC_STRIPE_DEV_PACK_PRICE_ID exists. The
 * checkout route reads this flag, so the config is the release gate and hiding
 * the button is only presentation.
 */
export const DEV_PACK = {
  id: "dev-pack",
  name: "The Dev Pack",
  promise:
    "The developer curriculum: the disciplined agentic coding workflow, on real code in real stacks.",
  forWho: "You write software too, and you want an AI workflow you can defend in review.",
  priceDisplay: "$97",
  priceCents: 9700,
  priceIdEnvVar: "NEXT_PUBLIC_STRIPE_DEV_PACK_PRICE_ID",
  available: false,
  href: "/ladder#dev-pack",
  ctaLabel: "Add the Dev Pack, $97",
  kind: "onetime" as const,
  includes: [
    "Working with files, real dev workflows, and stack-specific tactics",
    "The full guided capstone build, start to finish",
    "Code review, testing, and git discipline with an agent",
    "Everything unlocks inside the course you already have",
  ],
} as const;

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
      "Build your own AI board: a few narrow assistants that read your real numbers on a schedule and hand you a meeting you can act on. No coding.",
    forWho:
      "You run something small and you are tired of AI that only works when you are sitting in front of it.",
    kind: "onetime",
    // Derived from PRODUCT for the same reason — the course is live and
    // selling; its price must not be able to disagree with itself.
    priceDisplay: PRODUCT.priceDisplay,
    priceCents: 9700,
    priceIdEnvVar: PRODUCT.priceIdEnvVar,
    available: true,
    href: "/#pricing",
    ctaLabel: "Get the course, $97",
    includes: [
      "The board path, from an empty folder to a scheduled run",
      "The four files your board reads, with worked examples",
      "How to tell a useful run from a plausible one",
      "Lifetime access, and corrections whenever the tools move under a lesson",
    ],
  },
  {
    id: "kit",
    rung: 2,
    name: "The Operating Company Kit",
    // BOUNDARY, and it needs to stay sharp. The course now teaches the whole
    // system, so "the agents and the templates" would be selling what someone
    // already bought. The line is: the course is how to write it, the Kit is
    // mine, filled in, plus three months of it actually running. The archive is
    // the part that cannot be taught in prose and cannot be copied.
    promise:
      "My board, filled in: four more seats with the reporting lines between them, the real playbooks, and three months of meetings it actually produced.",
    forWho:
      "You have one seat running and you want the org, plus the archive of someone else's board working and getting things wrong.",
    kind: "onetime",
    priceDisplay: "$297",
    priceCents: 29700,
    priceIdEnvVar: "NEXT_PUBLIC_STRIPE_KIT_PRICE_ID",
    available: false,
    href: "/ladder#kit",
    ctaLabel: "Get the Kit, $297",
    includes: [
      "Four more seats, pre-chartered, with the reporting lines between them",
      "The five real playbooks, not templates to fill in",
      "The query-pack pattern: locked queries so a number cannot be improvised",
      "The archive: real board meetings and the full decision log, redacted",
      "Corrections included. You see where the board was wrong and how it noticed",
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
      "Your board stays current, and you watch mine run. Every month: the archive of a real board working on a real business, and the updates that keep your copy true as the tools move.",
    forWho:
      "You have a board running and you would rather not be the one maintaining it.",
    kind: "recurring",
    /**
     * $29, not $49.
     *
     * REPRICED before launch. With zero customers, retention matters far more
     * than revenue per customer: a $29 someone keeps for a year beats a $49 they
     * cancel in month two, and raising a price later is easy while lowering one
     * is a signal. This buyer is also already paying an AI provider on top of
     * the course.
     *
     * NOT SOLD AT CHECKOUT, deliberately. The constraint today is the first
     * sale, not ARPU, and attaching a subscription to the $57 adds friction at
     * the exact moment we can least afford it. This is sold after a board is
     * running, from the final lesson and the dashboard, where "keep it current"
     * means something. Revisit the whole recurring question when there is
     * evidence rather than a theory.
     */
    priceDisplay: "$29/mo",
    priceCents: 2900,
    priceIdEnvVar: "NEXT_PUBLIC_STRIPE_BOARD_ROOM_PRICE_ID",
    available: false,
    href: "/ladder#board-room",
    ctaLabel: "Join the Board Room",
    includes: [
      "My board's meetings each month, redacted, corrections included",
      "The freshness report: what changed in the tools and what it breaks",
      "Template and playbook updates as they ship",
      "The shared configs library, once there are members to fill it",
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

// ── Board artifacts ──────────────────────────────────────────────────────────

/**
 * The files a student ends up holding, and the lesson that produces each.
 *
 * This exists so the dashboard can show what someone has BUILT rather than only
 * what they have read. The product's promise is that the pieces accumulate into
 * a working system; a lessons-completed counter does not show that, and a list
 * of files on disk does.
 *
 * Lives in config rather than lesson frontmatter deliberately: it is a small
 * fixed set, and keeping it here avoids a frontmatter key that every future
 * lesson would have to think about.
 */
export interface BoardArtifact {
  /** Path inside the student's board folder. */
  file: string;
  /** What it holds, in a few words. */
  purpose: string;
  /** Lesson route that produces it. */
  lesson: string;
}

export const BOARD_ARTIFACTS: readonly BoardArtifact[] = [
  { file: "GOALS.md", purpose: "Floors, and what you ruled out", lesson: "/learn/00-start-here/your-workspace" },
  { file: "METRICS.md", purpose: "Numbers, each with its source", lesson: "/learn/00-start-here/your-workspace" },
  { file: "DECISION-LOG.md", purpose: "Choices and what would reverse them", lesson: "/learn/00-start-here/your-workspace" },
  { file: "PIPELINE.md", purpose: "Who is in play, honestly", lesson: "/learn/00-start-here/your-workspace" },
  { file: "ceo/CHARTER.md", purpose: "Who your first seat is", lesson: "/learn/21-seats/the-charter" },
  { file: "README.md", purpose: "The index your board reads first", lesson: "/learn/20-memory/the-five-tiers" },
  { file: "memory/CANDIDATES.md", purpose: "What it proposes, for you to promote", lesson: "/learn/20-memory/the-five-tiers" },
  { file: "ceo/PROMOTION-LADDER.md", purpose: "What it must earn the right to do", lesson: "/learn/21-seats/promotions" },
  { file: "BOARD-MEETINGS/", purpose: "Dated archive, one file per run", lesson: "/learn/10-professional-practice/your-first-board-week" },
] as const;
