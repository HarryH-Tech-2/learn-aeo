import type { DissectExample } from "@/lib/lesson-types";
import CodeBlock from "./CodeBlock";
import { SourceLink } from "./ConceptCard";
import { EYEBROW, HEADING, PROSE } from "./ui";

/** A real-world example, taken apart point by point. */
export default function ExampleDissect({ example }: { example: DissectExample }) {
  const { title, context, excerpt, points, source } = example;
  return (
    <article className="space-y-7">
      <header className="space-y-2">
        <p className={EYEBROW}>Real-world example</p>
        <h2 className={HEADING}>{title}</h2>
      </header>

      <p className={PROSE}>{context}</p>

      {excerpt.kind === "code" ? (
        <CodeBlock language={excerpt.language} code={excerpt.code} caption={excerpt.caption} />
      ) : (
        <blockquote className="max-w-[68ch] border-l-2 border-cyan-500 py-1 pl-5 font-display text-xl leading-relaxed text-sand-100 sm:text-2xl">
          “{excerpt.text}”
        </blockquote>
      )}

      <section className="max-w-[68ch]">
        <h3 className="mb-3 font-sans text-sm font-semibold text-sand-100">What to notice</h3>
        <ol className="space-y-4">
          {points.map((p, i) => (
            <li key={p.label} className="flex gap-4">
              <span
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-500/60 font-sans text-sm font-semibold text-cyan-400"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-sans text-base font-semibold text-sand-100">{p.label}</p>
                <p className={PROSE}>{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="max-w-[68ch] font-sans text-sm leading-relaxed">
        <span className="text-sand-400">Source: </span>
        <SourceLink source={source} />
      </p>
    </article>
  );
}
