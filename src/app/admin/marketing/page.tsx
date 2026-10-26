import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CAMPAIGN_POSTS } from "@/lib/campaign-posts";
import { TRIAL_STATUS } from "@/lib/licence";
import { summariseCheckoutLog, type CheckoutLogOutcome, type PurchaseRow } from "@/lib/checkout-recovery-log";
import { ACCESS_TEST_GAME, accessTestPercent, armOf, summariseAccessTest, type AccessTestPerson } from "@/lib/access-test";
import { lessons } from "@/lib/lessons";

/**
 * Visitors, sign-ups and paying customers per marketing post (src/lib/campaign.ts records them). Only the
 * owner can open it: everyone else gets a 404. ADMIN_EMAILS (comma-separated) overrides the default.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Marketing posts", robots: { index: false, follow: false } };

const ADMINS = (process.env.ADMIN_EMAILS ?? "h.harrison1993@gmail.com").split(",").map((e) => e.trim().toLowerCase());

type Row = { source: string; campaign: string; label: string; where: string; date: string; visitors: number; signups: number; paid: number };

const key = (source: string | null, campaign: string | null) => `${source ?? ""}|${campaign ?? ""}`;
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");

const OUTCOME_LABELS: Record<CheckoutLogOutcome, string> = {
  expired: "Checkouts expired unpaid",
  "recovery-sent": "33% off email sent (new offer)",
  "recovery-resent": "33% off email sent (offer they already held)",
  "reminder-sent": "Plain reminder sent",
  skipped: "No email sent",
};

/** What happened after each unpaid course checkout expired (src/lib/checkout-recovery-log.ts), and who bought later. */
async function checkoutRecovery() {
  const rows = await prisma.emailLead.findMany({ where: { source: { startsWith: "checkout-" } }, select: { email: true, source: true, createdAt: true } });
  const emails = [...new Set(rows.map((r) => r.email))];
  const [subs, licences] = emails.length
    ? await Promise.all([
        prisma.subscription.findMany({ where: { active: true, user: { email: { in: emails } } }, select: { activatedAt: true, createdAt: true, user: { select: { email: true } } } }),
        prisma.licence.findMany({ where: { status: { not: TRIAL_STATUS }, owner: { email: { in: emails } } }, select: { createdAt: true, owner: { select: { email: true } } } }),
      ])
    : [[], []];
  const purchases: PurchaseRow[] = [
    ...subs.flatMap((s) => (s.user.email ? [{ email: s.user.email, at: s.activatedAt ?? s.createdAt }] : [])),
    ...licences.flatMap((l) => (l.owner.email ? [{ email: l.owner.email, at: l.createdAt }] : [])),
  ];
  return summariseCheckoutLog(rows, purchases);
}

/** The free-unlock test (src/lib/access-test.ts): both groups side by side, and the free group's emails to match
 *  against Buy Me a Coffee supporters (donations are not recorded here). */
async function accessTest() {
  const freeLessons = new Set(lessons.filter((l) => l.isFree).map((l) => l.id));
  const rows = await prisma.gameState.findMany({
    where: { game: ACCESS_TEST_GAME },
    select: {
      state: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          status: true,
          subscription: { select: { active: true } },
          lessonProgress: { select: { lessonId: true, completed: true, xpEarned: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  const people: AccessTestPerson[] = rows.flatMap((r) => {
    const arm = armOf(r.state);
    if (!arm) return [];
    const lp = r.user.lessonProgress;
    return [
      {
        arm,
        email: r.user.email,
        started: lp.some((p) => p.completed || p.xpEarned > 0),
        lesson1Done: lp.some((p) => p.completed && freeLessons.has(p.lessonId)),
        pastLesson1: lp.some((p) => p.completed && !freeLessons.has(p.lessonId)),
        paid: r.user.status === "ACTIVE" || r.user.subscription?.active === true,
      },
    ];
  });
  return { summary: summariseAccessTest(people), freeEmails: people.filter((p) => p.arm === "free" && p.email).map((p) => p.email!), since: rows[0]?.createdAt ?? null };
}

export default async function MarketingPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || !ADMINS.includes(email)) notFound();

  const paidWhere = { subscription: { is: { active: true } } };
  const [visits, signups, paid, refs, refsPaid, heard, heardPaid] = await Promise.all([
    prisma.campaignVisit.groupBy({ by: ["source", "campaign"], _count: { _all: true } }),
    prisma.user.groupBy({ by: ["signupSource", "signupCampaign"], where: { signupSource: { not: null } }, _count: { _all: true } }),
    prisma.user.groupBy({
      by: ["signupSource", "signupCampaign"],
      where: { signupSource: { not: null }, subscription: { is: { active: true } } },
      _count: { _all: true },
    }),
    // everyone, not just tagged links: the site they first came from and what they told us (src/lib/referrer.ts)
    prisma.user.groupBy({ by: ["signupReferrer"], where: { signupReferrer: { not: null } }, _count: { _all: true } }),
    prisma.user.groupBy({ by: ["signupReferrer"], where: { signupReferrer: { not: null }, ...paidWhere }, _count: { _all: true } }),
    prisma.user.groupBy({ by: ["heardAbout"], where: { heardAbout: { not: null } }, _count: { _all: true } }),
    prisma.user.groupBy({ by: ["heardAbout"], where: { heardAbout: { not: null }, ...paidWhere }, _count: { _all: true } }),
  ]);
  const [recovery, test] = await Promise.all([checkoutRecovery(), accessTest()]);
  const testPercent = accessTestPercent();
  const sourceRows = (all: { key: string | null; n: number }[], paying: { key: string | null; n: number }[]) =>
    all
      .map((a) => ({ key: a.key ?? "", signups: a.n, paid: paying.find((p) => p.key === a.key)?.n ?? 0 }))
      .sort((a, b) => b.paid - a.paid || b.signups - a.signups);
  const referrerRows = sourceRows(
    refs.map((r) => ({ key: r.signupReferrer, n: r._count._all })),
    refsPaid.map((r) => ({ key: r.signupReferrer, n: r._count._all })),
  );
  const heardRows = sourceRows(
    heard.map((r) => ({ key: r.heardAbout, n: r._count._all })),
    heardPaid.map((r) => ({ key: r.heardAbout, n: r._count._all })),
  );

  const rows = new Map<string, Row>();
  const row = (source: string, campaign: string) => {
    const k = key(source, campaign);
    if (!rows.has(k)) {
      const post = CAMPAIGN_POSTS.find((p) => p.source === source && p.campaign === campaign);
      rows.set(k, { source, campaign, label: post?.label ?? (campaign || "(no campaign)"), where: post?.where ?? source, date: post?.date ?? "", visitors: 0, signups: 0, paid: 0 });
    }
    return rows.get(k)!;
  };
  CAMPAIGN_POSTS.forEach((p) => row(p.source, p.campaign));
  visits.forEach((v) => (row(v.source, v.campaign).visitors = v._count._all));
  signups.forEach((s) => (row(s.signupSource ?? "", s.signupCampaign ?? "").signups = s._count._all));
  paid.forEach((s) => (row(s.signupSource ?? "", s.signupCampaign ?? "").paid = s._count._all));

  const list = [...rows.values()].sort((a, b) => b.signups - a.signups || b.visitors - a.visitors || a.date.localeCompare(b.date));
  const total = list.reduce((t, r) => ({ visitors: t.visitors + r.visitors, signups: t.signups + r.signups, paid: t.paid + r.paid }), { visitors: 0, signups: 0, paid: 0 });

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-16 font-body text-sand-200">
      <h1 className="font-display text-3xl sm:text-4xl text-sand-100 mb-2">Marketing posts</h1>
      <p className="text-sm text-sand-400 mb-8 max-w-2xl">
        Visitors are browsers that landed from the post&apos;s tagged link (counted once each). Sign-ups are accounts
        created within 30 days of that visit, credited to the last post they came from. Paid means they have an active
        plan now. Updated live.
      </p>

      <div className="overflow-x-auto border border-gold-700/30">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-gold-400 bg-black/20">
            <tr>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Where</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Visitors</th>
              <th className="px-4 py-3 text-right">Sign-ups</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Paid</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={key(r.source, r.campaign)} className="border-t border-gold-700/15">
                <td className="px-4 py-3 text-sand-100">
                  {r.label}
                  <div className="text-[11px] text-sand-500">
                    {r.source} / {r.campaign || "–"}
                  </div>
                </td>
                <td className="px-4 py-3">{r.where}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.visitors}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.signups}</td>
                <td className="px-4 py-3 text-right tabular-nums">{pct(r.signups, r.visitors)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.paid}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gold-700/40 text-sand-100 font-semibold">
              <td className="px-4 py-3" colSpan={3}>
                All tagged links
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{total.visitors}</td>
              <td className="px-4 py-3 text-right tabular-nums">{total.signups}</td>
              <td className="px-4 py-3 text-right tabular-nums">{pct(total.signups, total.visitors)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{total.paid}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h2 className="font-display text-2xl text-sand-100 mt-14 mb-2">Where every account came from</h2>
      <p className="text-sm text-sand-400 mb-6 max-w-2xl">
        From 16 Oct 2026. First site that sent them (only where measurement is allowed: everywhere outside the UK/EU,
        after &ldquo;Accept all&rdquo; there), and their own answer to &ldquo;How did you find us?&rdquo; on the dashboard.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          { title: "First came from", rows: referrerRows },
          { title: "They told us", rows: heardRows },
        ].map((t) => (
          <div key={t.title} className="overflow-x-auto border border-gold-700/30">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-gold-400 bg-black/20">
                <tr>
                  <th className="px-4 py-3">{t.title}</th>
                  <th className="px-4 py-3 text-right">Sign-ups</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.length === 0 && (
                  <tr>
                    <td className="px-4 py-3 text-sand-500" colSpan={3}>
                      Nothing yet
                    </td>
                  </tr>
                )}
                {t.rows.map((r) => (
                  <tr key={r.key} className="border-t border-gold-700/15">
                    <td className="px-4 py-3 text-sand-100 break-all">{r.key}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.signups}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl text-sand-100 mt-14 mb-2">Checkout recovery</h2>
      <p className="text-sm text-sand-400 mb-6 max-w-2xl">
        Unpaid course checkouts that expired (2 hours after opening) and the email the webhook sent, counted from{" "}
        {recovery.firstAt ? recovery.firstAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "the first one recorded"}.
        Checkouts with no email on them are not counted. Bought later means they have an active course plan or paid licence
        that started after that row. Resend tags these emails checkout=recovery and checkout=reminder.
      </p>
      <div className="overflow-x-auto border border-gold-700/30">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-gold-400 bg-black/20">
            <tr>
              <th className="px-4 py-3">What happened</th>
              <th className="px-4 py-3 text-right">Sessions</th>
              <th className="px-4 py-3 text-right">People</th>
              <th className="px-4 py-3 text-right">Bought later</th>
              <th className="px-4 py-3 text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {recovery.outcomes.map((o) => (
              <tr key={o.outcome} className="border-t border-gold-700/15">
                <td className="px-4 py-3 text-sand-100">
                  {OUTCOME_LABELS[o.outcome]}
                  {o.outcome === "skipped" && recovery.skippedReasons.length > 0 && (
                    <div className="text-[11px] text-sand-500">{recovery.skippedReasons.map((r) => `${r.reason} ${r.sessions}`).join(" · ")}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{o.sessions}</td>
                <td className="px-4 py-3 text-right tabular-nums">{o.people}</td>
                <td className="px-4 py-3 text-right tabular-nums">{o.laterPurchased}</td>
                <td className="px-4 py-3 text-right tabular-nums">{pct(o.laterPurchased, o.people)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-display text-2xl text-sand-100 mt-14 mb-2">Free-unlock test</h2>
      <p className="text-sm text-sand-400 mb-4 max-w-2xl">
        {testPercent > 0 ? `On: ${testPercent}% of new accounts get the whole course free with a coffee ask.` : "Off (ACCESS_TEST_FREE_PERCENT unset): nobody new is assigned."}{" "}
        {test.since ? `Running since ${test.since.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}. ` : ""}
        Paid is a course plan now. Donations are on Buy Me a Coffee: match supporters against the emails below. GA4:
        coffee_ask_view / coffee_click by location, user property access_test.
      </p>
      <div className="overflow-x-auto border border-gold-700/30">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-gold-400 bg-black/20">
            <tr>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3 text-right">Accounts</th>
              <th className="px-4 py-3 text-right">Started</th>
              <th className="px-4 py-3 text-right">Lesson 1 done</th>
              <th className="px-4 py-3 text-right">Past Lesson 1</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Paid rate</th>
            </tr>
          </thead>
          <tbody>
            {test.summary.map((g) => (
              <tr key={g.arm} className="border-t border-gold-700/15">
                <td className="px-4 py-3 text-sand-100">{g.arm === "free" ? "Free + coffee ask" : "Paid course (control)"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{g.accounts}</td>
                <td className="px-4 py-3 text-right tabular-nums">{g.started}</td>
                <td className="px-4 py-3 text-right tabular-nums">{g.lesson1Done}</td>
                <td className="px-4 py-3 text-right tabular-nums">{g.pastLesson1}</td>
                <td className="px-4 py-3 text-right tabular-nums">{g.paid}</td>
                <td className="px-4 py-3 text-right tabular-nums">{pct(g.paid, g.accounts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {test.freeEmails.length > 0 && (
        <details className="mt-3 text-xs text-sand-400">
          <summary className="cursor-pointer">Free group emails ({test.freeEmails.length})</summary>
          <p className="mt-2 break-all font-mono">{test.freeEmails.join(", ")}</p>
        </details>
      )}
    </main>
  );
}
