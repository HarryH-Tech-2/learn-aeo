/**
 * Where a brand-new account lands after its first sign-in.
 *
 * NextAuth sends a newly created user to `pages.newUser` (/welcome, see
 * src/lib/auth.ts) with the original callbackUrl attached. 19 of 39 sign-ups
 * in the 21 Sep - 19 Oct review never answered a Lesson 1 exercise; most of
 * them had landed on the dashboard. So a new account goes straight into the
 * written Lesson 1 (whose intro offers "Continue section N" if a place is
 * saved), unless the sign-up carried an explicit destination of its own:
 * checkout, a game, /join, a gift, the lesson a guest was already in.
 *
 * Returning users never pass through here: NextAuth only uses pages.newUser
 * on the sign-in that created the account.
 */
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

export const LESSON_ONE_PATH = FIRST_LESSON_PATH;

/** Destinations that only mean "nowhere in particular": the defaults of AuthModal, /get-started and /login. */
const GENERIC_PATHS = new Set(["/", "/dashboard", "/login", "/get-started"]);

function originOf(s: string | null | undefined): string | null {
  if (!s) return null;
  try {
    return new URL(s).origin;
  } catch {
    return null;
  }
}

/**
 * The path (with query and hash) a new account should land on.
 * `callbackUrl` is what NextAuth passes (absolute on this site, or relative);
 * `origins` are the site's own origins (the request's and NEXTAUTH_URL's).
 * Anything off-site or unparseable falls back to Lesson 1: never an open redirect.
 */
export function newUserLanding(callbackUrl: string | null | undefined, origins: (string | null | undefined)[]): string {
  const own = origins.map(originOf).filter((o): o is string => !!o);
  if (!callbackUrl || own.length === 0) return LESSON_ONE_PATH;
  let url: URL;
  try {
    url = new URL(callbackUrl, own[0]);
  } catch {
    return LESSON_ONE_PATH;
  }
  if (!own.includes(url.origin)) return LESSON_ONE_PATH;
  const path = url.pathname.replace(/\/+$/, "") || "/";
  // (a bare /dashboard is the default; /dashboard?tab=games was asked for)
  if (GENERIC_PATHS.has(path) && (path !== "/dashboard" || !url.search)) return LESSON_ONE_PATH;
  return `${url.pathname}${url.search}${url.hash}`;
}
