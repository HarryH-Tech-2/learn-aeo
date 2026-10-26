"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { speak, speechSupported } from "@/lib/speech";
import { DESCENT_LESSON_ID, FLOORS, LIVES, afterFall, afterLanding, afterReachingBottom, generateLevel, initialRun, signPool, xpForRun, type DescentBlock, type Level, type RunState } from "@/lib/descent";
import type { Controls } from "@/components/three/Descent";

const Descent = dynamic(() => import("@/components/three/Descent"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[3/4] sm:aspect-[4/3] max-h-[78vh] border border-gold-700/20 bg-[#120c05] flex items-center justify-center">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 animate-pulse">Lowering the rope…</p>
    </div>
  ),
});

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif" } as const;

type Phase = "intro" | "playing" | "done";

export default function DescentContent({ locked, paid }: { locked: boolean; paid: boolean }) {
  const { data: session } = useSession();
  const freeGuest = useFreeCourseGuest();
  const [phase, setPhase] = useState<Phase>("intro");
  const [level, setLevel] = useState<Level | null>(null);
  const [run, setRun] = useState<RunState>(initialRun());
  const [crumbled, setCrumbled] = useState<Set<string>>(new Set());
  const [respawn, setRespawn] = useState({ x: 0, y: 0.8, n: 0 });
  const [floor, setFloor] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [voice, setVoice] = useState(true);
  const [xp, setXp] = useState<{ amount: number; status: "idle" | "saving" | "saved" | "guest" | "error" }>({ amount: 0, status: "idle" });
  const [reduced, setReduced] = useState(false);
  const controls = useRef<Controls>({ left: false, right: false, jump: false });
  const lastSafe = useRef({ x: 0, y: 0.8 });
  const runRef = useRef(run);
  runRef.current = run;

  const previewLevel = useMemo(() => generateLevel(signPool(false), 7), []);

  useEffect(() => {
    try {
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {}
  }, []);

  // keyboard
  useEffect(() => {
    if (phase !== "playing") return;
    const map: Record<string, keyof Controls> = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", " ": "jump", ArrowUp: "jump", w: "jump", W: "jump" };
    const down = (e: KeyboardEvent) => {
      const k = map[e.key];
      if (!k) return;
      e.preventDefault();
      controls.current[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = map[e.key];
      if (!k) return;
      controls.current[k] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase]);

  const current = level?.floors[Math.min(floor, FLOORS - 1)];

  const say = useCallback(
    (text: string) => {
      if (!voice || !speechSupported()) return;
      speak(text, { rate: 0.95 });
    },
    [voice]
  );

  function start() {
    const lvl = generateLevel(signPool(paid), Date.now() % 1_000_000);
    setLevel(lvl);
    setRun(initialRun());
    setCrumbled(new Set());
    setFloor(0);
    lastSafe.current = { x: 0, y: lvl.startY };
    setRespawn({ x: 0, y: lvl.startY, n: Date.now() });
    setXp({ amount: 0, status: "idle" });
    setToast(null);
    setPhase("playing");
    trackEvent("game_start", { game: "descent", pool: paid ? "all" : "free" });
    window.setTimeout(() => say(lvl.floors[0].spoken), 600);
  }

  function showToast(t: string) {
    setToast(t);
    window.setTimeout(() => setToast((cur) => (cur === t ? null : cur)), 1400);
  }

  const onLand = useCallback(
    (block: DescentBlock) => {
      if (!level || runRef.current.finished) return;
      const f = level.floors.find((fl) => fl.blocks.some((b) => b.id === block.id));
      if (!f) return;
      if (block.solid) {
        if (f.index + 1 > runRef.current.floorsCleared) {
          trackExerciseAnswer({ exercise: "descent", questionType: "sound-to-block", question: f.answer.glyph, correct: true });
          showToast(`${f.answer.translit} · ${f.answer.name}`);
          const next = level.floors[f.index + 1];
          if (next) window.setTimeout(() => say(next.spoken), 500);
        }
        lastSafe.current = { x: block.x, y: block.y + 0.3 };
        setFloor(Math.min(FLOORS - 1, f.index + 1));
        setRun((r) => afterLanding(r, block, f.index));
      } else {
        if (crumbled.has(block.id)) return;
        trackExerciseAnswer({ exercise: "descent", questionType: "sound-to-block", question: f.answer.glyph, correct: false });
        showToast(`That was ${block.glyph}. It crumbles…`);
        window.setTimeout(() => setCrumbled((c) => new Set([...c, block.id])), 250);
        setRun((r) => afterLanding(r, block, f.index));
      }
    },
    [level, crumbled, say]
  );

  const onFall = useCallback(() => {
    setRun((r) => {
      const next = afterFall(r);
      if (next.finished) finish(next);
      else showToast(`${next.livesLeft} ${next.livesLeft === 1 ? "life" : "lives"} left`);
      return next;
    });
    setRespawn({ x: lastSafe.current.x, y: lastSafe.current.y, n: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBottom = useCallback(() => {
    setRun((r) => {
      if (r.finished) return r;
      const next = afterReachingBottom(r);
      finish(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish(final: RunState) {
    setPhase("done");
    const amount = xpForRun(final);
    trackExerciseComplete({ exercise: "descent", score: final.floorsCleared, total: FLOORS, attempts: final.crumbles + final.floorsCleared });
    if (!session?.user) {
      setXp({ amount, status: "guest" });
      return;
    }
    setXp({ amount, status: "saving" });
    fetch("/api/progress/xp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: DESCENT_LESSON_ID, xp: amount }) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(() => setXp({ amount, status: "saved" }))
      .catch(() => setXp({ amount, status: "error" }));
  }

  const events = useMemo(() => ({ onLand, onFall, onBottom }), [onLand, onFall, onBottom]);

  function hold(k: keyof Controls, v: boolean) {
    controls.current[k] = v;
  }

  // ─── sealed ───
  if (locked) {
    return (
      <main className="min-h-screen bg-obsidian text-sand-100">
        <Navbar />
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
          <Header locked />
          <div className="relative max-w-3xl mx-auto">
            <div className="pointer-events-none select-none">
              <Descent level={previewLevel} controls={controls} crumbled={new Set()} respawn={respawn} events={events} interactive={false} paused stageKey="locked-preview" />
            </div>
            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center px-4">
              <div className="text-center bg-obsidian/90 backdrop-blur-sm border border-gold-700/30 p-8 max-w-md">
                <span className="text-4xl block mb-3" style={GLYPH}>
                  𓊛
                </span>
                <h2 className="font-display text-2xl font-light text-sand-100 mb-2">
                  The Shaft is <span className="text-gradient-gold font-medium">Sealed</span>
                </h2>
                <p className="font-body text-sm text-sand-400 mb-5">
                  {freeGuest ? (
                    "Scribe’s Descent and the 3D games are part of the full course, and the whole course is free for you with an account."
                  ) : (
                    <>Scribe’s Descent and the 3D games are part of the full course. Unlock everything with a one-time <Price /> purchase.</>
                  )}
                </p>
                <a href={freeGuest ? "/get-started" : session ? "/checkout" : "/get-started?next=checkout"} className="btn-primary w-full justify-center text-sm py-4">
                  {freeGuest ? "Create my free account" : "Get Lifetime Access"}
                </a>
                {!freeGuest && <GuaranteeNote />}
                <p className="font-body text-xs text-sand-600 mt-4">
                  Free to play now:{" "}
                  <Link href="/games/scribe" className="text-gold-500 underline underline-offset-4">
                    Scribe’s Hand
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <Header />

        {phase === "intro" && (
          <div className="card-ancient p-6 sm:p-8 max-w-2xl mx-auto text-center enter-fade">
            <h2 className="font-display text-2xl text-sand-100 mb-3">How to play</h2>
            <p className="font-body text-sm text-sand-300 leading-relaxed">
              A voice at the top of the shaft names a sound or a thing. Jump down onto the block carrying that sign: it holds. Any other block crumbles under you. {FLOORS} floors, {LIVES} lives, a sarcophagus at the bottom.
            </p>
            <p className="font-body text-xs text-sand-500 mt-3">Keyboard: arrow keys to move, space or up arrow to jump. On a phone, use the buttons under the shaft.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <button type="button" onClick={start} className="btn-primary py-3 px-8 text-sm justify-center">
                Begin the descent
              </button>
              <label className="inline-flex items-center gap-2 font-body text-xs text-sand-400 justify-center">
                <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} className="accent-[#d4a832]" /> Read prompts aloud
              </label>
            </div>
            {reduced && <p className="font-body text-xs text-sand-500 mt-4">Reduced motion is on: the camera follows without easing and blocks vanish instead of tumbling.</p>}
          </div>
        )}

        {phase !== "intro" && level && (
          <div className="max-w-3xl mx-auto">
            {/* HUD */}
            <div className="flex items-center justify-between mb-2 font-body text-xs tracking-[0.2em] uppercase">
              <span className="text-sand-500">
                Floor <span className="text-sand-200">{Math.min(run.floorsCleared + 1, FLOORS)}</span>/{FLOORS}
              </span>
              <span className="text-sand-500" aria-label={`${run.livesLeft} lives left`}>
                {Array.from({ length: LIVES }, (_, i) => (
                  <span key={i} className={i < run.livesLeft ? "text-gold-400" : "text-sand-700"} style={GLYPH} aria-hidden="true">
                    𓋹
                  </span>
                ))}
              </span>
              <span className="text-sand-500">
                Crumbled <span className="text-sand-200">{run.crumbles}</span>
              </span>
            </div>
            {/* Prompt */}
            <div className="border border-gold-500/40 bg-gold-500/10 px-4 py-3 mb-2 text-center" aria-live="polite">
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500">Land on…</p>
              <p className="font-display text-xl sm:text-2xl text-sand-100">{phase === "playing" && current ? current.prompt : "The sarcophagus"}</p>
              {toast && <p className="font-body text-sm text-turquoise mt-1">{toast}</p>}
            </div>

            <Descent level={level} controls={controls} crumbled={crumbled} respawn={respawn} events={events} interactive={phase === "playing"} paused={phase !== "playing"} stageKey={`run-${level.seed}`} />

            {/* Touch controls */}
            {phase === "playing" && (
              <div className="grid grid-cols-3 gap-2 mt-2 select-none" aria-label="Touch controls">
                <button type="button" className="btn-secondary py-4 text-xl justify-center touch-none" onPointerDown={() => hold("left", true)} onPointerUp={() => hold("left", false)} onPointerLeave={() => hold("left", false)} onPointerCancel={() => hold("left", false)} aria-label="Move left">
                  ◀
                </button>
                <button type="button" className="btn-primary py-4 text-xl justify-center touch-none" onPointerDown={() => hold("jump", true)} onPointerUp={() => hold("jump", false)} onPointerLeave={() => hold("jump", false)} onPointerCancel={() => hold("jump", false)} aria-label="Jump">
                  ▲
                </button>
                <button type="button" className="btn-secondary py-4 text-xl justify-center touch-none" onPointerDown={() => hold("right", true)} onPointerUp={() => hold("right", false)} onPointerLeave={() => hold("right", false)} onPointerCancel={() => hold("right", false)} aria-label="Move right">
                  ▶
                </button>
              </div>
            )}

            {phase === "done" && (
              <div className="card-ancient p-6 sm:p-8 mt-3 text-center enter-fade" aria-live="polite">
                <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">{run.won ? "You reached the sarcophagus" : "The rope ran out"}</p>
                <h2 className="font-display text-3xl text-sand-100 mb-4">{run.won ? (run.crumbles === 0 ? "A flawless descent." : "Down, in one piece.") : `${run.floorsCleared} floor${run.floorsCleared === 1 ? "" : "s"} cleared.`}</h2>
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-5">
                  <Stat label="Floors" value={`${run.floorsCleared}/${FLOORS}`} />
                  <Stat label="Crumbled" value={String(run.crumbles)} />
                  <Stat label="Lives" value={String(run.livesLeft)} />
                </div>
                <p className="font-body text-sm text-sand-300 mb-5 min-h-[1.5rem]">
                  {xp.status === "saving" && "Recording your XP…"}
                  {xp.status === "saved" && (
                    <>
                      <span className="text-gold-400 font-medium">+{xp.amount} XP</span> added to your scholar level.
                    </>
                  )}
                  {xp.status === "guest" && `You'd have earned +${xp.amount} XP with an account.`}
                  {xp.status === "error" && "Couldn't save XP this time."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button type="button" onClick={start} className="btn-primary py-3 px-6 text-sm justify-center">
                    Descend again
                  </button>
                  <ShareButton run={run} />
                  <Link href="/dig" className="btn-secondary py-3 px-6 text-sm justify-center">
                    Back to The Dig
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="font-body text-xs text-sand-500 text-center mt-8">
          <Link href="/dig" className="text-gold-500 underline underline-offset-4">
            Back to The Dig
          </Link>
          {" · "}Physics by Rapier; the shaft, the blocks and the signs share one canvas texture.
        </p>
      </section>
      <Footer />
    </main>
  );
}

function Header({ locked }: { locked?: boolean }) {
  return (
    <div className="text-center mb-6">
      <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Scribe’s Games · 3D{locked ? " · Members" : ""}</p>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light">
        Scribe’s <span className="text-gradient-gold font-medium">Descent</span>
      </h1>
      <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">Descend a tomb shaft on floating stone blocks. A voice names a sound; only the blocks carrying that sign hold your weight.</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gold-700/20 bg-obsidian-light/40 p-3">
      <p className="font-display text-2xl text-gold-400">{value}</p>
      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500 mt-1">{label}</p>
    </div>
  );
}

function ShareButton({ run }: { run: RunState }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const text = `${run.won ? "I reached the sarcophagus" : `I cleared ${run.floorsCleared} floors`} in Scribe's Descent with ${run.crumbles} crumbled block${run.crumbles === 1 ? "" : "s"} 𓊛\nhttps://www.learnhieroglyphics.com/games/descent`;
    trackEvent("descent_share", { floors: run.floorsCleared, won: run.won ? 1 : 0 });
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  return (
    <button type="button" onClick={share} className="btn-secondary py-3 px-6 text-sm justify-center">
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
