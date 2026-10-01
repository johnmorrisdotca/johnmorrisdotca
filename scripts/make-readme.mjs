// Writes README.md from the package list, so a name or a line is said once. Run: pnpm readme
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PACKAGES } from "./packages.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gh = "https://github.com/johnmorrisdotca";
const pages = "https://johnmorrisdotca.github.io";
const urlOf = (p) => p.url ?? `${pages}/${p.slug}/`;
const repoOf = (p) => `${gh}/${p.slug}`;

// Pictures are inline, not in a table: GitHub draws table borders and stripes, and a
// fixed width lets three sit in a row on a desk and one on a phone.
const SIZE = 272;
const picture = (p) =>
  `<a href="${urlOf(p)}"><img src="cards/${p.slug}.jpg" width="${SIZE}" alt="${p.name} ${p.jp}: ${p.line} Open the demo."></a>`;

const groups = [...new Set(PACKAGES.map((p) => p.group))];
const section = (title) => {
  const list = PACKAGES.filter((p) => p.group === title);
  const code = list.map((p) => `[${p.name === "itsutsu.com" ? "its code" : p.name}](${repoOf(p)})`).join(" · ");
  return `## ${title}

<p align="center">
${list.map(picture).join("\n")}
</p>

<p align="center"><sub>Code: ${code}</sub></p>
`;
};

const readme = `<picture>
  <source media="(prefers-color-scheme: dark) and (max-width: 600px)" srcset="banner/banner-narrow-dark.png">
  <source media="(prefers-color-scheme: light) and (max-width: 600px)" srcset="banner/banner-narrow-light.png">
  <source media="(prefers-color-scheme: dark)" srcset="banner/banner-dark.png">
  <img src="banner/banner-light.png" alt="Games, puzzles and tools for the web. Small open-source packages with no dependencies, each with a demo you can play, in English and Japanese." width="100%">
</picture>

Click a picture to play its demo. Each package installs from npm as \`@johnmorrisdotca/<name>\`, and its README says what its Japanese name means. They are the games and tools of [itsutsu.com](https://itsutsu.com), taken out so anyone can use them.

${groups.map(section).join("\n")}
## Under the hood

Rules are pure: every move makes a new state and changes nothing it was given, so a game can be saved as text, replayed, and checked on a server. Deals are seeded: the same seed gives the same game in every browser. Every demo switches between English and 日本語, and all of it is MIT licensed.

Also here: [SumiLabu](${gh}/sumilabu), MicroPython firmware and a telemetry dashboard for e-ink clocks.

<sub>The pictures are made from the live demos by [\`scripts/\`](scripts) (\`pnpm cards\`, \`pnpm banner\`), so they can be remade when a demo changes. Lettering is Geist and Zen Old Mincho, both under the SIL Open Font License.</sub>
`;
writeFileSync(join(root, "README.md"), readme);
console.log("README.md written");
