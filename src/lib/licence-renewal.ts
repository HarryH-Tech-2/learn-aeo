/**
 * The renewal reminder for licences paid by invoice (2026-10-16). They run a year and never renew by
 * themselves, so a month before the end the teacher who owns one gets one email from Harry: the date, the
 * class code that will stop working, and links to renew by invoice (the same licence runs on, same code:
 * src/lib/licence-invoice.ts fulfilLicenceInvoice) or by card. Sent from the daily nurture cron by
 * src/lib/licence-renewal-run.ts, once per licence term (EmailSend key below).
 */
import { PLANS } from "@/lib/plans";
import type { LicenceKind } from "@/lib/licence";

/** Days before the end the reminder goes out (the "11 months" of a 12-month licence). */
export const RENEWAL_REMINDER_DAYS = 30;

const DAY_MS = 86_400_000;

export type RenewalCandidate = {
  licenceId: string;
  status: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  currentPeriodEnd: Date | null;
};

/** An invoiced licence (no subscription, not a trial) ending within the reminder window, and not ended yet. */
export function renewalDue(l: RenewalCandidate, now = new Date()): boolean {
  if (l.status === "trial" || l.status === "canceled" || l.stripeSubscriptionId || !l.stripeCustomerId || !l.currentPeriodEnd) return false;
  const left = l.currentPeriodEnd.getTime() - now.getTime();
  return left > 0 && left <= RENEWAL_REMINDER_DAYS * DAY_MS;
}

/** One reminder per licence per term: a renewal moves the end date, so next year's reminder has a new key. */
export function renewalKey(licenceId: string, periodEnd: Date): string {
  return `licence-renewal:${licenceId}:${periodEnd.toISOString().slice(0, 10)}`;
}

export type RenewalEmail = { subject: string; text: string };

export function renderRenewalEmail(input: {
  name: string | null | undefined;
  kind: LicenceKind;
  schoolName: string | null;
  code: string;
  periodEnd: Date;
  baseUrl: string;
  licenceId: string;
}): RenewalEmail {
  const first = input.name?.trim().split(/\s+/)[0];
  const date = input.periodEnd.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
  const plan = PLANS[input.kind].name;
  const what = input.schoolName ? `${input.schoolName}'s ${plan} licence` : `your ${plan} licence`;
  const base = input.baseUrl.replace(/\/$/, "");
  return {
    subject: `Your ${plan} licence ends on ${date}`,
    text: [
      first ? `Hi ${first},` : "Hi,",
      "",
      `A quick heads-up: ${what} runs until ${date}. It doesn't renew by itself, so after that date the class code ${input.code} stops working for your pupils.`,
      "",
      "To keep it going for another year, with the same class code and every pupil's progress kept:",
      "",
      `Renew by invoice (bank transfer or card, 30 days to pay, PO numbers welcome): ${base}/teachers/licence?invoice=1&plan=${input.kind}&renew=${input.licenceId}#invoice`,
      "",
      "If you'd rather let it lapse, there's nothing to do. And if anything about the course could work better for your class, just reply: it comes straight to me.",
      "",
      "Harry",
      "Learn Hieroglyphics",
    ].join("\n"),
  };
}
