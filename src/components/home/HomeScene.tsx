import InView from "@/components/InView";
import type { CSSProperties } from "react";

/** One step of an agent's trace: what it did, and what came of it. */
export type TraceStep = readonly [action: string, result: string];

/**
 * A stretch of the homepage with an AI agent's trace down both sides: crawling, retrieving, ranking and citing,
 * the work the course teaches you to be on the right end of. Each rail sticks while its sections scroll past;
 * its steps type in when it comes into view and the last one stays lit (.agent-trace, globals.css). Decorative:
 * hidden from assistive tech, and only on screens wide enough to have room beside the content.
 */
export default function HomeScene({
  left,
  right,
  children,
}: {
  left: readonly TraceStep[];
  right: readonly TraceStep[];
  children: React.ReactNode;
}) {
  return (
    <div className="home-scene">
      <Rail steps={left} side="left" />
      <Rail steps={right} side="right" />
      {children}
    </div>
  );
}

function Rail({ steps, side }: { steps: readonly TraceStep[]; side: "left" | "right" }) {
  return (
    <div className="agent-trace" data-side={side} aria-hidden="true">
      <InView className="agent-trace-block" margin="-25% 0px">
        {steps.map(([action, result], i) => (
          <p
            key={i}
            className="agent-trace-step"
            data-current={i === steps.length - 1 || undefined}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="agent-trace-action">{action}</span>
            <span className="agent-trace-result">{result}</span>
          </p>
        ))}
      </InView>
    </div>
  );
}
