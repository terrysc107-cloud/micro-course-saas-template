# Preflight Checklist

**Run this before you let an agent touch a repository.**

Ninety seconds. Every item on this list exists because skipping it costs
significantly more than ninety seconds. None of it is about distrusting the
tool — it is about making mistakes cheap to undo, which is what lets you move
fast without being reckless.

*Material from Claude Code Class, a course by AI by Design (aixdesign.dev).
Independent educational material. Not affiliated with or endorsed by Anthropic.
Claude Code changes weekly — check the [official docs](https://code.claude.com/docs/en/overview)
when a detail here disagrees with reality.*

---

## 1. Git state is clean and recoverable

- [ ] `git status` is clean, or everything uncommitted is intentional and you know what it is
- [ ] You are **not** on `main` / `master` — `git checkout -b <branch>`
- [ ] Your last commit is a state you would be happy to `git reset --hard` back to
- [ ] Anything you cannot lose is committed or pushed

**Why:** an agent's diff and your uncommitted work-in-progress become
indistinguishable the moment they mix. Commit first and `git diff` tells you
exactly what changed. Skip it and you are picking your own edits out of a
combined diff by memory.

**The deeper reason:** a recent good commit is what makes reverting cheap, and
cheap reverting is what lets you kill a bad session instead of negotiating with
it. When your last good commit is four hours back, you will argue with a
confused context instead of resetting — not because arguing works, but because
the reset costs too much. Commit discipline is what keeps that option open.

## 2. There is a backup for anything that is not in git

- [ ] Database snapshot taken, if this session might touch data
- [ ] Untracked local files that matter are backed up elsewhere
- [ ] You know what in this working directory is **not** recoverable from a remote

**Why:** `git reset --hard` fixes code. It does not fix a dropped table, and it
does not fix an untracked file. Know which of your state has an undo before you
find out the hard way.

## 3. Permission mode is a decision, not a default

- [ ] You know which mode you are in (`Shift+Tab` cycles them)
- [ ] You chose it for **this task**, not because it is what you always use

| Mode | Use it when |
|---|---|
| `plan` | Inspecting, or agreeing an approach. Reads and runs read-only commands; does not edit source files. |
| `default` (a.k.a. Manual) | Normal work where you want to see each new tool use. |
| `acceptEdits` | Mechanical, low-risk edits in a repo you can revert — scaffolding, renames. |
| `auto` | Auto-approves tool calls with background safety checks. Know that is what you are opting into. |
| `dontAsk` | Auto-denies anything not pre-approved. Tight, deliberate scope. |
| `bypassPermissions` | Isolated containers/VMs only. Not your laptop. |

**Why:** the mode is enforced by Claude Code, not by the model. "Don't edit
anything yet" typed into a prompt is a request; plan mode is a rule. When you
need the rule, use the rule.

**`bypassPermissions` caveats, if you are considering it:** it does not protect
writes to `.git`, `.config/git`, `.claude`, `.vscode`, `.idea`, `.husky`,
`.cargo`, `.devcontainer`, `.yarn`, or `.mvn`. Root/home removals still prompt
as a circuit breaker. Explicit `ask` rules and MCP tools marked
`requiresUserInteraction` still prompt. Administrators can disable the mode
entirely.

Docs: [permission modes](https://code.claude.com/docs/en/permission-modes) ·
[permissions](https://code.claude.com/docs/en/permissions)

## 4. Secrets are not about to enter context

- [ ] No `.env`, credential file, or key material sitting where it will get read
- [ ] Nothing you are about to paste contains a token, password, or connection string
- [ ] Logs and dumps you plan to share are scrubbed — auth headers and session cookies especially
- [ ] Your `CLAUDE.md` references env var **names**, never values

**Why:** context is conversation. Once a secret is in it, it is in the session,
possibly in a transcript, and possibly in a file you commit. Reference secrets
by name. If a secret does get pasted, rotate it — do not reason about whether
it probably ended up somewhere.

## 5. Off-limits areas are enforced, not just requested

- [ ] You know what in this repo must not be touched
- [ ] Anything that **must not** happen is in permission rules, not just prose

**Why, said plainly:** `CLAUDE.md` is read by the model. Permission rules are
enforced by Claude Code. Writing "never modify migrations" in `CLAUDE.md`
shapes what Claude tries to do. It does not change what Claude Code allows.

For "I would prefer not" → `CLAUDE.md` is fine.
For "this must not happen" → `permissions.deny`, or `/permissions`.

Know which one the situation called for.

## 6. You know the test command — and it works

- [ ] You know how to run the tests
- [ ] You ran them **just now**, and you know the current pass/fail state

**Why:** if you do not know whether the suite was green before the session, a
red test afterward is unattributable. You will spend twenty minutes debugging a
failure that was already there. Establish the baseline first.

## 7. You know the rollback path

- [ ] You know how to undo this work if it goes wrong
- [ ] You know what the undo does **not** cover — migrations, external calls, sent emails, third-party writes

**Why:** for local work this is usually just `git reset --hard`. The moment a
migration or an external side effect is involved, it is not, and that is exactly
the moment people assume it still is.

## 8. The task is scoped

- [ ] You can state, in one sentence, what "done" looks like
- [ ] You know what "done" explicitly does **not** include
- [ ] For anything non-trivial: you wrote a [build brief](/downloads/build-brief-template.md)

**Why:** an unscoped task produces an unbounded diff, and an unbounded diff does
not get reviewed — it gets skimmed. The scope you write down is the scope you
can enforce during review.

---

## The thirty-second version

```bash
git status                 # clean?
git checkout -b my-task    # not on main?
npm test                   # baseline known?
# Shift+Tab                # mode chosen on purpose?
```

Plus: no secrets in context, and you know how to undo this.

---

<!--
None of this is about the agent being untrustworthy. It is about making
mistakes cheap. Cheap mistakes are what let you work fast; expensive mistakes
are what make people work slowly and still get burned.
-->
