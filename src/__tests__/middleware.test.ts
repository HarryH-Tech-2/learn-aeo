import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const req = (path: string) => new NextRequest(`https://www.learnaeo.com${path}`);
const isRedirect = (path: string) => [307, 308].includes(middleware(req(path)).status);

describe("middleware", () => {
  it("still sends signed-out visitors from a paid lesson to get-started", () => {
    const res = middleware(req("/lessons/make-your-site-reachable-by-ai"));
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
