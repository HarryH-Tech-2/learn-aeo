"use client";

import { useSession, signOut } from "next-auth/react";
import GuaranteeNote from "@/components/GuaranteeNote";
import Price from "@/components/Price";
import { PLANS } from "@/lib/plans";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchJson } from "@/lib/fetch-json";
import { BADGE_DEFINITIONS, getLevelTitle, getXPForNextLevel } from "@/lib/gamification";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";

type Via = "lifetime" | "monthly" | "yearly" | "free-unlock" | null;
type Subscription = { active: boolean; via?: Via; periodEnd?: string | null; trial: boolean };
type Stats = { xp: number; done: number; badges: number; streak: number };

const PLAN_LABEL: Record<string, string> = {
  monthly: "Monthly plan",
  yearly: "Yearly plan",
  "free-unlock": "Full course, open to you free",
  lifetime: "Lifetime access",
};

export default function AccountContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchJson<Subscription>("/api/stripe/check-subscription")
        .then(setSubscription)
        .catch(() => setSubscription({ active: false, trial: false }));
    }
  }, [session]);

  // Level, lessons and badges for the profile banner (the same /api/me the dashboard reads)
  useEffect(() => {
    if (!session?.user) return;
    fetchJson<{ progress: { xp: number; streak: number; lessons: Record<string, { completed: boolean }> }; badges: unknown[] }>("/api/me")
      .then((d) =>
        setStats({
          xp: d.progress?.xp ?? 0,
          streak: d.progress?.streak ?? 0,
          done: Object.values(d.progress?.lessons ?? {}).filter((l) => l.completed).length,
          badges: Array.isArray(d.badges) ? d.badges.length : 0,
        }),
      )
      .catch(() => setStats(null));
  }, [session]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="mx-auto mb-4 block h-10 w-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" aria-hidden="true" />
          <p className="font-body text-sand-500 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSaveName = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await update({ name });
        setToast("Name updated successfully.");
      }
    } catch {
      setToast("Failed to update name.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      }
    } catch {
      setToast("Failed to delete account.");
      setDeleting(false);
    }
  };

  const openPortal = async () => {
    const res = await fetch("/api/stripe/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnTo: "/account" }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
  };

  const level = stats ? getXPForNextLevel(stats.xp).currentLevel : null;
  const isSubscription = subscription?.via === "monthly" || subscription?.via === "yearly";

  return (
    <div className="min-h-screen grain-overlay flex flex-col">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-gold-500/10 border border-gold-500/30 backdrop-blur-sm"
        >
          <p className="font-body text-sm text-gold-400">{toast}</p>
        </motion.div>
      )}

      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Profile banner */}
          <section aria-labelledby="account-title" className="acct-banner mb-6">
            <div aria-hidden="true" className="acct-banner-art" />
            <div className="relative flex flex-col sm:flex-row sm:items-end gap-5 pt-6">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="acct-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="acct-avatar grid place-items-center">
                  <span className="font-display text-3xl font-bold text-white">
                    {(session.user?.name || session.user?.email || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-body text-xs tracking-[0.25em] uppercase text-cyan-400 mb-1">Your account</p>
                <h1 id="account-title" className="font-display text-3xl md:text-4xl font-bold text-sand-100 truncate">
                  {session.user?.name || "No name set"}
                </h1>
                <p className="font-body text-base text-sand-400 truncate">{session.user?.email}</p>
              </div>
              {level !== null && (
                <span className="acct-level-pill">
                  Lv.{level} · {getLevelTitle(level)}
                </span>
              )}
            </div>
            {stats && (
              <dl className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {[
                  { label: "XP", value: String(stats.xp) },
                  { label: "Lessons", value: `${stats.done}/${LESSON_CATALOG.length}` },
                  { label: "Badges", value: `${stats.badges}/${BADGE_DEFINITIONS.length}` },
                  { label: "Streak", value: `${stats.streak} ${stats.streak === 1 ? "day" : "days"}` },
                ].map((s) => (
                  <div key={s.label} className="acct-stat">
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          {/* Shortcuts */}
          <nav aria-label="Account shortcuts" className="grid grid-cols-3 gap-3 mb-6">
            <Link href="/dashboard" className="acct-shortcut">
              <span aria-hidden="true">🗺️</span>
              City map
            </Link>
            <Link href="/dashboard?tab=badges" className="acct-shortcut">
              <span aria-hidden="true">🏅</span>
              Badges
            </Link>
            <Link href="/dashboard?tab=certificate" className="acct-shortcut">
              <span aria-hidden="true">📜</span>
              Certificate
            </Link>
          </nav>

          {/* Profile */}
          <section className="card-ancient acct-card p-6 mb-6">
            <h2 className="font-display text-xl font-bold text-sand-100 mb-1">Profile</h2>
            <p className="font-body text-sm text-sand-400 mb-5">This name goes on your certificate and the leaderboard.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <label className="block flex-1">
                <span className="font-body text-xs text-sand-400 uppercase tracking-wider">Display name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-xl bg-obsidian border border-gold-700/20 px-4 py-3 font-body text-base text-sand-100 focus:outline-none focus:border-cyan-400/60 transition-colors"
                />
              </label>
              <button
                onClick={handleSaveName}
                disabled={saving || name === session.user?.name}
                className="btn-primary text-sm py-3 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </section>

          {/* Plan */}
          <section className="card-ancient acct-card p-6 mb-6">
            <h2 className="font-display text-xl font-bold text-sand-100 mb-4">Your plan</h2>
            {subscription === null ? (
              <p className="font-body text-sm text-sand-500">Loading...</p>
            ) : subscription.active ? (
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="acct-plan-badge">Active</span>
                  <span className="font-display text-lg font-bold text-sand-100">{PLAN_LABEL[subscription.via ?? "lifetime"] ?? PLAN_LABEL.lifetime}</span>
                </div>
                {isSubscription && subscription.periodEnd && (
                  <p className="font-body text-sm text-sand-400 mt-3">
                    Renews {new Date(subscription.periodEnd).toLocaleDateString()}. Cancel any time in the billing portal.
                  </p>
                )}
                {isSubscription && (
                  <button
                    type="button"
                    onClick={openPortal}
                    className="mt-4 rounded-full font-body text-sm text-cyan-400 border border-cyan-400/40 px-5 py-2.5 hover:bg-cyan-400/10 transition-colors"
                  >
                    Manage billing or cancel
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="acct-plan-badge acct-plan-badge-free">Free</span>
                  <span className="font-display text-lg font-bold text-sand-100">Lesson 1 only</span>
                </div>
                <p className="font-body text-sm text-sand-400 mb-5">
                  Unlock all {LESSON_CATALOG.length} lessons for a one-time payment of <Price />, or <Price plan={PLANS.monthly} /> a month.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <a href="/checkout" className="btn-primary text-sm py-3 px-6 inline-block">
                    Get Lifetime Access
                  </a>
                  <Link href="/pricing" className="font-body text-sm text-sand-400 hover:text-gold-400 underline underline-offset-4">
                    All plans
                  </Link>
                </div>
                <GuaranteeNote align="left" />
              </div>
            )}
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-terracotta/20 bg-terracotta/5 p-6">
            <h2 className="font-display text-xl font-bold text-terracotta mb-2">Danger Zone</h2>
            <p className="font-body text-sm text-sand-500 mb-4">
              Permanently delete your account and all progress. This action cannot be undone. Note: deleting your account does not refund
              your purchase; contact support if you need a refund.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-full font-body text-sm text-terracotta border border-terracotta/30 px-5 py-2.5 hover:bg-terracotta/10 transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="rounded-full font-body text-sm text-white bg-terracotta px-5 py-2.5 hover:bg-terracotta/80 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="font-body text-sm text-sand-400 hover:text-sand-200 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </section>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
