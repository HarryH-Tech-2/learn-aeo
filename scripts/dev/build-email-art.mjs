/**
 * Renders the images the emails use (src/lib/email-layout.ts) with sharp. Mail clients need PNG or JPEG
 * (no WebP, no SVG), so each one is drawn here as SVG and rasterised at 2x for sharp retina display:
 *
 *   public/email/header.png       1200 x 200  (shown 600 x 100)  the search bar on navy, top of every email
 *   public/email/rule.png         1200 x 24   (shown 600 x 12)   a cyan rule with a gold diamond, foot of every email
 *   public/email/mark-aeo.png     72 x 72     (shown 36 x 36)    the Learn AEO mark, from public/favicon.svg
 *
 * Brand colors: navy #04060d, cyan #6fe3ff, gold #ffc76b. No text in any image (librsvg cannot load the
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

// ── Header: the brand's search bar and gold seam on navy, over a cyan rule ──
const header = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200" viewBox="0 0 1200 200">
  <defs>
    <radialGradient id="glow" cx="50%" cy="70%" r="55%">
      <stop offset="0" stop-color="#16294a" stop-opacity="1"/>
      <stop offset="1" stop-color="${NAVY}" stop-opacity="0"/>
    </radialGradient>
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
  <rect x="470" y="96" width="260" height="56" rx="28" fill="${NAVY}" fill-opacity="0.85" stroke="${CYAN}" stroke-width="4"/>
  <rect x="597" y="70" width="6" height="108" rx="3" fill="url(#seam)"/>
  <rect x="0" y="197" width="1200" height="3" fill="url(#horizon)"/>
</svg>`;
await sharp(Buffer.from(header)).png().toFile("public/email/header.png");
console.log("public/email/header.png 1200x200");

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

// ── Mark: the favicon (a magnifier with a gold AI spark in the lens, on navy) ──
const mark = await readFile("public/favicon.svg");
await sharp(mark, { density: 72 * 2 * (72 / 64) }).resize(72, 72).png().toFile("public/email/mark-aeo.png");
console.log("public/email/mark-aeo.png 72x72");
