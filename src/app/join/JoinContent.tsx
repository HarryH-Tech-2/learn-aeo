"use client";

/**
 * /join?code=ABCD-EFGH — a pupil enters the class code from their teacher
 * and gets the full course while the licence is paid for.
 */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent } from "@/lib/analytics";
import { fetchJson } from "@/lib/fetch-json";
import { normaliseLicenceCode } from "@/lib/licence";

type Member = { kind: string; code: string; schoolName: string | null; teacher: string | null; active: boolean } | null;

export default function JoinContent() {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const params = useSearchParams();
  const [code, setCode] = useState(() => params.get("code") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);
  const [member, setMember] = useState<Member | undefined>(undefined);

  useEffect(() => {
    if (!session?.user) return;
    fetchJson<{ member: Member }>("/api/licence")
      .then((d) => setMember(d.member))
      .catch(() => setMember(null));
  }, [session, joined]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      openAuthModal({ next: `/join?code=${encodeURIComponent(code)}` });
      return;
    }
    const clean = normaliseLicenceCode(code);
    if (!clean) {
      setError("A class code is eight letters or numbers, like ABCD-EFGH.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/licence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: clean }) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not join. Try again.");
        trackEvent("licence_join", { ok: 0, reason: data.reason ?? "error" });
      } else {
        setJoined(data.kind);
        trackEvent("licence_join", { ok: 1, kind: data.kind });
      }
    } catch {
      setError("Could not join. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-obsidian grain-overlay flex flex-col">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 pt-32 pb-20 flex-1 w-full">
        <p className="font-body text-xs tracking-[0.25em] uppercase text-gold-500 mb-2 text-center">Join your class</p>
        <h1 className="font-display text-4xl font-light text-sand-100 text-center mb-3">
          Enter the <span className="text-gradient-gold font-medium">class code</span>
        </h1>
        <p className="font-body text-sand-400 text-center mb-8">
          Your teacher has a code like <span className="font-mono text-sand-200">ABCD-EFGH</span>. Type it in and every chamber opens for you.
        </p>

        {member && member.active && !joined ? (
          <div className="card-ancient p-6 text-center">
            <p className="font-body text-sm text-sand-300">
              You're already in <span className="text-gold-300">{member.schoolName ?? `${member.teacher ?? "your teacher"}'s class`}</span> with code{" "}
              <span className="font-mono text-sand-100">{member.code}</span>.
            </p>
            <Link href="/dashboard" className="btn-primary inline-flex mt-5 py-3 px-8 text-sm">
              Go to your Journey
            </Link>
          </div>
        ) : joined ? (
          <div className="card-ancient p-8 text-center border border-gold-500/40">
            <span className="text-5xl block mb-4" aria-hidden="true">
              𓋹
            </span>
            <h2 className="font-display text-2xl text-sand-100 mb-2">You're in</h2>
            <p className="font-body text-sm text-sand-400 mb-6">All eight chambers, every game and the Journey are open while your class licence runs.</p>
            <Link href="/dashboard" className="btn-primary inline-flex py-3 px-8 text-sm">
              Start digging
            </Link>
          </div>
        ) : (
          <form onSubmit={join} className="card-ancient p-6 md:p-8">
            <label className="block">
              <span className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500">Class code</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABCD-EFGH"
                autoComplete="off"
                spellCheck={false}
                maxLength={9}
                className="mt-2 w-full bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-4 py-3 font-mono text-2xl tracking-[0.3em] text-center text-sand-100 placeholder:text-sand-700"
              />
            </label>
            {error && <p className="font-body text-sm text-terracotta mt-3">{error}</p>}
            <button type="submit" disabled={busy || status === "loading"} className="btn-primary w-full justify-center mt-5 py-3.5 text-sm disabled:opacity-50">
              {session ? (busy ? "Joining…" : "Join the class") : "Sign in free and join"}
            </button>
            <p className="font-body text-xs text-sand-500 mt-4 text-center">
              Teachers: licences are on the{" "}
              <Link href="/pricing" className="text-gold-400 hover:text-gold-300">
                pricing page
              </Link>
              .
            </p>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
