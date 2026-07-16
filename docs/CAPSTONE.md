# Capstone: Lead Follow-Up Command Center

**Module:** `content/modules/09-capstone/` · **Lessons:** 6 · **Reading time:** ~82 min
(build time is much longer — that's the point)

The one guided build in the course. Everything before it teaches pieces of the loop; the
capstone runs the whole thing once, in order, on something real.

---

## Why this project

**Lead Follow-Up Command Center** — a solo consultant pastes in inbound leads, sees them in
a list, marks follow-up status, and gets a view of who is overdue for a reply.

Chosen against three constraints that most course projects fail:

1. **Finishable.** A learner can complete it in a sitting or two. A capstone nobody finishes
   teaches nothing.
2. **Genuinely real.** It has data modeling, state transitions, a time-based derived view
   ("overdue"), and edge cases that actually bite (what is overdue, exactly? what timezone?).
   A todo app has none of that and everyone knows it.
3. **Not a framework tour.** The interesting decisions are about the domain, not about
   wiring. The loop is the lesson; the stack is incidental.

Suggested stack is Next.js plus a simple persistence layer, and the lessons say plainly that
learners may substitute their own. Someone who runs this loop in Django or Rails has
succeeded, not deviated.

## The standardized path

One path, taught once, applied everywhere. This is `CORE_LOOP` in `lib/course-config.ts`
made concrete:

| # | Lesson | Loop stage | The point |
|---|---|---|---|
| 1 | Brief and Inspect | Inspect | Write the brief *before* code. Make Claude prove it understands the repo before it proposes anything |
| 2 | Plan and Scaffold | Plan | Agree the approach in plan mode. **Reject the first plan.** Then scaffold |
| 3 | Data and Schema | Build | Model the data. Slow down — irreversible mistakes live here |
| 4 | Build the Feature | Build | Small reviewable increments. Recover when it goes off the rails |
| 5 | Tests and Review | Review + Test | Tests that catch the bug you just fixed. Review in a fresh context |
| 6 | QA, Ship, and Rollback | Ship | Browser QA against lesson 1's done-criteria. Ship behind a plan you can undo |

The sequence is closed: lesson 6 checks off the criteria written in lesson 1. If the brief
was vague, the learner discovers it at QA — which is the actual lesson about briefs, and it
can't be taught by telling.

## Deliberate teaching choices

**The brief comes first, and includes non-goals.** Most people cannot say what they are
*not* building. The non-goals section is where scope creep gets pre-empted, and it's the
part learners skip.

**Lesson 2 rejects a plan on purpose.** A bad plan accepted quickly costs more than ten
minutes of arguing. Learners need to see a plan critiqued before they'll believe they're
allowed to critique one.

**Lesson 4 covers Claude going wrong.** The recovery move — stop, don't argue with a
poisoned context, reset and re-scope — is the single most useful habit in the course, and it
cannot be taught from a happy path.

**Lesson 5 reviews in a fresh session.** Don't let the thing that wrote the code mark its
own homework. A subagent or new session has no investment in the previous decisions.

**Lesson 6 rolls back.** Almost no course shows a rollback. Deciding the undo path *before*
deploying is what separates shipping from gambling.

## Downloads

| Asset | Linked from |
|---|---|
| [Build brief template](../public/downloads/build-brief-template.md) | Lesson 1 |
| [Ship checklist](../public/downloads/ship-checklist.md) | Lesson 6 |

Both are ours. Neither may imply it is an Anthropic-provided asset. `TEMPLATES` in
`lib/course-config.ts` pins each download to its lesson, and `npm run check:content` fails
if a download is missing, unlinked, or unattributed.

## What this is not

- **Not a second LMS.** No submission system, no grading, no review queue. Learners build on
  their own machine and check their own work against the done-criteria.
- **Not a certificate.** There is nothing to award and nobody to award it.
- **Not stack-prescriptive.** Substituting your stack is expected.

## Navigation

Capstone is module 09, between "Extending Claude Code" (08) and "Professional Practice"
(10). It appears in the sidebar, the dashboard module grid, and prev/next navigation
automatically — `lib/content.ts` derives everything from the filesystem and `MODULE_META`.

## Video

Three recordings planned (08, 09a–c, 10 in `docs/VIDEO-TRACKER.csv`), covering kickoff, the
three-part build, and QA/ship/rollback. **The capstone is complete and usable without them.**

Recording note: `09b` must contain a real failure and recovery. If the build goes clean, keep
recording until something breaks. It will.

## Known gaps

- **No starter repo.** Learners scaffold from scratch in lesson 2. Deliberate — scaffolding
  is part of the loop — but a reference implementation to diff against would help learners
  who get stuck, and would let us verify the capstone still works as tooling changes.
- **No solution branch.** Same trade-off. Worth revisiting after the first real learners.
- **Untested end to end by a human.** The lessons are internally consistent and were written
  against the verified fact base, but nobody has sat down and built the whole thing start to
  finish yet. **That is the highest-value validation available before launch** — see
  `docs/LAUNCH-READINESS.md`.
