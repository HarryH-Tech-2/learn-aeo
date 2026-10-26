"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";

/**
 * A link out of a translated tool page, counted as translated_cta_click with the page's locale and where it
 * goes (translator | keyboard | alphabet | lesson), so the French and Spanish test can be read in GA4.
 */
export default function TranslatedCtaLink({
  href,
  locale,
  target,
  location = "alphabet",
  className,
  hrefLang,
  children,
}: {
  href: string;
  locale: Locale;
  target: string;
  /** Which page the link is on; GA4 location param. */
  location?: string;
  className?: string;
  hrefLang?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      hrefLang={hrefLang}
      className={className}
      onClick={() => trackEvent("translated_cta_click", { locale, target, location })}
    >
      {children}
    </Link>
  );
}
