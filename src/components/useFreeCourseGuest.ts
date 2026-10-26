"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { readAccessCookie } from "@/lib/access-test";

/**
 * A signed-out visitor in the free-unlock test's free group (the aeo_access cookie, src/lib/access-test.ts): every
 * paywall they meet says the course is free with an account instead of showing a price. False until the cookie has
 * been read on the client and the session is known, so the server render and payers see the normal page.
 * (Signed-in free-group learners have access, so the paywalls are not shown to them at all.)
 */
export function useFreeCourseGuest(): boolean {
  const { status } = useSession();
  const [free, setFree] = useState(false);
  useEffect(() => setFree(readAccessCookie() === "free"), []);
  return status === "unauthenticated" && free;
}
