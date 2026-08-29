# Social cards

Typographic cards rendered from HTML by Playwright. **Not** an image model:
these are text-first, and diffusion models mangle letterforms. This costs
nothing per render and the copy is always exactly what you wrote.

```
node social/render.mjs           # every size
node social/render.mjs square    # one size
```

Output lands in `social/out/`, which is gitignored. Re-render after any copy
edit; it takes seconds.

| Size | Pixels | For |
|---|---|---|
| `square` | 1080×1080 | Instagram, LinkedIn |
| `portrait` | 1080×1350 | Instagram portrait |
| `story` | 1080×1920 | Stories, Reels covers |
| `wide` | 1200×630 | X, and OG images |

Copy lives in `posts.json`, one object per card. Keep headlines under about
eight words: the template scales type per size but does not shrink to fit, so a
long headline will simply run on.

The five shipped cards are the five steps of The Board Method, each leading with
the failure rather than the feature, which is what makes them worth stopping on.
