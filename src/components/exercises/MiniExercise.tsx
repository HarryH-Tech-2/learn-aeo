"use client";

/**
 * Quick Check: a short run of multiple-choice questions over a handful of
 * signs. Five formats so no two chambers feel the same:
 *
 *   standard — sign → meaning, meaning → sign, alternating
 *   object   — the 3D object first (when we have a model), pick its sign
 *   listen   — hear the pronunciation, pick the sign (falls back to standard
 *              where speech synthesis is missing)
 *   speed    — the same questions on a timer; running out counts as wrong
 *   silent   — no feedback per question; the marks come at the end
 */

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { Hieroglyph } from "@/lib/legacy-lessons";
import { modelForGlyph } from "@/lib/objects";
import { speak, speechSupported, toSpeakable } from "@/lib/speech";
import { trackExerciseAnswer, trackExerciseComplete, type ExerciseKind } from "@/lib/analytics";
import type { QuickCheckMode } from "@/lib/expedition";

const SignStage = dynamic(() => import("@/components/three/SignStage"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] border border-gold-700/20 bg-obsidian-light/40 flex items-center justify-center">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 animate-pulse">Carving…</p>
    </div>
  ),
});

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;
const SPEED_SECONDS = 7;

type Props = {
  glyphs: Hieroglyph[];
  onComplete: (correctCount: number, total: number) => void;
  /** Header label (default "Quick Check") */
  title?: string;
  /** GA4 exercise kind (default "mini") */
  exercise?: ExerciseKind;
  /** Format (default "standard") */
  mode?: QuickCheckMode;
  /** Extra signs to draw wrong answers from when the group is small (they are never asked about) */
  distractors?: Hieroglyph[];
};

type QType = "symbol-to-meaning" | "meaning-to-symbol" | "object-to-symbol" | "sound-to-symbol";
type Question = { glyph: Hieroglyph; type: QType };

function shuffle<T>(xs: T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function MiniExercise({ glyphs, onComplete, title = "Quick Check", exercise = "mini", mode = "standard", distractors = [] }: Props) {
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => setCanSpeak(speechSupported()), []);
  const effective: QuickCheckMode = mode === "listen" && !canSpeak ? "standard" : mode;

  const questions = useMemo<Question[]>(() => {
    return glyphs.map((g, i) => {
      if (effective === "object" && modelForGlyph(g.symbol)) return { glyph: g, type: "object-to-symbol" };
      if (effective === "listen") return { glyph: g, type: "sound-to-symbol" };
      return { glyph: g, type: i % 2 === 0 ? "symbol-to-meaning" : "meaning-to-symbol" };
    });
  }, [glyphs, effective]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SPEED_SECONDS);
  const [finished, setFinished] = useState(false);
  const [silentResults, setSilentResults] = useState<boolean[]>([]);
  const timer = useRef<number | null>(null);

  const q = questions[currentIndex];
  const wantsSymbol = q ? q.type !== "symbol-to-meaning" : false;

  const options = useMemo(() => {
    if (!q) return [];
    const key = (g: Hieroglyph) => (wantsSymbol ? g.symbol : g.meaning);
    const correct = key(q.glyph);
    // Wrong answers come from the group first, then from the wider lesson when the group is small.
    const own = shuffle(glyphs.map(key).filter((o) => o !== correct));
    const extra = shuffle(distractors.map(key).filter((o) => o !== correct && !own.includes(o)));
    const wrong = [...new Set([...own, ...extra])].slice(0, 3);
    return shuffle([correct, ...wrong]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, glyphs, distractors]);

  const correctAnswer = q ? (wantsSymbol ? q.glyph.symbol : q.glyph.meaning) : "";

  // Speak the sound automatically when a listen question opens.
  useEffect(() => {
    if (q?.type === "sound-to-symbol") speak(toSpeakable(q.glyph.pronunciation));
  }, [q]);

  // Speed mode countdown.
  useEffect(() => {
    if (effective !== "speed" || showFeedback || finished || !q) return;
    setTimeLeft(SPEED_SECONDS);
    const started = Date.now();
    timer.current = window.setInterval(() => {
      const left = SPEED_SECONDS - (Date.now() - started) / 1000;
      if (left <= 0) {
        window.clearInterval(timer.current!);
        timer.current = null;
        handleAnswer(null);
      } else setTimeLeft(left);
    }, 100);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, effective, showFeedback, finished]);

  function handleAnswer(answer: string | null) {
    if (showFeedback || finished || !q) return;
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    const isCorrect = answer === correctAnswer;
    setSelectedAnswer(answer);
    if (isCorrect) setScore((s) => s + 1);
    trackExerciseAnswer({ exercise, questionType: q.type, question: q.glyph.symbol, correct: isCorrect });
    const finalScore = score + (isCorrect ? 1 : 0);
    const last = currentIndex + 1 >= questions.length;

    if (effective === "silent") {
      setSilentResults((r) => [...r, isCorrect]);
      if (last) {
        setFinished(true);
        trackExerciseComplete({ exercise, score: finalScore, total: questions.length });
        setTimeout(() => onComplete(finalScore, questions.length), 2500);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
      }
      return;
    }

    setShowFeedback(true);
    setTimeout(() => {
      if (last) {
        trackExerciseComplete({ exercise, score: finalScore, total: questions.length });
        onComplete(finalScore, questions.length);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 1000);
  }

  if (finished && effective === "silent") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lesson-sheet p-6 sm:p-8 text-center">
        <p className="lesson-label mb-3">{title}: marked</p>
        <div className="flex justify-center gap-2 mb-3">
          {silentResults.map((ok, i) => (
            <span key={i} className={`w-3 h-3 rounded-full ${ok ? "bg-turquoise" : "bg-terracotta"}`} title={ok ? "right" : "wrong"} />
          ))}
        </div>
        <p className="font-display text-xl text-sand-100">
          {silentResults.filter(Boolean).length} of {silentResults.length}
        </p>
        <p className="font-body text-xs text-sand-500 mt-1">No help, no second chances. That was the exam.</p>
      </motion.div>
    );
  }

  if (!q) return null;

  const prompt =
    q.type === "symbol-to-meaning"
      ? "What does this sign mean?"
      : q.type === "meaning-to-symbol"
        ? "Which sign matches?"
        : q.type === "object-to-symbol"
          ? "Which sign pictures this object?"
          : "Which sign makes this sound?";

  const model = q.type === "object-to-symbol" ? modelForGlyph(q.glyph.symbol) : undefined;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lesson-sheet p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="lesson-label">
          {title}
          {effective === "silent" && <span className="ml-2 text-terracotta">(silent)</span>}
        </p>
        <p className="font-body text-xs text-sand-500">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>
      <div className="lesson-track mb-5" aria-hidden="true">
        <div style={{ width: `${(currentIndex / questions.length) * 100}%`, transition: "width 0.4s ease" }} />
      </div>
      {effective === "speed" && (
        <div className="ml-auto mb-3 w-28 h-1.5 rounded-full bg-obsidian-lighter overflow-hidden" aria-label={`${Math.ceil(timeLeft)} seconds left`}>
          <div className={`h-full transition-[width] duration-100 ${timeLeft < 2.5 ? "bg-terracotta" : "bg-gold-500"}`} style={{ width: `${(timeLeft / SPEED_SECONDS) * 100}%` }} />
        </div>
      )}

      <div className="lesson-inlay text-center mb-5 px-5 py-6 sm:py-8">
        <p className="font-body text-sm text-sand-200 mb-3">{prompt}</p>
        {q.type === "symbol-to-meaning" && <span className="lesson-inlay-glyph text-7xl sm:text-8xl inline-block">{q.glyph.symbol}</span>}
        {q.type === "meaning-to-symbol" && <span className="font-display text-2xl text-sand-100">{q.glyph.meaning}</span>}
        {q.type === "object-to-symbol" && model && (
          <div className="max-w-xs mx-auto">
            <SignStage model={model.model} variant="compact" stageKey={`quick-${currentIndex}`} />
            <p className="font-body text-xs text-sand-400 mt-2">{model.name}. Drag to turn it.</p>
          </div>
        )}
        {q.type === "sound-to-symbol" && (
          <button
            type="button"
            onClick={() => speak(toSpeakable(q.glyph.pronunciation))}
            className="inline-flex items-center gap-2 rounded-full ring-1 ring-gold-400/40 bg-gold-400/15 px-6 py-3 font-body text-base text-sand-100 hover:bg-gold-400/25 transition-colors"
          >
            <span aria-hidden="true">▶</span> Hear it again
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option, i) => {
          const state = !showFeedback ? undefined : option === correctAnswer ? "right" : option === selectedAnswer ? "wrong" : "spent";
          return (
            <button key={i} onClick={() => handleAnswer(option)} disabled={showFeedback} data-state={state} className={`lesson-option text-center ${wantsSymbol ? "py-4" : "px-3 py-3.5 min-h-[3.5rem]"}`}>
              <span className={wantsSymbol ? "text-4xl text-gold-400" : "font-body text-sm text-sand-200"} style={wantsSymbol ? GLYPH : undefined}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
      {effective === "silent" && (
        <div className="flex justify-center gap-1.5 mt-4">
          {questions.map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i < currentIndex ? "bg-sand-500" : i === currentIndex ? "bg-gold-400" : "bg-obsidian-lighter border border-gold-700/20"}`} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
