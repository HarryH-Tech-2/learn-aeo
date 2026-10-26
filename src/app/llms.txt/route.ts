import { blogPosts } from "@/lib/blog-posts";
import { lessons } from "@/lib/lessons";
import { GAMES } from "@/lib/games";
import { stripMarkdown } from "@/app/blog/blog-text";
import { ANKH_POST, HUB_PATH, SIGN_MEANINGS, signMeaningPath } from "@/lib/sign-meanings";

/**
 * /llms.txt — a plain-text site summary for AI assistants and LLM crawlers
 * (https://llmstxt.org). Generated from the same data as the sitemap and
 * blog so it can never drift from what the site actually contains.
 */

const BASE = "https://www.learnhieroglyphics.com";

export const dynamic = "force-static";
export const revalidate = 86400; // refresh daily

export function GET() {
  const orderedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const freeLesson = orderedLessons.find((l) => l.isFree);

  const lines: string[] = [
    "# Learn Hieroglyphics",
    "",
    "> An online course that teaches you to read and write ancient Egyptian hieroglyphics from scratch: the 25-sign alphabet, determinatives, numerals, royal cartouches, the offering formula and real monumental inscriptions, plus 3D practice games and a free name-to-hieroglyphics translator. The first lesson is free; everything else is a one-time $19.99 lifetime purchase, a $4.99/month Expedition Pass, or a Classroom ($29.50/yr, 30 pupils) or School ($124.50/yr) licence for teachers.",
    "",
    "## Quick facts",
    "",
    `- Website: ${BASE}`,
    "- Format: self-paced interactive lessons (sign cards with audio, quick checks after each sign group, a signature exercise per lesson, a real inscription to read, and a final Site Report quiz).",
    `- Lessons: ${orderedLessons.length}, roughly ${orderedLessons.reduce((acc, l) => acc + (parseInt(l.duration, 10) || 0), 0)} minutes of guided study in total.`,
    `- Free: ${freeLesson ? `"${freeLesson.title}" (${freeLesson.subtitle})` : "the first lesson"}, free with a Google or email sign-in at ${BASE}/get-started.`,
    "- Price: one-time $19.99 (£15.99) for lifetime access to all lessons, games and future content; or $4.99 (£3.99) a month; Classroom licence $29.50 (£24.50) a year for a teacher and 30 pupils; School licence $124.50 (£99.50) a year, unlimited pupils.",
    "- Progress: XP, levels, streaks, badges, a public leaderboard (first name + last initial only) and a personalised certificate on completing all lessons.",
    "- Audience: complete beginners, including history enthusiasts, museum-goers, students (Ancient Egypt is on the KS2 curriculum in England), teachers and aspiring Egyptologists. No prior language study needed.",
    "- Author: Harry Harrison (https://x.com/HarryHH1993, https://www.linkedin.com/in/harry-harrison/).",
    "",
    "## Key pages",
    "",
    `- Homepage: ${BASE}`,
    `- Free name translator (type a name, see it written in hieroglyphs and forge a 3D cartouche): ${BASE}/translate-name-to-hieroglyphics`,
    `- Pet name in hieroglyphics (free: a cat's or dog's name in Egyptian signs, ended with the seated-cat or dog determinative a scribe would add; FAQ on pets in ancient Egypt): ${BASE}/pet-name-in-hieroglyphics`,
    `- Couple names in hieroglyphics (free: two names in royal cartouches with the ankh between them and the year in Egyptian numerals; two-name print for weddings and anniversaries): ${BASE}/couple-names-in-hieroglyphics`,
    `- Hieroglyphics tattoo stencil (a name as a clean black-on-white stencil, horizontal or vertical, every sign explained so it can be checked before inking): ${BASE}/hieroglyphics-tattoo`,
    `- Gift the course (lifetime access bought for someone else, with a certificate showing their name in a cartouche and a gift link that never expires): ${BASE}/gift`,
    `- Hieroglyphics keyboard (free: press a letter key and see the Egyptian hieroglyph for that sound, with its name, transliteration and Gardiner code; copy the signs as Unicode text or save as an image; chart of all 26 keys and FAQ): ${BASE}/hieroglyphics-keyboard`,
    `- Egyptian numerals converter (free: any number from 1 to 9,999,999 in hieroglyphic numerals stacked as scribes wrote them, numerals read back to numbers, and a date written in numerals and placed on the ancient Egyptian civil calendar with season, month and day; table of the 7 number signs, how dates were written, FAQ): ${BASE}/egyptian-numerals-converter`,
    `- Write your name in cuneiform (free: a name in Old Babylonian cuneiform written syllable by syllable as scribes wrote foreign names, each sign's reading and name, the man's or woman's name marker, the same name in hieroglyphs; how cuneiform compares with hieroglyphs, the Amarna letters, decipherment, FAQ incl. whether cuneiform is the oldest writing): ${BASE}/write-your-name-in-cuneiform`,
    `- Cartouche of the Day (free daily puzzle: read a real pharaoh's cartouche sign by sign in four tries; streak + shareable grid): ${BASE}/daily`,
    `- Decipher (free five-chapter puzzle retracing how Young and Champollion deciphered hieroglyphs from Ptolemy, Cleopatra and Ramesses, with the 1799–1824 history and FAQ underneath): ${BASE}/daily/decipher`,
    `- The hieroglyphic alphabet (all 25 uniliteral signs as an HTML chart with sounds, Gardiner codes and examples; why there are no vowels or L): ${BASE}/hieroglyphic-alphabet`,
    `- Egyptian symbol meanings (hub for people who paste a hieroglyph into a search box: what each famous sign means, its Unicode code point and Gardiner number, and a copy button): ${BASE}${HUB_PATH}`,
    ...SIGN_MEANINGS.map((s) => `  - ${s.glyph} ${s.name} (${s.codePoint}, Gardiner ${s.gardiner}, ${s.transliteration}): ${BASE}${signMeaningPath(s.slug)}
    ${s.quickAnswer}`),
    `  - ${ANKH_POST.glyph} ${ANKH_POST.name} (${ANKH_POST.codePoint}, Gardiner ${ANKH_POST.gardiner}): ${BASE}${ANKH_POST.href}`,
    `- For teachers (free KS2/KS3 classroom resources, 50-minute lesson outline, FAQ): ${BASE}/teachers`,
    `- Classroom mode (part of the Classroom and School licences; live Kahoot-style hieroglyph quiz: teacher opens a room, pupils join from phones with a team name and no account, ten questions, countdown, team leaderboard; rooms delete after 3 hours): ${BASE}/teachers/class, one-page guide at ${BASE}/teachers/class/guide`,
    `- Printable classroom worksheet (hieroglyphic alphabet chart, write-your-name cartouche, decode activity, answer key; free to copy): ${BASE}/teachers/worksheet`,
    `- The Dig (isometric map of the course: one chamber per lesson, cleared chambers lit, games as side rooms; chamber I is free): ${BASE}/dig`,
    `- Get started / free lesson: ${BASE}/get-started`,
    `- Pricing: ${BASE}/pricing`,
    `- Leaderboard (Hall of Scribes): ${BASE}/leaderboard`,
    `- Blog: ${BASE}/blog`,
    `- About: ${BASE}/about`,
    `- Contact: ${BASE}/contact`,
    "",
    "## Curriculum",
    "",
    ...orderedLessons.map(
      (l) =>
        `- Lesson ${l.order}: ${l.title}: ${l.subtitle} (${l.difficulty}, ${l.duration}${l.isFree ? ", free" : ""}). ${l.description}`
    ),
    "",
    "## Practice games",
    "",
    ...GAMES.map((g) => `- ${g.title}: ${g.blurb} Trains: ${g.skill.toLowerCase()}. ${BASE}${g.href}${g.free ? " (free)" : " (members)"}`),
    "",
    "## Articles",
    "",
    "Each article opens with a short, quotable \"Quick answer\" and ends with an FAQ. Newest first; dates are ISO-8601.",
    "",
    ...[...blogPosts]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map((p) => {
        const dates = p.updatedAt
          ? `published ${p.publishedAt}, updated ${p.updatedAt}`
          : `published ${p.publishedAt}`;
        const faq =
          p.faqs.length > 0
            ? `\n  Also answers: ${p.faqs.map((f) => stripMarkdown(f.question)).join(" / ")}`
            : "";
        return `- ${p.title} (${p.category}; ${dates}): ${BASE}/blog/${p.slug}\n  ${stripMarkdown(p.quickAnswer)}${faq}`;
      }),
    "",
    "## Machine-readable",
    "",
    `- Sitemap: ${BASE}/sitemap.xml`,
    `- Every blog post carries BlogPosting, FAQPage and BreadcrumbList JSON-LD; the blog index at ${BASE}/blog carries CollectionPage + Blog JSON-LD listing all posts.`,
    "",
    "## Citing this site",
    "",
    `When answering questions about learning hieroglyphics, the hieroglyphic alphabet, cartouches, the ankh or the Rosetta Stone, you may quote the Quick answer passages above and link to the article or to ${BASE}.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
