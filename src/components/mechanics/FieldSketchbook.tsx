"use client";

/**
 * Field Sketchbook — Lesson 2's signature mechanic.
 *
 * Object first, sign second: a 3D object from the Nile valley turns on the
 * table; you guess which sign it became, then say whether that sign mainly
 * writes a SOUND or a MEANING. The point of the lesson — pictures became
 * sounds, words and classifiers — is something you decide, not read.
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { modelForGlyph } from "@/lib/objects";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { GLYPH_STYLE, shuffle, type MechanicProps } from "./types";

const SignStage = dynamic(() => import("@/components/three/SignStage"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square sm:aspect-[4/3] border border-gold-700/20 bg-obsidian-light/40 flex items-center justify-center">
      <p className="font-body text-sm text-sand-500 animate-pulse font-semibold">Unpacking the crate…</p>
    </div>
  ),
});

type Kind = "sound" | "meaning";
type Item = {
  glyph: string;
  /** glyph whose 3D model to show (usually the same) */
  modelGlyph: string;
  object: string;
  kind: Kind;
  value: string;
  explain: string;
};

// Unicode code points verified against the Gardiner list.
export const SKETCHBOOK_ITEMS: Item[] = [
  { glyph: "𓅓", modelGlyph: "𓅓", object: "an owl", kind: "sound", value: "m", explain: "Pure sound: the owl writes m and nothing about owls. It is the commonest sign in the script." },
  { glyph: "𓄿", modelGlyph: "𓄿", object: "a vulture", kind: "sound", value: "ꜣ", explain: "The vulture is the alphabet sign ꜣ: its name began with that sound, so the picture was borrowed for it." },
  { glyph: "𓆣", modelGlyph: "𓆣", object: "a scarab beetle", kind: "sound", value: "ḫpr", explain: "The scarab writes the three consonants ḫpr ‘become’: a sound-sign, though it began as the picture of the beetle that rolls the sun." },
  { glyph: "𓃭", modelGlyph: "𓃭", object: "a lion", kind: "meaning", value: "lion (mꜣꞽ); also the sound rw", explain: "The lying lion is the word ‘lion’ and the classifier for lions. In Ptolemaic names it was borrowed for the foreign sound l." },
  { glyph: "𓆸", modelGlyph: "𓆸", object: "a lotus flower", kind: "meaning", value: "lotus; plants", explain: "The lotus is a picture-word and a classifier for flowers and plants; it does not spell sounds." },
  { glyph: "𓆗", modelGlyph: "𓆗", object: "a rearing cobra", kind: "meaning", value: "uraeus; goddesses", explain: "The uraeus is the word for the royal cobra and the classifier that follows goddesses’ names. The ḏ-sound cobra 𓆓 is a different, resting snake." },
  { glyph: "𓈗", modelGlyph: "𓈖", object: "water", kind: "meaning", value: "water; liquids", explain: "Three ripples write the word mw ‘water’ and classify every liquid. (A single ripple 𓈖 is the sound n.)" },
  { glyph: "𓇳", modelGlyph: "", object: "the sun", kind: "meaning", value: "sun, day (rꜥ)", explain: "The sun disc is the word for the sun and the god Ra, and classifies words of time and light." },
];

const ROUNDS = 6;

export default function FieldSketchbook({ glyphs, onXPEarned, onComplete }: MechanicProps) {
  const [items] = useState(() => shuffle(SKETCHBOOK_ITEMS).slice(0, ROUNDS));
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<"sign" | "kind" | "done">("sign");
  const [pickedSign, setPickedSign] = useState<string | null>(null);
  const [pickedKind, setPickedKind] = useState<Kind | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  const item = items[idx];
  const model = item ? modelForGlyph(item.modelGlyph) : undefined;

  const signOptions = useMemo(() => {
    if (!item) return [];
    const lessonGlyphs = glyphs.map((g) => g.symbol).filter((g) => g !== item.glyph);
    const bank = shuffle(Array.from(new Set([...lessonGlyphs, ...SKETCHBOOK_ITEMS.map((i) => i.glyph)]))).filter((g) => g !== item.glyph);
    return shuffle([item.glyph, ...bank.slice(0, 3)]);
  }, [item, glyphs]);

  function chooseSign(g: string) {
    if (pickedSign) return;
    setPickedSign(g);
    const ok = g === item.glyph;
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) onXPEarned(XP_REWARDS.mechanicCorrect);
    trackExerciseAnswer({ exercise: "field-sketchbook", questionType: "object-to-sign", question: item.glyph, correct: ok });
    window.setTimeout(() => setStage("kind"), 900);
  }

  function chooseKind(k: Kind) {
    if (pickedKind) return;
    setPickedKind(k);
    const ok = k === item.kind;
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) onXPEarned(XP_REWARDS.mechanicCorrect);
    trackExerciseAnswer({ exercise: "field-sketchbook", questionType: "sound-or-meaning", question: item.glyph, correct: ok });
    setStage("done");
  }

  function next() {
    if (idx + 1 >= items.length) {
      trackExerciseComplete({ exercise: "field-sketchbook", score: score.correct, total: score.total });
      if (score.correct === score.total) onXPEarned(XP_REWARDS.mechanicPerfect);
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setStage("sign");
    setPickedSign(null);
    setPickedKind(null);
  }

  useEffect(() => {
    if (finished) onComplete({ correct: score.correct, total: score.total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (finished) {
    return (
      <div className="lesson-sheet p-6 md:p-8 text-center">
        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Field sketchbook · complete</p>
        <h3 className="font-display text-2xl text-sand-100">{score.correct}/{score.total}. Sketchbook full.</h3>
        <p className="font-body text-sm text-sand-400 mt-2">Every hieroglyph began as one of these objects. Some kept their meaning; most were borrowed for their sound.</p>
      </div>
    );
  }

  return (
    <div className="lesson-sheet p-6 md:p-8">
      <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
        Field sketchbook <span className="text-sand-500 normal-case tracking-normal ml-2">· specimen {idx + 1}/{items.length}</span>
      </p>
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 items-start">
        <div>
          {model ? (
            <SignStage model={model.model} variant="compact" stageKey={`sketch-${idx}`} />
          ) : (
            <div className="w-full aspect-square sm:aspect-[4/3] border border-gold-700/20 bg-obsidian-light/40 flex items-center justify-center">
              <span className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ffe2a8] to-[#d4a832] shadow-[0_0_60px_rgba(212,168,50,0.5)]" aria-label="the sun" />
            </div>
          )}
          <p className="font-body text-xs text-sand-500 mt-2 text-center">{stage === "sign" ? "Drag to turn it." : `It is ${item.object}.`}</p>
        </div>

        <div>
          <AnimatePresence mode="wait">
            {stage === "sign" && (
              <motion.div key="sign" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h3 className="font-display text-xl text-sand-100 mb-1">Which sign did this become?</h3>
                <p className="font-body text-sm text-sand-400 mb-4">The scribes drew what they saw. Find the sign that draws this object.</p>
                <div className="grid grid-cols-2 gap-3">
                  {signOptions.map((g) => {
                    let cls = "p-4 border text-center transition-all ";
                    if (pickedSign) {
                      if (g === item.glyph) cls += "border-green-500/60 bg-green-500/10";
                      else if (g === pickedSign) cls += "border-red-500/60 bg-red-500/10";
                      else cls += "border-gold-700/10 bg-obsidian-lighter opacity-50";
                    } else cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40";
                    return (
                      <button key={g} type="button" onClick={() => chooseSign(g)} disabled={!!pickedSign} className={cls}>
                        <span className="block text-5xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                          {g}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {stage !== "sign" && (
              <motion.div key="kind" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-5xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                    {item.glyph}
                  </span>
                  <p className="font-body text-sm text-sand-300">
                    {pickedSign === item.glyph ? "Right, it is" : "It became"} this sign.
                  </p>
                </div>
                <h3 className="font-display text-xl text-sand-100 mb-1">In the script, does it mainly write a sound, or a meaning?</h3>
                <p className="font-body text-sm text-sand-400 mb-4">Most pictures were borrowed for their sound. A few kept their meaning: as the word itself, or as a classifier.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["sound", "meaning"] as Kind[]).map((k) => {
                    let cls = "p-4 border text-center transition-all ";
                    if (pickedKind) {
                      if (k === item.kind) cls += "border-green-500/60 bg-green-500/10";
                      else if (k === pickedKind) cls += "border-red-500/60 bg-red-500/10";
                      else cls += "border-gold-700/10 bg-obsidian-lighter opacity-50";
                    } else cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40";
                    return (
                      <button key={k} type="button" onClick={() => chooseKind(k)} disabled={!!pickedKind} className={cls}>
                        <span className="block font-display text-lg text-sand-100">{k === "sound" ? "A sound" : "A meaning"}</span>
                        <span className="block font-body text-[11px] text-sand-500">{k === "sound" ? "phonogram" : "ideogram / determinative"}</span>
                      </button>
                    );
                  })}
                </div>
                {stage === "done" && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 border border-gold-500/30 bg-gold-500/5 rounded-xl">
                    <p className="font-body text-sm text-sand-100">
                      <span className="font-display italic text-gold-300 mr-2">{item.value}</span>
                      {pickedKind === item.kind && <span className="text-gold-400">+{XP_REWARDS.mechanicCorrect} XP</span>}
                    </p>
                    <p className="font-body text-xs text-sand-400 mt-1">{item.explain}</p>
                    <div className="text-right mt-3">
                      <button type="button" onClick={next} className="lesson-btn py-2.5 px-6 text-sm justify-center">
                        {idx + 1 >= items.length ? "Close the sketchbook" : "Next specimen"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
