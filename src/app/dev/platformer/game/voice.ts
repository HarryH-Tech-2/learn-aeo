/**
 * The game talks, in two voices, both silenced by the sound toggle:
 *
 *   • the sign voice says a sound the way an alphabet book would ("B, as in
 *     boy!"), a touch slower than talk so the sound can be caught;
 *   • Khety the mummy says his lines a little higher and quicker.
 *
 * Where the sound comes from, best first:
 *
 *   1. a recorded clip, if one has been made for exactly this line:
 *      /dev-audio/manifest.json maps a line's key (`clipKey`) to a file in the
 *      same folder. Every line the game can say is listed by `spokenLines()`,
 *      so a set can be generated once with any text-to-speech service and
 *      sounds the same on every machine;
 *   2. otherwise the browser's own speech (the Web Speech API). That is only
 *      as good as the voices the machine has: Edge has natural ones, Chrome
 *      on Windows mostly the old robotic ones. The learner can choose among
 *      what is installed (`voices()`, `chooseVoice()`); the choice is kept.
 */
import { speechSupported } from "@/lib/speech";
import { UNILITERAL_GROUPS } from "@/lib/content/uniliterals";
import { game } from "./store";
import { ALL_LINES } from "./khety";

// ─── recorded clips ───

const CLIP_DIR = "/dev-audio/";
let manifest: Record<string, string> | null | undefined;
let playing: HTMLAudioElement | null = null;

/** A short, stable name for a line: what its recording is filed under. */
export function clipKey(text: string): string {
  let h = 5381;
  for (const ch of forSpeech(text).toLowerCase()) h = (Math.imul(h, 33) ^ ch.codePointAt(0)!) >>> 0;
  return h.toString(36);
}

let manifestReady: Promise<void> | undefined;

/** Fetch the clip list once; the first line spoken waits for it so it is not left to the browser voice. */
function loadManifest(): Promise<void> {
  if (manifestReady) return manifestReady;
  manifest = null;
  if (typeof fetch === "undefined") return (manifestReady = Promise.resolve());
  return (manifestReady = fetch(CLIP_DIR + "manifest.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((m) => {
      if (m && typeof m === "object") manifest = m as Record<string, string>;
    })
    .catch(() => undefined));
}

if (typeof window !== "undefined") void loadManifest();

/** Everything the game can say, with the key its recording would be filed under. For whoever generates the clips. */
export function spokenLines(): { key: string; voice: "khety" | "sign"; text: string }[] {
  const signs = UNILITERAL_GROUPS.flatMap((g) => g.glyphs).map((g) => speakable(g.pronunciation));
  return [...ALL_LINES.map((text) => ({ key: clipKey(text), voice: "khety" as const, text: forSpeech(text) })), ...[...new Set(signs)].map((text) => ({ key: clipKey(text), voice: "sign" as const, text }))];
}

// ─── the browser's own voices ───

const VOICE_KEY = "lh:causeway:voice";

/** Natural-sounding voices first (Edge's "Online (Natural)", Chrome's Google voices, Apple's named ones), then anything English. */
const PREFERRED = [/natural/i, /google uk english female/i, /google uk english/i, /sonia|libby|maisie|serena|kate|martha/i, /samantha|karen|moira|tessa/i, /google us english/i, /aria|jenny|zira|hazel|susan/i];

let chosen: SpeechSynthesisVoice | null | undefined;

/** The English voices this browser has, best guesses first. */
export function voices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  const all = window.speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
  const rank = (v: SpeechSynthesisVoice) => {
    const i = PREFERRED.findIndex((p) => p.test(v.name));
    return i < 0 ? PREFERRED.length : i;
  };
  return [...all].sort((a, b) => rank(a) - rank(b));
}

export function currentVoice(): string {
  return pickVoice()?.name ?? "";
}

/** The learner's own choice among the installed voices; kept for next time. */
export function chooseVoice(name: string): void {
  try {
    localStorage.setItem(VOICE_KEY, name);
  } catch {}
  chosen = undefined;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (chosen) return chosen;
  const list = voices();
  if (list.length === 0) return null; // (not loaded yet: ask again next time)
  let saved = "";
  try {
    saved = localStorage.getItem(VOICE_KEY) ?? "";
  } catch {}
  return (chosen = list.find((v) => v.name === saved) ?? list[0]);
}

if (speechSupported()) {
  // the list arrives late in most browsers
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    chosen = undefined;
  });
}

// ─── saying things ───

/** volume: 0 to 1, for recordings and the browser voice alike */
type Line = { text: string; rate: number; pitch: number; volume: number };

let speaking = 0;

/** Say these one after another, dropping whatever was being said before. A line with a recording plays it; the rest are spoken by the browser. */
function speakAll(lines: Line[]): void {
  if (game.get().muted || typeof window === "undefined") return;
  const turn = ++speaking;
  try {
    playing?.pause();
    playing = null;
    if (speechSupported()) window.speechSynthesis.cancel();
    const queue = lines.filter((l) => l.text.trim());
    const next = () => {
      const l = queue.shift();
      if (!l || turn !== speaking || game.get().muted) return;
      const file = manifest?.[clipKey(l.text)];
      if (file) {
        const a = new Audio(CLIP_DIR + file);
        a.volume = l.volume;
        playing = a;
        a.onended = next;
        // (a clip that fails to load is spoken instead; one we cut off ourselves for a newer line is not)
        const fallback = (e?: unknown) => {
          if (turn === speaking && (e as { name?: string } | undefined)?.name !== "AbortError") speakOne(l, next);
        };
        a.onerror = () => fallback();
        void a.play().catch(fallback);
      } else speakOne(l, next);
    };
    void loadManifest().then(next);
  } catch {
    /* no sound: the game is complete without it */
  }
}

function speakOne(l: Line, then: () => void): void {
  if (!speechSupported()) return then();
  const voice = pickVoice();
  const u = new SpeechSynthesisUtterance(l.text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "en-GB";
  u.rate = l.rate;
  u.pitch = l.pitch;
  u.volume = l.volume;
  u.onend = then;
  u.onerror = then;
  window.speechSynthesis.speak(u);
}

/**
 * A pronunciation note as something worth hearing: "b as in boy" → "B, as in boy!",
 * "r (lightly rolled)" → "R. Lightly rolled.", "oo / w" → "oo, or w."
 */
export function speakable(pronunciation: string): string {
  const aside = pronunciation.match(/\(([^)]*)\)/)?.[1]?.trim();
  const main = pronunciation.replace(/\([^)]*\)/g, " ").trim();
  const asIn = main.match(/^(.*?)\s+as in\s+(.+)$/i);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (asIn) return `${cap(asIn[1])}, as in ${asIn[2]}!`;
  const sound = cap(main.split(/\s*\/\s*/).join(", or "));
  return aside ? `${sound}. ${cap(aside)}.` : `${sound}!`;
}

// (a synthetic voice pushed far off its natural pitch sounds worse, not funnier: Khety is only a little brighter than the sign voice)
// Khety is company, not the lesson: he speaks under the sign voice, which is the thing to listen to.
const SIGN: Omit<Line, "text"> = { rate: 0.92, pitch: 1.0, volume: 1 };
const KHETY: Omit<Line, "text"> = { rate: 1.04, pitch: 1.18, volume: 0.55 };

/** The sound of a sign, from its pronunciation note. */
export function say(pronunciation: string): void {
  if (!pronunciation) return;
  speakAll([{ text: speakable(pronunciation), ...SIGN }]);
}

/** Khety says a line; if a sign's sound belongs with it, that follows in the sign voice. */
export function khety(line: string, thenSound?: string): void {
  const hush = game.get().campaign.hush; // (his words still reach the bubble; only the voice is off)
  speakAll([...(hush ? [] : [{ text: forSpeech(line), ...KHETY }]), ...(thenSound ? [{ text: speakable(thenSound), ...SIGN }] : [])]);
}

/** Hieroglyphs are not for reading aloud. */
function forSpeech(line: string): string {
  return line.replace(/[\u{13000}-\u{1342F}]/gu, "").replace(/\s+/g, " ").trim();
}
