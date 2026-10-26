"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FeedbackButtonProps = {
  /** Optional label identifying which page or surface the feedback is about. */
  page?: string;
};

export default function FeedbackButton({ page }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function resetForm() {
    setRating(null);
    setMessage("");
    setState("idle");
    setErrorMsg(null);
  }

  function close() {
    setOpen(false);
    // Delay reset so exit animation doesn't show empty form
    setTimeout(resetForm, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setState("sending");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          rating,
          page: page ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send feedback");
      }

      setState("sent");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-obsidian-light border border-gold-700/40 hover:border-gold-500/60 text-gold-400 hover:text-gold-300 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
        aria-label="Give feedback"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="font-body text-xs tracking-wider uppercase">
          Feedback
        </span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-obsidian-light border border-gold-700/30 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gold-500/40" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gold-500/40" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gold-500/40" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gold-500/40" />

              {/* Close */}
              <button
                onClick={close}
                aria-label="Close feedback"
                className="absolute top-3 right-3 text-sand-500 hover:text-sand-200 p-2 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {state === "sent" ? (
                <div className="text-center py-4">
                  <span className="text-4xl block mb-4">𓂀</span>
                  <h2 className="font-display text-xl text-sand-100 font-light mb-2">
                    Thank you
                  </h2>
                  <p className="font-body text-sm text-sand-400 mb-6">
                    Your feedback has been received. It helps improve the
                    Academy for everyone.
                  </p>
                  <button
                    onClick={close}
                    className="btn-primary py-3 px-8 text-sm"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-2">
                      Share feedback
                    </p>
                    <h2 className="font-display text-xl text-sand-100 font-light">
                      How are the lessons?
                    </h2>
                    <p className="font-body text-sm text-sand-500 mt-1">
                      Ideas, bugs, or anything else. It all helps.
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="mb-5">
                    <label className="block font-body text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-2">
                      Rating (optional)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(rating === n ? null : n)}
                          className={`flex-1 py-2 border text-sm font-body transition-all ${
                            rating === n
                              ? "border-gold-500 bg-gold-500/10 text-gold-400"
                              : "border-gold-700/20 text-sand-500 hover:border-gold-700/40 hover:text-sand-300"
                          }`}
                          aria-label={`Rate ${n} out of 5`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-5">
                    <label
                      htmlFor="feedback-message"
                      className="block font-body text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-2"
                    >
                      Your feedback
                    </label>
                    <textarea
                      id="feedback-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      maxLength={2000}
                      placeholder="What's on your mind?"
                      className="w-full py-3 px-4 bg-obsidian border border-gold-700/20 text-sand-100 font-body text-sm placeholder:text-sand-600 focus:outline-none focus:border-gold-500/40 transition-colors resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="mb-4 p-3 bg-terracotta/10 border border-terracotta/30">
                      <p className="font-body text-sm text-terracotta">
                        {errorMsg}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={close}
                      className="btn-secondary flex-1 justify-center py-3 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={state === "sending" || !message.trim()}
                      className="btn-primary flex-1 justify-center py-3 text-sm disabled:opacity-50"
                    >
                      {state === "sending" ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
