import type { Metadata } from "next";
import AboutContent from "./AboutContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About the course",
  description:
    "What Learn AEO is: an answer engine optimization course for marketers who know SEO, and how its lessons are sourced.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <AboutContent />
    </>
  );
}
