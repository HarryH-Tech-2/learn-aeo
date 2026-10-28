import Link from "next/link";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
import { TOOLS, toolPath, type ToolMeta } from "@/lib/tools";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const live = tool.status === "live";
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-2xl text-sand-100">{tool.name}</h3>
        {!live && (
          <span className="shrink-0 font-body text-[11px] tracking-[0.15em] uppercase text-sand-500 border border-sand-500/30 rounded-full px-2.5 py-1">
            Coming soon
          </span>
        )}
      </div>
      <p className="font-body text-sm text-sand-400 leading-relaxed">{tool.summary}</p>
      {live && <p className="mt-4 font-body text-sm font-semibold text-gold-400">Open the tool &rarr;</p>}
    </>
  );
  return live ? (
    <Link href={toolPath(tool.slug)} className="card-ancient block p-6 hover:border-gold-500/40">
      {inner}
    </Link>
  ) : (
    <div className="card-ancient p-6 opacity-80">{inner}</div>
  );
}

/** The homepage's free tools: a card per tool in the TOOLS catalog; live tools link to their page. */
export default function ToolsSection() {
  return (
    <section id="tools" className="relative py-20">
      <InView className="max-w-5xl mx-auto px-6 lg:px-8" margin="-100px">
        <div className="text-center mb-12">
          <div className="reveal inline-flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold-700" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">Free tools</span>
            <span className="h-px w-12 bg-gold-700" />
          </div>
          <h2
            className="reveal font-display text-4xl md:text-5xl font-light text-sand-100 mb-4"
            style={reveal(0.1, { y: 30 })}
          >
            Check your own site <span className="text-gradient-gold font-medium">for free</span>
          </h2>
          <p className="reveal font-body text-sand-400 max-w-2xl mx-auto" style={reveal(0.15)}>
            Small tools for the jobs the course teaches. No sign-in needed.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool, i) => (
            <div key={tool.slug} className="reveal" style={reveal(0.2 + i * 0.05, { dur: 0.5 })}>
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      </InView>
    </section>
  );
}
