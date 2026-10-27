"use client";

import { useMemo, useState } from "react";
import { pairUp } from "@/lib/questions";
import { FOCUS, displayOrder, type QuestionInputProps } from "../ui";

const LETTERS = "ABCDEFGHIJ";

/** Tap a term, then the definition that goes with it. */
export default function MatchQuestion({ question, locked, onChange }: QuestionInputProps<"match">) {
  const terms = question.pairs.map((p) => p.term);
  const definitions = useMemo(
    () => displayOrder(question.pairs.length, question.id).map((i) => question.pairs[i].definition),
    [question.pairs, question.id],
  );
  const letterOf = (d: string) => LETTERS[definitions.indexOf(d)] ?? "?";

  const [selected, setSelected] = useState<string | null>(null);
  const [paired, setPaired] = useState<Record<string, string>>({});
  const termFor = (d: string) => Object.keys(paired).find((t) => paired[t] === d);

  const pick = (definition: string) => {
    if (!selected) return;
    const next = pairUp(paired, selected, definition);
    setPaired(next);
    setSelected(terms.find((t) => !(t in next)) ?? null);
    onChange(terms.every((t) => t in next) ? { kind: "match", pairs: next } : null);
  };

  const card = (active: boolean, done: boolean) =>
    [
      "w-full rounded-xl border px-4 py-3 text-left font-sans text-[0.95rem] leading-relaxed transition-colors disabled:cursor-default",
      FOCUS,
      active
        ? "border-cyan-500 bg-cyan-500/15 text-sand-100"
        : done
          ? "border-cyan-500/40 bg-obsidian-lighter text-sand-200"
          : "border-sand-500/35 bg-obsidian-lighter text-sand-200 enabled:hover:border-cyan-500/70",
    ].join(" ");

  return (
    <div className="space-y-4">
      <p className="font-sans text-sm text-sand-400" aria-live="polite">
        {locked ? "" : selected ? `Now pick the definition for “${selected}”.` : "Pick a term, then its definition."}
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-sand-400">Terms</p>
          <ul className="space-y-2.5" role="list">
            {terms.map((t, i) => (
              <li key={`${i}:${t}`}>
                <button
                  type="button"
                  aria-pressed={selected === t}
                  disabled={locked}
                  onClick={() => setSelected(selected === t ? null : t)}
                  className={card(selected === t, t in paired)}
                >
                  <span className="block font-semibold text-sand-100">{t}</span>
                  <span className="mt-0.5 block text-xs text-sand-400">
                    {t in paired ? `Matched to ${letterOf(paired[t])}` : "Not matched yet"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-sand-400">Definitions</p>
          <ul className="space-y-2.5" role="list">
            {definitions.map((d, i) => {
              const owner = termFor(d);
              return (
                <li key={`${i}:${d}`}>
                  <button
                    type="button"
                    disabled={locked}
                    aria-disabled={!selected || undefined}
                    onClick={() => pick(d)}
                    className={card(false, owner !== undefined)}
                  >
                    <span className="mr-2 font-semibold text-cyan-400" aria-hidden="true">
                      {LETTERS[i]}
                    </span>
                    {d}
                    {owner && <span className="mt-0.5 block text-xs text-sand-400">Matched: {owner}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
