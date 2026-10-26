import type { Metadata } from "next";
import CertificateContent from "./CertificateContent";

export const metadata: Metadata = {
  title: "Certificate - Learn Hieroglyphics",
  description: "Your Learn Hieroglyphics course completion certificate.",
};

export default function CertificatePage() {
  return <CertificateContent />;
}
