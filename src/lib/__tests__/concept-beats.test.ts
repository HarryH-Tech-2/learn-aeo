import { describe, it, expect } from "vitest";
import { conceptBeats, explanationChunks } from "@/lib/concept-beats";
import { LESSONS, isLive } from "@/lib/lessons";
import type { Concept } from "@/lib/lesson-types";

const para = (n: number, word = "word") => Array.from({ length: n }, () => word).join(" ");

describe("explanationChunks", () => {
  it("starts a new piece once the current one is long enough", () => {
    expect(explanationChunks(`${para(50)}\n\n${para(50)}`)).toHaveLength(2);
    expect(explanationChunks(`${para(10)}\n\n${para(50)}`)).toHaveLength(1);
  });

  it("keeps a list, a table and a code fence with the paragraph above", () => {
    expect(explanationChunks(`${para(50)}\n\n- one\n- two`)).toHaveLength(1);
    expect(explanationChunks(`${para(50)}\n\n| a | b |\n| - | - |`)).toHaveLength(1);
    const fenced = `${para(50)}\n\n\`\`\`\nline\n\nline\n\`\`\`\n\n${para(50)}`;
    const chunks = explanationChunks(fenced);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toContain("line\n\nline");
  });

  it("joins a short tail to the piece before it", () => {
    expect(explanationChunks(`${para(50)}\n\n${para(5)}`)).toHaveLength(1);
  });
});

describe("conceptBeats", () => {
  const concepts: Concept[] = LESSONS.filter(isLive).flatMap((l) => l.content.groups.flatMap((g) => g.concepts));

  it("loses none of any concept's explanation", () => {
    for (const c of concepts) {
      const text = conceptBeats(c)
        .flatMap((b) => (b.kind === "idea" || b.kind === "explain" ? [b.markdown] : []))
        .join("\n\n");
      expect(text.replace(/\s+/g, " "), c.id).toBe(c.explanation.trim().replace(/\s+/g, " "));
    }
  });

  it("opens with the idea, ends with the pitfall and the wrap-up, and asks the quiz when there is one", () => {
    for (const c of concepts) {
      const kinds = conceptBeats(c).map((b) => b.kind);
      expect(kinds[0]).toBe("idea");
      expect(kinds.slice(-2)).toEqual(["pitfall", "wrap"]);
      expect(kinds.includes("quiz")).toBe(Boolean(c.quiz));
      expect(kinds.includes("example")).toBe(Boolean(c.example));
      expect(kinds.length, c.id).toBeLessThanOrEqual(10);
    }
  });
});
