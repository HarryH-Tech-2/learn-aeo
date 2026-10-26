import { describe, expect, it } from "vitest";
import { campaignFromSearch, decodeCampaign, encodeCampaign, validVisitorId } from "../campaign";

describe("campaignFromSearch", () => {
  it("reads the three tags, lower-cased", () => {
    expect(campaignFromSearch("?utm_source=Reddit&utm_medium=social&utm_campaign=iib")).toEqual({
      source: "reddit",
      medium: "social",
      campaign: "iib",
    });
  });

  it("needs a source", () => {
    expect(campaignFromSearch("?utm_campaign=iib")).toBeNull();
    expect(campaignFromSearch("")).toBeNull();
  });

  it("drops values that are not tags", () => {
    expect(campaignFromSearch("?utm_source=<script>")).toBeNull();
    expect(campaignFromSearch("?utm_source=x&utm_campaign=a%20b")).toEqual({ source: "x", medium: "", campaign: "" });
    expect(campaignFromSearch(`?utm_source=${"a".repeat(61)}`)).toBeNull();
  });
});

describe("cookie round trip", () => {
  it("encodes and decodes", () => {
    const c = { source: "x", medium: "social", campaign: "reply-name" };
    expect(decodeCampaign(encodeCampaign(c))).toEqual(c);
    expect(decodeCampaign(encodeURIComponent(encodeCampaign(c)))).toEqual(c);
  });

  it("rejects junk", () => {
    expect(decodeCampaign("")).toBeNull();
    expect(decodeCampaign(undefined)).toBeNull();
    expect(decodeCampaign("BAD VALUE|x|y")).toBeNull();
  });
});

describe("validVisitorId", () => {
  it("accepts our ids only", () => {
    expect(validVisitorId("abc123def456ghi789")).toBe("abc123def456ghi789");
    expect(validVisitorId("short")).toBeNull();
    expect(validVisitorId("has spaces in it here")).toBeNull();
    expect(validVisitorId(null)).toBeNull();
  });
});
