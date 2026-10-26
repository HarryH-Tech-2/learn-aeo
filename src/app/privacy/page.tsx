import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy - Learn Hieroglyphics",
  description: "Privacy policy for Learn Hieroglyphics. How we collect, use, and protect your data.",
  alternates: {
    canonical: "https://www.learnhieroglyphics.com/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
