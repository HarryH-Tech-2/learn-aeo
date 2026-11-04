import Link from "next/link";
import { SITE } from "@/lib/site";
import BrandMark from "@/components/BrandMark";
import FooterNewsletter from "@/components/FooterNewsletter";
import { TOOLS, toolPath } from "@/lib/tools";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

// Footer links: only pages that exist on the Learn AEO site. Tools come from the catalog, so a tool shows up here
// the day it goes live.
const GROUPS = [
  {
    title: "Course",
    links: [
      { href: "/course", label: "The course" },
      { href: FIRST_LESSON_PATH, label: "Free lesson" },
      { href: "/pricing", label: "Pricing" },
      { href: "/get-started", label: "Get started" },
      { href: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "Free tools",
    links: [
      { href: "/tools", label: "All tools" },
      ...TOOLS.filter((t) => t.status === "live").map((t) => ({ href: toolPath(t.slug), label: t.name })),
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/glossary", label: "AEO glossary" },
      { href: "/blog/what-is-aeo", label: "What is AEO?" },
      { href: "/blog/aeo-vs-seo-vs-geo", label: "AEO vs SEO vs GEO" },
      { href: "/blog/get-cited-in-google-ai-overviews", label: "Get cited in AI Overviews" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    // Always dark, in both themes (hero-media pins the dark tokens). The hero's skyline rises out of its foot
    // (.site-footer-city), so the page ends in the same city it opens on.
    <footer className="site-footer hero-media relative overflow-hidden">
      <div aria-hidden="true" className="site-footer-city" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-12 md:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandMark className="w-10 h-10" />
              <span className="font-display text-3xl text-sand-100">{SITE.name}</span>
            </Link>
            <p className="font-body text-lg text-sand-300 mt-3 max-w-sm leading-relaxed">
              Learn how ChatGPT, Perplexity and Google AI Overviews pick their sources, and how to become one.
            </p>
            <div className="mt-6">
              <FooterNewsletter />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
            {GROUPS.map((g) => (
              <div key={g.title}>
                <h2 className="font-display text-lg font-bold text-sand-100 mb-3">{g.title}</h2>
                <ul className="space-y-2">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="font-body text-[1.05rem] text-sand-300 hover:text-gold-300 transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 md:mt-12 pb-20 md:pb-28 flex flex-wrap items-center justify-between gap-4 border-t border-gold-500/15 pt-6">
          <p className="font-body text-base text-sand-400">
            &copy; {new Date().getFullYear()} {SITE.name}
          </p>
          <a href="#top" className="font-body text-base text-sand-300 hover:text-gold-300 transition-colors">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
