import Navbar from "@/components/Navbar";
import JsonLd from "@/components/JsonLd";
import { courseSchema } from "@/lib/schema";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LessonsPreview from "@/components/LessonsPreview";
import ToolsSection from "@/components/ToolsSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

/** The homepage: the City of Answers hero (HeroSection), then what you'll learn, the lessons, the free tools, pricing, FAQ and contact. */
export default function HomePage() {
  return (
    <main className="grain-overlay">
      <JsonLd data={courseSchema()} />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <LessonsPreview />
      <ToolsSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
