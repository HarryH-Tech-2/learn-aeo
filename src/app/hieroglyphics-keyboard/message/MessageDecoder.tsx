"use client";

/**
 * The secret message, decoded by the friend it was sent to: the card, a key to just the signs it uses, a
 * box for their reading, and once read (or given up on), "write one back" and the free lesson.
 *
 * GA4: keyboard_message_view (style, total), keyboard_message_guess (correct, tries), keyboard_message_reveal,
 * keyboard_message_reply / keyboard_message_lesson (solved: whether they read it themselves).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import KeyboardCard from "@/components/KeyboardCard";
import { trackEvent } from "@/lib/analytics";
import { guestPlayHref } from "@/lib/guest-play";
import { signForKey } from "@/lib/hieroglyph-keyboard";
import { transliterateName, type HieroglyphMapping } from "@/lib/hieroglyph-translator";
import type { CardSpell, KeyboardStyleId } from "@/lib/keyboard-card";

// Letters only, accents folded, so "Zoë" and "zoe" are the same reading.
const letters = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}]/gu, "");

export default function MessageDecoder({ typed, style, spell = "keys" }: { typed: string[]; style: KeyboardStyleId; spell?: CardSpell }) {
  const isName = spell === "name";
  const [guess, setGuess] = useState("");
  const [tries, setTries] = useState(0);
  const [outcome, setOutcome] = useState<"" | "solved" | "revealed">("");
  const [hint, setHint] = useState<string | null>(null);
  const viewed = useRef(false);

  const answer = typed.join("").trim();
  const total = typed.filter((k) => k !== " ").length;
  // The key: each sign in the message once, in alphabetical order of its letter(s), no clue to the order.
  // A name is spelled by sound, so its key reads "SH", "TH"… where the translator joined letters.
  const key = useMemo(() => {
    const seen = new Map<string, HieroglyphMapping>();
    if (isName) {
      for (const w of answer.split(" ")) for (const r of transliterateName(w)) seen.set(r.input, r.mapping);
    } else {
      for (const k of typed) if (k !== " " && signForKey(k)) seen.set(k, signForKey(k)!);
    }
    return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, sign]) => ({ k, sign }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, isName]);

  useEffect(() => {
    if (viewed.current || total === 0) return;
    viewed.current = true;
    trackEvent("keyboard_message_view", { style, total, spell });
  }, [style, total, spell]);

  if (total === 0) {
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl text-sand-100">This message link is incomplete</h1>
        <p className="mt-3 font-body text-sand-300">Part of the link may have been cut off. Ask for it again, or write your own.</p>
        <Link href="/hieroglyphics-keyboard" className="btn-primary mt-6 inline-flex px-7 py-3">
          Open the hieroglyphics keyboard
        </Link>
      </div>
    );
  }

  function check(e: React.FormEvent) {
    e.preventDefault();
    const n = tries + 1;
    setTries(n);
    const correct = letters(guess) === letters(answer);
    trackEvent("keyboard_message_guess", { correct, tries: n, total });
    if (correct) {
      setOutcome("solved");
      return;
    }
    const want = answer.split(" ");
    const got = guess.toLowerCase().trim().split(/\s+/);
    const right = want.filter((w, i) => letters(got[i] ?? "") === w).length;
    setHint(
      want.length > 1 && right > 0
        ? `Not quite: ${right} of ${want.length} words are right. Check the signs against the key.`
        : "Not quite. Match each sign to the key, left to right.",
    );
  }

  function reveal() {
    setOutcome("revealed");
    trackEvent("keyboard_message_reveal", { tries, total });
  }

  const done = outcome !== "";

  return (
    <div>
      <p className="text-center font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">{isName ? "A name puzzle" : "A secret message"}</p>
      <h1 className="mt-2 text-center font-display text-3xl text-sand-100 md:text-4xl">
        {isName ? "Whose name is in this cartouche?" : "Someone wrote you this in hieroglyphs"}
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center font-body text-sand-300">
        {isName
          ? "A cartouche is the oval that held a pharaoh's name. This one holds a name spelled by its sounds. Use the key to read it."
          : "One sign for each letter, the way Egyptian scribes spelled out foreign names. Use the key to read it."}
      </p>

      <KeyboardCard typed={typed} style={style} spell={spell} className="mx-auto mt-8 max-w-3xl border border-gold-600/40 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)]" label="The secret message, in hieroglyphs" />

      {!done ? (
        <>
          <div className="mx-auto mt-8 max-w-3xl">
            <p className="font-body text-sm font-semibold text-sand-200">The key</p>
            <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
              {key.map(({ k, sign }) => (
                <li key={k} className="flex items-center gap-2 border border-gold-700/30 bg-obsidian-light/40 px-2 py-2">
                  <span lang="egy" aria-hidden="true" className="hieroglyph-font text-3xl leading-none text-gold-400">
                    {sign.glyph}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg leading-none text-sand-100">{k.toUpperCase()}</span>
                    <span className="block truncate font-body text-[11px] text-sand-500">{sign.signName}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={check} className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
            <label htmlFor="msg-guess" className="sr-only">
              What does it say?
            </label>
            <input
              id="msg-guess"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="What does it say?"
              autoComplete="off"
              className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-4 py-3 font-body text-base text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none"
            />
            <button type="submit" disabled={!letters(guess)} className="bg-gold-500 px-6 py-3 font-body font-semibold text-black transition-colors hover:bg-gold-400 disabled:opacity-50">
              Check
            </button>
          </form>
          {hint && (
            <p role="status" className="mt-3 text-center font-body text-sm text-sand-300">
              {hint}
            </p>
          )}
          <p className="mt-4 text-center">
            <button type="button" onClick={reveal} className="font-body text-sm text-sand-500 underline underline-offset-4 hover:text-gold-300">
              {tries > 0 ? "Give up and show me" : "Just show me what it says"}
            </button>
          </p>
        </>
      ) : (
        <div className="mx-auto mt-8 max-w-2xl text-center">
          <p className="font-body text-sm text-sand-400">{outcome === "solved" ? `You read it${tries === 1 ? " first time" : ""}. It says:` : "It says:"}</p>
          <p className="mt-2 font-display text-3xl tracking-wide text-gold-300 md:text-4xl">{answer.toUpperCase()}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={isName ? "/translate-name-to-hieroglyphics" : "/hieroglyphics-keyboard"}
              onClick={() => trackEvent("keyboard_message_reply", { solved: outcome === "solved", spell })}
              className="inline-flex items-center justify-center bg-gold-500 px-6 py-3 font-body font-semibold text-black transition-colors hover:bg-gold-400"
            >
              {isName ? "Write your own name" : "Write one back"}
            </Link>
            <Link
              href={guestPlayHref()}
              onClick={() => trackEvent("keyboard_message_lesson", { solved: outcome === "solved" })}
              className="inline-flex items-center justify-center border border-gold-500 px-6 py-3 font-body font-semibold text-gold-300 transition-colors hover:bg-gold-500/15"
            >
              Learn to read them without a key
            </Link>
          </div>
          <p className="mt-3 font-body text-xs text-sand-500">Lesson 1 is free: the whole alphabet, taught through real Egyptian words.</p>
        </div>
      )}
    </div>
  );
}
