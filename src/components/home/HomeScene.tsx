import InView from "@/components/InView";
import type { CSSProperties } from "react";

/** One step of an agent's trace: what it did, and what came of it. */
export type TraceStep = readonly [action: string, result: string];

/**
 * What hangs down one side of a stretch of the homepage, each a glimpse of the machinery the course teaches:
 * - trace: an agent's log, one step per line, the last one lit
 * - search: a question in the search bar and the sub-queries it fans out into
 * - file: a short file (robots.txt, llms.txt, JSON-LD), one line lit
 * - bars: scored rows (passages, share of voice), one row lit
 * - gauge: a ring filled to value / total
 * - cite: an AI answer with its numbered sources, one of them yours
 */
export type SidePanel =
  | { kind: "trace"; steps: readonly TraceStep[] }
  | { kind: "search"; query: string; fanOut: readonly string[] }
  | { kind: "file"; name: string; lines: readonly string[]; lit: number }
  | { kind: "bars"; title: string; rows: readonly (readonly [label: string, score: number])[]; lit: number }
  | { kind: "gauge"; title: string; value: number; total: number; caption: string }
  | { kind: "cite"; question: string; sources: readonly string[]; lit: number };

/**
 * A stretch of the homepage with a panel down each side: an AI search tool's work (crawling, retrieving, ranking,
 * citing, measuring) shown a different way per section. Each panel sticks while its section scrolls past and
 * builds itself when it comes into view (.agent-trace and .side-*, globals.css). Decorative: hidden from
 * assistive tech, and only on screens wide enough to have room beside the content.
 */
export default function HomeScene({
  left,
  right,
  children,
}: {
  left: SidePanel;
  right: SidePanel;
  children: React.ReactNode;
}) {
  return (
    <div className="home-scene">
      <Side panel={left} side="left" />
      <Side panel={right} side="right" />
      {children}
    </div>
  );
}

const at = (i: number) => ({ "--i": i }) as CSSProperties;

function Side({ panel, side }: { panel: SidePanel; side: "left" | "right" }) {
  return (
    <div className="agent-trace" data-side={side} aria-hidden="true">
      {panel.kind === "trace" ? (
        <InView className="agent-trace-block" margin="-25% 0px">
          {panel.steps.map(([action, result], i) => (
            <p
              key={i}
              className="agent-trace-step"
              data-current={i === panel.steps.length - 1 || undefined}
              style={at(i)}
            >
              <span className="agent-trace-action">{action}</span>
              <span className="agent-trace-result">{result}</span>
            </p>
          ))}
        </InView>
      ) : (
        <InView className="side-block" margin="-25% 0px">
          <Panel panel={panel} />
        </InView>
      )}
    </div>
  );
}

function Panel({ panel }: { panel: Exclude<SidePanel, { kind: "trace" }> }) {
  switch (panel.kind) {
    case "search":
      return (
        <>
          <p className="side-search side-in" style={at(0)}>
            <svg viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            {panel.query}
          </p>
          <p className="side-label side-in" style={at(1)}>
            fans out to
          </p>
          <ul className="side-fan">
            {panel.fanOut.map((q, i) => (
              <li key={q} className="side-in" style={at(i + 2)}>
                {q}
              </li>
            ))}
          </ul>
        </>
      );
    case "file":
      return (
        <figure className="side-card side-in" style={at(0)}>
          <figcaption className="side-file-name">{panel.name}</figcaption>
          <pre className="side-file">
            {panel.lines.map((line, i) => (
              <span key={i} className="side-in" data-lit={i === panel.lit || undefined} style={at(i + 1)}>
                {line || " "}
              </span>
            ))}
          </pre>
        </figure>
      );
    case "bars":
      return (
        <>
          <p className="side-label side-in" style={at(0)}>
            {panel.title}
          </p>
          <ul className="side-bars">
            {panel.rows.map(([label, score], i) => (
              <li key={label} className="side-in" data-lit={i === panel.lit || undefined} style={at(i + 1)}>
                <span className="side-bar-label">
                  {label}
                  <b>{score.toFixed(2)}</b>
                </span>
                <span className="side-bar" style={{ "--w": score } as CSSProperties} />
              </li>
            ))}
          </ul>
        </>
      );
    case "gauge": {
      const r = 42;
      const c = 2 * Math.PI * r;
      return (
        <>
          <p className="side-label side-label-center side-in" style={at(0)}>
            {panel.title}
          </p>
          <div className="side-gauge side-in" style={at(1)}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} className="side-gauge-track" />
              <circle
                cx="50"
                cy="50"
                r={r}
                className="side-gauge-fill"
                strokeDasharray={c}
                style={{ "--off": c * (1 - panel.value / panel.total), "--len": c } as CSSProperties}
              />
            </svg>
            <span className="side-gauge-value">
              {panel.value}
              <small>/{panel.total}</small>
            </span>
          </div>
          <p className="side-caption side-in" style={at(2)}>
            {panel.caption}
          </p>
        </>
      );
    }
    case "cite":
      return (
        <div className="side-card side-in" style={at(0)}>
          <p className="side-cite-q">{panel.question}</p>
          <span className="side-cite-line side-in" style={at(1)} />
          <span className="side-cite-line side-in" style={at(2)} />
          <span className="side-cite-line side-cite-line-short side-in" style={at(3)} />
          <ol className="side-cite-sources">
            {panel.sources.map((s, i) => (
              <li key={s} className="side-in" data-lit={i === panel.lit || undefined} style={at(i + 4)}>
                <b>[{i + 1}]</b> {s}
              </li>
            ))}
          </ol>
        </div>
      );
  }
}
