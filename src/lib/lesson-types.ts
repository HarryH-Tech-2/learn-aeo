// Types for lesson content and the lesson catalog. Types only, no imports, so
// any module (including edge middleware) can use them without cost.

export type LessonLevel = "beginner" | "intermediate" | "advanced";

/** Which date a source page shows: when it was first published, or when it was last updated. */
export type SourceDateKind = "published" | "updated";

export type Source = {
  title: string;
  publisher: string;
  url: string;
  /** YYYY-MM-DD: the day the page was checked. */
  accessed: string;
} & (
  | {
      /** YYYY-MM-DD or YYYY-MM, as the page shows it. */
      date: string;
      /** "published" if the page labels the date as its publication date, "updated" for a last-updated or last-modified date. */
      dateKind: SourceDateKind;
    }
  | { date?: undefined; dateKind?: undefined }
);

export type CodeLanguage = "text" | "robots" | "json" | "html" | "http" | "markdown";

export type CodeExample = { kind: "code"; language: CodeLanguage; caption?: string; code: string };
export type BeforeAfterExample = { kind: "before-after"; before: string; after: string; note: string };

export type Concept = {
  id: string;
  term: string;
  summary: string;
  /** Markdown. */
  explanation: string;
  whyItMatters: string;
  example?: CodeExample | BeforeAfterExample;
  pitfall: string;
  sources: Source[];
};

export type Question =
  | { kind: "choice"; id: string; prompt: string; options: string[]; answer: number; explanation: string }
  | { kind: "passage"; id: string; prompt: string; passages: [string, string]; answer: 0 | 1; explanation: string }
  | {
      kind: "blank";
      id: string;
      prompt: string;
      /** "___" marks each gap. */
      text: string;
      answers: string[];
      distractors: string[];
      explanation: string;
      /** Render the text in a monospace font, for code such as a robots.txt file. */
      mono?: boolean;
    }
  | { kind: "order"; id: string; prompt: string; /** Correct order. */ items: string[]; explanation: string }
  | { kind: "match"; id: string; prompt: string; pairs: { term: string; definition: string }[]; explanation: string }
  | {
      kind: "spot";
      id: string;
      prompt: string;
      language: CodeLanguage;
      lines: string[];
      /** Index of the offending line. */
      answer: number;
      explanation: string;
    };

export type QuestionKind = Question["kind"];

export type ConceptGroup = { id: string; title: string; concepts: Concept[]; check: Question[] };

export type SignatureExercise = { id: string; title: string; brief: string; steps: Question[]; debrief: string };

export type DissectExample = {
  title: string;
  context: string;
  excerpt: CodeExample | { kind: "quote"; text: string };
  points: { label: string; text: string }[];
  source: Source;
};

export type LessonContent = {
  intro: string;
  outro: string;
  groups: ConceptGroup[];
  exercise: SignatureExercise;
  example: DissectExample;
  audit: Question[];
};

export type LessonMeta = {
  id: string;
  order: number;
  district: string;
  title: string;
  /** One line. */
  summary: string;
  /** Two or three sentences. */
  description: string;
  level: LessonLevel;
  minutes: number;
  isFree: boolean;
  status: "live" | "coming-soon";
};
