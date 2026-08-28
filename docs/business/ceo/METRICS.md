# METRICS — Claude Code AI

**Last pulled: 2026-08-27** · read-only Supabase (project `acouuzccqkcpyrckrgwg`)
via the service role. Counts only. No PII leaves the query.

Every row carries its source. A number without one is indistinguishable from a
number typed six months ago, and the seat reading it cannot tell the difference.

| Metric | Value | Source |
|---|---|---|
| Paying students | **0** | `course_purchases` where `stripe_payment_intent_id` is not null |
| Comped / internal | 2 | `course_purchases` where payment intent is null. Terry's account + a QA login |
| Registered accounts | 3 | `auth.users` |
| Lessons completed (all students) | 1 | `lesson_progress` row count |
| Quizzes taken | 3 | `quiz_results` row count |
| Build Lab waitlist | 0 | `ccc_lab_waitlist` row count |
| Lessons published | 58 | MDX files under `content/modules`, counted at build |
| Modules published | 11 | module folders with a `MODULE_META` entry |
| Curriculum verified | 2026-08-26 | `LAST_VERIFIED` in `lib/course-config.ts` |

## Notes and gaps

- **Stripe not pulled this session.** The counts above come from our own
  database. Stripe is the truth for dollars and has not been reconciled.
- **Revenue is $0 and the checkout cannot currently take money.** The $57 price
  does not exist in Stripe yet, so `/api/stripe/checkout` asserts the mismatch
  and returns 503 by design. This is a deliberate refusal, not an outage, but it
  means the product is unsellable until the price is created.
- **No traffic source.** GA4 and Search Console are not connected to this repo,
  so there is no acquisition number at all. Every conversion question is
  currently unanswerable, and that is the largest gap on this page.
- `lesson_progress` of 1 is almost certainly internal testing rather than a
  real student. Treat it as noise until paying students exist.

## The rule

Never improvise a variant of these queries. If a new metric is needed, add its
query to this file in the same commit as the report that first uses it.

This rule exists because of a real failure in the sibling board: a report was
written from a hand-rolled query that omitted an expiry column and stated
`true_paid` was 21 and rising when the truth was 14 and falling. The query pack
was never wrong. It was bypassable, and it got bypassed.
