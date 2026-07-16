# Claude Code Class V2 + AI by Design Integration Plan

> **For Hermes:** Use Claude Code in bounded non-interactive runs, then independently inspect diffs and run builds/browser QA. Do not deploy production or publish pricing without Terry's review.

**Goal:** Modernize Claude Code Class into a truthful, current, hands-on AI by Design education product; secure its purchase gate; create a practical video-recording plan; and add a reviewable course/workshop path to AI by Design.

**Architecture:** Keep `claudecodeclass.com` as the course delivery application. Add an “An AI by Design course” identity and refreshed sales page there. Add a separate public education/course route in the AI by Design site that explains the self-paced course and planned live Build Lab, then sends buyers to the course platform. Do not duplicate the LMS or payment system inside AI by Design.

**Tech Stack:** Next.js 16, React 19, MDX, Supabase Auth/Postgres/RLS, Stripe Checkout, Vercel; AI by Design uses Next.js 14.

---

## Constraints and truth rules

- Do not deploy either site to production in this sprint.
- Do not send email, open paid registration, or create a live workshop date.
- Do not use the 35 existing YouTube videos as owned course media; Terry confirmed he does not have permission.
- Remove video embeds from paid lessons until Terry-owned replacements exist. Preserve a structured recording inventory instead.
- Remove unverified testimonials, earnings promises, “10x” promises, and unsupported outcome guarantees.
- Add: “Independent educational product by AI by Design. Not affiliated with or endorsed by Anthropic.”
- Use current official Claude Code concepts: native installation, account login, terminal/IDE/desktop/web surfaces, permission modes, sessions, CLAUDE.md, Skills, hooks, MCP, subagents, agent teams, plugins, code intelligence, CI/CD, and safe verification.
- Do not fabricate screenshots, student counts, sold-out dates, testimonials, or corporate logos.
- Keep the live workshop framed as “planned” or “coming soon” until Terry sets a date and approves checkout.
- Preserve unrelated uncommitted AI by Design work by using an isolated git worktree from `origin/main`.

## Phase 1: Course platform trust, security, and sales-page refresh

### Task 1: Create current product configuration

**Files:**
- Create: `lib/course-config.ts`
- Modify: `app/layout.tsx`
- Modify: `app/(marketing)/page.tsx`

**Work:**
- Centralize product name, self-paced price display, AI by Design attribution, disclaimer, support language, and course curriculum summary.
- Refresh the sales page around a concrete outcome: learning the inspect → plan → build → review → test → ship workflow.
- Add honest sections: who it is for, who it is not for, current curriculum, included templates/labs, workshop waitlist/coming-soon block, FAQ, independent-product disclaimer, and last-updated indicator.
- Remove unverified testimonials and unsupported speed/income claims.
- Keep the existing Stripe purchase button for the self-paced product but do not add a workshop product or price.

**Verification:**
- `npm run build`
- Browser check `/` at mobile and desktop widths.
- Text scan confirms no unverified testimonial names and no “10x” promises.

### Task 2: Secure purchase gating

**Files:**
- Modify: `course-schema.sql`
- Create: `supabase/migrations/20260716124800_secure_course_purchase_rls.sql`
- Modify: `app/api/stripe/checkout/route.ts`
- Modify: `app/api/stripe/webhook/route.ts`
- Create: `docs/PAYMENT-GATE-SECURITY.md`

**Work:**
- Replace broad `FOR ALL` policy on `course_purchases` with authenticated-user `SELECT` only.
- Explicitly revoke/deny client insert, update, and delete paths; service-role webhook remains the sole grant path.
- Validate required Stripe environment configuration before creating sessions or verifying webhooks.
- Make webhook purchase upsert idempotent and record Stripe customer/payment identifiers where schema permits without breaking existing rows.
- Document a deterministic bypass test proving an authenticated client cannot self-grant access.
- Do not apply the migration to production in this sprint.

**Verification:**
- `npm run build`
- SQL review confirms no authenticated write policy exists for `course_purchases`.
- Checkout/webhook routes fail safely when required configuration is absent.

### Task 3: Remove unlicensed lesson videos and create the recording system

**Files:**
- Modify: `lib/content.ts` or lesson rendering components as needed so empty `videoUrl` is handled cleanly.
- Modify: all `content/modules/**/*.mdx` to remove third-party `videoUrl` values.
- Create: `docs/VIDEO-RECORDING-PLAN.md`
- Create: `docs/VIDEO-TRACKER.csv`
- Create: `docs/recording/LESSON-RECORDING-TEMPLATE.md`

**Work:**
- Remove all 35 third-party YouTube embeds.
- Group Terry-owned replacement recordings into a smaller essential set rather than requiring 35 videos before launch.
- For each essential video provide: objective, screen setup, demo repo/state, exact beats, target duration, required visual proof, and matching lesson(s).
- Provide a low-reading recording workflow using Screen Studio, Loom, QuickTime, or OBS; recommend one default.
- Include naming, aspect ratio, audio, caption, upload, thumbnail, and lesson-embedding conventions.

**Verification:**
- Content search finds no `youtube.com/watch` in `content/modules`.
- Course still builds and lessons render without media gaps.

## Phase 2: Curriculum V2 structure and hands-on assets

### Task 4: Add current Claude Code V2 modules

**Files:**
- Create/update MDX lessons under `content/modules/`.
- Modify curriculum metadata on `app/(marketing)/page.tsx` or shared config.
- Create: `docs/CURRICULUM-V2-MAP.md`

**Work:**
- Correct outdated native installation and authentication guidance.
- Remove model-version-specific guidance and stale cost tables unless tied to an official current source and date.
- Add practical coverage for permission modes, session management, Skills, hooks, MCP, subagents, agent teams, plugins, code intelligence, remote/web/desktop/IDE surfaces, and CI/CD.
- Preserve strong existing lessons on context, review, testing, Git, security, and stack-specific workflows after fact-checking.
- Add “official documentation may change” notes and current source links.

**Verification:**
- No references to Claude 3.5 or 3.7.
- No lesson says an API key is required for every learner.
- Native installer and login approach match current official docs.
- Build passes.

### Task 5: Add one standardized capstone and downloads

**Files:**
- Create: `content/modules/09-capstone/*.mdx`
- Create: `public/downloads/claude-md-template.md`
- Create: `public/downloads/build-brief-template.md`
- Create: `public/downloads/preflight-checklist.md`
- Create: `public/downloads/ship-checklist.md`
- Create: `public/downloads/skill-template/SKILL.md`
- Create: `docs/CAPSTONE.md`

**Work:**
- Build a guided capstone called “Lead Follow-Up Command Center.”
- Teach one standardized path: brief → inspect → plan → scaffold → data → feature → tests → browser QA → deploy/rollback.
- Downloads must be useful without claiming to be Anthropic-provided assets.
- Do not build a second LMS or complex submission system.

**Verification:**
- Every download is linked from at least one lesson.
- Capstone sequence appears in dashboard/sidebar and prev/next navigation.
- Build passes.

## Phase 3: AI by Design education integration

### Task 6: Create isolated AI by Design course routes

**Repository:** `/Users/terry/code/by-design-ai-` via isolated worktree.

**Files:**
- Create: `app/education/page.tsx`
- Create: `app/education/claude-code/page.tsx`
- Modify: `components/layout/Header.tsx` only in isolated worktree if needed.
- Modify: homepage education section only if a clean existing insertion point exists.
- Create: `docs/CLAUDE-CODE-COURSE-INTEGRATION.md`

**Work:**
- Add a public AI by Design education overview and Claude Code course page.
- Position self-paced course as available and live workshop as planned/coming soon.
- CTA to `https://claudecodeclass.com` with UTM parameters.
- Preserve AI by Design’s primary consulting/discovery-call positioning.
- Include independent-product disclaimer and no unsupported testimonials/results.
- Do not change existing coaching work or newsletter work in Terry’s dirty main worktree.

**Verification:**
- `npm run build`
- Browser check `/education` and `/education/claude-code`.
- Existing `/`, `/newsletter`, and `/coaching` behavior remains unchanged in the review worktree.

## Phase 4: QA and launch-readiness handoff

### Task 7: Full review

**Files:**
- Create: `docs/LAUNCH-READINESS.md`

**Checks:**
- Course build and AI by Design build pass.
- Inspect all diffs for unrelated changes and secrets.
- Verify landing-page links and course CTAs.
- Verify unauthenticated protected-route behavior.
- Verify lesson rendering with no videos.
- Verify SQL policy by static review and document the production test steps.
- Record what is intentionally not complete: production migration, production deployment, Stripe live transaction, Terry-owned videos, workshop date, workshop checkout, and student proof.

## Terry recording deliverable

Terry should receive a short prioritized list:

1. Course welcome and safety promise.
2. Current installation and login.
3. First safe session and permission modes.
4. The inspect → plan → build → review → test → ship loop.
5. Creating a useful CLAUDE.md.
6. Skills, hooks, and MCP overview.
7. Subagents and agent teams demo.
8. Capstone kickoff.
9. Capstone build walkthrough.
10. Browser QA, tests, deployment, and rollback.
11. How Terry actually uses Claude Code across his products.

Each recording should target 6–12 minutes except the capstone build, which may be split into 3–4 focused recordings.

## Definition of done for this sprint

- A written plan exists in the course repository.
- Course sales page is refreshed locally and truth-safe.
- Unlicensed YouTube embeds are removed locally.
- Recording plan/tracker/templates exist.
- Purchase-gate SQL is corrected locally with a migration ready for later approval.
- Curriculum V2 map and at least the current setup/modern-capabilities structure are implemented.
- One capstone and download starter assets exist.
- AI by Design education/course pages exist in an isolated worktree.
- Both repositories build successfully.
- No production deploy, migration, email, pricing publication, or workshop launch occurs without Terry review.
