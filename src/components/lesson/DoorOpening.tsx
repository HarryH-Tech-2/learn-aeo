"use client";

/**
 * The sealed door opening, full screen: the moment Lesson 1's door has been
 * read. Two carved leaves fill the window under a lintel carrying the
 * learner's name; the stone shakes, dust falls from the seam, the leaves
 * swing inward with a grinding sound and the light behind them floods out.
 * About four and a half seconds, and a tap anywhere skips it.
 *
 * All CSS animation (see .door-open-* in globals.css), so it runs on the
 * compositor and stays smooth on a weak laptop.
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { grind, whoosh } from "@/lib/sfx";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";
/** when the overlay hands over to the page (the flood of light is at its brightest just before) */
export const DOOR_OPENING_MS = 4600;

const LEFT_COLUMNS = ["𓋹𓊹𓇳𓆣𓂀", "𓅓𓏏𓈖𓄿𓊪", "𓂋𓆑𓎡𓋴𓈙"];
const RIGHT_COLUMNS = ["𓐍𓆓𓉔𓎛𓄡", "𓊃𓈎𓎼𓍿𓂧", "𓇋𓅱𓃀𓂝𓋹"];

/** Dust motes along the seam and under the lintel: fixed positions, so every opening looks the same. */
const DUST = Array.from({ length: 28 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    left: i < 12 ? 47 + r(1) * 6 : r(2) * 100,
    delay: 0.5 + r(3) * 1.4,
    dur: 1.4 + r(4) * 1.6,
    size: 2 + r(5) * 4,
    drift: (r(6) - 0.5) * 60,
  };
});

type Props = {
  name: string;
  /** the signs of the name, in order */
  signs: string[];
  onDone: () => void;
};

export default function DoorOpening({ name, signs, onDone }: Props) {
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  useEffect(() => {
    const timers = [
      window.setTimeout(() => grind(2.7), 550),
      window.setTimeout(() => whoosh(), 1700),
      window.setTimeout(finish, DOOR_OPENING_MS),
    ];
    // (the page under it must not scroll while the door fills the window)
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      html.style.overflow = before;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="door-open"
      role="presentation"
      onClick={finish}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
      }}
    >
      <div className="door-open-shake">
        {/* behind the leaves: the light of the temple */}
        <div className="door-open-light" aria-hidden="true" />
        <div className="door-open-beam" aria-hidden="true" />

        <div className="door-open-frame" aria-hidden="true">
          {(["left", "right"] as const).map((side) => (
            <div key={side} className={`door-open-leaf door-open-leaf-${side}`}>
              <div className="door-open-panel">
                {(side === "left" ? LEFT_COLUMNS : RIGHT_COLUMNS).map((col, i) => (
                  <span key={i} className="door-open-column" style={{ fontFamily: GLYPH_FONT }}>
                    {col}
                  </span>
                ))}
              </div>
              <span className="door-open-ring" />
            </div>
          ))}
        </div>

        {/* the lintel, with the name the learner just brushed clear */}
        <div className="door-open-lintel">
          <div className="door-open-cartouche" style={{ fontFamily: GLYPH_FONT }} aria-label={`The door reads ${name}`}>
            {signs.join("")}
          </div>
        </div>

        <div className="door-open-dust" aria-hidden="true">
          {DUST.map((d, i) => (
            <span
              key={i}
              style={{
                left: `${d.left}%`,
                width: d.size,
                height: d.size,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.dur}s`,
                ["--drift" as string]: `${d.drift}px`,
              }}
            />
          ))}
        </div>

        <div className="door-open-flood" aria-hidden="true" />
      </div>
      <button type="button" className="door-open-skip" onClick={finish}>
        Skip
      </button>
    </div>,
    document.body,
  );
}
