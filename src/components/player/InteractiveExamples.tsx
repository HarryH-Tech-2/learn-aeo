"use client";

// The hands-on concept examples (src/lib/lesson-types.ts): a process stepped through one stage at a time, a set
// of switches that must all be on before a page is cited, and a question fanned out into the searches behind it.
// Each keeps its own state and earns no XP: they are for understanding, like the quick question on a card.

import { useState } from "react";
import type { FanOutExample, GatesExample, WalkthroughExample } from "@/lib/lesson-types";
import { trackEvent } from "@/lib/analytics";
import { BTN_SECONDARY, FOCUS } from "./ui";

const FRAME = "min-w-0 space-y-4 rounded-xl border border-sand-500/30 bg-obsidian p-4 sm:p-5";
const TAG = "font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400";
const TITLE = "font-sans text-base font-semibold text-sand-100";
const SMALL = "font-sans text-sm leading-relaxed text-sand-400";
const BODY = "font-sans text-[0.95rem] leading-relaxed text-sand-200";
const MONO =
  "overflow-x-auto whitespace-pre-wrap rounded-lg border border-sand-500/20 bg-obsidian-lighter p-3 font-mono text-[0.82rem] leading-relaxed text-sand-200 [overflow-wrap:anywhere]";

/** A process shown one stage at a time. The learner taps through; earlier stages stay on screen. */
export function Walkthrough({ example, conceptId }: { example: WalkthroughExample; conceptId: string }) {
  const [shown, setShown] = useState(1);
  const total = example.steps.length;
  const done = shown >= total;

  const next = () => {
    const n = Math.min(total, shown + 1);
    setShown(n);
    if (n === total) trackEvent("example_walkthrough_done", { concept_id: conceptId });
  };

  return (
    <figure className={FRAME}>
      <figcaption className="space-y-1">
        <p className={TAG}>Step through it</p>
        <p className={TITLE}>{example.title}</p>
      </figcaption>
      <ol className="space-y-3">
        {example.steps.slice(0, shown).map((step, i) => (
          <li key={step.label} className={`flex gap-3 ${i === shown - 1 && i > 0 ? "beat-in" : ""}`}>
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-500/50 bg-cyan-500/10 font-sans text-xs font-semibold text-cyan-400"
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-sans text-sm font-semibold text-sand-100">{step.label}</p>
              <p className={BODY}>{step.text}</p>
              {step.code && <pre className={MONO}>{step.code}</pre>}
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-live="polite">
        {done ? (
          example.note && <p className={SMALL}>{example.note}</p>
        ) : (
          <>
            <button type="button" onClick={next} className={BTN_SECONDARY}>
              Next: {example.steps[shown].label}
            </button>
            <span className={SMALL}>
              Step {shown} of {total}
            </span>
          </>
        )}
      </div>
    </figure>
  );
}

/**
 * A page's path to a citation as a row of switches. Every one has to be on. The first one that is off is where
 * the page drops out, and the result names it and says why.
 */
export function GateSimulator({ example, conceptId }: { example: GatesExample; conceptId: string }) {
  const [on, setOn] = useState<boolean[]>(() => example.gates.map((g) => g.on));
  const [solved, setSolved] = useState(false);
  const stop = on.indexOf(false);
  const passed = stop === -1;

  const toggle = (i: number) => {
    const nextOn = on.map((v, j) => (j === i ? !v : v));
    setOn(nextOn);
    if (!solved && nextOn.every(Boolean)) {
      setSolved(true);
      trackEvent("example_gates_solved", { concept_id: conceptId });
    }
  };

  return (
    <figure className={FRAME}>
      <figcaption className="space-y-1">
        <p className={TAG}>Try it</p>
        <p className={TITLE}>{example.title}</p>
        <p className={SMALL}>{example.intro}</p>
      </figcaption>
      <ol className="space-y-2">
        {example.gates.map((gate, i) => {
          const reached = passed || i <= stop;
          return (
            <li key={gate.label}>
              <button
                type="button"
                role="switch"
                aria-checked={on[i]}
                onClick={() => toggle(i)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${FOCUS} ${
                  on[i] ? "border-cyan-500/50 bg-cyan-500/10" : "border-sand-500/35 bg-obsidian-lighter"
                } ${reached ? "" : "opacity-55"}`}
              >
                <span
                  aria-hidden="true"
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on[i] ? "bg-cyan-500" : "bg-sand-500/50"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-obsidian transition-[left] duration-200 ${on[i] ? "left-[1.375rem]" : "left-0.5"}`}
                  />
                </span>
                <span className="min-w-0 flex-1 font-sans text-[0.95rem] leading-snug text-sand-100">
                  <span className="mr-2 text-sand-400">{i + 1}.</span>
                  {gate.label}
                </span>
                <span className={`shrink-0 font-sans text-xs font-semibold uppercase tracking-[0.1em] ${on[i] ? "text-cyan-400" : "text-sand-400"}`}>
                  {on[i] ? "Yes" : "No"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div
        aria-live="polite"
        className={`rounded-xl border-l-2 py-3 pl-4 pr-4 ${passed ? "border-cyan-500 bg-cyan-500/10" : "border-gold-500 bg-gold-500/5"}`}
      >
        <p className={`font-sans text-sm font-semibold ${passed ? "text-cyan-400" : "text-gold-400"}`}>
          {passed ? "Result: the page can be cited" : `Result: the page drops out at step ${stop + 1}`}
        </p>
        <p className={`mt-1 ${BODY}`}>{passed ? example.pass : example.gates[stop].offReason}</p>
      </div>
    </figure>
  );
}

/** One question and the searches it fans out into. Tapping a search shows the passage it brings back. */
export function FanOutExplorer({ example, conceptId }: { example: FanOutExample; conceptId: string }) {
  const [run, setRun] = useState<number[]>([]);
  const allRun = run.length === example.queries.length;

  const open = (i: number) => {
    if (run.includes(i)) return;
    const next = [...run, i];
    setRun(next);
    if (next.length === example.queries.length) trackEvent("example_fanout_done", { concept_id: conceptId });
  };

  return (
    <figure className={FRAME}>
      <figcaption className="space-y-2">
        <p className={TAG}>Try it</p>
        <p className={TITLE}>One question, several searches</p>
        <p className="rounded-lg border border-sand-500/25 bg-obsidian-lighter px-3.5 py-2.5 font-sans text-[0.95rem] text-sand-100">
          <span className="mr-2 text-sand-400">The question:</span>
          {example.prompt}
        </p>
        <p className={SMALL}>
          {allRun ? "Every search has run." : "Tap each search to run it and see the passage it brings back."} {run.length} of {example.queries.length} run.
        </p>
      </figcaption>
      <ul className="space-y-2">
        {example.queries.map((q, i) => {
          const isRun = run.includes(i);
          return (
            <li key={q.query} className="rounded-xl border border-sand-500/30 bg-obsidian-lighter">
              <button
                type="button"
                onClick={() => open(i)}
                aria-expanded={isRun}
                disabled={isRun}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left disabled:cursor-default ${FOCUS}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 shrink-0 ${isRun ? "text-cyan-400" : "text-sand-400"}`}>
                  <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <span className="min-w-0 flex-1 font-mono text-[0.85rem] text-sand-100 [overflow-wrap:anywhere]">{q.query}</span>
                {!isRun && <span className="shrink-0 font-sans text-xs font-semibold text-cyan-400">Run</span>}
              </button>
              {isRun && (
                <div className="beat-in space-y-2 border-t border-sand-500/20 px-3.5 py-3">
                  <p className={BODY}>&ldquo;{q.passage}&rdquo;</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs">
                    <span className="font-mono text-sand-400 [overflow-wrap:anywhere]">{q.source}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-[0.08em] ${
                        q.cited ? "bg-cyan-500/15 text-cyan-400" : "bg-sand-500/15 text-sand-400"
                      }`}
                    >
                      {q.cited ? "Cited in the answer" : "Retrieved, not cited"}
                    </span>
                  </p>
                  {q.why && <p className={SMALL}>{q.why}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {allRun && (
        <p className={`beat-in ${SMALL}`} aria-live="polite">
          {example.note}
        </p>
      )}
    </figure>
  );
}
