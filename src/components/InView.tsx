"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

interface InViewProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  /** IntersectionObserver rootMargin — same semantics as framer's `margin`. */
  margin?: string;
}

/**
 * Adds `is-inview` to its element the first time it scrolls into view, so
 * `.reveal` descendants fade/slide in via CSS (globals.css, `reveal()` in
 * reveal.ts). This replaces framer-motion's useInView + motion.* in the
 * homepage sections, which kept ~41 KB of framer-motion in the bundle that
 * every page pays for on first load.
 */
export default function InView({ children, margin = "-80px", ...rest }: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-inview");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-inview");
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
