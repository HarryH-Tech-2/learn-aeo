import type { Metadata } from "next";
import TermsContent from "./TermsContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of service",
  description:
    "Terms of service for Learn AEO: the rules for using the course, buying lifetime or monthly access, and asking for a refund.",
  path: "/terms",
});

export default function TermsPage() {
  return <TermsContent />;
}
