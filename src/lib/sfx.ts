/**
 * Small synthesised sounds for the written lessons: a chisel on stone, a door
 * grinding open, a torch flaring and guttering. Made with Web Audio rather
 * than files, so they cost nothing to download.
 *
 * Browsers only let a page make sound after a tap or click, and every call
 * here comes from one; before that (or with no Web Audio) they do nothing.
 * Kept quiet on purpose: they sit under the reading, not over it.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio(): { ctx: AudioContext; out: GainNode; noise: AudioBuffer } | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    // two seconds of white noise, reused by every sound
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return { ctx, out: master!, noise: noiseBuf! };
}

/** A burst of filtered noise: the body of every sound here. */
function burst(at: number, dur: number, opts: { type: BiquadFilterType; freq: number; q?: number; gain: number; freqTo?: number; attack?: number }) {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime + at;
  const src = a.ctx.createBufferSource();
  src.buffer = a.noise;
  src.loop = true;
  const f = a.ctx.createBiquadFilter();
  f.type = opts.type;
  f.frequency.setValueAtTime(opts.freq, t);
  if (opts.freqTo) f.frequency.exponentialRampToValueAtTime(opts.freqTo, t + dur);
  f.Q.value = opts.q ?? 1;
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.gain, t + (opts.attack ?? 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.out);
  src.start(t, Math.random());
  src.stop(t + dur + 0.05);
}

function tone(at: number, dur: number, freq: number, gain: number, type: OscillatorType = "sine", freqTo?: number) {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime + at;
  const o = a.ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (freqTo) o.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** Three taps of a copper chisel, then a soft ring as the gold catches the light. */
export function chisel() {
  [0, 0.12, 0.26].forEach((at, i) => {
    burst(at, 0.07, { type: "bandpass", freq: 2600 - i * 300, q: 6, gain: 0.5 });
    tone(at, 0.09, 900 - i * 80, 0.12, "triangle");
  });
  tone(0.36, 0.9, 1568, 0.05, "sine");
  tone(0.36, 1.1, 2093, 0.03, "sine");
}

/** Stone on stone: a low grind that swells and settles, with a rumble under it. */
export function grind(seconds: number) {
  const a = audio();
  if (!a) return;
  const t = a.ctx.currentTime;
  const src = a.ctx.createBufferSource();
  src.buffer = a.noise;
  src.loop = true;
  const lp = a.ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 320;
  lp.Q.value = 2;
  // the scrape comes and goes, like a heavy leaf catching on the sill
  const wobble = a.ctx.createOscillator();
  wobble.frequency.value = 7;
  const depth = a.ctx.createGain();
  depth.gain.value = 120;
  wobble.connect(depth).connect(lp.frequency);
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.7, t + 0.5);
  g.gain.setValueAtTime(0.7, t + seconds * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  src.connect(lp).connect(g).connect(a.out);
  src.start(t);
  wobble.start(t);
  src.stop(t + seconds + 0.1);
  wobble.stop(t + seconds + 0.1);
  tone(0, seconds, 48, 0.35, "sine", 38);
  // the leaves come to rest
  burst(seconds - 0.15, 0.5, { type: "lowpass", freq: 200, gain: 0.6 });
}

/** A bright rush of air: light pouring through the gap. */
export function whoosh() {
  burst(0, 1.4, { type: "bandpass", freq: 300, freqTo: 3200, q: 0.8, gain: 0.25, attack: 0.5 });
}

/** The torch flares: a right answer. */
export function flare() {
  burst(0, 0.45, { type: "bandpass", freq: 500, freqTo: 2400, q: 1, gain: 0.3, attack: 0.03 });
  tone(0, 0.35, 660, 0.06, "triangle", 990);
}

/** The torch gutters: a wrong answer. */
export function hiss() {
  burst(0, 0.5, { type: "highpass", freq: 3000, freqTo: 1200, gain: 0.22, attack: 0.01 });
  tone(0, 0.3, 220, 0.06, "sawtooth", 140);
}

/** The flame goes out. */
export function snuff() {
  burst(0, 0.9, { type: "lowpass", freq: 1400, freqTo: 120, gain: 0.35, attack: 0.02 });
}
