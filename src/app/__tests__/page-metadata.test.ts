// Every page's head: public pages carry a canonical and og:url to themselves, a short title and
// a 70-160 character description; private pages are noindex (Review Focus 2).
import { describe, it, expect, vi } from "vitest";
import type { Metadata } from "next";

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { absoluteUrl } from "@/lib/site";
import { LESSON_CATALOG, lessonPath } from "@/lib/lesson-catalog";

type PageModule = { metadata?: Metadata; generateMetadata?: (a: { params: Promise<Record<string, string>> }) => Promise<Metadata> };

const PUBLIC: [string, string, () => Promise<PageModule>][] = [
  ["/", "home", () => import("@/app/page")],
  ["/about", "about", () => import("@/app/about/page")],
  ["/contact", "contact", () => import("@/app/contact/page")],
  ["/pricing", "pricing", () => import("@/app/pricing/page")],
  ["/get-started", "get-started", () => import("@/app/get-started/page")],
  ["/leaderboard", "leaderboard", () => import("@/app/leaderboard/page")],
  ["/privacy", "privacy", () => import("@/app/privacy/page")],
  ["/terms", "terms", () => import("@/app/terms/page")],
  ["/blog", "blog", () => import("@/app/blog/page")],
  ["/tools", "tools hub", () => import("@/app/tools/page")],
  ["/tools/ai-crawler-checker", "AI Crawler Checker", () => import("@/app/tools/ai-crawler-checker/page")],
  ["/tools/llms-txt-generator", "llms.txt Generator", () => import("@/app/tools/llms-txt-generator/page")],
];

const PRIVATE: [string, () => Promise<PageModule>][] = [
  ["dashboard", () => import("@/app/dashboard/page")],
  ["account", () => import("@/app/account/page")],
  ["certificate", () => import("@/app/certificate/page")],
  ["checkout", () => import("@/app/checkout/page")],
  ["login", () => import("@/app/login/page")],
  ["admin/marketing", () => import("@/app/admin/marketing/page")],
  ["verify", () => import("@/app/verify/[code]/page")],
];

// Importing a page pulls in its whole component tree; under a full parallel run that can take seconds.
const IMPORT_TIMEOUT = 30_000;

const titleOf = (m: Metadata) => (typeof m.title === "string" ? m.title : (m.title as { absolute: string }).absolute);

function expectPublic(m: Metadata, path: string, absoluteAllowed = false) {
  expect(m.alternates?.canonical).toBe(absoluteUrl(path));
  expect((m.openGraph as { url?: string } | undefined)?.url).toBe(absoluteUrl(path));
  const title = titleOf(m);
  expect(title.length).toBeLessThanOrEqual(absoluteAllowed ? 70 : 55);
  if (!absoluteAllowed) expect(title).not.toMatch(/Learn AEO$/);
  const d = String(m.description ?? "");
  expect(d.length, `${path} description length ${d.length}`).toBeGreaterThanOrEqual(70);
  expect(d.length, `${path} description length ${d.length}`).toBeLessThanOrEqual(160);
}

describe("public page metadata", () => {
  for (const [path, name, load] of PUBLIC) {
    it(name, async () => {
      const m = (await load()).metadata!;
      expect(m, `${name} exports metadata`).toBeDefined();
      expectPublic(m, path, path === "/");
    }, IMPORT_TIMEOUT);
  }

  it("each lesson", async () => {
    const mod = (await import("@/app/lessons/[id]/page")) as unknown as PageModule;
    for (const l of LESSON_CATALOG) {
      const m = await mod.generateMetadata!({ params: Promise.resolve({ id: l.id }) });
      expectPublic(m, lessonPath(l.id));
      if (l.status === "coming-soon") expect((m.robots as { index: boolean }).index).toBe(false);
    }
  }, IMPORT_TIMEOUT);
});

describe("private page metadata", () => {
  for (const [name, load] of PRIVATE) {
    it(`${name} is noindex`, async () => {
      const m = (await load()).metadata!;
      expect((m.robots as { index: boolean }).index).toBe(false);
    }, IMPORT_TIMEOUT);
  }
});
