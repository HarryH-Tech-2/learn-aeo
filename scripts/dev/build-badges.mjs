/**
 * Draws the Learn AEO badge set and the certificate template as SVG and renders them with sharp:
 *   public/badges/<name>.webp   one per entry in BADGE_DEFINITIONS (src/lib/gamification.ts), 512 x 512
 *   public/certificate-aeo-us.webp the certificate background, 2000 x 1414 (A4 landscape ratio)
 *
 * The family: a navy disc with a gold outer ring and a cyan inner ring around a simple geometric
 * emblem. District badges carry their district's emblem; the audit, streak and milestone badges
 * share the frame with their own marks. Text is a system serif stack (librsvg cannot load web
 * fonts); the certificate's lettering is the brand's Instrument Serif look-alike at print size.
 * The learner's name is drawn on the certificate at runtime (src/lib/certificate.ts), so keep the
 * name line here in step with CERTIFICATE_NAME there.
 *
 * Run once, commit the output (file names must change when the art changes: /badges is cached
 * immutably):
 *
 *   node scripts/dev/build-badges.mjs
 */
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const NAVY = "#04060d";
const NAVY_LIGHT = "#0c1322";
const CYAN = "#6fe3ff";
const GOLD = "#ffc76b";
const SAND = "#e6ebf5";
const MUTED = "#a3afc6";
const SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const SANS = "Inter, 'Segoe UI', Arial, sans-serif";

const line = (width = 14) =>
  `fill="none" stroke="${CYAN}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
const goldLine = (width = 14) =>
  `fill="none" stroke="${GOLD}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;

// ── Emblems, drawn in a 512 box centered on (256, 256), kept inside a radius of about 130 ──

const EMBLEMS = {
  // The Gate: an arched gateway with a gold keystone
  "district-the-gate": `
    <path d="M166 364 V246 A90 90 0 0 1 346 246 V364" ${line()}/>
    <path d="M206 364 V256 A50 50 0 0 1 306 256 V364" ${line(10)}/>
    <path d="M140 364 H372" ${line()}/>
    <path d="M244 142 H268 L262 172 H250 Z" fill="${GOLD}" stroke="${GOLD}" stroke-width="6" stroke-linejoin="round"/>`,

  // The Crawl Docks: an anchor
  "district-the-crawl-docks": `
    <circle cx="256" cy="152" r="22" ${goldLine(12)}/>
    <path d="M256 176 V368" ${line()}/>
    <path d="M204 212 H308" ${line()}/>
    <path d="M160 300 A96 96 0 0 0 352 300" ${line()}/>
    <path d="M140 316 L160 292 L184 310" ${line(12)}/>
    <path d="M372 316 L352 292 L328 310" ${line(12)}/>`,

  // The Answer Quarter: a pair of quotation marks over a gold line
  "district-the-answer-quarter": `
    <g fill="${CYAN}">
      <circle cx="206" cy="250" r="36"/>
      <path d="M176 262 C176 206 196 176 238 160 L244 174 C216 188 206 212 210 236 Z"/>
      <circle cx="310" cy="250" r="36"/>
      <path d="M280 262 C280 206 300 176 342 160 L348 174 C320 188 310 212 314 236 Z"/>
    </g>
    <path d="M168 340 H344" ${goldLine()}/>`,

  // The Schema Works: curly brackets around a gold gear
  "district-the-schema-works": `
    <path d="M196 150 C164 150 166 172 166 206 C166 236 160 250 136 256 C160 262 166 276 166 306 C166 340 164 362 196 362" ${line()}/>
    <path d="M316 150 C348 150 346 172 346 206 C346 236 352 250 376 256 C352 262 346 276 346 306 C346 340 348 362 316 362" ${line()}/>
    <g transform="translate(256 256)" fill="${GOLD}">
      ${Array.from({ length: 8 }, (_, i) => `<rect x="-11" y="-62" width="22" height="26" rx="4" transform="rotate(${i * 45})"/>`).join("")}
      <circle r="44"/>
      <circle r="18" fill="${NAVY}"/>
    </g>`,

  // The Agora: a colonnade under a gold pediment
  "district-the-agora": `
    <path d="M144 196 L256 140 L368 196 Z" fill="${GOLD}" stroke="${GOLD}" stroke-width="10" stroke-linejoin="round"/>
    <path d="M152 216 H360" ${line(12)}/>
    <path d="M180 236 V334 M228 236 V334 M284 236 V334 M332 236 V334" ${line()}/>
    <path d="M144 356 H368" ${line()}/>`,

  // The Embassies: two flags on poles
  "district-the-embassies": `
    <path d="M176 372 V140" ${line()}/>
    <path d="M176 150 C206 132 230 172 268 154 V226 C230 244 206 204 176 222 Z" fill="${GOLD}" stroke="${GOLD}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M300 372 V196" ${line()}/>
    <path d="M300 206 C326 190 348 226 380 210 V270 C348 286 326 250 300 266 Z" fill="${CYAN}" stroke="${CYAN}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M140 372 H372" ${line()}/>`,

  // The Observatory: a telescope on a tripod, looking at a gold star
  "district-the-observatory": `
    <g transform="rotate(-30 236 250)">
      <rect x="146" y="226" width="196" height="48" rx="12" ${line(12)}/>
      <path d="M342 218 V282" ${line()}/>
      <path d="M146 236 V264" ${line(12)}/>
    </g>
    <path d="M240 278 L190 372 M240 278 L290 372 M240 278 V372" ${line(12)}/>
    <path d="M352 126 L360 148 L382 150 L364 164 L370 186 L352 172 L334 186 L340 164 L322 150 L344 148 Z" fill="${GOLD}"/>`,

  // The Citadel: a crenellated tower with a gold pennant
  "district-the-citadel": `
    <path d="M196 368 V206 H210 V182 H234 V206 H246 V182 H266 V206 H278 V182 H302 V206 H316 V368" ${line(12)}/>
    <path d="M236 368 V320 A20 20 0 0 1 276 320 V368" ${line(10)}/>
    <path d="M150 368 H362" ${line()}/>
    <path d="M256 182 V128" ${goldLine(8)}/>
    <path d="M258 128 L300 142 L258 156 Z" fill="${GOLD}"/>`,

  // Perfect audit: a gold tick in a cyan ring, with three small stars
  "perfect-audit": `
    <circle cx="256" cy="266" r="92" ${line()}/>
    <path d="M206 268 L244 306 L312 226" ${goldLine(20)}/>
    ${[[170, 150], [256, 128], [342, 150]].map(([x, y]) => star(x, y, 14)).join("")}`,
};

function star(cx, cy, r) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  });
  return `<polygon points="${pts.join(" ")}" fill="${GOLD}"/>`;
}

// Streaks: a flame with the day count beneath it
function streakEmblem(days) {
  return `
    <path d="M256 128 C286 176 330 196 330 256 C330 302 298 330 256 330 C214 330 182 302 182 256 C182 222 202 200 216 184 C218 214 230 228 244 232 C238 192 240 160 256 128 Z" fill="${GOLD}"/>
    <path d="M256 236 C268 256 290 266 290 290 C290 310 276 322 256 322 C236 322 222 310 222 290 C222 274 232 264 240 256 C242 270 248 276 254 278 C252 262 250 250 256 236 Z" fill="${NAVY}"/>
    <text x="256" y="400" text-anchor="middle" font-family="${SANS}" font-weight="bold" font-size="68" fill="${CYAN}">${days}</text>`;
}

// Milestones: a skyline of eight towers, one per district; lit towers are gold
function skylineEmblem(lit, withStar = false) {
  const heights = [70, 110, 90, 140, 100, 124, 80, 106];
  const w = 22;
  const gap = 6;
  const x0 = 256 - (heights.length * w + (heights.length - 1) * gap) / 2;
  const base = 346;
  const towers = heights
    .map((h, i) => {
      const x = x0 + i * (w + gap);
      return i < lit
        ? `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" rx="3" fill="${GOLD}"/>`
        : `<rect x="${x + 3}" y="${base - h + 3}" width="${w - 6}" height="${h - 3}" rx="2" fill="none" stroke="${CYAN}" stroke-width="6"/>`;
    })
    .join("");
  return `${towers}
    <path d="M136 362 H376" ${line(12)}/>
    ${withStar ? star(256, 160, 30) : ""}`;
}

const BADGES = {
  ...EMBLEMS,
  "streak-3-days": streakEmblem(3),
  "streak-7-days": streakEmblem(7),
  "streak-30-days": streakEmblem(30),
  "milestone-first-lesson": skylineEmblem(1),
  "milestone-half-city": skylineEmblem(4),
  "milestone-all-districts": skylineEmblem(8, true),
};

function badgeSvg(emblem) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="disc" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#16294a"/>
      <stop offset="1" stop-color="${NAVY}"/>
    </radialGradient>
  </defs>
  <circle cx="256" cy="256" r="244" fill="url(#disc)"/>
  <circle cx="256" cy="256" r="236" fill="none" stroke="${GOLD}" stroke-width="14"/>
  <circle cx="256" cy="256" r="208" fill="none" stroke="${CYAN}" stroke-width="4" stroke-opacity="0.8"/>
  ${emblem}
</svg>`;
}

await mkdir("public/badges", { recursive: true });
for (const [name, emblem] of Object.entries(BADGES)) {
  const file = `public/badges/${name}.webp`;
  await sharp(Buffer.from(badgeSvg(emblem))).webp({ quality: 90, alphaQuality: 100 }).toFile(file);
  console.log(`${file} 512x512`);
}

// ── Certificate template, 2000 x 1414 ──
// The name is drawn at runtime, centered at x = 50%, baseline at y = 57% (806px), within 50% of the
// width (500..1500); the gold rule sits just under that baseline.
const W = 2000;
const H = 1414;
const nameBaseline = Math.round(H * 0.57);
const skyline = (() => {
  const heights = [34, 54, 44, 70, 50, 62, 40, 52];
  const w = 14;
  const gap = 8;
  const x0 = W / 2 - (heights.length * w + (heights.length - 1) * gap) / 2;
  const base = 250;
  return heights
    .map((h, i) => `<rect x="${x0 + i * (w + gap)}" y="${base - h}" width="${w}" height="${h}" rx="2" fill="${GOLD}"/>`)
    .join("") + `<rect x="${W / 2 - 110}" y="${base + 6}" width="220" height="4" rx="2" fill="${CYAN}"/>`;
})();

const certificate = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="45%" r="65%">
      <stop offset="0" stop-color="#16294a" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${NAVY}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" stroke="${GOLD}" stroke-width="6"/>
  <rect x="80" y="80" width="${W - 160}" height="${H - 160}" fill="none" stroke="${GOLD}" stroke-width="2" stroke-opacity="0.6"/>
  ${[[80, 80], [W - 80, 80], [80, H - 80], [W - 80, H - 80]].map(([x, y]) => `<rect x="${x - 10}" y="${y - 10}" width="20" height="20" transform="rotate(45 ${x} ${y})" fill="${GOLD}"/>`).join("")}

  ${skyline}
  <text x="${W / 2}" y="380" text-anchor="middle" font-family="${SERIF}" font-size="110" fill="${SAND}">Learn <tspan fill="${GOLD}" font-style="italic">AEO</tspan></text>
  <text x="${W / 2}" y="476" text-anchor="middle" font-family="${SANS}" font-size="38" letter-spacing="14" fill="${CYAN}">CERTIFICATE OF COMPLETION</text>

  <text x="${W / 2}" y="640" text-anchor="middle" font-family="${SANS}" font-size="34" fill="${MUTED}">This certifies that</text>
  <rect x="520" y="${nameBaseline + 34}" width="960" height="3" fill="${GOLD}"/>

  <text x="${W / 2}" y="${nameBaseline + 140}" text-anchor="middle" font-family="${SANS}" font-size="34" fill="${MUTED}">has completed the course</text>
  <text x="${W / 2}" y="${nameBaseline + 260}" text-anchor="middle" font-family="${SERIF}" font-size="92" fill="${SAND}">Answer Engine <tspan fill="${GOLD}" font-style="italic">Optimization</tspan></text>
  <text x="${W / 2}" y="${nameBaseline + 336}" text-anchor="middle" font-family="${SANS}" font-size="30" fill="${MUTED}">All eight districts of the City of Answers</text>

  <text x="${W / 2}" y="${H - 130}" text-anchor="middle" font-family="${SANS}" font-size="28" letter-spacing="8" fill="${CYAN}">LEARNAEO.COM</text>
</svg>`;

await sharp(Buffer.from(certificate)).webp({ quality: 92 }).toFile("public/certificate-aeo-us.webp");
console.log(`public/certificate-aeo-us.webp ${W}x${H}`);
