"use client";

/**
 * The top of the Journey tab: your rank's tool, how deep you are, lamp oil,
 * and the rival team's position.
 */
import { motion } from "framer-motion";
import { calculateLevel, getLevelTitle } from "@/lib/gamification";
import {
  depthMetres,
  MAX_TORCHES,
  METRES_PER_CHAMBER,
  nextTool,
  orderedLessons,
  rivalStatus,
  toolForLevel,
  xpForLevel,
  type ExpeditionLog,
  type ExpeditionState,
  type LessonProgressMap,
} from "@/lib/expedition";

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;

type Props = {
  name: string;
  xp: number;
  progress: LessonProgressMap | null;
  state: ExpeditionState;
  log: ExpeditionLog | null;
};

export default function ExpeditionHeader({ xp, progress, state, log }: Props) {
  const level = calculateLevel(xp);
  const tool = toolForLevel(level);
  const next = nextTool(level);
  const chambers = orderedLessons();
  const cleared = chambers.filter((l) => progress?.[l.id]?.completed).length;
  const depth = depthMetres(cleared, xp);
  const maxDepth = chambers.length * METRES_PER_CHAMBER;
  const pct = Math.min(100, (depth / maxDepth) * 100);
  const rival = log ? rivalStatus(log, cleared, new Date()) : null;

  return (
    <div className="mb-8">
      <div className="card-ancient p-5 md:p-6">
        {/* Depth strip: the shaft, one notch per chamber */}
        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500">Depth reached</p>
            <p className="font-body text-xs text-gold-400">{depth} m of {maxDepth} m</p>
          </div>
          <div className="relative w-full h-3 bg-obsidian-lighter border border-gold-700/20 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-600 to-gold-400"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {chambers.slice(0, -1).map((l, i) => (
              <span
                key={l.id}
                className="absolute top-0 h-full w-px bg-obsidian/70"
                style={{ left: `${((i + 1) / chambers.length) * 100}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {chambers.map((l, i) => (
              <span key={l.id} className={`font-body text-[9px] ${progress?.[l.id]?.completed ? "text-gold-400" : "text-sand-600"}`} title={l.title}>
                {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][i] ?? i + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl text-gold-400 leading-none" style={GLYPH} aria-hidden="true">
                {tool.glyph}
              </span>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500">Your tool · Lv.{level} {getLevelTitle(level)}</p>
                <p className="font-display text-xl text-sand-100">{tool.name}</p>
                <p className="font-body text-xs text-sand-400">{tool.perk}</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500">Lamp oil</p>
              <p className="text-lg leading-none tracking-wider" aria-label={`${state.torches} of ${MAX_TORCHES} lamps`}>
                {Array.from({ length: MAX_TORCHES }, (_, i) => (
                  <span key={i} className={i < state.torches ? "text-gold-400" : "text-sand-700/40"} aria-hidden="true">
                    🔥
                  </span>
                ))}
              </p>
            </div>
          </div>

          {next && (
            <p className="font-body text-xs text-sand-500 mb-3">
              Next: the <span className="text-sand-300">{next.name}</span> at Lv.{next.level}, {Math.max(0, xpForLevel(next.level) - xp)} XP away. {next.perk}
            </p>
          )}

          <div className="border-t border-gold-700/15 pt-3">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-1">The tomb next door</p>
            <p className="font-body text-sm text-sand-300">
              {rival ? rival.line : "Reading the site register…"}
            </p>
            {rival && (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-body text-[10px] uppercase tracking-[0.15em] text-sand-500 w-14">You</span>
                <div className="flex-1 h-1.5 bg-obsidian-lighter overflow-hidden">
                  <motion.div className="h-full bg-gold-500" initial={{ width: 0 }} animate={{ width: `${(cleared / chambers.length) * 100}%` }} transition={{ duration: 0.8 }} />
                </div>
                <span className="font-body text-[10px] text-sand-400 w-6 text-right">{cleared}</span>
              </div>
            )}
            {rival && (
              <div className="mt-1 flex items-center gap-2">
                <span className="font-body text-[10px] uppercase tracking-[0.15em] text-sand-500 w-14 truncate">Venner</span>
                <div className="flex-1 h-1.5 bg-obsidian-lighter overflow-hidden">
                  <motion.div className="h-full bg-terracotta/70" initial={{ width: 0 }} animate={{ width: `${(rival.chambers / chambers.length) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                </div>
                <span className="font-body text-[10px] text-sand-400 w-6 text-right">{rival.chambers}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
