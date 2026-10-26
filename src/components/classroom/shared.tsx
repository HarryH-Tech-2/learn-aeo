"use client";

/**
 * Classroom mode: what the projector (/teachers/class) and the pupils' phones (/play/<code>) share.
 * The motion classes (cq-*) are in globals.css and all stand still under prefers-reduced-motion.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RoomView } from "@/lib/classroom-server";

export const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif" } as const;
export const SHAPES = ["▲", "◆", "●", "■"];
/** terracotta, turquoise, lapis, gold: each sets the colours that .cq-answer (globals.css) builds its tile from */
export const COLOURS = ["cq-opt-0", "cq-opt-1", "cq-opt-2", "cq-opt-3"];

export const KIND_LABEL: Record<string, string> = { cartouche: "Royal names", animal: "Animal signs", sound: "Spot the sound", name: "Name the sign" };

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th"}`;
}

/** Each team gets a sign of its own, the same on the projector and on its phone: owl, scarab, vulture, viper, lion, quail chick, ibis, bee, falcon, cobra, fish, hare. */
export const TEAM_GLYPHS = ["𓅓", "𓆣", "𓄿", "𓆑", "𓃭", "𓅱", "𓅞", "𓆤", "𓅃", "𓆗", "𓆛", "𓃹"];
export function teamGlyph(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TEAM_GLYPHS[h % TEAM_GLYPHS.length];
}

/**
 * The clock, counted down here between polls so it runs smoothly (the server's figures only arrive
 * every 1.5 s). `lead` is the "get ready" count before the question opens, `ms` the time left to
 * answer. A poll only moves the clock when it disagrees by more than network jitter, or when a new
 * question opens.
 */
export function useSmoothClock(view: RoomView | null): { ms: number; lead: number } {
  const [left, setLeft] = useState(0);
  const deadline = useRef<{ q: number; at: number } | null>(null);
  const running = view?.phase === "question";
  const q = view?.questionIndex ?? -1;
  const serverLeft = (view?.msLeft ?? 0) + (view?.leadMs ?? 0);
  const serverNow = view?.serverNow ?? 0;
  const questionMs = view?.questionMs ?? 0;

  useEffect(() => {
    if (!running) {
      deadline.current = null;
      setLeft(0);
      return;
    }
    const at = performance.now() + serverLeft;
    const d = deadline.current;
    if (!d || d.q !== q || Math.abs(d.at - at) > 600) deadline.current = { q, at };
    const tick = () => setLeft(Math.max(0, (deadline.current?.at ?? 0) - performance.now()));
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [running, q, serverLeft, serverNow]);

  return { ms: Math.min(left, questionMs), lead: Math.max(0, left - questionMs) };
}

/** A number that runs up (or down) to its new value. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = value;
      setShown(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 900);
      const v = Math.round(start + (value - start) * (1 - Math.pow(1 - p, 3)));
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={className}>{shown}</span>;
}

/** Rows (children with data-id) slide to their new place when the order changes. */
export function useFlip<T extends HTMLElement>(order: string) {
  const ref = useRef<T>(null);
  const tops = useRef(new Map<string, number>());

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    for (const row of Array.from(el.children) as HTMLElement[]) {
      const id = row.dataset.id;
      if (!id) continue;
      const top = row.offsetTop;
      next.set(id, top);
      const old = tops.current.get(id);
      if (old !== undefined && old !== top && !still && typeof row.animate === "function") {
        row.animate([{ transform: `translateY(${old - top}px)` }, { transform: "none" }], { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
      }
    }
    tops.current = next;
  }, [order]);

  return ref;
}

/** The round clock: a ring that empties, red and pulsing for the last five seconds. */
export function TimerRing({ ms, total, done, size = 96 }: { ms: number; total: number; done?: boolean; size?: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, ms / total)) : 0;
  const secs = Math.ceil(ms / 1000);
  const urgent = !done && secs <= 5;
  return (
    <span className={`relative inline-grid place-items-center shrink-0 ${urgent ? "cq-urgent" : ""}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="7" className="stroke-gold-700/20" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={done ? 0 : c * (1 - frac)}
          className={done ? "stroke-turquoise" : urgent ? "stroke-terracotta" : "stroke-gold-400"}
          style={{ transition: "stroke-dashoffset 0.12s linear" }}
        />
      </svg>
      <span className={`font-display tabular-nums leading-none ${urgent ? "text-terracotta" : "text-sand-100"}`} style={{ fontSize: size * 0.4 }}>
        {done ? "✓" : secs}
      </span>
    </span>
  );
}

export function Confetti({ count = 80 }: { count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {pieces.map((i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            background: ["#d4a832", "#c25a3a", "#2a8a7a", "#2f4f8a", "#f5d890"][i % 5],
            animationDelay: `${(i % 10) * 0.15}s`,
            animationDuration: `${3 + (i % 5) * 0.5}s`,
            transform: `rotate(${(i * 53) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * The quiz's backdrop, behind everything: two slow glows, a field of signs drifting upwards, and a
 * red edge that beats while `danger` (the last five seconds of a question).
 */
const BACKDROP_GLYPHS = ["𓂀", "𓋹", "𓅓", "𓆣", "𓇋", "𓃭", "𓆑", "𓊹", "𓇳", "𓅱", "𓏏", "𓈖", "𓆓", "𓎡"];
export function Backdrop({ danger = false, sparse = false }: { danger?: boolean; sparse?: boolean }) {
  const glyphs = useMemo(() => {
    const n = sparse ? 7 : 14;
    return Array.from({ length: n }, (_, i) => ({
      glyph: BACKDROP_GLYPHS[i % BACKDROP_GLYPHS.length],
      left: `${(i * 61 + 7) % 100}%`,
      size: 1.6 + ((i * 7) % 5) * 0.7,
      duration: 18 + ((i * 5) % 9) * 2.5,
      delay: -((i * 37) % 23),
    }));
  }, [sparse]);
  return (
    <div className="cq-backdrop pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <span className="cq-glow cq-glow-a" />
      <span className="cq-glow cq-glow-b" />
      <div className="absolute inset-0 text-gold-400" style={GLYPH}>
        {glyphs.map((g, i) => (
          <span key={i} className="cq-drift absolute bottom-0" style={{ left: g.left, fontSize: `${g.size}rem`, animationDuration: `${g.duration}s`, animationDelay: `${g.delay}s` }}>
            {g.glyph}
          </span>
        ))}
      </div>
      <span className={`cq-danger absolute inset-0 ${danger ? "is-on" : ""}`} />
    </div>
  );
}

/** "Get ready": the question's number and kind, and a 3-2-1 that lands as the question opens. */
export function GetReady({ lead, index, total, kind, small = false }: { lead: number; index: number; total: number; kind?: string; small?: boolean }) {
  const n = Math.max(1, Math.min(3, Math.ceil(lead / 1000)));
  return (
    <div className="text-center" role="status" aria-label={`Question ${index + 1} of ${total}, get ready`}>
      <p className="cq-rise font-body text-xs sm:text-sm tracking-[0.35em] uppercase text-gold-500">
        Question {index + 1} of {total}
      </p>
      <p className={`cq-rise font-display text-sand-100 mt-2 ${small ? "text-3xl" : "text-5xl sm:text-6xl"}`} style={{ animationDelay: "0.1s" }}>
        {(kind && KIND_LABEL[kind]) || "Get ready"}
      </p>
      <p key={n} className={`cq-count font-display font-medium text-gradient-gold leading-none ${small ? "text-[7rem] mt-6" : "text-[11rem] sm:text-[14rem] mt-4"}`} aria-hidden="true">
        {n}
      </p>
    </div>
  );
}

// ─── sound ───

const SOUND_KEY = "lh_class_sound";
/** D Phrygian dominant, the scale that sounds "Egyptian" to a classroom: D E♭ F♯ G A B♭ C D */
const SCALE = [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 261.63, 293.66];
const MELODY = [0, 2, 1, 0, 4, 2, 1, 2, 0, 4, 5, 4, 2, 1, 2, 0];

/**
 * The projector's sounds, all made here with the Web Audio API (no audio files): a blip when a team
 * joins, the 3-2-1, a little tune while the class thinks (quicker for the last five seconds), a
 * chord at the reveal, a drum roll and a fanfare at the podium. Browsers only allow sound after a
 * click, so the context is made on the first pointer press.
 */
export class QuizSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private loop: number | null = null;
  private step = 0;
  muted = false;

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.03);
  }

  private tone(freq: number, at: number, dur: number, type: OscillatorType = "triangle", gain = 0.25) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private noise(at: number, dur: number, gain = 0.2) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + at;
    const buffer = this.ctx.createBuffer(1, Math.ceil(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(g).connect(this.master);
    src.start(t);
  }

  join() {
    this.tone(587.33, 0, 0.12, "sine", 0.2);
    this.tone(880, 0.08, 0.18, "sine", 0.2);
  }
  /** 3, 2, 1: the same note, then a higher one as the question opens */
  count(last = false) {
    this.tone(last ? 880 : 440, 0, last ? 0.5 : 0.18, "square", 0.12);
  }
  tick() {
    this.tone(1200, 0, 0.05, "square", 0.08);
  }
  reveal() {
    [293.66, 369.99, 440, 587.33].forEach((f, i) => this.tone(f, i * 0.07, 0.9, "triangle", 0.18));
  }
  /** a roll that quickens over `seconds`, for the wait before each podium step */
  drumRoll(seconds: number) {
    let t = 0;
    let gap = 0.11;
    while (t < seconds) {
      this.noise(t, 0.07, 0.1 + 0.12 * (t / seconds));
      t += gap;
      gap = Math.max(0.035, gap * 0.97);
    }
  }
  step3() {
    this.tone(196, 0, 0.5, "triangle", 0.22);
    this.noise(0, 0.25, 0.25);
  }
  fanfare() {
    [293.66, 369.99, 440, 587.33, 440, 587.33, 739.99].forEach((f, i) => this.tone(f, i * 0.13, 0.35, "sawtooth", 0.1));
    [293.66, 369.99, 440, 587.33, 880].forEach((f) => this.tone(f, 0.95, 1.8, "triangle", 0.14));
    this.noise(0.95, 0.5, 0.2);
  }

  /** the thinking tune; `fast` for the last five seconds */
  music(on: boolean, fast = false) {
    if (this.loop !== null) {
      window.clearInterval(this.loop);
      this.loop = null;
    }
    if (!on) return;
    const beat = fast ? 170 : 260;
    this.loop = window.setInterval(() => {
      const i = this.step++ % MELODY.length;
      if (i % 4 === 0) this.tone(SCALE[0] / 2, 0, 0.3, "sine", 0.3);
      if (i % 4 === 2) this.tone(SCALE[4] / 2, 0, 0.2, "sine", 0.2);
      this.tone(SCALE[MELODY[i]] * 2, 0, 0.16, "triangle", fast ? 0.14 : 0.1);
      if (i % 2 === 1) this.noise(0, 0.03, 0.05);
    }, beat);
  }

  stop() {
    this.music(false);
  }
}

/** One QuizSound for the page, unlocked by the first press, with a mute switch remembered on this device. */
export function useQuizSound(): { sound: QuizSound; muted: boolean; toggle: () => void } {
  const sound = useMemo(() => new QuizSound(), []);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let saved = false;
    try {
      saved = window.localStorage.getItem(SOUND_KEY) === "off";
    } catch {}
    sound.setMuted(saved);
    setMuted(saved);
    const unlock = () => sound.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      sound.stop();
    };
  }, [sound]);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
    try {
      window.localStorage.setItem(SOUND_KEY, next ? "off" : "on");
    } catch {}
  };

  return { sound, muted, toggle };
}

/** A short buzz on phones that have one. */
export function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}
