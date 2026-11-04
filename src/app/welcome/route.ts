import { NextResponse, after, type NextRequest } from "next/server";
import { newUserLanding } from "@/lib/new-user-landing";
import { GA_SESSION_COOKIE, gaClientIdFromCookie, gaSessionIdFromCookie, sendSignUpToGA4 } from "@/lib/ga-server";

/**
 * GET /welcome?callbackUrl=... : NextAuth's pages.newUser (src/lib/auth.ts).
 * Only the sign-in that created an account comes here; it forwards to
 * Lesson 1 unless the sign-up asked for somewhere specific (see newUserLanding),
 * and records a GA4 `sign_up` after the response (a no-op without analytics consent).
 */
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const to = newUserLanding(request.nextUrl.searchParams.get("callbackUrl"), [request.nextUrl.origin, process.env.NEXTAUTH_URL]);
  const clientId = gaClientIdFromCookie(request.cookies.get("_ga")?.value);
  const sessionId = gaSessionIdFromCookie(request.cookies.get(GA_SESSION_COOKIE)?.value);
  if (clientId) after(() => sendSignUpToGA4({ clientId, sessionId }).then(() => undefined));
  return NextResponse.redirect(new URL(to, request.nextUrl.origin), 303);
}
