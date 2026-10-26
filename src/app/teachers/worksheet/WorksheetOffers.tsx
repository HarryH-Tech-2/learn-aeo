"use client";

/**
 * Under the worksheet's toolbar, inside the same screen-only panel (never printed): a box that emails the teacher the worksheet
 * and lesson plan (the lead goes to EmailLead, source "worksheet"), and what to do with a whole class next:
 * the live quiz (part of the licence) and the Classroom licence.
 *
 * GA4: worksheet_email (the box submitted) and worksheet_offer_click (target: class | licence).
 */
import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type State = "idle" | "sending" | "sent" | "error";

export default function WorksheetOffers() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/worksheet-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Could not send the email. Try again in a moment.");
        setState("error");
        return;
      }
      setState("sent");
      trackEvent("worksheet_email");
    } catch {
      setError("Could not send the email. Check your connection and try again.");
      setState("error");
    }
  };

  return (
    <div className="ws-offers">
      <div className="ws-offer">
        <p className="ws-offer-title">Get it by email</p>
        {state === "sent" ? (
          <p className="ws-offer-text" role="status">
            Sent to {email.trim()}. It has the worksheet, the 50-minute lesson plan and the live class quiz.
          </p>
        ) : (
          <>
            <p className="ws-offer-text">
              The worksheet, the 50-minute lesson plan and the live class quiz in one email, ready for the day you
              teach it.
            </p>
            <form onSubmit={submit} className="ws-offer-action">
              <label htmlFor="ws-email" className="sr-only">
                Your email address
              </label>
              <input
                id="ws-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.org"
                className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-4 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-500 focus:outline-none"
              />
              <button type="submit" disabled={state === "sending"} className="btn-primary shrink-0 justify-center px-5 text-sm disabled:opacity-60">
                {state === "sending" ? "Sending" : "Email it to me"}
              </button>
            </form>
            {state === "error" ? (
              <p className="ws-offer-note text-red-300" role="alert">
                {error}
              </p>
            ) : (
              <p className="ws-offer-note">New worksheets follow when they are ready.</p>
            )}
          </>
        )}
      </div>

      <div className="ws-offer">
        <p className="ws-offer-title">Teaching this to a whole class?</p>
        <p className="ws-offer-text">
          A Classroom licence gives you and 30 pupils the full course, with every pupil&apos;s progress on one page.
        </p>
        <div className="ws-offer-action">
          <Link
            href="/pricing#teachers"
            onClick={() => trackEvent("worksheet_offer_click", { target: "licence" })}
            className="btn-primary w-full justify-center px-5 text-sm"
          >
            See the Classroom licence
          </Link>
        </div>
        <p className="ws-offer-note">
          With a licence, finish the lesson with a{" "}
          <Link
            href="/teachers/class"
            onClick={() => trackEvent("worksheet_offer_click", { target: "class" })}
            className="text-gold-400 underline underline-offset-2 hover:text-gold-300"
          >
            live class quiz
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
