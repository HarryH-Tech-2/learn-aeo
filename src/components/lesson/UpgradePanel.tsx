"use client";

/**
 * The upgrade pitch for learners on the free plan: on the free lesson's outro
 * (once the subscription check has answered) and on the dashboard.
 *
 * With a live offer it is the countdown banner; without one, the Lifetime
 * price with the Monthly plan as the way in. Paying learners never see it.
 * The free-unlock group (src/lib/access-test.ts) sees nothing here: the course is already open to them.
 */
import Link from "next/link";
import { useEffect } from "react";
import OfferBanner, { type OfferData } from "@/components/OfferBanner";
import { usePpp } from "@/components/PppBanner";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import { PLANS } from "@/lib/plans";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { BTN_PRIMARY, FOCUS } from "@/components/player/ui";
import { trackEvent } from "@/lib/analytics";
import FreeCourseCta from "@/components/FreeCourseCta";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";

export type UpgradeInfo = {
  /** null while the subscription check is still out: the panel waits rather than flashing at a payer */
  paid: boolean | null;
  offer: OfferData | null;
  /** In the free-unlock test's free group (src/lib/access-test.ts): nothing is shown in the pitch's place */
  freeUnlock?: boolean;
};

type Props = UpgradeInfo & {
  /** Analytics: lesson_outro | dashboard */
  location: string;
  /** What the learner just did, e.g. "Audit passed" */
  progressLine?: string;
};

const SHEET = "rounded-2xl border border-cyan-500/30 bg-obsidian-light p-6 text-left md:p-8";

const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const PAID_LESSONS = LESSON_CATALOG.filter((l) => !l.isFree);
const REMAINING = NUMBER_WORDS[PAID_LESSONS.length] ?? String(PAID_LESSONS.length);
const FIRST_PAID = PAID_LESSONS[0]?.district;
const LAST_PAID = PAID_LESSONS[PAID_LESSONS.length - 1]?.district;

export default function UpgradePanel({ paid, offer: given, location, progressLine, freeUnlock }: Props) {
  const freeGuest = useFreeCourseGuest();
  if (freeUnlock) return null;
  if (freeGuest && paid === false) {
    return (
      <section aria-label="The whole course is free for you" className={SHEET}>
        {progressLine && <p className="font-sans text-sm text-sand-300 mb-4">{progressLine}. Your place is saved.</p>}
        <FreeCourseCta location={location} />
      </section>
    );
  }
  return <PaidPitch paid={paid} offer={given} location={location} progressLine={progressLine} />;
}

function PaidPitch({ paid, offer: given, location, progressLine }: Props) {
  const show = paid === false;
  // (where the visitor's purchasing-power price is already lower, the offer is not the price paid: the plain price shows instead)
  const ppp = usePpp();
  const offer = given && !(ppp && ppp.percentOff >= given.percentOff) ? given : null;
  useEffect(() => {
    if (!show) return;
    // offer_shown is fired by the lesson page when the offer itself arrives
    trackEvent("upgrade_panel_shown", { location, offer: offer ? 1 : 0 });
    // once per mount: the offer arriving a moment later is the same showing
  }, [show, location]);
  if (!show) return null;

  const lifetime = PLANS.lifetime;
  return (
    <section aria-label="Unlock the full course" className={SHEET}>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-cyan-400 mb-2">The rest of the City of Answers</p>
      <h3 className="font-display text-2xl md:text-3xl text-sand-100 mb-2">
        {REMAINING} more districts are waiting
      </h3>
      <p className="font-sans text-sm text-sand-300 leading-relaxed mb-5 max-w-2xl">
        {progressLine ? `${progressLine}. ` : ""}
        {location === "dashboard" ? "Lesson 1 stays free to the end." : "This lesson stays free to the end."}{" "}
        {FIRST_PAID && LAST_PAID ? `From ${FIRST_PAID} to ${LAST_PAID}, the rest of the course` : "The rest of the course"} opens
        with Lifetime access or the {PLANS.monthly.name} plan. New lessons are being released in turn, and Lifetime
        includes every future lesson.
      </p>

      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-6">
        {lifetime.features.map((f) => (
          <li key={f} className="font-sans text-sm text-sand-300 flex gap-2">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      {offer ? (
        <OfferBanner offer={offer} location={location} />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-sand-500/30 bg-obsidian-lighter p-5">
          <div className="flex-1">
            <p className="font-display text-2xl text-sand-100">
              <Price /> <span className="font-sans text-sm text-sand-400">once, yours for good</span>
            </p>
            <p className="font-sans text-xs text-sand-400 mt-1">
              Or <Price plan={PLANS.monthly} /> a month with the {PLANS.monthly.name} plan. Cancel any time.
            </p>
          </div>
          <div className="flex flex-col">
            <Link
              href="/checkout"
              onClick={() => trackEvent("upgrade_panel_click", { location, target: "checkout" })}
              className={BTN_PRIMARY}
            >
              Get Lifetime Access
            </Link>
            <GuaranteeNote />
          </div>
        </div>
      )}

      <p className="font-sans text-xs text-sand-400 mt-4">
        <Link
          href="/pricing"
          onClick={() => trackEvent("upgrade_panel_click", { location, target: "pricing" })}
          className={`underline underline-offset-4 hover:text-cyan-400 ${FOCUS}`}
        >
          See every plan
        </Link>{" "}
        · Lesson 1 stays free either way.
      </p>
    </section>
  );
}
