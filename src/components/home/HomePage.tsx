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
import HomeScene, { type TraceStep } from "@/components/home/HomeScene";

type Trace = { left: TraceStep[]; right: TraceStep[] };

// The agent's trace down the sides of the page, one pair per section, each about what that section covers: an AI
// search tool takes a question, crawls, gets checked by the free tools, ranks passages and weighs the brand, answers
// with citations, and you measure the result. Results stay short (the rails are narrow); every number is illustrative.
const QUESTION: Trace = {
  left: [
    ["query", "cited by ChatGPT?"],
    ["fan-out", "4 sub-queries"],
    ["search", "38 results"],
    ["shortlist", "9 pages"],
    ["read", "9 of 9"],
    ["answer", "drafting"],
  ],
  right: [
    ["prompt", "what is AEO"],
    ["prompt", "AEO vs SEO"],
    ["prompt", "best AEO course"],
    ["prompt", "learn AEO online"],
    ["queue", "4 prompts"],
  ],
};
const CRAWL: Trace = {
  left: [
    ["fetch", "/robots.txt  200"],
    ["OAI-SearchBot", "allowed"],
    ["GPTBot", "allowed"],
    ["ClaudeBot", "allowed"],
    ["PerplexityBot", "allowed"],
    ["crawl", "permitted ✓"],
  ],
  right: [
    ["crawl", "/lessons  200"],
    ["crawl", "/blog  200"],
    ["crawl", "/glossary  200"],
    ["render", "html  0.8s"],
    ["sitemap", "64 urls ✓"],
  ],
};
const TOOLS: Trace = {
  left: [
    ["GET", "/robots.txt  200"],
    ["parse", "14 rules"],
    ["GPTBot", "disallow /"],
    ["fix", "allow: /"],
    ["recheck", "GPTBot ✓"],
  ],
  right: [
    ["GET", "/llms.txt  404"],
    ["generate", "llms.txt"],
    ["sections", "4"],
    ["links", "12"],
    ["llms.txt", "ready ✓"],
  ],
};
const RANK: Trace = {
  left: [
    ["embed", "query → 1536d"],
    ["retrieve", "top_k = 12"],
    ["rank", "passage 7  0.84"],
    ["rank", "passage 1  0.62"],
    ["rank", "passage 3  0.91"],
    ["ground", "3 claims ✓"],
  ],
  right: [
    ["schema", "Course ✓"],
    ["schema", "Offer ✓"],
    ["entity", "Learn AEO"],
    ["sameAs", "3 profiles"],
    ["trust", "high"],
  ],
};
const ANSWER: Trace = {
  left: [
    ["question", "what is AEO?"],
    ["match", "FAQPage"],
    ["extract", "passage 2"],
    ["compose", "182 tokens"],
    ["answer", "ready ✓"],
  ],
  right: [
    ["cite", "[1] learnaeo.com"],
    ["cite", "[2] google.com"],
    ["cite", "[3] openai.com"],
    ["sources", "3 linked"],
  ],
};
const MEASURE: Trace = {
  left: [
    ["prompts", "50 tracked"],
    ["mentioned", "44 of 50"],
    ["cited", "31 of 50"],
    ["share of voice", "+18%"],
  ],
  right: [
    ["mention", "reddit.com"],
    ["mention", "g2.com"],
    ["mention", "linkedin.com"],
    ["mentions", "3 new"],
  ],
};

/** The homepage: the City of Answers hero (HeroSection), then what you'll learn, the lessons, the free tools, pricing, FAQ and contact. */
export default function HomePage() {
  return (
    <main className="grain-overlay">
      <JsonLd data={courseSchema()} />
      <Navbar />
      <HeroSection />
      <HomeScene {...QUESTION}>
        <FeaturesSection />
      </HomeScene>
      <HomeScene {...CRAWL}>
        <LessonsPreview />
      </HomeScene>
      <HomeScene {...TOOLS}>
        <ToolsSection />
      </HomeScene>
      <HomeScene {...RANK}>
        <PricingSection />
      </HomeScene>
      <HomeScene {...ANSWER}>
        <FAQSection />
      </HomeScene>
      <HomeScene {...MEASURE}>
        <ContactSection />
      </HomeScene>
      <Footer />
    </main>
  );
}
