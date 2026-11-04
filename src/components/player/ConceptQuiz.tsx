"use client";

import { useState } from "react";
import type { Question } from "@/lib/lesson-types";
import { trackEvent } from "@/lib/analytics";
import QuestionCard from "./QuestionCard";

/** A concept's own quick question, asked on the card as soon as the idea is explained (practice, no XP). */
export default function ConceptQuiz({ question, conceptId }: { question: Question; conceptId: string }) {
  const [result, setResult] = useState<boolean | null>(null);
  return (
    <section aria-label="Quick question" className="concept-quiz">
      <p className="concept-quiz-label">
        <span aria-hidden="true">⚡</span> Quick question
      </p>
      {result === null ? (
        <QuestionCard
          question={question}
          mode="practice"
          onAnswered={(right) => {
            setResult(right);
            trackEvent("concept_quiz", { concept_id: conceptId, right: right ? 1 : 0 });
          }}
        />
      ) : (
        <p className="font-sans text-base text-sand-200" aria-live="polite">
          {result ? "Got it first time. Read on." : "Done. The explanation above covers why."}
        </p>
      )}
    </section>
  );
}
