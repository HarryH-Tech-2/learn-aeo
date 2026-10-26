import { recordLead, normaliseEmail, type LeadSource } from "@/lib/leads";

/**
 * A durable record of what happened after each unpaid course checkout expired, so we can tell whether the "you left
 * checkout" emails bring anyone back (before 2026-10-20 nothing recorded them and Resend's log only keeps 30 days).
 *
 * One EmailLead row per (buyer email, outcome, Stripe session), written by the Stripe webhook on
 * checkout.session.expired (src/app/api/webhooks/stripe/route.ts). No schema change: the outcome and the session id
 * live in the source string, and the row's createdAt is when it happened.
 *
 *   checkout-expired:<session id>            every expired course checkout that carried an email
 *   checkout-recovery-sent:<session id>      the 33%-off email with a new offer (sendCheckoutRecoveryEmail)
 *   checkout-recovery-resent:<session id>    the same email repeating an offer they already held (still live)
 *   checkout-reminder-sent:<session id>      the plain no-discount reminder (src/lib/checkout-reminder.ts)
 *   checkout-skipped:<reason>:<session id>   neither email went; reason is the reminder's (cooldown, owns-plan, …)
 *
 * Read the numbers at /admin/marketing ("Checkout recovery"), or straight from the database:
 *   SELECT split_part(source, ':', 1) AS outcome, count(*) FROM "EmailLead" WHERE source LIKE 'checkout-%:%' GROUP BY 1;
 *
 * These rows are a log, not a mailing list: nothing mails EmailLead rows by a "checkout-" source.
 */

export type CheckoutLogOutcome = "expired" | "recovery-sent" | "recovery-resent" | "reminder-sent" | "skipped";

export const CHECKOUT_LOG_OUTCOMES: readonly CheckoutLogOutcome[] = ["expired", "recovery-sent", "recovery-resent", "reminder-sent", "skipped"];

/** Reasons are free text from the webhook; keep them to one safe token so the source stays parseable. */
function cleanReason(reason: string | undefined): string {
  return (reason ?? "unknown").replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "unknown";
}

export function checkoutLogSource(outcome: CheckoutLogOutcome, sessionId: string, reason?: string): LeadSource {
  if (outcome === "skipped") return `checkout-skipped:${cleanReason(reason)}:${sessionId}`;
  return `checkout-${outcome}:${sessionId}`;
}

export type ParsedCheckoutLog = { outcome: CheckoutLogOutcome; reason: string | null; sessionId: string };

export function parseCheckoutLogSource(source: string): ParsedCheckoutLog | null {
  const m = /^checkout-(expired|recovery-sent|recovery-resent|reminder-sent|skipped):(.+)$/.exec(source);
  if (!m) return null;
  const outcome = m[1] as CheckoutLogOutcome;
  if (outcome !== "skipped") return { outcome, reason: null, sessionId: m[2] };
  const i = m[2].indexOf(":");
  if (i < 0) return null;
  return { outcome, reason: m[2].slice(0, i), sessionId: m[2].slice(i + 1) };
}

/**
 * Logs the outcome and keeps it in EmailLead. Never throws (recordLead swallows database errors), so it can sit in the
 * webhook without risking a retry. A session with no email is only logged: there is nobody to key the row by.
 */
export async function recordCheckoutLog(input: {
  email: string | null | undefined;
  sessionId: string;
  outcome: CheckoutLogOutcome;
  reason?: string;
  name?: string | null;
}): Promise<void> {
  const reason = input.outcome === "skipped" ? ` reason=${cleanReason(input.reason)}` : "";
  console.log(`[checkout-recovery] ${input.outcome}${reason} session=${input.sessionId} email=${input.email ?? "(none)"}`);
  if (!input.email) return;
  await recordLead({ email: input.email, source: checkoutLogSource(input.outcome, input.sessionId, input.reason), name: input.name ?? null });
}

/* ── Summary for /admin/marketing ─────────────────────────────────── */

export type CheckoutLogRow = { email: string; source: string; createdAt: Date };
/** A purchase of the course or a paid licence: who and when. */
export type PurchaseRow = { email: string; at: Date };

export type CheckoutOutcomeSummary = {
  outcome: CheckoutLogOutcome;
  /** rows, i.e. sessions */
  sessions: number;
  people: number;
  /** people who bought something after this happened to them */
  laterPurchased: number;
};

export type CheckoutRecoverySummary = {
  outcomes: CheckoutOutcomeSummary[];
  skippedReasons: { reason: string; sessions: number }[];
  firstAt: Date | null;
};

/** Pure, so it is tested without a database. "Later purchased" = any purchase at or after the row's time. */
export function summariseCheckoutLog(rows: CheckoutLogRow[], purchases: PurchaseRow[]): CheckoutRecoverySummary {
  const bought = new Map<string, number[]>();
  for (const p of purchases) {
    const e = normaliseEmail(p.email);
    bought.set(e, [...(bought.get(e) ?? []), p.at.getTime()]);
  }
  const boughtAfter = (email: string, at: Date) => (bought.get(normaliseEmail(email)) ?? []).some((t) => t >= at.getTime());

  const by = new Map<CheckoutLogOutcome, { sessions: number; people: Set<string>; purchased: Set<string> }>();
  const reasons = new Map<string, number>();
  let firstAt: Date | null = null;
  for (const r of rows) {
    const parsed = parseCheckoutLogSource(r.source);
    if (!parsed) continue;
    if (!firstAt || r.createdAt < firstAt) firstAt = r.createdAt;
    const email = normaliseEmail(r.email);
    const s = by.get(parsed.outcome) ?? { sessions: 0, people: new Set<string>(), purchased: new Set<string>() };
    s.sessions += 1;
    s.people.add(email);
    if (boughtAfter(email, r.createdAt)) s.purchased.add(email);
    by.set(parsed.outcome, s);
    if (parsed.reason) reasons.set(parsed.reason, (reasons.get(parsed.reason) ?? 0) + 1);
  }

  return {
    outcomes: CHECKOUT_LOG_OUTCOMES.map((outcome) => {
      const s = by.get(outcome);
      return { outcome, sessions: s?.sessions ?? 0, people: s?.people.size ?? 0, laterPurchased: s?.purchased.size ?? 0 };
    }),
    skippedReasons: [...reasons.entries()].map(([reason, sessions]) => ({ reason, sessions })).sort((a, b) => b.sessions - a.sessions),
    firstAt,
  };
}
