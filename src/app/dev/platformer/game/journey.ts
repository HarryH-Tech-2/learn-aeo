/**
 * How far along the causeway the learner is, and help for a jump they cannot make.
 * Pure: the player writes the position, the HUD reads these.
 *
 * Why: in the first fortnight of the causeway as Lesson 1, most runs were left before the
 * second or third station (one quit had 11 falls in 34 s), and nothing on screen said how
 * far the gate was. So a fall no longer costs ground, a stuck learner is offered a carry to
 * the next landing, and a track shows the way to the gate filling in.
 */
import { GATE, STATION_SITES, START, type Vec3 } from "./course";

/**
 * Where a carry puts the learner down: the wide landings, in order, each on the near side of
 * its sign's beam, so a carry never passes a beam or a tablet without the learner seeing it.
 */
export const LANDINGS: Vec3[] = [
  [0, 2.4, -22.2], // first landing (station site 1, checkpoint 1)
  [0, 2.9, -41.2], // second landing, before the fork
  [-4, 7.2, -60.2], // third landing (site 2, checkpoint 2)
  [0, 10.7, -84.5], // fourth landing (site 3, checkpoint 3)
  [0, 12.4, -115.3], // the temple forecourt
];

/** Falls since the learner last stood on new ground before a carry is offered. */
export const CARRY_AFTER = 3;

const FROM = START[2];
const TO = GATE[2];

/** 0 at the start, 1 at the gate. */
export function courseFraction(z: number): number {
  return Math.max(0, Math.min(1, (FROM - z) / (FROM - TO)));
}

/** Where a station's tablets stand along the course (the gate for a site the causeway does not have). */
export function siteFraction(site: number): number {
  const s = STATION_SITES[site];
  return courseFraction(s ? s.at[2] : TO);
}

/** The next landing clearly ahead of `z`, or null past the last one. */
export function nextLanding(z: number): { index: number; at: Vec3 } | null {
  const index = LANDINGS.findIndex((l) => l[2] < z - 1.5);
  return index < 0 ? null : { index, at: LANDINGS[index] };
}

export const MILESTONES: { at: number; line: string }[] = [
  { at: 0.25, line: "A quarter of the way to the gate. Keep going!" },
  { at: 0.5, line: "Halfway to the gate!" },
  { at: 0.75, line: "Nearly there. I can see the gate from here!" },
];

/** The furthest milestone passed going from `before` to `after` (fractions), if any. */
export function milestoneCrossed(before: number, after: number): (typeof MILESTONES)[number] | null {
  let hit: (typeof MILESTONES)[number] | null = null;
  for (const m of MILESTONES) if (before < m.at && after >= m.at) hit = m;
  return hit;
}
