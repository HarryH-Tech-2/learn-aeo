import Link from "next/link";
import { UNILITERAL_GROUPS } from "@/lib/content/uniliterals";
import { ALPHABET_I18N, TABLE_LABELS } from "@/lib/content/alphabet-i18n";
import { TOOL_PATHS, type Locale } from "@/lib/i18n";

/** Gardiner sign-list codes for the 25 uniliteral signs, keyed by glyph. */
export const GARDINER_CODES: Record<string, string> = {
  "𓄿": "G1",
  "𓇋": "M17",
  "𓇌": "M17A",
  "𓂝": "D36",
  "𓅱": "G43",
  "𓃀": "D58",
  "𓊪": "Q3",
  "𓆑": "I9",
  "𓅓": "G17",
  "𓈖": "N35",
  "𓂋": "D21",
  "𓉔": "O4",
  "𓎛": "V28",
  "𓐍": "Aa1",
  "𓄡": "F32",
  "𓋴": "S29",
  "𓊃": "O34",
  "𓈙": "N37",
  "𓈎": "N29",
  "𓎡": "V31",
  "𓎼": "W11",
  "𓏏": "X1",
  "𓍿": "V13",
  "𓂧": "D46",
  "𓆓": "I10",
};

/** The closest English letter(s) for each sign — what the name translator uses. */
export const ENGLISH_EQUIVALENT: Record<string, string> = {
  "𓄿": "a",
  "𓇋": "i, e",
  "𓇌": "y (ee)",
  "𓂝": "a (deep)",
  "𓅱": "w, u, o",
  "𓃀": "b",
  "𓊪": "p",
  "𓆑": "f, v",
  "𓅓": "m",
  "𓈖": "n",
  "𓂋": "r, l",
  "𓉔": "h",
  "𓎛": "h (breathy)",
  "𓐍": "kh (loch)",
  "𓄡": "kh (soft)",
  "𓋴": "s",
  "𓊃": "z",
  "𓈙": "sh",
  "𓈎": "q, c (hard)",
  "𓎡": "k",
  "𓎼": "g",
  "𓏏": "t",
  "𓍿": "ch (church)",
  "𓂧": "d",
  "𓆓": "j (judge)",
};

export const UNILITERALS = UNILITERAL_GROUPS.flatMap((g) => g.glyphs);

type Props = {
  /** Compact: sign, sound, English, name only. Full: adds "why this picture" and an example. */
  variant?: "compact" | "full";
  className?: string;
  /** Language of the chart's words (src/lib/content/alphabet-i18n.ts); the signs and codes never change. */
  locale?: Locale;
};

/**
 * Server-rendered HTML table of the 25 alphabet signs. Plain markup (no
 * canvas, no client JS) so search engines and AI crawlers can read every
 * sign, sound and example — the worksheet and translator draw the same chart
 * on canvas, which crawlers cannot see.
 */
export default function AlphabetTable({ variant = "compact", className = "", locale = "en" }: Props) {
  const full = variant === "full";
  const t = TABLE_LABELS[locale];
  const local = locale === "en" ? null : ALPHABET_I18N[locale];
  return (
    <div className={`overflow-x-auto border border-gold-700/20 ${className}`}>
      <table className="w-full border-collapse font-body text-sm md:text-base">
        <caption className="sr-only">{t.caption(full)}</caption>
        <thead>
          <tr className="bg-obsidian-light/60 text-left">
            <th scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
              {t.sign}
            </th>
            <th scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
              {t.sound}
            </th>
            <th scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
              {t.equivalent}
            </th>
            <th scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
              {t.shows}
            </th>
            {full && (
              <th scope="col" className="px-3 py-3 font-medium text-gold-400 text-xs tracking-[0.15em] uppercase">
                {t.example}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {UNILITERALS.map((g) => {
            const code = GARDINER_CODES[g.symbol] ?? "";
            const l = local?.[g.symbol];
            const [enName, ...enRest] = g.meaning.split(/: | — /);
            const name = l ? l.name : enName;
            const rest = l ? [l.desc] : enRest;
            const origin = l ? l.origin : g.origin;
            const example = l ? l.example : g.examples[0];
            return (
              <tr key={g.symbol} className="border-t border-gold-700/15 align-top">
                <th scope="row" className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-3xl md:text-4xl leading-none text-sand-100 hieroglyph-font" lang="egy">
                    {g.symbol}
                  </span>
                  {code && (
                    <span className="block font-body text-[10px] tracking-[0.15em] uppercase text-sand-500 mt-1">
                      {code}
                    </span>
                  )}
                </th>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-sand-100 font-medium">{g.transliteration}</span>
                  <span className="block text-xs text-sand-500">
                    {t.say} {t.quote[0]}{l ? l.say : g.pronunciation}{t.quote[1]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sand-200 whitespace-nowrap">{l ? l.equivalent : ENGLISH_EQUIVALENT[g.symbol] ?? "–"}</td>
                <td className="px-3 py-2.5 text-sand-300 font-light">
                  <span className="text-sand-200">{name}</span>
                  {full && rest.length > 0 && <span className="block text-sand-400">{rest.join("; ")}</span>}
                  {full && origin && <span className="block text-xs text-sand-500 mt-1">{origin}</span>}
                </td>
                {full && (
                  <td className="px-3 py-2.5 text-sand-300 font-light">
                    {example && (
                      <span className="hieroglyph-font" lang="egy">
                        {example}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!full && (
        <p className="px-3 py-3 border-t border-gold-700/15 font-body text-xs text-sand-500">
          {t.more}{" "}
          <Link href={TOOL_PATHS.alphabet[locale]} className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
            {t.moreLink}
          </Link>
          .
        </p>
      )}
    </div>
  );
}
