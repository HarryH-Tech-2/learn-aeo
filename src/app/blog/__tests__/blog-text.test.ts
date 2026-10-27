import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { describe, it, expect } from "vitest";
import { withInBodyLinks, IN_BODY_LINKS_MD, extractH2s } from "@/app/blog/blog-text";

describe("withInBodyLinks", () => {
  it("inserts the links paragraph after the first section", () => {
    const md = "## One\n\nIntro para.\n\n## Two\n\nMore.";
    const out = withInBodyLinks(md);
    const i = out.indexOf(IN_BODY_LINKS_MD);
    expect(i).toBeGreaterThan(out.indexOf("Intro para."));
    expect(i).toBeLessThan(out.indexOf("## Two"));
    // paragraph boundaries either side
    expect(out).toContain(`Intro para.\n\n${IN_BODY_LINKS_MD}\n\n## Two`);
  });

  it("appends when there is only one section, and never doubles up", () => {
    const md = "## Only\n\nText.";
    const once = withInBodyLinks(md);
    expect(once.endsWith(IN_BODY_LINKS_MD)).toBe(true);
    expect(withInBodyLinks(once)).toBe(once);
  });

  it("does not change the headings, so the table of contents is unaffected", () => {
    const md = ["## One", "", "Intro.", "", "## Two", "", "More."].join("\n");
    expect(extractH2s(withInBodyLinks(md))).toEqual(extractH2s(md));
  });

  it("the in-body paragraph links to the free first lesson and is free of removed-tool wording", () => {
    expect(IN_BODY_LINKS_MD).toContain(`](${FIRST_LESSON_PATH})`);
    expect(IN_BODY_LINKS_MD).not.toMatch(/alphabet|translate/i);
  });
});
