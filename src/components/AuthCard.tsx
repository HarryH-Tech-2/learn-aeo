"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { trackEvent } from "@/lib/analytics";
import { setSignedInHint } from "@/lib/signed-in-hint";
import { prefetchGoogleSignIn, startGoogleSignIn } from "@/lib/google-sign-in";
import Link from "next/link";
import Price from "@/components/Price";
import { PLANS, planById, planPeriodLabel } from "@/lib/plans";
import { planIdFromCheckoutPath } from "@/lib/checkout-return";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";

type CardState = "initial" | "checking" | "choice" | "check-email";
export type AuthMode = "signup" | "signin";

interface Props {
  /** Where to land after a successful sign-in. */
  destination: string;
  /** Purchase-intent copy (the plan from `destination` and the visitor's own price) instead of free-lesson copy. */
  buyIntent?: boolean;
  /** Modal mode: send the magic link without leaving the page and show the
   *  check-email state inline. Page mode redirects to /get-started?verify=true. */
  inlineVerify?: boolean;
  initialState?: CardState;
  initialError?: string | null;
  /** Rendered inside the modal: shows a close button, hides the Home link. */
  onClose?: () => void;
  /** "signin" = returning-user copy + login analytics. Default "signup". */
  mode?: AuthMode;
  /** Modal only: swap sign-up/sign-in copy in place instead of navigating. */
  onSwitchMode?: (mode: AuthMode) => void;
  /** Sign-up subtitle override (free-lesson copy only; sign-in and buy copy keep their own). */
  intro?: string;
}

function GoogleLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/**
 * The sign-up line for someone on their way to pay: the plan they picked and the price they will be charged
 * (local currency and purchasing-power discount, via <Price>), not a hard-coded "$19.99".
 */
function BuyIntro({ destination }: { destination: string }) {
  const plan = planById(planIdFromCheckoutPath(destination)) ?? PLANS.lifetime;
  const freeGuest = useFreeCourseGuest();
  // (the free-unlock test's free group: the course is free on the account, src/lib/access-test.ts)
  if (freeGuest && (plan.id === "lifetime" || plan.id === "monthly")) {
    return <>Create your free account and the whole course opens on it, with nothing to pay.</>;
  }
  if (plan.mode === "payment") {
    return (
      <>
        Create your account, then pay once for lifetime access: <Price plan={plan} />.
      </>
    );
  }
  return (
    <>
      Create your account, then start the {plan.name}
      {plan.id === "classroom" || plan.id === "school" ? " licence" : ""}: <Price plan={plan} /> {planPeriodLabel(plan)}.
    </>
  );
}

export default function AuthCard({
  destination,
  buyIntent = false,
  inlineVerify = false,
  initialState = "initial",
  initialError = null,
  onClose,
  mode = "signup",
  onSwitchMode,
  intro,
}: Props) {
  const isSignIn = mode === "signin";
  // (no money-back line for the free-unlock test's free group: nothing is bought)
  const freeGuest = useFreeCourseGuest();
  const authEvent = isSignIn ? "login" : "sign_up";
  const [email, setEmail] = useState("");
  const [cardState, setCardState] = useState<CardState>(initialState);
  const [error, setError] = useState<string | null>(initialError);
  const [googleOpening, setGoogleOpening] = useState(false);

  useEffect(() => {
    prefetchGoogleSignIn();
    // Back from Google's page restores this one from the bfcache with the button still saying "Opening"
    const onShow = (e: PageTransitionEvent) => e.persisted && setGoogleOpening(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const sendMagicLink = async () => {
    setSignedInHint(true);
    const address = email.trim().toLowerCase();
    if (inlineVerify) {
      const res = await signIn("email", {
        email: address,
        callbackUrl: destination,
        redirect: false,
      });
      if (res?.error) {
        setError("Failed to send sign-in email. Please try again or use Google.");
        setCardState("initial");
      } else {
        setError(null);
        setCardState("check-email");
      }
    } else {
      await signIn("email", { email: address, callbackUrl: destination, redirect: true });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setCardState("checking");

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (data.exists && data.provider === "google") {
        setCardState("choice");
      } else {
        // No existing Google account — send magic link
        trackEvent(authEvent, { method: "email" });
        await sendMagicLink();
      }
    } catch {
      // Fallback: just send the magic link
      await sendMagicLink();
    }
  };

  const handleGoogleSignIn = () => {
    trackEvent(authEvent, { method: "google" });
    setSignedInHint(true); // they come back signed in: the page they land on need not wait to find out
    setGoogleOpening(true);
    startGoogleSignIn(destination).catch(() => setGoogleOpening(false));
  };

  const handleSendMagicLink = async () => {
    setCardState("checking");
    await sendMagicLink();
  };

  return (
    <div className="relative bg-obsidian-light border border-gold-700/30 p-10">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500/40" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500/40" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500/40" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500/40" />

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 left-3 p-2 text-sand-500 hover:text-gold-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-6">
          <span className="text-4xl">&#x13080;</span>
          <span className="font-display text-2xl font-semibold text-gold-400">
            Learn Hieroglyphics
          </span>
        </Link>

        {cardState === "check-email" ? (
          <>
            <h1 className="font-display text-3xl font-light text-sand-100 mb-2">
              Check Your{" "}
              <span className="text-gradient-gold font-medium">Email</span>
            </h1>
            <p className="font-body text-sm text-sand-500 font-light">
              We sent a sign-in link to your email. Click it to continue.
            </p>
          </>
        ) : cardState === "choice" ? (
          <>
            <h1 className="font-display text-3xl font-light text-sand-100 mb-2">
              Welcome{" "}
              <span className="text-gradient-gold font-medium">Back</span>
            </h1>
            <p className="font-body text-sm text-sand-500 font-light">
              We found a Google account with this email. How would you like
              to sign in?
            </p>
          </>
        ) : (
          <>
            {isSignIn ? (
              <h1 className="font-display text-3xl font-light text-sand-100 mb-2">
                Enter the{" "}
                <span className="text-gradient-gold font-medium">Temple</span>
              </h1>
            ) : (
              <h1 className="font-display text-3xl font-light text-sand-100 mb-2">
                Begin Your{" "}
                <span className="text-gradient-gold font-medium">Journey</span>
              </h1>
            )}
            <p className="font-body text-sm text-sand-500 font-light">
              {isSignIn
                ? "Sign in to continue your journey through ancient Egypt"
                : buyIntent
                  ? <BuyIntro destination={destination} />
                  : intro ?? "Create a free account and start your first lesson. No payment needed."}
            </p>
            {!isSignIn && buyIntent && !freeGuest && (
              <p className="font-body text-xs text-gold-400/90 mt-2 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                14-day money-back guarantee
              </p>
            )}
          </>
        )}
      </div>

      {/* Check Email State */}
      {cardState === "check-email" && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gold-500/10 border border-gold-500/20">
            <svg
              className="w-8 h-8 text-gold-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="font-body text-sm text-sand-400 mb-6">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => setCardState("initial")}
              className="text-gold-400 hover:text-gold-300 underline transition-colors"
            >
              try again
            </button>
            .
          </p>
        </div>
      )}

      {/* Choice State (Google account detected) */}
      {cardState === "choice" && (
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={googleOpening}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-sand-50 hover:bg-white text-obsidian font-body font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {googleOpening ? <Spinner /> : <GoogleLogo />}
            {googleOpening ? "Opening Google…" : "Sign in with Google"}
          </button>

          <button
            onClick={handleSendMagicLink}
            className="w-full py-4 px-6 border border-gold-700/30 text-sand-200 hover:text-gold-400 hover:border-gold-500/30 font-body font-medium text-sm transition-all duration-300"
          >
            Send me an email link instead
          </button>
        </div>
      )}

      {/* Error */}
      {error && cardState !== "check-email" && (
        <div className="mb-4 p-3 bg-terracotta/10 border border-terracotta/30 text-center">
          <p className="font-body text-sm text-terracotta">{error}</p>
        </div>
      )}

      {/* Initial State */}
      {(cardState === "initial" || cardState === "checking") && (
        <>
          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full py-4 px-5 bg-obsidian border border-gold-700/20 text-sand-100 font-body text-sm placeholder:text-sand-600 focus:outline-none focus:border-gold-500/40 transition-colors mb-3"
            />
            <button
              type="submit"
              disabled={cardState === "checking"}
              className="btn-primary w-full justify-center text-sm py-4 disabled:opacity-50"
            >
              {cardState === "checking" ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Checking...
                </span>
              ) : (
                "Continue with Email"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gold-700/20" />
            <span className="font-body text-xs text-sand-600 uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-gold-700/20" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleOpening}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-sand-50 hover:bg-white text-obsidian font-body font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {googleOpening ? <Spinner /> : <GoogleLogo />}
            {googleOpening ? "Opening Google…" : "Continue with Google"}
          </button>
        </>
      )}

      {/* Info */}
      {cardState !== "check-email" && (
        <p className="font-body text-xs text-sand-600 text-center leading-relaxed mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      )}

      {/* Links */}
      <div className="text-center mt-6 flex items-center justify-center gap-4">
        {!onClose && (
          <>
            <Link
              href="/"
              className="font-body text-sm text-sand-500 hover:text-gold-400 transition-colors"
            >
              Home
            </Link>
            <span className="text-sand-700">|</span>
          </>
        )}
        {onSwitchMode ? (
          <button
            type="button"
            onClick={() => onSwitchMode(isSignIn ? "signup" : "signin")}
            className="font-body text-sm text-sand-500 hover:text-gold-400 transition-colors"
          >
            {isSignIn ? "New here? Start your first lesson free" : "Already have an account?"}
          </button>
        ) : (
          <Link
            href={isSignIn ? "/get-started" : "/login"}
            className="font-body text-sm text-sand-500 hover:text-gold-400 transition-colors"
          >
            {isSignIn ? "New here? Start your first lesson free" : "Already have an account?"}
          </Link>
        )}
      </div>
    </div>
  );
}
