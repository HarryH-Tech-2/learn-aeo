"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { resolveInitialTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Same rule as the inline <head> script (saved choice, else light on
    // phones / dark on larger screens) so hydration never flips the theme.
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {}
    const initial = resolveInitialTheme(stored, window.innerWidth);
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  // Pending removal of .theme-transitioning — reset on rapid toggles so the
  // class isn't yanked mid-fade by an earlier timeout.
  const fadeTimeout = useRef<number | null>(null);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}

    const root = document.documentElement;
    const apply = () => {
      root.classList.toggle("light", next === "light");
      setTheme(next);
    };

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      apply();
      return;
    }

    // Transition colour properties on everything for the duration of the
    // switch, then remove the class so it never taxes normal renders. (Not
    // startViewTransition — its snapshot freezes the hero video, see CSS.)
    if (fadeTimeout.current !== null) window.clearTimeout(fadeTimeout.current);
    root.classList.add("theme-transitioning");
    apply();
    fadeTimeout.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      fadeTimeout.current = null;
    }, 350);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
