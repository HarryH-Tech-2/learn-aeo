"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateQuestions, checkAnswer, type Question } from "@/lib/quiz";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";

type Glyph = {
  symbol: string;
  transliteration: string;
  meaning: string;
  pronunciation: string;
};

type Props = {
  glyphs: Glyph[];
  onRetry: () => void;
  onComplete?: (score: number, total: number) => void;
};

export default function LessonQuiz({ glyphs, onRetry, onComplete }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() =>
    generateQuestions(glyphs)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];

  function handleAnswer(answer: string) {
    if (showFeedback) return;
    const correct = checkAnswer(question.type, answer, question.correctAnswer);
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setScore((s) => s + 1);
    trackExerciseAnswer({ exercise: "quiz", questionType: question.type, question: question.correctAnswer, correct });
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      trackExerciseComplete({ exercise: "quiz", score, total: questions.length });
      onComplete?.(score, questions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setTextInput("");
      setShowFeedback(false);
    }
  }

  function handleRetry() {
    setQuestions(generateQuestions(glyphs));
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setTextInput("");
    setShowFeedback(false);
    setIsCorrect(false);
    setFinished(false);
    onRetry();
  }

  if (finished) {
    const message =
      score === questions.length
        ? "Perfect score! You have mastered these signs."
        : score >= Math.ceil(questions.length * 0.6)
        ? "Well done! You are progressing nicely."
        : "Keep studying; these signs will become familiar with practice.";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-ancient p-8 md:p-10 text-center"
      >
        <span className="text-5xl block mb-4">𓂀</span>
        <h2 className="font-display text-3xl font-light text-sand-100 mb-2">
          Quiz Complete
        </h2>
        <p className="font-display text-5xl text-gold-400 mb-4">
          {score}/{questions.length}
        </p>
        <p className="font-body text-sm text-sand-400 mb-8">{message}</p>
        <button onClick={handleRetry} className="btn-primary py-3 px-8 text-sm">
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-ancient p-8 md:p-10"
    >
      {/* Progress */}
      <div className="flex justify-between items-center mb-6">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500">
          Quiz
        </p>
        <p className="font-body text-xs text-gold-500">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question prompt */}
          {question.type === "symbol-to-meaning" && (
            <div className="text-center mb-8">
              <p className="font-body text-xs text-sand-500 mb-3">
                What does this sign mean?
              </p>
              <span
                className="text-7xl text-gold-400 inline-block"
                style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}
              >
                {question.prompt}
              </span>
            </div>
          )}

          {question.type === "meaning-to-symbol" && (
            <div className="text-center mb-8">
              <p className="font-body text-xs text-sand-500 mb-3">
                Which sign matches this meaning?
              </p>
              <p className="font-display text-xl text-sand-100">
                {question.prompt}
              </p>
            </div>
          )}

          {question.type === "transliteration" && (
            <div className="text-center mb-8">
              <p className="font-body text-xs text-sand-500 mb-3">
                Type the transliteration for this sign
              </p>
              <span
                className="text-7xl text-gold-400 inline-block"
                style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}
              >
                {question.prompt}
              </span>
            </div>
          )}

          {/* Answer options (multiple choice) */}
          {question.options && (
            <div className="space-y-3">
              {question.options.map((option, i) => {
                let className =
                  "w-full text-left p-4 border transition-all duration-200 ";

                if (showFeedback) {
                  if (option === question.correctAnswer) {
                    className += "border-green-500/50 bg-green-500/10 text-green-300";
                  } else if (option === selectedAnswer && !isCorrect) {
                    className += "border-red-500/50 bg-red-500/10 text-red-300";
                  } else {
                    className += "border-gold-700/10 bg-obsidian-lighter text-sand-500 opacity-50";
                  }
                } else {
                  className +=
                    "border-gold-700/10 bg-obsidian-lighter text-sand-300 hover:border-gold-500/30 hover:bg-gold-500/5 cursor-pointer";
                }

                const isSymbolOption = question.type === "meaning-to-symbol";

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className={className}
                  >
                    <span
                      className={isSymbolOption ? "text-2xl" : "font-body text-sm"}
                      style={
                        isSymbolOption
                          ? { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }
                          : undefined
                      }
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Transliteration text input */}
          {question.type === "transliteration" && (
            <div className="space-y-4">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && textInput.trim() && !showFeedback) {
                    handleAnswer(textInput);
                  }
                }}
                disabled={showFeedback}
                placeholder="Type your answer..."
                className="w-full p-4 bg-obsidian-lighter border border-gold-700/10 text-sand-100 font-body text-sm placeholder:text-sand-600 focus:outline-none focus:border-gold-500/30"
              />
              {!showFeedback && (
                <button
                  onClick={() => handleAnswer(textInput)}
                  disabled={!textInput.trim()}
                  className="btn-primary py-3 px-6 text-sm disabled:opacity-30"
                >
                  Submit
                </button>
              )}
              {showFeedback && (
                <div
                  className={`p-4 border ${
                    isCorrect
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-red-500/50 bg-red-500/10"
                  }`}
                >
                  <p
                    className={`font-body text-sm ${
                      isCorrect ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {isCorrect
                      ? "Correct!"
                      : `Incorrect. The answer is: ${question.correctAnswer}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feedback for multiple choice */}
          {showFeedback && question.options && (
            <div className="mt-4">
              <p
                className={`font-body text-sm ${
                  isCorrect ? "text-green-300" : "text-red-300"
                }`}
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </p>
            </div>
          )}

          {/* Next button */}
          {showFeedback && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                className="btn-primary py-2.5 px-5 text-sm"
              >
                {currentIndex + 1 >= questions.length
                  ? "See Results"
                  : "Next Question"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
