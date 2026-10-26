"use client";

/**
 * Sign mastery: fresh → bronze → silver → gold per sign, from the Fading
 * Paint spaced-repetition state. Progress between lessons, not only at the end.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchJson } from "@/lib/fetch-json";
import { masterySummary, MASTERY_TIERS, type MasteryTier } from "@/lib/expedition";

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;

const TIER_STYLE: Record<MasteryTier, { bar: string; chip: string; label: string }> = {
  fresh: { bar: "bg-sand-600/50", chip: "border-sand-600/40 text-sand-400", label: "Fresh" },
  bronze: { bar: "bg-[#b87333]", chip: "border-[#b87333]/60 text-[#d99a5c]", label: "Bronze" },
  silver: { bar: "bg-sand-300", chip: "border-sand-300/60 text-sand-100", label: "Silver" },
  gold: { bar: "bg-gold-400", chip: "border-gold-400 text-gold-300", label: "Gold" },
};

/** `preloaded` comes from /api/me on the dashboard; undefined = fetch here. */
export default function MasteryMeter({ preloaded }: { preloaded?: unknown[] | null }) {
  const [signs, setSigns] = useState<unknown[] | null>(null);
  useEffect(() => {
    if (preloaded !== undefined) {
      setSigns(Array.isArray(preloaded) ? preloaded : []);
      return;
    }
    fetchJson<{ signs: unknown[] }>("/api/srs")
      .then((d) => setSigns(Array.isArray(d.signs) ? d.signs : []))
      .catch(() => setSigns([]));
  }, [preloaded]);

  const sum = masterySummary(signs ?? []);
  const glyphs = Object.entries(sum.byGlyph);

  return (
    <div className="card-ancient p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-1">Sign mastery</p>
          <h2 className="font-display text-2xl text-sand-100">
            {signs === null ? "Checking the wall…" : sum.total === 0 ? "No signs on your wall yet" : `${sum.mastered} of ${sum.total} signs mastered`}
          </h2>
        </div>
        <Link href="/games/wall" className="font-body text-xs text-gold-500 hover:text-gold-300">
          Repaint on the wall
        </Link>
      </div>

      {sum.total > 0 && (
        <>
          <div className="flex h-2.5 w-full overflow-hidden bg-obsidian-lighter border border-gold-700/15 mb-3">
            {MASTERY_TIERS.map((t) => (
              <motion.div
                key={t}
                className={`h-full ${TIER_STYLE[t].bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${(sum.byTier[t] / sum.total) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {MASTERY_TIERS.map((t) => (
              <span key={t} className={`font-body text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border ${TIER_STYLE[t].chip}`}>
                {TIER_STYLE[t].label} · {sum.byTier[t]}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {glyphs.map(([g, t]) => (
              <span
                key={g}
                title={`${TIER_STYLE[t].label}`}
                className={`w-9 h-9 flex items-center justify-center border text-xl leading-none ${TIER_STYLE[t].chip}`}
                style={GLYPH}
              >
                {g}
              </span>
            ))}
          </div>
          <p className="font-body text-xs text-sand-500 mt-4">
            Bronze after one recall, silver after a week's interval, gold after three weeks with no lapses. Fading Paint and every game feed it.
          </p>
        </>
      )}
      {signs !== null && sum.total === 0 && (
        <p className="font-body text-sm text-sand-400">Clear the first chamber and its signs go up on your wall, ready to be repainted into mastery.</p>
      )}
    </div>
  );
}
