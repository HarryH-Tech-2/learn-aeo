import { prisma } from "@/lib/db";

export type LeadSource =
  | "newsletter"
  /**
   * Log rows, not leads: what happened after an unpaid checkout expired, one per Stripe session
   * (src/lib/checkout-recovery-log.ts). Nothing mails these.
   */
  | `checkout-expired:${string}`
  | `checkout-recovery-sent:${string}`
  | `checkout-recovery-resent:${string}`
  | `checkout-reminder-sent:${string}`
  | `checkout-skipped:${string}:${string}`
  /** asked for no more mail (one-click unsubscribe, or added by hand) */
  | "no-more";

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email.trim());
}

/**
 * Record an email lead (newsletter box, …) in our
 * own database so the list outlives Resend's 30-day log. Idempotent per
 * (email, source). Never throws — capturing the lead must not block the
 * email that the visitor is actually waiting for.
 */
export async function recordLead(input: {
  email: string;
  source: LeadSource;
  name?: string | null;
}): Promise<void> {
  const email = normaliseEmail(input.email);
  try {
    await prisma.emailLead.upsert({
      where: { email_source: { email, source: input.source } },
      create: { email, source: input.source, name: input.name ?? null },
      update: { name: input.name ?? undefined },
    });
  } catch (err) {
    console.error("[leads] failed to record lead:", err);
  }
}
