"use client";

/**
 * /teachers/licence — the teacher's page: class code to hand out, seats
 * used, every pupil's progress, remove a pupil, rename the class, billing.
 */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchJson } from "@/lib/fetch-json";
import { lessons } from "@/lib/lessons";
import { PLANS } from "@/lib/plans";
import { trackEvent } from "@/lib/analytics";
import type { LicenceView, RosterRow } from "@/lib/licence";
import StartTrialButton from "@/components/classroom/StartTrial";
import InvoiceRequest from "./InvoiceRequest";

export default function LicenceContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [owned, setOwned] = useState<LicenceView[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const justBought = params.get("checkout") === "success";
  const invoiceOpen = params.get("invoice") === "1";

  useEffect(() => {
    // keep ?invoice=1&plan=…&renew=… through sign-in (the sign-in page refuses a #; invoice=1 scrolls to the form anyway)
    if (status === "unauthenticated") {
      const back = `/teachers/licence${window.location.search}`;
      router.push(`/get-started?next=${encodeURIComponent(back)}`);
    }
  }, [status, router]);

  // The form only exists after the licences load, so the #invoice jump happens then.
  useEffect(() => {
    if (owned && invoiceOpen) window.setTimeout(() => document.getElementById("invoice")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [owned, invoiceOpen]);

  const load = () =>
    fetchJson<{ owned: LicenceView[] }>("/api/licence")
      .then((d) => setOwned(d.owned))
      .catch(() => setOwned([]));

  useEffect(() => {
    if (session?.user) void load();
  }, [session]);

  // After checkout the webhook may land a second or two later: poll briefly.
  useEffect(() => {
    if (!justBought || !session?.user) return;
    if (owned && owned.length > 0) return;
    const t = window.setTimeout(load, 2500);
    return () => window.clearTimeout(t);
  }, [justBought, session, owned]);

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function remove(licenceId: string, memberUserId: string) {
    setBusy(true);
    await fetch("/api/licence", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: licenceId, memberUserId }) }).catch(() => null);
    await load();
    setBusy(false);
  }

  async function rename(licenceId: string) {
    setBusy(true);
    await fetch("/api/licence", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: licenceId, schoolName: nameDraft }) }).catch(() => null);
    setRenaming(null);
    await load();
    setBusy(false);
  }

  async function billing() {
    trackEvent("licence_billing_portal");
    const res = await fetch("/api/stripe/create-portal-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnTo: "/teachers/licence" }) });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
  }

  if (status === "loading" || (session && owned === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <p className="font-body text-sand-500 text-sm animate-pulse">Opening the register…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian grain-overlay flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-28 pb-20 flex-1 w-full">
        <p className="font-body text-xs tracking-[0.25em] uppercase text-gold-500 mb-2">Teachers</p>
        <h1 className="font-display text-4xl font-light text-sand-100 mb-2">
          Your <span className="text-gradient-gold font-medium">licence</span>
        </h1>
        <p className="font-body text-sand-400 mb-8">Hand out the class code, watch the chambers light up, and manage billing in one place.</p>

        {justBought && (!owned || owned.length === 0) && (
          <div className="card-ancient p-5 mb-6 border border-gold-500/30">
            <p className="font-body text-sm text-sand-200">Payment received. Your licence is being set up; this page refreshes itself in a moment.</p>
          </div>
        )}

        {owned && owned.length === 0 && !justBought && (
          <div className="card-ancient p-8 text-center">
            <h2 className="font-display text-2xl text-sand-100 mb-2">No licence yet</h2>
            <p className="font-body text-sm text-sand-400 max-w-md mx-auto mb-6">
              A Classroom licence gives you and up to {PLANS.classroom.seats} pupils the full course for a year. A School licence has no seat limit. Not sure
              yet? Run the live class quiz free for 7 days, no card needed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <StartTrialButton location="licence_page" className="btn-primary inline-flex py-3 px-8 text-sm" />
              <Link href="/pricing#teachers" className="btn-secondary inline-flex py-3 px-8 text-sm">
                See licence pricing
              </Link>
            </div>
            <p className="font-body text-xs text-sand-500 mt-5">
              Paying from a school budget?{" "}
              <a href="#invoice" className="text-gold-500 hover:text-gold-300 underline underline-offset-4">
                Pay by invoice or purchase order
              </a>
              .
            </p>
          </div>
        )}

        {owned?.map((l) =>
          l.trial ? (
            <TrialCard key={l.id} licence={l} />
          ) : (
          <section key={l.id} className="card-ancient p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div className="min-w-0">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-1">
                  {PLANS[l.plan].name} licence · {l.active ? (l.status === "past_due" ? "payment overdue" : "active") : "lapsed"}
                </p>
                {renaming === l.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void rename(l.id);
                    }}
                    className="flex gap-2"
                  >
                    <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Class or school name" className="bg-obsidian-lighter border border-gold-700/30 px-3 py-2 font-body text-sm text-sand-100" />
                    <button type="submit" disabled={busy} className="btn-primary py-2 px-4 text-xs">
                      Save
                    </button>
                    <button type="button" onClick={() => setRenaming(null)} className="font-body text-xs text-sand-500">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <h2 className="font-display text-2xl text-sand-100">
                    {l.schoolName ?? "Unnamed class"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setRenaming(l.id);
                        setNameDraft(l.schoolName ?? "");
                      }}
                      className="font-body text-xs text-gold-500 hover:text-gold-300 align-middle ml-2"
                    >
                      rename
                    </button>
                  </h2>
                )}
                <p className="font-body text-xs text-sand-500 mt-1">
                  {l.seats === 0 ? `${l.used} pupils, no limit` : `${l.used} of ${l.seats} seats used`}
                  {l.currentPeriodEnd && ` · ${l.invoiced ? "runs until" : "renews"} ${new Date(l.currentPeriodEnd).toLocaleDateString()}`}
                  {l.currentPeriodEnd && l.invoiced && " · we’ll email you a month before, no auto-renewal"}
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500 mb-1">Class code</p>
                <button type="button" onClick={() => copy(l.code)} className="font-mono text-3xl tracking-[0.2em] text-gold-300 hover:text-gold-200" title="Copy">
                  {l.code}
                </button>
                <p className="font-body text-xs text-sand-500 mt-1">
                  {copied ? "Copied" : "Click to copy"} · pupils enter it at{" "}
                  <Link href={`/join?code=${l.code}`} className="text-gold-500 hover:text-gold-300">
                    /join
                  </Link>
                </p>
              </div>
            </div>

            <Roster rows={l.roster} onRemove={(uid) => remove(l.id, uid)} busy={busy} />

            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gold-700/15">
              <Link href="/teachers/class" className="btn-secondary py-2.5 px-5 text-sm">
                Run a live quiz
              </Link>
              <Link href="/teachers/worksheet" className="btn-secondary py-2.5 px-5 text-sm">
                Print worksheets
              </Link>
              <button type="button" onClick={billing} className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4 ml-auto">
                Manage billing
              </button>
            </div>
          </section>
          ),
        )}

        {owned && <InvoiceRequest defaultOpen={invoiceOpen} userEmail={session?.user?.email} />}

        <p className="font-body text-xs text-sand-500 text-center">
          How we look after teachers&apos; and pupils&apos; data:{" "}
          <Link href="/teachers/privacy" className="text-gold-500 hover:text-gold-300 underline underline-offset-4">
            privacy &amp; safeguarding for schools
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}

/** The free Classroom trial: Classroom mode only, so no class code to hand out; days left and the way to keep it. */
function TrialCard({ licence }: { licence: LicenceView }) {
  // (the same rounding as trialDaysLeft in src/lib/licence.ts, which this client page cannot import: it pulls in Prisma)
  const daysLeft = licence.currentPeriodEnd ? Math.max(0, Math.ceil((new Date(licence.currentPeriodEnd).getTime() - Date.now()) / 86_400_000)) : 0;
  return (
    <section className="card-ancient p-6 md:p-8 mb-8 border border-gold-500/30">
      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-500 mb-1">
        Free Classroom trial · {licence.active ? `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left` : "ended"}
      </p>
      <h2 className="font-display text-2xl text-sand-100 mb-2">{licence.active ? "Classroom mode is open" : "Your free trial has ended"}</h2>
      <p className="font-body text-sm text-sand-400 max-w-xl mb-6">
        {licence.active
          ? `Run the live quiz with your class as often as you like until ${new Date(licence.currentPeriodEnd ?? Date.now()).toLocaleDateString()}. The Classroom licence keeps it open for a year and adds the full course for you and up to ${PLANS.classroom.seats} pupils, with their progress on this page.`
          : `The Classroom licence opens Classroom mode again for a year and adds the full course for you and up to ${PLANS.classroom.seats} pupils, with their progress on this page.`}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/checkout?plan=classroom"
          onClick={() => trackEvent("class_paywall_click", { location: "licence_trial_card" })}
          className="btn-primary py-2.5 px-5 text-sm"
        >
          Get the Classroom licence
        </Link>
        {licence.active && (
          <Link href="/teachers/class" className="btn-secondary py-2.5 px-5 text-sm">
            Run a live quiz
          </Link>
        )}
        <Link href="/pricing#teachers" className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4 self-center ml-auto">
          School licence
        </Link>
      </div>
    </section>
  );
}

function Roster({ rows, onRemove, busy }: { rows: RosterRow[]; onRemove: (userId: string) => void; busy: boolean }) {
  const total = lessons.length;
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-gold-700/30 p-6 text-center">
        <p className="font-body text-sm text-sand-400">No pupils yet. Put the class code on the board and they appear here as they join.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full font-body text-sm">
        <thead>
          <tr className="text-left text-[10px] tracking-[0.15em] uppercase text-sand-500 border-b border-gold-700/20">
            <th className="py-2 pr-3">Pupil</th>
            <th className="py-2 pr-3">Chambers</th>
            <th className="py-2 pr-3">XP</th>
            <th className="py-2 pr-3">Streak</th>
            <th className="py-2 pr-3">Last dug</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.userId} className="border-b border-gold-700/10">
              <td className="py-2.5 pr-3">
                <span className="text-sand-100">{r.name ?? "Unnamed"}</span>
                {r.email && <span className="block text-xs text-sand-500">{r.email}</span>}
              </td>
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-obsidian-lighter overflow-hidden">
                    <div className="h-full bg-gold-500" style={{ width: `${(r.lessonsCompleted / total) * 100}%` }} />
                  </div>
                  <span className="text-sand-300">
                    {r.lessonsCompleted}/{total}
                  </span>
                </div>
              </td>
              <td className="py-2.5 pr-3 text-sand-300">
                {r.xp} <span className="text-sand-600">Lv.{r.level}</span>
              </td>
              <td className="py-2.5 pr-3 text-sand-300">{r.streak > 0 ? `${r.streak}d` : "–"}</td>
              <td className="py-2.5 pr-3 text-sand-400">{r.lastActivityAt ? new Date(r.lastActivityAt).toLocaleDateString() : "never"}</td>
              <td className="py-2.5 text-right">
                <button type="button" disabled={busy} onClick={() => onRemove(r.userId)} className="text-xs text-sand-500 hover:text-terracotta">
                  remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
