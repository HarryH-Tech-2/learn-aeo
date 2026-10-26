/**
 * When the beam of light (kit.tsx TeachBeam) shows its teaching card and when it takes it down: a
 * pure step so it can be tested without three.js.
 *
 * The card opens as the learner steps into the ring. While it is up it stays up until they have
 * walked well out (a wider radius, so it does not flicker at the edge) or left its level. The card
 * can also be taken down by someone else: the Got it button, or an answer at the tablets, which
 * stand 2.3 m on and so still inside the wider radius. In that case the beam re-arms as soon as the
 * learner is out of the ring itself, so stepping back in shows the card again, while standing still
 * after Got it does not bring it straight back.
 */

/** squared radius the learner must be within for the card to open */
export const ENTER_R2 = 1.5 * 1.5;
/** squared radius the learner must pass for an open card to close on its own */
export const LEAVE_R2 = 2.0 * 2.0;

export type BeamAction = "open" | "close" | null;

/**
 * @param showing this beam believes its card is up
 * @param up      the card really is up for this sign (game.teaching === symbol)
 * @param d2      squared horizontal distance from the beam
 * @param level   the learner is at the beam's height
 */
export function beamStep(
  showing: boolean,
  up: boolean,
  d2: number,
  level: boolean,
): { showing: boolean; action: BeamAction } {
  if (!showing) {
    if (level && d2 < ENTER_R2) return { showing: true, action: "open" };
    return { showing: false, action: null };
  }
  if (up) {
    if (!level || d2 > LEAVE_R2) return { showing: false, action: "close" };
    return { showing: true, action: null };
  }
  // taken down by Got it or an answer: re-arm once the learner is out of the ring
  if (!level || d2 > ENTER_R2) return { showing: false, action: null };
  return { showing: true, action: null };
}
