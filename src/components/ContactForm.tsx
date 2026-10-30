"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

const MAX_MESSAGE = 2000;

const FIELD =
  "w-full rounded-lg border border-sand-500/30 bg-obsidian px-3 py-2.5 text-sand-100 font-body text-base placeholder:text-sand-500/70 focus:outline-none focus-visible:border-cyan focus-visible:ring-2 focus-visible:ring-cyan/40";
const LABEL = "block font-body text-sm font-medium text-sand-300 mb-1.5";

/** The contact form on /contact and at the foot of the homepage. */
export default function ContactForm({ idPrefix = "contact" }: { idPrefix?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="rounded-2xl border border-gold-500/20 bg-obsidian-light p-8 md:p-12 text-center" role="status">
        <h3 className="font-display text-3xl font-light text-sand-100">Sent. Thank you, {name.trim().split(/\s+/)[0]}.</h3>
        <p className="font-body text-base text-sand-400 mt-3 max-w-sm mx-auto leading-relaxed">
          We reply within a day, to <span className="text-sand-200">{email}</span>. Look in your spam folder if nothing arrives.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gold-500/20 bg-obsidian-light p-6 sm:p-8 md:p-10">
      <div className="mb-8">
        <p className="font-display text-3xl sm:text-4xl font-light text-sand-100 leading-tight">Get in touch</p>
        <p className="font-body text-sm text-sand-400 mt-1.5">Questions, ideas, or help with your account.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
        <div>
          <label className={LABEL} htmlFor={`${idPrefix}-name`}>
            Your name
          </label>
          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
            placeholder="Alex Morgan"
          />
        </div>

        <div>
          <label className={LABEL} htmlFor={`${idPrefix}-email`}>
            Where we reply
          </label>
          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD}
            placeholder="you@example.com"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={`${LABEL} flex justify-between`} htmlFor={`${idPrefix}-message`}>
            <span>Your message</span>
            {message.length > MAX_MESSAGE * 0.8 && (
              <span className="text-sand-500 tabular-nums">
                {message.length}/{MAX_MESSAGE}
              </span>
            )}
          </label>
          <textarea
            id={`${idPrefix}-message`}
            name="message"
            required
            rows={5}
            maxLength={MAX_MESSAGE}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${FIELD} resize-y min-h-[8.5rem]`}
            placeholder="How can we help?"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-terracotta mt-6">
          {error}
        </p>
      )}

      <div className="mt-8 flex sm:justify-end">
        <button type="submit" disabled={sending} className="btn-primary self-stretch sm:self-auto justify-center disabled:opacity-60">
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
