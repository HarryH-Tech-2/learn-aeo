"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import AuthCard, { type AuthMode } from "./AuthCard";
import { trackEvent } from "@/lib/analytics";
import { isBuyIntent } from "@/lib/checkout-return";

interface OpenOptions {
  /** "checkout" or a /checkout?plan=… path for buy intent, a relative path to return to, or omitted for the dashboard. */
  next?: string;
  /** false = hard gate: Escape and the backdrop don't dismiss, and the close button leaves the page for
   *  `leaveTo` instead of uncovering it. Default true. */
  dismissible?: boolean;
  /** Where a hard gate's close button goes. Default "/". */
  leaveTo?: string;
  /** "signin" opens with returning-user copy. Default "signup". */
  mode?: AuthMode;
  /** Sign-up subtitle override, e.g. "the door carved with Nancy opens on the other side". */
  intro?: string;
}

const AuthModalContext = createContext<{
  openAuthModal: (opts?: OpenOptions) => void;
  /** True once the modal has been opened during this page view (by any CTA).
   *  The unprompted sign-up card checks this so it never nags someone who
   *  already saw the form and closed it. */
  authModalUsed: boolean;
}>({ openAuthModal: () => {}, authModalUsed: false });

/** Open the sign-up card as a popup instead of navigating to /get-started. */
export function useAuthModal() {
  return useContext(AuthModalContext);
}

function destinationFor(next: string | null): { destination: string; buyIntent: boolean } {
  // "checkout" or any /checkout path: the pricing cards send /checkout?plan=…, which used to get the free-lesson
  // copy ("No payment needed") right after the visitor clicked Buy.
  const buyIntent = isBuyIntent(next);
  // Same rules as /get-started: honor a relative path, never an absolute URL.
  const safeNext = next && /^\/(?!\/)[\w\-./?=&%]*$/.test(next) ? next : null;
  return { destination: buyIntent ? (safeNext ?? "/checkout") : safeNext ?? "/dashboard", buyIntent };
}

/** Matches the .modal-root / .modal-card exit animations in globals.css. */
const CLOSE_MS = 250;

export default function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  // Kept mounted with data-closing while the CSS exit animation plays.
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [dismissible, setDismissible] = useState(true);
  const [leaveTo, setLeaveTo] = useState("/");
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [intro, setIntro] = useState<string | undefined>(undefined);
  const [authModalUsed, setAuthModalUsed] = useState(false);

  const { destination, buyIntent } = destinationFor(next);

  const openAuthModal = useCallback(
    (opts?: OpenOptions) => {
      const { destination: dest } = destinationFor(opts?.next ?? null);
      if (session) {
        // Already signed in — no card to show, just go where they wanted.
        window.location.href = dest;
        return;
      }
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      const nextMode = opts?.mode ?? "signup";
      setNext(opts?.next ?? null);
      setDismissible(opts?.dismissible ?? true);
      setLeaveTo(opts?.leaveTo ?? "/");
      setMode(nextMode);
      setIntro(opts?.intro);
      setClosing(false);
      setOpen(true);
      setAuthModalUsed(true);
      trackEvent(nextMode === "signin" ? "login_modal_shown" : "signup_modal_shown", {
        next: opts?.next ?? "dashboard",
      });
    },
    [session]
  );

  const close = useCallback(() => {
    if (closeTimer.current !== null) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
      setClosing(false);
    }, CLOSE_MS);
  }, []);

  // The provider sits in the root layout, so the modal would follow a navigation (the card's own links, the
  // back button) onto the next page, still open and, for a hard gate, impossible to close. A new page shuts it.
  useEffect(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(false);
    setClosing(false);
  }, [pathname]);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    []
  );

  // Escape closes (when dismissible); lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, dismissible, close]);

  // A session can appear while the modal is up (magic link opened in another
  // tab — next-auth broadcasts it). Finish the journey they started.
  useEffect(() => {
    if (open && session) {
      window.location.href = destination;
    }
  }, [open, session, destination]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, authModalUsed }}>
      {children}
      {open && (
        <div
          className="modal-root fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto py-8"
          data-closing={closing ? "true" : "false"}
          role="dialog"
          aria-modal="true"
          aria-label={mode === "signin" ? "Sign in" : "Create a free account"}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            onClick={dismissible ? close : undefined}
          />

          <div className="modal-card relative w-full max-w-md mx-6 my-auto">
            {/* Card border glow */}
            <div className="absolute -inset-px bg-gradient-to-b from-gold-500/20 via-transparent to-gold-500/20 blur-sm" />
            <AuthCard
              destination={destination}
              buyIntent={buyIntent}
              inlineVerify
              onClose={dismissible ? close : () => router.push(leaveTo)}
              mode={mode}
              onSwitchMode={setMode}
              intro={intro}
            />
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}
