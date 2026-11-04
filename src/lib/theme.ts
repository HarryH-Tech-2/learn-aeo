import { COOKIE_PREFIX } from "@/lib/site";

export type Theme = "dark" | "light";

/** Browser-chrome color (the <meta name="theme-color">): the brand navy, matching site.webmanifest. */
export const THEME_COLOR = "#04060d";

/** localStorage key for the toggle's saved choice. */
export const THEME_STORAGE_KEY = `${COOKIE_PREFIX}theme`;

/**
 * Decide the theme for this visit.
 * 1. An explicit choice saved by the toggle always wins.
 * 2. Otherwise dark, on every screen size (2026-11-04: phones used to start in light).
 */
export function resolveInitialTheme(stored: string | null): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

/**
 * Same rule as resolveInitialTheme, as a self-contained snippet for the
 * inline <head> script that runs before hydration (prevents theme flash).
 * Keep in sync with resolveInitialTheme.
 */
export const THEME_INIT_SCRIPT =
  `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');` +
  "if(t!=='light'&&t!=='dark'){t='dark'}" +
  // `js` lets globals.css hide scroll-reveal content only when scripts run.
  "var c=document.documentElement.classList;c.add('js');if(t==='light'){c.add('light')}else{c.remove('light')}" +
  // `anim-ready` a second after load: globals.css holds the infinite decorative animations (gold shimmer, card
  // shine, button sheen) still until then, so their per-frame repaints don't compete with loading and hydration.
  ";window.addEventListener('load',function(){setTimeout(function(){c.add('anim-ready')},1000)})}catch(e){}})()";
