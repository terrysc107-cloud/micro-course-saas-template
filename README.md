# My AI Board and the Build Lab series

The course and cohort platform for [runyouraiboard.com](https://runyouraiboard.com), an AI by Design product.

## Build Lab implementation — September 2026

The new series is implemented locally. **Remote setup and launch verification remain:** read [the Claude Code handoff](docs/build-lab/CLAUDE-HANDOFF.md), [program and price recommendation](docs/build-lab/PROGRAM.md), and [verification record](docs/build-lab/VERIFICATION.md).

| Offer | Delivery | Configuration |
| --- | --- | --- |
| My AI Board | Existing self-paced course, 73 lessons / 16 modules | `lib/course-config.ts` |
| Your AI Operating Company | Four-week foundation lab with business intake and reviewed plans | `lib/labs/catalog.ts`, `ccc_bl_cohorts` |
| Advanced Build Labs | Separate topic interest lists; not yet sold | `lib/labs/catalog.ts` |
| Earlier founding run | Preserved at `/build-lab/legacy` | Existing `BUILD_LAB` config and `ccc_lab_*` records |

The new seed uses recommended founding tuition of $1,995 and eight working seats. It opens applications only; no dates or Stripe price are invented. `/lab-studio` holds the owner workspace and `/lab-studio/instructor` holds the authorized instructor workspace.

`aixdesign.dev/education` remains the referral surface. This repo owns enrollment and payment state. Do not transfer or alter existing paid registrations when importing the feature branch.

---

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16.3.6 (App Router, TypeScript) — see `AGENTS.md`, the APIs have breaking changes |
| Styling | Tailwind CSS v4 (`@theme` in `app/globals.css`) + Typography plugin |
| Auth | Supabase native (no Clerk) |
| Database | Supabase Postgres + RLS — project `supabase-crimson-ladder` (`acouuzccqkcpyrckrgwg`) |
| Payments | Stripe Checkout, webhook-gated |
| Content | MDX + `next-mdx-remote/rsc` + `gray-matter` |
| Deployment | Vercel project `claude-code-platform` |

**The Supabase project is shared** with AI by Design (`bda_*`) and several other apps. Course tables are `course_purchases`, `lesson_progress`, `quiz_results`, `user_course_state` — unprefixed, predating the convention. **New tables use the `ccc_` prefix.**

---

## Where things live

| What | Where |
|------|-------|
| **Brand, price, curriculum meta, FAQ, disclaimer** | `lib/course-config.ts` — single source of truth |
| Brand colors | `app/globals.css` `@theme` block |
| Lesson content | `content/modules/NN-slug/NN-lesson.mdx` |
| Content loader | `lib/content.ts` — reads `MODULE_META` from course-config, so they can't drift |
| Entitlement gate | `proxy.ts` |
| Payment | `app/api/stripe/checkout/route.ts`, `app/api/stripe/webhook/route.ts`, `lib/stripe.ts` |
| Schema | `course-schema.sql`, `supabase/migrations/` |
| **Truth linter** | `scripts/check-content.mjs` |

Module and lesson titles live in `MODULE_META`, **not** in the MDX. Lesson frontmatter carries only `title`, `description`, `order`, `duration`, `coverImage?`, `quiz[]`.

---

## Working on this repo

### The truth linter is not optional

`npm run check:content` fails the build on speed multipliers, income promises, named model versions, implied Anthropic affiliation, invented seat counts, urgency theatre, student counts, and any hardcoded Build Lab date. It runs on every PR via `.github/workflows/ci.yml`.

This exists because V1 of this course shipped three testimonials from students who did not exist, an entire module promising income, and "10× faster" claims. V2 was written to undo that. The linter is what keeps it undone.

**`videoUrl` is banned.** All of V1's video embeds were unlicensed third-party YouTube. The linter fails on any `videoUrl` or YouTube link. See `docs/VIDEO-TRACKER.csv` for the recording backlog.

### Scarcity must be real

The Build Lab has a genuine seat cap, because it's a live session. Real caps, real countdowns, real sold-out states are fine and wanted. **Numbers the database can't back are not.** Legacy seat counts come from `ccc_lab_sessions`. New cohorts use `ccc_bl_cohorts.capacity` and atomic reservations counting held and paid seats. Never invent remaining-seat counts.

`ccc_lab_sessions` carries a CHECK constraint making this structural: a run cannot be `scheduled` without a real `starts_at` **and** a real price.

### The payment path

`app/api/stripe/webhook/route.ts` handles existing products; `/api/labs/webhook` handles the new series. It is deliberately conservative — signature verification, `payment_status` check, a 200 on missing `userId`, a 500 on DB error so Stripe retries. **Do not tidy it.** Changes there ship alone.

Never grant entitlement from the client. `course_purchases` is service-role-write-only; the RLS migration in `supabase/migrations/` documents the exploit that made that necessary.

---

## Local setup

```bash
npm ci
```

Create `.env.local` with the existing settings below. New lab settings are documented in `docs/build-lab/environment.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_ID=
NEXT_PUBLIC_STRIPE_BUILD_LAB_PRICE_ID=
NEXT_PUBLIC_SITE_URL=
```

Pull the real values with `vercel env pull .env.local` (project `claude-code-platform`).

```bash
npm run dev     # localhost:3000
npm run check   # check:content && build — run before every push
```

`npm run build` succeeds without any env vars: Stripe resolves lazily and the Supabase clients are built per-request.

### Testing payments

`stripe trigger checkout.session.completed` is **not sufficient** — it produces a session with no `metadata.userId`, which the webhook correctly ignores. Drive a real test-mode checkout through the UI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# then buy with 4242 4242 4242 4242
```

---

## Ops

**Merging to `main` deploys to production.** PRs get preview URLs.

Vercel project `claude-code-platform` → GitHub `terrysc107-cloud/micro-course-saas-template`, production branch `main`. Connected 2026-07-17.

Some history worth knowing, because it explains the state you may find things in: the project was originally linked to the **dead V1 repo** (`claudecodeclass`) and auto-deployed from *its* `main`. That link was removed at some point, and V2 shipped on 2026-07-16 as a manual CLI deploy (`source: cli`, sha `f110983`, from branch `feat/claude-code-v2-refresh`). For roughly a day there was no pipeline at all and nothing forcing prod to match this repo. It happened to match. Now it's enforced.

`.github/workflows/ci.yml` runs `npm run check` on every PR and every push to `main`, so the truth linter gates the deploy rather than trailing it.

- **Deploy:** merge to `main`
- **Manual deploy** (still works, avoid unless recovering): `vercel deploy --prod`
- **Check what prod is actually running:** `vercel inspect <prod-url>` → compare `meta.githubCommitSha` against `git log`
- **Rollback:** promote the previous deployment in the Vercel dashboard. Known-good as of 2026-07-17: `claude-code-platform-dj7ljmn2z-terrysc107-9627s-projects.vercel.app` (sha `f110983`)
- **Docs:** `docs/LAUNCH-READINESS.md` (status/blockers), `docs/PAYMENT-GATE-SECURITY.md` (RLS verification procedure), `docs/CURRICULUM-V2-MAP.md` (what changed from V1 and why)

---

© AI by Design. All rights reserved. This repository contains paid course content — it is not licensed for reuse or redistribution.

Independent educational product by AI by Design. Not affiliated with or endorsed by Anthropic.
