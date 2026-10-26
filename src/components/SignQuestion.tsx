"use client";

/**
 * One question from src/lib/sign-quiz.ts: four buttons, one tap, then the right answer with a line
 * about the sign and a button to go on. Used by the translator's "read it back" and the alphabet
 * chart's self-test. Remount it (key) for each new question.
 */
import { useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/sign-quiz";

type Props = {
  question: QuizQuestion;
  /** The words of the question; the sign or letter it is about is drawn by this component. */
  prompt: React.ReactNode;
  nextLabel: string;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  /** The component's own words, for the translated pages (src/lib/i18n.ts); English by default. */
  labels?: SignQuestionLabels;
};

export type SignQuestionLabels = { right: string; wrong: string; answers: string; sign: string };

const ENGLISH_LABELS: SignQuestionLabels = { right: "Right. ", wrong: "Not quite. ", answers: "Answers", sign: "Sign" };

export default function SignQuestion({ question, prompt, nextLabel, onAnswer, onNext, labels = ENGLISH_LABELS }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const nextRef = useRef<HTMLButtonElement>(null);

  // Keyboard users land on the way forward; the page must not scroll to it.
  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);
  const glyphOptions = question.kind === "sign";

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    onAnswer(i === question.answer);
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-4">
        {question.kind === "sound" && (
          <span className="hieroglyph-font text-5xl leading-none text-gold-400" lang="egy" aria-hidden="true">
            {question.subject}
          </span>
        )}
        <p className="font-display text-xl md:text-2xl text-sand-100 leading-snug">{prompt}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label={labels.answers}>
        {question.options.map((option, i) => {
          const right = i === question.answer;
          const state = !answered
            ? "border-gold-700/40 text-sand-100 hover:border-gold-400 hover:bg-gold-500/10 cursor-pointer"
            : right
              ? "border-green-500/50 bg-green-500/10 text-green-300"
              : i === picked
                ? "border-red-500/50 bg-red-500/10 text-red-300"
                : "border-gold-700/20 text-sand-600";
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => pick(i)}
              aria-label={glyphOptions ? `${labels.sign} ${i + 1}` : option}
              className={`flex min-h-[4.5rem] items-center justify-center border px-3 py-3 transition-colors ${state}`}
            >
              {glyphOptions ? (
                <span className="hieroglyph-font text-5xl leading-none" lang="egy">
                  {option}
                </span>
              ) : (
                <span className="font-body text-base font-medium">{option}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* The space is kept before they answer, so the page under the card does not jump. */}
      <div className="mt-4 flex min-h-[3.25rem] flex-col items-center justify-between gap-3 sm:flex-row" aria-live="polite">
        {answered && (
          <>
            <p className="font-body text-sm text-sand-300 leading-snug text-center sm:text-left">
              <span className={picked === question.answer ? "text-green-300 font-medium" : "text-red-300 font-medium"}>
                {picked === question.answer ? labels.right : labels.wrong}
              </span>
              {question.reveal}
            </p>
            <button ref={nextRef} type="button" onClick={onNext} className="btn-primary shrink-0 justify-center px-5 py-2.5 text-sm">
              {nextLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
