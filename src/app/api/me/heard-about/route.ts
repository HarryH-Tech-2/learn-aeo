import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";
import { checkSubscription, hasPaidAccess } from "@/lib/subscription";
import { HEARD_ABOUT_OPTIONS, cleanHeardAbout } from "@/lib/referrer";

/**
 * POST /api/me/heard-about { answer, detail? }: the signed-in user's answer to "How did you find us?"
 * (dashboard card). Asked once: a second answer is ignored. Paying customers' answers are emailed to the owner,
 * as they are the ones a sale can't otherwise be traced for.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id || !user.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { answer?: unknown; detail?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const heardAbout = cleanHeardAbout(body.answer, body.detail);
  if (!heardAbout) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { count } = await prisma.user.updateMany({ where: { id: user.id, heardAbout: null }, data: { heardAbout } });
  if (count && heardAbout !== "skipped") {
    const access = await checkSubscription(user.email).catch(() => null);
    if (access && hasPaidAccess(access)) {
      const id = heardAbout.split(":")[0];
      const label = HEARD_ABOUT_OPTIONS.find((o) => o.id === id)?.label ?? id;
      // awaited: a serverless function may be frozen the moment it answers (it never throws)
      await notifyOwner({
        subject: `How a customer found us: ${label}`,
        text: `${user.name ?? "A customer"} <${user.email}> answered "How did you find us?": ${heardAbout === id ? label : heardAbout}.`,
        replyTo: user.email,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
