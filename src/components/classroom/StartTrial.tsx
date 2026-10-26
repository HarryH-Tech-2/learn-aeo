"use client";

import { useState } from "react";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent } from "@/lib/analytics";

/** Where the sign-in box sends a signed-out teacher: Classroom mode, which starts the trial on arrival. */
export const TRIAL_RETURN = "/teachers/class?trial=1";

/**
 * Starts the free 7-day Classroom trial (POST /api/licence/trial) and opens Classroom mode.
 * Signed out → the sign-in box, back to Classroom mode with ?trial=1. Events: class_trial_click, class_trial_start
 * (location), class_trial_used when the account has had one already.
 */
export function useStartTrial(location: string) {
  const { openAuthModal } = useAuthModal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(opts: { fromClick?: boolean } = { fromClick: true }) {
    if (busy) return;
    if (opts.fromClick) trackEvent("class_trial_click", { location });
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/licence/trial", { method: "POST" });
      if (res.status === 401) {
        setBusy(false);
        openAuthModal({ next: TRIAL_RETURN });
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; already?: boolean; error?: string; reason?: string };
      if (!res.ok) {
        if (data.reason === "used") trackEvent("class_trial_used", { location });
        setError(data.error ?? "Could not start the trial. Try again in a moment.");
        setBusy(false);
        return;
      }
      if (!data.already) trackEvent("class_trial_start", { location });
      window.location.href = "/teachers/class";
    } catch {
      setError("Could not start the trial. Try again in a moment.");
      setBusy(false);
    }
  }

  return { start, busy, error };
}

/** The plain button version, for /teachers and /teachers/licence. */
export default function StartTrialButton({ location, className = "btn-primary", label = "Start free 7-day trial" }: { location: string; className?: string; label?: string }) {
  const { start, busy, error } = useStartTrial(location);
  return (
    <span className="inline-flex flex-col items-center gap-2">
      <button type="button" onClick={() => void start()} disabled={busy} className={`${className} disabled:opacity-60`}>
        {busy ? "Starting…" : label}
      </button>
      {error && (
        <span className="font-body text-xs text-terracotta max-w-xs text-center">
          {error}{" "}
          <a href="/checkout?plan=classroom" className="text-gold-400 underline underline-offset-4">
            See the licence
          </a>
        </span>
      )}
    </span>
  );
}
