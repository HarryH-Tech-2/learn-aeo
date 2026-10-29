"use client";

import { useEffect, useRef, useState } from "react";
import { coverPoint, heroMode, typedQuestion } from "./hero-mode";

const QUESTION = "How do I get cited by ChatGPT?";
const TYPE_MS = 55;
const TYPE_DELAY_MS = 700;
/** pause between the question finishing and the agent finding the source */
const FIND_DELAY_MS = 450;

// The loop's frame and the gold tower in it (measured on the poster: it drifts at most 4% of the height as the
// camera breathes, so the reticle is a little taller than the tower). object-position matches .city-hero-video.
const VIDEO = { width: 1920, height: 1080 };
const TOWER = { x: 0.49, y: 0.355 };
const TOWER_BOX = { width: 0.06, height: 0.14 };
const VIDEO_POSITION = { x: 0.5, y: 0.4 };

type Target = { x: number; y: number; w: number; h: number; beamTop: number };

/**
 * The City of Answers behind the homepage hero copy: a silent 7.5-second loop (public/hero/city-loop.*, made on
 * Higgsfield from one still so the first and last frames match) with the glowing search bar typing its question
 * over it. When the question is typed, an agent's beam drops from the search bar, a reticle locks onto the gold
 * tower and tags it as the cited source. The poster is the loop's first frame, so the hero looks finished before
 * the video loads and without JavaScript; with reduced motion or Save-Data the video never plays and the found
 * state shows at once. The video pauses off-screen and in a hidden tab.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(QUESTION.length);
  const [found, setFound] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);

  // keep the reticle on the tower as the box resizes (the video is cropped differently at each shape)
  useEffect(() => {
    const video = videoRef.current;
    const search = searchRef.current;
    if (!video || !search) return;
    const place = () => {
      const box = { width: video.clientWidth, height: video.clientHeight };
      const c = coverPoint(box, VIDEO, TOWER, VIDEO_POSITION);
      const scale = Math.max(box.width / VIDEO.width, box.height / VIDEO.height);
      setTarget({
        x: c.x,
        y: c.y,
        w: TOWER_BOX.width * VIDEO.width * scale,
        h: TOWER_BOX.height * VIDEO.height * scale,
        beamTop: search.offsetTop + search.offsetHeight,
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(video);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const mode = heroMode({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      saveData: !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    });
    if (mode === "still") {
      setFound(true);
      return;
    }

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

    // the question types once, after the first paint (the server HTML carries it in full), then the agent finds it
    setStep(0);
    let n = 0;
    let tick: number | undefined;
    let find: number | undefined;
    const start = window.setTimeout(() => {
      tick = window.setInterval(() => {
        n += 1;
        setStep(n);
        if (n >= QUESTION.length) {
          window.clearInterval(tick);
          find = window.setTimeout(() => setFound(true), FIND_DELAY_MS);
        }
      }, TYPE_MS);
    }, TYPE_DELAY_MS);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.clearTimeout(start);
      window.clearInterval(tick);
      window.clearTimeout(find);
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

      {target && (
        <div className="city-hero-agent" data-found={found} aria-hidden="true">
          <span
            className="city-hero-beam"
            style={{ left: target.x, top: target.beamTop, height: Math.max(0, target.y - target.h / 2 - target.beamTop) }}
          />
          <span className="city-hero-flare" style={{ left: target.x, top: target.y, width: target.h * 1.6, height: target.h * 1.6 }} />
          <span
            className="city-hero-reticle"
            style={{ left: target.x, top: target.y, width: target.w, height: target.h }}
          >
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="city-hero-tag" style={{ left: target.x + target.w / 2 + 10, top: target.y - target.h / 2 }}>
            <b>[1]</b> Cited source
          </span>
        </div>
      )}

      <div ref={searchRef} className="city-hero-search" aria-hidden="true">
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
        <span className="city-hero-search-go" data-found={found}>
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
