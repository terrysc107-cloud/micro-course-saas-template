# Micro Course SaaS Template

> A production-ready paid course platform. Ship a new niche course in a day — built with Next.js 16, Supabase, Stripe & MDX.

**Live example:** [claudecodeclass.com](https://claudecodeclass.com)

---

## What You Get

A fully working course SaaS with:

- 💳 **One-time Stripe payment** — hosted checkout, webhook-gated access
- 🔐 **Supabase auth** — email sign-up, session management, Row Level Security
- 📚 **MDX content pipeline** — lessons are markdown files, no CMS needed
- 🧠 **Quiz engine** — per-lesson quizzes with scoring, pass/fail state, auto-completion
- 📊 **Progress tracking** — dashboard with completion % per module, resume button
- 🎨 **Rich lesson components** — `<Callout>`, `<KeyPoint>`, `<LessonImage>` for engaging content
- 📱 **Mobile-friendly** — collapsible sidebar, responsive layout
- ⚡ **Vercel-ready** — deploys in minutes

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + Typography plugin |
| Auth | Supabase native (no Clerk) |
| Database | Supabase Postgres + RLS |
| Payments | Stripe Checkout |
| Content | MDX + `next-mdx-remote/rsc` + `gray-matter` |
| Deployment | Vercel |

---

## Adapt for Any Niche — Change 5 Things

| What | Where |
|------|-------|
| Lesson content | `content/modules/**/*.mdx` |
| Landing page copy | `app/(marketing)/page.tsx` |
| Brand name | `app/layout.tsx` + global find/replace |
| Brand colors | `app/globals.css` `@theme` block |
| Stripe price ID | `NEXT_PUBLIC_STRIPE_PRICE_ID` env var |

Everything else — auth, payments, progress, quiz engine, sidebar — works unchanged.

---

## Quick Start

### 1. Clone and install
```bash
git clone https://github.com/terrysc107-cloud/micro-course-saas-template.git
cd micro-course-saas-template
npm install
```

### 2. Set up Supabase
- Create a project at [supabase.com](https://supabase.com)
- Run `course-schema.sql` in the SQL editor
- Add your production URL to Authentication → Redirect URLs

### 3. Set up Stripe
- Create a product + one-time price
- Create a webhook pointing to `/api/stripe/webhook` with event `checkout.session.completed`

### 4. Configure environment variables
```bash
cp .env.local.example .env.local
# Fill in your Supabase + Stripe keys
```

### 5. Run locally
```bash
npm run dev
```

### 6. Deploy
```bash
vercel deploy --prod
```

---

## Content Format

Each lesson is an MDX file with frontmatter:

```mdx
---
title: "Lesson Title"
description: "One sentence description."
order: 1
duration: "8 min"
videoUrl: "https://www.youtube.com/watch?v=VIDEO_ID"
coverImage: "https://images.unsplash.com/photo-{ID}?w=1200&auto=format&fit=crop&q=80"
quiz:
  - question: "Question text?"
    options: ["A", "B", "C", "D"]
    answer: 1
---

Lesson prose here...

<Callout type="tip">Pro tip for readers.</Callout>

<KeyPoint>The single most important takeaway from this lesson.</KeyPoint>
```

See `COURSE-TEMPLATE.md` for the complete replication guide.

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_ID=
NEXT_PUBLIC_SITE_URL=
```

---

## License

MIT — use it for your own courses, sell courses built on it, or build and sell the setup service. Attribution appreciated but not required.
