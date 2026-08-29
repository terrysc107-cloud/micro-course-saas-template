import fs from "fs";
import path from "path";
import { chromium } from "playwright";

/**
 * Renders proof cards from REAL board meetings run by the sibling business.
 *
 * This is the strongest asset the product has and the one nobody can copy: a
 * board that has run weekly for three months, including the weeks it was wrong.
 * The excerpt below opens by reporting its own scheduled job dead for 40 days
 * and paid customers falling 17 -> 14 -> 12 on $0 revenue. Nobody fabricates
 * a report like that, which is exactly why it persuades.
 *
 * REDACTION IS ENFORCED, NOT ASSUMED. Every string below is checked against
 * BANNED before anything renders, and the script exits non-zero on a hit. The
 * source documents contain real names, an internal email, and infrastructure
 * ids; none of them belong on a marketing page.
 */

// Identifiers that must never reach a rendered card. Extend, never relax.
const BANNED = [
  /gjthjkejiswnejlpyqcr/i,          // Supabase project ref
  /acouuzccqkcpyrckrgwg/i,
  /admin@spdcertprep\.com/i,
  /Dontaye/i,                        // real person named in the source
  /act_\d+/i,                        // Meta ad account
  /\b\d{3}-\d{3}-\d{4}\b/,           // Google Ads customer id / phone
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
];

const CARDS = [
  {
    slug: "headline",
    file: "BOARD-MEETINGS/2026-08-16.md",
    caption: "A real weekly report. Its headline is its own failure.",
    lines: [
      [["c", "## 1. Headline"]],
      [],
      [["hl", "The Daily Pulse is still dead (last entry #8, Jul 7 - 40 days)."]],
      [["v", "Standing order from Jul 25: a >48h gap is the headline. The"]],
      [["v", "session crons died; nothing replaced them."]],
      [],
      [["v", "true_paid fell again. "], ["hl", "17 -> 14 -> 12."], ["v", " Ledger $0 in 10"]],
      [["v", "days. Acquisition is not the story: the paid campaign"]],
      [["v", "attributed 75 signups and "], ["hl", "0 of them are paying"], ["v", "."]],
    ],
  },
  {
    slug: "metrics",
    file: "BOARD-MEETINGS/2026-08-16.md",
    caption: "Every number against its floor. Misses are stated, not softened.",
    lines: [
      [["c", "## 2. Metrics (live)"]],
      [],
      [["v", "| Metric       | Aug 6 | Aug 16 | Floor | Status   |"]],
      [["v", "|--------------|-------|--------|-------|----------|"]],
      [["v", "| Total users  |  422  |  444   |  395  | BEAT     |"]],
      [["v", "| WAU          |   44  |   "], ["hl", "28"], ["v", "   |   34  | "], ["hl", "MISSED"], ["v", "   |"]],
      [["v", "| true_paid    |   14  |   "], ["hl", "12"], ["v", "   |   -   | "], ["hl", "-2"], ["v", "       |"]],
      [["v", "| Ledger (7d)  |   -   |   "], ["hl", "$0"], ["v", "   | $118  | "], ["hl", "MISSED"], ["v", "   |"]],
      [],
      [["k", "Source: read-only query pack. Stripe not pulled. No PII."]],
    ],
  },
  {
    slug: "asks",
    file: "BOARD-MEETINGS/2026-08-16.md",
    caption: "What a board is actually for: three decisions, ordered by what they unblock.",
    lines: [
      [["c", "## 6. Asks for the Chairman"]],
      [["k", "   <= 3, dollar-ordered"]],
      [],
      [["v", "1. Approve the re-engagement send to the 355 lapsed"]],
      [["v", "   accounts. Drafted, not sent. "], ["hl", "L1 cannot send."]],
      [],
      [["v", "2. Decide whether Meta stays paused. It spent without"]],
      [["v", "   producing a paying customer."]],
      [],
      [["c", "## 9. Promotion status"]], [["k", "   mandatory, never skipped"]],
      [["hl", "Not requesting L3."], ["v", " The daily run has been dead 40"]],
      [["v", "days and paid accounts are falling. Those fail the bar."]],
    ],
  },
];

// ── Redaction gate ──────────────────────────────────────────────────────────
const all = JSON.stringify(CARDS);
const hits = BANNED.filter((re) => re.test(all));
if (hits.length) {
  console.error("REDACTION FAILURE. These patterns appear in the cards:");
  hits.forEach((h) => console.error("  " + h));
  process.exit(1);
}
console.log("redaction gate: clean\n");

const TPL = (card) => `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1376px;height:768px;background:#fdfbf7;
 font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
 display:flex;align-items:center;justify-content:center;padding:56px}
.wrap{width:100%}
.win{background:#23201b;border-radius:14px;overflow:hidden;box-shadow:0 30px 80px rgba(35,32,27,.18)}
.bar{display:flex;align-items:center;gap:10px;padding:16px 22px;background:#2e2a24}
.dot{width:12px;height:12px;border-radius:50%}
.name{margin-left:12px;color:#a8a29e;font-size:17px;font-family:ui-monospace,Menlo,monospace}
pre{padding:32px 40px 38px;font-family:ui-monospace,Menlo,monospace;font-size:23px;
 line-height:1.6;color:#d6d3d1;white-space:pre-wrap}
.c{color:#c9a84c;font-weight:600}.k{color:#8a7f72}
.hl{background:rgba(201,168,76,.20);color:#e7d9a8;border-radius:4px;padding:1px 5px}
.cap{margin-top:24px;text-align:center;color:#6b6055;font-size:21px}
</style><body><div class="wrap">
<div class="win"><div class="bar">
 <span class="dot" style="background:#f0665c"></span>
 <span class="dot" style="background:#f4bd4f"></span>
 <span class="dot" style="background:#61c554"></span>
 <span class="name">${card.file}</span></div>
<pre>${card.lines.map(l => l.length === 0 ? "" :
  l.map(([c, t]) => c ? `<span class="${c}">${t}</span>` : t).join("")).join("\n")}</pre>
</div><p class="cap">${card.caption}</p></div></body>`;

const out = path.join(path.dirname(new URL(import.meta.url).pathname), "../../public/proof");
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1376, height: 768 } });
for (const card of CARDS) {
  await page.setContent(TPL(card), { waitUntil: "load" });
  await page.screenshot({ path: path.join(out, `${card.slug}.png`) });
  console.log("  public/proof/" + card.slug + ".png");
}
await browser.close();
console.log("\n3 proof cards rendered from real board meetings.");
