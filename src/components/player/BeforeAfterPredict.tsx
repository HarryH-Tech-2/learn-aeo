"use client";

import { useState } from "react";
import type { BeforeAfterExample } from "@/lib/lesson-types";
import { afterFirst } from "@/lib/concept-confidence";
import { trackEvent } from "@/lib/analytics";
import { FOCUS } from "./ui";

/**
 * A concept's before/after example as a prediction: the two versions appear unlabeled, the learner picks the one
 * that works better, then both are revealed with the note. "Just show me" skips the guess.
 */
export default function BeforeAfterPredict({ example, conceptId }: { example: BeforeAfterExample; conceptId: string }) {
  const [picked, setPicked] = useState<"before" | "after" | "skip" | null>(null);
  const revealed = picked !== null;
  // Shuffled while guessing; back in before/after order once revealed, because notes say "the second version"
  const order: ("before" | "after")[] = !revealed && afterFirst(conceptId) ? ["after", "before"] : ["before", "after"];

  const choose = (side: "before" | "after") => {
    if (revealed) return;
    setPicked(side);
    trackEvent("example_predict", { concept_id: conceptId, right: side === "after" ? 1 : 0 });
  };

  return (
    <figure className="space-y-3">
      <figcaption className="font-sans text-sm font-semibold text-sand-100">
        {revealed ? "The two versions" : "Which version would an AI answer be more likely to use? Tap one."}
      </figcaption>
      <div className="grid gap-3 md:grid-cols-2">
        {order.map((side, i) => {
          const isAfter = side === "after";
          const text = isAfter ? example.after : example.before;
          const mine = picked === side;
          return (
            <button
              key={side}
              type="button"
              onClick={() => choose(side)}
              disabled={revealed}
              aria-pressed={mine}
              className={`predict-card min-w-0 text-left ${FOCUS} ${
                revealed ? (isAfter ? "predict-card-good" : "predict-card-bad") : "predict-card-open"
              } ${mine ? "predict-card-mine" : ""}`}
            >
              <span className="mb-2 flex items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-[0.12em]">
                <span className={revealed ? (isAfter ? "text-cyan-400" : "text-sand-400") : "text-sand-400"}>
                  {revealed ? (isAfter ? "After (the improved version)" : "Before") : `Version ${i === 0 ? "A" : "B"}`}
                </span>
                {mine && <span className="normal-case tracking-normal text-sand-400">Your pick</span>}
              </span>
              <span className="block whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-sand-200 [overflow-wrap:anywhere]">{text}</span>
            </button>
          );
        })}
      </div>
      {revealed ? (
        <div className="max-w-[68ch] space-y-1" aria-live="polite">
          {picked !== "skip" && (
            <p className={`font-sans text-sm font-semibold ${picked === "after" ? "text-cyan-400" : "text-gold-400"}`}>
              {picked === "after" ? "Right: that's the improved version." : "Not quite: the other one is the improved version."}
            </p>
          )}
          <p className="font-sans text-sm leading-relaxed text-sand-400">{example.note}</p>
        </div>
      ) : (
        <button type="button" onClick={() => setPicked("skip")} className={`font-sans text-sm text-sand-400 underline underline-offset-4 hover:text-sand-200 ${FOCUS}`}>
          Just show me
        </button>
      )}
    </figure>
  );
}
