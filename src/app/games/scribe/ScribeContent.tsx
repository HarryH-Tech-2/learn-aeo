"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { seededShuffle } from "@/lib/daily";
import { cloudFromStrokes, cloudPercent, cloudScoreDistance, pointsFromInk, praiseFor, templateFromInk, type Point } from "@/lib/recognizer";
import { catalogue, type WallSign } from "@/lib/wall";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";
export const SCRIBE_LESSON_ID = "game-scribe";
const ROUNDS = 8;
const SHOW_MS = 2600;

type Phase = "intro" | "show" | "draw" | "result" | "done";
type Result = { sign: WallSign; percent: number; strokes: Point[][] };

/** Render a glyph and trace its ink into a point-cloud template. */
function traceGlyph(glyph: string, size = 220): Point[] {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return [];
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#000";
  ctx.font = `${Math.round(size * 0.7)}px ${GLYPH_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, size / 2, size / 2);
  const ink = pointsFromInk(ctx.getImageData(0, 0, size, size).data, size, size, 90, 600);
  return templateFromInk(ink, 64);
}

export default function ScribeContent({ paid }: { paid: boolean }) {
  const { data: session } = useSession();
  const freeGuest = useFreeCourseGuest();
  const { openAuthModal } = useAuthModal();
  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<"free" | "all">("free");
  const [queue, setQueue] = useState<WallSign[]>([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [percent, setPercent] = useState<number | null>(null);
  const [fontReady, setFontReady] = useState(false);
  const [xp, setXp] = useState<{ amount: number; status: "idle" | "saving" | "saved" | "guest" | "error" }>({ amount: 0, status: "idle" });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<Point[] | null>(null);
  const templates = useRef(new Map<string, Point[]>());
  const showTimer = useRef<number | null>(null);

  const sign = queue[idx];

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    document.fonts
      .load(`60px ${GLYPH_FONT}`)
      .then(() => setFontReady(true))
      .catch(() => setFontReady(true));
  }, []);

  function templateFor(g: string): Point[] {
    let t = templates.current.get(g);
    if (!t) {
      t = traceGlyph(g);
      templates.current.set(g, t);
    }
    return t;
  }

  function start(m: "free" | "all") {
    setMode(m);
    const p = catalogue().filter((s) => (m === "free" ? s.lessonId === "expedition-begins" : true));
    setQueue(seededShuffle(p, Date.now() % 100000).slice(0, ROUNDS));
    setIdx(0);
    setResults([]);
    setStrokes([]);
    setPercent(null);
    setXp({ amount: 0, status: "idle" });
    setPhase("show");
    trackEvent("game_start", { game: "scribe", mode: m });
  }

  // Show the sign briefly, then hide it
  useEffect(() => {
    if (phase !== "show") return;
    showTimer.current = window.setTimeout(() => setPhase("draw"), SHOW_MS);
    return () => {
      if (showTimer.current) window.clearTimeout(showTimer.current);
    };
  }, [phase, idx]);

  // ─── canvas drawing ───
  const repaint = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = c.clientWidth;
    if (c.width !== Math.round(size * dpr)) {
      c.width = Math.round(size * dpr);
      c.height = Math.round(size * dpr);
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    // papyrus
    ctx.fillStyle = "#e9dcb8";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(120,90,40,0.12)";
    ctx.lineWidth = 1;
    for (let y = 0; y < size; y += 9) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    // the true form (shown during "show" and "result")
    if (sign && (phase === "show" || phase === "result" || phase === "intro")) {
      ctx.fillStyle = phase === "result" ? "rgba(154,58,36,0.55)" : "rgba(60,40,15,0.9)";
      ctx.font = `${Math.round(size * 0.62)}px ${GLYPH_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sign.glyph, size / 2, size / 2);
    }
    // player's strokes
    ctx.strokeStyle = phase === "result" ? "#1c150c" : "#2f2013";
    ctx.lineWidth = Math.max(4, size * 0.018);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Strokes are stored in canvas fractions (0–1) so they survive a resize / rotation.
    const all = drawing.current ? [...strokes, drawing.current] : strokes;
    for (const s of all) {
      if (s.length < 1) continue;
      ctx.beginPath();
      ctx.moveTo(s[0].x * size, s[0].y * size);
      for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x * size, s[i].y * size);
      if (s.length === 1) ctx.lineTo(s[0].x * size + 0.1, s[0].y * size);
      ctx.stroke();
    }
  }, [sign, phase, strokes]);

  useEffect(() => {
    repaint();
    const onResize = () => repaint();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [repaint, fontReady]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - r.left) / Math.max(1, r.width), y: (e.clientY - r.top) / Math.max(1, r.height) };
  }
  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (phase !== "draw") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = [pos(e)];
    repaint();
  }
  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current.push(pos(e));
    repaint();
  }
  function onUp() {
    if (!drawing.current) return;
    const s = drawing.current;
    drawing.current = null;
    if (s.length >= 1) setStrokes((all) => [...all, s]);
  }

  function undo() {
    setStrokes((all) => all.slice(0, -1));
  }

  function check() {
    if (!sign || strokes.length === 0) return;
    const t = templateFor(sign.glyph);
    const cloud = cloudFromStrokes(strokes, t.length || 64);
    const pct = t.length ? cloudPercent(cloudScoreDistance(cloud, t)) : 0;
    setPercent(pct);
    setResults((r) => [...r, { sign, percent: pct, strokes }]);
    trackExerciseAnswer({ exercise: "scribe", questionType: "draw-from-memory", question: sign.glyph, correct: pct >= 50 });
    setPhase("result");
  }

  function nextRound() {
    setStrokes([]);
    setPercent(null);
    if (idx + 1 >= queue.length) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
    setPhase("show");
  }

  function peek() {
    // Show the true form again for a moment (costs nothing but honesty)
    setPhase("show");
    trackEvent("hint_used", { game: "scribe", question: sign?.glyph });
  }

  function finish() {
    setPhase("done");
    const avg = results.length ? Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length) : 0;
    trackExerciseComplete({ exercise: "scribe", score: results.filter((r) => r.percent >= 50).length, total: results.length });
    const amount = Math.round(results.reduce((s, r) => s + (r.percent >= 75 ? 15 : r.percent >= 50 ? 10 : 4), 0));
    if (!session?.user) {
      setXp({ amount, status: "guest" });
      return;
    }
    setXp({ amount, status: "saving" });
    fetch("/api/progress/xp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: SCRIBE_LESSON_ID, xp: amount }) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(() => setXp({ amount, status: "saved" }))
      .catch(() => setXp({ amount, status: "error" }));
    void avg;
  }

  async function share() {
    const avg = results.length ? Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length) : 0;
    const text = `My hand as a scribe: ${avg}% across ${results.length} hieroglyphs drawn from memory 𓏞\nhttps://www.learnhieroglyphics.com/games/scribe`;
    trackEvent("scribe_share", { avg });
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  const praise = percent !== null ? praiseFor(percent) : null;

  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="text-center mb-5">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Scribe’s Games · draw</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light">
            Scribe’s <span className="text-gradient-gold font-medium">Hand</span>
          </h1>
          <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            A sign appears for a moment. Draw it from memory with your finger, then see your line laid over the true form.
          </p>
        </div>

        {phase === "intro" && (
          <div className="card-ancient p-6 sm:p-8 text-center enter-fade">
            <p className="font-body text-sm text-sand-300 leading-relaxed max-w-md mx-auto">
              {ROUNDS} signs, one hand. The sign shows for about three seconds, then the papyrus clears. Any number of strokes, any order; shape is what counts. Three tiers of praise and no red crosses.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <button type="button" onClick={() => start("free")} className="btn-primary py-3 px-8 text-sm justify-center">
                The 25 alphabet signs · free
              </button>
              {paid ? (
                <button type="button" onClick={() => start("all")} className="btn-secondary py-3 px-8 text-sm justify-center">
                  Every sign in the course
                </button>
              ) : (
                <div className="flex flex-col">
                  <Link href={freeGuest ? "/get-started" : session?.user ? "/checkout" : "/get-started?next=checkout"} className="btn-secondary py-3 px-8 text-sm justify-center">
                    {freeGuest ? "Every sign · free with an account" : <>Every sign · members (<Price />)</>}
                  </Link>
                  {!freeGuest && <GuaranteeNote />}
                </div>
              )}
            </div>
            <p className="font-body text-xs text-sand-600 mt-4">Works one-handed on a phone. Turn the sound off; scribes worked in silence.</p>
          </div>
        )}

        {(phase === "show" || phase === "draw" || phase === "result") && sign && (
          <div className="enter-fade">
            <div className="flex items-center justify-between font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-2">
              <span>
                Sign <span className="text-sand-200">{idx + 1}</span>/{queue.length}
              </span>
              <span className="text-gold-400">
                {phase === "show" ? "Look…" : phase === "draw" ? "Now draw it" : praise?.title}
              </span>
            </div>
            <div className="card-ancient p-2 sm:p-3">
              <canvas
                ref={canvasRef}
                className="w-full aspect-square block touch-none select-none"
                style={{ cursor: phase === "draw" ? "crosshair" : "default" }}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onPointerLeave={onUp}
                role="img"
                aria-label={phase === "show" ? `The sign ${sign.translit}, ${sign.name}` : phase === "draw" ? "Drawing surface: draw the sign you just saw" : `Your drawing over the true form of ${sign.translit}`}
              />
            </div>
            <p className="font-body text-sm text-sand-300 text-center mt-3 min-h-[1.5rem]">
              {phase === "show" && (
                <>
                  <span className="text-sand-100 font-medium">{sign.translit}</span> · {sign.name}
                </>
              )}
              {phase === "draw" && <>Draw <span className="text-sand-100 font-medium">{sign.translit}</span>, the {sign.name.toLowerCase()}.</>}
              {phase === "result" && praise && (
                <>
                  <span className="text-gold-400 font-medium">{percent}% match.</span> {praise.line}
                </>
              )}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {phase === "draw" && (
                <>
                  <button type="button" onClick={undo} disabled={strokes.length === 0} className="btn-secondary py-3 text-sm justify-center disabled:opacity-40">
                    Undo
                  </button>
                  <button type="button" onClick={peek} className="btn-secondary py-3 text-sm justify-center">
                    Peek
                  </button>
                  <button type="button" onClick={check} disabled={strokes.length === 0} className="btn-primary py-3 text-sm justify-center disabled:opacity-40">
                    Check
                  </button>
                </>
              )}
              {phase === "show" && (
                <button type="button" onClick={() => setPhase("draw")} className="btn-primary py-3 text-sm justify-center col-span-3">
                  I’ve got it
                </button>
              )}
              {phase === "result" && (
                <>
                  <button type="button" onClick={() => { setStrokes([]); setPercent(null); setResults((r) => r.slice(0, -1)); setPhase("show"); }} className="btn-secondary py-3 text-sm justify-center col-span-1">
                    Again
                  </button>
                  <button type="button" onClick={nextRound} className="btn-primary py-3 text-sm justify-center col-span-2">
                    {idx + 1 >= queue.length ? "Finish" : "Next sign"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="card-ancient p-6 sm:p-8 text-center enter-fade" aria-live="polite">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Session complete</p>
            <h2 className="font-display text-3xl text-sand-100 mb-4">
              {results.filter((r) => r.percent >= 75).length >= ROUNDS * 0.6 ? "A scribe’s hand." : results.filter((r) => r.percent >= 50).length >= ROUNDS * 0.5 ? "Steady, and steadier every time." : "The reed is learning you."}
            </h2>
            <ul className="flex flex-wrap justify-center gap-2 mb-5">
              {results.map((r, i) => (
                <li key={i} className="border border-gold-700/25 bg-obsidian-lighter px-2 py-1 text-center min-w-[3.5rem]">
                  <span className="glyph-cell text-2xl block">{r.sign.glyph}</span>
                  <span className={`font-body text-[11px] ${r.percent >= 75 ? "text-turquoise" : r.percent >= 50 ? "text-gold-400" : "text-sand-500"}`}>{r.percent}%</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-sm text-sand-300 mb-5 min-h-[1.5rem]">
              {xp.status === "saving" && "Recording your XP…"}
              {xp.status === "saved" && (
                <>
                  <span className="text-gold-400 font-medium">+{xp.amount} XP</span> added to your scholar level.
                </>
              )}
              {xp.status === "guest" && (
                <>
                  You earned <span className="text-gold-400 font-medium">+{xp.amount} XP</span>.{" "}
                  <button type="button" onClick={() => openAuthModal({ next: "/games/scribe" })} className="text-gold-400 underline underline-offset-4">
                    Create a free account
                  </button>{" "}
                  to keep it.
                </>
              )}
              {xp.status === "error" && "Couldn't save XP this time."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button type="button" onClick={() => start(mode)} className="btn-primary py-3 px-6 text-sm justify-center">
                Draw again
              </button>
              <button type="button" onClick={share} className="btn-secondary py-3 px-6 text-sm justify-center">
                Share
              </button>
              <Link href="/games/wall" className="btn-secondary py-3 px-6 text-sm justify-center">
                Repaint your wall
              </Link>
            </div>
          </div>
        )}

        <p className="font-body text-xs text-sand-500 text-center mt-8">
          <Link href="/dig" className="text-gold-500 underline underline-offset-4">
            Back to The Dig
          </Link>
          {" · "}Scoring: your strokes and the true glyph are turned into point clouds and compared with a nearest-neighbour (Chamfer) distance, so stroke order and count don’t matter, shape does.
        </p>
      </section>
      <Footer />
    </main>
  );
}
