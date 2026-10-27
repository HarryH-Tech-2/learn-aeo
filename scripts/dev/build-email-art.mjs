/**
 * Renders the images the emails use (src/lib/email-layout.ts) with sharp. Mail clients need PNG or JPEG
 * (no WebP, no SVG), so each one is drawn here as SVG and rasterised at 2x for sharp retina display:
 *
 *   public/email/city-header.png  1200 x 200  (shown 600 x 100)  the City of Answers skyline, top of every email
 *   public/email/rule.png         1200 x 24   (shown 600 x 12)   a cyan rule with a gold diamond, foot of every email
 *   public/email/mark-aeo.png     72 x 72     (shown 36 x 36)    the Learn AEO mark, from public/favicon.svg
 *
 * Brand colours: navy #04060d, cyan #6fe3ff, gold #ffc76b. No text in any image (librsvg cannot load the
 * brand fonts, and the wordmark is set in live text beside the mark). Run once, commit the output:
 *
 *   node scripts/dev/build-email-art.mjs
 */
import { readFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const NAVY = "#04060d";
const CYAN = "#6fe3ff";
const GOLD = "#ffc76b";

await mkdir("public/email", { recursive: true });

// ── Header: a skyline of districts under a night sky, the brand's search bar and gold seam as the city gate ──
function skyline() {
  // [x, width, height] of each tower, left to right; a fixed list so the output is the same every run
  const towers = [
    [20, 70, 60], [96, 46, 92], [150, 84, 70], [244, 40, 118], [292, 66, 84], [366, 52, 104],
    [426, 30, 56], [744, 30, 56], [780, 60, 74], [848, 50, 108], [906, 72, 80], [986, 44, 124], [1038, 82, 66], [1128, 56, 90],
  ];
  const ground = 200;
  let out = "";
  for (const [x, w, h] of towers) {
    const y = ground - h;
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#tower)"/>`;
    out += `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${CYAN}" stroke-opacity="0.55" stroke-width="2"/>`;
    // a few lit windows, in a fixed pattern
    for (let row = 0; row < Math.floor((h - 20) / 22); row++) {
      for (let col = 0; col < Math.floor((w - 12) / 18); col++) {
        if ((x + row * 7 + col * 13) % 5 !== 0) continue;
        out += `<rect x="${x + 10 + col * 18}" y="${y + 14 + row * 22}" width="6" height="8" fill="${GOLD}" fill-opacity="0.75"/>`;
      }
    }
  }
  return out;
}

const header = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200" viewBox="0 0 1200 200">
  <defs>
    <radialGradient id="glow" cx="50%" cy="70%" r="55%">
      <stop offset="0" stop-color="#16294a" stop-opacity="1"/>
      <stop offset="1" stop-color="${NAVY}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tower" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#14223f"/>
      <stop offset="1" stop-color="#0a1226"/>
    </linearGradient>
    <linearGradient id="seam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="horizon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${CYAN}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${CYAN}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="200" fill="${NAVY}"/>
  <rect width="1200" height="200" fill="url(#glow)"/>
  <g fill="#e6ebf5" fill-opacity="0.5">
    <circle cx="80" cy="30" r="1.5"/><circle cx="210" cy="58" r="1.2"/><circle cx="330" cy="22" r="1.6"/>
    <circle cx="470" cy="44" r="1.2"/><circle cx="700" cy="26" r="1.4"/><circle cx="820" cy="52" r="1.2"/>
    <circle cx="960" cy="20" r="1.6"/><circle cx="1090" cy="40" r="1.3"/><circle cx="1160" cy="70" r="1.2"/>
  </g>
  ${skyline()}
  <rect x="470" y="96" width="260" height="56" rx="28" fill="${NAVY}" fill-opacity="0.85" stroke="${CYAN}" stroke-width="4"/>
  <rect x="597" y="70" width="6" height="108" rx="3" fill="url(#seam)"/>
  <rect x="0" y="197" width="1200" height="3" fill="url(#horizon)"/>
</svg>`;
await sharp(Buffer.from(header)).png().toFile("public/email/city-header.png");
console.log("public/email/city-header.png 1200x200");

// ── Rule: a thin cyan line fading out at both ends, a gold diamond in the middle ──
const rule = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="24" viewBox="0 0 1200 24">
  <defs>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${CYAN}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="${CYAN}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="24" fill="#0b1020"/>
  <rect x="0" y="11" width="1200" height="2" fill="url(#line)"/>
  <rect x="592" y="4" width="16" height="16" fill="${GOLD}" transform="rotate(45 600 12)"/>
</svg>`;
await sharp(Buffer.from(rule)).png().toFile("public/email/rule.png");
console.log("public/email/rule.png 1200x24");

// ── Mark: the favicon (search-bar outline split by a gold seam, on navy) ──
const mark = await readFile("public/favicon.svg");
await sharp(mark, { density: 72 * 2 * (72 / 64) }).resize(72, 72).png().toFile("public/email/mark-aeo.png");
console.log("public/email/mark-aeo.png 72x72");
