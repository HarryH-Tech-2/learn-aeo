import { describe, it, expect } from "vitest";
import {
  PROMPT_SUPPRESS_MS,
  PROMPT_MIN_TIME_ON_PAGE_MS,
  BLOG_SCROLL_THRESHOLD,
  parsePromptRecord,
  serializePromptRecord,
  shouldShowAuthPrompt,
  promptBlockReason,
  isTemporaryBlock,
  readingProgress,
} from "@/lib/auth-prompt";

const NOW = 1_800_000_000_000;

function base() {
  return {
    signedIn: false,
    record: null,
    now: NOW,
    pageLoadedAt: NOW - PROMPT_MIN_TIME_ON_PAGE_MS - 1,
    inputFocused: false,
    authModalUsed: false,
  };
}

describe("shouldShowAuthPrompt", () => {
  it("shows for an anonymous visitor who has been on the page long enough", () => {
    expect(shouldShowAuthPrompt(base())).toBe(true);
  });

  it("never shows to a signed-in user", () => {
    expect(shouldShowAuthPrompt({ ...base(), signedIn: true })).toBe(false);
  });

  it("waits out the minimum time on page", () => {
    expect(shouldShowAuthPrompt({ ...base(), pageLoadedAt: NOW - 2_000 })).toBe(false);
  });

  it("does not interrupt someone typing", () => {
    expect(shouldShowAuthPrompt({ ...base(), inputFocused: true })).toBe(false);
  });

  it("stays quiet if the visitor already opened the auth modal themselves", () => {
    expect(shouldShowAuthPrompt({ ...base(), authModalUsed: true })).toBe(false);
  });

  it("shows once per visitor: a recent record suppresses it", () => {
    const record = { shownAt: NOW - 24 * 60 * 60 * 1000 };
    expect(shouldShowAuthPrompt({ ...base(), record })).toBe(false);
  });

  it("shows again after the suppression window has passed", () => {
    const record = { shownAt: NOW - PROMPT_SUPPRESS_MS - 1 };
    expect(shouldShowAuthPrompt({ ...base(), record })).toBe(true);
  });

  it("treats a record from the future (clock skew) as recent", () => {
    const record = { shownAt: NOW + 60_000 };
    expect(shouldShowAuthPrompt({ ...base(), record })).toBe(false);
  });
});

describe("promptBlockReason", () => {
  it("names the rule that blocked the card", () => {
    expect(promptBlockReason(base())).toBe("none");
    expect(promptBlockReason({ ...base(), signedIn: true })).toBe("signed_in");
    expect(promptBlockReason({ ...base(), authModalUsed: true })).toBe("modal_used");
    expect(promptBlockReason({ ...base(), record: { shownAt: NOW - 1000 } })).toBe("recently_shown");
    expect(promptBlockReason({ ...base(), inputFocused: true })).toBe("typing");
    expect(promptBlockReason({ ...base(), pageLoadedAt: NOW - 2_000 })).toBe("too_soon");
  });

  it("a 30-day suppression outranks a temporary block", () => {
    const r = promptBlockReason({ ...base(), record: { shownAt: NOW - 1000 }, pageLoadedAt: NOW - 2_000 });
    expect(r).toBe("recently_shown");
  });

  it("only typing and too_soon are worth retrying", () => {
    expect(isTemporaryBlock("typing")).toBe(true);
    expect(isTemporaryBlock("too_soon")).toBe(true);
    expect(isTemporaryBlock("signed_in")).toBe(false);
    expect(isTemporaryBlock("modal_used")).toBe(false);
    expect(isTemporaryBlock("recently_shown")).toBe(false);
    expect(isTemporaryBlock("none")).toBe(false);
  });
});

describe("prompt record storage", () => {
  it("round-trips through JSON", () => {
    const raw = serializePromptRecord({ shownAt: NOW });
    expect(parsePromptRecord(raw)).toEqual({ shownAt: NOW });
  });

  it("returns null for missing or corrupt values", () => {
    expect(parsePromptRecord(null)).toBeNull();
    expect(parsePromptRecord("")).toBeNull();
    expect(parsePromptRecord("not json")).toBeNull();
    expect(parsePromptRecord(JSON.stringify({ shownAt: "yesterday" }))).toBeNull();
    expect(parsePromptRecord(JSON.stringify({}))).toBeNull();
  });
});

describe("readingProgress", () => {
  // Article starts 500px down the document and is 2000px tall; viewport 800px.
  const article = { top: 500, height: 2000 };

  it("is 0 before the article is reached", () => {
    expect(readingProgress(article, 0, 400)).toBe(0);
  });

  it("measures how far the bottom of the viewport is through the article", () => {
    // scrollY 1000 + viewport 800 = 1800 -> 1300px into a 2000px article
    expect(readingProgress(article, 1000, 800)).toBeCloseTo(0.65);
  });

  it("caps at 1 once the article is fully scrolled past", () => {
    expect(readingProgress(article, 5000, 800)).toBe(1);
  });

  it("is 0 for an article with no height (not laid out yet)", () => {
    expect(readingProgress({ top: 500, height: 0 }, 1000, 800)).toBe(0);
  });

  it("threshold is between a skim and the end of the piece", () => {
    expect(BLOG_SCROLL_THRESHOLD).toBeGreaterThan(0.5);
    expect(BLOG_SCROLL_THRESHOLD).toBeLessThan(0.9);
  });
});
