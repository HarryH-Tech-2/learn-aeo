"use client";

/**
 * The cuneiform name writer (2026-10-24): a name in Babylonian syllable signs (src/lib/cuneiform.ts), the same name
 * in hieroglyphs beside it, and a "tell me when a cuneiform course opens" box, the demand test this page exists for.
 * Events: cuneiform_convert (once per visit), cuneiform_marker, cuneiform_copy, cuneiform_to_hieroglyphs,
 * cuneiform_interest (the email box).
 */
import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { cuneiformName, type NameMarker } from "@/lib/cuneiform";
import { transliterateName } from "@/lib/hieroglyph-translator";

export default function CuneiformTool({ fontClass }: { fontClass: string }) {
  const [name, setName] = useState("Harry");
  const [marker, setMarker] = useState<NameMarker>("none");
  const [copied, setCopied] = useState(false);
  const typed = useRef(false);

  const result = useMemo(() => cuneiformName(name, marker), [name, marker]);
  const hieroglyphs = useMemo(() => transliterateName(name).map((r) => r.mapping.glyph).join(""), [name]);
  const empty = result.syllables.length === 0;

  const markerButton = (m: NameMarker, label: string) => (
    <button
      key={m}
      type="button"
      role="radio"
      aria-checked={marker === m}
      onClick={() => {
        setMarker(m);
        trackEvent("cuneiform_marker", { question_type: m });
      }}
      className={`px-3 py-2 font-body text-sm transition-colors ${marker === m ? "bg-gold-500 font-semibold text-black" : "text-sand-300 hover:text-gold-300"}`}
    >
      {label}
    </button>
  );

  return (
    <section className="mb-12 border border-gold-600/40 bg-obsidian-light/40 p-5 sm:p-7" aria-label="Write your name in cuneiform">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <label htmlFor="cun-name" className="mb-2 block font-body text-xs uppercase tracking-[0.2em] text-gold-500">
            Your name, spelled the way it sounds
          </label>
          <input
            id="cun-name"
            type="text"
            value={name}
            maxLength={30}
            autoComplete="given-name"
            onChange={(e) => {
              setName(e.target.value);
              if (!typed.current) {
                typed.current = true;
                trackEvent("cuneiform_convert");
              }
            }}
            className="w-full border border-gold-700/40 bg-obsidian px-4 py-3 font-display text-2xl text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none"
            placeholder="Your first name"
          />
        </div>
        <div>
          <p className="mb-2 font-body text-xs uppercase tracking-[0.2em] text-gold-500" id="cun-marker">
            Name marker
          </p>
          <div role="radiogroup" aria-labelledby="cun-marker" className="inline-flex border border-gold-600/40">
            {markerButton("none", "None")}
            {markerButton("man", "Man")}
            {markerButton("woman", "Woman")}
          </div>
        </div>
      </div>

      <div className="mt-6 border border-gold-700/25 bg-obsidian p-5 sm:p-7 text-center">
        {empty ? (
          <p className="font-body text-sand-400">Type a name with at least one letter.</p>
        ) : (
          <>
            <p className={`${fontClass} break-words text-5xl leading-snug text-sand-100 sm:text-6xl md:text-7xl`} lang="akk-Xsux" aria-label={`${name} in cuneiform`}>
              {result.text}
            </p>
            <p className="mt-3 font-body text-lg italic text-gold-300">{result.transliteration}</p>
            <ol className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Sign by sign">
              {result.marker && (
                <li className="flex items-center gap-2 border border-dashed border-sand-600/50 px-3 py-1.5">
                  <span className={`${fontClass} text-2xl text-sand-200`}>{result.marker.sign.glyph}</span>
                  <span className="font-body text-xs text-sand-400">
                    {result.marker.sign.name} · silent, marks {result.marker.label}
                  </span>
                </li>
              )}
              {result.syllables.map((s, i) => (
                <li key={i} className="flex items-center gap-2 border border-gold-700/25 bg-obsidian-lighter px-3 py-1.5">
                  <span className={`${fontClass} text-2xl text-sand-100`}>{s.sign.glyph}</span>
                  <span className="font-body text-xs text-sand-300">
                    <em className="text-gold-300">{s.reading}</em>
                    {s.sign.name.toLowerCase().replace(/[.₂]/g, "") !== s.reading && <span className="text-sand-500"> · the {s.sign.name} sign</span>}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(result.text).then(
                    () => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    },
                    () => null,
                  );
                  trackEvent("cuneiform_copy");
                }}
                className="border border-gold-500/60 px-4 py-2 font-body text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/15"
              >
                {copied ? "Copied" : "Copy the cuneiform"}
              </button>
            </div>
            <p className="mt-4 font-body text-xs text-sand-500">Read left to right, the way Babylonian scribes wrote on clay.</p>
          </>
        )}
      </div>

      {!empty && hieroglyphs && (
        <div className="mt-4 flex flex-col items-center gap-3 border border-gold-700/20 bg-obsidian-light/50 p-4 sm:flex-row sm:justify-between">
          <p className="font-body text-sm text-sand-300">
            The same name in Egyptian hieroglyphs: <span className="hieroglyph-font ml-1 text-2xl text-sand-100" lang="egy">{hieroglyphs}</span>
          </p>
          <Link
            href={`/translate-name-to-hieroglyphics?name=${encodeURIComponent(name.trim().slice(0, 30))}`}
            onClick={() => trackEvent("cuneiform_to_hieroglyphs")}
            className="shrink-0 border border-gold-500 px-4 py-2 font-body text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/15"
          >
            See it in a cartouche
          </Link>
        </div>
      )}

      <CourseInterest name={name} />
    </section>
  );
}

/** "Tell me if a cuneiform course opens": the page's demand signal. Stored as an EmailLead (source cuneiform-course). */
function CourseInterest({ name }: { name: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function send(e: FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      const r = await fetch("/api/cuneiform-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim().slice(0, 30) || null }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState("done");
      trackEvent("cuneiform_interest");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-6 border border-gold-500/30 bg-gold-500/5 p-4 font-body text-sm text-sand-200" role="status">
        Thank you. You will hear from us once, when a cuneiform course opens.
      </p>
    );
  }
  return (
    <form onSubmit={send} className="mt-6 border border-gold-500/30 bg-gold-500/5 p-4 sm:p-5">
      <label htmlFor="cun-email" className="block font-display text-lg text-sand-100">
        Would you learn to read cuneiform?
      </label>
      <p className="mt-1 mb-3 font-body text-sm text-sand-400">
        We are thinking about a course, starting with the Babylonian of Hammurabi and Gilgamesh. Leave your email and we will write once, if it opens.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="cun-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-3 py-2 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "busy"}
          className="border border-gold-500 px-4 py-2 font-body text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/15 disabled:opacity-50"
        >
          {state === "busy" ? "Sending…" : "Tell me"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className="mt-2 font-body text-xs text-red-300">
          That did not go through. Please try again.
        </p>
      )}
    </form>
  );
}
