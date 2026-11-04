import Link from "next/link";
import type { LessonMeta } from "@/lib/lesson-types";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

const LEVEL: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

/**
 * The top of a lesson page: the district's badge, where the lesson sits in the course, its title and one-line summary,
 * and chips for level, length and price. Used while the lesson loads, on the sign-up gate and above the player.
 */
export default function LessonHero({ lesson, breadcrumb = true }: { lesson: LessonMeta; breadcrumb?: boolean }) {
  const badge = BADGE_DEFINITIONS.find((b) => b.criteria === `complete:${lesson.id}`);
  return (
    <header className="lesson-hero mx-auto max-w-3xl mb-8">
      <div aria-hidden="true" className="lesson-hero-glow" />
      <div className="relative flex flex-col sm:flex-row gap-5 sm:items-center">
        {badge && (
          // the district's badge, earned at the end of the lesson
          <img src={badge.icon} alt="" width={96} height={96} className="lesson-hero-badge" />
        )}
        <div className="min-w-0">
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-2 font-sans text-sm text-sand-400">
              <Link href="/course" className="hover:text-cyan-400 transition-colors">
                Course
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-cyan-400">
                Lesson {lesson.order} of {LESSON_CATALOG.length}: {lesson.district}
              </span>
            </nav>
          )}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-sand-100 leading-tight">{lesson.title}</h1>
          <p className="mt-2 font-sans text-lg text-sand-300 max-w-2xl">{lesson.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="About this lesson">
            <li className="lesson-chip">{LEVEL[lesson.level] ?? lesson.level}</li>
            <li className="lesson-chip">{lesson.minutes} min</li>
            {lesson.isFree && <li className="lesson-chip lesson-chip-free">Free</li>}
            {badge && <li className="lesson-chip">Badge: {badge.name}</li>}
          </ul>
        </div>
      </div>
    </header>
  );
}
