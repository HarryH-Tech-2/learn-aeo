// The eight-lesson course catalog: ids, districts, titles, levels and blurbs.
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
    status: "coming-soon",
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
    status: "coming-soon",
  },
  {
    id: "writing-citable-content",
    order: 3,
    district: "The Answer Quarter",
    title: "Writing citable content",
    summary: "Write pages with passages an answer engine can lift and trust.",
    description:
      "Lead with the answer, then support it. You will practise passage-level clarity, question headings, lists and tables, clean definitions, and keeping dates and freshness honest, so each section still makes sense when it is pulled out on its own.",
    level: "beginner",
    minutes: 30,
    isFree: false,
    status: "coming-soon",
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
    status: "coming-soon",
  },
  {
    id: "authority-beyond-your-site",
    order: 5,
    district: "The Agora",
    title: "Authority beyond your site",
    summary: "Earn the mentions, reviews and lists that engines lean on.",
    description:
      "Answer engines learn about you from places you do not control. You will look at brand mentions, reviews, Reddit and forums, digital PR, Wikipedia and Wikidata, and the comparison and \"best X\" lists that shape recommendations.",
    level: "intermediate",
    minutes: 25,
    isFree: false,
    status: "coming-soon",
  },
  {
    id: "platform-playbooks",
    order: 6,
    district: "The Embassies",
    title: "Platform playbooks",
    summary: "What each major answer engine favours, and how to test it.",
    description:
      "Work through Google AI Overviews and AI Mode, ChatGPT search, Perplexity, Copilot and Claude one at a time. For each you will see what it tends to favour and how to run a simple test on your own pages.",
    level: "intermediate",
    minutes: 25,
    isFree: false,
    status: "coming-soon",
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
    status: "coming-soon",
  },
  {
    id: "running-an-aeo-programme",
    order: 8,
    district: "The Citadel",
    title: "Running an AEO programme",
    summary: "Turn everything you have learned into a plan the business will back.",
    description:
      "Run an audit, prioritise what you find, and build a roadmap. You will practise reporting to stakeholders or clients and finish with a 90-day plan you can start on Monday.",
    level: "advanced",
    minutes: 20,
    isFree: false,
    status: "coming-soon",
  },
];

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

/** Paths of free lessons (any status), which signed-out visitors may reach. */
export function publicLessonPaths(): string[] {
  return LESSON_CATALOG.filter((l) => l.isFree).map((l) => lessonPath(l.id));
}

export const TOTAL_MINUTES: number = LESSON_CATALOG.reduce((sum, l) => sum + l.minutes, 0);
