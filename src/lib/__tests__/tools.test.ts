import { describe, it, expect } from "vitest";
import { TOOLS, toolPath } from "@/lib/tools";

describe("TOOLS catalog", () => {
  it("lists the four spec tools in order, with clean unique slugs", () => {
    expect(TOOLS.map((t) => t.slug)).toEqual([
      "ai-crawler-checker",
      "llms-txt-generator",
      "schema-generator",
      "citability-checker",
    ]);
    for (const t of TOOLS) expect(t.slug).toMatch(/^[a-z0-9-]+$/);
    expect(new Set(TOOLS.map((t) => t.slug)).size).toBe(TOOLS.length);
  });

  it("marks the server-side fetchers and the client-side builders", () => {
    expect(TOOLS.map((t) => t.kind)).toEqual(["server", "client", "client", "server"]);
  });

  it("has a one-sentence summary for each tool", () => {
    for (const t of TOOLS) {
      expect(t.name.length).toBeGreaterThan(3);
      expect(t.summary).toMatch(/^[A-Z].*\.$/);
    }
  });

  it("builds tool paths", () => {
    expect(toolPath("ai-crawler-checker")).toBe("/tools/ai-crawler-checker");
  });
});
