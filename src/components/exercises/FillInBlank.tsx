"use client";

import { useState } from "react";
import type { FillInBlankExercise } from "@/lib/exercises";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";

type Props = {
  exercise: FillInBlankExercise;
  onComplete: (allCorrect: boolean) => void;
};

export default function FillInBlank({ exercise, onComplete }: Props) {
  // gap number → the word placed in it
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});

  function handlePlaceWord(word: string) {
    if (submitted) return;
    const nextGap = exercise.answers.findIndex((_, i) => !placed[i]);
    if (nextGap >= 0) setPlaced((p) => ({ ...p, [nextGap]: word }));
  }

  function handleSubmit() {
    const newResults: Record<number, boolean> = {};
    let allCorrect = true;
    exercise.answers.forEach((answer, i) => {
      const correct = placed[i] === answer;
      newResults[i] = correct;
      if (!correct) allCorrect = false;
    });
    setResults(newResults);
    setSubmitted(true);
    const correctCount = Object.values(newResults).filter(Boolean).length;
    trackExerciseAnswer({ exercise: "fill-blank", questionType: "fill-blank", question: exercise.answers.join(" | "), correct: allCorrect });
    trackExerciseComplete({ exercise: "fill-blank", score: correctCount, total: exercise.answers.length });
    onComplete(allCorrect);
  }

  const usedWords = new Set(Object.values(placed));
  const allGapsFilled = exercise.answers.every((_, i) => placed[i]);
  const segments = exercise.inscription.split("___");

  return (
    <div className="card-ancient p-6 md:p-8">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-2">Restore the Inscription</p>
      <p className="font-body text-xs text-sand-600 mb-6">Read each sign and fill the gaps with the right words. Tap a filled gap to clear it.</p>
      <div className="p-6 bg-obsidian-lighter border border-gold-700/10 mb-6">
        <p className="font-body text-lg text-sand-300 leading-loose">
          {segments.map((segment, i) => (
            <span key={i}>
              {segment}
              {i < segments.length - 1 && (
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => {
                    if (placed[i]) setPlaced((p) => { const copy = { ...p }; delete copy[i]; return copy; });
                  }}
                  aria-label={placed[i] ? `Gap ${i + 1}: ${placed[i]}. Clear it` : `Gap ${i + 1}, empty`}
                  className={`inline-flex items-center justify-center min-w-24 h-10 px-3 mx-1 border-2 border-dashed align-middle text-base ${
                    submitted ? results[i] ? "border-green-500/50 bg-green-500/10 text-green-300" : "border-red-500/50 bg-red-500/10 text-red-300"
                    : "border-gold-500/30 bg-gold-500/5 text-gold-300 cursor-pointer"
                  }`}
                >
                  {placed[i] ?? ""}
                </button>
              )}
            </span>
          ))}
        </p>
        {submitted && exercise.answers.some((_, i) => !results[i]) && (
          <p className="font-body text-sm text-sand-400 mt-4">
            The answer{exercise.answers.length > 1 ? "s" : ""}: {exercise.answers.join(", ")}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        {exercise.wordBank.map((word) => {
          const isUsed = usedWords.has(word);
          return (
            <button key={word} type="button" disabled={isUsed || submitted} onClick={() => handlePlaceWord(word)}
              className={`min-h-11 px-4 flex items-center justify-center border font-body text-base transition-colors ${
                isUsed ? "border-gold-700/10 bg-obsidian-lighter text-sand-500 opacity-30"
                : "border-gold-700/20 bg-obsidian-lighter text-sand-100 hover:border-gold-500/40 cursor-pointer"
              }`}>
              {word}
            </button>
          );
        })}
      </div>
      {!submitted && allGapsFilled && (
        <button onClick={handleSubmit} className="btn-primary py-3 px-6 text-sm w-full justify-center">Check Answer</button>
      )}
    </div>
  );
}
