/**
 * Asks Prodigi which print and frame products the Cartouche Print could offer, and what each costs: read only
 * (product details and quotes, no orders). Run with the live key so the prices are real:
 *
 *   PRODIGI_API_KEY=… node scripts/dev/prodigi-catalogue.mjs            (live, api.prodigi.com)
 *   PRODIGI_API_KEY=… PRODIGI_ENV=sandbox node scripts/dev/prodigi-catalogue.mjs
 *
 * For every candidate SKU: whether it exists, its size, the attributes it takes (frame colour, mount, glaze…) and
 * their allowed values, the pixels the print area wants, then a quote (item + Standard postage) to GB and the US
 * with the first allowed value of each attribute. Paste the output back to set the sizes, frames and prices.
 *
 * Optional: PRODIGI_SKUS=GLOBAL-FAP-A3,... to quote only those, PRODIGI_COUNTRIES=GB,US,AU,... for more places
 * (default GB and US), PRODIGI_ATTRS='{"color":"black"}' to quote a frame in a given colour.
 */
const KEY = process.env.PRODIGI_API_KEY;
if (!KEY) {
  console.error("Set PRODIGI_API_KEY first.");
  process.exit(1);
}
const BASE = process.env.PRODIGI_ENV === "sandbox" ? "https://api.sandbox.prodigi.com/v4.0" : "https://api.prodigi.com/v4.0";

const CANDIDATES = process.env.PRODIGI_SKUS ? process.env.PRODIGI_SKUS.split(",") : [
  // unframed fine-art paper
  "GLOBAL-FAP-A4", "GLOBAL-FAP-A3", "GLOBAL-FAP-A2", "GLOBAL-FAP-A1",
  // classic frame with a mount
  "GLOBAL-CFPM-A4", "GLOBAL-CFPM-A3", "GLOBAL-CFPM-A2",
  // classic frame without a mount
  "GLOBAL-CFP-A4", "GLOBAL-CFP-A3", "GLOBAL-CFP-A2",
  // box frame with a mount
  "GLOBAL-BOXM-A4", "GLOBAL-BOXM-A3",
];
const COUNTRIES = (process.env.PRODIGI_COUNTRIES || "GB,US").split(",");
const ATTRS = process.env.PRODIGI_ATTRS ? JSON.parse(process.env.PRODIGI_ATTRS) : {};

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { "X-API-Key": KEY, "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

for (const sku of CANDIDATES) {
  const d = await api(`/products/${sku}`);
  if (!d.ok) {
    console.log(`\n${sku}: not available (${d.status} ${d.body?.outcome ?? ""})`);
    continue;
  }
  const p = d.body.product ?? {};
  const attrs = p.attributes ?? {};
  const areas = (p.variants?.[0]?.printAreaSizes && Object.entries(p.variants[0].printAreaSizes).map(([k, v]) => `${k} ${v.horizontalResolution}x${v.verticalResolution}px`)) || [];
  console.log(`\n${sku}: ${p.description ?? ""}`);
  console.log(`  size: ${JSON.stringify(p.productDimensions ?? {})}`);
  console.log(`  attributes: ${JSON.stringify(attrs)}`);
  console.log(`  print area: ${areas.join(", ") || "?"}`);
  const first = { ...Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])), ...ATTRS };
  for (const country of COUNTRIES) {
    const q = await api("/quotes", {
      method: "POST",
      body: JSON.stringify({
        shippingMethod: "Standard",
        destinationCountryCode: country,
        items: [{ sku, copies: 1, attributes: first, assets: [{ printArea: "default" }] }],
      }),
    });
    const quote = q.body?.quotes?.[0];
    if (!q.ok || !quote) {
      console.log(`  ${country}: no quote (${q.status} ${q.body?.outcome ?? ""})`);
      continue;
    }
    const c = quote.costSummary ?? {};
    console.log(`  ${country}: items ${c.items?.amount} ${c.items?.currency} + shipping ${c.shipping?.amount} ${c.shipping?.currency} = ${c.totalCost?.amount ?? "?"} ${c.totalCost?.currency ?? ""}`);
  }
}
