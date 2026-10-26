/**
 * Purchasing-power parity pricing. Visitors from countries where a dollar
 * goes further get a percentage off every plan, applied automatically at
 * checkout as a Stripe coupon (one coupon per tier, id PPP_TIER_<X>,
 * duration "forever" so subscriptions keep it).
 *
 * Country comes from Vercel's geo header via the middleware cookie
 * (src/lib/pricing.ts COUNTRY_COOKIE). Tiers are hand-set from World Bank
 * PPP conversion factors and rounded to three friendly bands. A VPN can
 * claim the discount; we accept that as the cost of reaching more learners.
 */

export type PppTier = "B" | "C" | "D";

export const PPP_PERCENT: Record<PppTier, number> = { B: 30, C: 50, D: 65 };

export const PPP_COUPON_ID: Record<PppTier, string> = { B: "PPP_TIER_B", C: "PPP_TIER_C", D: "PPP_TIER_D" };

/** ISO-3166 alpha-2 → tier. Anything missing pays full price. */
export const COUNTRY_TIER: Record<string, PppTier> = {
  // ── B: 30% ──
  PL: "B", PT: "B", GR: "B", CZ: "B", HU: "B", SK: "B", HR: "B", EE: "B", LV: "B", LT: "B", SI: "B", RO: "B", BG: "B",
  CL: "B", UY: "B", CR: "B", PA: "B", MY: "B", TT: "B", BH: "B", OM: "B",
  // ── C: 50% ──
  BR: "C", MX: "C", TR: "C", ZA: "C", TH: "C", AR: "C", CO: "C", PE: "C", CN: "C", KZ: "C", RS: "C", BA: "C", MK: "C",
  AL: "C", ME: "C", GE: "C", AM: "C", AZ: "C", MU: "C", BW: "C", DO: "C", JM: "C", MA: "C", TN: "C", JO: "C", LB: "C",
  NA: "C", XK: "C", MV: "C", FJ: "C", BZ: "C", GY: "C", SR: "C",
  // ── D: 65% ──
  IN: "D", EG: "D", ID: "D", PH: "D", NG: "D", PK: "D", VN: "D", KE: "D", BD: "D", LK: "D", NP: "D", GH: "D", ET: "D",
  TZ: "D", UG: "D", ZM: "D", ZW: "D", MM: "D", KH: "D", LA: "D", BO: "D", PY: "D", EC: "D", GT: "D", HN: "D", NI: "D",
  SV: "D", VE: "D", DZ: "D", IQ: "D", UZ: "D", KG: "D", TJ: "D", MN: "D", SN: "D", CI: "D", CM: "D", MZ: "D", MW: "D",
  RW: "D", MG: "D", HT: "D", SD: "D", UA: "D", MD: "D", PS: "D", BJ: "D", BF: "D", ML: "D", NE: "D", TG: "D", SL: "D",
  LR: "D", GM: "D", GN: "D", BI: "D", CD: "D", AO: "D", LS: "D", SZ: "D", PG: "D", TL: "D", BT: "D", YE: "D", LY: "D",
};

export type Ppp = { country: string; tier: PppTier; percentOff: number; couponId: string };

export function pppFor(country: string | null | undefined): Ppp | null {
  if (!country) return null;
  const cc = country.toUpperCase();
  const tier = COUNTRY_TIER[cc];
  if (!tier) return null;
  return { country: cc, tier, percentOff: PPP_PERCENT[tier], couponId: PPP_COUPON_ID[tier] };
}

/**
 * The price a visitor will actually pay: the same arithmetic Stripe applies
 * to the coupon, in minor units, rounded to the nearest unit. 19.99 at 65%
 * off is 7.00, not a "friendly" 6.99, because the banner promises the price
 * shown is the price charged.
 */
export function parityPrice(amount: number, percentOff: number): number {
  const minor = Math.round(amount * 100);
  const paid = Math.round((minor * (100 - percentOff)) / 100);
  return Math.max(1, paid) / 100;
}

/** "7.00", "29.50", "30" */
export function formatParity(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/** Country name for the banner; falls back to the code where Intl is missing. */
export function countryName(code: string, locale = "en"): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Regional-indicator flag emoji from a country code. */
export function flagEmoji(code: string): string {
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/**
 * Does the visitor's parity discount already match or beat a time-limited offer of `percentOff`?
 * Checkout applies whichever is larger, so such an offer would never be the price paid: it is not
 * granted, emailed or shown (a "$12.99 for 24 hours" to someone who pays $7.00 anyway).
 */
export function pppBeatsOffer(country: string | null | undefined, percentOff: number): boolean {
  const p = pppFor(country);
  return !!p && p.percentOff >= percentOff;
}

/** The visitor's country on a server request: the middleware cookie (aeo_cc), else Vercel's geo header. */
export function requestCountry(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)aeo_cc=([^;]*)/);
  return (m ? decodeURIComponent(m[1]) : null) || request.headers.get("x-vercel-ip-country");
}
