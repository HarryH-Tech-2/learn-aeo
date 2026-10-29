// The llms.txt Generator (/tools/llms-txt-generator): a form in, an llms.txt file out, in the
// shape the llmstxt.org proposal describes: an H1 name, a blockquote summary, optional detail
// paragraphs, then H2 sections of "- [name](url): notes" links, with "Optional" last.
// Pure, so it runs in the browser and in tests.

export type LlmsLink = { title: string; url: string; notes: string };
export type LlmsForm = {
  name: string;
  summary: string;
  details: string;
  sections: { title: string; links: LlmsLink[] }[];
  optional: LlmsLink[];
};

export function emptyLlmsForm(): LlmsForm {
  return {
    name: "",
    summary: "",
    details: "",
    sections: [{ title: "Docs", links: [{ title: "", url: "", notes: "" }] }],
    optional: [],
  };
}

const oneLine = (s: string) => s.replace(/\s*[\r\n]+\s*/g, " ").trim();
const escapeTitle = (s: string) => oneLine(s).replace(/([[\]])/g, "\\$1");
const isFilled = (l: LlmsLink) => Boolean(l.title.trim() || l.url.trim() || l.notes.trim());

function isWebUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateLlmsForm(f: LlmsForm): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!f.name.trim()) errors.push({ field: "name", message: "Add your site or project name." });
  if (!f.summary.trim()) errors.push({ field: "summary", message: "Add a one-paragraph summary." });
  const checkLink = (l: LlmsLink, at: string) => {
    if (!isFilled(l)) return;
    if (!l.title.trim()) errors.push({ field: `${at}.title`, message: "Give the link a title." });
    if (!isWebUrl(l.url.trim())) errors.push({ field: `${at}.url`, message: "Use a full web address starting with https://." });
  };
  f.sections.forEach((s, i) => {
    if (s.links.some(isFilled) && !s.title.trim()) errors.push({ field: `sections.${i}.title`, message: "Give the section a title." });
    s.links.forEach((l, j) => checkLink(l, `sections.${i}.links.${j}`));
  });
  f.optional.forEach((l, j) => checkLink(l, `optional.${j}`));
  return errors;
}

function linkLine(l: LlmsLink): string {
  const notes = oneLine(l.notes);
  // URL.href percent-encodes spaces; parentheses would end the markdown link early, so encode them too.
  const url = new URL(l.url.trim()).href.replace(/\(/g, "%28").replace(/\)/g, "%29");
  return `- [${escapeTitle(l.title)}](${url})${notes ? `: ${notes}` : ""}`;
}

export function generateLlmsTxt(f: LlmsForm): string {
  const out: string[] = [`# ${oneLine(f.name)}`, "", `> ${oneLine(f.summary)}`, ""];
  // Details are free text, but a heading there would start a new section: escape any leading "#".
  const details = f.details.trim().replace(/^(\s*)#/gm, "$1\\#");
  if (details) out.push(details, "");
  const sections = [
    ...f.sections.map((s) => ({ title: oneLine(s.title), links: s.links.filter(isFilled) })),
    { title: "Optional", links: f.optional.filter(isFilled) },
  ].filter((s) => s.links.length);
  for (const s of sections) out.push(`## ${s.title}`, "", ...s.links.map(linkLine), "");
  return out.join("\n").replace(/\n+$/, "\n");
}
