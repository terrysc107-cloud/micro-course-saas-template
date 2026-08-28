# GOALS — Claude Code AI

**Floors, not targets.** Every number here is the minimum acceptable outcome,
not something to hit and celebrate. Report distance to the floor and whether we
will clear it. Never report "percent to target" — that framing turns a floor
into a ceiling.

Newest review on top.

---

## Week of 2026-08-27 — first set

Set by the CEO seat on the day the board was stood up. No prior week to compare
against, so nothing is graded yet.

### The honest starting position

Zero paying students. Two comped accounts, both internal. Revenue $0, and
checkout currently **cannot** take money because the $57 Stripe price does not
exist. The product is finished enough to sell and structurally unable to.

That single fact outranks everything else on this page.

| # | Goal | Floor | By | Definition of done |
|---|---|---|---|---|
| **G1** | **Checkout can take money** | $57 Stripe price exists, `NEXT_PUBLIC_STRIPE_PRICE_ID` updated, one live test purchase refunded | **2026-08-29** | `/api/stripe/checkout` returns a session instead of a 503. **Chairman only — the seat cannot touch Stripe** |
| **G2** | **First paying student** | floor **1** | 2026-09-14 | A `course_purchases` row with a real payment intent. Not comped, not me |
| **G3** | **Curriculum never stale** | verification date **≤ 7 days old**, every week | ongoing | `LAST_VERIFIED` current and a changelog entry saying what actually changed |
| **G4** | **Acquisition is measurable** | any traffic source connected | 2026-09-07 | A number on `/proof` that answers "how many people saw the page." Today: none |
| **G5** | **The board is useful** | Terry acts on ≥1 item per report | ongoing | Four consecutive reports with zero actions taken means this seat is producing correct, unread analysis |

### What we are deliberately not doing

- **No community launch.** Zero students means an empty room, which is worse
  than no room. Revisit at 10 paying students.
- **No paid acquisition.** Spending to drive traffic at a checkout that returns
  503 would be setting money on fire.
- **No new lessons** until G1 and G2 clear. The course is 58 lessons and has
  sold nothing. More content is not the constraint.

### Pushback, stated rather than offered as a menu

**The Dev Pack and the Kit should stay unavailable.** Both are configured and
both are `available: false`. There will be pressure to switch them on for
optional revenue. Do not. Selling a second product before the first has a single
customer splits an already thin story, and the Kit's pitch currently overlaps
what the course teaches. Fix the course's first sale, then the ladder.

**`docs/content/WEEK-01.md` must not be published as written.** It describes the
$97 developer positioning that no longer exists, and its Day 3 post is a
screenshot of `/proof`. Publishing it would put a wrong price and a stale claim
in front of the first audience this product ever has.

### My one ask this week

**G1 is a Chairman-only action and everything else is blocked behind it.**
Create the $57 Stripe price. It is roughly ten minutes in the Stripe dashboard
plus one environment variable. Until it exists, every other goal on this page is
theatre.
