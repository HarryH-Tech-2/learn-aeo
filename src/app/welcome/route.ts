import { NextResponse, type NextRequest } from "next/server";
import { newUserLanding } from "@/lib/new-user-landing";

/**
 * GET /welcome?callbackUrl=... : NextAuth's pages.newUser (src/lib/auth.ts).
 * Only the sign-in that created an account comes here; it forwards to
 * Lesson 1 unless the sign-up asked for somewhere specific (see newUserLanding).
 */
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const to = newUserLanding(request.nextUrl.searchParams.get("callbackUrl"), [request.nextUrl.origin, process.env.NEXTAUTH_URL]);
  return NextResponse.redirect(new URL(to, request.nextUrl.origin), 303);
}
