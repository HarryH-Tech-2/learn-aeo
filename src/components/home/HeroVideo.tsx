"use client";

import { useEffect, useRef, useState } from "react";
import { heroMode, typedQuestion } from "./hero-mode";

const QUESTION = "How do I get cited by ChatGPT?";
const TYPE_MS = 55;
const TYPE_DELAY_MS = 700;

/**
 * The City of Answers behind the homepage hero copy: a silent 8-second loop (public/hero/city-loop.*, made on
 * Higgsfield from one still so the first and last frames match) with the glowing search bar typing its question
 * over it. The poster is that still, so the hero looks finished before the video loads, without JavaScript, and
 * for reduced motion or Save-Data (where the video never plays and the question shows in full). The video
 * pauses off-screen and in a hidden tab.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState(QUESTION.length);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const mode = heroMode({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      saveData: !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    });
    if (mode === "still") return;

    let onScreen = true;
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") void video.play().catch(() => {});
      else video.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(video);
    document.addEventListener("visibilitychange", sync);
    sync();

    // the question types once, after the first paint; the server HTML carries it in full
    setStep(0);
    let n = 0;
    let tick: number | undefined;
    const start = window.setTimeout(() => {
      tick = window.setInterval(() => {
        n += 1;
        setStep(n);
        if (n >= QUESTION.length) window.clearInterval(tick);
      }, TYPE_MS);
    }, TYPE_DELAY_MS);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.clearTimeout(start);
      window.clearInterval(tick);
      video.pause();
    };
  }, []);

  const typing = step < QUESTION.length;

  return (
    <>
      <video
        ref={videoRef}
        className="city-hero-canvas city-hero-video"
        aria-hidden="true"
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero/city-poster.webp"
      >
        <source src="/hero/city-loop.webm" type="video/webm" />
        <source src="/hero/city-loop.mp4" type="video/mp4" />
      </video>
      <div className="city-hero-vignette" aria-hidden="true" />
      <div className="city-hero-search" aria-hidden="true">
        <span className="city-hero-search-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="city-hero-search-text">
          {typedQuestion(QUESTION, step)}
          <span className={typing ? "city-hero-caret" : "city-hero-caret city-hero-caret-blink"} />
        </span>
        <span className="city-hero-search-go">
          <svg viewBox="0 0 16 16">
            <path
              d="M8 13V3M3.8 7.2 8 3l4.2 4.2"
              fill="none"
              stroke="#04060d"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </>
  );
}
