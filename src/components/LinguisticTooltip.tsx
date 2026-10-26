"use client";

import { useState } from "react";

const glossary: Record<string, string> = {
  "glottal stop":
    "A sound made by briefly closing the vocal cords, like the pause in 'uh-oh'. Common in Semitic languages and ancient Egyptian.",
  "glottal stop consonant":
    "A consonant produced by briefly closing the vocal cords, like the pause in 'uh-oh'.",
  "pharyngeal fricative":
    "A consonant produced by constricting the throat (pharynx). Found in Arabic and ancient Egyptian but not in English.",
  "pharyngeal consonant":
    "A consonant articulated using the pharynx (back of the throat). Rare in European languages but common in Semitic and Egyptian.",
  "bilabial stop":
    "A consonant made by briefly closing both lips, like 'b' or 'p' in English.",
  "voiceless bilabial stop":
    "The 'p' sound, made by closing both lips and releasing without vibrating the vocal cords.",
  "bilabial nasal":
    "The 'm' sound, made by closing both lips while air flows through the nose.",
  "alveolar nasal":
    "The 'n' sound, made by pressing the tongue against the ridge behind the upper teeth while air flows through the nose.",
  "semi-vowel":
    "A sound that functions as a consonant in the script but is pronounced like a vowel, similar to 'y' or 'w' in English.",
  "voiceless velar fricative":
    "A rough 'kh' sound made at the back of the mouth, like the 'ch' in Scottish 'loch' or German 'Bach'.",
  determinative:
    "A silent hieroglyph placed at the end of a word to indicate its category of meaning (e.g. a person, an action, a place). Not pronounced.",
  "phonetic complement":
    "A sign added after a multi-consonant hieroglyph to confirm one or more of its consonants, helping the reader identify the correct word.",
  "honorific transposition":
    "A scribal convention where a divine or royal name is written first in a phrase out of respect, even though it is read later in spoken order.",
  uniliteral:
    "A hieroglyph representing a single consonant sound: the closest thing Egyptian had to an alphabet letter.",
  biliteral:
    "A hieroglyph representing two consonant sounds in a single sign, like 'pr' (house) encoding both 'p' and 'r'.",
  triliteral:
    "A hieroglyph representing three consonant sounds in a single sign, like the scarab beetle encoding 'ḫ-p-r'.",
  transliteration:
    "A system for converting hieroglyphic signs into Roman letters, allowing scholars to discuss Egyptian words without drawing the original signs.",
};

function TooltipBubble({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dotted border-gold-500/50 cursor-help">
        {children}
      </span>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-obsidian border border-gold-700/30 shadow-lg shadow-black/40 text-xs font-body text-sand-300 leading-relaxed pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gold-700/30" />
        </span>
      )}
    </span>
  );
}

/**
 * Renders text with automatic tooltips for recognised linguistic terms.
 * Matches are case-insensitive; longer terms are matched first.
 */
export function TextWithTooltips({ text }: { text: string }) {
  const sortedTerms = Object.keys(glossary).sort(
    (a, b) => b.length - a.length
  );
  const pattern = new RegExp(
    `(${sortedTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );

  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const key = part.toLowerCase();
        if (glossary[key]) {
          return (
            <TooltipBubble key={i} text={glossary[key]}>
              {part}
            </TooltipBubble>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
