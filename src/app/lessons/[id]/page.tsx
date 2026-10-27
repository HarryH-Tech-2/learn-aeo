import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import { Suspense } from "react";
import { lessons } from "@/lib/legacy-lessons";
import LessonContent from "./LessonContent";

export async function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = lessons.find((l) => l.id === id);

  if (!lesson) {
    return { title: "Lesson Not Found - Learn AEO" };
  }

  const canonical = absoluteUrl(`/lessons/${id}`);
  const title = `${lesson.title}: ${lesson.subtitle} | Learn AEO`;

  return {
    title,
    description: lesson.description,
    alternates: { canonical },
    openGraph: {
      title,
      description: lesson.description,
      type: "article",
      url: canonical,
      images: [{ url: lesson.sceneImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: lesson.description,
      images: [lesson.sceneImage],
    },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = lessons.find((l) => l.id === id);

  return (
    <>
      {lesson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: lesson.title,
              description: lesson.description,
              url: absoluteUrl(`/lessons/${lesson.id}`),
              educationalLevel: lesson.difficulty,
              learningResourceType: "Lesson",
              timeRequired: `PT${lesson.duration.replace(/\D/g, "")}M`,
              inLanguage: "en",
              isAccessibleForFree: lesson.isFree,
              provider: {
                "@type": "Organization",
                name: "Learn AEO",
                url: SITE.url,
              },
              isPartOf: {
                "@type": "Course",
                name: "Learn AEO",
                url: SITE.url,
                provider: {
                  "@type": "Organization",
                  name: "Learn AEO",
                  url: SITE.url,
                },
              },
            }),
          }}
        />
      )}
      <Suspense>
        <LessonContent />
      </Suspense>
    </>
  );
}
