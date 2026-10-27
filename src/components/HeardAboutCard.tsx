"use client";

import { useState } from "react";
import { HEARD_ABOUT_OPTIONS } from "@/lib/referrer";
import { trackEvent } from "@/lib/analytics";

/**
 * "How did you find us?" on the dashboard, once per account (/api/me/heard-about). Their own answer needs no
 * cookie and no consent, and it catches what tracking can't: word of mouth, a teacher, an AI answer.
 */
export default function HeardAboutCard() {
  const [state, setState] = useState<"ask" | "other" | "thanks" | "gone">("ask");
  const [detail, setDetail] = useState("");

  function send(answer: string, words = "") {
    setState(answer === "skipped" ? "gone" : "thanks");
    trackEvent("heard_about", { answer });
    void fetch("/api/me/heard-about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer, detail: words }),
    }).catch(() => {});
  }

  if (state === "gone") return null;
  if (state === "thanks") {
    return (
      <div className="border border-gold-700/30 bg-obsidian-lighter/60 px-5 py-4">
        <p className="font-body text-sm text-sand-300">Thank you. That helps more people find Learn AEO.</p>
      </div>
    );
  }

  return (
    <div className="border border-gold-700/30 bg-obsidian-lighter/60 p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2 className="font-display text-xl text-sand-100">How did you find us?</h2>
        <button type="button" onClick={() => send("skipped")} className="font-body text-xs text-sand-500 hover:text-sand-300 shrink-0">
          Skip
        </button>
      </div>
      {state === "ask" ? (
        <div className="flex flex-wrap gap-2">
          {HEARD_ABOUT_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => (o.id === "other" ? setState("other") : send(o.id))}
              className="font-body text-sm text-sand-200 border border-gold-700/40 px-3 py-1.5 hover:border-gold-500 hover:text-gold-400 transition-colors"
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send("other", detail);
          }}
        >
          <label htmlFor="heard-about-detail" className="sr-only">
            Where did you find us?
          </label>
          <input
            id="heard-about-detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            maxLength={80}
            autoFocus
            placeholder="A podcast, a book, a website…"
            className="flex-1 min-w-0 font-body text-sm bg-obsidian border border-gold-700/40 px-3 py-2 text-sand-100 placeholder:text-sand-600 focus:outline-none focus:border-gold-500"
          />
          <button type="submit" className="btn-primary text-sm py-2 px-5">
            Send
          </button>
        </form>
      )}
    </div>
  );
}
