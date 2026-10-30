"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { CONSENT_COOKIE, CONSENT_EVENT, MEASUREMENT_COOKIES } from "@/lib/consent";
import { GA_MEASUREMENT_ID } from "@/lib/ga-server";

const YEAR_S = 365 * 24 * 60 * 60;
// full-screen play and teaching screens, pages framed on other sites, and the buying pages (on /pricing it covered
// the Lifetime price), where the banner would sit over the action
const HIDDEN_ON = ["/lessons/", "/admin", "/pricing", "/checkout", "/get-started"];

type GtagConsent = (cmd: "consent", action: "update", params: Record<string, "granted" | "denied">) => void;
type LhWindow = { gtag?: GtagConsent; __lhGaStart?: () => void };

/** The site-wide cookie notice: a plain banner in the bottom corner (full width on phones). */
export default function CookieScroll() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  }

  if (!open || HIDDEN_ON.some((p) => pathname?.startsWith(p))) return null;

  return (
    // Styled as an answer engine at work: the question typed into the hero's glowing search bar, a short answer
    // under the brand's spark, two choices. Dark in both themes (hero-media pins the dark tokens).
    <aside role="region" aria-label="Cookie notice" className="cookie-card hero-media">
      <p className="cookie-card-query">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        Does this site use cookies?
      </p>
      <h2 className="cookie-card-answer font-display text-xl text-sand-100">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="cookie-card-spark">
          <path d="M10 1.5c.9 5.6 2.9 7.6 8.5 8.5-5.6.9-7.6 2.9-8.5 8.5-.9-5.6-2.9-7.6-8.5-8.5 5.6-.9 7.6-2.9 8.5-8.5Z" />
        </svg>
        Short answer: yes, a few.
      </h2>
      <p className="font-body text-sm leading-relaxed text-sand-300 mt-2">
        Some keep you signed in. Others, from Google Analytics, show us which lessons actually get you cited.
        Accept them all, or keep only the ones the site needs.
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button type="button" onClick={() => choose("all")} className="cookie-card-accept">
          Accept all
        </button>
        <button type="button" onClick={() => choose("essential")} className="cookie-card-essential">
          Essentials only
        </button>
      </div>
    </aside>
  );
}
