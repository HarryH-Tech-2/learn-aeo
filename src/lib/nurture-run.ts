/**
 * Runs the nurture sequence against the database: enrolment on sign-up, and
 * the daily pass that the cron route calls.
 *
 * Only the day-0 welcome is sent unless NURTURE_ENABLED=true. Without it every daily run is a dry
 * run that reports what would go out, so the sequence can be deployed,
 * previewed and backfilled before it goes live.
 */
import { FIRST_LESSON_ID } from "@/lib/lesson-catalog";
import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { prisma } from "@/lib/db";
import { checkSubscription, hasPaidAccess } from "@/lib/subscription";
import { grantOffer, OFFER_PERCENT_OFF } from "@/lib/offers";
import { ownerEmail } from "@/lib/notify";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import {
  nextDueStep,
  firstName,
  NURTURE_LAST_DAY,
  NURTURE_GRACE_DAYS,
  type NurtureSnapshot,
  type NurtureStep,
  type NurtureStepKey,
} from "@/lib/nurture";
import { renderNurtureEmail, type NurtureEmailContext } from "@/lib/nurture-emails";

const LESSON_ONE = FIRST_LESSON_ID;
const DAY_MS = 86_400_000;

export function nurtureEnabled(): boolean {
  return process.env.NURTURE_ENABLED === "true";
}

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? SITE.url).replace(/\/$/, "");
}

/** "Learn AEO <addr>" unless the env already carries a display name. */
function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Learn AEO <${raw}>`;
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  nurtureStartedAt: true,
  emailUnsubscribedAt: true,
  offerCode: true,
  offerExpiresAt: true,
  offerSource: true,
  lessonProgress: { where: { lessonId: LESSON_ONE }, select: { completed: true, xpEarned: true } },
  emailSends: { select: { key: true } },
} as const;

type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
  nurtureStartedAt: Date | null;
  emailUnsubscribedAt: Date | null;
  offerCode: string | null;
  offerExpiresAt: Date | null;
  offerSource: string | null;
  lessonProgress: { completed: boolean; xpEarned: number }[];
  emailSends: { key: string }[];
};

/** Paid access stops the sequence; the free-unlock group carries on without the offers (src/lib/access-test.ts). */
async function accessOf(email: string): Promise<{ hasAccess: boolean; freeUnlock: boolean }> {
  const access = await checkSubscription(email);
  return { hasAccess: hasPaidAccess(access), freeUnlock: access.via === "free-unlock" };
}

async function snapshotOf(u: UserRow): Promise<NurtureSnapshot | null> {
  if (!u.email || !u.nurtureStartedAt) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    nurtureStartedAt: u.nurtureStartedAt,
    emailUnsubscribedAt: u.emailUnsubscribedAt,
    ...(await accessOf(u.email)),
    lesson1Completed: u.lessonProgress.some((p) => p.completed),
    // (the lesson row is created on page load; XP only comes from answering)
    lesson1Started: u.lessonProgress.some((p) => p.completed || p.xpEarned > 0),
    sentKeys: u.emailSends.map((s) => s.key),
    offer:
      u.offerCode && u.offerExpiresAt
        ? { expiresAt: u.offerExpiresAt, source: u.offerSource ?? "lesson-complete" }
        : null,
  };
}

async function deliver(u: NurtureSnapshot, step: NurtureStep, offer: NurtureEmailContext["offer"]): Promise<void> {
  const ctx: NurtureEmailContext = {
    firstName: firstName(u.name),
    baseUrl: baseUrl(),
    unsubscribeUrl: unsubscribeUrl(u.id),
    lesson1Completed: u.lesson1Completed,
    lesson1Started: u.lesson1Started,
    freeUnlock: u.freeUnlock,
    offer,
  };
  const email = renderNurtureEmail(step.key, ctx);
  const result = await getResend().emails.send({
    from: fromAddress(),
    to: u.email,
    replyTo: ownerEmail(),
    subject: email.subject,
    html: email.html,
    text: email.text,
    // (lets the Resend dashboard filter opens by step)
    tags: [{ name: "nurture", value: step.key }],
    headers: {
      "List-Unsubscribe": `<${ctx.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (result.error) throw new Error(`Resend: ${result.error.message}`);
  await prisma.emailSend.create({ data: { userId: u.id, key: step.key } });
  console.log(`[nurture] sent ${step.key} to ${u.email}`);
}

/** Sign-up hook: mark the enrolment time and send the day-0 welcome. */
export async function enrolInNurture(userId: string): Promise<void> {
  const row = await prisma.user.update({
    where: { id: userId },
    data: { nurtureStartedAt: new Date() },
    select: userSelect,
  });
  // The welcome goes out even while NURTURE_ENABLED is off (every new account
  // got one before the sequence existed); only the later steps wait for it.
  const snap = await snapshotOf(row);
  if (!snap) return;
  const step = nextDueStep(snap, new Date());
  if (step?.key === "welcome") await deliver(snap, step, null);
}

export type NurtureRunResult = {
  dry: boolean;
  considered: number;
  planned: { email: string; step: NurtureStepKey; day: number }[];
  sent: { email: string; step: NurtureStepKey }[];
  errors: { email: string; step: NurtureStepKey; error: string }[];
};

/** The daily pass. `dry` lists what would be sent without sending or granting offers. */
export async function runNurture(opts: { now?: Date; dry?: boolean; limit?: number } = {}): Promise<NurtureRunResult> {
  const now = opts.now ?? new Date();
  const dry = opts.dry ?? !nurtureEnabled();
  const limit = opts.limit ?? 50;
  const oldest = new Date(now.getTime() - (NURTURE_LAST_DAY + NURTURE_GRACE_DAYS + 1) * DAY_MS);

  const rows = await prisma.user.findMany({
    where: { nurtureStartedAt: { not: null, gte: oldest }, emailUnsubscribedAt: null, email: { not: null } },
    select: userSelect,
    orderBy: { nurtureStartedAt: "asc" },
  });

  const result: NurtureRunResult = { dry, considered: rows.length, planned: [], sent: [], errors: [] };

  for (const row of rows) {
    if (result.planned.length >= limit) break;
    const snap = await snapshotOf(row);
    if (!snap) continue;
    const step = nextDueStep(snap, now);
    if (!step) continue;
    result.planned.push({ email: snap.email, step: step.key, day: step.day });
    if (dry) continue;

    try {
      let offer: NurtureEmailContext["offer"] = null;
      if (step.grantsOffer) {
        const granted = await grantOffer(snap.email, "nurture");
        if (!granted) continue; // paid in the meantime
        offer = { code: granted.code, expiresAt: granted.expiresAt, percentOff: granted.percentOff };
      } else if (step.key === "offer-expires" && row.offerCode && row.offerExpiresAt) {
        offer = { code: row.offerCode, expiresAt: row.offerExpiresAt, percentOff: OFFER_PERCENT_OFF };
      }
      await deliver(snap, step, offer);
      result.sent.push({ email: snap.email, step: step.key });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[nurture] ${step.key} to ${snap.email} failed:`, message);
      result.errors.push({ email: snap.email, step: step.key, error: message });
    }
  }

  return result;
}
