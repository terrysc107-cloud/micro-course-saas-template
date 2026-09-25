# Build Lab series — Claude Code handoff

Prepared September 25, 2026. This is an implemented feature branch, not a request to rebuild the product.

## Start here

Terry asked Codex to build the new direction locally, then have Claude Code finish work requiring his connected Stripe, Supabase, GitHub, and hosting accounts. **Nothing has been deployed, migrated remotely, charged, or emailed by this build.** Read `VERIFICATION.md` for exactly what has and has not been tested.

Repositories:

| Repository | Feature branch | Starting commit |
| --- | --- | --- |
| `terrysc107-cloud/micro-course-saas-template` | `feat/build-lab-intake` | `fa954cd391f6bbfd0dae8323f8679cb682655e83` |
| `terrysc107-cloud/by-design-ai-` | `feat/build-lab-series-marketing` | `656a6f698e57bfa4620820cd9a6dc6ba7eec1a10` |

Import the supplied patches on separate branches in the correct repos. Fetch current origin first and preserve any later work. Use `git am --3way <patch>`; resolve conflicts against the current product, rather than overwriting newer files. The downloadable package includes both patches, instructions, and these documents. The commits have only been made locally; do not assume these branches are on GitHub.

## Product direction already implemented

1. **Foundation:** Your AI Operating Company. Give the agent identity, values, voice, authority limits, business context, CEO/board roles, memory, and one recurring workflow.
2. **Four-week cadence:** context and identity → CEO and board → memory and standing work → testing, correction, and ownership.
3. **Later labs:** content/brand, lead follow-up, website/conversion, operations/reporting. Each has a separate interest list. Later curricula are not sold as finished courses.
4. **Application before payment.** Account → short business application → instructor decision → accepted owner's checkout when scheduled → paid workspace.
5. **Preparation after enrollment:** four-part questionnaire about business, tools, capability/access, and agent identity. Hosting, payment processor, email/calendar, CRM, API/coding ability, time, budget, learning needs, and excluded data are included.
6. **Reviewed personalization:** optional OpenAI drafting, or a clearly labeled manual template. Instructor edits and explicitly publishes preparation, objectives, four weekly criteria, agent charter, and operating guide. Students can download Markdown guides.
7. **Live review:** owners submit weekly work and an evidence link; instructor approves or requests a revision with feedback. Versions prevent overwriting a newer student submission.

The recommended founding tuition is **$1,995**, with **8 working seats**. These are configurable product assumptions, not evidence of demand. The seed opens applications only. Dates, terms, and checkout are deliberately unset. Terry's original $5,000 idea is discussed in `PROGRAM.md`.

## Code map

- `app/build-lab/page.tsx`: new public series landing page, matching the newer white/silver/blue brand guide.
- `app/lab-studio`: student and instructor screens.
- `components/labs`: forms, workspace, plan editor, review UI, scoped CSS.
- `lib/labs/catalog.ts`: editorial descriptions and shared foundation curriculum.
- `lib/labs/intake.ts`: questionnaire and runtime validation.
- `lib/labs/plan.ts`: manual draft and OpenAI Responses API generation.
- `lib/labs/server.ts`, `privacy.ts`: authentication, instructor gate, ownership/payment checks, private-field allowlist.
- `lib/labs/payments.ts`: reservation, Stripe checkout, fulfillment/refund reconciliation.
- `app/api/labs/[action]`: application/intake/instructor/interest endpoints.
- `app/api/labs/checkout`, `webhook`, `document`: payment and private document endpoints.
- `supabase/migrations/20260925010000_build_lab_series.sql`: additive tables and service-only transactional functions.
- `app/build-lab/legacy`: old founding-run page preserved, excluded from indexing. Its checkout returns here.
- Parent repo `app/education`, `lib/education.ts`: referral copy and links. Live prices/dates are no longer duplicated there.

## Finish in this order

### 1. Reconcile the existing business before changing live routing

Read both repos' instructions. Inspect the actual deployed branches, legacy `ccc_lab_*` registrations, existing course/ladder purchases, Stripe products, and Supabase project. Determine whether anyone already bought the old $997 November/December founding run. Those purchases, dates, and entitlements are preserved by this branch. Do not silently transfer a paying owner into the new offer or repurpose an old Stripe price.

Confirm production course domain (currently `runyouraiboard.com` in existing config) and parent domain (`aixdesign.dev`). Verify the contact mailbox `hello@aixdesign.dev` is monitored. No live email was sent during implementation.

### 2. Apply and test the additive database migration in staging

Run the new migration through the repo's existing Supabase process. It creates `ccc_bl_*` tables alongside existing legacy tables. Do not rename or overwrite legacy data. RLS is enabled; browser `anon`/`authenticated` roles have no direct table or RPC privileges. All new writes go through server routes using service role after user/instructor checks.

Run the migration on a disposable staging database first. Exercise two independent connections buying the last seat simultaneously: the local PGlite tests are useful PostgreSQL behavior tests, but are not a multi-connection Supabase load test.

Set instructor access using Terry's **actual Supabase user UUID**, not an email from the questionnaire.

### 3. Configure environment variables privately

See `environment.example` in this directory. Required:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Existing project authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only DB access; never expose to client |
| `NEXT_PUBLIC_SITE_URL` | Exact public origin for this deployment, without a path; used for redirects and same-origin form validation |
| `LAB_INSTRUCTOR_USER_IDS` | Comma-separated instructor Supabase UUIDs |
| `STRIPE_SECRET_KEY` | Existing Stripe account key; test mode in staging |
| `LAB_STRIPE_WEBHOOK_SECRET` | Signing secret of the **new dedicated** `/api/labs/webhook` endpoint |
| `LAB_CHECKOUT_ENABLED` | Keep `false` until payment verification and cohort setup pass |
| `OPENAI_API_KEY` / `LAB_AI_MODEL` | Optional AI drafting; choose a model supporting Responses structured JSON output |

Existing `STRIPE_WEBHOOK_SECRET`, course/ladder price IDs, and legacy lab variables are separate. Keep them intact. Set `NEXT_PUBLIC_SITE_URL` to the actual preview origin in a preview deployment too; otherwise origin checks and email return links will be wrong. Build-time public environment variables require a rebuild when changed.

Verify Supabase callback/confirmation redirect allowlists and email templates preserve `next=/lab-studio`. Test confirmation in a fresh browser, sign-in, sign-out, and an existing course owner's account. Configure authenticated email delivery/SMTP and check provider rate limits before advertising volume.

### 4. Schedule the cohort and connect a new Stripe price

The seed is `operating-company-founding`, program `ai-operating-company`, 8 seats, 199500 cents, USD, status `applications_open`.

Before setting `enrollment_open`, obtain the actual four session timestamps, time zone, duration, and approved enrollment terms. Terms need the confirmed refund/reschedule/cancellation policy, software cost responsibility, support scope, recordings/privacy practice, and any applicable tax treatment. The current recording copy says teaching blocks may be recorded and private working sessions are not recorded: Terry must be able to honor that before launch.

Create a **new one-time Stripe price** matching the configured tuition. Do not mutate the old price. The route checks amount, USD currency, one-time type, and active status. No coupons, installments, automatic tax, or subscription billing have been added to the new lab checkout. If taxes or installments are needed, implement and test them explicitly before selling those terms.

Update `ccc_bl_cohorts` with real `starts_at`, four ISO timestamps in `session_dates`, valid IANA `timezone`, `stripe_price_id`, `terms`, and then `status='enrollment_open'`. Starts_at should match the first session and all dates should be in order. The DB prevents enrollment_open with missing dates/terms/price but does not validate every date string. Use service-side admin access; no browser table grants.

Cohort scheduling is currently an admin database operation. The instructor UI shows readiness but does not yet edit cohort configuration. New foundation cohorts use new slugs/rows; do not recycle enrollment history. Future advanced labs remain interest lists until their own curriculum, tuition, and delivery are prepared.

### 5. Register and test the dedicated webhook

Endpoint: `https://<course-domain>/api/labs/webhook`

Events:

- `checkout.session.completed`
- `checkout.session.expired`
- `charge.refunded`

New product metadata is `build-lab-series`. The existing course webhook explicitly ignores this product, so it cannot accidentally grant permanent course access. It also ignores unknown explicitly tagged products. New course checkout sessions now set `product=course`; older untagged course sessions retain the historical compatibility path.

Use real Stripe **test-mode** sessions for an accepted staging account. Verify:

1. A submitted/waitlisted/declined owner cannot check out. Another account cannot use their application ID.
2. Accepted owner sees the exact dates, price, terms, and consent checkbox before hosted checkout.
3. Price or terms changes between display and reservation cannot charge an unreviewed quote.
4. Successful signed webhook grants one enrollment. Duplicate events and retries remain one enrollment.
5. Last-seat concurrency cannot oversell. A cancelled browser navigation leaves its hold until Stripe confirms expiration.
6. Expiration releases capacity, but a timestamp alone does not free an uncertain checkout.
7. Full refund revokes lab access and bundled course access unless an independent course purchase exists. Partial refunds intentionally retain access. A delayed payment event must not restore a refunded enrollment.
8. Wrong signatures, amounts, currency, session identity, and user identity cannot grant access.
9. An interrupted session-creation request retries with the same reservation idempotency key. Unknown sessions need reconciliation, not blind capacity release.
10. Run an existing course purchase and legacy lab purchase through their own endpoints to check for regressions. Do not make live charges for testing.

Set `LAB_CHECKOUT_ENABLED=true` only once staging payment checks pass and the live price/webhook/configuration have been verified.

### 6. Verify AI preparation and the complete learning flow

With a consenting test owner, submit the questionnaire. The Responses request uses `store:false`, no tools, and excludes account email/private instructor notes. Explicit opt-in is required. A manual template is available without credentials. Generation produces an unpublished draft.

Verify the selected model's structured output, timeout/error behavior, instructor edit/publish, student plan view, and Markdown download. Confirm notes/drafts never appear in the student response or download. Editing intake invalidates the previously published plan; generation and publishing check the intake revision. Repeat with consent unchecked: no AI request should be made.

The automatic draft uses Next `after()` and a 120-second route duration. It is not a durable job queue. Failed/interrupted generation needs instructor retry; do not describe it as guaranteed background processing. Hosting must permit the configured duration. Measure actual model cost/latency before selecting it for the cohort.

### 7. Finish launch operations and browser verification

Read `VERIFICATION.md`, run the included suites, and complete the unrun real-browser checks. In particular, test desktop/mobile layout, keyboard focus and error messages, actual authentication, the accepted-owner checkout return, and the whole instructor publish/feedback flow against staging.

Application decisions and plan publication currently update the workspace **without sending email**. The UI explicitly says so. Terry can operate the first small cohort with manual communication. If automatic notices are part of launch, use the already-connected email service with a durable outbox, idempotent delivery, transactional templates, and no private business answers in email. Do not silently add interest-list subscribers to the general newsletter. Interest-list removal is currently handled through the contact mailbox. Verify and publish the retention/removal procedure before campaigns.

Instructor queue currently shows the newest 250 applications; default Supabase row limits apply to other unpaginated instructor lists/CSV. This is sufficient for an initial eight-person cohort, not an unlimited-volume back office. Add pagination/export batching before running high-volume acquisition. Scheduled automatic checkout reconciliation is not included; the instructor has a manual reconciliation action.

### 8. Deploy and report

Create reviewable commits/PRs in both repos, deploy the course preview first and then the parent referral changes. Run staging gates before production. Report exact URLs, migration status, verified Stripe mode/price, webhook delivery, actual test evidence, and remaining owner decisions. Do not call the product market-ready merely because the build compiles.

## Recovery and rollback

- Disable new sales with `LAB_CHECKOUT_ENABLED=false`; existing paid workspaces remain accessible.
- Reconcile held reservations from the instructor workspace. Unknown Stripe session IDs require dashboard/API investigation by metadata and idempotency key. Never release a hold solely because its timestamp passed.
- Full refunds should be issued through the authorized Stripe workflow and reconciled by the signed webhook; the new app does not issue refunds.
- Reverting app code does not require dropping new tables. Retain payment/application records. If reverting code, keep the guard in the old webhook that ignores `build-lab-series`, or disable delivery of new lab events to that legacy endpoint.
- Keep this migration additive. Never delete the old `ccc_lab_*` registrations to simplify the new model.

## Pasteable instruction for Claude Code

> Import the two supplied Build Lab feature patches into their matching repos and read `docs/build-lab/CLAUDE-HANDOFF.md` in the course repo. The implementation is already built; preserve the foundation-first AI CEO/board method, rotating four-week labs, detailed intake, instructor review, and legacy paid enrollments. Use my connected accounts to finish the staging migration, auth configuration, instructor UUID, new Stripe price and dedicated webhook, optional OpenAI model configuration, and real-browser/payment verification. Follow the handoff's launch sequence, resolve current-branch conflicts, and show me a working preview plus exact remaining owner decisions before enabling live sales. Do not invent dates, scarcity, testimonials, or refund terms. Do not rebuild from scratch or overwrite my existing Stripe products.
