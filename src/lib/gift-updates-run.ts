/**
 * Sends the "Christmas prints are open" email (src/lib/gift-updates.ts) to everyone who ticked the box, once.
 * Run by hand through /api/cron/gift-updates; dry unless GIFT_UPDATES_ENABLED=true, so a run before then only
 * reports who would get it. A lead is marked sent before its email goes, so two runs cannot both send; the mark is
 * removed again if Resend refuses the email (the pattern of src/lib/worksheet-followup-run.ts).
 */
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { ownerEmail } from "@/lib/notify";
import { leadUnsubscribeUrl } from "@/lib/unsubscribe";
import { GIFT_UPDATES_SENT_SOURCE, GIFT_UPDATES_SOURCE, NO_MORE_SOURCE, renderGiftUpdatesEmail, selectGiftUpdates } from "@/lib/gift-updates";

export function giftUpdatesEnabled(): boolean {
  return process.env.GIFT_UPDATES_ENABLED === "true";
}

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://www.learnhieroglyphics.com").replace(/\/$/, "");
}

/** "Harry from Learn Hieroglyphics <addr>" unless the env already carries a display name. */
function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

export type GiftUpdatesRunResult = { dry: boolean; optedIn: number; planned: string[]; sent: string[]; errors: { email: string; error: string }[] };

export async function runGiftUpdates(opts: { dry?: boolean; limit?: number } = {}): Promise<GiftUpdatesRunResult> {
  const dry = opts.dry ?? !giftUpdatesEnabled();
  const limit = opts.limit ?? 200;
  const leads = await prisma.emailLead.findMany({ where: { source: GIFT_UPDATES_SOURCE }, select: { email: true, name: true }, orderBy: { createdAt: "asc" } });
  const emails = leads.map((l) => l.email);
  const [marks, users] = await Promise.all([
    prisma.emailLead.findMany({ where: { email: { in: emails }, source: { in: [GIFT_UPDATES_SENT_SOURCE, NO_MORE_SOURCE] } }, select: { email: true, source: true } }),
    prisma.user.findMany({ where: { email: { in: emails }, emailUnsubscribedAt: { not: null } }, select: { email: true } }),
  ]);
  const lower = (e: string | null) => (e ?? "").toLowerCase();
  const due = selectGiftUpdates(leads, {
    sent: new Set(marks.filter((m) => m.source === GIFT_UPDATES_SENT_SOURCE).map((m) => lower(m.email))),
    optedOut: new Set([...marks.filter((m) => m.source === NO_MORE_SOURCE).map((m) => lower(m.email)), ...users.map((u) => lower(u.email))]),
  }).slice(0, limit);
  const result: GiftUpdatesRunResult = { dry, optedIn: leads.length, planned: due.map((l) => l.email), sent: [], errors: [] };
  if (dry) return result;

  const resend = new Resend(process.env.RESEND_API_KEY);
  for (const lead of due) {
    try {
      await prisma.emailLead.create({ data: { email: lead.email, source: GIFT_UPDATES_SENT_SOURCE } });
    } catch {
      continue;
    }
    try {
      const unsubscribe = leadUnsubscribeUrl(lead.email, baseUrl());
      const email = renderGiftUpdatesEmail(lead, baseUrl(), unsubscribe);
      const sent = await resend.emails.send({
        from: fromAddress(),
        to: lead.email,
        replyTo: ownerEmail(),
        subject: email.subject,
        html: email.html,
        text: email.text,
        headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        tags: [{ name: "gift-updates", value: "christmas-prints" }],
      });
      if (sent.error) throw new Error(`Resend: ${sent.error.message}`);
      result.sent.push(lead.email);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.emailLead.deleteMany({ where: { email: lead.email, source: GIFT_UPDATES_SENT_SOURCE } }).catch(() => {});
      console.error(`[gift-updates] ${lead.email} failed:`, message);
      result.errors.push({ email: lead.email, error: message });
    }
  }
  return result;
}
