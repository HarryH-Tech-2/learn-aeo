import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { allLessonsComplete, newCertificateCode, verifyUrl } from "@/lib/certificate-issue";

const MAX_NAME = 60;

function isUniqueClash(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}

/**
 * POST /api/certificate → { code, name, issuedAt, url }
 * Issues the learner's certificate once every catalog lesson is complete, or returns the one
 * already issued. The name follows the account; the code and issue date never change.
 * 401 signed out; 403 while any lesson is incomplete.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.lessonProgress.findMany({
    where: { userId },
    select: { lessonId: true, completed: true },
  });
  if (!allLessonsComplete(progress)) {
    return NextResponse.json({ error: "Complete every lesson first" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const name = (user?.name?.trim() || "Learner").slice(0, MAX_NAME);

  let cert = await prisma.certificate.findUnique({ where: { userId } });
  if (cert) {
    if (cert.name !== name) cert = await prisma.certificate.update({ where: { userId }, data: { name } });
  } else {
    // A clash on the random code is vanishingly rare; a clash on userId means a parallel
    // request issued it first. Either way, one retry settles it.
    try {
      cert = await prisma.certificate.create({ data: { code: newCertificateCode(), userId, name } });
    } catch (err) {
      if (!isUniqueClash(err)) throw err;
      cert =
        (await prisma.certificate.findUnique({ where: { userId } })) ??
        (await prisma.certificate.create({ data: { code: newCertificateCode(), userId, name } }));
    }
  }

  return NextResponse.json({
    code: cert.code,
    name: cert.name,
    issuedAt: cert.issuedAt.toISOString(),
    url: verifyUrl(cert.code),
  });
}
