"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { discounted, formatPrice } from "@/lib/pricing";
import { useLocalCurrency } from "@/components/Price";
import { trackEvent } from "@/lib/analytics";
import { usePpp } from "@/components/PppBanner";
import GuaranteeNote from "@/components/GuaranteeNote";
import { offerEndsLabel, usableOffer } from "@/lib/offer-price";

export type OfferData = {
  code: string;
  expiresAt: string; // ISO
  percentOff: number;
  source: "section-complete" | "lesson-complete" | "checkout-abandoned" | "nurture";
};

function remaining(expiresAt: string): { h: number; m: number; s: number; done: boolean } {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return { h: 0, m: 0, s: 0, done: true };
  return { h: Math.floor(ms / 3600000), m: Math.floor((ms % 3600000) / 60000), s: Math.floor((ms % 60000) / 1000), done: false };
}

/**
 * "Unlock the next chamber" — shown after the free lesson and on the
 * dashboard while an offer is live. The code is applied automatically at
 * checkout; it's displayed only so the learner can see it's real.
 */
export default function OfferBanner({
  offer,
  location,
  variant = "default",
}: {
  offer: OfferData;
  location: string;
  /** "still-open": the dashboard's reminder, headed "Your 33% off is still open · ends …" */
  variant?: "default" | "still-open";
}) {
  const currency = useLocalCurrency();
  const ppp = usePpp();
  const [left, setLeft] = useState(() => remaining(offer.expiresAt));
  useEffect(() => {
    const t = setInterval(() => setLeft(remaining(offer.expiresAt)), 1000);
    return () => clearInterval(t);
  }, [offer.expiresAt]);
  if (left.done) return null;
  // (an offer granted before the parity check, where the visitor's own price is already lower: checkout would never use it)
  if (!usableOffer(offer, ppp?.percentOff)) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  const headline =
    variant === "still-open"
      ? `Your ${offer.percentOff}% off is still open · ends ${offerEndsLabel(offer.expiresAt)}`
      : offer.source === "checkout-abandoned"
        ? "Your place is still open"
        : "Unlock the next chamber";

  return (
    <div className="relative border border-gold-500/40 bg-gold-500/5 p-6 md:p-7 overflow-hidden">
      <div className="absolute -top-8 -right-6 text-8xl text-gold-500/10 select-none hieroglyph-font" aria-hidden="true">
        𓋹
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-5 relative">
        <div className="flex-1">
          <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-2">Limited offer · {offer.percentOff}% off</p>
          <h2 className="font-display text-2xl text-sand-100 mb-2">{headline}</h2>
          <p className="font-body text-sm text-sand-300 font-light leading-relaxed">
            Lifetime access to all 8 lessons and the 3D games for{" "}
            <span className="text-sand-100 font-medium">{formatPrice(currency, discounted(currency, offer.percentOff))}</span>{" "}
            <span className="line-through text-sand-500">{formatPrice(currency)}</span>. One payment, no subscription. Code{" "}
            <span className="font-mono text-gold-400">{offer.code}</span> is applied automatically.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
          <p className="font-mono text-2xl text-gold-400 tabular-nums" aria-live="off">
            {pad(left.h)}:{pad(left.m)}:{pad(left.s)}
          </p>
          <Link
            href="/checkout"
            onClick={() => trackEvent("offer_click", { code: offer.code, location, offer_source: offer.source })}
            className="btn-primary text-sm py-3 px-6"
          >
            Claim {offer.percentOff}% off
          </Link>
          <GuaranteeNote className="!mt-0" />
        </div>
      </div>
    </div>
  );
}
