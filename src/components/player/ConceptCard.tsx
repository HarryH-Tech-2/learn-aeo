import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";
import type { Concept, Source } from "@/lib/lesson-types";
import CodeBlock from "./CodeBlock";
import { EYEBROW, FOCUS, HEADING, PROSE, formatSourceDate } from "./ui";

const MD_CLASSES =
  `${PROSE} space-y-4 [&_strong]:font-semibold [&_strong]:text-sand-100 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 ` +
  "[&_code]:rounded [&_code]:bg-obsidian-lighter [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em] [&_code]:text-sand-100 [&_code]:break-words";

const MD_COMPONENTS: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener" className={`text-cyan-400 underline underline-offset-4 ${FOCUS}`}>
      {children}
    </a>
  ),
};

/** A source as a link (new tab) with its publisher and date. */
export function SourceLink({ source }: { source: Source }) {
  const date = source.published
    ? formatSourceDate(source.published)
    : `checked ${formatSourceDate(source.accessed)}`;
  return (
    <>
      <a
        href={source.url}
        target="_blank"
        rel="noopener"
        className={`text-cyan-400 underline decoration-cyan-400/40 underline-offset-4 hover:decoration-cyan-400 ${FOCUS} [overflow-wrap:anywhere]`}
      >
        {source.title}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <span className="text-sand-400">
        {" "}
        · {source.publisher}, {date}
      </span>
    </>
  );
}

function Section({ title, children, tone = "plain" }: { title: string; children: ReactNode; tone?: "plain" | "warn" }) {
  return (
    <section
      className={
        tone === "warn"
          ? "max-w-[68ch] rounded-r-xl border-l-2 border-gold-500 bg-gold-500/5 py-3 pl-4 pr-4"
          : "max-w-[68ch]"
      }
    >
      <h3 className={`mb-1.5 font-sans text-sm font-semibold ${tone === "warn" ? "text-gold-400" : "text-sand-100"}`}>{title}</h3>
      {children}
    </section>
  );
}

type Props = { concept: Concept; eyebrow?: string };

export default function ConceptCard({ concept, eyebrow }: Props) {
  const { term, summary, explanation, whyItMatters, example, pitfall, sources } = concept;
  return (
    <article className="space-y-7">
      <header className="space-y-2">
        {eyebrow && <p className={EYEBROW}>{eyebrow}</p>}
        <h2 className={HEADING}>{term}</h2>
      </header>

      <p className="max-w-[68ch] font-sans text-lg font-semibold leading-snug text-sand-100">{summary}</p>

      <div className={MD_CLASSES}>
        <Markdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
          {explanation}
        </Markdown>
      </div>

      <Section title="Why it matters">
        <p className={PROSE}>{whyItMatters}</p>
      </Section>

      {example?.kind === "code" && <CodeBlock language={example.language} code={example.code} caption={example.caption} />}
      {example?.kind === "before-after" && (
        <figure className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-sand-500/30 bg-obsidian p-4">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-sand-400">Before</p>
              <p className="whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-sand-300 [overflow-wrap:anywhere]">{example.before}</p>
            </div>
            <div className="min-w-0 rounded-xl border border-cyan-500/50 bg-obsidian p-4">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400">After</p>
              <p className="whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-sand-100 [overflow-wrap:anywhere]">{example.after}</p>
            </div>
          </div>
          <figcaption className="max-w-[68ch] font-sans text-sm leading-relaxed text-sand-400">{example.note}</figcaption>
        </figure>
      )}

      <Section title="Pitfall" tone="warn">
        <p className={PROSE}>{pitfall}</p>
      </Section>

      {sources.length > 0 && (
        <Section title="Sources">
          <ul className="space-y-2 font-sans text-sm leading-relaxed">
            {sources.map((s) => (
              <li key={s.url}>
                <SourceLink source={s} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
