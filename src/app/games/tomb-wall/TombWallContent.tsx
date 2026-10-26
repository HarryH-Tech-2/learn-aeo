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
import type { WallSlot } from "@/components/three/TombWall";
import {
  WALL_WORDS,
  ROUNDS,
  GAME_LESSON_ID,
  buildRounds,
  makeRound,
  determinativeIndex,
  directionClueSign,
  scoreRound,
  xpForGame,
  type Round,
} from "@/lib/tomb-wall";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { modelForGlyph } from "@/lib/objects";

// "The thing itself": after a word is read, its determinative's 3D object (bull, jar, boat…) turns on a pedestal.
const SignStage = dynamic(() => import("@/components/three/SignStage"), {
  ssr: false,
  loading: () => <div className="w-full aspect-square sm:aspect-[4/3] border border-gold-700/20 bg-obsidian-light/40" />,
});

const TombWall = dynamic(() => import("@/components/three/TombWall"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] sm:aspect-[16/10] border border-gold-700/20 bg-[#1a120a] flex items-center justify-center">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 animate-pulse">Lighting the torch…</p>
    </div>
  ),
});

const GLYPH_STYLE = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;
const WRONG_FLASH_MS = 520;

type Phase = "intro" | "playing" | "done";
type Step = "order" | "det" | "feedback";

type Result = {
  round: Round;
  points: number;
  perfect: boolean;
  orderMistakes: number;
  detCorrect: boolean;
};

type Props = {
  /** True when the visitor has no active purchase — show the sealed view. */
  locked: boolean;
};

/** A pleasant fixed preview for the intro / sealed views. */
const PREVIEW_ROUND = makeRound(WALL_WORDS.find((w) => w.id === "ss") ?? WALL_WORDS[0], false);

function slotsFor(
  round: Round,
  tapped: number[],
  wrongFlash: number | null,
  detPick: { slot: number; correct: boolean } | null,
  step: Step
): WallSlot[] {
  const detIdx = determinativeIndex(round.word);
  return round.display.map((signIdx, slot) => {
    const order = tapped.indexOf(signIdx);
    let tone: WallSlot["tone"] = "none";
    if (step === "order") {
      if (wrongFlash === slot) tone = "wrong";
      else if (order >= 0) tone = "chalk";
    } else if (detPick) {
      if (signIdx === detIdx) tone = "right";
      else if (slot === detPick.slot) tone = "wrong";
      else tone = "dim";
    }
    return {
      glyph: round.word.signs[signIdx].glyph,
      mirrored: round.mirrored,
      badge: order >= 0 ? String(order + 1) : undefined,
      tone,
    };
  });
}

export default function TombWallContent({ locked }: Props) {
  const { data: session } = useSession();
  const freeGuest = useFreeCourseGuest();
  const [phase, setPhase] = useState<Phase>("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>("order");
  const [tapped, setTapped] = useState<number[]>([]);
  const [orderMistakes, setOrderMistakes] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [wrongEnd, setWrongEnd] = useState(false);
  const [detPick, setDetPick] = useState<{ slot: number; correct: boolean } | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [xpResult, setXpResult] = useState<{ xp: number; status: "idle" | "saving" | "saved" | "guest" | "error" }>({
    xp: 0,
    status: "idle",
  });

  const roundStart = useRef(0);
  const flashTimer = useRef<number | null>(null);

  const round = rounds[index];
  const totalPoints = useMemo(() => results.reduce((s, r) => s + r.points, 0), [results]);
  const perfectCount = useMemo(() => results.filter((r) => r.perfect).length, [results]);

  const start = useCallback(() => {
    setRounds(buildRounds(WALL_WORDS, ROUNDS));
    setIndex(0);
    resetRound();
    setStreak(0);
    setBestStreak(0);
    setResults([]);
    setXpResult({ xp: 0, status: "idle" });
    setPhase("playing");
    trackEvent("game_start", { game: "tomb-wall" });
  }, []);

  function resetRound() {
    setStep("order");
    setTapped([]);
    setOrderMistakes(0);
    setWrongFlash(null);
    setWrongEnd(false);
    setDetPick(null);
    setHintUsed(false);
    roundStart.current = performance.now();
  }

  useEffect(() => {
    if (phase === "playing") roundStart.current = performance.now();
  }, [phase, index]);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    []
  );

  function onTap(slot: number) {
    if (!round) return;
    const signIdx = round.display[slot];
    const word = round.word;

    if (step === "order") {
      if (tapped.includes(signIdx)) return;
      const expected = tapped.length;
      if (signIdx === expected) {
        const next = [...tapped, signIdx];
        setTapped(next);
        setWrongEnd(false);
        if (next.length === word.signs.length) {
          trackExerciseAnswer({
            exercise: "tomb-wall",
            questionType: round.rtl ? "reading-order-rtl" : "reading-order-ltr",
            question: word.translit,
            correct: orderMistakes === 0,
          });
          setStep("det");
        }
      } else {
        setOrderMistakes((m) => m + 1);
        // Tapped the far end first? That's a direction mistake worth explaining.
        if (tapped.length === 0 && signIdx === word.signs.length - 1) setWrongEnd(true);
        setWrongFlash(slot);
        if (flashTimer.current) window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setWrongFlash(null), WRONG_FLASH_MS);
      }
      return;
    }

    if (step === "det") {
      const correct = signIdx === determinativeIndex(word);
      setDetPick({ slot, correct });
      const elapsedMs = performance.now() - roundStart.current;
      const scored = scoreRound({ orderMistakes, detCorrect: correct, elapsedMs, streak, hintUsed });
      setStreak(scored.streak);
      setBestStreak((b) => Math.max(b, scored.streak));
      setResults((r) => [...r, { round, points: scored.points, perfect: scored.perfect, orderMistakes, detCorrect: correct }]);
      trackExerciseAnswer({ exercise: "tomb-wall", questionType: "determinative", question: word.translit, correct });
      setStep("feedback");
    }
  }

  function nextRound() {
    if (index + 1 >= rounds.length) {
      setPhase("done");
    } else {
      setIndex((i) => i + 1);
      resetRound();
    }
  }

  function revealHint() {
    if (hintUsed || !round || step !== "order") return;
    setHintUsed(true);
    trackEvent("hint_used", { game: "tomb-wall", question: round.word.translit });
  }

  // On finish: analytics + XP
  useEffect(() => {
    if (phase !== "done") return;
    trackExerciseComplete({ exercise: "tomb-wall", score: perfectCount, total: ROUNDS });
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

  const slots = useMemo(
    () => (round ? slotsFor(round, tapped, wrongFlash, detPick, step) : []),
    [round, tapped, wrongFlash, detPick, step]
  );
  const previewSlots = useMemo(() => slotsFor(PREVIEW_ROUND, [], null, null, "order"), []);
  const clue = round ? directionClueSign(round.word) : null;
  const startSide = round ? (round.rtl ? "right" : "left") : "left";
  const lastResult = results[results.length - 1];

  /* ───────────────────────────── sealed ───────────────────────────── */
  if (locked) {
    return (
      <main className="min-h-screen bg-obsidian text-sand-100 relative overflow-hidden">
        <Navbar />
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <Header locked />
          <div className="relative max-w-3xl mx-auto">
            <div className="card-ancient p-4 md:p-6 pointer-events-none select-none">
              <TombWall slots={previewSlots} interactive={false} stageKey="locked-preview" />
              <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 text-center mt-6 mb-3">
                Tap the signs in reading order
              </p>
              <div className="flex justify-center gap-3 blur-[2px] opacity-50">
                {previewSlots.map((s, i) => (
                  <div key={i} className="w-16 p-3 border border-gold-700/15 bg-obsidian-lighter text-center">
                    <span className="block text-4xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                      {s.glyph}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
                    "Tomb Wall Decode and the 3D games are part of the full course, and the whole course is free for you with an account."
                  ) : (
                    <>Tomb Wall Decode and the 3D games are part of the full course. Unlock everything with a one-time <Price /> purchase.</>
                  )}
                </p>
                <a href={freeGuest ? "/get-started" : session ? "/checkout" : "/get-started?next=checkout"} className="btn-primary w-full justify-center text-sm py-4">
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

  /* ───────────────────────────── game ───────────────────────────── */
  return (
    <main className="min-h-screen bg-obsidian text-sand-100 relative overflow-hidden">
      <Navbar />

      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <Header />

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
                <TombWall slots={previewSlots} interactive={false} stageKey="intro" />
                <div>
                  <h2 className="font-display text-2xl text-sand-100 mb-3">How to read a wall</h2>
                  <ul className="font-body text-sm text-sand-300 space-y-2 mb-6 list-disc pl-5">
                    <li>
                      <span className="text-sand-100">Signs face the start of the line.</span> If the people and animals look right, read from the right.
                    </li>
                    <li>Tap the carved signs in reading order; they light up with chalk numbers.</li>
                    <li>Then tap the <span className="text-sand-100">determinative</span>: the silent sign at the end that shows the word&apos;s category.</li>
                    <li>{ROUNDS} walls. 100 pts for a clean read, +50 for the determinative, speed and streak bonuses.</li>
                  </ul>
                  <button type="button" onClick={start} className="btn-primary py-3 px-8 text-sm w-full justify-center">
                    Light the torch
                  </button>
                  <p className="font-body text-xs text-sand-600 mt-4">
                    {WALL_WORDS.length} real words from tomb and temple texts: people, gods, places, verbs of motion.
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
                  Wall <span className="text-sand-200">{index + 1}</span>/{ROUNDS}
                </span>
                <span className="text-sand-500">
                  Streak <span className={streak >= 3 ? "text-gold-400" : "text-sand-200"}>{streak}</span>
                </span>
                <span className="text-sand-500">
                  Score <span className="text-gold-400">{totalPoints}</span>
                </span>
              </div>
              {/* progress */}
              <div className="h-1 w-full bg-gold-700/15 mb-4 overflow-hidden">
                <div className="h-full bg-gold-500 transition-[width] duration-300" style={{ width: `${(index / ROUNDS) * 100}%` }} />
              </div>

              <div className="card-ancient p-4 md:p-6">
                <TombWall
                  slots={slots}
                  onTap={onTap}
                  interactive={step !== "feedback"}
                  hintSide={hintUsed && step === "order" ? (startSide as "left" | "right") : null}
                  stageKey={`${index}-${round.word.id}`}
                />

                {/* Prompt */}
                <div className="mt-4 min-h-[3.25rem] text-center">
                  {step === "order" && (
                    <>
                      <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500">
                        Tap the signs in reading order
                        {tapped.length > 0 && (
                          <span className="text-sand-500 normal-case tracking-normal ml-2">
                            · {tapped.length}/{round.word.signs.length}
                          </span>
                        )}
                      </p>
                      <div className="mt-2 min-h-[1.5rem]">
                        {wrongEnd ? (
                          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-body text-sm text-sand-300">
                            Wrong end. <span className="text-sand-100">Signs face the start of the line</span>, so look which way the{" "}
                            {clue?.name ?? "figures"} face.
                          </motion.p>
                        ) : hintUsed ? (
                          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-body text-sm text-sand-300">
                            <span className="text-gold-500 text-xs tracking-[0.2em] uppercase mr-2">Hint</span>
                            The {clue?.name ?? "figures"} face{clue?.name?.endsWith("s") ? "" : "s"} <span className="text-sand-100">{startSide}</span>, so
                            start from the {startSide}.
                          </motion.p>
                        ) : (
                          <button
                            type="button"
                            onClick={revealHint}
                            className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4 transition-colors"
                          >
                            Which way? (forfeits the speed bonus)
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  {step === "det" && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500">Now tap the determinative</p>
                      <p className="font-body text-sm text-sand-300 mt-2">
                        The silent sign that tells you <em>what kind of thing</em> the word is.
                      </p>
                    </motion.div>
                  )}
                  {step === "feedback" && lastResult && (
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500">
                      {lastResult.perfect ? "Perfectly read" : lastResult.detCorrect ? "Read, with a stumble" : "Nearly: see below"}
                      <span className="text-gold-400 normal-case tracking-normal ml-2">+{lastResult.points}</span>
                    </p>
                  )}
                </div>

                {/* Accessible / touch-friendly mirror of the wall */}
                {step !== "feedback" && (
                  <div className="mt-2 flex justify-center gap-2 flex-wrap">
                    {slots.map((s, i) => {
                      let cls = "w-14 h-14 sm:w-16 sm:h-16 border text-center transition-all duration-150 relative ";
                      if (s.tone === "chalk") cls += "border-gold-500/60 bg-gold-500/10";
                      else if (s.tone === "wrong") cls += "border-red-500/60 bg-red-500/10";
                      else cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40";
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => onTap(i)}
                          className={cls}
                          aria-label={`sign ${i + 1} of ${slots.length}${s.badge ? `, tapped ${s.badge}` : ""}`}
                        >
                          <span
                            className="block text-3xl sm:text-4xl text-gold-400 leading-none"
                            style={{ ...GLYPH_STYLE, transform: s.mirrored ? "scaleX(-1)" : undefined, display: "inline-block" }}
                          >
                            {s.glyph}
                          </span>
                          {s.badge && (
                            <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gold-400 text-obsidian text-[11px] font-bold flex items-center justify-center">
                              {s.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Feedback card */}
                <AnimatePresence>
                  {step === "feedback" && lastResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-4 p-4 md:p-5 border ${
                        lastResult.perfect ? "border-green-500/40 bg-green-500/10" : "border-gold-500/30 bg-gold-500/5"
                      }`}
                    >
                      <div className="flex flex-wrap items-end gap-x-2 gap-y-3 justify-center mb-3" style={GLYPH_STYLE}>
                        {round.word.signs.map((sg, i) => (
                          <div key={i} className="text-center min-w-[3.25rem]">
                            <span className={`block text-4xl leading-none ${sg.role === "det" ? "text-green-300" : "text-gold-400"}`}>{sg.glyph}</span>
                            <span
                              className={`block font-body text-[11px] mt-1 ${sg.role === "det" ? "text-green-300" : sg.role === "comp" ? "text-sand-500" : "text-sand-300"}`}
                              style={{ fontFamily: "inherit" }}
                            >
                              {sg.role === "det" ? "det." : sg.role === "comp" ? `(${sg.value})` : sg.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="font-body text-sm text-sand-100 text-center">
                        <span className="font-display italic text-lg text-gold-300">{round.word.translit}</span>
                        <span className="text-sand-400"> · </span>
                        <span className="font-medium">{round.word.meaning}</span>
                        <span className="text-sand-500"> · read {round.rtl ? "right → left" : "left → right"}</span>
                      </p>
                      <p className="font-body text-xs text-sand-400 mt-2 text-center max-w-xl mx-auto">{round.word.note}</p>
                      {(() => {
                        const det = round.word.signs[determinativeIndex(round.word)];
                        const obj = det ? modelForGlyph(det.glyph) : undefined;
                        return obj ? (
                          <div className="mt-4 grid sm:grid-cols-[1fr_1.2fr] gap-4 items-center">
                            <div className="max-w-[220px] mx-auto w-full">
                              <SignStage model={obj.model} variant="compact" stageKey={`reveal-${round.word.id}`} />
                            </div>
                            <p className="font-body text-xs text-sand-300 text-center sm:text-left">
                              <span className="text-gold-500 tracking-[0.2em] uppercase text-[10px] block mb-1">The thing itself</span>
                              The determinative {det.glyph} is a picture of {obj.name.toLowerCase().startsWith("seated") ? "a" : obj.name.match(/^[aeiou]/i) ? "an" : "a"} {obj.name.toLowerCase()}: the
                              scribe drew the class of thing the word belongs to. Drag to turn it.
                            </p>
                          </div>
                        ) : null;
                      })()}
                      {!lastResult.detCorrect && (
                        <p className="font-body text-xs text-red-300/90 mt-2 text-center">
                          The determinative was the {round.word.signs[determinativeIndex(round.word)].name}:{" "}
                          {round.word.signs[determinativeIndex(round.word)].value}.
                        </p>
                      )}
                      <div className="text-center mt-4">
                        <button type="button" onClick={nextRound} className="btn-primary py-3 px-8 text-sm justify-center">
                          {index + 1 >= rounds.length ? "See your score" : "Next wall"}
                        </button>
                      </div>
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
              <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Wall decoded</p>
              <h2 className="font-display text-4xl text-sand-100 mb-6">
                {perfectCount === ROUNDS ? "Master Scribe!" : perfectCount >= 5 ? "You can read, scholar." : "The wall is teaching you."}
              </h2>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <Stat label="Score" value={String(totalPoints)} />
                <Stat label="Clean reads" value={`${perfectCount}/${ROUNDS}`} />
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
              <div className="grid sm:grid-cols-2 gap-2 mb-8 text-left">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 border ${r.perfect ? "border-green-500/40" : "border-gold-700/20"} bg-obsidian-light/40`}
                  >
                    <span className="text-2xl text-gold-400 leading-none whitespace-nowrap" style={GLYPH_STYLE}>
                      {r.round.word.signs.map((s) => s.glyph).join("")}
                    </span>
                    <span className="font-body text-xs text-sand-300">
                      <span className="font-display italic text-sand-100 text-sm">{r.round.word.translit}</span>: {r.round.word.meaning}
                      <span className="block text-sand-500">
                        {r.round.rtl ? "right → left" : "left → right"} · {r.orderMistakes === 0 ? "clean" : `${r.orderMistakes} slip${r.orderMistakes > 1 ? "s" : ""}`} ·{" "}
                        {r.detCorrect ? "det ✓" : "det ✗"} · +{r.points}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button type="button" onClick={start} className="btn-primary py-3 px-6 text-sm justify-center">
                  Read another wall
                </button>
                <Link href="/games/sign-hunt" className="btn-secondary py-3 px-6 text-sm justify-center">
                  Play Sign Hunt
                </Link>
                <Link href="/lessons/pilgrims-gallery" className="btn-secondary py-3 px-6 text-sm justify-center">
                  Lesson 3: Determinatives
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

function Header({ locked = false }: { locked?: boolean }) {
  return (
    <div className="text-center mb-8">
      <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">Scribe&apos;s Games · II{locked ? " · Members" : ""}</p>
      <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100">
        Tomb Wall <span className="text-gradient-gold font-medium">Decode</span>
      </h1>
      <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto">
        A word is carved into the wall. Work out which way it reads, tap the signs in order, then find the silent determinative, the way real
        inscriptions are read.
      </p>
    </div>
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
