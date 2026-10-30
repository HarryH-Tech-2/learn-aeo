// Every page's head: public pages carry a canonical and og:url to themselves, a short title and
// a 70-160 character description; private pages are noindex (Review Focus 2).
import { describe, it, expect, vi } from "vitest";
import type { Metadata } from "next";

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
// A lesson forced to "coming soon", so the coming-soon branch stays tested once every real lesson is live.
vi.mock("@/lib/lesson-catalog", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/lesson-catalog")>();
  const LESSON_CATALOG = actual.LESSON_CATALOG.map((l) =>
    l.id === "running-an-aeo-program" ? { ...l, status: "coming-soon" as const } : l,
  );
  // the page reads lessonMeta, which closes over the real catalog, so it is swapped too
  return { ...actual, LESSON_CATALOG, lessonMeta: (id: string) => LESSON_CATALOG.find((l) => l.id === id) };
});

import { absoluteUrl } from "@/lib/site";
import { LESSON_CATALOG, lessonPath } from "@/lib/lesson-catalog";
import { GLOSSARY } from "@/lib/glossary";

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
  ["/glossary", "glossary", () => import("@/app/glossary/page")],
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
    expect(LESSON_CATALOG.some((l) => l.status === "coming-soon"), "no coming-soon lesson to test").toBe(true);
    for (const l of LESSON_CATALOG) {
      const m = await mod.generateMetadata!({ params: Promise.resolve({ id: l.id }) });
      expectPublic(m, lessonPath(l.id));
      if (l.status === "coming-soon") expect((m.robots as { index: boolean }).index).toBe(false);
    }
  }, IMPORT_TIMEOUT);

  it("each glossary term", async () => {
    const mod = (await import("@/app/glossary/[term]/page")) as unknown as PageModule;
    for (const t of GLOSSARY) expectPublic(await mod.generateMetadata!({ params: Promise.resolve({ term: t.slug }) }), `/glossary/${t.slug}`);
  }, IMPORT_TIMEOUT);
});

describe("404 and dynamic routes", () => {
  it("the 404 page is noindex with its own title and no inherited share image", async () => {
    const m = (await import("@/app/not-found")).metadata as Metadata;
    expect(m.title).toBe("Page not found");
    expect((m.robots as { index: boolean }).index).toBe(false);
    expect((m.openGraph as { images?: unknown } | null | undefined)?.images).toBeUndefined();
  }, IMPORT_TIMEOUT);

  it("blog posts and lesson share images render only known params", async () => {
    expect((await import("@/app/blog/[slug]/page")).dynamicParams).toBe(false);
    expect((await import("@/app/lessons/[id]/opengraph-image")).dynamicParams).toBe(false);
  }, IMPORT_TIMEOUT);

  it("an unknown blog post title is not branded twice", async () => {
    const m = await (await import("@/app/blog/[slug]/page")).generateMetadata({ params: Promise.resolve({ slug: "nope" }) });
    expect(String(m.title)).not.toContain("Learn AEO");
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
