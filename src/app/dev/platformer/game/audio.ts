/** A few synthesised blips. No audio files; starts on the first user gesture. */
import { game } from "./store";

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined" || game.get().muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, to: number, dur: number, type: OscillatorType, gain: number, delay = 0) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur: number, gain: number, cutoff: number) {
  const a = ac();
  if (!a) return;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = cutoff;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

export const sfx = {
  jump: () => tone(300, 620, 0.16, "triangle", 0.12),
  doubleJump: () => tone(460, 920, 0.18, "triangle", 0.12),
  land: () => noise(0.12, 0.18, 500),
  ankh: (n: number) => {
    const base = 880 * 2 ** ((n % 8) / 12);
    tone(base, base, 0.12, "sine", 0.14);
    tone(base * 1.5, base * 1.5, 0.22, "sine", 0.1, 0.07);
  },
  scarab: () => [0, 4, 7, 12].forEach((s, i) => tone(660 * 2 ** (s / 12), 660 * 2 ** (s / 12), 0.25, "sine", 0.12, i * 0.08)),
  checkpoint: () => [0, 7].forEach((s, i) => tone(520 * 2 ** (s / 12), 520 * 2 ** (s / 12), 0.3, "triangle", 0.1, i * 0.12)),
  splash: () => noise(0.5, 0.3, 900),
  right: () => [0, 5, 12].forEach((s, i) => tone(587 * 2 ** (s / 12), 587 * 2 ** (s / 12), 0.22, "triangle", 0.13, i * 0.07)),
  wrong: () => {
    tone(196, 150, 0.28, "sawtooth", 0.09);
    tone(208, 160, 0.28, "sawtooth", 0.07, 0.02);
  },
  crumble: () => noise(0.9, 0.35, 260),
  door: () => {
    noise(1.8, 0.3, 180);
    tone(82, 55, 1.6, "sine", 0.18);
  },
  win: () => [0, 4, 7, 12, 16].forEach((s, i) => tone(440 * 2 ** (s / 12), 440 * 2 ** (s / 12), 0.5, "triangle", 0.12, i * 0.11)),
};
