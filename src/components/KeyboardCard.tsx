import { Cinzel } from "next/font/google";
import {
  cardSize,
  CARTOUCHE,
  LETTERS,
  cardLayout,
  glyphShadow,
  glyphStroke,
  inkFor,
  keyboardStyleById,
  type KeyboardStyleId,
  type CardSpell,
  type KeyboardTemplateId,
} from "@/lib/keyboard-card";

// The card's lettering: the same Cinzel the saved picture is drawn with.
const cinzel = Cinzel({ subsets: ["latin"], weight: "600", display: "swap" });

/**
 * The keyboard's card on screen: the same layout as the saved picture (src/lib/keyboard-image.tsx), drawn
 * in a 1200 : 630 box whose sizes are container units, so it scales to any width and stays what-you-see-
 * is-what-you-get. Used by the keyboard's wall on a finish and by the secret-message page.
 */
export default function KeyboardCard({
  typed,
  style: styleId,
  template = "none",
  spell = "keys",
  letters = false,
  caret = false,
  className = "",
  label,
  from = "",
}: {
  typed: string[];
  style: KeyboardStyleId;
  template?: KeyboardTemplateId;
  /** "name": spelled like the name translator, in a cartouche. */
  spell?: CardSpell;
  /** The English letters under each sign. */
  letters?: boolean;
  /** A blinking caret after the last sign, and the newest sign carved in, while typing. */
  caret?: boolean;
  className?: string;
  label?: string;
  /** Who the card is from: the gift certificate's "From Harry". */
  from?: string;
}) {
  const style = keyboardStyleById(styleId);
  const L = cardLayout(typed, styleId, template, spell, letters, from);
  const size = cardSize(style);
  // 1 card px = 1/12 cqw on a 1200-wide card (1/6.3 on a portrait stencil)
  const cq = (px: number) => `${(px / size.width) * 100}cqw`;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const signs = L.lines.flat().filter((g) => g !== " ").length;
  let index = 0;

  return (
    <div className={`[container-type:inline-size] ${className}`} role="img" aria-label={label}>
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: `${size.width} / ${size.height}`,
          backgroundColor: style.page,
          backgroundImage: style.art1200 ? `url(${style.art1200})` : undefined,
          backgroundSize: "100% 100%",
        }}
      >
        {style.frame && (
          <>
            <div aria-hidden="true" className="absolute border-gold-500" style={{ inset: cq(36), borderWidth: cq(3) }} />
            <div aria-hidden="true" className="absolute border-gold-500" style={{ inset: cq(48), borderWidth: cq(1) }} />
          </>
        )}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{ left: pct(L.box.x, size.width), top: pct(L.box.y, size.height), width: pct(L.box.w, size.width), height: pct(L.box.h, size.height) }}
        >
          {L.headingText && (
            <div className={`${cinzel.className} whitespace-nowrap`} style={{ fontSize: cq(L.heading), color: style.heading, letterSpacing: cq(2), marginBottom: cq(L.heading * 0.35), textShadow: style.lift }}>
              {L.headingText}
            </div>
          )}
          <div
            className="relative flex flex-col items-center"
            style={
              L.cartouche
                ? {
                    fontSize: cq(L.glyph),
                    border: `max(2px, ${CARTOUCHE.rope}em) solid ${style.heading}`,
                    borderRadius: 9999,
                    // upright in a column: the long sides are the left and right, the tie goes under the foot
                    padding: L.column ? `${CARTOUCHE.padX}em ${CARTOUCHE.padY}em` : `${CARTOUCHE.padY}em ${CARTOUCHE.padX}em`,
                    ...(L.column ? { marginBottom: `${CARTOUCHE.tie}em` } : { marginRight: `${CARTOUCHE.tie}em` }),
                  }
                : undefined
            }
          >
            {L.lines.map((line, i) => (
              <div key={i} lang="egy" className="hieroglyph-font flex items-end whitespace-nowrap" style={{ fontSize: cq(L.glyph), lineHeight: 1.3 }}>
                {line.map((g, j) => {
                  if (g === " ") return <span key={j} style={{ width: "0.5em" }} />;
                  const isLast = caret && index === signs - 1;
                  index++;
                  const sign = (
                    <span key={j} className={isLast ? "kb-carve" : ""} style={{ color: inkFor(style, g), textShadow: glyphShadow(style, inkFor(style, g)), WebkitTextStroke: glyphStroke(style, inkFor(style, g)) }}>
                      {g}
                    </span>
                  );
                  if (!letters) return sign;
                  // The sign over its letters, centred on each other
                  return (
                    <span key={j} className="flex flex-col items-center">
                      {sign}
                      <span
                        lang="en"
                        className={`${cinzel.className} select-none`}
                        style={{ fontSize: `${LETTERS.size}em`, lineHeight: `${LETTERS.line / LETTERS.size}`, color: style.caption, letterSpacing: "0.08em", textShadow: style.lift }}
                      >
                        {L.letters[i]?.[j]}
                      </span>
                    </span>
                  );
                })}
                {caret && i === L.lines.length - 1 && (
                  <span aria-hidden="true" className="kb-caret ml-[0.08em] inline-block w-[2px] self-center" style={{ height: "0.8em", background: style.heading }} />
                )}
              </div>
            ))}
            {L.cartouche && (
              <span
                aria-hidden="true"
                className="absolute"
                style={{
                  ...(L.column
                    ? { bottom: `-${CARTOUCHE.tie}em`, left: "18%", width: "64%", height: `${CARTOUCHE.tie * 0.6}em` }
                    : { right: `-${CARTOUCHE.tie}em`, top: "18%", height: "64%", width: `${CARTOUCHE.tie * 0.6}em` }),
                  border: `max(2px, ${CARTOUCHE.rope}em) solid ${style.heading}`,
                  borderRadius: "0.04em",
                }}
              />
            )}
          </div>
          {L.captionText && (
            <div className={`${cinzel.className} whitespace-nowrap`} style={{ fontSize: cq(L.caption), color: style.caption, letterSpacing: cq(L.caption * 0.3), marginTop: cq(L.caption * 0.6), textShadow: style.lift }}>
              {L.captionText}
            </div>
          )}
          {L.noteLines.map((line, i) => (
            <div
              key={i}
              className={`${cinzel.className} whitespace-nowrap`}
              style={{ fontSize: cq(L.note), color: style.caption, letterSpacing: cq(L.note * 0.06), marginTop: cq(L.note * (i === 0 ? 0.7 : 0.25)), textShadow: style.lift }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
