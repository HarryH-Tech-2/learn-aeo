import Navbar from "@/components/Navbar";
import { SITE } from "@/lib/site";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LessonsPreview from "@/components/LessonsPreview";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

/** The homepage: the static hero (HeroSection), then what you'll learn, the lessons, pricing, FAQ and contact. */
export default function HomePage() {
  return (
    <main className="grain-overlay">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "Learn AEO",
            description:
              "Online course for marketers who know SEO on answer engine optimisation (AEO): how ChatGPT, Perplexity, Google AI Overviews and other answer engines choose sources, how to let AI crawlers reach your site, and how to write passages they can cite.",
            provider: {
              "@type": "Organization",
              name: "Learn AEO",
              url: SITE.url,
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
      <FeaturesSection />
      <LessonsPreview />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
