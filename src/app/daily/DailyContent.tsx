"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import {
  DAILY_CARTOUCHES,
  DAILY_LESSON_ID,
  EMPTY_STATS,
  MAX_ATTEMPTS,
  buildShareText,
  buildTileBank,
  cartoucheForPuzzle,
  currentStreak,
  dateForPuzzle,
  isSolved,
  msUntilNextPuzzle,
  puzzleNumberFor,
  recordResult,
  scoreGuess,
  xpForDaily,
  type DailyCartouche,
  type DailyStats,
  type SlotResult,
} from "@/lib/daily";
import { saveArchivePlay, type PuzzlePlay } from "./archive-store";

const STORAGE_KEY = "lh_daily";

type Today = PuzzlePlay;

type Saved = { stats: DailyStats; today: Today | null };

function load(): Saved {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stats: EMPTY_STATS, today: null };
    const parsed = JSON.parse(raw) as Partial<Saved>;
    const stats = { ...EMPTY_STATS, ...(parsed.stats ?? {}) };
    if (!Array.isArray(stats.distribution) || stats.distribution.length !== MAX_ATTEMPTS) stats.distribution = [...EMPTY_STATS.distribution];
    return { stats, today: parsed.today ?? null };
  } catch {
    return { stats: EMPTY_STATS, today: null };
  }
}

function save(data: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function freshToday(n: number): Today {
  return { n, guesses: [], rows: [], hints: 0, done: false, won: false, revealed: {} };
}

const MARK: Record<SlotResult, string> = { correct: "✓", present: "~", absent: "✕" };
const MARK_LABEL: Record<SlotResult, string> = { correct: "right", present: "elsewhere in the name", absent: "not in this name" };

export default function DailyContent({ children }: { children?: React.ReactNode }) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();

  // Everything date-dependent is computed on the client after mount so the
  // server render (cached, indexable) never disagrees with the visitor's clock.
  const [n, setN] = useState<number | null>(null);
  // Playing a past day from the archive (/daily?n=12): a practice round, outside the streak and XP
  const [archive, setArchive] = useState(false);
  const [stats, setStats] = useState<DailyStats>(EMPTY_STATS);
  const [today, setToday] = useState<Today | null>(null);
  const [current, setCurrent] = useState<(string | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [xp, setXp] = useState<{ amount: number; status: "idle" | "saving" | "saved" | "guest" | "error" }>({ amount: 0, status: "idle" });
  const startedRef = useRef(false);

  const cartouche: DailyCartouche | null = useMemo(() => (n === null ? null : cartoucheForPuzzle(n)), [n]);
  const bank = useMemo(() => (cartouche && n !== null ? buildTileBank(cartouche, n) : []), [cartouche, n]);

  useEffect(() => {
    const now = new Date();
    const todayNum = puzzleNumberFor(now);
    const asked = Number(new URLSearchParams(window.location.search).get("n"));
    const past = Number.isInteger(asked) && asked >= 1 && asked < todayNum;
    const num = past ? asked : todayNum;
    const saved = load();
    // a past day replays from the start each visit; its result is kept for the archive list
    const t = past ? freshToday(num) : saved.today && saved.today.n === num ? saved.today : freshToday(num);
    setArchive(past);
    setN(num);
    setStats(saved.stats);
    setToday(t);
    const c = cartoucheForPuzzle(num);
    setCurrent(c.signs.map((_, i) => t.revealed[i] ?? null));
  }, []);

  // Countdown to the next puzzle
  useEffect(() => {
    if (!today?.done) return;
    const tick = () => {
      const ms = msUntilNextPuzzle(new Date());
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const s = Math.floor((ms % 60_000) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [today?.done]);

  const persist = useCallback(
    (s: DailyStats, t: Today) => {
      setToday(t);
      if (t.done) saveArchivePlay(t);
      if (archive) return;
      setStats(s);
      save({ stats: s, today: t });
    },
    [archive]
  );

  const locked = useMemo(() => {
    // slots fixed by a previous correct row or a hint
    if (!cartouche || !today) return new Set<number>();
    const set = new Set<number>(Object.keys(today.revealed).map(Number));
    today.rows.forEach((row) => row.forEach((r, i) => r === "correct" && set.add(i)));
    return set;
  }, [cartouche, today]);

  const lockedValues = useMemo(() => {
    const out: Record<number, string> = {};
    if (!cartouche) return out;
    locked.forEach((i) => (out[i] = cartouche.signs[i].value));
    return out;
  }, [cartouche, locked]);

  const filled: (string | null)[] = current.map((v, i) => lockedValues[i] ?? v);
  const complete = cartouche ? filled.every((v) => v !== null) : false;

  function noteStart() {
    if (startedRef.current || !cartouche) return;
    startedRef.current = true;
    trackEvent("game_start", { game: "daily", puzzle: n, cartouche: cartouche.id });
  }

  function placeValue(value: string) {
    if (!cartouche || today?.done) return;
    noteStart();
    const next = [...filled];
    const target = selected !== null && !locked.has(selected) ? selected : next.findIndex((v, i) => v === null && !locked.has(i));
    if (target === -1) return;
    next[target] = value;
    setCurrent(next.map((v, i) => (locked.has(i) ? null : v)));
    // advance the selection to the next empty slot
    const after = next.findIndex((v, i) => v === null && !locked.has(i) && i > target);
    setSelected(after === -1 ? next.findIndex((v, i) => v === null && !locked.has(i)) : after);
  }

  function clearSlot(i: number) {
    if (locked.has(i) || today?.done) return;
    const next: (string | null)[] = [...filled];
    next[i] = null;
    setCurrent(next.map((v, idx) => (locked.has(idx) ? null : v)));
    setSelected(i);
  }

  function clearAll() {
    setCurrent(current.map(() => null));
    setSelected(null);
  }

  function submit() {
    if (!cartouche || !today || !complete || today.done) return;
    const guess = filled as string[];
    const result = scoreGuess(guess, cartouche.signs);
    const rows = [...today.rows, result];
    const guesses = [...today.guesses, guess];
    const won = isSolved(result);
    const done = won || rows.length >= MAX_ATTEMPTS;
    trackExerciseAnswer({ exercise: "daily", questionType: "cartouche-values", question: cartouche.translit, correct: won });
    if (!won) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    }
    const t: Today = { ...today, rows, guesses, done, won };
    let s = stats;
    if (done && archive) {
      trackEvent("daily_archive_complete", { puzzle: today.n, won: won ? 1 : 0, attempts: rows.length, hints: today.hints });
    } else if (done) {
      s = recordResult(stats, today.n, won, rows.length);
      trackExerciseComplete({ exercise: "daily", score: won ? 1 : 0, total: 1, attempts: rows.length });
      trackEvent("daily_complete", { puzzle: today.n, won: won ? 1 : 0, attempts: rows.length, hints: today.hints, streak: s.streak });
      awardXp(xpForDaily(rows.length, won, today.hints));
    }
    persist(s, t);
    // correct answers are now locked (derived from rows); clear the rest
    setCurrent(current.map(() => null));
    setSelected(null);
  }

  function hint() {
    if (!cartouche || !today || today.done) return;
    noteStart();
    const candidates = cartouche.signs.map((_, i) => i).filter((i) => !locked.has(i));
    if (candidates.length === 0) return;
    const i = candidates[Math.floor(Math.random() * candidates.length)];
    const t: Today = { ...today, hints: today.hints + 1, revealed: { ...today.revealed, [i]: cartouche.signs[i].value } };
    trackEvent("hint_used", { game: "daily", question: cartouche.signs[i].glyph });
    persist(stats, t);
  }

  function awardXp(amount: number) {
    if (!session?.user) {
      setXp({ amount, status: "guest" });
      return;
    }
    setXp({ amount, status: "saving" });
    fetch("/api/progress/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: DAILY_LESSON_ID, xp: amount }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(() => setXp({ amount, status: "saved" }))
      .catch(() => setXp({ amount, status: "error" }));
  }

  async function share() {
    if (!today || n === null) return;
    const text = buildShareText({ puzzleNumber: n, rows: today.rows, won: today.won, hintsUsed: today.hints });
    trackEvent("daily_share", { puzzle: n, method: typeof navigator.share === "function" ? "native" : "clipboard" });
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const streakNow = n === null ? 0 : currentStreak(stats, n);
  const glyphSize = cartouche ? Math.max(1.4, Math.min(3.2, 22 / cartouche.signs.length)) : 2;

  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="text-center mb-6">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">
            {archive ? "From the archive" : "Free daily puzzle"}
            {n !== null && <> · #{n}</>}
            {archive && n !== null && <> · {dateForPuzzle(n).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" })}</>}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light">
            Cartouche of the <span className="text-gradient-gold font-medium">Day</span>
          </h1>
          <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            One real pharaoh’s name a day. Put the right sound under every sign and read the king in {MAX_ATTEMPTS} tries or fewer.
          </p>
          {archive && (
            <p className="font-body text-xs text-sand-500 mt-3">
              A practice round: it doesn’t change your streak.{" "}
              <Link href="/daily" className="text-gold-500 underline underline-offset-4">
                Play today’s cartouche
              </Link>
            </p>
          )}
        </div>

        {/* Streak strip */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6 font-body text-xs tracking-[0.2em] uppercase text-sand-500">
          <span>
            Streak <span className="text-gold-400 text-base align-middle">{streakNow}</span>
          </span>
          <span>
            Played <span className="text-sand-200 text-base align-middle">{stats.played}</span>
          </span>
          <span>
            Won <span className="text-sand-200 text-base align-middle">{stats.played ? Math.round((stats.won / stats.played) * 100) : 0}%</span>
          </span>
        </div>

        {!cartouche || !today ? (
          <div className="card-ancient p-10 text-center font-body text-sm text-sand-500 animate-pulse" aria-live="polite">
            Unrolling today’s cartouche…
          </div>
        ) : (
          <div className="card-ancient p-4 sm:p-6 md:p-8">
            {/* The cartouche */}
            <div className="flex justify-center">
              <div className="cartouche-ring inline-block max-w-full">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${cartouche.signs.length}, minmax(0, 1fr))` }}
                  aria-label={`Today's cartouche, ${cartouche.signs.length} signs`}
                >
                  {cartouche.signs.map((s, i) => (
                    <span
                      key={i}
                      className="glyph-cell"
                      style={{ fontSize: `${glyphSize}rem` }}
                      title={today.done ? s.name : undefined}
                      aria-hidden="true"
                    >
                      {s.glyph}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Slots */}
            <div
              className="grid gap-1 mt-4 max-w-full mx-auto"
              style={{ gridTemplateColumns: `repeat(${cartouche.signs.length}, minmax(0, 1fr))` }}
              role="group"
              aria-label="Your reading, one sound per sign"
            >
              {cartouche.signs.map((s, i) => {
                const isLocked = locked.has(i);
                const value = filled[i];
                const state = today.done ? (isLocked || value === s.value ? "correct" : "absent") : isLocked ? "correct" : undefined;
                return (
                  <button
                    key={i}
                    type="button"
                    className="daily-slot"
                    data-state={state}
                    data-selected={selected === i && !isLocked && !today.done}
                    data-shake={shake && !isLocked}
                    onClick={() => (value !== null && !isLocked ? clearSlot(i) : setSelected(i))}
                    disabled={today.done}
                    aria-label={`Sign ${i + 1}${value ? `, ${value}` : ", empty"}${isLocked ? ", solved" : ""}`}
                  >
                    {today.done ? s.value : value ?? "·"}
                  </button>
                );
              })}
            </div>

            {/* Previous rows */}
            {today.rows.length > 0 && (
              <ol className="mt-4 space-y-1" aria-label="Previous tries">
                {today.rows.map((row, r) => (
                  <li key={r} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cartouche.signs.length}, minmax(0, 1fr))` }}>
                    {row.map((res, i) => (
                      <span
                        key={i}
                        className="daily-slot !min-h-0 py-1 text-[11px]"
                        data-state={res}
                        title={`${today.guesses[r][i]}: ${MARK_LABEL[res]}`}
                        aria-label={`${today.guesses[r][i]}: ${MARK_LABEL[res]}`}
                      >
                        <span className="truncate">{today.guesses[r][i]}</span>
                        <span aria-hidden="true">{MARK[res]}</span>
                      </span>
                    ))}
                  </li>
                ))}
              </ol>
            )}

            {/* Tile bank + actions */}
            {!today.done ? (
              <>
                <p className="font-body text-[11px] tracking-[0.2em] uppercase text-sand-500 text-center mt-6 mb-3">
                  Tap a sound to place it · try {today.rows.length + 1} of {MAX_ATTEMPTS}
                </p>
                <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Sound tiles">
                  {bank.map((v) => (
                    <button key={v} type="button" className="daily-tile" onClick={() => placeValue(v)} aria-label={`Place ${v}`}>
                      {v}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <button type="button" onClick={submit} disabled={!complete} className="btn-primary py-3 px-8 text-sm justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                    Read it
                  </button>
                  <button type="button" onClick={hint} className="btn-secondary py-3 px-6 text-sm justify-center">
                    Reveal one sign
                  </button>
                  <button type="button" onClick={clearAll} className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4">
                    Clear row
                  </button>
                </div>
                <p className="font-body text-xs text-sand-600 text-center mt-4">
                  ✓ right place · ~ in the name, wrong place · ✕ not in this name. New to the signs?{" "}
                  <Link href="/hieroglyphic-alphabet" className="text-gold-500 underline underline-offset-4">
                    See the alphabet chart
                  </Link>
                  .
                </p>
              </>
            ) : (
              <Reveal cartouche={cartouche} today={today} stats={stats} xp={xp} countdown={countdown} copied={copied} archive={archive} onShare={share} onSignIn={() => openAuthModal({ next: "/daily" })} />
            )}
          </div>
        )}

        <p className="font-body text-sm text-sand-400 text-center mt-4">
          <Link href="/daily/archive" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
            {archive ? "Back to the archive" : "Missed a day? Play the past cartouches"}
          </Link>
        </p>

        {/* Explainer, always rendered for search */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <Link href="/daily/decipher" className="group card-ancient p-5 block hover:border-gold-500/40 transition-colors">
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">Campaign · free</p>
            <p className="font-display text-xl text-sand-100 group-hover:text-gold-300 transition-colors">Decipher: the Champollion mode</p>
            <p className="font-body text-sm text-sand-400 mt-1">Work out the sign values yourself from Ptolemy, Cleopatra and Ramesses, the way it was done in 1822.</p>
          </Link>
          <Link href="/lessons/expedition-begins" className="group card-ancient p-5 block hover:border-gold-500/40 transition-colors">
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">Lesson 1 · free</p>
            <p className="font-display text-xl text-sand-100 group-hover:text-gold-300 transition-colors">Learn all 25 alphabet signs</p>
            <p className="font-body text-sm text-sand-400 mt-1">Twenty minutes with the uniliterals and tomorrow’s cartouche reads itself.</p>
          </Link>
        </div>

        <section className="mt-12 font-body text-sand-300 text-sm leading-relaxed space-y-4 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl text-sand-100">How to play Cartouche of the Day</h2>
          <p>
            Every day the ring shows a real royal name, spelled as on a monument, a tomb or the Rosetta Stone (long epithets such as ‘beloved of Amun’ are left out). Each sign stands for a sound (the alphabet signs), a whole word (the sun disc is the god Ra) or a
            silent marker (the egg that ends a queen’s name). Tap a tile to put your reading under each sign, then press <em>Read it</em>. Correct sounds lock in place; a tilde means the sound belongs somewhere else
            in the name.
          </p>
          <p>
            You have {MAX_ATTEMPTS} rows. Win and your streak grows; miss a day and it resets, like Wordle. The reveal tells you who the king was, what the name means and why it is spelled that way, including the
            Egyptian habit of writing a god’s name first even when it is read last.
          </p>
          <h2 className="font-display text-2xl text-sand-100 pt-2">Which pharaohs appear?</h2>
          <p>
            {DAILY_CARTOUCHES.length} cartouches so far, from Khufu and Pepi II to Cleopatra and Alexander: {DAILY_CARTOUCHES.slice(0, 8).map((c) => c.king.replace(/ \(.*\)/, "")).join(", ")} and more. Every
            sign sequence was checked against two published renderings, and the Unicode code points are audited against the Gardiner sign list before a cartouche goes live.
          </p>
        </section>
        {children}
      </section>
      <Footer />
    </main>
  );
}

function Reveal({
  cartouche,
  today,
  stats,
  xp,
  countdown,
  copied,
  archive,
  onShare,
  onSignIn,
}: {
  cartouche: DailyCartouche;
  today: Today;
  stats: DailyStats;
  xp: { amount: number; status: string };
  countdown: string;
  copied: boolean;
  /** a past day replayed: no streak stats, XP or countdown */
  archive: boolean;
  onShare: () => void;
  onSignIn: () => void;
}) {
  const maxDist = Math.max(1, ...stats.distribution);
  return (
    <div className="mt-6 enter-fade" aria-live="polite">
      <div className="text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-1">{today.won ? `Read in ${today.rows.length} of ${MAX_ATTEMPTS}` : "The name was"}</p>
        <h2 className="font-display text-3xl text-sand-100">{cartouche.king}</h2>
        <p className="font-display italic text-lg text-gold-300 mt-1">{cartouche.translit}</p>
        <p className="font-body text-sm text-sand-300 mt-1">{cartouche.meaning}</p>
        <p className="font-body text-xs text-sand-500 mt-1">{cartouche.period}</p>
      </div>

      <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
        {cartouche.signs.map((s, i) => (
          <li key={i} className="flex items-center gap-3 border border-gold-700/20 bg-obsidian-lighter p-2">
            <span className="glyph-cell text-3xl w-10 shrink-0">{s.glyph}</span>
            <span className="font-body text-xs text-sand-300">
              <span className="text-sand-100 font-medium">{s.value}</span>
              <br />
              {s.name}
            </span>
          </li>
        ))}
      </ul>

      <p className="font-body text-sm text-sand-300 mt-5 leading-relaxed">{cartouche.fact}</p>
      {cartouche.href && (
        <p className="font-body text-xs mt-2">
          <Link href={cartouche.href} className="text-gold-500 underline underline-offset-4">
            Read more about this cartouche
          </Link>
        </p>
      )}

      {/* Stats */}
      {!archive && (
      <>
      <div className="mt-6 grid grid-cols-4 gap-2 text-center">
        <Stat label="Played" value={String(stats.played)} />
        <Stat label="Win %" value={String(stats.played ? Math.round((stats.won / stats.played) * 100) : 0)} />
        <Stat label="Streak" value={String(stats.streak)} />
        <Stat label="Best" value={String(stats.maxStreak)} />
      </div>
      <div className="mt-3 space-y-1" aria-label="Wins by number of tries">
        {stats.distribution.map((count, i) => (
          <div key={i} className="flex items-center gap-2 font-body text-[11px] text-sand-400">
            <span className="w-3 text-right">{i + 1}</span>
            <div className="flex-1 h-4 bg-gold-700/10">
              <div className="h-full bg-gold-500/70 text-right pr-1 text-obsidian text-[10px] leading-4" style={{ width: `${Math.max(6, (count / maxDist) * 100)}%` }}>
                {count}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="font-body text-sm text-sand-300 mt-5 text-center min-h-[1.5rem]">
        {xp.status === "saving" && "Recording your XP…"}
        {xp.status === "saved" && (
          <>
            <span className="text-gold-400 font-medium">+{xp.amount} XP</span> added to your scholar level.
          </>
        )}
        {xp.status === "guest" && (
          <>
            You earned <span className="text-gold-400 font-medium">+{xp.amount} XP</span>.{" "}
            <button type="button" onClick={onSignIn} className="text-gold-400 underline underline-offset-4">
              Create a free account
            </button>{" "}
            to keep it and your streak.
          </>
        )}
        {xp.status === "error" && "Couldn't save XP this time, but your streak is safe in this browser."}
      </p>
      </>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
        <button type="button" onClick={onShare} className="btn-primary py-3 px-8 text-sm justify-center">
          {copied ? "Copied!" : "Share your grid"}
        </button>
        <Link href="/daily/decipher" className="btn-secondary py-3 px-6 text-sm justify-center">
          Play Decipher
        </Link>
        <Link href="/lessons/expedition-begins" className="btn-secondary py-3 px-6 text-sm justify-center">
          Free lesson
        </Link>
      </div>
      <p className="font-body text-xs text-sand-500 text-center mt-4">
        {!archive && (
          <>
            Next cartouche in <span className="text-sand-200 tabular-nums">{countdown}</span> ·{" "}
          </>
        )}
        <Link href="/dig" className="text-gold-500 underline underline-offset-4">
          Back to The Dig
        </Link>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gold-700/20 bg-obsidian-light/40 p-2 sm:p-3">
      <p className="font-display text-xl sm:text-2xl text-gold-400">{value}</p>
      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500 mt-1">{label}</p>
    </div>
  );
}
