import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Learn AEO",
  description:
    "Get in touch with Learn AEO about the answer engine optimization course: lessons, sources, billing or ideas for what to cover next.",
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
