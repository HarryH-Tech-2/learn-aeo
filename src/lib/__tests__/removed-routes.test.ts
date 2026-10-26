import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const REMOVED = ["/teachers", "/translate-name", "/games/", "/hieroglyph", "/cartouche", "/daily", "/dig", "/gift", "/es/", "/fr/", "/play/", "cuneiform", "keyboard"];

describe("removed sibling features", () => {
  it("sitemap lists none of them", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    for (const bad of REMOVED) expect(urls.filter((u) => u.includes(bad))).toEqual([]);
  });
  it("robots disallow list mentions none of them", () => {
    const text = JSON.stringify(robots());
    for (const bad of ["/teachers", "/cartouche", "/play/", "keyboard"]) expect(text).not.toContain(bad);
  });
});
