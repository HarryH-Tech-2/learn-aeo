"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trackExerciseComplete } from "@/lib/analytics";

type Card = {
  id: string;
  content: string;
  type: "symbol" | "meaning";
  pairId: string;
};

type Props = {
  pairs: { symbol: string; meaning: string }[];
  onComplete: (attempts: number, perfectMatch: boolean) => void;
};

export default function MatchingGame({ pairs, onComplete }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const allCards: Card[] = [];
    pairs.forEach((pair, i) => {
      allCards.push({ id: `s-${i}`, content: pair.symbol, type: "symbol", pairId: `pair-${i}` });
      allCards.push({ id: `m-${i}`, content: pair.meaning, type: "meaning", pairId: `pair-${i}` });
    });
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    setCards(allCards);
  }, [pairs]);

  function handleFlip(cardId: string) {
    if (disabled || flipped.includes(cardId) || matched.includes(cardId)) return;
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setDisabled(true);
      setAttempts((a) => a + 1);
      const [first, second] = newFlipped.map((id) => cards.find((c) => c.id === id)!);
      if (first.pairId === second.pairId && first.type !== second.type) {
        const newMatched = [...matched, first.id, second.id];
        setMatched(newMatched);
        setFlipped([]);
        setDisabled(false);
        if (newMatched.length === cards.length) {
          const perfectMatch = attempts + 1 === pairs.length;
          trackExerciseComplete({ exercise: "matching", score: pairs.length, total: pairs.length, attempts: attempts + 1 });
          onComplete(attempts + 1, perfectMatch);
        }
      } else {
        setTimeout(() => { setFlipped([]); setDisabled(false); }, 800);
      }
    }
  }

  const isFlipped = (id: string) => flipped.includes(id) || matched.includes(id);

  return (
    <div className="card-ancient p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500">Matching Game</p>
        <p className="font-body text-xs text-gold-500">{matched.length / 2}/{pairs.length} pairs</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            animate={{ rotateY: isFlipped(card.id) ? 0 : 180, scale: matched.includes(card.id) ? 0.95 : 1 }}
            transition={{ duration: 0.3 }}
            className={`aspect-square flex items-center justify-center border p-2 transition-colors ${
              matched.includes(card.id) ? "border-green-500/30 bg-green-500/10"
              : isFlipped(card.id) ? "border-gold-500/50 bg-gold-500/10"
              : "border-gold-700/15 bg-obsidian-lighter hover:border-gold-700/30 cursor-pointer"
            }`}
          >
            {isFlipped(card.id) ? (
              <span
                className={card.type === "symbol" ? "text-3xl text-gold-400" : "font-body text-xs text-sand-300 text-center"}
                style={card.type === "symbol" ? { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } : undefined}
              >{card.content}</span>
            ) : (
              <span className="text-2xl text-gold-600/30">?</span>
            )}
          </motion.button>
        ))}
      </div>
      <p className="font-body text-xs text-sand-600 mt-4 text-center">Attempts: {attempts}</p>
    </div>
  );
}
