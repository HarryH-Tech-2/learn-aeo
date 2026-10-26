/**
 * "More ways to write a name" (2026-10-19): one block of links between the name tools, so each page passes
 * visitors and search engines on to the others. Server-safe (no hooks); `current` leaves the page's own link out.
 */
import Link from "next/link";

export type NameToolId = "translator" | "pet" | "tattoo" | "couple" | "gift" | "keyboard" | "numerals" | "cuneiform";

export const NAME_TOOLS: { id: NameToolId; href: string; glyph: string; title: string; blurb: string }[] = [
  { id: "translator", href: "/translate-name-to-hieroglyphics", glyph: "𓍷", title: "Your name in hieroglyphics", blurb: "Any name in a royal cartouche, sign by sign." },
  { id: "pet", href: "/pet-name-in-hieroglyphics", glyph: "𓃠", title: "Your pet's name", blurb: "With the cat or dog sign a scribe would add." },
  { id: "couple", href: "/couple-names-in-hieroglyphics", glyph: "𓋹", title: "Two names together", blurb: "A couple's cartouches and their year, for a wedding or anniversary." },
  { id: "tattoo", href: "/hieroglyphics-tattoo", glyph: "𓂀", title: "Hieroglyphics tattoo stencil", blurb: "Your name in clean black signs for your tattoo artist." },
  { id: "gift", href: "/gift", glyph: "𓊵", title: "Gift the course", blurb: "Lifetime access for someone else, with their name as the card." },
  { id: "keyboard", href: "/hieroglyphics-keyboard", glyph: "𓆑", title: "Hieroglyphics keyboard", blurb: "Type anything and see it in Egyptian signs." },
  { id: "numerals", href: "/egyptian-numerals-converter", glyph: "𓆼", title: "Numbers and dates", blurb: "A birthday, a wedding date or any number in Egyptian numerals." },
  // (the glyph here is a hieroglyph like the rest: the cards use the hieroglyph font, not the cuneiform one)
  { id: "cuneiform", href: "/write-your-name-in-cuneiform", glyph: "𓏞", title: "Your name in cuneiform", blurb: "The other oldest writing: your name in Babylonian wedges." },
];

export default function NameToolLinks({ current, className = "" }: { current?: NameToolId; className?: string }) {
  const tools = NAME_TOOLS.filter((t) => t.id !== current);
  return (
    <nav aria-labelledby="name-tools-heading" className={`border-t border-gold-700/20 pt-10 ${className}`}>
      <h2 id="name-tools-heading" className="mb-5 text-center font-display text-2xl text-sand-100">
        More ways to write a name
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <li key={t.id}>
            <Link
              href={t.href}
              className="flex h-full items-start gap-3 border border-gold-700/30 bg-obsidian-light/40 p-4 transition-colors hover:border-gold-500/60"
            >
              <span lang="egy" aria-hidden="true" className="hieroglyph-font text-3xl leading-none text-gold-400">
                {t.glyph}
              </span>
              <span>
                <span className="block font-display text-lg text-sand-100">{t.title}</span>
                <span className="block font-body text-sm text-sand-400">{t.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A plain list of questions and answers, styled like the other tool pages' FAQs. Pair it with FAQPage JSON-LD. */
export function FaqList({ faqs, heading = "Questions" }: { faqs: { q: string; a: string }[]; heading?: string }) {
  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <h2 id="faq-heading" className="mb-6 text-center font-display text-3xl font-semibold text-sand-100">
        {heading}
      </h2>
      <div className="space-y-5">
        {faqs.map((f) => (
          <div key={f.q} className="border border-gold-700/20 bg-obsidian-light/30 p-5">
            <h3 className="mb-2 font-display text-lg text-sand-100">{f.q}</h3>
            <p className="font-body text-base leading-relaxed text-sand-400">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
