import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { friendLink, friendLinkPath, senderFrom } from "../referral";
import { certificateImagePath, certificateStyle, cleanGiftName, giftFromSession, giftRedeemPath, GIFT_COURSE } from "../gift-course";
import { giftCode, verifyGiftCode } from "../gift-code";
import { PLANS } from "../plans";
import { keyboardTemplateById } from "../keyboard-card";

describe("send a friend their name", () => {
  it("links to the friend's name, signed with the sender, tagged as a referral", () => {
    const path = friendLinkPath("Zoe", "Harry")!;
    expect(path.startsWith("/translate-name-to-hieroglyphics/Zoe?")).toBe(true);
    const q = new URLSearchParams(path.split("?")[1]);
    expect(q.get("from")).toBe("Harry");
    expect(q.get("utm_source")).toBe("friend");
    expect(friendLink("Zoe", "Harry", "https://example.com")).toBe(`https://example.com${path}`);
  });

  it("refuses names that are not names, and leaves out a bad sender", () => {
    expect(friendLinkPath("")).toBeNull();
    expect(friendLinkPath("<script>")).toBeNull();
    expect(new URLSearchParams(friendLinkPath("Zoe", "<b>")!.split("?")[1]).get("from")).toBeNull();
  });

  it("reads the sender back, cleaned", () => {
    expect(senderFrom("?from=Harry&utm_source=friend")).toBe("Harry");
    expect(senderFrom("?from=%3Cb%3E")).toBeNull();
    expect(senderFrom("")).toBeNull();
  });
});

describe("gift codes", () => {
  const prev = process.env.NEXTAUTH_SECRET;
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret";
  });
  afterEach(() => {
    process.env.NEXTAUTH_SECRET = prev;
  });

  it("round-trips a session id and rejects anything tampered with", () => {
    const code = giftCode("cs_test_abc123");
    expect(verifyGiftCode(code)).toBe("cs_test_abc123");
    expect(verifyGiftCode(code.replace("abc", "abd"))).toBeNull();
    expect(verifyGiftCode(`${code}x`)).toBeNull();
    expect(verifyGiftCode("cs_test_abc123")).toBeNull();
    expect(verifyGiftCode(null)).toBeNull();
    expect(giftRedeemPath(code)).toBe(`/gift/redeem?code=${encodeURIComponent(code)}`);
  });
});

describe("gift sessions", () => {
  it("costs the same as Lifetime", () => {
    expect(GIFT_COURSE.usd).toBe(PLANS.lifetime.usd);
    expect(GIFT_COURSE.gbp).toBe(PLANS.lifetime.gbp);
  });

  it("reads the names from a gift session and ignores other sessions", () => {
    expect(giftFromSession({ metadata: { product: "gift-course", recipient: "Anna", from: "Tom" } })).toEqual({ recipient: "Anna", from: "Tom" });
    expect(giftFromSession({ metadata: { plan: "lifetime" } })).toBeNull();
    expect(giftFromSession({ metadata: null })).toBeNull();
  });

  it("cleans names for the certificate", () => {
    expect(cleanGiftName("  Anne-Marie  O'Neil ")).toBe("Anne-Marie O'Neil");
    expect(cleanGiftName("<b>Tom</b>")).toBe("bTomb");
    expect(cleanGiftName(42)).toBe("");
  });

  it("puts the certificate on Christmas in the season, the pyramids otherwise", () => {
    expect(certificateStyle(new Date(2026, 11, 1))).toBe("christmas");
    expect(certificateStyle(new Date(2026, 6, 1))).toBe("pyramids");
    const path = certificateImagePath("Anna", new Date(2026, 6, 1));
    expect(path).toContain("s=pyramids");
    expect(path).toContain("g=gift");
  });
});

describe("pet cards", () => {
  it("end the name with the seated cat or the dog", () => {
    expect(keyboardTemplateById("cat").det).toBe("𓃠");
    expect(keyboardTemplateById("dog").det).toBe("𓃡");
  });
});
