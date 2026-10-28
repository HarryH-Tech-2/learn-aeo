// Certificate issuing rules, shared by POST /api/certificate, the /verify/[code] page and
// the certificate canvas. Codes are public (printed on the certificate), so they are random,
// short and unambiguous to read back: no I, O, 0 or 1.

import { LESSON_CATALOG } from "./lesson-catalog";
import { SITE, absoluteUrl } from "./site";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 10;

export const CERT_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{10}$/;

/** A new public certificate code. `random` is injectable for tests. */
export function newCertificateCode(
  random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))
): string {
  // 32 symbols divide 256 evenly, so a byte mod 32 is unbiased.
  return Array.from(random(CODE_LENGTH), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function isCertificateCode(s: string): boolean {
  return CERT_CODE_PATTERN.test(s);
}

/** True only when every catalog lesson, coming-soon ones included, has a completed row. */
export function allLessonsComplete(progress: { lessonId: string; completed: boolean }[]): boolean {
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  return LESSON_CATALOG.every((l) => done.has(l.id));
}

export function verifyUrl(code: string): string {
  return absoluteUrl(`/verify/${code}`);
}

/** First name and last initial, for the public verification page. */
export function displayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Learner";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/**
 * The name drawn on the certificate. Once the record is issued it is the record's name, so the
 * PNG always matches /verify; before that, the typed name is shown as a preview.
 */
export function printedName(cert: { name: string } | null, typed: string): string {
  return cert ? cert.name : typed;
}

/** Download and share only a certificate whose record exists and whose name is saved. */
export function canExportCertificate(s: { cert: { name: string } | null; unsaved: boolean; imageReady: boolean }): boolean {
  return !!s.cert && !s.unsaved && s.imageReady;
}

/** LinkedIn's "add license or certification" form, prefilled with this certificate. */
export function linkedInAddUrl(code: string, issuedAt: Date): string {
  const q = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: "Answer Engine Optimization",
    organizationName: SITE.name,
    issueYear: String(issuedAt.getUTCFullYear()),
    issueMonth: String(issuedAt.getUTCMonth() + 1),
    certUrl: verifyUrl(code),
    certId: code,
  });
  return `https://www.linkedin.com/profile/add?${q}`;
}

/** "October 28, 2026", in UTC so the page, the canvas and the tests agree. */
export function formatIssued(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
