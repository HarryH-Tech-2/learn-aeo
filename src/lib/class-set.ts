/**
 * The Class Cartouche Set as a product (2026-10-21): a teacher pastes the class list and gets one PDF, every
 * pupil's name in a cartouche on its own A4 page, plus a class page with all the names and their signs.
 * $9.99 / £7.99 for up to 40 names, no account needed.
 *
 * Why: classes arrive on the name translator from Schoology and Google Classroom (55 pupils from one Nashville
 * class on 8 Oct 2026), and pupils cannot buy. This is the thing the teacher behind that lesson can buy.
 *
 * Sold like the unit pack (src/lib/unit-pack/product.ts): an inline Stripe price, the product id in the session
 * metadata (the webhook keys on it), and a thank-you page that rebuilds the PDF from the session id. The names
 * travel in the metadata too, split across keys because Stripe caps each value at 500 characters.
 * Pure: safe in client components.
 */
import type { Currency } from "@/lib/pricing";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { isCartouchePrintTheme, type CartouchePrintThemeId } from "@/lib/cartouche-print";

export const CLASS_SET = {
  /** Checkout Session metadata.product; the webhook keys on it. */
  id: "class-set",
  name: "Class Cartouche Set",
  description: "Every pupil's name in a cartouche, one A4 page each, plus a class page with all the names (PDF).",
  usd: 9.99,
  gbp: 7.99,
} as const;

/** A big class, with room for a teaching assistant or two. */
export const CLASS_SET_MAX_NAMES = 40;
/** Longer than any first name, short enough that the cartouche stays readable. */
export const CLASS_SET_MAX_NAME_LENGTH = 24;

/**
 * The papers offered to teachers. Cream first: it prints with the least ink on a school printer; the art papers
 * are full-bleed pictures.
 */
export const CLASS_SET_THEMES: readonly CartouchePrintThemeId[] = ["cream", "papyrus", "temple"];
export const DEFAULT_CLASS_SET_THEME: CartouchePrintThemeId = "cream";

export function isClassSetTheme(v: unknown): v is CartouchePrintThemeId {
  return isCartouchePrintTheme(v) && CLASS_SET_THEMES.includes(v);
}

export const CLASS_SET_PAGE = "/teachers/class-set";
export const CLASS_SET_THANKS_PATH = "/teachers/class-set/thanks";
export const CLASS_SET_DOWNLOAD_ROUTE = "/api/class-set/download";

export function classSetAmount(currency: Currency): number {
  return currency === "GBP" ? CLASS_SET.gbp : CLASS_SET.usd;
}

export function classSetPrice(currency: Currency): string {
  const amount = classSetAmount(currency).toFixed(2);
  return currency === "GBP" ? `£${amount}` : `$${amount}`;
}

export type ParsedClassList = {
  /** Names to print, in the order typed, duplicates dropped. */
  names: string[];
  /** Lines that give no signs (digits or symbols only), to show the teacher. */
  skipped: string[];
  /** Names left out because the list went past CLASS_SET_MAX_NAMES. */
  overflow: number;
};

/**
 * A pasted class list: one name per line, or separated by commas or semicolons (a column copied from a
 * spreadsheet arrives as lines). Whitespace is tidied, names are cut at CLASS_SET_MAX_NAME_LENGTH, repeats are
 * dropped (case-insensitive), and a name the translator can't spell is skipped and reported.
 */
export function parseClassList(raw: string): ParsedClassList {
  const names: string[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();
  let overflow = 0;
  for (const part of raw.split(/[\n\r,;\t]+/)) {
    const name = part.replace(/\s+/g, " ").trim().slice(0, CLASS_SET_MAX_NAME_LENGTH).trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (transliterateName(name).length === 0) {
      skipped.push(name);
      continue;
    }
    if (names.length >= CLASS_SET_MAX_NAMES) {
      overflow += 1;
      continue;
    }
    names.push(name);
  }
  return { names, skipped, overflow };
}

/** Stripe allows 500 characters per metadata value. */
const METADATA_VALUE_MAX = 500;
const NAMES_KEY = "names_";

/** The names as metadata entries names_0, names_1…, each under Stripe's limit, joined by newlines. */
export function encodeClassSetNames(names: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  let chunk = "";
  let i = 0;
  for (const name of names) {
    const next = chunk ? `${chunk}\n${name}` : name;
    if (next.length > METADATA_VALUE_MAX) {
      out[`${NAMES_KEY}${i++}`] = chunk;
      chunk = name;
    } else {
      chunk = next;
    }
  }
  if (chunk) out[`${NAMES_KEY}${i}`] = chunk;
  return out;
}

/** The names back from a session's metadata, in order. */
export function decodeClassSetNames(metadata: Record<string, string> | null | undefined): string[] {
  if (!metadata) return [];
  const names: string[] = [];
  for (let i = 0; metadata[`${NAMES_KEY}${i}`] !== undefined; i++) {
    names.push(...metadata[`${NAMES_KEY}${i}`].split("\n").filter(Boolean));
  }
  return names.slice(0, CLASS_SET_MAX_NAMES);
}

/** The Checkout Session's line item and metadata, in one place so the route and its test agree. */
export function classSetCheckoutParams(input: {
  currency: Currency;
  names: readonly string[];
  theme: CartouchePrintThemeId;
  from: string;
  gaClientId: string;
  gaSessionId: string;
  base: string;
}) {
  const { currency, names, theme, base } = input;
  return {
    mode: "payment" as const,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: Math.round(classSetAmount(currency) * 100),
          product_data: { name: CLASS_SET.name, description: `${names.length} name${names.length === 1 ? "" : "s"}: ${CLASS_SET.description}` },
        },
      },
    ],
    metadata: {
      product: CLASS_SET.id,
      theme,
      count: String(names.length),
      from: input.from,
      ga_client_id: input.gaClientId,
      ga_session_id: input.gaSessionId,
      ...encodeClassSetNames(names),
    },
    payment_intent_data: { description: `${CLASS_SET.name} (${names.length} names)` },
    success_url: `${base}${CLASS_SET_THANKS_PATH}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${CLASS_SET_PAGE}?class_set=cancelled`,
  };
}

export function classSetFilename(): string {
  return "class-cartouche-set.pdf";
}

export function classSetDownloadPath(sessionId: string): string {
  return `${CLASS_SET_DOWNLOAD_ROUTE}?session_id=${encodeURIComponent(sessionId)}`;
}
