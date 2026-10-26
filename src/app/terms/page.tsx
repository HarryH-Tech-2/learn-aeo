import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service - Learn Hieroglyphics",
  description: "Terms of service for Learn Hieroglyphics. Rules and conditions for using our platform.",
  alternates: {
    canonical: "https://www.learnhieroglyphics.com/terms",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
