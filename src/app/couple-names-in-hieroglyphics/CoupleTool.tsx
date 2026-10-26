"use client";

/**
 * Two names together (2026-10-19): a couple's cartouches side by side with the ankh between them and their year in
 * Egyptian numerals, for a wedding, an anniversary or a card. The print is the family print (two cartouches on one
 * page, src/components/CartouchePrintOffer.tsx) with both names already on it.
 *
 * GA4: couple_names (when both names can be written), then the cartouche_print_* events.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartouchePrintOffer from "@/components/CartouchePrintOffer";
import { reveal } from "@/components/reveal";
import { trackEvent } from "@/lib/analytics";
import { transliterateName, getTransliteration, doubledLetters } from "@/lib/hieroglyph-translator";
import DoubleLetterNote from "@/components/DoubleLetterNote";
import { normaliseShareName } from "@/lib/share";
import { MAX_NUMBER, toHieroglyphic } from "@/lib/numerals";

function glyphsOf(name: string): string {
  return transliterateName(name)
    .map((r) => r.mapping.glyph)
    .join("");
}

function Cartouche({ name }: { name: string }) {
  const glyphs = glyphsOf(name);
  return (
    <figure className="flex flex-col items-center">
      <div className="flex min-h-[86px] items-center rounded-full border-[3px] border-gold-400 px-6 py-3 shadow-[0_0_30px_-10px_rgba(212,168,50,0.6)]">
        <span lang="egy" className="hieroglyph-font whitespace-nowrap text-4xl leading-none text-gold-200 antialiased sm:text-5xl" aria-hidden="true">
          {glyphs}
        </span>
      </div>
      <figcaption className="mt-2 font-display text-lg tracking-[0.15em] text-sand-100">{name.toUpperCase()}</figcaption>
      <span className="font-body text-xs text-sand-500">{getTransliteration(name)}</span>
    </figure>
  );
}

export default function CoupleTool({ children }: { children: ReactNode }) {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [year, setYear] = useState("");
  const tracked = useRef("");
  useEffect(() => setYear(String(new Date().getFullYear())), []);

  const a = normaliseShareName(first);
  const b = normaliseShareName(second);
  const okA = !!a && transliterateName(a).length > 0;
  const okB = !!b && transliterateName(b).length > 0;
  const yearNum = Number(year);
  const yearOk = /^\d{1,7}$/.test(year) && yearNum > 0 && yearNum <= MAX_NUMBER;
  const numerals = useMemo(() => (yearOk ? toHieroglyphic(yearNum) : ""), [yearOk, yearNum]);

  useEffect(() => {
    if (!okA || !okB) return;
    const key = `${a}|${b}`.toLowerCase();
    if (tracked.current === key) return;
    tracked.current = key;
    trackEvent("couple_names", { length: (a + b).length });
  }, [okA, okB, a, b]);

  const input = "w-full border border-gold-600/50 bg-obsidian px-4 py-3 text-center font-display text-xl tracking-[0.1em] text-gold-100 placeholder:font-body placeholder:text-base placeholder:tracking-normal placeholder:text-sand-600 focus:border-gold-400 focus:outline-none";

  return (
    <main className="grain-overlay">
      <Navbar />
      <div className="min-h-screen pt-24 pb-20 md:pt-32">
        <div className="is-inview mx-auto max-w-4xl px-6 lg:px-8">
          <div className="reveal mb-8 text-center md:mb-12" style={reveal(0, { y: 20 })}>
            <p className="mb-3 font-body text-xs uppercase tracking-[0.25em] text-gold-500">Free · weddings, anniversaries, cards</p>
            <h1 className="mb-4 font-display text-3xl font-light text-sand-100 sm:text-4xl md:mb-6 md:text-5xl">
              Two Names in <span className="text-gradient-gold font-medium">Hieroglyphics</span>
            </h1>
            <p className="mx-auto max-w-2xl font-body text-lg font-light text-sand-400">
              Write both names in Egyptian hieroglyphs, each in its own royal cartouche, with the ankh of life between them and your year in
              Egyptian numerals.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_8rem] sm:items-end">
            <label className="block">
              <span className="mb-1 block font-body text-xs uppercase tracking-[0.18em] text-sand-500">First name</span>
              <input value={first} onChange={(e) => setFirst(e.target.value)} maxLength={30} placeholder="e.g. Anna" className={input} />
            </label>
            <span lang="egy" aria-hidden="true" className="hieroglyph-font hidden pb-3 text-3xl text-gold-400 sm:block">
              𓋹
            </span>
            <label className="block">
              <span className="mb-1 block font-body text-xs uppercase tracking-[0.18em] text-sand-500">Second name</span>
              <input value={second} onChange={(e) => setSecond(e.target.value)} maxLength={30} placeholder="e.g. Tom" className={input} />
            </label>
            <label className="block">
              <span className="mb-1 block font-body text-xs uppercase tracking-[0.18em] text-sand-500">Year</span>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 7))}
                inputMode="numeric"
                placeholder="2026"
                className={input}
              />
            </label>
          </div>
          {(first && !okA) || (second && !okB) ? (
            <p className="mt-2 text-center font-body text-sm text-red-300">Names can use letters, spaces, hyphens and apostrophes only.</p>
          ) : null}

          {okA && okB && (
            <section aria-label="The two cartouches" className="mt-10 border border-gold-600/40 bg-obsidian-light/40 p-6 text-center md:p-10">
              <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-8">
                <Cartouche name={a!} />
                <span lang="egy" className="hieroglyph-font text-5xl text-gold-400" aria-label="ankh, life">
                  𓋹
                </span>
                <Cartouche name={b!} />
              </div>
              {/* "Why one n in Anna?", for whichever name has a doubled letter */}
              <DoubleLetterNote name={doubledLetters(a!).length > 0 ? a! : b!} className="mt-6" />
              {yearOk && (
                <div className="mt-8">
                  <span lang="egy" className="hieroglyph-font text-4xl tracking-[0.15em] text-gold-200" aria-label={`${yearNum} in Egyptian numerals`}>
                    {numerals}
                  </span>
                  <p className="mt-1 font-body text-sm text-sand-400">
                    {yearNum} in Egyptian numerals: each lotus is a thousand, each coil a hundred, each hobble ten and each stroke one.
                  </p>
                </div>
              )}
              <p className="mt-6 font-body text-sm text-sand-400">
                Screenshot it for a card, or have both cartouches printed on one page below.
              </p>
              <div className="mt-6 text-left">
                <CartouchePrintOffer name={a!} initialExtra={[b!]} bleed={false} />
              </div>
            </section>
          )}

          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
