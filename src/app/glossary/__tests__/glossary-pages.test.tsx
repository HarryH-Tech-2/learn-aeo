import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  usePathname: () => "/glossary",
}));
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));

import GlossaryPage from "@/app/glossary/page";
import TermPage, { generateStaticParams } from "@/app/glossary/[term]/page";
import { GLOSSARY, getTerm } from "@/lib/glossary";

const ldTypes = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) =>
    (JSON.parse(m[1])["@graph"] as { "@type": string }[]).map((x) => x["@type"]),
  );

describe("/glossary", () => {
  it("lists every term A-Z with its definition and a DefinedTermSet", () => {
    const html = renderToStaticMarkup(GlossaryPage());
    for (const t of GLOSSARY) expect(html).toContain(`href="/glossary/${t.slug}"`);
    expect(ldTypes(html)).toEqual(["DefinedTermSet", "BreadcrumbList"]);
    expect(html).toMatch(/<h1[^>]*>/);
  });
});

describe("/glossary/[term]", () => {
  it("pre-renders every term and 404s an unknown one", async () => {
    expect(await generateStaticParams()).toEqual(GLOSSARY.map((t) => ({ term: t.slug })));
    await expect(TermPage({ params: Promise.resolve({ term: "nope" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the definition first, the example, related terms, lesson link and sources", async () => {
    const t = getTerm("gptbot")!;
    const html = renderToStaticMarkup((await TermPage({ params: Promise.resolve({ term: t.slug }) })) as ReactElement);
    expect(html).toMatch(/<h1[^>]*>GPTBot<\/h1>/);
    expect(html).toContain("OpenAI&#x27;s web crawler for model training");
    expect(html).toContain("User-agent: GPTBot");
    for (const r of t.related) expect(html).toContain(`href="/glossary/${r}"`);
    expect(html).toContain(`href="/lessons/${t.lesson}"`);
    for (const s of t.sources) expect(html).toContain(s.url);
    expect(ldTypes(html)).toEqual(["DefinedTerm", "BreadcrumbList"]);
  });
});
