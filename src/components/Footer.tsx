import Link from "next/link";
import { SITE } from "@/lib/site";
import BrandMark from "@/components/BrandMark";
import FooterNewsletter from "@/components/FooterNewsletter";

// Footer links: only pages that exist on the Learn AEO site.
const GROUPS = [
  {
    title: "Course",
    links: [
      { href: "/#curriculum", label: "Lessons" },
      { href: "/pricing", label: "Pricing" },
      { href: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/glossary", label: "Glossary" },
      { href: "/tools", label: "Free tools" },
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandMark className="w-10 h-10" />
              <span className="font-display text-3xl text-sand-100">{SITE.name}</span>
            </Link>
            <p className="font-body text-base text-sand-300 mt-4 max-w-sm leading-relaxed">
              Learn how ChatGPT, Perplexity and Google AI Overviews pick their sources, and how to become one.
            </p>
            <div className="mt-8">
              <FooterNewsletter />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {GROUPS.map((g) => (
              <div key={g.title}>
                <h2 className="font-display text-base text-sand-100 mb-4">{g.title}</h2>
                <ul className="space-y-3">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="font-body text-base text-sand-300 hover:text-gold-300 transition-colors"
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

        <div className="mt-16 md:mt-20 pb-40 md:pb-56 flex flex-wrap items-center justify-between gap-4 border-t border-gold-500/15 pt-6">
          <p className="font-body text-sm text-sand-400">
            &copy; {new Date().getFullYear()} {SITE.name}
          </p>
          <a href="#top" className="font-body text-sm text-sand-300 hover:text-gold-300 transition-colors">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
