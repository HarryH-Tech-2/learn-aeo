import { prisma } from "@/lib/db";
import { isLicenceActive, isTrialLicence } from "@/lib/licence";
import { ACCESS_TEST_GAME, armOf } from "@/lib/access-test";

/**
 * Who has access to the full course, and how.
 *
 *   lifetime   `User.status = ACTIVE` (set only after a successful one-off
 *              checkout) or `Subscription.active` with plan "lifetime". Kept
 *              forever: legacy monthly-plan webhooks can flip the flag back
 *              to false, so EITHER marker counts.
 *   monthly    `Subscription.active` with plan "monthly" and a period end in
 *              the future (plus a grace window for late renewals).
 *   licence    Owner of, or member of, an active Classroom / School licence.
 *   free-unlock  In the free group of the free-unlock test (src/lib/access-test.ts): the course, not
 *              paid extras such as HD pictures (hasPaidAccess). Any paid access above wins over it.
 */

export const MONTHLY_GRACE_DAYS = 3;

export type AccessVia = "lifetime" | "monthly" | "licence-owner" | "licence-member" | "free-unlock" | null;

export type AccessSummary = {
  active: boolean;
  trial: boolean;
  via: AccessVia;
  /** Monthly: when the current period ends */
  periodEnd: string | null;
  /** Licence access: its kind and code (members see the code too) */
  licence: { id: string; kind: string; code: string; schoolName: string | null; owner: boolean } | null;
};

const NO_ACCESS: AccessSummary = { active: false, trial: false, via: null, periodEnd: null, licence: null };

/** Pure: is a monthly row still within its paid period (+ grace)? */
export function monthlyActive(sub: { active: boolean; plan: string; currentPeriodEnd: Date | null }, now = new Date()): boolean {
  if (!sub.active || sub.plan !== "monthly") return false;
  if (!sub.currentPeriodEnd) return true; // period unknown yet (webhook race): trust the flag
  return sub.currentPeriodEnd.getTime() + MONTHLY_GRACE_DAYS * 86_400_000 > now.getTime();
}

export async function checkSubscription(email: string, now = new Date()): Promise<AccessSummary> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      subscription: true,
      licence: true,
      ownedLicences: true,
      gameStates: { where: { game: ACCESS_TEST_GAME }, select: { state: true } },
    },
  });
  if (!user) return NO_ACCESS;

  const sub = user.subscription;
  const trial = sub?.trial === true;

  const lifetime = user.status === "ACTIVE" || (sub?.active === true && (sub.plan ?? "lifetime") === "lifetime");
  if (lifetime) return { active: true, trial, via: "lifetime", periodEnd: null, licence: null };

  if (sub && monthlyActive({ active: sub.active, plan: sub.plan ?? "lifetime", currentPeriodEnd: sub.currentPeriodEnd ?? null }, now)) {
    return { active: true, trial, via: "monthly", periodEnd: sub.currentPeriodEnd?.toISOString() ?? null, licence: null };
  }

  // (the free Classroom trial opens Classroom mode only, not the course)
  const owned = (user.ownedLicences ?? []).find((l) => !isTrialLicence(l) && isLicenceActive(l, now));
  if (owned) {
    return { active: true, trial, via: "licence-owner", periodEnd: owned.currentPeriodEnd?.toISOString() ?? null, licence: { id: owned.id, kind: owned.kind, code: owned.code, schoolName: owned.schoolName, owner: true } };
  }

  const member = user.licence;
  if (member && isLicenceActive(member, now)) {
    return { active: true, trial, via: "licence-member", periodEnd: member.currentPeriodEnd?.toISOString() ?? null, licence: { id: member.id, kind: member.kind, code: member.code, schoolName: member.schoolName, owner: false } };
  }

  if (armOf(user.gameStates?.[0]?.state) === "free") return { active: true, trial, via: "free-unlock", periodEnd: null, licence: null };

  return { ...NO_ACCESS, trial };
}

/** Paid for (or a licence): the free-unlock group has the course but not the paid extras or the customer treatment. */
export function hasPaidAccess(access: Pick<AccessSummary, "active" | "via">): boolean {
  return access.active && access.via !== "free-unlock";
}

export type ActivateOptions = {
  plan?: "lifetime" | "monthly";
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
};

/**
 * Record a paid plan on the user. Lifetime promotes the user to ACTIVE (a
 * permanent marker); monthly leaves status alone so access lapses with the
 * subscription.
 */
export async function activateSubscription(email: string, stripeCustomerId: string, opts: ActivateOptions = {}): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const plan = opts.plan ?? "lifetime";

  if (plan === "lifetime") {
    await prisma.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } });
  }

  const existingSub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  // Never downgrade a lifetime row to monthly.
  const keepLifetime = existingSub?.plan === "lifetime" && existingSub.active && plan === "monthly";
  const data = {
    active: true,
    trial: false,
    stripeCustomerId,
    plan: keepLifetime ? "lifetime" : plan,
    stripeSubscriptionId: opts.stripeSubscriptionId ?? existingSub?.stripeSubscriptionId ?? null,
    currentPeriodEnd: opts.currentPeriodEnd ?? (plan === "monthly" ? existingSub?.currentPeriodEnd ?? null : null),
  };

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { ...data, ...(existingSub?.activatedAt ? {} : { activatedAt: new Date() }) },
    create: { userId: user.id, ...data, activatedAt: new Date() },
  });
}

/** Legacy path (by email): flips the flag; lifetime status survives. */
export async function deactivateSubscription(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  await prisma.subscription.updateMany({ where: { userId: user.id, plan: "monthly" }, data: { active: false, trial: false } });
}

/**
 * A gifted course redeemed (src/app/api/gift/redeem): lifetime access with no Stripe customer of the recipient's own
 * (the giver paid). Keeps any customer id the account already has. "already" when they had lifetime access.
 */
export async function activateGiftedLifetime(userId: string): Promise<"granted" | "already"> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
  if (!user) throw new Error(`no user ${userId}`);
  const sub = user.subscription;
  if (user.status === "ACTIVE" || (!!sub?.active && sub.plan === "lifetime")) return "already";
  await prisma.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } });
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { active: true, trial: false, plan: "lifetime", currentPeriodEnd: null, ...(sub?.activatedAt ? {} : { activatedAt: new Date() }) },
    create: { userId: user.id, active: true, trial: false, plan: "lifetime", activatedAt: new Date() },
  });
  return "granted";
}

/**
 * Take lifetime access away after a full refund or a lost dispute: the reverse of activateSubscription's
 * lifetime branch. Leaves monthly passes and licences alone. Returns whether there was lifetime access to remove.
 */
export async function revokeLifetime(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email }, include: { subscription: true } });
  if (!user) return false;
  const sub = user.subscription;
  const hadLifetime = user.status === "ACTIVE" || (!!sub?.active && sub.plan === "lifetime");
  if (!hadLifetime) return false;
  await prisma.user.update({ where: { id: user.id }, data: { status: "PENDING" } });
  if (sub?.plan === "lifetime") await prisma.subscription.update({ where: { id: sub.id }, data: { active: false } });
  return true;
}

/** Stripe subscription lifecycle for the monthly plan. */
export async function syncMonthlySubscription(stripeSubscriptionId: string, status: string, currentPeriodEnd: Date | null): Promise<boolean> {
  const row = await prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
  if (!row) return false;
  const active = status === "active" || status === "trialing" || status === "past_due";
  await prisma.subscription.update({
    where: { id: row.id },
    data: { active: row.plan === "lifetime" ? row.active : active, currentPeriodEnd },
  });
  return true;
}
