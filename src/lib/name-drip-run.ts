/**
 * Sends the "my name in hieroglyphs" follow-up (src/lib/name-drip.ts) from the daily nurture cron.
 *
 * Dry unless NAME_DRIP_ENABLED=true: until then every run only reports who would get what. A step is marked sent
 * (an EmailLead row "name-drip-sent:<step>") before its email goes, so two overlapping runs cannot both send; the
 * mark is removed again if Resend refuses the email (the pattern of src/lib/worksheet-followup-run.ts).
 */
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { ownerEmail } from "@/lib/notify";
import { leadUnsubscribeUrl } from "@/lib/unsubscribe";
import { NO_MORE_SOURCE } from "@/lib/gift-updates";
import { NAME_DRIP_LAST_DAY, NAME_DRIP_SOURCE, NAME_DRIP_STEPS, dueStep, nameDripSentSource, renderNameDripEmail, type NameDripStepKey } from "@/lib/name-drip";

const DAY_MS = 86_400_000;

export function nameDripEnabled(): boolean {
  return process.env.NAME_DRIP_ENABLED === "true";
}

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://www.learnhieroglyphics.com").replace(/\/$/, "");
}

/** "Harry from Learn Hieroglyphics <addr>" unless the env already carries a display name. */
function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

export type NameDripRunResult = {
  dry: boolean;
  considered: number;
  planned: { email: string; step: NameDripStepKey }[];
  sent: { email: string; step: NameDripStepKey }[];
  errors: { email: string; error: string }[];
};

export async function runNameDrip(opts: { now?: Date; dry?: boolean; limit?: number } = {}): Promise<NameDripRunResult> {
  const now = opts.now ?? new Date();
  const dry = opts.dry ?? !nameDripEnabled();
  const limit = opts.limit ?? 100;

  const leads = await prisma.emailLead.findMany({
    where: { source: NAME_DRIP_SOURCE, createdAt: { gte: new Date(now.getTime() - (NAME_DRIP_LAST_DAY + 1) * DAY_MS) } },
    select: { email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const emails = leads.map((l) => l.email);
  const sentSources = NAME_DRIP_STEPS.map((s) => nameDripSentSource(s.key));
  const [marks, users] = await Promise.all([
    prisma.emailLead.findMany({
      where: { email: { in: emails }, source: { in: [...sentSources, NO_MORE_SOURCE, "cartouche-print"] } },
      select: { email: true, source: true },
    }),
    prisma.user.findMany({ where: { email: { in: emails } }, select: { email: true, status: true, emailUnsubscribedAt: true } }),
  ]);
  const lower = (e: string | null) => (e ?? "").toLowerCase();
  const marksFor = (email: string) => marks.filter((m) => lower(m.email) === lower(email)).map((m) => m.source);
  const userFor = (email: string) => users.find((u) => lower(u.email) === lower(email));

  const result: NameDripRunResult = { dry, considered: leads.length, planned: [], sent: [], errors: [] };
  for (const lead of leads) {
    const own = marksFor(lead.email);
    const user = userFor(lead.email);
    const step = dueStep(
      {
        email: lead.email,
        name: lead.name,
        optedInAt: lead.createdAt,
        sent: NAME_DRIP_STEPS.filter((s) => own.includes(nameDripSentSource(s.key))).map((s) => s.key),
        optedOut: own.includes(NO_MORE_SOURCE) || !!user?.emailUnsubscribedAt,
        member: user?.status === "ACTIVE",
        boughtPrint: own.includes("cartouche-print"),
      },
      now
    );
    if (step) result.planned.push({ email: lead.email, step });
  }
  result.planned = result.planned.slice(0, limit);
  if (dry) return result;

  const resend = new Resend(process.env.RESEND_API_KEY);
  for (const { email: to, step } of result.planned) {
    const source = nameDripSentSource(step);
    try {
      await prisma.emailLead.create({ data: { email: to, source } });
    } catch {
      continue; // another run got there first
    }
    try {
      const lead = leads.find((l) => l.email === to)!;
      const unsubscribe = leadUnsubscribeUrl(to, baseUrl());
      const email = renderNameDripEmail(step, lead, baseUrl(), unsubscribe, now);
      const sent = await resend.emails.send({
        from: fromAddress(),
        to,
        replyTo: ownerEmail(),
        subject: email.subject,
        html: email.html,
        text: email.text,
        headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        tags: [{ name: "name-drip", value: step }],
      });
      if (sent.error) throw new Error(`Resend: ${sent.error.message}`);
      result.sent.push({ email: to, step });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.emailLead.deleteMany({ where: { email: to, source } }).catch(() => {});
      console.error(`[name-drip] ${to} ${step} failed:`, message);
      result.errors.push({ email: to, error: message });
    }
  }
  return result;
}
