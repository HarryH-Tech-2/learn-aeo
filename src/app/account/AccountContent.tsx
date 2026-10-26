"use client";

import { useSession, signOut } from "next-auth/react";
import GuaranteeNote from "@/components/GuaranteeNote";
import Price from "@/components/Price";
import { PLANS } from "@/lib/plans";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { fetchJson } from "@/lib/fetch-json";

export default function AccountContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    active: boolean;
    via?: "lifetime" | "monthly" | "free-unlock" | null;
    periodEnd?: string | null;
    trial: boolean;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchJson<{ active: boolean; trial: boolean; via?: "lifetime" | "monthly" | "free-unlock" | null; periodEnd?: string | null}>("/api/stripe/check-subscription")
        .then(setSubscription)
        .catch(() => setSubscription({ active: false, trial: false }));
    }
  }, [session]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-center">
          <span className="text-5xl block mb-4 animate-pulse">𓂀</span>
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

  return (
    <div className="min-h-screen bg-obsidian grain-overlay">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gold-500/10 border border-gold-500/30 backdrop-blur-sm"
        >
          <p className="font-body text-sm text-gold-400">{toast}</p>
        </motion.div>
      )}

      <Navbar />

      <div className="max-w-2xl mx-auto px-6 lg:px-8 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">𓁐</span>
              <h1 className="font-body text-xs tracking-[0.2em] uppercase text-gold-500">
                Account
              </h1>
            </div>
          </div>

          {/* Profile Section */}
          <section className="card-ancient p-6 mb-6">
            <h2 className="font-display text-lg font-semibold text-sand-100 mb-4">
              Profile
            </h2>
            <div className="flex items-center gap-4 mb-6">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-14 h-14 rounded-full border border-gold-700/30"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-700/30 flex items-center justify-center">
                  <span className="text-gold-400 font-display text-xl">
                    {(session.user?.name || session.user?.email || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-body text-sm text-sand-100">
                  {session.user?.name || "No name set"}
                </p>
                <p className="font-body text-xs text-sand-500">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="font-body text-xs text-sand-400 uppercase tracking-wider">
                  Display Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full bg-obsidian border border-gold-700/20 px-4 py-2.5 font-body text-sm text-sand-100 focus:outline-none focus:border-gold-500/50 transition-colors"
                />
              </label>
              <button
                onClick={handleSaveName}
                disabled={saving || name === session.user?.name}
                className="btn-primary text-sm py-2.5 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </section>

          {/* Access Section */}
          <section className="card-ancient p-6 mb-6">
            <h2 className="font-display text-lg font-semibold text-sand-100 mb-4">
              Access
            </h2>
            {subscription === null ? (
              <p className="font-body text-sm text-sand-500">Loading...</p>
            ) : subscription.active ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-turquoise" />
                  <span className="font-body text-sm text-sand-100">
                    {subscription.via === "monthly"
                      ? "Expedition Pass"
                      : subscription.via === "free-unlock"
                        ? "Full course, open to you free"
                        : "Lifetime Access"}
                  </span>
                </div>
                {subscription.via === "monthly" && subscription.periodEnd && (
                  <p className="font-body text-xs text-sand-500 mt-2">Renews {new Date(subscription.periodEnd).toLocaleDateString()}. Cancel any time in the billing portal below.</p>
                )}
                {subscription.via === "monthly" && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await fetch("/api/stripe/create-portal-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ returnTo: "/account" }) });
                      const data = await res.json().catch(() => ({}));
                      if (data.url) window.location.href = data.url;
                    }}
                    className="mt-3 font-body text-xs text-gold-500 hover:text-gold-300 underline underline-offset-4"
                  >
                    Manage billing or cancel
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-sand-600" />
                  <span className="font-body text-sm text-sand-100">Not purchased</span>
                </div>
                <p className="font-body text-xs text-sand-500 mb-4">
                  You don&apos;t have lifetime access yet. Unlock the full course for
                  a one-time payment of <Price />, or <Price plan={PLANS.monthly} /> a month.
                </p>
                <a href="/checkout" className="btn-primary text-sm py-2.5 px-5 inline-block">
                  Get Lifetime Access
                </a>
                <a href="/pricing" className="ml-3 font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4">
                  All plans
                </a>
                <GuaranteeNote align="left" />
              </div>
            )}
          </section>

          {/* Danger Zone */}
          <section className="border border-terracotta/20 bg-terracotta/5 p-6">
            <h2 className="font-display text-lg font-semibold text-terracotta mb-2">
              Danger Zone
            </h2>
            <p className="font-body text-xs text-sand-500 mb-4">
              Permanently delete your account and all progress. This action
              cannot be undone. Note: deleting your account does not refund
              your purchase; contact support if you need a refund.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="font-body text-sm text-terracotta border border-terracotta/30 px-5 py-2.5 hover:bg-terracotta/10 transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="font-body text-sm text-white bg-terracotta px-5 py-2.5 hover:bg-terracotta/80 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="font-body text-sm text-sand-400 hover:text-sand-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </div>
  );
}
