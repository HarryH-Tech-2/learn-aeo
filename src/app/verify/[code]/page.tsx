import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";
import { displayName, formatIssued, isCertificateCode } from "@/lib/certificate-issue";

// Public proof that a certificate is real: the link printed on every certificate and shared
// on LinkedIn. It shows only first name and last initial, and is kept out of search.
export const metadata: Metadata = {
  title: `Certificate verification | ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isCertificateCode(code)) notFound();

  const cert = await prisma.certificate.findUnique({
    where: { code },
    select: { code: true, name: true, issuedAt: true },
  });
  if (!cert) notFound();

  return (
    <main className="grain-overlay min-h-screen flex items-center justify-center px-4 py-20 bg-obsidian">
      <div className="w-full max-w-lg border border-gold-700/30 bg-obsidian-light px-6 py-10 sm:px-10 text-center">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-cyan-400 mb-4">
          <span aria-hidden="true">✓ </span>Verified
        </p>
        <h1 className="font-display text-4xl font-light text-sand-100 mb-3">{displayName(cert.name)}</h1>
        <p className="font-body text-sand-400 mb-1">has completed the course</p>
        <p className="font-display text-2xl text-sand-100 mb-6">
          Answer Engine Optimization <span className="text-gold">— {SITE.name}</span>
        </p>
        <p className="font-body text-sm text-sand-400 mb-1">Issued {formatIssued(cert.issuedAt)}</p>
        <p className="font-body text-xs text-sand-500 mb-8">Certificate {cert.code}</p>
        <Link href="/" className="btn-primary justify-center text-sm py-3 px-8">
          About {SITE.name}
        </Link>
      </div>
    </main>
  );
}
