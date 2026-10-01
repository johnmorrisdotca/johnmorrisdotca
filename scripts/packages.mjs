// Each package: its name, its Japanese name, and which part of its live demo is the play surface.
// `selector` is the element to photograph; `prep` gets the demo into a state worth showing.

const click = (page, text) => page.getByRole("button", { name: text, exact: true }).first().click();

// Click the points of a grid drawn in SVG, given the box and fractions along each side.
async function tapAt(page, box, points) {
  for (const [fx, fy] of points) {
    await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    await page.waitForTimeout(120);
  }
}

async function drag(page, pts) {
  await page.mouse.move(...pts[0]);
  await page.mouse.down();
  for (const pt of pts.slice(1)) await page.mouse.move(...pt, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
}

// the centre of each marble of one colour, as [x, y] pairs
async function marbles(page) {
  return page.evaluate(() => {
    const by = {};
    for (const c of document.querySelectorAll("svg.tsunagi circle")) {
      const f = c.getAttribute("fill") || "";
      if (!f.startsWith("url(")) continue;
      const r = c.getBoundingClientRect();
      (by[f] ||= []).push([r.x + r.width / 2, r.y + r.height / 2]);
    }
    return Object.values(by);
  });
}

export const PACKAGES = [
  {
    slug: "itsutsu", group: "The site", line: "Board games, puzzles and cards at your own pace. By invitation.", name: "itsutsu.com", jp: "五つ", url: "https://itsutsu.com/",
    surface: {
      width: 560, height: 1000, opaque: true,
      // the first two families on the home page
      async clip(page) {
        const a = await page.locator('a:has-text("Five in a row")').first().boundingBox();
        const b = await page.locator('a:has-text("Drops")').first().boundingBox();
        return { x: a.x, y: a.y, width: a.width, height: b.y + b.height - a.y };
      },
    },
  },
  { slug: "toranpu", group: "Games", line: "Ten card games with computer players.", name: "Toranpu", jp: "トランプ", surface: { width: 620, selector: ".table", css: "#seats, #piles, .moves { display: none !important; }" } },
  { slug: "hitotsu", group: "Games", line: "The colour-card shedding game, for two to eight.", name: "Hitotsu", jp: "一つ", surface: { width: 620, selector: "#table" } },
  {
    slug: "narabe", group: "Games", line: "One rules engine for forty-eight board games.", name: "Narabe", jp: "並べ",
    surface: {
      selector: "#board svg",
      async prep(page) {
        const box = await page.locator("#board svg").boundingBox();
        // a 9x9 board: grid from 9% to 91% of the tile
        const at = (i, j) => [0.09 + 0.82 * (i / 8), 0.09 + 0.82 * (j / 8)];
        await tapAt(page, box, [at(4, 4), at(3, 3), at(5, 4), at(3, 4), at(6, 4), at(4, 5), at(2, 4), at(4, 3), at(7, 4)]);
      },
    },
  },
  { slug: "sugoroku", group: "Games", line: "Backgammon and its relatives, with the doubling cube.", name: "Sugoroku", jp: "双六", surface: { selector: ".sgp-board" } },
  { slug: "domino", group: "Games", line: "Dominoes, and Mexican Train for two to eight.", name: "Domino", jp: "ドミノ", surface: { width: 620, selector: ".table", css: ".train:nth-child(2), .train:nth-child(3), .train:nth-child(4), .table-top, .news, .moves { display: none !important; }" } },
  { slug: "jarajara", group: "Games", line: "Mahjong tiles, and the matching solitaire Awase.", name: "Jarajara", jp: "ジャラジャラ", surface: { selector: "#game" } },
  {
    slug: "tsunagi", group: "Puzzles", line: "Join the pairs with lines. Every level has one answer.", name: "Tsunagi", jp: "繋ぎ",
    surface: {
      selector: ".tsp-box",
      async prep(page) {
        const sets = await marbles(page);
        // join the pairs that sit in a straight line, and the others by an L
        for (const [a, b] of sets.slice(0, 4)) {
          const straight = Math.abs(a[0] - b[0]) < 5 || Math.abs(a[1] - b[1]) < 5;
          await drag(page, straight ? [a, b] : [a, [a[0], b[1]], b]);
        }
      },
    },
  },
  { slug: "suido", group: "Puzzles", line: "Turn the pipes until the water reaches every drain.", name: "Suido", jp: "水道", surface: { selector: "#board svg" } },
  { slug: "kazu", group: "Puzzles", line: "Sudoku and five more number puzzles.", name: "Kazu", jp: "数", surface: { selector: ".kzp-box" } },
  {
    slug: "meikyuu", group: "Puzzles", line: "A thousand mazes in every shape.", name: "Meikyuu", jp: "迷宮",
    surface: {
      selector: ".mk-box",
      async prep(page) {
        await click(page, "Hexagons");
        await click(page, "Small");
        await page.waitForTimeout(400);
      },
    },
  },
  { slug: "kyuubu", group: "Puzzles", line: "A turning cube from 2×2 to 7×7.", name: "Kyuubu", jp: "キューブ", surface: { selector: "#stage" } },
  {
    slug: "kotoba", group: "Words and Japanese", line: "Word lists in English, French, German and Japanese.", name: "Kotoba", jp: "言葉",
    surface: {
      width: 560,
      // just the grid of guesses, a little loose
      async clip(page) {
        const b = await page.locator(".kt-grid").boundingBox();
        return { x: b.x - 16, y: b.y - 16, width: b.width + 32, height: b.height + 14 };
      },
      async prep(page) {
        for (const w of ["crane", "stole", "point"]) {
          await page.keyboard.type(w, { delay: 40 });
          await page.keyboard.press("Enter");
          await page.waitForTimeout(500);
        }
      },
    },
  },
  {
    slug: "kumimoji", group: "Words and Japanese", line: "The crossword tile race, in English and Japanese kana.", name: "Kumimoji", jp: "組み文字",
    surface: {
      width: 620, selector: "#table", css: ".km-status, .km-notes, .km-keep, details { display: none !important; }",
      async prep(page) {
        await click(page, "Kana");
        await page.locator("#new").click();
        await page.waitForTimeout(500);
        // lay six tiles along the middle row
        for (let col = 0; col < 6; col++) {
          await page.locator(".km-in-hand").first().click();
          await page.locator(".km-square").nth(3 * 7 + col).click();
          await page.waitForTimeout(100);
        }
      },
    },
  },
  { slug: "tenka", group: "Maps, dice and seeds", line: "World conquest on a map of the real world.", name: "Tenka", jp: "天下", surface: { selector: ".tk-board" } },
  { slug: "korokoro", group: "Maps, dice and seeds", line: "Dice, with the exact odds of every throw.", name: "Korokoro", jp: "コロコロ", surface: { width: 620, selector: ".kk-felt", css: ".kk-mute, .kk-felt::before, .kk-felt::after, .kk-tray::before, .kk-tray::after { display: none !important; }" } },
  { slug: "tane", group: "Maps, dice and seeds", line: "Seeded random numbers: the same on every device.", name: "Tane", jp: "種", surface: { width: 620, selector: ".seed-box" } },
];
