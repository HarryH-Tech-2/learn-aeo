// The home title names what the site is, an AEO course, within 60 characters (SEO audit 2026-10-30).
import { describe, it, expect } from "vitest";
import { metadata } from "@/app/page";

describe("home title", () => {
  it("says it is an answer engine optimization course and fits in 60 characters", () => {
    const title = (metadata.title as { absolute: string }).absolute;
    expect(title).toMatch(/answer engine optimization course/i);
    expect(title.startsWith("Learn AEO")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(60);
  });
});
