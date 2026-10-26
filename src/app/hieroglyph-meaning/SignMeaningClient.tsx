"use client";

/**
 * The two interactive bits of the sign-meaning pages.
 *
 * GA4: sign_meaning_copy {sign} when the Copy button puts the character on the clipboard, and
 * sign_meaning_cta_click {sign, target} for the translator / lesson / related-sign links
 * (sign is the page's slug, or "hub" on /hieroglyph-meaning).
 */
import Link from "next/link";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function CopySignButton({ glyph, sign }: { glyph: string; sign: string }) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(glyph);
      setState("copied");
      trackEvent("sign_meaning_copy", { sign });
    } catch {
      // Clipboard blocked: select the big sign so it can be copied by hand.
      const el = document.getElementById("sign-glyph");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setState("manual");
    }
    window.setTimeout(() => setState("idle"), 2200);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex cursor-pointer items-center gap-2 bg-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-black transition-colors hover:bg-gold-400"
      aria-live="polite"
    >
      {state === "copied" ? "Copied" : state === "manual" ? "Selected: press Ctrl+C" : `Copy ${glyph}`}
    </button>
  );
}

export function TrackedLink({
  href,
  sign,
  target,
  className,
  children,
}: {
  href: string;
  sign: string;
  target: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => trackEvent("sign_meaning_cta_click", { sign, target })}>
      {children}
    </Link>
  );
}
