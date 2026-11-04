/**
 * The Schema Generator (tools/schema-generator): form fields in, schema.org JSON-LD out, plus hints that catch the
 * common mistakes. Runs in the browser; pure functions so the output is tested.
 *
 * Hints that cite Google rest on Search Central's structured data guides (Article, Product snippets, Organization),
 * checked 2026-11-04. The rest are plain validity checks (absolute URLs, ISO dates, numbers).
 */

export type SchemaKind = "Organization" | "Article" | "Product";

export type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  /** "lines" fields take one value per line (sameAs, images) */
  type?: "text" | "url" | "date" | "number" | "textarea" | "lines" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  help?: string;
};

export type Hint = { level: "error" | "warn" | "tip"; text: string };

export const FIELDS: Record<SchemaKind, FieldDef[]> = {
  Organization: [
    { key: "name", label: "Organization name", placeholder: "Larkfield Tea", required: true },
    { key: "url", label: "Website", type: "url", placeholder: "https://www.example.com", required: true },
    { key: "logo", label: "Logo URL", type: "url", placeholder: "https://www.example.com/logo.png" },
    { key: "description", label: "Description", type: "textarea", placeholder: "One or two sentences on what you do." },
    { key: "email", label: "Contact email", placeholder: "hello@example.com" },
    { key: "telephone", label: "Phone", placeholder: "+44 20 7946 0000" },
    { key: "sameAs", label: "Profiles (one URL per line)", type: "lines", placeholder: "https://www.linkedin.com/company/…\nhttps://x.com/…", help: "Your official profiles elsewhere: LinkedIn, X, YouTube, Wikipedia, Crunchbase." },
  ],
  Article: [
    { key: "headline", label: "Headline", placeholder: "How long does AEO take?", required: true },
    { key: "description", label: "Summary", type: "textarea" },
    { key: "url", label: "Article URL", type: "url", placeholder: "https://www.example.com/blog/aeo-timeline" },
    { key: "image", label: "Image URLs (one per line)", type: "lines", placeholder: "https://www.example.com/images/aeo.jpg" },
    { key: "authorName", label: "Author name", placeholder: "Sam Lee" },
    { key: "authorUrl", label: "Author profile URL", type: "url", placeholder: "https://www.example.com/about/sam-lee" },
    { key: "datePublished", label: "Published", type: "date" },
    { key: "dateModified", label: "Last updated", type: "date" },
    { key: "publisherName", label: "Publisher name", placeholder: "Larkfield Tea" },
    { key: "publisherUrl", label: "Publisher website", type: "url" },
  ],
  Product: [
    { key: "name", label: "Product name", placeholder: "Breakfast blend, 250 g", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "image", label: "Image URLs (one per line)", type: "lines" },
    { key: "brand", label: "Brand" },
    { key: "sku", label: "SKU" },
    { key: "url", label: "Product page URL", type: "url" },
    { key: "price", label: "Price", type: "number", placeholder: "12.50" },
    { key: "currency", label: "Currency (ISO code)", placeholder: "GBP" },
    {
      key: "availability",
      label: "Availability",
      type: "select",
      options: [
        { value: "", label: "Not set" },
        { value: "InStock", label: "In stock" },
        { value: "OutOfStock", label: "Out of stock" },
        { value: "PreOrder", label: "Pre-order" },
        { value: "BackOrder", label: "Back order" },
      ],
    },
    { key: "ratingValue", label: "Average rating", type: "number", placeholder: "4.6" },
    { key: "reviewCount", label: "Number of reviews", type: "number", placeholder: "128" },
  ],
};

const isAbsoluteUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};
const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(s) && !Number.isNaN(Date.parse(s));
const lines = (s: string | undefined) => (s ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const clean = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)));

export function buildSchema(kind: SchemaKind, raw: Record<string, string>): { data: Record<string, unknown>; hints: Hint[] } {
  const f: Record<string, string> = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, (v ?? "").trim()]));
  const hints: Hint[] = [];
  for (const def of FIELDS[kind]) {
    if (def.required && !f[def.key]) hints.push({ level: "error", text: `${def.label} is required.` });
    if (def.type === "url" && f[def.key] && !isAbsoluteUrl(f[def.key])) hints.push({ level: "error", text: `${def.label} must be a full URL starting with https://.` });
    if (def.type === "lines") for (const l of lines(f[def.key])) if (!isAbsoluteUrl(l)) hints.push({ level: "error", text: `“${l}” in ${def.label.replace(/ \(.*\)$/, "")} isn't a full URL.` });
    if (def.type === "date" && f[def.key] && !isIsoDate(f[def.key])) hints.push({ level: "error", text: `${def.label} should be an ISO 8601 date, like 2026-11-04.` });
  }

  let data: Record<string, unknown>;
  if (kind === "Organization") {
    data = clean({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: f.name,
      url: f.url,
      logo: f.logo,
      description: f.description,
      email: f.email,
      telephone: f.telephone,
      sameAs: lines(f.sameAs),
    });
    if (!f.logo) hints.push({ level: "tip", text: "Add a logo: Google can use it for your organization in search results." });
    if (!lines(f.sameAs).length) hints.push({ level: "tip", text: "List your official profiles in sameAs, so search engines can connect them to you." });
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) hints.push({ level: "warn", text: "The email address doesn't look valid." });
  } else if (kind === "Article") {
    const author = f.authorName ? clean({ "@type": "Person", name: f.authorName, url: f.authorUrl }) : undefined;
    const publisher = f.publisherName ? clean({ "@type": "Organization", name: f.publisherName, url: f.publisherUrl }) : undefined;
    data = clean({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: f.headline,
      description: f.description,
      url: f.url,
      mainEntityOfPage: f.url || undefined,
      image: lines(f.image),
      author,
      datePublished: f.datePublished,
      dateModified: f.dateModified,
      publisher,
    });
    if (!f.authorName) hints.push({ level: "warn", text: "Name the author. Google recommends author, and a named person helps readers and AI tools judge the source." });
    if (f.authorName && /^(admin|staff|team|editor)$/i.test(f.authorName)) hints.push({ level: "warn", text: "Use a real person's name for the author, not a role." });
    if (!f.datePublished) hints.push({ level: "warn", text: "Add the published date. Google recommends datePublished and dateModified." });
    if (f.datePublished && f.dateModified && isIsoDate(f.datePublished) && isIsoDate(f.dateModified) && Date.parse(f.dateModified) < Date.parse(f.datePublished))
      hints.push({ level: "error", text: "Last updated is earlier than the published date." });
    if (!lines(f.image).length) hints.push({ level: "tip", text: "Add at least one image URL. Google recommends image for articles." });
  } else {
    const hasPrice = !!f.price;
    const offers = hasPrice
      ? clean({
          "@type": "Offer",
          price: f.price,
          priceCurrency: f.currency.toUpperCase(),
          availability: f.availability ? `https://schema.org/${f.availability}` : undefined,
          url: f.url,
        })
      : undefined;
    const rating =
      f.ratingValue && f.reviewCount ? { "@type": "AggregateRating", ratingValue: f.ratingValue, reviewCount: f.reviewCount } : undefined;
    data = clean({
      "@context": "https://schema.org",
      "@type": "Product",
      name: f.name,
      description: f.description,
      image: lines(f.image),
      brand: f.brand ? { "@type": "Brand", name: f.brand } : undefined,
      sku: f.sku,
      url: f.url,
      offers,
      aggregateRating: rating,
    });
    if (!hasPrice && !rating) hints.push({ level: "warn", text: "Google's product snippets need at least one of offers (a price), aggregateRating or review. Add a price or ratings." });
    if (hasPrice && !/^\d+(\.\d{1,2})?$/.test(f.price)) hints.push({ level: "error", text: "Price must be a plain number, like 12.50 (no currency symbol)." });
    if (hasPrice && !/^[A-Za-z]{3}$/.test(f.currency)) hints.push({ level: "error", text: "Add a three-letter currency code with the price, like USD, GBP or EUR." });
    if ((f.ratingValue && !f.reviewCount) || (!f.ratingValue && f.reviewCount)) hints.push({ level: "warn", text: "Ratings need both the average rating and the number of reviews." });
    if (f.ratingValue && (Number(f.ratingValue) < 1 || Number(f.ratingValue) > 5)) hints.push({ level: "warn", text: "An average rating is usually on a 1 to 5 scale; set bestRating if yours isn't." });
    if (rating) hints.push({ level: "tip", text: "Only mark up ratings that appear on the page itself, from real customers." });
  }
  return { data, hints };
}

/** The finished snippet to paste into the page's HTML. */
export function schemaScript(data: Record<string, unknown>): string {
  // "</" inside a string would end the script element early
  const json = JSON.stringify(data, null, 2).replace(/<\//g, "<\\/");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}
