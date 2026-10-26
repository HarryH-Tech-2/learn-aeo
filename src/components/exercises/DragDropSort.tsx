"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";

type GlyphItem = {
  symbol: string;
  meaning: string;
  correctCategory: string;
};

type Props = {
  categories: string[];
  glyphs: GlyphItem[];
  onComplete: (allCorrect: boolean) => void;
};

export default function DragDropSort({ categories, glyphs, onComplete }: Props) {
  const [pool, setPool] = useState<GlyphItem[]>(() => {
    const shuffled = [...glyphs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [buckets, setBuckets] = useState<Record<string, GlyphItem[]>>(
    Object.fromEntries(categories.map((c) => [c, []]))
  );
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect" | null>>(
    Object.fromEntries(categories.map((c) => [c, null]))
  );
  const [draggedGlyph, setDraggedGlyph] = useState<GlyphItem | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleDragStart(glyph: GlyphItem) {
    setDraggedGlyph(glyph);
  }

  function handleDrop(category: string) {
    if (!draggedGlyph) return;
    setPool((p) => p.filter((g) => g.symbol !== draggedGlyph.symbol));
    setBuckets((b) => ({ ...b, [category]: [...b[category], draggedGlyph] }));
    setDraggedGlyph(null);
  }

  function handleSubmit() {
    const newFeedback: Record<string, "correct" | "incorrect" | null> = {};
    let allCorrect = true;
    for (const category of categories) {
      const items = buckets[category];
      const correct = items.every((g) => g.correctCategory === category);
      newFeedback[category] = correct ? "correct" : "incorrect";
      if (!correct) allCorrect = false;
    }
    setFeedback(newFeedback);
    setSubmitted(true);
    const correctCount = categories.filter((c) => newFeedback[c] === "correct").length;
    trackExerciseAnswer({ exercise: "drag-drop", questionType: "sort", question: categories.join("|"), correct: allCorrect });
    trackExerciseComplete({ exercise: "drag-drop", score: correctCount, total: categories.length });
    onComplete(allCorrect);
  }

  return (
    <div className="card-ancient p-6 md:p-8">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-6">Sort the Glyphs</p>
      {pool.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8 p-4 border border-dashed border-gold-700/20 min-h-[80px]">
          {pool.map((glyph) => (
            <div key={glyph.symbol} draggable onDragStart={() => handleDragStart(glyph)}
              className="w-16 h-16 flex items-center justify-center border border-gold-700/20 bg-obsidian-lighter cursor-grab active:cursor-grabbing hover:border-gold-500/40 transition-colors">
              <span className="text-3xl text-gold-400" style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}>{glyph.symbol}</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {categories.map((category) => (
          <div key={category} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(category)}
            className={`min-h-[120px] p-4 border-2 border-dashed transition-colors ${
              feedback[category] === "correct" ? "border-green-500/40 bg-green-500/5"
              : feedback[category] === "incorrect" ? "border-red-500/40 bg-red-500/5"
              : "border-gold-700/20 bg-obsidian-lighter/50"
            }`}>
            <p className="font-body text-xs tracking-[0.15em] uppercase text-sand-500 mb-3">{category}</p>
            <div className="flex flex-wrap gap-2">
              {buckets[category].map((glyph) => (
                <div key={glyph.symbol} className="w-12 h-12 flex items-center justify-center border border-gold-700/20 bg-obsidian-lighter">
                  <span className="text-2xl text-gold-400" style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}>{glyph.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!submitted && pool.length === 0 && (
        <button onClick={handleSubmit} className="btn-primary py-3 px-6 text-sm w-full justify-center">Check Sorting</button>
      )}
    </div>
  );
}
