/**
 * The first steps on the causeway, said plainly. A third of the players who
 * left level 1 (Sept 2026) left at station 1 without answering it. For most
 * names the first tablets are not on the start plaza but on the first landing,
 * across the stepping stones, and nothing said so. Until the first station is
 * answered, a standing line says what to do next (walk or jump, step into the
 * beam, walk into a tablet). The beam itself is the landmark: a white column
 * that can be seen from the start.
 *
 * The same step rides on game_quit (telemetry.ts), so a quit says whether the
 * player never moved, never reached the beam, or never chose a tablet.
 */
import { STATION_SITES } from "./course";
import type { GameState } from "./store";

export type Step = "move" | "beam" | "tablet";

/** squared distance from the start the learner must go before they count as having moved */
export const MOVED_R2 = 1.2 * 1.2;

/** Where the learner is with the station in hand (null once the level is spelled). */
export function stepOf(s: Pick<GameState, "lesson" | "moved">): Step | null {
  const l = s.lesson;
  const station = l?.stations[l.progress];
  if (!l || !station) return null;
  if (!s.moved) return "move";
  return station.teach && !l.taught.includes(station.target) ? "beam" : "tablet";
}

/** The line to show, first station only: after that the learner has the hang of it. */
export function coachLine(s: Pick<GameState, "lesson" | "moved" | "playing">, touch: boolean): string | null {
  if (s.playing !== 0 || !s.lesson || s.lesson.progress > 0) return null;
  const step = stepOf(s);
  // (site 0 is the start plaza itself; any other is over the water)
  const across = s.lesson.stations[0].site !== 0 && STATION_SITES[s.lesson.stations[0].site] !== undefined;
  if (step === "move") {
    if (!across) return touch ? "Push the stick up to walk to the beam of light ahead." : "Press W or ↑ to walk forward to the beam of light ahead.";
    return touch ? "Push the stick up to run, and tap Jump to cross the stones to the beam of light." : "Press W or ↑ to run, and Space to jump across the stones to the beam of light.";
  }
  if (step === "beam") {
    if (!across) return "Keep going: step into the beam of light to meet your first sign.";
    return touch ? "Cross the stones to the beam of light ahead. Tap Jump, and again in the air to go further." : "Cross the stones to the beam of light ahead. Space to jump, and again in the air to go further.";
  }
  if (step === "tablet") {
    const station = s.lesson.stations[0];
    return station.kind === "sign"
      ? `Now walk into the tablet with the sign for “${station.sound}”. The plaque above them asks the question.`
      : "Now walk into the tablet with the right answer. The plaque above them asks the question.";
  }
  return null;
}
