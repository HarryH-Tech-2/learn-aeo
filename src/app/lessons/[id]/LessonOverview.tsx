import type { LiveLesson } from "@/lib/lessons";

/**
 * What a lesson covers, rendered on the server: its description and each concept with its one-line
 * answer. It is the lesson's readable text for anyone (or any crawler) that doesn't run the player,
 * and a summary under it for those who do. Only free lessons render it; paid ones redirect signed-out visitors.
 */
export default function LessonOverview({ lesson }: { lesson: LiveLesson }) {
  return (
    <section aria-labelledby="lesson-overview" className="mx-auto mt-16 max-w-3xl font-sans text-sand-300">
      <h2 id="lesson-overview" className="font-display text-2xl text-sand-100 mb-3">
        What this lesson covers
      </h2>
      <p className="mb-8 leading-relaxed">{lesson.description}</p>
      {lesson.content.groups.map((g) => (
        <div key={g.id} className="mb-6">
          <h3 className="font-display text-xl text-sand-100 mb-2">{g.title}</h3>
          <dl className="space-y-2">
            {g.concepts.map((k) => (
              <div key={k.id}>
                <dt className="font-semibold text-sand-100">{k.term}</dt>
                <dd className="leading-relaxed">{k.summary}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <p className="text-sm text-sand-400">
        {lesson.minutes} minutes, with a quick check after each group, a hands-on exercise ({lesson.content.exercise.title}),
        a real example to take apart, and a final audit.
      </p>
    </section>
  );
}
