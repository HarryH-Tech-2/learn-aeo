import { describe, it, expect } from "vitest";
import { SITE, absoluteUrl, COOKIE_PREFIX } from "@/lib/site";

describe("site config", () => {
  it("defaults to the production domain", () => {
    expect(SITE.url).toBe("https://www.learnaeo.com");
    expect(SITE.name).toBe("Learn AEO");
  });
  it("builds absolute urls without double slashes", () => {
    expect(absoluteUrl("/pricing")).toBe("https://www.learnaeo.com/pricing");
    expect(absoluteUrl("pricing")).toBe("https://www.learnaeo.com/pricing");
    expect(absoluteUrl("/")).toBe("https://www.learnaeo.com");
  });
  it("uses its own cookie prefix", () => {
    expect(COOKIE_PREFIX).toBe("aeo_");
  });
});
