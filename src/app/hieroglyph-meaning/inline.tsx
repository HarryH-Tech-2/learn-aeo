import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The small markup used in src/lib/sign-meanings.ts: [text](/path), **bold**, *italic*.
 * Hieroglyphs in the text get the hieroglyph font so they render the same everywhere.
 */
const TOKEN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
const GLYPHS = /([\u{13000}-\u{1345F}]+)/u;

function withGlyphs(text: string, key: string): ReactNode[] {
  return text.split(GLYPHS).map((part, i) =>
    GLYPHS.test(part) ? (
      <span key={`${key}-g${i}`} className="hieroglyph-font">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(...withGlyphs(text.slice(last, at), `t${n}`));
    const key = `m${n++}`;
    if (m[1] !== undefined) {
      out.push(
        <Link key={key} href={m[2]} className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
          {withGlyphs(m[1], key)}
        </Link>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <strong key={key} className="font-medium text-sand-200">
          {withGlyphs(m[3], key)}
        </strong>,
      );
    } else {
      out.push(<em key={key}>{m[4]}</em>);
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(...withGlyphs(text.slice(last), `t${n}`));
  return out;
}

/** Plain text for JSON-LD and meta: the markup stripped. */
export function plainText(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}
