"use client";

/**
 * "Pay by invoice / purchase order" on /teachers/licence: for school offices that cannot pay by card.
 * Sends POST /api/licence/invoice (Stripe emails the invoice, or Harry raises it by hand within a working day)
 * and offers a one-page quote PDF (GET /api/licence/quote) built from whatever is filled in so far.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PLANS, formatPlanPrice } from "@/lib/plans";
import { currencyForCountry, readCountryCookie } from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics";

type Plan = "classroom" | "school";

const COUNTRIES: { code: string; name: string }[] = [
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "ZA", name: "South Africa" },
  { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "EG", name: "Egypt" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "MY", name: "Malaysia" },
  { code: "JP", name: "Japan" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "PL", name: "Poland" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
];

type Form = {
  plan: Plan;
  schoolName: string;
  contactName: string;
  contactEmail: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
  poNumber: string;
  vatNumber: string;
  renewLicenceId: string;
};

type Result = { mode: "sent"; number: string | null; hostedInvoiceUrl: string | null; dueDays: number; to: string } | { mode: "manual"; to: string };

const inputClass = "w-full bg-obsidian-lighter border border-gold-700/30 px-3 py-2.5 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-500/60 outline-none";
const labelClass = "block font-body text-xs text-sand-400 mb-1.5";

export default function InvoiceRequest({ defaultOpen = false, userEmail }: { defaultOpen?: boolean; userEmail?: string | null }) {
  const [open, setOpen] = useState(defaultOpen);
  const [form, setForm] = useState<Form>({
    plan: "school",
    schoolName: "",
    contactName: "",
    contactEmail: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "GB",
    poNumber: "",
    vatNumber: "",
    renewLicenceId: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const cc = readCountryCookie()?.toUpperCase();
    if (cc && COUNTRIES.some((c) => c.code === cc)) setForm((f) => ({ ...f, country: cc }));
    // From a link (pricing page, renewal email): ?plan=classroom|school and ?renew=<licence id>
    const q = new URLSearchParams(window.location.search);
    const plan = q.get("plan");
    const renew = q.get("renew") ?? "";
    setForm((f) => ({
      ...f,
      ...(plan === "classroom" || plan === "school" ? { plan } : {}),
      ...(/^[a-z0-9]{8,40}$/.test(renew) ? { renewLicenceId: renew } : {}),
    }));
  }, []);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const currency = currencyForCountry(form.country);
  const price = (p: Plan) => formatPlanPrice(PLANS[p], currency);

  const quoteHref = useMemo(() => {
    const q = new URLSearchParams({ plan: form.plan, country: form.country });
    const add = (k: string, v: string) => v.trim() && q.set(k, v.trim());
    add("school", form.schoolName);
    add("contact", form.contactName);
    add("line1", form.line1);
    add("line2", form.line2);
    add("city", form.city);
    add("postcode", form.postcode);
    return `/api/licence/quote?${q.toString()}`;
  }, [form]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/licence/invoice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please email contact@learnhieroglyphics.com and we'll send the invoice by hand.");
        return;
      }
      trackEvent("licence_invoice_request", { plan: form.plan, country: form.country, outcome: data.mode });
      setResult(data.mode === "sent" ? { mode: "sent", number: data.number, hostedInvoiceUrl: data.hostedInvoiceUrl, dueDays: data.dueDays, to: form.contactEmail } : { mode: "manual", to: form.contactEmail });
    } catch {
      setError("Couldn't reach the server. Please try again, or email contact@learnhieroglyphics.com.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="invoice" className="card-ancient p-6 md:p-8 mb-8 scroll-mt-28">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-1">Schools</p>
          <h2 className="font-display text-2xl text-sand-100">Pay by invoice or purchase order</h2>
          <p className="font-body text-sm text-sand-400 mt-1 max-w-2xl">
            For a school office that can&apos;t pay by card: we email an invoice payable within 30 days by bank transfer or card, with your PO number on it.
            The licence goes live on your account the day it&apos;s paid.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 font-body text-sm text-gold-200">
            <span aria-hidden="true">✓</span>
            No auto-renewal. It runs for a year, and we email you a month before it ends so you can renew with the same class code, or let it lapse.
          </p>
        </div>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className="btn-secondary py-2.5 px-5 text-sm shrink-0">
            Request an invoice
          </button>
        )}
      </div>

      {open && result && (
        <div className="mt-6 border border-gold-500/30 bg-gold-500/5 p-5" role="status">
          {result.mode === "sent" ? (
            <>
              <p className="font-body text-sm text-sand-100 mb-2">
                Invoice {result.number ? <strong>{result.number}</strong> : null} sent to <strong>{result.to}</strong>. It&apos;s payable within {result.dueDays} days by bank transfer or card.
              </p>
              <p className="font-body text-sm text-sand-400">
                Your licence and class code arrive by email the day it&apos;s paid.
                {result.hostedInvoiceUrl && (
                  <>
                    {" "}
                    You can also{" "}
                    <a href={result.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
                      open the invoice
                    </a>{" "}
                    to download it or pay now.
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="font-body text-sm text-sand-100 mb-2">Thank you. We&apos;ll email your invoice to <strong>{result.to}</strong> within one working day.</p>
              <p className="font-body text-sm text-sand-400">Your licence and class code arrive by email the day it&apos;s paid. Questions: contact@learnhieroglyphics.com.</p>
            </>
          )}
        </div>
      )}

      {open && !result && (
        <form onSubmit={submit} className="mt-6 space-y-5">
          <fieldset>
            <legend className={labelClass}>Licence</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {(["school", "classroom"] as Plan[]).map((p) => (
                <label key={p} className={`flex items-start gap-3 border p-4 cursor-pointer ${form.plan === p ? "border-gold-500/60 bg-gold-500/5" : "border-gold-700/25"}`}>
                  <input type="radio" name="plan" value={p} checked={form.plan === p} onChange={() => set("plan", p)} className="mt-1 accent-[#d4a832]" />
                  <span>
                    <span className="block font-body text-sm text-sand-100">
                      {PLANS[p].name} · {price(p)} {currency} for 12 months
                    </span>
                    <span className="block font-body text-xs text-sand-500">{PLANS[p].audience}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="inv-school" className={labelClass}>School name</label>
              <input id="inv-school" required value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} className={inputClass} autoComplete="organization" />
            </div>
            <div>
              <label htmlFor="inv-contact" className={labelClass}>Invoice for the attention of</label>
              <input id="inv-contact" required value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="e.g. School business manager" className={inputClass} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="inv-email" className={labelClass}>Email the invoice to</label>
              <input id="inv-email" type="email" required value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="finance@school.org.uk" className={inputClass} autoComplete="email" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="inv-line1" className={labelClass}>Billing address</label>
              <input id="inv-line1" required value={form.line1} onChange={(e) => set("line1", e.target.value)} placeholder="First line" className={`${inputClass} mb-2`} autoComplete="address-line1" />
              <input aria-label="Billing address, second line (optional)" value={form.line2} onChange={(e) => set("line2", e.target.value)} placeholder="Second line (optional)" className={inputClass} autoComplete="address-line2" />
            </div>
            <div>
              <label htmlFor="inv-city" className={labelClass}>Town or city</label>
              <input id="inv-city" required value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} autoComplete="address-level2" />
            </div>
            <div>
              <label htmlFor="inv-postcode" className={labelClass}>Postcode / ZIP</label>
              <input id="inv-postcode" required value={form.postcode} onChange={(e) => set("postcode", e.target.value)} className={inputClass} autoComplete="postal-code" />
            </div>
            <div>
              <label htmlFor="inv-country" className={labelClass}>Country</label>
              <select id="inv-country" value={form.country} onChange={(e) => set("country", e.target.value)} className={inputClass} autoComplete="country">
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="font-body text-[11px] text-sand-600 mt-1">Invoiced in {currency === "GBP" ? "pounds (GBP)" : "US dollars (USD)"}. Not listed? Email contact@learnhieroglyphics.com.</p>
            </div>
            <div>
              <label htmlFor="inv-po" className={labelClass}>Purchase order number (optional)</label>
              <input id="inv-po" value={form.poNumber} onChange={(e) => set("poNumber", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="inv-vat" className={labelClass}>School VAT number (optional)</label>
              <input id="inv-vat" value={form.vatNumber} onChange={(e) => set("vatNumber", e.target.value)} className={inputClass} />
            </div>
          </div>

          <p className="font-body text-xs text-sand-500">
            The licence is added to the account you&apos;re signed in with{userEmail ? ` (${userEmail})` : ""}. We use these details only to invoice the school:{" "}
            <Link href="/teachers/privacy" className="text-gold-500 hover:text-gold-300 underline underline-offset-4">
              privacy &amp; safeguarding for schools
            </Link>
            .
          </p>

          {error && (
            <p className="font-body text-sm text-terracotta" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className="btn-primary py-3 px-7 text-sm disabled:opacity-60">
              {busy ? "Sending…" : `Send the invoice (${price(form.plan)})`}
            </button>
            <a href={quoteHref} onClick={() => trackEvent("licence_quote_download", { plan: form.plan, country: form.country })} className="btn-secondary py-3 px-6 text-sm" download>
              Download a quote (PDF)
            </a>
          </div>
        </form>
      )}

      {!open && (
        <p className="font-body text-xs text-sand-500 mt-4">
          Need a quote first?{" "}
          <a href={quoteHref} onClick={() => trackEvent("licence_quote_download", { plan: form.plan, country: form.country })} className="text-gold-500 hover:text-gold-300 underline underline-offset-4" download>
            Download a quote (PDF)
          </a>{" "}
          for the School licence, valid 30 days.
        </p>
      )}
    </section>
  );
}
