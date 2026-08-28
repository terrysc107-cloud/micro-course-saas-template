# The Claude Code AI board — CEO seat

This directory is a working AI board running the business that sells a course
about running AI boards. It is a real operating system for this product **and**
the case study the curriculum teaches from.

That double duty is deliberate. Every artifact here has to survive being read by
a paying student, which is a much higher bar than "good enough for me."

---

## What to read, and when

This is the index. A run reads this file first, then the tier it needs. Reading
everything is not the plan and stops being possible around month three.

### Tier 1 — Identity. Read every run, changes rarely.

| File | What it is |
|---|---|
| `CHARTER.md` | Who this seat is, what it may do alone, what it must never do |
| `PROMOTION-LADDER.md` | The autonomy ladder, current rank, and what the next rung costs |

### Tier 2 — Hot state. Read every run, changes constantly, kept SHORT.

| File | What it is |
|---|---|
| `CHAIRMAN-NOTES.md` | Terry's inbox to the seat. **Read this first, before anything else.** |
| `GOALS.md` | Floors, not targets. What "not good enough" looks like in numbers |
| `METRICS.md` | Current numbers, each with the source that produced it |

Tier 2 files are short on purpose. Everything in this tier costs context on
every single run, so history gets moved out rather than allowed to accumulate.

### Tier 3 — The record. Written often, read almost never, grows forever.

| Path | What it is |
|---|---|
| `DECISION-LOG.md` | Every decision, stamped with the rank it was made under |
| `BOARD-MEETINGS/YYYY-MM-DD.md` | One dated file per meeting. Never one growing file |

**Rotation rule:** when a Tier 3 file passes roughly 40KB, split it by date
(`DECISION-LOG-2026.md`) and leave a pointer. A run should never have to load a
year of history to do this week's job.

### Tier 4 — Learned. Read occasionally, written rarely, makes the system smarter.

| File | What it is |
|---|---|
| `memory/CANDIDATES.md` | Lessons the seat proposes. The seat writes here freely |
| `memory/LEARNINGS.md` | Lessons Terry has promoted. **Only Terry writes here** |

The split is the whole point. An agent editing its own long-term memory
unsupervised is how a system drifts into confidently believing things nobody
checked. Promotion requires evidence from two independent runs.

### Tier 5 — Procedure.

| Path | What it is |
|---|---|
| `PLAYBOOKS/WEEKLY.md` | The weekly run, start to finish |

---

## Reading order for a weekly run

1. `CHAIRMAN-NOTES.md` — act on open items first
2. `CHARTER.md` and `PROMOTION-LADDER.md` — remember who you are and what you may do
3. `PLAYBOOKS/WEEKLY.md` — run it end to end
4. Write to `BOARD-MEETINGS/<today>.md`, append to `DECISION-LOG.md`, propose into `memory/CANDIDATES.md`

## Never touch

- `memory/LEARNINGS.md` — Terry promotes; the seat proposes in `CANDIDATES.md`
- Anything under `content/` — course lessons are the product, and edits reach
  paying customers. The seat drafts changes as a proposal in the board report
- Anything that sends, publishes, posts, or charges. See `CHARTER.md` §4
