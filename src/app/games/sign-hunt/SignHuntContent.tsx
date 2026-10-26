"use client";

import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  SIGN_OBJECTS,
  ROUNDS,
  ROUND_MS,
  GAME_LESSON_ID,
  buildRounds,
  scoreAnswer,
  xpForGame,
  type Round,
  type SignObject,
} from "@/lib/sign-hunt";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";

const SignStage = dynamic(() => import("@/components/three/SignStage"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] sm:aspect-[16/10] border border-gold-700/20 bg-obsidian-light/40 flex items-center justify-center">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 animate-pulse">Lighting the chamber…</p>
    </div>
  ),
});

const GLYPH_STYLE = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;
const FEEDBACK_MS = 2200;

type Phase = "intro" | "playing" | "done";

type Answer = { round: Round; picked: SignObject | null; correct: boolean; points: number };

type Props = {
  /** True when the visitor has no active purchase — show the sealed view. */
  locked: boolean;
};

export default function SignHuntContent({ locked }: Props) {
  const { data: session } = useSession();
  const freeGuest = useFreeCourseGuest();
  const [phase, setPhase] = useState<Phase>("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState<SignObject | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [msLeft, setMsLeft] = useState(ROUND_MS);
  const [xpResult, setXpResult] = useState<{ xp: number; status: "idle" | "saving" | "saved" | "guest" | "error" }>({
    xp: 0,
    status: "idle",
  });

  const roundStart = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const advanceRef = useRef<number | null>(null);

  const round = rounds[index];
  const totalPoints = useMemo(() => answers.reduce((s, a) => s + a.points, 0), [answers]);
  const correctCount = useMemo(() => answers.filter((a) => a.correct).length, [answers]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
    timerRef.current = null;
    advanceRef.current = null;
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setRounds(buildRounds(SIGN_OBJECTS, ROUNDS));
    setIndex(0);
    setAnswers([]);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
    setHintShown(false);
    setMsLeft(ROUND_MS);
    setXpResult({ xp: 0, status: "idle" });
    setPhase("playing");
    trackEvent("game_start", { game: "sign-hunt" });
  }, [clearTimers]);

  // Round timer
  useEffect(() => {
    if (phase !== "playing" || !round || picked !== null) return;
    roundStart.current = performance.now();
    setMsLeft(ROUND_MS);
    timerRef.current = window.setInterval(() => {
      const left = Math.max(0, ROUND_MS - (performance.now() - roundStart.current));
      setMsLeft(left);
      if (left <= 0) {
        // time out = wrong answer
        answer(null);
      }
    }, 100);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, round, picked]);

  // Preload next model
  useEffect(() => {
    const next = rounds[index + 1];
    if (!next) return;
    import("@/components/three/SignStage").then((m) => m.preloadSignModel(next.target.model)).catch(() => {});
  }, [rounds, index]);

  function answer(choice: SignObject | null) {
    if (!round || picked !== null) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    const left = Math.max(0, ROUND_MS - (performance.now() - roundStart.current));
    const correct = !!choice && choice.id === round.target.id;
    const { points, streak: nextStreak } = scoreAnswer({ correct, msLeft: left, streak, hintUsed: hintShown });
    setPicked(choice ?? round.target); // on timeout, reveal the answer
    setStreak(nextStreak);
    setBestStreak((b) => Math.max(b, nextStreak));
    setAnswers((a) => [...a, { round, picked: choice, correct, points }]);
    trackExerciseAnswer({
      exercise: "sign-hunt",
      questionType: choice ? "object-to-sign" : "object-to-sign-timeout",
      question: round.target.glyph,
      correct,
    });
    advanceRef.current = window.setTimeout(() => {
      if (index + 1 >= rounds.length) finish();
      else {
        setIndex((i) => i + 1);
        setPicked(null);
        setHintShown(false);
      }
    }, FEEDBACK_MS);
  }

  function revealHint() {
    if (hintShown || picked !== null || !round) return;
    setHintShown(true);
    trackEvent("hint_used", { game: "sign-hunt", question: round.target.glyph });
  }

  function finish() {
    setPhase("done");
  }

  // On finish: analytics + XP
  useEffect(() => {
    if (phase !== "done") return;
    trackExerciseComplete({ exercise: "sign-hunt", score: correctCount, total: ROUNDS });
    const xp = xpForGame(totalPoints);
    if (!session?.user) {
      setXpResult({ xp, status: "guest" });
      return;
    }
    setXpResult({ xp, status: "saving" });
    fetch("/api/progress/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: GAME_LESSON_ID, xp }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(() => setXpResult({ xp, status: "saved" }))
      .catch(() => setXpResult({ xp, status: "error" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const timeFrac = msLeft / ROUND_MS;

  if (locked) {
    return (
      <main className="min-h-screen bg-obsidian text-sand-100 relative overflow-hidden">
        <Navbar />
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <div className="text-center mb-8">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">Scribe&apos;s Games · I · Members</p>
            <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100">
              Sign <span className="text-gradient-gold font-medium">Hunt</span>
            </h1>
            <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto">
              A carved object turns in a torch-lit chamber. Pick the hieroglyph that depicts it and learn the pictographic roots of the Egyptian alphabet.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Live preview, but no controls */}
            <div className="card-ancient p-4 md:p-6 pointer-events-none select-none">
              <SignStage model={SIGN_OBJECTS[0].model} stageKey="locked-preview" />
              <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 text-center mt-6 mb-3">
                Which sign depicts this?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 blur-[2px] opacity-50">
                {SIGN_OBJECTS.slice(0, 4).map((opt) => (
                  <div key={opt.id} className="p-4 border border-gold-700/15 bg-obsidian-lighter text-center">
                    <span className="block text-5xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                      {opt.glyph}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay CTA — same pattern as sealed lessons */}
            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center bg-obsidian/90 backdrop-blur-sm border border-gold-700/30 p-8 max-w-md"
              >
                <span className="text-4xl block mb-3">{"\u{13080}"}</span>
                <h2 className="font-display text-2xl font-light text-sand-100 mb-2">
                  This Chamber is <span className="text-gradient-gold font-medium">Sealed</span>
                </h2>
                <p className="font-body text-sm text-sand-400 mb-5 font-light">
                  {freeGuest ? (
                    "Sign Hunt and the 3D games are part of the full course, and the whole course is free for you with an account."
                  ) : (
                    <>Sign Hunt and the 3D games are part of the full course. Unlock everything with a one-time <Price /> purchase.</>
                  )}
                </p>
                <a
                  href={freeGuest ? "/get-started" : session ? "/checkout" : "/get-started?next=checkout"}
                  className="btn-primary w-full justify-center text-sm py-4"
                >
                  {freeGuest ? "Create my free account" : "Get Lifetime Access"}
                </a>
                {!freeGuest && <GuaranteeNote />}
                <p className="font-body text-xs text-sand-600 mt-4">
                  Free to try:{" "}
                  <Link href="/translate-name-to-hieroglyphics" className="text-gold-500 underline underline-offset-4">
                    forge your name in 3D
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian text-sand-100 relative overflow-hidden">
      <Navbar />

      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">Scribe&apos;s Games · I</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100">
            Sign <span className="text-gradient-gold font-medium">Hunt</span>
          </h1>
          <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto">
            A carved object appears in the chamber. Pick the hieroglyph that depicts it; fast answers and streaks score more.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ───────────── Intro ───────────── */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card-ancient p-6 md:p-10 max-w-3xl mx-auto"
            >
              <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
                <SignStage model={SIGN_OBJECTS[0].model} stageKey="intro" />
                <div>
                  <h2 className="font-display text-2xl text-sand-100 mb-3">How to play</h2>
                  <ul className="font-body text-sm text-sand-300 space-y-2 mb-6 list-disc pl-5">
                    <li>{ROUNDS} rounds, {ROUND_MS / 1000}s each.</li>
                    <li>Drag to turn the object. Tap the matching sign.</li>
                    <li>100 pts per hit, up to +50 for speed, +10 per streak.</li>
                    <li>Signed-in scholars earn XP towards their level.</li>
                  </ul>
                  <button type="button" onClick={start} className="btn-primary py-3 px-8 text-sm w-full justify-center">
                    Begin the Hunt
                  </button>
                  <p className="font-body text-xs text-sand-600 mt-4">
                    Covers {SIGN_OBJECTS.length} of the 24 uniliteral signs, the hieroglyphic &ldquo;alphabet&rdquo;.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ───────────── Playing ───────────── */}
          {phase === "playing" && round && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
              {/* HUD */}
              <div className="flex items-center justify-between mb-3 font-body text-xs tracking-[0.2em] uppercase">
                <span className="text-sand-500">
                  Round <span className="text-sand-200">{index + 1}</span>/{ROUNDS}
                </span>
                <span className="text-sand-500">
                  Streak <span className={streak >= 3 ? "text-gold-400" : "text-sand-200"}>{streak}</span>
                </span>
                <span className="text-sand-500">
                  Score <span className="text-gold-400">{totalPoints}</span>
                </span>
              </div>
              {/* Timer */}
              <div className="h-1 w-full bg-gold-700/15 mb-4 overflow-hidden">
                <div
                  className={`h-full transition-[width] duration-100 ${timeFrac < 0.25 ? "bg-red-400" : "bg-gold-500"}`}
                  style={{ width: `${timeFrac * 100}%` }}
                />
              </div>

              <div className="card-ancient p-4 md:p-6">
                <SignStage model={round.target.model} stageKey={`${index}-${round.target.id}`} paused={picked !== null} />

                {/* Hint under the model */}
                <div className="mt-3 min-h-[2.25rem] flex items-center justify-center text-center">
                  {picked !== null ? null : hintShown ? (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-body text-sm text-sand-300"
                    >
                      <span className="text-gold-500 text-xs tracking-[0.2em] uppercase mr-2">Hint</span>
                      It&apos;s a <span className="text-sand-100 font-medium">{round.target.name.toLowerCase()}</span>. Find the sign that draws one.
                    </motion.p>
                  ) : (
                    <button
                      type="button"
                      onClick={revealHint}
                      className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4 transition-colors"
                    >
                      Need a hint? (forfeits the speed bonus)
                    </button>
                  )}
                </div>

                <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 text-center mt-3 mb-3">
                  Which sign depicts this?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {round.options.map((opt) => {
                    let cls = "p-4 border text-center transition-all duration-200 ";
                    if (picked !== null) {
                      if (opt.id === round.target.id) cls += "border-green-500/60 bg-green-500/10";
                      else if (opt.id === picked.id) cls += "border-red-500/60 bg-red-500/10";
                      else cls += "border-gold-700/10 bg-obsidian-lighter opacity-50";
                    } else {
                      cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40 hover:bg-gold-500/5 cursor-pointer";
                    }
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => answer(opt)}
                        disabled={picked !== null}
                        className={cls}
                        aria-label={picked !== null ? `${opt.name}: ${opt.translit}` : "hieroglyph option"}
                      >
                        <span className="block text-5xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                          {opt.glyph}
                        </span>
                        <span className={`block font-body text-[11px] mt-2 ${picked !== null ? "text-sand-300" : "text-transparent"}`}>
                          {opt.translit}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {picked !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-4 p-4 border ${
                        answers[answers.length - 1]?.correct
                          ? "border-green-500/40 bg-green-500/10"
                          : "border-red-500/40 bg-red-500/10"
                      }`}
                    >
                      <p className="font-body text-sm text-sand-100">
                        <span className="text-2xl align-middle mr-2 text-gold-400" style={GLYPH_STYLE}>
                          {round.target.glyph}
                        </span>
                        <span className="font-medium">{round.target.name}</span>
                        <span className="text-sand-400"> · {round.target.translit} · sounds like &ldquo;{round.target.sound}&rdquo;</span>
                        {answers[answers.length - 1]?.correct && (
                          <span className="text-gold-400 ml-2">+{answers[answers.length - 1].points}</span>
                        )}
                      </p>
                      <p className="font-body text-xs text-sand-400 mt-1">{round.target.note}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ───────────── Done ───────────── */}
          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-ancient p-6 md:p-10 max-w-3xl mx-auto text-center"
            >
              <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Hunt complete</p>
              <h2 className="font-display text-4xl text-sand-100 mb-6">
                {correctCount === ROUNDS ? "Master Scribe!" : correctCount >= 7 ? "Well read, scholar." : "The signs are learning you."}
              </h2>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <Stat label="Score" value={String(totalPoints)} />
                <Stat label="Correct" value={`${correctCount}/${ROUNDS}`} />
                <Stat label="Best streak" value={String(bestStreak)} />
              </div>

              <p className="font-body text-sm text-sand-300 mb-8 min-h-[1.5rem]">
                {xpResult.status === "saving" && "Recording your XP…"}
                {xpResult.status === "saved" && (
                  <>
                    <span className="text-gold-400 font-medium">+{xpResult.xp} XP</span> added to your scholar level.
                  </>
                )}
                {xpResult.status === "guest" && (
                  <>
                    You&apos;d have earned <span className="text-gold-400 font-medium">+{xpResult.xp} XP</span>.{" "}
                    <Link href="/get-started" className="text-gold-400 underline underline-offset-4">
                      Create a free account
                    </Link>{" "}
                    to keep it.
                  </>
                )}
                {xpResult.status === "error" && "Couldn't save XP this time, but your score still counts for you."}
              </p>

              {/* Review */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {answers.map((a, i) => (
                  <span
                    key={i}
                    title={`${a.round.target.name} (${a.round.target.translit})`}
                    className={`w-11 h-11 inline-flex items-center justify-center border text-2xl ${
                      a.correct ? "border-green-500/50 text-gold-400" : "border-red-500/50 text-sand-500"
                    }`}
                    style={GLYPH_STYLE}
                  >
                    {a.round.target.glyph}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button type="button" onClick={start} className="btn-primary py-3 px-6 text-sm justify-center">
                  Hunt again
                </button>
                <Link href="/translate-name-to-hieroglyphics" className="btn-secondary py-3 px-6 text-sm justify-center">
                  Forge your name in 3D
                </Link>
                <Link href="/lessons/expedition-begins" className="btn-secondary py-3 px-6 text-sm justify-center">
                  Start Lesson 1
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gold-700/20 bg-obsidian-light/40 p-4">
      <p className="font-display text-2xl text-gold-400">{value}</p>
      <p className="font-body text-[11px] tracking-[0.2em] uppercase text-sand-500 mt-1">{label}</p>
    </div>
  );
}
