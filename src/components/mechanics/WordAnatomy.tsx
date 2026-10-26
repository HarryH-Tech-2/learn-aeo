"use client";

/**
 * Word Anatomy — Lesson 8's capstone mechanic.
 *
 * Part 1 (dissect): for each sign in a real word, say what job it does —
 * multi-consonant sign, single-consonant sign, phonetic complement,
 * determinative, ideogram, or the ideogram stroke.
 * Part 2 (build): given a meaning and its reading, assemble the word from a
 * palette of signs in the right order.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { GLYPH_STYLE, shuffle, type MechanicProps } from "./types";

export type Role = "multi" | "uni" | "comp" | "det" | "ideo" | "stroke";

export const ROLE_LABEL: Record<Role, string> = {
  multi: "Multi-consonant sign",
  uni: "Single-consonant sign",
  comp: "Phonetic complement",
  det: "Determinative",
  ideo: "Ideogram (picture = word)",
  stroke: "Ideogram stroke",
};

export const ROLE_HELP: Record<Role, string> = {
  multi: "writes two or three consonants at once (a biliteral or triliteral)",
  uni: "writes one consonant: an alphabet sign",
  comp: "repeats a sound already written by the multi-consonant sign, to help the reader",
  det: "silent; classifies the word’s meaning",
  ideo: "the picture IS the word",
  stroke: "the single stroke that says ‘read the picture literally’",
};

type ASign = { glyph: string; value: string; role: Role; name: string };
type Word = { id: string; translit: string; meaning: string; signs: ASign[]; note: string };

// Unicode code points verified against the Gardiner list.
export const ANATOMY_WORDS: Word[] = [
  {
    id: "nfr", translit: "nfr", meaning: "good, beautiful",
    signs: [{ glyph: "𓄤", value: "nfr", role: "multi", name: "heart and windpipe" }, { glyph: "𓆑", value: "f", role: "comp", name: "viper" }, { glyph: "𓂋", value: "r", role: "comp", name: "mouth" }],
    note: "One triliteral carries all three consonants; the f and r are written again as complements. Read nfr, not n-f-r-f-r.",
  },
  {
    id: "ankh", translit: "ꜥnḫ", meaning: "life; to live",
    signs: [{ glyph: "𓋹", value: "ꜥnḫ", role: "multi", name: "ankh (sandal strap)" }, { glyph: "𓈖", value: "n", role: "comp", name: "ripple" }, { glyph: "𓐍", value: "ḫ", role: "comp", name: "sieve" }],
    note: "The ankh writes ꜥnḫ; n and ḫ confirm its last two sounds. The same triliteral alone is the amulet ‘life’.",
  },
  {
    id: "khpr", translit: "ḫpr", meaning: "to become, come into being",
    signs: [{ glyph: "𓆣", value: "ḫpr", role: "multi", name: "scarab" }, { glyph: "𓂋", value: "r", role: "comp", name: "mouth" }],
    note: "The scarab is a triliteral ḫpr with a single complement. Add the sun disc and it is Khepri, the morning sun.",
  },
  {
    id: "mn", translit: "mn", meaning: "to endure, be firm",
    signs: [{ glyph: "𓏠", value: "mn", role: "multi", name: "gaming board" }, { glyph: "𓈖", value: "n", role: "comp", name: "ripple" }],
    note: "A biliteral plus its complement: the heart of Amun’s name ꞽmn, and of Menes and Menkaure.",
  },
  {
    id: "htp", translit: "ḥtp", meaning: "offering; peace, contentment",
    signs: [{ glyph: "𓊵", value: "ḥtp", role: "multi", name: "offering slab" }, { glyph: "𓏏", value: "t", role: "comp", name: "loaf" }, { glyph: "𓊪", value: "p", role: "comp", name: "stool" }],
    note: "Triliteral + two complements. The first word of the offering formula and of Hotep-names like Amenhotep.",
  },
  {
    id: "wsr", translit: "wsr", meaning: "powerful, strong",
    signs: [{ glyph: "𓄊", value: "wsr", role: "multi", name: "head and neck of a canine" }, { glyph: "𓋴", value: "s", role: "comp", name: "folded cloth" }, { glyph: "𓂋", value: "r", role: "comp", name: "mouth" }],
    note: "The canine head is wsr; s and r are complements. Found in names like Wsr-mꜣꜥt-rꜥ (Ramesses II’s throne name).",
  },
  {
    id: "pr", translit: "pr", meaning: "house",
    signs: [{ glyph: "𓉐", value: "pr", role: "ideo", name: "house plan" }, { glyph: "𓏤", value: "–", role: "stroke", name: "single stroke" }],
    note: "Picture + stroke = ‘read this literally’: a house. The same sign plus r and walking legs is the verb ‘go out’.",
  },
  {
    id: "ntr", translit: "nṯr", meaning: "god",
    signs: [{ glyph: "𓊹", value: "nṯr", role: "ideo", name: "flag on a pole" }, { glyph: "𓏤", value: "–", role: "stroke", name: "single stroke" }],
    note: "The temple flagpole is the ideogram for ‘god’; the stroke marks it as an ideogram rather than a sound.",
  },
  {
    id: "rn", translit: "rn", meaning: "name",
    signs: [{ glyph: "𓂋", value: "r", role: "uni", name: "mouth" }, { glyph: "𓈖", value: "n", role: "uni", name: "ripple" }],
    note: "Two plain alphabet signs, nothing more. Not every word needs complements or a determinative.",
  },
  {
    id: "ss", translit: "sš", meaning: "scribe",
    signs: [{ glyph: "𓋴", value: "s", role: "uni", name: "folded cloth" }, { glyph: "𓈙", value: "š", role: "uni", name: "pool" }, { glyph: "𓀀", value: "person", role: "det", name: "seated man" }],
    note: "Two uniliterals and a determinative: the shape of most everyday nouns.",
  },
  {
    id: "sdjm", translit: "sḏm", meaning: "to hear",
    signs: [{ glyph: "𓄔", value: "sḏm", role: "multi", name: "ear of an ox" }, { glyph: "𓅓", value: "m", role: "comp", name: "owl" }],
    note: "The ear is a triliteral sḏm; the owl repeats its final m. sḏm is the textbook verb of Egyptian grammar.",
  },
  {
    id: "ms", translit: "ms", meaning: "to be born; to fashion",
    signs: [{ glyph: "𓄟", value: "ms", role: "multi", name: "three fox skins" }, { glyph: "𓋴", value: "s", role: "comp", name: "folded cloth" }],
    note: "Biliteral + complement. Ramesses, Thutmose and Ahmose all carry this ‘born of’ element.",
  },
];

const DISSECT_ROUNDS = 6;
const BUILD_ROUNDS = 5;
const DISTRACTORS = ["𓅱", "𓏏", "𓄿", "𓇋", "𓊪", "𓃀", "𓎡", "𓂧", "𓈖", "𓋴", "𓆑", "𓂋", "𓅓", "𓐍"];

type Phase = "dissect" | "build" | "done";

export default function WordAnatomy({ onXPEarned, onComplete }: MechanicProps) {
  const [phase, setPhase] = useState<Phase>("dissect");
  const [pool] = useState(() => shuffle(ANATOMY_WORDS));
  const dissect = useMemo(() => pool.slice(0, DISSECT_ROUNDS), [pool]);
  const build = useMemo(() => pool.slice(DISSECT_ROUNDS, DISSECT_ROUNDS + BUILD_ROUNDS), [pool]);

  // dissect state
  const [dIdx, setDIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(0);
  const [assigned, setAssigned] = useState<Record<number, Role>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // build state
  const [bIdx, setBIdx] = useState(0);
  const [built, setBuilt] = useState<string[]>([]);
  const [bChecked, setBChecked] = useState<null | boolean>(null);
  const palette = useMemo(() => {
    const w = build[bIdx];
    if (!w) return [];
    const own = w.signs.map((s) => s.glyph);
    const extra = shuffle(DISTRACTORS.filter((g) => !own.includes(g))).slice(0, 3);
    return shuffle([...own, ...extra]);
  }, [build, bIdx]);

  const word = dissect[dIdx];
  const allAssigned = word && word.signs.every((_, i) => assigned[i]);

  function assign(role: Role) {
    if (selected === null || checked) return;
    setAssigned((a) => ({ ...a, [selected]: role }));
    // move selection to the next unassigned sign
    const nextIdx = word.signs.findIndex((_, i) => i !== selected && !assigned[i]);
    setSelected(nextIdx >= 0 ? nextIdx : null);
  }

  function checkDissect() {
    if (!allAssigned) return;
    setChecked(true);
    const right = word.signs.filter((s, i) => assigned[i] === s.role).length;
    const perfect = right === word.signs.length;
    setScore((s) => ({ correct: s.correct + right, total: s.total + word.signs.length }));
    onXPEarned(perfect ? XP_REWARDS.mechanicCorrect : Math.round((XP_REWARDS.mechanicCorrect * right) / word.signs.length));
    trackExerciseAnswer({ exercise: "word-anatomy", questionType: "roles", question: word.translit, correct: perfect });
  }

  function nextDissect() {
    if (dIdx + 1 >= dissect.length) {
      setPhase("build");
      return;
    }
    setDIdx((i) => i + 1);
    setSelected(0);
    setAssigned({});
    setChecked(false);
  }

  function checkBuild() {
    const w = build[bIdx];
    if (!w || bChecked !== null) return;
    const ok = built.length === w.signs.length && built.every((g, i) => g === w.signs[i].glyph);
    setBChecked(ok);
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) onXPEarned(XP_REWARDS.mechanicCorrect);
    trackExerciseAnswer({ exercise: "word-anatomy", questionType: "build", question: w.translit, correct: ok });
  }

  function nextBuild() {
    if (bIdx + 1 >= build.length) {
      trackExerciseComplete({ exercise: "word-anatomy", score: score.correct, total: score.total });
      setPhase("done");
      return;
    }
    setBIdx((i) => i + 1);
    setBuilt([]);
    setBChecked(null);
  }

  useEffect(() => {
    if (phase === "done") onComplete({ correct: score.correct, total: score.total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const roles: Role[] = ["multi", "uni", "comp", "det", "ideo", "stroke"];

  return (
    <div className="lesson-sheet p-6 md:p-8">
      <AnimatePresence mode="wait">
        {/* ───────────── Part 1: dissect ───────────── */}
        {phase === "dissect" && word && (
          <motion.div key={`d-${dIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
              Word anatomy · dissect <span className="text-sand-500 normal-case tracking-normal ml-2">· {dIdx + 1}/{dissect.length}</span>
            </p>
            <h3 className="font-display text-2xl text-sand-100 mb-1">
              <span className="italic text-gold-300">{word.translit}</span>: {word.meaning}
            </h3>
            <p className="font-body text-sm text-sand-400 mb-5">Tap each sign, then say what job it does in the word.</p>

            <div className="flex flex-wrap justify-center gap-3 mb-5">
              {word.signs.map((s, i) => {
                const role = assigned[i];
                const ok = checked ? role === s.role : null;
                let cls = "w-24 p-2 border text-center transition-all ";
                if (checked) cls += ok ? "border-green-500/60 bg-green-500/10" : "border-red-500/60 bg-red-500/10";
                else if (selected === i) cls += "border-gold-500/70 bg-gold-500/10";
                else if (role) cls += "border-gold-700/40 bg-obsidian-lighter";
                else cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40";
                return (
                  <button key={i} type="button" onClick={() => !checked && setSelected(i)} className={cls}>
                    <span className="block text-4xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                      {s.glyph}
                    </span>
                    <span className="block font-body text-[10px] text-sand-500 mt-1 min-h-[2.2em] leading-tight">
                      {role ? ROLE_LABEL[role] : "–"}
                    </span>
                    {checked && !ok && <span className="block font-body text-[10px] text-green-300 leading-tight">→ {ROLE_LABEL[s.role]}</span>}
                  </button>
                );
              })}
            </div>

            {!checked && (
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => assign(r)}
                    disabled={selected === null}
                    className="text-left p-3 border border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40 hover:bg-gold-500/5 disabled:opacity-40 transition-colors rounded-xl"
                  >
                    <span className="block font-body text-sm text-sand-100">{ROLE_LABEL[r]}</span>
                    <span className="block font-body text-[11px] text-sand-500">{ROLE_HELP[r]}</span>
                  </button>
                ))}
              </div>
            )}

            {checked ? (
              <div className="p-4 border border-gold-500/30 bg-gold-500/5 rounded-xl">
                <p className="font-body text-xs text-sand-300">{word.note}</p>
                <div className="text-right mt-3">
                  <button type="button" onClick={nextDissect} className="lesson-btn py-2.5 px-6 text-sm justify-center">
                    {dIdx + 1 >= dissect.length ? "Now build some" : "Next word"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-right">
                <button type="button" onClick={checkDissect} disabled={!allAssigned} className="lesson-btn py-2.5 px-6 text-sm justify-center disabled:opacity-40">
                  Check
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ───────────── Part 2: build ───────────── */}
        {phase === "build" && build[bIdx] && (
          <motion.div key={`b-${bIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
              Word anatomy · build <span className="text-sand-500 normal-case tracking-normal ml-2">· {bIdx + 1}/{build.length}</span>
            </p>
            <h3 className="font-display text-2xl text-sand-100 mb-1">
              Write <span className="italic text-gold-300">{build[bIdx].translit}</span> ({build[bIdx].meaning})
            </h3>
            <p className="font-body text-sm text-sand-400 mb-5">
              Tap signs from the palette in order. Think: which sign carries the sounds, which complements belong, does it need a determinative or a stroke?
            </p>

            {/* the line being written */}
            <div className="min-h-[4.5rem] flex items-center justify-center gap-2 p-3 border border-dashed border-gold-700/40 bg-obsidian-lighter mb-4 rounded-xl" style={GLYPH_STYLE}>
              {built.length === 0 && <span className="font-body text-sm text-sand-600" style={{ fontFamily: "inherit" }}>…</span>}
              {built.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => bChecked === null && setBuilt((b) => b.filter((_, j) => j !== i))}
                  className="text-4xl text-gold-400 leading-none hover:text-red-300"
                  title="remove"
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {palette.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={bChecked !== null}
                  onClick={() => setBuilt((b) => [...b, g])}
                  className="w-14 h-14 border border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40 text-3xl text-gold-400 leading-none disabled:opacity-50"
                  style={GLYPH_STYLE}
                >
                  {g}
                </button>
              ))}
            </div>

            {bChecked === null ? (
              <div className="flex justify-between items-center">
                <button type="button" onClick={() => setBuilt([])} className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4">
                  Clear
                </button>
                <button type="button" onClick={checkBuild} disabled={built.length === 0} className="lesson-btn py-2.5 px-6 text-sm justify-center disabled:opacity-40">
                  Check
                </button>
              </div>
            ) : (
              <div className={`p-4 border ${bChecked ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"} rounded-xl`}>
                <p className="font-body text-sm text-sand-100">
                  {bChecked ? (
                    <>
                      Correct. <span className="text-gold-400">+{XP_REWARDS.mechanicCorrect} XP</span>
                    </>
                  ) : (
                    <>
                      The word is written{" "}
                      <span className="text-2xl align-middle text-gold-400" style={GLYPH_STYLE}>
                        {build[bIdx].signs.map((s) => s.glyph).join("")}
                      </span>
                    </>
                  )}
                </p>
                <p className="font-body text-xs text-sand-400 mt-1">{build[bIdx].note}</p>
                <div className="text-right mt-3">
                  <button type="button" onClick={nextBuild} className="lesson-btn py-2.5 px-6 text-sm justify-center">
                    {bIdx + 1 >= build.length ? "Finish" : "Next word"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Word anatomy · complete</p>
            <h3 className="font-display text-2xl text-sand-100">
              {score.correct}/{score.total}. You can take a word apart and put one back together.
            </h3>
            <p className="font-body text-sm text-sand-400 mt-2">That is the whole system: sounds, syllables, pictures, and the silent signs that glue them.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
