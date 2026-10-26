import Link from "next/link";

export default function Footer() {
  return (
    // Always dark, in both themes (hero-media pins the dark tokens). Its background is the engraving's sky colour, so
    // the Nile scene along the bottom (public/footer-egypt-*.webp, Nano Banana Pro via scripts/dev/nanobanana.mjs)
    // has no seam; the links sit over the picture's empty sky.
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
                Learn Hieroglyphics
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
                  href="/dig"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  The Dig
                </Link>
              </li>
              <li>
                <Link
                  href="/hieroglyphics-keyboard"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Hieroglyphics Keyboard
                </Link>
              </li>
              <li>
                <Link
                  href="/egyptian-numerals-converter"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Egyptian Numerals Converter
                </Link>
              </li>
              <li>
                <Link
                  href="/write-your-name-in-cuneiform"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Your Name in Cuneiform
                </Link>
              </li>
              <li>
                <Link
                  href="/pet-name-in-hieroglyphics"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Pet Names
                </Link>
              </li>
              <li>
                <Link
                  href="/couple-names-in-hieroglyphics"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Couple Names
                </Link>
              </li>
              <li>
                <Link
                  href="/hieroglyphics-tattoo"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Tattoo Stencil
                </Link>
              </li>
              <li>
                <Link
                  href="/gift"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Gift the Course
                </Link>
              </li>
              <li>
                <Link
                  href="/daily"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Cartouche of the Day
                </Link>
              </li>
              <li>
                <Link
                  href="/teachers"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  For Teachers
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
                  href="/teachers/privacy"
                  className="font-body text-base text-sand-400 hover:text-gold-400 transition-colors"
                >
                  Privacy for Schools
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

      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebPs, nothing for next/image to add */}
      <img
        src="/footer-egypt-1600.webp"
        srcSet="/footer-egypt-900.webp 900w, /footer-egypt-1600.webp 1600w, /footer-egypt-2400.webp 2400w"
        sizes="100vw"
        width={2400}
        height={1018}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="footer-egypt-scene"
      />
    </footer>
  );
}
