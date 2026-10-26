"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthModal } from "@/components/AuthModal";
import Navbar from "@/components/Navbar";
import { fetchJson } from "@/lib/fetch-json";

export default function CertificateContent() {
  const { data: session, status, update } = useSession();
  const { openAuthModal } = useAuthModal();
  const [allCompleted, setAllCompleted] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  // The name printed is the account name. Accounts made by email link have none, so the
  // learner can type it here (saved to the account); until they do, it reads "Scholar".
  const accountName = session?.user?.name?.trim() ?? "";
  const [typedName, setTypedName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const userName = (typedName ?? accountName).trim() || "Scholar";
  const unsaved = typedName !== null && typedName.trim() !== "" && typedName.trim() !== accountName;

  async function saveName() {
    if (!unsaved || typedName === null) return;
    setSaving(true);
    try {
      const name = typedName.trim().slice(0, 60);
      const res = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (res.ok) await update({ name });
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
          const lessonIds = [
            "expedition-begins",
            "outer-courtyard",
            "pilgrims-gallery",
            "the-treasury",
            "royal-hall",
            "sacred-chapel",
            "hypostyle-hall",
            "inner-sanctum",
          ];
          const completed = lessonIds.every(
            (id) => data.lessons[id]?.completed
          );
          setAllCompleted(completed);
        })
        .catch(() => setAllCompleted(false));
    }
  }, [session]);

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

        // Draw the user's name centred on the template's blank "awarded to" line.
        // Keep these coordinates in sync with the dashboard certificate preview.
        ctx.textAlign = "center";
        ctx.fillStyle = "#1a1a1a";
        // (a long name is set smaller until it fits the line)
        let size = Math.round(img.width * 0.046);
        const maxWidth = img.width * 0.5;
        do {
          ctx.font = `bold ${size}px Georgia, serif`;
        } while (ctx.measureText(userName).width > maxWidth && --size > 12);
        ctx.fillText(userName, img.width * 0.615, img.height * 0.57);

        setImageDataUrl(canvas.toDataURL("image/png"));
      };
      img.src = "/certificate-template.webp";
    }
  }, [allCompleted, userName]);

  if (status === "loading" || allCompleted === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-center">
          <span className="text-5xl block mb-4 animate-pulse">𓋹</span>
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
          <span className="text-5xl block mb-4">𓂀</span>
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
          <span className="text-5xl block mb-4">𓏛</span>
          <h1 className="font-display text-3xl font-light text-sand-100 mb-3">
            Certificate{" "}
            <span className="text-gradient-gold font-medium">Locked</span>
          </h1>
          <p className="font-body text-sm text-sand-400 mb-8">
            Complete all 8 lessons to unlock your Certificate of Hieroglyphics.
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
    link.download = "hieroglyphics-certificate.png";
    link.href = imageDataUrl;
    link.click();
  }

  async function handleShare() {
    if (!imageDataUrl) return;
    const blob = await (await fetch(imageDataUrl)).blob();
    const file = new File([blob], "hieroglyphics-certificate.png", {
      type: "image/png",
    });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: "My Hieroglyphics Certificate",
        text: "I completed the Hieroglyphics Education Course!",
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
          <span className="text-4xl block mb-3">𓋹</span>
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
                alt="Certificate of Hieroglyphics"
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-[1.414/1] flex items-center justify-center">
                <span className="text-5xl animate-pulse">𓋹</span>
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
      </div>
    </div>
  );
}
