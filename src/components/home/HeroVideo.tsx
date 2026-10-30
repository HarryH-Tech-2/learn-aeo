"use client";

import { useEffect, useRef, useState } from "react";
import { heroMode, typedQuestion } from "./hero-mode";

const QUESTION = "How do I get cited by ChatGPT?";
const TYPE_MS = 55;
const TYPE_DELAY_MS = 700;
/** pause between the gate finishing opening and the search bar's button lighting */
const FIND_DELAY_MS = 450;

/** The gate closed (the intro's first frame) and open (its last, and the loop's first and last). */
const STILL_CLOSED = "/hero/gate-closed.webp";
const STILL_OPEN = "/hero/gate-open.webp";

/**
 * The Gate behind the homepage hero copy, two silent videos made on Higgsfield. The intro (public/hero/gate.*,
 * closed-gate and open-gate stills as first and last frames) plays once: a glowing gateway opens onto an AI answer
 * engine citing its sources, and the waiting crowd walks through to learn. Then the loop (public/hero/gate-loop.*, loaded once the intro starts playing,
 * the open-gate still as first and last frame, the seam cross-faded) takes over: people keep walking in and light
 * keeps flowing from the pages into the answer, which cites one gold page as source [1]. The loop sits preloaded under the intro and starts the moment the
 * intro ends, so the hand-off has no cut. The glowing search bar types its question over the intro and sits just
 * above the answer panel inside the gate; once the gate is open its button lights. The poster is the
 * closed gate, so the hero looks finished before the video loads and without JavaScript; with reduced motion or
 * Save-Data (or if the video can't play) the open gate shows as a still with the source already found. The videos
 * pause off-screen and in a hidden tab.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState(QUESTION.length);
  const [found, setFound] = useState(false);
  // true once the open gate shows as a still: the sources come out so the poster, not a video frame, is drawn
  const [still, setStill] = useState(false);
  // the intro has ended and the loop is playing under it: the intro fades out
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const loop = loopRef.current;
    if (!video || !loop) return;
    const mode = heroMode({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      saveData: !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    });
    const showOpen = () => {
      setStill(true);
      setFound(true);
    };
    if (mode === "still") {
      showOpen();
      return;
    }

    let find: number | undefined;
    // the gate is open: start the loop under the intro's last frame (they match), then let the agent find the source
    let current = video;
    const onEnded = () => {
      current = loop;
      sync();
      find = window.setTimeout(() => setFound(true), FIND_DELAY_MS);
    };
    const onLoopPlaying = () => setLooping(true);
    // the loop only loads once the intro is playing, so its bytes don't compete with the first paint
    const warmLoop = () => {
      loop.preload = "auto";
      loop.load();
    };
    video.addEventListener("playing", warmLoop, { once: true });
    video.addEventListener("ended", onEnded);
    loop.addEventListener("playing", onLoopPlaying);

    let onScreen = true;
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") void current.play().catch(showOpen);
      else current.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(video);
    document.addEventListener("visibilitychange", sync);
    sync();

    // the question types once, after the first paint (the server HTML carries it in full), while the gate opens
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
      video.removeEventListener("playing", warmLoop);
      video.removeEventListener("ended", onEnded);
      loop.removeEventListener("playing", onLoopPlaying);
      document.removeEventListener("visibilitychange", sync);
      window.clearTimeout(start);
      window.clearInterval(tick);
      window.clearTimeout(find);
      video.pause();
      loop.pause();
    };
  }, []);

  // drop the loaded videos so the open-gate poster shows
  useEffect(() => {
    if (!still) return;
    videoRef.current?.load();
    loopRef.current?.load();
  }, [still]);

  const typing = step < QUESTION.length;

  return (
    <>
      <video
        ref={loopRef}
        className="city-hero-canvas city-hero-video"
        aria-hidden="true"
        muted
        loop
        playsInline
        preload="none"
        poster={STILL_OPEN}
      >
        {!still && <source src="/hero/gate-loop.webm" type="video/webm" />}
        {!still && <source src="/hero/gate-loop.mp4" type="video/mp4" />}
      </video>
      <video
        ref={videoRef}
        className="city-hero-canvas city-hero-video city-hero-intro"
        data-done={still || looping || undefined}
        aria-hidden="true"
        muted
        playsInline
        preload="auto"
        poster={STILL_CLOSED}
      >
        {!still && <source src="/hero/gate.webm" type="video/webm" />}
        {!still && <source src="/hero/gate.mp4" type="video/mp4" />}
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
