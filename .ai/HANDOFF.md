# Handoff — 2026-08-28 · AI board built, system modules written, page repositioned

**Branch:** `feat/board-track`, 10 commits, **NOT pushed.** `npm run check` exit 0.

## The direction that changed

The course is no longer "learn Claude Code." It is **build AI board employees**:
tool-agnostic in concept, verified against one implementation. Students will fork
a GitHub template whose onboarding interview fills in their charter; the course
teaches what is happening under the hood so they can run and extend it.
**Maintenance is the product** — a cron proposes course updates, Terry approves.

## Phase 1 — the board (done)

`docs/business/ceo/` now runs this business and is the case study the curriculum
teaches from. Ported from the crcst structure: `README.md` (memory index, five
tiers, rotation rule), `CHARTER.md` (L1, drafts only), `GOALS.md` (floors),
`METRICS.md` (every row carries its source), `PROMOTION-LADDER.md`,
`PLAYBOOKS/WEEKLY.md` (encodes the freshness pass), `DECISION-LOG.md` with the
Rank column, `CHAIRMAN-NOTES.md`, `memory/{CANDIDATES,LEARNINGS}.md`.

First board meeting filed: `BOARD-MEETINGS/2026-08-27.md`. Its headline is that
the product is finished enough to sell and structurally unable to take money.

## Phase 2 — the course (core done)

- **`20-memory`** (3 lessons) closes the gap Terry caught. Four flat files are
  not a memory system; evidence is crcst measured today (56KB decision log,
  150KB across five files, a SHIPPED file split by date by hand). Five tiers,
  reading order, and the candidates/learnings split with the two-run rule.
- **`21-seats`** (3 lessons): charter, floors-not-targets, promotions.
- `check-content.mjs` gained ONE narrow escape, `teaches: <tool>`, so a lesson
  whose job is teaching git gently is exempt from the no-code sweep. Greppable.

**64 lessons / 13 modules. Board 26/8, developer 50/10.**

## Phase 3 — marketing (done)

- **Conversion bug:** the page advertised 64 lessons; a buyer gets 26. Fixed.
- **Hero overclaim:** "runs while you are not looking" contradicted our own
  scheduling lesson. Now "on a schedule, not on your memory."
- **Prerequisite moved above the buy button.** The paid-plan requirement was
  only visible after checkout.
- **Three unanswered objections answered**, including "I already use ChatGPT",
  which appeared zero times across the entire product before today.
- **`MaintenanceSection`** renders `LAST_VERIFIED`, so the page cannot claim
  freshness the codebase lacks.
- **Kit boundary redrawn:** it was selling what the course now teaches.

Verified live at 1440px and 390px: 0 contrast failures, 0 em-dashes, no
horizontal scroll, prices consistent.

## 🔴 Blocking the first sale (Terry only)

1. **Create the $57 Stripe price**, update `NEXT_PUBLIC_STRIPE_PRICE_ID`.
   Checkout asserts the amount and returns 503 until it exists. Nothing sells
   until this is done.
2. Apply `20260826120000_ladder_entitlements.sql` before selling Dev Pack or Kit.
3. by-design-ai `lib/education.ts` still says "Claude Code Class" and `$297`.
4. `docs/content/WEEK-01.md` still describes the retired $97 positioning.
   Do not let Cris post it.

## Open decisions

- Template repo name and home (blocks writing the fork/onboarding lessons)
- Pricing shape: $57 including 3 months, converting to $49/mo?

## Not done

- The onboarding interview itself, which is the highest-leverage artifact left
- Modules for the meeting, schedules, commands, review loop, and real-data
- The 8 planned demotions of `both` lessons to `developer`
- Redaction policy and gate, required before any real board excerpt ships

---

# Handoff — 2026-08-27 · Repositioned for beginners: board course + Dev Pack

**Active task:** Reposition Claude Code AI from a developer course to a board
course for non-technical solopreneurs, with the developer material sold as an
add-on. Plan approved by Terry; full plan at
`~/.claude/plans/generic-brewing-cerf.md`.

**Branch:** `feat/board-track` off `main`. 6 commits. **NOT merged, NOT pushed.**

## Why

An audit of all 49 lessons found only **6 a non-coder could complete
unmodified**, and 19 (modules 03/04/06/09) that exist purely to exercise the
workflow on source code. `lib/course-config.ts` literally told the actual buyer
to leave: *"Complete beginners who have never written code, learn programming
fundamentals first."* That line was accurate about the material, which is why
this was a product change and not a copy change.

## Decisions (Terry)

- Beginner-only product; developer content sold as an add-on rather than archived
- Board course **$57**, Dev Pack **$97 off-ladder** (not a rung: a solopreneur's
  next step is the Kit, not Next.js)
- Full homepage redesign, lighter and warmer

## What shipped

**Tracks.** Every lesson declares `track: board | developer | both` in
frontmatter. `getAllModules/getAllLessons/getAdjacentLessons` take an optional
track and are byte-identical without one. Fail open at runtime (missing track
reads as `both`), fail closed at build.

**Content.** 8 new lessons. New `00-start-here` module (7 lessons) including
`02-your-workspace`, which fixes the hard stop the audit found: a non-coder has
no project directory, so theirs is a folder holding their business.
`00/07-permission-and-safety` was added because a beginner pointing an
autonomous agent at business files on a schedule needs it.
`08/07-scheduled-runs` had been **missing for everyone** and was the reason
10/06's module-08 reference dangled.

**Enforcement.** `check-content.mjs` fails the build on a code fence, git
command, package manager, or "cd into your project" in any board-path lesson.
"No coding required" is now a build guarantee, not a marketing claim.

**Dev Pack.** Gated in the lesson server component via an early return, so
locked content is never serialised to the client. Reuses the existing
`ccc_entitlements` machinery. `entitlementStatus()` is tri-state: a **missing
table returns "ungated"**, because a boolean would have locked all 50 developer
lessons for every existing purchaser the moment this deployed.

**Design.** Light warm theme by inverting the token ramp. A scripted contrast
audit found 18 WCAG failures including **the buy button at 2.21:1**; all fixed
and verified at 0 failures on desktop and mobile.

## Checks run

- `npm run check` exit 0 at every phase boundary; production build 17 routes
- `npx tsc --noEmit` clean throughout
- Counts: **58 lessons / 11 modules. Board 20/6, developer 50/10**
- Negative tests: invalid `track` exits 1; a git command in a board lesson exits 1
- Live audit at 1118px and 390px: 0 contrast failures, no horizontal scroll,
  0 em-dashes, old exclusion string absent from the DOM
- Production queried with the anon key: `ccc_entitlements` returns PGRST205, so
  the Dev Pack gate is "ungated" and nobody is locked out
- Routes on :3100 — `/` `/ladder` `/proof` `/build-lab` 200, `/dashboard` 307

## 🔴 BLOCKING before this can sell

1. **Create the $57 Stripe price** and update `NEXT_PUBLIC_STRIPE_PRICE_ID`.
   The checkout now asserts the live amount against `PRODUCT.priceCents` and
   returns 503 on mismatch. **Until the price exists, course checkout refuses.**
   That is deliberate: a page advertising $57 must never charge $97. It also
   means the course is NOT sellable until you do this.
2. Apply `20260826120000_ladder_entitlements.sql` (now includes `dev-pack`)
   before selling the Dev Pack or the Kit, then grandfather `dev-pack` rows for
   the two existing accounts.
3. Create the Dev Pack Stripe price, set `NEXT_PUBLIC_STRIPE_DEV_PACK_PRICE_ID`,
   flip `DEV_PACK.available`.
4. Lab reprice needs its Stripe price and `ccc_lab_sessions` row at 49700.
5. Cross-repo: by-design-ai `lib/education.ts` still says "Claude Code Class"
   and `$297`. Three descriptions of one product until fixed.

## Not done

- Downloadable board file templates (embedded inline in lesson 02 instead)
- No real imagery added; lessons still use Unsplash covers (pre-existing warning)
- `docs/content/WEEK-01.md` still describes the $97 developer positioning and
  needs a rewrite before Cris posts it

## ⚠️ Note for Terry

While restarting the dev server I ran `pkill -f "next dev"`, which may have
stopped a dev server for another project. I also found a **service worker from
the ATS site cached on localhost:3000** serving its shell over this app, which
is why this session's server moved to **port 3100**. Worth clearing that service
worker if localhost:3000 behaves oddly in future.

**Next step for Terry:** review, then decide on merge + push. Not done here.

---

# Handoff — 2026-08-26 (2) · The aixdesign ladder

**Active task:** Build the full ladder business model, wire Stripe for every
rung, bridge the course up the ladder, ship a public dashboard, rebrand to
Claude Code AI, and produce week-1 content for Cris.

**Branch:** `feat/aixdesign-ladder` off `main`. NOT merged, NOT pushed.

## What shipped

**The ladder (`lib/course-config.ts`)** — `LADDER` is now the single source of
truth for what is sold and in what order: 1 Course $97 → 2 Kit $297 → 3 Build Lab
$497 → 4 Board Room $49/mo → 5 Install (application). Course and Lab rungs DERIVE
their price from `PRODUCT` / `BUILD_LAB` so no rung can disagree with the number
checkout asserts against.

**Build Lab repriced $297 → $497.** It could not stay level with the Kit once the
Kit occupied $297, and its promise grew (stand up your own operating company,
live, Kit included). `BUILD_LAB` remains the charge authority. Changing it needs
this line + a new Stripe price + the `ccc_lab_sessions` row.

**Stripe, all rungs** — new `POST /api/ladder/checkout` handles the entitlement
rungs, fail-closed in order: signed in → known rung → `available` flag → price id
configured → live Stripe price matches config → mode matches `kind`. Webhook now
branches to `grantEntitlement` for kit/board-room AND handles
`customer.subscription.updated|deleted`, without which a cancelled Board Room
would grant access forever. Course and Lab checkout paths untouched.

**`ccc_entitlements`** (`supabase/migrations/20260826120000_ladder_entitlements.sql`)
— SELECT-own-rows only, no write policy at all, grants revoked. Follows the
course_purchases security migration precedent.

**The conversion hole is closed.** Before today the Build Lab CTA existed in
exactly 4 files, all under `components/marketing` (pre-purchase). Someone who
finished all 48 lessons was offered nothing. New `LadderNext` component now
renders on the dashboard and at the end of the FINAL lesson (`next === null`).

**Course bridges into the ladder** — new lesson
`10-professional-practice/06-your-ai-operating-company.mdx` (49 lessons now).
Assembles module 08's subagents + scheduling + context discipline into the
operating-company idea the Kit delivers. Includes an explicit "what this does
not do" section.

**`/proof` — public dashboard.** Live counts read per request via `lib/proof.ts`.
Every number is counted from a table or the filesystem; a failed read renders
"not available", never 0, because those mean opposite things. Verified live:
49 lessons, 10 modules, **2 students enrolled**, 1 lesson completed, 0 on the Lab
list.

**`/ladder` page** — the whole model as a vertical spine, not equal pricing
columns. Unavailable rungs render as steps, never as CTAs with invented dates.

**Rebrand** — `BRAND.name` is now "Claude Code AI". Four UI files had the name
HARDCODED (dashboard, sign-in, sign-up, LessonLayout); all now read from config.
Nav anchors fixed from bare `#pricing` to `/#pricing` (they scrolled nowhere on
/build-lab, /ladder, /proof) and Ladder + Numbers added.

**`docs/content/WEEK-01.md`** — 7 days of posts for Cris, with an approved-facts
block and explicit bans (no income claims, no fake scarcity, no invented numbers).

## Checks run

- `npm run check` → **exit 0** (49 lessons, 10 modules, 5 downloads; production
  build passes, **17 routes**, no type errors)
- `npx tsc --noEmit` → exit 0 at every step
- Dev server route probe: `/` 200, `/ladder` 200, `/proof` 200, `/build-lab` 200,
  `/dashboard` 307 → sign-in (correct when signed out)
- `/proof` inspected live and returns real counts, not placeholders

## NOT done — read before selling anything

1. **No Stripe prices exist for the Kit or Board Room.** `NEXT_PUBLIC_STRIPE_KIT_PRICE_ID`
   and `NEXT_PUBLIC_STRIPE_BOARD_ROOM_PRICE_ID` are unset, and both rungs are
   `available: false`. Nothing can be bought. To open one: create the Stripe
   price, set the env var, flip `available`, apply the migration.
2. **The migration is NOT applied.** Apply it with the procedure in
   `docs/PAYMENT-GATE-SECURITY.md` before either rung goes live.
3. **The Build Lab reprice needs its Stripe price and `ccc_lab_sessions` row
   updated to 49700** or Lab checkout will refuse (by design).
4. **Cross-repo brand sync:** by-design-ai `lib/education.ts` still says
   COURSE_NAME = "Claude Code Class" and `$297` for the Lab. Both now disagree
   with this repo. Fix before the next marketing push.
5. **Homepage hero not redesigned.** New surfaces (/ladder, /proof) are modern;
   the existing landing page was left alone to avoid touching a page that is
   converting.
6. **Subscription proration/refund handling** beyond status changes is not built.

**Next step for Terry:** review, then decide on merge + push. Not done here.

---

# Handoff — 2026-08-26 · Freshness pass on the Claude Code fact base

**Active task:** Re-verify the curriculum against code.claude.com/docs before any marketing
push. Requested by Terry after 40 days untouched (`LAST_VERIFIED` was 2026-07-16).

**Goal:** Make sure nothing the course teaches is false today, so traffic can be driven to
claudecodeclass.com without the product looking dated.

**What changed**
- `docs/CLAUDE-CODE-FACTS-2026-07-16.md` → `docs/CLAUDE-CODE-FACTS.md` (git mv). The dated
  filename forced a rename on every re-verification; the date now lives in the header and in
  `LAST_VERIFIED`. Refs updated in `CURRICULUM-V2-MAP.md` and `LAUNCH-READINESS.md`.
- **Corrected a correction that had gone stale:** the July pass recorded "`/cost` no longer
  exists." Current docs list `/cost` as an alias for `/usage`. No lesson asserted it (only the
  fact base did), so no lesson needed the fix — the truth-rule design held.
- **Biggest real drift — starting permission mode.** On Pro/Max/Team, recent versions start
  sessions in **auto mode**, not Manual. The curriculum told learners they start in Manual.
  Fixed in `01-getting-started/05-permission-modes.mdx`: new "Which mode you start in"
  section, corrected Shift+Tab cycle (from auto, first press → default), corrected `plan` row
  (now "reads, plus classifier-approved commands when auto mode is available"), and a
  startup-precedence callout.
- **Free-plan blocker added.** Docs now state the free Claude.ai plan does not include Claude
  Code access. Added as a warning callout in `01-getting-started/02-accounts-and-login.mdx`.
- **`claude auth login|logout|status`** documented in the same lesson (scriptable login).
- Fact base: expanded shell-command surface (`claude update`, `install`, `doctor`, `agents`,
  `attach`, `logs`, `stop`, `respawn`, `rm`, `daemon status`, `ultrareview`, `gateway`,
  `import`, `remote-control`); re-verified slash commands; added a table of newly documented
  commands as curriculum candidates (`/fast`, `/rewind`, `/branch`, `/fork`, `/background`,
  `/artifacts`, `/btw`, `/powerup`, `/autofix-pr`); listed bundled skills; noted npm now needs
  Node 22+ (native install unaffected); flagged `/usage-credits` and `/schedule` as no longer
  in the documented command list.

**Checks run:** `npm run check` → **exit 0**. `check:content` passed (48 lessons, 10 modules,
5 downloads); production build passed, 14 routes, no type errors.

**Git:** branch `chore/aixdesign-rebrand`, **10 commits ahead of `main`**. All changes are
UNCOMMITTED in the working tree. Nothing committed, pushed, or deployed.

**Decisions**
- Undated fact-base filename, to stop rename churn on every re-verification.
- Verified scope was install/setup, auth, permission modes, and the command surface — where
  falsifiable claims concentrate. Skills frontmatter and `$ARGUMENTS` spot-checked and still
  correct.

**Not done / risks**
- **Not re-verified line by line:** hooks, MCP, subagents, plugins (modules 08). No known
  drift, but not audited this pass.
- New commands are recorded in the fact base as *candidates* — no lessons written for them.
  `/rewind` and `/fast` are the two most worth adding for beginners.
- `main` is 10 commits behind the live branch. A routine deploy from `main` would roll the
  offer back. Reconcile before driving traffic.

**Next step for Terry:** review the diff, then decide on commit + merge to `main`. Not done
here — standing rule is no commits/pushes/deploys without an explicit ask.

---

# Handoff log — newest first

<!-- Two auto-generated stubs from 2026-07-17 00:36 and 07:32 were collapsed into
     this entry. Both were unfilled (every section still said "TODO"), so no
     information was lost; the work they were meant to describe is covered below. -->

---
## Handoff — 2026-07-17 (Phases 5 + 6 complete)

- Repo: /Users/terry/code/micro-course-saas-template
- Branch: `chore/aixdesign-rebrand` (10 commits, pushed, tree clean)
- Last commit: `cb77670 feat(build-lab): Stripe checkout for Lab seats, shipped cold`
- Sibling repo: /Users/terry/code/by-design-ai- on `feat/coaching-and-intel`
  (4 commits, pushed) — last: `f923800 feat(education): point the live-lab blocks
  at the Build Lab waitlist`

### Active task
Rebrand the Claude Code course to AI by Design and build the Build Lab funnel
(waitlist now, checkout when dated). Plan: `~/.claude/plans/tidy-exploring-kahn.md`.
Phases 0–6 are done. Phase 7 (the flip) is Terry's, deliberately.

### What changed this session
- **Phase 5 — Build Lab Stripe checkout, shipped cold.**
  - New `app/api/build-lab/checkout/route.ts`. A *second* route, not a branch in
    `/api/stripe/checkout` — that one sells the live $97 course, and a product
    switch there would put Lab bugs in front of course revenue.
  - Guards cheapest-first: config gate → db gate (real date + price + free seat)
    → auth → already-registered (scoped to the run) → price drift across
    config/row/Stripe. Drift refuses rather than charging a surprise.
  - `lib/build-lab.ts` gained `recordLabRegistration()`; `lib/stripe.ts` gained
    `getLabCheckoutConfig()` (separate price id, so a missing Lab price can never
    break course checkout).
  - Webhook: **purely additive, zero deleted lines**, course path byte-identical.
    One branch on `session.metadata?.product ?? "course"`.
  - New `components/marketing/LabBuyButton.tsx` wired into `/build-lab`'s `open`
    branch, so Phase 7 stays a pure config flip.
- **Phase 6 — aixdesign education surface.**
  - `LIVE_LAB_NAME` → `'The Build Lab'`; added `labWaitlistUrl()`.
  - Both "no date, no price, no way to buy it" blocks rewritten — a price and a
    waitlist now exist, so that copy was false on two of three counts.
  - Retired the merged `feat/claude-code-course-integration` worktree + branch
    (verified clean, no unpushed commits; used `git branch -d` so it would refuse
    if unmerged).

### Checks run — exact results
- `npm run check` (course repo): **passes**. Content checks pass; 35 non-blocking
  warnings. `npm run build` (aixdesign): **compiled successfully**.
- **Webhook verification, 6/6 passing.** Local server + locally-signed payloads;
  **no Stripe API calls**, because `.env.local` holds an `sk_live` key and a real
  checkout would be a real charge. Throwaway user; prod rows deleted after.
  - legacy session with **no `product` metadata → course granted** (the
    regression that matters most: in-flight customers must not pay and get
    nothing)
  - `product=build-lab` → seat recorded (29700 usd), `course_purchases` untouched
  - replay same stripe session id → no double-book (still 1 seat)
  - second payment, new session id → 200 + `DOUBLE PAYMENT … needs a REFUND` log,
    no retry wedge
  - `payment_status=unpaid` → no seat; forged signature → 400
  - `POST /api/build-lab/checkout` → **503** while `status='waitlist'` (cold ✓)
- **Prod DB back to baseline**: `course_purchases` 2, `ccc_lab_registrations` 0,
  `ccc_lab_waitlist` 0, no leftover test users, run still `waitlist`.

### Decisions made
- Lab checkout is a separate route + separate button from the course path. The
  duplication is the cheaper risk.
- Double payment (same user, same run, two stripe sessions) returns **200**, not
  500. Retrying cannot fix it and would wedge Stripe's queue; the log is what
  gets a refund issued.
- No price on the aixdesign repo — the course repo owns that number.

### Findings worth knowing
- **Nobody has ever bought the course.** Stripe has exactly one checkout session
  ever (2026-04-16, `unpaid`). Both `course_purchases` rows are
  `manual_admin_grant` and `manual_qa_20260716` (Terry's own account + a QA
  account). Docs describing the course as "live and selling" are wrong — it is
  live and has never sold. This makes the Phase 5 rollout risk far lower than the
  plan assumed.
- **The Vercel env newline scare is dead.** All 8 stored Vercel values are
  **clean** (read back via the API). The literal `\n` existed only in the local
  `.env.local` and broke local dev only; prod was never affected. Stripped it
  locally (file is gitignored; backup in the session scratchpad). Prod
  `/api/stripe/checkout` returns a clean 401, proving the Supabase client builds
  fine there.

### Blockers / warnings
- 🔴 **DEPLOY ORDER**: `claudecodeclass.com/build-lab` is a **404** on prod today.
  aixdesign's new waitlist links point at it. The course branch must merge and
  deploy **before** the aixdesign education changes go to production.
- ⚠️ `.env.local` holds an **`sk_live`** key, not a test key. Never drive a real
  checkout locally.
- Neither branch is deployed. Both sites are unchanged in production.
- `NEXT_PUBLIC_STRIPE_BUILD_LAB_PRICE_ID` does not exist yet anywhere — it is
  created as part of Phase 7.
- Still open (small): no OG image (twitter card declared but broken); favicon is
  still the Next default; `.ai/` untracked in aixdesign.

### Exact next step
Terry's call between:
1. **Review the two pushed branches / preview deploys**, then merge the course
   branch first (see DEPLOY ORDER above).
2. **Phase 7 — the flip** (Terry's; needs real inputs): create the live Stripe
   price → set `NEXT_PUBLIC_STRIPE_BUILD_LAB_PRICE_ID` → `UPDATE
   ccc_lab_sessions SET status='scheduled', starts_at=…, capacity=…,
   stripe_price_id=…, price_cents=29700 WHERE slug='founding-run'` → set
   `BUILD_LAB.status:'scheduled'` + `dateDisplay` in `lib/course-config.ts`.
   A CHECK constraint refuses a 'scheduled' run without a real date, price, and
   capacity. Revert = set config back to `'waitlist'`.
3. **Task #9** — harden sibling tables (`lesson_progress`, `quiz_results`,
   `user_course_state`): same USING-without-WITH-CHECK pattern as the
   `course_purchases` hole. Low harm, own migration.

<!-- AUTO-STATE (regenerated by claude_handoff.sh — safe to ignore, safe to delete) -->

_Current repo state, refreshed automatically. This block is replaced, never appended —
it is not a handoff. Real checkpoints live above, newest first._

- Updated: 2026-08-28 11:34:13 EDT
- Branch: main
- Last commit: 9215790 fix(proof): count what the course includes, not what the repo contains
- Working tree: clean

<!-- END AUTO-STATE -->
