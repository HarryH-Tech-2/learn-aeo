// The course catalog: ids, districts, titles, levels and blurbs, one entry per lesson.
// Imported by middleware, so it must stay edge-safe: import only lesson-types.

import type { LessonMeta } from "./lesson-types";

export const LESSON_CATALOG: readonly LessonMeta[] = [
  {
    id: "how-answer-engines-choose-sources",
    order: 1,
    district: "The Gate",
    title: "How answer engines choose sources",
    summary: "See how AI answers get built, and why they are not ten blue links.",
    description:
      "Follow a question from the prompt to the finished answer: retrieval, grounding and query fan-out. You will learn the difference between being cited and being mentioned, and how an AI answer differs from a results page you already know how to win.",
    level: "beginner",
    minutes: 25,
    isFree: true,
    status: "live",
  },
  {
    id: "make-your-site-reachable-by-ai",
    order: 2,
    district: "The Crawl Docks",
    title: "Make your site reachable by AI",
    summary: "Let the right AI bots in, and stop your own setup turning them away.",
    description:
      "Tell AI crawlers from the user agents that fetch a page on someone's behalf, and decide what your robots.txt should say to each. You will also cover rendering and JavaScript, llms.txt, sitemaps, IndexNow, and the CDN and WAF rules that quietly block bots.",
    level: "beginner",
    minutes: 30,
    isFree: false,
    status: "live",
  },
  {
    id: "writing-citable-content",
    order: 3,
    district: "The Answer Quarter",
    title: "Writing citable content",
    summary: "Write pages with passages ChatGPT and other AI search tools can lift and trust.",
    description:
      "Lead with the answer, then support it. You will practice passage-level clarity, question headings, lists and tables, clean definitions, and keeping dates and freshness honest, so each section still makes sense when it is pulled out on its own.",
    level: "beginner",
    minutes: 30,
    isFree: false,
    status: "live",
  },
  {
    id: "structured-data-and-entities",
    order: 4,
    district: "The Schema Works",
    title: "Structured data and entities",
    summary: "Mark up your pages and make your brand an unambiguous entity.",
    description:
      "Get the JSON-LD essentials right for Organization, Article, FAQPage, HowTo and Product. You will then work on entity consistency, sameAs links and the knowledge graph, so machines know exactly who and what you are.",
    level: "intermediate",
    minutes: 30,
    isFree: false,
    status: "live",
  },
  {
    id: "authority-beyond-your-site",
    order: 5,
    district: "The Agora",
    title: "Authority beyond your site",
    summary: "Earn the mentions, reviews and lists that engines lean on.",
    description:
      "AI search tools learn about you from places you do not control. You will look at brand mentions, reviews, Reddit and forums, digital PR, Wikipedia and Wikidata, and the comparison and \"best X\" lists that shape recommendations.",
    level: "intermediate",
    minutes: 25,
    isFree: false,
    status: "live",
  },
  {
    id: "platform-playbooks",
    order: 6,
    district: "The Embassies",
    title: "Platform playbooks",
    summary: "What ChatGPT, Perplexity, Google and Copilot each favor, and how to test it.",
    description:
      "Work through Google AI Overviews and AI Mode, ChatGPT search, Perplexity, Copilot and Claude one at a time. For each you will see what it tends to favor and how to run a simple test on your own pages.",
    level: "intermediate",
    minutes: 25,
    isFree: false,
    status: "live",
  },
  {
    id: "measuring-ai-visibility",
    order: 7,
    district: "The Observatory",
    title: "Measuring AI visibility",
    summary: "Track whether you appear in AI answers, and what it sends you.",
    description:
      "Build a prompt set, track share of voice, and find AI referral traffic in GA4. You will also read server logs for bot hits and turn the results into a report that people outside your team can follow.",
    level: "advanced",
    minutes: 25,
    isFree: false,
    status: "live",
  },
  {
    id: "running-an-aeo-program",
    order: 8,
    district: "The Citadel",
    title: "Running an AEO program",
    summary: "Turn everything you have learned into a plan the business will back.",
    description:
      "Run an audit, prioritize what you find, and build a roadmap. You will practice reporting to stakeholders or clients and finish with a 90-day plan you can start on Monday.",
    level: "advanced",
    minutes: 20,
    isFree: false,
    status: "live",
  },
  {
    id: "products-and-shopping-in-ai-answers",
    order: 9,
    district: "The Market",
    title: "Products and shopping in AI answers",
    summary: "Get your products into the shopping answers AI assistants give.",
    description:
      "Learn how ChatGPT, Google's AI Mode and Gemini, Copilot and Perplexity choose products, and which merchant listing markup, feeds and reviews feed them. You will fix product markup, write a feed row, keep prices and stock accurate everywhere, and see what the new agentic checkout protocols ask of a merchant.",
    level: "intermediate",
    minutes: 25,
    isFree: false,
    status: "live",
  },
  {
    id: "local-businesses-and-reviews",
    order: 10,
    district: "The Neighborhoods",
    title: "Local businesses and reviews in AI answers",
    summary: "Get your local business into AI answers with accurate listings, markup and reviews.",
    description:
      "Learn how Google ranks local results, what its AI features and ChatGPT document about nearby businesses, and how to claim and align your listings on Google, Apple and Bing. Mark up each location with LocalBusiness structured data, then ask for and reply to reviews within Google's policies and the FTC's rule.",
    level: "intermediate",
    minutes: 35,
    isFree: false,
    status: "live",
  },
  {
    id: "video-images-and-youtube",
    order: 11,
    district: "The Picture House",
    title: "Video, images and YouTube in AI answers",
    summary: "How AI answers use video and images, and the Google and YouTube basics that get yours shown and credited.",
    description:
      "AI Overviews, AI Mode and ChatGPT can show videos and images with links back to their source. Learn what Google, YouTube and OpenAI actually document: watch pages, VideoObject and key moments, video and image sitemaps, YouTube titles, chapters and captions, alt text and image license metadata.",
    level: "intermediate",
    minutes: 25,
    isFree: false,
    status: "live",
  },
  {
    id: "when-ai-gets-your-brand-wrong",
    order: 12,
    district: "The Hall of Records",
    title: "When AI gets your brand wrong",
    summary: "Trace a wrong AI answer about your brand to its source, fix it, and report it the right way.",
    description:
      "Learn why answer engines get brand facts wrong, from hallucinations to outdated training data to faithfully repeating a bad page. You will trace errors through citations, fix the sources under each site's rules, use each platform's documented feedback routes, and avoid the shortcuts that backfire.",
    level: "intermediate",
    minutes: 30,
    isFree: false,
    status: "live",
  },
];

/** A part of the course: a run of consecutive lessons under one heading. */
export type CoursePart = { title: string; summary: string; lessonIds: readonly string[] };

// The course in five parts, in lesson order: how AI search works, your own site, everywhere else, measuring and
// running it. Every lesson sits in exactly one part (lesson-catalog.test.ts).
export const COURSE_PARTS: readonly CoursePart[] = [
  {
    title: "How AI search works",
    summary: "What happens between a question and a cited answer.",
    lessonIds: ["how-answer-engines-choose-sources"],
  },
  {
    title: "Your site",
    summary: "Let AI in, write passages it can lift, and mark up who you are.",
    lessonIds: ["make-your-site-reachable-by-ai", "writing-citable-content", "structured-data-and-entities"],
  },
  {
    title: "Beyond your site",
    summary: "The mentions, reviews and platforms that shape what AI says about you.",
    lessonIds: ["authority-beyond-your-site", "platform-playbooks"],
  },
  {
    title: "Measure and scale",
    summary: "Track your AI visibility and run AEO as an ongoing program.",
    lessonIds: ["measuring-ai-visibility", "running-an-aeo-program"],
  },
  {
    title: "Advanced playbooks",
    summary: "Products, local businesses, video and images, and fixing what AI gets wrong about you.",
    lessonIds: ["products-and-shopping-in-ai-answers", "local-businesses-and-reviews", "video-images-and-youtube", "when-ai-gets-your-brand-wrong"],
  },
];

/** Each part with its lessons, in catalog order. */
export function courseParts(): { part: CoursePart; number: number; lessons: LessonMeta[] }[] {
  return COURSE_PARTS.map((part, i) => ({
    part,
    number: i + 1,
    lessons: part.lessonIds.map((id) => LESSON_CATALOG.find((l) => l.id === id)).filter((l): l is LessonMeta => !!l),
  }));
}

export const FIRST_LESSON_ID = LESSON_CATALOG[0].id;

export function lessonPath(id: string): string {
  return `/lessons/${id}`;
}

export const FIRST_LESSON_PATH = lessonPath(FIRST_LESSON_ID);

export function lessonMeta(id: string): LessonMeta | undefined {
  return LESSON_CATALOG.find((l) => l.id === id);
}

export function nextLessonMeta(id: string): LessonMeta | undefined {
  const current = lessonMeta(id);
  if (!current) return undefined;
  return LESSON_CATALOG.find((l) => l.order === current.order + 1);
}

/** Paths of free lessons (any status), which signed-out visitors may reach, along with anything under them. */
export function publicLessonPaths(): string[] {
  return LESSON_CATALOG.filter((l) => l.isFree).map((l) => lessonPath(l.id));
}

/**
 * Paths of live paid lessons. Signed-out visitors (and crawlers) may open these exact pages, which show a public
 * preview: the outline, intro, exercise brief and sources. The lesson itself stays behind /api/lessons/[id].
 */
export function previewLessonPaths(): string[] {
  return LESSON_CATALOG.filter((l) => !l.isFree && l.status === "live").map((l) => lessonPath(l.id));
}

/** Lessons whose page a signed-out visitor can read: every live one (free in full, paid as a preview). */
export function publicLessons(): LessonMeta[] {
  return LESSON_CATALOG.filter((l) => l.status === "live");
}

/** A lesson title inside a sentence: only the first letter lowercased, so "AEO" and "AI" keep their capitals. */
export function titleMidSentence(title: string): string {
  return title.charAt(0).toLowerCase() + title.slice(1);
}

export const TOTAL_MINUTES: number = LESSON_CATALOG.reduce((sum, l) => sum + l.minutes, 0);
