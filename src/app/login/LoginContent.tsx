"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { startGoogleSignIn } from "@/lib/google-sign-in";
import { trackEvent } from "@/lib/analytics";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

type PageState = "initial" | "checking" | "choice" | "check-email";

export default function LoginContent() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerify = searchParams.get("verify") === "true";

  const [email, setEmail] = useState("");
  const hasError = searchParams.get("error") === "EmailSignin";
  const [pageState, setPageState] = useState<PageState>(
    isVerify ? "check-email" : "initial"
  );
  const [error, setError] = useState<string | null>(
    hasError ? "Failed to send sign-in email. Please try again or use Google." : null
  );

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (session) {
      window.location.href = "/dashboard";
    }
  }, [session]);

  if (session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-obsidian">
        <div className="text-center">
          <span className="text-5xl block mb-4 animate-pulse">&#x13080;</span>
          <p className="font-body text-sand-400 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setPageState("checking");

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (data.exists && data.provider === "google") {
        setPageState("choice");
      } else {
        await signIn("email", {
          email: email.trim().toLowerCase(),
          callbackUrl: "/dashboard",
          redirect: true,
        });
      }
    } catch {
      await signIn("email", {
        email: email.trim().toLowerCase(),
        callbackUrl: "/dashboard",
        redirect: true,
      });
    }
  };

  const handleGoogleSignIn = () => {
    trackEvent("login", { method: "google" });
    void startGoogleSignIn("/dashboard");
  };

  const handleSendMagicLink = async () => {
    setPageState("checking");
    await signIn("email", {
      email: email.trim().toLowerCase(),
      callbackUrl: "/dashboard",
      redirect: true,
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian-light to-obsidian" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,168,50,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Decorative glyph */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span
          className="text-[40rem] text-gold-500"
          style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}
        >
          &#x13080;
        </span>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-6"
      >
        {/* Card border glow */}
        <div className="absolute -inset-px bg-gradient-to-b from-gold-500/20 via-transparent to-gold-500/20 blur-sm" />

        <div className="relative bg-obsidian-light border border-gold-700/30 p-10">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500/40" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500/40" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500/40" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500/40" />

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <span className="text-4xl">&#x13080;</span>
              <span className="font-display text-2xl font-semibold text-gold-400">
                Learn Hieroglyphics
              </span>
            </Link>

            {pageState === "check-email" ? (
              <>
                <h1 className="font-display text-3xl font-light text-sand-100 mb-2">
                  Check Your{" "}
                  <span className="text-gradient-gold font-medium">Email</span>
                </h1>
                <p className="font-body text-sm text-sand-500 font-light">
                  We sent a sign-in link to your email. Click it to continue.
                </p>
              </>
            ) : pageState === "choice" ? (
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
                <h1 className="font-display text-3xl font-light text-sand-100 mb-2">
                  Enter the{" "}
                  <span className="text-gradient-gold font-medium">Temple</span>
                </h1>
                <p className="font-body text-sm text-sand-500 font-light">
                  Sign in to continue your journey through ancient Egypt
                </p>
              </>
            )}
          </div>

          {/* Check Email State */}
          {pageState === "check-email" && (
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
                  onClick={() => setPageState("initial")}
                  className="text-gold-400 hover:text-gold-300 underline transition-colors"
                >
                  try again
                </button>
                .
              </p>
            </div>
          )}

          {/* Choice State */}
          {pageState === "choice" && (
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-sand-50 hover:bg-white text-obsidian font-body font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
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
          {error && (
            <div className="mb-4 p-3 bg-terracotta/10 border border-terracotta/30 text-center">
              <p className="font-body text-sm text-terracotta">{error}</p>
            </div>
          )}

          {/* Initial State */}
          {(pageState === "initial" || pageState === "checking") && (
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
                  disabled={pageState === "checking"}
                  className="btn-primary w-full justify-center text-sm py-4 disabled:opacity-50"
                >
                  {pageState === "checking" ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-sand-50 hover:bg-white text-obsidian font-body font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Info */}
          {pageState !== "check-email" && (
            <p className="font-body text-xs text-sand-600 text-center leading-relaxed mt-6">
              By signing in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          )}

          {/* Links */}
          <div className="text-center mt-6 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="font-body text-sm text-sand-500 hover:text-gold-400 transition-colors"
            >
              Home
            </Link>
            <span className="text-sand-700">|</span>
            <Link
              href="/get-started?next=checkout"
              className="font-body text-sm text-sand-500 hover:text-gold-400 transition-colors"
            >
              Get lifetime access
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
