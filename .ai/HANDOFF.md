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
