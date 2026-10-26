"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

const RATINGS = [
  { id: "loved", label: "The class loved it" },
  { id: "ok", label: "It was OK" },
  { id: "poor", label: "It didn’t work for us" },
] as const;

type State = "idle" | "sending" | "sent" | "error";

/**
 * The teachers' box under the quiz: how it went, and what would make it better. It goes to the
 * owner's inbox with the teacher's address as reply-to (/api/class/feedback).
 * Shown once a quiz is over, under the podium, and nowhere else.
 */
export default function ClassFeedback({ teams }: { teams?: number }) {
  const where = "podium";
  const [rating, setRating] = useState<(typeof RATINGS)[number]["id"] | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/class/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, message, where, teams }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send that, try again");
      trackEvent("class_feedback", { location: where, rating: rating ?? "none" });
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="card-ancient p-6 sm:p-8 text-center cq-pop" role="status">
        <p className="font-display text-2xl text-sand-100">Thank you. That goes straight to Harry.</p>
        <p className="font-body text-sm text-sand-400 mt-2">He reads every note and replies to the ones with questions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-ancient p-6 sm:p-8 text-left">
      <p className="font-body text-xs tracking-[0.25em] uppercase text-gold-500 mb-2">For teachers</p>
      <h2 className="font-display text-2xl text-sand-100">How did that go with your class?</h2>
      <p className="font-body text-sm text-sand-400 mt-1 mb-4">
        This quiz is new. Tell us what worked, what fell flat, and what you would add: question types, a longer or shorter round, topics from your scheme of work.
      </p>

      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="How it went">
        {RATINGS.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={rating === r.id}
            onClick={() => setRating(rating === r.id ? null : r.id)}
            className={`font-body text-sm px-4 py-2.5 border transition-colors ${rating === r.id ? "border-gold-400 bg-gold-500/20 text-sand-100" : "border-gold-700/30 text-sand-300 hover:border-gold-500/60"}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <label htmlFor={`class-feedback-${where}`} className="sr-only">
        Your feedback and ideas
      </label>
      <textarea
        id={`class-feedback-${where}`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="e.g. Twenty seconds was too short for Year 3. Could there be a round on gods and pharaohs?"
        className="w-full bg-obsidian-lighter border border-gold-700/30 p-3 font-body text-base text-sand-100 placeholder:text-sand-600 focus:border-gold-500 focus:outline-none"
      />

      {state === "error" && <p className="font-body text-sm text-terracotta mt-2">{error}</p>}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button type="submit" disabled={state === "sending" || (!rating && !message.trim())} className="btn-primary text-sm py-3 px-8 disabled:opacity-40">
          {state === "sending" ? "Sending" : "Send feedback"}
        </button>
        <span className="font-body text-xs text-sand-500">Goes to the person who builds it. No survey, no mailing list.</span>
      </div>
    </form>
  );
}
