"use client";

import { FIRST_LESSON_PATH, LESSON_CATALOG, TOTAL_MINUTES } from "@/lib/lesson-catalog";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { CSSProperties } from "react";
import { trackEvent } from "@/lib/analytics";
import { useAuthModal } from "@/components/AuthModal";
import HeroAnswer from "@/components/home/HeroAnswer";
import HeroBackdrop from "@/components/home/HeroBackdrop";

/** Course facts under the buttons, all from the catalog. */
const FACTS = [
  `${LESSON_CATALOG.length} lessons`,
  `About ${Math.round(TOTAL_MINUTES / 60)} hours`,
  "Certificate on completion",
  "Lesson 1 is free",
];

/**
 * The homepage hero: a dark band in both themes (hero-media pins the dark tokens, and the navbar floats over it
 * from `lg` up). A looping abstract clip plays behind it (HeroBackdrop). Copy on the left, a mock cited AI answer
 * (HeroAnswer) on the right; stacked on small screens. The copy is plain server HTML: the headline, who the course is for, the free first lesson and the way in to the
 * curriculum never wait on JavaScript.
 */
export default function HeroSection() {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();

  return (
    <section className="home-hero hero-media relative overflow-hidden bg-[#04060d]">
      <HeroBackdrop />

      <div className="home-hero-grid relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="home-hero-copy">
          <p className="font-body text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-400 mb-5">
            An AEO course for marketers who know SEO
          </p>
          {/* Visible at first paint (no opacity fade): Chrome ignores opacity-0 text for LCP. */}
          <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] mb-6 tracking-tight">
            <span className="text-sand-100">Learn answer engine</span>{" "}
            <span className="text-gradient-gold font-medium">optimization</span>
          </h1>

          <p
            className="enter-up hero-subtitle font-body text-base sm:text-lg md:text-xl max-w-xl mb-8 leading-relaxed font-normal"
            style={{ "--enter-delay": "0.15s" } as CSSProperties}
          >
            See how ChatGPT, Perplexity and Google AI Overviews choose the sources they cite, then work on the pages,
            crawler rules and passages that decide whether one of them is yours.
          </p>

          <div
            className="enter-up home-hero-actions flex flex-col sm:flex-row items-center gap-4 sm:gap-5"
            style={{ "--enter-delay": "0.3s" } as CSSProperties}
          >
            {session ? (
              <Link href="/dashboard" className="hero-cta">
                <span className="hero-cta-label">Continue the course</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  trackEvent("free_lesson_cta", { location: "hero" });
                  openAuthModal({ next: FIRST_LESSON_PATH });
                }}
                className="hero-cta"
              >
                <span className="hero-cta-label">Start lesson 1</span>
              </button>
            )}
            <a
              href="#lessons"
              className="hero-cta-secondary"
            >
              See the curriculum
            </a>
          </div>

          <ul className="enter-up home-hero-facts" style={{ "--enter-delay": "0.45s" } as CSSProperties}>
            {FACTS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="enter-up home-hero-visual" style={{ "--enter-delay": "0.25s" } as CSSProperties}>
          <HeroAnswer />
        </div>
      </div>

      {/* The foot of the hero: an eased fade into the page background, in either theme (.home-hero-fade). */}
      <div className="home-hero-fade" aria-hidden="true" />
    </section>
  );
}
