"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import SealedPanel, { type SealedItem } from "@/components/SealedPanel";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent } from "@/lib/analytics";
import { PLAN, digSummary, type Chamber, type SideRoom, type Visitor } from "@/lib/dig";
import type { GameInfo } from "@/lib/games";

type Props = {
  chambers: Chamber[];
  sideRooms: SideRoom[];
  visitor: Visitor;
  /** Fading Paint: signs due for repainting today (null = feature not available yet) */
  dueCount: number | null;
};

const GLYPH = "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";
const ROOM = { w: 62, h: 31, wall: 20 };
const SIDE = { w: 40, h: 20, wall: 13 };
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

type Selection = { kind: "chamber"; chamber: Chamber } | { kind: "room"; room: SideRoom } | null;

export default function DigMap({ chambers, sideRooms, visitor, dueCount }: Props) {
  const { openAuthModal } = useAuthModal();
  const summary = useMemo(() => digSummary(chambers), [chambers]);
  // a members' game tapped in a chamber's list opens its sealed panel; only the panel's Buy button goes to checkout
  const [sealed, setSealed] = useState<SealedItem | null>(null);
  const [sel, setSel] = useState<Selection>(() => {
    const next = chambers.find((c) => c.state === "open") ?? chambers.find((c) => c.state === "sealed") ?? chambers[chambers.length - 1];
    return next ? { kind: "chamber", chamber: next } : null;
  });

  function pick(s: Selection) {
    setSel(s);
    if (s?.kind === "chamber") trackEvent("dig_select", { chamber: s.chamber.id, state: s.chamber.state });
    if (s?.kind === "room") trackEvent("dig_select", { room: s.room.game.id, open: s.room.open ? 1 : 0 });
  }

  return (
    <div>
      {/* Headline */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500">Excavation progress</p>
          <p className="font-display text-xl text-sand-100">
            {summary.cleared === 0
              ? "The entrance is open. Nothing has been cleared yet."
              : summary.cleared === summary.total
                ? "Every chamber is lit. The tomb is yours."
                : `${summary.cleared} of ${summary.total} chambers cleared · you are ${summary.deepest} deep`}
          </p>
        </div>
        {dueCount !== null && dueCount > 0 && (
          <Link href="/games/wall" className="inline-flex items-center gap-2 border border-gold-500/40 bg-gold-500/10 px-3 py-2 font-body text-xs text-gold-300 hover:bg-gold-500/20 transition-colors">
            <span aria-hidden="true">𓏞</span> {dueCount} sign{dueCount === 1 ? "" : "s"} need repainting today
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* The plan */}
        <div className="dig-plan card-ancient p-2 sm:p-3 overflow-hidden">
          <svg viewBox={`0 0 ${PLAN.width} ${PLAN.height}`} className="w-full h-auto block" role="img" aria-label="Isometric plan of the tomb: eight chambers, one per lesson, with side rooms for the games">
            <defs>
              <pattern id="dig-sand" width="14" height="14" patternUnits="userSpaceOnUse">
                <rect width="14" height="14" fill="#2a2116" />
                <circle cx="3" cy="4" r="1" fill="#4a3a22" />
                <circle cx="10" cy="10" r="1.2" fill="#3d2f1c" />
                <circle cx="7" cy="1" r="0.8" fill="#3d2f1c" />
              </pattern>
              <radialGradient id="dig-torch">
                <stop offset="0%" stopColor="#f5d890" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#d4a832" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d4a832" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="dig-door">
                <stop offset="0%" stopColor="#e8c460" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#e8c460" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="dig-floor-lit" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5b4520" />
                <stop offset="100%" stopColor="#2f2412" />
              </linearGradient>
              <linearGradient id="dig-floor-dark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1c1710" />
                <stop offset="100%" stopColor="#0f0c08" />
              </linearGradient>
              <filter id="dig-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
              <filter id="dig-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width={PLAN.width} height={PLAN.height} fill="url(#dig-sand)" />
            <rect width={PLAN.width} height={PLAN.height} fill="#000" opacity="0.25" />

            {/* Corridors between chambers */}
            {chambers.slice(1).map((c, i) => {
              const prev = chambers[i];
              const dug = prev.state === "cleared" || c.state === "cleared" || c.state === "open";
              return (
                <g key={`cor-${c.id}`}>
                  <line x1={prev.x} y1={prev.y} x2={c.x} y2={c.y} stroke="#171209" strokeWidth={30} strokeLinecap="round" />
                  <line x1={prev.x} y1={prev.y} x2={c.x} y2={c.y} stroke={dug ? "#3a2c15" : "#221a0f"} strokeWidth={18} strokeLinecap="round" strokeDasharray={dug ? undefined : "10 12"} />
                </g>
              );
            })}
            {/* Corridors to side rooms */}
            {sideRooms.map((r) => {
              const c = chambers[r.anchor - 1];
              return (
                <g key={`side-${r.game.id}`}>
                  <line x1={c.x} y1={c.y} x2={r.x} y2={r.y} stroke="#171209" strokeWidth={18} strokeLinecap="round" />
                  <line x1={c.x} y1={c.y} x2={r.x} y2={r.y} stroke={r.open ? "#3a2c15" : "#221a0f"} strokeWidth={9} strokeLinecap="round" strokeDasharray={r.open ? undefined : "6 8"} />
                </g>
              );
            })}

            {/* Torchlight halos (behind rooms) */}
            {chambers.filter((c) => c.state === "cleared").map((c) => (
              <circle key={`halo-${c.id}`} cx={c.x} cy={c.y} r={95} fill="url(#dig-torch)" className="dig-torch" />
            ))}
            {chambers.filter((c) => c.state === "open").map((c) => (
              <circle key={`door-${c.id}`} cx={c.x} cy={c.y} r={80} fill="url(#dig-door)" className="dig-torch dig-torch--slow" />
            ))}

            {/* Side rooms */}
            {sideRooms.map((r) => (
              <Room
                key={r.game.id}
                x={r.x}
                y={r.y}
                size={SIDE}
                state={r.open ? "cleared" : "sealed"}
                icon={r.game.numeral.length <= 2 ? r.game.numeral : "𓊖"}
                label={r.game.title}
                small
                selected={sel?.kind === "room" && sel.room.game.id === r.game.id}
                onSelect={() => pick({ kind: "room", room: r })}
              />
            ))}

            {/* Chambers */}
            {chambers.map((c) => (
              <Room
                key={c.id}
                x={c.x}
                y={c.y}
                size={ROOM}
                state={c.state}
                icon={c.icon}
                label={`${ROMAN[c.order - 1]} · ${c.title}`}
                numeral={ROMAN[c.order - 1]}
                selected={sel?.kind === "chamber" && sel.chamber.id === c.id}
                onSelect={() => pick({ kind: "chamber", chamber: c })}
              />
            ))}

            {/* Entrance marker */}
            <g transform={`translate(${chambers[0].x - 150} ${chambers[0].y - 8})`} aria-hidden="true">
              <text x="0" y="0" fill="#907050" fontSize="12" fontFamily="var(--font-body)" letterSpacing="2">ENTRANCE</text>
              <path d="M 78 -4 L 92 -4 L 88 -8 M 92 -4 L 88 0" stroke="#907050" strokeWidth="1.5" fill="none" />
            </g>
          </svg>
        </div>

        {/* Detail card */}
        <aside className="card-ancient p-5 lg:sticky lg:top-24" aria-live="polite">
          {sel?.kind === "chamber" && (
            <ChamberCard chamber={sel.chamber} visitor={visitor} onSignIn={() => openAuthModal({ next: "/dig" })} onSeal={(g) => setSealed(sealedGame(g))} />
          )}
          {sel?.kind === "room" && <RoomCard room={sel.room} visitor={visitor} onSignIn={() => openAuthModal({ next: "/dig" })} />}
          <SealedPanel item={sealed} onClose={() => setSealed(null)} location="dig" />
        </aside>
      </div>

      {/* Accessible list of every chamber (keyboard + crawlers) */}
      <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-2" aria-label="Chambers">
        {chambers.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => pick({ kind: "chamber", chamber: c })}
              className={`w-full text-left p-3 border transition-colors ${
                sel?.kind === "chamber" && sel.chamber.id === c.id ? "border-gold-500 bg-gold-500/10" : "border-gold-700/20 bg-obsidian-lighter hover:border-gold-500/40"
              }`}
              aria-pressed={sel?.kind === "chamber" && sel.chamber.id === c.id}
            >
              <span className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500">
                {ROMAN[c.order - 1]} · {stateLabel(c)}
              </span>
              <span className="block font-display text-base text-sand-100 leading-tight mt-0.5">
                <span className="mr-2" style={{ fontFamily: GLYPH }} aria-hidden="true">
                  {c.icon}
                </span>
                {c.title}
              </span>
              <span className="block font-body text-xs text-sand-500 mt-0.5">{c.subtitle}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function stateLabel(c: Chamber): string {
  if (c.state === "cleared") return c.bestScore !== null ? `Cleared · ${c.bestScore}` : "Cleared";
  if (c.state === "open") return "Dig here";
  if (c.state === "sealed") return c.seal === "signin" ? "Sign in" : "Sealed";
  return "Unexcavated";
}

// ─── An isometric room ───

function Room({
  x,
  y,
  size,
  state,
  icon,
  label,
  numeral,
  small,
  selected,
  onSelect,
}: {
  x: number;
  y: number;
  size: { w: number; h: number; wall: number };
  state: Chamber["state"];
  icon: string;
  label: string;
  numeral?: string;
  small?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const { w, h, wall } = size;
  const floor = `${x},${y - h} ${x + w},${y} ${x},${y + h} ${x - w},${y}`;
  const left = `${x - w},${y} ${x},${y + h} ${x},${y + h + wall} ${x - w},${y + wall}`;
  const right = `${x},${y + h} ${x + w},${y} ${x + w},${y + wall} ${x},${y + h + wall}`;
  const lit = state === "cleared";
  const open = state === "open";
  const floorFill = lit ? "url(#dig-floor-lit)" : open ? "url(#dig-floor-dark)" : state === "sealed" ? "#241c12" : "url(#dig-sand)";
  const stroke = selected ? "#f5d890" : lit ? "#d4a832" : open ? "#e8c460" : state === "sealed" ? "#5a4622" : "#3a2e1c";
  const fontSize = small ? 22 : 34;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${state === "cleared" ? "cleared" : state === "open" ? "dig here" : state}`}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="dig-room"
      style={{ cursor: "pointer" }}
    >
      <polygon points={left} fill={lit ? "#3b2c12" : "#15100a"} stroke="#0d0a05" strokeWidth="1" />
      <polygon points={right} fill={lit ? "#4d3a18" : "#1b150c"} stroke="#0d0a05" strokeWidth="1" />
      <polygon points={floor} fill={floorFill} stroke={stroke} strokeWidth={selected ? 3 : open ? 2.5 : 1.5} strokeDasharray={state === "unexcavated" ? "5 5" : undefined} className={open ? "dig-door-pulse" : undefined} filter={selected ? "url(#dig-glow)" : undefined} />
      {(lit || open || small) && (
        <text x={x} y={y + (small ? 7 : 11)} textAnchor="middle" fontSize={fontSize} fill={lit ? "#f5d890" : open ? "#b09070" : state === "sealed" ? "#6b5530" : "#8a7048"} style={{ fontFamily: GLYPH }} filter={lit ? "url(#dig-glow)" : undefined} aria-hidden="true">
          {icon}
        </text>
      )}
      {state === "sealed" && !small && (
        <g transform={`translate(${x} ${y})`} aria-hidden="true">
          <rect x="-9" y="-3" width="18" height="14" rx="2" fill="#6b5530" />
          <path d="M -5 -3 v -5 a 5 5 0 0 1 10 0 v 5" stroke="#6b5530" strokeWidth="3" fill="none" />
        </g>
      )}
      {state === "unexcavated" && !small && (
        <text x={x} y={y + 6} textAnchor="middle" fontSize="16" fill="#5a4a30" fontFamily="var(--font-body)" aria-hidden="true">
          ?
        </text>
      )}
      {numeral && (
        <text x={x} y={y + h + wall + 16} textAnchor="middle" fontSize="12" fill={lit || open ? "#e8c460" : "#907050"} fontFamily="var(--font-body)" letterSpacing="2" aria-hidden="true">
          {numeral}
        </text>
      )}
      {small && (
        <text x={x} y={y + h + wall + 14} textAnchor="middle" fontSize="10" fill="#907050" fontFamily="var(--font-body)" aria-hidden="true">
          {label}
        </text>
      )}
    </g>
  );
}

// ─── Cards ───

function sealedGame(g: GameInfo): SealedItem {
  return { id: g.id, kind: "game", title: g.title, subtitle: [g.tech ?? "3D", g.skill ? `Trains: ${g.skill}` : null].filter(Boolean).join(" · "), description: g.blurb };
}

function ChamberCard({
  chamber: c,
  visitor,
  onSignIn,
  onSeal,
}: {
  chamber: Chamber;
  visitor: Visitor;
  onSignIn: () => void;
  onSeal: (game: GameInfo) => void;
}) {
  return (
    <div className="enter-fade" key={c.id}>
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">
        Chamber {ROMAN[c.order - 1]} · {stateLabel(c)}
        {c.isFree && <span className="ml-2 text-sand-500">· Free</span>}
      </p>
      <p className="font-display text-2xl text-sand-100 leading-tight">
        <span className="mr-2 text-gold-400" style={{ fontFamily: GLYPH }} aria-hidden="true">
          {c.icon}
        </span>
        {c.title}
      </p>
      <p className="font-body text-sm text-sand-400 mt-1">
        {c.subtitle} · {c.duration}
      </p>

      <div className="mt-4">
        {c.state === "sealed" && c.seal === "signin" ? (
          <>
            <p className="font-body text-sm text-sand-300 mb-3">This chamber is sealed. Create a free account to keep digging: your progress, XP and streak are saved from the first chamber on.</p>
            <button type="button" onClick={onSignIn} className="btn-primary w-full justify-center text-sm py-3">
              Sign in to keep digging
            </button>
          </>
        ) : c.state === "sealed" ? (
          <>
            <p className="font-body text-sm text-sand-300 mb-3">
              Chambers II to VIII, every game and the certificate open with a one-time <Price /> purchase. No subscription.
            </p>
            <Link href="/checkout" className="btn-primary w-full justify-center text-sm py-3">
              Unlock the whole tomb
            </Link>
            <GuaranteeNote />
          </>
        ) : c.state === "unexcavated" && !visitor.paid ? (
          <p className="font-body text-sm text-sand-500">Still under the sand. Clear the chambers before it first.</p>
        ) : (
          <Link href={c.href} className="btn-primary w-full justify-center text-sm py-3">
            {c.state === "cleared" ? "Revisit the chamber" : c.started ? "Continue digging" : "Enter the chamber"}
          </Link>
        )}
      </div>

      {c.games.length > 0 && (
        <div className="mt-5">
          <p className="font-body text-[10px] tracking-[0.25em] uppercase text-sand-500 mb-2">Practises these signs</p>
          <ul className="space-y-1">
            {c.games.map((g) => {
              const can = !!g.free || visitor.paid;
              return (
                <li key={g.id}>
                  <Link
                    href={g.href}
                    onClick={(e) => {
                      if (can) return;
                      e.preventDefault();
                      onSeal(g);
                    }}
                    aria-haspopup={can ? undefined : "dialog"}
                    className="flex items-baseline justify-between gap-2 py-1.5 border-b border-gold-700/15 font-body text-sm text-sand-200 hover:text-gold-300">
                    <span>{g.title}</span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-sand-500">{g.free ? "Free" : can ? g.tech ?? "3D" : "Members"}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, visitor, onSignIn }: { room: SideRoom; visitor: Visitor; onSignIn: () => void }) {
  const g = room.game;
  return (
    <div className="enter-fade" key={g.id}>
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">
        Side room · {g.free ? "Free" : room.open ? "Members" : "Sealed"} · {g.tech ?? "3D"}
      </p>
      <p className="font-display text-2xl text-sand-100 leading-tight">{g.title}</p>
      <p className="font-body text-sm text-sand-300 mt-2">{g.blurb}</p>
      <p className="font-body text-xs text-sand-500 mt-1">Trains: {g.skill}</p>
      <div className="mt-4">
        {room.open ? (
          <Link href={g.href} className="btn-primary w-full justify-center text-sm py-3">
            {g.id === "daily" ? "Today’s cartouche" : `Play ${g.title}`}
          </Link>
        ) : visitor.signedIn ? (
          <>
            <Link href="/checkout" className="btn-primary w-full justify-center text-sm py-3">
              Unlock with lifetime access
            </Link>
            <GuaranteeNote />
          </>
        ) : (
          <button type="button" onClick={onSignIn} className="btn-primary w-full justify-center text-sm py-3">
            Sign in to see this room
          </button>
        )}
      </div>
    </div>
  );
}
