"use client";

/**
 * Gift the course (src/lib/gift-course.ts): who it is for, who it is from, a live preview of the certificate, and
 * Stripe Checkout. GA4: gift_preview (a name typed), begin_checkout (plan gift-course).
 */
import { useEffect, useRef, useState } from "react";
import KeyboardCard from "@/components/KeyboardCard";
import { useLocalCurrency } from "@/components/Price";
import { formatPrice } from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics";
import { cleanName } from "@/lib/keyboard-card";
import { GIFT_COURSE, certificateStyle, cleanGiftName } from "@/lib/gift-course";

export default function GiftContent() {
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [style, setStyle] = useState(() => certificateStyle(new Date(2000, 5, 1)));
  const previewed = useRef(false);
  const currency = useLocalCurrency();
  // The full Lifetime price: parity discounts are for learners buying for themselves
  const price = formatPrice(currency, currency === "GBP" ? GIFT_COURSE.gbp : GIFT_COURSE.usd);

  useEffect(() => {
    setStyle(certificateStyle());
    const q = new URLSearchParams(window.location.search);
    setRecipient(cleanGiftName(q.get("to")));
    setFrom(cleanGiftName(q.get("from")));
    setCancelled(q.get("cancelled") === "1");
  }, []);

  const name = cleanGiftName(recipient);
  const typed = cleanName(name);

  useEffect(() => {
    if (typed.length === 0 || previewed.current) return;
    previewed.current = true;
    trackEvent("gift_preview", { name_length: name.length });
  }, [typed.length, name.length]);

  const buy = async () => {
    if (!name) {
      setError("Type the name of the person the gift is for.");
      return;
    }
    setBusy(true);
    setError(null);
    trackEvent("begin_checkout", { plan: GIFT_COURSE.id, location: "gift" });
    try {
      const res = await fetch("/api/gift/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: name, from: cleanGiftName(from) }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Could not start the checkout.");
    } catch {
      setError("Could not start the checkout. Please try again.");
    }
    setBusy(false);
  };

  const input =
    "w-full border border-gold-600/50 bg-obsidian px-4 py-3 font-display text-lg text-gold-100 placeholder:font-body placeholder:text-base placeholder:text-sand-600 focus:border-gold-400 focus:outline-none";

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] md:items-start">
      <div className="space-y-4">
        {cancelled && (
          <p role="status" className="border border-gold-700/40 bg-gold-500/5 px-4 py-3 font-body text-sm text-sand-300">
            No payment was taken. The gift is still here when you are ready.
          </p>
        )}
        <label className="block">
          <span className="mb-1 block font-body text-xs uppercase tracking-[0.18em] text-sand-500">Who is it for?</span>
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} maxLength={30} placeholder="Their first name" className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block font-body text-xs uppercase tracking-[0.18em] text-sand-500">From (optional)</span>
          <input value={from} onChange={(e) => setFrom(e.target.value)} maxLength={30} placeholder="Your name" className={input} />
        </label>
        <button
          type="button"
          onClick={() => void buy()}
          disabled={busy}
          className="w-full border border-gold-400 bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-4 font-body text-base font-semibold text-obsidian transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Opening checkout…" : `Give the course · ${price}`}
        </button>
        {error && (
          <p role="alert" className="font-body text-sm text-red-300">
            {error}
          </p>
        )}
        <ul className="space-y-1.5 font-body text-sm text-sand-400">
          <li>✓ Lifetime access to every lesson, game and future chamber</li>
          <li>✓ A gift link to send, and a certificate with their name in a cartouche</li>
          <li>✓ They open it whenever they like; it never expires</li>
          <li>✓ 14-day money-back guarantee</li>
        </ul>
      </div>
      {/* the certificate first on a phone: it is what makes the gift */}
      <div className="order-first md:order-none">
        <p className="mb-2 font-body text-xs uppercase tracking-[0.18em] text-sand-500">Their certificate</p>
        {typed.length > 0 ? (
          <KeyboardCard
            typed={typed}
            style={style}
            template="gift"
            spell="name"
            from={cleanGiftName(from)}
            className="border border-gold-600/40 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)]"
            label={`Gift certificate for ${name}`}
          />
        ) : (
          <div className="flex aspect-[1200/630] items-center justify-center border border-dashed border-gold-700/40 font-body text-sm text-sand-500">
            Type their name to see it in hieroglyphs
          </div>
        )}
      </div>
    </div>
  );
}
