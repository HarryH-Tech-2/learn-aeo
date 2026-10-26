import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Learn Hieroglyphics | Our Mission & Methodology",
  description:
    "Learn about our mission to make ancient Egyptian hieroglyphics accessible to everyone through structured online lessons.",
  alternates: {
    canonical: "https://www.learnhieroglyphics.com/about",
  },
};

// Who is behind the course, for search engines and AI answers (E-E-A-T).
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Harry Harrison",
  jobTitle: "Founder",
  url: "https://www.learnhieroglyphics.com/about",
  image: "https://www.learnhieroglyphics.com/about/harry.jpg",
  sameAs: ["https://www.linkedin.com/in/harry-harrison/", "https://x.com/HarryHH1993"],
  worksFor: { "@type": "Organization", name: "Learn Hieroglyphics", url: "https://www.learnhieroglyphics.com" },
  knowsAbout: ["Egyptian hieroglyphs", "Middle Egyptian", "Ancient Egypt"],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <AboutContent />
    </>
  );
}
