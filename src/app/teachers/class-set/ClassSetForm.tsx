"use client";

/**
 * The Class Cartouche Set order form (src/lib/class-set.ts): paste the class list, pick a paper, see the first
 * pupil's page, pay. The list is parsed as it is typed so the teacher sees exactly what will print (names, any
 * line that gives no signs, anything past the limit); the checkout route parses it again.
 *
 * GA4: class_set_view (once, when the form is on screen), class_set_paper (theme), class_set_click (count, theme,
 * from) then begin_checkout (value, currency, plan "class-set").
 */
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import CartouchePrintPreview from "@/components/CartouchePrintPreview";
import { trackEvent, trackEventWhenReady } from "@/lib/analytics";
import { currencyForCountry, readCountryCookie, type Currency } from "@/lib/pricing";
import { cartouchePrintThemeById, type CartouchePrintThemeId } from "@/lib/cartouche-print";
import {
  CLASS_SET,
  CLASS_SET_MAX_NAMES,
  CLASS_SET_THEMES,
  DEFAULT_CLASS_SET_THEME,
  classSetAmount,
  classSetPrice,
  parseClassList,
} from "@/lib/class-set";

const EXAMPLE = "Olivia\nNoah\nAva\nLiam";

export default function ClassSetForm({ from }: { from: string }) {
  const [raw, setRaw] = useState("");
  const [theme, setTheme] = useState<CartouchePrintThemeId>(DEFAULT_CLASS_SET_THEME);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrency(currencyForCountry(readCountryCookie()));
    return trackEventWhenReady("class_set_view", { location: from });
  }, [from]);

  const parsed = useMemo(() => parseClassList(raw), [raw]);
  const first = parsed.names[0] ?? "Olivia";
  const price = currency ? classSetPrice(currency) : "";

  async function buy() {
    if (busy || parsed.names.length === 0) return;
    setBusy(true);
    setError("");
    const cur = currency ?? "USD";
    trackEvent("class_set_click", { location: from, count: parsed.names.length, theme });
    trackEvent("begin_checkout", { value: classSetAmount(cur), currency: cur, plan: CLASS_SET.id, location: from });
    try {
      const res = await fetch("/api/class-set/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: raw, theme, from }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) throw new Error(data?.error || "Could not start the checkout.");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the checkout.");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,16rem)]">
      <div>
        <label htmlFor="class-list" className="block font-body text-sm font-semibold text-sand-100">
          Your class list
        </label>
        <p className="mt-1 font-body text-xs text-sand-400">
          One name per line, or paste a column from your register. Up to {CLASS_SET_MAX_NAMES} names; first names work best.
        </p>
        <textarea
          id="class-list"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          placeholder={EXAMPLE}
          spellCheck={false}
          className="mt-3 w-full border border-gold-700/30 bg-obsidian-lighter p-3 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none"
        />
        <p className="mt-2 font-body text-sm text-sand-300" aria-live="polite">
          {parsed.names.length === 0
            ? "No names yet."
            : `${parsed.names.length} name${parsed.names.length === 1 ? "" : "s"}: ${parsed.names.length} pupil pages and a class page.`}
          {parsed.overflow > 0 && (
            <span className="block text-gold-300">
              {parsed.overflow} name{parsed.overflow === 1 ? "" : "s"} past the {CLASS_SET_MAX_NAMES}-name limit won&rsquo;t print. Buy a second set for them.
            </span>
          )}
          {parsed.skipped.length > 0 && (
            <span className="block text-sand-400">Skipped (no letters to spell): {parsed.skipped.join(", ")}</span>
          )}
        </p>

        <fieldset className="mt-6">
          <legend className="font-body text-sm font-semibold text-sand-100">Paper</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {CLASS_SET_THEMES.map((id) => {
              const t = cartouchePrintThemeById(id);
              const on = theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setTheme(id);
                    trackEvent("class_set_paper", { theme: id });
                  }}
                  className={`flex w-28 flex-col items-center gap-1.5 border p-2 text-center transition-colors ${
                    on ? "border-gold-400 bg-gold-500/10" : "border-gold-700/25 hover:border-gold-500/50"
                  }`}
                >
                  {t.thumb ? (
                    <Image src={t.thumb} alt="" width={80} height={113} className="h-[70px] w-[50px] object-cover" />
                  ) : (
                    <span className="block h-[70px] w-[50px] border border-[#B8922A]" style={{ background: t.page }} aria-hidden="true" />
                  )}
                  <span className="font-body text-xs text-sand-100">{t.label}</span>
                  {id === "cream" && <span className="font-body text-[10px] leading-tight text-sand-500">Least ink</span>}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={buy}
            disabled={busy || parsed.names.length === 0}
            className="btn-primary justify-center whitespace-nowrap px-7 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Opening checkout…" : `Get the set${price ? ` · ${price}` : ""}`}
          </button>
          <p className="font-body text-xs text-sand-500">One payment, no account. The PDF comes by email and on the next page.</p>
        </div>
        {error && (
          <p role="alert" className="mt-3 font-body text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      <div>
        <p className="font-body text-xs uppercase tracking-[0.2em] text-sand-500">Page 1 of {Math.max(parsed.names.length, 1) + 1}</p>
        <CartouchePrintPreview name={first} theme={theme} className="mt-2 w-full shadow-[0_18px_40px_-20px_rgba(0,0,0,0.7)]" />
        <p className="mt-2 font-body text-xs text-sand-500">
          {parsed.names.length > 1 ? `Then ${parsed.names.slice(1, 3).join(", ")}${parsed.names.length > 3 ? "…" : ""}, one page each, and the class page.` : "One page per pupil, then the class page."}
        </p>
      </div>
    </div>
  );
}
