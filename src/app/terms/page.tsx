import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service - Learn AEO",
  description: "Terms of service for Learn AEO. Rules and conditions for using our platform.",
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
