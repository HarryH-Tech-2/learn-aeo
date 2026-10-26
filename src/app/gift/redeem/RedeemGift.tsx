"use client";

/**
 * Open a gift: sign in (Google or an email link, both coming back here), then unlock. GA4: gift_redeem (result).
 */
import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { startGoogleSignIn } from "@/lib/google-sign-in";
import { trackEvent } from "@/lib/analytics";

export default function RedeemGift({ code }: { code: string }) {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"granted" | "already" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const here = () => window.location.href;

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/gift/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = (await res.json()) as { ok?: boolean; result?: "granted" | "already"; error?: string };
      if (data.ok && data.result) {
        setDone(data.result);
        trackEvent("gift_redeem", { result: data.result });
      } else {
        setError(data.error ?? "Could not open the gift.");
        trackEvent("gift_redeem", { result: "error" });
      }
    } catch {
      setError("Could not open the gift. Please try again.");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="mt-8 border border-gold-500/40 bg-gold-500/10 p-6">
        <p className="font-display text-2xl text-sand-100">{done === "granted" ? "It's yours. Every lesson is open." : "You already have the full course."}</p>
        <Link href="/dashboard" className="mt-4 inline-block border border-gold-400 bg-gold-500/20 px-6 py-3 font-body font-semibold text-gold-100 hover:bg-gold-500/30">
          Start learning
        </Link>
      </div>
    );
  }

  if (status === "loading") return <p className="mt-8 font-body text-sm text-sand-500">One moment…</p>;

  if (status !== "authenticated") {
    return (
      <div className="mx-auto mt-8 max-w-md space-y-3 text-left">
        <p className="text-center font-body text-sm text-sand-300">Sign in to open your gift. It keeps your progress as you learn.</p>
        <button
          type="button"
          onClick={() => void startGoogleSignIn(here())}
          className="w-full border border-gold-500 bg-gold-500/15 px-5 py-3 font-body font-semibold text-gold-100 hover:bg-gold-500/25"
        >
          Continue with Google
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) void signIn("email", { email: email.trim().toLowerCase(), callbackUrl: here() });
          }}
          className="flex gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Or your email"
            className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-3 py-3 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none"
          />
          <button type="submit" className="border border-gold-700/50 px-4 py-3 font-body text-sm text-sand-200 hover:border-gold-400">
            Email me a link
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => void open()}
        disabled={busy}
        className="border border-gold-400 bg-gradient-to-r from-gold-500 to-gold-600 px-8 py-4 font-body text-base font-semibold text-obsidian hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Opening…" : "Open my gift"}
      </button>
      <p className="mt-2 font-body text-xs text-sand-500">Signed in as {session?.user?.email}</p>
      {error && (
        <p role="alert" className="mt-3 font-body text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
