// Types for the AEO glossary (/glossary). Types only, no imports beyond lesson-types.

import type { CodeLanguage, Source } from "./lesson-types";

export type GlossaryTerm = {
  /** URL slug: lowercase, hyphenated, e.g. "query-fan-out". */
  slug: string;
  /** The term as it should be displayed, e.g. "Query fan-out". */
  term: string;
  /** Other names people search for, e.g. ["GEO"] on generative engine optimization. */
  aka?: string[];
  /** One sentence, at most 30 words, that starts with the term (or one of its aka names) and answers "what is it?". */
  definition: string;
  /** Markdown, 80 to 250 words: what it means in practice for a marketer, answer first. */
  explanation: string;
  /** Optional concrete illustration: a robots.txt line, a JSON-LD snippet, a before/after passage. */
  example?: { label: string; body: string; language?: CodeLanguage };
  /** Slugs of related terms (each must exist in the glossary). */
  related: string[];
  /** The lesson id that covers it, from src/lib/lesson-catalog.ts. */
  lesson?: string;
  /** At least one; every factual claim in definition/explanation/example traces to one of these. */
  sources: Source[];
};
