"use client";

import { useState } from "react";
import { FOCUS, LANGUAGE_LABEL, type QuestionInputProps } from "../ui";

/** A snippet where every line is a button: pick the one at fault. */
export default function SpotQuestion({ question, locked, onChange }: QuestionInputProps<"spot">) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-sand-500/30 bg-obsidian">
      <p className="border-b border-sand-500/20 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400">
        {LANGUAGE_LABEL[question.language]}
      </p>
      <div className="overflow-x-auto py-2">
        <ul className="w-max min-w-full" role="list">
          {question.lines.map((line, i) => (
            <li key={i}>
              <button
                type="button"
                aria-pressed={picked === i}
                disabled={locked}
                onClick={() => {
                  setPicked(i);
                  onChange({ kind: "spot", line: i });
                }}
                className={`flex w-full gap-4 whitespace-pre px-4 py-2 text-left font-mono text-[0.85rem] leading-relaxed transition-colors disabled:cursor-default ${FOCUS} focus-visible:outline-offset-[-2px] ${
                  picked === i
                    ? "bg-cyan-500/15 text-sand-100 shadow-[inset_3px_0_0_0_var(--color-cyan-500)]"
                    : "text-sand-200 enabled:hover:bg-obsidian-lighter"
                }`}
              >
                <span className="w-6 shrink-0 select-none text-right text-sand-500" aria-hidden="true">
                  {i + 1}
                </span>
                <span>{line}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
