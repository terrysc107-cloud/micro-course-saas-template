# Verification record

## Verified locally

- Course TypeScript and production build.
- Parent site's claim-check suite, 43 existing voice-agent validation/rate-limit tests, and production build.
- 14 validation/PostgreSQL tests: questionnaire limits and URL validation; safe return paths; four-week output shape; migration rerun; last-seat capacity; hold ownership/retry; price/terms quote checks; acceptance protection; uncertain hold retention; payment amount/currency/null identity validation; duplicate fulfillment; full refunds and late events; client-role privilege denial; rate limiting; student payload privacy.
- 7 React DOM interaction tests: application/consent; four-section questionnaire draft/save/submit; stale save preserving input; instructor edit/publish; stale draft publishing disabled; deliverable feedback/resubmission; interest-list failure and retry.
- HTTP smoke checks against the production server with credentials absent: four new pages render, private routes report unavailable service, foreign-origin requests are rejected, unconfigured webhook does not accept events, and cohort lookup safely returns no availability.

The PostgreSQL tests use PGlite (embedded Postgres). Promise-based last-seat calls verify capacity behavior, not independent multi-connection Postgres lock contention. React interaction tests use jsdom and mocked fetch responses; they do not establish successful hosted authentication, persistent Supabase writes, or Stripe transactions.

## Commands

Course repo:

```sh
npm ci
npm run test:labs
npm run test:labs:ui
npm run check:content
npm run build
npm run test:labs:http
npm audit --omit=dev
```

Parent repo:

```sh
npm ci
npm run check:claims
npm run build
npm audit --omit=dev
```

The content checker reported 36 pre-existing generic-cover warnings across existing lessons; no content errors. The parent claim-check runner now uses a pinned local `tsx` dependency via Node, avoiding a fresh `npx` download and IPC dependency each run.

## Not verified here — required before live sales

- Real browser visual/layout/accessibility checks, including mobile and keyboard use. The local browser could not start because this execution environment denied its socket operations; the remote browser could not reach the local server. **No screenshots or browser pass are claimed.**
- Actual Supabase sign-up, confirmation email, session refresh, account separation, instructor allowlist, and staging migration against the connected project.
- Stripe test-mode checkout, signed event delivery, retries, refunds, and multi-connection last-seat contention.
- A real OpenAI structured-output request with the selected model and its cost/latency.
- Production hosting, live domain, email delivery, privacy/contact procedures, and approved dates/terms.

A browser regression script is included for Claude's connected/local environment:

```sh
npx playwright install chromium
npm run dev -- --port 3100
# In a second terminal:
npm run test:labs:browser
```

It checks desktop/mobile horizontal overflow, runtime page errors, and fixture questionnaire/instructor screens; captures files under `docs/build-lab/screenshots`. Optional `LAB_BROWSER_URL` and `LAB_BROWSER_EXECUTABLE` select a different preview/browser. It uses intercepted fixture data, so it does not replace actual staged authentication/payment testing. The script was prepared but could not be executed in this environment.

## Review checklist for the real browser

1. New landing page at 390, 768, and 1440 px: readable type, no horizontal overflow, clear keyboard focus, workable sticky navigation, FAQs and each interest form.
2. Registration retains `/lab-studio` through confirmation. Existing account returns to the same workspace.
3. Required questions, missing/oversized answers, server failures, and retry messages work without losing input.
4. An accepted owner sees all dates/terms and must explicitly accept before paying.
5. Payment return remains pending until verified payment; refresh shows enrolled access once the webhook commits.
6. Questionnaire draft survives sign-out and return; another tab cannot overwrite a newer revision; opted-out owners never trigger AI drafting.
7. Instructor sees only authorized data. Student network responses omit notes and drafts, not merely hide them in the UI.
8. Reviewed plan and Markdown download agree. Intake edits invalidate the old plan.
9. Deliverable submission, feedback, revision, and four-week approval counts stay consistent.
10. Legacy course/lab checkout and independently purchased course access still work.

See `CLAUDE-HANDOFF.md` for payment and rollout gates.

## Dependency maintenance

Course: Next.js 16.2.4 → 16.3.6. Parent: Next.js 14.2.29 → 15.5.24 and React 18 → 19.2.4, with the official async-request codemod applied to blog params. The parent pins Next's transitive PostCSS to 8.5.28 through a targeted override because the patched Next 15 line still pins PostCSS 8.4.31. Other in-range runtime dependency fixes are in the lockfiles. Review the override when upgrading Next again.

Final `npm audit --omit=dev` reports **0 vulnerabilities in both repositories** on September 25, 2026. Dependency audits are point-in-time advisory checks, not a complete security certification.
