"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { trackEvent } from "@/lib/analytics";
import { CONSENT_COOKIE, CONSENT_EVENT, MEASUREMENT_COOKIES } from "@/lib/consent";
import { GA_MEASUREMENT_ID } from "@/lib/ga-server";

const YEAR_S = 365 * 24 * 60 * 60;
// "cookies" spelled in the hieroglyphic alphabet, along the top of the sheet, one sign at a time so they can light up in turn
const COOKIES_GLYPHS = transliterateName("cookies").map((r) => r.mapping.glyph);

// full-screen play and teaching screens, pages framed on other sites, and the buying pages (on /pricing it covered
// the Lifetime price), where the scroll would sit over the action
const HIDDEN_ON = ["/lessons/", "/admin", "/pricing", "/checkout", "/get-started"];

type GtagConsent = (cmd: "consent", action: "update", params: Record<string, "granted" | "denied">) => void;
type LhWindow = { gtag?: GtagConsent; __lhGaStart?: () => void };

/**
 * The site-wide cookie notice: a papyrus scroll that unrolls in the bottom corner. The heading is in red,
 * as scribes wrote headings (rubrics) in red ink, and 𓊵, the offering loaf on its mat, stands in for a cookie.
 * On hover, the light of Ra sweeps across the sheet and the signs along the top are gilded one by one.
 */
export default function CookieScroll() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (new RegExp(`(?:^|; )${CONSENT_COOKIE}=`).test(document.cookie)) return;
    // after the hero has painted, so it never competes with the first view
    const t = window.setTimeout(() => setOpen(true), 1400);
    return () => window.clearTimeout(t);
  }, []);

  function choose(choice: "all" | "essential") {
    document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; max-age=${YEAR_S}; SameSite=Lax`;
    const w = window as unknown as LhWindow;
    const value = choice === "all" ? "granted" : "denied";
    w.gtag?.("consent", "update", { analytics_storage: value, ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    // Analytics starts now if it wasn't running (UK/EU visitors, src/lib/consent.ts). If gtag hasn't loaded
    // yet, its init script reads the cookie and starts itself.
    if (choice === "all") {
      w.__lhGaStart?.();
      trackEvent("cookie_choice", { choice });
    } else {
      // stops a visitor elsewhere who was being measured until now; without this gtag keeps sending cookieless hits
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
      // and our own source-tracking cookies go too (src/lib/consent.ts)
      for (const name of MEASUREMENT_COOKIES) document.cookie = `${name}=; Max-Age=0; Path=/`;
    }
    // CampaignTracker waits on this when a UK/EU visitor lands before choosing
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
    setClosing(true);
    window.setTimeout(() => setOpen(false), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650);
  }

  if (!open || HIDDEN_ON.some((p) => pathname?.startsWith(p))) return null;

  return (
    <aside className="cookie-scroll" role="region" aria-label="Cookie notice" data-closing={closing || undefined}>
      <div className="cookie-rod" aria-hidden="true" />
      <div className="cookie-sheet px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-5">
        <p className="cookie-glyph-row text-lg text-center select-none" aria-hidden="true">
          {COOKIES_GLYPHS.map((glyph, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>
              {glyph}
            </span>
          ))}
        </p>
        <div className="cookie-text mt-2">
          <h2 className="cookie-heading font-display text-lg sm:text-xl font-semibold flex items-center gap-2">
            <span className="cookie-loaf text-3xl leading-none" aria-hidden="true">
              𓊵
            </span>
            An offering of cookies
          </h2>
          <p className="cookie-body font-body text-sm sm:text-[0.95rem] leading-relaxed mt-2">
            Some keep you signed in. Others, from Google Analytics, show us which lessons help. Accept them all, or keep only the ones the site needs.{" "}
            <Link href="/privacy#cookies">What each one does</Link>
          </p>
          <div className="cookie-actions flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 sm:mt-4">
            <button type="button" className="cookie-accept" onClick={() => choose("all")}>
              <span className="cookie-accept-seal" aria-hidden="true">
                𓊵
              </span>
              Accept all
            </button>
            <button type="button" className="cookie-decline" onClick={() => choose("essential")}>
              Essentials only
            </button>
          </div>
        </div>
      </div>
      <div className="cookie-rod" aria-hidden="true" />
    </aside>
  );
}
