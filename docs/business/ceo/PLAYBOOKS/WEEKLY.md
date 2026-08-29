# PLAYBOOK — The weekly run

Run this end to end, in order. Roughly 30 minutes. It encodes the freshness pass
that was previously done by hand and forgotten about for 40 days.

If this playbook and any external cron prompt ever disagree, **this file wins.**
It is the version the Chairman edits.

---

## Step 0 — Read the inbox

Open `CHAIRMAN-NOTES.md` and act on anything under "New directives" before doing
anything else. Move handled items to Processed with a one-line note.

Then read `CHARTER.md` and `PROMOTION-LADDER.md`. Know what you may do before
you start doing things.

## Step 1 — Liveness check

**Is this playbook itself still running?** Look at the newest file in
`BOARD-MEETINGS/`. If it is more than 10 days old, that gap is the headline of
this report, not a footnote.

A scheduled system that dies silently is the most common failure in this whole
design. The sibling board lost its daily engine for 40 days because nothing
checked. Check.

## Step 2 — Pull the metrics

Run the queries recorded in `METRICS.md`. Do not improvise a variant. Update the
table and the pull date.

For anything you could not pull, write what is missing and why. **Never
estimate.** A gap reported is useful; a gap filled with a plausible number is
worse than no report.

## Step 3 — The freshness pass

The core job. This is what the product is actually selling.

1. Re-verify `docs/CLAUDE-CODE-FACTS.md` against <https://code.claude.com/docs>.
   Check the areas where drift concentrates: install, authentication, permission
   modes, and the command surface.
2. **Re-check your own previous corrections.** A correction can go stale. This
   has already happened once: the fact base recorded that `/cost` no longer
   existed, and it exists again as an alias.
3. Where a lesson states something now false, draft the fix. **Do not edit
   `content/` directly** — propose it in the report.
4. If anything changed, bump `LAST_VERIFIED` in `lib/course-config.ts` and write
   the changelog entry.
5. Run `npm run check`. It must exit 0.

## Step 4 — Draft the changelog and the newsletter

Both as drafts, both in the report. Never send.

The changelog is the honest version: what changed in the tools, what broke in
the course, what was fixed. The newsletter is that, written for a reader who
does not have the repo open.

If nothing changed, say so in one line. A newsletter that manufactures news to
justify its own existence is how a list dies.

## Step 5 — Write the report

`BOARD-MEETINGS/YYYY-MM-DD.md`, from `BOARD-MEETINGS/TEMPLATE.md`.

Goal: the Chairman can act on it in five minutes. Asks capped at three, ordered
by what they unblock.

## Step 5 — Promotion and asks. Mandatory, never skip.

State the current rank, whether you are requesting a promotion, and if not, why
not. Then state your own goals for the coming week and the specific executable
thing you need from the Chairman.

Silence here is a failure, not modesty. This step exists because a seat that
never asks never gets what it needs, and then quietly underperforms for reasons
nobody wrote down.

## Step 6 — Log and propose

- Append every decision to `DECISION-LOG.md` with the rank it was made under
- Append anything learned to `memory/CANDIDATES.md`. **Never write to
  `memory/LEARNINGS.md`** — Terry promotes, and only after the same lesson has
  shown up in two independent runs

## Step 7 — Guardrail pre-flight

Before the report is considered done:

- [ ] No outcome, income, or pass-rate claims anywhere in what I wrote
- [ ] Every number traces to `METRICS.md`, and gaps are named as gaps
- [ ] Nothing was published, sent, merged, deployed, or spent
- [ ] `content/` was not edited directly
- [ ] Decisions logged with rank; asks are specific and executable
- [ ] Step 5 not skipped
- [ ] When unsure, I escalated rather than acted
