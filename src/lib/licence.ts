/**
 * Classroom and School licences. A teacher buys one; pupils join it with a
 * short code and get the full course while it is paid for. The teacher sees
 * every pupil's progress on /teachers/licence.
 *
 * Pure rules up top (tested), Prisma below.
 */
import { prisma } from "@/lib/db";
import { PLANS, type PlanId } from "@/lib/plans";

export const LICENCE_CODE_LENGTH = 8;
export const LICENCE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
export const LICENCE_GRACE_DAYS = 7;

/**
 * The free Classroom trial: a licence row with status "trial" that ends at currentPeriodEnd, no grace and
 * no card. It opens Classroom mode only: it gives no course access (src/lib/subscription.ts) and pupils
 * cannot join it. One per teacher, and only for a teacher who has never held a licence. Buying the
 * Classroom or School licence turns the trial row into the paid one (createLicence), so the code carries on.
 */
export const TRIAL_DAYS = 7;
export const TRIAL_STATUS = "trial";

export type LicenceKind = "classroom" | "school";

export type LicenceLike = {
  status: string;
  currentPeriodEnd: Date | null;
};

export function isLicenceKind(x: unknown): x is LicenceKind {
  return x === "classroom" || x === "school";
}

export function seatsForKind(kind: LicenceKind): number {
  return PLANS[kind].seats ?? 0;
}

export function generateLicenceCode(rnd: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < LICENCE_CODE_LENGTH; i++) out += LICENCE_CODE_ALPHABET[Math.floor(rnd() * LICENCE_CODE_ALPHABET.length)];
  // CL-XXXX-XXXX reads like a class code, not a password
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

/** Accepts "abcd-efgh", "ABCDEFGH", with spaces; returns canonical "ABCD-EFGH" or null. */
export function normaliseLicenceCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length !== LICENCE_CODE_LENGTH) return null;
  for (const ch of s) if (!LICENCE_CODE_ALPHABET.includes(ch)) return null;
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export function isTrialLicence(l: { status: string }): boolean {
  return l.status === TRIAL_STATUS;
}

/** Active, or past_due within the grace window after the period end. A trial runs to its end, no grace. */
export function isLicenceActive(l: LicenceLike, now = new Date()): boolean {
  if (l.status === "canceled") return false;
  if (isTrialLicence(l)) return !!l.currentPeriodEnd && l.currentPeriodEnd.getTime() > now.getTime();
  if (!l.currentPeriodEnd) return l.status === "active";
  const grace = l.currentPeriodEnd.getTime() + LICENCE_GRACE_DAYS * 86_400_000;
  if (l.status === "active") return grace > now.getTime();
  if (l.status === "past_due") return grace > now.getTime();
  return false;
}

/** Only a teacher who has never held a licence, trial or paid, can start a trial. */
export function canStartTrial(owned: LicenceLike[]): boolean {
  return owned.length === 0;
}

/** Whole days left, rounded up, so the last afternoon still reads "1 day left". */
export function trialDaysLeft(endsAt: Date, now = new Date()): number {
  return Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 86_400_000));
}

export type ClassroomAccess = {
  /** Classroom mode is open: a paid licence or a running trial. */
  licensed: boolean;
  /** No licence of any kind yet, so the free trial is on offer. */
  trialAvailable: boolean;
  /** The teacher's trial, running or ended; null if they never started one or have since bought. */
  trial: { active: boolean; endsAt: string; daysLeft: number } | null;
};

export function classroomAccess(owned: LicenceLike[], now = new Date()): ClassroomAccess {
  const licensed = owned.some((l) => isLicenceActive(l, now));
  const trialRow = owned.find(isTrialLicence);
  const trial = trialRow?.currentPeriodEnd
    ? { active: isLicenceActive(trialRow, now), endsAt: trialRow.currentPeriodEnd.toISOString(), daysLeft: trialDaysLeft(trialRow.currentPeriodEnd, now) }
    : null;
  return { licensed, trialAvailable: canStartTrial(owned), trial };
}

/** Can one more pupil join? seats 0 = unlimited. */
export function hasSeat(seats: number, used: number): boolean {
  return seats === 0 || used < seats;
}

export type JoinResult = { ok: true; licenceId: string; kind: string } | { ok: false; reason: "not-found" | "inactive" | "full" | "owner" | "already" | "trial" };

// ─────────────────────────── Prisma ───────────────────────────

export async function createLicence(input: {
  ownerUserId: string;
  kind: LicenceKind;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
}) {
  // A second purchase of the same subscription (webhook retry) must not mint a second licence.
  if (input.stripeSubscriptionId) {
    const existing = await prisma.licence.findUnique({ where: { stripeSubscriptionId: input.stripeSubscriptionId } });
    if (existing) return existing;
  }
  // A teacher buying after (or during) the free trial: the trial row becomes the paid licence.
  const trial = await prisma.licence.findFirst({ where: { ownerUserId: input.ownerUserId, status: TRIAL_STATUS } });
  if (trial) {
    return prisma.licence.update({
      where: { id: trial.id },
      data: {
        kind: input.kind,
        seats: seatsForKind(input.kind),
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        status: "active",
        currentPeriodEnd: input.currentPeriodEnd,
      },
    });
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateLicenceCode();
    const clash = await prisma.licence.findUnique({ where: { code } });
    if (clash) continue;
    return prisma.licence.create({
      data: {
        ownerUserId: input.ownerUserId,
        kind: input.kind,
        seats: seatsForKind(input.kind),
        code,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        status: "active",
        currentPeriodEnd: input.currentPeriodEnd,
      },
    });
  }
  throw new Error("Could not allocate a licence code");
}

export type StartTrialResult = { ok: true; endsAt: Date } | { ok: false; reason: "used" };

/** Start the free Classroom trial for a teacher who has never held a licence. */
export async function startClassroomTrial(ownerUserId: string, now = new Date()): Promise<StartTrialResult> {
  const owned = await prisma.licence.findMany({ where: { ownerUserId }, select: { status: true, currentPeriodEnd: true } });
  if (!canStartTrial(owned)) return { ok: false, reason: "used" };
  const endsAt = new Date(now.getTime() + TRIAL_DAYS * 86_400_000);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateLicenceCode();
    const clash = await prisma.licence.findUnique({ where: { code } });
    if (clash) continue;
    await prisma.licence.create({
      data: { ownerUserId, kind: "classroom", seats: seatsForKind("classroom"), code, status: TRIAL_STATUS, currentPeriodEnd: endsAt },
    });
    return { ok: true, endsAt };
  }
  throw new Error("Could not allocate a licence code");
}

/** The teacher's Classroom mode state: paid, on trial (and how long is left), or trial still on offer. */
export async function classroomAccessFor(userId: string, now = new Date()): Promise<ClassroomAccess> {
  const owned = await prisma.licence.findMany({ where: { ownerUserId: userId }, select: { status: true, currentPeriodEnd: true } });
  return classroomAccess(owned, now);
}

export async function syncLicenceSubscription(stripeSubscriptionId: string, status: string, currentPeriodEnd: Date | null): Promise<boolean> {
  const row = await prisma.licence.findUnique({ where: { stripeSubscriptionId } });
  if (!row) return false;
  const mapped = status === "active" || status === "trialing" ? "active" : status === "past_due" || status === "unpaid" ? "past_due" : "canceled";
  await prisma.licence.update({ where: { id: row.id }, data: { status: mapped, currentPeriodEnd } });
  return true;
}

export async function joinLicence(userId: string, rawCode: string, now = new Date()): Promise<JoinResult> {
  const code = normaliseLicenceCode(rawCode);
  if (!code) return { ok: false, reason: "not-found" };
  const licence = await prisma.licence.findUnique({ where: { code }, include: { _count: { select: { members: true } } } });
  if (!licence) return { ok: false, reason: "not-found" };
  if (licence.ownerUserId === userId) return { ok: false, reason: "owner" };
  // pupil places come with the paid licence, not the free trial
  if (isTrialLicence(licence)) return { ok: false, reason: "trial" };
  if (!isLicenceActive(licence, now)) return { ok: false, reason: "inactive" };
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { licenceId: true } });
  if (me?.licenceId === licence.id) return { ok: false, reason: "already" };
  if (!hasSeat(licence.seats, licence._count.members)) return { ok: false, reason: "full" };
  await prisma.user.update({ where: { id: userId }, data: { licenceId: licence.id } });
  return { ok: true, licenceId: licence.id, kind: licence.kind };
}

export async function leaveLicence(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { licenceId: null } });
}

export async function removeMember(ownerUserId: string, licenceId: string, memberUserId: string): Promise<boolean> {
  const licence = await prisma.licence.findUnique({ where: { id: licenceId } });
  if (!licence || licence.ownerUserId !== ownerUserId) return false;
  await prisma.user.updateMany({ where: { id: memberUserId, licenceId }, data: { licenceId: null } });
  return true;
}

export type RosterRow = {
  userId: string;
  name: string | null;
  email: string | null;
  xp: number;
  level: number;
  lessonsCompleted: number;
  lessonsStarted: number;
  lastActivityAt: string | null;
  streak: number;
};

export type LicenceView = {
  id: string;
  kind: string;
  plan: PlanId;
  code: string;
  schoolName: string | null;
  seats: number;
  used: number;
  status: string;
  active: boolean;
  trial: boolean;
  /** Paid by invoice / purchase order: a fixed year, no subscription, so it does not renew by itself. */
  invoiced: boolean;
  currentPeriodEnd: string | null;
  roster: RosterRow[];
};

/** Licences the user owns, with their rosters. */
export async function licencesOwnedBy(userId: string, now = new Date()): Promise<LicenceView[]> {
  const rows = await prisma.licence.findMany({
    where: { ownerUserId: userId },
    orderBy: { createdAt: "asc" },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          xp: true,
          level: true,
          streak: { select: { currentStreak: true } },
          lessonProgress: { select: { started: true, completed: true, lastActivityAt: true } },
        },
      },
    },
  });
  return rows.map((l) => ({
    id: l.id,
    kind: l.kind,
    plan: (isLicenceKind(l.kind) ? l.kind : "classroom") as PlanId,
    code: l.code,
    schoolName: l.schoolName,
    seats: l.seats,
    used: l.members.length,
    status: l.status,
    active: isLicenceActive(l, now),
    trial: isTrialLicence(l),
    invoiced: !isTrialLicence(l) && !l.stripeSubscriptionId && !!l.stripeCustomerId,
    currentPeriodEnd: l.currentPeriodEnd?.toISOString() ?? null,
    roster: l.members
      .map((m) => {
        const last = m.lessonProgress.reduce<Date | null>((acc, p) => (!acc || p.lastActivityAt > acc ? p.lastActivityAt : acc), null);
        return {
          userId: m.id,
          name: m.name,
          email: m.email,
          xp: m.xp,
          level: m.level,
          lessonsCompleted: m.lessonProgress.filter((p) => p.completed).length,
          lessonsStarted: m.lessonProgress.filter((p) => p.started).length,
          lastActivityAt: last?.toISOString() ?? null,
          streak: m.streak?.currentStreak ?? 0,
        };
      })
      .sort((a, b) => b.xp - a.xp),
  }));
}

export async function renameLicence(ownerUserId: string, licenceId: string, schoolName: string): Promise<boolean> {
  const licence = await prisma.licence.findUnique({ where: { id: licenceId } });
  if (!licence || licence.ownerUserId !== ownerUserId) return false;
  await prisma.licence.update({ where: { id: licenceId }, data: { schoolName: schoolName.trim().slice(0, 80) || null } });
  return true;
}

/** Does this teacher hold a Classroom or School licence, or a running free trial, right now? Gates Classroom mode. */
export async function ownsActiveLicence(userId: string, now = new Date()): Promise<boolean> {
  const rows = await prisma.licence.findMany({ where: { ownerUserId: userId }, select: { status: true, currentPeriodEnd: true } });
  return rows.some((l) => isLicenceActive(l, now));
}

/**
 * A licence paid by invoice (src/lib/licence-invoice.ts) has no subscription: each invoice request gets its own
 * Stripe customer, so the customer id is what makes a retried invoice.paid webhook find the licence it already made.
 */
export async function findLicenceByStripeCustomer(stripeCustomerId: string) {
  return prisma.licence.findFirst({ where: { stripeCustomerId } });
}
