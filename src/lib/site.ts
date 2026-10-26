// Single source of truth for site identity: name, domain, contact, analytics id.
// Everything that needs the site's URL or brand name imports from here, so the
// domain is never hard-coded elsewhere.

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.learnaeo.com";

export const SITE = {
  name: "Learn AEO" as const,
  url: rawUrl.replace(/\/+$/, ""),
  host: "www.learnaeo.com" as const,
  apexHost: "learnaeo.com" as const,
  tagline: "Learn answer engine optimization",
  description:
    "Learn answer engine optimization: how to get your brand cited by ChatGPT, Perplexity, Google AI Overviews and other AI answer engines.",
  supportEmail: process.env.CONTACT_TO_EMAIL ?? "hello@learnaeo.com",
  gaId: process.env.NEXT_PUBLIC_GA_ID || undefined,
  /** Social profile URLs for Organization JSON-LD. Empty until profiles exist. */
  sameAs: [] as string[],
};

/** Build an absolute URL on the site. "/" returns the bare site URL. */
export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "/" ? SITE.url : `${SITE.url}${p}`;
}

/** Prefix for every cookie and localStorage key this site sets. */
export const COOKIE_PREFIX = "aeo_";
