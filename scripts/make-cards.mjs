// Makes one card per package: the live demo's play surface, set on felt, with
// the name and the Japanese name lettered in. Run: pnpm cards  (or  pnpm cards narabe tenka)
// It needs the network (the demos are on GitHub Pages; the lettering fonts are on
// Google Fonts) and a Playwright Chromium (pnpm exec playwright install chromium).
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PACKAGES } from "./packages.mjs";
import { FONTS_LINK, TOKENS } from "./look.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "cards");
mkdirSync(out, { recursive: true });
mkdirSync(join(root, ".cache"), { recursive: true });

const CARD = { w: 600, h: 440 }; // CSS px; the file is twice that

// What the demo's own felt is called, so the card can lay its own felt behind the surface.
const BARE = `
  html, body { background: transparent !important; }
  .fam-felt, .kk-felt, .ht-felt, .km-board, .table, .seed-box, .cube-felt, .stage,
  .sgp-board, .play { background: none !important; box-shadow: none !important; border: 0 !important; }
  .fam-felt::before, .fam-felt::after, .table::before, .table::after, .ht-felt::before, .ht-felt::after,
  .km-board::before, .km-board::after, .seed-box::before, .seed-box::after { display: none !important; }
`;

const only = process.argv.slice(2);
const browser = await chromium.launch();

for (const pkg of PACKAGES) {
  if (!pkg.surface) continue;
  if (only.length && !only.includes(pkg.slug)) continue;
  const page = await browser.newPage({ viewport: { width: pkg.surface.width ?? 1280, height: pkg.surface.height ?? 900 }, deviceScaleFactor: 2 });
  await page.goto(pkg.url ?? `https://johnmorrisdotca.github.io/${pkg.slug}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  if (pkg.surface.prep) await pkg.surface.prep(page);
  await page.addStyleTag({ content: (pkg.surface.opaque ? "" : BARE) + (pkg.surface.css ?? "") + "\n/* */" });
  await page.waitForTimeout(300);
  // a surface is one element, or a rectangle worked out from the page
  const png = pkg.surface.clip
    ? await page.screenshot({ fullPage: true, omitBackground: !pkg.surface.opaque, clip: await pkg.surface.clip(page) })
    : await page.locator(pkg.surface.selector).first().screenshot({ omitBackground: true });
  await page.close();
  writeFileSync(join(root, ".cache", `${pkg.slug}.png`), png);

  const card = await browser.newPage({ viewport: { width: CARD.w, height: CARD.h }, deviceScaleFactor: 2 });
  await card.setContent(cardHtml(pkg, png.toString("base64")));
  await card.evaluate(() => document.fonts.ready);
  await card.evaluate(() => window.trimmed);
  await card.waitForTimeout(300);
  await card.screenshot({ path: join(out, `${pkg.slug}.jpg`), type: "jpeg", quality: 90 });
  await card.close();
  console.log("card", pkg.slug);
}
await browser.close();

function cardHtml(pkg, b64) {
  const t = TOKENS;
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS_LINK}
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: ${CARD.w}px; height: ${CARD.h}px; overflow: hidden; background: ${t.felt};
    background-image: radial-gradient(120% 90% at 50% 38%, ${t.feltLight} 0%, ${t.felt} 55%, ${t.feltDeep} 100%);
    font-family: "Geist", system-ui, sans-serif; color: ${t.ivory}; }
  header { position: absolute; left: 30px; top: 22px; right: 30px; display: flex; align-items: baseline; gap: 14px; }
  h1 { font-size: 40px; font-weight: 600; letter-spacing: -0.5px; line-height: 1; }
  .jp { font-family: "Zen Old Mincho", serif; font-size: 26px; font-weight: 700; opacity: .72; }
  .stage { position: absolute; left: 30px; right: 30px; top: 80px; bottom: 104px; display: flex; align-items: center; justify-content: center; }
  .stage img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 6px 14px rgba(0,0,0,.35)); }
  .line { position: absolute; left: 30px; right: 30px; bottom: 26px; font-size: 25px; line-height: 1.3; font-weight: 400; color: ${t.ivory}; opacity: .85; }
  .stage img.opaque { width: auto; height: auto; max-width: 100%; max-height: 100%; border-radius: 14px; }
</style></head><body>
<header><h1>${pkg.name}</h1><span class="jp">${pkg.jp}</span></header>
<p class="line">${pkg.line}</p>
<div class="stage"><img id="s" ${pkg.surface.opaque ? 'class="opaque"' : ""} src="data:image/png;base64,${b64}"></div>
<script>
// cut the surface down to what is drawn, so the card is not mostly the demo's empty felt
window.trimmed = new Promise((done) => {
  const img = document.getElementById("s");
  const go = () => {
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i++) if (d[(y * c.width + i) * 4 + 3] > 24) {
      if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    const pad = 6, w = x1 - x0 + 1 + pad * 2, h = y1 - y0 + 1 + pad * 2;
    const o = document.createElement("canvas"); o.width = w; o.height = h;
    o.getContext("2d").drawImage(c, x0 - pad, y0 - pad, w, h, 0, 0, w, h);
    img.onload = () => { if (!img.classList.contains("opaque")) { img.style.maxWidth = (w / 2 * 1.7) + "px"; img.style.maxHeight = (h / 2 * 1.7) + "px"; } done(); }; img.src = o.toDataURL("image/png");
  };
  img.complete ? go() : (img.onload = go);
});
</script>
</body></html>`;
}
