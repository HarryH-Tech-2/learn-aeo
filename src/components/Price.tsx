"use client";

import { useEffect, useState } from "react";
import { currencyForCountry, formatPrice, readCountryCookie, type Currency } from "@/lib/pricing";
import { PLANS, formatPlanPrice, planAmount, type Plan } from "@/lib/plans";
import { formatParity, parityPrice } from "@/lib/ppp";
import { usePpp } from "@/components/PppBanner";

/**
 * Visitor-local price. Renders USD on the server and on first paint (so
 * markup matches), then switches to GBP for UK visitors after hydration —
 * the cookie comes from middleware, so this is a single synchronous read.
 */
export function useLocalCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>("USD");
  useEffect(() => {
    setCurrency(currencyForCountry(readCountryCookie()));
  }, []);
  return currency;
}

/**
 * Lifetime price by default; pass `plan` for any plan in the catalog, or `amount` for an arbitrary lifetime-currency figure.
 * A plan price is the one this visitor will be charged: checkout applies the purchasing-power discount for their country
 * (src/lib/ppp.ts) to every plan, so it is shown here too. An explicit `amount` (an offer price) is shown as given.
 */
export default function Price({ amount, plan, className = "" }: { amount?: number; plan?: Plan; className?: string }) {
  const currency = useLocalCurrency();
  const ppp = usePpp();
  if (amount !== undefined) return <span className={className}>{formatPrice(currency, amount)}</span>;
  const p = plan ?? PLANS.lifetime;
  if (!ppp) return <span className={className}>{formatPlanPrice(p, currency)}</span>;
  const symbol = currency === "GBP" ? "£" : "$";
  return <span className={className}>{symbol}{formatParity(parityPrice(planAmount(p, currency), ppp.percentOff))}</span>;
}
