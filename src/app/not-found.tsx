import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";

// Its own title, kept out of the index, and no share card inherited from the home page.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
  openGraph: null,
};

export default function NotFound() {
  return (
    <main className="grain-overlay">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="font-display text-7xl block mb-6 text-cyan-500/70" aria-hidden="true">
            404
          </p>
          <h1 className="font-display text-4xl font-light text-sand-100 mb-4">
            No answer <span className="text-gradient-gold font-medium">here</span>
          </h1>
          <p className="font-body text-lg text-sand-400 font-light mb-8">
            This page doesn&apos;t exist, or it has moved. Try the homepage, or start with lesson 1.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-primary justify-center text-sm py-3 px-8"
            >
              Return Home
            </Link>
            <Link
              href={FIRST_LESSON_PATH}
              className="font-body text-sm text-sand-400 hover:text-gold-400 transition-colors"
            >
              Go to lesson 1
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
