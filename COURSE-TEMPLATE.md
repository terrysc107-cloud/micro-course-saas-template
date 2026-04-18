# Course SaaS Template — Full Replication Guide

> **How to use this file:** A new Claude session can read this document and build a complete paid course platform from scratch for any niche. Every architectural decision, file pattern, and deployment step is documented here. Swap the content and branding — everything else is reusable as-is.

---

## 1. What This System Is

A production-ready micro-course SaaS: users pay once via Stripe, get lifetime access to a gated course, progress through lessons with optional quizzes, and track completion via a dashboard. Built entirely with open-source tools and deployed on Vercel.

**Live example:** [claudecodeclass.com](https://claudecodeclass.com)

---

## 2. Tech Stack & Why

| Tool | Why |
|------|-----|
| **Next.js 16 App Router** | RSC for fast server-rendered lessons, file-based routing, built-in API routes |
| **TypeScript** | Type-safe frontmatter parsing, component props |
| **Tailwind CSS v4** | `@theme` CSS variables, no config file needed, `@plugin` for typography |
| **Supabase** | Auth + Postgres + RLS in one service — no separate auth provider needed |
| **Stripe Checkout** | Hosted payment page, webhook-based access gating |
| **MDX + next-mdx-remote/rsc** | Content-as-code: lessons are files, no CMS needed, full component support |
| **gray-matter** | Parse YAML frontmatter from MDX files |
| **@tailwindcss/typography** | Prose styling for MDX content |
| **Vercel** | Zero-config Next.js deployment, serverless functions for API routes |

---

## 3. Folder Structure

```
project-root/
├── app/
│   ├── layout.tsx                          # Root layout — font, metadata, OG tags
│   ├── globals.css                         # Tailwind v4 @theme brand colors + @plugin typography
│   ├── (marketing)/
│   │   └── page.tsx                        # Landing/sales page (client component, useSearchParams)
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx # Email+password sign in
│   │   └── sign-up/[[...sign-up]]/page.tsx # Email+password sign up
│   ├── auth/
│   │   └── callback/route.ts               # Supabase auth code exchange
│   ├── dashboard/
│   │   └── page.tsx                        # Progress overview + module grid (server component)
│   ├── learn/
│   │   └── [moduleSlug]/
│   │       └── [lessonSlug]/
│   │           └── page.tsx                # Lesson player (server component)
│   └── api/
│       ├── stripe/
│       │   ├── checkout/route.ts           # Create Stripe session → return URL
│       │   └── webhook/route.ts            # Stripe sig verify → write course_purchases row
│       ├── progress/route.ts               # GET completed lessons, POST mark complete
│       └── quiz/route.ts                   # POST answers → score → auto-mark complete if pass
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── SignOutButton.tsx
│   └── course/
│       ├── LessonLayout.tsx                # Client wrapper: sidebar state, mobile drawer, header
│       ├── CourseSidebar.tsx               # Module/lesson nav, progress bar, checkmarks
│       ├── LessonContent.tsx               # MDX renderer with prose styles + custom components
│       ├── mdx-components.tsx              # Callout, LessonImage, KeyPoint exports
│       ├── LessonQuiz.tsx                  # Quiz UI (client): submit → score → pass/fail state
│       └── LessonNav.tsx                   # Prev/Next lesson arrows
├── content/
│   └── modules/
│       ├── 01-module-name/
│       │   ├── 01-lesson-name.mdx
│       │   └── 02-lesson-name.mdx
│       └── 02-module-name/ ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # createClient() for browser
│   │   └── server.ts                       # createClient() for server (uses cookies())
│   ├── content.ts                          # getAllModules(), getLesson(), getAllLessons(), getAdjacentLessons()
│   ├── progress.ts                         # getCompletedLessons(), getLastLesson(), hasPurchased()
│   ├── stripe.ts                           # Stripe singleton
│   └── utils.ts                            # cn() className utility
├── proxy.ts                                # Next.js 16 middleware (auth + purchase gate)
├── course-schema.sql                       # Run once in Supabase SQL editor
├── next.config.ts
├── package.json
└── .env.local
```

---

## 4. Database Schema

Run this once in the Supabase SQL editor for your project:

```sql
-- Payment gating
CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  stripe_session_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Lesson completion
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_slug, lesson_slug)
);

-- Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume state (last lesson visited)
CREATE TABLE IF NOT EXISTS user_course_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  last_module_slug TEXT,
  last_lesson_slug TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see their own rows
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own rows" ON course_purchases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own rows" ON lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own rows" ON quiz_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own rows" ON user_course_state FOR ALL USING (auth.uid() = user_id);
```

---

## 5. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...         # Used server-side only (bypasses RLS for webhook)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...                 # Get from Stripe dashboard after creating webhook
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...           # Create a one-time price in Stripe dashboard

# Site
NEXT_PUBLIC_SITE_URL=https://yourdomain.com     # Used in sign-up email redirect URL
```

---

## 6. Content Architecture

### Naming Conventions

Modules: `content/modules/01-module-name/` (numbered prefix sorts them)
Lessons: `01-lesson-name.mdx` (numbered prefix within module folder)

`lib/content.ts` automatically reads, sorts, and exposes these via:
- `getAllModules()` → `Module[]` with nested lesson metadata (no content body)
- `getLesson(moduleSlug, lessonSlug)` → `{ frontmatter, content }` including full MDX body
- `getAllLessons()` → flat `Lesson[]` for prev/next navigation
- `getAdjacentLessons(moduleSlug, lessonSlug)` → `{ prev, next }`

### Full Frontmatter Schema

```yaml
---
title: "Lesson Title"
description: "One-sentence description shown under the title."
order: 1                          # Used for sorting (filename number takes precedence)
duration: "8 min"                 # Displayed in sidebar and lesson header
videoUrl: ""                      # YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
                                  # Transforms to embed URL automatically. Leave empty if no video.
coverImage: ""                    # Unsplash URL: https://images.unsplash.com/photo-{ID}?w=1200&auto=format&fit=crop&q=80
                                  # Displays as banner image below lesson title.
quiz:
  - question: "Question text?"
    options:
      - "Option A"
      - "Option B"
      - "Option C"
      - "Option D"
    answer: 1                     # 0-indexed correct answer
  - question: "..."
    options: [...]
    answer: 0
---
```

### MDX Component API

These components are available in any `.mdx` lesson file:

**`<Callout type="tip|warning|info|success" title?="Custom Title">`**
```mdx
<Callout type="tip">
  Pro tip text here. Can include `inline code` naturally.
</Callout>

<Callout type="warning" title="Don't Do This">
  Specific mistake to avoid.
</Callout>

<Callout type="info">
  Background context that enriches understanding.
</Callout>

<Callout type="success">
  A payoff or "aha" moment for the reader.
</Callout>
```

**`<LessonImage src="" alt="" caption?="">`**
```mdx
<LessonImage
  src="https://images.unsplash.com/photo-{ID}?w=800&auto=format&fit=crop&q=80"
  alt="Descriptive alt text"
  caption="Optional caption shown below the image"
/>
```

**`<KeyPoint>`**
```mdx
<KeyPoint>
  The single most important insight from this entire lesson — one sentence, high impact.
</KeyPoint>
```
Place `<KeyPoint>` as the second-to-last element in the lesson, just before the closing transition sentence.

---

## 7. Auth Flow

1. User visits `/sign-up` → submits email + password
2. Supabase sends confirmation email with link to `NEXT_PUBLIC_SITE_URL/auth/callback`
3. `/auth/callback/route.ts` exchanges the code for a session via `supabase.auth.exchangeCodeForSession(code)`
4. Redirects to `/dashboard`
5. `proxy.ts` (Next.js 16 middleware) checks `supabase.auth.getUser()` on every protected route
6. Unauthenticated requests to `/dashboard` or `/learn/*` redirect to `/sign-in?redirect=[pathname]`

**Critical Supabase config:** Add your production domain to Authentication → URL Configuration → Redirect URLs:
```
https://yourdomain.com/auth/callback
```

---

## 8. Payment Flow

1. User clicks "Buy Now" → POST `/api/stripe/checkout`
2. Route creates Stripe Checkout session (`mode: "payment"`, `price: STRIPE_PRICE_ID`)
3. Returns `{ url }` → client redirects to Stripe hosted page
4. User completes payment → Stripe fires `checkout.session.completed` webhook
5. `/api/stripe/webhook` verifies signature with `STRIPE_WEBHOOK_SECRET`
6. Inserts row into `course_purchases` using the **service role client** (bypasses RLS)
7. `proxy.ts` checks `course_purchases` table on every `/dashboard` and `/learn/*` request
8. No purchase → redirect to `/?upgrade=true` (landing page auto-scrolls to pricing)

**Never gate on Stripe success URL** — only gate on the webhook-written `course_purchases` row.

---

## 9. Progress System

- Quiz submit → POST `/api/quiz` with `{ moduleSlug, lessonSlug, answers: number[] }`
- Server scores against frontmatter answers, inserts `quiz_results` row
- If score ≥ 70%: auto-upserts `lesson_progress` row + updates `user_course_state`
- Returns `{ score, passed, correct: boolean[] }` to client
- `LessonQuiz.tsx` shows pass/fail state, "Next Lesson →" on pass
- Sidebar `CourseSidebar.tsx` fetches completed lessons and shows checkmarks
- Progress bar = `completed.length / allLessons.length`

**To disable quiz gating** (all lessons open to paid users): Sidebar and lesson page already have all lessons unlocked — quizzes are optional tracking only.

---

## 10. Deployment Checklist

### Step 1: Supabase
- [ ] Create project at supabase.com
- [ ] Copy URL + anon key + service role key
- [ ] Run `course-schema.sql` in SQL editor
- [ ] Authentication → URL Configuration → add `https://yourdomain.com/auth/callback`
- [ ] (Optional) Authentication → Email Templates → customize confirmation email

### Step 2: Stripe
- [ ] Create product in Stripe dashboard
- [ ] Create one-time price (e.g. $97)
- [ ] Copy price ID (`price_...`)
- [ ] Create webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- [ ] Enable event: `checkout.session.completed`
- [ ] Copy webhook secret (`whsec_...`)

### Step 3: Vercel
- [ ] Push code to GitHub (or deploy via CLI: `vercel deploy --prod`)
- [ ] Add all env vars in Vercel project settings
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your production domain
- [ ] Add custom domain in Vercel → Domains

### Step 4: Email (for production)
- [ ] Create Resend account at resend.com
- [ ] Add your domain to Resend
- [ ] In Supabase → Authentication → SMTP Settings → enable Custom SMTP:
  - Host: `smtp.resend.com`, Port: `465`, Username: `resend`
  - Password: Resend API key, Sender: `hello@yourdomain.com`

### Step 5: Test end-to-end
- [ ] Sign up with a real email → confirmation email arrives
- [ ] Click link → redirected to `/dashboard` blocked → `/?upgrade=true`
- [ ] Click Buy Now → Stripe Checkout → test payment → webhook fires → `course_purchases` row written
- [ ] Refresh `/dashboard` → accessible, progress shown
- [ ] Navigate to a lesson → renders with cover image, video, callouts
- [ ] Complete a quiz → checkmark appears in sidebar

---

## 11. Adapting to Any Niche

**Change these 5 things:**

| What | Where |
|------|-------|
| Lesson content | `content/modules/**/*.mdx` — swap all MDX files |
| Landing page copy | `app/(marketing)/page.tsx` — hero, features, curriculum, testimonials |
| Brand name | `app/layout.tsx` metadata + search/replace across all components |
| Brand colors | `app/globals.css` `@theme` block — update `--color-brand-*` values |
| Stripe price | `NEXT_PUBLIC_STRIPE_PRICE_ID` env var + landing page price display |

**Keep everything else** — auth, middleware, Stripe flow, progress tracking, quiz engine, sidebar, dashboard, API routes. None of it is topic-specific.

**Typical niche ideas this works for:**
- Python for data analysts
- Copywriting with AI
- Notion for productivity
- Excel mastery
- SEO fundamentals
- No-code app building
- Freelance design workflow

---

## 12. Content Writing Guide

### Lesson Structure
Every lesson should follow this order:
1. **Hook** — one paragraph: what problem this lesson solves
2. **Concept section** — explain the "what" and "why"
3. **Practical section** — the "how", with code examples
4. **`<Callout type="tip">` or `<Callout type="warning">`** — inserted here
5. **Edge cases / advanced** — common mistakes, alternatives
6. **`<KeyPoint>`** — single most important takeaway
7. **Transition** — one sentence pointing to the next lesson

### Callout Usage Guide
- `tip` — actionable advice, the "pro move" version of what was just explained
- `warning` — the most common mistake beginners make, or a real gotcha
- `info` — background context that isn't required but deepens understanding
- `success` — a genuine payoff or "aha" moment, use sparingly (1 per lesson max)

### Image Sourcing
Use Unsplash direct photo URLs (free, CDN-optimized, permanent):
```
https://images.unsplash.com/photo-{PHOTO_ID}?w=1200&auto=format&fit=crop&q=80
```
Find photo IDs by searching unsplash.com and copying the ID from the URL.

For `coverImage` (lesson banner): use `w=1200`, aspect ratio 16:9 thematically relevant image.
For `<LessonImage>` (inline): use `w=800`, screenshot or concept illustration.

### Video Assignment
Set `videoUrl` to any YouTube URL. The lesson page transforms it automatically:
```
https://www.youtube.com/watch?v=VIDEO_ID → embedded iframe
```
Search YouTube for topic-specific videos under 15 minutes from authoritative channels.

### Lesson Length Targets
| Duration | Word Count | Code Blocks | Callouts | KeyPoints |
|----------|------------|-------------|----------|-----------|
| 6-8 min  | 600-900    | 2-4         | 1-2      | 1         |
| 9-11 min | 900-1300   | 4-6         | 2-3      | 1         |
| 12-15 min| 1300-2000  | 6+          | 3-4      | 1         |

---

## 13. Visual Design System

**Base:** Dark theme, `bg-slate-950` background, `text-white` primary text

**Brand colors** (sky-blue, customizable in `app/globals.css`):
```css
@theme {
  --color-brand-50: #f0f9ff;
  --color-brand-400: #38bdf8;   /* Primary accent — links, icons, borders */
  --color-brand-500: #0ea5e9;   /* Progress bars, active states */
  --color-brand-600: #0284c7;   /* Buttons */
  --color-brand-900: #0c4a6e;   /* Subtle backgrounds */
}
```

**Typography:** Inter (loaded via `next/font/google`), prose content via `@tailwindcss/typography` with `prose-invert prose-slate` base classes.

**Component patterns:**
- Cards: `bg-slate-900 border border-slate-800 rounded-xl`
- Active/selected: `bg-brand-600/20 text-brand-300 border-r-2 border-brand-500`
- Muted text: `text-slate-400`, very muted: `text-slate-600`
- Buttons: `bg-brand-600 hover:bg-brand-700 text-white rounded-lg`
