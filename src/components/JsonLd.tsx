// The only place a JSON-LD script tag is written (builders in src/lib/schema.ts). One node gets
// @context added; several become one @graph. Every "<" is escaped, so text such as
// "</script>" or "<!--" inside a title or an FAQ answer cannot end the tag early.

export default function JsonLd({ data }: { data: object | object[] }) {
  const doc = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(doc).replace(/</g, "\\u003c") }}
    />
  );
}
