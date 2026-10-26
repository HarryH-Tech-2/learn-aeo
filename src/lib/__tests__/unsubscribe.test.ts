import { describe, it, expect } from "vitest";
import { unsubscribeToken, verifyUnsubscribeToken, unsubscribeUrl } from "@/lib/unsubscribe";

describe("unsubscribe tokens", () => {
  it("round-trips for the same user and secret", () => {
    const t = unsubscribeToken("user_1", "s3cret");
    expect(verifyUnsubscribeToken("user_1", t, "s3cret")).toBe(true);
  });
  it("rejects another user, a tampered token, or another secret", () => {
    const t = unsubscribeToken("user_1", "s3cret");
    expect(verifyUnsubscribeToken("user_2", t, "s3cret")).toBe(false);
    expect(verifyUnsubscribeToken("user_1", t.slice(0, -1) + "x", "s3cret")).toBe(false);
    expect(verifyUnsubscribeToken("user_1", t, "other")).toBe(false);
    expect(verifyUnsubscribeToken("user_1", "", "s3cret")).toBe(false);
  });
  it("builds a link on the site with both parts", () => {
    const url = unsubscribeUrl("user_1", "https://www.learnaeo.com", "s3cret");
    expect(url.startsWith("https://www.learnaeo.com/api/email/unsubscribe?u=user_1&t=")).toBe(true);
  });
});
