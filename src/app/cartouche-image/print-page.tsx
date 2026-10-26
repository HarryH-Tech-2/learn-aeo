import {
  PRINT_PAGE,
  FAMILY_BAND,
  cartoucheLoopPath,
  cartouchePrintThemeById,
  familyNameSize,
  familyPageLayout,
  printNameSize,
  printPageLayout,
  type CartouchePrintThemeId,
} from "@/lib/cartouche-print";
import { getHieroglyphs, transliterateName } from "@/lib/hieroglyph-translator";

/**
 * Page one of the Cartouche Print as a satori tree, for the share image:
 *   /cartouche-image?name=Cleopatra&paper=night
 * and the paid HD image (src/lib/cartouche-print-image.tsx).
 *
 * The same points-on-A4 layout as the SVG preview and the PDF, scaled to a
 * 1240 × 1754 image (A4 at 150 dpi), or 2480 × 3508 (300 dpi) for the HD one.
 * Satori draws the artwork with <img>, the rope loop with an inline <svg>, and
 * every word with the two fonts the route loads (no SVG <text>: satori does not
 * shape it; no fragments inside the svg).
 */

export const PRINT_IMAGE = { width: 1240, height: 1754 } as const;
export const PRINT_IMAGE_HD = { width: 2480, height: 3508 } as const;

type TreeOptions = {
  size?: { width: number; height: number };
  /** The site's address along the foot of the page; the paid HD image goes without it. */
  footer?: boolean;
};

/**
 * `artSrc` is the paper's artwork as a data URL (null for plain paper). Two to
 * four names draw the family page (familyPageTree); one draws the page as it
 * always was.
 */
export function printPageTree(
  nameOrNames: string | readonly string[],
  theme: CartouchePrintThemeId,
  artSrc: string | null,
  options: TreeOptions = {},
) {
  if (typeof nameOrNames !== "string" && nameOrNames.length >= 2) return familyPageTree(nameOrNames, theme, artSrc, options);
  const name = typeof nameOrNames === "string" ? nameOrNames : (nameOrNames[0] ?? "");
  const { width, height } = options.size ?? PRINT_IMAGE;
  const footer = options.footer ?? true;
  const S = width / PRINT_PAGE.width;
  const px = (points: number) => Math.round(points * S * 100) / 100;
  const t = cartouchePrintThemeById(theme);
  const glyphs = getHieroglyphs(name);
  const signs = Math.max(transliterateName(name).length, 1);
  const { size, loopH, loopW, loopX, loopTop } = printPageLayout(signs);
  const stroke = Math.max(3, size / 22);
  const inset = stroke * 1.6;
  const knotW = stroke * 3.2;
  const knotH = loopH * 0.42;
  const upper = name.toUpperCase();
  const nameSize = printNameSize(upper);
  const { width: W, height: H } = PRINT_PAGE;

  const centred = (top: number, extra: Record<string, string | number> = {}) => ({
    position: "absolute" as const,
    left: 0,
    width,
    top: px(top),
    display: "flex",
    justifyContent: "center",
    ...extra,
  });

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        background: t.page,
        color: t.ink,
        fontFamily: "Cinzel",
      }}
    >
      {artSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artSrc}
          alt=""
          width={width}
          height={height}
          style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "fill" }}
        />
      ) : null}

      {/* Frame (plain paper only), rope loop, hairline and knot */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* No fragments here: satori cannot read a React.Fragment inside an <svg> */}
        {!artSrc ? <rect x={26} y={26} width={W - 52} height={H - 52} fill="none" stroke={t.gold} strokeWidth={1.2} /> : null}
        {!artSrc ? <rect x={32} y={32} width={W - 64} height={H - 64} fill="none" stroke={t.rule} strokeWidth={0.5} /> : null}
        <line x1={W / 2 - 36} x2={W / 2 + 36} y1={loopTop - 52} y2={loopTop - 52} stroke={t.gold} strokeWidth={0.6} />
        <path d={cartoucheLoopPath(loopX, loopTop, loopW, loopH)} fill="none" stroke={t.gold} strokeWidth={stroke} />
        <path
          d={cartoucheLoopPath(loopX + inset, loopTop + inset, loopW - 2 * inset, loopH - 2 * inset)}
          fill="none"
          stroke={t.gold}
          strokeWidth={0.6}
        />
        <rect
          x={loopX + loopW + stroke * 1.8}
          y={loopTop + (loopH - knotH) / 2}
          width={knotW}
          height={knotH}
          fill="none"
          stroke={t.gold}
          strokeWidth={stroke * 0.8}
        />
      </svg>

      {/* Kicker */}
      <div style={centred(loopTop - 64 - 4, { fontSize: px(11), letterSpacing: px(4), color: t.goldDeep })}>
        THE CARTOUCHE OF
      </div>

      {/* The name in hieroglyphs, centred in the loop */}
      <div
        style={{
          position: "absolute",
          left: px(loopX),
          top: px(loopTop),
          width: px(loopW),
          height: px(loopH),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Noto Sans Egyptian Hieroglyphs",
          fontSize: px(size),
          lineHeight: 1,
          whiteSpace: "nowrap",
          color: t.ink,
        }}
      >
        {glyphs}
      </div>

      {/* The name and its caption */}
      <div
        style={centred(loopTop + loopH + 74 - nameSize * 0.7, {
          fontSize: px(nameSize),
          letterSpacing: px(3),
          color: t.goldDeep,
        })}
      >
        {upper}
      </div>
      <div style={centred(loopTop + loopH + 100 - 9, { fontFamily: "sans serif", fontSize: px(12.5), color: t.muted })}>
        written in ancient Egyptian hieroglyphs
      </div>
      <div style={centred(loopTop + loopH + 118 - 5, { fontFamily: "sans serif", fontSize: px(9.5), color: t.muted })}>
        {signs} sign{signs === 1 ? "" : "s"}, read from left to right
      </div>

      {/* Footer, lifted clear of the artwork's border */}
      {footer ? (
        <div style={centred(H - t.footerInset - 2, { fontSize: px(8), letterSpacing: px(2.2), color: t.goldDeep })}>
          LEARNHIEROGLYPHICS.COM
        </div>
      ) : null}
    </div>
  );
}

/**
 * The family page: two to four cartouches stacked, each with its name under
 * it, placed by familyPageLayout (the same points as the SVG preview and the
 * PDF). Baseline offsets match the single page's: a Cinzel line's box top sits
 * about 1.05 em above its baseline here.
 */
function familyPageTree(names: readonly string[], theme: CartouchePrintThemeId, artSrc: string | null, options: TreeOptions) {
  const { width, height } = options.size ?? PRINT_IMAGE;
  const footer = options.footer ?? true;
  const S = width / PRINT_PAGE.width;
  const px = (points: number) => Math.round(points * S * 100) / 100;
  const t = cartouchePrintThemeById(theme);
  const { width: W, height: H } = PRINT_PAGE;
  const { slots, nameMax } = familyPageLayout(names.map((n) => getHieroglyphs(n)));

  const centred = (top: number, extra: Record<string, string | number> = {}) => ({
    position: "absolute" as const,
    left: 0,
    width,
    top: px(top),
    display: "flex",
    justifyContent: "center",
    ...extra,
  });

  return (
    <div style={{ width, height, display: "flex", position: "relative", background: t.page, color: t.ink, fontFamily: "Cinzel" }}>
      {artSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artSrc} alt="" width={width} height={height} style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "fill" }} />
      ) : null}

      <svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", top: 0, left: 0 }}>
        {!artSrc ? <rect x={26} y={26} width={W - 52} height={H - 52} fill="none" stroke={t.gold} strokeWidth={1.2} /> : null}
        {!artSrc ? <rect x={32} y={32} width={W - 64} height={H - 64} fill="none" stroke={t.rule} strokeWidth={0.5} /> : null}
        <line x1={W / 2 - 36} x2={W / 2 + 36} y1={FAMILY_BAND.kicker + 12} y2={FAMILY_BAND.kicker + 12} stroke={t.gold} strokeWidth={0.6} />
        {slots.map((s, i) => {
          const stroke = Math.max(2, s.size / 22);
          const inset = stroke * 1.6;
          return (
            <g key={i}>
              <path d={cartoucheLoopPath(s.loopX, s.loopTop, s.loopW, s.loopH)} fill="none" stroke={t.gold} strokeWidth={stroke} />
              <path
                d={cartoucheLoopPath(s.loopX + inset, s.loopTop + inset, s.loopW - 2 * inset, s.loopH - 2 * inset)}
                fill="none"
                stroke={t.gold}
                strokeWidth={0.6}
              />
              <rect
                x={s.loopX + s.loopW + stroke * 1.8}
                y={s.loopTop + (s.loopH - s.loopH * 0.42) / 2}
                width={stroke * 3.2}
                height={s.loopH * 0.42}
                fill="none"
                stroke={t.gold}
                strokeWidth={stroke * 0.8}
              />
            </g>
          );
        })}
      </svg>

      <div style={centred(FAMILY_BAND.kicker - 12, { fontSize: px(11), letterSpacing: px(4), color: t.goldDeep })}>
        THE CARTOUCHES OF
      </div>

      {slots.map((s, i) => {
        const upper = names[i].toUpperCase();
        const ns = familyNameSize(upper, nameMax);
        return (
          <div key={i} style={{ display: "flex" }}>
            <div
              style={{
                position: "absolute",
                left: px(s.loopX),
                top: px(s.loopTop),
                width: px(s.loopW),
                height: px(s.loopH),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Noto Sans Egyptian Hieroglyphs",
                fontSize: px(s.size),
                lineHeight: 1,
                whiteSpace: "nowrap",
                color: t.ink,
              }}
            >
              {getHieroglyphs(names[i])}
            </div>
            <div style={centred(s.nameBaseline - ns * 1.05, { fontSize: px(ns), letterSpacing: px(2.5), color: t.goldDeep })}>{upper}</div>
          </div>
        );
      })}

      <div style={centred(FAMILY_BAND.caption - 13, { fontFamily: "sans serif", fontSize: px(12.5), color: t.muted })}>
        written in ancient Egyptian hieroglyphs
      </div>
      <div style={centred(FAMILY_BAND.captionSub - 8, { fontFamily: "sans serif", fontSize: px(9.5), color: t.muted })}>
        each name read from left to right
      </div>

      {footer ? (
        <div style={centred(H - t.footerInset - 2, { fontSize: px(8), letterSpacing: px(2.2), color: t.goldDeep })}>
          LEARNHIEROGLYPHICS.COM
        </div>
      ) : null}
    </div>
  );
}
