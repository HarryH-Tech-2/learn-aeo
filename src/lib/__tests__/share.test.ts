import { describe, it, expect } from "vitest";
import {
  normaliseShareName,
  cartoucheSharePath,
  cartoucheShareUrl,
  cartoucheImagePath,
  embedSnippet,
  MAX_SHARE_NAME_LENGTH,
} from "@/lib/share";

describe("normaliseShareName", () => {
  it("accepts ordinary names and tidies whitespace", () => {
    expect(normaliseShareName("Cleopatra")).toBe("Cleopatra");
    expect(normaliseShareName("  Mary   Ann ")).toBe("Mary Ann");
    expect(normaliseShareName("Mary%20Ann")).toBe("Mary Ann");
    expect(normaliseShareName("Mary+Ann")).toBe("Mary Ann");
  });

  it("keeps hyphens, apostrophes and non-Latin letters", () => {
    expect(normaliseShareName("Anne-Marie")).toBe("Anne-Marie");
    expect(normaliseShareName("O'Neill")).toBe("O'Neill");
    expect(normaliseShareName("Zo%C3%AB")).toBe("Zoë");
    expect(normaliseShareName("Владимир")).toBe("Владимир");
  });

  it("rejects empty, over-long, digits, punctuation and markup", () => {
    expect(normaliseShareName("")).toBeNull();
    expect(normaliseShareName(null)).toBeNull();
    expect(normaliseShareName(undefined)).toBeNull();
    expect(normaliseShareName("a".repeat(MAX_SHARE_NAME_LENGTH + 1))).toBeNull();
    expect(normaliseShareName("R2D2")).toBeNull();
    expect(normaliseShareName("<script>")).toBeNull();
    expect(normaliseShareName("bob.html")).toBeNull();
    expect(normaliseShareName("-Bob")).toBeNull();
    expect(normaliseShareName("%E0%A4%A")).toBeNull(); // malformed encoding
  });
});

describe("share URLs", () => {
  it("builds an encoded path under the translator", () => {
    expect(cartoucheSharePath("Mary Ann")).toBe("/translate-name-to-hieroglyphics/Mary%20Ann");
    expect(cartoucheShareUrl("Zoë")).toBe("https://www.learnhieroglyphics.com/translate-name-to-hieroglyphics/Zo%C3%AB");
  });

  it("round-trips through normaliseShareName", () => {
    const path = cartoucheSharePath("Anne-Marie O'Neill");
    const segment = path.split("/").pop()!;
    expect(normaliseShareName(segment)).toBe("Anne-Marie O'Neill");
  });

  it("points the preview image at the image route, outside /api (robots-safe)", () => {
    expect(cartoucheImagePath("Mary Ann")).toBe("/cartouche-image?name=Mary%20Ann");
    expect(cartoucheImagePath("x").startsWith("/api/")).toBe(false);
  });
});

describe("embedSnippet", () => {
  it("contains an iframe and a credit link outside it", () => {
    const html = embedSnippet();
    expect(html).toMatch(/<iframe[^>]+src="https:\/\/www\.learnhieroglyphics\.com\/embed\/cartouche"/);
    expect(html).toContain('href="https://www.learnhieroglyphics.com/translate-name-to-hieroglyphics"');
    expect(html.indexOf("</iframe>")).toBeLessThan(html.indexOf("<a "));
    expect(html).not.toContain("nofollow");
  });

  it("supports the light theme", () => {
    expect(embedSnippet("light")).toContain("/embed/cartouche?theme=light");
  });
});
