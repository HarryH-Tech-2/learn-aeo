/**
 * Server-rendered markdown for a blog post. No "use client": react-markdown
 * and remark-gfm run at build time and never reach the browser bundle
 * (they were most of the 280 KB the post pages shipped). The rendered tree
 * is passed to the client component as props.
 */
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isInternalHref, slugifyHeading, textFromChildren, toInternalPath } from "../blog-text";

export function QuickAnswer({ md }: { md: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <>{children}</>,
        em: ({ children }) => <em className="italic">{children}</em>,
        strong: ({ children }) => <strong className="text-sand-100 font-medium">{children}</strong>,
      }}
    >
      {md}
    </ReactMarkdown>
  );
}

export function ArticleBody({ md }: { md: string }) {
  // Ids match extractH2s (same slugify, same "-2", "-3" rule for repeats) so the
  // table of contents anchors line up.
  const counts = new Map<string, number>();
  const h2Id = (text: string) => {
    const base = slugifyHeading(text) || "section";
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    return n > 0 ? `${base}-${n + 1}` : base;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => {
          const id = h2Id(textFromChildren(children).trim());
          return (
            <h2 id={id} className="font-display text-2xl md:text-3xl font-semibold text-sand-100 mt-12 mb-4 scroll-mt-28">
              {children}
            </h2>
          );
        },
        h3: ({ children }) => <h3 className="font-display text-xl md:text-2xl font-semibold text-sand-200 mt-8 mb-3">{children}</h3>,
        p: ({ children }) => <p className="font-body text-lg text-sand-400 font-light leading-relaxed mb-5">{children}</p>,
        strong: ({ children }) => <span className="text-sand-300">{children}</span>,
        em: ({ children }) => <em className="text-gold-400/80">{children}</em>,
        ul: ({ children }) => <ul className="space-y-2 mb-6 ml-4">{children}</ul>,
        ol: ({ children }) => <ol className="space-y-2 mb-6 ml-4 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => (
          <li className="font-body text-lg text-sand-400 font-light leading-relaxed flex gap-2">
            <span className="text-gold-500 mt-1.5 flex-shrink-0">&#x2022;</span>
            <span>{children}</span>
          </li>
        ),
        blockquote: ({ children }) => <blockquote className="border-l-2 border-gold-500/40 pl-6 my-6 italic">{children}</blockquote>,
        table: ({ children }) => (
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse font-body text-base">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b border-gold-700/30">{children}</thead>,
        th: ({ children }) => <th className="text-left p-3 text-gold-400 font-medium text-xs tracking-[0.1em] uppercase">{children}</th>,
        td: ({ children }) => <td className="p-3 text-sand-400 border-b border-gold-700/10">{children}</td>,
        hr: () => <hr className="border-gold-700/20 my-8" />,
        // Inline article images: `![alt](/blog/...)` — all inline images are 16:9.
        img: ({ src, alt }) => (
          <span className="block relative my-8">
            <span className="absolute -inset-px bg-gradient-to-b from-gold-500/15 via-transparent to-gold-500/15 blur-sm" />
            <span className="block relative border border-gold-700/30 overflow-hidden">
              <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} width={1280} height={720} loading="lazy" decoding="async" className="w-full h-auto" />
            </span>
          </span>
        ),
        // Internal links stay in-tab via next/link so they prefetch and pass PageRank
        // naturally; external links open in a new tab with noopener only (no nofollow,
        // no noreferrer — museums and Wikipedia should see the link and the referrer).
        a: ({ href, children }) => {
          const linkClass = "text-gold-400 hover:text-gold-300 underline underline-offset-2 transition-colors";
          if (isInternalHref(href)) {
            return (
              <Link href={toInternalPath(href!)} className={linkClass}>
                {children}
              </Link>
            );
          }
          return (
            <a href={href} target="_blank" rel="noopener" className={linkClass}>
              {children}
            </a>
          );
        },
      }}
    >
      {md}
    </ReactMarkdown>
  );
}
