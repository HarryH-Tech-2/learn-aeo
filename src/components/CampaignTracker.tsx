"use client";

/**
 * Where a visitor came from, kept in our own cookies so a sign-up or sale has a source even when Google
 * Analytics is blocked:
 * - On a landing from a tagged marketing link (?utm_source=…): remember the campaign for 30 days in the aeo_utm
 *   cookie (read by auth.ts when the account is created) and record the visit once per browser per campaign.
 *   See src/lib/campaign.ts.
 * - On a first visit: the referring site's host and the landing page in aeo_ref for 90 days (src/lib/referrer.ts).
 *
 * Only once measurement is allowed (src/lib/consent.ts): straight away outside the UK/EU, after "Accept all"
 * there. The landing is read on the first render, so a visitor who accepts on a later page still counts.
 * Runs after hydration, so link-preview bots that never run scripts are not counted.
 */
import { useEffect } from "react";
import { CAMPAIGN_COOKIE, CAMPAIGN_COOKIE_DAYS, VISITOR_COOKIE, campaignFromSearch, encodeCampaign, validVisitorId } from "@/lib/campaign";
import { REFERRER_COOKIE, REFERRER_COOKIE_DAYS, encodeReferrer, landingPath, referrerHost } from "@/lib/referrer";
import { CONSENT_EVENT, analyticsAllowedInBrowser } from "@/lib/consent";

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${days * 86400}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

export default function CampaignTracker() {
  useEffect(() => {
    // the landing as it was, before any client-side navigation changes the address
    const search = window.location.search;
    const path = window.location.pathname;
    const host = referrerHost(document.referrer, window.location.hostname);

    const record = () => {
      if (host && !readCookie(REFERRER_COOKIE)) {
        writeCookie(REFERRER_COOKIE, encodeReferrer({ host, landing: landingPath(path) }), REFERRER_COOKIE_DAYS);
      }
      const c = campaignFromSearch(search);
      if (!c) return;
      writeCookie(CAMPAIGN_COOKIE, encodeCampaign(c), CAMPAIGN_COOKIE_DAYS);
      let vid = validVisitorId(readCookie(VISITOR_COOKIE));
      if (!vid) {
        vid = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
        writeCookie(VISITOR_COOKIE, vid, 365);
      }
      void fetch("/api/campaign-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: vid, search, path }),
        keepalive: true,
      }).catch(() => {});
    };

    if (analyticsAllowedInBrowser()) {
      record();
      return;
    }
    const onConsent = (e: Event) => {
      if ((e as CustomEvent).detail === "all") record();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);
  return null;
}
