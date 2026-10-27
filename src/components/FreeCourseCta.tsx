"use client";

/**
 * "The whole course is free for you": what a signed-out visitor in the free-unlock test's free group
 * (src/lib/access-test.ts) sees where everyone else meets a price, as a card (pricing, lesson and game paywalls) or a
 * single button (`compact`). Sign-up goes through /get-started, and the account keeps the group from the cookie.
 * GA4: free_course_view (once per mount) and free_course_click, both with location.
 */
import Link from "next/link";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export const FREE_COURSE_LINES = [
  "Every live lesson, and each new one as it opens",
  "Your XP, levels, badges and the leaderboard",
  "Your certificate when you finish",
];

export default function FreeCourseCta({
  location,
  compact = false,
  label = "Create my free account",
  href = "/get-started",
}: {
  location: string;
  compact?: boolean;
  label?: string;
  /** Signed-in free-group learners go to their dashboard instead */
  href?: string;
}) {
  useEffect(() => {
    trackEvent("free_course_view", { location });
  }, [location]);

  const button = (
    <Link
      href={href}
      onClick={() => trackEvent("free_course_click", { location })}
      className={compact ? "btn-primary inline-flex justify-center text-base py-4 px-8" : "btn-primary w-full justify-center text-sm py-3.5 mt-5"}
    >
      {label}
    </Link>
  );
  if (compact) return button;

  return (
    <div className="border border-gold-500/40 bg-obsidian-lighter p-5 text-left">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-1">Free for you</p>
      <p className="font-display text-2xl text-sand-100">The whole course, free</p>
      <p className="font-body text-sm text-sand-300 mt-2 leading-relaxed">
        Make a free account and everything opens on it, with nothing to pay:
      </p>
      <ul className="mt-2 space-y-1">
        {FREE_COURSE_LINES.map((l) => (
          <li key={l} className="font-body text-sm text-sand-300 flex gap-2">
            <span className="text-cyan-500" aria-hidden="true">
              &#10003;
            </span>
            {l}
          </li>
        ))}
      </ul>
      {button}
    </div>
  );
}
