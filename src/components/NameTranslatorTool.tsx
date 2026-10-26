"use client";

import { useState, type ReactNode } from "react";
import { reveal } from "@/components/reveal";
import DoubleLetterNote from "@/components/DoubleLetterNote";
import {
  transliterateName,
  getTransliteration,
  type TranslatorLocale,
  type TransliterationResult,
} from "@/lib/hieroglyph-translator";

/** Every visible word of the tool, so the English, Spanish and French pages share one component. */
export type NameToolStrings = {
  inputLabel: string;
  placeholder: string;
  cartoucheOf: (name: string) => string;
  transliterationLabel: string;
  breakdownHeading: string;
  /** "Transliteration:" in each breakdown row */
  rowTransliteration: string;
};

export const ENGLISH_TOOL_STRINGS: NameToolStrings = {
  inputLabel: "Text to write in hieroglyphs",
  placeholder: "Enter your name...",
  cartoucheOf: (name) => `Cartouche of ${name}`,
  transliterationLabel: "Egyptological transliteration",
  breakdownHeading: "Sign-by-Sign Breakdown",
  rowTransliteration: "Transliteration:",
};

type Props = {
  locale?: TranslatorLocale;
  strings?: NameToolStrings;
  /** Pre-written name for shared links. */
  initialName?: string;
  /** Told about every change, for the parts of the page that use the name too. */
  onChange?: (name: string, results: TransliterationResult[] | null) => void;
  /** Rendered under the cartouche label (the read-it-back check and the print offer on the English page). */
  afterCartouche?: (name: string, results: TransliterationResult[]) => ReactNode;
  /** Rendered after the sign-by-sign breakdown. */
  afterBreakdown?: (name: string, results: TransliterationResult[]) => ReactNode;
};

/** The name box, the cartouche, the transliteration and the sign-by-sign breakdown. */
export default function NameTranslatorTool({
  locale = "en",
  strings = ENGLISH_TOOL_STRINGS,
  initialName = "",
  onChange,
  afterCartouche,
  afterBreakdown,
}: Props) {
  const [name, setName] = useState(initialName);
  const [results, setResults] = useState<TransliterationResult[] | null>(() =>
    initialName.trim() ? transliterateName(initialName, locale) : null
  );
  const [transliteration, setTransliteration] = useState(() =>
    initialName.trim() ? getTransliteration(initialName, locale) : ""
  );
  const [expandedSign, setExpandedSign] = useState<number | null>(null);

  const update = (value: string) => {
    const r = value.trim() ? transliterateName(value, locale) : null;
    setResults(r);
    setTransliteration(value.trim() ? getTransliteration(value, locale) : "");
    setExpandedSign(null);
    onChange?.(value, r);
  };

  const handleTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    update(name);
  };

  const handleInputChange = (value: string) => {
    setName(value);
    update(value);
  };

  return (
    <>
      {/* Input */}
      <div className="reveal mb-8 md:mb-12" style={reveal(0.2, { y: 20, dur: 0.6 })}>
        <form onSubmit={handleTranslate} className="max-w-md mx-auto">
          {/* A gilded plaque: double gold frame, corner studs, an ankh and an eye of Horus either side, a warm glow while typing */}
          <div className="name-plaque group relative border border-gold-500/60 bg-gradient-to-b from-[#1d180f] to-obsidian p-[3px] shadow-[0_14px_40px_-18px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow] duration-300 focus-within:border-gold-400 focus-within:shadow-[0_0_0_1px_rgba(212,168,50,0.35),0_0_34px_-6px_rgba(212,168,50,0.45)]">
            {(["-left-[5px] -top-[5px]", "-right-[5px] -top-[5px]", "-left-[5px] -bottom-[5px]", "-right-[5px] -bottom-[5px]"] as const).map((pos) => (
              <span key={pos} aria-hidden="true" className={`absolute ${pos} h-2.5 w-2.5 rotate-45 border border-gold-400 bg-obsidian`} />
            ))}
            <div className="relative border border-gold-700/40 bg-[radial-gradient(ellipse_at_center,rgba(212,168,50,0.08),transparent_70%)]">
              <span aria-hidden="true" lang="egy" className="hieroglyph-font pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gold-600 transition-colors group-focus-within:text-gold-400">
                𓋹
              </span>
              <span aria-hidden="true" lang="egy" className="hieroglyph-font pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gold-600 transition-colors group-focus-within:text-gold-400">
                𓂀
              </span>
            {/* Not a person's details. Chrome ignores autoComplete="off" and still offered saved cards here
                (2026-10-20), going by the word "name" in the placeholder and label, so the placeholder is drawn
                over the box instead of set on it, the accessible label avoids the word, and the field name is
                new (the browser's remembered guesses are keyed on it). */}
            {!name && (
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center px-14 font-body text-base tracking-wide text-sand-600">
                {strings.placeholder}
              </span>
            )}
            <input
              type="search"
              name="glyph-script"
              aria-label={strings.inputLabel}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="go"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
              value={name}
              onChange={(e) => handleInputChange(e.target.value)}
              maxLength={30}
              className="name-plaque-input w-full bg-transparent py-4 px-14 text-center font-display text-2xl tracking-[0.12em] text-gold-100 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {results && results.length > 0 && (
        <div key={name} className="reveal" style={reveal(0, { y: 20, dur: 0.5 })}>
          {/* Cartouche */}
          <div className="flex justify-center mb-8">
            <div className="relative inline-flex flex-col items-center">
              {/* Cartouche container */}
              <div id="name-cartouche" className="relative px-5 py-5 sm:px-8 sm:py-6 border-2 border-gold-500/60 rounded-[50px] bg-obsidian-light/30">
                {/* Cartouche baseline */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-8 border-2 border-gold-500/60 border-l-0 rounded-r-md" />

                {/* Hieroglyphs */}
                <div
                  className="flex items-center gap-1 text-gold-400"
                  style={{
                    fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif",
                    // Fits a phone's width for long names (about 80vw of signs), up to the old 6xl on wide screens.
                    fontSize: `clamp(1.25rem, ${(76 / Math.max(results.length, 4)).toFixed(1)}vw, 3.75rem)`,
                  }}
                >
                  {results.map((r, i) => (
                    <span
                      key={`${i}-${r.mapping.glyph}`}
                      className="reveal inline-block cursor-pointer hover:text-gold-300 transition-colors"
                      style={reveal(i * 0.08, { y: 6, dur: 0.3 })}
                      onClick={() => setExpandedSign(expandedSign === i ? null : i)}
                      title={`${r.input.toUpperCase()} → ${r.mapping.signName}`}
                    >
                      {r.mapping.glyph}
                    </span>
                  ))}
                </div>
              </div>

              {/* Label */}
              <p className="font-body text-xs text-sand-600 mt-3 tracking-[0.15em] uppercase">
                {strings.cartoucheOf(name)}
              </p>
              {/* "Why one n in Anna?": English pages only, the Spanish and French spellings have their own rules */}
              {locale === "en" && <DoubleLetterNote name={name} className="mt-4" />}
              {afterCartouche?.(name, results)}
            </div>
          </div>

          {/* Transliteration */}
          <div className="text-center mb-10">
            <p className="font-body text-sm text-sand-500 mb-1">{strings.transliterationLabel}</p>
            <p className="font-display text-2xl text-sand-200 tracking-wider">{transliteration}</p>
          </div>

          {/* Sign breakdown table */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-sand-100 mb-6 text-center">
              {strings.breakdownHeading}
            </h2>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="border border-gold-700/15 bg-obsidian-light/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedSign(expandedSign === i ? null : i)}
                    className="w-full flex items-center gap-4 p-4 text-left group"
                  >
                    {/* Letter */}
                    <span className="min-w-10 h-10 px-1 flex items-center justify-center bg-gold-500/10 border border-gold-500/20 font-display text-lg font-semibold text-gold-400">
                      {r.input.toUpperCase()}
                    </span>

                    {/* Arrow */}
                    <svg className="w-4 h-4 text-sand-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>

                    {/* Glyph */}
                    <span
                      className="text-3xl text-gold-400"
                      style={{
                        fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif",
                      }}
                    >
                      {r.mapping.glyph}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-sand-200 group-hover:text-gold-400 transition-colors">
                        {r.mapping.signName} <span className="text-sand-600">({r.mapping.gardiner})</span>
                      </p>
                      <p className="font-body text-xs text-sand-500">
                        {strings.rowTransliteration} <span className="text-sand-300">{r.mapping.transliteration}</span>
                      </p>
                    </div>

                    {/* Expand icon */}
                    <span
                      className={`flex-shrink-0 text-gold-600 text-lg transition-transform duration-200 ${expandedSign === i ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>

                  {expandedSign === i && (
                    <div className="reveal" style={reveal(0, { y: -6, dur: 0.3 })}>
                      <div className="px-4 pb-4 pt-0 ml-14">
                        <p className="font-body text-sm text-sand-400 font-light leading-relaxed">{r.mapping.note}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {afterBreakdown?.(name, results)}
        </div>
      )}
    </>
  );
}
