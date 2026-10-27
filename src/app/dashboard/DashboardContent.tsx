"use client";

import OfferBanner, { type OfferData } from "@/components/OfferBanner";
import UpgradePanel from "@/components/lesson/UpgradePanel";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { districtViews } from "@/lib/city-map";
import CityMap from "@/components/CityMap";

import { setAnalyticsUserProperty, trackEvent } from "@/lib/analytics";

import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import XPBar from "@/components/XPBar";
import BadgeShelf from "@/components/BadgeShelf";
import Leaderboard from "@/components/Leaderboard";
import { planById, PLANS } from "@/lib/plans";
import HeardAboutCard from "@/components/HeardAboutCard";
import { fetchJson } from "@/lib/fetch-json";
import { CERTIFICATE } from "@/lib/certificate";

type Progress = {
  lessons: Record<string, { started: boolean; bestScore: number | null; completed: boolean }>;
  streak: number;
  xp: number;
  level: number;
};

/** Shape of GET /api/me: the whole dashboard in one round trip. */
type Me = {
  progress: Progress;
  badges: any[];
  access: { active: boolean; via?: string | null };
  offer: OfferData | null;
  askHeardAbout?: boolean;
  /** The free-unlock test group (src/lib/access-test.ts) */
  accessTest?: "free" | "paid" | null;
  /** Questions in each live lesson's audit, keyed by lesson id */
  auditLengths?: Record<string, number>;
};

const TABS = [
  { id: "journey", label: "City map", short: "Map" },
  { id: "badges", label: "Badges", short: "Badges" },
  { id: "ranks", label: "Leaderboard", short: "Ranks" },
  { id: "certificate", label: "Certificate", short: "Certificate" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const isTabId = (v: string | null): v is TabId => TABS.some((t) => t.id === v);

export default function DashboardContent() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [tab, setTab] = useState<TabId>(() => {
    const t = searchParams.get("tab");
    return isTabId(t) ? t : "journey";
  });

  const selectTab = (next: TabId) => {
    setTab(next);
    trackEvent("dashboard_tab", { tab: next });
    window.history.replaceState({}, "", next === "journey" ? "/dashboard" : `/dashboard?tab=${next}`);
  };

  // One round trip for everything (was eight calls, each with its own
  // session lookup). A non-2xx must leave progress null — storing an error
  // body here once crashed the dashboard on progress.lessons[id].
  useEffect(() => {
    if (!session?.user) return;
    fetchJson<Me>("/api/me")
      .then((d) => {
        setMe(d);
        setProgress(d.progress);
        setBadges(Array.isArray(d.badges) ? d.badges : []);
        setHasSubscription(!!d.access?.active);
        if (d.accessTest) setAnalyticsUserProperty("access_test", d.accessTest);
        setOffer(d.offer);
        if (d.offer) trackEvent("offer_shown", { offer_source: d.offer.source, location: "dashboard" });
      })
      .catch(() => setHasSubscription(false));
  }, [session]);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      const sessionId = searchParams.get("session_id");
      // GA4 purchase — deduped per Stripe session so a reload doesn't re-fire.
      const dedupeKey = sessionId ? `purchase:${sessionId}` : null;
      let already = false;
      try {
        already = !!dedupeKey && localStorage.getItem(dedupeKey) === "1";
        if (dedupeKey && !already) localStorage.setItem(dedupeKey, "1");
      } catch {}
      const plan = planById(searchParams.get("plan")) ?? PLANS.lifetime;
      if (!already) {
        trackEvent("purchase", {
          transaction_id: sessionId ?? undefined,
          value: plan.usd,
          currency: "USD",
          items: [{ item_id: plan.id, item_name: plan.name, price: plan.usd, quantity: 1 }],
        });
      }
      setToast(plan.id === "monthly" ? "Your monthly plan is active. Every lesson is open." : "Welcome! You now have lifetime access to Learn AEO.");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams, status]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-center">
          <p className="font-body text-sand-500 text-sm">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const districts = districtViews(LESSON_CATALOG, progress?.lessons ?? null, !!hasSubscription, me?.auditLengths);
  const liveLessons = LESSON_CATALOG.filter((l) => l.status === "live");
  const comingSoon = LESSON_CATALOG.length - liveLessons.length;
  const completedLive = liveLessons.filter((l) => progress?.lessons[l.id]?.completed).length;
  const completedCount = LESSON_CATALOG.filter((l) => progress?.lessons[l.id]?.completed).length;
  const allCompleted = completedCount === LESSON_CATALOG.length;

  return (
    <div className="min-h-screen bg-obsidian grain-overlay flex flex-col">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gold-500/10 border border-gold-500/30 backdrop-blur-sm"
          >
            <p className="font-body text-sm text-gold-400">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-20 flex-1 w-full">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold-500">
              Your dashboard
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-2">
            Welcome back,{" "}
            <span className="text-gradient-gold font-medium">
              {session.user?.name?.split(" ")[0] || "there"}
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="font-body text-sand-500 font-light">
              Pick up where you left off in the City of Answers.
            </p>
            {progress && progress.streak > 0 && (
              <span className="font-body text-xs text-gold-400 bg-gold-500/10 border border-gold-500/20 px-3 py-1">
                {progress.streak}-day streak
              </span>
            )}
          </div>
        </motion.div>

        {/* A live discount (section-end, lesson-end, abandoned-checkout or day-5 email), for its whole lifetime:
            top of the page, since 2 of the first 3 course sales came from this offer. /api/me only sends it to
            non-paying users, and not where the visitor's own price is already lower. */}
        {offer && !hasSubscription && (
          <div className="mb-8">
            <OfferBanner offer={offer} location="dashboard" variant="still-open" />
          </div>
        )}

        {/* No live discount: the plain price in the same place (2026-10-24: most new accounts never reached a lesson's upgrade screen) */}
        {!offer && me && hasSubscription === false && (
          <div className="mb-8">
            <UpgradePanel paid={false} offer={null} location="dashboard" />
          </div>
        )}

        {/* XP Bar */}
        <div className="mb-8">
          <XPBar xp={progress?.xp ?? 0} />
        </div>

        {me?.askHeardAbout && (
          <div className="mb-8">
            <HeardAboutCard />
          </div>
        )}

        {/* Section tabs: one section visible at a time */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="grid grid-cols-3 gap-1 p-1 mb-8 border border-gold-700/30 bg-obsidian-lighter/70 sm:flex sm:flex-wrap"
        >
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <motion.button
                key={t.id}
                type="button"
                role="tab"
                id={`dashboard-tab-${t.id}`}
                aria-selected={active}
                aria-controls={`dashboard-panel-${t.id}`}
                onClick={() => selectTab(t.id)}
                whileHover="hover"
                whileTap={{ scale: 0.96 }}
                className={`group relative cursor-pointer flex flex-col items-center justify-center gap-1.5 px-1 py-3 font-body text-[10px] tracking-[0.12em] uppercase outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 transition-colors duration-200 sm:flex-1 sm:min-w-[8rem] sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-[11px] sm:tracking-[0.18em] ${
                  active ? "text-obsidian" : "text-sand-400 hover:text-gold-300"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="dashboard-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 bg-gradient-to-br from-gold-600 to-gold-400 shadow-[0_0_22px_rgba(212,168,50,0.35)] overflow-hidden"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[tab-gleam_2.8s_ease-in-out_infinite]" />
                  </motion.span>
                )}
                {!active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 border border-transparent group-hover:border-gold-500/40 group-hover:bg-gold-500/5 transition-colors duration-200"
                  />
                )}
                <span className="relative sm:hidden">{t.short}</span>
                <span className="relative hidden sm:inline">{t.label}</span>
                {!active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px w-0 bg-gold-500 group-hover:w-2/3 transition-all duration-300"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.div
          key={tab}
          role="tabpanel"
          id={`dashboard-panel-${tab}`}
          aria-labelledby={`dashboard-tab-${tab}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
        {tab === "journey" && (
          <>
        <div className="mb-8">
          <h2 className="font-display text-3xl md:text-4xl text-sand-100 mb-2">The City of Answers</h2>
          <p className="font-sans text-sm text-sand-400">
            {completedLive} of {liveLessons.length} {liveLessons.length === 1 ? "lesson" : "lessons"} complete
            {comingSoon > 0 ? ` · ${comingSoon} more ${comingSoon === 1 ? "district" : "districts"} opening soon` : ""}
          </p>
        </div>
        <CityMap districts={districts} />
          </>
        )}

        {tab === "badges" && (
          <>
        {/* Badge Shelf */}
        <div>
          <BadgeShelf badges={badges} />
        </div>

          </>
        )}

        {tab === "ranks" && (
          <>
        {/* Leaderboard */}
        <div>
          <Leaderboard limit={10} showFullLink />
        </div>

          </>
        )}

        {tab === "certificate" && (
          <>
        {/* Certificate Preview — always visible; locked until all lessons complete */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card-ancient p-6 md:p-8"
        >
          <div className="flex items-baseline justify-between mb-5 gap-4">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500">
              Certificate of Completion
            </p>
            <p className="font-body text-xs text-sand-500">
              <span
                className={
                  allCompleted ? "text-gold-400 font-medium" : "text-sand-400"
                }
              >
                {completedCount}
              </span>
              <span className="text-sand-600"> / {LESSON_CATALOG.length} lessons</span>
            </p>
          </div>

          <div className="relative">
            {/* Preview thumbnail — A4 landscape aspect so the whole cert fits */}
            <div
              className={`relative mx-auto w-full max-w-2xl aspect-[1.414/1] border overflow-hidden bg-obsidian transition-all duration-500 ${
                allCompleted
                  ? "border-gold-700/40 shadow-[0_0_40px_rgba(212,168,50,0.15)]"
                  : "border-gold-700/20"
              }`}
              style={{ containerType: "inline-size" }}
            >
              <img
                src={CERTIFICATE.src}
                alt="Certificate of completion preview"
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 ${
                  allCompleted ? "opacity-100" : "opacity-50 grayscale"
                }`}
                style={{ imageRendering: "auto" }}
              />

              {/* Recipient name on the template's name line (CERTIFICATE, shared with the canvas
                  render on /certificate). Sized with container-query units so it scales. */}
              <span
                aria-hidden="true"
                className={`absolute whitespace-nowrap pointer-events-none select-none transition-opacity duration-500 ${
                  allCompleted ? "opacity-100" : "opacity-60"
                }`}
                style={{
                  left: `${CERTIFICATE.nameX * 100}%`,
                  top: `${CERTIFICATE.nameY * 100}%`,
                  transform: "translate(-50%, -100%)",
                  fontFamily: CERTIFICATE.nameFont,
                  fontSize: `${CERTIFICATE.nameSize * 100}cqw`,
                  color: CERTIFICATE.nameColour,
                }}
              >
                {session.user?.name || "Learner"}
              </span>

              {/* Locked overlay */}
              {!allCompleted && (
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent">
                  <div className="text-center px-6 pb-6">
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-2">
                      Locked
                    </p>
                    <p className="font-body text-sm text-sand-100 max-w-sm mx-auto">
                      Complete all {LESSON_CATALOG.length} lessons to unlock your
                      personalised certificate.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            {allCompleted && (
              <div className="mt-6 text-center">
                <Link
                  href="/certificate"
                  className="btn-primary py-3 px-8 text-sm inline-flex"
                >
                  View Your Certificate
                </Link>
              </div>
            )}
          </div>
        </motion.div>
          </>
        )}

        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
