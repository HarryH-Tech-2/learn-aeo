"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { setSignedInHint } from "@/lib/signed-in-hint";
import { setAnalyticsUserId } from "@/lib/analytics";

interface ProvidersProps {
  children: ReactNode;
}

/** Keeps the signed-in note (see signed-in-hint.ts) in step with what the session check last said,
 *  and hands the account id to GA4 so a visitor stays one user across sign-in. */
function SignedInHint() {
  const { status, data } = useSession();
  const userId = (data?.user as { id?: string } | undefined)?.id;
  useEffect(() => {
    if (status !== "loading") setSignedInHint(status === "authenticated");
  }, [status]);
  useEffect(() => {
    if (userId) setAnalyticsUserId(userId);
  }, [userId]);
  return null;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SignedInHint />
      {children}
    </SessionProvider>
  );
}
