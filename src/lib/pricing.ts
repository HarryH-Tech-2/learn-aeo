/**
 * Lifetime-access price by currency (the anchor plan; the full catalogue is
 * in src/lib/plans.ts). USD is the Stripe Price's default currency; GBP is a
 * `currency_options.gbp` entry on the same Price (scripts/stripe-create-plans.mjs).
 * Keep these in sync with Stripe.
 */
import { COOKIE_PREFIX } from "@/lib/site";

export type Currency = "USD" | "GBP";

export const PRICES: Record<Currency, { amount: number; symbol: string; minor: number }> = {
  USD: { amount: 100, symbol: "$", minor: 10000 },
  GBP: { amount: 80, symbol: "£", minor: 8000 },
};

/** Cookie set by middleware from Vercel's geo header (ISO-3166 alpha-2). */
export const COUNTRY_COOKIE = `${COOKIE_PREFIX}cc`;

export function currencyForCountry(country: string | null | undefined): Currency {
  return country?.toUpperCase() === "GB" ? "GBP" : "USD";
}

/** "$100", "£80", "£53.60": whole amounts print without ".00". */
export function formatPrice(currency: Currency, amount = PRICES[currency].amount): string {
  const { symbol } = PRICES[currency];
  return `${symbol}${Number.isInteger(amount) ? String(amount) : amount.toFixed(2)}`;
}

/**
 * The exact amount Stripe charges with a percent_off coupon: round(minor × (1 − pct/100))
 * in minor units, so 33 % off is $67 and £53.60 (same arithmetic as parityPrice in ppp.ts).
 */
export function discounted(currency: Currency, percentOff: number): number {
  const paid = Math.round((PRICES[currency].minor * (100 - percentOff)) / 100);
  return Math.max(1, paid) / 100;
}

export function readCountryCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COUNTRY_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
