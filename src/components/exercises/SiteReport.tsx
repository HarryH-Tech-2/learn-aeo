"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SiteReportQuestion } from "@/lib/exercises";
import FillInBlank from "./FillInBlank";
import DecodeInscription from "./DecodeInscription";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { SPECIAL_LETTERS, checkTransliteration } from "@/lib/transliteration";

type Props = {
  questions: SiteReportQuestion[];
  onComplete: (score: number, total: number) => void;
};

export default function SiteReport({ questions, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  // right, but typed the keyboard way (kh for ḫ): the feedback shows the proper spelling
  const [closeSpelling, setCloseSpelling] = useState(false);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const question = questions[currentIndex];

  function handleMCAnswer(answer: string) {
    if (showFeedback) return;
    const q = question as { correctAnswer: string };
    const correct = answer === q.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setScore((s) => s + 1);
    trackExerciseAnswer({ exercise: "site-report", questionType: question.type, question: q.correctAnswer, correct });
  }

  function handleTransliterationSubmit() {
    if (showFeedback) return;
    const q = question as { correctAnswer: string };
    const grade = checkTransliteration(textInput, q.correctAnswer);
    const correct = grade !== "wrong";
    setIsCorrect(correct);
    setCloseSpelling(grade === "close");
    setShowFeedback(true);
    if (correct) setScore((s) => s + 1);
    trackExerciseAnswer({ exercise: "site-report", questionType: question.type, question: q.correctAnswer, correct });
  }

  // a letter key inserts at the caret and keeps the field focused
  function insertLetter(char: string) {
    const el = inputRef.current;
    const start = el?.selectionStart ?? textInput.length;
    const end = el?.selectionEnd ?? textInput.length;
    setTextInput(textInput.slice(0, start) + char + textInput.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + char.length, start + char.length);
    });
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      trackExerciseComplete({ exercise: "site-report", score, total: questions.length });
      onComplete(score, questions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setTextInput("");
      setShowFeedback(false);
      setIsCorrect(false);
      setCloseSpelling(false);
    }
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lesson-sheet p-8 md:p-10 text-center">
        <span className="text-5xl block mb-4">{passed ? "𓋹" : "𓂀"}</span>
        <h2 className="font-display text-3xl font-light text-sand-100 mb-2">Site Report Filed</h2>
        <p className="font-display text-5xl text-gold-400 mb-2">{score}/{questions.length}</p>
        <p className="font-body text-sm text-sand-400 mb-2">{pct}%</p>
        <p className="font-body text-sm text-sand-400 mb-8">
          {passed ? "Excellent fieldwork! Area cleared." : "Review your findings and try again."}
        </p>
      </motion.div>
    );
  }

  // Delegate fill-in-blank and decode to their own components
  if (question.type === "fill-in-blank") {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="font-body text-sm text-sand-500 font-semibold">Site Report</p>
          <p className="font-body text-xs text-gold-500">{currentIndex + 1}/{questions.length}</p>
        </div>
        <FillInBlank exercise={question.exercise} onComplete={(allCorrect) => {
          if (allCorrect) setScore((s) => s + 1);
          setTimeout(() => handleNext(), 1500);
        }} />
      </div>
    );
  }

  if (question.type === "decode") {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="font-body text-sm text-sand-500 font-semibold">Site Report</p>
          <p className="font-body text-xs text-gold-500">{currentIndex + 1}/{questions.length}</p>
        </div>
        <DecodeInscription question={question.question} onComplete={(correct) => {
          if (correct) setScore((s) => s + 1);
          setTimeout(() => handleNext(), 1500);
        }} />
      </div>
    );
  }

  // MC and transliteration questions rendered inline
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lesson-sheet p-8 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <p className="font-body text-sm text-sand-500 font-semibold">Site Report</p>
        <p className="font-body text-xs text-gold-500">{currentIndex + 1}/{questions.length}</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {(question.type === "symbol-to-meaning" || question.type === "transliteration") && (
            <div className="text-center mb-8">
              <p className="font-body text-xs text-sand-500 mb-3">
                {question.type === "symbol-to-meaning" ? "What does this sign mean?" : "Type the transliteration"}
              </p>
              <span className="text-7xl text-gold-400 inline-block" style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}>{question.prompt}</span>
            </div>
          )}
          {question.type === "meaning-to-symbol" && (
            <div className="text-center mb-8">
              <p className="font-body text-xs text-sand-500 mb-3">Which sign matches this meaning?</p>
              <p className="font-display text-xl text-sand-100">{question.prompt}</p>
            </div>
          )}
          {"options" in question && question.options && (
            <div className="space-y-3">
              {question.options.map((option, i) => {
                let cls = "w-full text-left p-4 border transition-all duration-200 ";
                if (showFeedback) {
                  if (option === question.correctAnswer) cls += "border-green-500/50 bg-green-500/10 text-green-300";
                  else if (option === selectedAnswer && !isCorrect) cls += "border-red-500/50 bg-red-500/10 text-red-300";
                  else cls += "border-gold-700/10 bg-obsidian-lighter text-sand-500 opacity-50";
                } else {
                  cls += "border-gold-700/10 bg-obsidian-lighter text-sand-300 hover:border-gold-500/30 cursor-pointer";
                }
                const isGlyph = question.type === "meaning-to-symbol";
                return (
                  <button key={i} onClick={() => handleMCAnswer(option)} disabled={showFeedback} className={cls}>
                    <span className={isGlyph ? "text-2xl" : "font-body text-sm"} style={isGlyph ? { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } : undefined}>{option}</span>
                  </button>
                );
              })}
            </div>
          )}
          {question.type === "transliteration" && (
            <div className="space-y-4">
              <input ref={inputRef} type="text" value={textInput} autoCapitalize="off" autoCorrect="off" spellCheck={false} onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !showFeedback && handleTransliterationSubmit()}
                disabled={showFeedback} placeholder="Type the sound, e.g. m or kh"
                className="w-full p-4 bg-obsidian-lighter border border-gold-700/10 text-sand-100 font-body text-sm placeholder:text-sand-600 focus:outline-none focus:border-gold-500/30 rounded-xl" />
              {!showFeedback && (
                <div>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Letters your keyboard may not have">
                    {SPECIAL_LETTERS.map((l) => (
                      <button key={l.char} type="button" onClick={() => insertLetter(l.char)} title={l.name} aria-label={`Type ${l.char}, ${l.name}`}
                        className="min-w-10 h-10 px-2 border border-gold-700/20 bg-obsidian-lighter text-sand-100 text-lg hover:border-gold-500/40 rounded-xl">
                        {l.char}
                      </button>
                    ))}
                  </div>
                  <p className="font-body text-xs text-sand-500 mt-2">
                    No special keys needed: 3 or a for ꜣ, a for ꜥ, i or j for ꞽ, kh for ḫ, sh for š, tj for ṯ, dj for ḏ.
                  </p>
                </div>
              )}
              {!showFeedback && <button onClick={handleTransliterationSubmit} disabled={!textInput.trim()} className="lesson-btn py-3 px-6 text-sm disabled:opacity-30">Submit</button>}
            </div>
          )}
          {showFeedback && (
            <div className={`mt-4 p-4 border ${isCorrect ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"} rounded-xl`}>
              <p className={`font-body text-sm ${isCorrect ? "text-green-300" : "text-red-300"}`}>
                {feedbackText(question as { correctAnswer: string }, isCorrect, closeSpelling)}
              </p>
            </div>
          )}
          {showFeedback && (
            <div className="mt-6 flex justify-end">
              <button onClick={handleNext} className="lesson-btn py-2.5 px-5 text-sm">
                {currentIndex + 1 >= questions.length ? "See Report" : "Next"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function feedbackText(q: { correctAnswer: string }, isCorrect: boolean, closeSpelling: boolean): string {
  if (!isCorrect) return `Incorrect. The answer is: ${q.correctAnswer}`;
  return closeSpelling ? `Correct! Egyptologists write it ${q.correctAnswer}.` : "Correct!";
}
