"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent } from "@/lib/analytics";
import {
  PROMPT_MIN_TIME_ON_PAGE_MS,
  PROMPT_STORAGE_KEY,
  parsePromptRecord,
  promptBlockReason,
  serialisePromptRecord,
  type PromptBlockReason,
  type PromptTrigger,
} from "@/lib/auth-prompt";

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (el as HTMLElement).isContentEditable;
}

function readRecord() {
  try {
    return parsePromptRecord(window.localStorage.getItem(PROMPT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeRecord(shownAt: number) {
  try {
    window.localStorage.setItem(PROMPT_STORAGE_KEY, serialisePromptRecord({ shownAt }));
  } catch {
    // Private mode / blocked storage: the card may show again next visit. Acceptable.
  }
}

/**
 * Owns the "may we show the sign-up card?" decision for one page.
 *
 * Call `fire()` from an intent signal (scroll depth, a completed action). It
 * applies the guard rules from src/lib/auth-prompt.ts, records the show so the
 * visitor is never nudged twice in 30 days, and returns `visible` for the
 * page to render <AuthPromptCard>. Temporary blocks (first 10 s on the page,
 * a focused input, session still loading) are retried; final blocks (signed
 * in, modal already used, shown recently) end the matter for this page view.
 */
export function useAuthPrompt(trigger: PromptTrigger) {
  const { status } = useSession();
  const { authModalUsed } = useAuthModal();
  const [visible, setVisible] = useState(false);
  const loadedAt = useRef<number>(0);
  const done = useRef(false);
  const pending = useRef(false);
  const timer = useRef<number | null>(null);
  const statusRef = useRef(status);
  const modalUsedRef = useRef(authModalUsed);
  statusRef.current = status;
  modalUsedRef.current = authModalUsed;

  useEffect(() => {
    loadedAt.current = Date.now();
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  /** Evaluate the rules now; show the card if allowed. Returns why not otherwise. */
  const attempt = useCallback((): PromptBlockReason | "loading" => {
    if (done.current) return "recently_shown";
    if (statusRef.current === "loading") return "loading";
    const now = Date.now();
    const reason = promptBlockReason({
      signedIn: statusRef.current === "authenticated",
      record: readRecord(),
      now,
      pageLoadedAt: loadedAt.current || now,
      inputFocused: isTypingTarget(document.activeElement),
      authModalUsed: modalUsedRef.current,
    });
    if (reason !== "none") return reason;
    done.current = true;
    pending.current = false;
    writeRecord(now);
    trackEvent("signup_prompt_shown", { trigger });
    setVisible(true);
    return "none";
  }, [trigger]);

  const retryRef = useRef<() => void>(() => {});
  retryRef.current = () => {
    if (!pending.current) return;
    const reason = attempt();
    if (reason === "none") return;
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (reason === "too_soon" || reason === "loading") {
      const wait =
        reason === "loading"
          ? 500
          : Math.max(100, loadedAt.current + PROMPT_MIN_TIME_ON_PAGE_MS - Date.now() + 50);
      timer.current = window.setTimeout(() => retryRef.current(), wait);
      return;
    }
    if (reason === "typing") {
      const onFocusOut = () => {
        timer.current = window.setTimeout(() => retryRef.current(), 300);
      };
      document.addEventListener("focusout", onFocusOut, { once: true });
      return;
    }
    // Final block for this page view.
    pending.current = false;
    done.current = true;
  };

  /** Call from an intent signal (scroll depth reached, action completed). */
  const fire = useCallback(() => {
    if (done.current || pending.current) return;
    pending.current = true;
    retryRef.current();
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    trackEvent("signup_prompt_dismissed", { trigger });
  }, [trigger]);

  const accept = useCallback(() => {
    setVisible(false);
    trackEvent("signup_prompt_click", { trigger });
  }, [trigger]);

  return { visible, fire, dismiss, accept };
}
