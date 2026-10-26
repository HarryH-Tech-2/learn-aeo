import Link from "next/link";
import { SITE } from "@/lib/site";

// Footer links: only pages that exist on the Learn AEO site.
const LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

export default function Footer() {
  return (
    // Always dark, in both themes (hero-media pins the dark tokens).
    <footer className="footer-egypt hero-media relative">
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <svg aria-hidden="true" viewBox="0 0 64 64" className="w-9 h-9">
              <rect width="64" height="64" rx="14" fill="#04060d" />
              <rect x="7" y="21" width="50" height="22" rx="11" fill="none" stroke="#6fe3ff" strokeWidth="3.5" />
              <rect x="30.25" y="14" width="3.5" height="36" rx="1.75" fill="#ffc76b" />
            </svg>
            <span className="font-display text-2xl text-sand-100">{SITE.name}</span>
          </Link>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-body text-base text-sand-300 hover:text-gold-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="font-body text-sm text-sand-400 mt-10">
          &copy; {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
