import type { Metadata } from "next";
import { Suspense } from "react";
import { LESSON_CATALOG, lessonMeta, lessonPath } from "@/lib/lesson-catalog";
import LessonContent from "./LessonContent";
import LessonOverview from "./LessonOverview";
import { getLesson, isLive } from "@/lib/lessons";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

// Only the catalog's lessons exist: any other id is a real 404, not an empty shell.
export const dynamicParams = false;

export async function generateStaticParams() {
  return LESSON_CATALOG.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = lessonMeta(id);

  if (!lesson) {
    return { title: "Lesson not found" };
  }

  return pageMetadata({
    title: lesson.title,
    // The summary first (the line a result shows), then where it sits in the course.
    description: `${lesson.summary} Lesson ${lesson.order} of the Learn AEO course${lesson.isFree ? ", free with sign-in" : ""}.`,
    path: lessonPath(id),
    type: "article",
    // The share image comes from ./opengraph-image.tsx.
    image: null,
    // A coming-soon page has nothing to learn from yet: keep it out of the index until it opens.
    noindex: lesson.status === "coming-soon",
  });
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = lessonMeta(id);
  // Every live lesson gets server-rendered text: the free one in full once signed in, a paid one as its public
  // preview (the outline, intro, exercise brief and sources; the lesson itself comes from /api/lessons/[id]).
  const full = getLesson(id);
  const overview = isLive(full) ? <LessonOverview lesson={full} /> : undefined;

  return (
    <>
      {lesson?.status === "live" && (
        <JsonLd
          data={[
            learningResourceSchema(lesson),
            breadcrumbSchema([
              { name: "Course", path: "/course" },
              { name: lesson.title, path: lessonPath(lesson.id) },
            ]),
          ]}
        />
      )}
      <Suspense>
        <LessonContent overview={overview} />
      </Suspense>
    </>
  );
}
