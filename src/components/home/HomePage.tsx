import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutHieroglyphics from "@/components/AboutHieroglyphics";
import FeaturesSection from "@/components/FeaturesSection";
import LessonsPreview from "@/components/LessonsPreview";
import TeachersSection from "@/components/TeachersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

/**
 * The homepage: the door video hero (HeroSection) over the page's own background. The 3D stela version it was
 * tested against from 2026-10-01 was removed on 2026-10-26.
 */
export default function HomePage() {
  return (
    <main className="grain-overlay">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "Learn Hieroglyphics",
            description:
              "Master ancient Egyptian hieroglyphic writing with structured lessons covering phonograms, logograms, determinatives, and real inscription reading.",
            provider: {
              "@type": "Organization",
              name: "Learn Hieroglyphics",
              url: "https://www.learnhieroglyphics.com",
            },
            educationalLevel: "Beginner",
            inLanguage: "en",
            isAccessibleForFree: false,
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "online",
              courseWorkload: "self-paced",
            },
          }),
        }}
      />
      <Navbar />
      <HeroSection />
      <AboutHieroglyphics />
      <FeaturesSection />
      <LessonsPreview />
      <TeachersSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
