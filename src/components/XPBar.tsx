"use client";

import { motion } from "framer-motion";
import { getLevelTitle, getXPForNextLevel } from "@/lib/gamification";

type Props = { xp: number };

export default function XPBar({ xp }: Props) {
  const { currentLevel, nextLevelXP, progress } = getXPForNextLevel(xp);
  const title = getLevelTitle(currentLevel);
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-display text-sm text-gold-400 font-semibold">Lv.{currentLevel}</span>
        <span className="font-body text-xs text-sand-500">{title}</span>
      </div>
      <div className="flex-1 h-2 bg-obsidian-lighter border border-gold-700/10 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-gold-600 to-gold-400" initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
      <span className="font-body text-xs text-sand-600">{xp} XP{nextLevelXP ? ` / ${nextLevelXP}` : ""}</span>
    </div>
  );
}
