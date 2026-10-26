"use client";

/**
 * "This chamber is sealed": what a locked chamber or game holds, what Lifetime opens, the visitor's own price and
 * the guarantee, before anyone is sent to Stripe. Locked tiles used to link straight to /checkout, so a learner who
 * only wanted to see what was inside landed on a payment page with no context (about 25 reached checkout May–Oct
 * 2026, 4 paid, none of the others pressed Pay). Only the Buy button here goes to /checkout.
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import Price, { useLocalCurrency } from "@/components/Price";
import { usePpp } from "@/components/PppBanner";
import GuaranteeNote from "@/components/GuaranteeNote";
import type { OfferData } from "@/components/OfferBanner";
import { PLANS } from "@/lib/plans";
import { discounted, formatPrice } from "@/lib/pricing";
import { usableOffer } from "@/lib/offer-price";
import { trackEvent } from "@/lib/analytics";
import FreeCourseCta from "@/components/FreeCourseCta";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";

export type SealedItem = {
  /** analytics id, e.g. the lesson or game id */
  id: string;
  kind: "chamber" | "game";
  title: string;
  /** a short line under the title: area name, duration, tech */
  subtitle?: string;
  /** what is inside, in a sentence or two */
  description?: string;
  icon?: string;
  /** the first sign inside a locked lesson */
  teaser?: { symbol: string; meaning: string; transliteration: string };
};

type Props = {
  item: SealedItem | null;
  onClose: () => void;
  /** analytics: dashboard | dig | … */
  location: string;
  offer?: OfferData | null;
};

const GLYPH = "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";

export default function SealedPanel({ item, onClose, location, offer: given }: Props) {
  const currency = useLocalCurrency();
  const ppp = usePpp();
  const freeGuest = useFreeCourseGuest();
  const offer = usableOffer(given, ppp?.percentOff);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = !!item;

  useEffect(() => {
    if (!item) return;
    trackEvent("sealed_panel_view", { item: item.id, kind: item.kind, location, offer: offer ? 1 : 0 });
    // once per item opened: the offer arriving later is the same showing
  }, [item?.id, location]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !dialogRef.current) return;
      // keep Tab inside the panel
      const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!item) return null;
  const lifetime = PLANS.lifetime;
  const headingId = `sealed-${item.id}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[#08080c]/85 backdrop-blur-sm" />
      <div
        ref={dialogRef}
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto border border-gold-500/30 bg-obsidian p-6 sm:p-8 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-body text-xs text-gold-500 tracking-[0.22em] uppercase">
            {item.kind === "chamber" ? "This chamber is sealed" : "A members' game"}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center text-sand-500 transition-colors hover:text-sand-100 focus:outline-none focus-visible:text-sand-100"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3 3l12 12M15 3L3 15" />
            </svg>
          </button>
        </div>

        <h2 id={headingId} className="font-display text-2xl sm:text-3xl text-sand-100 leading-tight mt-1">
          {item.icon && (
            <span className="mr-2 text-gold-400" style={{ fontFamily: GLYPH }} aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.title}
        </h2>
        {item.subtitle && <p className="font-body text-sm text-sand-500 mt-1">{item.subtitle}</p>}
        {item.description && <p className="font-body text-sm text-sand-300 leading-relaxed mt-3">{item.description}</p>}

        {item.teaser && (
          <div className="mt-4 flex items-center gap-4 border border-gold-700/25 bg-obsidian-light/60 p-4">
            <span className="text-4xl text-gold-400" style={{ fontFamily: GLYPH }} aria-hidden="true">
              {item.teaser.symbol}
            </span>
            <p className="font-body text-sm text-sand-300">
              <span className="block text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-0.5">The first sign inside</span>
              {item.teaser.meaning} <span className="text-sand-500">· {item.teaser.transliteration}</span>
            </p>
          </div>
        )}

        <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mt-6 mb-2">Lifetime access opens</p>
        <ul className="space-y-1.5">
          {lifetime.features.map((f) => (
            <li key={f} className="font-body text-sm text-sand-300 flex gap-2">
              <span className="text-gold-500" aria-hidden="true">
                𓋹
              </span>
              {f}
            </li>
          ))}
        </ul>

        {freeGuest ? (
          <div className="mt-6">
            <FreeCourseCta location={`sealed_${location}`} />
          </div>
        ) : (
          <>
        <div className="mt-6 border border-gold-700/25 bg-obsidian-lighter p-5">
          <p className="font-display text-2xl text-sand-100">
            {offer ? (
              <>
                {formatPrice(currency, discounted(currency, offer.percentOff))}{" "}
                <span className="font-body text-base line-through text-sand-500">{formatPrice(currency)}</span>
              </>
            ) : (
              <Price />
            )}{" "}
            <span className="font-body text-sm text-sand-400">once, yours for good</span>
          </p>
          {offer && (
            <p className="font-body text-xs text-gold-400 mt-1">
              Your {offer.percentOff}% off code {offer.code} is applied automatically.
            </p>
          )}
          <Link
            href="/checkout"
            onClick={() => trackEvent("sealed_panel_click", { item: item.id, kind: item.kind, location, target: "checkout", offer: offer ? 1 : 0 })}
            className="btn-primary w-full justify-center text-sm py-3.5 mt-4"
          >
            {offer ? `Unlock with ${offer.percentOff}% off` : "Get Lifetime Access"}
          </Link>
          <GuaranteeNote />
        </div>

        <p className="font-body text-xs text-sand-500 text-center mt-4">
          <Link
            href="/pricing"
            onClick={() => trackEvent("sealed_panel_click", { item: item.id, kind: item.kind, location, target: "pricing" })}
            className="underline underline-offset-4 hover:text-gold-400"
          >
            See every plan
          </Link>{" "}
          · or keep exploring what&apos;s open
        </p>
          </>
        )}
      </div>
    </div>
  );
}
