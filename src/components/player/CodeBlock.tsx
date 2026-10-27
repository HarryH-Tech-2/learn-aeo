import type { CodeLanguage } from "@/lib/lesson-types";
import { FOCUS, LANGUAGE_LABEL } from "./ui";

type Props = { language: CodeLanguage; code: string; caption?: string };

/** A monospace example with a language label. Long lines scroll inside the box, never the page. */
export default function CodeBlock({ language, code, caption }: Props) {
  const label = LANGUAGE_LABEL[language];
  return (
    <figure className="min-w-0 overflow-hidden rounded-xl border border-sand-500/30 bg-obsidian">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-sand-500/20 px-4 py-2">
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400">{label}</span>
        {caption && <figcaption className="font-sans text-xs text-sand-400">{caption}</figcaption>}
      </div>
      <pre
        tabIndex={0}
        aria-label={caption ? `${label} example: ${caption}` : `${label} example`}
        className={`overflow-x-auto p-4 font-mono text-[0.85rem] leading-relaxed text-sand-200 ${FOCUS} focus-visible:outline-offset-[-2px]`}
      >
        <code>{code}</code>
      </pre>
    </figure>
  );
}
