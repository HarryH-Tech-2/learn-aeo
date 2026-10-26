import type { NextConfig } from "next";

const FONT_FILES = ["./src/app/cartouche-image/*.ttf", "./public/cartouche-print/*.jpg"];
const KEYBOARD_FILES = ["./src/app/cartouche-image/*.ttf", "./public/keyboard-styles/*.jpg"];

const nextConfig: NextConfig = {
  // The Cartouche Print PDF and images embed the hieroglyph and Cinzel fonts and the page-one artwork from disk;
  // list them so the serverless bundles for these routes carry the files.
  outputFileTracingIncludes: {
    "/api/cartouche-print/download": FONT_FILES,
    // Prodigi's artwork fetch: the posters (A3–A1) print from the upscaled scenes
    "/api/cartouche-print/asset": [...FONT_FILES, "./public/cartouche-print/large/*.jpg"],
    "/api/cartouche-print/image": FONT_FILES,
    "/api/class-set/download": FONT_FILES,
    "/api/webhooks/stripe": [...FONT_FILES, ...KEYBOARD_FILES],
    "/keyboard-image": KEYBOARD_FILES,
    "/api/keyboard-image/hd": KEYBOARD_FILES,
    "/api/keyboard-image/email": KEYBOARD_FILES,
    "/cartouche-image/print": FONT_FILES,
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // Short addresses printed on paper. /name is on every pupil page of the classroom worksheet
  // (src/app/teachers/worksheet), so a visit to it is a printed sheet that reached a child or a parent.
  async redirects() {
    return [
      // the 3D homepage (an A/B variant, removed 2026-10-26) had an address of its own
      { source: "/home-3d", destination: "/", permanent: true },
      {
        source: "/name",
        destination: "/translate-name-to-hieroglyphics?utm_source=worksheet&utm_medium=print&utm_campaign=name",
        permanent: false,
      },
      // the short address the class strip shows pupils, to pass on to their teacher (src/components/ClassVisitStrip.tsx):
      // the class quiz page, whose locked screen leads with the free 7-day trial
      {
        source: "/teacher",
        destination: "/teachers/class?utm_source=class-strip&utm_medium=pupil&utm_campaign=teacher",
        permanent: false,
      },
      // the scripts post's earlier slugs still get impressions in Search Console
      { source: "/blog/hieroglyphs-vs-hieratic-demotic", destination: "/blog/hieroglyphs-vs-hieratic-vs-demotic", permanent: true },
      { source: "/blog/hieroglyphs-vs-hieratic-demotic-egypts-three-scripts", destination: "/blog/hieroglyphs-vs-hieratic-vs-demotic", permanent: true },
    ];
  },
  // The 3D models, the hieroglyph font and the recorded voice lines are what the game pages wait for.
  // By default files in public/ are revalidated on every visit; these rarely change, so keep them for
  // a week and refresh them in the background after that.
  async headers() {
    return [
      {
        source: "/:dir(models|fonts|dev-audio)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
      {
        // The guest-play card's game clip and its poster (GuestPlayBanner).
        source: "/:file(causeway-loop.v4.mp4|causeway-loop-poster.v4.webp)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default nextConfig;
