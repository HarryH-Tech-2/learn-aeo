"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <aside
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold-500/30 bg-obsidian-light p-4 shadow-2xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md sm:rounded-2xl sm:border"
    >
      {/* styled as an answer engine's reply: the question, a short answer, one cited source */}
      <p className="font-body text-xs uppercase tracking-[0.18em] text-cyan">Does this site use cookies?</p>
      <h2 className="font-display text-xl text-sand-100 mt-1">Short answer: yes, a few.</h2>
      <p className="font-body text-sm leading-relaxed text-sand-300 mt-2">
        Some keep you signed in. Others, from Google Analytics, show us which lessons actually get you cited.
        Accept them all, or keep only the ones the site needs.
        <Link
          href="/privacy#cookies"
          className="ml-1 inline-flex items-center gap-1 rounded-full border border-cyan/40 px-2 py-0.5 align-middle text-xs text-cyan hover:border-cyan hover:text-cyan-300"
        >
          <span aria-hidden="true">[1]</span> What each one does
        </Link>
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => choose("all")}
          className="rounded-lg bg-gold-500 px-4 py-2 font-body text-sm font-semibold text-obsidian hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => choose("essential")}
          className="rounded-lg border border-sand-500/40 px-4 py-2 font-body text-sm font-medium text-sand-200 hover:border-cyan hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
        >
          Essentials only
        </button>
      </div>
    </aside>
  );
}
