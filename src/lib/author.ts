// The course's author, named in the JSON-LD (src/lib/schema.ts) and on the page (blog bylines, the free
// lesson, /about#author). Facts here come from the author's public LinkedIn profile (checked 2026-10-30);
// add nothing that isn't on it.

import { absoluteUrl } from "./site";

export const AUTHOR = {
  name: "Harry Harrison",
  /** The on-site author section that bylines link to. */
  path: "/about#author",
  pageUrl: absoluteUrl("/about#author"),
  linkedIn: "https://www.linkedin.com/in/harry-harrison/",
  jobTitle: "B2B content strategist and copywriter",
  bio: "Harry Harrison writes Learn AEO: the lessons, the blog and the glossary. Harry is a B2B content strategist and copywriter for fintech, SaaS and AI companies.",
} as const;
