"use client";

/**
 * The site-wide background: a slow drifting network of dots, joined by faint lines when they come close,
 * which leans gently toward the pointer. One fixed 2D canvas behind the page (no library).
 *
 * Kept cheap on purpose: it starts when the browser is idle, the dot count scales with the viewport (fewer on
 * phones), the frame loop stops while the tab is hidden, and with "reduce motion" it draws one still frame.
 */
import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; vx: number; vy: number; r: number; gold: boolean };

const LINK = 140; // px: dots closer than this are joined
const POINTER = 180; // px: the pointer's reach

/** Dots for a viewport: about one per 22,000 px², between 18 and 80. */
export function dotCount(width: number, height: number): number {
  return Math.max(18, Math.min(80, Math.round((width * height) / 22000)));
}

const PALETTE = {
  dark: { dot: "111, 227, 255", gold: "255, 214, 130", alpha: 0.55 },
  light: { dot: "29, 78, 160", gold: "180, 120, 20", alpha: 0.4 },
};

export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    let frame = 0;
    let running = false;
    let colors = PALETTE.dark;
    const pointer = { x: -9999, y: -9999 };

    const readTheme = () => {
      colors = document.documentElement.classList.contains("light") ? PALETTE.light : PALETTE.dark;
    };

    const seed = () => {
      const n = dotCount(w, h);
      dots = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1 + Math.random() * 1.6,
        gold: i % 9 === 0,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (still) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const t = 1 - Math.sqrt(d2) / LINK;
          ctx.strokeStyle = `rgba(${colors.dot}, ${(t * 0.22 * colors.alpha * 2).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        // a brighter thread from the pointer to the dots near it
        const px = a.x - pointer.x;
        const py = a.y - pointer.y;
        const pd2 = px * px + py * py;
        if (pd2 < POINTER * POINTER) {
          const t = 1 - Math.sqrt(pd2) / POINTER;
          ctx.strokeStyle = `rgba(${colors.dot}, ${(t * 0.35).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${a.gold ? colors.gold : colors.dot}, ${colors.alpha})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const d of dots) {
        const px = pointer.x - d.x;
        const py = pointer.y - d.y;
        const pd2 = px * px + py * py;
        if (pd2 < POINTER * POINTER && pd2 > 1) {
          // lean toward the pointer, then let the drift carry on
          d.vx += (px / Math.sqrt(pd2)) * 0.004;
          d.vy += (py / Math.sqrt(pd2)) * 0.004;
        }
        const speed = Math.hypot(d.vx, d.vy);
        if (speed > 0.5) {
          d.vx *= 0.5 / speed;
          d.vy *= 0.5 / speed;
        }
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -20) d.x = w + 20;
        else if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        else if (d.y > h + 20) d.y = -20;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || still || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const themeWatch = new MutationObserver(() => {
      readTheme();
      if (still) draw();
    });

    let idle = 0;
    const boot = () => {
      readTheme();
      resize();
      themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      canvas.style.opacity = "1";
      start();
    };
    // after first paint and hydration, so the canvas never competes with the page for the main thread
    const hasIdle = typeof window.requestIdleCallback === "function"; // not in Safari
    if (hasIdle) idle = window.requestIdleCallback(boot, { timeout: 2000 });
    else idle = window.setTimeout(boot, 600);

    return () => {
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      stop();
      themeWatch.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="particle-field" />;
}
