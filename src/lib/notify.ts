import { Resend } from "resend";
import { SITE } from "@/lib/site";

/**
 * Where every "something happened on the site" email goes: newsletter
 * signups, contact-form messages, lesson feedback, new accounts and purchases.
 * Override with CONTACT_TO_EMAIL if it ever needs to move.
 */
export const DEFAULT_OWNER_EMAIL = SITE.supportEmail;

export function ownerEmail(): string {
  return process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_OWNER_EMAIL;
}

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

/**
 * Send an owner notification. Never throws — a failed notification must not
 * break the user-facing action (sign-in, purchase, form submit) it reports on.
 * Returns true if Resend accepted it.
 */
export async function notifyOwner(input: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  try {
    const result = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: ownerEmail(),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      subject: input.subject,
      text: input.text,
    });
    if (result.error) {
      console.error("[notify] Resend error:", result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[notify] failed:", err);
    return false;
  }
}
