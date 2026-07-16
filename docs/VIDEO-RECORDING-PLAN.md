# Video recording plan

**Why this exists:** the course shipped with 35 embedded YouTube videos that were not
Terry's and that Terry has no licence to use. All 35 were removed on 2026-07-16. This is
the plan to replace them with owned recordings.

**The core decision: we are not re-recording 35 videos.**

Thirty-five videos is roughly 6 hours of finished footage and, realistically, 40+ hours of
work. That is a launch blocker disguised as a to-do list, and it is why the old videos were
borrowed in the first place. Instead: **12 recordings across 10 topics**, covering the
moments where watching genuinely beats reading — installation, the permission prompt, the
loop in motion, and the capstone build. The written lessons are the course and are complete
today. Video is an enhancement, and the sales page says so plainly.

**The course sells and works with zero videos.** Nothing here blocks launch. Record in
priority order and ship each one as it's finished; buyers get them free as updates.

---

## Ground rules

1. **Own everything you show.** Your repos, your terminal, your accounts. No other
   creator's footage, no screen-recorded YouTube, no borrowed diagrams.
2. **Never show a real secret.** Use a throwaway account and a scratch project. Before
   recording: close your password manager, sign out of anything personal, clear the
   terminal, empty your notification queue. Assume every pixel ships.
3. **Ship rough over nothing.** A clear 8-minute take with one stumble beats a perfect
   video that never gets recorded. Do not edit for a week.
4. **Let real failures stay in.** When Claude does something wrong on camera, keep it and
   handle it. That footage is more valuable than a clean take — it is the thing no other
   course has, and it is exactly what the written lessons promise.
5. **Date what will rot.** Any video showing a UI or a command should say "as of
   \<month year\>, check the docs" on camera. Then a stale video is honest rather than wrong.
6. **Never imply Anthropic made this.** No Anthropic logos, no "official" framing.

---

## Setup (do this once)

**Tool: Screen Studio** (macOS, one-time purchase). Recommended default — automatic zoom
on cursor and keystrokes makes terminal work legible without any editing, which is the
entire problem with recording CLI work. Export and move on.

Alternatives if you already know them: **Loom** (fastest, weakest terminal legibility),
**QuickTime** (free, no zoom, you'll edit), **OBS** (most control, most setup). Do not
learn a new tool to start this — the tool is not the bottleneck.

**Display:** record at 1920×1080. Do not record a 4K screen and downscale; terminal text
turns to mush.

**Terminal:**
- Font size 18pt minimum. Bigger than feels right. Check it on a phone.
- Light-on-dark, high contrast. Reset to a default prompt — no custom prompt with a
  personal path or a git branch that names a client.
- `cd` to a scratch directory. Clear scrollback before every take.

**Audio:** any USB mic or wired earbuds beats a laptop mic. Record in a soft room; a closet
with clothes in it genuinely works. Test 10 seconds and listen back before recording 12
minutes.

**Before every take, this checklist:**
- [ ] Notifications off (macOS Focus / Do Not Disturb)
- [ ] Signed out of personal accounts; password manager closed
- [ ] Scratch repo in a known-good starting state (`git status` clean)
- [ ] Terminal cleared, font size checked
- [ ] Mic tested
- [ ] Nothing on screen that isn't yours to show

---

## Conventions

**Filenames:** `NN-topic-slug-vN.mp4` — e.g. `03-permission-modes-v1.mp4`. `NN` matches the
video number in the tracker. Bump `vN` on re-records; never overwrite.

**Aspect / resolution:** 16:9, 1920×1080, H.264 mp4.

**Length:** 6–12 minutes. If a topic runs past 12, split it — that's what the capstone does.

**Structure of every video:**
1. **0:00–0:20 — the promise.** What you'll be able to do at the end. No intro music, no
   "hey guys", no channel branding. Get in.
2. **Body.** Demo-first. Talk while doing, not before doing.
3. **Final 20s — the point.** One sentence, matching the lesson's `<KeyPoint>`.

**Captions:** required. Screen Studio and Loom both auto-generate — read them through once
and fix the product names (it will hear "Claude" as "clod"). Burned-in or sidecar `.vtt`
both fine.

**Thumbnails:** not needed. These embed in lessons, they don't compete in a YouTube feed.
Skip the work.

**Hosting:** unlisted YouTube or Vimeo, both supported by `components/course/LessonVideo.tsx`.
- Unlisted YouTube: free, reliable, but discoverable by URL and shows related content.
- Vimeo (paid): domain-locked privacy, no related content. **Recommended** for paid course
  material — buyers paid to not be marketed at.

**Embedding a finished video:** add one line to the lesson's frontmatter:

```yaml
videoUrl: "https://vimeo.com/123456789"
```

`LessonVideo` handles `youtube.com/watch?v=`, `youtu.be/`, `vimeo.com/`, and player URLs,
and renders nothing at all when `videoUrl` is absent. Nothing else to change — no
placeholder to remove, no layout to fix. Add the line, the video appears.

Then: update `docs/VIDEO-TRACKER.csv`, and bump `LAST_VERIFIED` in `lib/course-config.ts`
if the video restates a fact.

---

## The recordings

Priority order. **Record 1–4 first** — they cover the moments where a beginner actually
gets stuck, and they front-load the trust.

Each entry: what it must accomplish, the repo state to start from, the beats to hit, and
the visual proof — the specific thing that must be visible on screen, since that is the
whole reason it's a video and not a paragraph.

---

### 01 — Welcome and the safety promise
**Lessons:** `01-getting-started/01-install` (course intro) · **Target:** 6 min · **Priority:** 1

**Objective:** Tell them what this course is, what it isn't, and why it's honest.

**Setup:** Camera on you, or just a slide-free screen with your voice. No demo needed.

**Beats:**
1. What you'll be able to do at the end: run the loop and defend your diffs.
2. What this is not: not a magic-button course, not affiliated with Anthropic, no income promises.
3. Say the video situation out loud: "The written lessons are the course and they're
   complete. I'm recording these walkthroughs now. You get them free as they land."
4. The safety promise: you'll learn to work with an agent that can run commands on your
   machine, and we're going to take that seriously from lesson one.
5. Say the disclaimer: independent product by AI by Design, not affiliated with or endorsed
   by Anthropic.

**Visual proof:** none needed. This is the one video that's just you talking.

---

### 02 — Install and log in
**Lessons:** `01-getting-started/01-install`, `01-getting-started/02-accounts-and-login` · **Target:** 10 min · **Priority:** 1

**Objective:** Get from nothing to a running `claude` session. This is where beginners quit;
it must be flawless.

**Setup:** Ideally a fresh macOS VM or a clean user account with Claude Code **not**
installed. This is the one video worth the setup effort — a real from-zero install is
impossible to fake convincingly and instantly credible.

**Beats:**
1. Run the native installer: `curl -fsSL https://claude.ai/install.sh | bash`.
2. Mention Homebrew/WinGet as alternatives, and the auto-update difference (native
   auto-updates; Homebrew and WinGet don't).
3. Run `claude` → browser opens → log in.
4. **Correct the API-key myth explicitly on camera.** "You may have read you need an
   ANTHROPIC_API_KEY. You don't. You log in with your Claude account." This is the single
   most valuable 20 seconds in the course — it's the error the old version taught.
5. Show `/status`: the account and auth method.
6. Say the date and that install steps change — check the docs.

**Visual proof:** the real browser login handoff, and `/status` showing a subscription
account rather than an API key.

**Watch out:** do not show the account email, and don't let the browser autofill anything.
Use a throwaway account.

---

### 03 — First safe session and permission modes
**Lessons:** `01-getting-started/03-first-command`, `01-getting-started/05-permission-modes` · **Target:** 12 min · **Priority:** 1

**Objective:** The trust video. They see the agent ask before it acts, and they learn to
choose a mode deliberately.

**Setup:** Small scratch repo, clean git state, something real enough to edit.

**Beats:**
1. Start a session, ask it to explain the project.
2. Ask for a small change → **the permission prompt appears** → approve it.
3. `Shift+Tab` through the modes. Name each one on screen.
4. Demo `plan` mode on unfamiliar code: it explores, proposes, edits nothing. Sell this as
   the default habit.
5. Show `acceptEdits` and be honest about when it's fine and when it isn't.
6. Mention `bypassPermissions` **without demoing it casually** — say plainly it's for
   isolated containers and VMs, and move on.
7. The load-bearing point: permission rules are enforced by Claude Code, not the model.
   CLAUDE.md is not a security boundary.
8. Show the preflight checklist download.

**Visual proof:** the permission prompt itself, and plan mode refusing to edit. Those two
frames are the whole video.

---

### 04 — The loop: inspect → plan → build → review → test → ship
**Lessons:** `04-real-dev-workflows/01-build-a-feature`, core-concepts · **Target:** 12 min · **Priority:** 1

**Objective:** The spine of the course, demonstrated end to end on something small.

**Setup:** Scratch repo with a test suite that runs. A genuinely small feature — one form
field, one endpoint.

**Beats:**
1. Inspect: make it read and prove it understands before proposing.
2. Plan: plan mode, then **critique the plan on camera**. Reject something. Show what a
   vague plan looks like and make it better.
3. Build: small increments.
4. Review: read the diff line by line, out loud. Model the standard.
5. Test: run them. Ideally one fails and you fix it.
6. Ship: what shipping means here, and the rollback path.

**Visual proof:** a real diff being read and something in it being questioned. If every
suggestion is accepted unchanged, re-record — that's the exact behavior the course exists
to prevent.

---

### 05 — Writing a useful CLAUDE.md
**Lessons:** `05-advanced-prompting/01-claude-md-setup` · **Target:** 9 min · **Priority:** 2

**Objective:** Show a CLAUDE.md measurably changing output.

**Setup:** Repo with a strong convention Claude would not guess.

**Beats:**
1. Ask for code **without** CLAUDE.md. It guesses wrong. Keep this take.
2. Write the CLAUDE.md. Talk through what earns a line.
3. Same prompt again. It follows the convention.
4. What to leave out: it's in context every session, so every line is recurring cost.
5. Mention auto memory.
6. Not a security boundary — again. Say it every time it's relevant.
7. Show the CLAUDE.md template download.

**Visual proof:** the before/after. Two responses to the same prompt, side by side. Without
that contrast this is a video of someone typing markdown — the contrast IS the lesson.

---

### 06 — Skills, hooks, and MCP
**Lessons:** `08-extending-claude-code/01-skills`, `02-hooks`, `03-mcp` · **Target:** 12 min · **Priority:** 2

**Objective:** Three extension mechanisms and, more importantly, when to reach for which.

**Setup:** Repo with a formatter configured.

**Beats:**
1. Skill: build a small real one, invoke with `/name`. The insight: body loads only when
   used, so it's free until needed — unlike CLAUDE.md.
2. Hook: `PostToolUse` → auto-format after every edit. Then **make an edit and watch it fire**.
   Hooks are deterministic; CLAUDE.md is a suggestion. That contrast is the point.
3. MCP: connect one server, use it once. Be brief.
4. The decision guide: CLAUDE.md (always-on facts) vs Skill (procedure) vs hook
   (guarantee) vs MCP (external data).
5. Show the Skill starter download.

**Visual proof:** the hook firing on its own after an edit. That's the "oh" moment.

---

### 07 — Subagents and agent teams
**Lessons:** `08-extending-claude-code/04-subagents-and-agent-teams` · **Target:** 11 min · **Priority:** 2

**Objective:** Show context isolation, and untangle four things people conflate.

**Setup:** Repo big enough that exploration is genuinely noisy.

**Beats:**
1. The problem: research floods your main context with output you'll never reference again.
2. Define a subagent in `.claude/agents/`, run it, show only the summary returning.
3. Constraint enforcement: a read-only subagent that cannot edit.
4. Draw the distinction clearly — subagents (one session), agent teams (sessions talking),
   background agents (parallel sessions, one view), Agent SDK (build your own).
5. Honest note: this is real overhead. Don't reach for it on a two-file change.

**Visual proof:** the main context staying clean while the subagent does the noisy work.

---

### 08 — Capstone kickoff: brief, inspect, plan
**Lessons:** `09-capstone/01-brief-and-inspect`, `02-plan-and-scaffold` · **Target:** 10 min · **Priority:** 3

**Objective:** Start the Lead Follow-Up Command Center properly.

**Setup:** Empty directory. Genuinely from scratch.

**Beats:**
1. Write the build brief on camera — including the non-goals. Especially the non-goals.
2. Inspect / establish context.
3. Plan mode → reject the first plan → get a better one.
4. Scaffold.

**Visual proof:** a plan being rejected and improved.

---

### 09 — Capstone build (3 parts)
**Lessons:** `09-capstone/03-data-and-schema`, `04-build-the-feature`, `05-tests-and-review` · **Target:** 3 × 12 min · **Priority:** 3

**Objective:** The real build. This is the course's proof of work.

Split into three recordings — `09a`, `09b`, `09c`:
- **09a — Data and schema.** Model it, migrate it. Slow down; this is where irreversible
  mistakes live.
- **09b — Build the feature.** Small increments. **When Claude goes off the rails, keep the
  footage** and show the recovery: stop, don't argue with a poisoned context, reset and
  re-scope.
- **09c — Tests and review.** Tests that would catch the bug you just fixed. Review in a
  fresh session so it isn't marking its own homework.

**Visual proof:** 09b must contain at least one genuine failure and recovery. If the whole
build goes clean, record until something breaks. It will.

---

### 10 — Browser QA, deploy, and rollback
**Lessons:** `09-capstone/06-qa-ship-and-rollback` · **Target:** 12 min · **Priority:** 3

**Objective:** Finish the capstone. Show the ending nobody teaches.

**Beats:**
1. Browser QA against the done-criteria from the brief. Go back to lesson 1's brief on
   camera and check them off.
2. Find at least one thing wrong. Fix it.
3. Deploy.
4. **Roll it back.** Actually do it, on camera. Almost no course shows this and it is the
   single most professional moment available to you.
5. The ship checklist download.

**Visual proof:** a real rollback executing.

---

### 11 — How Terry actually uses Claude Code (optional, high value)
**Lessons:** unassigned — bonus, or `10-professional-practice` · **Target:** 12 min · **Priority:** 4

**Objective:** The credibility video. Not curriculum — evidence.

**Beats:** Walk through a real (sanitized) piece of your own work across your products.
What you delegate, what you never delegate, what you've been burned by. Where you don't use
it at all.

**Visual proof:** real work, genuinely sanitized. **Scrub every client name, key, and
customer record before recording.** If a project can't be sanitized safely, use a different
one — no video is worth a client leak.

**Note:** unlike the others, this one can't go stale, because it's about judgment rather
than UI.

---

## Tracker

`docs/VIDEO-TRACKER.csv` — the live status of all 12 recordings. Update it when you finish
one. Per-video shot notes: `docs/recording/LESSON-RECORDING-TEMPLATE.md`.
