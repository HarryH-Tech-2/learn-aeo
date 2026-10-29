/**
 * Renders one hero image per blog post (src/lib/content/blog/*.ts) with sharp:
 *
 *   public/blog/<slug>.webp  1024 x 1024  the post title on the brand's night-sky ground, with the
 *                                        search-bar-and-seam mark as the motif
 *
 * 1024 x 1024 because the post page and its og:image tags declare that size. Brand colors: navy #04060d,
 * cyan #6fe3ff, gold #ffc76b. librsvg cannot load the brand fonts, so the title is set in Georgia (a serif
 * every Windows and macOS machine has; librsvg falls back to its default serif elsewhere). Run once after
 * adding or retitling a post, and commit the output:
 *
 *   node scripts/dev/build-blog-art.mjs
 */
import { readdir, readFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const NAVY = "#04060d";
const CYAN = "#6fe3ff";
const GOLD = "#ffc76b";
const SIZE = 1024;
const DIR = "src/lib/content/blog";

await mkdir("public/blog", { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Greedy word wrap to at most `max` characters a line. */
function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

function art(title) {
  const lines = wrap(title, 17);
  const fontSize = lines.length > 4 ? 70 : 80;
  const lineHeight = fontSize * 1.15;
  // Centered on y=640, but the first baseline never rises into the "LEARN AEO" eyebrow (y=410).
  const top = Math.max(510, 640 - ((lines.length - 1) * lineHeight) / 2);
  const text = lines
    .map((l, i) => `<text x="512" y="${top + i * lineHeight}" text-anchor="middle">${esc(l)}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="38%" r="70%">
      <stop offset="0" stop-color="#16294a"/>
      <stop offset="1" stop-color="${NAVY}"/>
    </radialGradient>
    <linearGradient id="seam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${CYAN}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${CYAN}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${CYAN}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)"/>
  <g fill="#e6ebf5" fill-opacity="0.45">
    <circle cx="90" cy="80" r="2"/><circle cx="260" cy="150" r="1.5"/><circle cx="430" cy="60" r="2"/>
    <circle cx="640" cy="120" r="1.5"/><circle cx="820" cy="70" r="2"/><circle cx="950" cy="170" r="1.5"/>
    <circle cx="140" cy="900" r="1.5"/><circle cx="880" cy="930" r="2"/>
  </g>
  <rect x="352" y="180" width="320" height="112" rx="56" fill="none" stroke="${CYAN}" stroke-width="10"/>
  <rect x="505" y="136" width="14" height="200" rx="7" fill="url(#seam)"/>
  <text x="512" y="410" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="8" fill="${CYAN}">LEARN AEO</text>
  <g font-family="Georgia, serif" font-size="${fontSize}" fill="#f2efe6">${text}</g>
  <rect x="112" y="900" width="800" height="3" fill="url(#rule)"/>
</svg>`;
}

for (const file of (await readdir(DIR)).filter((f) => f.endsWith(".ts"))) {
  const src = await readFile(`${DIR}/${file}`, "utf8");
  const slug = src.match(/slug:\s*"([^"]+)"/)[1];
  const title = JSON.parse(src.match(/title:\s*("(?:[^"\\]|\\.)*")/)[1]);
  const out = `public/blog/${slug}.webp`;
  await sharp(Buffer.from(art(title))).webp({ quality: 86 }).toFile(out);
  console.log(out);
}
