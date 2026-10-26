"use client";

/**
 * "Now read {Name} yourself" (2026-10-20): the free lesson asked for under the name translator's cartouche, before the
 * picture box. Since 2026-10-23 it sits under the email box, not above it: with the card first, cartouche email leads went
 * from about 2.5 a day to none. Text only since 2026-10-21 (the door picture beside it was dropped). The translator was 40% of landings but 2 of 576 visitors signed up, and the lesson card
 * further down the page (GuestPlayBanner) was clicked by about 4% of those who saw it, so the ask now comes while the
 * name is still on screen. Opens Lesson 1 without an account (?play=1, src/lib/guest-play.ts) with the name and its
 * signs on the sealed door (lessonHrefForName, src/lib/translator-bridge.ts, which every translator CTA shares).
 *
 * GA4: the GuestPlayBanner events, so the two read side by side: guest_play_banner_view (once per page load, when half
 * of it has been on screen; the results block is keyed on the name, so the card remounts on every keystroke and a
 * per-mount event fired up to 20 times a visitor until 2026-10-23) and guest_play_banner_click, both with location "translator", question_type "name_card",
 * named 1. Signed-in learners see the same card without "no sign-up" and without the events, as the banner skips them.
 */
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import type { TransliterationResult } from "@/lib/hieroglyph-translator";
import { lessonHrefForName } from "@/lib/translator-bridge";

const EVENT = { location: "translator", question_type: "name_card", named: 1 } as const;

// Survives the per-name remounts, so the view is counted once per page load rather than once per name typed.
let viewSent = false;

export default function NameLessonAsk({ name, results }: { name: string; results: TransliterationResult[] }) {
  const { status } = useSession();
  const cardRef = useRef<HTMLDivElement>(null);
  const guest = status !== "authenticated";
  const typed = name.trim();

  // One view per page view, once half of the card has been on screen.
  useEffect(() => {
    if (!guest || viewSent) return;
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          if (viewSent) return;
          viewSent = true;
          trackEvent("guest_play_banner_view", EVENT);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [guest]);

  if (!typed || results.length === 0) return null;

  return (
    <div
      ref={cardRef}
      className="mt-8 flex w-full max-w-2xl overflow-hidden border border-gold-600/50 bg-gold-500/10 text-left"
    >
      <div className="flex flex-1 flex-col gap-1 p-4 sm:p-5">
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">Free lesson</span>
        <p className="font-display text-xl leading-tight text-sand-100 sm:text-2xl">Now read {typed} yourself</p>
        <p className="font-body text-sm leading-snug text-sand-300">
          Your name is carved on a sealed temple door. Brush off the sand, read the signs, and learn all 25 alphabet signs in
          about 10 minutes.{guest ? " No sign-up to start." : ""}
        </p>
        <div className="mt-2">
          <Link
            href={lessonHrefForName(typed, results)}
            onClick={() => {
              if (guest) trackEvent("guest_play_banner_click", EVENT);
            }}
            className="gp-ring inline-flex cursor-pointer items-center bg-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-black shadow-lg transition-colors hover:bg-gold-400"
          >
            Open the door
          </Link>
        </div>
      </div>
    </div>
  );
}
