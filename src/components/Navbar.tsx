"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { SITE } from "@/lib/site";
import { useAuthModal } from "@/components/AuthModal";

export default function Navbar() {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      // enter-down: CSS slide-in on load (was a framer-motion animate)
      className={`enter-down lg:fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? "bg-obsidian/95 backdrop-blur-xl shadow-lg shadow-black/20"
          : // Transparent over the homepage's dark media hero: pin the dark-theme
            // tokens so the links stay light even in light mode. Only where the bar
            // floats over the hero (lg:fixed): on a phone it stands above it, on the
            // page's own background, where light-on-cream could not be read.
            // The scrim is a soft dark band behind the bar, so the links read over the brightest frames of the video.
            `bg-transparent${isHome ? " lg:hero-media lg:nav-scrim" : ""}`
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-4 xl:px-8 2xl:px-16">
        <div className="flex items-center justify-between h-20 md:h-18 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group min-w-0 shrink-0">
            {/* The favicon motif: a search bar split by a gold seam */}
            <svg aria-hidden="true" viewBox="0 0 64 64" className="w-8 h-8 md:w-9 md:h-9 transition-transform duration-300 group-hover:scale-110">
              <rect width="64" height="64" rx="14" fill="#04060d" />
              <rect x="7" y="21" width="50" height="22" rx="11" fill="none" stroke="#6fe3ff" strokeWidth="3.5" />
              <rect x="30.25" y="14" width="3.5" height="36" rx="1.75" fill="#ffc76b" />
            </svg>
            <span className="font-display text-2xl md:text-3xl lg:text-2xl xl:text-3xl tracking-wide text-sand-100 group-hover:text-cyan-400 transition-colors truncate">
              {SITE.name}
            </span>
          </Link>

          {/* Desktop Nav - Center */}
          {/* Centered between the logo and the right-hand controls (flex, not
              absolute, so it can never collide with either at narrow widths). */}
          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-4 2xl:gap-6 px-3 whitespace-nowrap">
            <NavLink href={isHome ? "#curriculum" : "/#curriculum"}>Course</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/blog">Blog</NavLink>
          </div>

          {/* Desktop Nav - Right */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
            {session ? (
              <>
                <Link href="/dashboard" className="nav-cta">
                  Dashboard
                </Link>
                <Link href="/account" className="nav-signin">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="3.6" />
                    <path d="M4.5 20c1.2-3.6 4.1-5.4 7.5-5.4s6.3 1.8 7.5 5.4" />
                  </svg>
                  Account
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="nav-link font-body text-sm 2xl:text-base text-sand-200 hover:text-gold-400 transition-colors">
                  Sign Out
                </button>
                <ThemeToggle />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal({ mode: "signin" })}
                  className="nav-cta"
                >
                  Log in
                </button>
                <ThemeToggle />
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="text-sand-200 hover:text-gold-400 p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — always rendered; .accordion-panel (globals.css)
          animates it open/closed and hides it from focus/AT when closed. */}
      <div className="lg:hidden">
        <div
          id="mobile-menu"
          className="accordion-panel bg-obsidian"
          data-open={menuOpen ? "true" : "false"}
        >
          <div>
          <div className="border-t border-gold-700/20">
            <div className="px-6 py-6 flex flex-col">
              {/* User greeting when signed in */}
              {session && (
                <div className="pb-5 mb-3 border-b border-gold-700/15">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-1">
                    Signed in as
                  </p>
                  <p className="font-body text-sm text-sand-200 truncate">
                    {session.user?.email}
                  </p>
                </div>
              )}

              {session ? (
                <>
                  {/* Primary: Dashboard + Account */}
                  <div className="flex flex-col">
                    <Link
                      href="/dashboard"
                      className="btn-primary w-full justify-center text-sm py-3 mb-3"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <MobileLink
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                    >
                      Account
                    </MobileLink>
                    <MobileLink href="/#curriculum" onClick={() => setMenuOpen(false)}>
                      Course
                    </MobileLink>
                    <MobileLink href="/pricing" onClick={() => setMenuOpen(false)}>
                      Pricing
                    </MobileLink>
                    <MobileLink href="/blog" onClick={() => setMenuOpen(false)}>
                      Blog
                    </MobileLink>
                  </div>

                  {/* Sign Out at the bottom */}
                  <div className="pt-5 mt-3 border-t border-gold-700/15">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full text-left font-body text-sand-400 hover:text-terracotta text-base py-3 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Primary CTA first, then nav */}
                  <div className="flex flex-col">
                    <MobileLink href={isHome ? "#curriculum" : "/#curriculum"} onClick={() => setMenuOpen(false)}>
                      Course
                    </MobileLink>
                    <MobileLink href="/pricing" onClick={() => setMenuOpen(false)}>
                      Pricing
                    </MobileLink>
                    <MobileLink href="/blog" onClick={() => setMenuOpen(false)}>
                      Blog
                    </MobileLink>
                  </div>

                  {/* Account section */}
                  <div className="pt-5 mt-3 border-t border-gold-700/15">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        openAuthModal({ mode: "signin" });
                      }}
                      className="flex w-full items-center justify-between font-body text-sand-200 hover:text-gold-400 text-base py-3 transition-colors"
                    >
                      <span>Log in</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`nav-link relative font-body text-sm 2xl:text-base text-sand-200 hover:text-gold-400 transition-colors duration-300 tracking-wide after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-gold-500 after:transition-all after:duration-300 hover:after:w-full ${className}`}
    >
      {children}
    </a>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center justify-between font-body text-sand-200 hover:text-gold-400 text-base py-3 transition-colors border-b border-gold-700/10 last:border-b-0 group"
    >
      <span>{children}</span>
      <svg
        className="w-4 h-4 text-sand-500 group-hover:text-gold-500 group-hover:translate-x-0.5 transition-all"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}
