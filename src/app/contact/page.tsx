import type { Metadata } from "next";
import ContactContent from "./ContactContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with Learn AEO about the answer engine optimization course: lessons, sources, billing or ideas for what to cover next.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactContent />;
}
