"use client";

/**
 * A slim strip promoting the Ancient Egypt Writing Unit while Ancient Egypt is being taught: US visitors
 * 1 Oct to 15 Dec, UK visitors 5 Jan to 31 Mar (src/lib/unit-pack/season.ts). Renders nothing otherwise.
 *
 * The date and the country cookie are read after mount, so the server render (nothing) and the first client
 * render agree. ?season=us-fall or ?season=uk-spring previews it out of season.
 *
 * Any page can use it: <SeasonPromo location="blog" />. GA4: season_promo_view (season, location) once when
 * shown, season_promo_click (season, location, target: pack | sample).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { readCountryCookie } from "@/lib/pricing";
import { previewSeason, teacherSeason, type TeacherSeason } from "@/lib/unit-pack/season";
import { UNIT_PACK_PAGE, paperForCountry, unitPackSamplePath } from "@/lib/unit-pack/product";

type Props = {
  /** Where the strip sits, for GA4 (teachers | worksheet | …). */
  location: string;
  /** Where "See the unit" goes: the unit page, or an anchor on this page. */
  packHref?: string;
  className?: string;
};

export default function SeasonPromo({ location, packHref = UNIT_PACK_PAGE, className = "" }: Props) {
  const [season, setSeason] = useState<TeacherSeason | null>(null);
  const [paper, setPaper] = useState<"a4" | "letter">("a4");

  useEffect(() => {
    const country = readCountryCookie();
    let preview: string | null = null;
    try {
      preview = new URLSearchParams(window.location.search).get("season");
    } catch {
      preview = null;
    }
    const s = previewSeason(preview) ?? teacherSeason(new Date(), country);
    setPaper(s?.id === "us-fall" ? "letter" : paperForCountry(country));
    setSeason(s);
    if (s) trackEvent("season_promo_view", { season: s.id, location });
  }, [location]);

  if (!season) return null;

  const click = (target: "pack" | "sample") => trackEvent("season_promo_click", { season: season.id, location, target });

  return (
    <div className={`border border-gold-500/40 bg-gold-500/[0.07] px-4 py-3 ${className}`} role="note">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="font-body text-sm leading-snug text-sand-200">
          <span className="font-semibold text-gold-300">{season.headline}</span> <span className="text-sand-300">{season.text}</span>
        </p>
        <div className="flex shrink-0 items-center gap-4 font-body text-sm">
          <Link href={packHref} onClick={() => click("pack")} className="font-semibold text-gold-400 underline underline-offset-4 hover:text-gold-300">
            See the unit
          </Link>
          <a
            href={unitPackSamplePath(paper)}
            target="_blank"
            rel="noopener"
            onClick={() => click("sample")}
            className="text-sand-300 underline underline-offset-4 hover:text-sand-100"
          >
            Free Lesson 1
          </a>
        </div>
      </div>
    </div>
  );
}
