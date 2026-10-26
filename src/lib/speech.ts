/**
 * "Hear it" for the written lessons.
 *
 * Where the sound comes from, best first:
 *   1. a recorded clip: public/audio/lesson/manifest.json maps a line's key
 *      (clipKeyOf) to an mp3 beside it. Every line the lessons can say is
 *      listed by scripts/dev/lesson-audio-lines.ts and recorded with a neural
 *      voice by scripts/dev/make-lesson-audio.py, so it sounds the same on
 *      every machine;
 *   2. otherwise the browser's own speech (Web Speech API), with the best
 *      English voice it has. Chrome on Windows mostly has robotic ones, and it
 *      drops an utterance spoken straight after cancel(), hence the short wait.
 *
 * Nothing here is essential: with neither, the buttons simply do nothing.
 */

const CLIP_DIR = "/audio/lesson/";

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/**
 * Turn a lesson's pronunciation note ("b as in boy", "ah (guttural)",
 * "sh as in ship") into something worth saying aloud.
 */
export function toSpeakable(pronunciation: string): string {
  let s = pronunciation.replace(/\([^)]*\)/g, " ").trim();
  // "b as in boy" → say the example word, it carries the sound best
  const asIn = s.match(/as in\s+([a-z'-]+)/i);
  if (asIn) return asIn[1];
  // "oo / w" → first alternative
  s = s.split(/\s*\/\s*/)[0].trim();
  return s || pronunciation;
}

/** A short, stable name for a line: what its recording is filed under. */
export function clipKeyOf(text: string): string {
  let h = 5381;
  for (const ch of text.trim().toLowerCase()) h = (Math.imul(h, 33) ^ ch.codePointAt(0)!) >>> 0;
  return h.toString(36);
}

// ─── recorded clips ───

let manifest: Record<string, string> | null = null;
let manifestLoad: Promise<void> | null = null;
let playing: HTMLAudioElement | null = null;

function loadManifest(): Promise<void> {
  if (!manifestLoad) {
    manifestLoad = fetch(CLIP_DIR + "manifest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (m && typeof m === "object") manifest = m as Record<string, string>;
      })
      .catch(() => undefined);
  }
  return manifestLoad;
}

/** Fetch the clip list early (a lesson page calls this on mount), so the first tap plays straight away. */
export function primeSpeech(): void {
  if (typeof window !== "undefined") void loadManifest();
}

function playClip(text: string): boolean {
  const file = manifest?.[clipKeyOf(text)];
  if (!file) return false;
  try {
    playing?.pause();
    if (speechSupported()) window.speechSynthesis.cancel();
    const a = new Audio(CLIP_DIR + file);
    playing = a;
    a.play().catch(() => speakWithBrowser(text, 0.85));
    return true;
  } catch {
    return false;
  }
}

// ─── the browser's voice ───

/** The most natural English voice on offer: the "Natural"/"Online" neural ones first, Google's next, any en-GB/en-US after. */
function bestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
  if (voices.length === 0) return null;
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online/i.test(v.name) ? 8 : 0) + (/google/i.test(v.name) ? 4 : 0) + (/en[-_]gb/i.test(v.lang) ? 2 : /en[-_]us/i.test(v.lang) ? 1 : 0);
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

function speakWithBrowser(text: string, rate: number): boolean {
  if (!speechSupported()) return false;
  const synth = window.speechSynthesis;
  const busy = synth.speaking || synth.pending;
  synth.cancel();
  const go = () => {
    const u = new SpeechSynthesisUtterance(text);
    const voice = bestVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "en-GB";
    u.rate = rate;
    u.pitch = 1;
    // (Chrome can be left paused after a tab sleeps; speak() then queues forever)
    if (synth.paused) synth.resume();
    synth.speak(u);
  };
  // Chrome drops an utterance spoken in the same tick as cancel()
  if (busy) window.setTimeout(go, 60);
  else go();
  return true;
}

if (speechSupported()) {
  // voices arrive asynchronously in Chrome: asking once starts the load
  window.speechSynthesis.getVoices();
}

export function speak(text: string, opts: { rate?: number } = {}): boolean {
  if (typeof window === "undefined" || !text.trim()) return false;
  if (playClip(text)) return true;
  // the clip list may still be on its way on the very first tap: wait for it, briefly
  if (!manifest) {
    void loadManifest().then(() => {
      if (!playClip(text)) speakWithBrowser(text, opts.rate ?? 0.85);
    });
    return true;
  }
  return speakWithBrowser(text, opts.rate ?? 0.85);
}
