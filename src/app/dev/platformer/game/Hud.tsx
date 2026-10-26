"use client";

/**
 * Everything that is not 3D: the title (name, levels, gentle mode), the
 * briefing before a level, the bar that shows what the gate wants, the card
 * that teaches a sign, messages, touch controls and the finish card.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { game, hooks, input, journey, playerPos, useGame, type Lesson, type Toast } from "./store";
import { CHECKPOINTS } from "./course";
import { CARRY_AFTER, courseFraction, milestoneCrossed, nextLanding, siteFraction } from "./journey";
import { ALL_SIGNS, LAYOUTS, LEVELS, allDone, currentPhrase, signInfo, viewSockets, type SocketView } from "./lesson";
import { chooseVoice, currentVoice, khety, say, voices } from "./voice";
import { startLine } from "./khety";
import { askHint, dismissTeach } from "./answers";
import { Khety, KhetyCorner } from "./Mascot";
import { WORDS } from "@/lib/content/uniliteral-words";
import { trackEvent } from "@/lib/analytics";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";
const PANEL = "bg-[#0c0906]/90 backdrop-blur-sm shadow-lg shadow-black/50";
/** the ways out at the top left: small, but never hard to find */
const TOP_LINK = "pointer-events-auto whitespace-nowrap border border-gold-500/70 px-2.5 sm:px-3 py-1.5 font-body text-[13px] sm:text-sm font-medium text-white hover:border-gold-300 hover:text-gold-300 " + PANEL;

/** Where a card sits: clear of Khety and the thumbs on a phone held upright, between the thumbs on one held sideways. */
const CARD_SPOT =
  "bottom-16 [@media(pointer:coarse)_and_(orientation:portrait)]:bottom-[21rem] [@media(pointer:coarse)_and_(orientation:landscape)]:bottom-4 [@media(pointer:coarse)_and_(orientation:landscape)]:max-w-[calc(100vw-22rem)]";

/**
 * Where the teaching card sits. A phone held upright has no room for it as well as the word bar (the game is some 500 px
 * tall there, and the thumbs have the bottom third), so it takes the bar's place under the top rows while it is up.
 */
const TEACH_SPOT =
  "bottom-16 [@media(pointer:coarse)_and_(orientation:portrait)]:bottom-auto [@media(pointer:coarse)_and_(orientation:portrait)]:top-24 [@media(pointer:coarse)_and_(orientation:landscape)]:bottom-4 [@media(pointer:coarse)_and_(orientation:landscape)]:max-w-[calc(100vw-22rem)]";

/** While developing, every level can be opened from the title without playing up to it; saved progress is left alone. */
const DEV_UNLOCKED = process.env.NODE_ENV !== "production";

function clock(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
}

function Timer({ from, frozenAt }: { from: number; frozenAt: number | null }) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    const t = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(t);
  }, []);
  // (the clock stands still while the sign list is open)
  return <>{clock((frozenAt ?? now) - from)}</>;
}

/** The voices this browser has, for anyone whose default one grates. (Recorded clips, when there are any, are used instead.) */
function VoicePicker() {
  const [list, setList] = useState<SpeechSynthesisVoice[]>([]);
  const [name, setName] = useState("");
  useEffect(() => {
    const load = () => {
      setList(voices());
      setName(currentVoice());
    };
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
  }, []);
  if (list.length < 2) return null;
  return (
    <label className="flex flex-wrap items-center gap-2 font-body text-sm text-sand-100">
      Voice
      <select
        value={name}
        onChange={(e) => {
          chooseVoice(e.target.value);
          setName(e.target.value);
          khety("Hello! Is this voice better?");
        }}
        className="pointer-events-auto max-w-[16rem] border border-gold-600/60 bg-black/70 px-2 py-1.5 text-sm text-white"
      >
        {list.map((v) => (
          <option key={v.name} value={v.name}>
            {v.name.replace(/^Microsoft |^Google /, "")} ({v.lang})
          </option>
        ))}
      </select>
    </label>
  );
}

/** Khety's voice on or off. His words still appear in the bubble, and the sign sounds are never affected. */
function KhetyVoice() {
  const hush = useGame().campaign.hush;
  return (
    <label className="pointer-events-auto flex items-center gap-2 font-body text-sm text-sand-100 cursor-pointer">
      <input
        type="checkbox"
        checked={!hush}
        onChange={(e) => {
          const hush = !e.target.checked;
          game.campaign({ hush, hushSet: true });
          if (!hush) khety("Hello! Need a hand? I’ve two, somewhere in here."); // (a recorded line)
        }}
        className="h-4 w-4 accent-[#d4a832]"
      />
      Khety speaks aloud
    </label>
  );
}

// ─── the sign list ───

const SILENT = WORDS.filter((w) => w.det).filter((w, i, all) => all.findIndex((x) => x.det!.symbol === w.det!.symbol) === i);

const RULES: [string, string][] = [
  ["Signs are sounds", "Most hieroglyphs are not pictures of what they mean. The owl is the sound m. Twenty-five such signs make the alphabet."],
  ["No vowels", "Only consonants were written. We slip in an ‘e’ to say a word aloud: r + n is said ‘ren’."],
  ["Which way to read", "People, birds and snakes look toward the START of the line: read into their faces. A column is read from the top down."],
  ["Silent pictures", "Many words end in a picture that is not read aloud. It says what kind of word it is: a sky after ‘pet’, a seated man after a trade."],
];

/** Everything met so far and everything still to come, for anyone who has forgotten mid-level. The run stands still while it is open. */
function SignList() {
  const g = useGame();
  const met = new Set([...g.campaign.known, ...(g.lesson?.taught ?? [])]);
  return (
    <div className="pointer-events-auto absolute inset-0 overflow-y-auto bg-black/75 backdrop-blur-[3px] select-text">
      <div className="min-h-full flex items-start justify-center p-3 sm:p-6">
        <div className={"w-full max-w-4xl border-2 border-gold-500/70 p-4 sm:p-7 text-left " + PANEL}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-300 mb-1">The run is paused</p>
              <h2 className="font-display text-3xl font-light text-white">The signs, all 25</h2>
              <p className="font-body text-sm text-sand-200 mt-1 mb-2">
                {met.size} met so far (in gold). The rest are still to come.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 [@media(pointer:coarse)]:hidden">
                <VoicePicker />
                <KhetyVoice />
              </div>
            </div>
            <button type="button" onClick={() => game.resume()} className="btn-primary py-3 px-6 text-sm shrink-0">
              Back to the game <span className="[@media(hover:none)]:hidden">(G)</span>
            </button>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {ALL_SIGNS.map((symbol) => {
              const s = signInfo(symbol);
              const known = met.has(symbol);
              return (
                <li key={symbol} className={"flex items-center gap-3 border px-3 py-2 " + (known ? "border-gold-500/60 bg-gold-500/10" : "border-sand-600/40")}>
                  <span className={"text-4xl leading-none w-12 text-center shrink-0 " + (known ? "text-gold-300" : "text-sand-200")} style={{ fontFamily: GLYPH_FONT }}>
                    {symbol}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg text-white leading-tight">
                      <span className="text-gold-300">“{s.sound}”</span> · {s.picture}
                    </p>
                    <p className="font-body text-sm text-sand-100 leading-snug">
                      Said {s.said}. <span className="text-sand-200">{s.hook}</span>
                    </p>
                  </div>
                  <button type="button" onClick={() => say(s.said)} title={"Hear " + s.said} className="shrink-0 border border-gold-600/60 px-2 py-1 font-body text-xs text-gold-300 hover:bg-gold-500/15">
                    ▶
                  </button>
                </li>
              );
            })}
          </ul>
          <h3 className="font-display text-2xl font-light text-white mb-2">Silent pictures</h3>
          <p className="font-body text-sm text-sand-200 mb-3">Never read aloud: each ends a word and says what kind of word it is.</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {SILENT.map((w) => (
              <li key={w.det!.symbol} className="flex items-center gap-3 border border-sand-600/40 px-3 py-2">
                <span className="text-4xl leading-none w-12 text-center shrink-0 text-sand-100" style={{ fontFamily: GLYPH_FONT }}>
                  {w.det!.symbol}
                </span>
                <p className="font-body text-sm text-sand-100 leading-snug">
                  <span className="font-display text-lg text-white capitalize">{w.det!.name}</span>
                  <br />
                  ends <em className="text-gold-300">{w.translit}</em>, “{w.meaning.split(",")[0]}”
                </p>
              </li>
            ))}
          </ul>
          <h3 className="font-display text-2xl font-light text-white mb-2">How the script works</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {RULES.map(([title, body]) => (
              <div key={title}>
                <dt className="font-display text-lg text-gold-300">{title}</dt>
                <dd className="font-body text-sm text-sand-100 leading-snug">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

/** Left thumb steers, right thumb jumps (where there is jumping). Only shown on touch screens. */
function TouchControls({ jump }: { jump: boolean }) {
  const pad = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState<[number, number]>([0, 0]);
  const steer = (e: React.PointerEvent) => {
    const el = pad.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0) return; // hidden: nothing to steer by
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    input.x = x;
    input.y = -y;
    setKnob([x, y]);
  };
  const release = () => {
    input.x = 0;
    input.y = 0;
    setKnob([0, 0]);
  };
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6 [@media(hover:hover)_and_(pointer:fine)]:hidden">
      <div
        ref={pad}
        data-touch="stick"
        className="pointer-events-auto relative h-36 w-36 rounded-full border-2 border-gold-500/70 bg-black/50 backdrop-blur-sm touch-none"
        onPointerDown={(e) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* a pointer that is already gone */
          }
          steer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons !== 0 || e.pointerType === "touch") steer(e);
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/80" style={{ marginLeft: knob[0] * 40, marginTop: knob[1] * 40 }} />
      </div>
      {jump && (
      <button
        type="button"
        data-touch="jump"
        className="pointer-events-auto h-28 w-28 rounded-full border-2 border-gold-500/70 bg-black/55 backdrop-blur-sm font-body text-sm tracking-[0.2em] uppercase text-gold-300 touch-none select-none"
        onPointerDown={() => {
          input.jumpHeld = true;
          input.jumpPressedAt = performance.now();
        }}
        onPointerUp={() => {
          input.jumpHeld = false;
        }}
        onPointerCancel={() => {
          input.jumpHeld = false;
        }}
      >
        Jump
      </button>
      )}
    </div>
  );
}

// ─── sockets: the same picture of the word as the gate carries ───

function Sockets({ views, size = "md" }: { views: SocketView[]; size?: "md" | "sm" }) {
  const box = size === "md" ? "h-7 w-6 text-xl sm:h-14 sm:w-12 sm:text-4xl" : "h-11 w-9 text-3xl";
  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5">
      {views.map((v, i) => {
        const tone =
          v.state === "filled"
            ? "border-gold-400 bg-gold-500/20 text-gold-300"
            : v.state === "given"
              ? "border-sand-300/60 bg-white/10 text-sand-100"
              : v.state === "next"
                ? "border-[#7ff0e0] bg-[#7ff0e0]/15 text-sand-100 animate-pulse"
                : "border-sand-400/50 text-sand-200";
        return (
          <div key={i} className="flex flex-col items-center">
            <span className={"flex items-center justify-center border-2 leading-none transition-colors duration-300 " + box + " " + tone + (v.silent ? " opacity-80" : "")} style={{ fontFamily: GLYPH_FONT }}>
              {v.showSymbol || v.state === "given" ? v.symbol : ""}
            </span>
            <span className={"font-display leading-none mt-1 sm:mt-1.5 " + (v.silent ? "text-xs " : size === "md" ? "text-xs sm:text-2xl " : "text-lg ") + (v.state === "next" ? "text-[#7ff0e0] font-medium" : v.state === "filled" ? "text-gold-300" : "text-sand-100")}>
              {v.showSound ? v.sound : "?"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function hearNext() {
  const l = game.get().lesson;
  const st = l?.stations[l.progress];
  // (not at the buried wall: there the sound is the answer)
  if (l && st && st.kind === "sign" && l.spec.layout !== "brush") say(signInfo(st.target).said);
}

/** A phone has no Khety to ask: his hint comes up as a message instead (and is counted all the same). */
function phoneHint() {
  askHint();
  const line = game.get().mascot?.line;
  if (line) game.toast(line, "info");
}

// ─── the way to the gate (causeway): how far, which signs are carved, where the learner is ───

/** The furthest solid ground reached and where the learner is now, as fractions of the way to the gate (read four times a second). */
function useJourney(on: boolean): { here: number; best: number } {
  const [j, setJ] = useState({ here: 0, best: 0 });
  useEffect(() => {
    if (!on) return;
    const tick = () => {
      const here = courseFraction(playerPos.z);
      const best = courseFraction(journey.furthestZ);
      setJ((p) => (Math.abs(p.here - here) < 0.004 && p.best === best ? p : { here, best }));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [on]);
  return j;
}

/** A line from the start to the gate: the ground won fills in, each station shows its sign once carved, and Khety calls the quarter marks. */
function JourneyTrack({ lesson, here, best }: { lesson: Lesson; here: number; best: number }) {
  const stations = lesson.stations.map((s, i) => ({ s, i, at: siteFraction(s.site) }));
  const carved = Math.min(lesson.progress, stations.length);
  const last = useRef(best);
  useEffect(() => {
    const m = milestoneCrossed(last.current, best);
    last.current = best;
    if (m && !game.get().teaching) game.mascot("cheer", m.line);
  }, [best]);
  return (
    <div className={"w-[min(34rem,80vw)] border border-gold-600/60 px-4 pt-1.5 pb-2 [@media(pointer:coarse)]:hidden " + PANEL}>
      <div className="flex justify-between gap-4 font-body text-xs tracking-[0.15em] uppercase">
        <span className="text-gold-300">The way to the gate · {Math.round(best * 100)}%</span>
        <span className="text-sand-100">
          {carved} of {stations.length} signs carved
        </span>
      </div>
      <div className="relative h-8 ml-3 mr-9">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-sand-400/25" />
        <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-gold-400 transition-[width] duration-500" style={{ width: `${best * 100}%` }} />
        {CHECKPOINTS.map((cp, i) => (
          <span key={i} className={"absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 " + (courseFraction(cp.at[2]) <= best ? "bg-[#7ff0e0]" : "bg-sand-300/50")} style={{ left: `${courseFraction(cp.at[2]) * 100}%` }} />
        ))}
        {stations.map(({ s, i, at }) => {
          const tone = i < carved ? "border-gold-400 bg-[#2a1f0c] text-gold-300" : i === carved ? "border-[#7ff0e0] bg-[#0c0906] text-[#7ff0e0] animate-pulse" : "border-sand-400/60 bg-[#0c0906] text-sand-300";
          return (
            <span key={i} className={"absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 text-base leading-none " + tone} style={{ left: `${at * 100}%`, fontFamily: i < carved ? GLYPH_FONT : undefined }}>
              {i < carved ? s.target : "?"}
            </span>
          );
        })}
        {/* the learner: a small light that moves with them, falls and all */}
        <span className="absolute top-0 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-white shadow-[0_0_8px_#7ff0e0] transition-[left] duration-200" style={{ left: `${here * 100}%` }} />
        <span className="absolute left-full top-1/2 ml-1 -translate-y-1/2 text-xl leading-none text-gold-300" style={{ fontFamily: GLYPH_FONT }} aria-label="the temple gate">
          𓉐
        </span>
      </div>
    </div>
  );
}

/** After a run of falls with no new ground, Khety offers to carry the learner to the next landing. The signs matter here, not the jumping. */
function CarryOffer({ onKeep }: { onKeep: () => void }) {
  const carry = (e: React.MouseEvent<HTMLButtonElement>) => {
    // (a focused button would take the next space bar, which is the jump)
    e.currentTarget.blur();
    const to = nextLanding(playerPos.z);
    if (!to) return onKeep();
    journey.carryTo = to.at;
    const g = game.get();
    game.set({ stuck: 0, assists: g.assists + 1 });
    game.mascot("happy", "Hold on to my bandages. Up we go!");
  };
  return (
    <div className={"pointer-events-auto absolute left-1/2 -translate-x-1/2 max-w-xl w-[92vw] " + CARD_SPOT + " border-2 border-[#7ff0e0] px-4 md:px-6 py-3 md:py-4 text-center " + PANEL}>
      <p className="font-body text-base md:text-lg text-white leading-snug mb-3">Tricky jump? This lesson is about the signs, not the jumping. Khety can carry you to the next landing.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button type="button" onClick={carry} className="btn-primary py-2.5 px-6 text-sm justify-center">
          Carry me across
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            onKeep();
          }}
          className="btn-secondary py-2.5 px-5 text-sm justify-center !text-gold-300"
        >
          I’ll keep trying
        </button>
      </div>
    </div>
  );
}

/** What the gate wants right now. Spelling shows sounds and hides signs; the last level does the reverse. */
function WordBar({ lesson, toast, standing, aside = false, track }: { lesson: Lesson; toast: Toast | null; /** standing advice: on an upright phone it follows the bar, like the messages */ standing?: string | null; /** the teaching card has its place for now (an upright phone only) */ aside?: boolean; /** the causeway's way to the gate, under the bar */ track?: React.ReactNode }) {
  const pi = currentPhrase(lesson, lesson.progress);
  const phrase = lesson.phrases[pi];
  const done = allDone(lesson, lesson.progress, lesson.reviewed);
  // the buried wall asks its spelling stations backwards (sign shown, sound chosen), so the bar must not give the sounds away
  const blind = lesson.spec.layout === "brush";
  const views = viewSockets(lesson, lesson.progress, pi).map((v) => (blind ? { ...v, showSound: v.silent || v.state === "filled" || v.state === "given" } : v));
  const phraseRead = views.every((v) => v.state === "filled" || v.state === "given");
  const reading = lesson.spec.kind === "final" || blind;
  const station = lesson.stations[lesson.progress];
  const place = LAYOUTS[lesson.spec.layout];
  // the market's old orders come after the spelling: the bar says so instead of looking finished
  const orders = !done && !station;
  return (
    <div className={"absolute left-1/2 top-24 md:top-4 -translate-x-1/2 flex flex-col items-center gap-2 w-max max-w-[96vw]" + (aside ? " [@media(pointer:coarse)_and_(orientation:portrait)]:hidden" : "")}>
      <div className={"flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1 sm:gap-y-2 border sm:border-2 border-gold-500/70 px-2 sm:px-5 py-1 sm:py-3 max-w-[96vw] " + PANEL}>
        <p className="hidden sm:block font-body text-xs tracking-[0.2em] uppercase text-gold-300 leading-snug">
          {done ? place.open : orders ? "Old orders:" : blind ? "Uncover it and" : reading ? "Read it to" : "Spell it to"}
          {!done && <br />}
          {done ? "" : orders ? "by meaning now" : place.goal}
          {lesson.phrases.length > 1 && (
            <span className="block text-sand-200 normal-case tracking-normal mt-0.5">
              word {pi + 1} of {lesson.phrases.length}
            </span>
          )}
        </p>
        <Sockets views={views} />
        {/* the reading level never shows the answer in Latin letters until it has been read */}
        {(!reading || done || blind) && (
          <p className="font-display text-base sm:text-2xl text-sand-100 leading-none sm:leading-tight max-sm:max-w-[7.5rem]">
            <em className="text-gold-300">{blind && !phraseRead ? "?" : phrase.translit}</em>
            <br className={phrase.id === "name" ? "max-sm:hidden" : ""} />
            <span className={"font-body text-xs sm:text-base text-sand-100" + (phrase.id === "name" ? " max-sm:hidden" : "")}>“{phrase.meaning.split(",")[0]}”</span>
          </p>
        )}
        {station?.kind === "sign" && !blind && (
          <button type="button" onClick={hearNext} aria-label="Hear it" className="[@media(pointer:coarse)]:hidden pointer-events-auto border border-gold-600/70 px-3 py-2 max-sm:px-2 max-sm:py-1 font-body text-xs tracking-[0.15em] uppercase text-gold-300 hover:bg-gold-500/15">
            ▶<span className="max-sm:hidden"> Hear it</span> <span className="text-sand-300 [@media(hover:none)]:hidden">(H)</span>
          </button>
        )}
        {!done && (
          <button type="button" onClick={phoneHint} className="hidden [@media(pointer:coarse)]:block pointer-events-auto border border-[#7ff0e0]/70 px-2 py-1 font-body text-xs tracking-[0.15em] uppercase text-[#7ff0e0]">
            Hint
          </button>
        )}
      </div>
      {track}
      {/* (on a phone the message follows the bar, however tall the bar has wrapped) */}
      {toast && <ToastLine toast={toast} under />}
      {standing && (
        <p className={"hidden [@media(pointer:coarse)_and_(orientation:portrait)]:block w-[92vw] border-2 border-[#7ff0e0] px-3 py-2 text-center font-body text-sm text-white leading-snug " + PANEL}>{standing}</p>
      )}
    </div>
  );
}

/** A new sign, met in its beam: what it is, what it writes, how to keep hold of it. Nothing to get wrong. */
function TeachCard({ symbol }: { symbol: string }) {
  const s = signInfo(symbol);
  const lesson = useGame().lesson;
  // the station that wants this sign next (a reminder when that one does not teach it); a beam revisited later, its teaching station
  const station =
    lesson?.stations.find((st, i) => i >= lesson.progress && st.kind === "sign" && st.target === symbol) ??
    lesson?.stations.find((st) => st.kind === "sign" && st.target === symbol && st.teach);
  const reminder = !!station && !station.teach;
  const place = LAYOUTS[lesson?.spec.layout ?? "causeway"];
  const asked = station?.sound;
  const metAs = station?.metAs;
  // (the buried wall keeps its word hidden until it is read, and asks for sounds, not signs)
  const blind = lesson?.spec.layout === "brush";
  const phrase = station && lesson && !blind ? lesson.phrases[station.phrase] : undefined;
  // the signs it will stand beside when it is asked for: telling them apart is half of knowing it
  const beside = station && !blind ? station.options.filter((o) => o !== symbol) : [];
  const hold = useGame().hold;
  return (
    <div className={"absolute left-1/2 -translate-x-1/2 w-[94vw] max-w-2xl " + TEACH_SPOT + " border-2 border-gold-400 px-4 md:px-6 py-4 md:py-5 [@media(pointer:coarse)]:px-3 [@media(pointer:coarse)]:py-2.5 flex items-center gap-4 md:gap-6 [@media(pointer:coarse)]:gap-3 " + PANEL}>
      <div className="flex flex-col items-center gap-3 [@media(pointer:coarse)]:gap-2 shrink-0">
        {/* (keyed, so each new sign swings in afresh) */}
        <span key={symbol} className="icon-spin-in text-6xl md:text-8xl [@media(pointer:coarse)]:text-5xl text-gold-300 leading-none" style={{ fontFamily: GLYPH_FONT }}>
          {symbol}
        </span>
        <button type="button" onClick={() => say(s.said)} className="[@media(pointer:coarse)]:hidden pointer-events-auto border border-gold-600/70 px-3 py-1.5 font-body text-xs tracking-[0.15em] uppercase text-gold-300 hover:bg-gold-500/15">
          ▶ Hear it
        </button>
        {/* (it goes of its own accord out of the ring; this is for anyone who has read it and wants the view back) */}
        {/* (a first meeting on the causeway holds the explorer in the beam until this is pressed) */}
        <button
          type="button"
          onClick={dismissTeach}
          className={"pointer-events-auto border px-3 py-1.5 font-body text-xs tracking-[0.15em] uppercase " + (hold ? "border-[#7ff0e0] bg-[#7ff0e0] text-black font-semibold hover:bg-[#a5f6ec] animate-pulse" : "border-[#7ff0e0]/70 text-[#7ff0e0] hover:bg-[#7ff0e0]/10")}
        >
          Got it ✓{hold && <span className="[@media(hover:none)]:hidden"> (Enter)</span>}
        </button>
      </div>
      <div className="text-left">
        <p className="font-body text-xs tracking-[0.25em] uppercase text-gold-300 mb-1 [@media(pointer:coarse)]:mb-0 [@media(pointer:coarse)]:text-[10px]">
          {metAs ? "A sign you know, and its real sound" : reminder ? "A sign you know · a reminder" : <>A new sign<span className="[@media(pointer:coarse)]:hidden"> · this is the one to find</span></>}
        </p>
        {metAs && (
          <p className="font-body text-base text-white mb-1">
            In your name this stood for <strong>“{metAs}”</strong>. Egyptologists write the sign’s own sound <strong>“{s.sound}”</strong>.
          </p>
        )}
        <p className="font-display text-2xl md:text-3xl [@media(pointer:coarse)]:text-xl text-white leading-tight">
          {s.picture} <span className="text-gold-300">= “{s.sound}”</span>
        </p>
        <p className="font-body text-base md:text-lg [@media(pointer:coarse)]:text-sm text-sand-100 mt-1 [@media(pointer:coarse)]:mt-0">
          It writes the sound <strong className="text-white">{s.said}</strong>.<span className="[@media(pointer:coarse)]:hidden"> Say it out loud!</span>
        </p>
        {s.trick && (
          <p className="font-body text-base md:text-lg [@media(pointer:coarse)]:text-sm text-white mt-2 [@media(pointer:coarse)]:mt-1 leading-snug border-l-2 border-gold-400 pl-3 [@media(pointer:coarse)]:pl-2">
            <span className="block [@media(pointer:coarse)]:hidden font-body text-[11px] tracking-[0.2em] uppercase text-gold-300">To remember it</span>
            {s.trick}
          </p>
        )}
        {/* (a phone has room for the trick and no more) */}
        <p className="max-md:hidden [@media(pointer:coarse)]:hidden font-body text-sm md:text-base text-sand-200 mt-2 leading-snug">{s.hook}</p>
        {phrase && asked && (
          <p className="max-md:hidden [@media(pointer:coarse)]:hidden font-body text-sm md:text-base text-sand-100 mt-2 leading-snug">
            You need it for the <strong className="text-white">“{asked}”</strong> in <em className="text-gold-300">{phrase.translit}</em>
            {phrase.id === "name" ? ", your name" : <>, “{phrase.meaning.split(",")[0]}”</>}
            {!metAs && asked !== s.sound ? ": the nearest sound Egyptian had." : "."}
          </p>
        )}
        {beside.length > 0 && (
          <p className="max-md:hidden [@media(pointer:coarse)]:hidden font-body text-sm md:text-base text-sand-100 mt-1 leading-snug">
            Look closely: it will be standing beside{" "}
            {beside.map((o) => (
              <span key={o} className="text-2xl md:text-3xl text-white mx-1 align-middle" style={{ fontFamily: GLYPH_FONT }}>
                {o}
              </span>
            ))}
            .
          </p>
        )}
        {!metAs && !phrase && asked && asked !== s.sound && (
          <p className="font-body text-base text-white mt-2">
            In this name it stands for <strong>“{asked}”</strong>, the nearest sound Egyptian had.
          </p>
        )}
        <p className="font-body text-sm text-[#7ff0e0] mt-3 [@media(pointer:coarse)]:mt-1 leading-snug">
          {place.teachNext} The sound wanted is “{asked ?? s.sound}”.
        </p>
      </div>
    </div>
  );
}

function ToastLine({ toast, under = false }: { toast: Toast; under?: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), toast.tone === "bad" ? 8000 : 6000);
    return () => clearTimeout(t);
  }, [toast.id, toast.tone]);
  if (!visible) return null;
  const tone = toast.tone === "good" ? "border-gold-400" : toast.tone === "bad" ? "border-[#ff8a66]" : "border-[#7ff0e0]";
  const spot = under ? "md:absolute md:left-1/2 md:top-[7.5rem] md:-translate-x-1/2" : "absolute left-1/2 top-[13.5rem] md:top-[8.5rem] -translate-x-1/2";
  return <p className={spot + " max-w-2xl w-[92vw] border-2 px-4 md:px-6 py-3 md:py-4 text-center font-body text-base md:text-xl leading-snug text-white " + tone + " " + PANEL}>{toast.text}</p>;
}

// ─── finish card ───

/** A sign in a square of its own, clear of the border. The font rests every sign on the baseline, so a flat one
    (water, the mouth) would lie along the bottom: the drawn shape is measured and lifted to the middle. */
function GlyphBox({ sign, size = 24 }: { sign: string; /** font size in px; the box is a third bigger */ size?: number }) {
  const [dy, setDy] = useState(0);
  useEffect(() => {
    let live = true;
    const font = `${size}px ${GLYPH_FONT}`;
    document.fonts
      .load(font, sign)
      .then(() => {
        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx || !live) return;
        ctx.font = font;
        const m = ctx.measureText(sign);
        setDy((m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 - (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2);
      })
      .catch(() => null);
    return () => {
      live = false;
    };
  }, [sign, size]);
  return (
    <span className="grid shrink-0 place-items-center leading-none" style={{ fontFamily: GLYPH_FONT, fontSize: size, width: size * 1.34, height: size * 1.34 }} aria-hidden="true">
      <span style={{ transform: `translateY(${dy}px)` }}>{sign}</span>
    </span>
  );
}

/** The word as it stands on the gate, big and in the middle: royal names (and the learner's) inside a cartouche, then sign by sign with how each went. */
function PhraseCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const p = lesson.phrases[index];
  const stations = lesson.stations.map((s, i) => ({ s, i })).filter((x) => x.s.phrase === index);
  const cartouche = p.id === "name" || p.id === "khufu";
  // a sign answered at a station shows how that went, wherever it comes in the word; signs carved already have none
  const cells = p.sockets.map((sock) => {
    const st = stations.find((x) => x.s.target === sock.symbol);
    return { sock, miss: st ? lesson.mistakes[st.i] : null };
  });
  const glyphs = (
    <span className="text-5xl md:text-6xl text-gold-300 leading-none whitespace-nowrap" style={{ fontFamily: GLYPH_FONT }}>
      {p.sockets.map((s) => s.symbol).join("")}
      {p.det && <span className="text-gold-300/40">{p.det.symbol}</span>}
    </span>
  );
  return (
    <div className="border border-gold-600/50 bg-black/55 px-4 py-6 md:px-8 mb-4">
      <div className="flex justify-center mb-4">
        {cartouche ? (
          // a cartouche: a rope ring around the name, tied off with a bar at its end
          <div className="relative inline-flex items-center rounded-full border-[3px] border-gold-400 bg-[#1a1208] px-7 md:px-9 py-3 shadow-[0_0_28px_rgba(212,168,50,0.22)]">
            <span className="pointer-events-none absolute inset-[5px] rounded-full border border-gold-400/35" />
            {glyphs}
            <span className="absolute -right-[9px] top-1/2 h-[70%] w-[5px] -translate-y-1/2 rounded-sm bg-gold-400" />
          </div>
        ) : (
          glyphs
        )}
      </div>
      <p className="font-display text-3xl md:text-4xl text-white leading-tight">{p.say}</p>
      <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-400 mt-1 mb-5">
        {p.meaning}
        {p.say !== p.translit && <span className="normal-case tracking-normal text-sand-200"> · written <em>{p.translit}</em></span>}
      </p>
      <ul className="flex flex-wrap justify-center gap-2 mb-5">
        {cells.map(({ sock, miss }, k) => (
          <li
            key={k}
            className={
              "flex w-[5.5rem] flex-col items-center border px-1 pt-2 pb-1.5 " +
              (miss === null ? "border-sand-400/30 text-sand-200" : miss === 0 ? "border-gold-500/60 text-gold-300" : "border-[#ff8a66]/70 text-[#ffd9cc]")
            }
          >
            <GlyphBox sign={sock.symbol} size={34} />
            <span className="font-display text-xl leading-tight text-white">{sock.sound}</span>
            <span className="font-body text-[11px] leading-tight">{miss === null ? "carved for you" : miss === 0 ? "first try" : miss === 1 ? "1 wrong pick" : `${miss} wrong picks`}</span>
          </li>
        ))}
      </ul>
      <p className="font-body text-base text-sand-100 leading-relaxed mb-2 max-w-lg mx-auto">{p.why}</p>
      <p className="font-body text-sm text-sand-200 leading-relaxed max-w-lg mx-auto">{p.story}</p>
    </div>
  );
}

/** Level 1 is free; the rest of the game comes with the paid course. Says so plainly, and only a yes goes to the checkout. */
function LevelOffer({ next, onNo }: { next: number; onNo: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const place = LAYOUTS[LEVELS[next].layout];
  useEffect(() => {
    trackEvent("game_level_offer", { level: next + 1 });
  }, [next]);
  return (
    <div className="pointer-events-auto absolute inset-0 overflow-y-auto bg-black/70 backdrop-blur-[3px] select-text">
      <div className="min-h-full flex items-center justify-center p-4 pb-10">
        <div role="dialog" aria-modal="true" aria-labelledby="level-offer-title" className="card-ancient border-2 border-gold-500/70 bg-[#0c0906]/95 p-6 md:p-8 text-center w-full max-w-xl">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-300 mb-2">
            Level {next + 1} of {LEVELS.length} · {place.place.toLowerCase()} · paid members only
          </p>
          <h2 id="level-offer-title" className="font-display text-3xl md:text-4xl font-light text-white mb-4">
            Level {next + 1} is for paid members
          </h2>
          <p className="font-body text-lg text-sand-100 leading-relaxed mb-3">
            Level 1 is free. Levels 2 to {LEVELS.length} (the river, the workshop, the tomb, the market and on to the great wall) come with lifetime access, along with every written lesson: <Price className="text-white font-medium" />, paid once.
          </p>
          <p className="font-body text-lg text-white leading-relaxed mb-6">Go to the checkout now?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              disabled={leaving}
              onClick={() => {
                setLeaving(true);
                trackEvent("game_level_offer_yes", { level: next + 1 });
                hooks.onUpgrade?.();
              }}
              className="btn-primary py-3.5 px-8 text-sm justify-center disabled:opacity-60"
            >
              {leaving ? "Opening the checkout…" : "Yes, take me to the checkout"}
            </button>
            <button type="button" onClick={onNo} className="btn-secondary py-3.5 px-6 text-sm justify-center !text-gold-300">
              Not now
            </button>
          </div>
          <GuaranteeNote />
        </div>
      </div>
    </div>
  );
}

/** The places of levels 2 to 12, in order, each once: "the river, the scribe’s workshop … and the great wall". */
function placesAhead(): string {
  const places = [...new Set(LEVELS.slice(1).map((l) => LAYOUTS[l.layout].place.replace(/^The /, "the ")))];
  return places.length > 1 ? `${places.slice(0, -1).join(", ")} and ${places[places.length - 1]}` : places.join("");
}

function Lock() {
  return (
    <svg viewBox="0 0 12 14" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="1.5" y="6" width="9" height="7" rx="1" />
      <path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

/**
 * The whole game at a glance, for anyone who has not paid: level 1 free, levels 2 to 12 with lifetime access.
 * Until Sept 2026 nothing on the way through Lesson 1 said there was more, or what it cost.
 */
function LevelsAhead({ location, done }: { location: "title" | "finish"; /** level 1 has been won */ done: boolean }) {
  useEffect(() => {
    trackEvent("levels_ahead_view", { location });
  }, [location]);
  const unlock = (e: React.MouseEvent<HTMLButtonElement>) => {
    // (a focused button would take the next space bar, which is the jump)
    e.currentTarget.blur();
    trackEvent("levels_ahead_click", { location });
    hooks.onUpgrade?.();
  };
  return (
    <div className={"pointer-events-auto border border-gold-600/50 bg-black/60 text-left " + (location === "title" ? "p-3 md:p-4" : "p-4 md:p-5")}>
      <p className="font-body text-xs tracking-[0.25em] uppercase text-gold-300 mb-3">
        {done ? "What comes next" : "The whole journey"} · {LEVELS.length} levels
      </p>
      <ol className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-3">
        {LEVELS.map((l) => {
          const first = l.index === 0;
          return (
            <li
              key={l.index}
              title={`Level ${l.index + 1}: ${LAYOUTS[l.layout].place}, ${l.title}`}
              className={
                "flex h-11 flex-col items-center justify-center gap-1 border leading-none " +
                (first ? (done ? "border-gold-400 bg-gold-500/20 text-gold-300" : "border-[#7ff0e0] text-[#7ff0e0]") : "border-sand-500/40 bg-black/40 text-sand-300")
              }
            >
              <span className="font-display text-base">{l.index + 1}</span>
              {first ? <span className="font-body text-[9px] tracking-wider uppercase">{done ? "done" : "free"}</span> : <Lock />}
            </li>
          );
        })}
      </ol>
      {location === "title" ? (
        // (the start of the lesson is about the lesson: one line, and the way on is a link)
        <p className="font-body text-sm text-sand-100 leading-relaxed">
          Level 1 is free. Levels 2–{LEVELS.length} come with lifetime access, <Price className="text-white font-medium" /> once.{" "}
          <button type="button" onClick={unlock} className="underline underline-offset-4 text-gold-300 hover:text-white">
            See what&rsquo;s included
          </button>
        </p>
      ) : (
        <>
          <p className="font-body text-sm text-sand-100 leading-relaxed mb-3">
            Level 1 is free. Levels 2 to {LEVELS.length} go on through {placesAhead()}, teaching the rest of the alphabet as you go. They come with lifetime access, along with every written lesson and the certificate: <Price className="text-white font-medium" />, paid once.
          </p>
          <button type="button" onClick={unlock} className="btn-secondary py-2.5 px-5 text-sm justify-center !text-gold-300">
            Unlock levels 2–{LEVELS.length}
          </button>
        </>
      )}
    </div>
  );
}

function FinishCard() {
  const g = useGame();
  const lesson = g.lesson;
  // the learner asked for the next level without having paid: the offer stands in for the card until answered
  const [offering, setOffering] = useState(false);
  const guestDone = g.guest && !!lesson;
  useEffect(() => {
    if (guestDone) trackEvent("guest_level_complete", { level: 1 });
  }, [guestDone]);
  if (!lesson) return null;
  const last = g.playing >= LEVELS.length - 1;
  const clean = lesson.mistakes.filter((m) => m === 0).length;
  const reviews = lesson.reviewed.filter(Boolean).length;
  const place = LAYOUTS[lesson.spec.layout];
  const wrong = lesson.mistakes.reduce((a, b) => a + b, 0);
  if (offering && !last) return <LevelOffer next={g.playing + 1} onNo={() => setOffering(false)} />;
  const stats: [string, string][] =
    lesson.spec.layout === "causeway"
      ? [
          ["Time", clock(g.finishedAt - g.startedAt)],
          ["Ankhs", `${g.ankhs}/${g.ankhTotal}`],
          ["Scarabs", `${g.scarabs}/${g.scarabTotal}`],
          ["Swims", String(g.falls)],
        ]
      : [
          ["Time", clock(g.finishedAt - g.startedAt)],
          ["First try", `${clean}/${lesson.stations.length}`],
          ["Wrong picks", String(wrong)],
        ];
  return (
    <div className="pointer-events-auto absolute inset-0 overflow-y-auto bg-black/65 backdrop-blur-[3px] select-text">
     <div className="min-h-full flex items-center justify-center p-4 pb-10">
      <div className="card-ancient border-2 border-gold-500/70 bg-[#0c0906]/95 p-6 md:p-8 text-center w-full max-w-2xl">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-400 mb-1">
          Level {g.playing + 1} of {LEVELS.length} · {place.place.toLowerCase()} · {place.open.toLowerCase()}
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-4">{last ? "You can read the alphabet" : lesson.spec.kind === "name" ? (lesson.phrases[0]?.meaning === "your name" ? "That is your name" : "You read a king’s name") : "You read it"}</h2>
        {lesson.phrases.map((_, i) => (
          <PhraseCard key={i} lesson={lesson} index={i} />
        ))}
        <p className="font-body text-sm text-sand-100 mb-4">
          {clean} of {lesson.stations.length} answers right first time
          {reviews > 0 && `, ${lesson.reviewed.filter((r) => r === "right").length} of ${reviews} reviews`}
          {g.peeks > 0 && `, ${g.peeks} ${g.peeks === 1 ? "look" : "looks"} at the sign list`}
          {g.hints > 0 && `, ${g.hints} ${g.hints === 1 ? "hint" : "hints"} from Khety`}. You know {g.campaign.known.length} of the {ALL_SIGNS.length} signs.{" "}
          {lesson.fork === "read" ? "You read which way the writing ran first time." : lesson.fork === "fell" || lesson.fork === "recovered" ? "The direction of the writing caught you once: figures face the start of the line." : ""}
        </p>
        <div className={"grid gap-3 mb-6 " + (stats.length === 4 ? "grid-cols-4" : "grid-cols-3")}>
          {stats.map(([label, value]) => (
            <div key={label} className="border border-gold-700/40 py-2">
              <p className="font-display text-xl text-sand-100 tabular-nums">{value}</p>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-200">{label}</p>
            </div>
          ))}
        </div>
        {/* a guest has played level 1 without an account: this is where one is asked for, with their name on the gate */}
        {g.guest && (
          <p className="font-body text-base text-white leading-relaxed mb-5 max-w-lg mx-auto">
            Your name and the {g.campaign.known.length} signs you know are only on this device. A free account keeps them, and opens the written lesson with all {ALL_SIGNS.length} signs of the alphabet.
          </p>
        )}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center">
          {g.mode === "lesson" && g.guest ? (
            <>
              <button
                type="button"
                onClick={() => {
                  trackEvent("guest_signup_prompt", { location: "finish_card" });
                  hooks.onSignUp?.();
                }}
                className="btn-primary py-3.5 px-8 text-sm justify-center"
              >
                Save my progress · free account
              </button>
              <button type="button" onClick={() => hooks.onClassic?.()} className="btn-secondary py-3.5 px-6 text-sm justify-center !text-gold-300">
                Read the written lesson: all 25 signs
              </button>
              <button type="button" onClick={() => game.begin(g.playing)} className="btn-secondary py-3.5 px-6 text-sm justify-center !text-gold-300">
                Play again
              </button>
            </>
          ) : g.mode === "lesson" ? (
            <>
              {/* level 1 is the free one: the next level is offered to everyone, and those who have not paid are told so before the checkout */}
              {!last && (
                <button type="button" onClick={() => (g.paid ? game.begin(g.playing + 1) : setOffering(true))} className="btn-primary py-3.5 px-8 text-sm justify-center">
                  Play level {g.playing + 2}: {LAYOUTS[LEVELS[g.playing + 1].layout].place.toLowerCase()}
                </button>
              )}
              {/* the written lesson teaches all 25 signs and records the lesson as done */}
              <button type="button" onClick={() => hooks.onClassic?.()} className="btn-secondary py-3.5 px-6 text-sm justify-center !text-gold-300">
                Read the full lesson: all 25 signs
              </button>
              <button type="button" onClick={() => game.begin(g.playing)} className="btn-secondary py-3.5 px-6 text-sm justify-center !text-gold-300">
                Play again
              </button>
              <Link href="/dashboard" className="btn-secondary py-3.5 px-6 text-sm justify-center !text-gold-300">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              {!last && (
                <button type="button" onClick={() => game.begin(g.playing + 1)} className="btn-primary py-3.5 px-8 text-sm justify-center">
                  Next level: {LAYOUTS[LEVELS[g.playing + 1].layout].place.toLowerCase()} · {LEVELS[g.playing + 1].title}
                </button>
              )}
              <button type="button" onClick={() => game.begin(g.playing)} className="btn-secondary py-3.5 px-6 text-sm justify-center !text-gold-300">
                Play this level again
              </button>
              <button type="button" onClick={() => game.toTitle()} className="btn-secondary py-3.5 px-6 text-sm justify-center !text-gold-300">
                All levels
              </button>
            </>
          )}
        </div>
        {/* Lesson 1 was the free level: what the rest of the game is, and what it costs */}
        {g.mode === "lesson" && g.paid !== true && !last && (
          <div className="mt-6">
            <LevelsAhead location="finish" done />
          </div>
        )}
      </div>
     </div>
    </div>
  );
}

// ─── title and briefing ───

function Title() {
  const g = useGame();
  const c = g.campaign;
  const lessonMode = g.mode === "lesson";
  // the box starts with the name already carved, or the account name the page passed in, until the learner types
  const [typed, setTyped] = useState<string | null>(null);
  const name = typed ?? (c.name || g.suggestedName);
  const setName = setTyped;
  const fresh = c.level === 0 && !c.name;
  const finished = c.level >= LEVELS.length;
  const next = Math.min(c.level, LEVELS.length - 1);
  const go = (level: number) => g.ready && game.begin(level);
  return (
    // (the whole wash takes the pointer, not just the cards: the wheel scrolls it from anywhere, and its text can be selected)
    <div className={"pointer-events-auto select-text absolute inset-0 flex flex-col lg:flex-row items-start justify-start lg:justify-between gap-8 p-6 pt-16 md:p-14 md:pt-16 overflow-y-auto " + (lessonMode ? "bg-black/60 lg:bg-[linear-gradient(to_right,rgba(0,0,0,0.65),rgba(0,0,0,0.4)_30%,rgba(0,0,0,0.15)_52%,rgba(0,0,0,0.3)_75%,rgba(0,0,0,0.45))] lg:[text-shadow:0_1px_10px_rgba(0,0,0,0.85)]" : "bg-gradient-to-r from-black/90 via-black/55 to-transparent")}>
      {/* (auto margins, not centring: on a short screen the top stays reachable, below the links at the top left) */}
      <div className="pointer-events-auto w-full max-w-lg min-w-0 mt-auto md:my-auto">
        <p className="font-body text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gold-300 mb-3">{lessonMode ? "Lesson 1 · The Expedition Begins · as a game" : "Lesson 1, as a game · prototype"}</p>
        <h1 className="font-display text-4xl md:text-6xl font-light text-sand-100 leading-[1.05] mb-4">
          The Causeway <span className="text-gradient-gold font-medium [text-shadow:none]">of Thoth</span>
        </h1>
        <p className="font-body text-base md:text-lg text-white leading-relaxed mb-6">
          {lessonMode
            ? "Cross the causeway to the temple gate and carve your own name on it, one sign at a time. Every hieroglyph you place is a sound, and by the gate you will read your name back the way a scribe would have."
            : "Learn the 25 signs of the hieroglyphic alphabet from nothing. Each level teaches a few signs and spells real Egyptian words with them: across the causeway, down the river, through a tomb, up a wall. The first word is your own name."}
        </p>

        {fresh || (lessonMode && !g.paid) ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              game.campaign({ name: name.trim().slice(0, 24) });
              go(0);
            }}
            className="mb-5"
          >
            <label htmlFor="causeway-name" className="block font-body text-sm text-sand-100 mb-2">
              Your first name, to carve on the gate
            </label>
            <div className="flex gap-3">
              <input
                id="causeway-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                autoComplete="given-name"
                className="flex-1 min-w-0 border-2 border-gold-600/70 bg-black/70 px-4 py-3 font-body text-lg text-white placeholder:text-sand-400 focus:border-gold-400 focus:outline-none"
                placeholder="e.g. Amira"
              />
              <button type="submit" disabled={!g.ready} className="causeway-btn">
                <span className="causeway-btn-sign" aria-hidden="true">&#x1315D;</span>
                {g.ready ? (lessonMode && !fresh ? "Play" : "Begin") : "Loading…"}
              </button>
            </div>
            <p className="font-body text-sm text-sand-200 mt-2">Leave it empty and the gate carries Khufu, builder of the Great Pyramid.</p>
          </form>
        ) : null}
        {lessonMode && g.paid === false ? (
          <div className="mb-5">
            <LevelsAhead location="title" done={c.level >= 1} />
          </div>
        ) : null}
        {fresh || (lessonMode && !g.paid) ? null : (
          <div className="mb-5">
            <button type="button" disabled={!g.ready} onClick={() => go(next)} className="btn-primary py-4 px-8 text-sm disabled:opacity-50 mb-4">
              {!g.ready ? "Raising the causeway…" : finished ? "Play the last level again" : `Continue · level ${next + 1}, ${LAYOUTS[LEVELS[next].layout].place.toLowerCase()}: ${LEVELS[next].title}`}
            </button>
            <p className="font-body text-sm text-sand-100 mb-2">
              {c.known.length} of {ALL_SIGNS.length} signs learned{c.name ? `, ${c.name}` : ""}. {DEV_UNLOCKED ? "Every level is open while developing:" : "Replay any level you have opened:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => {
                const open = DEV_UNLOCKED || l.index <= c.level;
                return (
                  <button
                    key={l.index}
                    type="button"
                    disabled={!open || !g.ready}
                    onClick={() => go(l.index)}
                    title={`${LAYOUTS[l.layout].place}: ${l.title}`}
                    className={"h-10 w-10 border-2 font-display text-lg " + (open ? "border-gold-500/70 text-gold-300 hover:bg-gold-500/20 " + (l.index < c.level ? "bg-gold-500/10" : "") : "border-sand-600/40 text-sand-500")}
                  >
                    {l.index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <label className="flex items-start gap-3 font-body text-sm text-sand-100 mb-3 cursor-pointer">
          <input type="checkbox" checked={c.gentle} onChange={(e) => game.campaign({ gentle: e.target.checked })} className="mt-1 h-4 w-4 accent-[#d4a832]" />
          <span>
            <strong className="text-white">Gentle mode.</strong> A fall puts you back where you last stood everywhere (on the causeway it always does), the river runs slower, and the passage never catches you. For anyone who is here for the hieroglyphs, not the reflexes.
          </span>
        </label>
        <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 [@media(pointer:coarse)]:hidden">
          <VoicePicker />
          <KhetyVoice />
        </div>
        {g.guest && <p className="font-body text-sm text-sand-200">Free to play, no account needed. Your progress stays on this device.</p>}
        <p className="font-body text-sm text-sand-200">
          {/* (in the lesson the written way has a card of its own, beside this one) */}
          {!lessonMode && (
            <>
              Prefer to read?{" "}
              <Link href="/lessons/expedition-begins?mode=classic" className="underline underline-offset-4 text-gold-300 hover:text-gold-300">
                Take the classic Lesson 1
              </Link>
            </>
          )}
          {!fresh && (
            <>
              {!lessonMode && " · "}
              <button type="button" onClick={() => game.resetCampaign()} className="underline underline-offset-4 hover:text-white">
                Start over
              </button>
            </>
          )}
        </p>
      </div>

      {/* the other way through Lesson 1, offered as plainly as the game: the written lesson, built on words */}
      {lessonMode && (
        <aside className="pointer-events-auto w-full max-w-lg min-w-0 shrink-0 mb-12 lg:my-auto">
          <p className="font-body text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gold-300 mb-3">Lesson 1 · The Expedition Begins · in words</p>
          <h2 className="font-display text-4xl md:text-6xl font-light text-sand-100 leading-[1.05] mb-4">
            The Scribe&rsquo;s <span className="text-gradient-gold font-medium [text-shadow:none]">Lesson</span>
          </h2>
          <p className="font-body text-base md:text-lg text-white leading-relaxed mb-6">
            Not here for the running and jumping? Take the same lesson as reading instead. Your name comes first, then real Egyptian words, one small set at a time, until you know all 25 signs of the alphabet.
          </p>
          <button type="button" onClick={() => hooks.onClassic?.()} className="causeway-btn causeway-btn-lapis mb-3">
            <span className="causeway-btn-sign" aria-hidden="true">&#x133DE;</span>
            Take the word lesson
          </button>
          <p className="font-body text-sm text-sand-200">No reflexes needed. Read, tap and answer at your own pace.</p>
        </aside>
      )}
    </div>
  );
}

function Briefing({ lesson, level }: { lesson: Lesson; level: number }) {
  const lessonMode = useGame().mode === "lesson";
  const sounds = lesson.stations.filter((st) => st.teach).map((st) => st.sound);
  const place = LAYOUTS[lesson.spec.layout];
  return (
    <div className="pointer-events-auto absolute inset-0 overflow-y-auto bg-black/55 select-text">
     <div className="min-h-full flex items-center justify-center p-4 pb-10">
      <div className={"border-2 border-gold-500/70 p-6 md:p-9 max-w-2xl w-full text-left " + PANEL}>
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-300 mb-2">
          {lessonMode && level === 0 ? "Lesson 1" : `Level ${level + 1} of ${LEVELS.length}`} · {place.place} · Dr Halima Rashid, chief epigrapher
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-4">{lesson.spec.brief.title}</h2>
        {lesson.spec.brief.body.map((para, i) => (
          <p key={i} className="font-body text-lg text-sand-100 leading-relaxed mb-3">
            {para}
          </p>
        ))}
        <p className="font-body text-base text-[#7ff0e0] mb-6">
          {lesson.spec.kind === "final"
            ? "No new signs. Everything you need, you have."
            : sounds.length > 0
              ? `${sounds.length} new ${sounds.length === 1 ? "sign" : "signs"} this level, for the ${sounds.length === 1 ? "sound" : "sounds"} ${sounds.map((s) => `“${s}”`).join(", ")}. ${place.newSigns}`
              : "No new signs this level: every one is a sign you have met. Recall them."}
        </p>
        <button type="button" onClick={() => game.play()} className="btn-primary py-4 px-10 text-sm">
          {place.begin}
        </button>
        <span className="font-body text-sm text-sand-200 ml-4 [@media(hover:none)]:hidden">or press Enter</span>
      </div>
     </div>
    </div>
  );
}

export default function Hud() {
  const g = useGame();
  const layout = g.lesson?.spec.layout ?? "causeway";
  const place = LAYOUTS[layout];
  // the one thing about the word in hand that needs saying first (a sign already in place that is not in the alphabet)
  const note = g.lesson ? g.lesson.phrases[currentPhrase(g.lesson, g.lesson.progress)]?.note : undefined;
  const standing = g.hint ?? (g.lesson && g.lesson.progress < g.lesson.stations.length ? note : undefined);
  const paused = g.status === "paused";
  const live = g.status === "playing" || paused;
  const lessonMode = g.mode === "lesson";
  const causeway = layout === "causeway" && !!g.lesson;
  const way = useJourney(live && causeway);
  // "I'll keep trying" puts the carry offer away until as many falls again
  const [keepAt, setKeepAt] = useState(0);
  useEffect(() => {
    if (g.stuck === 0) setKeepAt(0);
  }, [g.stuck]);
  const offerCarry = causeway && g.status === "playing" && !g.teaching && g.stuck - keepAt >= CARRY_AFTER && !!nextLanding(playerPos.z);

  // Khety sees the learner off at the start of every run
  useEffect(() => {
    if (g.status !== "playing" || g.mascot || performance.now() - g.startedAt > 1500) return;
    const line = startLine(layout);
    game.mascot("point", line);
    khety(line);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.run, g.status]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = game.get();
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "KeyH" && s.status === "playing") hearNext();
      if (e.code === "KeyG") return s.status === "paused" ? game.resume() : game.pause();
      if (e.code === "Escape" && s.status === "paused") return game.resume();
      if (e.code !== "Enter") return;
      if (s.status === "playing" && s.teaching) {
        e.preventDefault();
        dismissTeach();
      } else if (s.status === "brief") {
        e.preventDefault();
        game.play();
      } else if (s.status === "won" && s.paid && s.playing < LEVELS.length - 1) {
        e.preventDefault();
        game.begin(s.playing + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* (above the title’s dark wash, which otherwise lies over these and all but hides them) */}
      <div className={"absolute left-3 sm:left-4 top-4 flex flex-col items-start gap-2 " + (g.status === "title" || g.status === "playing" ? "z-10" : "")}>
        <div className="flex items-center gap-2 sm:gap-3">
          {lessonMode ? (
            <Link href={g.guest ? "/" : "/dashboard"} className={TOP_LINK}>
              {g.guest ? "Home" : "Dashboard"}
            </Link>
          ) : (
            <>
              <span className={"max-sm:hidden border border-gold-500/60 px-2.5 py-1 font-body text-xs tracking-[0.2em] uppercase text-gold-300 " + PANEL}>Prototype · dev only</span>
              <Link href="/" className={"pointer-events-auto font-body text-sm text-sand-100 underline underline-offset-4 hover:text-gold-300 px-2 py-0.5 " + PANEL}>
                Back to the site
              </Link>
            </>
          )}
          {/* (the title offers the written lesson itself, on its right-hand side) */}
          {lessonMode && g.status !== "title" && (
            <button type="button" onClick={() => hooks.onClassic?.()} className={TOP_LINK}>
              Written lesson<span className="max-sm:hidden"> instead</span>
            </button>
          )}
        </div>
        {live && (
          <>
            <button type="button" onClick={() => game.toTitle()} className={"pointer-events-auto border border-gold-700/50 px-2.5 py-1 font-body text-sm text-sand-100 hover:text-gold-300 " + PANEL}>
              {lessonMode && g.playing === 0 ? <>Lesson 1 · {Math.round(way.best * 100)}% to the gate<span className="max-sm:hidden"> · {g.campaign.known.length}/{ALL_SIGNS.length} signs</span></> :`Level ${g.playing + 1} of ${LEVELS.length} · ${g.campaign.known.length}/${ALL_SIGNS.length} signs · all levels`}
            </button>
          </>
        )}
      </div>

      {live && (
        <>
          <div className="absolute right-3 sm:right-4 top-4 flex items-stretch gap-3">
          {/* forgotten a sign? the whole list, one click, with the run standing still behind it: a proper game control, not a dev label */}
          <button type="button" onClick={() => (paused ? game.resume() : game.pause())} aria-pressed={paused} className="btn-primary pointer-events-auto py-2 px-4 text-sm max-sm:!py-1.5 max-sm:!px-3 max-sm:!text-xs shadow-lg shadow-black/50">
            <span className="max-sm:hidden text-2xl leading-none" style={{ fontFamily: GLYPH_FONT }} aria-hidden="true">
              𓏞
            </span>
            <span>Sign<span className="max-sm:hidden"> list</span><span className="sm:hidden">s</span></span> <span className="opacity-70 [@media(hover:none)]:hidden">(G)</span>
          </button>
          <div className={"hidden md:flex items-center gap-5 border-2 border-gold-500/70 px-5 py-2.5 " + PANEL}>
            {layout === "causeway" && (
            <>
            <p className="flex items-center gap-2 font-display text-xl text-sand-100 tabular-nums">
              <span className="text-gold-400 text-2xl leading-none" style={{ fontFamily: GLYPH_FONT }} aria-hidden="true">
                𓋹
              </span>
              {g.ankhs}
              <span className="text-base text-sand-200">/ {g.ankhTotal}</span>
            </p>
            <p className="flex items-center gap-2 font-display text-xl text-sand-100 tabular-nums">
              <span className="text-[#7ff0e0] text-2xl leading-none" style={{ fontFamily: GLYPH_FONT }} aria-hidden="true">
                𓆣
              </span>
              {g.scarabs}
              <span className="text-base text-sand-200">/ {g.scarabTotal}</span>
            </p>
            </>
            )}
            <p className="font-body text-base text-sand-100 tabular-nums w-16 text-right">
              <Timer from={g.startedAt} frozenAt={paused ? g.pausedAt : null} />
            </p>
          </div>
          </div>
          {g.lesson ? (
            <WordBar
              lesson={g.lesson}
              toast={g.toast}
              aside={!!g.teaching}
              standing={g.teaching ? null : standing}
              track={causeway ? <JourneyTrack key={g.run} lesson={g.lesson} here={way.here} best={way.best} /> : null}
            />
          ) : (
            g.toast && <ToastLine toast={g.toast} />
          )}
          {g.teaching ? (
            <TeachCard symbol={g.teaching} />
          ) : offerCarry ? (
            <CarryOffer onKeep={() => setKeepAt(g.stuck)} />
          ) : (
            standing && <p className={(g.lesson ? "[@media(pointer:coarse)_and_(orientation:portrait)]:hidden " : "") + "absolute left-1/2 -translate-x-1/2 max-w-2xl w-[92vw] " + CARD_SPOT + " border-2 border-[#7ff0e0] px-4 md:px-6 py-3 md:py-4 text-center font-body text-base md:text-lg text-white leading-snug " + PANEL}>{standing}</p>
          )}
          <p className={"absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap border border-gold-700/50 px-4 py-1.5 font-body text-xs tracking-[0.12em] uppercase text-sand-100 hidden lg:block " + PANEL}>
            {place.controls}
          </p>
          {place.touch !== "none" && !paused && <TouchControls jump={place.touch === "stick+jump"} />}
          <KhetyCorner
            says={g.mascot}
            canAsk={g.status === "playing"}
            onHear={g.lesson?.stations[g.lesson.progress]?.kind === "sign" && layout !== "brush" ? hearNext : null}
            onSigns={() => game.pause()}
          />
          {paused && <SignList />}
        </>
      )}

      {g.status === "title" && <Title />}
      {g.status === "brief" && g.lesson && <Briefing lesson={g.lesson} level={g.playing} />}
      {g.status === "won" && <FinishCard />}

      <button
        type="button"
        onClick={() => game.set({ muted: !g.muted })}
        className={"[@media(pointer:coarse)]:hidden pointer-events-auto absolute bottom-4 right-4 border border-gold-600/60 px-3 py-1.5 font-body text-xs tracking-[0.2em] uppercase text-sand-100 hover:text-gold-300 " + "max-md:bottom-auto max-md:right-3 max-md:py-1 " + (live ? "max-md:top-[3.75rem] " : g.status === "brief" ? "max-md:hidden " : "max-md:top-4 ") + PANEL}
      >
        Sound {g.muted ? "off" : "on"}
      </button>
    </div>
  );
}
