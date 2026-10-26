"use client";

import { useMemo } from "react";
import { getHieroglyphs, transliterateName } from "@/lib/hieroglyph-translator";
import {
  FAMILY_BAND,
  PRINT_PAGE,
  cartoucheLoopPath,
  familyNameSize,
  familyPageLayout,
  cartouchePrintThemeById,
  printNameSize,
  printPageLayout,
  type CartouchePrintThemeId,
} from "@/lib/cartouche-print";
import { GLYPH_FONT_FAMILY } from "@/lib/cartouche-image";

/**
 * Page one of the Cartouche Print, drawn as an SVG so the buyer sees the
 * paper they are choosing before they pay. It mirrors the layout in
 * src/lib/cartouche-print-pdf.ts (same A4 points, artwork or frame, loop,
 * kicker, name and footer) with the theme's colours; the glyph run is sized
 * by an estimate rather than font metrics, so it is a faithful preview, not
 * the file itself.
 */

const { width: W, height: H } = PRINT_PAGE;

/** @deprecated kept for callers of the old name; the layout lives in src/lib/cartouche-print.ts */
export const previewLayout = printPageLayout;

type Props = {
  name: string;
  /** Two to four names draw the family page (the first is `name`); otherwise the page for `name` alone. */
  names?: readonly string[];
  theme: CartouchePrintThemeId;
  className?: string;
};

export default function CartouchePrintPreview({ name, names, theme, className }: Props) {
  if (names && names.length >= 2) return <FamilyPreview names={names} theme={theme} className={className} />;
  return <SinglePreview name={name} theme={theme} className={className} />;
}

function SinglePreview({ name, theme, className }: Omit<Props, "names">) {
  const t = cartouchePrintThemeById(theme);
  const { glyphs, signs } = useMemo(() => {
    const results = transliterateName(name);
    return { glyphs: getHieroglyphs(name), signs: results.length };
  }, [name]);
  const { size, loopH, loopW, loopX, loopTop } = printPageLayout(Math.max(signs, 1));
  const stroke = Math.max(3, size / 22);
  const inset = stroke * 1.6;
  const knotW = stroke * 3.2;
  const knotH = loopH * 0.42;
  const upper = name.toUpperCase();
  const nameSize = printNameSize(upper);
  const footerY = H - t.footerInset;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Preview of the ${t.label.toLowerCase()} print: the cartouche of ${name}`}
      className={className}
      style={{ display: "block" }}
    >
      {/* The page: artwork stretched to A4 exactly as the PDF does, or the plain page with its double frame */}
      <rect x={0} y={0} width={W} height={H} fill={t.page} />
      {t.art ? (
        <image href={t.art} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />
      ) : (
        <>
          <rect x={26} y={26} width={W - 52} height={H - 52} fill="none" stroke={t.gold} strokeWidth={1.2} />
          <rect x={32} y={32} width={W - 64} height={H - 64} fill="none" stroke={t.rule} strokeWidth={0.5} />
        </>
      )}

      {/* Kicker */}
      <text
        x={W / 2}
        y={loopTop - 64 + 8}
        textAnchor="middle"
        fill={t.goldDeep}
        fontSize={11}
        letterSpacing={4}
        fontFamily="var(--font-display)"
        fontWeight={600}
      >
        THE CARTOUCHE OF
      </text>
      <line x1={W / 2 - 36} x2={W / 2 + 36} y1={loopTop - 52} y2={loopTop - 52} stroke={t.gold} strokeWidth={0.6} />

      {/* The cartouche: rope loop, inner hairline, knot */}
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
      <text
        x={loopX + loopW / 2}
        y={loopTop + loopH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={t.ink}
        fontSize={size}
        fontFamily={GLYPH_FONT_FAMILY}
      >
        {glyphs}
      </text>

      {/* The name and its caption */}
      <text
        x={W / 2}
        y={loopTop + loopH + 74 + nameSize * 0.35}
        textAnchor="middle"
        fill={t.goldDeep}
        fontSize={nameSize}
        letterSpacing={3}
        fontFamily="var(--font-display)"
        fontWeight={600}
      >
        {upper}
      </text>
      <text
        x={W / 2}
        y={loopTop + loopH + 100 + 4}
        textAnchor="middle"
        fill={t.muted}
        fontSize={12.5}
        fontStyle="italic"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        written in ancient Egyptian hieroglyphs
      </text>
      <text
        x={W / 2}
        y={loopTop + loopH + 118 + 3}
        textAnchor="middle"
        fill={t.muted}
        fontSize={9.5}
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        {signs} sign{signs === 1 ? "" : "s"}, read from left to right
      </text>

      {/* Footer, lifted clear of the artwork's border */}
      <text
        x={W / 2}
        y={footerY + 6}
        textAnchor="middle"
        fill={t.goldDeep}
        fontSize={8}
        letterSpacing={2.2}
        fontFamily="var(--font-display)"
        fontWeight={600}
      >
        LEARNHIEROGLYPHICS.COM
      </text>
    </svg>
  );
}

/** Page one with two to four names stacked, placed by familyPageLayout like the image and the PDF. */
function FamilyPreview({ names, theme, className }: { names: readonly string[]; theme: CartouchePrintThemeId; className?: string }) {
  const t = cartouchePrintThemeById(theme);
  const runs = useMemo(() => names.map((n) => getHieroglyphs(n)), [names]);
  const { slots, nameMax } = familyPageLayout(runs);
  const footerY = H - t.footerInset;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Preview of the ${t.label.toLowerCase()} print: the cartouches of ${names.join(", ")}`}
      className={className}
      style={{ display: "block" }}
    >
      <rect x={0} y={0} width={W} height={H} fill={t.page} />
      {t.art ? (
        <image href={t.art} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />
      ) : (
        <>
          <rect x={26} y={26} width={W - 52} height={H - 52} fill="none" stroke={t.gold} strokeWidth={1.2} />
          <rect x={32} y={32} width={W - 64} height={H - 64} fill="none" stroke={t.rule} strokeWidth={0.5} />
        </>
      )}

      <text x={W / 2} y={FAMILY_BAND.kicker} textAnchor="middle" fill={t.goldDeep} fontSize={11} letterSpacing={4} fontFamily="var(--font-display)" fontWeight={600}>
        THE CARTOUCHES OF
      </text>
      <line x1={W / 2 - 36} x2={W / 2 + 36} y1={FAMILY_BAND.kicker + 12} y2={FAMILY_BAND.kicker + 12} stroke={t.gold} strokeWidth={0.6} />

      {slots.map((s, i) => {
        const stroke = Math.max(2, s.size / 22);
        const inset = stroke * 1.6;
        const knotH = s.loopH * 0.42;
        const upper = names[i].toUpperCase();
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
              y={s.loopTop + (s.loopH - knotH) / 2}
              width={stroke * 3.2}
              height={knotH}
              fill="none"
              stroke={t.gold}
              strokeWidth={stroke * 0.8}
            />
            <text
              x={s.loopX + s.loopW / 2}
              y={s.loopTop + s.loopH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={t.ink}
              fontSize={s.size}
              fontFamily={GLYPH_FONT_FAMILY}
            >
              {runs[i]}
            </text>
            <text
              x={W / 2}
              y={s.nameBaseline}
              textAnchor="middle"
              fill={t.goldDeep}
              fontSize={familyNameSize(upper, nameMax)}
              letterSpacing={2.5}
              fontFamily="var(--font-display)"
              fontWeight={600}
            >
              {upper}
            </text>
          </g>
        );
      })}

      <text x={W / 2} y={FAMILY_BAND.caption} textAnchor="middle" fill={t.muted} fontSize={12.5} fontStyle="italic" fontFamily="Georgia, 'Times New Roman', serif">
        written in ancient Egyptian hieroglyphs
      </text>
      <text x={W / 2} y={FAMILY_BAND.captionSub} textAnchor="middle" fill={t.muted} fontSize={9.5} fontFamily="Georgia, 'Times New Roman', serif">
        each name read from left to right
      </text>

      <text x={W / 2} y={footerY + 6} textAnchor="middle" fill={t.goldDeep} fontSize={8} letterSpacing={2.2} fontFamily="var(--font-display)" fontWeight={600}>
        LEARNHIEROGLYPHICS.COM
      </text>
    </svg>
  );
}
