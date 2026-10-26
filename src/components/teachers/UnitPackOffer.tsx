"use client";

/**
 * The Ancient Egypt Writing Unit offer: buy the five-lesson pack ($19 / £15, no account) or open the free
 * Lesson 1 sample, with an optional "email me the sample" box. Used on /teachers, /teachers/worksheet and
 * /teachers/unit-pack.
 *
 * The price and paper size depend on the visitor's country cookie, read after mount (the server render shows
 * no price, so the two renders agree).
 *
 * GA4: unit_pack_view (half on screen, once; location), unit_pack_sample (location; method: open | email),
 * unit_pack_click (location; paper) then begin_checkout (value, currency, plan "unit-pack", location "teachers").
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { currencyForCountry, readCountryCookie, type Currency } from "@/lib/pricing";
import {
  UNIT_PACK,
  UNIT_PACK_PAGE,
  paperForCountry,
  unitPackAmount,
  unitPackPrice,
  unitPackSamplePath,
  type Paper,
  type UnitPackFrom,
} from "@/lib/unit-pack/product";

const CONTENTS = [
  "5 lesson plans, about 50 minutes each, with timings and what to say",
  "A pupil worksheet for every lesson, plus the 25-sign alphabet chart",
  "End-of-unit quiz (20 marks), a creative task with a rubric, full answer key",
  "Curriculum links: England KS2 history, US grade 6 (C3, Common Core)",
];

type Props = {
  location: UnitPackFrom;
  /** "card": a self-contained panel. "compact": the worksheet's screen-only panel. */
  variant?: "card" | "compact";
  heading?: string;
};

export default function UnitPackOffer({ location, variant = "card", heading = "The Ancient Egypt Writing Unit" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [paper, setPaper] = useState<Paper>("a4");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [email, setEmail] = useState("");
  const [mail, setMail] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [mailError, setMailError] = useState("");

  useEffect(() => {
    const country = readCountryCookie();
    setCurrency(currencyForCountry(country));
    setPaper(paperForCountry(country));
    try {
      setCancelled(new URLSearchParams(window.location.search).get("unit_pack") === "cancelled");
    } catch {
      /* no URL, no note */
    }
  }, []);

  // Seen: half on screen, once per page view.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          trackEvent("unit_pack_view", { location });
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [location]);

  async function buy() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const cur = currency ?? "USD";
    trackEvent("unit_pack_click", { location, paper });
    try {
      const res = await fetch("/api/unit-pack/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: location, paper }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start the checkout. Please try again.");
      trackEvent("begin_checkout", { value: unitPackAmount(cur), currency: cur, plan: UNIT_PACK.id, location: "teachers" });
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the checkout. Please try again.");
      setBusy(false);
    }
  }

  async function emailSample(e: React.FormEvent) {
    e.preventDefault();
    if (mail === "sending") return;
    setMail("sending");
    setMailError("");
    try {
      const res = await fetch("/api/unit-pack/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, paper }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMailError(data?.error || "Could not send the email. Try again in a moment.");
        setMail("error");
        return;
      }
      setMail("sent");
      trackEvent("unit_pack_sample", { location, method: "email" });
    } catch {
      setMailError("Could not send the email. Check your connection and try again.");
      setMail("error");
    }
  }

  const price = currency ? unitPackPrice(currency) : "";
  const compact = variant === "compact";

  return (
    <div
      ref={ref}
      id={compact ? undefined : "unit-pack"}
      className={`scroll-mt-28 border border-gold-500/50 bg-gradient-to-b from-gold-500/[0.08] to-obsidian-light/50 ${compact ? "p-5" : "p-6 md:p-8"}`}
    >
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">
        {compact ? "Want the whole unit?" : "Teacher pack · PDF"}
      </p>
      <h3 className={`mt-2 font-display text-sand-100 ${compact ? "text-xl" : "text-2xl md:text-3xl"}`}>{heading}</h3>
      <p className="mt-2 font-body text-sm leading-relaxed text-sand-300">
        {compact
          ? "This worksheet is one lesson. The unit is five, ready to teach: the Rosetta Stone, the alphabet, real cartouches, determinatives and an assessment."
          : "Five ready-to-teach lessons on hieroglyphs, from the Rosetta Stone to reading Tutankhamun's cartouche. Print it, teach it, keep it."}
      </p>

      <div className={`mt-4 grid gap-5 ${compact ? "" : "md:grid-cols-[1.3fr_1fr]"}`}>
        <ul className="space-y-1.5">
          {CONTENTS.map((c) => (
            <li key={c} className="flex gap-2 font-body text-sm leading-snug text-sand-300">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              {c}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={buy}
            disabled={busy}
            className="btn-primary w-full justify-center px-5 text-sm disabled:opacity-60"
          >
            {busy ? "Opening checkout" : `Get the unit${price ? ` · ${price}` : ""}`}
          </button>
          <a
            href={unitPackSamplePath(paper)}
            target="_blank"
            rel="noopener"
            onClick={() => trackEvent("unit_pack_sample", { location, method: "open" })}
            className="btn-secondary w-full justify-center px-5 text-sm"
          >
            Free sample: Lesson 1 (PDF)
          </a>
          <div className="flex items-center justify-between gap-3 font-body text-xs text-sand-500">
            <span>Paper size</span>
            <div role="radiogroup" aria-label="Paper size" className="flex border border-gold-700/40">
              {(["a4", "letter"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={paper === p}
                  onClick={() => setPaper(p)}
                  className={`px-3 py-1.5 ${paper === p ? "bg-gold-500/20 text-gold-300" : "text-sand-400 hover:text-sand-200"}`}
                >
                  {p === "a4" ? "A4" : "US Letter"}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="font-body text-xs text-red-300" role="alert">
              {error}
            </p>
          )}
          {cancelled && !error && <p className="font-body text-xs text-sand-500">Checkout cancelled: you have not been charged.</p>}
          <p className="font-body text-xs leading-relaxed text-sand-500">
            One-off payment, no account needed. The PDF arrives by email and downloads straight after paying. For one teacher and their classes; 14-day money-back guarantee.
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-gold-700/25 pt-4">
        {mail === "sent" ? (
          <p className="font-body text-sm text-sand-300" role="status">
            Sent to {email.trim()}: Lesson 1 with its worksheet and answers.
          </p>
        ) : (
          <form onSubmit={emailSample} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor={`unit-sample-${location}`} className="font-body text-sm text-sand-400 sm:shrink-0">
              Or email me the free lesson:
            </label>
            <div className="flex min-w-0 flex-1 gap-2">
              <input
                id={`unit-sample-${location}`}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.org"
                className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-3 py-2 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-500 focus:outline-none"
              />
              <button type="submit" disabled={mail === "sending"} className="btn-secondary shrink-0 justify-center px-4 py-2 text-sm disabled:opacity-60">
                {mail === "sending" ? "Sending" : "Send"}
              </button>
            </div>
          </form>
        )}
        {mail === "error" && (
          <p className="mt-1 font-body text-xs text-red-300" role="alert">
            {mailError}
          </p>
        )}
        {location !== "unit-pack" && (
          <Link href={UNIT_PACK_PAGE} className="mt-3 inline-block font-body text-sm text-gold-400 underline underline-offset-4 hover:text-gold-300">
            See every lesson in the unit
          </Link>
        )}
      </div>
    </div>
  );
}
