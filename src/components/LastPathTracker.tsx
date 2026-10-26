"use client";

import { useEffect } from "react";
import { COOKIE_PREFIX } from "@/lib/site";
import { usePathname } from "next/navigation";

/** sessionStorage key for the last page visited before /checkout (read by src/app/checkout/CheckoutContent.tsx). */
export const LAST_PATH_KEY = `${COOKIE_PREFIX}last_path`;

/**
 * Remembers the page the visitor is on, so Stripe's own Back link can return them there. The upgrade buttons open
 * /checkout with client-side navigation, which leaves document.referrer pointing at wherever the visit began.
 */
export default function LastPathTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/checkout")) return;
    try {
      sessionStorage.setItem(LAST_PATH_KEY, pathname + window.location.search);
    } catch {
      /* storage blocked: checkout falls back to the referrer */
    }
  }, [pathname]);
  return null;
}
