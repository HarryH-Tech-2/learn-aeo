"use client";

import { useMemo, useState } from "react";
import { PASSAGE_LETTERS, displayOrder, optionClass, type QuestionInputProps } from "../ui";

export default function PassageQuestion({ question, locked, onChange }: QuestionInputProps<"passage">) {
  const order = useMemo(() => displayOrder(2, question.id) as (0 | 1)[], [question.id]);
  const [picked, setPicked] = useState<0 | 1 | null>(null);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {order.map((original, pos) => (
        <button
          key={original}
          type="button"
          aria-pressed={picked === original}
          disabled={locked}
          onClick={() => {
            setPicked(original);
            onChange({ kind: "passage", index: original });
          }}
          className={`${optionClass(picked === original)} h-full`}
        >
          <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400">
            Passage {PASSAGE_LETTERS[pos]}
          </span>
          <span className="block">{question.passages[original]}</span>
        </button>
      ))}
    </div>
  );
}
