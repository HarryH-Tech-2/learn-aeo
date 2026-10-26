"use client";

import { useRef } from "react";
import NameTranslatorTool, { type NameToolStrings } from "@/components/NameTranslatorTool";
import { trackEvent } from "@/lib/analytics";
import { lessonHrefForName } from "@/lib/translator-bridge";
import type { IntlLocale } from "@/lib/hieroglyph-translator-locales";

const STRINGS: Record<IntlLocale, NameToolStrings> = {
  es: {
    inputLabel: "Texto para escribir en jeroglíficos",
    placeholder: "Escribe tu nombre...",
    cartoucheOf: (name) => `Cartucho de ${name}`,
    transliterationLabel: "Transliteración egiptológica",
    breakdownHeading: "Signo por signo",
    rowTransliteration: "Transliteración:",
  },
  fr: {
    inputLabel: "Texte à écrire en hiéroglyphes",
    placeholder: "Tapez votre prénom...",
    cartoucheOf: (name) => `Cartouche de ${name}`,
    transliterationLabel: "Translittération égyptologique",
    breakdownHeading: "Signe par signe",
    rowTransliteration: "Translittération :",
  },
};

const LESSON: Record<IntlLocale, { kicker: string; title: (name: string) => string; body: string; cta: string }> = {
  es: {
    kicker: "Curso gratuito · en inglés",
    title: (name) => `Aprende a leer ${name || "tu nombre"} tú mismo`,
    body: "La primera lección enseña los 25 signos del alfabeto jeroglífico con un juego corto. Es gratis y no hace falta registrarse. El curso está en inglés.",
    cta: "Empezar la lección 1 (en inglés)",
  },
  fr: {
    kicker: "Cours gratuit · en anglais",
    title: (name) => `Apprenez à lire ${name || "votre prénom"} vous-même`,
    body: "La première leçon enseigne les 25 signes de l'alphabet hiéroglyphique grâce à un petit jeu. C'est gratuit, sans inscription. Le cours est en anglais.",
    cta: "Commencer la leçon 1 (en anglais)",
  },
};

/** The name translator on the Spanish and French pages: spelling by that language's sounds, words in that language. */
export default function IntlNameTranslator({ locale }: { locale: IntlLocale }) {
  const typed = useRef(false);
  const lesson = LESSON[locale];
  return (
    <NameTranslatorTool
      locale={locale}
      strings={STRINGS[locale]}
      onChange={(name) => {
        if (!typed.current && name.trim()) {
          typed.current = true;
          trackEvent("translator_type", { locale });
        }
      }}
      afterBreakdown={(name, results) => (
        <div className="mb-8 border border-gold-600/40 bg-gold-500/5 p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex-1">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-2">{lesson.kicker}</p>
            <p className="font-display text-xl text-sand-100 mb-1">{lesson.title(name.trim())}</p>
            <p className="font-body text-sm text-sand-400 leading-relaxed">{lesson.body}</p>
          </div>
          <a
            href={lessonHrefForName(name, results)}
            hrefLang="en"
            onClick={() => trackEvent("translator_to_lesson", { locale, sign_count: new Set(results.map((r) => r.mapping.glyph)).size })}
            className="btn-primary py-3 px-6 text-sm whitespace-nowrap justify-center"
          >
            {lesson.cta}
          </a>
        </div>
      )}
    />
  );
}
