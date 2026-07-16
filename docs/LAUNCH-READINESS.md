# Launch readiness — Claude Code Class V2

**Date:** 2026-07-16 · **Branch:** `feat/claude-code-v2-refresh` · **Status:** implementation and database security migration complete; production site deployment and live UI QA are the remaining gates

**Verdict: code and curriculum are ready for controlled live testing.**

The product is defensible now in a way it was not this morning: nothing on the site is a
claim we can't support, the free-course security hole is closed in production, and a dedicated
QA login has an active manual course grant. The remaining work is deployment, a live sign-in/
lesson/quiz/progress pass, and Terry's decision on launch timing and video.

---

## Verification run

| Check | Command | Result |
|---|---|---|
| Production build | `npm run build` | ✓ passes — 10 routes, no type errors |
| Content + truth rules | `npm run check:content` | ✓ passes — 48 lessons, 10 modules, 5 downloads |
| Both | `npm run check` | ✓ |

Browser smoke test against `next dev`:

| Route | Expected | Actual |
|---|---|---|
| `/` | 200, renders | ✓ 200 |
| `/learn/...` unauthenticated | redirect to sign-in | ✓ 307 → `/sign-in?redirect=…` |
| `/dashboard` unauthenticated | redirect to sign-in | ✓ 307 → `/sign-in?redirect=…` |
| `/downloads/preflight-checklist.md` | 200 | ✓ 200 |
| `/downloads/skill-template/SKILL.md` | 200 | ✓ 200 |

Landing page content assertions — disclaimer present, AI by Design attribution present, Build
Lab framed as planned, `$97` present; `10×`, fabricated testimonials, "Best Value" badge, and
"What students say" all absent. ✓

### `npm run check:content` — what it guards

New in this sprint (`scripts/check-content.mjs`). A build passing is not evidence the content
is honest, so this checks what a compiler can't. It fails on:

- Speed multipliers, income promises, outcome guarantees
- Named model versions (the single biggest source of V1's rot)
- `videoUrl` frontmatter or any YouTube link
- Claims of Anthropic affiliation/endorsement
- The three fabricated V1 testimonial names
- A download that's missing, unlinked from any lesson, or not self-attributed
- A module folder with no `MODULE_META` entry
- Quiz answers out of range; `order` not matching the filename
- The disclaimer being removed from config or footer

It deliberately allows lessons to *quote* a banned claim when correcting it, and allows quiz
distractors to be wrong. **Wire this into CI before any marketing push.**

---

## Blockers — Terry only

### 1. Purchase-gate migration — resolved ✅

The vulnerable `FOR ALL` policy was replaced in production on 2026-07-16 after a paid
Supabase preview branch reproduced the exploit (`201` before migration) and blocked it
(`403` after migration). The branch was deleted immediately after the passing gate.
Production verification confirms one SELECT-only policy, no authenticated INSERT/UPDATE/
DELETE privileges, all existing purchase rows preserved, and three reconciliation columns
present. Migration history records `20260716124800` as applied.

Full procedure and evidence: **`docs/PAYMENT-GATE-SECURITY.md`**.

### 2. Decide on video 🟡

No videos ship. All 35 were third-party YouTube embeds Terry has no licence to. The written
course is complete and sells as-is, and the FAQ says so plainly rather than hiding it.

**The decision:** launch now with written lessons and add video as it lands, or hold launch
until recordings 1–4 exist. Recommendation: **launch**. The honest FAQ answer converts better
than a silent gap, and 12 videos is 40+ hours of work — which is exactly the pressure that
produced the borrowed videos in the first place.

Plan: `docs/VIDEO-RECORDING-PLAN.md` · Tracker: `docs/VIDEO-TRACKER.csv`

### 3. Confirm student count is zero 🟡

The module restructure changes lesson slugs, which orphans `lesson_progress` /
`quiz_results` / `user_course_state` rows (see `docs/CURRICULUM-V2-MAP.md`). Nothing breaks
and no data is lost — a student who completed the old lessons just sees them as incomplete.

If real students exist, write a key-mapping migration before deploying. **Do not skip the
renames to avoid this** — shipping a module titled "Making Money with Claude Code" is a far
bigger liability than a reset progress bar.

### 4. Verify Stripe still works end to end 🟡

`lib/stripe.ts`, the checkout route, and the webhook were all rewritten. Nothing was tested
against a real Stripe transaction — per instructions, no products were created and no live
calls made. Run one test-mode purchase (checkout → webhook → row → `/learn` accessible)
before taking money.

Behavior changes worth knowing:
- Checkout now returns **409** if the user already owns the course (was: charge them twice).
- Checkout returns **503** instead of throwing when Stripe env vars are missing.
- The webhook now requires `payment_status === 'paid'` before granting. A completed-but-unpaid
  session (async payment methods) no longer opens the course.
- The webhook returns 500 on DB error so Stripe retries; it returns 200 on missing metadata so
  a permanently-broken event doesn't wedge the retry queue.

### 5. Review the Build Lab framing 🟢

Planned/coming-soon only. No date, no price, no checkout, no seat count — as instructed. The
component (`components/marketing/BuildLabSection.tsx`) carries a comment saying it must not
gain any of those without Terry's approval.

---

## Launch state

- ✅ **Production purchase-gate migration applied and verified.** Existing access rows were preserved.
- ✅ **Dedicated QA login created.** It has an active manual course grant and cannot self-grant another purchase.
- ✅ **AI by Design integration built separately.** Its production build passes.
- ⏳ **Production site deployment authorized.** Final live browser QA follows deployment.
- ❌ **No Stripe products or prices created.** Self-paced $97 checkout is preserved as-is; price remains environment-configured.
- ❌ **No real charge created.** Live QA uses the manual QA grant, not a customer payment.
- ❌ **No workshop checkout, date, or product.**
- ❌ **No email or launch announcement.**

---

## What changed

### Trust and truth
- Removed 3 fabricated testimonials, the "10×" hero claim and metadata, "Build and ship features 5–10× faster", the "Best Value" badge, and the "2x vs 10x developers" KeyPoint.
- Rewrote the "Making Money" module (now **Professional Practice**) — deleted a `$300/hour` ROI callout, `$10k–20k/month`, a `$1,000 MRR` ladder, a `$7,000/month` scaling table, four price tables, and "Module 8 alone will pay for the course".
- Added the disclaimer — *"Independent educational product by AI by Design. Not affiliated with or endorsed by Anthropic."* — to `lib/course-config.ts`, rendered in the footer on every marketing page, repeated in the FAQ, and on every download.
- Added an explicit **"who this is NOT for"** section naming, among others, anyone looking for passive income.

### Factual corrections
Full table in `docs/CURRICULUM-V2-MAP.md`. The load-bearing ones:

| Was | Now |
|---|---|
| `npm install -g @anthropic-ai/claude-code`, "Node 18+ required" | Native installer; docs don't present npm as recommended |
| "An Anthropic API key" listed as a **prerequisite** | Account login. API key explicitly **not** required |
| "Claude 3.5 Sonnet or Claude 3.7 Sonnet" | No model named anywhere. Teach `/model`, `/status` |
| A static cost table | Rewritten around durable ideas; numbers live at claude.com/pricing |
| `/cost` | **`/usage`** — `/cost` no longer exists; V1 taught it in prose *and* a quiz answer |
| CLAUDE.md quiz marking `.claude/` **wrong** | Both `./CLAUDE.md` and `./.claude/CLAUDE.md` are valid |
| "sessions don't persist between runs" | Corrected — `claude -c`, `-r`, `/resume` |
| CLI flags `-C`, `--no-auto-context` | Removed — not in the CLI reference |
| A fabricated `Accept this change? (y/n)` transcript | Behavior described; invented mock removed |

Where V1 taught something *confidently* wrong (the API-key myth, session persistence), V2
contradicts it on the page rather than quietly omitting it. A learner who read V1 needs the
correction, not silence.

### New content
- **Module 08 — Extending Claude Code** (6 lessons): Skills, hooks, MCP, subagents/agent teams, plugins + code intelligence, surfaces + CI/CD. Every lesson has a **"When NOT to use this"** section.
- **Module 09 — Capstone** (6 lessons): Lead Follow-Up Command Center. See `docs/CAPSTONE.md`.
- **`01-getting-started/05-permission-modes`**: the safety lesson V1 never had.
- **5 downloads**, each pinned to a linking lesson by `TEMPLATES` and verified by the content check.

### Landing page
Rebuilt as a server component with client islands, split into 9 section components under
`components/marketing/` (largest is 108 lines). Curriculum and stats render from the **real
filesystem**, so the module list and lesson count cannot lie. All copy lives in
`lib/course-config.ts`.

### Security
- SELECT-only RLS policy + revoked write grants on `course_purchases`; base schema fixed too, with a comment explaining why `FOR ALL` is a free-course bug.
- The migration passed a Supabase preview-branch exploit test and is applied in production. The paid preview branch was deleted after the gate.
- Progress tables **keep** `FOR ALL` on purpose — the app writes them from the user's own session, and faking your own quiz score cheats only yourself.
- Stripe config validated explicitly; lazy client (was: `new Stripe(process.env.X!)` at module scope, which threw an opaque error at build time on a misconfigured deploy).
- Webhook made idempotent, records customer/payment-intent ids, and requires `payment_status === 'paid'`.

---

## Known gaps (not blockers)

- **Cover images are third-party Unsplash hotlinks** on 35 lessons. Permitted under the Unsplash licence, so not a legal problem — but they're generic stock that adds nothing. New V2 lessons ship without them. `check:content` warns, doesn't fail. Recommend removing the rest.
- **No owned screenshots**, so `<LessonImage>` goes unused. Install and permission-prompt lessons would benefit most.
- **Capstone never built end to end by a human.** Internally consistent and written against the verified fact base, but nobody has sat down and done it. **This is the highest-value validation available before launch.**
- **Modules 02, 03, 04, 06 were fact-checked, not rewritten.** They predate the core-loop framing and don't reference it explicitly.
- **No broad browser automation suite** beyond `check:content`. The RLS bypass suite was run against a Supabase preview branch and then verified again in production.
- **`docs/CLAUDE-CODE-FACTS-2026-07-16.md` needs re-verification each update cycle.** It was already corrected four times during this sprint (Shift+Tab cycle, protected paths, `$ARGUMENTS`, `/usage`) — which is the rate of change you're maintaining against.

---

## Terry's first 10 videos

Priority order. **Record 1–4 first** — they cover where beginners actually get stuck and
front-load the trust. Full shot lists in `docs/VIDEO-RECORDING-PLAN.md`; status in
`docs/VIDEO-TRACKER.csv`. Default tool: **Screen Studio** (auto-zoom is what makes terminal
work legible without editing).

| # | Video | Target | Must be visible on screen |
|---|---|---|---|
| 1 | **Welcome and the safety promise** | 6 min | Nothing — just you. Say the disclaimer and the honest video status out loud |
| 2 | **Install and log in** | 10 min | Real browser login handoff + `/status` showing a subscription, not an API key. **Worth a clean VM.** Correct the API-key myth on camera — it's the highest-value 20 seconds in the course |
| 3 | **First safe session and permission modes** | 12 min | The permission prompt appearing, and plan mode refusing to edit. Those two frames are the whole video |
| 4 | **The loop: inspect → plan → build → review → test → ship** | 12 min | A real diff being read and **questioned**. If you accept every suggestion unchanged, re-record — that's the behavior the course exists to prevent |
| 5 | **Writing a useful CLAUDE.md** | 9 min | Before/after: same prompt with and without CLAUDE.md. The contrast *is* the lesson |
| 6 | **Skills, hooks, and MCP** | 12 min | The `PostToolUse` hook firing on its own after an edit |
| 7 | **Subagents and agent teams** | 11 min | Main context staying clean while the subagent does the noisy work |
| 8 | **Capstone kickoff: brief, inspect, plan** | 10 min | A plan being rejected and improved. Write the non-goals on camera |
| 9 | **Capstone build** (3 parts: 9a data/schema, 9b feature, 9c tests/review) | 3 × 12 min | **9b must contain a real failure and recovery.** If the build goes clean, keep recording until something breaks |
| 10 | **Browser QA, deploy, and rollback** | 12 min | A real rollback executing. Almost no course shows this |

Optional #11 — **"How Terry actually uses Claude Code"** (12 min). Not curriculum; evidence.
The one video that can't go stale, because it's about judgment rather than UI. Scrub every
client name, key, and customer record first.

**Before every take:** notifications off, password manager closed, throwaway account, scratch
repo clean, terminal ≥18pt. Assume every pixel ships.

---

## Suggested next steps after deployment

1. **Hermes:** complete live sign-in, lesson, quiz, progress, logout, and return-login QA.
2. **Terry:** build the capstone end to end yourself. It is the best test of whether the course works and doubles as rehearsal for videos 8–10.
3. **Terry:** record videos 1–4.
4. Wire `npm run check` into CI.
5. Decide when to begin promotion; deployment alone is not a launch announcement.
