/**
 * Who has to say yes before Google Analytics runs.
 *
 * UK and EU/EEA law (PECR, the ePrivacy Directive) treat analytics cookies as optional, so visitors there are
 * measured only after "Accept all" on the cookie scroll. Everywhere else they are measured from the start and
 * can still turn it off with "Essentials only". A visitor whose country is unknown is treated as opt-in.
 *
 * The country comes from the lh_cc cookie the middleware stamps from Vercel's geo header (src/middleware.ts).
 */

/** "all" or "essential", written by the cookie scroll (src/components/CookieScroll.tsx). */
export const CONSENT_COOKIE = "lh_consent";

/** EU member states, the rest of the EEA (Iceland, Liechtenstein, Norway) and the UK. */
export const OPT_IN_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO",
  "GB",
];

/**
 * Whether Analytics may run, from the consent choice (if any) and the visitor's country (if known).
 * Takes the list as an argument so it can be inlined by toString() with nothing outside it to resolve.
 */
export function analyticsAllowedFor(consent: string | null, country: string | null, optIn: string[]): boolean {
  if (consent === "all") return true;
  if (consent === "essential") return false;
  return !!country && optIn.indexOf(country.toUpperCase()) === -1;
}

export function analyticsAllowed(consent: string | null, country: string | null): boolean {
  return analyticsAllowedFor(consent, country, OPT_IN_COUNTRIES);
}

/** Fired on window by the cookie scroll with detail "all" or "essential", so trackers waiting for a yes can start. */
export const CONSENT_EVENT = "lh-consent";

/**
 * Our own measurement cookies (src/lib/campaign.ts, src/lib/referrer.ts). They follow the same rule as
 * Analytics, and "Essentials only" deletes them.
 */
export const MEASUREMENT_COOKIES = ["lh_utm", "lh_vid", "lh_ref"];

/** analyticsAllowed from the browser's own cookies (client components only). */
export function analyticsAllowedInBrowser(): boolean {
  const consent = (document.cookie.match(/(?:^|; )lh_consent=(all|essential)/) || [])[1] ?? null;
  const country = (document.cookie.match(/(?:^|; )lh_cc=([A-Za-z]{2})/) || [])[1] ?? null;
  return analyticsAllowed(consent, country);
}

/**
 * Inline script: leaves window.__lhAnalyticsAllowed for the gtag init script in src/app/layout.tsx.
 * analyticsAllowedFor is inlined by toString(), so it must stay self-contained ES5.
 */
export function analyticsAllowedScript(): string {
  return (
    "(function(){" +
    "var k=(document.cookie.match(/(?:^|; )lh_consent=(all|essential)/)||[])[1]||null;" +
    "var c=(document.cookie.match(/(?:^|; )lh_cc=([A-Za-z]{2})/)||[])[1]||null;" +
    `window.__lhAnalyticsAllowed=(${analyticsAllowedFor.toString()})(k,c,${JSON.stringify(OPT_IN_COUNTRIES)});` +
    "})();"
  );
}
