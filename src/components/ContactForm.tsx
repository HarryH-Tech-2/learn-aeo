"use client";

import { useState } from "react";
import { getHieroglyphs } from "@/lib/hieroglyph-translator";
import { trackEvent } from "@/lib/analytics";

const GLYPH_FONT = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;
const MAX_MESSAGE = 2000;

/**
 * The contact form on /contact and at the foot of the homepage. A letter to the scribes: the sender's
 * name is written into a cartouche as they type it, and that cartouche is the seal pressed on sending.
 */
export default function ContactForm({ idPrefix = "contact" }: { idPrefix?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const glyphs = name.trim() ? getHieroglyphs(name.trim().split(/\s+/)[0]) : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      trackEvent("contact_submit", { location: idPrefix });
    } catch {
      setError("Your message didn't send. Check your connection and press Send again, or email hello@learnaeo.com.");
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="letter-card letter-sent p-8 md:p-12 text-center" role="status">
        <div className="letter-seal letter-seal-pressed mx-auto" aria-hidden="true">
          <span style={GLYPH_FONT}>{glyphs || "𓂀"}</span>
        </div>
        <h3 className="font-display text-3xl font-light text-sand-100 mt-6">Sent. Thank you, {name.trim().split(/\s+/)[0]}.</h3>
        <p className="font-body text-base text-sand-400 mt-3 max-w-sm mx-auto leading-relaxed">
          We reply within a day, to <span className="text-sand-200">{email}</span>. Look in your spam folder if nothing arrives.
        </p>
      </div>
    );
  }

  const field =
    "letter-input w-full bg-transparent text-sand-100 font-body text-base placeholder:text-sand-500/70 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="letter-card p-6 sm:p-8 md:p-10">
      <div className="mb-8">
        <p className="font-display text-3xl sm:text-4xl font-light text-sand-100 leading-tight">Dear scribes,</p>
        <p className="font-body text-sm text-sand-400 mt-1.5">Questions, ideas, help with your account or a school order.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
        <label className="letter-line block" htmlFor={`${idPrefix}-name`}>
          <span className="letter-label">
            <span style={GLYPH_FONT} aria-hidden="true">𓀀</span> Your name
          </span>
          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Nefertari"
          />
        </label>

        <label className="letter-line block" htmlFor={`${idPrefix}-email`}>
          <span className="letter-label">
            <span style={GLYPH_FONT} aria-hidden="true">𓅭</span> Where we reply
          </span>
          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            placeholder="you@example.com"
          />
        </label>

        <label className="letter-line block sm:col-span-2" htmlFor={`${idPrefix}-message`}>
          <span className="letter-label flex justify-between">
            <span>
              <span style={GLYPH_FONT} aria-hidden="true">𓏛</span> Your message
            </span>
            {message.length > MAX_MESSAGE * 0.8 && (
              <span className="text-sand-500 tabular-nums">
                {message.length}/{MAX_MESSAGE}
              </span>
            )}
          </span>
          <textarea
            id={`${idPrefix}-message`}
            name="message"
            required
            rows={5}
            maxLength={MAX_MESSAGE}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${field} letter-ruled resize-y min-h-[8.5rem]`}
            placeholder="How can we help?"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-terracotta mt-6">
          {error}
        </p>
      )}

      <div className="mt-8 flex sm:justify-end">
        <button type="submit" disabled={sending} className="hero-cta self-stretch sm:self-auto justify-center disabled:opacity-60">
          <span className="hero-cta-seal" aria-hidden="true">
            𓂀
          </span>
          <span className="hero-cta-text">
            <span className="hero-cta-label">{sending ? "Sending…" : "Send message"}</span>
          </span>
        </button>
      </div>
    </form>
  );
}
