# Build Brief: [Feature Name]

> **One page. If it runs longer, you are designing, not scoping.**
>
> Write this **before** you open an agent session. Not because process is
> virtuous, but because plan mode, code review, and QA all measure your work
> against *something* — and if that something only exists in your head, it
> quietly reshapes itself every time you are tired or impressed by a
> good-looking diff. A brief you wrote yesterday is a witness you cannot bribe.
>
> *Material from Claude Code Class, a course by AI by Design (aixdesign.dev).
> Independent educational material. Not affiliated with or endorsed by Anthropic.*

---

**Date:** [YYYY-MM-DD]
**Author:** [you]
**Status:** [draft / agreed / built / shipped]

---

## 1. Problem

<!--
What is broken TODAY. Present tense, one or two sentences. No solution here.

Bad:  "We need a lead tracking dashboard."      (that is a solution)
Good: "Inbound leads arrive by email and DM, get triaged in a notes app, and
       then forgotten. Leads go cold because nobody remembered to reply."

If you cannot state the problem without naming the thing you want to build,
you have not found the problem yet.
-->

[What is broken today, and what it costs.]

## 2. User

<!--
Who specifically, and what they are doing when they touch this. "Users" is not
an answer. The context matters more than the persona: someone checking this for
two minutes before their first meeting needs a different thing than someone
sitting in it all day.
-->

[Who. What they are doing when they use this. How often. How long.]

## 3. Done-criteria

<!--
The list that defines finished. This is the most important section on the page.

Each one must be CHECKABLE BY SOMEONE WHO DID NOT BUILD IT. If it cannot be
run against the app for an unambiguous pass or fail, it is a wish, not a
criterion.

  Wish:      "Overdue leads are easy to spot."
  Criterion: "The Overdue view lists leads with status New or Waiting whose
              last activity is more than 3 days old."

Include the boring ones. Empty state and error state are where the real bugs
live, and they are the ones nobody writes down.

Number them. You will refer to them by number in review and QA.
-->

1. [Checkable statement]
2. [Checkable statement]
3. [Checkable statement]
4. [Empty state: what happens with zero items?]
5. [Error state: what happens with bad input? Be specific about rejected vs. not saved.]

## 4. Non-goals

<!--
What you are explicitly NOT building. Underrated, and the section people skip.

Two reasons it earns its place:
  - It stops an agent from helpfully adding the search box, the tags, the bulk
    import — all things that belong in a tool like this in general.
  - It lets you DISMISS a legitimate review finding without wondering whether
    you are being lazy. "No pagination" is a true observation about a brief
    that says no pagination.

A scope boundary you never wrote down is a scope boundary you cannot enforce.
-->

- [Not building this]
- [Not building this either]
- [Explicitly out of scope, even though it is adjacent and tempting]

## 5. Constraints

<!--
Non-negotiables. Stack, deadline, data rules, compliance, existing systems you
must not break. Anything that makes an otherwise-good approach unavailable.
-->

- Stack: [...]
- Deadline: [...]
- Data: [e.g. no PII leaves our infrastructure]
- Must not break: [existing thing]

## 6. Rollback plan

<!--
Decided NOW, before there is any code to be attached to.

The moment you need a rollback is the worst possible moment to design one:
users are affected, you are guessing at causes, and every cheap option required
a decision you did not make. Make the decisions while they are boring.

Answer all three. Vague answers here become outages later.
-->

**How do I undo this?**
[A command. A button. A specific build id to promote. If the answer is "revert
and redeploy," how long does that take? Five minutes and forty minutes are
different decisions.]

**What does the rollback NOT undo?**
[The one people miss. If you ran a migration, rolling back the code does not
roll back the schema. So: does the previous version of the code still work
against the new schema? If code and data cannot roll back independently, you
do not have a rollback — you have a hope. Verify it, do not assume it.]

**How will I know I need it?**
["Users complain" has a latency measured in days. What do you check, and when?
Even "open the app 15 minutes after deploy and add a record" beats nothing.]

---

## Ambiguities found while writing this

<!--
Keep this section. Writing a brief surfaces questions you would otherwise
discover mid-build with a schema already written.

Real example: "overdue after 3 days" — since the lead arrived, or since you
last did something about it? That is a data modeling decision, and finding it
in a text file costs nothing. Finding it after the migration costs a migration.

Every ambiguity here is a decision you get to make deliberately instead of
having made accidentally.
-->

- [Question I need to answer before building] → [decision, and why]
- [Question I am deferring] → [deferred, and what it will cost to decide later]

---

<!--
BEFORE YOU OPEN AN AGENT SESSION:

  [ ] Every section filled, including the ones that felt obvious
  [ ] Every done-criterion checkable by someone who did not build it
  [ ] Non-goals are specific enough to reject a diff with
  [ ] Rollback plan names what it does NOT undo
  [ ] This is one page

Then hand it to plan mode and make it argue with you.
-->
