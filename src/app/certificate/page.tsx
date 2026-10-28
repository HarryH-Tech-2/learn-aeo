import type { Metadata } from "next";
import CertificateContent from "./CertificateContent";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Certificate");

export default function CertificatePage() {
  return <CertificateContent />;
}
