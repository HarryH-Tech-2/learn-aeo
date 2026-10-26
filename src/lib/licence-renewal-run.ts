/**
 * Sends the licence renewal reminder (src/lib/licence-renewal.ts) from the daily nurture cron.
 *
 * On by default (only licences paid by invoice ever qualify); LICENCE_RENEWAL_ENABLED=false turns it off, and
 * the cron's dry=1 keeps it dry. The owner is marked sent (an EmailSend row keyed per licence and term) before
 * the email goes, so overlapping runs cannot both send; the mark is removed if Resend refuses the email.
 */
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { ownerEmail } from "@/lib/notify";
import { isLicenceKind } from "@/lib/licence";
import { RENEWAL_REMINDER_DAYS, renderRenewalEmail, renewalDue, renewalKey } from "@/lib/licence-renewal";

const DAY_MS = 86_400_000;

export function licenceRenewalEnabled(): boolean {
  return process.env.LICENCE_RENEWAL_ENABLED?.trim() !== "false";
}

function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

export type RenewalRunResult = {
  dry: boolean;
  considered: number;
  planned: { email: string; licenceId: string; ends: string }[];
  sent: string[];
  errors: { email: string; error: string }[];
};

export async function runLicenceRenewal(opts: { now?: Date; dry?: boolean } = {}): Promise<RenewalRunResult> {
  const now = opts.now ?? new Date();
  const dry = opts.dry ?? !licenceRenewalEnabled();

  const licences = await prisma.licence.findMany({
    where: {
      stripeSubscriptionId: null,
      stripeCustomerId: { not: null },
      status: { notIn: ["trial", "canceled"] },
      currentPeriodEnd: { gt: now, lte: new Date(now.getTime() + RENEWAL_REMINDER_DAYS * DAY_MS) },
    },
    select: {
      id: true,
      kind: true,
      code: true,
      schoolName: true,
      status: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
      currentPeriodEnd: true,
      owner: { select: { id: true, email: true, name: true, emailSends: { select: { key: true } } } },
    },
  });

  const result: RenewalRunResult = { dry, considered: licences.length, planned: [], sent: [], errors: [] };
  const due = licences.filter((l) => {
    if (!l.owner.email || !isLicenceKind(l.kind) || !l.currentPeriodEnd) return false;
    if (!renewalDue({ licenceId: l.id, ...l }, now)) return false;
    return !l.owner.emailSends.some((e) => e.key === renewalKey(l.id, l.currentPeriodEnd!));
  });
  for (const l of due) result.planned.push({ email: l.owner.email!, licenceId: l.id, ends: l.currentPeriodEnd!.toISOString().slice(0, 10) });
  if (dry) return result;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.learnhieroglyphics.com";
  for (const l of due) {
    const key = renewalKey(l.id, l.currentPeriodEnd!);
    try {
      await prisma.emailSend.create({ data: { userId: l.owner.id, key } });
    } catch {
      continue;
    }
    try {
      const email = renderRenewalEmail({
        name: l.owner.name,
        kind: l.kind as "classroom" | "school",
        schoolName: l.schoolName,
        code: l.code,
        periodEnd: l.currentPeriodEnd!,
        baseUrl,
        licenceId: l.id,
      });
      const sent = await resend.emails.send({
        from: fromAddress(),
        to: l.owner.email!,
        replyTo: ownerEmail(),
        subject: email.subject,
        text: email.text,
        tags: [{ name: "licence", value: "renewal" }],
      });
      if (sent.error) throw new Error(`Resend: ${sent.error.message}`);
      result.sent.push(l.owner.email!);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.emailSend.deleteMany({ where: { userId: l.owner.id, key } }).catch(() => {});
      console.error(`[licence-renewal] ${l.owner.email} failed:`, message);
      result.errors.push({ email: l.owner.email!, error: message });
    }
  }
  return result;
}
