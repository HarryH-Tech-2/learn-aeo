/**
 * Why "Anna" has one n in the cartouche (2026-10-19): visitors read the single sign as a mistake. Shown under the
 * cartouche only when the name has a doubled consonant (src/lib/hieroglyph-translator.ts doubledLetters).
 */
import { doubledLetters } from "@/lib/hieroglyph-translator";

function list(letters: string[]): string {
  const quoted = letters.map((l) => l + l);
  return quoted.length === 1 ? quoted[0] : `${quoted.slice(0, -1).join(", ")} and ${quoted[quoted.length - 1]}`;
}

export default function DoubleLetterNote({ name, className = "" }: { name: string; className?: string }) {
  const letters = doubledLetters(name);
  if (letters.length === 0) return null;
  const pair = list(letters);
  const one = letters.length === 1;
  return (
    <div className={`mx-auto max-w-xl border border-gold-700/30 bg-gold-500/[0.06] px-4 py-3 text-left font-body text-sm leading-relaxed text-sand-300 ${className}`}>
      <p>
        <span className="font-semibold text-gold-300">Why is the {pair} written once?</span> Hieroglyphs write the sounds of a name, not its
        spelling. You say the {pair} in {name.trim()} as {one ? "a single sound" : "single sounds"}, so a scribe would carve {one ? "one sign" : "one sign each"}.
      </p>
      <p className="mt-2 text-sand-400">
        English doubles letters for spelling, often just to show how to say the vowel before them (think of <em>hoping</em> and{" "}
        <em>hopping</em>). Egyptian scribes only repeated a sign when the sound itself was said twice, as in{" "}
        <span lang="egy" className="hieroglyph-font text-base text-gold-300">
          𓈖𓈖
        </span>{" "}
        <em>nn</em>, &ldquo;this&rdquo;: two water ripples, because the n is said twice.
      </p>
    </div>
  );
}
