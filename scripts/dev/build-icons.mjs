/**
 * Renders the Learn AEO icon set and the link-preview image with sharp:
 *   public/favicon.svg (source) -> favicon.png (32), favicon-64.png, apple-touch-icon.png (180),
 *   icon-192.png, icon-512.png
 *   an SVG built here                -> public/og-default.png (1200 x 630)
 * The mark (public/favicon.svg, drawn the same in src/components/BrandMark.tsx) is a magnifier with a metallic-blue AI
 * spark in the lens, on navy. The link-preview image keeps the hero's search-bar motif.
 * Run once, commit the output:
 *
 *   node scripts/dev/build-icons.mjs
 */
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("public/favicon.svg");
const sizes = {
  "favicon.png": 32,
  "favicon-64.png": 64,
  "apple-touch-icon.png": 180,
  "icon-192.png": 192,
  "icon-512.png": 512,
};
for (const [file, size] of Object.entries(sizes)) {
  // high density so the vector is rasterised sharply rather than scaled up from 64px
  await sharp(svg, { density: (72 * size) / 64 * 2 }).resize(size, size).png().toFile(`public/${file}`);
  console.log(`public/${file} ${size}x${size}`);
}

// ── Link preview (og:image / twitter:image), 1200 x 630 ──
// Serif is a system fallback stack here (librsvg cannot load web fonts); the wordmark is the brand's Instrument Serif
// look-alike at preview size. Georgia ships with Windows and macOS.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="50%" cy="46%" r="60%">
      <stop offset="0" stop-color="#16294a" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#04060d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="seam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6fb2ff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#6fb2ff"/>
      <stop offset="1" stop-color="#6fb2ff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#04060d"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="150" y="96" width="900" height="96" rx="48" fill="none" stroke="#6fe3ff" stroke-width="5"/>
  <rect x="597" y="64" width="6" height="160" fill="url(#seam)"/>
  <text x="600" y="400" text-anchor="middle" font-family="'Instrument Serif', Georgia, 'Times New Roman', serif" font-size="150" fill="#e6ebf5">Learn <tspan fill="#6fb2ff" font-style="italic">AEO</tspan></text>
  <text x="600" y="480" text-anchor="middle" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="34" fill="#a3afc6">Get your brand cited by ChatGPT, Perplexity and Google AI</text>
  <text x="600" y="570" text-anchor="middle" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="26" letter-spacing="6" fill="#6fe3ff">LEARNAEO.COM</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile("public/og-default.png");
console.log("public/og-default.png 1200x630");
