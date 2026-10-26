/** Gift codes (server only): the checkout session id plus an HMAC of it. See src/lib/gift-course.ts. */
import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.GIFT_CODE_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("GIFT_CODE_SECRET or NEXTAUTH_SECRET must be set to sign gift codes");
  return s;
}

function sign(sessionId: string): string {
  return createHmac("sha256", secret()).update(`gift-course:${sessionId}`).digest("base64url");
}

/** The code in a gift link: the checkout session id and its signature. */
export function giftCode(sessionId: string): string {
  return `${sessionId}.${sign(sessionId)}`;
}

/** The session id inside a genuine code, else null. */
export function verifyGiftCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const dot = code.lastIndexOf(".");
  if (dot <= 0) return null;
  const sessionId = code.slice(0, dot);
  const given = Buffer.from(code.slice(dot + 1));
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const expected = Buffer.from(sign(sessionId));
  return given.length === expected.length && timingSafeEqual(given, expected) ? sessionId : null;
}
