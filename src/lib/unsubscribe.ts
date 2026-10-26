import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signed one-click unsubscribe links for marketing email (the nurture
 * sequence). The token is an HMAC of the user id, so a link can't be forged
 * for someone else and needs no table of its own.
 */

function secretOrThrow(secret?: string): string {
  const s = secret ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set");
  return s;
}

export function unsubscribeToken(userId: string, secret?: string): string {
  return createHmac("sha256", secretOrThrow(secret)).update(`unsubscribe:${userId}`).digest("base64url");
}

export function verifyUnsubscribeToken(userId: string, token: string, secret?: string): boolean {
  if (!userId || !token) return false;
  const expected = Buffer.from(unsubscribeToken(userId, secret));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(userId: string, baseUrl?: string, secret?: string): string {
  const base = (baseUrl ?? process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  return `${base}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId, secret)}`;
}

/**
 * The same for someone with no account, known only by an email address (EmailLead rows, such as the
 * "Christmas prints are open" opt-in): an HMAC of the address, kept apart from the user-id tokens.
 */
export function leadUnsubscribeToken(email: string, secret?: string): string {
  return createHmac("sha256", secretOrThrow(secret)).update(`lead-unsubscribe:${email.trim().toLowerCase()}`).digest("base64url");
}

export function verifyLeadUnsubscribeToken(email: string, token: string, secret?: string): boolean {
  if (!email || !token) return false;
  const expected = Buffer.from(leadUnsubscribeToken(email, secret));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function leadUnsubscribeUrl(email: string, baseUrl?: string, secret?: string): string {
  const base = (baseUrl ?? process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  return `${base}/api/email/unsubscribe?e=${encodeURIComponent(email.trim().toLowerCase())}&t=${leadUnsubscribeToken(email, secret)}`;
}

/**
 * "Yes, send me the three emails" in the name picture's own email (src/lib/name-drip.ts): a signed link that
 * records the opt-in for the address it was sent to, and only that address.
 */
export function nameDripJoinToken(email: string, secret?: string): string {
  return createHmac("sha256", secretOrThrow(secret)).update(`name-drip-join:${email.trim().toLowerCase()}`).digest("base64url");
}

export function verifyNameDripJoinToken(email: string, token: string, secret?: string): boolean {
  if (!email || !token) return false;
  const expected = Buffer.from(nameDripJoinToken(email, secret));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function nameDripJoinUrl(email: string, name: string, baseUrl?: string, secret?: string): string {
  const base = (baseUrl ?? process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  const q = new URLSearchParams({ e: email.trim().toLowerCase(), n: name.slice(0, 60), t: nameDripJoinToken(email, secret) });
  return `${base}/api/name-drip/join?${q.toString()}`;
}
