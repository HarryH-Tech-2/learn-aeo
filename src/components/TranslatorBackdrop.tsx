/**
 * The backdrop of the name translator and the keyboard (2026-10-21, richer 2026-10-26): a carved temple wall drawn
 * in CSS, fixed behind the whole page. Sunlit sandstone in the light theme (shafts of sun drifting across it), a
 * torch-lit tomb in the dark one (warm torch glows, dust in the air), with painted bands of lapis, red ochre and gold
 * between the registers, as on a real tomb wall.
 * Registers of gold hieroglyphs (the translator's own alphabet signs, so they are in the subset font) between
 * ruled lines, two torch glows at the edges and a slow band of light that crosses the wall. A mask keeps the
 * centre column, where the text is, almost clear, so every word stays legible. The light band and torch flicker
 * stop under prefers-reduced-motion (globals.css).
 *
 * Replaced a background video the same day: no download, nothing to wait for.
 */

/** The translator's alphabet signs (src/lib/hieroglyph-translator.ts). */
const SIGNS = [
  "\u{13219}", "\u{133FF}", "\u{1340D}", "\u{133CF}", "\u{13191}", "\u{1313F}", "\u{130C0}", "\u{133A1}",
  "\u{130A7}", "\u{131CB}", "\u{133BC}", "\u{13254}", "\u{13193}", "\u{1308B}", "\u{13153}", "\u{13216}",
  "\u{13171}", "\u{132AA}", "\u{1320E}", "\u{132F4}", "\u{13283}",
];

/** Fixed pseudo-random rows, so the server and the browser draw the same wall. */
function wallRows(count: number, perRow: number): string[] {
  let seed = 7;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: count }, () =>
    Array.from({ length: perRow }, () => SIGNS[Math.floor(next() * SIGNS.length)]).join(""),
  );
}

const ROWS = wallRows(22, 48);
/** Motes drifting in the light, at the edges of the page (fixed, so the server and the browser agree). */
const DUST = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 91.7 + n * 13.3) * 10000) % 1 + 1) % 1;
  const left = i % 2 === 0;
  // (rounded: the server writes long floats shorter than the browser does, and the two must match)
  const round = (n: number) => Math.round(n * 10) / 10;
  return { x: round(left ? r(1) * 22 : 78 + r(1) * 22), y: round(r(2) * 100), delay: round(-r(3) * 20), dur: round(14 + r(4) * 12) };
});

export default function TranslatorBackdrop() {
  return (
    <div className="translator-backdrop fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div lang="egy" className="translator-wall hieroglyph-font absolute inset-0">
        {ROWS.map((row, i) => (
          <div key={i} className="translator-wall-row" style={{ marginLeft: `${-((i * 37) % 90)}px` }}>
            {row}
          </div>
        ))}
      </div>
      <div className="translator-shafts absolute inset-0" />
      <div className="translator-light absolute inset-0" />
      <div className="translator-torch translator-torch-left absolute" />
      <div className="translator-torch translator-torch-right absolute" />
      <div className="translator-dust absolute inset-0">
        {DUST.map((d, i) => (
          <span key={i} style={{ left: `${d.x}%`, top: `${d.y}%`, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
        ))}
      </div>
      <div className="translator-vignette absolute inset-0" />
    </div>
  );
}
