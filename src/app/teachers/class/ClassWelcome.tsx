"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COLOURS, GLYPH, SHAPES, TimerRing } from "@/components/classroom/shared";
import { trackEvent } from "@/lib/analytics";

const DEMO_MS = 20_000;
const DEMO_OPTIONS = ["Owl", "Quail chick", "Egyptian vulture", "Horned viper"];
const STEPS = [
  { n: "1", title: "Put this screen on the projector", body: "Open a room and a six-letter code fills the screen. Turn the sound up: the quiz has music." },
  { n: "2", title: "Teams join on a phone or tablet", body: "They type the code and a team name. No accounts, no emails, nothing to install." },
  { n: "3", title: "Ten questions, twenty seconds each", body: "Name the sign, spot the sound, whose cartouche. Faster answers score more, and the podium ends it." },
];

/**
 * /teachers/class before a room is open: what the quiz is, a moving preview of a question as the
 * class will see it, and the one button (open a room, start the free trial, or sign in first).
 */
export default function ClassWelcome({
  action,
  secondary,
  error,
  locked,
  note,
  trialBadge,
}: {
  action: { label: string; sub: string; busy?: boolean; onClick: () => void };
  /** a quieter second choice under the main button */
  secondary?: { label: string; onClick: () => void };
  error?: string | null;
  locked?: boolean;
  /** replaces the locked-screen explanation, e.g. when the free trial has ended */
  note?: string;
  /** shown while the free trial runs */
  trialBadge?: { daysLeft: number; price: string };
}) {
  // the preview's clock runs down and starts again
  const [ms, setMs] = useState(DEMO_MS);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMs(14_000);
      return;
    }
    const t0 = performance.now();
    const id = window.setInterval(() => setMs(DEMO_MS - ((performance.now() - t0) % DEMO_MS)), 100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <div className="hero-media cq-backdrop cq-welcome relative overflow-hidden grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-10 items-center p-6 sm:p-10 text-sand-100">
        <span className="cq-glow cq-glow-a" aria-hidden="true" />
        <span className="cq-glow cq-glow-b" aria-hidden="true" />

        <div className="relative text-center lg:text-left">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-400 mb-3">For teachers · live quiz</p>
          <h1 className="font-display text-4xl sm:text-6xl font-light leading-[1.02]">
            Classroom <span className="text-gradient-gold font-medium">mode</span>
          </h1>
          <p className="font-body text-base sm:text-lg text-sand-200 mt-4 max-w-md mx-auto lg:mx-0">
            A live hieroglyph quiz for the whole class. Your screen runs the show; teams answer on their phones and race up the leaderboard.
          </p>
          <ul className="flex flex-wrap justify-center lg:justify-start gap-2 mt-5 font-body text-xs uppercase tracking-[0.14em] text-sand-200">
            {["10 questions", "About 8 minutes", "No pupil accounts", "Classroom licence"].map((f) => (
              <li key={f} className="px-3 py-1.5 border border-gold-500/40 bg-black/25">
                {f}
              </li>
            ))}
          </ul>
          {locked && (
            <p className="font-body text-sm text-sand-200 mt-5 max-w-md mx-auto lg:mx-0 border-l-2 border-gold-500/60 pl-3 text-left">
              {note ??
                "Classroom mode comes with a Classroom or School licence, along with the full course for you and your pupils and a page showing each pupil\u2019s progress."}
            </p>
          )}
          {trialBadge && (
            <p className="font-body text-sm text-sand-200 mt-5 max-w-md mx-auto lg:mx-0 border-l-2 border-gold-500/60 pl-3 text-left">
              <span className="text-gold-300 font-semibold">
                Free trial · {trialBadge.daysLeft} {trialBadge.daysLeft === 1 ? "day" : "days"} left.
              </span>{" "}
              Keep Classroom mode, and add the full course for 30 pupils, with the{" "}
              <a
                href="/checkout?plan=classroom"
                onClick={() => trackEvent("class_paywall_click", { location: "trial_badge" })}
                className="text-gold-300 underline underline-offset-4 hover:text-gold-200"
              >
                Classroom licence ({trialBadge.price} a year)
              </a>
              .
            </p>
          )}
          {error && <p className="font-body text-sm text-terracotta mt-5">{error}</p>}
          <div className="mt-7">
            <button type="button" onClick={action.onClick} disabled={action.busy} className="hero-cta disabled:opacity-60">
              <span className="hero-cta-seal" aria-hidden="true">
                𓂀
              </span>
              <span className="hero-cta-text">
                <span className="hero-cta-label">{action.label}</span>
                <span className="hero-cta-sub">{action.sub}</span>
              </span>
            </button>
            {secondary && (
              <p className="mt-4">
                <button type="button" onClick={secondary.onClick} className="font-body text-sm text-gold-300 underline underline-offset-4 hover:text-gold-200">
                  {secondary.label}
                </button>
              </p>
            )}
          </div>
          {locked && (
            <p className="font-body text-sm text-sand-300 mt-4">
              Bought a licence already?{" "}
              <Link href="/teachers/licence" className="text-gold-300 underline underline-offset-4 hover:text-gold-200">
                Check it on your licence page
              </Link>
            </p>
          )}
          <p className="font-body text-sm text-sand-300 mt-6">
            <Link href="/teachers/class/guide" className="text-gold-300 underline underline-offset-4 hover:text-gold-200">
              Printable how-to-run-a-session sheet
            </Link>
          </p>
        </div>

        {/* A question as the class sees it. Decoration only: the real thing opens with the button. */}
        <div className="cq-panel relative p-5 sm:p-6 text-center" aria-hidden="true">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left">
              <span className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-500">Name the sign</span>
              <span className="mt-2 flex gap-1.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={`h-1.5 ${i < 2 ? "w-3 bg-gold-600/70" : i === 2 ? "w-7 bg-gold-300" : "w-3 bg-gold-700/20"}`} />
                ))}
              </span>
            </div>
            <TimerRing ms={ms} total={DEMO_MS} size={72} />
          </div>
          <p className="font-display text-2xl sm:text-3xl text-sand-100 mt-2">What does this sign show?</p>
          <div className="relative my-4">
            <span className="cq-rays" />
            <p className="relative text-7xl sm:text-8xl text-gold-300 leading-none" style={GLYPH}>
              <span className="cq-bob inline-block">𓅓</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 pb-1.5">
            {DEMO_OPTIONS.map((o, i) => (
              <div key={o} className={`cq-answer ${COLOURS[i]} text-white p-3 sm:p-4 text-left flex items-center gap-3`}>
                <span className="cq-opt-mark">{SHAPES[i]}</span>
                <span className="cq-opt-badge">{SHAPES[i]}</span>
                <span className="relative font-display text-base sm:text-xl leading-tight">{o}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ol className="grid sm:grid-cols-3 gap-4 mt-6">
        {STEPS.map((s) => (
          <li key={s.n} className="card-ancient p-5 sm:p-6">
            <span className="grid place-items-center w-10 h-10 rounded-full border border-gold-500/60 font-display text-xl text-gold-400 mb-3">{s.n}</span>
            <h2 className="font-display text-xl text-sand-100">{s.title}</h2>
            <p className="font-body text-sm text-sand-400 mt-1.5 leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
