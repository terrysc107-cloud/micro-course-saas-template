# Claude Code Class

The course platform behind **[claudecodeclass.com](https://claudecodeclass.com)** — a self-paced Claude Code course, $97 one-time, lifetime access. An **AI by Design** product ([aixdesign.dev](https://aixdesign.dev)).

**This is a private repository containing paid course content.** It is not a template and not a public example. It was previously published as `micro-course-saas-template`; that role has been retired.

> **Live and selling.** Changes here move real money. Read [Working on this repo](#working-on-this-repo) before touching the payment path.

---

## The two products

| | Self-paced course | The Build Lab |
|---|---|---|
| What | 48 lessons, 10 modules, MDX | Live single session, small group |
| Price | $97 one-time, lifetime | $297 (working number) |
| Status | **Live, selling** | **Waitlist only — no date set** |
| Checkout | Here | Here, gated behind `BUILD_LAB.status` |

`aixdesign.dev/education` is a marketing/referral surface only — it takes no payment and holds no enrollment state. It links here with UTM tags. See `docs/CLAUDE-CODE-COURSE-INTEGRATION.md` in the `by-design-ai-` repo for that boundary.

---

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16.2.4 (App Router, TypeScript) — see `AGENTS.md`, the APIs have breaking changes |
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

The Build Lab has a genuine seat cap, because it's a live session. Real caps, real countdowns, real sold-out states are fine and wanted. **Numbers the database can't back are not.** Seat counts come from `ccc_lab_sessions.capacity` minus actual registrations — never from a literal in a component.

`ccc_lab_sessions` carries a CHECK constraint making this structural: a run cannot be `scheduled` without a real `starts_at` **and** a real price.

### The payment path

`app/api/stripe/webhook/route.ts` is the only thing standing between a customer's money and their access. It is deliberately conservative — signature verification, `payment_status` check, a 200 on missing `userId`, a 500 on DB error so Stripe retries. **Do not tidy it.** Changes there ship alone.

Never grant entitlement from the client. `course_purchases` is service-role-write-only; the RLS migration in `supabase/migrations/` documents the exploit that made that necessary.

---

## Local setup

```bash
npm ci
```

Create `.env.local` (there is no example file to copy — this is the list):

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

⚠️ **There is no CI/CD. Pushing to `main` does not deploy anything.**

The Vercel project `claude-code-platform` has **no Git connection**. It was originally linked to the dead V1 repo (`claudecodeclass`) and auto-deployed from that repo's `main`; the link was later removed. Every deploy since is a manual CLI push from a laptop:

```bash
vercel deploy --prod    # from a local checkout of this repo
```

Production today is commit `f110983` ("feat: relaunch Claude Code Class V2"), deployed 2026-07-16 via CLI from branch `feat/claude-code-v2-refresh`. It matches `main` — but that is a coincidence of discipline, not a guarantee. **Nothing enforces that prod matches this repo.** Check before assuming:

```bash
vercel inspect <prod-url>   # compare meta.githubCommitSha against git log
```

Reconnecting the Git integration would fix this, and is worth doing — it needs the Vercel GitHub App granted access to the now-private repo, and a decision about whether merging to `main` should go straight to production.

- **Deploy:** manual, `vercel deploy --prod`
- **Rollback:** promote the previous deployment in the Vercel dashboard. Known-good as of 2026-07-17: `claude-code-platform-dj7ljmn2z-terrysc107-9627s-projects.vercel.app`
- **Docs:** `docs/LAUNCH-READINESS.md` (status/blockers), `docs/PAYMENT-GATE-SECURITY.md` (RLS verification procedure), `docs/CURRICULUM-V2-MAP.md` (what changed from V1 and why)

---

© AI by Design. All rights reserved. This repository contains paid course content — it is not licensed for reuse or redistribution.

Independent educational product by AI by Design. Not affiliated with or endorsed by Anthropic.
