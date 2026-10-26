"use client";

/**
 * Pick the Ending — Lesson 3's signature mechanic.
 *
 * A word is spelled out phonetically and one slot is left open. Choose the
 * determinative that gives it the meaning asked for. Several items use real
 * minimal pairs (sš + man = scribe, sš + papyrus roll = writing) so the learner
 * *decides* meaning rather than matching cards.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { GLYPH_STYLE, shuffle, type MechanicProps } from "./types";

type Option = { glyph: string; label: string };
type Item = {
  id: string;
  translit: string;
  /** phonetic signs, with values */
  phon: { glyph: string; value: string }[];
  meaning: string;
  options: Option[];
  answer: number;
  explain: string;
};

// Unicode code points verified against the Gardiner list.
export const ENDING_ITEMS: Item[] = [
  {
    id: "ss", translit: "sš", meaning: "scribe",
    phon: [{ glyph: "𓋴", value: "s" }, { glyph: "𓈙", value: "š" }],
    options: [{ glyph: "𓀀", label: "seated man: a person" }, { glyph: "𓏛", label: "papyrus roll: abstract, writing" }, { glyph: "𓊖", label: "crossroads: a town" }],
    answer: 0,
    explain: "With the seated man, sš is ‘scribe’. The very same sounds with the papyrus roll 𓏛 mean ‘writing, document’. The determinative is what tells them apart.",
  },
  {
    id: "hmt", translit: "ḥmt", meaning: "wife, woman",
    phon: [{ glyph: "𓈞", value: "ḥm" }, { glyph: "𓏏", value: "t" }],
    options: [{ glyph: "𓁐", label: "seated woman" }, { glyph: "𓈔", label: "metal ingot" }, { glyph: "𓂻", label: "walking legs: motion" }],
    answer: 0,
    explain: "ḥmt with the woman is ‘wife’; ḥmt with the ingot 𓈔 is ‘copper’. Same consonants, utterly different words.",
  },
  {
    id: "sba", translit: "sbꜣ", meaning: "star",
    phon: [{ glyph: "𓋴", value: "s" }, { glyph: "𓃀", value: "b" }, { glyph: "𓄿", value: "ꜣ" }],
    options: [{ glyph: "𓇼", label: "star" }, { glyph: "𓉿", label: "door leaf" }, { glyph: "𓀀", label: "seated man" }],
    answer: 0,
    explain: "sbꜣ + star = ‘star’; sbꜣ + door leaf 𓉿 = ‘door, gate’. Both are common; context and the classifier decide.",
  },
  {
    id: "ka", translit: "kꜣ", meaning: "bull",
    phon: [{ glyph: "𓂓", value: "kꜣ" }, { glyph: "𓄿", value: "ꜣ" }],
    options: [{ glyph: "𓃒", label: "bull" }, { glyph: "𓏤", label: "single stroke: ‘the thing itself’" }, { glyph: "𓅬", label: "goose: a bird" }],
    answer: 0,
    explain: "kꜣ with the bull is the animal. The raised-arms sign alone, with a stroke, is the kꜣ, a person’s life-force. One sound, two ideas.",
  },
  {
    id: "pri", translit: "prꞽ", meaning: "to go out",
    phon: [{ glyph: "𓉐", value: "pr" }, { glyph: "𓂋", value: "r" }],
    options: [{ glyph: "𓂻", label: "walking legs: motion" }, { glyph: "𓏤", label: "single stroke: ‘house’ itself" }, { glyph: "𓊖", label: "crossroads: a town" }],
    answer: 0,
    explain: "The house plan writes pr. With the legs it is the verb ‘go out, come forth’; with a stroke it is simply ‘house’.",
  },
  {
    id: "mw", translit: "mw", meaning: "water",
    phon: [{ glyph: "𓅓", value: "m" }, { glyph: "𓅱", value: "w" }],
    options: [{ glyph: "𓈗", label: "three ripples: liquid" }, { glyph: "𓇳", label: "sun disc: sun, time" }, { glyph: "𓀁", label: "hand to mouth: eating, speaking" }],
    answer: 0,
    explain: "Anything wet (water, beer, tears, the river) takes the three ripples.",
  },
  {
    id: "ra", translit: "rꜥ", meaning: "the sun; Ra",
    phon: [{ glyph: "𓂋", value: "r" }, { glyph: "𓂝", value: "ꜥ" }],
    options: [{ glyph: "𓇳", label: "sun disc" }, { glyph: "𓇼", label: "star" }, { glyph: "𓈗", label: "three ripples: liquid" }],
    answer: 0,
    explain: "The sun disc classifies the sun, daylight and time words. For the god Ra a seated god 𓀭 is often added too.",
  },
  {
    id: "apd", translit: "ꜣpd", meaning: "bird",
    phon: [{ glyph: "𓄿", value: "ꜣ" }, { glyph: "𓊪", value: "p" }, { glyph: "𓂧", value: "d" }],
    options: [{ glyph: "𓅬", label: "goose: birds" }, { glyph: "𓃒", label: "bull: cattle" }, { glyph: "𓆙", label: "snake" }],
    answer: 0,
    explain: "The goose is the general determinative for birds of every kind, including the fowl in offering lists.",
  },
  {
    id: "khrd", translit: "ẖrd", meaning: "child",
    phon: [{ glyph: "𓄡", value: "ẖ" }, { glyph: "𓂋", value: "r" }, { glyph: "𓂧", value: "d" }],
    options: [{ glyph: "𓀔", label: "seated child, finger to mouth" }, { glyph: "𓀀", label: "seated man" }, { glyph: "𓁐", label: "seated woman" }],
    answer: 0,
    explain: "The child with a finger to its lips classifies children and youth: a picture of how Egyptians drew the young.",
  },
  {
    id: "kmt", translit: "kmt", meaning: "Egypt, the Black Land",
    phon: [{ glyph: "𓆎", value: "km" }, { glyph: "𓅓", value: "m" }, { glyph: "𓏏", value: "t" }],
    options: [{ glyph: "𓊖", label: "crossroads: a town, a place" }, { glyph: "𓈉", label: "three hills: desert, foreign land" }, { glyph: "𓈗", label: "three ripples: liquid" }],
    answer: 0,
    explain: "Kemet, the black silt of the valley, takes the town sign. Its opposite, dšrt ‘the Red Land’, takes the three hills of the desert.",
  },
  {
    id: "shms", translit: "šms", meaning: "to follow",
    phon: [{ glyph: "𓌞", value: "šms" }, { glyph: "𓋴", value: "s" }],
    options: [{ glyph: "𓂻", label: "walking legs: motion" }, { glyph: "𓏛", label: "papyrus roll: abstract" }, { glyph: "𓇳", label: "sun disc" }],
    answer: 0,
    explain: "Verbs of movement (go, come, enter, follow) take the walking legs. Add a man and šmsw is ‘a follower’.",
  },
  {
    id: "maa", translit: "mꜣꜣ", meaning: "to see",
    phon: [{ glyph: "𓌳", value: "mꜣ" }, { glyph: "𓄿", value: "ꜣ" }, { glyph: "𓄿", value: "ꜣ" }],
    options: [{ glyph: "𓁹", label: "eye" }, { glyph: "𓂻", label: "walking legs: motion" }, { glyph: "𓀁", label: "hand to mouth: eating, speaking" }],
    answer: 0,
    explain: "Seeing, looking and watching take the eye; the hand-to-mouth man covers speaking, eating and thinking.",
  },
];

const ROUNDS = 10;

export default function PickTheEnding({ onXPEarned, onComplete }: MechanicProps) {
  const [items] = useState(() =>
    shuffle(ENDING_ITEMS)
      .slice(0, ROUNDS)
      .map((it) => {
        // shuffle options, keep track of the correct one
        const order = shuffle(it.options.map((_, i) => i));
        return { ...it, options: order.map((i) => it.options[i]), answer: order.indexOf(it.answer) };
      })
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const item = items[idx];

  const progress = useMemo(() => `${idx + 1}/${items.length}`, [idx, items.length]);

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === item.answer;
    if (correct) {
      setCorrectCount((c) => c + 1);
      onXPEarned(XP_REWARDS.mechanicCorrect);
    }
    trackExerciseAnswer({ exercise: "pick-the-ending", questionType: "determinative-choice", question: item.translit, correct });
  }

  function next() {
    if (idx + 1 >= items.length) {
      const finalCorrect = correctCount;
      trackExerciseComplete({ exercise: "pick-the-ending", score: finalCorrect, total: items.length });
      if (finalCorrect === items.length) onXPEarned(XP_REWARDS.mechanicPerfect);
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  }

  useEffect(() => {
    if (finished) onComplete({ correct: correctCount, total: items.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (finished) {
    return (
      <div className="lesson-sheet p-6 md:p-8 text-center">
        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Pick the ending · complete</p>
        <h3 className="font-display text-2xl text-sand-100">{correctCount}/{items.length} endings chosen correctly.</h3>
        <p className="font-body text-sm text-sand-400 mt-2">You have just done what a reader does on every line: let the silent sign settle the meaning.</p>
      </div>
    );
  }

  return (
    <div className="lesson-sheet p-6 md:p-8">
      <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
        Pick the ending <span className="text-sand-500 normal-case tracking-normal ml-2">· {progress}</span>
      </p>
      <h3 className="font-display text-2xl text-sand-100 mb-1">
        Which ending makes this mean <span className="text-gold-300">“{item.meaning}”</span>?
      </h3>
      <p className="font-body text-sm text-sand-400 mb-6">
        The sounds are written: <span className="font-display italic text-sand-200">{item.translit}</span>. Only the determinative is missing.
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {/* The word with an open slot */}
          <div className="flex items-end justify-center gap-2 mb-6" style={GLYPH_STYLE}>
            {item.phon.map((p, i) => (
              <div key={i} className="text-center w-14">
                <span className="block text-5xl text-gold-400 leading-none">{p.glyph}</span>
                <span className="block font-body text-[11px] text-sand-400 mt-1 italic" style={{ fontFamily: "inherit" }}>
                  {p.value}
                </span>
              </div>
            ))}
            <div className="text-center w-14">
              <span
                className={`block w-14 h-14 border-2 border-dashed ${picked !== null ? "border-green-500/60 text-green-300" : "border-gold-500/50 text-gold-500/60"} text-5xl leading-[3.4rem]`}
              >
                {picked !== null ? item.options[item.answer].glyph : "?"}
              </span>
              <span className="block font-body text-[11px] text-sand-500 mt-1" style={{ fontFamily: "inherit" }}>
                det.
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="grid sm:grid-cols-3 gap-3">
            {item.options.map((opt, i) => {
              let cls = "p-4 border text-left transition-all duration-200 flex items-center gap-3 ";
              if (picked !== null) {
                if (i === item.answer) cls += "border-green-500/60 bg-green-500/10";
                else if (i === picked) cls += "border-red-500/60 bg-red-500/10";
                else cls += "border-gold-700/10 bg-obsidian-lighter opacity-50";
              } else cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40 hover:bg-gold-500/5";
              return (
                <button key={i} type="button" onClick={() => choose(i)} disabled={picked !== null} className={cls}>
                  <span className="text-4xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                    {opt.glyph}
                  </span>
                  <span className="font-body text-xs text-sand-300">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {picked !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 border ${picked === item.answer ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"} rounded-xl`}
              >
                <p className="font-body text-sm text-sand-100">
                  {picked === item.answer ? (
                    <>
                      Right. <span className="text-gold-400">+{XP_REWARDS.mechanicCorrect} XP</span>
                    </>
                  ) : (
                    <>
                      Not that one: it takes the {item.options[item.answer].label.split(": ")[0]}.
                    </>
                  )}
                </p>
                <p className="font-body text-xs text-sand-400 mt-1">{item.explain}</p>
                <div className="text-right mt-3">
                  <button type="button" onClick={next} className="lesson-btn py-2.5 px-6 text-sm justify-center">
                    {idx + 1 >= items.length ? "Finish" : "Next word"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
