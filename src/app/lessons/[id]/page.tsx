import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { Suspense } from "react";
import { LESSON_CATALOG, lessonMeta, lessonPath } from "@/lib/lesson-catalog";
import LessonContent from "./LessonContent";
import JsonLd from "@/components/JsonLd";
import { learningResourceSchema } from "@/lib/schema";

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
    return { title: "Lesson not found | Learn AEO" };
  }

  const canonical = absoluteUrl(lessonPath(id));
  const title = `${lesson.title} | Learn AEO`;
  const image = "/og-default.png";

  return {
    title,
    description: lesson.description,
    alternates: { canonical },
    // A coming-soon page has nothing to learn from yet: keep it out of the index until it opens.
    ...(lesson.status === "coming-soon" ? { robots: { index: false } } : {}),
    openGraph: {
      title,
      description: lesson.description,
      type: "article",
      url: canonical,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: lesson.description,
      images: [image],
    },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = lessonMeta(id);

  return (
    <>
      {lesson?.status === "live" && (
        <JsonLd data={learningResourceSchema(lesson)} />
      )}
      <Suspense>
        <LessonContent />
      </Suspense>
    </>
  );
}
