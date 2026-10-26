/**
 * The translated free tools (a French + Spanish test, Oct 2026): the name translator, the alphabet chart and the
 * keyboard. The rest of the site, the course included, is English only. Each page lists every language version
 * (hreflang) so search engines show the right one, with English as x-default.
 */

export const SITE = "https://www.learnhieroglyphics.com";

export type Locale = "en" | "es" | "fr";
export const LOCALES: Locale[] = ["en", "es", "fr"];

export type ToolPage = "translator" | "alphabet" | "keyboard";

/** Path of each tool page in each language. Slugs are what people search for in that language. */
export const TOOL_PATHS: Record<ToolPage, Record<Locale, string>> = {
  translator: {
    en: "/translate-name-to-hieroglyphics",
    es: "/es/escribir-nombre-en-jeroglificos",
    fr: "/fr/ecrire-son-prenom-en-hieroglyphes",
  },
  alphabet: {
    en: "/hieroglyphic-alphabet",
    es: "/es/alfabeto-jeroglifico",
    fr: "/fr/alphabet-hieroglyphique",
  },
  keyboard: {
    en: "/hieroglyphics-keyboard",
    es: "/es/teclado-jeroglificos",
    fr: "/fr/clavier-hieroglyphes",
  },
};

/** hreflang codes, and the og:locale for each language. */
export const HREFLANG: Record<Locale, string> = { en: "en", es: "es", fr: "fr" };
export const OG_LOCALE: Record<Locale, string> = { en: "en_GB", es: "es_ES", fr: "fr_FR" };

/** Native names, for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", es: "Español", fr: "Français" };

export function toolUrl(page: ToolPage, locale: Locale): string {
  return SITE + TOOL_PATHS[page][locale];
}

/** Next.js `alternates` for a tool page: its own canonical plus every language version and x-default (English). */
export function toolAlternates(page: ToolPage, locale: Locale) {
  return {
    canonical: toolUrl(page, locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], toolUrl(page, l)])),
      "x-default": toolUrl(page, "en"),
    },
  };
}
