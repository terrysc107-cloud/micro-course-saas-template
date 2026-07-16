---
# =============================================================================
# SKILL.md STARTER
# Material from Claude Code Class, a course by AI by Design (aixdesign.dev).
# Independent educational material. Not an Anthropic-provided asset, and not
# affiliated with or endorsed by Anthropic.
#
# Official docs: https://code.claude.com/docs/en/skills
# Skills follow the Agent Skills open standard: https://agentskills.io
# Claude Code ships weekly. If the docs and this file disagree, the docs win.
#
# WHERE THIS FILE GOES
#   .claude/skills/<name>/SKILL.md   — project skill, shareable via git
#   ~/.claude/skills/<name>/SKILL.md — user skill, available in every project
#
# THE DIRECTORY NAME IS THE COMMAND
#   A file at .claude/skills/ship/SKILL.md creates /ship — even if the `name`
#   field below says something completely different. `name` is only the display
#   label in listings. This trips people up constantly.
#
#   Custom commands have been merged into skills: .claude/commands/deploy.md
#   and .claude/skills/deploy/SKILL.md both create /deploy. Existing commands/
#   files keep working.
#
# WHY A SKILL AND NOT CLAUDE.md
#   CLAUDE.md is in context for EVERY session — every line is a recurring cost
#   on every task, including the ones it has nothing to do with. A skill's body
#   loads only when the skill is used, so a long reference costs nothing until
#   it is needed.
#
#   Always relevant → CLAUDE.md.  Sometimes relevant → a skill.
#
# EVERY FIELD BELOW IS OPTIONAL. `description` is the one worth writing.
# Delete the rest until you need them, and delete these comments before you
# ship — they are here to teach, not to live in your repo.
# =============================================================================

# Display label in listings. Defaults to the directory name, so omit it unless
# you want the label to read differently from the folder.
name: My Skill

# THE FIELD THAT DECIDES EVERYTHING.
# This is how Claude judges whether the skill applies. Write it for someone who
# has never seen your repo, and state BOTH what it does AND when to use it — a
# description that only says what it does gives Claude nothing to match a
# situation against, so it either never fires or fires constantly.
#
#   Weak:   "Helps with deployments."
#   Strong: "Runs this repo's pre-deploy gate: full test suite, type check, and
#            a diff review against the build brief. Use before any production
#            deploy, or when the user says ship, deploy, or release."
#
# Vague descriptions are the number one reason a skill sits unused.
description: One sentence on what this does. Use when <the trigger situation>.

# --- Everything below is optional. Start by deleting all of it. -------------

# Extra trigger phrases, appended to `description`. The two share a combined
# 1,536-character cap. Useful when the natural trigger words don't fit cleanly
# into the description sentence.
# when_to_use: trigger phrase, another phrase, example request

# Tools usable WITHOUT a permission prompt while this skill is active.
# This WIDENS what runs without asking you. Scope it to what the skill actually
# needs — a skill that reads code and runs tests does not need write access.
# allowed-tools: Read Grep Glob

# Tools removed from the pool entirely while this skill is active. Good for a
# review or audit skill that should be structurally incapable of editing: a
# constraint is stronger than an instruction not to.
# disallowed-tools: Write Edit

# true = Claude will never invoke this on its own; only you, via /<name>.
# Use it for anything with consequences — deploys, migrations, anything that
# touches production. Make it a deliberate act.
# disable-model-invocation: true

# false = hidden from the / menu. Background knowledge that informs Claude but
# that you never invoke by hand. Pairs well with `paths`.
# user-invocable: false

# Named positional arguments, substituted into the body as $name. Accepts a
# space-separated string or a YAML list; names map to positions IN ORDER.
# With `arguments: [issue, branch]`, /my-skill 42 fix-auth makes $issue expand
# to 42 and $branch to fix-auth.
# arguments: [issue, branch]

# Autocomplete hint shown in the / menu. Cosmetic, genuinely helpful.
# argument-hint: [issue-number]

# `fork` runs this skill in a forked subagent context — its exploration burns
# its own context window and returns only the result, instead of flooding your
# main conversation. See https://code.claude.com/docs/en/sub-agents
# context: fork

# Which subagent type to use when `context: fork` is set. Subagent definitions
# live in .claude/agents/.
# agent: my-agent-type

# Globs limiting when this skill auto-activates. Same glob format used by
# path-specific memory rules. Keeps a stack-specific skill from firing on files
# it knows nothing about.
# paths: src/api/**, db/migrations/**

# Model override for the turn, or `inherit`.
# Prefer `inherit`. A hardcoded model id means the skill silently keeps using an
# old model as new ones ship, and it is a maintenance task you will forget. Use
# /model to see and change the current model.
# model: inherit

# Reasoning effort while active: low, medium, high, xhigh, max.
# Higher is not free. Spend it where the task is genuinely hard.
# effort: high

# Hooks scoped to this skill's lifecycle only — they do not apply outside it.
# https://code.claude.com/docs/en/hooks
# hooks: {}

# bash (default) or powershell.
# shell: bash
---

<!--
=============================================================================
THE BODY

Loaded only when the skill is used — that is the entire economic argument for
skills. But once loaded, it stays in context for the rest of the conversation,
so it is not free either. Write it tight.

Write INSTRUCTIONS, not explanations. State what to do; skip the narration
about why the procedure exists. The reader is a capable engineer who has never
seen this repo and cannot ask you questions.

What actually makes a skill work:
  - Numbered steps, in order
  - Real commands, copy-pasteable, verified to work
  - Explicit stop conditions
  - What NOT to do, and why — the "why" is what makes the rule generalize to
    the case you did not think to list

The best first skill is a checklist you have already pasted into chat three
times. Start there, not with something aspirational.

SUBSTITUTIONS you can use anywhere in this body:
  $ARGUMENTS      everything passed to /my-skill, as typed
                  NOTE: if you never write $ARGUMENTS, Claude Code appends the
                  arguments as "ARGUMENTS: <value>" instead. So arguments are
                  never silently dropped — but if placement matters, put the
                  placeholder where you want it.
  $0, $1, ...     positional, 0-based. Shorthand for $ARGUMENTS[0], etc.
                  Shell-style quoting: /my-skill "hello world" second
                  makes $0 = hello world and $1 = second.
                  An index with no argument ($2 when one was passed) is left
                  in the text unchanged — visible, not silent.
  $name           named argument from the `arguments` frontmatter above.
                  Unlike $N, a named placeholder with no match expands to an
                  EMPTY STRING. Worth knowing before you build a command around
                  one.
  ${CLAUDE_SKILL_DIR}     this skill's own directory — use it to call bundled
                          scripts regardless of the working directory
  ${CLAUDE_PROJECT_DIR}   project root (v2.1.196+); works in `allowed-tools` too
  ${CLAUDE_SESSION_ID}    current session id, handy for logs
  ${CLAUDE_EFFORT}        current effort level

  To write a literal, escape it: \$1.00

Delete this comment and everything you do not use.
=============================================================================
-->

# What Claude Should Do

[One paragraph: what this does and when it applies. If the reader stops here,
they should still know whether they are in the right place.]

## When to use this

- [Concrete situation]
- [Concrete situation]

## When NOT to use this

<!--
Do not skip this. It is the cheapest way to stop a skill from firing in
adjacent situations where it is subtly wrong — the most annoying failure mode
a skill has, because it looks like it worked.
-->

- [Situation that looks similar but is not]
- [Situation where this causes harm, and what to do instead]

## Steps

1. **[First step]**
   ```bash
   [actual command]
   ```
   [What to look for in the output. What "good" looks like.]

2. **[Second step]**
   [Be specific about files and paths.]

3. **[Third step]**

## Output format

<!--
Tell Claude exactly what to report back. This matters most with `context: fork`,
where the whole point is a small, predictable payload returning to your main
context.
-->

- **Finding**: one line
- **Location**: file:line
- **Verdict**: PASS or FAIL, with a one-line reason

## Stop and ask if

<!--
The most valuable section in most skills. Without stop conditions a skill runs
to completion no matter what it finds — and "ran to completion" is not the same
as "did the right thing."
-->

- [Condition meaning the situation is not what this skill assumed]
- [Condition where being wrong is expensive enough to warrant a human]
- Anything surprises you in a way this document does not describe

## Constraints

<!--
IMPORTANT: everything in this body is guidance to a model, not enforcement.
"Never edit migrations" written here shapes what Claude tries to do; it does not
change what Claude Code allows.

If you need a hard guarantee, use `disallowed-tools`, permission rules, or a
hook. Those are enforced by Claude Code.
https://code.claude.com/docs/en/permissions
-->

- [What must not happen — and if it truly must not, enforce it above, not here]
