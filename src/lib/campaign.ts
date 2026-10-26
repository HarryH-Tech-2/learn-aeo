/**
 * Which post brought a visitor (2026-10-01). Every marketing link carries utm_source / utm_campaign
 * (docs/marketing-kit.md). CampaignTracker (in the root layout) records the landing as a CampaignVisit and keeps
 * the campaign in the `lh_utm` cookie for 30 days (last tagged link wins); when an account is created,
 * auth.ts copies the cookie onto User.signupSource / signupCampaign. /admin/marketing adds it up.
 *
 * Our own record, because GA4 loses most of these: a magic-link sign-up finishes in a new session that
 * arrives from the mail client, not from the post.
 */

export const CAMPAIGN_COOKIE = "lh_utm";
export const VISITOR_COOKIE = "lh_vid";
export const CAMPAIGN_COOKIE_DAYS = 30;

export type Campaign = { source: string; medium: string; campaign: string };

/** Lower-case letters, digits, dot, dash and underscore, at most 60: anything else is not one of our links. */
const TAG = /^[a-z0-9._-]{1,60}$/;

function clean(v: string | null | undefined): string | null {
  const t = (v ?? "").trim().toLowerCase();
  return TAG.test(t) ? t : null;
}

/** The campaign in a URL's query, or null when it carries none (or something that is not a tag). */
export function campaignFromSearch(search: string | URLSearchParams): Campaign | null {
  const q = typeof search === "string" ? new URLSearchParams(search) : search;
  const source = clean(q.get("utm_source"));
  if (!source) return null;
  return { source, medium: clean(q.get("utm_medium")) ?? "", campaign: clean(q.get("utm_campaign")) ?? "" };
}

/** Cookie value: source|medium|campaign. */
export function encodeCampaign(c: Campaign): string {
  return [c.source, c.medium, c.campaign].join("|");
}

export function decodeCampaign(value: string | null | undefined): Campaign | null {
  if (!value) return null;
  const [source, medium = "", campaign = ""] = decodeURIComponent(value).split("|");
  const s = clean(source);
  if (!s) return null;
  return { source: s, medium: clean(medium) ?? "", campaign: clean(campaign) ?? "" };
}

/** A visitor id from the cookie, if it looks like one we made. */
export function validVisitorId(v: string | null | undefined): string | null {
  return v && /^[a-z0-9]{16,40}$/.test(v) ? v : null;
}
