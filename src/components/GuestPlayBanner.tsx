"use client";

/**
 * The invitation on blog posts, the name translator, the alphabet chart and the keyboard that sends a
 * visitor into Lesson 1 without an account (see src/lib/guest-play.ts for why, and for the events
 * that follow the click). Since 1 Oct 2026 it opens the written lesson (name on a sealed door, then
 * the alphabet through real words).
 *
 * Translator and alphabet: one slim strip, so the page under it keeps its place.
 * Blog posts (under the quick answer) and the translator: a split card, the lesson's own dig-site picture (the sealed door
 * under the cliff) on the left and the offer on the right. Only the gold button is the link.
 * Hieroglyphs float up over the picture and the button pulses (`gp-*` keyframes in globals.css,
 * off under prefers-reduced-motion).
 *
 * GA4: guest_play_banner_view once per page view when half the card has been seen, and
 * guest_play_banner_click. Both carry location and question_type ("card" | "strip", a registered
 * dimension, so the two designs can be compared), and the page path says which post.
 *
 * Signed-in learners do not see it: they have the dashboard.
 */
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { guestPlayHref } from "@/lib/guest-play";

type Props = {
  location: "blog" | "translator" | "alphabet" | "keyboard" | "sign_meaning" | "numerals";
  /** the name typed, carried into the lesson's sealed door */
  name?: string;
  /** below the first screen (blog posts, under the quick answer): the picture loads lazily so it never competes with the page's own hero image */
  lazy?: boolean;
};

const SCENE_SRC = "/og-default.png";
const SCENE_ALT =
  "Learn AEO: Lesson 1 is free";

/** Hieroglyphs that drift up through the picture: eye of Horus, ankh, owl, scarab. */
const DRIFTING_GLYPHS: {
  glyph: string;
  left: string;
  size: string;
  delay: string;
}[] = [
  { glyph: "𓂀", left: "12%", size: "text-2xl", delay: "0s" },
  { glyph: "𓋹", left: "38%", size: "text-xl", delay: "2.1s" },
  { glyph: "𓅓", left: "62%", size: "text-3xl", delay: "4.3s" },
  { glyph: "𓆣", left: "82%", size: "text-lg", delay: "6.2s" },
];

export default function GuestPlayBanner({ location, name, lazy = false }: Props) {
  const { status } = useSession();
  const cardRef = useRef<HTMLElement>(null);
  const variant = location === "alphabet" ? "strip" : "card";

  // One view event per page view, once half of the banner has actually been on screen.
  useEffect(() => {
    if (status === "authenticated") return;
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          trackEvent("guest_play_banner_view", {
            location,
            question_type: variant,
          });
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [location, status, variant]);

  if (status === "authenticated") return null;
  const typed = (name ?? "").trim();
  const href = guestPlayHref(typed);
  const onClick = () =>
    trackEvent("guest_play_banner_click", {
      location,
      named: typed ? 1 : 0,
      question_type: variant,
    });

  if (variant === "card") {
    return (
      <div
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className="mb-8 flex flex-col overflow-hidden border border-gold-600/50 bg-gold-500/10 sm:flex-row"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#3a2410] sm:aspect-auto sm:w-1/2">
          <Image
            src={SCENE_SRC}
            alt={SCENE_ALT}
            fill
            priority={!lazy}
            fetchPriority={lazy ? "auto" : "high"}
            sizes="(min-width: 640px) 480px, 100vw"
            className="object-cover object-[35%_50%]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden font-display text-gold-300"
          >
            {DRIFTING_GLYPHS.map((g) => (
              <span
                key={g.glyph}
                className={`gp-glyph absolute bottom-0 ${g.size}`}
                style={{ left: g.left, animationDelay: g.delay }}
              >
                {g.glyph}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1.5 p-6 sm:p-8">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">
            Free first lesson
          </span>
          <p className="font-display text-2xl leading-tight text-sand-100 sm:text-3xl">
            {typed ? `Uncover ${typed} on a sealed door` : "Find your name on a sealed door"}
          </p>
          <p className="font-body text-sm leading-snug text-sand-300 sm:text-base">
            Brush the sand off a buried lintel and read {typed || "your name"} in
            hieroglyphs, then meet the rest of the 25-sign alphabet through real
            Egyptian words. Three short sections, about ten minutes each.
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <Link
              href={href}
              onClick={onClick}
              className="gp-ring inline-flex shrink-0 cursor-pointer items-center gap-2 bg-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-black shadow-lg transition-colors hover:bg-gold-400"
            >
              Start Lesson 1 free
            </Link>
            <span className="font-body text-xs text-sand-400">
              No sign-up to start
            </span>
          </div>
        </div>
      </div>
    );
  }

  const message =
    location === "translator"
      ? typed
        ? `Now uncover ${typed} on a sealed temple door, one hieroglyph at a time.`
        : "Seen your name? Now uncover it on a sealed temple door, one hieroglyph at a time."
      : "Learn these signs by using them: uncover your name on a sealed door, then read real Egyptian words with the rest.";
  return (
    <Link
      ref={cardRef as React.RefObject<HTMLAnchorElement>}
      href={href}
      onClick={onClick}
      className="group mb-8 flex flex-col gap-1 border border-gold-600/50 bg-gold-500/10 px-4 py-3 transition-colors hover:border-gold-400 hover:bg-gold-500/15 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <span className="font-body text-sm leading-snug text-sand-100">
        <span className="mr-2 font-semibold uppercase tracking-[0.18em] text-xs text-gold-400">
          New
        </span>
        {message}
      </span>
      <span className="shrink-0 font-body text-sm font-semibold text-gold-400 group-hover:text-gold-300">
        Start Lesson 1 free, no sign-up
      </span>
    </Link>
  );
}
