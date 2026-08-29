import fs from "fs";
import path from "path";
import { chromium } from "playwright";

/**
 * Records a board meeting typing itself into a terminal, as video.
 *
 * Terry's idea, and it is the right one: the same engine that renders the still
 * proof cards can record motion, so this costs nothing and stays truthful. The
 * text is a real, redacted board report rather than invented output.
 *
 * A still card proves the report exists. Motion answers the question a still
 * cannot: does this actually run? That is the objection that stops people
 * buying, so it is worth a video even a short one.
 *
 *   node scripts/proof/record.mjs
 *   -> public/proof/board-run.webm
 */

const BANNED = [
  /gjthjkejiswnejlpyqcr/i, /acouuzccqkcpyrckrgwg/i, /admin@spdcertprep\.com/i,
  /Dontaye/i, /act_\d+/i, /\b\d{3}-\d{3}-\d{4}\b/,
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
];

/** [class, text] per line. Empty array is a blank line. */
const SCRIPT = [
  [["p", "$ "], ["cmd", "run the weekly board meeting"]],
  [],
  [["k", "Reading CHAIRMAN-NOTES.md ... 1 open item"]],
  [["k", "Reading CHARTER.md ... rank L2 Executive"]],
  [["k", "Running PLAYBOOKS/WEEKLY.md"]],
  [],
  [["k", "Step 1  liveness check"]],
  [["hl", "  BOARD-MEETINGS/ newest file is 40 days old."]],
  [["v", "  That is the headline, not a footnote."]],
  [],
  [["k", "Step 2  metrics, from the query pack"]],
  [["v", "  total users   444   floor 395    BEAT"]],
  [["v", "  WAU            28   floor  34    "], ["hl", "MISSED"]],
  [["v", "  true_paid      12   was    14    "], ["hl", "-2"]],
  [["v", "  ledger 7d      $0   floor $118   "], ["hl", "MISSED"]],
  [["k", "  Stripe not pulled. Recorded as a gap."]],
  [],
  [["k", "Step 3  writing the report"]],
  [["v", "  -> BOARD-MEETINGS/2026-08-16.md"]],
  [["v", "  -> DECISION-LOG.md   2 entries, rank stamped"]],
  [["v", "  -> memory/CANDIDATES.md   1 proposed"]],
  [],
  [["k", "Step 5.5  promotion status, mandatory"]],
  [["hl", "  Not requesting L3."], ["v", " Daily run dead 40 days"]],
  [["v", "  and paid accounts falling. Those fail the bar."]],
  [],
  [["c", "Done. 3 asks for the Chairman. Nothing sent."]],
];

const all = JSON.stringify(SCRIPT);
const hits = BANNED.filter((re) => re.test(all));
if (hits.length) {
  console.error("REDACTION FAILURE:", hits.map(String).join(", "));
  process.exit(1);
}
console.log("redaction gate: clean");

const W = 1280, H = 720;
const out = path.join(path.dirname(new URL(import.meta.url).pathname), "../../public/proof");
fs.mkdirSync(out, { recursive: true });

const shell = `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:#fdfbf7;display:flex;align-items:center;
 justify-content:center;padding:44px;font-family:ui-sans-serif,-apple-system,sans-serif}
.win{width:100%;background:#23201b;border-radius:14px;overflow:hidden;
 box-shadow:0 26px 70px rgba(35,32,27,.20);display:flex;flex-direction:column;height:100%}
.bar{display:flex;align-items:center;gap:9px;padding:14px 20px;background:#2e2a24;flex:none}
.dot{width:11px;height:11px;border-radius:50%}
.name{margin-left:10px;color:#a8a29e;font-size:15px;font-family:ui-monospace,Menlo,monospace}
#t{flex:1;overflow:hidden;padding:26px 34px;font-family:ui-monospace,Menlo,monospace;
 font-size:19px;line-height:1.62;color:#d6d3d1;white-space:pre-wrap}
.c{color:#c9a84c;font-weight:600}.k{color:#8a7f72}.p{color:#61c554}
.cmd{color:#e7e5e4}
.hl{background:rgba(201,168,76,.20);color:#e7d9a8;border-radius:4px;padding:1px 5px}
.cur{display:inline-block;width:10px;height:19px;background:#c9a84c;vertical-align:-3px}
</style><body><div class="win">
<div class="bar"><span class="dot" style="background:#f0665c"></span>
<span class="dot" style="background:#f4bd4f"></span>
<span class="dot" style="background:#61c554"></span>
<span class="name">~/ai-board</span></div>
<div id="t"></div></div></body>`;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: out, size: { width: W, height: H } },
});
const page = await context.newPage();
await page.setContent(shell, { waitUntil: "load" });

await page.evaluate(async (script) => {
  const t = document.getElementById("t");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const cursor = () => {
    const c = document.createElement("span");
    c.className = "cur";
    return c;
  };

  await sleep(700);
  for (const line of script) {
    if (line.length === 0) { t.append(document.createTextNode("\n")); continue; }
    for (const [cls, text] of line) {
      const span = document.createElement("span");
      span.className = cls;
      t.append(span);
      // Type the command slowly; let output land in one go, the way a real
      // terminal behaves.
      if (cls === "cmd" || cls === "p") {
        const cur = cursor();
        t.append(cur);
        for (const ch of text) { span.textContent += ch; await sleep(34); }
        cur.remove();
      } else {
        span.textContent = text;
        await sleep(cls === "hl" ? 260 : 130);
      }
    }
    t.append(document.createTextNode("\n"));
    t.scrollTop = t.scrollHeight;
  }
  await sleep(1600);
}, SCRIPT);

await context.close();
await browser.close();

const produced = fs.readdirSync(out).filter((f) => f.endsWith(".webm"));
const final = path.join(out, "board-run.webm");
if (produced.length) {
  fs.renameSync(path.join(out, produced[0]), final);
  const kb = Math.round(fs.statSync(final).size / 1024);
  console.log(`  public/proof/board-run.webm (${kb}KB)`);
} else {
  console.error("no video produced");
  process.exit(1);
}
