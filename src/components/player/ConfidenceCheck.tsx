"use client";

import type { Confidence } from "@/lib/concept-confidence";
import { FOCUS } from "./ui";

/** "How sure are you?" at the foot of a concept card. "Not sure yet" brings the idea back first in the end-of-lesson review. */
export default function ConfidenceCheck({ value, onChange }: { value: Confidence | undefined; onChange: (c: Confidence) => void }) {
  const opt = (c: Confidence, label: string, icon: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={value === c}
      onClick={() => onChange(c)}
      className={`confidence-btn ${value === c ? (c === "got" ? "confidence-btn-got" : "confidence-btn-shaky") : ""} ${FOCUS}`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
  return (
    <div className="confidence-check">
      <p id="confidence-label" className="font-sans text-sm font-semibold text-sand-100">
        How sure are you about this one?
      </p>
      <div role="radiogroup" aria-labelledby="confidence-label" className="flex flex-wrap gap-2">
        {opt("got", "Got it", "👍")}
        {opt("shaky", "Not sure yet", "🤔")}
      </div>
      <p className="font-sans text-xs text-sand-400 min-h-[1rem]" aria-live="polite">
        {value === "shaky" ? "It'll come up first in the review at the end of the lesson." : value === "got" ? "Nice. You'll still see it once in the review." : ""}
      </p>
    </div>
  );
}
