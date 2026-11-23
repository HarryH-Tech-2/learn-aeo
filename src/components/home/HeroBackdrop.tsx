"use client";

import { useEffect, useRef, useState } from "react";

const POSTER = "/hero/flow-poster.webp";

/** Only matched when motion is wanted, so a reduced-motion visitor never downloads the clip. */
const MOTION = "(prefers-reduced-motion: no-preference)";

/**
 * The moving background of the homepage hero: a silent, looping abstract clip (light trails flowing between
 * floating page cards, made on Higgsfield; public/hero/flow.*) under a dark scrim so the copy stays readable.
 * The poster is the clip's first frame, so the hero looks finished before the video loads and without
 * JavaScript. The sources and autoplay are in the server HTML, so the clip starts as soon as the browser has it
 * rather than waiting for hydration. With reduced motion the sources never match and only the poster shows;
 * with Save-Data the download is dropped once the script runs. The video pauses off-screen and in a hidden tab.
 */
export default function HeroBackdrop() {
  const ref = useRef<HTMLVideoElement>(null);
  // true until we learn the visitor wants a still (Save-Data) or the clip can't play
  const [play, setPlay] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) {
      setPlay(false);
      return;
    }
    if (!window.matchMedia(MOTION).matches) return;
    let onScreen = true;
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") void video.play().catch(() => setPlay(false));
      else video.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, []);

  // Save-Data or a failed play: the sources are gone, so reload to drop the download and show the poster
  useEffect(() => {
    if (!play) ref.current?.load();
  }, [play]);

  return (
    <div className="home-hero-backdrop" aria-hidden="true">
      <video ref={ref} className="home-hero-video" muted loop playsInline autoPlay={play} preload="auto" poster={POSTER}>
        {play && <source src="/hero/flow.webm" type="video/webm" media={MOTION} />}
        {play && <source src="/hero/flow.mp4" type="video/mp4" media={MOTION} />}
      </video>
      <div className="home-hero-glow" />
      <div className="home-hero-scrim" />
    </div>
  );
}
