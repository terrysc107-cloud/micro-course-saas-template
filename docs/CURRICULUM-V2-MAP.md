# Curriculum V2 map

What changed from V1 to V2, why, and what still needs doing.

**Fact base:** `docs/CLAUDE-CODE-FACTS.md` — every technical claim in the
curriculum traces there. **Module titles/descriptions:** `MODULE_META` in
`lib/course-config.ts` (read by `lib/content.ts`, so the sidebar, dashboard, and landing
page cannot drift apart).

---

## Why V2 exists

V1 was written against a version of Claude Code that no longer exists, and sold with claims
that were never verifiable. Three separate problems, all shipped:

1. **Factually wrong setup.** V1 taught npm as the install method, a Node 18 minimum, and
   `export ANTHROPIC_API_KEY=sk-ant-...` as a mandatory step for every learner. Current docs
   recommend the native installer and account login. A beginner following V1's module 1 in
   order would hit friction on the first page — the worst possible place.
2. **Missing the last two years.** Nothing on permission modes, sessions, Skills, hooks, MCP,
   subagents, agent teams, plugins, or any surface other than the terminal. These are not
   advanced extras; permission modes are a *safety* topic and V1 never mentioned them.
3. **Unsupportable claims.** "10× faster", an entire module promising income, and three
   testimonials from students who do not exist.

V2 fixes all three. The through-line is the **core loop** — inspect → plan → build → review
→ test → ship (`CORE_LOOP` in `lib/course-config.ts`) — taught everywhere and demonstrated
in the capstone.

---

## Structure: V1 → V2

| V1 | V2 | Change |
|---|---|---|
| 01 Getting Started (4) | **01 Getting Started (5)** | Rewritten. `02-api-keys` → `02-accounts-and-login`. New `05-permission-modes` |
| 02 Core Concepts (4) | 02 Core Concepts (4) | Fact-checked, kept |
| 03 Working with Files (4) | 03 Working with Files (4) | Fact-checked, kept |
| 04 Real Dev Workflows (4) | 04 Real Dev Workflows (4) | Fact-checked, kept |
| 05 Advanced Prompting (4) | **05 Project Context & Scope** (4) | Retitled. Content was never "prompting" — it's CLAUDE.md and scope control |
| 06 Specific Stacks (5) | 06 Specific Stacks (5) | Fact-checked, kept |
| 07 Productivity & Best Practices (5) | **07 Practice & Safety** (5) | Retitled. Cost lesson rewritten |
| 08 Making Money (5) | — | **Moved to 10 and rewritten** |
| — | **08 Extending Claude Code (6)** | **New.** The modern-capabilities module |
| — | **09 Capstone (6)** | **New.** One guided build |
| 08 Making Money | **10 Professional Practice (5)** | Renamed + rewritten. Every income claim removed |

Modules 02, 03, 04, and 06 survived largely intact — the V1 material on context, review,
testing, Git, and stack-specific work was genuinely good. It was fact-checked, not rewritten
for its own sake.

### ⚠️ Slug changes break existing progress rows

`lesson_progress`, `quiz_results`, and `user_course_state` key off
`module_slug` + `lesson_slug`. These renames orphan existing rows:

| Old key | New key |
|---|---|
| `01-getting-started/api-keys` | `01-getting-started/accounts-and-login` |
| `08-making-money/*` | `10-professional-practice/*` (most files also renamed) |
| `07-productivity-best-practices/cost-management` | `07-productivity-best-practices/usage-and-context-economy` *(if the rewrite renamed it)* |

**Impact:** a student who completed the old lessons sees them as incomplete. Nothing breaks
and no data is lost — orphaned rows are ignored, and the completion percentage just drops.

**Recommendation: accept it.** The course has no verified students, so this is very likely a
zero-row problem. If Terry confirms real students exist, write a data migration mapping old
keys to new ones before deploying. Do not skip the renames to avoid this — shipping a module
titled "Making Money with Claude Code" is a much bigger liability than a reset progress bar.

---

## Corrections applied

Facts fixed, with why each mattered:

| Correction | Was | Now |
|---|---|---|
| **Install** | `npm install -g @anthropic-ai/claude-code`, "Node.js 18+ required" | Native installer primary; Homebrew/WinGet/Linux alternatives; auto-update difference taught |
| **Auth** | "An Anthropic API key — get one at console.anthropic.com" listed as a prerequisite | Account login. API key explicitly **not** required. Account types, precedence, credential storage, and the stale-key gotcha |
| **Models** | "Claude Code uses Claude 3.5 Sonnet or Claude 3.7 Sonnet by default" | No model named anywhere. Teach `/model` and `/status` |
| **Cost** | A static cost table | Rewritten around durable ideas: what consumes context, `/compact`, `/clear`, scoping. Numbers live at claude.com/pricing |
| **CLI flags** | `-C`, `--no-auto-context`, `/cost` — none found in the CLI reference | Removed |
| **Session persistence** | "sessions don't persist between runs" | Corrected — `claude -c`, `claude -r`, `/resume`. A learner who believed this would never use them |
| **Approval prompt** | A fabricated `Accept this change? (y/n)` transcript | Behavior described; invented mock removed |
| **`Shift+Tab`** | *(new content, caught pre-ship)* | Cycles `default` → `acceptEdits` → `plan` **only**. `dontAsk` never; `bypassPermissions` and `auto` conditional |
| **"10× faster"** | Hero, metadata, daily-workflow KeyPoint ("2x developers from 10x ones") | Gone |
| **Income claims** | Whole module; "Module 8 alone will pay for the course" | Gone. Module 10 teaches professional practice with no earnings promises |
| **Testimonials** | Marcus T., Priya S., Derek L. — all fabricated | Gone |
| **Videos** | 35 third-party YouTube embeds, unlicensed | All removed. See `docs/VIDEO-RECORDING-PLAN.md` |

Two corrections V1 taught so confidently they get called out **on the page** rather than
quietly fixed — the API-key myth (`01-getting-started/02-accounts-and-login`) and the
session-persistence claim (`04-cli-basics`). If a learner read V1, they need it contradicted,
not omitted.

---

## New coverage in module 08

Every item the brief required, and where it landed:

| Topic | Lesson |
|---|---|
| Permission modes | `01-getting-started/05-permission-modes` *(safety — belongs in module 1, not here)* |
| Sessions | `01-getting-started/04-cli-basics` + `02-core-concepts` |
| CLAUDE.md | `05-advanced-prompting/01-claude-md-setup` |
| Skills | `08/01-skills` |
| Hooks | `08/02-hooks` |
| MCP | `08/03-mcp` |
| Subagents, agent teams | `08/04-subagents-and-agent-teams` |
| Plugins, code intelligence | `08/05-plugins-and-extending-further` |
| IDE / web / desktop / CI/CD surfaces | `08/06-surfaces-and-cicd` |

Every module-08 lesson has a **"When NOT to use this"** section. That is deliberate: the
failure mode for this material is a learner who wires up five hooks and three MCP servers
for a two-file project. Knowing when to reach for a mechanism is the actual skill.

`08/05` was briefed as a possible pivot to a decision guide if plugins turned out to be
thin. Plugins are thoroughly documented, so the lesson covers them properly **and** keeps
the decision guide — CLAUDE.md vs Skill vs hook vs MCP vs subagent vs plugin — which is the
part learners will reread.

---

## Downloads

Defined in `TEMPLATES` (`lib/course-config.ts`), which pins each asset to the lesson that
links it, so nothing ships orphaned.

| Asset | Linked from |
|---|---|
| `claude-md-template.md` | `05-advanced-prompting/claude-md-setup` |
| `build-brief-template.md` | `09-capstone/brief-and-inspect` |
| `preflight-checklist.md` | `01-getting-started/permission-modes` |
| `ship-checklist.md` | `09-capstone/qa-ship-and-rollback` |
| `skill-template/SKILL.md` | `08-extending-claude-code/skills` |

Each carries a line identifying it as course material from AI by Design. **None may imply
it is an Anthropic-provided asset.**

---

## Standing rules for future updates

1. **Fact base first.** Fix `docs/CLAUDE-CODE-FACTS.md`, then the lessons citing
   it, then bump `LAST_VERIFIED` in `lib/course-config.ts`.
2. **Never name a model version.** Teach `/model` and `/status`. This single rule prevents
   most of the rot V1 suffered.
3. **Never print a price.** Point at claude.com/pricing.
4. **No claim without a source.** No student counts, testimonials, earnings figures, or
   speed multipliers unless Terry can produce evidence.
5. **Prefer correcting to omitting** when V1 taught something confidently wrong.
6. **Structural change = check `MODULE_META`.** A new folder without a `MODULE_META` entry
   falls back to a title derived from the folder name and renders with an empty description.

## Known gaps

- **No videos.** 12 recordings planned; the written course is complete without them.
  `docs/VIDEO-RECORDING-PLAN.md`.
- **Cover images are third-party Unsplash hotlinks.** Permitted under the Unsplash licence,
  but they are generic stock and add nothing. New V2 lessons ship without them. Worth
  removing the rest. Tracked in `docs/LAUNCH-READINESS.md`.
- **No owned screenshots**, so `<LessonImage>` goes unused. The install and permission-prompt
  lessons would benefit most.
- **Modules 02, 03, 04, 06 were fact-checked, not rewritten.** They predate the core-loop
  framing and don't reference it explicitly. Worth a pass once the capstone settles.
