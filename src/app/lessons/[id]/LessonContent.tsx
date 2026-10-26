"use client";

import { trackEvent } from "@/lib/analytics";

import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { fetchJson } from "@/lib/fetch-json";
import Footer from "@/components/Footer";
import LessonStage from "@/components/LessonStage";
import { useAuthModal } from "@/components/AuthModal";
import type { OfferData } from "@/components/OfferBanner";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import { useExpedition } from "@/lib/expedition-client";
import { guestPlayAllowed } from "@/lib/guest-play";

/** Lesson 1 opens to guests who came by a banner (src/lib/guest-play.ts). */
const GUEST_LESSON = "expedition-begins";

interface HieroglyphData {
  symbol: string;
  transliteration: string;
  meaning: string;
  pronunciation: string;
  history: string;
  culture: string;
  examples: string[];
}

interface GlyphGroupData {
  glyphs: HieroglyphData[];
  contextImage: string;
}

interface ExerciseConfigData {
  categories?: { name: string; glyphIndices: number[] }[];
  decodeAvailable: boolean;
  fillInBlanks: { inscription: string; answers: string[]; distractors: string[] }[];
}

interface LessonData {
  id: string;
  title: string;
  areaName: string;
  subtitle: string;
  description: string;
  narrativeIntro: string;
  narrativeOutro: string;
  difficulty: string;
  duration: string;
  category: string;
  isFree: boolean;
  order: number;
  sceneImage: string;
  introVideo: string;
  cutsceneVideo?: string;
  glyphGroups: GlyphGroupData[];
  exerciseConfig: ExerciseConfigData;
  hieroglyphs?: HieroglyphData[];
  /** Signs from earlier lessons for the Field Notes review */
  review?: HieroglyphData[];
  locked?: boolean;
  /** Local preview only (AEO_DEV_BYPASS_AUTH=1): never set in production */
  preview?: boolean;
}

export default function LessonContent() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const guest = status === "unauthenticated" && !lesson?.preview;
  const [totalXP, setTotalXP] = useState(0);
  const [offer, setOffer] = useState<OfferData | null>(null);
  // null until the subscription check answers, so the upgrade screen never flashes at a payer
  const [paid, setPaid] = useState<boolean | null>(null);
  const [freeUnlock, setFreeUnlock] = useState(false);
  const preview = !!lesson?.preview; // (a boolean, so the record arriving with preview: false does not ask again)
  useEffect(() => {
    if (!session) {
      if (preview) setPaid(false); // local preview has no account: show the free learner's view
      return;
    }
    fetchJson<{ active: boolean; via?: string | null }>("/api/stripe/check-subscription")
      .then((s) => {
        setPaid(!!s.active);
        setFreeUnlock(s.via === "free-unlock");
      })
      .catch(() => setPaid(false));
  }, [session, preview]);
  const { state: expedition, update: updateExpedition, ready: expeditionReady } = useExpedition();
  const searchParams = useSearchParams();
  // Second pass (?pass=2) needs the chamber cleared; otherwise it is the ordinary lesson.
  const [cleared, setCleared] = useState<boolean | null>(null);
  // The account's XP when the page opened: the written lesson's level bar adds this sitting's XP to it.
  const [baseXP, setBaseXP] = useState<number | null>(null);
  // (once per sign-in, not on every session refresh: a later fetch would already count this sitting's XP)
  const authed = status === "authenticated";
  useEffect(() => {
    if (!authed) return;
    fetchJson<{ lessons: Record<string, { completed: boolean }>; xp?: number }>("/api/progress")
      .then((p) => {
        setCleared(!!p.lessons[String(id)]?.completed);
        setBaseXP(p.xp ?? 0);
      })
      .catch(() => {
        setCleared(false);
        setBaseXP(0);
      });
  }, [authed, id]);
  const pass: 1 | 2 = searchParams.get("pass") === "2" && cleared ? 2 : 1;

  // Guest play (src/lib/guest-play.ts): came by a blog or translator banner, so the lesson opens before any account
  // is asked for. null until the browser has been asked, so the sign-up wall is not opened in the meantime.
  const [guestPlay, setGuestPlay] = useState<boolean | null>(null);
  useEffect(() => {
    setGuestPlay(id === GUEST_LESSON && guestPlayAllowed(searchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Arrivals from the name translator carry ?name=; the sealed door in
  // lesson 1 is carved with it, so the gate promises exactly that.
  const doorName = (searchParams.get("name") ?? "").trim().slice(0, 30);
  const gateIntro = doorName
    ? `Create a free account and the door carved with ${doorName} opens on the other side. Ten seconds with Google or a magic link.`
    : undefined;

  // Lessons require an account: guests get the sign-up modal as a hard gate
  // (no close button; the playable lesson is never mounted for them). After
  // signing up they come back to this lesson via ?next.
  // A guest who came by a banner may take Lesson 1, whose own first part is open to guests up to the door
  // (LessonStage then asks for the account, before the words).
  const guestAllowed = guest && guestPlay === true;
  const promptedGuest = useRef(false);
  useEffect(() => {
    if (guestPlay === null || guestAllowed) return;
    if (guest && lesson && !lesson.locked && !promptedGuest.current) {
      promptedGuest.current = true;
      openAuthModal({
        next: window.location.pathname + window.location.search,
        dismissible: false,
        intro: gateIntro,
      });
    }
  }, [guest, lesson, openAuthModal, gateIntro, guestPlay, guestAllowed]);

  const guestStarted = useRef(false);
  useEffect(() => {
    if (!guestAllowed || guestStarted.current) return;
    guestStarted.current = true;
    trackEvent("guest_play_start", { named: doorName ? 1 : 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestAllowed]);

  useEffect(() => {
    fetchJson<LessonData>(`/api/lessons/${id}`)
      .then(setLesson)
      .catch(() => null);
  }, [id]);

  useEffect(() => {
    if (lesson && !lesson.locked && session) {
      fetch("/api/progress/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: id }),
      }).catch(() => null);
    }
  }, [lesson, id, session]);

  function handleXPEarned(xp: number) {
    setTotalXP((prev) => prev + xp);
    if (!session) return; // guests keep a local tally only
    fetch("/api/progress/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: id, xp }),
    }).catch(() => null);
  }

  /** A section of the free lesson ended: open (or fetch) the discount for the upgrade screen. */
  function handleSectionComplete(section: number) {
    fetch("/api/progress/section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: id, section }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { paid?: boolean; freeUnlock?: boolean; offer?: OfferData | null } | null) => {
        if (!data) return;
        if (typeof data.paid === "boolean") setPaid(data.paid);
        if (data.freeUnlock) setFreeUnlock(true);
        if (data.offer) {
          setOffer(data.offer);
          trackEvent("offer_shown", { offer_source: data.offer.source, location: `section_${section}` });
        }
      })
      .catch(() => null);
  }

  function handleReportComplete(score: number, total: number) {
    trackEvent("lesson_complete", { lesson_id: id, score, total });
    fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: id, score, totalQuestions: total }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { offer?: OfferData | null } | null) => {
        if (data?.offer) {
          setOffer(data.offer);
          trackEvent("offer_shown", { offer_source: data.offer.source, location: "lesson_outro" });
        }
      })
      .catch(() => null);
    fetch("/api/badges/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: id, score, total }),
    }).catch(() => null);
  }

  if (!lesson || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-center">
          <span className="text-5xl block mb-4 animate-pulse">𓋴</span>
          <p className="font-body text-sand-500 text-sm">
            Unrolling the papyrus...
          </p>
        </div>
      </div>
    );
  }

  // Paywall gate — show preview with overlay
  if (lesson.locked) {
    return (
      <div className="min-h-screen bg-obsidian grain-overlay flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 flex-1 w-full">
          {/* Lesson Header (visible as preview) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="font-body text-xs tracking-[0.2em] uppercase text-gold-500">
                {lesson.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-sand-600" />
              <span className="font-body text-xs text-sand-500">
                {lesson.duration}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-3">
              {lesson.title}
            </h1>
            <p className="font-body text-lg text-sand-400 font-light max-w-3xl">
              {lesson.description}
            </p>
          </motion.div>

          {/* Blurred content preview */}
          <div className="relative">
            <div className="blur-sm opacity-40 pointer-events-none select-none">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 card-ancient p-6">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-4">
                    Signs in this lesson
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {(lesson.hieroglyphs || []).slice(0, 8).map((g, i) => (
                      <div
                        key={i}
                        className="aspect-square flex items-center justify-center border border-gold-700/15 bg-obsidian-lighter"
                      >
                        <span
                          className="text-2xl text-gold-600/50"
                          style={{
                            fontFamily:
                              "'Noto Sans Egyptian Hieroglyphs', serif",
                          }}
                        >
                          {g.symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-3 card-ancient p-8 md:p-10">
                  <div className="text-center mb-8">
                    <span
                      className="text-8xl text-gold-400/50 inline-block"
                      style={{
                        fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif",
                      }}
                    >
                      {lesson.hieroglyphs?.[0]?.symbol || "\u{13080}"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center bg-obsidian/90 backdrop-blur-sm border border-gold-700/30 p-10 max-w-md"
              >
                <span className="text-5xl block mb-4">{"\u{13080}"}</span>
                <h2 className="font-display text-2xl font-light text-sand-100 mb-3">
                  This Scroll is{" "}
                  <span className="text-gradient-gold font-medium">Sealed</span>
                </h2>
                <p className="font-body text-sm text-sand-400 mb-6 font-light">
                  Unlock this lesson and all others with a one-time <Price /> purchase.
                </p>
                <a
                  href={session ? "/checkout" : "/get-started?next=checkout"}
                  className="btn-primary w-full justify-center text-sm py-4"
                >
                  Get Lifetime Access
                </a>
                <GuaranteeNote included="Every lesson and game, yours for life" />
              </motion.div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Sign-up gate: the playable lesson is only mounted for signed-in users.
  // The forced auth modal (opened by the effect above) sits over this shell.
  if (guest && !guestAllowed) {
    return (
      <div className="min-h-screen bg-obsidian grain-overlay flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 pt-28 pb-20">
          <div className="text-center max-w-md">
            <span
              className="text-6xl block mb-6 text-gold-500"
              style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}
            >
              &#x13080;
            </span>
            <h1 className="font-display text-3xl font-light text-sand-100 mb-3">
              {lesson.title}
            </h1>
            <p className="font-body text-sm text-sand-400 font-light mb-8">
              {doorName
                ? `A sealed door carved with ${doorName} is waiting. Create a free account to open it; your signs, XP and progress stay with you.`
                : "Create a free account to start this lesson. Your signs, XP and progress will be waiting for you."}
            </p>
            <button
              onClick={() =>
                openAuthModal({
                  next: window.location.pathname + window.location.search,
                  dismissible: false,
                  intro: gateIntro,
                })
              }
              className="btn-primary text-sm py-3.5 px-8"
            >
              {doorName ? "Sign up free & open the door" : "Sign up free & begin"}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen lesson-backdrop grain-overlay flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 flex-1 w-full">
        {/* Lesson header: kept short, so the lesson itself starts above the fold */}
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-2 font-body text-sm text-sand-500">
              <Link href={guest ? "/" : "/dashboard"} className="hover:text-gold-400 transition-colors">
                {guest ? "Home" : "Dashboard"}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-gold-500">{lesson.category}</span>
            </nav>
            <h1 className="font-display text-3xl md:text-4xl font-light text-sand-100">{lesson.title}</h1>
            <p className="font-body text-sm text-sand-500 mt-1">{id === GUEST_LESSON ? "In 3 parts, about 10 minutes each" : lesson.duration}</p>
          </div>
        </motion.header>

        <LessonStage
          key={pass}
          guest={guest}
          lesson={lesson as any}
          onXPEarned={handleXPEarned}
          onReportComplete={handleReportComplete}
          onSectionComplete={handleSectionComplete}
          upgrade={{ paid, offer, freeUnlock }}
          expedition={expedition}
          onExpedition={updateExpedition}
          pass={pass}
          xp={{ base: baseXP ?? 0, session: totalXP, ready: guest || baseXP !== null }}
          placeReady={expeditionReady}
        />
      </div>
      <Footer />
    </div>
  );
}
