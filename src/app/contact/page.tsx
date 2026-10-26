import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact the Learn AEO Team",
  description:
    "Get in touch with the Learn AEO team. We'd love to hear from you about our ancient Egyptian writing course.",
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
