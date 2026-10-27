"use client";

/**
 * Purchasing-power parity banner on the pricing page. Reads the country
 * cookie the middleware sets, and is honest about the VPN loophole.
 */
import { useEffect, useState } from "react";
import { readCountryCookie } from "@/lib/pricing";
import { pppFor, countryName, flagEmoji, COUNTRY_TIER, PPP_PERCENT, type Ppp } from "@/lib/ppp";

// Read from the tier table, so the banner never claims more or fewer countries than checkout discounts.
const PPP_COUNTRIES = Object.keys(COUNTRY_TIER).length;
const PPP_MIN = Math.min(...Object.values(PPP_PERCENT));
const PPP_MAX = Math.max(...Object.values(PPP_PERCENT));

export function usePpp(): Ppp | null {
  const [ppp, setPpp] = useState<Ppp | null>(null);
  useEffect(() => {
    setPpp(pppFor(readCountryCookie()));
  }, []);
  return ppp;
}

export default function PppBanner() {
  const ppp = usePpp();
  const [detail, setDetail] = useState(false);

  return (
    <div className="max-w-3xl mx-auto mb-10">
      {ppp ? (
        <div className="border border-turquoise/30 bg-turquoise/5 px-5 py-4 text-center">
          <p className="font-body text-sm text-sand-100">
            <span className="mr-2" aria-hidden="true">
              {flagEmoji(ppp.country)}
            </span>
            Prices in <span className="text-turquoise font-medium">{countryName(ppp.country)}</span> are{" "}
            <span className="text-turquoise font-medium">{ppp.percentOff}% lower</span> to match local purchasing power. The discount is applied automatically at checkout, on every plan, for as long as it runs.
          </p>
          <p className="font-body text-xs text-sand-500 mt-1">No code needed. The prices below are what you will pay.</p>
        </div>
      ) : (
        <div className="border border-gold-700/20 bg-obsidian-light/60 px-5 py-4 text-center">
          <p className="font-body text-sm text-sand-300">
            <span className="mr-1.5" aria-hidden="true">
              🌍
            </span>
            Fair prices everywhere: learners in {PPP_COUNTRIES} countries pay {PPP_MIN}% to {PPP_MAX}% less, matched to local purchasing power and applied automatically.{" "}
            <button type="button" onClick={() => setDetail((d) => !d)} className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
              {detail ? "Less" : "Why?"}
            </button>
          </p>
          {detail && (
            <p className="font-body text-xs text-sand-500 mt-2 max-w-xl mx-auto leading-relaxed">
              We know a VPN can claim a lower price. We have decided that is a price worth paying to bring the course to people who could not otherwise afford it. If you can pay the full price, thank you: it is what keeps the parity prices possible. If not, that&apos;s totally fine too.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
