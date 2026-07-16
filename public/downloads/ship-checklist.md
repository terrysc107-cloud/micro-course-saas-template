# Ship Checklist

**The gate between "it works on my machine" and production.**

Five gates: review, test, browser QA, deploy, rollback. Each one is a stop —
if a gate fails, you do not proceed to the next one.

The gates you skip are the ones you feel confident about. That is not a
coincidence and it is not evidence: confidence is the *condition under which*
people skip steps, which makes it exactly the wrong thing to act on.

*Material from Claude Code Class, a course by AI by Design (aixdesign.dev).
Independent educational material. Not affiliated with or endorsed by Anthropic.
Claude Code changes weekly — the [official docs](https://code.claude.com/docs/en/overview)
are the final word on any tool detail here.*

---

## Gate 1 — Review

- [ ] You read the **full** diff. `git diff main...HEAD`. Not the summary of it.
- [ ] `git diff --stat` first — every file in that list has a reason to be there
- [ ] Nothing reformatted, "fixed," or upgraded in passing
- [ ] Every change traces to a done-criterion in the brief
- [ ] Nothing built that the brief lists as a non-goal
- [ ] Business rules exist in exactly one place — no second copy of the same logic
- [ ] Error paths handled, not just the happy path
- [ ] No secret, key, token, or connection string in the diff
- [ ] No debug output, no commented-out blocks, no stray `TODO` you meant to do

### Reviewed by a context that did not write it

- [ ] The review ran in a **fresh session**, a **subagent**, or another person

**Why this matters more than it sounds like it should:** the session that wrote
the code holds, in context, every reason each line seemed correct — the
constraints you gave, the tradeoffs you accepted, the things you said not to
worry about. Ask it to review and it re-derives its own reasoning and finds it
sound. It is not lying; it is checking the code against the assumptions that
produced the code.

Options that work:
- `/clear`, then review the diff with no build context in the window
- A reviewer **subagent** — each subagent runs in its own context window with
  its own system prompt and tool access
  ([docs](https://code.claude.com/docs/en/sub-agents))
- Another engineer

Neither replaces you reading the diff. They get you a second reader who is not
invested in the answer.

## Gate 2 — Tests

- [ ] The full suite passes — you ran it, you did not hear that it passes
- [ ] Types pass
- [ ] Lint passes
- [ ] Every bug fixed in this change has a test that **would have failed before the fix**
- [ ] No test was made green by weakening its assertion

### The check almost nobody does

- [ ] You **broke the implementation on purpose** and watched the relevant tests go red

Thirty seconds. A suite that stays green when you comment out the logic is not a
test suite — it is a green checkmark. This is the only way to tell the
difference from the outside, and a green suite that tests nothing is worse than
no suite, because it is trusted.

## Gate 3 — Browser QA

Green tests are not working software. Tests check the behavior you thought to
specify.

- [ ] Every done-criterion walked in a real browser, **one by one, against the written brief**
- [ ] Empty state — zero items. A bare table header is not an empty state.
- [ ] Single item — layouts written against three mock rows fall apart at one
- [ ] Error state — bad input rejected **and** not saved. Those are two claims; check both.
- [ ] Reloaded the page. In-memory state looks perfect until it does not.
- [ ] Loading states — no flash of wrong data before the real data arrives
- [ ] Actions give feedback — silence makes users click twice
- [ ] Console has no new errors

### Five minutes of hostility

- [ ] Submit twice, fast — duplicates?
- [ ] A 500-character input — layout survives?
- [ ] Unicode, emoji, an apostrophe — `O'Brien` is a real name and a real bug
- [ ] Navigate away mid-action
- [ ] Values exactly on a boundary — the "more than 3 days" that is exactly 3 days

- [ ] Bugs found were **written down first**, then fixed — fix-as-you-find means
      you stop at the first bug and never finish the pass, and the interesting
      ones cluster at the end

**Validation note:** if you only tested through your own form, you tested the one
client that behaves. Anything that can POST can skip client-side validation.
Send a request directly at least once.

Claude Code's [Chrome surface](https://code.claude.com/docs/en/chrome) can debug
live web apps if you want help driving this.

## Gate 4 — Rollback plan (**before** deploying)

The moment you need a rollback is the worst possible moment to invent one. Users
are affected, you are guessing at causes, and every cheap option required a
decision you did not make. Make them now, while it is boring.

- [ ] **How do I undo this?** A command, a button, a specific build id. Timed.
      Five minutes and forty minutes are different decisions.
- [ ] **What does it NOT undo?** Migrations. External API calls. Sent emails.
      Third-party writes. Anything that left your system.
- [ ] **If a migration ran:** does the previous code still work against the new
      schema? You **verified** this — you did not assume it. Additive migrations
      are usually backward compatible, right up until the old code has a
      `SELECT *` and a strict deserializer.
- [ ] **How will I know?** What you check, and when. "Users complain" has a
      latency of days.
- [ ] Data snapshot taken — **before** the migration, not after
- [ ] **Known-good build id written down** somewhere you will find it while panicking

That last one is the cheapest insurance on this page. Five seconds. It converts
"roll back" from an investigation into a command, and the investigation is the
part that costs twenty minutes while production is broken.

**If code and data cannot roll back independently, you do not have a rollback.
You have a hope.** Fix that before you deploy, not after.

## Gate 5 — Deploy

In this order:

1. [ ] **Preview deploy** of the exact build you intend to promote — not "basically the same"
2. [ ] **QA the preview**, not localhost. Env vars, build mode, and network latency all differ, and bugs live in the gap. Re-walk the criteria. Yes, again.
3. [ ] **Record the current known-good build id**
4. [ ] **Snapshot the data**
5. [ ] **Migration first, then code** — additive migrations are safe ahead of the code that uses them; the reverse ships code querying columns that do not exist
6. [ ] **Promote**
7. [ ] **Check immediately** — exercise the actual feature, not just a 200 on the homepage
8. [ ] **Check again** at the interval you decided in gate 4

---

## If the checks fail

**Roll back first. Diagnose after.**

The instinct is to fix forward — you can see the bug, the fix is one line. It is
occasionally right and usually a trap. You are reasoning under pressure about a
system that just surprised you, which means your model of it is wrong in at least
one place you have not found yet. That is the worst possible state in which to
write code and put it in front of users.

Roll back. Production is healthy. Debug on your own schedule, with a
reproduction and a clear head, which is how debugging is supposed to work.

**A rollback is not a failure. It is the plan working.** The failure would have
been not having one.

---

## Post-ship

- [ ] Checked at the stated interval
- [ ] Branch merged, or PR open with the review findings noted
- [ ] Deferred findings written down somewhere real — not left in a closed session
- [ ] Anything that surprised you added to `CLAUDE.md` or the review checklist,
      so the next build starts smarter than this one did
