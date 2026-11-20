"use client";

// The moving parts of a concept card shown a beat at a time (src/lib/concept-beats.ts).

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FOCUS, PROSE } from "./ui";

/** One beat. A beat that has just been revealed slides in and is brought into view. */
export function BeatReveal({ fresh, children }: { fresh: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!fresh || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = el.getBoundingClientRect();
    // only scroll when the new beat starts in the lower part of the screen or below it
    if (rect.top > window.innerHeight * 0.55) {
      window.scrollTo({ top: window.scrollY + rect.top - window.innerHeight * 0.3, behavior: reduce ? "auto" : "smooth" });
    }
  }, [fresh]);
  return (
    <div ref={ref} className={fresh ? "beat beat-in" : "beat"}>
      {children}
    </div>
  );
}

/** How far through the card's beats the learner is. */
export function BeatDots({ shown, total }: { shown: number; total: number }) {
  return (
    <p className="beat-dots" role="img" aria-label={`Part ${shown} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < shown ? "beat-dot beat-dot-on" : "beat-dot"} />
      ))}
    </p>
  );
}

/** The pitfall, hidden behind a prompt so the learner guesses the mistake before reading it. */
export function PitfallReveal({ text, startOpen }: { text: string; startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen);
  if (open) {
    return (
      <section className="beat-in max-w-[68ch] rounded-r-xl border-l-2 border-gold-500 bg-gold-500/5 py-3 pl-4 pr-4">
        <h3 className="mb-1.5 font-sans text-sm font-semibold text-gold-400">Pitfall</h3>
        <p className={PROSE}>{text}</p>
      </section>
    );
  }
  return (
    <button type="button" onClick={() => setOpen(true)} className={`pitfall-card ${FOCUS}`}>
      <span className="pitfall-card-label">Pitfall</span>
      <span className="font-sans text-base font-semibold text-sand-100">Where do people go wrong with this?</span>
      <span className="font-sans text-sm text-sand-400">Make a guess, then tap to check.</span>
    </button>
  );
}
