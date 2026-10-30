import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name}: answer engine optimization course for marketers`,
  absoluteTitle: true,
  description:
    "An answer engine optimization course for marketers who know SEO: how ChatGPT, Perplexity and Google AI Overviews pick their sources. Lesson 1 is free.",
  path: "/",
});

export default function Home() {
  return <HomePage />;
}
