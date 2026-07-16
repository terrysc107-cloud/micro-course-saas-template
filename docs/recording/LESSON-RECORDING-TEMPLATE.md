# Recording sheet — `NN — Title`

Copy this file to `docs/recording/NN-topic-slug.md` and fill it in before you hit record.
Ten minutes here saves a re-record.

The point of this sheet is that you should never be **deciding** while the camera is
rolling. Decide here; perform there.

---

## The one thing

> If a viewer remembers exactly one sentence, it should be:
>
> **[ … ]**

Should match the lesson's `<KeyPoint>`. If you can't write this line, the video isn't ready.

## Maps to

- Lesson(s): `content/modules/…`
- Tracker id: `NN`
- Target length: `N` min (hard stop: 12 — split if longer)
- Priority: `N`

## Visual proof

> The specific thing that must be visible on screen — the reason this is a video and not a
> paragraph.

- [ ] **[ … ]**

If you can't name it, write the lesson instead and skip the video.

---

## Setup

**Repo / starting state:**
- Path: `~/…`
- State: `git status` clean at commit `…`
- Reset command: `…`  ← so take 2 starts identically

**On screen:**
- [ ] Terminal font ≥ 18pt
- [ ] Scrollback cleared
- [ ] Default prompt (no client names, no personal paths)
- [ ] 1920×1080, not a downscaled 4K display

**Safety — assume every pixel ships:**
- [ ] Notifications off (Focus / Do Not Disturb)
- [ ] Password manager closed
- [ ] Signed out of personal accounts; throwaway account only
- [ ] No secrets in env, history, or `.env` files that might be opened
- [ ] No client names, customer records, or real emails anywhere on screen
- [ ] Everything shown is yours to show

**Audio:**
- [ ] Mic tested — record 10s and listen back

---

## Beats

Rough timings. Don't script prose — you'll sound like you're reading, because you will be.
Bullets keep you conversational.

| # | Beat | ~Time | Notes |
|---|------|-------|-------|
| 1 | **The promise** — what they'll be able to do | 0:00–0:20 | No intro music, no "hey guys". Get in. |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | **The point** — one sentence | last 0:20 | The "one thing" from above |

## Exact commands / prompts

> Write them out. Typing a prompt you're improvising is how takes die.

```
```

## Expected failure

> Where might this go wrong live? Decide **now** whether you keep it in.

- Likely wobble: …
- Keep it in? **yes / no** — default yes. Real failure and recovery is the footage nobody
  else has, and it's what the written lessons promise.

## Dating

- [ ] Does this show a UI or command that will change? → say **"as of \<month year\>, check
  the docs"** on camera.

---

## Post

- [ ] Exported `NN-topic-slug-vN.mp4` (16:9, 1920×1080, H.264)
- [ ] Captions generated **and read through** — it mishears "Claude" every time
- [ ] Watched once, start to finish, at full size
- [ ] No secret, client name, or personal account visible — **watch specifically for this**
- [ ] Uploaded (unlisted YouTube or Vimeo; Vimeo preferred for paid material)
- [ ] `videoUrl: "…"` added to the lesson frontmatter
- [ ] Lesson page checked in a browser
- [ ] `docs/VIDEO-TRACKER.csv` updated: status, hosted_url, recorded_date, published_date
- [ ] If the video restates a fact: `LAST_VERIFIED` bumped in `lib/course-config.ts`

## Notes for next time

>
