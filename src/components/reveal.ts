import type { CSSProperties } from "react";

interface RevealOptions {
  /** Start offset in px (default 20 down). */
  y?: number;
  /** Horizontal start offset in px; implies y = 0 unless given. */
  x?: number;
  /** Duration in seconds (default 0.8). */
  dur?: number;
}

/**
 * Inline custom properties for a `.reveal` element inside an `<InView>`
 * container (see globals.css). Mirrors the old framer-motion calls:
 *   initial={{opacity:0, y:30}} transition={{duration:.8, delay:.1}}
 * becomes className="reveal" style={reveal(0.1, { y: 30 })}.
 * Plain module (no "use client") so server components can call it.
 */
export function reveal(delay = 0, { y, x, dur }: RevealOptions = {}): CSSProperties {
  const s: Record<string, string> = {};
  if (delay) s["--reveal-delay"] = `${delay}s`;
  if (x !== undefined) {
    s["--reveal-x"] = `${x}px`;
    s["--reveal-y"] = `${y ?? 0}px`;
  } else if (y !== undefined) {
    s["--reveal-y"] = `${y}px`;
  }
  if (dur !== undefined) s["--reveal-dur"] = `${dur}s`;
  return s as CSSProperties;
}
