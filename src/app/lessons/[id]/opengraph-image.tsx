import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { LESSON_CATALOG, lessonMeta } from "@/lib/lesson-catalog";
import { OG_SIZE, ogCard } from "@/lib/og-image";

// One share image per lesson, built at build time from the catalog.
// generateImageMetadata (one image per lesson) gives each card its own alt text: the lesson's title and place.
// (No dynamicParams = false here: Next can't combine it with generateImageMetadata's id. An unknown lesson 404s instead.)

export function generateStaticParams() {
  return LESSON_CATALOG.map((l) => ({ id: l.id }));
}

/** The share card's alt text, so a screen reader or a feed that can't load the image still names the lesson. */
export function lessonImageAlt(id: string): string {
  const lesson = lessonMeta(id) ?? LESSON_CATALOG[0];
  return `Learn AEO lesson ${lesson.order}: ${lesson.title}`;
}

export async function generateImageMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await params;
  return [{ id: "card", alt: lessonImageAlt(id), size: OG_SIZE, contentType: "image/png" }];
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = lessonMeta(id);
  if (!lesson) notFound();
  return new ImageResponse(
    ogCard({
      eyebrow: `Lesson ${lesson.order} of ${LESSON_CATALOG.length}`,
      title: lesson.title,
      footer: lesson.status === "coming-soon" ? "Coming soon" : lesson.isFree ? `Free · ${lesson.minutes} minutes` : `${lesson.minutes} minutes`,
    }),
    OG_SIZE
  );
}
