import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";
import type { Concept, Source } from "@/lib/lesson-types";
import CodeBlock from "./CodeBlock";
import BeforeAfterPredict from "./BeforeAfterPredict";
import { FanOutExplorer, GateSimulator, Walkthrough } from "./InteractiveExamples";
import ConfidenceCheck from "./ConfidenceCheck";
import ConceptQuiz from "./ConceptQuiz";
import type { Confidence } from "@/lib/concept-confidence";
import { conceptBeats, type Beat } from "@/lib/concept-beats";
import { BeatDots, BeatReveal, PitfallReveal } from "./BeatParts";
import { EYEBROW, FOCUS, HEADING, PROSE, formatSourceDate } from "./ui";

const MD_CLASSES =
  `${PROSE} space-y-4 [&_strong]:font-semibold [&_strong]:text-sand-100 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 ` +
  "[&_code]:rounded [&_code]:bg-obsidian-lighter [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.88em] [&_code]:text-sand-100 [&_code]:break-words";

const MD_COMPONENTS: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener" className={`text-cyan-400 underline underline-offset-4 ${FOCUS}`}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ),
};

/** A source as a link (new tab) with its publisher and date: "Published …" or "Updated …" as the page labels it, else the day it was checked. */
export function SourceLink({ source }: { source: Source }) {
  const date =
    source.date !== undefined
      ? `${source.dateKind === "updated" ? "Updated" : "Published"} ${formatSourceDate(source.date)}`
      : `Checked ${formatSourceDate(source.accessed)}`;
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
        · {source.publisher} · {date}
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

type Props = {
  concept: Concept;
  eyebrow?: string;
  /** The learner's own "got it / not sure" rating; the check shows only when onConfidence is given. */
  confidence?: Confidence;
  onConfidence?: (c: Confidence) => void;
  /**
   * How many beats (src/lib/concept-beats.ts) to show so far. Leave it out to show the whole card at once, with
   * the pitfall already open: a card the learner has come back to, and any render outside the player.
   */
  shown?: number;
  /** Shown beside the progress dots while beats are still hidden. */
  onShowAll?: () => void;
};

export default function ConceptCard({ concept, eyebrow, confidence, onConfidence, shown, onShowAll }: Props) {
  const { id, term, summary, whyItMatters, example, pitfall, sources, quiz } = concept;
  const beats = conceptBeats(concept);
  const stepped = shown !== undefined;
  const count = stepped ? Math.max(1, Math.min(shown, beats.length)) : beats.length;

  const markdown = (text: string) => (
    <div className={MD_CLASSES}>
      <Markdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {text}
      </Markdown>
    </div>
  );

  function renderBeat(beat: Beat): ReactNode {
    switch (beat.kind) {
      case "idea":
        return (
          <div className="space-y-7">
            <p className="key-idea max-w-[68ch] font-sans text-lg font-semibold leading-snug text-sand-100">
              <span className="key-idea-label">Key idea</span>
              {summary}
            </p>
            {markdown(beat.markdown)}
          </div>
        );
      case "explain":
        return markdown(beat.markdown);
      case "quiz":
        return quiz ? <ConceptQuiz key={quiz.id} question={quiz} conceptId={id} /> : null;
      case "why":
        return (
          <Section title="Why it matters">
            <p className={PROSE}>{whyItMatters}</p>
          </Section>
        );
      case "example":
        if (example?.kind === "code") return <CodeBlock language={example.language} code={example.code} caption={example.caption} />;
        if (example?.kind === "before-after") return <BeforeAfterPredict example={example} conceptId={id} />;
        if (example?.kind === "walkthrough") return <Walkthrough example={example} conceptId={id} />;
        if (example?.kind === "gates") return <GateSimulator example={example} conceptId={id} />;
        if (example?.kind === "fanout") return <FanOutExplorer example={example} conceptId={id} />;
        return null;
      case "pitfall":
        return <PitfallReveal text={pitfall} startOpen={!stepped} />;
      case "wrap":
        return (
          <div className="space-y-7">
            {onConfidence && <ConfidenceCheck value={confidence} onChange={onConfidence} />}
            {sources.length > 0 && (
              <Section title="Sources">
                <ul className="space-y-2 font-sans text-sm leading-relaxed">
                  {sources.map((s, i) => (
                    <li key={`${i}:${s.url}`}>
                      <SourceLink source={s} />
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        );
    }
  }

  return (
    <article className="space-y-7">
      <header className="space-y-2">
        {eyebrow && <p className={EYEBROW}>{eyebrow}</p>}
        <h2 className={HEADING}>{term}</h2>
        {stepped && beats.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            <BeatDots shown={count} total={beats.length} />
            {count < beats.length && onShowAll && (
              <button type="button" onClick={onShowAll} className={`font-sans text-sm text-sand-400 underline underline-offset-4 hover:text-cyan-400 ${FOCUS}`}>
                Show the whole card
              </button>
            )}
          </div>
        )}
      </header>

      {beats.slice(0, count).map((beat, i) => (
        <BeatReveal key={i} fresh={stepped && i > 0 && i === count - 1}>
          {renderBeat(beat)}
        </BeatReveal>
      ))}
    </article>
  );
}
