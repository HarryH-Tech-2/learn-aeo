"use client";

/**
 * The upgrade screen shown straight after Lesson 1's door, at the end of
 * every section of the free lesson, on its outro and on the dashboard. Most free learners never reached the old pitch, which
 * only appeared after the whole lesson; this one meets them at each win.
 *
 * With a live offer it is the countdown banner; without one, the Lifetime
 * price with the monthly pass as the way in. Paying learners never see it.
 * The free-unlock group (src/lib/access-test.ts) sees nothing here: the course is already open to them.
 */
import Link from "next/link";
import { useEffect } from "react";
import OfferBanner, { type OfferData } from "@/components/OfferBanner";
import { usePpp } from "@/components/PppBanner";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import { PLANS } from "@/lib/plans";
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
  /** Analytics: after_door | section_1 | section_2 | lesson_outro | dashboard */
  location: string;
  /** What the learner just did, e.g. "9 signs and 5 words in" */
  progressLine?: string;
};

export default function UpgradePanel({ paid, offer: given, location, progressLine, freeUnlock }: Props) {
  const freeGuest = useFreeCourseGuest();
  if (freeUnlock) return null;
  if (freeGuest && paid === false) {
    return (
      <section aria-label="The whole course is free for you" className="lesson-sheet p-6 md:p-8 text-left border border-gold-500/30">
        {progressLine && <p className="font-body text-sm text-sand-300 mb-4">{progressLine}. Your place is saved.</p>}
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
    <section aria-label="Unlock the full course" className="lesson-sheet p-6 md:p-8 text-left border border-gold-500/30">
      <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Beyond Base Camp</p>
      <h3 className="font-display text-2xl md:text-3xl text-sand-100 font-light mb-2">
        Seven more chambers are <span className="text-gradient-gold font-medium">sealed</span>
      </h3>
      <p className="font-body text-sm text-sand-300 font-light leading-relaxed mb-5 max-w-2xl">
        {progressLine ? `${progressLine}. ` : ""}
        {location === "dashboard" ? "Lesson 1 stays free to the end." : "This lesson stays free to the end."} The rest of the dig, from the Outer Courtyard to the Inner Sanctum, opens with one payment.
      </p>

      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-6">
        {lifetime.features.map((f) => (
          <li key={f} className="font-body text-sm text-sand-300 flex gap-2">
            <span className="text-gold-500" aria-hidden="true">𓋹</span>
            {f}
          </li>
        ))}
      </ul>

      {offer ? (
        <OfferBanner offer={offer} location={location} />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border border-gold-700/25 bg-obsidian-lighter p-5 rounded-xl">
          <div className="flex-1">
            <p className="font-display text-2xl text-sand-100">
              <Price /> <span className="font-body text-sm text-sand-400">once, yours for good</span>
            </p>
            <p className="font-body text-xs text-sand-500 mt-1">
              Or <Price plan={PLANS.monthly} /> a month with the {PLANS.monthly.name}. Cancel any time.
            </p>
          </div>
          <div className="flex flex-col">
            <Link
              href="/checkout"
              onClick={() => trackEvent("upgrade_panel_click", { location, target: "checkout" })}
              className="lesson-btn text-sm py-3 px-6 justify-center"
            >
              Get Lifetime Access
            </Link>
            <GuaranteeNote />
          </div>
        </div>
      )}

      <p className="font-body text-xs text-sand-500 mt-4">
        <Link
          href="/pricing"
          onClick={() => trackEvent("upgrade_panel_click", { location, target: "pricing" })}
          className="underline underline-offset-4 hover:text-gold-400"
        >
          See every plan
        </Link>{" "}
        {location === "dashboard" ? "· Lesson 1 stays free either way." : "· Your place in this lesson is saved either way."}
      </p>
    </section>
  );
}
