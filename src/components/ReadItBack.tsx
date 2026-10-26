"use client";

/**
 * "Read it back": the first step of Lesson 1, on the name translator, straight under the cartouche
 * and above the print card (and on the English keyboard, on what was just typed). Up to three
 * one-tap questions on the signs of the name, then a result card. Why: src/lib/sign-quiz.ts.
 *
 * Since 2026-10-16 the result card does not ask for an account straight away: in the 28 days before,
 * 41 finished the questions and 4 clicked its sign-up button. It offers "Learn 3 more signs right
 * here" instead: a teach card and one question for each of three signs NOT in the name
 * (moreSigns in src/lib/sign-quiz.ts), then "You now know K of 25 signs" on a 25-cell meter and the
 * account ask: Continue with Google, or use email (the auth modal), or keep going without an account.
 * The old direct ask stays on the result card as a secondary link, so nobody has to do the extra signs.
 *
 * GA4 (the page path says which page):
 *   exercise_answer / exercise_complete — the read-back questions (exercise "read-back")
 *   read_back_more_start    — "Learn 3 more" tapped (exercise "read-back-more"; known: signs of the name)
 *   read_back_more_answer   — each new-sign question (correct 1/0; sign: the glyph; question_type: sign | sound)
 *   read_back_more_complete — last new-sign question answered (score, total, known: K after the three)
 *   read_back_cta           — a way on to the lesson (question_type: signup | google | email | guest | lesson;
 *                             step: result | more; score, total). "signup" is the result card's direct ask.
 * The sign-up form opening is signup_modal_shown with next = the lesson link, as everywhere; the Google
 * button also sends sign_up (method google), as the auth card's own Google button does.
 *
 * Signed-in learners get the questions and the extra signs too, and a link to the lesson in place of
 * the account ask.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { startGoogleSignIn } from "@/lib/google-sign-in";
import { useAuthModal } from "@/components/AuthModal";
import SignQuestion from "@/components/SignQuestion";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import type { TransliterationResult } from "@/lib/hieroglyph-translator";
import { moreSignQuestions, moreSigns, nameQuestions } from "@/lib/sign-quiz";
import { setSignedInHint } from "@/lib/signed-in-hint";
import { ALPHABET_SIZE, distinctSigns, lessonHrefForName } from "@/lib/translator-bridge";

type Props = {
  name: string;
  results: TransliterationResult[];
  /** The line over the questions; the keyboard asks about what was just typed rather than a name. */
  kicker?: string;
  /** The translator's card reaches past its narrow column on wide screens; the keyboard's does not. */
  bleed?: boolean;
};

/** Where the mini-lesson is: a sign's teach card, its question, or the progress and ask at the end. */
type More = { step: number; phase: "teach" | "ask" } | { phase: "done" };

type CtaType = "signup" | "google" | "email" | "guest" | "lesson";

/** The auth modal's return-URL rule (src/components/AuthModal.tsx): a relative path, no "+" or other odd characters. */
function safeReturn(href: string): string {
  return /^\/(?!\/)[\w\-./?=&%]*$/.test(href) ? href : "/dashboard";
}

export default function ReadItBack({ name, results, kicker = "Can you read it back?", bleed = true }: Props) {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const shown = name.trim();
  const questions = useMemo(() => nameQuestions(name, results), [name, results]);
  const newSigns = useMemo(() => moreSigns(name, results), [name, results]);
  const newQuestions = useMemo(() => moreSignQuestions(name, results, newSigns), [name, results, newSigns]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [more, setMore] = useState<More | null>(null);
  const [moreScore, setMoreScore] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // The card changes height between steps; on a phone, bring its top back into view when it has scrolled off.
  const view = more ? `${more.phase}-${"step" in more ? more.step : ""}` : "";
  useEffect(() => {
    if (!view) return;
    const el = sectionRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [view]);

  if (questions.length === 0) return null;

  const total = questions.length;
  const nameSigns = distinctSigns(results);
  const known = nameSigns.length;
  const left = ALPHABET_SIZE - known;
  const knownAfter = Math.min(ALPHABET_SIZE, known + newSigns.length);
  const leftAfter = ALPHABET_SIZE - knownAfter;
  const lessonHref = lessonHrefForName(name, results);
  const signedIn = status === "authenticated";
  const cta = (type: CtaType) =>
    trackEvent("read_back_cta", { exercise: "read-back", question_type: type, step: more ? "more" : "result", score, total });
  const openSignUp = (type: "signup" | "email") => {
    cta(type);
    openAuthModal({
      next: lessonHref,
      intro: `Create a free account and the door carved with ${shown} is waiting on the other side. No payment needed.`,
    });
  };
  const google = () => {
    cta("google");
    trackEvent("sign_up", { method: "google" });
    setSignedInHint(true);
    void startGoogleSignIn(safeReturn(lessonHref));
  };

  const question = questions[step];
  const newCount = newSigns.length;
  const progress =
    !more ? (question ? `${step + 1} of ${total}` : null) : more.phase === "done" ? null : `New sign ${more.step + 1} of ${newCount}`;

  return (
    <section
      ref={sectionRef}
      aria-label={kicker}
      className={`relative mt-8 w-full scroll-mt-24 ${bleed ? "sm:-mx-24 sm:w-[calc(100%+12rem)]" : ""} border border-gold-600/50 bg-gold-500/10 p-5 md:p-7 text-left`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">
          {more ? "Three more signs" : kicker}
        </p>
        {progress && <p className="font-body text-xs text-sand-500">{progress}</p>}
      </div>

      {more ? (
        more.phase === "teach" ? (
          <TeachCard
            sign={newSigns[more.step]}
            onNext={() => setMore({ step: more.step, phase: "ask" })}
          />
        ) : more.phase === "ask" ? (
          <SignQuestion
            key={`more-${more.step}`}
            question={newQuestions[more.step]}
            prompt={
              newQuestions[more.step].kind === "sign" ? (
                <>
                  Which sign writes <span className="text-gold-400 font-medium">{newQuestions[more.step].subject}</span>?
                </>
              ) : (
                <>Which sound does this sign write?</>
              )
            }
            nextLabel={more.step + 1 < newCount ? "Next new sign" : "See your progress"}
            onAnswer={(correct) => {
              const q = newQuestions[more.step];
              trackEvent("read_back_more_answer", {
                exercise: "read-back-more",
                question_type: q.kind,
                sign: q.glyph,
                correct: correct ? 1 : 0,
              });
              const next = moreScore + (correct ? 1 : 0);
              if (correct) setMoreScore(next);
              if (more.step + 1 === newCount)
                trackEvent("read_back_more_complete", { exercise: "read-back-more", score: next, total: newCount, known: knownAfter });
            }}
            onNext={() => setMore(more.step + 1 < newCount ? { step: more.step + 1, phase: "teach" } : { phase: "done" })}
          />
        ) : (
          <div className="text-center">
            <p className="font-display text-2xl md:text-3xl text-sand-100 leading-tight">
              You now know {knownAfter} of {ALPHABET_SIZE} signs.
            </p>
            <SignMeter nameGlyphs={nameSigns.map((s) => s.mapping.glyph)} newGlyphs={newSigns.map((s) => s.glyph)} shown={shown} />
            <p className="font-body text-sm md:text-base text-sand-300 leading-relaxed mt-4 max-w-xl mx-auto">
              {moreScore === newCount ? `${moreScore} out of ${newCount} on the new ones. ` : `${moreScore} out of ${newCount} on the new ones, and you have seen them all now. `}
              {leftAfter > 0
                ? `Lesson 1 teaches the other ${leftAfter} through real Egyptian words, starting at a sealed door carved with ${shown}.`
                : `Lesson 1 puts every sign to work in real Egyptian words, starting at a sealed door carved with ${shown}.`}
              {signedIn ? "" : " Save your place with a free account."}
            </p>
            <div className="mt-5 flex flex-col items-center gap-3">
              {signedIn ? (
                <Link href={lessonHref} onClick={() => cta("lesson")} className="btn-primary justify-center px-7 py-3 text-base">
                  Open Lesson 1
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={google}
                    className="flex w-full max-w-xs items-center justify-center gap-3 bg-sand-50 px-6 py-3.5 font-body text-sm font-medium text-obsidian transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-gold-500/10"
                  >
                    <GoogleLogo />
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    onClick={() => openSignUp("email")}
                    className="w-full max-w-xs border border-gold-700/40 px-6 py-3 font-body text-sm font-medium text-sand-200 transition-colors hover:border-gold-500/50 hover:text-gold-300"
                  >
                    or use email
                  </button>
                  <Link
                    href={lessonHref}
                    onClick={() => cta("guest")}
                    className="mt-1 font-body text-sm text-sand-400 underline underline-offset-4 hover:text-gold-300"
                  >
                    or keep going without an account
                  </Link>
                </>
              )}
            </div>
          </div>
        )
      ) : question ? (
        <SignQuestion
          key={step}
          question={question}
          prompt={
            question.kind === "sign" ? (
              <>
                Which sign writes the <span className="text-gold-400 font-medium">{question.subject}</span> in {shown}?
              </>
            ) : (
              <>Which sound does this sign write in {shown}?</>
            )
          }
          nextLabel={step + 1 < total ? "Next sign" : "See how you did"}
          onAnswer={(correct) => {
            trackExerciseAnswer({ exercise: "read-back", questionType: question.kind, question: question.glyph, correct });
            const next = score + (correct ? 1 : 0);
            if (correct) setScore(next);
            if (step + 1 === total) trackExerciseComplete({ exercise: "read-back", score: next, total });
          }}
          onNext={() => setStep(step + 1)}
        />
      ) : (
        <div className="text-center">
          <p className="font-display text-2xl md:text-3xl text-sand-100 leading-tight">
            {score === total ? `${score} out of ${total}.` : `${score} out of ${total}, and now you have seen them all.`}{" "}
            You can read {shown}.
          </p>
          <p className="font-body text-sm md:text-base text-sand-300 leading-relaxed mt-3 max-w-xl mx-auto">
            {shown} uses {known} of the {ALPHABET_SIZE} signs in the hieroglyphic alphabet.{" "}
            {newCount > 0
              ? `Want ${newCount === 1 ? "one more" : `${newCount} more`}? It takes about a minute, right here.`
              : left > 0
                ? `Lesson 1 opens on a sealed door carved with your name, then teaches the other ${left} through real Egyptian words. It is free.`
                : "Lesson 1 opens on a sealed door carved with your name, then puts every sign to work in real Egyptian words. It is free."}
          </p>
          <div className="mt-5 flex flex-col items-center gap-3">
            {newCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  trackEvent("read_back_more_start", { exercise: "read-back-more", known, total: newCount });
                  setMore({ step: 0, phase: "teach" });
                }}
                className="btn-primary justify-center px-7 py-3 text-base"
              >
                {newCount === 1 ? "Learn 1 more sign right here" : `Learn ${newCount} more signs right here`}
              </button>
            )}
            {signedIn ? (
              <Link
                href={lessonHref}
                onClick={() => cta("lesson")}
                className={
                  newCount > 0
                    ? "font-body text-sm text-sand-400 underline underline-offset-4 hover:text-gold-300"
                    : "btn-primary justify-center px-7 py-3 text-base"
                }
              >
                {newCount > 0 ? "or go straight to Lesson 1" : "Open Lesson 1"}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openSignUp("signup")}
                  className={
                    newCount > 0
                      ? "font-body text-sm text-sand-300 underline underline-offset-4 hover:text-gold-300"
                      : "btn-primary justify-center px-7 py-3 text-base"
                  }
                >
                  {newCount > 0
                    ? left > 0
                      ? `or learn the other ${left} in Lesson 1 with a free account`
                      : "or start Lesson 1 with a free account"
                    : left > 0
                      ? `Learn the other ${left} signs free`
                      : "Start Lesson 1 free"}
                </button>
                <Link
                  href={lessonHref}
                  onClick={() => cta("guest")}
                  className="font-body text-sm text-sand-400 underline underline-offset-4 hover:text-gold-300"
                >
                  or start without an account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/** One new sign: the picture, what it shows, its sound and the translator's note. */
function TeachCard({ sign, onNext }: { sign: ReturnType<typeof moreSigns>[number]; onNext: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Keyboard users land on the way forward, as in SignQuestion; the page must not scroll to it.
  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, [sign.glyph]);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
      <div className="flex h-28 w-28 shrink-0 items-center justify-center border border-gold-600/50 bg-obsidian/40 sm:h-32 sm:w-32">
        <span className="hieroglyph-font text-7xl leading-none text-gold-400" lang="egy" aria-hidden="true">
          {sign.glyph}
        </span>
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="font-display text-2xl md:text-3xl text-sand-100 leading-tight">The {sign.depicts.toLowerCase()}</p>
        <p className="mt-1 font-body text-base text-sand-200">
          writes <span className="font-semibold text-gold-300">{sign.sound}</span>
        </p>
        <p className="mt-3 font-body text-sm text-sand-400 leading-relaxed">{sign.note}</p>
        <button ref={buttonRef} type="button" onClick={onNext} className="btn-primary mt-4 justify-center px-6 py-2.5 text-sm">
          Got it, test me
        </button>
      </div>
    </div>
  );
}

/** The 25 alphabet signs as a row of cells: the name's signs, the three just learned, and the rest still to come. */
function SignMeter({ nameGlyphs, newGlyphs, shown }: { nameGlyphs: string[]; newGlyphs: string[]; shown: string }) {
  const cells = Array.from({ length: ALPHABET_SIZE }, (_, i) =>
    i < nameGlyphs.length ? "name" : i < nameGlyphs.length + newGlyphs.length ? "new" : "todo",
  );
  return (
    <div className="mx-auto mt-4 max-w-xl">
      <div
        className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-[3px]"
        role="img"
        aria-label={`${Math.min(ALPHABET_SIZE, nameGlyphs.length + newGlyphs.length)} of ${ALPHABET_SIZE} signs known`}
      >
        {cells.map((kind, i) => (
          <span
            key={i}
            className={`h-3 sm:h-4 ${
              kind === "name" ? "bg-gold-600" : kind === "new" ? "bg-gold-300 shadow-[0_0_8px_rgba(240,200,110,0.6)]" : "border border-gold-700/40"
            }`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-body text-xs text-sand-400">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 bg-gold-600" aria-hidden="true" />
          {shown.length > 18 ? "Your text" : shown}:
          <span className="hieroglyph-font text-2xl leading-none text-sand-200" lang="egy">
            {nameGlyphs.join("")}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 bg-gold-300" aria-hidden="true" />
          New:
          <span className="hieroglyph-font text-2xl leading-none text-gold-400" lang="egy">
            {newGlyphs.join("")}
          </span>
        </span>
      </div>
    </div>
  );
}

/** The Google mark, as on the auth card (src/components/AuthCard.tsx). */
function GoogleLogo() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
