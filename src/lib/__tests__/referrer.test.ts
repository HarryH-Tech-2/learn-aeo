import { describe, expect, it } from "vitest";
import { cleanHeardAbout, decodeReferrer, describeSource, encodeReferrer, landingPath, referrerHost } from "../referrer";

const OWN = "www.learnaeo.com";

describe("referrerHost", () => {
  it("keeps only the referring host, without www", () => {
    expect(referrerHost("https://www.google.com/search?q=answer+engine+optimisation", OWN)).toBe("google.com");
    expect(referrerHost("https://chatgpt.com/c/abc123", OWN)).toBe("chatgpt.com");
    expect(referrerHost("https://old.reddit.com/r/seo/comments/x", OWN)).toBe("old.reddit.com");
  });

  it("calls no referrer direct", () => {
    expect(referrerHost("", OWN)).toBe("direct");
  });

  it("ignores our own site, with or without www", () => {
    expect(referrerHost("https://www.learnaeo.com/blog/x", OWN)).toBeNull();
    expect(referrerHost("https://learnaeo.com/", OWN)).toBeNull();
  });

  it("ignores mid-journey hosts and junk", () => {
    expect(referrerHost("https://checkout.stripe.com/c/pay/cs_live_x", OWN)).toBeNull();
    expect(referrerHost("https://mail.google.com/mail/u/0/", OWN)).toBeNull();
    expect(referrerHost("not a url", OWN)).toBeNull();
  });
});

describe("landingPath", () => {
  it("keeps plain paths and drops anything else", () => {
    expect(landingPath("/blog/how-to-get-cited-by-ai")).toBe("/blog/how-to-get-cited-by-ai");
    expect(landingPath("/name/<script>")).toBe("/");
    expect(landingPath("")).toBe("/");
  });
});

describe("encode/decodeReferrer", () => {
  it("round-trips", () => {
    const r = { host: "google.com", landing: "/answer-engine-checker" };
    expect(decodeReferrer(encodeURIComponent(encodeReferrer(r)))).toEqual(r);
  });

  it("rejects values we did not write", () => {
    expect(decodeReferrer(undefined)).toBeNull();
    expect(decodeReferrer("Evil Host|/")).toBeNull();
    expect(decodeReferrer("%E0%A4%A")).toBeNull();
    expect(decodeReferrer("google.com|/x?y=1")).toEqual({ host: "google.com", landing: "/" });
  });
});

describe("cleanHeardAbout", () => {
  it("accepts the options and skip", () => {
    expect(cleanHeardAbout("google", "")).toBe("google");
    expect(cleanHeardAbout("skipped", undefined)).toBe("skipped");
  });

  it("keeps their words only for other, trimmed and capped", () => {
    expect(cleanHeardAbout("other", "  a  podcast <b> ")).toBe("other: a podcast b");
    expect(cleanHeardAbout("other", "")).toBe("other");
    expect(cleanHeardAbout("google", "ignored")).toBe("google");
    expect(cleanHeardAbout("other", "x".repeat(200))).toBe(`other: ${"x".repeat(80)}`);
  });

  it("rejects anything else", () => {
    expect(cleanHeardAbout("hacker", "")).toBeNull();
    expect(cleanHeardAbout(3, "")).toBeNull();
  });
});

describe("describeSource", () => {
  it("joins what we know", () => {
    expect(describeSource({ signupReferrer: "google.com", signupLanding: "/", heardAbout: "ai" })).toBe("first came from google.com to /; told us: ai");
    expect(describeSource({ signupSource: "reddit", signupCampaign: "launch" })).toBe("marketing link reddit / launch");
  });

  it("says unknown when there is nothing", () => {
    expect(describeSource({ heardAbout: "skipped" })).toMatch(/^unknown/);
  });
});
