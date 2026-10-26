"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import { useAuthModal } from "@/components/AuthModal";
import { fetchJson } from "@/lib/fetch-json";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { daysUntilDue, dueSigns, fadeLevel, isSignState, qualityFor, review, seedSign, wallSummary, type Quality, type SignState } from "@/lib/srs";
import { WALL_LESSON_ID, catalogue, makeQuestion, signInfo, xpForRepaint, type Question } from "@/lib/wall";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";
const PLASTER_TOP = "#d3b583";
const PLASTER_MID = "#c6a46f";
const PLASTER_BOT = "#a98658";
const PIG = ["#2f4f8a", "#9a3a24", "#3e7a4a", "#c9962e", "#1c150c"];
const LOCAL_KEY = "lh_wall";

type Props = { signedIn: boolean; paid: boolean };

type Cell = { sign: SignState; x: number; y: number; w: number; h: number; colour: string };

/** Tiny deterministic noise so the weathering pattern is stable per sign. */
function hash(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
  return h >>> 0;
}

function lcg(seed: number): () => number {
  let a = seed >>> 0;
  return () => ((a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 4294967296);
}

export default function WallContent({ signedIn, paid }: Props) {
  const { openAuthModal } = useAuthModal();
  const [signs, setSigns] = useState<SignState[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [active, setActive] = useState<{ sign: SignState; question: Question; attempts: number; picked: number | null; startedAt: number } | null>(null);
  const [session, setSession] = useState<{ repainted: number; xp: number; missed: number; started: boolean }>({ repainted: 0, xp: 0, missed: 0, started: false });
  const [xpStatus, setXpStatus] = useState<"idle" | "saved" | "error">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<Cell[]>([]);
  const localModeRef = useRef(false);
  const [tick, setTick] = useState(0);

  // Load the wall (or a preview for guests)
  useEffect(() => {
    if (!signedIn) {
      const t = Date.now();
      const preview = catalogue()
        .filter((s) => s.lessonId === "expedition-begins")
        .map((s, i) => {
          const st = seedSign(s.glyph, t - ((i * 7) % 6) * 86_400_000);
          return st;
        });
      setSigns(preview);
      return;
    }
    fetchJson<{ signs: unknown[] }>("/api/srs")
      .then((d) => {
        const ok = d.signs.filter(isSignState);
        setSigns(ok);
        setNow(Date.now());
      })
      .catch(() => {
        // Offline / no session (local preview): keep a wall in this browser so
        // the page still works; reviews are saved locally under lh_wall.
        const t = Date.now();
        let local: SignState[] = [];
        try {
          const raw = window.localStorage.getItem(LOCAL_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          local = Array.isArray(parsed) ? parsed.filter(isSignState) : [];
        } catch {}
        if (local.length === 0) local = catalogue().filter((s) => s.lessonId === "expedition-begins").map((s, i) => seedSign(s.glyph, t - ((i * 5) % 7) * 86_400_000));
        localModeRef.current = true;
        setSigns(local);
        setNow(t);
      });
  }, [signedIn]);

  const summary = useMemo(() => (signs ? wallSummary(signs, now) : null), [signs, now]);
  const due = useMemo(() => (signs ? dueSigns(signs, now) : []), [signs, now]);

  // ─── painting ───
  const paint = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !signs) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssW = c.clientWidth;
    const cols = cssW < 480 ? 5 : cssW < 768 ? 6 : 8;
    const cell = Math.floor(cssW / cols);
    const rows = Math.max(1, Math.ceil(signs.length / cols));
    const top = Math.round(cell * 0.55);
    const cssH = top + rows * cell + Math.round(cell * 0.35);
    c.width = Math.round(cssW * dpr);
    c.height = Math.round(cssH * dpr);
    c.style.height = `${cssH}px`;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // plaster
    const g = ctx.createLinearGradient(0, 0, 0, cssH);
    g.addColorStop(0, PLASTER_TOP);
    g.addColorStop(0.5, PLASTER_MID);
    g.addColorStop(1, PLASTER_BOT);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cssW, cssH);
    // grain
    const rnd = lcg(12345);
    ctx.fillStyle = "rgba(60,40,15,0.06)";
    for (let i = 0; i < cssW * cssH * 0.02; i++) ctx.fillRect(rnd() * cssW, rnd() * cssH, 1.5, 1.5);
    // kheker frieze
    const khH = Math.round(top * 0.55);
    const khW = Math.max(10, Math.round(khH * 0.6));
    for (let x = 6; x < cssW - 6; x += khW + 4) {
      ctx.fillStyle = PIG[3];
      ctx.beginPath();
      ctx.moveTo(x, khH + 6);
      ctx.lineTo(x + khW / 2, 6);
      ctx.lineTo(x + khW, khH + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = PIG[1];
      ctx.fillRect(x + khW * 0.3, khH * 0.55, khW * 0.4, khH * 0.35);
    }
    ctx.fillStyle = PIG[0];
    ctx.fillRect(0, khH + 10, cssW, 3);
    ctx.fillStyle = PIG[1];
    ctx.fillRect(0, khH + 15, cssW, 3);

    // signs
    const cells: Cell[] = [];
    const off = document.createElement("canvas");
    off.width = Math.round(cell * dpr);
    off.height = Math.round(cell * dpr);
    const octx = off.getContext("2d")!;
    signs.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cell + (cssW - cols * cell) / 2;
      const y = top + row * cell;
      const colour = PIG[hash(s.glyph) % 4];
      const fade = fadeLevel(s, now);
      cells.push({ sign: s, x, y, w: cell, h: cell, colour });

      // paint the sign into the offscreen tile, then weather it
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.clearRect(0, 0, cell, cell);
      octx.globalCompositeOperation = "source-over";
      octx.fillStyle = colour;
      octx.font = `${Math.round(cell * 0.62)}px ${GLYPH_FONT}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.globalAlpha = 1 - fade * 0.75;
      octx.fillText(s.glyph, cell / 2, cell / 2 + cell * 0.04);
      if (fade > 0.1) {
        octx.globalAlpha = 1;
        octx.globalCompositeOperation = "destination-out";
        const r = lcg(hash(s.glyph) ^ 0x9e3779b9);
        const n = Math.round(fade * fade * cell * cell * 0.09);
        for (let k = 0; k < n; k++) {
          const sz = 1 + r() * (2 + fade * 4);
          octx.fillRect(r() * cell, r() * cell, sz, sz * (0.6 + r()));
        }
        // a few larger flakes when badly weathered
        if (fade > 0.6) for (let k = 0; k < fade * 6; k++) octx.fillRect(r() * cell, r() * cell, 4 + r() * cell * 0.15, 3 + r() * cell * 0.08);
      }
      octx.globalCompositeOperation = "source-over";
      ctx.drawImage(off, 0, 0, off.width, off.height, x, y, cell, cell);

      // due marker: a faint chalk tick under signs that need repainting today
      if (s.due <= now) {
        ctx.fillStyle = "rgba(255,240,200,0.55)";
        ctx.fillRect(x + cell * 0.3, y + cell * 0.9, cell * 0.4, 2);
      }
    });
    cellsRef.current = cells;
  }, [signs, now]);

  useEffect(() => {
    paint();
    // Repaint when the hieroglyph font lands (never gate on it).
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => !cancelled && paint()).catch(() => null);
      document.fonts.load(`40px ${GLYPH_FONT}`).then(() => !cancelled && paint()).catch(() => null);
    }
    const onResize = () => paint();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [paint, tick]);

  // ─── interaction ───
  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!signedIn || !signs || active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cell = cellsRef.current.find((c) => x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h);
    if (!cell) return;
    ask(cell.sign);
  }

  function ask(sign: SignState) {
    const q = makeQuestion(sign.glyph, Date.now());
    if (!q) return;
    if (!session.started) {
      setSession((s) => ({ ...s, started: true }));
      trackEvent("game_start", { game: "wall", due: due.length, total: signs?.length ?? 0 });
    }
    setActive({ sign, question: q, attempts: 0, picked: null, startedAt: performance.now() });
  }

  function answer(i: number) {
    if (!active || active.picked !== null) return;
    const correct = i === active.question.answer;
    const attempts = active.attempts + 1;
    trackExerciseAnswer({ exercise: "wall", questionType: active.question.kind, question: active.sign.glyph, correct });
    if (!correct && attempts === 1) {
      // one more go, at a lower grade
      setActive({ ...active, attempts, picked: null });
      setSession((s) => ({ ...s, missed: s.missed + 1 }));
      setFlashWrong(i);
      return;
    }
    const q = qualityFor(correct, attempts, performance.now() - active.startedAt);
    setActive({ ...active, attempts, picked: i });
    commit(active.sign, q);
  }

  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  function setFlashWrong(i: number) {
    setWrongIdx(i);
    window.setTimeout(() => setWrongIdx(null), 600);
  }

  function commit(sign: SignState, q: Quality) {
    const t = Date.now();
    const next = review(sign, q, t);
    setSigns((all) => {
      const updated = all ? all.map((s) => (s.glyph === sign.glyph ? next : s)) : all;
      if (localModeRef.current && updated) {
        try {
          window.localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    setNow(t);
    const gained = xpForRepaint(q);
    setSession((s) => ({ ...s, repainted: s.repainted + (q >= 3 ? 1 : 0), xp: s.xp + gained }));
    fetch("/api/srs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ glyph: sign.glyph, quality: q }) }).catch(() => null);
    if (gained > 0) {
      fetch("/api/progress/xp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: WALL_LESSON_ID, xp: gained }) })
        .then((r) => (r.ok ? setXpStatus("saved") : setXpStatus("error")))
        .catch(() => setXpStatus("error"));
    }
    setTick((n) => n + 1);
  }

  function next() {
    setActive(null);
    const remaining = signs ? dueSigns(signs, Date.now()) : [];
    if (remaining.length === 0 && session.started) {
      trackExerciseComplete({ exercise: "wall", score: session.repainted, total: session.repainted + session.missed });
    }
  }

  const info = active ? signInfo(active.sign.glyph) : null;

  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="text-center mb-6">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Scribe’s Games · your wall</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light">
            Fading <span className="text-gradient-gold font-medium">Paint</span>
          </h1>
          <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Every sign you have learned is painted on your own tomb wall. Paint fades on a spaced-repetition schedule; tap a weathered sign, answer one quick question, and it is painted fresh.
          </p>
        </div>

        {/* Status strip */}
        {summary && (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-4 font-body text-xs tracking-[0.2em] uppercase text-sand-500">
            <span>
              On the wall <span className="text-sand-200 text-base align-middle">{summary.total}</span>
            </span>
            <span>
              Need repainting <span className={`${summary.due > 0 ? "text-gold-400" : "text-sand-200"} text-base align-middle`}>{summary.due}</span>
            </span>
            <span>
              Fresh <span className="text-sand-200 text-base align-middle">{summary.fresh}</span>
            </span>
            {session.started && (
              <span>
                Repainted today <span className="text-turquoise text-base align-middle">{session.repainted}</span>
              </span>
            )}
          </div>
        )}

        <div className="relative card-ancient p-2 sm:p-3">
          {error && <p className="font-body text-sm text-terracotta p-6 text-center">{error}</p>}
          {!signs && !error && <p className="font-body text-sm text-sand-500 p-10 text-center animate-pulse">Lighting the lamp…</p>}
          <canvas
            ref={canvasRef}
            onClick={onCanvasClick}
            className={`w-full block ${signedIn ? "cursor-pointer" : "pointer-events-none"}`}
            role={signedIn ? "group" : "img"}
            aria-label={signedIn ? "Your painted wall. Use the list below the wall to repaint a sign with the keyboard." : "A preview of a painted tomb wall with the alphabet signs, some faded"}
          />

          {/* Guest wall */}
          {!signedIn && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
              <div className="text-center bg-obsidian/90 backdrop-blur-sm border border-gold-700/30 p-6 max-w-md">
                <p className="font-display text-xl text-sand-100 mb-2">Your wall is waiting</p>
                <p className="font-body text-sm text-sand-400 mb-4">
                  Create a free account and the 25 alphabet signs go up in fresh paint. Come back in two days and watch them start to fade.
                </p>
                <button type="button" onClick={() => openAuthModal({ next: "/games/wall" })} className="btn-primary w-full justify-center text-sm py-3">
                  Start my wall (free)
                </button>
              </div>
            </div>
          )}

          {/* Question card */}
          {active && info && (
            <div className="absolute inset-0 flex items-center justify-center p-3 bg-obsidian/70 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Repaint this sign">
              <div className="card-ancient p-5 max-w-md w-full enter-fade">
                <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">
                  Repaint · {daysUntilDue(active.sign, now) <= 0 ? "overdue" : `due in ${daysUntilDue(active.sign, now)} day${daysUntilDue(active.sign, now) === 1 ? "" : "s"}`}
                </p>
                <div className="flex items-center gap-4">
                  <span className="glyph-cell text-6xl">{active.question.kind === "pick" ? "?" : active.sign.glyph}</span>
                  <p className="font-body text-base text-sand-100">{active.question.prompt}</p>
                </div>
                <div className={`grid gap-2 mt-4 ${active.question.kind === "pick" ? "grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`} role="group" aria-label="Answers">
                  {active.question.options.map((o, i) => {
                    const answered = active.picked !== null;
                    const isRight = i === active.question.answer;
                    const cls = answered ? (isRight ? "border-turquoise bg-turquoise/10" : i === active.picked ? "border-terracotta/70 bg-terracotta/10" : "opacity-50") : wrongIdx === i ? "border-terracotta/70 bg-terracotta/10" : "border-gold-700/25 bg-obsidian-lighter hover:border-gold-500/50";
                    return (
                      <button key={i} type="button" onClick={() => answer(i)} disabled={answered} className={`p-3 border text-left font-body text-sm transition-colors ${cls} ${active.question.kind === "pick" ? "text-center" : ""}`}>
                        {active.question.kind === "pick" ? (
                          <span className="glyph-cell text-3xl">{o}</span>
                        ) : (
                          <>
                            <span className="text-gold-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                            {o}
                          </>
                        )}
                        {answered && isRight && <span className="ml-2 text-turquoise">✓</span>}
                        {answered && !isRight && i === active.picked && <span className="ml-2 text-terracotta">✕</span>}
                      </button>
                    );
                  })}
                </div>
                {active.attempts === 1 && active.picked === null && <p className="font-body text-xs text-sand-400 mt-3" role="status">Not that one. One more try.</p>}
                {active.picked !== null && (
                  <div className="mt-4" role="status">
                    <p className="font-body text-sm text-sand-200">
                      {active.picked === active.question.answer ? <span className="text-turquoise font-medium">Painted fresh. </span> : <span className="text-sand-300 font-medium">It fades a little more. </span>}
                      {active.question.explain}
                    </p>
                    <p className="font-body text-xs text-sand-500 mt-1">
                      Next look in {Math.max(1, daysUntilDue(signs!.find((s) => s.glyph === active.sign.glyph)!, now))} day{daysUntilDue(signs!.find((s) => s.glyph === active.sign.glyph)!, now) === 1 ? "" : "s"}.
                    </p>
                    <button type="button" onClick={next} className="btn-primary text-sm py-3 px-8 mt-3">
                      {dueSigns(signs!, now).length > 0 ? `Next (${dueSigns(signs!, now).length} left)` : "Done for today"}
                    </button>
                  </div>
                )}
                {active.picked === null && (
                  <button type="button" onClick={() => setActive(null)} className="font-body text-xs text-sand-500 underline underline-offset-4 mt-4">
                    Leave it for now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard-accessible list + actions */}
        {signedIn && signs && (
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <p className="font-body text-sm text-sand-300">
                {due.length === 0 ? (
                  <>Nothing needs repainting right now. Come back {signs.length ? `in ${Math.max(1, Math.min(...signs.map((s) => daysUntilDue(s, now))))} day(s)` : "soon"}.</>
                ) : (
                  <>
                    <span className="text-gold-400 font-medium">{due.length}</span> sign{due.length === 1 ? "" : "s"} need repainting today.
                  </>
                )}
                {xpStatus === "saved" && <span className="text-gold-400 ml-2">+{session.xp} XP saved</span>}
                {xpStatus === "error" && <span className="text-sand-500 ml-2">(XP not saved this time)</span>}
              </p>
              <div className="flex gap-2">
                {due.length > 0 && (
                  <button type="button" onClick={() => ask(due[0])} className="btn-primary text-sm py-2 px-5">
                    Repaint the next one
                  </button>
                )}
                {!paid && (
                  <div className="flex flex-col items-center">
                    <Link href="/checkout" className="btn-secondary text-sm py-2 px-5">
                      Add more signs (<Price />)
                    </Link>
                    <GuaranteeNote />
                  </div>
                )}
              </div>
            </div>
            <details className="mt-3">
              <summary className="font-body text-xs text-sand-500 cursor-pointer">All signs on the wall (keyboard)</summary>
              <ul className="mt-2 flex flex-wrap gap-1">
                {signs.map((s) => (
                  <li key={s.glyph}>
                    <button type="button" onClick={() => ask(s)} className={`glyph-cell text-2xl px-2 py-1 border ${s.due <= now ? "border-gold-500/60" : "border-gold-700/20"}`} aria-label={`${signInfo(s.glyph)?.translit ?? s.glyph}, ${s.due <= now ? "needs repainting" : `due in ${daysUntilDue(s, now)} days`}`}>
                      {s.glyph}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}

        <p className="font-body text-xs text-sand-500 text-center mt-8">
          <Link href="/dig" className="text-gold-500 underline underline-offset-4">
            Back to The Dig
          </Link>
          {" · "}Schedule: SM-2, the algorithm behind most flashcard apps, but you never see a card: the wall itself is the deck.
        </p>
      </section>
      <Footer />
    </main>
  );
}
