import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "Privacy policy for Learn AEO: what data we collect when you use the course, how we use it, and how we protect it.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyContent />;
}
