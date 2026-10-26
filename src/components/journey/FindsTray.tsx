"use client";

/**
 * The finds tray: one relic per chamber, graded clay → bronze → silver →
 * gold by the Site Report score, polished by a perfect second pass.
 * Click a found relic to turn it in 3D.
 */
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { computeRelics, type ExpeditionState, type LessonProgressMap, type Relic, type RelicGrade } from "@/lib/expedition";

const SignStage = dynamic(() => import("@/components/three/SignStage"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square border border-gold-700/20 bg-obsidian-light/40 flex items-center justify-center">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 animate-pulse">Lifting it out…</p>
    </div>
  ),
});

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;

const GRADE_STYLE: Record<RelicGrade, { ring: string; text: string; label: string }> = {
  clay: { ring: "border-[#8a6a4a]/60 bg-[#3a2a1c]/40", text: "text-[#c9a27a]", label: "Clay" },
  bronze: { ring: "border-[#b87333]/70 bg-[#b87333]/10", text: "text-[#d99a5c]", label: "Bronze" },
  silver: { ring: "border-sand-300/70 bg-sand-300/10", text: "text-sand-100", label: "Silver" },
  gold: { ring: "border-gold-400 bg-gold-500/15 shadow-[0_0_24px_rgba(212,168,50,0.25)]", text: "text-gold-300", label: "Gold" },
};

export default function FindsTray({ progress, state }: { progress: LessonProgressMap | null; state: ExpeditionState }) {
  const relics = computeRelics(progress, state);
  const found = relics.filter((r) => r.grade);
  const [open, setOpen] = useState<Relic | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="card-ancient p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-1">Finds tray</p>
          <h2 className="font-display text-2xl text-sand-100">
            {found.length === 0 ? "Nothing catalogued yet" : `${found.length} of ${relics.length} relics catalogued`}
          </h2>
        </div>
        <p className="font-body text-xs text-sand-500 hidden sm:block">Clay · Bronze · Silver · Gold by Site Report score. A perfect second pass polishes it.</p>
      </div>

      <ul className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {relics.map((r, i) => {
          const g = r.grade ? GRADE_STYLE[r.grade] : null;
          return (
            <li key={r.lessonId}>
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={r.grade ? { y: -3 } : undefined}
                onClick={() => r.grade && setOpen(r)}
                disabled={!r.grade}
                title={r.grade ? `${r.name} · ${g!.label}` : `${r.findNumber}: not yet found`}
                className={`group relative w-full aspect-square flex flex-col items-center justify-center border transition-all ${
                  g ? `${g.ring} cursor-pointer` : "border-dashed border-gold-700/25 bg-obsidian-lighter/40 cursor-default"
                }`}
              >
                <span className={`text-3xl sm:text-4xl leading-none ${g ? g.text : "text-sand-700/40"}`} style={GLYPH} aria-hidden="true">
                  {r.grade ? r.glyph : "𓊖"}
                </span>
                <span className="absolute bottom-1 left-0 right-0 font-body text-[9px] tracking-[0.15em] uppercase text-sand-500">{r.findNumber}</span>
                {r.sealed && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold-400 text-obsidian text-[9px] font-bold flex items-center justify-center" title="Polished: perfect second pass">
                    ✦
                  </span>
                )}
              </motion.button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg card-ancient border border-gold-700/40 p-6 shadow-2xl shadow-black/50"
            >
              <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center border border-gold-700/30 bg-obsidian-lighter text-sand-400 hover:text-gold-300">
                ×
              </button>
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">
                {open.findNumber} · {open.grade && GRADE_STYLE[open.grade].label}
                {open.sealed && " · polished"}
              </p>
              <h3 className="font-display text-2xl text-sand-100 mb-3">{open.name}</h3>
              {open.model ? (
                <div className="max-w-xs mx-auto">
                  <SignStage model={open.model} variant="compact" stageKey={`relic-${open.lessonId}`} />
                  <p className="font-body text-xs text-sand-500 text-center mt-2">Drag to turn it.</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className={`text-8xl leading-none ${open.grade ? GRADE_STYLE[open.grade].text : ""}`} style={GLYPH}>
                    {open.glyph}
                  </span>
                </div>
              )}
              <dl className="mt-4 font-body text-sm space-y-2">
                <div>
                  <dt className="text-[10px] tracking-[0.2em] uppercase text-gold-500">Findspot</dt>
                  <dd className="text-sand-300">{open.provenance}</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.2em] uppercase text-gold-500">Chamber</dt>
                  <dd className="text-sand-300">
                    <Link href={`/lessons/${open.lessonId}`} className="text-gold-400 hover:text-gold-300">
                      {open.lessonTitle}
                    </Link>
                    {open.grade !== "gold" && (
                      <span className="text-sand-500"> · a perfect Site Report turns it gold</span>
                    )}
                  </dd>
                </div>
              </dl>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
