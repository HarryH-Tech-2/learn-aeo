import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/lessons/test-lesson",
}));
vi.mock("@/components/AuthModal", () => ({ useAuthModal: () => ({ openAuthModal: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import LessonPlayer from "@/components/player/LessonPlayer";
import QuestionCard from "@/components/player/QuestionCard";
import ConceptCard from "@/components/player/ConceptCard";
import type { LiveLesson } from "@/lib/lessons";
import type { Concept, Question } from "@/lib/lesson-types";

const CONCEPT: Concept = {
  id: "c-test",
  term: "Grounding",
  summary: "The answer is tied to retrieved passages.",
  explanation: "An engine **grounds** its answer in text it has fetched.\n\nSecond paragraph.",
  whyItMatters: "Only grounded passages get cited.",
  example: { kind: "code", language: "json", caption: "A made-up record", code: '{ "cited": true }' },
  pitfall: "Assuming the model remembers your page.",
  sources: [
    { title: "Source one", publisher: "Publisher A", url: "https://example.com/one", published: "2025-05-21", accessed: "2026-10-26" },
    { title: "Source two", publisher: "Publisher B", url: "https://example.org/two", accessed: "2026-10-26" },
  ],
};

const ORDER: Question = {
  kind: "order",
  id: "q-order",
  prompt: "Put these in order.",
  items: ["Decide to search", "Run queries", "Read pages", "Write the answer"],
  explanation: "That is the flow.",
};

const MATCH: Question = {
  kind: "match",
  id: "q-match",
  prompt: "Match each term.",
  pairs: [
    { term: "Citation", definition: "A link used as evidence" },
    { term: "Mention", definition: "A name without a link" },
    { term: "Retrieval", definition: "Fetching candidate pages" },
  ],
  explanation: "Each has its own meaning.",
};

const SPOT: Question = {
  kind: "spot",
  id: "q-spot",
  prompt: "Which line blocks the crawler?",
  language: "robots",
  lines: ["User-agent: *", "Disallow: /", "Sitemap: https://example.com/sitemap.xml"],
  answer: 1,
  explanation: "Disallow: / blocks everything.",
};

const CHOICE: Question = {
  kind: "choice",
  id: "q-choice",
  prompt: "Pick one.",
  options: ["Right", "Wrong A", "Wrong B"],
  answer: 0,
  explanation: "Because.",
};

const LESSON: LiveLesson = {
  id: "test-lesson",
  order: 1,
  district: "The Test District",
  title: "A test lesson",
  summary: "One line.",
  description: "Two sentences. For the test.",
  level: "beginner",
  minutes: 10,
  isFree: true,
  status: "live",
  content: {
    intro: "You arrive at the test district, where the answers are made.",
    outro: "You leave the test district.",
    groups: [{ id: "g1", title: "Group one", concepts: [CONCEPT], check: [CHOICE] }],
    exercise: { id: "x1", title: "Exercise", brief: "Do the thing.", steps: [ORDER], debrief: "Done." },
    example: {
      title: "An example",
      context: "Context.",
      excerpt: { kind: "quote", text: "A quoted line." },
      points: [{ label: "Point", text: "A point." }],
      source: CONCEPT.sources[0],
    },
    audit: [CHOICE, SPOT],
  },
};

const noop = () => {};
const buttons = (html: string) => html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) ?? [];

describe("LessonPlayer", () => {
  const html = renderToStaticMarkup(
    <LessonPlayer
      lesson={LESSON}
      onXP={noop}
      onAuditComplete={noop}
      upgrade={{ paid: null, offer: null }}
      persist={false}
    />,
  );

  it("renders the intro text, the district name and a Next button", () => {
    expect(html).toContain("You arrive at the test district, where the answers are made.");
    expect(html).toContain("The Test District");
    expect(buttons(html).some((b) => />\s*Next\b/.test(b) || /aria-label="Next/.test(b))).toBe(true);
  });
});

describe("QuestionCard", () => {
  it("order: a Move up and a Move down button for every item", () => {
    const html = renderToStaticMarkup(<QuestionCard question={ORDER} mode="practice" onAnswered={noop} />);
    if (ORDER.kind !== "order") throw new Error("fixture");
    for (const item of ORDER.items) {
      expect(html).toContain(`aria-label="Move ${item} up"`);
      expect(html).toContain(`aria-label="Move ${item} down"`);
    }
  });

  it("match: one button per term and one per definition", () => {
    const html = renderToStaticMarkup(<QuestionCard question={MATCH} mode="practice" onAnswered={noop} />);
    if (MATCH.kind !== "match") throw new Error("fixture");
    const all = buttons(html);
    for (const p of MATCH.pairs) {
      expect(all.filter((b) => b.includes(p.term) && b.includes("aria-pressed")).length).toBeGreaterThanOrEqual(1);
      expect(all.filter((b) => b.includes(p.definition)).length).toBe(1);
    }
  });

  it("spot: one button per line", () => {
    const html = renderToStaticMarkup(<QuestionCard question={SPOT} mode="audit" onAnswered={noop} />);
    if (SPOT.kind !== "spot") throw new Error("fixture");
    const all = buttons(html);
    for (const line of SPOT.lines) {
      expect(all.filter((b) => b.includes(line)).length).toBe(1);
    }
  });
});

describe("ConceptCard", () => {
  const html = renderToStaticMarkup(<ConceptCard concept={CONCEPT} />);

  it("puts the summary before the explanation", () => {
    const summary = html.indexOf(CONCEPT.summary);
    const explanation = html.indexOf("<strong>grounds</strong>");
    expect(summary).toBeGreaterThan(-1);
    expect(explanation).toBeGreaterThan(summary);
  });

  it("links each source by its URL, in a new tab", () => {
    for (const s of CONCEPT.sources) {
      const link = html.match(new RegExp(`<a[^>]*href="${s.url.replace(/[.]/g, "\\.")}"[^>]*>`))?.[0];
      expect(link, s.url).toBeDefined();
      expect(link).toContain('target="_blank"');
      expect(link).toContain('rel="noopener"');
      expect(html).toContain(s.publisher);
    }
  });
});

describe("Lesson 1 content", () => {
  it("renders every concept, question and the example without throwing", async () => {
    const { LESSON_1 } = await import("@/lib/content/lesson-1-the-gate");
    const ExampleDissect = (await import("@/components/player/ExampleDissect")).default;
    for (const g of LESSON_1.groups) {
      for (const c of g.concepts) expect(renderToStaticMarkup(<ConceptCard concept={c} />)).toContain(c.term);
    }
    const questions = [...LESSON_1.groups.flatMap((g) => g.check), ...LESSON_1.exercise.steps, ...LESSON_1.audit];
    for (const q of questions) {
      expect(renderToStaticMarkup(<QuestionCard question={q} mode="practice" onAnswered={noop} />)).toContain("<button");
    }
    expect(renderToStaticMarkup(<ExampleDissect example={LESSON_1.example} />)).toContain(LESSON_1.example.source.url);
  });
});

describe("claimXp", () => {
  it("pays a key once, and a wrong first try (0 XP) still uses the key up", async () => {
    const { claimXp } = await import("@/components/player/xp");
    const claimed = new Set<string>();
    // wrong first try: nothing paid, but the key is taken
    expect(claimXp(claimed, "q:a", 0)).toBe(0);
    // Back, Next, answer right on the remounted card: still nothing
    expect(claimXp(claimed, "q:a", 10)).toBe(0);
    // a right first try pays once
    expect(claimXp(claimed, "q:b", 10)).toBe(10);
    expect(claimXp(claimed, "q:b", 10)).toBe(0);
    // an unclean exercise cannot be redone for the clean bonus
    expect(claimXp(claimed, "exercise-clean:x", 0)).toBe(0);
    expect(claimXp(claimed, "exercise-clean:x", 50)).toBe(0);
  });
});
