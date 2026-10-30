import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import { isValidElement } from "react";

/**
 * Small, dependency-free text helpers shared by the blog index, the post page
 * (JSON-LD), the post renderer (heading ids / table of contents) and /llms.txt.
 *
 * Nothing here touches `src/lib/blog-posts.ts`; it only derives plain text
 * from the markdown that file already exports.
 */

const SITE_ORIGIN = SITE.url;

/** Strip inline markdown only (links, emphasis, code). Keeps list numbers, so it suits heading text. */
export function stripInlineMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Strip inline and block markdown so the result is safe for JSON-LD `text`, `abstract`, llms.txt etc. */
export function stripMarkdown(md: string): string {
  return stripInlineMarkdown(md)
    .replace(/^#{1,6}\s+/gm, "") // heading marks
    .replace(/^\s*[-*+]\s+/gm, "") // list bullets
    .replace(/^\s*\d+\.\s+/gm, "") // ordered list marks
    .replace(/^\s*>\s?/gm, "") // blockquotes
    .replace(/^\s*---+\s*$/gm, "") // rules
    .replace(/\|/g, " ") // table pipes
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Deterministic, ASCII-only anchor id for a heading. Punctuation is dropped. */
export function slugifyHeading(text: string): string {
  return stripInlineMarkdown(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type Heading = { id: string; text: string };

/** Every `## ` heading in a markdown body, in document order, with the id the renderer will give it. */
export function extractH2s(md: string): Heading[] {
  const out: Heading[] = [];
  const seen = new Map<string, number>();
  for (const line of md.split("\n")) {
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = stripInlineMarkdown(m[1]);
    let id = slugifyHeading(text) || "section";
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n + 1}`;
    out.push({ id, text });
  }
  return out;
}

/** Word count of the readable prose (markdown syntax removed). */
export function countWords(md: string): number {
  const text = stripMarkdown(md);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** Reading time in whole minutes at ~220 wpm, minimum 1. */
export function readingMinutes(md: string): number {
  return Math.max(1, Math.round(countWords(md) / 220));
}

/** Plain text of a React children tree (used to give rendered headings the same id as `extractH2s`). */
export function textFromChildren(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (isValidElement<{ children?: ReactNode }>(children)) {
    return textFromChildren(children.props.children);
  }
  return "";
}

/** True for links that stay on this site (relative paths, hash anchors or absolute URLs on our origin). */
export function isInternalHref(href: string | undefined): boolean {
  if (!href) return false;
  if (href.startsWith("/") || href.startsWith("#")) return true;
  return href.startsWith(SITE_ORIGIN);
}

/** Turn an absolute on-site URL into a path so next/link can handle it. */
export function toInternalPath(href: string): string {
  return href.startsWith(SITE_ORIGIN) ? href.slice(SITE_ORIGIN.length) || "/" : href;
}

/**
 * Every post links, in its body, to the page that turns a reader into a
 * learner: the free first lesson. It was "discovered, not indexed" in Search
 * Console while the posts that should link to it were indexed, so the link
 * has to sit in the prose, not the footer. It goes in after the first section (before the second `## `);
 * a post with a single section gets it at the end.
 */
export const IN_BODY_LINKS_MD =
  `**Try it as you read:** [take the free first lesson](${FIRST_LESSON_PATH}) and see how ChatGPT and other AI search tools choose their sources.`;

export function withInBodyLinks(md: string, links = IN_BODY_LINKS_MD): string {
  if (md.includes(links)) return md;
  const lines = md.split("\n");
  let h2s = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      h2s++;
      if (h2s === 2) {
        // Keep a blank line either side so markdown sees a paragraph.
        const before = lines.slice(0, i).join("\n").replace(/\s+$/, "");
        const after = lines.slice(i).join("\n");
        return `${before}\n\n${links}\n\n${after}`;
      }
    }
  }
  return `${md.replace(/\s+$/, "")}\n\n${links}`;
}
