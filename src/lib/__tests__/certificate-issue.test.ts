import { describe, it, expect } from "vitest";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import {
  CERT_CODE_PATTERN,
  allLessonsComplete,
  displayName,
  formatIssued,
  isCertificateCode,
  linkedInAddUrl,
  newCertificateCode,
  verifyUrl,
} from "@/lib/certificate-issue";

const allDone = () => LESSON_CATALOG.map((l) => ({ lessonId: l.id, completed: true }));

describe("certificate codes", () => {
  it("makes codes that match the pattern", () => {
    for (let i = 0; i < 50; i++) expect(newCertificateCode()).toMatch(CERT_CODE_PATTERN);
  });

  it("is deterministic for a fixed random source", () => {
    const zeros = (n: number) => new Uint8Array(n);
    expect(newCertificateCode(zeros)).toBe(newCertificateCode(zeros));
    expect(newCertificateCode(zeros)).toMatch(CERT_CODE_PATTERN);
  });

  it("rejects malformed codes", () => {
    expect(isCertificateCode("abc")).toBe(false);
    expect(isCertificateCode("ABCDEFGHI0")).toBe(false); // 0 is not in the alphabet
    expect(isCertificateCode("ABCDEFGHJK2")).toBe(false); // 11 chars
    expect(isCertificateCode("abcdefghjk")).toBe(false); // lowercase
    expect(isCertificateCode("ABCDEFGH23")).toBe(true);
  });
});

describe("allLessonsComplete", () => {
  it("is true only when every catalog lesson, coming-soon ones included, is complete", () => {
    expect(allLessonsComplete(allDone())).toBe(true);
    const soon = LESSON_CATALOG.find((l) => l.status !== "live")!;
    expect(allLessonsComplete(allDone().filter((p) => p.lessonId !== soon.id))).toBe(false);
    expect(allLessonsComplete(allDone().map((p, i) => (i === 0 ? { ...p, completed: false } : p)))).toBe(false);
    expect(allLessonsComplete([])).toBe(false);
  });
});

describe("display helpers", () => {
  it("builds the verification URL", () => {
    expect(verifyUrl("ABCDEFGH23")).toMatch(/^https?:\/\/.+\/verify\/ABCDEFGH23$/);
  });

  it("shows first name and last initial only", () => {
    expect(displayName("Jane Q Smith")).toBe("Jane S.");
    expect(displayName("  Jane   Smith ")).toBe("Jane S.");
    expect(displayName("Prince")).toBe("Prince");
    expect(displayName("   ")).toBe("Learner");
  });

  it("formats the issue date in UTC", () => {
    expect(formatIssued(new Date("2026-10-28T23:30:00Z"))).toBe("October 28, 2026");
    expect(formatIssued(new Date("2026-10-28T00:10:00Z"))).toBe("October 28, 2026");
  });
});

describe("linkedInAddUrl", () => {
  it("prefills the LinkedIn add-certification form", () => {
    const u = new URL(linkedInAddUrl("ABCDEFGH23", new Date("2026-10-28T12:00:00Z")));
    expect(u.origin + u.pathname).toBe("https://www.linkedin.com/profile/add");
    expect(u.searchParams.get("startTask")).toBe("CERTIFICATION_NAME");
    expect(u.searchParams.get("name")).toBe("Answer Engine Optimization");
    expect(u.searchParams.get("organizationName")).toBe("Learn AEO");
    expect(u.searchParams.get("issueYear")).toBe("2026");
    expect(u.searchParams.get("issueMonth")).toBe("10");
    expect(u.searchParams.get("certId")).toBe("ABCDEFGH23");
    expect(u.searchParams.get("certUrl")).toMatch(/\/verify\/ABCDEFGH23$/);
  });
});
