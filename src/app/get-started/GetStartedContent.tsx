"use client";

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import AuthCard from "@/components/AuthCard";
import { isBuyIntent } from "@/lib/checkout-return";

// The sign-up card itself lives in AuthCard and is shared with the homepage
// popup (AuthModal). This page remains the target for middleware redirects,
// NextAuth's ?verify=true / ?error=EmailSignin round-trips, and direct links.
export default function GetStartedContent() {
  return (
    <Suspense>
      <GetStartedInner />
    </Suspense>
  );
}

function GetStartedInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isVerify = searchParams.get("verify") === "true";
  // Default: /dashboard, which for a brand-new account is turned into Lesson 1
  // by NextAuth's newUser page (src/app/welcome/route.ts); returning users get
  // the dashboard. Purchase-intent entry points (pricing CTA, locked lessons)
  // link here with ?next=checkout to keep the buy flow.
  const nextParam = searchParams.get("next");
  // "checkout" or any /checkout path (the pricing cards send /checkout?plan=…) means they are on their way to pay.
  const buyIntent = isBuyIntent(nextParam);
  // A relative path (e.g. the lesson a guest was in) is honored; anything
  // else falls back to the dashboard. Never an absolute URL — no open redirect.
  const safeNext = nextParam && /^\/(?!\/)[\w\-./?=&%]*$/.test(nextParam) ? nextParam : null;
  const destination = buyIntent ? (safeNext ?? "/checkout") : safeNext ?? "/dashboard";

  const hasError = searchParams.get("error") === "EmailSignin";

  // If already logged in, redirect to the destination
  useEffect(() => {
    if (session) {
      window.location.href = destination;
    }
  }, [session, destination]);

  if (session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-obsidian">
        <div className="text-center">
          <span className="mx-auto mb-4 block h-10 w-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" aria-hidden="true" />
          <p className="font-body text-sand-400 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian-light to-obsidian" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(111,227,255,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-6"
      >
        {/* Card border glow */}
        <div className="absolute -inset-px bg-gradient-to-b from-gold-500/20 via-transparent to-gold-500/20 blur-sm" />

        <AuthCard
          destination={destination}
          buyIntent={buyIntent}
          initialState={isVerify ? "check-email" : "initial"}
          initialError={
            hasError ? "Failed to send sign-in email. Please try again or use Google." : null
          }
        />
      </motion.div>
    </div>
  );
}
