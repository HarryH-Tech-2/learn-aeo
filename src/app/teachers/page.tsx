import type { Metadata } from "next";
import TeachersContent from "./TeachersContent";
import { TEACHER_FAQ } from "./faq";

const BASE = "https://www.learnhieroglyphics.com";

export const metadata: Metadata = {
  title:
    "Hieroglyphics for Teachers | Free KS2 & KS3 Ancient Egypt Classroom Resources",
  description:
    "Free hieroglyphics resources for the classroom: a name-to-hieroglyphs translator for the whiteboard, a printable write-your-name worksheet with answer key, and a ready-made 50-minute Ancient Egypt lesson. No pupil accounts needed.",
  alternates: { canonical: `${BASE}/teachers` },
  openGraph: {
    title: "Hieroglyphics for Teachers | Free Ancient Egypt Classroom Resources",
    description:
      "Whiteboard name translator, printable worksheet with answer key, and a ready-made 50-minute lesson for KS2 & KS3 Ancient Egypt. Free, no pupil accounts.",
    url: `${BASE}/teachers`,
    type: "website",
  },
};

export default function TeachersPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Hieroglyphics for Teachers",
      url: `${BASE}/teachers`,
      description:
        "Free hieroglyphics classroom resources for KS2 and KS3 Ancient Egypt: whiteboard name translator, printable worksheet with answer key, and a ready-made lesson outline.",
      audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
      isPartOf: { "@type": "WebSite", name: "Learn Hieroglyphics", url: BASE },
    },
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: "Write Your Name in Hieroglyphs: printable classroom worksheet",
      url: `${BASE}/teachers/worksheet`,
      learningResourceType: "Worksheet",
      educationalLevel: ["Key Stage 2", "Key Stage 3"],
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
      teaches:
        "The 24 uniliteral (alphabet) hieroglyphs, how Egyptian writing records consonants only, and how royal names were written in a cartouche.",
      isAccessibleForFree: true,
      inLanguage: "en-GB",
      provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: BASE },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: TEACHER_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TeachersContent />
    </>
  );
}
