/**
 * Where a visitor first came from (2026-10-16): the referring site's host and the page they landed on, kept in
 * the lh_ref cookie for 90 days (first visit wins). CampaignTracker writes it, only once Analytics is allowed
 * (src/lib/consent.ts). auth.ts copies it onto User.signupReferrer / signupLanding when the account is
 * created, and checkout copies it into the Stripe metadata, so a sale has a source even when the buyer's
 * browser blocks Google Analytics.
 *
 * Only the host is kept, never the full referring address (it can carry search terms or ids).
 */

export const REFERRER_COOKIE = "lh_ref";
export const REFERRER_COOKIE_DAYS = 90;

export type Referrer = { host: string; landing: string };

const HOST = /^[a-z0-9.-]{1,100}$/;
const PATH = /^\/[A-Za-z0-9/_.\-]{0,120}$/;

/**
 * Hosts that appear mid-journey (paying, signing in, the magic-link email opened in webmail): not the first
 * source, so they never fill an empty lh_ref.
 */
const IN_JOURNEY = ["checkout.stripe.com", "billing.stripe.com", "accounts.google.com", "mail.google.com", "outlook.live.com", "outlook.office.com", "mail.yahoo.com"];

/**
 * The visitor's source from document.referrer: the referring host without "www.", "direct" when there is none,
 * or null when it is our own site or a mid-journey host (nothing to record).
 */
export function referrerHost(referrer: string, ownHost: string): string | null {
  if (!referrer) return "direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  const bare = (h: string) => h.replace(/^www\./, "");
  if (bare(host) === bare(ownHost.toLowerCase())) return null;
  if (IN_JOURNEY.includes(host)) return null;
  host = bare(host);
  return HOST.test(host) ? host : null;
}

/** The landing path, without query or fragment, or "/" when it isn't a plain path. */
export function landingPath(pathname: string): string {
  return PATH.test(pathname) ? pathname : "/";
}

/** Cookie value: host|landing. */
export function encodeReferrer(r: Referrer): string {
  return `${r.host}|${r.landing}`;
}

export function decodeReferrer(value: string | null | undefined): Referrer | null {
  if (!value) return null;
  let raw: string;
  try {
    raw = decodeURIComponent(value);
  } catch {
    return null;
  }
  const [host, landing = "/"] = raw.split("|");
  if (!HOST.test(host ?? "")) return null;
  return { host, landing: landingPath(landing) };
}

/** The answers to "How did you find us?" (dashboard card, /api/me/heard-about). */
export const HEARD_ABOUT_OPTIONS = [
  { id: "google", label: "Google search" },
  { id: "ai", label: "ChatGPT or another AI" },
  { id: "youtube", label: "YouTube" },
  { id: "social", label: "TikTok, Instagram or Facebook" },
  { id: "reddit", label: "Reddit" },
  { id: "school", label: "A teacher or school" },
  { id: "friend", label: "A friend or family" },
  { id: "other", label: "Somewhere else" },
] as const;

export type HeardAboutId = (typeof HEARD_ABOUT_OPTIONS)[number]["id"] | "skipped";

/**
 * The stored answer: the option id, "other: <their words>" (at most 80 characters), or "skipped".
 * Null when the input is not one of the options.
 */
export function cleanHeardAbout(answer: unknown, detail: unknown): string | null {
  if (answer === "skipped") return "skipped";
  const option = HEARD_ABOUT_OPTIONS.find((o) => o.id === answer);
  if (!option) return null;
  const words = typeof detail === "string" ? detail.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) : "";
  return option.id === "other" && words ? `other: ${words}` : option.id;
}

/** One line for the owner's emails: everything we know about where a customer came from. */
export function describeSource(u: {
  signupSource?: string | null;
  signupCampaign?: string | null;
  signupReferrer?: string | null;
  signupLanding?: string | null;
  heardAbout?: string | null;
}): string {
  const parts: string[] = [];
  if (u.signupSource) parts.push(`marketing link ${u.signupSource}${u.signupCampaign ? ` / ${u.signupCampaign}` : ""}`);
  if (u.signupReferrer) parts.push(`first came from ${u.signupReferrer}${u.signupLanding ? ` to ${u.signupLanding}` : ""}`);
  if (u.heardAbout && u.heardAbout !== "skipped") parts.push(`told us: ${u.heardAbout}`);
  return parts.length ? parts.join("; ") : "unknown (no tracking consent, or GA blocked; they haven't answered the question yet)";
}
