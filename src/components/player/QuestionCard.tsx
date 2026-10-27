"use client";

import { useState, type ReactNode } from "react";
import type { Question } from "@/lib/lesson-types";
import { checkAnswer, type QuestionResponse } from "@/lib/questions";
import ChoiceQuestion from "./questions/ChoiceQuestion";
import PassageQuestion from "./questions/PassageQuestion";
import BlankQuestion from "./questions/BlankQuestion";
import OrderQuestion from "./questions/OrderQuestion";
import MatchQuestion from "./questions/MatchQuestion";
import SpotQuestion from "./questions/SpotQuestion";
import { BTN_PRIMARY, PASSAGE_LETTERS, displayOrder } from "./ui";

export type QuestionCardProps = {
  question: Question;
  mode: "practice" | "audit";
  /**
   * Practice: called once, when the learner presses Continue, with whether the
   * first try was right (the only answer that earns XP). Audit: called as soon
   * as the answer is confirmed, with whether it was right; nothing is shown.
   */
  onAnswered: (correct: boolean) => void;
};

type Phase = "answering" | "right" | "wrong" | "revealed" | "done";

const HINT: Record<Question["kind"], string> = {
  choice: "Pick one answer.",
  passage: "Pick the passage.",
  blank: "Tap the words in the order the gaps appear. Tap a filled gap to clear it.",
  order: "Use the arrows to put the steps in order, first at the top.",
  match: "Tap a term, then the definition that goes with it.",
  spot: "Tap the line at fault.",
};

/** The right answer in words, shown after a second wrong try. */
function correctAnswer(q: Question): ReactNode {
  switch (q.kind) {
    case "choice":
      return q.options[q.answer];
    case "passage":
      return `Passage ${PASSAGE_LETTERS[displayOrder(2, q.id).indexOf(q.answer)]}`;
    case "blank":
      return q.answers.join(", ");
    case "order":
      return (
        <ol className="mt-1 list-decimal space-y-0.5 pl-5">
          {q.items.map((it, i) => (
            <li key={`${i}:${it}`}>{it}</li>
          ))}
        </ol>
      );
    case "match":
      return (
        <ul className="mt-1 space-y-0.5">
          {q.pairs.map((p, i) => (
            <li key={`${i}:${p.term}`}>
              <span className="font-semibold">{p.term}</span>: {p.definition}
            </li>
          ))}
        </ul>
      );
    case "spot":
      return `Line ${q.answer + 1}: ${q.lines[q.answer]}`;
  }
}

export default function QuestionCard({ question, mode, onAnswered }: QuestionCardProps) {
  const [response, setResponse] = useState<QuestionResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("answering");
  const [tries, setTries] = useState(0);
  const [firstTryRight, setFirstTryRight] = useState(false);
  // bumped on "Try again" to give the input a fresh start
  const [round, setRound] = useState(0);

  const locked = phase !== "answering";

  const submit = () => {
    if (!response) return;
    const right = checkAnswer(question, response);
    if (mode === "audit") {
      setPhase("done");
      onAnswered(right);
      return;
    }
    const n = tries + 1;
    setTries(n);
    if (n === 1) setFirstTryRight(right);
    setPhase(right ? "right" : n >= 2 ? "revealed" : "wrong");
  };

  const retry = () => {
    setResponse(null);
    setRound((r) => r + 1);
    setPhase("answering");
  };

  const proceed = () => {
    setPhase("done");
    onAnswered(firstTryRight);
  };

  const inputProps = { locked, onChange: setResponse };
  const key = `${question.id}:${round}`;
  let input: ReactNode;
  switch (question.kind) {
    case "choice":
      input = <ChoiceQuestion key={key} question={question} {...inputProps} />;
      break;
    case "passage":
      input = <PassageQuestion key={key} question={question} {...inputProps} />;
      break;
    case "blank":
      input = <BlankQuestion key={key} question={question} {...inputProps} />;
      break;
    case "order":
      input = <OrderQuestion key={key} question={question} {...inputProps} />;
      break;
    case "match":
      input = <MatchQuestion key={key} question={question} {...inputProps} />;
      break;
    case "spot":
      input = <SpotQuestion key={key} question={question} {...inputProps} />;
      break;
  }

  const feedback =
    phase === "right" || phase === "wrong" || phase === "revealed" ? (
      <div
        className={`rounded-xl border-l-2 py-3 pl-4 pr-4 ${
          phase === "right" ? "border-cyan-500 bg-cyan-500/10" : "border-gold-500 bg-gold-500/10"
        }`}
      >
        <p className={`font-sans text-sm font-semibold ${phase === "right" ? "text-cyan-400" : "text-gold-400"}`}>
          {phase === "right"
            ? tries === 1
              ? "Correct."
              : "Correct this time."
            : phase === "wrong"
              ? "Not quite. Have another go."
              : "Not quite. Here is the answer."}
        </p>
        {phase === "revealed" && (
          <div className="mt-2 font-sans text-sm leading-relaxed text-sand-100">
            <span className="text-sand-400">Answer: </span>
            {correctAnswer(question)}
          </div>
        )}
        {phase !== "wrong" && (
          <p className="mt-2 max-w-[68ch] font-sans text-sm leading-relaxed text-sand-300">{question.explanation}</p>
        )}
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <p className="max-w-[68ch] font-sans text-lg font-semibold leading-snug text-sand-100">{question.prompt}</p>
        <p className="font-sans text-sm text-sand-400">{HINT[question.kind]}</p>
      </div>

      {input}

      <div role="status" aria-live="polite">
        {feedback}
        {mode === "audit" && phase === "done" && <p className="font-sans text-sm text-sand-400">Answer saved.</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        {phase === "answering" && (
          <button type="button" className={BTN_PRIMARY} disabled={!response} onClick={submit}>
            {mode === "audit" ? "Confirm answer" : "Check answer"}
          </button>
        )}
        {phase === "wrong" && (
          <button type="button" className={BTN_PRIMARY} onClick={retry}>
            Try again
          </button>
        )}
        {(phase === "right" || phase === "revealed") && (
          <button type="button" className={BTN_PRIMARY} onClick={proceed}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
