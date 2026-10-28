"use client";

import { FIRST_LESSON_PATH, LESSON_CATALOG } from "@/lib/lesson-catalog";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { CSSProperties } from "react";
import { trackEvent } from "@/lib/analytics";
import { useAuthModal } from "@/components/AuthModal";
import CtaInside from "@/components/home/HeroCta";
import CityHero from "@/components/home/CityHero";

const FIRST_LESSON_MINUTES = LESSON_CATALOG[0].minutes;

/**
 * The homepage hero: the City of Answers scene (CityHero) behind a dark band (hero-media pins the dark tokens
 * in both themes, and the navbar floats over it from `lg` up). The copy sits low so the scene's cited source
 * rises above it, and is plain server HTML: the headline, one line on who the course is for, the free first
 * lesson and a second way in to the curriculum never wait on WebGL.
 */
export default function HeroSection() {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();

  return (
    <section className="city-hero hero-media relative flex flex-col justify-end overflow-hidden pt-24 pb-[9vh] bg-[#04060d]">
      {/* Background: navy with a cyan glow behind the headline and a faint gold one low down. Fixed colors,
          never theme-tinted, because the hero is dark in both themes. */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(111,227,255,0.14) 0%, rgba(111,227,255,0.05) 45%, transparent 75%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[60%]"
          style={{
            background:
              "radial-gradient(ellipse 120% 60% at 50% 100%, rgba(255,199,107,0.10) 0%, rgba(255,199,107,0.03) 40%, transparent 70%)",
          }}
        />
      </div>

      <CityHero />

      {/* Content */}
      <div className="city-hero-copy relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-body text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-400 mb-5">
          A course for marketers who know SEO
        </p>
        {/* Visible at first paint (no opacity fade): Chrome ignores opacity-0 text for LCP. */}
        <h1 className="hero-title font-display text-4xl sm:text-6xl md:text-7xl font-light leading-[1.02] mb-6 sm:mb-8 tracking-tight">
          <span className="text-sand-100">Learn answer engine</span> <span className="text-gradient-gold font-medium">optimization</span>
        </h1>

        <p
          className="enter-up hero-subtitle font-body text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-normal"
          style={{ "--enter-delay": "0.2s" } as CSSProperties}
        >
          See how ChatGPT, Perplexity and Google AI Overviews choose the sources they cite, then work on the pages,
          crawler rules and passages that decide whether one of them is yours.
        </p>

        <div
          className="enter-up flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          style={{ "--enter-delay": "0.4s" } as CSSProperties}
        >
          {session ? (
            <Link href="/dashboard" className="hero-cta">
              <CtaInside label="Continue the course" sub="Pick up where you left off" />
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
              <CtaInside label="Start lesson 1" sub={`Free · ${FIRST_LESSON_MINUTES} minutes · no card needed`} />
            </button>
          )}
          <a
            href="#lessons"
            className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 px-6 py-3 font-body text-sm sm:text-base font-semibold text-sand-100 hover:border-gold-400 hover:text-gold-400 transition-colors"
          >
            See the curriculum
            <span aria-hidden="true">&darr;</span>
          </a>
        </div>
      </div>

      {/* Bottom fade into the page background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--hero-fade)] to-transparent" />
    </section>
  );
}
