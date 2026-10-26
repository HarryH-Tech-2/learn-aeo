/**
 * The hieroglyph frieze used at the top and foot of every email (src/lib/email-layout.ts).
 * Mail clients have no font for hieroglyphs, so the band is a picture: the alphabet signs in gold
 * between two thin rules, drawn from the translator's font with fontkit and rasterised by sharp.
 *
 *   node scripts/dev/build-email-art.mjs   →   public/email/frieze.png (1200 × 72, shown at 600 × 36)
 */
import fs from "node:fs";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const font = fontkit.create(fs.readFileSync(path.join(root, "src/app/cartouche-image/noto-egyptian-translator.ttf")));

const W = 1200;
const H = 72;
const BG = "#12121a";
const GOLD = "#d4a832";
const RULE = "#6b5520";
const SIGNS = [..."𓄿𓇋𓂝𓅱𓃀𓊪𓆑𓅓𓈖𓂋𓉔𓎛𓐍𓊃𓈙𓎡𓎼𓏏𓍿𓂧𓆓"];

const glyphH = 40; // px tall for one em of the font's cap box
const scale = glyphH / font.unitsPerEm;
const gap = 18;

const runs = SIGNS.map((ch) => {
  const g = font.glyphForCodePoint(ch.codePointAt(0));
  return { g, w: g.advanceWidth * scale };
}).filter((r) => r.g.id !== 0);

// Repeat the alphabet until the band is full, then centre it.
const items = [];
let total = 0;
for (let i = 0; total < W - 40; i++) {
  const r = runs[i % runs.length];
  if (total + r.w + gap > W - 40) break;
  items.push(r);
  total += r.w + gap;
}
total -= gap;

let x = (W - total) / 2;
const baseline = H / 2 + (glyphH * 0.72) / 2;
const paths = items
  .map(({ g, w }) => {
    const d = g.path.toSVG();
    const t = `translate(${x.toFixed(2)} ${baseline.toFixed(2)}) scale(${scale} ${-scale})`;
    x += w + gap;
    return `<path d="${d}" transform="${t}" fill="${GOLD}"/>`;
  })
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${BG}"/>
<rect x="0" y="4" width="${W}" height="2" fill="${RULE}"/>
<rect x="0" y="${H - 6}" width="${W}" height="2" fill="${RULE}"/>
${paths}
</svg>`;

const out = path.join(root, "public/email/frieze.png");
await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(out);
console.log(`wrote ${out} (${items.length} signs)`);
