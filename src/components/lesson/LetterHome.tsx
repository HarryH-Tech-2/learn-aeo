"use client";

/**
 * Letter home: the Site Report is written up as a letter, and the learner
 * fills its gaps with the signs they just learned. The letters collect in
 * the field notebook as a diary of the whole course.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Hieroglyph } from "@/lib/legacy-lessons";
import { letterCorrect, renderLetter, type Letter } from "@/lib/expedition";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;

type Props = {
  letter: Letter;
  /** Signs of the lesson, for the tray of choices */
  glyphs: Hieroglyph[];
  /** A previously sent letter's glyphs, in gap order */
  sent?: string[];
  onSend: (glyphs: string[], allCorrect: boolean) => void;
};

export default function LetterHome({ letter, glyphs, sent, onSend }: Props) {
  const [filled, setFilled] = useState<Record<string, string>>(() =>
    sent ? Object.fromEntries(letter.gaps.map((g, i) => [g.key, sent[i]]).filter(([, v]) => !!v)) : {},
  );
  const [active, setActive] = useState<string | null>(() => letter.gaps.find((g) => !filled[g.key])?.key ?? null);
  const [submitted, setSubmitted] = useState(!!sent);

  const tray = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const g of letter.gaps) if (!seen.has(g.symbol)) (seen.add(g.symbol), out.push(g.symbol));
    for (const g of glyphs) if (!seen.has(g.symbol) && out.length < 8) (seen.add(g.symbol), out.push(g.symbol));
    // stable shuffle by code point so the answers aren't always first
    return out.sort((a, b) => a.codePointAt(0)! - b.codePointAt(0)!);
  }, [letter, glyphs]);

  const rendered = renderLetter(letter, filled);
  const complete = letter.gaps.every((g) => filled[g.key]);
  const correct = letterCorrect(letter, filled);

  function place(symbol: string) {
    if (submitted || !active) return;
    setFilled((f) => ({ ...f, [active]: symbol }));
    const nextGap = letter.gaps.find((g) => g.key !== active && !filled[g.key]);
    setActive(nextGap?.key ?? null);
  }

  function send() {
    if (submitted || !complete) return;
    setSubmitted(true);
    const ok = letterCorrect(letter, filled);
    for (const g of letter.gaps) trackExerciseAnswer({ exercise: "letter", questionType: "gap", question: g.symbol, correct: filled[g.key] === g.symbol });
    trackExerciseComplete({ exercise: "letter", score: letter.gaps.filter((g) => filled[g.key] === g.symbol).length, total: letter.gaps.length });
    onSend(letter.gaps.map((g) => filled[g.key]), ok);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Letter home</p>
        <h2 className="font-display text-2xl text-sand-100 font-light">Write it up for {letter.to}</h2>
        <p className="font-body text-sm text-sand-400 mt-1">Tap a gap, then the sign that belongs in it.</p>
      </div>

      <div className="lesson-sheet p-6 md:p-8 bg-[#f4ead8] text-[#2a2318]" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 1.9rem, rgba(90,70,40,0.12) 1.9rem, rgba(90,70,40,0.12) 2rem)" }}>
        <p className="font-display italic text-lg mb-4">Dear {letter.to},</p>
        {rendered.paragraphs.map((p, i) => (
          <p key={i} className="font-body text-[15px] leading-8 mb-3">
            {p.map((part, j) =>
              typeof part === "string" ? (
                <span key={j}>{part}</span>
              ) : (
                <button
                  key={j}
                  type="button"
                  onClick={() => !submitted && setActive(part.gap.key)}
                  className={`inline-flex items-center justify-center min-w-[2.6rem] h-9 mx-0.5 align-middle border-b-2 px-1 transition-colors ${
 submitted
 ? part.glyph === part.gap.symbol
 ? "border-green-600 bg-green-600/10"
 : "border-red-600 bg-red-600/10"
 : active === part.gap.key
 ? "border-[#8a6610] bg-[#8a6610]/10"
 : "border-[#8a6610]/40"
 }`}
                  title={part.gap.hint}
                >
                  {part.glyph ? (
                    <span className="text-2xl leading-none" style={GLYPH}>
                      {part.glyph}
                    </span>
                  ) : (
                    <span className="font-body text-sm text-[#8a6610] font-semibold">{part.gap.hint}</span>
                  )}
                </button>
              ),
            )}
          </p>
        ))}
        <p className="font-display italic text-lg mt-4">Yours, from the dig</p>
      </div>

      {!submitted && (
        <>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {tray.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => place(sym)}
                disabled={!active}
                className="w-14 h-14 flex items-center justify-center border border-gold-700/20 bg-obsidian-lighter hover:border-gold-500/50 disabled:opacity-40"
              >
                <span className="text-3xl text-gold-400 leading-none" style={GLYPH}>
                  {sym}
                </span>
              </button>
            ))}
          </div>
          <div className="text-center mt-5">
            <button type="button" onClick={send} disabled={!complete} className="lesson-btn py-3 px-8 text-sm justify-center disabled:opacity-40">
              Send the letter
            </button>
          </div>
        </>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-5">
          <p className="font-body text-sm text-sand-300">
            {correct ? "Every sign in its place. The letter goes out with the morning truck." : "Sent, with a sign or two the wrong way round. They will understand."}
          </p>
          {!correct && (
            <p className="font-body text-xs text-sand-500 mt-1">
              The right signs:{" "}
              {letter.gaps.map((g) => (
                <span key={g.key} className="text-gold-400 mx-1" style={GLYPH}>
                  {g.symbol}
                </span>
              ))}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
