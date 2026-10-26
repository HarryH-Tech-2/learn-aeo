import { describe, expect, it } from "vitest";
import { beamStep, ENTER_R2, LEAVE_R2 } from "./beamState";

const inside = ENTER_R2 * 0.5;
const edge = (ENTER_R2 + LEAVE_R2) / 2; // between the enter and leave radii: by the tablets
const far = LEAVE_R2 * 2;

describe("the beam of light's teaching card", () => {
  it("opens when the learner steps into the ring", () => {
    expect(beamStep(false, false, inside, true)).toEqual({
      showing: true,
      action: "open",
    });
  });

  it("does nothing while the card is up and the learner stays in the ring", () => {
    expect(beamStep(true, true, inside, true)).toEqual({
      showing: true,
      action: null,
    });
    expect(beamStep(true, true, edge, true)).toEqual({
      showing: true,
      action: null,
    });
  });

  it("closes the card once the learner has walked well out of the ring, or off its level", () => {
    expect(beamStep(true, true, far, true)).toEqual({
      showing: false,
      action: "close",
    });
    expect(beamStep(true, true, inside, false)).toEqual({
      showing: false,
      action: "close",
    });
  });

  it("after Got it, stays down while the learner stands in the ring", () => {
    expect(beamStep(true, false, inside, true)).toEqual({
      showing: true,
      action: null,
    });
  });

  it("after the card was taken down by something else (an answer at the tablets), re-arms as soon as the learner is out of the ring, so stepping back in shows it again", () => {
    // the tablets stand 2.3 m on: inside the leave radius, outside the enter radius
    const armed = beamStep(true, false, edge, true);
    expect(armed).toEqual({ showing: false, action: null });
    expect(beamStep(armed.showing, false, inside, true)).toEqual({
      showing: true,
      action: "open",
    });
  });

  it("does not open from outside the ring", () => {
    expect(beamStep(false, false, edge, true)).toEqual({
      showing: false,
      action: null,
    });
    expect(beamStep(false, false, inside, false)).toEqual({
      showing: false,
      action: null,
    });
  });
});
