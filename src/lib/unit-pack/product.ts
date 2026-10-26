/**
 * The Ancient Egypt Writing Unit as a product: a one-off teacher pack, $19 / £15, no account needed.
 *
 * Sold like the keyboard's HD picture (src/lib/keyboard-card.ts KEYBOARD_HD): an inline Stripe price, the
 * product id in the session metadata (the webhook keys on it), and a download page that rebuilds the PDF
 * from the session id. Pure: safe in client components.
 */
import type { Currency } from "@/lib/pricing";

export const UNIT_PACK = {
  /** Checkout Session metadata.product; the webhook keys on it. */
  id: "unit-pack",
  name: "Ancient Egypt Writing Unit",
  description: "Five hieroglyphs lessons for KS2 and grade 6: lesson plans, pupil worksheets, an end-of-unit quiz and answer key (PDF).",
  usd: 19,
  gbp: 15,
} as const;

/** The thank-you page Stripe returns to; it serves the download against the session id. */
export const UNIT_PACK_THANKS_PATH = "/teachers/unit-pack/thanks";
/** The page that describes the pack (the offers and the seasonal strip point here). */
export const UNIT_PACK_PAGE = "/teachers/unit-pack";
export const UNIT_PACK_DOWNLOAD_ROUTE = "/api/unit-pack/download";
export const UNIT_PACK_SAMPLE_ROUTE = "/api/unit-pack/sample";

export type Paper = "a4" | "letter";

export function isPaper(v: unknown): v is Paper {
  return v === "a4" || v === "letter";
}

/** US teachers print on Letter, everyone else here on A4. */
export function paperForCountry(country: string | null | undefined): Paper {
  const c = country?.toUpperCase();
  return c === "US" || c === "CA" ? "letter" : "a4";
}

export function unitPackAmount(currency: Currency): number {
  return currency === "GBP" ? UNIT_PACK.gbp : UNIT_PACK.usd;
}

/** "$19" / "£15": whole amounts read better without ".00". */
export function unitPackPrice(currency: Currency): string {
  const amount = unitPackAmount(currency);
  const text = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return currency === "GBP" ? `£${text}` : `$${text}`;
}

/** Where a checkout may come from (the cancel link goes back there). */
export const UNIT_PACK_FROM = ["teachers", "worksheet", "unit-pack"] as const;
export type UnitPackFrom = (typeof UNIT_PACK_FROM)[number];

export function isUnitPackFrom(v: unknown): v is UnitPackFrom {
  return typeof v === "string" && (UNIT_PACK_FROM as readonly string[]).includes(v);
}

export function unitPackFromPath(from: UnitPackFrom): string {
  return from === "worksheet" ? "/teachers/worksheet" : from === "teachers" ? "/teachers" : UNIT_PACK_PAGE;
}

/** The Checkout Session's line item and metadata, in one place so the route and its test agree. */
export function unitPackCheckoutParams(input: {
  currency: Currency;
  paper: Paper;
  from: UnitPackFrom;
  gaClientId: string;
  gaSessionId: string;
  base: string;
}) {
  const { currency, paper, from, base } = input;
  return {
    mode: "payment" as const,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: Math.round(unitPackAmount(currency) * 100),
          product_data: { name: UNIT_PACK.name, description: UNIT_PACK.description },
        },
      },
    ],
    metadata: {
      product: UNIT_PACK.id,
      paper,
      from,
      ga_client_id: input.gaClientId,
      ga_session_id: input.gaSessionId,
    },
    payment_intent_data: { description: `${UNIT_PACK.name} (${paper === "letter" ? "US Letter" : "A4"})` },
    success_url: `${base}${UNIT_PACK_THANKS_PATH}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${unitPackFromPath(from)}?unit_pack=cancelled`,
  };
}

export function unitPackFilename(paper: Paper, sample = false): string {
  return `ancient-egypt-writing-unit${sample ? "-free-sample" : ""}-${paper === "letter" ? "us-letter" : "a4"}.pdf`;
}

export function unitPackDownloadPath(sessionId: string, paper?: Paper): string {
  const q = new URLSearchParams({ session_id: sessionId });
  if (paper) q.set("paper", paper);
  return `${UNIT_PACK_DOWNLOAD_ROUTE}?${q.toString()}`;
}

export function unitPackSamplePath(paper?: Paper): string {
  return paper ? `${UNIT_PACK_SAMPLE_ROUTE}?paper=${paper}` : UNIT_PACK_SAMPLE_ROUTE;
}
