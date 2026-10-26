import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // The 3D models, the hieroglyph font and the recorded voice lines are what the lesson pages wait for.
  // By default files in public/ are revalidated on every visit; these rarely change, so keep them for
  // a week and refresh them in the background after that.
  async headers() {
    return [
      {
        source: "/:dir(models|fonts|dev-audio)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default nextConfig;
