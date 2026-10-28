/**
 * Free-unlock test (2026-10-23): does "everything open, Buy Me a Coffee if it helps" earn anything close to the paid
 * course? Not a powered A/B test (about 10 sign-ups a week), a check on whether donations come anywhere near.
 *
 *   ACCESS_TEST_FREE_PERCENT  0–100, the share of NEW accounts put in the "free" group. Unset or 0 = off, and nobody
 *                             is assigned. While it is on, every new account gets a group ("free" or "paid"), so the
 *                             two can be compared on /admin/marketing.
 *
 * Visitors, not accounts, are split (2026-10-23): the middleware gives each new visitor a group in the aeo_access cookie
 * (90 days; crawlers get none), so the free group sees the course as free BEFORE signing up: pricing, lesson and game
 * paywalls and the sign-up card say "free with an account" (useFreeCourseGuest), and anyone in it who
 * reaches checkout is sent to the dashboard. Signing up copies the cookie's group onto the account (no cookie: a fresh
 * draw while the test is on). The cookie's group is honored even after the test is switched off.
 * GA4: the gtag set-up in layout.tsx sends the cookie as the user property access_test, so sign-up rates split too.
 *
 * The account's group is a GameState row (game "access-test", state { arm, at }), written once at sign-up from the
 * createUser hook (src/lib/auth.ts). "free" counts as course access in checkSubscription (via "free-unlock") and stays for good
 * once given, even after the test is switched off. Paid access always wins over it, so a free-group learner who buys
 * shows as lifetime.
 *
 * What the free group sees: every lesson, game and the community open; no upgrade screens, offers or offer emails;
 * a coffee ask instead (lesson section ends + outro, the dashboard, a day-5 email). HD pictures, prints, the class
 * set, the unit pack and licenses stay paid (hasPaidAccess).
 * GA4: user property access_test (free | paid) from the dashboard, coffee_click with location.
 */
import { prisma } from "@/lib/db";
import { COOKIE_PREFIX } from "@/lib/site";

export const ACCESS_TEST_GAME = "access-test";

export type AccessArm = "free" | "paid";

export const ACCESS_COOKIE = `${COOKIE_PREFIX}access`;
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

const BOT_UA = /bot|crawl|spider|slurp|lighthouse|pagespeed|headless|preview|facebookexternalhit|embedly|quora|whatsapp|vercel/i;

export function isAccessArm(v: unknown): v is AccessArm {
  return v === "free" || v === "paid";
}

/** Middleware: this visitor's group, and whether the cookie needs setting. No group while the test is off or for crawlers. */
export function pickVisitorArm(
  input: { cookie?: string | null; userAgent?: string | null; percent: number },
  random: () => number = Math.random,
): { arm: AccessArm | null; set: boolean } {
  if (isAccessArm(input.cookie)) return { arm: input.cookie, set: false };
  if (input.percent <= 0 || BOT_UA.test(input.userAgent ?? "")) return { arm: null, set: false };
  return { arm: pickArm(random(), input.percent), set: true };
}

/** Browser: the visitor's group from the cookie, or null. */
export function readAccessCookie(): AccessArm | null {
  if (typeof document === "undefined") return null;
  const v = document.cookie.match(/(?:^|; )aeo_access=(free|paid)/)?.[1];
  return isAccessArm(v) ? v : null;
}

export function accessTestPercent(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.ACCESS_TEST_FREE_PERCENT);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, n);
}

/** Pure: the group for a random number in [0, 1), or null while the test is off. */
export function pickArm(rand: number, percent: number): AccessArm | null {
  if (percent <= 0) return null;
  return rand * 100 < percent ? "free" : "paid";
}

/** The group stored on a GameState row, or null. */
export function armOf(state: unknown): AccessArm | null {
  const arm = (state as { arm?: unknown } | null)?.arm;
  return isAccessArm(arm) ? arm : null;
}

/**
 * Sign-up hook: the account takes the visitor's group from the aeo_access cookie (what they were shown), else a fresh
 * draw while the test is on. Never throws.
 */
export async function assignAccessTest(userId: string, cookieArm: string | null | undefined, rand: number = Math.random()): Promise<AccessArm | null> {
  const arm = isAccessArm(cookieArm) ? cookieArm : pickArm(rand, accessTestPercent());
  if (!arm) return null;
  try {
    await prisma.gameState.upsert({
      where: { userId_game: { userId, game: ACCESS_TEST_GAME } },
      create: { userId, game: ACCESS_TEST_GAME, state: { arm, at: new Date().toISOString() } },
      // (a group, once given, is never changed)
      update: {},
    });
    return arm;
  } catch (err) {
    console.error("[access-test] assignment failed:", err);
    return null;
  }
}

export type AccessTestPerson = {
  arm: AccessArm;
  email: string | null;
  /** Answered at least one exercise in any lesson */
  started: boolean;
  lesson1Done: boolean;
  /** Finished at least one lesson after Lesson 1 (only the free group can, unless they paid) */
  pastLesson1: boolean;
  /** A paid course plan now (lifetime or monthly) */
  paid: boolean;
};

export type AccessArmSummary = { arm: AccessArm; accounts: number; started: number; lesson1Done: number; pastLesson1: number; paid: number };

/** Pure: the per-group counts on /admin/marketing. */
export function summarizeAccessTest(people: AccessTestPerson[]): AccessArmSummary[] {
  return (["free", "paid"] as const).map((arm) => {
    const g = people.filter((p) => p.arm === arm);
    return {
      arm,
      accounts: g.length,
      started: g.filter((p) => p.started).length,
      lesson1Done: g.filter((p) => p.lesson1Done).length,
      pastLesson1: g.filter((p) => p.pastLesson1).length,
      paid: g.filter((p) => p.paid).length,
    };
  });
}
