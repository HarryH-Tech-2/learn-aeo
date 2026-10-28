import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: `About ${SITE.name} | How the course works`,
  description:
    "What Learn AEO is: an answer engine optimization course for marketers who know SEO, and how its lessons are sourced.",
  alternates: {
    canonical: absoluteUrl("/about"),
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutContent />
    </>
  );
}
