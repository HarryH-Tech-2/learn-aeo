import Link from "next/link";
import type { LiveLesson } from "@/lib/lessons";
import { AUTHOR } from "@/lib/author";

/**
 * What a lesson covers, rendered on the server: its description and each concept with its one-line
 * answer. It is the lesson's readable text for anyone (or any crawler) that doesn't run the player,
 * and a summary under it for those who do. Only free lessons render it; paid ones redirect signed-out visitors.
 */
export default function LessonOverview({ lesson }: { lesson: LiveLesson }) {
  let n = 0;
  return (
    <section aria-labelledby="lesson-overview" className="mx-auto mt-16 max-w-3xl font-sans text-sand-300">
      <p className="font-sans text-xs uppercase tracking-[0.25em] text-cyan-400 mb-2">Lesson outline</p>
      <h2 id="lesson-overview" className="font-display text-2xl md:text-3xl font-bold text-sand-100 mb-3">
        What this lesson covers
      </h2>
      <p className="mb-2 text-lg leading-relaxed max-w-3xl">{lesson.description}</p>
      <p className="mb-8 text-sm text-sand-400">
        By{" "}
        <Link href={AUTHOR.path} className="underline underline-offset-2 hover:text-cyan-400">
          {AUTHOR.name}
        </Link>
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {lesson.content.groups.map((g, gi) => (
          <div key={g.id} className="lesson-outline-card">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-sand-400 mb-1">Part {gi + 1}</p>
            <h3 className="font-display text-xl font-bold text-sand-100 mb-3">{g.title}</h3>
            <dl className="space-y-3">
              {g.concepts.map((k) => (
                <div key={k.id} className="flex gap-3">
                  <span aria-hidden="true" className="lesson-outline-num">{++n}</span>
                  <div>
                    <dt className="font-semibold text-sand-100">{k.term}</dt>
                    <dd className="text-sm leading-relaxed">{k.summary}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-sand-400">
        {lesson.minutes} minutes, with a quick check after each part, a hands-on exercise ({lesson.content.exercise.title}),
        a real example to take apart, and a final audit.
      </p>
    </section>
  );
}
