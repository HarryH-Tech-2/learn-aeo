"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BADGE_DEFINITIONS, getLevelTitle, getXPForNextLevel } from "@/lib/gamification";
import { lessonPath } from "@/lib/lesson-catalog";
import type { DistrictView } from "@/lib/city-map";

/**
 * The top of the dashboard: a greeting, the next district to work on as one big "continue" card, the learner's
 * level as a ring, and three stat tiles (lessons, streak, badges).
 */
export default function DashboardHero({
  firstName,
  xp,
  streak,
  badgesEarned,
  districts,
  paid,
}: {
  firstName: string;
  xp: number;
  streak: number;
  badgesEarned: number;
  districts: DistrictView[];
  paid: boolean;
}) {
  const { currentLevel, nextLevelXP, progress } = getXPForNextLevel(xp);
  const title = getLevelTitle(currentLevel);
  const done = districts.filter((d) => d.districtStatus === "done").length;
  const total = districts.length;
  const next = districts.find((d) => d.districtStatus === "next");
  const firstLocked = districts.find((d) => d.districtStatus === "locked");
  const allDone = done === total;

  // SVG ring: circumference of r=42
  const C = 2 * Math.PI * 42;

  return (
    <section aria-label="Your progress" className="dash-hero mb-10">
      <div aria-hidden="true" className="dash-hero-glow" />
      <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Greeting + continue */}
        <div className="flex flex-col">
          <p className="font-body text-xs tracking-[0.25em] uppercase text-cyan-400 mb-3">Your dashboard</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sand-100 mb-3">
            Welcome back, <span className="text-gradient-gold">{firstName}</span>
          </h1>
          <p className="font-body text-lg text-sand-300 mb-6">
            {allDone
              ? "You've walked every district of the City of Answers."
              : done === 0
                ? "Your tour of the City of Answers starts at The Gate."
                : `${done} of ${total} districts done. Keep going.`}
          </p>

          {allDone ? (
            <Link href="/certificate" className="dash-continue group">
              <span className="dash-continue-kicker">Course complete</span>
              <span className="dash-continue-title">Get your certificate</span>
              <span className="dash-continue-meta">Download it and share the verify link</span>
              <span aria-hidden="true" className="dash-continue-arrow">→</span>
            </Link>
          ) : next ? (
            <Link href={lessonPath(next.id)} className="dash-continue group">
              <span className="dash-continue-kicker">
                {next.started ? "Continue" : "Up next"} · District {next.order}: {next.district}
              </span>
              <span className="dash-continue-title">{next.title}</span>
              <span className="dash-continue-meta">
                {next.minutes} min · {next.summary}
              </span>
              <span aria-hidden="true" className="dash-continue-arrow">→</span>
            </Link>
          ) : firstLocked && !paid ? (
            <Link href="/pricing" className="dash-continue group">
              <span className="dash-continue-kicker">Next: District {firstLocked.order}: {firstLocked.district}</span>
              <span className="dash-continue-title">Unlock the rest of the course</span>
              <span className="dash-continue-meta">Every plan opens all {total} lessons</span>
              <span aria-hidden="true" className="dash-continue-arrow">→</span>
            </Link>
          ) : null}
        </div>

        {/* Level ring + stats */}
        <div className="grid gap-4">
          <div className="dash-tile flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r="42" className="dash-ring-track" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="dash-ring-fill"
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: C }}
                  animate={{ strokeDashoffset: C * (1 - progress) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center">
                <span className="text-center leading-none">
                  <span className="block font-body text-[10px] uppercase tracking-[0.2em] text-sand-400">Level</span>
                  <span className="block font-display text-3xl font-bold text-sand-100">{currentLevel}</span>
                </span>
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold text-sand-100">{title}</p>
              <p className="font-body text-sm text-sand-400 mt-1">
                {xp} XP{nextLevelXP ? ` · ${nextLevelXP - xp} to level ${currentLevel + 1}` : " · top level"}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3">
            <div className="dash-tile dash-stat">
              <dt>Lessons</dt>
              <dd>
                {done}
                <span>/{total}</span>
              </dd>
              <div className="dash-mini-bar" aria-hidden="true">
                <span style={{ width: `${(done / total) * 100}%` }} />
              </div>
            </div>
            <div className="dash-tile dash-stat">
              <dt>Streak</dt>
              <dd>
                {streak}
                <span>{streak === 1 ? " day" : " days"}</span>
              </dd>
            </div>
            <div className="dash-tile dash-stat">
              <dt>Badges</dt>
              <dd>
                {badgesEarned}
                <span>/{BADGE_DEFINITIONS.length}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
