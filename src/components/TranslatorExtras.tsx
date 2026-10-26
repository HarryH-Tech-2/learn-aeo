"use client";

/**
 * Small pieces under the translator's cartouche (2026-10-16):
 *   EmailMyCartouche — "email me my cartouche" straight under it, before people scroll away; sends the name on
 *                      papyrus through /api/keyboard-image/email (lead source "cartouche"), with the unticked
 *                      "Christmas prints" box (src/lib/gift-updates.ts)
 *   PharaohTitle     — the name with two royal epithets (src/lib/pharaoh-title.ts), to share
 *   KeepNameBar      — on phones, once the cartouche has scrolled away: a bar back to "Make it a picture"
 *
 * GA4: translator_email_early, translator_title_view, translator_title_share (method), translator_keep_bar_click.
 */
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { trackEvent } from "@/lib/analytics";
import { pharaohTitle, pharaohTitleText } from "@/lib/pharaoh-title";
import { cartoucheShareUrl } from "@/lib/share";
import { GiftUpdatesBox } from "@/components/CardKeep";

export function EmailMyCartouche({ name }: { name: string }) {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [updates, setUpdates] = useState(false);
  const [state, setState] = useState<"" | "busy" | "sent" | "error">("");

  useEffect(() => {
    if (session?.user?.email) setEmail((e) => e || session.user!.email!);
  }, [session]);

  // A new name is a new cartouche to send.
  useEffect(() => setState((s) => (s === "sent" ? "" : s)), [name]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/keyboard-image/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, keys: name, style: "pyramids", template: "none", spell: "name", updates }),
      });
      if (!res.ok) throw new Error();
      setState("sent");
      trackEvent("translator_email_early", { name_length: name.length, updates });
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="mt-4 font-body text-sm text-gold-300">
        Sent. Your cartouche over the pyramids is on its way to {email}.
      </p>
    );
  }

  return (
    <form onSubmit={send} className="mt-4 flex w-full max-w-md flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <label htmlFor="cartouche-email" className="font-body text-sm text-sand-300 sm:whitespace-nowrap">
        Email me my cartouche
      </label>
      <input
        id="cartouche-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-3 py-2 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "busy"}
        className="border border-gold-500 px-4 py-2 font-body text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/15 disabled:opacity-50"
      >
        {state === "busy" ? "Sending…" : "Send"}
      </button>
      {state === "error" && (
        <span role="alert" className="font-body text-xs text-red-300">
          Could not send it. Please try again.
        </span>
      )}
      <div className="sm:basis-full">
        <GiftUpdatesBox id="cartouche-email-updates" checked={updates} onChange={setUpdates} name large />
      </div>
    </form>
  );
}

export function PharaohTitle({ name }: { name: string }) {
  const [a, b] = pharaohTitle(name);
  const text = pharaohTitleText(name);
  const [note, setNote] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef<string | null>(null);

  // Counted once per name when it is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || seen.current === name) return;
      seen.current = name;
      trackEvent("translator_title_view", { name_length: name.length });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [name]);

  async function share() {
    const url = cartoucheShareUrl(name);
    const message = `My pharaoh title: ${text}`;
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: "My pharaoh title", text: message, url });
        trackEvent("translator_title_share", { method: "share" });
        return;
      } catch {
        // cancelled: copy instead
      }
    }
    try {
      await navigator.clipboard.writeText(`${message}\n${url}`);
      setNote("Copied, with a link to your cartouche.");
    } catch {
      setNote(`${message} ${url}`);
    }
    trackEvent("translator_title_share", { method: "copy" });
    window.setTimeout(() => setNote(null), 5000);
  }

  return (
    <div ref={ref} className="mt-6 w-full max-w-xl border border-gold-700/30 bg-obsidian-light/30 px-5 py-4 text-center">
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">Your pharaoh title</p>
      <p className="mt-2 font-display text-xl leading-snug text-sand-100 md:text-2xl">{text}</p>
      <div className="mt-3 flex justify-center gap-6">
        {[a, b].map((e) => (
          <div key={e.en} className="flex flex-col items-center">
            <span lang="egy" aria-hidden="true" className="hieroglyph-font text-3xl leading-tight text-gold-400">
              {e.glyphs}
            </span>
            <span className="mt-1 font-body text-[11px] italic text-sand-500">{e.translit}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 font-body text-xs text-sand-500">Kings&rsquo; names were followed by praise like this on temple walls.</p>
      <button
        type="button"
        onClick={share}
        className="mt-3 border border-gold-700/40 px-4 py-1.5 font-body text-sm text-sand-200 transition-colors hover:border-gold-400 hover:text-gold-300"
      >
        Share my title
      </button>
      {note && (
        <p role="status" className="mt-2 break-all font-body text-xs text-gold-300">
          {note}
        </p>
      )}
    </div>
  );
}

/**
 * Phones only: once the cartouche (#name-cartouche) is off screen and before "Make it a picture"
 * (#name-picture) or the print card (#print) is on it, a bar to get back to keeping the name.
 */
export function KeepNameBar({ name, glyphs }: { name: string; glyphs: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, boolean>();
    const ids = ["name-cartouche", "name-picture", "print"];
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting);
      const cartouche = document.getElementById("name-cartouche");
      const past = cartouche ? cartouche.getBoundingClientRect().bottom < 0 : false;
      setShow(past && !visible.get("name-cartouche") && !visible.get("name-picture") && !visible.get("print"));
    });
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [name]);

  if (!show) return null;
  return (
    <div data-keep-bar className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gold-600/50 bg-obsidian/95 px-4 py-3 backdrop-blur sm:hidden">
      <span lang="egy" aria-hidden="true" className="hieroglyph-font min-w-0 flex-1 truncate text-2xl text-gold-400">
        {glyphs}
      </span>
      <button
        type="button"
        onClick={() => {
          trackEvent("translator_keep_bar_click", { name_length: name.length });
          document.getElementById("name-picture")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="shrink-0 bg-gold-500 px-4 py-2.5 font-body text-sm font-semibold text-black"
      >
        Keep this name
      </button>
    </div>
  );
}
