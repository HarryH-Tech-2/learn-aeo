"use client";

/**
 * Khety the mummy, drawn in SVG so he needs no asset: a round bundle of
 * bandages with big eyes in the gap, a gold collar, and one loose end that
 * never stays tucked in. His moods are small loops of CSS animation.
 *
 * In a level he can be talked to: a click (or K) opens what he can do (a
 * hint, the sound again, the sign list, something true about Egypt), and
 * clicks in quick succession are pokes. He is ticklish.
 */
import { useEffect, useRef, useState } from "react";
import { game, useGame, type MascotSay, type Mood } from "./store";
import { askFact, askHint, poke } from "./answers";

const CSS = `
@keyframes khety-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
@keyframes khety-hop { 0%,100% { transform: translateY(0) scale(1,1) } 20% { transform: translateY(2px) scale(1.06,.92) } 50% { transform: translateY(-16px) scale(.96,1.06) } 80% { transform: translateY(0) scale(1.04,.95) } }
@keyframes khety-wobble { 0%,100% { transform: rotate(-7deg) } 50% { transform: rotate(5deg) } }
@keyframes khety-giggle { 0%,100% { transform: rotate(0) translateY(0) } 15% { transform: rotate(-12deg) translateY(-4px) } 35% { transform: rotate(11deg) translateY(0) } 55% { transform: rotate(-9deg) translateY(-3px) } 75% { transform: rotate(7deg) } }
@keyframes khety-blink { 0%,92%,100% { transform: scaleY(1) } 96% { transform: scaleY(.08) } }
@keyframes khety-tail { 0%,100% { transform: rotate(-8deg) } 50% { transform: rotate(14deg) } }
@keyframes khety-wave { 0%,100% { transform: rotate(-150deg) } 50% { transform: rotate(-118deg) } }
@keyframes khety-wave-l { 0%,100% { transform: rotate(150deg) } 50% { transform: rotate(118deg) } }
@keyframes khety-drop { 0% { opacity: 0; transform: translateY(-4px) } 30% { opacity: 1 } 100% { opacity: 0; transform: translateY(12px) } }
@keyframes khety-spark { 0%,100% { opacity: 0; transform: scale(.4) } 50% { opacity: 1; transform: scale(1) } }
@keyframes khety-pop { 0% { opacity: 0; transform: translateY(6px) scale(.92) } 100% { opacity: 1; transform: none } }
.khety * { transform-box: fill-box; }
.khety-body { animation: khety-bob 2.4s ease-in-out infinite; transform-origin: 50% 100%; }
.khety[data-mood="happy"] .khety-body { animation: khety-hop .7s ease-in-out 2; }
.khety[data-mood="cheer"] .khety-body { animation: khety-hop .8s ease-in-out infinite; }
.khety[data-mood="oops"] .khety-body { animation: khety-wobble .5s ease-in-out 3; }
.khety[data-mood="giggle"] .khety-body { animation: khety-giggle .6s ease-in-out 3; }
.khety[data-mood="giggle"] .khety-tail { animation-duration: .25s; }
.khety-eye { animation: khety-blink 4.2s infinite; transform-origin: 50% 50%; }
.khety-tail { animation: khety-tail 1.6s ease-in-out infinite; transform-origin: 0% 0%; }
.khety-arm-r, .khety-arm-l { transform-origin: 50% 8%; transition: transform .25s ease-out; }
.khety-arm-r { transform: rotate(-18deg); }
.khety-arm-l { transform: rotate(18deg); }
.khety[data-mood="point"] .khety-arm-r { transform: rotate(-100deg); }
.khety[data-mood="happy"] .khety-arm-r, .khety[data-mood="cheer"] .khety-arm-r { animation: khety-wave .4s ease-in-out infinite; }
.khety[data-mood="happy"] .khety-arm-l, .khety[data-mood="cheer"] .khety-arm-l { animation: khety-wave-l .4s ease-in-out infinite; }
.khety[data-mood="oops"] .khety-arm-r { transform: rotate(-150deg); }
.khety[data-mood="oops"] .khety-arm-l { transform: rotate(150deg); }
.khety-drop { animation: khety-drop 1s ease-in infinite; }
.khety-spark { animation: khety-spark 1s ease-in-out infinite; transform-origin: 50% 50%; }
.khety-bubble { animation: khety-pop .25s ease-out; }
@media (prefers-reduced-motion: reduce) { .khety *, .khety-bubble { animation: none !important; } }
`;

const LINEN = "#efe3c4";
const SHADE = "#cdbb8e";
const DARK = "#24170b";

export function Khety({ mood = "idle", size = 96 }: { mood?: Mood; size?: number }) {
  const happy = mood === "happy" || mood === "cheer" || mood === "giggle";
  return (
    <svg className="khety" data-mood={mood} width={size} height={size * 1.25} viewBox="0 0 120 150" role="img" aria-label="Khety the mummy">
      <style>{CSS}</style>
      <ellipse cx="60" cy="144" rx="30" ry="4.5" fill="rgba(0,0,0,.35)" />
      <g className="khety-body">
        {/* the loose end that never stays tucked in */}
        <g transform="translate(88 30)">
          <g className="khety-tail">
            <path d="M0 0 q14 4 12 18 q-2 10 8 16" fill="none" stroke={LINEN} strokeWidth="7" strokeLinecap="round" />
            <path d="M0 0 q14 4 12 18 q-2 10 8 16" fill="none" stroke={SHADE} strokeWidth="1.2" strokeDasharray="1 6" strokeLinecap="round" />
          </g>
        </g>
        {/* feet */}
        <rect x="38" y="126" width="18" height="16" rx="8" fill={LINEN} stroke={SHADE} strokeWidth="1.5" />
        <rect x="64" y="126" width="18" height="16" rx="8" fill={LINEN} stroke={SHADE} strokeWidth="1.5" />
        {/* arms, behind the body */}
        <g className="khety-arm-l">
          <rect x="16" y="66" width="15" height="40" rx="7.5" fill={LINEN} stroke={SHADE} strokeWidth="1.5" />
          <path d="M17 80 l13 -4 M17 92 l13 -4" stroke={SHADE} strokeWidth="1.5" />
        </g>
        <g className="khety-arm-r">
          <rect x="89" y="66" width="15" height="40" rx="7.5" fill={LINEN} stroke={SHADE} strokeWidth="1.5" />
          <path d="M90 76 l13 4 M90 88 l13 4" stroke={SHADE} strokeWidth="1.5" />
        </g>
        {/* the bundle itself */}
        <rect x="24" y="12" width="72" height="122" rx="36" fill={LINEN} stroke={SHADE} strokeWidth="2" />
        <g stroke={SHADE} strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M28 30 q32 -10 64 2" />
          <path d="M25 74 q35 10 70 -4" />
          <path d="M25 88 q35 -8 70 4" />
          <path d="M26 102 q34 10 68 -2" />
          <path d="M29 116 q31 -6 62 4" />
          <path d="M40 16 q-8 10 -12 22" />
        </g>
        {/* the gap in the wrappings, and who is in there */}
        <path d="M27 40 q33 -9 66 0 v18 q-33 8 -66 0 z" fill={DARK} />
        {happy ? (
          <g stroke="#fff6dc" strokeWidth="4" fill="none" strokeLinecap="round">
            <path d="M40 52 q7 -9 14 0" />
            <path d="M66 52 q7 -9 14 0" />
          </g>
        ) : (
          <g>
            <g className="khety-eye">
              <ellipse cx="47" cy="49" rx="8" ry={mood === "oops" ? 9 : 8} fill="#fff6dc" />
              <circle cx={mood === "point" ? 50 : 47} cy={mood === "oops" ? 47 : 50} r={mood === "oops" ? 2.6 : 3.6} fill={DARK} />
            </g>
            <g className="khety-eye">
              <ellipse cx="73" cy="49" rx="8" ry={mood === "oops" ? 9 : 8} fill="#fff6dc" />
              <circle cx={mood === "point" ? 76 : 73} cy={mood === "oops" ? 47 : 50} r={mood === "oops" ? 2.6 : 3.6} fill={DARK} />
            </g>
          </g>
        )}
        {/* a broad collar, as worn by anyone who was anyone */}
        <path d="M33 64 q27 16 54 0 l-3 9 q-24 13 -48 0 z" fill="#d9a935" stroke="#9a741c" strokeWidth="1" />
        <path d="M36 69 q24 12 48 0" fill="none" stroke="#1f8f8a" strokeWidth="2.2" />
        <circle cx="60" cy="80" r="3" fill="#a8402c" stroke="#9a741c" strokeWidth=".8" />
        {mood === "oops" && <path className="khety-drop" d="M98 34 q-5 9 0 12 q5 -3 0 -12 z" fill="#8fd6f0" />}
        {mood === "cheer" && (
          <g fill="#ffd56b">
            <path className="khety-spark" d="M12 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" />
            <path className="khety-spark" style={{ animationDelay: ".35s" }} d="M108 8 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
            <path className="khety-spark" style={{ animationDelay: ".7s" }} d="M104 112 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          </g>
        )}
      </g>
    </svg>
  );
}

/** Khety in the corner of the screen while a level is played: he reacts, says his line in a bubble, and settles again. */
export function KhetyCorner({ says, canAsk, onHear, onSigns }: { says: MascotSay | null; /** a level is being played (not paused) */ canAsk: boolean; /** say the wanted sound again, where that is not the answer */ onHear: (() => void) | null; onSigns: () => void }) {
  const [live, setLive] = useState<MascotSay | null>(null);
  const [menu, setMenu] = useState(false);
  const pokes = useRef({ at: 0, times: 0 });
  useEffect(() => {
    if (!says) return setLive(null);
    setLive(says);
    // long enough to read: a hint or a fact stays up longer than a cheer
    const t = setTimeout(() => setLive(null), Math.min(10000, Math.max(3600, 2200 + says.line.length * 60)));
    return () => clearTimeout(t);
  }, [says?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canAsk) setMenu(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || !canAsk) return;
      if (e.code === "KeyK") setMenu((m) => !m);
      if (e.code === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canAsk]);

  const hush = useGame().campaign.hush;
  // one click opens what he can do for you; clicks in quick succession are pokes, and he is ticklish
  const click = () => {
    const now = performance.now();
    const p = pokes.current;
    const quick = now - p.at < 650;
    p.times = quick ? p.times + 1 : now - p.at > 4000 ? 0 : p.times;
    p.at = now;
    if (quick) {
      setMenu(false);
      poke(p.times);
    } else setMenu((m) => !m);
  };
  const act = (what: () => void) => () => {
    setMenu(false);
    what();
  };
  const item = "block w-full text-left border border-gold-600/60 px-3 py-2 font-body text-sm text-sand-100 hover:bg-gold-500/20 hover:text-white";

  // (not on a phone: there he stood in the play area beside the player; the word bar carries Hear it and Hint instead)
  return (
    <div className="absolute left-3 bottom-14 [@media(pointer:coarse)]:hidden flex items-end gap-1 max-w-[70vw] sm:max-w-md">
      <div className="relative shrink-0">
        {menu && canAsk && (
          <div className="khety-bubble pointer-events-auto absolute bottom-full left-0 mb-1 w-56 border-2 border-gold-500/70 bg-[#0c0906]/95 p-2 space-y-1.5 shadow-lg shadow-black/60">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-300 px-1">Ask Khety</p>
            <button type="button" className={item} onClick={act(askHint)}>
              Give me a hint
            </button>
            {onHear && (
              <button type="button" className={item} onClick={act(onHear)}>
                Say the sound again
              </button>
            )}
            <button type="button" className={item} onClick={act(onSigns)}>
              Show me the sign list
            </button>
            <button type="button" className={item} onClick={act(askFact)}>
              Tell me something
            </button>
            <button type="button" className={item} onClick={act(() => game.campaign({ hush: !hush }))}>
              {hush ? "Speak up again" : "Hush, Khety (voice off)"}
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={click}
          disabled={!canAsk}
          title="Khety: click to ask him something (K)"
          aria-label="Ask Khety the mummy for help"
          className="pointer-events-auto block cursor-pointer rounded-full transition-transform hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 disabled:cursor-default"
        >
          <Khety mood={live?.mood ?? "idle"} size={72} />
        </button>
      </div>
      {live && (
        <p key={live.id} className="khety-bubble mb-10 rounded-2xl rounded-bl-sm border-2 border-gold-400 bg-[#fff6dc] px-3 py-2 font-body text-sm sm:text-base font-medium leading-snug text-[#24170b] shadow-lg shadow-black/50">
          {live.line}
        </p>
      )}
    </div>
  );
}
