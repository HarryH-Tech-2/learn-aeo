"use client";

import { useEffect, useRef, useState } from "react";
import { heroMode, type HeroMode } from "./hero-mode";
import type { CityScene } from "./city-scene";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The City of Answers scene behind the homepage hero copy. The canvas is empty in the server
 * HTML; after first paint the scene module (and `three` with it) loads with a dynamic import.
 * It pauses off-screen and in a hidden tab, and is disposed on unmount. Without WebGL nothing
 * draws and the section's gradient shows; with reduced motion or Save-Data it draws one still frame.
 */
export default function CityHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CityScene | null>(null);
  const [mode, setMode] = useState<HeroMode | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const m = heroMode({
      webgl: hasWebGL(),
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      saveData: !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    });
    setMode(m);
    if (m === "none") return;

    let canceled = false;
    let onScreen = true;
    const sync = () => sceneRef.current?.setActive(onScreen && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    import("./city-scene")
      .then(({ startCityScene }) => {
        if (canceled) return;
        sceneRef.current = startCityScene(canvas, { mode: m, onReveal: () => setRevealed(true), flash: flashRef.current });
        sync();
      })
      .catch(() => setMode("none"));

    return () => {
      canceled = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="city-hero-canvas"
        aria-hidden="true"
        style={{ opacity: mode === null || mode === "none" ? 0 : 1 }}
      />
      <div ref={flashRef} className="city-hero-flash" aria-hidden="true" />
      <div className="city-hero-vignette" aria-hidden="true" />
      {mode === "animate" && revealed && (
        <button
          type="button"
          onClick={() => sceneRef.current?.replay()}
          className="city-hero-replay"
        >
          Replay intro
        </button>
      )}
    </>
  );
}
