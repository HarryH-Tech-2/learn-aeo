/**
 * The course: stone pillars rising out of the Nile, heading away from the
 * camera (−Z) and climbing to the temple gate. Pure data, no three.js.
 *
 * A platform is described by the centre of its TOP face; pillars run from
 * there down into the water.
 */

export const WATER_Y = -6;
export const PILLAR_FOOT_Y = -9;
export const FALL_Y = -5.2;

export type Vec3 = [number, number, number];

export type Pillar = {
  top: Vec3;
  /** width (x) and depth (z) */
  size: [number, number];
  /** dress the top: a landing gets braziers and jars */
  kind?: "pillar" | "landing" | "beam" | "temple" | "plaza";
};

export type Mover = {
  from: Vec3;
  to: Vec3;
  size: [number, number];
  /** seconds for a full there-and-back */
  period: number;
  phase?: number;
};

export type Checkpoint = { at: Vec3; spawn: Vec3 };

export const PILLARS: Pillar[] = [
  { top: [0, 0, 0], size: [12, 12], kind: "plaza" },
  { top: [0, 0, -9.2], size: [3, 3] },
  { top: [2.6, 0.6, -13.8], size: [3, 3] },
  { top: [-1, 1.2, -18.4], size: [3, 3] },
  { top: [0, 1.2, -24.5], size: [8, 6], kind: "landing" },
  // (mover 0 crosses the gap here)
  { top: [0, 1.7, -43.5], size: [6, 6], kind: "landing" },
  // (the fork climbs from here on both sides; see FORK. Only one side is real.)
  { top: [0.4, 5.5, -58.4], size: [2.6, 2.6] },
  { top: [-4, 6, -63], size: [7, 7], kind: "landing" },
  // (mover 1 swings side to side at z −70)
  { top: [4, 6.5, -75.5], size: [3, 3] },
  // (mover 2 is the lift at z −80.5)
  { top: [0, 9.5, -86.5], size: [6, 5], kind: "landing" },
  { top: [0, 9.5, -95], size: [1.5, 12], kind: "beam" },
  { top: [3, 10, -104], size: [2.6, 2.6] },
  { top: [-2, 10.6, -108.2], size: [2.6, 2.6] },
  { top: [1, 11.2, -112.4], size: [2.6, 2.6] },
  { top: [0, 11.2, -123], size: [18, 16], kind: "temple" },
];

/**
 * Point lights the course brings with it (Level.tsx): one under each moving slab and one in each lit brazier.
 * Every lit shader is compiled for an exact number of lights, so Game.tsx holds this many dark lights in the
 * scene until the course arrives: the count never changes, and nothing already on screen is compiled twice.
 * Wrong only costs speed: keep it in step with Level.tsx.
 */
export const LEVEL_LIT_BRAZIERS = 6;

export const MOVERS: Mover[] = [
  { from: [0, 1.3, -30], to: [0, 1.6, -38.5], size: [3.2, 3.2], period: 7 },
  { from: [-4.5, 6.1, -70], to: [4.5, 6.1, -70], size: [3, 3], period: 6, phase: 0.2 },
  { from: [0.5, 5.6, -80.5], to: [0.5, 9.4, -80.5], size: [3, 3], period: 6.5, phase: 0.5 },
];

/**
 * The fork after the second landing: two mirrored flights of steps. Which
 * one holds is decided per run and written on the stele in front of them.
 */
export const FORK: Record<"left" | "right", Pillar[]> = {
  right: [
    { top: [4.2, 2.7, -48], size: [2.6, 2.6] },
    { top: [7.4, 3.7, -52], size: [2.6, 2.6] },
    { top: [4.4, 4.7, -56], size: [2.6, 2.6] },
  ],
  left: [
    { top: [-4.2, 2.7, -48], size: [2.6, 2.6] },
    { top: [-7.4, 3.7, -52], size: [2.6, 2.6] },
    { top: [-3.6, 4.7, -56], size: [2.6, 2.6] },
  ],
};
/** The stele stands at the far edge of the landing, facing the player. */
export const STELE: Vec3 = [0, 1.7, -46.1];
export const FORK_LANDING = { x: 0, z: -43.5, half: 3, y: 1.7 };

/**
 * Where tablets can stand: the wide places of the course, in the order you
 * reach them. `at` is the centre of the middle tablet. lesson.ts decides
 * which sites a level uses; the last is kept for the silent picture at the gate.
 */
export const STATION_SITES: { at: Vec3; spread: number }[] = [
  { at: [0, 1.35, -4.8], spread: 2.8 }, // the start plaza
  { at: [0, 2.55, -26], spread: 2.6 }, // first landing
  { at: [-4, 7.35, -64.6], spread: 2.3 }, // third landing
  { at: [0, 10.85, -87.6], spread: 2.1 }, // fourth landing, before the beam
  { at: [0, 12.55, -117.8], spread: 2.9 }, // temple forecourt, front
  { at: [0, 12.55, -120.9], spread: 2.9 }, // temple forecourt, middle
  { at: [0, 12.55, -124.0], spread: 2.4 }, // at the gate
];
/** A beacon stands this far in front of its tablets, on the side you arrive from. */
export const BEACON_OFFSET = 2.3;

export const START: Vec3 = [0, 1.2, 3];

export const CHECKPOINTS: Checkpoint[] = [
  { at: [0, 1.2, -24.5], spawn: [0, 2.4, -23.5] },
  { at: [-4, 6, -63], spawn: [-4, 7.2, -62] },
  { at: [0, 9.5, -86.5], spawn: [0, 10.7, -85.5] },
];

/** The gate stands at the back of the temple platform. */
export const GATE: Vec3 = [0, 11.2, -128];

/** A short arc of ankhs between two points, peaking `lift` above the straight line. */
function arc(a: Vec3, b: Vec3, n: number, lift: number): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * lift + 1, a[2] + (b[2] - a[2]) * t]);
  }
  return out;
}

export const ANKHS: Vec3[] = [
  ...arc([0, 0, -3], [0, 0, -9.2], 2, 0.4),
  ...arc([0, 0, -9.2], [2.6, 0.6, -13.8], 2, 1.2),
  ...arc([2.6, 0.6, -13.8], [-1, 1.2, -18.4], 2, 1.2),
  ...arc([-1, 1.2, -18.4], [0, 1.2, -22], 1, 1),
  ...arc([0, 1.5, -29], [0, 1.7, -40], 4, 0.2),
  // (none over the fork: a trail of ankhs would give the true side away)
  ...arc([0.4, 5.5, -58.4], [-4, 6, -61], 1, 1.2),
  ...arc([-4.5, 6.1, -70], [4.5, 6.1, -70], 3, 0.1),
  ...arc([4, 6.5, -75.5], [0.5, 6.5, -80.5], 1, 1.4),
  [0.5, 8, -80.5],
  [0.5, 10.2, -80.5],
  ...arc([0, 9.5, -89.5], [0, 9.5, -100.5], 5, 0),
  ...arc([0, 9.5, -100.5], [3, 10, -104], 1, 1.3),
  ...arc([3, 10, -104], [-2, 10.6, -108.2], 1, 1.4),
  ...arc([-2, 10.6, -108.2], [1, 11.2, -112.4], 1, 1.4),
  ...arc([1, 11.2, -112.4], [0, 11.2, -117], 1, 1.2),
];

/** Three golden scarabs, off the obvious line. */
export const SCARABS: Vec3[] = [
  [-4.6, 1.3, -4.6],
  [7.4, 6.4, -52],
  [-7.4, 12.4, -118],
];
