"use client";

/**
 * The Egyptian numerals converter (2026-10-20): a number written in hieroglyphs (grouped the way scribes stacked
 * them), signs read back to a number, and a date written in numerals and placed on the ancient civil calendar.
 * Pure helpers: src/lib/numerals.ts (the signs) and src/lib/egyptian-calendar.ts (the calendar).
 *
 * GA4: numerals_convert {question_type: number|reverse|date} once per visit per mode after a change, numerals_copy.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { MAX_NUMBER, NUMERAL_SIGNS, decompose, fromHieroglyphic, toHieroglyphic } from "@/lib/numerals";
import { civilDate, describeCivilDate, parseIsoDate } from "@/lib/egyptian-calendar";

type Mode = "number" | "reverse" | "date";

/** How scribes stacked repeated signs: 7 strokes are 4 over 3, 9 are three rows of three. */
const ROWS: Record<number, number[]> = { 1: [1], 2: [2], 3: [3], 4: [4], 5: [3, 2], 6: [3, 3], 7: [4, 3], 8: [4, 4], 9: [3, 3, 3] };

const GLYPH_FONT = "hieroglyph-font";

/** The number as scribes laid it out: one stacked group per sign, largest first in reading order. */
export function NumeralGroups({ n, size = "text-5xl", rtl = false }: { n: number; size?: string; rtl?: boolean }) {
  const parts = decompose(n);
  return (
    <div lang="egy" className={`flex flex-wrap items-end justify-center gap-x-3 gap-y-2 ${rtl ? "flex-row-reverse" : ""}`} aria-label={`${n.toLocaleString("en-GB")} in Egyptian numerals`} role="img">
      {parts.map(({ sign, count }) => (
        <span key={sign.value} className={`inline-flex flex-col items-center leading-[0.95] ${size} ${GLYPH_FONT} text-gold-200`}>
          {ROWS[count].map((r, i) => (
            <span key={i} className="whitespace-nowrap">
              {sign.glyph.repeat(r)}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

function CopyButton({ text, mode }: { text: string; mode: Mode }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          },
          () => {}
        );
        trackEvent("numerals_copy", { question_type: mode });
      }}
      className="border border-gold-500/60 px-4 py-2 font-body text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/15"
    >
      {copied ? "Copied" : "Copy hieroglyphs"}
    </button>
  );
}

function parseNumber(raw: string): number | null {
  const clean = raw.replace(/[\s,._']/g, "");
  if (!/^\d{1,7}$/.test(clean)) return null;
  const n = Number(clean);
  return n >= 1 && n <= MAX_NUMBER ? n : null;
}

function Breakdown({ n }: { n: number }) {
  return (
    <ul className="mt-5 space-y-1.5">
      {decompose(n).map(({ sign, count }) => (
        <li key={sign.value} className="flex items-center gap-3 font-body text-sm text-sand-300">
          <span className={`${GLYPH_FONT} w-10 shrink-0 text-center text-2xl text-sand-100`} lang="egy">
            {sign.glyph}
          </span>
          <span>
            <strong className="font-medium text-sand-100">{count}</strong> × {sign.name} ({sign.value.toLocaleString("en-GB")}) ={" "}
            <strong className="font-medium text-gold-300">{(count * sign.value).toLocaleString("en-GB")}</strong>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function NumeralsTool() {
  const [mode, setMode] = useState<Mode>("number");
  const [raw, setRaw] = useState("2026");
  const [rtl, setRtl] = useState(false);
  const [signs, setSigns] = useState("𓆼𓆼𓎆𓎆𓏤𓏤𓏤𓏤𓏤𓏤");
  const [date, setDate] = useState("");
  const tracked = useRef(new Set<Mode>());

  // Today, set after mount so the server and the browser agree on the first render.
  useEffect(() => {
    const d = new Date();
    setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);

  const changed = (m: Mode) => {
    if (tracked.current.has(m)) return;
    tracked.current.add(m);
    trackEvent("numerals_convert", { question_type: m });
  };

  const n = parseNumber(raw);
  const reverse = useMemo(() => fromHieroglyphic(signs), [signs]);
  const parsedDate = parseIsoDate(date);
  const civil = parsedDate ? civilDate(parsedDate.year, parsedDate.month, parsedDate.day) : null;

  const tab = (m: Mode, label: string) => (
    <button
      key={m}
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => setMode(m)}
      className={`px-4 py-2.5 font-body text-sm font-semibold transition-colors ${mode === m ? "bg-gold-500 text-black" : "text-sand-300 hover:text-gold-300"}`}
    >
      {label}
    </button>
  );

  return (
    <section className="mb-12 border border-gold-600/40 bg-obsidian-light/40 p-5 sm:p-7" aria-label="Egyptian numerals converter">
      <div role="tablist" aria-label="What to convert" className="mb-6 inline-flex flex-wrap border border-gold-600/40">
        {tab("number", "Number to hieroglyphs")}
        {tab("reverse", "Hieroglyphs to number")}
        {tab("date", "Date")}
      </div>

      {mode === "number" && (
        <div>
          <label htmlFor="num-in" className="mb-2 block font-body text-xs uppercase tracking-[0.2em] text-gold-500">
            Type a number (1 to 9,999,999)
          </label>
          <input
            id="num-in"
            inputMode="numeric"
            autoComplete="off"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value.slice(0, 12));
              changed("number");
            }}
            className="w-full max-w-xs border border-gold-600/50 bg-obsidian px-4 py-3 font-display text-2xl tracking-wider text-gold-100 focus:border-gold-400 focus:outline-none"
          />
          <div className="mt-6 flex min-h-[7rem] items-center justify-center border border-gold-700/30 bg-obsidian/60 px-4 py-6" aria-live="polite">
            {n ? (
              <NumeralGroups n={n} rtl={rtl} />
            ) : (
              <p className="font-body text-sm text-sand-500">{raw.trim() ? "Whole numbers from 1 to 9,999,999. The Egyptians had no sign for zero." : "Type a number above."}</p>
            )}
          </div>
          {n && (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <CopyButton text={toHieroglyphic(n)} mode="number" />
                <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-sand-400">
                  <input type="checkbox" checked={rtl} onChange={(e) => setRtl(e.target.checked)} className="accent-[#d4a832]" />
                  Right to left, as most inscriptions run
                </label>
              </div>
              <Breakdown n={n} />
            </>
          )}
        </div>
      )}

      {mode === "reverse" && (
        <div>
          <p className="mb-3 font-body text-sm text-sand-300">Tap the signs, or paste numerals from an inscription. Order doesn&apos;t matter: Egyptian numbers just add up.</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {NUMERAL_SIGNS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  setSigns((x) => x + s.glyph);
                  changed("reverse");
                }}
                className="flex min-w-[4.5rem] flex-col items-center border border-gold-700/40 bg-obsidian px-2 py-2 transition-colors hover:border-gold-400"
                aria-label={`Add ${s.name}, ${s.value.toLocaleString("en-GB")}`}
              >
                <span className={`${GLYPH_FONT} text-3xl text-sand-100`} lang="egy">
                  {s.glyph}
                </span>
                <span className="mt-1 font-body text-[11px] text-sand-400">{s.value.toLocaleString("en-GB")}</span>
              </button>
            ))}
          </div>
          <label htmlFor="signs-in" className="sr-only">
            Hieroglyphic numerals
          </label>
          <textarea
            id="signs-in"
            rows={2}
            value={signs}
            onChange={(e) => {
              setSigns(e.target.value);
              changed("reverse");
            }}
            className={`${GLYPH_FONT} w-full border border-gold-600/50 bg-obsidian px-4 py-3 text-3xl text-gold-100 focus:border-gold-400 focus:outline-none`}
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={() => setSigns((x) => Array.from(x).slice(0, -1).join(""))} className="border border-gold-700/50 px-3 py-1.5 font-body text-sm text-sand-300 hover:border-gold-400">
              Delete last
            </button>
            <button type="button" onClick={() => setSigns("")} className="border border-gold-700/50 px-3 py-1.5 font-body text-sm text-sand-300 hover:border-gold-400">
              Clear
            </button>
          </div>
          <p className="mt-6 font-display text-4xl text-gold-200" aria-live="polite">
            {reverse !== null ? reverse.toLocaleString("en-GB") : <span className="font-body text-sm text-sand-500">{signs.trim() ? "Only the seven number signs can be read here." : "Add some signs."}</span>}
          </p>
          {reverse !== null && reverse <= MAX_NUMBER && <Breakdown n={reverse} />}
        </div>
      )}

      {mode === "date" && (
        <div>
          <label htmlFor="date-in" className="mb-2 block font-body text-xs uppercase tracking-[0.2em] text-gold-500">
            Pick a date: a birthday, a wedding, today
          </label>
          <input
            id="date-in"
            type="date"
            min="0001-01-01"
            max="9999-12-31"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              changed("date");
            }}
            className="border border-gold-600/50 bg-obsidian px-4 py-3 font-body text-lg text-gold-100 [color-scheme:dark] focus:border-gold-400 focus:outline-none"
          />
          {parsedDate && civil && (
            <div className="mt-6 grid gap-5 md:grid-cols-2" aria-live="polite">
              <div className="border border-gold-700/30 bg-obsidian/60 p-5">
                <p className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-gold-500">Your date in Egyptian numerals</p>
                <div className="flex flex-wrap items-end justify-center gap-6">
                  {[
                    { label: "Day", v: parsedDate.day },
                    { label: "Month", v: parsedDate.month },
                    { label: "Year", v: parsedDate.year },
                  ].map((p) => (
                    <div key={p.label} className="flex flex-col items-center gap-2">
                      <NumeralGroups n={p.v} size="text-4xl" />
                      <span className="font-body text-[11px] uppercase tracking-[0.15em] text-sand-500">
                        {p.label} · {p.v}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <CopyButton text={[parsedDate.day, parsedDate.month, parsedDate.year].map(toHieroglyphic).join(" ")} mode="date" />
                </div>
              </div>
              <div className="border border-gold-700/30 bg-obsidian/60 p-5">
                <p className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-gold-500">On the ancient Egyptian calendar</p>
                {civil.kind === "month" ? (
                  <>
                    <div lang="egy" className={`flex flex-wrap items-end justify-center gap-x-2 gap-y-2 ${GLYPH_FONT} text-4xl text-gold-200`}>
                      <span title="ꜣbd, month">𓇹𓇼</span>
                      <NumeralGroups n={civil.monthInSeason} size="text-4xl" />
                      <span className="self-center font-body text-base italic text-sand-200">{civil.season.translit}</span>
                      <span title="sw, day">𓇳</span>
                      <NumeralGroups n={civil.day} size="text-4xl" />
                    </div>
                    <p className="mt-4 text-center font-body text-sm italic text-sand-400">
                      ꜣbd {civil.monthInSeason} {civil.season.translit} sw {civil.day}
                    </p>
                  </>
                ) : (
                  <div lang="egy" className={`flex items-end justify-center gap-2 ${GLYPH_FONT} text-4xl text-gold-200`}>
                    <NumeralGroups n={civil.day} size="text-4xl" />
                  </div>
                )}
                <p className="mt-3 text-center font-body text-base text-sand-100">{describeCivilDate(civil)}</p>
                <p className="mt-3 font-body text-xs leading-relaxed text-sand-500">
                  {civil.kind === "month"
                    ? `${civil.season.name}: ${civil.season.meaning.toLowerCase()}. `
                    : "The five extra days at the end of the year were the birthdays of five gods, children of the sky goddess Nut. "}
                  The civil year had no leap day, so it drifts against ours: every four years the same modern date lands one day later in the Egyptian month.
                </p>
              </div>
            </div>
          )}
          {date && !parsedDate && <p className="mt-4 font-body text-sm text-sand-500">Pick a date from the year 1 onwards.</p>}
        </div>
      )}
    </section>
  );
}
