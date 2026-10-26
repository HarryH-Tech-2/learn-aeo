/**
 * Sends the purchase feedback email (src/lib/purchase-feedback.ts) from the daily nurture cron.
 *
 * Dry unless PURCHASE_FEEDBACK_ENABLED=true: until then every run only reports who would get it. A buyer is
 * marked sent (an EmailSend row, key "purchase-feedback") before the email goes, so two overlapping runs
 * cannot both send; the mark is removed again if Resend refuses the email.
 */
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { ownerEmail } from "@/lib/notify";
import { FEEDBACK_LAST_DAY, PURCHASE_FEEDBACK_KEY, feedbackDue, renderFeedbackEmail, type FeedbackPlan } from "@/lib/purchase-feedback";

const DAY_MS = 86_400_000;

export function purchaseFeedbackEnabled(): boolean {
  // trimmed: a value added with `echo … | vercel env add` carries a newline
  return process.env.PURCHASE_FEEDBACK_ENABLED?.trim() === "true";
}

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

/** "Harry from Learn AEO <addr>" unless the env already carries a display name. */
function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn AEO <${raw}>`;
}

export type FeedbackRunResult = {
  dry: boolean;
  considered: number;
  planned: { email: string; plan: FeedbackPlan; day: number }[];
  sent: string[];
  errors: { email: string; error: string }[];
};

export async function runPurchaseFeedback(opts: { now?: Date; dry?: boolean; limit?: number } = {}): Promise<FeedbackRunResult> {
  const now = opts.now ?? new Date();
  const dry = opts.dry ?? !purchaseFeedbackEnabled();
  const limit = opts.limit ?? 50;

  const subs = await prisma.subscription.findMany({
    where: {
      activatedAt: { gte: new Date(now.getTime() - (FEEDBACK_LAST_DAY + 1) * DAY_MS) },
      trial: false,
      plan: { in: ["lifetime", "monthly"] },
    },
    select: {
      plan: true,
      active: true,
      trial: true,
      activatedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          emailUnsubscribedAt: true,
          emailSends: { where: { key: PURCHASE_FEEDBACK_KEY }, select: { key: true } },
        },
      },
    },
    orderBy: { activatedAt: "asc" },
  });

  const result: FeedbackRunResult = { dry, considered: subs.length, planned: [], sent: [], errors: [] };
  const due: { userId: string; email: string; name: string | null; plan: FeedbackPlan }[] = [];
  for (const s of subs) {
    const u = s.user;
    const plan = feedbackDue(
      {
        userId: u.id,
        email: u.email,
        name: u.name,
        emailUnsubscribedAt: u.emailUnsubscribedAt,
        lifetimeStatus: u.status === "ACTIVE",
        subscription: { plan: s.plan, active: s.active, trial: s.trial, activatedAt: s.activatedAt },
        sentKeys: u.emailSends.map((e) => e.key),
      },
      now,
    );
    if (!plan || !u.email) continue;
    if (due.length >= limit) break;
    due.push({ userId: u.id, email: u.email, name: u.name, plan });
    result.planned.push({ email: u.email, plan, day: Math.floor((now.getTime() - s.activatedAt!.getTime()) / DAY_MS) });
  }
  if (dry) return result;

  for (const b of due) {
    try {
      // the mark first: the unique (userId, key) pair makes a second run's create fail, so it cannot send again
      await prisma.emailSend.create({ data: { userId: b.userId, key: PURCHASE_FEEDBACK_KEY } });
    } catch {
      continue;
    }
    try {
      const email = renderFeedbackEmail(b.name, b.plan);
      const sent = await getResend().emails.send({
        from: fromAddress(),
        to: b.email,
        replyTo: ownerEmail(),
        subject: email.subject,
        text: email.text,
        tags: [{ name: "purchase", value: "feedback" }],
      });
      if (sent.error) throw new Error(`Resend: ${sent.error.message}`);
      result.sent.push(b.email);
      console.log(`[purchase-feedback] sent to ${b.email}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.emailSend.deleteMany({ where: { userId: b.userId, key: PURCHASE_FEEDBACK_KEY } }).catch(() => {});
      console.error(`[purchase-feedback] ${b.email} failed:`, message);
      result.errors.push({ email: b.email, error: message });
    }
  }
  return result;
}
