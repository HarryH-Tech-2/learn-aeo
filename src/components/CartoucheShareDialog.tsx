"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  cartouchePrintImageFilename,
  cartouchePrintImagePath,
  cartouchePrintThemeById,
  type CartouchePrintThemeId,
} from "@/lib/cartouche-print";
import { cartoucheShareUrl } from "@/lib/share";

/**
 * The Share button's window: page one of the print, on the paper chosen on
 * the card, as a full-size image with the three ways to pass it on. The
 * image is the JPEG from /cartouche-image/print (the same layout as the
 * preview and the PDF), so what is shared is what is printed.
 *
 * Share sends the picture itself where the browser allows files in the
 * share sheet (phones, mostly) and the link otherwise; Download saves the
 * picture; Copy link copies the shareable cartouche page.
 */

type Props = {
  name: string;
  /** A family print's names (two to four, the first is `name`): the picture shows them all. */
  names?: readonly string[];
  theme: CartouchePrintThemeId;
  open: boolean;
  onClose: () => void;
};

type Status = { kind: "idle" } | { kind: "done"; text: string } | { kind: "error"; text: string };

export default function CartoucheShareDialog({ name, names, theme, open, onClose }: Props) {
  const t = cartouchePrintThemeById(theme);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const src = cartouchePrintImagePath(names && names.length > 1 ? names : name, theme);
  const url = cartoucheShareUrl(name);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    if (!open) return;
    setStatus({ kind: "idle" });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function fetchImage(): Promise<Blob> {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`image ${res.status}`);
    return res.blob();
  }

  async function share() {
    if (busy) return;
    setBusy("share");
    setStatus({ kind: "idle" });
    const text = `The name ${name} written in ancient Egyptian hieroglyphs`;
    try {
      if (typeof navigator.share === "function") {
        let shared = false;
        try {
          const file = new File([await fetchImage()], cartouchePrintImageFilename(name, theme), { type: "image/jpeg" });
          if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: text, text, url });
            trackEvent("cartouche_share", { name_length: name.length, theme, method: "native_file" });
            shared = true;
          }
        } catch (err) {
          if ((err as { name?: string })?.name === "AbortError") return;
        }
        if (!shared) {
          await navigator.share({ title: text, text, url });
          trackEvent("cartouche_share", { name_length: name.length, theme, method: "native" });
        }
        setStatus({ kind: "done", text: "Shared." });
      } else {
        await navigator.clipboard.writeText(url);
        trackEvent("cartouche_link_copy", { name_length: name.length, theme, method: "share_fallback" });
        setStatus({ kind: "done", text: "Link copied. Paste it anywhere." });
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        setStatus({ kind: "error", text: "Sharing did not work here. Try Download or Copy link." });
      }
    } finally {
      setBusy(null);
    }
  }

  async function download() {
    if (busy) return;
    setBusy("download");
    setStatus({ kind: "idle" });
    try {
      const blob = await fetchImage();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = cartouchePrintImageFilename(name, theme);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
      trackEvent("cartouche_download", { name_length: name.length, theme });
      setStatus({ kind: "done", text: "Saved." });
    } catch {
      setStatus({ kind: "error", text: "The image could not be saved. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      trackEvent("cartouche_link_copy", { name_length: name.length, theme });
      setStatus({ kind: "done", text: "Link copied." });
    } catch {
      setStatus({ kind: "error", text: `Copy this link: ${url}` });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Share the cartouche of ${name}`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[#08080c]/85 backdrop-blur-sm" />

      <div
        className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden border border-gold-500/30 bg-obsidian shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The print, on its paper, with the room to see it */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-gradient-to-b from-[#15120c] to-[#0a0908] p-5 sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(212,168,50,0.14),transparent_70%)]" />
          <div className="relative aspect-[1240/1754] max-h-[56vh] w-auto sm:max-h-[78vh]">
            <div aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-2 bg-black/60 blur-[3px]" />
            <div className="relative h-full w-full overflow-hidden" style={{ background: t.page }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`The cartouche of ${name} on ${t.label.toLowerCase()} paper`}
                width={1240}
                height={1754}
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-contain transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
              />
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-body text-xs tracking-[0.2em] uppercase" style={{ color: t.muted }}>
                    Drawing…
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The words and the three buttons */}
        <div className="flex w-full shrink-0 flex-col p-5 sm:w-72 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <p className="font-body text-xs text-gold-500 tracking-[0.22em] uppercase">Share it</p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center text-sand-500 transition-colors hover:text-sand-100 focus:outline-none focus-visible:text-sand-100"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M3 3l12 12M15 3L3 15" />
              </svg>
            </button>
          </div>
          <h3 className="font-display text-xl text-sand-100 leading-tight mt-1">The cartouche of {name}</h3>
          <p className="font-body text-sm text-sand-400 mt-2 leading-relaxed">
            On {t.label.toLowerCase()} paper, exactly as the print is laid out. Send the picture, or the link to
            this page.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={share}
              disabled={busy !== null}
              className="btn-primary w-full justify-center py-3 px-4 text-sm disabled:opacity-60"
            >
              {busy === "share" ? "Opening…" : "Share"}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={busy !== null}
              className="btn-secondary w-full justify-center py-3 px-4 text-sm disabled:opacity-60"
            >
              {busy === "download" ? "Saving…" : "Download image"}
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="btn-secondary w-full justify-center py-3 px-4 text-sm"
            >
              Copy link
            </button>
          </div>
          <p
            aria-live="polite"
            className={`font-body text-xs mt-3 min-h-[1rem] break-words ${status.kind === "error" ? "text-terracotta" : "text-sand-500"}`}
          >
            {status.kind === "idle" ? "" : status.text}
          </p>

          <p className="font-body text-xs text-sand-600 mt-auto pt-5 leading-relaxed">
            Want it on your wall? Close this and order the print: A4 giclée, posted, framed if you like.
          </p>
        </div>
      </div>
    </div>
  );
}
