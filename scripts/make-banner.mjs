// Makes the banner at the top of the profile, in a light and a dark version.
// Run: pnpm banner
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FONTS_LINK, TOKENS as t } from "./look.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = (f) => "data:image/svg+xml;base64," + readFileSync(join(root, "assets", f)).toString("base64");

const W = 1200, H = 300;
const THEMES = {
  light: { bg: t.paper, ink: t.ink, muted: t.muted, felt: "#2d5a47", tile: "itsutsu-avatar-charcoal.svg", rule: "#e3ded4" },
  dark: { bg: t.ink, ink: t.ivory, muted: "#b4aea3", felt: "#2d5a47", tile: "itsutsu-avatar-ivory.svg", rule: "#3a3b36" },
};

// five things for 五つ: a die, two stones, a marble, a card, a domino
const OBJECTS = `
<svg width="360" height="${H}" viewBox="0 0 360 ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="m" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffb877"/><stop offset=".55" stop-color="#e8751f"/><stop offset="1" stop-color="#a8460c"/></radialGradient>
    <radialGradient id="b" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#5a5b55"/><stop offset="1" stop-color="#15160f"/></radialGradient>
    <radialGradient id="w" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d8d3c6"/></radialGradient>
    <filter id="s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity=".35"/></filter>
  </defs>
  <g filter="url(#s)">
    <!-- die, five -->
    <g transform="translate(60 52) rotate(-9 40 40)"><rect width="80" height="80" rx="16" fill="#fffef9"/>
      ${[[20,20],[60,20],[40,40],[20,60],[60,60]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7.5" fill="#22231f"/>`).join("")}</g>
    <!-- stones -->
    <circle cx="228" cy="76" r="33" fill="url(#b)"/>
    <circle cx="272" cy="118" r="33" fill="url(#w)"/>
    <!-- marble -->
    <circle cx="84" cy="196" r="32" fill="url(#m)"/>
    <ellipse cx="74" cy="183" rx="9" ry="6" fill="#fff" opacity=".45" transform="rotate(-30 74 183)"/>
    <!-- card -->
    <g transform="translate(236 176) rotate(11 33 46)"><rect width="66" height="92" rx="9" fill="#fffef9"/>
      <path d="M33 66 C10 50 13 31 24 31 C29 31 33 35 33 38 C33 35 37 31 42 31 C53 31 56 50 33 66Z" fill="#b2302f"/>
      <text x="9" y="22" font-family="Geist, sans-serif" font-weight="600" font-size="17" fill="#b2302f">A</text></g>
    <!-- domino -->
    <g transform="translate(132 248) rotate(-5)"><rect width="84" height="42" rx="8" fill="#fffef9"/><line x1="42" y1="6" x2="42" y2="36" stroke="#22231f" stroke-opacity=".5"/>
      ${[[13,12],[29,30],[13,30],[29,12],[21,21]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.6" fill="#22231f"/>`).join("")}
      ${[[55,12],[71,30]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.6" fill="#22231f"/>`).join("")}</g>
  </g>
</svg>`;

function html(th) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS_LINK}<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: ${W}px; height: ${H}px; background: ${th.bg}; position: relative; overflow: hidden; font-family: "Geist", system-ui, sans-serif; }
  .tile { position: absolute; left: 60px; top: 66px; width: 168px; height: 168px; }
  .text { position: absolute; left: 268px; top: 0; bottom: 0; width: 560px; display: flex; flex-direction: column; justify-content: center; }
  h1 { font-size: 42px; line-height: 1.1; font-weight: 600; letter-spacing: -0.8px; color: ${th.ink}; }
  p { margin-top: 16px; font-size: 19px; line-height: 1.45; color: ${th.muted}; font-weight: 400; }
  .felt { position: absolute; right: 0; top: 0; bottom: 0; width: 330px; background: radial-gradient(120% 100% at 40% 40%, #376b55 0%, ${th.felt} 55%, #234a3a 100%); }
  .felt svg { position: absolute; left: -10px; top: 0; }
  .jp { position: absolute; right: 22px; bottom: 16px; font-family: "Zen Old Mincho", serif; font-weight: 700; font-size: 20px; color: #fffef9; opacity: .55; letter-spacing: 2px; }
</style></head><body>
<img class="tile" src="${svg(th.tile)}">
<div class="text"><h1>Games, puzzles and tools for the web.</h1>
<p>Small open-source packages with no dependencies, each with a demo you can play, in English and Japanese.</p></div>
<div class="felt">${OBJECTS}</div>
</body></html>`;
}

const browser = await chromium.launch();
for (const [name, th] of Object.entries(THEMES)) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await page.setContent(html(th));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(root, "banner", `banner-${name}.png`) });
  await page.close();
  console.log("banner", name);
}
await browser.close();
