# Learn AEO — Plan 5: SEO / AEO Plumbing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec step 6. One schema helper for every JSON-LD block, one metadata helper for every page (canonical, Open Graph, Twitter), per-lesson OG images, and a sitemap and llms.txt built from the same catalogs, all checked against the built site.

**Architecture:** `src/lib/schema.ts` holds typed builders (Organization, WebSite, Course, LearningResource, BreadcrumbList, FAQPage, Blog/BlogPosting) that link entities by `@id`, plus a `<JsonLd>` component that escapes `<`. `src/lib/seo.ts` holds `pageMetadata()`, which every page's `metadata`/`generateMetadata` goes through; the root layout sets a `%s | Learn AEO` title template. Lessons get a generated OG image (`opengraph-image.tsx`, `next/og`). `src/lib/llms-txt.ts` and the existing `buildSitemap` take the lesson, tool and blog catalogs, so a new lesson, a live tool or a post shows up in both. A dev script fetches every sitemap URL from `next start` and checks the head.

**Tech Stack:** Next 15 app router (Metadata API, `next/og` `ImageResponse`), TypeScript, vitest (node, `renderToStaticMarkup`).

**Spec:** `docs/superpowers/specs/2026-10-26-learn-aeo-design.md` ("SEO / AEO groundwork", "Anti-goals", "Pages").

**Previous plans:** 1–3 (done) · 4 `docs/superpowers/plans/2026-10-28-learn-aeo-4-certificate-hero-us-spelling.md` (done, `1a9892f..14257d5`).

**Next plans:** 6 tools (AI Crawler Checker, llms.txt Generator), tools hub, glossary, blog posts · 7 deploy checklist.

**Scope note:** the SoftwareApplication (tools) and DefinedTermSet/DefinedTerm (glossary) builders are written in Plan 6 with the pages that use them (YAGNI); this plan leaves `schema.ts` ready for them.

## Global Constraints

- **No author:** no Person, `author` pointing at a person, byline or bio. BlogPosting `author` and `publisher` are the Organization (`@id` `${SITE.url}/#organization`).
- **No made-up claims** in any description, llms.txt line or schema text. No `aggregateRating`, `review`, learner counts.
- **US spelling** (`src/lib/__tests__/us-spelling.test.ts`); **no Egypt** (`no-egypt.test.ts`).
- Prices come from `src/lib/plans.ts` (`PLANS.lifetime` $100 / £80, `PLANS.monthly` $10 / £8); lesson facts from `LESSON_CATALOG`; tools from `TOOLS`; posts from `blogPosts`. Nothing typed twice.
- Canonical URLs are absolute, built with `absoluteUrl()` from `src/lib/site.ts`, no trailing slash, no query.
- Titles: the page part ≤ 55 characters (the template adds " | Learn AEO"); descriptions 70–160 characters.
- Private pages (`/dashboard`, `/account`, `/certificate`, `/checkout`, `/login`, `/admin/*`, `/verify/*`) are `noindex` and stay out of the sitemap; robots.txt keeps disallowing the first five plus `/api/`.
- Work on `main`; never push; one `next dev`/`next start` at a time; never `npm run build` while a server is up.
- Every task ends green: `npx tsc --noEmit`, `npm test`, and `npm run build` when pages change.

## Review Focus

1. **Script-breaking JSON-LD** — text containing `</script>` or `<!--` (a lesson title, an FAQ answer) must not end the script tag. `JsonLd` escapes `<` as `<`. Test in Task 1.
2. **Inherited Open Graph** — a child page without its own `openGraph` inherits the home page's `og:title`/`og:url`, so a shared /pricing link shows the home card. Every indexable page sets `og:url` = its canonical. Test in Task 2 (helper) and Task 5 (built-site check).
3. **Sitemap vs. noindex** — every sitemap URL returns 200, is indexable, and its canonical equals itself; no coming-soon lesson, paid lesson (redirects signed-out visitors), private page or empty blog. Test in Task 4 (pure) and Task 5 (live).
4. **Catalog drift** — flipping a lesson or tool to live, or adding a post, updates the sitemap, llms.txt and the schema without another edit. Test in Task 4.
5. **Duplicate or dangling entities** — the Organization is defined once (layout) and referenced by `@id` elsewhere; Course appears on home and pricing with the same `@id` and both offers. Test in Task 1 and Task 5.

---

### Task 1: Schema helper and migration of every JSON-LD block

**Files:**
- Create: `src/lib/schema.ts`, `src/components/JsonLd.tsx`, `src/lib/__tests__/schema.test.ts`
- Modify (replace inline `application/ld+json` with `<JsonLd data={...} />` and builders): `src/app/layout.tsx` (Organization + WebSite), `src/components/home/HomePage.tsx` (Course), `src/app/pricing/page.tsx` (Course), `src/app/lessons/[id]/page.tsx` (LearningResource), `src/components/FAQSection.tsx` and `src/components/PricingFAQ.tsx` (FAQPage), `src/app/contact/ContactContent.tsx`, `src/app/privacy/PrivacyContent.tsx`, `src/app/terms/TermsContent.tsx` (BreadcrumbList), `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx` (Blog, BlogPosting, BreadcrumbList, FAQPage; keep `speakable` if present)

**Interfaces (all in `src/lib/schema.ts`; each returns a plain object with `@context` only when top-level):**
- `ORG_ID = \`${SITE.url}/#organization\``, `WEBSITE_ID = \`${SITE.url}/#website\``, `COURSE_ID = \`${SITE.url}/#course\``.
- `organizationSchema()`: Organization, `@id ORG_ID`, name, url, logo `absoluteUrl("/icon-512.png")`, description `SITE.description`, `sameAs` only if non-empty.
- `websiteSchema()`: WebSite, `@id WEBSITE_ID`, name, url, `publisher: { "@id": ORG_ID }`, `inLanguage: "en-US"`.
- `courseSchema()`: Course, `@id COURSE_ID`, name "Learn AEO", description, `provider: { "@id": ORG_ID }`, `inLanguage`, `isAccessibleForFree: false`, `hasCourseInstance` (online, self-paced, `courseWorkload` `PT${TOTAL_MINUTES}M`), `offers` one Offer per `PLAN_IDS` (USD price string, `category: "Paid"`, url `/pricing`), `syllabusSections` one per live lesson (name = title, url).
- `learningResourceSchema(lesson: LessonMeta)`: as today, plus `isPartOf: { "@id": COURSE_ID }`, `provider: { "@id": ORG_ID }`.
- `breadcrumbSchema(items: { name: string; path: string }[])`: BreadcrumbList; positions from 1; `item` absolute.
- `faqSchema(faqs: { question: string; answer: string }[])`: FAQPage.
- `blogSchema(posts)`, `blogPostingSchema(post)`: as the blog pages build them today, with `author` and `publisher` `{ "@id": ORG_ID }`.
- `withContext<T>(o: T): T & { "@context": "https://schema.org" }`.
- `src/components/JsonLd.tsx`: `JsonLd({ data }: { data: object | object[] })` renders `<script type="application/ld+json">` with `JSON.stringify(data).replace(/</g, "\\u003c")`; an array becomes `{ "@context", "@graph": [...] }`.

- [ ] **Step 1: Failing tests** (`schema.test.ts`): `JsonLd` with a value `"</script><script>alert(1)</script>"` renders no second `<script` and the JSON parses back to the original string; `courseSchema().offers` prices equal `String(PLANS[id].usd)` for both plans; `syllabusSections` lists exactly the live lessons; `learningResourceSchema(lesson1).isPartOf["@id"] === COURSE_ID`; `breadcrumbSchema([{name:"Home",path:"/"},{name:"Pricing",path:"/pricing"}])` positions 1,2 and absolute items; `faqSchema` shape. A repo test: no file under `src/` except `src/components/JsonLd.tsx` contains `application/ld+json`, and none contains `"@type": "Person"` or `author: { "@type": "Person"`. Run → FAIL.
- [ ] **Step 2:** Implement `schema.ts` and `JsonLd.tsx`; migrate every file listed. The layout emits `[organizationSchema(), websiteSchema()]` as one `@graph`.
- [ ] **Step 3:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: one schema helper for all JSON-LD`.

---

### Task 2: Page metadata helper on every page

**Files:**
- Create: `src/lib/seo.ts`, `src/lib/__tests__/seo.test.ts`, `src/app/__tests__/page-metadata.test.ts`
- Modify: `src/app/layout.tsx` (title `{ default, template: "%s | Learn AEO" }`; default OG/Twitter stay as the site-wide fallback), every `src/app/**/page.tsx` that exports `metadata`/`generateMetadata`, plus `src/app/page.tsx` (home)

**Interfaces:**
- `pageMetadata(o: { title: string; description: string; path: string; noindex?: boolean; image?: string; type?: "website" | "article"; absoluteTitle?: boolean }): Metadata` → `title` (or `{ absolute }` when `absoluteTitle`), `description`, `alternates.canonical = absoluteUrl(path)`, `openGraph { title: full title, description, url: canonical, siteName, locale "en_US", type, images: [image ?? "/og-default.png" with width 1200, height 630, alt] }`, `twitter { card "summary_large_image", title, description, images }`, and `robots { index: false, follow: false }` when `noindex`.
- `privateMetadata(title: string): Metadata` → title + `robots { index: false, follow: false }`, no canonical.

- [ ] **Step 1: Failing tests.** `seo.test.ts`: canonical/`og:url` equal `absoluteUrl(path)`; `noindex` sets robots; the default image is `/og-default.png`; `absoluteTitle` bypasses the template. `page-metadata.test.ts` (reads each page module's exported `metadata` or calls `generateMetadata` with params from `generateStaticParams`; mock what imports need): every public page (home, about, contact, pricing, get-started, leaderboard, privacy, terms, blog, each live lesson) has a canonical equal to its own path, an `openGraph.url` equal to it, a page title ≤ 55 characters before the template, and a description 70–160 characters; every private page (dashboard, account, certificate, checkout, login, admin/marketing, verify) has `robots.index === false`; coming-soon lessons are noindex. Run → FAIL.
- [ ] **Step 2:** Implement and apply to every page. Rewrite titles to drop the "| Learn AEO" / "- Learn AEO" suffix (the template adds it); home uses `absoluteTitle` with `${SITE.name} | ${SITE.tagline}`. Fix any description outside 70–160 characters with plain, sourced-or-obvious wording.
- [ ] **Step 3:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: canonical, Open Graph and Twitter tags on every page`.

---

### Task 3: Per-lesson Open Graph images

**Files:**
- Create: `src/lib/og-image.tsx` (shared card), `src/app/lessons/[id]/opengraph-image.tsx`, `src/lib/__tests__/og-image.test.tsx`
- Modify: `src/app/lessons/[id]/page.tsx` (stop passing `/og-default.png` so the generated image is used)

**Interfaces:**
- `OG_SIZE = { width: 1200, height: 630 }`; `ogCard(o: { eyebrow: string; title: string; footer: string }): ReactElement` — navy `#04060d` card, cyan eyebrow, large title (≤ 3 lines, font size stepped down for long titles), gold footer, "Learn AEO" mark; flex layout only (satori).
- `lessons/[id]/opengraph-image.tsx`: `generateStaticParams` from `LESSON_CATALOG`, `size = OG_SIZE`, `contentType = "image/png"`, `alt` per lesson, default export returns `new ImageResponse(ogCard({ eyebrow: \`Lesson ${order} · ${district}\`, title, footer: isFree ? "Free lesson" : \`${minutes} minutes\` }), OG_SIZE)`. Uses the default `next/og` font (no network fetch at build).

- [ ] **Step 1: Failing test:** `renderToStaticMarkup(ogCard({...}))` contains the eyebrow, title and footer text; a 90-character title gets a smaller font size than a 30-character one. Run → FAIL.
- [ ] **Step 2:** Implement; build; open `.next` output or `next start` + `curl -o` one image into the scratchpad and view it (Read the PNG).
- [ ] **Step 3:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: Open Graph image per lesson`.

---

### Task 4: Sitemap, llms.txt, robots and IndexNow from the catalogs

**Files:**
- Create: `src/lib/llms-txt.ts`, `src/lib/__tests__/llms-txt.test.ts`, `src/lib/__tests__/robots.test.ts`, `src/lib/__tests__/indexnow.test.ts`
- Modify: `src/app/llms.txt/route.ts` (calls `buildLlmsTxt`), `src/app/sitemap.ts` (`buildSitemap({ posts, tools })` adds live tools at `toolPath(slug)`; lastmod dates set to this site's real dates — `2026-10-28` for pages changed in Plans 4–5), `src/app/__tests__/sitemap.test.ts`, `src/app/robots.ts` (only if a test finds a gap), `README.md` (IndexNow step)

**Interfaces:**
- `buildLlmsTxt(input: { lessons: readonly LessonMeta[]; tools: readonly ToolMeta[]; posts: Pick<BlogPost, "slug" | "title" | "description">[] }): string` in the llmstxt.org shape: `# Learn AEO`, a `>` summary, a short facts list, then `## Course` (one `- [Lesson N, District: Title](url): summary` per **live** lesson, then one plain line listing coming-soon lessons by title), `## Free tools` (only when a tool is live; `- [Name](url): summary`), `## Articles` (only when posts exist), `## Key pages`, and `## Optional` (sitemap, privacy, terms). Use the real `BlogPost` field names from `src/lib/blog-posts.ts`.
- `buildSitemap(input: { posts; tools })` (existing function, widened).

- [ ] **Step 1: Failing tests.** llms-txt: starts with `# Learn AEO` then a `> ` line; every live lesson appears as a markdown link to its absolute URL; no coming-soon lesson has a link; no "Free tools" heading while all tools are coming soon, and a live tool appears as a link when one is passed live; no "Articles" heading with zero posts and a post link with one; prices match `PLANS`. Sitemap: a live tool passed in appears at `/tools/<slug>`, coming-soon tools do not; no private path; no lastmod before `2026-10-26` (the site's start). Robots: disallows the private paths and `/api/`, allows `/`, lists `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, and points at the sitemap. IndexNow: `scripts/indexnow.config.json` `host === SITE.host` and `public/<key>.txt` contains exactly the key. Run → FAIL where behavior is new.
- [ ] **Step 2:** Implement. The route keeps `force-static` and the cache headers.
- [ ] **Step 3:** `npx tsc --noEmit && npm test && npm run build` → PASS. Commit `feat: llms.txt and sitemap from the catalogs`.

---

### Task 5: Check the built site's head tags

**Files:**
- Create: `scripts/dev/check-seo.mjs`
- Modify: `README.md` (how to run it; status line: Plan 5 done)

**Interfaces:** `node scripts/dev/check-seo.mjs [baseUrl]` (default `http://localhost:3000`) fetches `/sitemap.xml`, `/robots.txt`, `/llms.txt`, then every sitemap URL (rewritten to `baseUrl`), and for each page checks: status 200; one `<title>`; a meta description; `<link rel="canonical">` equal to the sitemap URL (with the production origin); `og:url` equal to it; `og:image` present; no `noindex`; every `application/ld+json` block parses as JSON; no `"@type":"Person"`. It also checks the Organization `@id` is defined on every page and Course `@id` is the same on `/` and `/pricing`. Prints a table; exits 1 on any failure.

- [ ] **Step 1:** Write the script. `npm run build`, then `npx next start -p 3200` in the background, run `node scripts/dev/check-seo.mjs http://localhost:3200` → expect PASS for every URL; fix any failure at its source (with a failing unit test first where the logic is in `src/`). Also fetch one lesson OG image URL from the page's `og:image` and confirm 200 `image/png`. Stop the server.
- [ ] **Step 2:** README: document the check under Deploy; status line. `npx tsc --noEmit && npm test` → PASS. Commit `chore: SEO head check for the built site`.
