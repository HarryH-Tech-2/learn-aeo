"use client";

import { useMemo, useState } from "react";
import { displayOrder, optionClass, type QuestionInputProps } from "../ui";

export default function ChoiceQuestion({ question, locked, onChange }: QuestionInputProps<"choice">) {
  const order = useMemo(() => displayOrder(question.options.length, question.id), [question.options.length, question.id]);
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <ul className="space-y-2.5" role="list">
      {order.map((original) => (
        <li key={original}>
          <button
            type="button"
            aria-pressed={picked === original}
            disabled={locked}
            onClick={() => {
              setPicked(original);
              onChange({ kind: "choice", index: original });
            }}
            className={optionClass(picked === original)}
          >
            {question.options[original]}
          </button>
        </li>
      ))}
    </ul>
  );
}
