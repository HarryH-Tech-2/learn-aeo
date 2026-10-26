"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { planById, PLANS, type Plan } from "@/lib/plans";
import { safeReturnPath } from "@/lib/checkout-return";
import { LAST_PATH_KEY } from "@/components/LastPathTracker";

type Gtag = (cmd: "event", name: string, params: Record<string, unknown>) => void;
type GaWindow = { gtag?: Gtag; __lhGaStarted?: boolean };

/**
 * The page the buyer came from: ?from=, else the last page this tab visited (LastPathTracker), else a same-site
 * referrer, else nothing (the server falls back to /pricing).
 */
function returnPath(fromParam: string | null): string | null {
  if (fromParam) return fromParam;
  try {
    const last = sessionStorage.getItem(LAST_PATH_KEY);
    if (last) return last;
  } catch {
    /* storage blocked */
  }
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === window.location.origin) return ref.pathname + ref.search + ref.hash;
  } catch {
    /* no usable referrer */
  }
  return null;
}

/**
 * begin_checkout, then go to Stripe. gtag loads lazily, so on this page it is often not there yet and the event used
 * to be lost (GA4 saw 4 of ~25 checkouts). Wait briefly for it, send with a callback, and never hold the buyer up
 * for more than about a second. Visitors Analytics doesn't run for (src/lib/consent.ts) just go.
 */
function trackThenGo(plan: Plan, go: () => void) {
  let done = false;
  const once = () => {
    if (done) return;
    done = true;
    go();
  };
  const w = window as unknown as GaWindow;
  const params = { value: plan.usd, currency: "USD", plan: plan.id, location: "checkout" };
  const send = () => {
    w.gtag?.("event", "begin_checkout", { ...params, transport_type: "beacon", event_callback: once, event_timeout: 600 });
    window.setTimeout(once, 700);
  };
  if (w.__lhGaStarted && w.gtag) return send();
  const started = Date.now();
  const poll = window.setInterval(() => {
    if (w.__lhGaStarted && w.gtag) {
      window.clearInterval(poll);
      send();
    } else if (Date.now() - started > 600) {
      window.clearInterval(poll);
      once();
    }
  }, 50);
}

export default function CheckoutContent() {
  const { data: session, status } = useSession();
  const triggered = useRef(false);
  const router = useRouter();
  const params = useSearchParams();
  const plan = planById(params.get("plan")) ?? PLANS.lifetime;
  // Shown when the browser brings this page back from its cache after Stripe (see the pageshow handler).
  const [left, setLeft] = useState(false);
  const [from, setFrom] = useState<string | null>(null);

  const start = useCallback(() => {
    const back = returnPath(params.get("from"));
    setFrom(back);
    fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.id, from: back, promo: params.has("promo") }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.alreadyActive) {
          // Already paid: nothing to buy, straight to the lessons.
          router.replace(data.url || "/dashboard");
        } else if (data.url) {
          // replace, not href: with /checkout left in history, Back from Stripe landed here and this page sent them
          // straight back to Stripe with a new session (sessions 1–30 s apart in Stripe, May–Oct 2026).
          trackThenGo(plan, () => window.location.replace(data.url));
        } else {
          router.replace("/pricing?checkout=error");
        }
      })
      .catch(() => {
        router.replace("/pricing?checkout=error");
      });
  }, [params, plan, router]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // keep the plan and the way back through sign-up (src/components/AuthCard.tsx shows the price)
      router.replace(`/get-started?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (triggered.current) return;
    triggered.current = true;
    start();
  }, [session, status, router, start]);

  // A browser that restores this page from its back/forward cache shows it frozen mid-redirect; offer a way out instead.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLeft(true);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  if (left) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian px-6">
        <div className="text-center max-w-sm">
          <span className="text-5xl block mb-4 text-gold-400" aria-hidden="true">
            &#x13080;
          </span>
          <p className="font-body text-sand-200 mb-1">You left checkout.</p>
          <p className="font-body text-sm text-sand-500 mb-6">You have not been charged.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={safeReturnPath(from)} className="btn-secondary justify-center text-sm py-3 px-6">
              Back to where I was
            </Link>
            <button
              type="button"
              className="btn-primary justify-center text-sm py-3 px-6"
              onClick={() => {
                setLeft(false);
                start();
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian">
      <div className="text-center">
        <span className="text-5xl block mb-4 animate-pulse">&#x13080;</span>
        <p className="font-body text-sand-400 text-sm">
          Preparing your expedition...
        </p>
      </div>
    </div>
  );
}
