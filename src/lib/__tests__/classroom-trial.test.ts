import { describe, it, expect, vi } from "vitest";

// the pure rules only: keep Prisma out of the test
vi.mock("@/lib/db", () => ({ prisma: {} }));

import { TRIAL_DAYS, canStartTrial, classroomAccess, isLicenceActive, trialDaysLeft } from "@/lib/licence";

const DAY = 86_400_000;
const now = new Date("2026-10-16T12:00:00Z");
const at = (days: number) => new Date(now.getTime() + days * DAY);

describe("the free Classroom trial", () => {
  it("is on offer only to a teacher who has never held a licence", () => {
    expect(canStartTrial([])).toBe(true);
    expect(canStartTrial([{ status: "trial", currentPeriodEnd: at(-1) }])).toBe(false);
    expect(canStartTrial([{ status: "canceled", currentPeriodEnd: at(-100) }])).toBe(false);
  });

  it("runs to its end with no grace, unlike a paid licence", () => {
    expect(isLicenceActive({ status: "trial", currentPeriodEnd: at(0.5) }, now)).toBe(true);
    expect(isLicenceActive({ status: "trial", currentPeriodEnd: at(-0.01) }, now)).toBe(false);
    expect(isLicenceActive({ status: "trial", currentPeriodEnd: null }, now)).toBe(false);
    // a paid licence a day past its end is still inside the 7-day grace
    expect(isLicenceActive({ status: "active", currentPeriodEnd: at(-1) }, now)).toBe(true);
  });

  it("counts days left rounded up, never below zero", () => {
    expect(trialDaysLeft(at(TRIAL_DAYS), now)).toBe(7);
    expect(trialDaysLeft(at(0.2), now)).toBe(1);
    expect(trialDaysLeft(at(-2), now)).toBe(0);
  });

  it("reports Classroom mode state for each kind of teacher", () => {
    expect(classroomAccess([], now)).toEqual({ licensed: false, trialAvailable: true, trial: null });

    const running = classroomAccess([{ status: "trial", currentPeriodEnd: at(3) }], now);
    expect(running.licensed).toBe(true);
    expect(running.trialAvailable).toBe(false);
    expect(running.trial).toMatchObject({ active: true, daysLeft: 3 });

    const ended = classroomAccess([{ status: "trial", currentPeriodEnd: at(-1) }], now);
    expect(ended.licensed).toBe(false);
    expect(ended.trialAvailable).toBe(false);
    expect(ended.trial).toMatchObject({ active: false, daysLeft: 0 });

    // bought: the trial row became the paid licence, so no trial is reported
    expect(classroomAccess([{ status: "active", currentPeriodEnd: at(365) }], now)).toEqual({ licensed: true, trialAvailable: false, trial: null });
  });
});
