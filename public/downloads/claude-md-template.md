# CLAUDE.md

<!--
=============================================================================
CLAUDE.md TEMPLATE
Material from Claude Code Class, a course by AI by Design (aixdesign.dev).
Independent educational material. Not affiliated with or endorsed by Anthropic.
Official docs: https://code.claude.com/docs/en/memory  (docs change — check them)
=============================================================================

WHAT THIS FILE IS
CLAUDE.md sits in your project root and is read at the start of every session.
It is where you put coding standards, architecture decisions, preferred
libraries, and review checklists — the things you would otherwise re-explain
every single time you open a session.

THE TWO RULES THAT MATTER

1. EVERY LINE IS RECURRING COST.
   This file is in context for every session, forever. A 400-line CLAUDE.md is
   400 lines of tokens you pay for on every task, including the ones it has
   nothing to do with. It also dilutes: the more instructions there are, the
   less weight any single one carries. Short and specific beats long and
   thorough. If a section only matters for one kind of task, it belongs in a
   Skill (loaded only when used) — not here.

2. THIS IS NOT A SECURITY BOUNDARY.
   Permission rules are enforced by Claude Code. CLAUDE.md is read by the model.
   Writing "never touch production" shapes what Claude TRIES to do; it does not
   change what Claude Code ALLOWS. Anything that must not happen goes in your
   permission settings, not in this file.
   See: https://code.claude.com/docs/en/permissions

HOW TO USE THIS TEMPLATE
Delete every section you would not miss. A 30-line CLAUDE.md that is all true
beats a 200-line one that is half aspirational. Claude also builds auto memory
as it works, saving things like build commands across sessions — so you may not
need to write down as much as you think.
=============================================================================
-->

## What this project is

<!--
One or two sentences. What it does, who uses it. This is the cheapest section
in the file and one of the highest-value: it stops Claude from guessing at
intent from folder names.
-->

[One sentence: what this application does and who uses it.]

## Stack

<!--
Versions matter. "Next.js" tells Claude very little; "Next.js 15, App Router"
rules out a large amount of confidently wrong output aimed at a different
major version. List only what a new contributor could not infer in ten
seconds — skip anything already obvious from package.json.
-->

- Language / runtime: [e.g. TypeScript 5.x, Node 22]
- Framework: [e.g. Next.js 15, App Router — not Pages Router]
- Database / ORM: [e.g. Postgres via Prisma]
- Styling: [e.g. Tailwind]
- Testing: [e.g. Vitest + Playwright]
- Deploy target: [e.g. Vercel]

## Commands

<!--
The commands you actually run. Wrong here is worse than absent: Claude will
run what you wrote, watch it fail, and start improvising. Verify each line
before you commit this file.
-->

```bash
[npm run dev]        # local dev
[npm test]           # unit tests
[npm run test:e2e]   # end-to-end
[npm run typecheck]  # types
[npm run lint]       # lint
[npm run build]      # production build
```

## Conventions

<!--
Only the conventions a reader could NOT infer from the code in one minute.
Two useful tests before adding a line:

  - Would a competent new contributor guess wrong here?
  - Has this actually bitten someone?

If the answer to both is no, delete the line — you are paying tokens for it
on every task forever.

House style that a linter or formatter already enforces does not belong here.
The linter is deterministic and free; the model is neither.
-->

- [e.g. Server Components by default. `"use client"` only where interactivity requires it.]
- [e.g. Data access lives in `lib/db/`. Components never query the database directly.]
- [e.g. Errors: return typed results, do not throw across module boundaries.]
- [e.g. Dates are stored and passed as ISO strings, converted at the display layer only.]

## Review checklist

<!--
What you want checked before Claude says it is done. This is a request, not a
gate — it shapes behavior but does not enforce anything. Keep it to the things
that actually go wrong in this repo.
-->

Before presenting a change as complete:

- [ ] It does what was asked and nothing that was not
- [ ] No unrelated file touched, reformatted, or "fixed" in passing
- [ ] Error paths handled, not just the happy path
- [ ] Business rules exist in exactly one place — no second copy
- [ ] Tests would fail if the behavior they name broke
- [ ] [Your repo's specific recurring mistake]

## Do not touch

<!--
Directories and files that are off-limits, WITH REASONS. A reason makes the
rule apply to the analogous case; a bare prohibition only covers the literal
path listed.

REMINDER: this is a request, not a boundary. If it MUST NOT happen, encode it
in permission rules (`permissions.deny`, or `/permissions` interactively),
which Claude Code enforces regardless of what the model intends.
https://code.claude.com/docs/en/permissions
-->

- `[migrations/]` — never edit an applied migration; add a new one instead
- `[generated/]` — generated output, changes here get overwritten
- `[.env*]` — never read, echo, or copy values from these
- `[vendor/, patches/]` — hand-patched, changes will be lost on update

## Non-goals

<!--
Underrated section. Claude is trained to be thorough and will helpfully add
the abstraction, the caching layer, the error boundary, the config option.
Naming what you are deliberately not doing prevents a whole class of diff
you would otherwise have to reject one at a time.
-->

- [e.g. No new dependencies without asking. We are keeping the tree small on purpose.]
- [e.g. Do not refactor adjacent code while fixing a bug. One concern per diff.]
- [e.g. Do not add abstraction for a second use case that does not exist yet.]
- [e.g. Do not add caching. Current scale does not need it and it hides bugs.]

<!--
=============================================================================
WHAT TO LEAVE OUT — read this part twice

SECRETS, KEYS, TOKENS, CONNECTION STRINGS, CREDENTIALS
  Never. This file is in context every session and is usually committed to
  version control. Reference the NAME of an env var; never its value.

ANYTHING YOU NEED ENFORCED
  Permission rules are enforced by Claude Code. This file is read by the model.
  "Never run migrations in production" here is a strong suggestion. In
  permission settings it is a rule. Know which one you needed.

LONG REFERENCE MATERIAL
  API docs, style guides, architecture essays, onboarding notes. A Skill's body
  loads only when the skill is used, so a 500-line reference costs nothing until
  it is needed. The same 500 lines here cost you on every task forever.
  https://code.claude.com/docs/en/skills

ANYTHING THE CODE ALREADY SAYS
  Dependency lists (package.json), formatting (your formatter), directory
  layouts Claude can see. Restating it costs tokens and creates a second source
  of truth that will drift.

ASPIRATIONAL RULES
  Conventions you wish you followed but do not. Claude will apply them, produce
  code inconsistent with the rest of the repo, and you will have created a
  problem out of a wish. Document the repo you have.

TASK-SPECIFIC INSTRUCTIONS
  "Fix the header bug" is a prompt, not a memory.

STALE ARCHITECTURE NOTES
  A wrong CLAUDE.md is worse than none — it makes confident, incorrect output
  cheaper to produce. If you would not fix a line during a rushed week, do not
  add it.

A GOOD SIGN
  You are unsure whether a section is worth keeping. Delete it. If its absence
  hurts, you will notice within a day and can add it back knowing why.
=============================================================================
-->
