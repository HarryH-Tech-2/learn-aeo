/**
 * Prodigi: the print-on-demand partner that prints and posts the physical
 * Cartouche Print. One REST call places an order; Prodigi fetches the
 * artwork from a URL we give it, prints locally to the buyer and ships.
 *
 *   Docs: https://www.prodigi.com/print-api/docs/reference/
 *   Sandbox: api.sandbox.prodigi.com with a sandbox key (orders are not printed).
 *
 * Environment:
 *   PRODIGI_API_KEY               required to place orders; without it the webhook
 *                                 emails the owner to place the order by hand.
 *   PRODIGI_ENV                   "live" for api.prodigi.com; anything else = sandbox.
 *   PRODIGI_SKU_PRINT             the unframed A4 SKU (default GLOBAL-FAP-A4); A3/A2/A1 use GLOBAL-FAP-A3/A2/A1.
 *   PRODIGI_SKU_FRAMED            the framed A4 SKU (default GLOBAL-CFPM-A4).
 *   PRODIGI_SKU_FRAMED_ATTRIBUTES JSON attributes for the framed SKU (default {"color":"black"}).
 *   PRODIGI_ASSET_SECRET          signs the artwork URL (falls back to NEXTAUTH_SECRET).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cartouchePrintFormatById, type CartouchePrintFormatId } from "@/lib/cartouche-print";

export const PRODIGI_REFERENCE_PREFIX = "lh-cartouche-";

export function prodigiConfigured(): boolean {
  return Boolean(process.env.PRODIGI_API_KEY);
}

export function prodigiBaseUrl(): string {
  return process.env.PRODIGI_ENV === "live" ? "https://api.prodigi.com/v4.0" : "https://api.sandbox.prodigi.com/v4.0";
}

export type ProdigiProduct = { sku: string; attributes?: Record<string, string> };

/** The Prodigi product for a physical format. Confirm the SKUs in the Prodigi dashboard before going live. */
export function prodigiProductFor(format: CartouchePrintFormatId): ProdigiProduct {
  if (format === "framed") {
    let attributes: Record<string, string> = { color: "black" };
    const raw = process.env.PRODIGI_SKU_FRAMED_ATTRIBUTES;
    if (raw) {
      try {
        attributes = JSON.parse(raw) as Record<string, string>;
      } catch {
        console.warn("[prodigi] PRODIGI_SKU_FRAMED_ATTRIBUTES is not JSON; using the default");
      }
    }
    return { sku: process.env.PRODIGI_SKU_FRAMED || "GLOBAL-CFPM-A4", attributes };
  }
  if (format === "print") return { sku: process.env.PRODIGI_SKU_PRINT || "GLOBAL-FAP-A4" };
  // the bigger unframed sizes, confirmed against the live catalogue 2026-10-19 (scripts/dev/prodigi-catalogue.mjs)
  const sku = cartouchePrintFormatById(format).prodigiSku;
  if (!sku) throw new Error(`no Prodigi product for format ${format}`);
  return { sku };
}

/* ---- The artwork URL: signed, so only Prodigi's fetch can pull a paid print ---- */

function assetSecret(): string {
  const s = process.env.PRODIGI_ASSET_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("PRODIGI_ASSET_SECRET or NEXTAUTH_SECRET must be set to sign print assets");
  return s;
}

export function signAsset(sessionId: string): string {
  return createHmac("sha256", assetSecret()).update(`cartouche-print-asset:${sessionId}`).digest("hex");
}

export function verifyAssetSignature(sessionId: string, sig: string | null | undefined): boolean {
  if (!sig || !/^[0-9a-f]{64}$/.test(sig)) return false;
  const expected = Buffer.from(signAsset(sessionId), "hex");
  const given = Buffer.from(sig, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function assetUrl(sessionId: string): string {
  const base = process.env.NEXTAUTH_URL;
  return `${base}/api/cartouche-print/asset?session_id=${encodeURIComponent(sessionId)}&sig=${signAsset(sessionId)}`;
}

/* ---- Orders ---- */

export type ProdigiRecipient = {
  name: string;
  email?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postcode: string;
  /** ISO 3166-1 alpha-2. */
  country: string;
};

export type ProdigiOrderInput = {
  /** Our reference, the Stripe Checkout Session id. */
  sessionId: string;
  format: CartouchePrintFormatId;
  recipient: ProdigiRecipient;
  /** The artwork Prodigi will fetch: the signed page-one PDF. */
  assetUrl: string;
  /** Where Prodigi posts status changes. */
  callbackUrl?: string;
  /** Free text that shows on the packing slip. */
  idempotencyKey?: string;
};

export type ProdigiOrder = {
  id: string;
  status?: { stage?: string; details?: Record<string, string> };
  merchantReference?: string;
  recipient?: { email?: string | null; name?: string };
  shipments?: Array<{
    carrier?: { name?: string; service?: string };
    tracking?: { number?: string; url?: string } | null;
    status?: string;
  }>;
};

export function prodigiOrderBody(input: ProdigiOrderInput) {
  const product = prodigiProductFor(input.format);
  return {
    merchantReference: `${PRODIGI_REFERENCE_PREFIX}${input.sessionId}`,
    shippingMethod: "Standard",
    ...(input.callbackUrl ? { callbackUrl: input.callbackUrl } : {}),
    recipient: {
      name: input.recipient.name,
      ...(input.recipient.email ? { email: input.recipient.email } : {}),
      address: {
        line1: input.recipient.line1,
        ...(input.recipient.line2 ? { line2: input.recipient.line2 } : {}),
        postalOrZipCode: input.recipient.postcode,
        countryCode: input.recipient.country,
        townOrCity: input.recipient.city,
        ...(input.recipient.state ? { stateOrCounty: input.recipient.state } : {}),
      },
    },
    items: [
      {
        merchantReference: input.format === "print" || input.format === "framed" ? `${input.format}-a4` : input.format,
        sku: product.sku,
        copies: 1,
        sizing: "fillPrintArea",
        ...(product.attributes ? { attributes: product.attributes } : {}),
        assets: [{ printArea: "default", url: input.assetUrl }],
      },
    ],
  };
}

async function prodigiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const key = process.env.PRODIGI_API_KEY;
  if (!key) throw new Error("PRODIGI_API_KEY is not set");
  return fetch(`${prodigiBaseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-API-Key": key, ...(init.headers ?? {}) },
  });
}

/** Place the order. Throws with Prodigi's message on anything but a created order. */
export async function createProdigiOrder(input: ProdigiOrderInput): Promise<ProdigiOrder> {
  const res = await prodigiFetch("/Orders", {
    method: "POST",
    body: JSON.stringify(prodigiOrderBody(input)),
    ...(input.idempotencyKey ? { headers: { "Idempotency-Key": input.idempotencyKey } } : {}),
  });
  const data = (await res.json().catch(() => ({}))) as { outcome?: string; order?: ProdigiOrder; message?: string; issues?: unknown };
  if (!res.ok || !data.order?.id) {
    throw new Error(`Prodigi order failed (${res.status} ${data.outcome ?? ""}): ${data.message ?? JSON.stringify(data.issues ?? data)}`);
  }
  return data.order;
}

export async function getProdigiOrder(id: string): Promise<ProdigiOrder | null> {
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) return null;
  const res = await prodigiFetch(`/Orders/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { order?: ProdigiOrder };
  return data.order ?? null;
}

/** The first shipment with tracking, if the order has left the printer. */
export function shippedTracking(order: ProdigiOrder): { carrier: string; url: string | null; number: string | null } | null {
  const s = order.shipments?.find((x) => x.tracking?.url || x.tracking?.number);
  if (!s) return null;
  return { carrier: s.carrier?.name ?? "the carrier", url: s.tracking?.url ?? null, number: s.tracking?.number ?? null };
}
