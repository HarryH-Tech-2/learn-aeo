"use client";

import type { Question } from "@/lib/lesson-types";
import { isLessonComplete } from "@/lib/pass-mark";
import { BTN_PRIMARY, BTN_SECONDARY, EYEBROW, HEADING, PROSE } from "./ui";

/** The lowest score that passes, by the same rule as the server. */
export function passMark(total: number): number {
  for (let k = 0; k <= total; k++) if (isLessonComplete(k, total)) return k;
  return total;
}

type Props = {
  questions: Question[];
  /** Whether each audit answer was right, in question order. */
  answers: boolean[];
  onRetake: () => void;
  onContinue?: () => void;
};

export default function AuditResult({ questions, answers, onRetake, onContinue }: Props) {
  const total = questions.length;
  const score = answers.filter(Boolean).length;
  const passed = isLessonComplete(score, total);

  return (
    <article className="space-y-7">
      <header className="space-y-2">
        <p className={EYEBROW}>Audit result</p>
        <h2 className={HEADING}>
          {score} of {total}
        </h2>
        <p className={`${PROSE} text-lg`}>
          {passed
            ? score === total
              ? "A perfect audit. You passed."
              : `You passed. The pass mark is ${passMark(total)} of ${total}.`
            : `Not this time. You need ${passMark(total)} of ${total} to pass. Read the explanations below, then retake the audit.`}
        </p>
      </header>

      <ol className="space-y-4">
        {questions.map((q, i) => {
          const right = answers[i] === true;
          return (
            <li
              key={`${i}:${q.id}`}
              className={`rounded-xl border-l-2 bg-obsidian-lighter py-3 pl-4 pr-4 ${right ? "border-cyan-500" : "border-gold-500"}`}
            >
              <p className={`font-sans text-xs font-semibold uppercase tracking-[0.12em] ${right ? "text-cyan-400" : "text-gold-400"}`}>
                Question {i + 1} · {right ? "Right" : "Missed"}
              </p>
              <p className="mt-1 max-w-[68ch] font-sans text-base font-semibold leading-snug text-sand-100">{q.prompt}</p>
              <p className="mt-1.5 max-w-[68ch] font-sans text-sm leading-relaxed text-sand-300">{q.explanation}</p>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-3">
        <button type="button" className={passed ? BTN_SECONDARY : BTN_PRIMARY} onClick={onRetake}>
          Retake the audit
        </button>
        {onContinue && (
          <button type="button" className={passed ? BTN_PRIMARY : BTN_SECONDARY} onClick={onContinue}>
            Continue
          </button>
        )}
      </div>
    </article>
  );
}
