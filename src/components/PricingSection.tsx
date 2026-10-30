"use client";

/**
 * The pricing page's plan cards: Monthly and Lifetime, the only two plans
 * (src/lib/plans.ts). Every amount on this page comes from PLANS via
 * formatPlanPrice / <Price>, so "$100" and "$10" are never typed here.
 */
import { trackEvent } from "@/lib/analytics";
import Price, { useLocalCurrency } from "@/components/Price";
import FreeCourseCta from "@/components/FreeCourseCta";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
import { PLANS, planAmount, planPeriodLabel, formatPlanPrice, type Plan, type PlanId } from "@/lib/plans";
import { parityPrice, formatParity } from "@/lib/ppp";
import PppBanner, { usePpp } from "@/components/PppBanner";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useAuthModal } from "@/components/AuthModal";
import { safeReturnPath } from "@/lib/checkout-return";

function CheckoutNotice() {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");

  if (checkout !== "error" && checkout !== "canceled") return null;

  return (
    <div className={`max-w-xl mx-auto mb-10 px-5 py-4 border text-center ${checkout === "error" ? "bg-terracotta/10 border-terracotta/30" : "bg-gold-500/5 border-gold-700/30"}`}>
      <p className={`font-body text-sm ${checkout === "error" ? "text-terracotta" : "text-sand-300"}`}>
        {checkout === "error"
          ? "Something went wrong starting checkout. You have not been charged. Please try again below."
          : "Checkout canceled. You have not been charged. The course is here whenever you're ready."}
      </p>
    </div>
  );
}

function CheckoutError({ message }: { message: string }) {
  return (
    <p role="alert" className="font-body text-sm text-terracotta text-center mt-3">
      {message}
    </p>
  );
}

/** The guarantee, repeated under every buy button. */
function GuaranteeLine() {
  return (
    <p className="font-body text-xs text-gold-400/90 text-center mt-3 flex items-center justify-center gap-1.5">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
      14-day money-back guarantee
    </p>
  );
}

/** How many months of Monthly cost the same as Lifetime, from the plan amounts. */
const MONTHS_TO_LIFETIME = Math.round(PLANS.lifetime.usd / PLANS.monthly.usd);

/** `headingAs` is "h1" on /pricing, where this headline is the page's; on the homepage it stays an h2. */
export default function PricingSection({ headingAs: Heading = "h2" }: { headingAs?: "h1" | "h2" } = {}) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const currency = useLocalCurrency();
  const ppp = usePpp();
  const [loading, setLoading] = useState<PlanId | null>(null);
  // What the signed-in visitor already holds, so we never offer it again.
  const [owned, setOwned] = useState<"lifetime" | "monthly" | "free-unlock" | null>(null);
  // The free-unlock test's free group (src/lib/access-test.ts): the course is free, so nothing is sold here
  const freeGuest = useFreeCourseGuest();
  const freeCourse = freeGuest || owned === "free-unlock";
  useEffect(() => {
    if (!session) {
      setOwned(null);
      return;
    }
    let canceled = false;
    fetch("/api/stripe/check-subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then((a: { active?: boolean; via?: string } | null) => {
        if (canceled || !a?.active) return;
        if (a.via === "lifetime") setOwned("lifetime");
        else if (a.via === "monthly") setOwned("monthly");
        else if (a.via === "free-unlock") setOwned("free-unlock");
      })
      .catch(() => null);
    return () => {
      canceled = true;
    };
  }, [session]);

  /** What this visitor pays: the parity price when their country qualifies. */
  const PlanPrice = ({ plan, big }: { plan: Plan; big: boolean }) => {
    if (!ppp) return <Price plan={plan} />;
    const symbol = currency === "GBP" ? "£" : "$";
    const pay = parityPrice(planAmount(plan, currency), ppp.percentOff);
    return (
      <>
        <span className={`font-body font-light text-sand-500 line-through mr-3 ${big ? "text-3xl" : "text-2xl"}`}>{formatPlanPrice(plan, currency)}</span>
        {symbol}
        {formatParity(pay)}
      </>
    );
  };
  // Shown under the button that was pressed: above the cards it was off-screen on a phone.
  const [error, setError] = useState<{ plan: PlanId; message: string } | null>(null);

  // Back from Stripe can restore this page from the browser's cache with the button still on "Preparing…".
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const startCheckout = async (plan: Plan) => {
    // Cancel on Stripe comes back here (src/lib/checkout-return.ts); ?promo on this page shows the promotion-code box.
    const from = safeReturnPath(window.location.pathname + window.location.search + window.location.hash);
    const promo = new URLSearchParams(window.location.search).has("promo");
    if (!session) {
      openAuthModal({ next: `/checkout?plan=${plan.id}&from=${encodeURIComponent(from)}${promo ? "&promo=1" : ""}` });
      return;
    }
    setLoading(plan.id);
    setError(null);
    trackEvent("begin_checkout", { value: ppp ? parityPrice(planAmount(plan, currency), ppp.percentOff) : planAmount(plan, currency), currency, plan: plan.id, ppp: ppp?.tier ?? "", location: "pricing" });
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id, from, promo }),
      });
      const data = await res.json();
      if (data.alreadyActive) window.location.href = data.url || "/dashboard";
      else if (data.url) window.location.href = data.url;
      else {
        setError({ plan: plan.id, message: data.error || "Could not start checkout. Please try again." });
        setLoading(null);
      }
    } catch {
      setError({ plan: plan.id, message: "Could not start checkout. Please try again." });
      setLoading(null);
    }
  };

  const cards: Plan[] = freeCourse ? [] : [PLANS.monthly, PLANS.lifetime];

  return (
    <section id="pricing" className="relative py-20">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(30,58,95,0.08) 0%, transparent 70%)" }} />

      <InView className="relative max-w-7xl mx-auto px-6 lg:px-8" margin="-100px">
        <Suspense>
          <CheckoutNotice />
        </Suspense>

        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold-700" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">Pricing</span>
            <span className="h-px w-12 bg-gold-700" />
          </div>
          <Heading className="reveal font-display text-4xl md:text-5xl lg:text-6xl font-light text-sand-100 mb-6" style={reveal(0.1, { y: 30 })}>
            Get cited by
            <br />
            <span className="text-gradient-gold font-medium">AI search</span>
          </Heading>
          <p className="reveal font-body text-base md:text-lg text-sand-400 max-w-xl mx-auto font-light leading-relaxed" style={reveal(0.2)}>
            {freeCourse
              ? "Every lesson is free for you: make an account and the whole course opens."
              : "The first lesson is free. After that, pay once and keep the course for good, or learn a month at a time."}
          </p>
        </div>

        {/* The guarantee up front: people who left checkout never had a card declined, they hesitated (src/lib/checkout-copy.ts) */}
        <div className={`reveal flex justify-center mb-10 ${freeCourse ? "hidden" : ""}`} style={reveal(0.25)}>
          <div className="guarantee-seal inline-flex items-center gap-4 border border-gold-500/40 bg-obsidian-light/70 pl-2 pr-6 py-2 rounded-full">
            <span className="guarantee-seal-disc" aria-hidden="true">
              <span className="font-display text-lg font-semibold leading-none">14</span>
              <span className="font-body text-[8px] tracking-[0.2em] uppercase leading-none mt-0.5">days</span>
            </span>
            <span className="text-left">
              <span className="block font-body text-sm md:text-base text-sand-100 font-medium">14-day money-back guarantee</span>
              <span className="block font-body text-xs md:text-sm text-sand-400">Not for you? Email us within 14 days for a full refund.</span>
            </span>
          </div>
        </div>

        {!freeCourse && <PppBanner />}


        <div className={`grid gap-5 lg:gap-8 items-stretch ${freeCourse ? "max-w-xl mx-auto" : "md:grid-cols-2 max-w-4xl mx-auto"}`}>
          {freeCourse && (
            <div className="reveal relative flex order-first" style={reveal(0.3, { y: 40 })}>
              <div className="relative flex-1 flex flex-col [&>div]:flex-1 [&>div]:flex [&>div]:flex-col [&>div]:justify-center [&>div]:p-8 md:[&>div]:p-10">
                {owned === "free-unlock" ? (
                  <FreeCourseCta location="pricing" label="Open my dashboard" href="/dashboard" />
                ) : (
                  <FreeCourseCta location="pricing" />
                )}
              </div>
            </div>
          )}
          {cards.map((plan, i) => {
            const featured = !!plan.featured;
            const covered = (owned === "lifetime" && (plan.id === "lifetime" || plan.id === "monthly")) || (owned === "monthly" && plan.id === "monthly");
            return (
              // Lifetime ("Most chosen") first on phones, on the right from md up
              <div key={plan.id} className={`reveal relative flex ${featured ? "order-first md:order-none md:-my-4" : ""}`} style={reveal(0.3 + i * 0.1, { y: 40 })}>
                {featured && <div className="absolute -inset-px bg-gradient-to-b from-gold-500/40 via-gold-700/10 to-gold-500/40 blur-sm" />}
                <div className={`relative flex-1 flex flex-col bg-obsidian-light border p-8 md:p-10 lg:p-12 ${featured ? "border-gold-500/50" : "border-gold-700/25"}`}>
                  {featured && (
                    <>
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500/60" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500/60" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500/60" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500/60" />
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-body text-[10px] tracking-[0.25em] uppercase bg-gold-500 text-obsidian px-3 py-1">Most chosen</span>
                    </>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-body text-sm tracking-[0.2em] uppercase text-gold-400">{plan.name}</span>
                  </div>

                  <div className="mb-1">
                    <span className={`font-display font-light text-sand-100 ${featured ? "text-7xl" : "text-6xl"}`}>
                      <PlanPrice plan={plan} big={featured} />
                    </span>
                    <span className="font-body text-base text-sand-500 ml-2">{planPeriodLabel(plan)}</span>
                  </div>
                  <p className="font-body text-base text-sand-300 mb-1">{plan.tagline}</p>
                  <p className="font-body text-sm text-sand-500 mb-8">{plan.audience}</p>

                  <ul className="space-y-3.5 mb-10 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-body text-base text-sand-300 font-light">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {covered ? (
                    <Link href="/dashboard" className={`${featured ? "btn-primary" : "btn-secondary"} w-full justify-center text-base py-4`}>
                      {plan.id === "lifetime" ? "You have Lifetime access · Dashboard" : owned === "lifetime" ? "Covered by your Lifetime access" : "Your plan is active · Dashboard"}
                    </Link>
                  ) : (
                    <button
                      onClick={() => startCheckout(plan)}
                      disabled={loading !== null}
                      className={`${featured ? "btn-primary" : "btn-secondary"} w-full justify-center text-base py-4 disabled:opacity-50`}
                    >
                      {loading === plan.id
                        ? "Preparing…"
                        : plan.id === "lifetime"
                          ? owned === "monthly"
                            ? "Upgrade to Lifetime"
                            : "Get Lifetime Access"
                          : "Start Monthly"}
                    </button>
                  )}
                  {error?.plan === plan.id && <CheckoutError message={error.message} />}
                  {!covered && <GuaranteeLine />}
                  {plan.id === "monthly" && (
                    <p className="font-body text-xs text-sand-500 text-center mt-4">
                      Cancel any time from your account. {MONTHS_TO_LIFETIME} months costs the same as Lifetime.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4 text-center">
          {[
            ["14-day guarantee", "Not for you? Email us within 14 days for a full refund."],
            ["Always up to date", "New lessons land as AI search changes, included on both plans."],
            ["Cancel in one click", "Monthly stops from your account page. No emails, no phone calls."],
          ].map(([t, d]) => (
            <div key={t} className="reveal" style={reveal(0.7)}>
              <p className="font-body text-sm text-sand-200 font-medium mt-1">{t}</p>
              <p className="font-body text-xs text-sand-500 mt-1">{d}</p>
            </div>
          ))}
        </div>
      </InView>
    </section>
  );
}
