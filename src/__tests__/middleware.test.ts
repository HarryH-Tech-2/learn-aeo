import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const req = (path: string) => new NextRequest(`https://www.learnaeo.com${path}`);
const isRedirect = (path: string) => [307, 308].includes(middleware(req(path)).status);

describe("middleware", () => {
  it("lets signed-out visitors and crawlers open a live paid lesson's preview page", () => {
    expect(isRedirect("/lessons/make-your-site-reachable-by-ai")).toBe(false);
    expect(isRedirect("/lessons/when-ai-gets-your-brand-wrong")).toBe(false);
  });

  it("still sends signed-out visitors from other gated pages to get-started", () => {
    const res = middleware(req("/dashboard"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/get-started");
  });

  it("lets social crawlers fetch every lesson's share image", () => {
    expect(isRedirect("/lessons/make-your-site-reachable-by-ai/opengraph-image")).toBe(false);
    expect(isRedirect("/lessons/how-answer-engines-choose-sources/opengraph-image")).toBe(false);
  });

  it("does not open anything else under a paid lesson", () => {
    expect(isRedirect("/lessons/make-your-site-reachable-by-ai/opengraph-image-x")).toBe(true);
  });
});

describe("unknown lesson addresses (SEO audit 2026-10-30)", () => {
  it("lets an id that isn't in the catalog through, so the page returns a real 404", () => {
    expect(isRedirect("/lessons/1")).toBe(false);
    expect(isRedirect("/lessons/not-a-lesson")).toBe(false);
  });

  it("opens every live paid lesson at its exact address only", () => {
    expect(isRedirect("/lessons/running-an-aeo-program")).toBe(false);
    expect(isRedirect("/lessons/running-an-aeo-program/anything")).toBe(true);
  });
});
