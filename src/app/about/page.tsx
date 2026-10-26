import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: `About ${SITE.name} | Our Mission & Methodology`,
  description:
    "Learn about our mission to make ancient Egyptian hieroglyphics accessible to everyone through structured online lessons.",
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
