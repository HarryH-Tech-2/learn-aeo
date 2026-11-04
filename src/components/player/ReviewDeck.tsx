"use client";

import { useEffect, useMemo, useState } from "react";
import type { Concept } from "@/lib/lesson-types";
import { readConfidence, reviewOrder, writeConfidence, type ConfidenceMap } from "@/lib/concept-confidence";
import { trackEvent } from "@/lib/analytics";
import { BTN_PRIMARY, BTN_SECONDARY, FOCUS } from "./ui";

/**
 * End-of-lesson flashcards: every concept's name on the front, its one-line summary on the back. "Not sure yet"
 * ideas come first. "Knew it" retires a card; "Review again" sends it to the back of the pile.
 */
export default function ReviewDeck({ lessonId, concepts }: { lessonId: string; concepts: Concept[] }) {
  const [map, setMap] = useState<ConfidenceMap>({});
  const [started, setStarted] = useState(false);
  const [pile, setPile] = useState<Concept[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(0);

  useEffect(() => setMap(readConfidence(lessonId)), [lessonId]);
  const shaky = useMemo(() => concepts.filter((c) => map[c.id] === "shaky").length, [concepts, map]);

  const start = () => {
    setPile(reviewOrder(concepts, map));
    setStarted(true);
    setFlipped(false);
    setSeen(0);
    trackEvent("lesson_review_start", { lesson_id: lessonId, cards: concepts.length });
  };

  const card = pile[0];

  const answer = (knew: boolean) => {
    if (!card) return;
    const next: ConfidenceMap = { ...map, [card.id]: knew ? "got" : "shaky" };
    setMap(next);
    writeConfidence(lessonId, next);
    setSeen((n) => n + 1);
    setFlipped(false);
    setPile((p) => (knew ? p.slice(1) : [...p.slice(1), p[0]]));
    if (knew && pile.length === 1) trackEvent("lesson_review_complete", { lesson_id: lessonId });
  };

  // Space or Enter flips the card when the deck has focus
  const onKey = (e: React.KeyboardEvent) => {
    if ((e.key === " " || e.key === "Enter") && !flipped && e.target === e.currentTarget) {
      e.preventDefault();
      setFlipped(true);
    }
  };

  if (!concepts.length) return null;

  return (
    <section aria-labelledby="review-title" className="review-deck">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h3 id="review-title" className="font-display text-xl font-bold text-sand-100">
          Review the key ideas
        </h3>
        <p className="font-sans text-sm text-sand-400">
          {started
            ? card
              ? `${pile.length} ${pile.length === 1 ? "card" : "cards"} left`
              : `All ${concepts.length} reviewed`
            : `${concepts.length} cards${shaky ? ` · ${shaky} marked “not sure”` : ""}`}
        </p>
      </div>

      {!started ? (
        <div className="space-y-3">
          <p className="font-sans text-base text-sand-300">
            A two-minute recap: see each idea&rsquo;s name, recall what it means, then flip to check.
            {shaky ? " The ones you weren't sure about come first." : ""}
          </p>
          <button type="button" className={BTN_PRIMARY} onClick={start}>
            Start the review
          </button>
        </div>
      ) : card ? (
        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            aria-label={flipped ? `${card.term}: ${card.summary}` : `${card.term}. Press to show what it means.`}
            onClick={() => setFlipped(true)}
            onKeyDown={onKey}
            className={`flip-card ${flipped ? "flip-card-on" : ""} ${FOCUS}`}
          >
            <div className="flip-card-inner">
              <div className="flip-face flip-front">
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-cyan-400">What does this mean?</span>
                <span className="font-display text-2xl md:text-3xl font-bold text-sand-100 text-center">{card.term}</span>
                <span className="font-sans text-sm text-sand-400">Tap to flip</span>
              </div>
              <div className="flip-face flip-back" aria-hidden={!flipped}>
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-cyan-400">{card.term}</span>
                <span className="font-sans text-lg leading-relaxed text-sand-100 text-center">{card.summary}</span>
              </div>
            </div>
          </div>
          {flipped ? (
            <div className="flex flex-wrap gap-3">
              <button type="button" className={BTN_PRIMARY} onClick={() => answer(true)}>
                Knew it
              </button>
              <button type="button" className={BTN_SECONDARY} onClick={() => answer(false)}>
                Review again
              </button>
            </div>
          ) : (
            <button type="button" className={BTN_SECONDARY} onClick={() => setFlipped(true)}>
              Show the answer
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3" aria-live="polite">
          <p className="font-sans text-base text-sand-200">
            Done: {concepts.length} ideas in {seen} {seen === 1 ? "flip" : "flips"}.
            {seen === concepts.length ? " You knew every one first time." : ""}
          </p>
          <button type="button" className={`font-sans text-sm text-cyan-400 underline underline-offset-4 ${FOCUS}`} onClick={start}>
            Go through them again
          </button>
        </div>
      )}
    </section>
  );
}
