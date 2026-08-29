import fs from "fs";
import path from "path";
import { chromium } from "playwright";

/**
 * Renders social cards from social/posts.json using the HTML template.
 *
 * Playwright rather than an image model, deliberately: these are typographic
 * cards, and diffusion models mangle letterforms. This is free per render, the
 * text is always exactly right, and re-rendering after a copy edit is instant.
 *
 *   node social/render.mjs            # all sizes
 *   node social/render.mjs square     # one size
 */
const SIZES = {
  square:   { w: 1080, h: 1080, headline: 74 },  // Instagram, LinkedIn
  portrait: { w: 1080, h: 1350, headline: 78 },  // Instagram portrait
  story:    { w: 1080, h: 1920, headline: 86 },  // Stories, Reels covers
  wide:     { w: 1200, h: 630,  headline: 62 },  // X, OG images
};

const root = path.dirname(new URL(import.meta.url).pathname);
const tpl = fs.readFileSync(path.join(root, "templates/post.html"), "utf8");
const posts = JSON.parse(fs.readFileSync(path.join(root, "posts.json"), "utf8"));
const only = process.argv[2];
const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const browser = await chromium.launch();
let n = 0;
for (const [sizeName, size] of Object.entries(SIZES)) {
  if (only && only !== sizeName) continue;
  const page = await browser.newPage({ viewport: { width: size.w, height: size.h } });
  for (const post of posts) {
    const html = tpl
      .replaceAll("{{W}}", size.w)
      .replaceAll("{{H}}", size.h)
      .replaceAll("{{HEADLINE_SIZE}}", size.headline)
      .replaceAll("{{KICKER}}", esc(post.kicker))
      .replaceAll("{{HEADLINE}}", esc(post.headline))
      .replaceAll("{{BODY}}", esc(post.body))
      .replaceAll("{{FOOTER}}", esc(post.footer));
    await page.setContent(html, { waitUntil: "load" });
    const file = path.join(outDir, `${post.slug}-${sizeName}.png`);
    await page.screenshot({ path: file });
    console.log("  " + path.relative(process.cwd(), file));
    n++;
  }
  await page.close();
}
await browser.close();
console.log(`\n${n} cards rendered.`);
