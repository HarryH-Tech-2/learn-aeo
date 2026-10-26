"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  CARTOUCHE_FAMILY,
  CARTOUCHE_PRINT_SIZES,
  CARTOUCHE_PRINT_THEMES,
  cartoucheFamilySurcharge,
  isUnframedPrint,
  cartouchePrintFormatById,
  cartouchePrintFromPrice,
  cartouchePrintOrderAmount,
  cartouchePrintThemeById,
  christmasNotice,
  cleanCartoucheNames,
  formatCartouchePrintOrderPrice,
  type CartouchePrintFormatId,
  type CartouchePrintThemeId,
} from "@/lib/cartouche-print";
import { normaliseShareName } from "@/lib/share";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { useLocalCurrency } from "@/components/Price";
import { inSeason } from "@/lib/keyboard-card";
import CartouchePrintPreview from "@/components/CartouchePrintPreview";
import CartoucheShareDialog from "@/components/CartoucheShareDialog";
import GuaranteeNote from "@/components/GuaranteeNote";

/**
 * The paid product under the free cartouche: the name in a cartouche as an HD
 * picture, or as a posted fine-art print, framed or not. Sold through Stripe
 * Checkout without an account; Prodigi prints and posts the physical ones.
 * Lives on the translator and the keyboard page.
 *
 * The card leads with the cheap option. In 28 days 67 visitors changed the
 * paper and none started a checkout while it opened on the framed ($79.99 then)
 * print, so it now opens on the HD image ("from $3.99") and lists the posted
 * and framed prints after it as upgrades.
 *
 * A family print: up to three more names on the same page, each in its own
 * cartouche, stacked. Same Prodigi SKU, so the posted and framed versions
 * cost a little more only for the extra handling (CARTOUCHE_FAMILY); the HD
 * image is the same price with any number of names.
 *
 * The digital-only PDF is still a valid format server-side (old sessions,
 * the webhook) but is not offered here: every print order includes it.
 *
 * Embedded (2026-10-18, the name translator): the print half of the one "Make it a picture" box
 * (src/components/NameCardStudio.tsx). The box's background picker sets the paper, so this has none of its own,
 * and the box already sells the HD picture, so only the posted and framed prints are offered.
 * Since 2026-10-20 it starts folded to one "Want it on the wall?" line under the box's HD button, opened on a tap
 * (cartouche_print_expand) or by a ?keep=print link; cartouche_print_view still counts the line being seen.
 */

/** The formats on the card, cheapest first: the HD image, then the prints as upgrades. */
const OFFERED_FORMATS = (["image", "print", "framed"] as const).map(cartouchePrintFormatById);
const OFFERED_IDS = OFFERED_FORMATS.map((f) => f.id);
const CARD_DEFAULT_FORMAT: CartouchePrintFormatId = "image";
const CARD_DEFAULT_THEME: CartouchePrintThemeId = "papyrus";
const MAX_EXTRA = CARTOUCHE_FAMILY.maxNames - 1;

/** Can this typed name go on the print? Blank counts as fine (it is simply left off). */
function writable(raw: string): boolean {
  if (raw.trim() === "") return true;
  const n = normaliseShareName(raw);
  return !!n && transliterateName(n).length > 0;
}

export default function CartouchePrintOffer({
  name,
  source = "translator",
  bleed = true,
  embedded = false,
  theme: chosenPaper,
  initialExtra,
}: {
  name: string;
  /** Which page it sits on: labels the events and brings a cancelled checkout back there. */
  source?: "translator" | "keyboard";
  /** Reach past the translator's narrow column on wide screens. */
  bleed?: boolean;
  /** Inside another box: no frame or paper picker of its own, prints only. */
  embedded?: boolean;
  /** The paper, when the box around it chooses it. */
  theme?: CartouchePrintThemeId;
  /** Names already on the print after `name` (the couple page's second name). */
  initialExtra?: string[];
}) {
  const currency = useLocalCurrency();
  const [ownTheme, setTheme] = useState<CartouchePrintThemeId>(CARD_DEFAULT_THEME);
  const theme = chosenPaper ?? ownTheme;
  const formats = embedded ? OFFERED_FORMATS.filter((f) => f.physical) : OFFERED_FORMATS;
  const [format, setFormat] = useState<CartouchePrintFormatId>(embedded ? "print" : CARD_DEFAULT_FORMAT);
  const [extra, setExtra] = useState<string[]>(() => (initialExtra ?? []).slice(0, MAX_EXTRA));
  // The couple page's second name can change while the box is open: keyed on the joined names, not the array
  const extraKey = (initialExtra ?? []).join("|");
  useEffect(() => {
    if (initialExtra) setExtra(initialExtra.slice(0, MAX_EXTRA));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraKey]);
  const cardRef = useRef<HTMLElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  // Embedded: folded to one line until asked for; "See it as a print" links (?keep=print) open it.
  const [open, setOpen] = useState(!embedded);
  useEffect(() => {
    if (embedded && new URLSearchParams(window.location.search).get("keep") === "print") setOpen(true);
  }, [embedded]);
  // Today, on the visitor's own calendar, for the Christmas line. Set after mount so the server render never disagrees.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  useEffect(() => {
    setError(null);
  }, [name]);

  // Every name on the print: the translator's name first, then the extra ones that can be written.
  const names = useMemo(() => cleanCartoucheNames([name, ...extra.filter((n) => writable(n))]), [name, extra]);
  const family = names.length > 1;
  const badExtra = extra.some((n) => !writable(n));

  // Counted once per name when a third of the card is on screen, so clicks can be read against views.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        trackEvent("cartouche_print_view", { name_length: name.length, currency, page: source });
        io.disconnect();
      },
      { threshold: 0.33 },
    );
    io.observe(el);
    return () => io.disconnect();
    // currency only labels the event; a change of it is not a new view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function pickTheme(id: CartouchePrintThemeId) {
    if (id === theme) return;
    setTheme(id);
    trackEvent("cartouche_print_theme", { theme: id, name_length: name.length, page: source });
  }

  function pickFormat(id: CartouchePrintFormatId) {
    if (id === format) return;
    setFormat(id);
    trackEvent("cartouche_print_format", { format: id, name_length: name.length, page: source });
  }

  function addName() {
    if (extra.length >= MAX_EXTRA) return;
    setExtra((xs) => [...xs, ""]);
    // `names` counts the slots on the print once this one is filled: the first name plus every box.
    trackEvent("cartouche_print_add_name", { names: extra.length + 2, page: source });
  }

  function setExtraAt(i: number, value: string) {
    setExtra((xs) => xs.map((x, j) => (j === i ? value : x)));
  }

  function removeExtra(i: number) {
    setExtra((xs) => xs.filter((_, j) => j !== i));
  }

  async function buy() {
    if (busy) return;
    if (badExtra) {
      setError("One of the extra names cannot be written in hieroglyphs: use letters only, or remove it.");
      return;
    }
    setBusy(true);
    setError(null);
    trackEvent("cartouche_print_click", { name_length: name.length, currency, theme, format, names: names.length, page: source });
    try {
      const res = await fetch("/api/cartouche-print/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ...(family ? { names } : {}), theme, format, from: source }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start the checkout. Please try again.");
        setBusy(false);
        return;
      }
      trackEvent("begin_checkout", {
        value: cartouchePrintOrderAmount(currency, format, names.length),
        currency,
        plan: cartouchePrintFormatById(format).stripeProductId,
        names: names.length,
        location: source,
      });
      window.location.assign(data.url);
    } catch {
      setError("Could not start the checkout. Please try again.");
      setBusy(false);
    }
  }

  function openShare() {
    setSharing(true);
    trackEvent("cartouche_share_open", { name_length: name.length, theme });
  }

  const chosenTheme = cartouchePrintThemeById(theme);
  const chosenFormat = cartouchePrintFormatById(format);
  const price = formatCartouchePrintOrderPrice(currency, format, names.length);
  const fromPrice = cartouchePrintFromPrice(currency, embedded ? formats.map((f) => f.id) : OFFERED_IDS);
  const symbol = currency === "GBP" ? "£" : "$";
  const familyExtra = `${symbol}${cartoucheFamilySurcharge(currency, "print", 2)}`;
  // After the posting cutoff the late line points to the image: shown once every print is late, or the chosen one is.
  const lateNotice = today
    ? [christmasNotice(format, today), christmasNotice("print", today)].find((n) => n?.kind === "late") ?? null
    : null;

  // The same <section> as the open card, so the view observer keeps its element when it opens.
  if (!open) {
    return (
      <section
        ref={cardRef}
        id="print"
        aria-label="Cartouche Print"
        className="relative mt-6 scroll-mt-28 flex flex-col gap-3 border-t border-gold-700/30 pt-5 text-left sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="font-body text-sm leading-snug text-sand-300 sm:text-base">
          <span className="text-sand-100">Want it on the wall?</span> Posted fine-art print{" "}
          <span className="text-gold-400">from {fromPrice}</span>, A4 up to an A1 poster, or framed. Postage included.
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            trackEvent("cartouche_print_expand", { name_length: name.length, currency, page: source });
          }}
          className="inline-flex shrink-0 items-center justify-center border border-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/15"
        >
          See it as a print
        </button>
      </section>
    );
  }

  return (
    <section
      ref={cardRef}
      id="print"
      aria-label="Cartouche Print"
      className={
        embedded
          ? "relative mt-8 scroll-mt-28 border-t border-gold-700/30 pt-2 text-left"
          : `relative mt-8 scroll-mt-28 ${bleed ? "sm:-mx-24" : ""} overflow-hidden border border-gold-500/40 bg-gradient-to-b from-gold-500/[0.09] to-obsidian-light/70 text-left shadow-[0_18px_50px_-24px_rgba(0,0,0,0.6)]`
      }
    >
      {/* A thin gold rule inside the border, the print's own double frame in miniature */}
      {!embedded && <div aria-hidden="true" className="pointer-events-none absolute inset-[5px] border border-gold-500/20" />}

      <div className={embedded ? "relative pt-5" : "relative p-6 md:p-8"}>
        {embedded ? (
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">Or on the wall</p>
            <h3 className="mt-1 font-display text-2xl md:text-3xl text-sand-100 leading-tight">
              {family ? "Your family's cartouches" : `${name}`} as a print, <span className="text-gold-400">from {fromPrice}</span>
            </h3>
            <p className="font-body text-sm md:text-base text-sand-400 mt-2 leading-relaxed max-w-prose">
              The same scene as a giclée print on fine-art paper, from A4 up to an A1 poster, posted to you, or framed at A4. Add up to {MAX_EXTRA} more names
              to make it a family print.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-display text-3xl md:text-4xl text-sand-100 leading-tight">
                Keep it, <span className="text-gold-400">from {fromPrice}</span>
              </h3>
              <p className="font-body text-base md:text-lg text-gold-400 mt-1.5">
                {family ? "Your family's cartouches" : `The cartouche of ${name}`}, as a picture or a print for your wall
              </p>
            </div>
            <p className="font-body text-sm md:text-base text-sand-400 mt-3 leading-relaxed max-w-prose">
              Your name as a pharaoh&rsquo;s, on the paper you choose. Take the picture in high resolution for{" "}
              {formatCartouchePrintOrderPrice(currency, "image")}, in your inbox in a minute, or upgrade to a giclée print on
              fine-art paper, from A4 up to an A1 poster, posted to you, or framed at A4. Add up to {MAX_EXTRA} more names to make it a family print.
            </p>
          </>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Page one, live, on the chosen paper */}
          <figure className="sm:w-[42%] shrink-0 m-0">
            {format === "framed" ? (
              <FramedMockup name={name} names={names} theme={theme} />
            ) : (
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black/40 blur-[2px]" />
                <CartouchePrintPreview name={name} names={names} theme={theme} className="relative w-full h-auto" />
              </div>
            )}
            <figcaption className="mt-3 flex flex-col items-center gap-2.5">
              <span className="font-body text-xs text-sand-500 tracking-wide text-center">
                {format === "framed"
                  ? `The cartouche${family ? "s" : ""} of ${family ? "your family" : name}, framed and on the wall`
                  : format === "image"
                    ? "The picture you download: 300 dpi, no web address on it"
                    : "The print, as it will look"}
              </span>
              <button type="button" onClick={openShare} className="btn-secondary py-2 px-4 text-xs">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M12 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 14.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5.7 7.1l4.6-2.7M5.7 8.9l4.6 2.7" />
                </svg>
                Share this cartouche
              </button>
            </figcaption>
          </figure>

          {/* The names, the paper, the format, then the price */}
          <div className="flex-1 flex flex-col min-w-0">
            <p className="font-body text-xs text-sand-500 tracking-[0.18em] uppercase">Names on the print</p>
            <div className="mt-3 flex flex-col gap-2">
              <div className="border border-gold-700/30 px-3 py-2 font-body text-sm text-sand-200">{name}</div>
              {extra.map((value, i) => {
                const ok = writable(value);
                return (
                  <div key={i}>
                    <div className="flex items-stretch gap-2">
                      <label className="sr-only" htmlFor={`print-name-${source}-${i}`}>
                        Name {i + 2}
                      </label>
                      <input
                        id={`print-name-${source}-${i}`}
                        type="text"
                        value={value}
                        maxLength={30}
                        autoComplete="off"
                        placeholder={`Name ${i + 2}`}
                        onChange={(e) => setExtraAt(i, e.target.value)}
                        aria-invalid={!ok}
                        className={`flex-1 min-w-0 bg-obsidian/40 border px-3 py-2 font-body text-sm text-sand-100 placeholder:text-sand-600 outline-none focus:border-gold-400 ${
                          ok ? "border-gold-700/40" : "border-terracotta"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => removeExtra(i)}
                        aria-label={`Remove name ${i + 2}`}
                        className="shrink-0 border border-gold-700/40 px-3 text-sand-400 hover:text-sand-100 hover:border-gold-500/70"
                      >
                        &times;
                      </button>
                    </div>
                    {!ok && <p className="font-body text-xs text-terracotta mt-1">Letters only, please: this one cannot be written in hieroglyphs.</p>}
                  </div>
                );
              })}
              {extra.length < MAX_EXTRA && (
                <button
                  type="button"
                  onClick={addName}
                  className="self-start font-body text-sm text-gold-400 hover:text-gold-300 underline underline-offset-4 mt-0.5"
                >
                  + Add another name &mdash; make it a family print
                </button>
              )}
              {family && (
                <p className="font-body text-xs text-sand-500 leading-snug">
                  {names.length} names, each in its own cartouche on one page. The HD image is the same price; a posted or framed family
                  print is {familyExtra} more.
                </p>
              )}
            </div>

            {!embedded && (
              <>
                <p className="font-body text-xs text-sand-500 tracking-[0.18em] uppercase mt-7">Choose the paper</p>
                <div role="radiogroup" aria-label="Paper" className="mt-3 grid grid-cols-5 gap-2.5">
                  {[
                    // an event's paper only in its window, and first while it is; Abu Simbel is the picture's referral bonus
                    ...CARTOUCHE_PRINT_THEMES.filter((t) => t.season && today && inSeason(t.season, today)),
                    ...CARTOUCHE_PRINT_THEMES.filter((t) => !t.season && t.id !== "abusimbel"),
                  ].map((t) => {
                    const on = t.id === theme;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => pickTheme(t.id)}
                        className="group flex flex-col items-center gap-1.5 outline-none"
                      >
                        <span
                          aria-hidden="true"
                          className={`block aspect-[3/4] w-full overflow-hidden border-2 transition-all ${
                            on
                              ? "border-gold-400 ring-2 ring-gold-400/40 shadow-lg"
                              : "border-gold-700/30 group-hover:border-gold-500/70 group-focus-visible:border-gold-400"
                          }`}
                          style={
                            t.thumb
                              ? { backgroundImage: `url(${t.thumb})`, backgroundSize: "cover", backgroundPosition: "center" }
                              : { background: t.page }
                          }
                        />
                        <span className={`font-body text-xs leading-none ${on ? "text-sand-100" : "text-sand-500 group-hover:text-sand-300"}`}>
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="font-body text-sm text-sand-400 mt-3 leading-snug">
                  <span className="text-sand-200">{chosenTheme.label}.</span> {chosenTheme.blurb}
                </p>
              </>
            )}

            <p className="font-body text-sm text-sand-500 tracking-[0.18em] uppercase mt-7">How you want it</p>
            <div role="radiogroup" aria-label="Format" className="mt-3 flex flex-col gap-3">
              {formats.map((row) => {
                // The unframed print is one row in every size: it shows the size chosen below it
                const sized = isUnframedPrint(row.id);
                const on = sized ? isUnframedPrint(format) : row.id === format;
                const f = sized && on ? chosenFormat : row;
                const xmas = today ? christmasNotice(f.id, today) : null;
                return (
                  <div key={row.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pickFormat(sized && on ? format : row.id)}
                    className={`flex items-start gap-3.5 border px-4 py-4 text-left transition-colors outline-none focus-visible:border-gold-400 ${
                      on ? "border-gold-400 bg-gold-500/10" : "border-gold-700/30 hover:border-gold-500/60"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 ${on ? "border-gold-400 bg-gold-400" : "border-gold-700/50"}`}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={`font-body text-lg font-semibold ${on ? "text-sand-100" : "text-sand-300"}`}>
                          {f.physical && !embedded && (
                            <span className="mr-2 align-middle border border-gold-500/50 px-1.5 py-0.5 font-body text-[10px] font-normal tracking-[0.15em] uppercase text-gold-400">
                              Upgrade
                            </span>
                          )}
                          {f.label}
                        </span>
                        <span className={`font-body text-lg whitespace-nowrap ${on ? "text-gold-400" : "text-sand-500"}`}>
                          {formatCartouchePrintOrderPrice(currency, f.id, names.length)}
                        </span>
                      </span>
                      <span className="block font-body text-sm text-sand-400 mt-1 leading-snug">
                        {f.blurb}
                        {f.shipsIn ? ` Ships in ${f.shipsIn}, postage included.` : ""}
                      </span>
                      {xmas?.kind === "order-by" && (
                        <span className="block font-body text-sm text-gold-400 mt-1.5">{xmas.text}.</span>
                      )}
                    </span>
                  </button>
                  {sized && on && (
                    <div role="radiogroup" aria-label="Print size" className="mt-2 grid grid-cols-4 gap-2">
                      {CARTOUCHE_PRINT_SIZES.map((id) => {
                        const s = cartouchePrintFormatById(id);
                        const picked = id === format;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={picked}
                            onClick={() => pickFormat(id)}
                            className={`border px-2 py-2 text-center transition-colors outline-none focus-visible:border-gold-400 ${
                              picked ? "border-gold-400 bg-gold-500/15" : "border-gold-700/30 hover:border-gold-500/60"
                            }`}
                          >
                            <span className={`block font-body text-sm font-semibold ${picked ? "text-sand-100" : "text-sand-300"}`}>{s.size}</span>
                            <span className={`block font-body text-xs ${picked ? "text-gold-400" : "text-sand-500"}`}>
                              {formatCartouchePrintOrderPrice(currency, id, names.length)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
            {lateNotice && <p className="font-body text-sm text-gold-400 mt-3 leading-snug">{lateNotice.text}.</p>}

            <div className="mt-auto pt-5">
              <button
                type="button"
                onClick={buy}
                disabled={busy}
                className="btn-primary w-full py-3.5 px-5 text-sm justify-center disabled:opacity-60"
              >
                {busy
                  ? "Opening checkout…"
                  : chosenFormat.physical
                    ? `Order the ${family ? "family " : ""}${chosenFormat.label.charAt(0).toLowerCase()}${chosenFormat.label.slice(1)} · ${price}`
                    : `Get the HD image · ${price}`}
              </button>
              <GuaranteeNote />
              <p className="font-body text-xs text-sand-600 mt-2 text-center">
                {chosenFormat.physical
                  ? "One payment, postage included. No account needed. Printed by our partner Prodigi."
                  : "One payment. No account needed. Download it straight away, with a copy by email."}
              </p>
            </div>
          </div>
        </div>
        {error && <p className="font-body text-sm text-terracotta mt-3">{error}</p>}
      </div>

      <CartoucheShareDialog name={name} names={names} theme={theme} open={sharing} onClose={() => setSharing(false)} />
    </section>
  );
}

/**
 * The print hanging on a wall: a black wooden frame and a wide cream mat
 * around the live preview, so the visitor sees their own name as the finished
 * object rather than as a sheet of paper.
 */
function FramedMockup({ name, names, theme }: { name: string; names: readonly string[]; theme: CartouchePrintThemeId }) {
  return (
    <div
      className="relative px-[9%] pt-[8%] pb-[10%]"
      style={{ background: "radial-gradient(ellipse 90% 70% at 50% 35%, #e9dcc3 0%, #d6c4a3 60%, #bfa984 100%)" }}
    >
      {/* the frame's shadow on the wall */}
      <div aria-hidden="true" className="absolute left-[11%] right-[7%] top-[11%] bottom-[6%] bg-black/45 blur-[10px]" />
      <div
        className="relative p-[5%]"
        style={{
          background: "linear-gradient(135deg, #2a2420 0%, #0d0b0a 45%, #1f1a17 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 3px rgba(255,255,255,0.12)",
        }}
      >
        <div className="p-[9%] bg-[#f6f1e6] shadow-[inset_0_1px_4px_rgba(0,0,0,0.35)]">
          <CartouchePrintPreview name={name} names={names} theme={theme} className="block w-full h-auto shadow-[0_0_0_1px_rgba(0,0,0,0.12)]" />
        </div>
      </div>
    </div>
  );
}
