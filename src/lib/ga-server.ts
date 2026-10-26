/**
 * Server-side GA4 events via the Measurement Protocol.
 *
 * The dashboard's client-side `purchase` event only fires if the buyer lands
 * back on /dashboard?checkout=success with analytics allowed, which missed a
 * real sale in August 2026. The Stripe webhook now records the purchase too,
 * against the buyer's own GA client id (captured from the `_ga` cookie when
 * the checkout session was created). GA4 de-duplicates purchases that share a
 * transaction_id, so the two never double count.
 *
 * Needs GA4_MP_API_SECRET (GA4 Admin → Data streams → Measurement Protocol
 * API secrets). Without it this is a no-op.
 */

import { SITE } from "@/lib/site";

/** The GA4 measurement id from NEXT_PUBLIC_GA_ID; empty when unset (GA is then off everywhere). */
export const GA_MEASUREMENT_ID = SITE.gaId ?? "";

/** "GA1.1.123456789.1700000000" → "123456789.1700000000" */
export function gaClientIdFromCookie(cookie: string | undefined | null): string {
  if (!cookie) return "";
  const parts = cookie.split(".");
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : "";
}

/**
 * The GA session id from the stream's own cookie (`_ga_<id without the G- prefix>`), in either of the formats gtag has written:
 * "GS1.1.1700000000.3.1.…" or "GS2.1.s1700000000$o3$g1…". With it the sale joins the visit that led to it
 * (source, landing page); without it GA4 files the purchase under a session of its own.
 */
export function gaSessionIdFromCookie(cookie: string | undefined | null): string {
  if (!cookie) return "";
  const m = /^GS1\.\d+\.(\d+)\./.exec(cookie) ?? /^GS2\.\d+\.s(\d+)/.exec(cookie);
  return m ? m[1] : "";
}

export const GA_SESSION_COOKIE = `_ga_${GA_MEASUREMENT_ID.slice(2)}`;

export type ServerPurchase = {
  clientId?: string | null;
  sessionId?: string | null;
  transactionId: string;
  /** Major units, e.g. 14.99 */
  value: number;
  currency: string;
  plan: string;
  planName: string;
};

export async function sendPurchaseToGA4(p: ServerPurchase, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const secret = process.env.GA4_MP_API_SECRET;
  if (!secret || !GA_MEASUREMENT_ID) return false;
  // A random client id still counts the sale, it just cannot be joined to a session.
  const clientId = p.clientId || `${Math.floor(Math.random() * 1e9)}.${Math.floor(Date.now() / 1000)}`;
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${encodeURIComponent(secret)}`;
  const body = {
    client_id: clientId,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: p.transactionId,
          value: p.value,
          currency: p.currency.toUpperCase(),
          sent_from: "stripe_webhook",
          // (GA4 only shows a Measurement Protocol event in its reports when it carries some engagement time)
          engagement_time_msec: 1,
          ...(p.sessionId ? { session_id: p.sessionId } : {}),
          items: [{ item_id: p.plan, item_name: p.planName, price: p.value, quantity: 1 }],
        },
      },
    ],
  };
  try {
    const res = await fetchImpl(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return res.ok;
  } catch (err) {
    console.error("[ga-server] purchase send failed:", err);
    return false;
  }
}
