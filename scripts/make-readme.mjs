// Writes README.md from the table below, so a name or a line is said once. Run: pnpm readme
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gh = "https://github.com/johnmorrisdotca";
const pages = "https://johnmorrisdotca.github.io";

const P = {
  toranpu: ["Toranpu", "トランプ", "Ten card games with computer players."],
  hitotsu: ["Hitotsu", "一つ", "The colour-card shedding game, for two to eight."],
  narabe: ["Narabe", "並べ", "One rules engine for forty-eight board games."],
  sugoroku: ["Sugoroku", "双六", "Backgammon and its relatives, with the doubling cube."],
  domino: ["Domino", "ドミノ", "Dominoes, and Mexican Train for two to eight."],
  jarajara: ["Jarajara", "ジャラジャラ", "Mahjong tiles, and the matching solitaire Awase."],
  tsunagi: ["Tsunagi", "繋ぎ", "Join the pairs with lines. Every level has one answer."],
  suido: ["Suido", "水道", "Turn the pipes until the water reaches every drain."],
  kazu: ["Kazu", "数", "Sudoku and five more number puzzles."],
  meikyuu: ["Meikyuu", "迷宮", "A thousand mazes in every shape."],
  kyuubu: ["Kyuubu", "キューブ", "A turning cube from 2×2 to 7×7."],
  kotoba: ["Kotoba", "言葉", "Word lists in English, French, German and Japanese."],
  kumimoji: ["Kumimoji", "組み文字", "The crossword tile race, in English and Japanese kana."],
  tenka: ["Tenka", "天下", "World conquest on a map of the real world."],
  korokoro: ["Korokoro", "コロコロ", "Dice, with the exact odds of every throw."],
  tane: ["Tane", "種", "Seeded random numbers: one seed, the same on every device."],
};

const cell = (slug) => {
  const [name, jp, line] = P[slug];
  return `<td width="33%" valign="top">
<a href="${pages}/${slug}/"><img src="cards/${slug}.jpg" alt="${name} ${jp}, a picture of its demo" width="100%"></a><br>
<b><a href="${gh}/${slug}">${name}</a></b> ${jp}<br>${line}
</td>`;
};

const table = (cells) => {
  const rows = [];
  for (let i = 0; i < cells.length; i += 3) {
    const row = cells.slice(i, i + 3);
    while (row.length < 3) row.push(`<td width="33%"></td>`);
    rows.push(`<tr>\n${row.join("\n")}\n</tr>`);
  }
  return `<table>\n${rows.join("\n")}\n</table>`;
};

const group = (title, slugs, extra = []) => `## ${title}\n\n${table([...slugs.map(cell), ...extra])}\n`;

const readme = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="banner/banner-dark.png">
  <img src="banner/banner-light.png" alt="Games, puzzles and tools for the web. Small open-source packages with no dependencies, each with a demo you can play, in English and Japanese." width="100%">
</picture>

Click a picture to play its demo, or a name to read the code. Each one installs from npm as \`@johnmorrisdotca/<name>\`, and each README says what its Japanese name means.

<table>
<tr>
<td width="33%" valign="top">
<a href="https://itsutsu.com"><img src="cards/itsutsu.jpg" alt="itsutsu.com 五つ, a picture of its home page" width="100%"></a>
</td>
<td width="67%" valign="middle" colspan="2">
<b><a href="https://itsutsu.com">itsutsu.com</a></b> 五つ<br>
Board games, puzzles and cards, played at your own pace: a games site for friends and family, in early release by invitation. The packages below are its games and tools, taken out so anyone can use them. <a href="${gh}/itsutsu">Its code is here too.</a>
</td>
</tr>
</table>

${group("Games", ["toranpu", "hitotsu", "narabe", "sugoroku", "domino", "jarajara"])}
${group("Puzzles", ["tsunagi", "suido", "kazu", "meikyuu", "kyuubu"])}
${group("Words and Japanese", ["kotoba", "kumimoji"], [`<td width="33%" valign="middle">
Every demo switches between English and 日本語, and every name is a Japanese word.
</td>`])}
${group("Maps, dice and seeds", ["tenka", "korokoro", "tane"])}
## Under the hood

Rules are pure: every move makes a new state and changes nothing it was given, so a game can be saved as text, replayed, and checked on a server. Deals are seeded: the same seed gives the same game in every browser. All MIT licensed.

Also here: [SumiLabu](${gh}/sumilabu), MicroPython firmware and a telemetry dashboard for e-ink clocks.

<sub>The pictures are made from the live demos by [\`scripts/\`](scripts) (\`pnpm cards\`, \`pnpm banner\`), so they can be remade when a demo changes. Lettering is Geist and Zen Old Mincho, both under the SIL Open Font License.</sub>
`;
writeFileSync(join(root, "README.md"), readme);
console.log("README.md written");
