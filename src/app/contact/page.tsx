import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact the Learn Hieroglyphics Team",
  description:
    "Get in touch with the Learn Hieroglyphics team. We'd love to hear from you about our ancient Egyptian writing course.",
  alternates: {
    canonical: "https://www.learnhieroglyphics.com/contact",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
