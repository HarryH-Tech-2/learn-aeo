import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy - Learn AEO",
  description: "Privacy policy for Learn AEO. How we collect, use, and protect your data.",
  alternates: {
    canonical: absoluteUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
