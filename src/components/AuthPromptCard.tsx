"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/AuthModal";

type Props = {
  title: string;
  body: string;
  ctaLabel: string;
  /** Where to send them after sign-up (relative path). */
  next: string;
  /** Go straight here instead of opening the sign-up form. */
  playHref?: string;
  /** Called when the CTA is pressed, before the auth modal opens. */
  onAccept: () => void;
  onDismiss: () => void;
};

/**
 * A small, dismissable sign-up nudge that slides in from the bottom corner
 * (a bottom sheet on phones). It never covers the whole page or locks
 * scrolling; the real sign-up form only opens if they press the button.
 */
export default function AuthPromptCard({ title, body, ctaLabel, next, playHref, onAccept, onDismiss }: Props) {
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <aside
      role="complementary"
      aria-label="Free lesson offer"
      className="prompt-card fixed z-[90] inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[22rem]"
    >
      <div className="relative border border-gold-700/30 bg-obsidian-light/95 backdrop-blur-md shadow-2xl shadow-black/50 p-5 sm:p-6">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold-500/40" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold-500/40" />

        <button
          ref={closeRef}
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-sand-500 hover:text-sand-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-2">Free first lesson</p>
        <h2 className="font-display text-lg font-semibold text-sand-100 leading-snug mb-2 pr-6">{title}</h2>
        <p className="font-body text-sm text-sand-400 font-light leading-relaxed mb-4">{body}</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onAccept();
              if (playHref) router.push(playHref);
              else openAuthModal({ next });
            }}
            className="btn-primary text-sm py-2.5 px-5"
          >
            {ctaLabel}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="font-body text-sm text-sand-500 hover:text-sand-300 transition-colors whitespace-nowrap"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
