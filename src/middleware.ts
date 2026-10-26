import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { devBypassAuth } from "@/lib/dev-bypass";
import { COUNTRY_COOKIE } from "@/lib/pricing";
import { ACCESS_COOKIE, ACCESS_COOKIE_MAX_AGE, accessTestPercent, pickVisitorArm } from "@/lib/access-test";

// Protected routes that require authentication
const PROTECTED_PATHS = ["/dashboard", "/account", "/certificate", "/checkout", "/lessons"];

// Lessons anyone can open without an account. The lesson itself asks for a
// sign-in at the first quick check (to keep XP and progress) — see
// LessonStage's guest wall. Keep in sync with `isFree` in src/lib/lessons.ts.
const PUBLIC_LESSONS = ["/lessons/expedition-begins"];

/** The free-unlock test (src/lib/access-test.ts): a new visitor's group, kept in a cookie the pages read. */
function withAccessCookie(request: NextRequest, response: NextResponse): void {
  const { arm, set } = pickVisitorArm({
    cookie: request.cookies.get(ACCESS_COOKIE)?.value,
    userAgent: request.headers.get("user-agent"),
    percent: accessTestPercent(),
  });
  if (arm && set) response.cookies.set(ACCESS_COOKIE, arm, { path: "/", maxAge: ACCESS_COOKIE_MAX_AGE, sameSite: "lax" });
}

/** Stamp the visitor's country (from Vercel's geo header) into a cookie so
 *  client components can show local pricing without a round trip. Also the free-unlock test group. */
function withCountryCookie(request: NextRequest, response: NextResponse): NextResponse {
  withAccessCookie(request, response);
  if (request.cookies.get(COUNTRY_COOKIE)) return response;
  const country =
    request.headers.get("x-vercel-ip-country") ??
    (request as NextRequest & { geo?: { country?: string } }).geo?.country ??
    null;
  if (country) {
    response.cookies.set(COUNTRY_COOKIE, country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") return withCountryCookie(request, NextResponse.next());

  // Local preview only (never active in production builds).
  if (devBypassAuth()) return withCountryCookie(request, NextResponse.next());

  const isProtected = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
  const isPublicLesson = PUBLIC_LESSONS.some((path) => pathname === path || pathname.startsWith(path + "/"));

  // Only protect known protected routes — let everything else pass through
  // so Next.js can serve the page or return a proper 404
  if (!isProtected || isPublicLesson) {
    return withCountryCookie(request, NextResponse.next());
  }

  // Check for session cookie (database strategy uses opaque session token, not JWT)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/get-started";
    // Bring them back to where they were heading after sign-in, query included (e.g. /checkout?plan=monthly)
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return withCountryCookie(request, NextResponse.redirect(url));
  }

  return withCountryCookie(request, NextResponse.next());
}

export const config = {
  // Skip API routes, Next internals and every static asset (robots/sitemap/
  // llms.txt, the manifest, media, fonts…). Running the edge function on those
  // added a hop to each request — and Lighthouse timed out fetching robots.txt
  // while the page saturated the connection with the hero video.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon|robots\\.txt|sitemap\\.xml|llms\\.txt|site\\.webmanifest|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm|woff2?|ttf|otf|txt|xml|json|pdf)$).*)",
  ],
};
