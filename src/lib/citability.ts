/**
 * The Citability Checker's analysis (tools/citability-checker): reads a page's HTML as served and scores it against
 * the course's checklist for passages an AI answer can lift and trust (Lesson 3, Writing citable content).
 *
 * It is a heuristic, not a model of any engine: no AI company publishes a citability score. Every check says what it
 * looked for, so a reader can disagree with it. Pure functions, no I/O: the API route fetches the page.
 *
 * Parsing is deliberately simple (regular expressions over the served HTML, no DOM). It reads what a crawler that
 * doesn't run JavaScript would read, which is the point.
 */

export type CheckStatus = "pass" | "warn" | "fail";

export type CitabilityCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  /** What was found, in one or two sentences. */
  detail: string;
  /** What to do about it; empty when the check passed. */
  fix: string;
};

export type CitabilityReport = {
  url: string;
  title: string | null;
  /** 0-100: pass = 2 points, warn = 1, fail = 0, over all checks */
  score: number;
  wordCount: number;
  checks: CitabilityCheck[];
  /** The first paragraph after the main heading, as an AI tool would see it lifted on its own */
  leadPassage: string | null;
};

// ── HTML helpers ────────────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", mdash: "—", ndash: "–", hellip: "…" };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** Tags removed, entities decoded, whitespace collapsed. */
export function textOf(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

const words = (s: string) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return m ? decodeEntities(m[2] ?? m[3] ?? m[4] ?? "") : null;
}

function metaContent(html: string, key: string): string | null {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const k = attr(tag, "name") ?? attr(tag, "property");
    if (k && k.toLowerCase() === key) return attr(tag, "content");
  }
  return null;
}

/** Every @type in the page's JSON-LD blocks (including inside @graph), plus whether any carries a date or an author. */
export function jsonLdFacts(html: string): { types: string[]; hasDate: boolean; hasAuthor: boolean } {
  const types = new Set<string>();
  let hasDate = false;
  let hasAuthor = false;
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    const t = o["@type"];
    if (typeof t === "string") types.add(t);
    else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x));
    if (typeof o.datePublished === "string" || typeof o.dateModified === "string") hasDate = true;
    if (o.author) hasAuthor = true;
    for (const v of Object.values(o)) if (v && typeof v === "object") visit(v);
  };
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      visit(JSON.parse(m[1].trim()));
    } catch {
      // invalid JSON-LD is reported by the structured-data check as "none readable"
    }
  }
  return { types: [...types], hasDate, hasAuthor };
}

type Block = { tag: string; text: string };

/** Headings, paragraphs, list items and tables of the main content, in document order. */
export function contentBlocks(html: string): { blocks: Block[]; region: string } {
  let doc = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, " ");
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(doc) ?? /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(doc);
  const body = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(doc);
  let region = main ? main[1] : body ? body[1] : doc;
  // (not <header>: articles often keep their H1 in one, inside <main>; with no <main>, a site banner's links sit in <nav>)
  region = region.replace(/<(nav|footer|aside|form)\b[\s\S]*?<\/\1>/gi, " ");
  doc = region;
  const blocks: Block[] = [];
  for (const m of doc.matchAll(/<(h[1-6]|p|li|table|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const tag = m[1].toLowerCase();
    const text = tag === "table" ? "[table]" : textOf(m[2]);
    if (text) blocks.push({ tag, text });
  }
  return { blocks, region };
}

const QUESTION_START = /^(what|how|why|when|where|which|who|whom|whose|can|could|does|do|did|is|are|was|were|should|will|would|has|have)\b/i;
const DANGLING_START = /^(this|that|these|those|it|its|they|their|he|she|such|here|there)\b/i;

// ── the checklist ───────────────────────────────────────────────────────────

export function analyzeCitability(html: string, url: string, status = 200): CitabilityReport {
  const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = titleMatch ? textOf(titleMatch[1]) || null : null;
  const description = metaContent(html, "description");
  const robots = (metaContent(html, "robots") ?? "").toLowerCase();
  const ld = jsonLdFacts(html);
  const { blocks, region } = contentBlocks(html);

  const h1s = blocks.filter((b) => b.tag === "h1");
  const subheads = blocks.filter((b) => b.tag === "h2" || b.tag === "h3");
  const paragraphs = blocks.filter((b) => b.tag === "p" && words(b.text) >= 8);
  const wordCount = blocks.filter((b) => b.tag !== "table").reduce((n, b) => n + words(b.text), 0);
  const checks: CitabilityCheck[] = [];
  const add = (c: CitabilityCheck) => checks.push(c);

  // 1. Can it be read at all?
  const noindex = /\bnoindex\b|\bnone\b/.test(robots);
  add(
    status !== 200
      ? { id: "fetch", label: "Page loads for crawlers", status: "fail", detail: `The page answered with HTTP ${status}.`, fix: "Make sure the URL returns 200 to crawlers, not an error or a login wall." }
      : noindex
        ? { id: "fetch", label: "Page loads for crawlers", status: "fail", detail: "The page carries a noindex robots meta tag.", fix: "Remove noindex if you want search and AI search to use this page." }
        : { id: "fetch", label: "Page loads for crawlers", status: "pass", detail: "The page returns 200 and isn't marked noindex.", fix: "" }
  );

  // 2. Enough text in the HTML as served
  const scriptCount = (html.match(/<script\b/gi) ?? []).length;
  add(
    wordCount < 150
      ? {
          id: "text",
          label: "Text in the HTML",
          status: "fail",
          detail: `Only ${wordCount} words of content were found in the HTML${scriptCount > 10 ? ", and the page loads a lot of scripts" : ""}.`,
          fix: "If the content appears only after JavaScript runs, crawlers that read raw HTML may see an almost empty page. Render the main content on the server.",
        }
      : wordCount < 300
        ? { id: "text", label: "Text in the HTML", status: "warn", detail: `${wordCount} words of content: on the thin side.`, fix: "Short pages can be cited, but make sure the answer and the supporting detail are both there." }
        : { id: "text", label: "Text in the HTML", status: "pass", detail: `${wordCount} words of content in the HTML as served.`, fix: "" }
  );

  // 3. One clear main heading
  add(
    h1s.length === 1
      ? { id: "h1", label: "One main heading", status: "pass", detail: `H1: “${h1s[0].text.slice(0, 90)}”.`, fix: "" }
      : h1s.length === 0
        ? { id: "h1", label: "One main heading", status: "fail", detail: "No H1 was found in the main content.", fix: "Give the page one H1 that names the subject or asks the question the page answers." }
        : { id: "h1", label: "One main heading", status: "warn", detail: `${h1s.length} H1 headings were found.`, fix: "Use one H1 for the page's main question; make the others H2s." }
  );

  // 4. Answer first
  const firstH1 = blocks.findIndex((b) => b.tag === "h1");
  const lead = blocks.slice(firstH1 + 1).find((b) => b.tag === "p" && words(b.text) >= 8) ?? null;
  const leadWords = lead ? words(lead.text) : 0;
  add(
    !lead
      ? { id: "answer-first", label: "Answer first", status: "fail", detail: "No opening paragraph was found after the main heading.", fix: "Open with a one- or two-sentence answer to the question the page is about." }
      : leadWords <= 60
        ? { id: "answer-first", label: "Answer first", status: "pass", detail: `The opening paragraph is ${leadWords} words: short enough to lift as an answer.`, fix: "" }
        : leadWords <= 100
          ? { id: "answer-first", label: "Answer first", status: "warn", detail: `The opening paragraph is ${leadWords} words.`, fix: "Put the direct answer in the first sentence or two, then expand in the next paragraph." }
          : { id: "answer-first", label: "Answer first", status: "fail", detail: `The opening paragraph is ${leadWords} words, so the answer is buried.`, fix: "Start with a short, direct answer (under about 60 words), then give the detail." }
  );

  // 5. Question-shaped subheadings
  const questions = subheads.filter((h) => h.text.trim().endsWith("?") || QUESTION_START.test(h.text.trim()));
  add(
    subheads.length === 0
      ? { id: "headings", label: "Question-shaped headings", status: "fail", detail: "No H2 or H3 subheadings were found.", fix: "Break the page into sections with headings that match the questions people ask." }
      : questions.length >= 2 || questions.length / subheads.length >= 0.25
        ? { id: "headings", label: "Question-shaped headings", status: "pass", detail: `${questions.length} of ${subheads.length} subheadings are phrased as questions.`, fix: "" }
        : {
            id: "headings",
            label: "Question-shaped headings",
            status: "warn",
            detail: `${questions.length} of ${subheads.length} subheadings are phrased as questions.`,
            fix: "Where it reads naturally, phrase headings as the question the section answers (“How long does X take?”).",
          }
  );

  // 6. Paragraph length
  const long = paragraphs.filter((p) => words(p.text) > 120);
  const longShare = paragraphs.length ? long.length / paragraphs.length : 0;
  add(
    !paragraphs.length
      ? { id: "paragraphs", label: "Short paragraphs", status: "warn", detail: "No paragraphs were found to measure.", fix: "Write the content as paragraphs, not only lists or images." }
      : long.length === 0
        ? { id: "paragraphs", label: "Short paragraphs", status: "pass", detail: `All ${paragraphs.length} paragraphs are 120 words or fewer.`, fix: "" }
        : {
            id: "paragraphs",
            label: "Short paragraphs",
            status: longShare <= 0.2 ? "warn" : "fail",
            detail: `${long.length} of ${paragraphs.length} paragraphs run over 120 words.`,
            fix: "Split long paragraphs so each makes one point. A passage that is quoted on its own should fit in a few sentences.",
          }
  );

  // 7. Self-contained passages
  const dangling = paragraphs.filter((p) => DANGLING_START.test(p.text));
  const danglingShare = paragraphs.length ? dangling.length / paragraphs.length : 0;
  add(
    !paragraphs.length || danglingShare <= 0.1
      ? { id: "standalone", label: "Passages make sense alone", status: "pass", detail: paragraphs.length ? `${dangling.length} of ${paragraphs.length} paragraphs open with a word like “this” or “it”.` : "Nothing to measure.", fix: "" }
      : {
          id: "standalone",
          label: "Passages make sense alone",
          status: danglingShare <= 0.25 ? "warn" : "fail",
          detail: `${dangling.length} of ${paragraphs.length} paragraphs open with a word like “this”, “it” or “they”, which loses its meaning when the paragraph is quoted alone.`,
          fix: `Name the subject instead. For example, rewrite “${dangling[0].text.split(" ").slice(0, 6).join(" ")}…” so it says what “${dangling[0].text.split(" ")[0]}” refers to.`,
        }
  );

  // 8. Lists and tables
  const lists = blocks.filter((b) => b.tag === "li").length;
  const tables = blocks.filter((b) => b.tag === "table").length;
  add(
    lists + tables > 0
      ? { id: "structure", label: "Lists or tables", status: "pass", detail: `${lists} list items and ${tables} tables.`, fix: "" }
      : { id: "structure", label: "Lists or tables", status: "warn", detail: "No lists or tables were found.", fix: "Steps, options and comparisons are easier to lift as a list or a table." }
  );

  // 9. Specifics
  const withNumbers = paragraphs.filter((p) => /\d/.test(p.text)).length;
  add(
    !paragraphs.length || withNumbers / paragraphs.length >= 0.2
      ? { id: "specifics", label: "Concrete specifics", status: "pass", detail: `${withNumbers} of ${paragraphs.length} paragraphs include a number, date or figure.`, fix: "" }
      : { id: "specifics", label: "Concrete specifics", status: "warn", detail: `${withNumbers} of ${paragraphs.length} paragraphs include a number, date or figure.`, fix: "Where you can, give the figure, the date or the named example instead of a general claim." }
  );

  // 10. Sources
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {}
  const external = new Set<string>();
  for (const m of region.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(m[0], "href");
    if (!href || !/^https?:\/\//i.test(href)) continue;
    try {
      const h = new URL(href).hostname.replace(/^www\./, "");
      if (h && h !== host) external.add(href);
    } catch {}
  }
  add(
    external.size >= 2
      ? { id: "sources", label: "Claims backed by sources", status: "pass", detail: `${external.size} links to other sites in the main content.`, fix: "" }
      : { id: "sources", label: "Claims backed by sources", status: "warn", detail: external.size === 1 ? "One link to another site in the main content." : "No links to other sites in the main content.", fix: "Link the facts and figures you state to their primary sources." }
  );

  // 11. Dates
  const hasDate =
    ld.hasDate ||
    !!metaContent(html, "article:published_time") ||
    !!metaContent(html, "article:modified_time") ||
    /<time\b[^>]*datetime=/i.test(region);
  add(
    hasDate
      ? { id: "dates", label: "Published or updated date", status: "pass", detail: "A machine-readable date was found.", fix: "" }
      : { id: "dates", label: "Published or updated date", status: "warn", detail: "No machine-readable published or updated date was found.", fix: "Show the date you published or last updated the page, and put it in your Article schema (datePublished, dateModified)." }
  );

  // 12. Author
  const hasAuthor = ld.hasAuthor || !!metaContent(html, "author") || /rel\s*=\s*["']?author/i.test(html);
  add(
    hasAuthor
      ? { id: "author", label: "Named author", status: "pass", detail: "An author is named in the page's markup.", fix: "" }
      : { id: "author", label: "Named author", status: "warn", detail: "No author was found in the markup.", fix: "Say who wrote the page and link to their profile, in the byline and in the schema." }
  );

  // 13. Structured data
  add(
    ld.types.length
      ? { id: "schema", label: "Structured data", status: "pass", detail: `JSON-LD types: ${ld.types.slice(0, 6).join(", ")}${ld.types.length > 6 ? "…" : ""}.`, fix: "" }
      : { id: "schema", label: "Structured data", status: "warn", detail: "No readable JSON-LD was found.", fix: "Describe the page with JSON-LD (Article, Product, Organization…). The Schema Generator can build it." }
  );

  // 14. Title and description
  add(
    title && description
      ? { id: "meta", label: "Title and description", status: "pass", detail: `Title: “${title.slice(0, 80)}”.`, fix: "" }
      : { id: "meta", label: "Title and description", status: "warn", detail: !title ? "The page has no title tag." : "The page has no meta description.", fix: "Give the page a specific title and a one-sentence description of what it answers." }
  );

  const points = checks.reduce((n, c) => n + (c.status === "pass" ? 2 : c.status === "warn" ? 1 : 0), 0);
  return {
    url,
    title,
    score: Math.round((points / (checks.length * 2)) * 100),
    wordCount,
    checks,
    leadPassage: lead ? lead.text : null,
  };
}
