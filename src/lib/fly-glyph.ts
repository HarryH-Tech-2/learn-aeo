/**
 * Send a sign flying from where it was just learned to its place on the
 * lesson's progress strip (ScribeLadder marks each place with
 * data-ladder-sign). A copy of the sign arcs up to the slot and shrinks into
 * it; the slot itself lights when the caller then marks the sign as met.
 *
 * Resolves true when the flight landed, false when there was nowhere to fly
 * (no strip on the page, reduced motion, no Web Animations): the caller lights
 * the slot either way.
 */
const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";
export const FLY_MS = 900;

export function flyGlyph(symbol: string, from: DOMRect): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve(false);
  const target = document.querySelector<HTMLElement>(`[data-ladder-sign="${CSS.escape(symbol)}"]`);
  if (!target || typeof document.body.animate !== "function") return Promise.resolve(false);
  const to = target.getBoundingClientRect();
  if (to.width === 0) return Promise.resolve(false);

  const el = document.createElement("span");
  el.textContent = symbol;
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: GLYPH_FONT,
    fontSize: `${from.height * 0.62}px`,
    lineHeight: "1",
    color: "#f5d890",
    textShadow: "0 0 18px rgba(255, 214, 120, 0.9)",
    pointerEvents: "none",
    zIndex: "150",
    willChange: "transform, opacity",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const scale = Math.max(0.2, to.height / from.height);
  // up and over: the midpoint rides above the straight line between the two
  const lift = Math.min(120, Math.abs(dy) * 0.35 + 40);
  const anim = el.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - lift}px) scale(${(1 + scale) / 2 + 0.15})`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.85 },
    ],
    { duration: FLY_MS, easing: "cubic-bezier(0.45, 0, 0.25, 1)", fill: "forwards" },
  );
  return new Promise((resolve) => {
    const end = () => {
      el.remove();
      resolve(true);
    };
    anim.onfinish = end;
    anim.oncancel = end;
  });
}
