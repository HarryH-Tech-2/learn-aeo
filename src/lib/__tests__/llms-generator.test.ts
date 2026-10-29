import { describe, it, expect } from "vitest";
import { emptyLlmsForm, generateLlmsTxt, validateLlmsForm, type LlmsForm } from "@/lib/llms-generator";

const form: LlmsForm = {
  name: "Fernhill Garden Supply",
  summary: "Garden tools and compost bins, delivered across the US.",
  details: "Prices are in USD. Orders ship within 2 business days.",
  sections: [
    {
      title: "Products",
      links: [
        { title: "Compost bins", url: "https://www.fernhill.example/compost-bins", notes: "Sizes and prices" },
        { title: "Rain butts", url: "https://www.fernhill.example/rain-butts", notes: "" },
      ],
    },
    { title: "Empty", links: [{ title: "", url: "", notes: "" }] },
  ],
  optional: [{ title: "About us", url: "https://www.fernhill.example/about", notes: "Company history" }],
};

describe("generateLlmsTxt", () => {
  it("writes the llmstxt.org shape: H1, blockquote, details, H2 file lists, Optional last", () => {
    expect(generateLlmsTxt(form)).toBe(
      [
        "# Fernhill Garden Supply",
        "",
        "> Garden tools and compost bins, delivered across the US.",
        "",
        "Prices are in USD. Orders ship within 2 business days.",
        "",
        "## Products",
        "",
        "- [Compost bins](https://www.fernhill.example/compost-bins): Sizes and prices",
        "- [Rain butts](https://www.fernhill.example/rain-butts)",
        "",
        "## Optional",
        "",
        "- [About us](https://www.fernhill.example/about): Company history",
        "",
      ].join("\n")
    );
  });

  it("drops empty sections and empty optional lists", () => {
    const out = generateLlmsTxt({ ...form, sections: [{ title: "Empty", links: [] }], optional: [], details: "" });
    expect(out).toBe("# Fernhill Garden Supply\n\n> Garden tools and compost bins, delivered across the US.\n");
  });

  it("percent-encodes spaces and parentheses in link URLs so the markdown link stays whole", () => {
    const out = generateLlmsTxt({ ...form, sections: [{ title: "Docs", links: [{ title: "A", url: "https://ex.com/a b)c(d", notes: "n" }] }], optional: [] });
    expect(out).toContain("- [A](https://ex.com/a%20b%29c%28d): n");
  });

  it("keeps the details field from adding headings or sections", () => {
    const out = generateLlmsTxt({ ...form, details: "Intro\n## Fake\n# Also fake\n  ### Indented", sections: [], optional: [] });
    expect(out.match(/^#{1,6} /gm)).toEqual(["# "]);
    expect(out).toContain("\\## Fake");
  });

  it("keeps single-line fields on one line and escapes brackets in link titles", () => {
    const out = generateLlmsTxt({
      ...form,
      name: "Fern\nhill",
      summary: "Line one\nline two",
      sections: [{ title: "Docs\nPage", links: [{ title: "API [beta]", url: "https://x.example/api", notes: "a\nb" }] }],
      optional: [],
    });
    expect(out).toContain("# Fern hill\n");
    expect(out).toContain("> Line one line two\n");
    expect(out).toContain("## Docs Page\n");
    expect(out).toContain("- [API \\[beta\\]](https://x.example/api): a b");
  });

  it("starts from a form that validates once a name and summary are filled", () => {
    expect(validateLlmsForm({ ...emptyLlmsForm(), name: "A", summary: "B" })).toEqual([]);
  });
});

describe("validateLlmsForm", () => {
  it("needs a name and a summary", () => {
    const errs = validateLlmsForm({ ...form, name: " ", summary: "" }).map((e) => e.field);
    expect(errs).toEqual(expect.arrayContaining(["name", "summary"]));
  });

  it("needs a title and an absolute http(s) URL for each link that is filled in", () => {
    const bad = (url: string) =>
      validateLlmsForm({ ...form, sections: [{ title: "S", links: [{ title: "T", url, notes: "" }] }] }).map((e) => e.field);
    expect(bad("javascript:alert(1)")).toContain("sections.0.links.0.url");
    expect(bad("/relative")).toContain("sections.0.links.0.url");
    expect(bad("ftp://x.example/a")).toContain("sections.0.links.0.url");
    expect(bad("https://x.example/a")).toEqual([]);
    expect(validateLlmsForm({ ...form, sections: [{ title: "S", links: [{ title: "", url: "https://x.example", notes: "" }] }] }).map((e) => e.field)).toContain("sections.0.links.0.title");
  });

  it("needs a title on a section that has links", () => {
    expect(validateLlmsForm({ ...form, sections: [{ title: "", links: [{ title: "T", url: "https://x.example", notes: "" }] }] }).map((e) => e.field)).toContain("sections.0.title");
  });
});
