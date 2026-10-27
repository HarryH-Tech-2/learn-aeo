"use client";

/**
 * One real word, decoded by the learner. Every sign starts covered: tap it to
 * see (and hear) its sound, known signs as a quick recall and new ones taught
 * on the spot. Once all are open, pick how the word reads; then its meaning
 * shows, with why it is spelled that way and what it meant folded underneath.
 * (2026-10-24: these cards were reading-only, and most new learners quit on them.)
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Hieroglyph } from "@/lib/legacy-lessons";
import type { Word } from "@/lib/content/uniliteral-words";
import { speak, toSpeakable } from "@/lib/speech";
import { trackExerciseAnswer } from "@/lib/analytics";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";

type Props = {
  word: Word;
  /** Signs met before this word */
  known: Set<string>;
  /** Symbol → lesson data, for the sound of each sign */
  bySymbol: Map<string, Hieroglyph>;
  wordIndex: number;
  wordCount: number;
  groupIndex: number;
  groupCount: number;
  /** The group's words, for the sidebar */
  groupWords: Word[];
  signsMet: number;
  signsTotal: number;
  canSpeak: boolean;
  onJump: (wordIndex: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

/** Short sound label for a sign chip: "r", "sh", "ah". */
function soundOf(g: Hieroglyph | undefined): string {
  if (!g) return "";
  const t = g.transliteration.replace(/\s*\(.*\)\s*/g, "").trim();
  return t;
}

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.codePointAt(0)!) >>> 0;
  return h;
}

/** Sounds a wrong reading may swap in: plain letters only, so every font draws them (ꜣ and ꜥ are missing from many). */
const PLAIN = ["b", "p", "f", "m", "n", "r", "h", "s", "k", "g", "t", "d", "w"];

/** Three readings to pick from: the right one, the same sounds backwards, and the right one with one sound swapped. Stable per word. */
export function readingOptions(word: Word): string[] {
  const right = word.translit;
  const options = [right];
  const chars = Array.from(right);
  const backwards = [...chars].reverse().join("");
  if (backwards !== right) options.push(backwards);
  for (let n = 0; options.length < 3; n++) {
    const at = (hash(word.id) + n) % chars.length;
    const swapped = [...chars];
    swapped[at] = PLAIN[(hash(word.id + n) + n) % PLAIN.length];
    const candidate = swapped.join("");
    if (!options.includes(candidate)) options.push(candidate);
  }
  return options
    .map((o) => ({ o, k: hash(o + word.id) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.o);
}

export default function WordCard({ word, known, bySymbol, wordIndex, wordCount, groupIndex, groupCount, groupWords, signsMet, signsTotal, canSpeak, onJump, onPrev, onNext }: Props) {
  const fresh = word.core.filter((s) => !known.has(s));
  const allKnown = fresh.length === 0;
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(() => readingOptions(word), [word]);
  const allOpen = open.size === word.core.length;
  const solved = picked !== null;

  function reveal(i: number) {
    if (open.has(i)) return;
    setOpen((o) => new Set(o).add(i));
    const g = bySymbol.get(word.core[i]);
    if (canSpeak && g) speak(toSpeakable(g.pronunciation));
  }
  function pick(o: string) {
    if (solved) return;
    setPicked(o);
    trackExerciseAnswer({ exercise: "word-decode", questionType: "reading", question: word.translit, correct: o === word.translit });
    if (canSpeak) speak(word.say);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lesson-sheet max-w-3xl mx-auto p-5 sm:p-8">
      {/* The set's words: read ones show their meaning, later ones wait */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        <p className="lesson-label">
          Words, set {groupIndex} of {groupCount}
        </p>
        <ol className="flex flex-wrap gap-1.5">
          {groupWords.map((w, i) => {
            const current = i === wordIndex;
            const done = i < wordIndex;
            return (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  disabled={i > wordIndex}
                  title={done || (current && solved) ? w.meaning : undefined}
                  className={`h-9 min-w-9 px-2 rounded-lg text-lg leading-none transition-colors ${
                    current ? "bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/50" : done ? "text-gold-500 hover:bg-gold-500/10" : "text-gold-700/50"
                  }`}
                  style={{ fontFamily: GLYPH_FONT }}
                  aria-current={current ? "step" : undefined}
                  aria-label={done || (current && solved) ? `${w.translit}, ${w.meaning}` : `Word ${i + 1}`}
                >
                  {w.core.join("")}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="ml-auto font-body text-xs text-sand-500">
          {signsMet} of {signsTotal} signs met
        </p>
      </div>
      <div className="lesson-track mb-6" aria-hidden="true">
        <motion.div animate={{ width: `${(signsMet / signsTotal) * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
      </div>

      <motion.div key={word.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {/* The word, gold on lapis: new signs glow, the silent one is faded */}
        <div className="lesson-inlay px-5 pt-5 pb-6 sm:pt-6 sm:pb-8 text-center">
          <p className="font-body text-sm text-sand-300 mb-4">
            Word {wordIndex + 1} of {wordCount}: {allKnown ? "you can read this one already" : fresh.length === 1 ? "one new sign" : `${fresh.length} new signs`}
          </p>
          <span className="inline-flex items-end justify-center gap-1 leading-none" style={{ fontFamily: GLYPH_FONT }}>
            {word.extra && (
              <span className="lesson-inlay-glyph text-6xl sm:text-7xl md:text-8xl" title={word.extra.name}>
                {word.extra.symbol}
              </span>
            )}
            {word.core.map((s, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.35 }}
                className={`lesson-inlay-glyph text-6xl sm:text-7xl md:text-8xl ${known.has(s) ? "opacity-80" : ""}`}
                style={known.has(s) ? undefined : { textShadow: "0 2px 0 rgba(90,62,10,0.55), 0 0 40px rgba(245,216,144,0.6)" }}
              >
                {s}
              </motion.span>
            ))}
            {word.det && (
              <span className="text-6xl sm:text-7xl md:text-8xl text-sand-300/40" title={`${word.det.name} (silent)`}>
                {word.det.symbol}
              </span>
            )}
          </span>
          {solved ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mt-5 font-display text-3xl sm:text-4xl text-sand-100">
                <span className="italic text-gold-300">{word.translit}</span>
                <span className="text-sand-400">, </span>
                {word.meaning}
              </p>
              <div className="mt-2 flex items-center justify-center gap-3 font-body text-sm text-sand-300">
                <span>
                  said <span className="text-sand-100">“{word.say}”</span>
                </span>
                {canSpeak && (
                  <button
                    type="button"
                    onClick={() => speak(word.say)}
                    className="font-body text-sm text-sand-100 rounded-full bg-gold-400/15 hover:bg-gold-400/25 ring-1 ring-gold-400/40 px-3.5 py-1 transition-colors"
                  >
                    ▶ Hear it
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <p className="mt-5 font-body text-base text-sand-200">{allOpen ? "All the sounds are out. How does it read?" : "Sound it out: tap each sign to uncover its sound."}</p>
          )}
        </div>

        {/* Sign chips: covered until tapped */}
        <div className="flex flex-wrap justify-center gap-2 mt-5 mb-6" role="list" aria-label="The signs in this word">
          {word.extra && (
            <span role="listitem" className="flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-gold-500/30 bg-gold-500/5">
              <span className="text-2xl text-gold-300 leading-none" style={{ fontFamily: GLYPH_FONT }}>
                {word.extra.symbol}
              </span>
              <span className="font-body text-sm text-sand-300">
                <em className="text-gold-300">{word.translit}</em>, {word.extra.name}
              </span>
            </span>
          )}
          {word.core.map((s, i) => {
            const g = bySymbol.get(s);
            const isNew = !known.has(s);
            const isOpen = open.has(i);
            return (
              <span key={i} role="listitem">
                <button
                  type="button"
                  onClick={() => reveal(i)}
                  disabled={isOpen}
                  aria-label={isOpen ? `${soundOf(g)}: ${g?.meaning.split(":")[0].toLowerCase() ?? ""}` : `Uncover sign ${i + 1}${isNew ? ", a new sign" : ""}`}
                  className={`lesson-option flex items-center gap-2 px-3 py-2 ${isOpen ? (isNew ? "!border-gold-400/70 !bg-gold-500/10" : "!border-gold-700/20 !bg-transparent") : "cursor-pointer"}`}
                >
                  <span className={`text-2xl leading-none ${isNew ? "text-gold-300" : "text-gold-600"}`} style={{ fontFamily: GLYPH_FONT }}>
                    {s}
                  </span>
                  {isOpen ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-sm text-sand-300">
                      <em className={isNew ? "text-gold-300" : "text-sand-100"}>{soundOf(g)}</em>
                      {g && <span className="text-sand-500">, {g.meaning.split(":")[0].toLowerCase()}</span>}
                      {isNew && <span className="ml-2 rounded-full bg-gold-500/20 px-1.5 py-0.5 text-[11px] text-gold-300">new</span>}
                    </motion.span>
                  ) : (
                    <span className="font-body text-sm text-gold-400">{isNew ? "New: tap" : "Tap"}</span>
                  )}
                </button>
              </span>
            );
          })}
          {word.det && (
            <span role="listitem" className="flex items-center gap-2 rounded-xl px-3 py-2 border border-dashed border-sand-600/40">
              <span className="text-2xl text-sand-600/60 leading-none" style={{ fontFamily: GLYPH_FONT }}>
                {word.det.symbol}
              </span>
              <span className="font-body text-sm text-sand-500">silent: {word.det.name}</span>
            </span>
          )}
        </div>

        {/* Which reading? */}
        {allOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="How does the word read?">
              {options.map((o) => {
                const right = o === word.translit;
                const state = !solved ? undefined : right ? "right" : o === picked ? "wrong" : "spent";
                return (
                  <button key={o} type="button" onClick={() => pick(o)} disabled={solved} data-state={state} className="lesson-option min-w-[6rem] px-6 py-3 font-body italic text-2xl">
                    {o}
                  </button>
                );
              })}
            </div>
            {solved && (
              <p className="mt-3 text-center font-body text-base text-sand-300">
                {picked === word.translit ? "You read it. " : `Not quite: it reads ${word.translit}, sound by sound in the order of the signs. `}
                That is <span className="text-sand-100">{word.meaning}</span>.
              </p>
            )}
          </motion.div>
        )}

        {solved && (
          <details className="group rounded-xl border-l-2 border-gold-500/60 bg-gold-500/5 px-4 py-3 sm:px-5">
            <summary className="cursor-pointer list-none lesson-label">
              <span className="group-open:hidden">+ Why it is spelled this way, and what it meant to them</span>
              <span className="hidden group-open:inline">− Why it is spelled this way, and what it meant to them</span>
            </summary>
            <p className="mt-3 lesson-prose text-sand-100">{word.why}</p>
            <p className="mt-3 lesson-prose">{word.story}</p>
          </details>
        )}
      </motion.div>

      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gold-700/15">
        <button type="button" onClick={onPrev} disabled={wordIndex === 0} className="lesson-btn-quiet justify-center py-3 px-6 text-sm disabled:invisible">
          <span className="lesson-btn-glyph" data-glyph="back" aria-hidden="true">𓂻</span>
          Back
        </button>
        <button type="button" onClick={onNext} disabled={!solved} className="lesson-btn flex-1 sm:flex-none sm:ml-auto justify-center py-3 px-8 text-sm disabled:opacity-40 disabled:saturate-50">
          {wordIndex === wordCount - 1 ? "Check these signs" : "Next word"}
          <span className="lesson-btn-glyph" data-glyph="next" aria-hidden="true">𓂻</span>
        </button>
      </div>
    </motion.div>
  );
}
