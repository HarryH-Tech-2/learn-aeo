"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { DecodeQuestion } from "@/lib/exercises";
import { trackExerciseAnswer } from "@/lib/analytics";

type Props = {
  question: DecodeQuestion;
  onComplete: (correct: boolean) => void;
};

export default function DecodeInscription({ question, onComplete }: Props) {
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  function handleSubmit() {
    const userAnswer = question.mode === "multiple-choice" ? selectedOption : answer;
    if (!userAnswer) return;
    const isCorrect =
      question.mode === "multiple-choice"
        ? userAnswer === question.correctTranslation
        : userAnswer.trim().toLowerCase() === question.correctTranslation.trim().toLowerCase();
    setCorrect(isCorrect);
    setSubmitted(true);
    trackExerciseAnswer({ exercise: "decode", questionType: question.mode, question: question.correctTranslation, correct: isCorrect });
    onComplete(isCorrect);
  }

  return (
    <div className="card-ancient p-6 md:p-8">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-2">Decode the Inscription</p>
      <p className="font-body text-xs text-sand-600 mb-6">Read this artifact and provide the translation.</p>
      <div className="flex items-center justify-center gap-4 p-8 bg-obsidian-lighter border border-gold-700/10 mb-6">
        {question.glyphSequence.map((symbol, i) => (
          <span key={i} className="text-6xl text-gold-400"
            style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif", textShadow: "0 0 40px rgba(212,168,50,0.15)" }}>{symbol}</span>
        ))}
      </div>
      {question.mode === "multiple-choice" && question.options && (
        <div className="space-y-3 mb-6">
          {question.options.map((option, i) => {
            let className = "w-full text-left p-4 border transition-all duration-200 ";
            if (submitted) {
              if (option === question.correctTranslation) className += "border-green-500/50 bg-green-500/10 text-green-300";
              else if (option === selectedOption && !correct) className += "border-red-500/50 bg-red-500/10 text-red-300";
              else className += "border-gold-700/10 bg-obsidian-lighter text-sand-500 opacity-50";
            } else {
              className += selectedOption === option
                ? "border-gold-500/50 bg-gold-500/10 text-gold-300"
                : "border-gold-700/10 bg-obsidian-lighter text-sand-300 hover:border-gold-500/30 cursor-pointer";
            }
            return (
              <button key={i} onClick={() => !submitted && setSelectedOption(option)} disabled={submitted} className={className}>
                <span className="font-body text-sm">{option}</span>
              </button>
            );
          })}
        </div>
      )}
      {question.mode === "free-text" && (
        <div className="mb-6">
          <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
            disabled={submitted} placeholder="Type your translation..."
            className="w-full p-4 bg-obsidian-lighter border border-gold-700/10 text-sand-100 font-body text-sm placeholder:text-sand-600 focus:outline-none focus:border-gold-500/30" />
        </div>
      )}
      {submitted && (
        <div className={`p-4 border mb-4 ${correct ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}>
          <p className={`font-body text-sm ${correct ? "text-green-300" : "text-red-300"}`}>
            {correct ? "Correct!" : `Incorrect. The translation is: ${question.correctTranslation}`}
          </p>
        </div>
      )}
      {!submitted && (selectedOption || answer.trim()) && (
        <button onClick={handleSubmit} className="btn-primary py-3 px-6 text-sm w-full justify-center">Submit Translation</button>
      )}
    </div>
  );
}
