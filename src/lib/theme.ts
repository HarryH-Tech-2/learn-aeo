export type Theme = "dark" | "light";

/** Viewports narrower than this (Tailwind `md`) default to light mode. */
export const MOBILE_MAX_WIDTH = 767;

/**
 * Decide the theme for this visit.
 * 1. An explicit choice saved by the toggle always wins.
 * 2. Otherwise phones get light mode, larger screens get dark.
 */
export function resolveInitialTheme(
  stored: string | null,
  viewportWidth: number
): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return viewportWidth <= MOBILE_MAX_WIDTH ? "light" : "dark";
}

/**
 * Same rule as resolveInitialTheme, as a self-contained snippet for the
 * inline <head> script that runs before hydration (prevents theme flash).
 * Keep in sync with resolveInitialTheme.
 */
export const THEME_INIT_SCRIPT =
  "(function(){try{var t=localStorage.getItem('theme');" +
  `if(t!=='light'&&t!=='dark'){t=window.innerWidth<=${MOBILE_MAX_WIDTH}?'light':'dark'}` +
  // `js` lets globals.css hide scroll-reveal content only when scripts run.
  "var c=document.documentElement.classList;c.add('js');if(t==='light'){c.add('light')}else{c.remove('light')}}catch(e){}})()";
