"use client";

import { Fragment, useMemo, useState } from "react";
import { blankCount, seedFrom, shuffled } from "@/lib/questions";
import { FOCUS, type QuestionInputProps } from "../ui";

/** Text with each newline rendered as a line break. */
function withBreaks(text: string) {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

/** Word-bank chips fill the gaps in order; tapping a filled gap empties it. */
export default function BlankQuestion({ question, locked, onChange }: QuestionInputProps<"blank">) {
  const gaps = blankCount(question.text);
  const parts = question.text.split("___");
  const bank = useMemo(
    () => shuffled([...question.answers, ...question.distractors], seedFrom(question.id)),
    [question.answers, question.distractors, question.id],
  );
  // each gap holds the index of a bank chip, or null
  const [fills, setFills] = useState<(number | null)[]>(() => Array.from({ length: gaps }, () => null));

  const update = (next: (number | null)[]) => {
    setFills(next);
    onChange(next.every((f) => f !== null) ? { kind: "blank", fills: next.map((f) => bank[f as number]) } : null);
  };

  const fill = (chip: number) => {
    const gap = fills.indexOf(null);
    if (gap < 0) return;
    const next = [...fills];
    next[gap] = chip;
    update(next);
  };

  const clear = (gap: number) => {
    const next = [...fills];
    next[gap] = null;
    update(next);
  };

  const used = new Set(fills.filter((f): f is number => f !== null));

  return (
    <div className="space-y-5">
      <p className="max-w-[68ch] font-sans text-lg leading-[2.4] text-sand-200">
        {parts.map((part, i) => (
          <Fragment key={i}>
            {withBreaks(part)}
            {i < gaps &&
              (fills[i] === null ? (
                <span className="mx-1 inline-block min-w-[6rem] rounded-md border border-dashed border-sand-500/60 px-2 align-middle leading-8 text-sand-500">
                  <span className="sr-only">Gap {i + 1}, empty</span>
                  <span aria-hidden="true">&nbsp;</span>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => clear(i)}
                  aria-label={`Gap ${i + 1}: ${bank[fills[i] as number]}. Clear it`}
                  className={`mx-1 inline-block rounded-md border border-cyan-500 bg-cyan-500/10 px-2 align-middle font-semibold leading-8 text-sand-100 enabled:hover:bg-cyan-500/20 ${FOCUS}`}
                >
                  {bank[fills[i] as number]}
                </button>
              ))}
          </Fragment>
        ))}
      </p>

      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-sand-400" id={`${question.id}-bank`}>
          Word bank
        </p>
        <ul className="flex flex-wrap gap-2" role="list" aria-labelledby={`${question.id}-bank`}>
          {bank.map((word, j) => (
            <li key={j}>
              <button
                type="button"
                disabled={locked || used.has(j)}
                onClick={() => fill(j)}
                className={`rounded-full border border-sand-500/40 bg-obsidian-lighter px-4 py-2 font-sans text-sm text-sand-200 transition-colors enabled:hover:border-cyan-500 disabled:opacity-35 ${FOCUS}`}
              >
                {word}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
