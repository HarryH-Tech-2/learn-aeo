/**
 * Nurture email sequence for free sign-ups who have not bought.
 *
 * Pure scheduling lives here so it can be unit-tested; the daily cron
 * (src/app/api/cron/nurture/route.ts) builds a snapshot per learner, asks
 * `nextDueStep` what to send, and records the send in EmailSend.
 *
 *   day 0  welcome         sent from the sign-up hook (cron catches failures)
 *   day 1  door-sealed     lesson 1 not finished   } one or the other
 *                          (copy differs: never started = "your door is waiting", part-way = "your place is saved")
 *   day 1  next-door       lesson 1 finished       }
 *   day 3  free-stuff      translator, daily cartouche, blog
 *   day 5  offer           33% code (src/lib/offers.ts, source "nurture")
 *   day 7  offer-expires   only while that code is still live
 *   day 5  coffee          the free-unlock group instead of the two offers (src/lib/access-test.ts)
 *
 * Rules: one email per learner per run; a step is skipped for good once it
 * is more than NURTURE_GRACE_DAYS late (so enabling the cron never floods
 * old sign-ups); buyers and unsubscribers get nothing.
 *
 * Same-day nudge (not built): the cron runs once a day at 14:00 UTC, so a
 * "few hours after sign-up, still not started" email could only reach people
 * who signed up before ~11:00 UTC that day; everyone later would get it the
 * next day, which is door-sealed's slot. Doing it properly needs an hourly
 * cron (or a delayed send via Resend's scheduledAt at sign-up time).
 * New accounts now land straight in Lesson 1 instead (src/lib/new-user-landing.ts).
 */

export type NurtureStepKey = "welcome" | "door-sealed" | "next-door" | "free-stuff" | "offer" | "offer-expires" | "coffee";

export type NurtureSnapshot = {
  id: string;
  email: string;
  name: string | null;
  nurtureStartedAt: Date;
  emailUnsubscribedAt: Date | null;
  /** Paid (or a licence): gets no nurture at all. The free-unlock group is not counted here. */
  hasAccess: boolean;
  /** The free-unlock test's free group: the course is open, so no offers; a coffee ask instead */
  freeUnlock: boolean;
  lesson1Completed: boolean;
  /**
   * At least one Lesson 1 exercise answered (XP earned on it). Opening the lesson alone does not count:
   * the lesson marks itself started on load. Only changes the day-1 copy, not the schedule.
   */
  lesson1Started: boolean;
  sentKeys: string[];
  /** The learner's live discount, if any (whatever created it) */
  offer: { expiresAt: Date; source: string } | null;
};

export type NurtureStep = {
  key: NurtureStepKey;
  /** Whole days after enrolment */
  day: number;
  /** Extra condition on top of the timing rules */
  when?: (u: NurtureSnapshot, now: Date) => boolean;
  /** Create a discount code before rendering */
  grantsOffer?: boolean;
};

export const NURTURE_GRACE_DAYS = 2;
export const NURTURE_OFFER_HOURS = 60;

const DAY_MS = 86_400_000;

function liveOffer(u: NurtureSnapshot, now: Date) {
  return u.offer && u.offer.expiresAt.getTime() > now.getTime() ? u.offer : null;
}

export const NURTURE_STEPS: NurtureStep[] = [
  { key: "welcome", day: 0 },
  { key: "door-sealed", day: 1, when: (u) => !u.lesson1Completed && !u.sentKeys.includes("next-door") },
  { key: "next-door", day: 1, when: (u) => u.lesson1Completed && !u.sentKeys.includes("door-sealed") },
  { key: "free-stuff", day: 3 },
  { key: "offer", day: 5, grantsOffer: true, when: (u, now) => !u.freeUnlock && !liveOffer(u, now) },
  { key: "offer-expires", day: 7, when: (u, now) => !u.freeUnlock && liveOffer(u, now)?.source === "nurture" },
  { key: "coffee", day: 5, when: (u) => u.freeUnlock },
];

export const NURTURE_LAST_DAY = Math.max(...NURTURE_STEPS.map((s) => s.day));

export function daysSince(start: Date, now: Date): number {
  return Math.floor((now.getTime() - start.getTime()) / DAY_MS);
}

/** The single step to send this run, or null. */
export function nextDueStep(u: NurtureSnapshot, now: Date): NurtureStep | null {
  if (u.hasAccess || u.emailUnsubscribedAt || !u.email) return null;
  const elapsed = daysSince(u.nurtureStartedAt, now);
  for (const step of NURTURE_STEPS) {
    if (u.sentKeys.includes(step.key)) continue;
    if (elapsed < step.day) continue;
    if (elapsed > step.day + NURTURE_GRACE_DAYS) continue;
    if (step.when && !step.when(u, now)) continue;
    return step;
  }
  return null;
}

export function firstName(name: string | null | undefined): string {
  const n = (name ?? "").trim().split(/\s+/)[0];
  return n || "Scholar";
}
