"use client";

/**
 * The running mystery: one line of text on the door at the bottom of the
 * shaft. Each cleared chamber brushes the sand off one fragment.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { doorProgress, type LessonProgressMap } from "@/lib/expedition";

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;

export default function SealedDoor({ progress, masteryClean }: { progress: LessonProgressMap | null; masteryClean: boolean }) {
  const door = doorProgress(progress);
  const [open, setOpen] = useState<number | null>(null);
  const sel = open !== null ? door.fragments[open] : null;

  return (
    <div className="card-ancient p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-1">The sealed door</p>
          <h2 className="font-display text-2xl text-sand-100">
            {door.complete ? "Every sign uncovered" : `${door.found} of ${door.total} fragments uncovered`}
          </h2>
        </div>
        <p className="font-body text-xs text-sand-500 max-w-sm">
          At the bottom of the shaft is a door with one line of text. Each chamber you clear brushes the sand off a fragment.
        </p>
      </div>

      {/* The lintel */}
      <div className="relative border border-gold-700/40 bg-[#1a120a] px-4 py-5 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(212,168,50,0.25), transparent 60%)" }} aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-center gap-x-1 gap-y-3">
          {door.fragments.map((f, i) => (
            <button
              key={f.slot}
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              aria-pressed={open === i}
              title={f.found ? f.translit : "Still under the sand"}
              className={`relative px-2 py-1 border transition-all duration-300 ${
                f.found
                  ? open === i
                    ? "border-gold-400 bg-gold-500/15"
                    : "border-transparent hover:border-gold-500/40"
                  : "border-transparent"
              }`}
            >
              <span
                className={`text-2xl sm:text-3xl leading-none tracking-wide ${f.found ? "text-gold-300" : "text-sand-700/50 blur-[3px] select-none"}`}
                style={GLYPH}
                aria-hidden={!f.found}
              >
                {f.signs.map((s) => s.glyph).join("")}
              </span>
              {!f.found && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase text-sand-500 bg-[#1a120a]/80 px-1">sand</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sel && (
          <motion.div key={sel.slot} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-4 p-4 border border-gold-700/20 bg-obsidian-lighter">
            {sel.found ? (
              <>
                <p className="font-body text-sm text-sand-100">
                  <span className="font-display italic text-lg text-gold-300">{sel.translit}</span>
                  <span className="text-sand-500"> · </span>
                  {sel.english}
                </p>
                <p className="font-body text-xs text-sand-400 mt-1">{sel.note}</p>
              </>
            ) : (
              <p className="font-body text-sm text-sand-400">
                This fragment is uncovered by clearing{" "}
                <Link href={`/lessons/${sel.lessonId}`} className="text-gold-400 hover:text-gold-300">
                  the chamber that teaches it
                </Link>
                .
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {door.complete && (
        <div className="mt-4 p-4 border border-gold-500/30 bg-gold-500/5">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-1">The whole line</p>
          <p className="font-display italic text-sand-100">{door.translit}</p>
          <p className="font-body text-sm text-sand-300 mt-1">{door.english}</p>
          <p className="font-body text-xs text-sand-500 mt-2">
            {masteryClean ? "Read unaided at the Inner Sanctum. The tomb is a scribe's, and it is yours." : "Read it unaided at the end of the Inner Sanctum to claim the Seal of the Sanctum."}
          </p>
        </div>
      )}
    </div>
  );
}
