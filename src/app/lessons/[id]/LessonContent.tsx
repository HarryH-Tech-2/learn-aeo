"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthModal } from "@/components/AuthModal";
import type { OfferData } from "@/components/OfferBanner";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import LessonPlayer from "@/components/player/LessonPlayer";
import { BTN_PRIMARY, BTN_SECONDARY, EYEBROW, FOCUS } from "@/components/player/ui";
import { trackEvent } from "@/lib/analytics";
import { submitAuditResult } from "@/lib/audit-submit";
import { HttpError, fetchJson } from "@/lib/fetch-json";
import { nextLessonMeta } from "@/lib/lesson-catalog";
import type { LessonMeta } from "@/lib/lesson-types";
import type { LiveLesson } from "@/lib/lessons";
import type { XpClaim } from "@/lib/xp-claims";

/** What GET /api/lessons/[id] returns (see that route). */
type LessonResponse =
  | (LiveLesson & { preview?: boolean })
  | (LessonMeta & { locked: true })
  | (LessonMeta & { status: "coming-soon" });

function isLocked(l: LessonResponse): l is LessonMeta & { locked: true } {
  return "locked" in l && l.locked === true;
}

function isPlayable(l: LessonResponse): l is LiveLesson & { preview?: boolean } {
  return l.status === "live" && "content" in l;
}

// (bg-obsidian, not bg-ink: ink stays dark in the light theme, obsidian follows it)
const PAGE = "min-h-screen bg-obsidian flex flex-col";
const MAIN = "mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-28 sm:px-6 lg:px-8";
const PANEL = "mx-auto max-w-2xl rounded-2xl border border-sand-500/25 bg-obsidian-light p-6 sm:p-10";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={PAGE}>
      <Navbar />
      <main className={MAIN}>{children}</main>
      <Footer />
    </div>
  );
}

export default function LessonContent() {
  const params = useParams();
  const id = String(params.id);
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  // "missing" only for a 404; any other failure (network, 5xx) offers a retry instead
  const [loadError, setLoadError] = useState<"missing" | "failed" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [offer, setOffer] = useState<OfferData | null>(null);
  // null until the subscription check answers, so the upgrade pitch never flashes at a payer.
  // It always resolves: a failed check, or local preview without an account, counts as unpaid.
  const [paid, setPaid] = useState<boolean | null>(null);
  const preview = !!(lesson && isPlayable(lesson) && lesson.preview);
  const guest = status === "unauthenticated" && !preview;

  useEffect(() => {
    setLoadError(null);
    fetchJson<LessonResponse>(`/api/lessons/${id}`)
      .then(setLesson)
      .catch((err) => setLoadError(err instanceof HttpError && err.status === 404 ? "missing" : "failed"));
  }, [id, attempt]);

  useEffect(() => {
    if (!session) {
      if (preview) setPaid(false); // local preview has no account: show the free learner's view
      return;
    }
    fetchJson<{ active: boolean }>("/api/stripe/check-subscription")
      .then((s) => setPaid(!!s.active))
      .catch(() => setPaid(false));
  }, [session, preview]);

  // Lessons need an account, the free one included: a guest gets the sign-up modal as a hard gate
  // (its close button goes back to the course list; the player is never mounted for them) and comes back here
  // after signing in.
  const playable = !!lesson && isPlayable(lesson);
  const prompted = useRef(false);
  const askToSignIn = () =>
    openAuthModal({ next: window.location.pathname + window.location.search, dismissible: false, leaveTo: "/#curriculum" });
  useEffect(() => {
    if (guest && playable && !prompted.current) {
      prompted.current = true;
      askToSignIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest, playable]);

  useEffect(() => {
    if (playable && session) {
      fetch("/api/progress/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: id }),
      }).catch(() => null);
    }
  }, [playable, id, session]);

  function handleXP(claim: XpClaim) {
    if (!session) return; // local preview without an account: nothing to save
    // The server prices the claim and pays each key once (a replay after a reload pays 0).
    // fetchJson rejects on a non-2xx response, so a refused claim is logged, not silently treated as saved.
    fetchJson("/api/progress/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: id, ...claim }),
    }).catch((err) => console.error("XP claim not saved", { lessonId: id, ...claim, err }));
  }

  function handleAuditComplete(score: number, total: number) {
    trackEvent("lesson_complete", { lesson_id: id, score, total });
    if (!session) return;
    // Badges are checked only once the result is saved, so streak and completed-count milestones see it.
    void submitAuditResult<{ offer?: OfferData | null }>(id, score, total, (data) => {
      if (data?.offer) {
        setOffer(data.offer);
        trackEvent("offer_shown", { offer_source: data.offer.source, location: "lesson_outro" });
      }
    });
  }

  if (loadError === "failed") {
    return (
      <Shell>
        <section className={`${PANEL} text-center`} role="alert">
          <h1 className="font-display text-3xl text-sand-100 mb-3">Couldn&rsquo;t load this lesson</h1>
          <p className="font-sans text-sand-300 mb-8">Check your connection and try again.</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className={BTN_PRIMARY}>
            Retry
          </button>
        </section>
      </Shell>
    );
  }

  if (loadError === "missing") {
    return (
      <Shell>
        <section className={`${PANEL} text-center`}>
          <h1 className="font-display text-3xl text-sand-100 mb-3">Lesson not found</h1>
          <p className="font-sans text-sand-300 mb-8">There is no lesson at this address.</p>
          <Link href="/dashboard" className={BTN_SECONDARY}>
            Back to the dashboard
          </Link>
        </section>
      </Shell>
    );
  }

  if (!lesson || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian" role="status">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-8 w-8 text-cyan-400 motion-safe:animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="font-sans text-sm text-sand-400">Loading lesson…</p>
        </div>
      </div>
    );
  }

  if (lesson.status === "coming-soon") {
    return (
      <Shell>
        <section className={PANEL}>
          <p className={`${EYEBROW} mb-3`}>{lesson.district}</p>
          <h1 className="font-display text-3xl sm:text-4xl text-sand-100 mb-4">{lesson.title}</h1>
          <p className="font-sans text-base leading-relaxed text-sand-300 mb-6">{lesson.description}</p>
          <p className="font-sans text-sm text-sand-200 mb-8 rounded-xl border border-cyan-500/30 bg-obsidian-lighter p-4">
            This district opens soon. Lifetime access includes every new lesson.
          </p>
          <Link href="/dashboard" className={BTN_SECONDARY}>
            Back to the dashboard
          </Link>
        </section>
      </Shell>
    );
  }

  if (isLocked(lesson)) {
    return (
      <Shell>
        <section className={`${PANEL} text-center`}>
          <p className={`${EYEBROW} mb-3`}>{lesson.district}</p>
          <h1 className="font-display text-3xl sm:text-4xl text-sand-100 mb-4">{lesson.title}</h1>
          <p className="font-sans text-base leading-relaxed text-sand-300 mb-8">{lesson.description}</p>
          <p className="font-sans text-sm text-sand-300 mb-6">
            This lesson is part of the full course. Unlock it, and every other lesson, for a one-time{" "}
            <Price className="font-semibold text-sand-100" />.
          </p>
          <a
            href={session ? "/checkout" : "/get-started?next=checkout"}
            onClick={() => trackEvent("upgrade_panel_click", { location: "locked_lesson", target: "checkout" })}
            className={`${BTN_PRIMARY} w-full sm:w-auto`}
          >
            Get Lifetime Access
          </a>
          <GuaranteeNote included="Every lesson, including each new one as it is released" />
        </section>
      </Shell>
    );
  }

  if (!isPlayable(lesson)) return null;

  // Sign-up gate: the forced auth modal (opened by the effect above) sits over this shell.
  if (guest) {
    return (
      <Shell>
        <section className={`${PANEL} text-center`}>
          <p className={`${EYEBROW} mb-3`}>{lesson.district}</p>
          <h1 className="font-display text-3xl sm:text-4xl text-sand-100 mb-4">{lesson.title}</h1>
          <p className="font-sans text-base text-sand-300 mb-8">
            Create a free account to start this lesson. Your XP and progress will be saved as you go.
          </p>
          <button type="button" onClick={askToSignIn} className={BTN_PRIMARY}>
            Sign up free and begin
          </button>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="mb-8">
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 font-sans text-sm text-sand-400">
          <Link href="/dashboard" className={`hover:text-cyan-400 transition-colors ${FOCUS}`}>
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-cyan-400">{lesson.district}</span>
        </nav>
        <h1 className="font-display text-3xl md:text-4xl text-sand-100">{lesson.title}</h1>
        <p className="mt-1 font-sans text-sm text-sand-400">{lesson.minutes} min</p>
      </header>

      <LessonPlayer
        lesson={lesson}
        onXP={handleXP}
        onAuditComplete={handleAuditComplete}
        upgrade={{ paid, offer }}
        next={nextLessonMeta(id)}
      />
    </Shell>
  );
}
