import Link from "next/link";

export default function Footer() {
  return (
    // Always dark, in both themes (hero-media pins the dark tokens).
    <footer className="footer-egypt hero-media relative">
      {/* Decorative hieroglyph ticker tape */}
      <div className="w-full overflow-hidden py-6 bg-obsidian-lighter/50">
        <div
          className="flex gap-8 text-3xl text-gold-500/60 animate-ticker whitespace-nowrap"
          style={{ width: "max-content" }}
        >
          {[0, 1].map((set) => (
            <div key={set} className="flex gap-8">
              {[..."𓀀𓁀𓂀𓃀𓄿𓅓𓆣𓇳𓉐𓋴𓌳𓎛𓏏𓐍𓀀𓁀𓂀𓃀𓄿𓅓𓆣𓇳𓉐𓋴𓌳𓎛𓏏𓐍𓀀𓁀𓂀𓃀𓄿𓅓𓆣𓇳𓉐𓋴𓌳𓎛𓏏𓐍"].map((g, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <span className="text-4xl text-sand-100">𓂀</span>
              <span className="font-display text-2xl font-semibold text-gold-400">
                Learn AEO
              </span>
            </Link>
            <p className="font-body text-base text-sand-400 leading-relaxed max-w-sm font-light">
              Dedicated to preserving and teaching the ancient art of
              hieroglyphic writing. Our mission is to make the language of the
              pharaohs accessible to modern scholars and enthusiasts alike.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-sm tracking-[0.2em] uppercase text-gold-400 mb-5">
              Learn
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/#lessons"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Curriculum
                </Link>
              </li>
              <li>
                <Link
                  href="/lessons/expedition-begins"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Free Lesson
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm tracking-[0.2em] uppercase text-gold-400 mb-5">
              Blog
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/blog/should-i-learn-hieroglyphics"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Should I Learn Hieroglyphics?
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/5-hieroglyphs-you-already-know"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  5 Hieroglyphs You Already Know
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/reading-your-first-cartouche"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Reading Your First Cartouche
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  All Articles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm tracking-[0.2em] uppercase text-gold-400 mb-5">
              Company
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/about"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
