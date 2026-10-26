/**
 * Sends the worksheet follow-up (src/lib/worksheet-followup.ts) from the daily nurture cron.
 *
 * Dry unless WORKSHEET_FOLLOWUP_ENABLED=true: until then every run only reports who would get it. A lead is
 * marked sent (an EmailLead row with source "worksheet-followup") before the email goes, so two overlapping
 * runs cannot both send; the mark is removed again if Resend refuses the email.
 */
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { ownerEmail } from "@/lib/notify";
import { FOLLOWUP_LAST_DAY, FOLLOWUP_SENT_SOURCE, OPTED_OUT_SOURCE, renderFollowUpEmail, selectFollowUps } from "@/lib/worksheet-followup";

const DAY_MS = 86_400_000;

export function worksheetFollowUpEnabled(): boolean {
  return process.env.WORKSHEET_FOLLOWUP_ENABLED === "true";
}

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://www.learnhieroglyphics.com").replace(/\/$/, "");
}

/** "Harry from Learn Hieroglyphics <addr>" unless the env already carries a display name. */
function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

export type FollowUpRunResult = {
  dry: boolean;
  considered: number;
  planned: string[];
  sent: string[];
  errors: { email: string; error: string }[];
};

/** `includeEarlier` also takes leads from before FOLLOWUP_FROM, who were promised no more mail: only on purpose. */
export async function runWorksheetFollowUp(opts: { now?: Date; dry?: boolean; includeEarlier?: boolean; limit?: number } = {}): Promise<FollowUpRunResult> {
  const now = opts.now ?? new Date();
  const dry = opts.dry ?? !worksheetFollowUpEnabled();
  const limit = opts.limit ?? 50;

  const leads = await prisma.emailLead.findMany({
    where: { source: "worksheet", createdAt: { gte: new Date(now.getTime() - (FOLLOWUP_LAST_DAY + 1) * DAY_MS) } },
    select: { email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const emails = leads.map((l) => l.email);
  const [marks, users] = await Promise.all([
    prisma.emailLead.findMany({ where: { email: { in: emails }, source: { in: [FOLLOWUP_SENT_SOURCE, OPTED_OUT_SOURCE] } }, select: { email: true, source: true } }),
    prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, emailUnsubscribedAt: true, _count: { select: { ownedLicences: true } } },
    }),
  ]);
  const lower = (e: string | null) => (e ?? "").toLowerCase();
  const ctx = {
    sent: new Set(marks.filter((m) => m.source === FOLLOWUP_SENT_SOURCE).map((m) => lower(m.email))),
    optedOut: new Set([
      ...marks.filter((m) => m.source === OPTED_OUT_SOURCE).map((m) => lower(m.email)),
      ...users.filter((u) => u.emailUnsubscribedAt).map((u) => lower(u.email)),
    ]),
    hasLicence: new Set(users.filter((u) => u._count.ownedLicences > 0).map((u) => lower(u.email))),
  };

  const due = selectFollowUps(leads, ctx, now, { includeEarlier: opts.includeEarlier }).slice(0, limit);
  const result: FollowUpRunResult = { dry, considered: leads.length, planned: due.map((l) => l.email), sent: [], errors: [] };
  if (dry) return result;

  const email = renderFollowUpEmail(baseUrl());
  for (const lead of due) {
    try {
      // the mark first: the unique (email, source) pair makes a second run's create fail, so it cannot send again
      await prisma.emailLead.create({ data: { email: lead.email, source: FOLLOWUP_SENT_SOURCE } });
    } catch {
      continue;
    }
    try {
      const sent = await getResend().emails.send({
        from: fromAddress(),
        to: lead.email,
        replyTo: ownerEmail(),
        subject: email.subject,
        html: email.html,
        text: email.text,
        tags: [{ name: "worksheet", value: "followup" }],
      });
      if (sent.error) throw new Error(`Resend: ${sent.error.message}`);
      result.sent.push(lead.email);
      console.log(`[worksheet-followup] sent to ${lead.email}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.emailLead.deleteMany({ where: { email: lead.email, source: FOLLOWUP_SENT_SOURCE } }).catch(() => {});
      console.error(`[worksheet-followup] ${lead.email} failed:`, message);
      result.errors.push({ email: lead.email, error: message });
    }
  }
  return result;
}
