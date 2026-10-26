"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

/** The gift link with a copy button, and the certificate to download. */
export default function CopyGiftLink({ link, certificate, recipient }: { link: string; certificate: string; recipient: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // the link is on screen to select by hand
    }
    trackEvent("gift_link_copy", {});
  };
  return (
    <div className="mt-6 space-y-3">
      <p className="break-all border border-gold-700/40 bg-black/30 px-4 py-3 font-body text-sm text-gold-200">{link}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="border border-gold-500 bg-gold-500/15 px-5 py-2.5 font-body text-sm font-semibold text-gold-200 hover:bg-gold-500/25"
        >
          {copied ? "Copied" : "Copy the gift link"}
        </button>
        <a
          href={certificate}
          download={`gift-for-${recipient.toLowerCase().replace(/[^a-z]+/g, "-")}.jpg`}
          className="border border-gold-700/40 px-5 py-2.5 font-body text-sm text-sand-200 hover:border-gold-400"
        >
          Download the certificate
        </a>
      </div>
    </div>
  );
}
