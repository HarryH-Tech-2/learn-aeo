"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FIELDS, buildSchema, schemaScript, type SchemaKind } from "@/lib/schema-generator";
import { trackEvent } from "@/lib/analytics";

const KINDS: { kind: SchemaKind; label: string; blurb: string }[] = [
  { kind: "Organization", label: "Organization", blurb: "Who you are: name, logo, profiles" },
  { kind: "Article", label: "Article", blurb: "A post or guide: author and dates" },
  { kind: "Product", label: "Product", blurb: "Something you sell: price and ratings" },
];

// A filled-in example per type (a made-up tea shop, the course's running example)
const EXAMPLES: Record<SchemaKind, Record<string, string>> = {
  Organization: {
    name: "Larkfield Tea",
    url: "https://www.larkfieldtea.example",
    logo: "https://www.larkfieldtea.example/logo.png",
    description: "Small-batch loose leaf tea, blended and packed in Yorkshire.",
    sameAs: "https://www.linkedin.com/company/larkfield-tea-example\nhttps://www.instagram.com/larkfieldtea.example",
  },
  Article: {
    headline: "How to brew loose leaf tea",
    description: "Water temperature, timing and ratios for black, green and oolong tea.",
    url: "https://www.larkfieldtea.example/guides/brew-loose-leaf",
    image: "https://www.larkfieldtea.example/images/brewing.jpg",
    authorName: "Sam Lee",
    authorUrl: "https://www.larkfieldtea.example/about/sam-lee",
    datePublished: "2026-09-14",
    dateModified: "2026-10-30",
    publisherName: "Larkfield Tea",
    publisherUrl: "https://www.larkfieldtea.example",
  },
  Product: {
    name: "Breakfast blend, 250 g",
    description: "A malty Assam and Ceylon blend that takes milk well.",
    image: "https://www.larkfieldtea.example/images/breakfast-blend.jpg",
    brand: "Larkfield Tea",
    sku: "LT-BB-250",
    url: "https://www.larkfieldtea.example/shop/breakfast-blend",
    price: "12.50",
    currency: "GBP",
    availability: "InStock",
    ratingValue: "4.7",
    reviewCount: "86",
  },
};

const HINT_STYLE = {
  error: { cls: "cite-fail", icon: "✕", label: "Fix" },
  warn: { cls: "cite-warn", icon: "!", label: "Recommended" },
  tip: { cls: "cite-tip", icon: "i", label: "Tip" },
} as const;

const inputCls =
  "mt-1 block w-full rounded-lg bg-obsidian-lighter border border-gold-700/30 focus:border-cyan-400/60 outline-none px-3 py-2.5 font-body text-base text-sand-100 placeholder:text-sand-600";

export default function SchemaGenerator() {
  const [kind, setKind] = useState<SchemaKind>("Organization");
  const [values, setValues] = useState<Record<SchemaKind, Record<string, string>>>({ Organization: {}, Article: {}, Product: {} });
  const [copied, setCopied] = useState(false);
  const tracked = useRef(false);

  const { data, hints } = useMemo(() => buildSchema(kind, values[kind]), [kind, values]);
  const snippet = useMemo(() => schemaScript(data), [data]);
  const errors = hints.filter((h) => h.level === "error").length;

  useEffect(() => setCopied(false), [snippet]);

  const set = (key: string, v: string) => {
    setValues((all) => ({ ...all, [kind]: { ...all[kind], [key]: v } }));
    if (!tracked.current) {
      tracked.current = true;
      trackEvent("tool_used", { tool: "schema-generator", kind });
    }
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      trackEvent("tool_used", { tool: "schema-generator", kind, action: "copy" });
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="card-ancient p-5 sm:p-8">
      <div role="tablist" aria-label="Schema type" className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            role="tab"
            aria-selected={kind === k.kind}
            onClick={() => setKind(k.kind)}
            className={`schema-kind ${kind === k.kind ? "schema-kind-on" : ""}`}
          >
            <span className="font-display text-lg font-bold">{k.label}</span>
            <span className="font-body text-sm opacity-80">{k.blurb}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label={`${kind} details`}>
          <div className="flex justify-between items-center">
            <p className="font-body text-sm text-sand-400">Fields marked * are required.</p>
            <button type="button" onClick={() => setValues((all) => ({ ...all, [kind]: EXAMPLES[kind] }))} className="font-body text-sm text-cyan-400 underline underline-offset-2">
              Fill with an example
            </button>
          </div>
          {FIELDS[kind].map((f) => {
            const v = values[kind][f.key] ?? "";
            const id = `schema-${kind}-${f.key}`;
            return (
              <div key={f.key}>
                <label htmlFor={id} className="font-body text-sm text-sand-300">
                  {f.label}
                  {f.required && <span className="text-cyan-400"> *</span>}
                </label>
                {f.type === "textarea" || f.type === "lines" ? (
                  <textarea id={id} rows={f.type === "lines" ? 3 : 2} value={v} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />
                ) : f.type === "select" ? (
                  <select id={id} value={v} onChange={(e) => set(f.key, e.target.value)} className={inputCls}>
                    {f.options!.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={id}
                    type={f.type === "date" ? "date" : "text"}
                    inputMode={f.type === "number" ? "decimal" : f.type === "url" ? "url" : undefined}
                    value={v}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.key, e.target.value)}
                    className={inputCls}
                  />
                )}
                {f.help && <p className="font-body text-xs text-sand-500 mt-1">{f.help}</p>}
              </div>
            );
          })}
        </form>

        <div className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="schema-output">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="font-body text-xs uppercase tracking-[0.2em] text-sand-400">JSON-LD</span>
              <button type="button" onClick={copy} className="rounded-full px-3 py-1 font-body text-sm text-cyan-300 border border-cyan-400/40 hover:bg-cyan-400/10">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="schema-code p-4 overflow-x-auto text-[13px] leading-relaxed font-mono max-h-[28rem]">
              <code>{snippet}</code>
            </pre>
          </div>

          <div aria-live="polite">
            <p className="font-display text-lg font-bold text-sand-100 mb-2">
              {errors ? `${errors} ${errors === 1 ? "thing" : "things"} to fix` : hints.length ? "Valid. A few suggestions:" : "Looks good."}
            </p>
            <ul className="space-y-2">
              {hints.map((h) => {
                const s = HINT_STYLE[h.level];
                return (
                  <li key={h.text} className={`cite-check cite-check-sm ${s.cls}`}>
                    <span aria-hidden="true" className="cite-icon">{s.icon}</span>
                    <p className="font-body text-sm text-sand-200">
                      <span className="sr-only">{s.label}: </span>
                      {h.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="font-body text-sm text-sand-400">
            Paste the snippet into the page&rsquo;s HTML, then test it with Google&rsquo;s{" "}
            <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener" className="text-cyan-400 underline underline-offset-2">
              Rich Results Test
            </a>{" "}
            or the{" "}
            <a href="https://validator.schema.org/" target="_blank" rel="noopener" className="text-cyan-400 underline underline-offset-2">
              Schema Markup Validator
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
