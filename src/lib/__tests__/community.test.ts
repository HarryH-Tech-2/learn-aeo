import { describe, expect, it } from "vitest";
import { BODY_MAX, cleanText, cleanTitle, displayName, snippet, TITLE_MAX, whenPosted } from "../community";

describe("cleanText", () => {
  it("tidies whitespace and keeps paragraphs", () => {
    expect(cleanText("  Hello \r\n\r\n\r\n\r\nthere  ", BODY_MAX)).toBe("Hello\n\nthere");
  });
  it("rejects empty and non-strings", () => {
    expect(cleanText("   \n ", BODY_MAX)).toBeNull();
    expect(cleanText(42, BODY_MAX)).toBeNull();
    expect(cleanText(undefined, BODY_MAX)).toBeNull();
  });
  it("cuts at the limit", () => {
    expect(cleanText("x".repeat(BODY_MAX + 50), BODY_MAX)).toHaveLength(BODY_MAX);
  });
});

describe("cleanTitle", () => {
  it("is one line", () => {
    expect(cleanTitle("Which way\ndo I   read?")).toBe("Which way do I read?");
  });
  it("respects the title limit", () => {
    expect(cleanTitle("t".repeat(TITLE_MAX + 10))).toHaveLength(TITLE_MAX);
  });
});

describe("snippet", () => {
  it("returns short bodies whole", () => {
    expect(snippet("Short one.")).toBe("Short one.");
  });
  it("cuts at a word and adds an ellipsis", () => {
    const s = snippet("word ".repeat(60), 50);
    expect(s.endsWith("…")).toBe(true);
    expect(s.length).toBeLessThanOrEqual(51);
    expect(s).not.toMatch(/ …$/);
  });
  it("flattens line breaks", () => {
    expect(snippet("one\n\ntwo")).toBe("one two");
  });
});

describe("displayName", () => {
  it("prefers the name, then the front of the address, never the address", () => {
    expect(displayName({ name: "Priya M." })).toBe("Priya M.");
    expect(displayName({ name: "  ", email: "sam.k@example.com" })).toBe("Sam.k");
    expect(displayName({})).toBe("A learner");
  });
});

describe("whenPosted", () => {
  const now = new Date(2026, 8, 18, 15, 0);
  it("is relative for the last week", () => {
    expect(whenPosted(new Date(2026, 8, 18, 9).toISOString(), now)).toBe("Today");
    expect(whenPosted(new Date(2026, 8, 17, 23).toISOString(), now)).toBe("Yesterday");
    expect(whenPosted(new Date(2026, 8, 15).toISOString(), now)).toBe("3 days ago");
  });
  it("is a date after that, with the year only when it differs", () => {
    expect(whenPosted(new Date(2026, 7, 12).toISOString(), now)).toBe("12 Aug");
    expect(whenPosted(new Date(2025, 7, 12).toISOString(), now)).toBe("12 Aug 2025");
  });
});
