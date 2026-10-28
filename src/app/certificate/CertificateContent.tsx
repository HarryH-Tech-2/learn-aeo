"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthModal } from "@/components/AuthModal";
import Navbar from "@/components/Navbar";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";
import { fetchJson } from "@/lib/fetch-json";
import { CERTIFICATE } from "@/lib/certificate";
import { formatIssued, linkedInAddUrl } from "@/lib/certificate-issue";

type IssuedCertificate = { code: string; name: string; issuedAt: string; url: string };

export default function CertificateContent() {
  const { data: session, status, update } = useSession();
  const { openAuthModal } = useAuthModal();
  const [allCompleted, setAllCompleted] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  // The issued record (code, date, verification URL), from POST /api/certificate.
  const [cert, setCert] = useState<IssuedCertificate | null>(null);
  const [copied, setCopied] = useState(false);

  // The name printed is the account name. Accounts made by email link have none, so the
  // learner can type it here (saved to the account); until they do, it reads "Learner".
  const accountName = session?.user?.name?.trim() ?? "";
  const [typedName, setTypedName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const userName = (typedName ?? accountName).trim() || "Learner";
  const unsaved = typedName !== null && typedName.trim() !== "" && typedName.trim() !== accountName;

  async function saveName() {
    if (!unsaved || typedName === null) return;
    setSaving(true);
    try {
      const name = typedName.trim().slice(0, 60);
      const res = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (res.ok) {
        await update({ name });
        issue();
      }
    } catch {
      /* the certificate still carries the typed name; only the account copy failed */
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchJson<{ lessons: Record<string, { completed: boolean }> }>("/api/progress")
        .then((data) => {
          const lessonIds = LESSON_CATALOG.map((l) => l.id);
          const completed = lessonIds.every(
            (id) => data.lessons[id]?.completed
          );
          setAllCompleted(completed);
        })
        .catch(() => setAllCompleted(false));
    }
  }, [session]);

  // Issue (or fetch) the certificate record. The server checks every lesson is complete; the
  // name on the record follows the account, so this runs again after a name save.
  function issue() {
    fetchJson<IssuedCertificate>("/api/certificate", { method: "POST" })
      .then(setCert)
      .catch(() => setCert(null));
  }

  useEffect(() => {
    if (allCompleted) issue();
  }, [allCompleted]);

  useEffect(() => {
    if (allCompleted && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Draw the user's name centered on the template's gold name line (CERTIFICATE, shared
        // with the dashboard preview).
        ctx.textAlign = "center";
        ctx.fillStyle = CERTIFICATE.nameColor;
        // (a long name is set smaller until it fits the line)
        let size = Math.round(img.width * CERTIFICATE.nameSize);
        const maxWidth = img.width * CERTIFICATE.nameMaxWidth;
        do {
          ctx.font = `${size}px ${CERTIFICATE.nameFont}`;
        } while (ctx.measureText(userName).width > maxWidth && --size > 12);
        ctx.fillText(userName, img.width * CERTIFICATE.nameX, img.height * CERTIFICATE.nameY);

        // The issue date and verification URL, once the record exists.
        if (cert) {
          ctx.font = `${Math.round(img.width * CERTIFICATE.metaSize)}px ${CERTIFICATE.metaFont}`;
          ctx.fillStyle = CERTIFICATE.metaColor;
          ctx.fillText(`Issued ${formatIssued(new Date(cert.issuedAt))}`, img.width / 2, img.height * CERTIFICATE.dateY);
          ctx.fillStyle = CERTIFICATE.urlColor;
          ctx.fillText(`Verify: ${cert.url.replace(/^https?:\/\//, "")}`, img.width / 2, img.height * CERTIFICATE.urlY);
        }

        setImageDataUrl(canvas.toDataURL("image/png"));
      };
      img.src = CERTIFICATE.src;
    }
  }, [allCompleted, userName, cert]);

  if (status === "loading" || allCompleted === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-center">
          <span className="text-5xl block mb-4 animate-pulse" aria-hidden="true">✦</span>
          <p className="font-body text-sand-500 text-sm">
            Preparing your certificate...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-obsidian grain-overlay">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 text-center">
          <span className="text-5xl block mb-4" aria-hidden="true">✦</span>
          <h1 className="font-display text-3xl text-sand-100 mb-4">
            Sign in to view your certificate
          </h1>
          <button
            type="button"
            onClick={() => openAuthModal({ mode: "signin", next: "/certificate" })}
            className="btn-primary py-3 px-8 text-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!allCompleted) {
    return (
      <div className="min-h-screen bg-obsidian grain-overlay">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 text-center">
          <span className="text-5xl block mb-4" aria-hidden="true">✦</span>
          <h1 className="font-display text-3xl font-light text-sand-100 mb-3">
            Certificate{" "}
            <span className="text-gradient-gold font-medium">Locked</span>
          </h1>
          <p className="font-body text-sm text-sand-400 mb-8">
            Complete all 8 lessons to unlock your Learn AEO Certificate.
          </p>
          <Link href="/dashboard" className="btn-primary py-3 px-8 text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  function handleDownload() {
    if (!imageDataUrl) return;
    const link = document.createElement("a");
    link.download = "learn-aeo-certificate.png";
    link.href = imageDataUrl;
    link.click();
  }

  async function handleShare() {
    if (!imageDataUrl) return;
    const blob = await (await fetch(imageDataUrl)).blob();
    const file = new File([blob], "learn-aeo-certificate.png", {
      type: "image/png",
    });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: "My Learn AEO Certificate",
        text: "I completed the Learn AEO course!",
        files: [file],
      });
    } else {
      handleDownload();
    }
  }

  return (
    <div className="min-h-screen bg-obsidian grain-overlay">
      <Navbar />
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <span className="text-4xl block mb-3" aria-hidden="true">✦</span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-sand-100 mb-2">
            Congratulations,{" "}
            <span className="text-gradient-gold font-medium">
              {userName.split(" ")[0]}
            </span>
          </h1>
          <p className="font-body text-sand-400 font-light">
            You have completed all 8 lessons. Here is your certificate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-px bg-gradient-to-b from-gold-500/30 via-gold-500/10 to-gold-500/30 blur-sm" />
          <div className="relative border border-gold-700/30 overflow-hidden bg-obsidian-light">
            {imageDataUrl ? (
              <img
                src={imageDataUrl}
                alt="Learn AEO Certificate"
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-[1.414/1] flex items-center justify-center">
                <span className="text-5xl animate-pulse" aria-hidden="true">✦</span>
              </div>
            )}
          </div>
        </motion.div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveName();
          }}
          className="mt-8 flex flex-col sm:flex-row sm:items-end justify-center gap-3"
        >
          <label className="flex-1 max-w-sm">
            <span className="block font-body text-xs tracking-[0.15em] uppercase text-sand-400 mb-1.5">Name on the certificate</span>
            <input
              value={typedName ?? accountName}
              onChange={(e) => setTypedName(e.target.value)}
              maxLength={60}
              autoComplete="name"
              placeholder="Your full name"
              className="w-full bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-4 py-2.5 font-body text-sm text-sand-100 placeholder:text-sand-600"
            />
          </label>
          <button type="submit" disabled={!unsaved || saving} className="btn-secondary py-2.5 px-6 text-sm disabled:opacity-50">
            {saving ? "Saving…" : "Save to my account"}
          </button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mt-6"
        >
          <button
            onClick={handleDownload}
            disabled={!imageDataUrl}
            className="btn-primary py-3 px-8 text-sm disabled:opacity-50"
          >
            Download
          </button>
          <button
            onClick={handleShare}
            disabled={!imageDataUrl}
            className="btn-secondary py-3 px-8 text-sm disabled:opacity-50"
          >
            Share
          </button>
        </motion.div>

        {cert && (
          <div className="mt-8 text-center">
            <p className="font-body text-xs tracking-[0.15em] uppercase text-sand-400 mb-2">Verification link</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={cert.url} className="font-body text-sm text-cyan-400 hover:text-gold-400 break-all">
                {cert.url}
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(cert.url).then(() => setCopied(true), () => {});
                }}
                className="btn-secondary py-2 px-5 text-xs"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
            <a
              href={linkedInAddUrl(cert.code, new Date(cert.issuedAt))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 font-body text-sm text-sand-300 hover:text-gold-400 underline underline-offset-4"
            >
              Add to LinkedIn
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
