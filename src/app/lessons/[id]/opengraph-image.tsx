import { ImageResponse } from "next/og";
import { LESSON_CATALOG, lessonMeta } from "@/lib/lesson-catalog";
import { OG_SIZE, ogCard } from "@/lib/og-image";

// One share image per lesson, built at build time from the catalog.
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A Learn AEO lesson";

export function generateStaticParams() {
  return LESSON_CATALOG.map((l) => ({ id: l.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = lessonMeta(id) ?? LESSON_CATALOG[0];
  return new ImageResponse(
    ogCard({
      eyebrow: `Lesson ${lesson.order} · ${lesson.district}`,
      title: lesson.title,
      footer: lesson.status === "coming-soon" ? "Coming soon" : lesson.isFree ? `Free · ${lesson.minutes} minutes` : `${lesson.minutes} minutes`,
    }),
    OG_SIZE
  );
}
