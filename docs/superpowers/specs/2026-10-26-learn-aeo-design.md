# Learn AEO — Design

Date: 2026-10-26
Owner: Harry Harrison
Domain: https://www.learnaeo.com

## Intent

Learn AEO is an online course that teaches **marketing professionals** answer engine optimisation (AEO): how ChatGPT, Perplexity, Google AI Overviews / AI Mode, Copilot and Claude choose which sources to cite, and how to become one of them.

It is a sibling of learnhieroglyphics.com and reuses that product's playbook and codebase: a free first lesson, paid access to the rest, gamified progress, free tools that attract search traffic, an answer-first blog, and AEO groundwork baked into the site itself. The site doubles as a live case study: everything the course teaches, the site does.

## Audience

Marketing professionals (in-house marketers, SEOs, content leads, agency staff) who want to learn AEO for their brand or their clients. They know SEO basics and marketing jargon; they do not need "what is a keyword" explained. They value practical, defensible, current advice they can put to work on Monday and a credential they can show (LinkedIn certificate).

## Goals

- A real product that takes sign-ups and payments on day one.
- A course a marketer finishes feeling able to run an AEO programme.
- Organic acquisition through Google and AI answers: tools, glossary and blog pages that rank and get cited for "learn AEO", "AEO course", "what is AEO", "llms.txt", etc.
- The site is exemplary AEO: crawlable by every AI bot, answer-first copy, rich schema, llms.txt.

## Non-goals (v1)

- Teacher / classroom / school licences, gifting, print products.
- Spanish / French versions.
- 3D games, daily puzzle, spaced repetition, community Q&A.
- An AI visibility tracking SaaS (prompt tracking dashboards). The course teaches measurement; it does not sell a tracker.

## Anti-goals (failure even if it works)

- **Made-up statistics or claims.** AEO is full of vendor hype. Every number in lessons, blog posts and tools must come from a named, linkable source with a date, or be removed. Unverifiable "X% of searches…" claims are out. Claude checks each sourced claim against the live source while writing; Harry spot-checks before publishing (builder's call on the process).
- **Invented author credentials.** No author bio, byline credentials or Person/author schema at launch (decided by Harry). Course and posts are attributed to the Learn AEO organisation until Harry adds an author.
- Advice that reads as tricks or manipulation (prompt-injection in pages, hidden text for bots, fake reviews). The course teaches durable, legitimate practice.
- Hieroglyphics leftovers: any Egypt copy, imagery, routes, emails, badge names or domain strings in the shipped site.
- Thin, generic AI-sounding content. Lessons need concrete examples (before/after passages, real robots.txt lines, real schema).

## Pricing (decided by Harry)

| Plan | Price | Mode |
|---|---|---|
| First lesson | Free (Google or email sign-in) | — |
| Lifetime | **$100** one-time | Stripe payment |
| Monthly | **$10 / month** | Stripe subscription |

GBP prices: £80 lifetime, £8/month (builder's call; mirrors the USD/GBP ratio used on the sibling site). No classroom/school plans.

Discounts and refunds carry over from the sibling unchanged (decided by Harry): regional pricing tiers at 30/50/65% off, the 33%-off lesson-completion offer valid for 60 hours (lifetime only), and the 14-day money-back guarantee. Coupon and promo-code ids are renamed for this site.

**Stripe account (decided by Harry):** a new, separate Stripe account for Learn AEO. No shared webhooks, coupons or products with learnhieroglyphics.com, and no changes to the sibling's live code.

**Certificate access (builder's call):** monthly subscribers can earn the certificate, as on the sibling site.

## How it gets made (decided)

- **Fork** the learn-hieroglyphics codebase (`C:\Users\harry\Documents\code\learn-hieroglyphics`) into `C:\dev\learn-aeo` as a **fresh git repository** (no history, no `.env*`, `.vercel`, `node_modules`, `.next`, media dumps). Same stack: Next 15 app router, React 19, Prisma 6 on Postgres, NextAuth v4 (Google + email magic link via Resend), Stripe, Resend, Tailwind v4, vitest, deployed on Vercel.
- **Hero:** the Three.js "city of answers" scene already prototyped in `hero/index.html` (search bar → doors open → fly-through → orbit of the golden "cited source"), ported to a client component. No AI video, no Higgsfield.

## Builder's calls (made by Claude, open to change)

### Site configuration
Introduce `src/lib/site.ts` (name, URL, author, social links, GA4 id, support email) and use it everywhere instead of the ~225 hardcoded domain strings. GA4 id and other per-site values come from env vars.

### Brand and look
Dark navy base (`#04060d`), cyan (`#6fe3ff`) and gold (`#ffc76b`) accents, matching the hero. Instrument Serif for display headings, Inter for UI and body. Light theme kept (the sibling's theme system), recoloured. Gamification theme: the course is a journey through the **City of Answers**; each lesson is a district.

### Curriculum (8 lessons, ~3.5 hours)

| # | District | Lesson | Level | Free |
|---|---|---|---|---|
| 1 | The Gate | How answer engines choose sources: retrieval, grounding, query fan-out, citations vs mentions, how AI answers differ from ten blue links | Beginner | ✔ |
| 2 | The Crawl Docks | Being reachable: AI crawlers vs AI user agents, robots.txt, rendering/JS, llms.txt, sitemaps, IndexNow, CDN/WAF bot blocking | Beginner | |
| 3 | The Answer Quarter | Writing citable content: answer-first, passage-level clarity, question headings, lists/tables, definitions, freshness and dates | Beginner | |
| 4 | The Schema Works | Structured data and entities: JSON-LD essentials (Organization, Article, FAQPage, HowTo, Product), entity consistency, sameAs, knowledge graph | Intermediate | |
| 5 | The Agora | Authority beyond your site: brand mentions, reviews, Reddit/forums, digital PR, Wikipedia/Wikidata, comparison and "best X" lists | Intermediate | |
| 6 | The Embassies | Platform playbooks: Google AI Overviews / AI Mode, ChatGPT search, Perplexity, Copilot, Claude; what each favours and how to test | Intermediate | |
| 7 | The Observatory | Measuring AI visibility: prompt sets, share of voice, AI referral traffic in GA4, server logs for bot hits, reporting | Advanced | |
| 8 | The Citadel | Running an AEO programme: audits, prioritisation, roadmaps, stakeholder/client reporting, a 90-day plan | Advanced | |

Each lesson: a narrative intro (arriving in the district), 3–4 concept groups of cards, a quick check after each group, one signature exercise, a real-world example to dissect, and a final **Audit** quiz (pass at ≥60%) that marks the lesson complete.

### Lesson content model
Replace the `Hieroglyph` / `glyphGroups` model with:

- `Concept` card: `term`, `summary` (one-sentence answer), `explanation` (short markdown), `whyItMatters`, `example` (optional before/after or code snippet with language), `pitfall`, `sources[]` (title + URL + date).
- `ConceptGroup`: title, concepts, quick check questions.
- Question types: multiple choice; "pick the more citable passage" (A/B); fill-in-the-blank; drag-to-order; match term↔definition; "spot the problem" in a robots.txt / schema / passage snippet.
- Signature exercise per lesson (examples: L2 fix a robots.txt that blocks GPTBot; L3 rewrite a passage answer-first via choice steps; L4 assemble a JSON-LD block; L7 build a prompt set).
- Lessons stay typed TS data (`src/lib/lessons.ts` + `src/lib/content/*`), as in the sibling.

The sibling's lesson player stages that are hieroglyph-specific (door, torch, name, cartouche, mechanics, boss, letter) are removed; a simpler stage machine is kept: intro → concept group → quick check → … → signature exercise → example → audit → outro.

### Gamification
Keep XP, levels, streaks, badges, leaderboard (first name + last initial) and certificate. Level titles: Query Rookie, Crawl Wrangler, Snippet Smith, Entity Architect, Citation Hunter, Answer Strategist, Answer Engine Authority. Badges renamed to the City of Answers theme. Certificate: PNG with name, date, course title and a verification URL, sized for LinkedIn.

### Free tools (acquisition)
1. **AI Crawler Checker** `/tools/ai-crawler-checker` — enter a domain; the server fetches its robots.txt and reports, per AI crawler and user agent, allowed/blocked, with fix snippets.
2. **llms.txt Generator** `/tools/llms-txt-generator` — form → valid llms.txt, copy/download (client-side).
3. **Schema Generator** `/tools/schema-generator` — Organization, Article, FAQPage, HowTo, Product JSON-LD builder with validation hints (client-side).
4. **Citability Checker** `/tools/citability-checker` — enter a URL; the server fetches the page and scores answer-first openings, question headings, passage length, lists/tables, schema present, author/date signals, with specific suggestions.

Server-side fetching tools must guard against SSRF (public hosts only, no private IP ranges, size and time limits) and be rate-limited.

Each tool page: answer-first intro, the tool, a "how it works" section, FAQ with FAQPage schema, and a CTA into Lesson 1.

### Glossary hub
`/glossary` and `/glossary/[term]`: ~30 AEO terms (AEO, GEO, AI Overviews, query fan-out, grounding, RAG, citation, llms.txt, GPTBot, entity, sameAs, share of voice…). Each term page: one-sentence definition first, explanation, example, related terms, DefinedTerm schema.

### Blog at launch (~8 posts)
What is AEO; AEO vs SEO vs GEO; How to learn AEO; Is AEO worth learning in 2026; Best AEO courses; How ChatGPT chooses which sources to cite; How to get cited in Google AI Overviews; llms.txt explained. Each uses the sibling's `quickAnswer` + FAQs format with sources.

### Pages
Home (hero, what you'll learn, curriculum map, tools, pricing, FAQ), Pricing, Get started, Login, Dashboard (city map of districts), Lessons, Certificate, Leaderboard, Account, Tools hub, Glossary, Blog, About, Contact, Privacy, Terms, 404.

### SEO / AEO groundwork
- `robots.ts`: allow all AI crawlers explicitly (sibling's list, kept current); disallow private paths.
- `llms.txt` generated from site config, lessons, tools, glossary and blog.
- `sitemap.ts` from the same sources.
- JSON-LD: Organization + WebSite in layout; Course on home and pricing (with offers at $100 / $10); LearningResource per lesson; BlogPosting + FAQPage + BreadcrumbList on posts; SoftwareApplication/WebApplication on tools; DefinedTermSet/DefinedTerm on glossary. A shared helper module instead of copy-pasted inline objects.
- Per-page metadata with canonical URLs from site config; OG images.
- IndexNow ping script with the new host and key.

### Email
Keep Resend magic link, welcome and nurture sequence (re-written for marketers, City of Answers theme), checkout recovery, owner notifications. Nurture off by default until Harry enables it.

## External setup Harry must do (Claude cannot)

- Register/point **learnaeo.com** DNS to Vercel; create the Vercel project.
- Postgres database (e.g. Vercel Postgres / Neon) → `POSTGRES_URL`, `DATABASE_URL`.
- Google OAuth client for learnaeo.com → `GOOGLE_CLIENT_ID/SECRET`.
- Resend: verify learnaeo.com sending domain → `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
- Stripe: run the provided `stripe-create-plans` script against his account (Claude can run it in test mode with a test key he provides) → price ids; add webhook endpoint → `STRIPE_WEBHOOK_SECRET`.
- GA4 property → measurement id.

Until then the site runs locally with the sibling's dev auth bypass and Stripe test mode.

## Delivery phases

Paid plans can go live once a few lessons are done (decided by Harry). Unwritten lessons show on the city map as "coming soon" districts; pricing copy says lessons are being released and lifetime includes every future lesson. Launch milestone: lessons 1–3 complete plus the full payment flow, marketing pages, SEO plumbing and at least two tools.

1. Fork and strip: copy, fresh repo, remove domain-specific routes/libs/components/tests/assets, add `site.ts`, rebrand strings; build and tests green.
2. Pricing and payments: plans, scripts, checkout copy, webhook branches trimmed.
3. Lesson model, player, "coming soon" districts, and lessons 1–3 (with sources).
4. Gamification, certificate, emails.
5. Marketing pages and the Three.js hero.
6. SEO/AEO plumbing: robots, llms.txt, sitemap, schema helper, metadata, OG.
7. Tools (AI Crawler Checker and llms.txt Generator first), then glossary and blog.
8. Deploy readiness checklist. **Launch milestone.**
9. After launch: lessons 4–8, the remaining two tools, more glossary terms and posts.

## Left to the builder

Exact copy, component structure, visual details within the palette, question wording, badge list, test coverage choices, and the order of work inside each phase.
