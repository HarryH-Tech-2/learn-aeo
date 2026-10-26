/**
 * One plain-text email from the Learn AEO team about five days after a Lifetime or Expedition Pass (monthly) purchase,
 * asking "What's one thing that would make the course better?" and inviting a reply. Sent once per buyer by
 * the daily nurture cron (src/lib/purchase-feedback-run.ts).
 *
 * The purchase time is Subscription.activatedAt, set on the first activation and never moved
 * (src/lib/subscription.ts). "Sent" is an EmailSend row with key PURCHASE_FEEDBACK_KEY: the unique (userId, key) pair is the
 * once-only guard, the same one the nurture drip uses.
 *
 * Pure rules and the email here (tested); the send is in purchase-feedback-run.ts.
 */
import { firstName } from "@/lib/nurture";

/** EmailSend.key for this email. */
export const PURCHASE_FEEDBACK_KEY = "purchase-feedback";
/** Days after purchase before it goes. */
export const FEEDBACK_DAY = 5;
/**
 * Older purchases are left alone, so the first run does not write to long-standing customers out of the
 * blue. A missed day of the cron still lands inside the window.
 */
export const FEEDBACK_LAST_DAY = 14;

const DAY_MS = 86_400_000;

export type FeedbackPlan = "lifetime" | "monthly";

export type FeedbackCandidate = {
  userId: string;
  email: string | null;
  name: string | null;
  emailUnsubscribedAt: Date | null;
  /** User.status === "ACTIVE" (lifetime marker) */
  lifetimeStatus: boolean;
  subscription: { plan: string; active: boolean; trial: boolean; activatedAt: Date | null } | null;
  /** EmailSend keys already recorded for this user */
  sentKeys: string[];
};

/** The plan to word the email for, or null when the user is not a buyer this email is for. */
export function feedbackPlanOf(c: FeedbackCandidate): FeedbackPlan | null {
  const sub = c.subscription;
  if (!sub || sub.trial) return null;
  const plan = sub.plan ?? "lifetime";
  if (plan === "lifetime" && (sub.active || c.lifetimeStatus)) return "lifetime";
  // (an active monthly row stays active to the end of the paid period, even after a cancel)
  if (plan === "monthly" && sub.active) return "monthly";
  return null;
}

export function feedbackDue(c: FeedbackCandidate, now = new Date()): FeedbackPlan | null {
  if (!c.email || c.emailUnsubscribedAt) return null;
  if (c.sentKeys.includes(PURCHASE_FEEDBACK_KEY)) return null;
  const at = c.subscription?.activatedAt;
  if (!at) return null;
  const age = now.getTime() - at.getTime();
  if (age < FEEDBACK_DAY * DAY_MS || age > FEEDBACK_LAST_DAY * DAY_MS) return null;
  return feedbackPlanOf(c);
}

export type FeedbackEmail = { subject: string; text: string };

/** Plain text on purpose: it should read like a note from a person, not a newsletter. */
export function renderFeedbackEmail(name: string | null | undefined, plan: FeedbackPlan): FeedbackEmail {
  const first = firstName(name);
  const hi = first === "Scholar" ? "Hi," : `Hi ${first},`;
  const opener =
    plan === "monthly"
      ? "It's been about five days since you started the Expedition Pass, so I wanted to ask you one thing:"
      : "It's been about five days since you bought the course, so I wanted to ask you one thing:";
  const thanks = plan === "monthly" ? "Thanks again for giving it a go." : "Thanks again for your support.";
  const text = [
    hi,
    "",
    opener,
    "",
    "What's one thing that would make the course better?",
    "",
    "Anything goes: a lesson that was confusing or dragged, something that didn't work, or something you wish it had. Just hit reply. It comes straight to me, and I read every one.",
    "",
    thanks,
    "",
    "The Learn AEO team",
  ].join("\n");
  return { subject: "One quick question", text };
}
