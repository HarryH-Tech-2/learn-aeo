"use client";

import { useEffect, useRef, useState } from "react";
import { moveItem } from "@/lib/questions";
import { FOCUS, startingOrder, type QuestionInputProps } from "../ui";

type Dir = "up" | "down";

/** Reorder with "Move up" / "Move down" buttons: keyboard and touch friendly, no drag library. */
export default function OrderQuestion({ question, locked, onChange }: QuestionInputProps<"order">) {
  // rows are tracked by their original index, so duplicate item text cannot collide
  const [order, setOrder] = useState(() => startingOrder(question.items.length, question.id));
  const [refocus, setRefocus] = useState<{ row: number; dir: Dir } | null>(null);
  const report = (rows: number[]) => onChange({ kind: "order", order: rows.map((r) => question.items[r]) });
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  // The order is always a complete answer, so report the starting one.
  useEffect(() => {
    report(order);
    // once, on mount: later changes are reported from move()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A moved row can lose focus when React reorders the list; put it back on the
  // same button, or on the other one when the row has reached an end.
  useEffect(() => {
    if (!refocus) return;
    const same = buttons.current.get(`${refocus.row}:${refocus.dir}`);
    const other = buttons.current.get(`${refocus.row}:${refocus.dir === "up" ? "down" : "up"}`);
    (same && !same.disabled ? same : other)?.focus();
    setRefocus(null);
  }, [refocus]);

  const move = (from: number, dir: Dir) => {
    const next = moveItem(order, from, dir === "up" ? -1 : 1);
    setOrder(next);
    setRefocus({ row: order[from], dir });
    report(next);
  };

  const arrowBtn = `inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-500/40 text-sand-200 transition-colors enabled:hover:border-cyan-500 enabled:hover:text-cyan-400 disabled:opacity-30 ${FOCUS}`;

  return (
    <ol className="space-y-2.5">
      {order.map((row, i) => {
        const item = question.items[row];
        return (
        <li
          key={row}
          className="flex items-center gap-3 rounded-xl border border-sand-500/35 bg-obsidian-lighter py-2 pl-4 pr-2"
        >
          <span className="w-5 shrink-0 font-sans text-sm font-semibold text-cyan-400" aria-hidden="true">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 font-sans text-[0.95rem] leading-relaxed text-sand-200">{item}</span>
          <span className="flex shrink-0 gap-1.5">
            <button
              type="button"
              ref={(el) => {
                if (el) buttons.current.set(`${row}:up`, el);
                else buttons.current.delete(`${row}:up`);
              }}
              aria-label={`Move ${item} up`}
              disabled={locked || i === 0}
              onClick={() => move(i, "up")}
              className={arrowBtn}
            >
              <span aria-hidden="true">↑</span>
            </button>
            <button
              type="button"
              ref={(el) => {
                if (el) buttons.current.set(`${row}:down`, el);
                else buttons.current.delete(`${row}:down`);
              }}
              aria-label={`Move ${item} down`}
              disabled={locked || i === order.length - 1}
              onClick={() => move(i, "down")}
              className={arrowBtn}
            >
              <span aria-hidden="true">↓</span>
            </button>
          </span>
        </li>
        );
      })}
    </ol>
  );
}
