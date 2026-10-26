import type { Metadata } from "next";
import CertificateContent from "./CertificateContent";

export const metadata: Metadata = {
  title: "Certificate - Learn AEO",
  description: "Your Learn AEO course completion certificate.",
};

export default function CertificatePage() {
  return <CertificateContent />;
}
