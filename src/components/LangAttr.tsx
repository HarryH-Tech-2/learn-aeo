"use client";

import { useEffect } from "react";

/**
 * Sets <html lang> on a translated page. The root layout renders lang="en" for every page (one root layout keeps
 * the site static), so translated pages also wrap their content in an element with the right lang, which is what
 * crawlers and screen readers read; this fixes the document's own attribute after hydration.
 */
export default function LangAttr({ lang }: { lang: string }) {
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = lang;
    return () => {
      html.lang = previous;
    };
  }, [lang]);
  return null;
}
