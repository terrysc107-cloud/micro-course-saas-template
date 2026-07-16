# Claude Code fact base — verified 2026-07-16

Every factual claim in the curriculum traces back to this file. Sourced from
<https://code.claude.com/docs> on 2026-07-16.

**Re-verify before each course update.** Claude Code ships weekly. When a fact here
goes stale, fix it here first, then fix the lessons that cite it, then bump
`LAST_VERIFIED` in `lib/course-config.ts`.

**Rule: if it is not in this file and not verifiable in the official docs right now, do not teach it.**

---

## Installation

Native install is the **recommended** method in current docs.

| Platform | Command |
|---|---|
| macOS, Linux, WSL | `curl -fsSL https://claude.ai/install.sh \| bash` |
| Windows PowerShell | `irm https://claude.ai/install.ps1 \| iex` |
| Windows CMD | `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd` |
| Homebrew | `brew install --cask claude-code` |
| WinGet | `winget install Anthropic.ClaudeCode` |
| Linux package managers | apt, dnf, apk on Debian, Fedora, RHEL, Alpine |

- Native installs **auto-update in the background**. Homebrew and WinGet **do not** — users run `brew upgrade claude-code` / `winget upgrade Anthropic.ClaudeCode`.
- Homebrew has two casks: `claude-code` (stable, ~a week behind, skips major-regression releases) and `claude-code@latest`.
- Git for Windows is recommended on native Windows so the Bash tool works; otherwise Claude Code uses PowerShell. WSL does not need it.

> ⚠️ **Corrected V1 error:** V1 taught `npm install -g @anthropic-ai/claude-code` as the
> primary install and claimed a Node.js 18 minimum. The current docs do not present npm
> as a recommended path and state no Node version requirement for the native install.
> Do not teach npm as the primary method.

Docs: [quickstart](https://code.claude.com/docs/en/quickstart) · [setup](https://code.claude.com/docs/en/setup) · [install troubleshooting](https://code.claude.com/docs/en/troubleshoot-install)

## Authentication

**Claude Code requires an account. An `ANTHROPIC_API_KEY` is NOT required for typical learners.**

Run `claude`; on first launch it opens a browser to log in. `/login` switches accounts or
re-authenticates; `/logout` logs out and resets first-launch setup.

Supported account types:
- **Claude Pro, Max, Team, or Enterprise** subscription (recommended)
- **Claude Console** — API access with pre-paid credits; first login auto-creates a "Claude Code" workspace for cost tracking
- **Cloud providers** — Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry
- **Claude apps gateway** — self-hosted, corporate SSO via `/login`

Credential storage: macOS Keychain · Linux `~/.claude/.credentials.json` (mode `0600`) ·
Windows `%USERPROFILE%\.claude\.credentials.json`.

**Authentication precedence** (first match wins):
1. Cloud provider credentials (`CLAUDE_CODE_USE_BEDROCK` / `_VERTEX` / `_FOUNDRY`)
2. `ANTHROPIC_AUTH_TOKEN` (sent as `Authorization: Bearer`)
3. `ANTHROPIC_API_KEY` (sent as `X-Api-Key`)
4. `apiKeyHelper` script output
5. `CLAUDE_CODE_OAUTH_TOKEN`
6. Subscription OAuth from `/login` ← the default for most people

A signed-in Claude apps gateway session sits outside this list and outranks cloud providers.

Gotcha worth teaching: if a stale `ANTHROPIC_API_KEY` is set in the environment, it takes
precedence over an active subscription once approved and can cause confusing auth failures.
`unset ANTHROPIC_API_KEY` and check `/status`.

For CI, `claude setup-token` prints a one-year OAuth token for `CLAUDE_CODE_OAUTH_TOKEN`.
It requires a Pro/Max/Team/Enterprise plan and is inference-scoped (cannot establish Remote
Control sessions). Bare mode (`--bare`) does not read it.

> ⚠️ **Corrected V1 error:** V1 taught `export ANTHROPIC_API_KEY=sk-ant-...` as a required
> setup step for every learner. It is not.

Docs: [authentication](https://code.claude.com/docs/en/authentication)

## Permission modes

Set via `defaultMode` in settings, `--permission-mode <mode>` at startup, or switched
in-session.

**`Shift+Tab` cycling — corrected 2026-07-16.** An earlier draft of this file said
Shift+Tab "cycles modes", which is too loose and produced a wrong lesson claim. The
accurate version:

- The default cycle is **`default` → `acceptEdits` → `plan`** only.
- `auto` appears only when your account meets the auto mode requirements.
- `bypassPermissions` appears only after starting with `--permission-mode bypassPermissions`,
  `--dangerously-skip-permissions`, or `--allow-dangerously-skip-permissions`.
- `dontAsk` **never** appears in the cycle; set it with `--permission-mode dontAsk`.
- Enabled optional modes slot in after `plan`, `bypassPermissions` first and `auto` last.

Teach the three-mode cycle as the default reality. Do not tell learners they can Shift+Tab
to `bypassPermissions` — they cannot, by design, and that design is worth explaining.

| Mode | Behavior |
|---|---|
| `default` | Prompts on first use of each tool. Labeled **Manual** in CLI/extensions/desktop; `manual` is an accepted alias |
| `acceptEdits` | Auto-accepts file edits and common filesystem commands (`mkdir`, `touch`, `mv`, `cp`) inside the working directory or `additionalDirectories` |
| `plan` | Reads files and runs read-only shell commands to explore; does not edit source files |
| `auto` | Auto-approves tool calls with background safety checks that verify actions align with your request |
| `dontAsk` | Auto-denies tools unless pre-approved via `/permissions` or `permissions.allow` |
| `bypassPermissions` | Skips permission prompts. Isolated containers/VMs only |

### Protected paths (verified 2026-07-16)

Writes to a set of paths are **never auto-approved in any mode except `bypassPermissions`**.
This is the cleanest way to teach why `bypassPermissions` is different in kind, not degree.

| Mode | Protected-path writes |
|---|---|
| `default`, `acceptEdits`, `plan` | Prompted |
| `auto` | Routed to the classifier |
| `dontAsk` | Denied |
| `bypassPermissions` | **Allowed** |

Protected directories include `.git`, `.config/git`, `.vscode`, `.idea`, `.husky`, `.cargo`,
`.devcontainer`, `.yarn`, `.mvn`, and `.claude` (except `.claude/worktrees`). Protected files
include shell rc files (`.bashrc`, `.zshrc`, `.profile`, `.envrc`), `.gitconfig`, `.npmrc`,
`.mcp.json`, `.claude.json`, and others.

Important subtlety: `permissions.allow` rules **do not** pre-approve protected-path writes.
The safety check runs before allow rules are evaluated, so `Edit(.claude/**)` in settings
does not change the table above.

`bypassPermissions` caveats worth teaching:
- Isolated containers/VMs only. It offers **no** protection against prompt injection.
- Root/home removals (`rm -rf /`, `rm -rf ~`) still prompt as a circuit breaker — including when the removal hides inside `$(...)`, backticks, or `<(...)`.
- Explicit `ask` rules and MCP tools marked `requiresUserInteraction` still prompt.
- You **cannot** enter it from a session started without an enabling flag; you must restart.
- On Linux/macOS it refuses to start as root or under `sudo` (skipped inside a recognized sandbox).
- Admins can disable it: `permissions.disableBypassPermissionsMode: "disable"` (and `permissions.disableAutoMode`), most usefully in managed settings.

`auto` mode caveats worth teaching:
- A separate classifier model reviews actions before they run. It is **not a safety guarantee** — the docs say so explicitly.
- Availability depends on plan, provider, and model. Describe this qualitatively; do not name model versions.
- Boundaries you state in conversation ("don't push") are treated as block signals, but they are re-read from the transcript, so **compaction can lose them**. A `deny` rule is the hard guarantee.
- `defaultMode: "auto"` is ignored in `.claude/settings.json` and `.claude/settings.local.json` so a repository cannot grant itself auto mode; it must live in `~/.claude/settings.json`.
- After 3 consecutive or 20 total blocks, auto mode pauses and prompting resumes.

**Permission rules** use the form `Tool` or `Tool(specifier)`, in `allow` / `ask` / `deny`
lists. Manage interactively with `/permissions`.

> **Key teaching point:** permission rules are enforced by Claude Code, not by the model.
> Instructions in your prompt or `CLAUDE.md` shape what Claude *tries* to do; they do not
> change what Claude Code *allows*. CLAUDE.md is not a security boundary.

Docs: [permissions](https://code.claude.com/docs/en/permissions) · [permission modes](https://code.claude.com/docs/en/permission-modes)

## Commands

**Shell:** `claude` · `claude "task"` · `claude -p "query"` (one-off, then exit) ·
`claude -c` (continue most recent in cwd) · `claude -r` (resume a previous conversation) ·
`claude setup-token` · `claude --teleport`

**Session:** `/help` · `/clear` · `/exit` (or Ctrl+D) · `/login` · `/logout` · `/status` ·
`/config` · `/model` · `/permissions` · `/resume` · `/rename` · `/compact` · `/context` ·
`/usage` · `/usage-credits` · `/memory` · `/init` · `/effort` · `/rewind` · `/doctor` ·
`/mcp` · `/plugin` · `/plan` · `/schedule` · `/desktop` · `/loop` · `/feedback`

> ⚠️ **Corrected 2026-07-16: `/cost` no longer exists.** V1 taught it in prose *and* in a
> quiz answer. The current command is **`/usage`**, which shows session token usage and, on
> Pro/Max/Team/Enterprise, a breakdown against plan limits attributed to skills, subagents,
> plugins, and MCP servers (`d`/`w` toggles 24h/7d). `/context` shows what is consuming
> context space. `/usage-credits` manages spend limits on Pro and Max.

Shortcuts: `/` lists commands and skills · Tab completes · ↑ history · `Shift+Tab` cycles permission modes.

Docs: [CLI reference](https://code.claude.com/docs/en/cli-reference) · [commands](https://code.claude.com/docs/en/commands)

## CLAUDE.md and memory

Two mechanisms carry knowledge across sessions: **CLAUDE.md** (you write it) and **auto
memory** (Claude writes it). Both load at the start of every conversation. **Neither is
enforced configuration** — Claude treats them as context. To block an action regardless of
what Claude decides, use a `PreToolUse` hook or a deny rule.

### Locations — corrected 2026-07-16

A V1 quiz marked "project root" correct and "`.claude/` directory" wrong. **Both are valid.**

| Scope | Location |
|---|---|
| Managed policy | macOS `/Library/Application Support/ClaudeCode/CLAUDE.md` · Linux/WSL `/etc/claude-code/CLAUDE.md` · Windows `C:\Program Files\ClaudeCode\CLAUDE.md` |
| User | `~/.claude/CLAUDE.md` |
| Project | **`./CLAUDE.md` or `./.claude/CLAUDE.md`** |
| Local (gitignored) | `./CLAUDE.local.md` |

Load order runs broadest → most specific, and files are **concatenated, not overridden**.

### Loading — corrected 2026-07-16

- CLAUDE.md/CLAUDE.local.md **at or above** the working directory load **in full at launch**.
- Files in **subdirectories load on demand**, when Claude reads files in those directories.
  (V1 implied nested files load at launch.)
- Project-root CLAUDE.md **survives `/compact`** — it is re-read from disk and re-injected.
  Nested files are not re-injected until Claude next reads a file there.

### Worth teaching

- **Target under 200 lines.** Longer files consume more context *and reduce adherence*. This is the empirical argument for moving procedures into skills.
- `@path/to/file` **imports** are expanded at launch — they help organization but **do not reduce context**. Max depth 4 hops. Import parsing skips code spans/fences, so `` `@README` `` stays literal.
- **`.claude/rules/`** splits instructions into topic files. `paths:` frontmatter scopes a rule to matching globs so it loads only when relevant. Rules without `paths` load at launch.
- **AGENTS.md is not read by Claude Code.** A `CLAUDE.md` containing `@AGENTS.md` bridges the two. (Relevant: this very repo does exactly that.)
- `/init` generates a starting CLAUDE.md; it suggests improvements rather than overwriting an existing one.
- **Auto memory** lives at `~/.claude/projects/<project>/memory/`, is machine-local, and only the first 200 lines / 25KB of `MEMORY.md` load per session. Toggle via `/memory` or `autoMemoryEnabled`.
- `claudeMdExcludes` skips irrelevant ancestor files in monorepos. Managed policy files cannot be excluded.

Docs: [memory](https://code.claude.com/docs/en/memory) · [best practices](https://code.claude.com/docs/en/best-practices)

## Skills

A skill is a `SKILL.md` file. Claude uses skills when relevant, or you invoke one directly
with `/skill-name`.

- Location: `.claude/skills/<name>/SKILL.md` (project) or `~/.claude/skills/<name>/SKILL.md` (user)
- **Custom commands have been merged into skills.** `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both create `/deploy`. Existing `commands/` files keep working.
- The command name comes from **where the file lives**, not the frontmatter `name` (which is the display label).
- A skill's body loads only when used, so long reference material costs nothing until needed — unlike CLAUDE.md, which is always in context.
- Follows the [Agent Skills](https://agentskills.io) open standard.

Frontmatter — **all fields optional**, `description` recommended:

| Field | Purpose |
|---|---|
| `name` | Display label in listings (defaults to directory name) |
| `description` | What it does and when to use it — how Claude decides to apply it |
| `when_to_use` | Extra trigger phrases; appended to `description` (combined cap: 1,536 chars) |
| `argument-hint` | Autocomplete hint, e.g. `[issue-number]` |
| `arguments` | Named positional args for `$name` substitution |
| `disable-model-invocation` | `true` = only you can invoke it with `/name` |
| `user-invocable` | `false` = hide from the `/` menu (background knowledge) |
| `allowed-tools` | Tools usable without a permission prompt while active |
| `disallowed-tools` | Tools removed from the pool while active |
| `model` | Model override for the turn (or `inherit`) |
| `effort` | `low` / `medium` / `high` / `xhigh` / `max` |
| `context` | `fork` to run in a forked subagent context |
| `agent` | Which subagent type to use when `context: fork` |
| `hooks` | Hooks scoped to this skill's lifecycle |
| `paths` | Globs limiting when the skill auto-activates |
| `shell` | `bash` (default) or `powershell` |

### String substitutions in skill content — verified 2026-07-16

Added after an agent removed `$ARGUMENTS` from the Skill template believing it unverified.
It is documented; this file was simply incomplete. All of the following are real:

| Variable | Meaning |
|---|---|
| `$ARGUMENTS` | All arguments passed when invoking the skill. **If `$ARGUMENTS` is not present in the content, arguments are appended as `ARGUMENTS: <value>`** |
| `$ARGUMENTS[N]` | Specific argument by 0-based index, e.g. `$ARGUMENTS[0]` |
| `$N` | Shorthand for `$ARGUMENTS[N]`, e.g. `$0`, `$1` |
| `$name` | Named argument declared in the `arguments` frontmatter list; names map to positions in order |
| `${CLAUDE_SESSION_ID}` | Current session id |
| `${CLAUDE_EFFORT}` | Current effort level (`low`…`max`) |
| `${CLAUDE_SKILL_DIR}` | Directory containing the skill's `SKILL.md` |
| `${CLAUDE_PROJECT_DIR}` | Project root (v2.1.196+); works in the body and in `allowed-tools` |

Details worth teaching:
- Indexed arguments use shell-style quoting: `/my-skill "hello world" second` → `$0` is `hello world`, `$1` is `second`. `$ARGUMENTS` always expands to the full string as typed.
- An indexed placeholder with no matching argument (`$2` when one was passed) stays unchanged. A **named** placeholder with no match expands to an empty string.
- Escape a literal with a backslash: `\$1.00`.

Docs: [skills](https://code.claude.com/docs/en/skills)

## Hooks

Shell commands that run around Claude Code actions. Configured in `~/.claude/settings.json`
(all projects), `.claude/settings.json` (project, shareable), `.claude/settings.local.json`
(project, gitignored), plugin `hooks/hooks.json`, skill/agent frontmatter, or managed policy
settings.

Structure is three levels: **event → matcher group → hook handler**.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh",
            "args": []
          }
        ]
      }
    ]
  }
}
```

Event names:
- **Session lifecycle:** `SessionStart`, `Setup`, `SessionEnd`
- **Per-turn:** `UserPromptSubmit`, `UserPromptExpansion`, `Stop`, `StopFailure`
- **Tool loop:** `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`, `PostToolBatch`
- **Notifications/display:** `Notification`, `MessageDisplay`
- **Subagents/tasks:** `SubagentStart`, `SubagentStop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`
- **File/config:** `FileChanged`, `CwdChanged`, `ConfigChange`, `InstructionsLoaded`, `PreCompact`, `PostCompact`
- **Worktrees:** `WorktreeCreate`, `WorktreeRemove`
- **MCP:** `Elicitation`, `ElicitationResult`

Docs: [hooks](https://code.claude.com/docs/en/hooks)

## MCP

The Model Context Protocol is an open standard for connecting AI tools to external data
sources — design docs in Google Drive, Jira tickets, Slack data, custom internal tooling.

Organizations can force connector tools to `ask`; those still prompt even in `auto` and
`bypassPermissions` modes, and are denied in `dontAsk`. Connector tools appear as
`mcp__claude_ai_<server>__<tool>`. MCP tools can be marked `requiresUserInteraction`.

Docs: [MCP](https://code.claude.com/docs/en/mcp) · [MCP quickstart](https://code.claude.com/docs/en/mcp-quickstart)

## Subagents and agent teams

**Subagents** are specialized assistants for specific task types. Each runs in **its own
context window** with a custom system prompt, specific tool access, and independent
permissions. Claude delegates based on the subagent's `description`.

- Location: `.claude/agents/`
- Value: preserve main context, enforce tool constraints, reuse configs, specialize behavior, control cost by routing to cheaper models
- Subagents work **within a single session**

Related but distinct:
- **Agent teams** — sessions that communicate with each other ([/en/agent-teams](https://code.claude.com/docs/en/agent-teams))
- **Background agents** — many independent sessions in parallel, monitored from one place ([/en/agent-view](https://code.claude.com/docs/en/agent-view))
- **Agent SDK** — build fully custom agents on Claude Code's tools ([/en/agent-sdk/overview](https://code.claude.com/docs/en/agent-sdk/overview))

Docs: [subagents](https://code.claude.com/docs/en/sub-agents)

## Surfaces

Every surface connects to the **same underlying Claude Code engine**, so CLAUDE.md files,
settings, and MCP servers work across all of them.

| Surface | Notes | Docs |
|---|---|---|
| Terminal CLI | Full-featured | [/en/quickstart](https://code.claude.com/docs/en/quickstart) |
| VS Code | Inline diffs, @-mentions, plan review, history. Also Cursor | [/en/vs-code](https://code.claude.com/docs/en/vs-code) |
| JetBrains | IntelliJ, PyCharm, WebStorm. Requires the CLI separately | [/en/jetbrains](https://code.claude.com/docs/en/jetbrains) |
| Desktop app | macOS/Windows. Visual diffs, parallel sessions, scheduled tasks, cloud sessions. Paid subscription required | [/en/desktop](https://code.claude.com/docs/en/desktop) |
| Web | claude.ai/code — no local setup, long-running tasks, parallel work. Desktop browsers + Claude iOS app | [/en/claude-code-on-the-web](https://code.claude.com/docs/en/claude-code-on-the-web) |
| Slack | `@Claude` a bug report, get a PR back | [/en/slack](https://code.claude.com/docs/en/slack) |
| GitHub Actions | CI automation, PR review, issue triage | [/en/github-actions](https://code.claude.com/docs/en/github-actions) |
| GitLab CI/CD | CI automation | [/en/gitlab-ci-cd](https://code.claude.com/docs/en/gitlab-ci-cd) |
| GitHub Code Review | Automatic review on every PR | [/en/code-review](https://code.claude.com/docs/en/code-review) |
| Chrome | Debug live web apps | [/en/chrome](https://code.claude.com/docs/en/chrome) |
| Remote Control | Continue a local session from phone/another device | [/en/remote-control](https://code.claude.com/docs/en/remote-control) |
| Channels | Push events from Telegram, Discord, iMessage, or custom webhooks into a session | [/en/channels](https://code.claude.com/docs/en/channels) |
| Routines | Scheduled runs on Anthropic-managed infra; survive your machine being off. Trigger on API calls or GitHub events. Create from web, Desktop, or `/schedule` | [/en/routines](https://code.claude.com/docs/en/routines) |

Session portability: `claude --teleport` pulls a web/iOS session into the terminal (requires
a claude.ai subscription). `/desktop` hands a terminal session to the Desktop app for visual
diff review.

## Scripting and piping

Claude Code is composable and follows the Unix philosophy:

```bash
tail -200 app.log | claude -p "Slack me if you see any anomalies"
claude -p "translate new strings into French and raise a PR for review"
git diff main --name-only | claude -p "review these changed files for security issues"
```

## Models and cost — deliberately not taught

V1 named specific models ("Claude 3.5 Sonnet or Claude 3.7 Sonnet by default") and printed a
cost table. **Both were removed and must not come back in that form.**

Reasons:
1. Default model changes without notice; naming one dates the course within weeks.
2. Cost depends on plan, model, and account type, and pricing pages move.
3. Teaching a stale price is worse than teaching none.

Teach instead: use `/model` to see and change the current model, `/status` to see the active
account and auth method, and check
[claude.com/pricing](https://claude.com/pricing) for current pricing. Point at the
mechanism, not the number.

## Plugins and code intelligence — verified 2026-07-16

Both were flagged unverified in the first pass of this file and have since been **confirmed
real and well documented**. The flags are cleared.

- **Plugins** are documented across [/en/plugins](https://code.claude.com/docs/en/plugins),
  [/en/discover-plugins](https://code.claude.com/docs/en/discover-plugins),
  [/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference), and
  [/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces). Manifest
  fields: `name`, `description`, `version`, `author`. Managed with `/plugin` subcommands and
  `--plugin-dir`; marketplaces via `extraKnownMarketplaces`.
- **Code intelligence** is a real named feature: a category of official LSP plugins on the
  `claude-plugins-official` marketplace (`typescript-lsp`, `pyright-lsp`, and others). Each
  requires a language server binary, and the docs note a memory caveat worth teaching.

Details live in `content/modules/08-extending-claude-code/05-plugins-and-extending-further.mdx`.

## Unverified — do not teach without checking

Not confirmed as of 2026-07-16. Verify against the official docs before writing any lesson
that depends on them:

- Any specific model id, context window size, rate limit, or price
- Any claim about what a Claude subscription tier includes, beyond the two facts confirmed
  here: `claude setup-token` requires Pro/Max/Team/Enterprise, and the Desktop app requires
  a paid subscription

### Known tension: `model:` examples

The official docs' own subagent example uses `model: sonnet` and names Haiku as the
cost-control lever. Our no-model-versions rule means lessons use `model: inherit` and point
at `/model` instead. This slightly weakens the cost-control example, and it is a deliberate
trade: a lesson that ages badly costs more than an example that lands softly. Revisit if
learners find it confusing.
