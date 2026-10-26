import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="grain-overlay">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-6">
          <span
            className="text-7xl block mb-6 text-gold-500/60"
            style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" }}
          >
            &#x13080;
          </span>
          <h1 className="font-display text-4xl font-light text-sand-100 mb-4">
            Lost in the <span className="text-gradient-gold font-medium">Sands</span>
          </h1>
          <p className="font-body text-lg text-sand-400 font-light mb-8">
            The page you&apos;re looking for has been lost to the sands of time.
            It may have been moved or never existed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-primary justify-center text-sm py-3 px-8"
            >
              Return Home
            </Link>
            <Link
              href="/blog"
              className="font-body text-sm text-sand-400 hover:text-gold-400 transition-colors"
            >
              Browse the Blog
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
