import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { describe, it, expect } from "vitest";
import { withInBodyLinks, IN_BODY_LINKS_MD, extractH2s } from "@/app/blog/blog-text";
import { blogPosts } from "@/lib/blog-posts";

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
    for (const p of blogPosts) {
      expect(extractH2s(withInBodyLinks(p.content))).toEqual(extractH2s(p.content));
    }
  });

  it("every published post ends up linking to the free lesson in its body, and the added link names no removed tool", () => {
    expect(IN_BODY_LINKS_MD).not.toContain("/translate-name-to-hieroglyphics");
    for (const p of blogPosts) {
      const out = withInBodyLinks(p.content);
      expect(out, p.slug).toContain(`](${FIRST_LESSON_PATH})`);
    }
  });
});
