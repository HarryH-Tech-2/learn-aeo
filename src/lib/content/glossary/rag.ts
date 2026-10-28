import type { GlossaryTerm } from "@/lib/glossary-types";

export const term: GlossaryTerm = {
  slug: "rag",
  term: "Retrieval-augmented generation",
  aka: ["RAG"],
  definition:
    "RAG is a method where an AI system first retrieves relevant passages from an index, then generates its answer using those passages as context.",
  explanation:
    "RAG comes from a 2020 research paper by Lewis and colleagues. Their model paired a text generator with \"a dense vector index of Wikipedia, accessed with a pre-trained neural retriever\". The retriever finds the passages most relevant to the question; the generator writes an answer conditioned on them. The paper reported that this produced more specific and factual language than a model answering from its parameters alone.\n\nThe important split is between what a model learned in training and what it looks up when asked. Training knowledge is fixed until the next model; the index can be updated without retraining.\n\nFor you, the lesson is simple: if your passage isn't retrieved, the generator never sees it, however good the model. That's why crawlability, indexing and clear, self-contained passages come first. Treat the paper as the pattern, not a blueprint of any product: Google, OpenAI, Anthropic and Perplexity each run their own retrieval systems and don't publish the details.",
  related: ["grounding", "passage-ranking", "citation", "answer-engine"],
  lesson: "how-answer-engines-choose-sources",
  sources: [
    {
      title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)",
      publisher: "arXiv",
      url: "https://arxiv.org/abs/2005.11401",
      accessed: "2026-10-28",
      date: "2020-05-22",
      dateKind: "published",
    },
    {
      title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks, full text (v4)",
      publisher: "arXiv",
      url: "https://arxiv.org/html/2005.11401v4",
      accessed: "2026-10-28",
      date: "2021-04-12",
      dateKind: "published",
    },
  ],
};
