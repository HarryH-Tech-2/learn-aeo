"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

/** The footer's sign-up for new lessons and posts (POST /api/newsletter). */
export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      trackEvent("newsletter_signup", { location: "footer" });
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="font-body text-base text-sand-200">
        You&apos;re on the list. Look for a welcome email from us at <span className="text-gold-300">{email}</span>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <label htmlFor="footer-newsletter" className="block font-body text-sm text-sand-300 mb-2">
        Get new lessons and posts by email
      </label>
      <div className="footer-newsletter-field">
        <input
          id="footer-newsletter"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-body text-base text-sand-100 placeholder:text-sand-500 focus:outline-none"
        />
        <button type="submit" disabled={state === "sending"} className="footer-newsletter-btn">
          {state === "sending" ? "Signing up…" : "Sign up"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className="font-body text-sm text-terracotta mt-2">
          That didn&apos;t go through. Check the address and press Sign up again.
        </p>
      )}
    </form>
  );
}
