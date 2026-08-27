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

- Updated: 2026-08-26 23:32:12 EDT
- Branch: feat/aixdesign-ladder
- Last commit: a85d3c7 feat(ladder): full aixdesign ladder, Stripe for every rung, public dashboard
- Working tree: 2 uncommitted file(s)

<!-- END AUTO-STATE -->
