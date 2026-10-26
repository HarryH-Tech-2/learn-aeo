import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { classroomAccessFor, startClassroomTrial, TRIAL_DAYS } from "@/lib/licence";
import { notifyOwner } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * POST /api/licence/trial → start the free 7-day Classroom trial (src/lib/licence.ts).
 *   200 { ok, endsAt }               started
 *   200 { ok, already: true }        Classroom mode is already open (paid licence or a running trial)
 *   409 { error, reason: "used" }    had a trial or a licence before
 *   401                              not signed in (the button opens the sign-in box)
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await classroomAccessFor(user.id);
  if (access.licensed) return NextResponse.json({ ok: true, already: true });

  const result = await startClassroomTrial(user.id);
  if (!result.ok) {
    return NextResponse.json({ error: "You've had the free trial already. The Classroom licence opens Classroom mode again.", reason: "used" }, { status: 409 });
  }

  // a teacher trying it is the warmest lead there is: worth a personal note before the week is up
  await notifyOwner({
    subject: `Classroom trial started: ${user.email ?? "(no email)"}`,
    text: [
      `${user.name ?? "(no name)"} <${user.email ?? "no email"}> started the free ${TRIAL_DAYS}-day Classroom trial.`,
      `It ends ${result.endsAt.toUTCString()}.`,
    ].join("\n"),
    ...(user.email ? { replyTo: user.email } : {}),
  });
  return NextResponse.json({ ok: true, endsAt: result.endsAt.toISOString() });
}
