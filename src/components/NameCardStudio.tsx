"use client";

/**
 * "Make it a picture" on the name translator (2026-10-16): the name in a cartouche on the keyboard's card
 * (src/lib/keyboard-card.ts, spell "name"), in ten finishes, with or without the letters under the signs, and as a gift card, with the same ways to keep it
 * as the keyboard (src/components/CardKeep.tsx): plain saved free, a finish by email (lead source "cartouche"),
 * HD for $3.99 or free to course members, and "send it as a puzzle" (the secret-message page).
 *
 * GA4: translator_style, translator_template, translator_keep_open (reason), translator_image (hd),
 * translator_share (method), and from the keep panel translator_email / translator_hd_click / translator_hd_member.
 * Links back from the emails and checkouts land on the name's share page with ?s=&g=&keep=hd|cancelled.
 *
 * 2026-10-18: one box for the picture and the print. The print offer (src/components/CartouchePrintOffer.tsx) sits
 * inside it, embedded, on the paper that matches the chosen background (the scenes are papers too), so there is
 * one picker for both.
 *
 * 2026-10-19: the same box drives the pet, tattoo and couple pages (src/components/NameToolLanding.tsx): each sets its
 * own finishes, cards, heading and print names, and every event carries `page`. "Send a friend their name"
 * (src/lib/referral.ts) sits under the buttons and unlocks the bonus background.
 *
 * 2026-10-20: the box leads with the HD picture ($3.99/£2.99, one tap to Stripe, or a free download for course members;
 * translator_hd_click / translator_hd_member with at "studio"), the free email copy and the puzzle link beside it, and the
 * posted and framed prints folded into one "Want it on the wall?" line under them, opened on a tap (44 had seen the
 * open print card and none bought).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import KeyboardCard from "@/components/KeyboardCard";
import CartouchePrintOffer from "@/components/CartouchePrintOffer";
import { useLocalCurrency } from "@/components/Price";
import { CardPicker, FinishPicker, KeepPanel, downloadPicture, memberHdUrl, startHdCheckout, useCardMember } from "@/components/CardKeep";
import { trackEvent } from "@/lib/analytics";
import { friendLink, unlockBonus } from "@/lib/referral";
import { isCartouchePrintTheme, type CartouchePrintThemeId } from "@/lib/cartouche-print";
import {
  cleanName,
  isFinish,
  isKeyboardStyle,
  isKeyboardTemplate,
  keyboardImageFilename,
  keyboardHdPrice,
  keyboardImagePath,
  keyboardMessagePath,
  type KeyboardStyle,
  type KeyboardStyleId,
  type KeyboardTemplate,
  type KeyboardTemplateId,
} from "@/lib/keyboard-card";

/** The print paper for a background: the same scene where there is one (the stencils and plain print on cream). */
function paperFor(style: KeyboardStyleId): CartouchePrintThemeId {
  return isCartouchePrintTheme(style) ? style : "cream";
}

export type NameCardStudioProps = {
  name: string;
  /** Which page the box is on; every event carries it. */
  page?: "translator" | "pet" | "tattoo" | "couple";
  initialStyle?: KeyboardStyleId;
  /** The finishes to offer (default: the scenes). */
  styles?: readonly KeyboardStyle[];
  initialTemplate?: KeyboardTemplateId;
  /** The cards to offer (default: the season's general cards). */
  templates?: readonly KeyboardTemplate[];
  templatesLabel?: string;
  kicker?: string;
  heading?: ReactNode;
  /** Every name on the print after `name` (the couple page's second name). */
  printNames?: string[];
  /** Offer the posted and framed prints (the tattoo page sells the stencil picture only). */
  print?: boolean;
};

export default function NameCardStudio({
  name,
  page = "translator",
  initialStyle = "pyramids",
  styles,
  initialTemplate = "none",
  templates,
  templatesLabel,
  kicker = "Make it a picture or a print",
  heading,
  printNames,
  print = true,
}: NameCardStudioProps) {
  const typed = cleanName(name);
  const { data: session, status } = useSession();
  const member = useCardMember(true, status);
  const currency = useLocalCurrency();
  const [style, setStyle] = useState<KeyboardStyleId>(initialStyle);
  const [template, setTemplate] = useState<KeyboardTemplateId>(initialTemplate);
  const [letters, setLetters] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hdBusy, setHdBusy] = useState(false);
  const [hdError, setHdError] = useState<string | null>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const upper = typed.join("").toUpperCase();

  // Back from an email or a checkout: the finish, the card and the keep panel as they were.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = q.get("s");
    const g = q.get("g");
    if (isKeyboardStyle(s)) setStyle(s);
    if (isKeyboardTemplate(g)) setTemplate(g);
    if (q.get("l") === "1") setLetters(true);
    const keep = q.get("keep");
    if (keep === "print") {
      // "See it as a print" in the emails and on the HD thank-you page
      window.setTimeout(() => document.getElementById("print")?.scrollIntoView({ behavior: "smooth", block: "start" }), 600);
    }
    if (keep === "hd" || keep === "cancelled") {
      setKeepOpen(true);
      window.setTimeout(() => document.getElementById("keep")?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    }
  }, []);

  if (typed.length === 0) return null;

  const pickStyle = (id: KeyboardStyleId) => {
    if (id === style) return;
    setStyle(id);
    trackEvent("translator_style", { style: id, name_length: upper.length, page });
  };

  const pickTemplate = (id: KeyboardTemplateId) => {
    if (id === template) return;
    setTemplate(id);
    trackEvent("translator_template", { template: id, style, name_length: upper.length, page });
  };

  const save = async () => {
    if (saving) return;
    if (isFinish(style) && !member) {
      setKeepOpen(true);
      trackEvent("translator_keep_open", { reason: "finish", style, template, page });
      window.setTimeout(() => document.getElementById("keep")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
      return;
    }
    setSaving(true);
    const hd = isFinish(style) && member;
    const ok = await downloadPicture(
      hd ? memberHdUrl(typed, style, template, "name", letters) : keyboardImagePath({ typed, style, template, spell: "name", letters }),
      keyboardImageFilename(typed, style, hd),
    );
    setSaving(false);
    if (ok) {
      trackEvent("translator_image", { style, template, hd, letters, page });
      if (!isFinish(style)) {
        setKeepOpen(true);
        trackEvent("translator_keep_open", { reason: "saved", style, template, page });
      }
    }
  };

  // The lead button: HD of what is on screen, free for course members, otherwise straight to the checkout.
  const getHd = async () => {
    if (hdBusy) return;
    setHdBusy(true);
    setHdError(null);
    if (member) {
      trackEvent("translator_hd_member", { style, template, at: "studio", page });
      const ok = await downloadPicture(memberHdUrl(typed, style, template, "name", letters), keyboardImageFilename(typed, style, true));
      if (!ok) setHdError("Could not build the picture. Please try again.");
      setHdBusy(false);
      return;
    }
    const failed = await startHdCheckout({ typed, style, template, spell: "name", letters, currency, prefix: "translator", at: "studio", page });
    if (failed) {
      setHdError(failed);
      setHdBusy(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}${keyboardMessagePath(typed, style, "name")}`;
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: "Can you read this name in hieroglyphs?", text: "I wrote a name in hieroglyphs. Can you read it?", url });
        trackEvent("translator_share", { method: "share", style });
        return;
      } catch {
        // cancelled: copy the link instead
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied. Send it to someone and see if they can read the name.");
    } catch {
      setShareNote(url);
    }
    trackEvent("translator_share", { method: "copy", style });
    window.setTimeout(() => setShareNote(null), 6000);
  };

  return (
    <section
      id="name-picture"
      aria-label="Make it a picture"
      className="relative mt-8 scroll-mt-24 w-full border border-gold-600/40 bg-obsidian-light/40 p-5 text-left sm:-mx-24 sm:w-[calc(100%+12rem)] md:p-7"
    >
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">{kicker}</p>
      <h2 className="mt-1 font-display text-2xl text-sand-100 md:text-3xl">
        {heading ?? <>Put {upper} over the pyramids, among the stars or on a temple wall</>}
      </h2>
      <KeyboardCard
        typed={typed}
        style={style}
        template={template}
        spell="name"
        letters={letters}
        className="mt-5 border border-gold-600/40 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)]"
        label={`The cartouche of ${upper}`}
      />
      <div className="mt-4 space-y-3">
        <FinishPicker
          style={style}
          onPick={pickStyle}
          styles={styles}
          // the bonus scene belongs with the scenes, not with a page's own finishes (the tattoo stencils)
          onLocked={styles ? undefined : () => {
            trackEvent("referral_locked_tap", { page });
            document.getElementById("send-a-friend")?.scrollIntoView({ behavior: "smooth", block: "center" });
            window.setTimeout(() => document.getElementById("friend-name")?.focus(), 450);
          }}
        />
        <CardPicker template={template} onPick={pickTemplate} templates={templates} label={templatesLabel} />
        <label className="flex cursor-pointer items-center gap-2 font-body text-[13px] text-sand-400">
          <input
            type="checkbox"
            checked={letters}
            onChange={(e) => {
              setLetters(e.target.checked);
              trackEvent("translator_letters", { on: e.target.checked, style });
            }}
            className="accent-[#d4a832]"
          />
          English letters under the signs
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={getHd}
          disabled={hdBusy}
          className="inline-flex items-center justify-center bg-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-black shadow-lg transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          {hdBusy ? (member ? "Drawing it…" : "Opening checkout…") : member ? "Download it in HD" : `Get it in HD · ${keyboardHdPrice(currency)}`}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="border border-gold-500 bg-gold-500/15 px-4 py-2 font-body text-sm font-semibold text-gold-200 transition-colors hover:bg-gold-500/25 disabled:opacity-50"
        >
          {saving ? "Drawing it…" : isFinish(style) && !member ? "Email it to me free" : "Save as image"}
        </button>
        <button
          type="button"
          onClick={share}
          className="border border-gold-700/40 px-4 py-2 font-body text-sm text-sand-200 transition-colors hover:border-gold-400 hover:text-gold-300"
        >
          Send it as a puzzle
        </button>
      </div>
      <p className="mt-2 font-body text-[13px] text-sand-400">
        {member
          ? "HD is 2400 × 1260 with no web address on it, included with your course."
          : "HD is 2400 × 1260 with no web address on it, in your inbox in a minute. No account needed."}
      </p>
      {hdError && (
        <p role="alert" className="mt-2 font-body text-sm text-red-300">
          {hdError}
        </p>
      )}
      {shareNote && (
        <p role="status" className="mt-2 break-all font-body text-sm text-gold-300">
          {shareNote}
        </p>
      )}
      {keepOpen && (
        <KeepPanel
          typed={typed}
          style={style}
          template={template}
          member={member}
          currency={currency}
          signedInEmail={session?.user?.email ?? null}
          spell="name"
          letters={letters}
          prefix="translator"
          onPickStyle={(id) => {
            pickStyle(id);
            setKeepOpen(false);
          }}
          onClose={() => setKeepOpen(false)}
        />
      )}
      {/* Only the translator's name is the visitor's own; on the pet, tattoo and couple pages it is someone else's */}
      {!styles && <SendFriendName from={page === "translator" ? name : undefined} page={page} />}
      {/* The print, on the paper that matches the background above */}
      {print && <CartouchePrintOffer name={name} embedded theme={paperFor(style)} initialExtra={printNames} />}
    </section>
  );
}

/**
 * "Send a friend their name": the friend's name in, a link out (the translator written out for them, signed with
 * this visitor's name), and the bonus background unlocks on this browser.
 */
function SendFriendName({ from, page }: { from?: string; page: string }) {
  const [friend, setFriend] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const noteTimer = useRef<number | undefined>(undefined);

  const send = async () => {
    const link = friend.trim() ? friendLink(friend, from, window.location.origin) : null;
    if (!link) {
      setNote("Type your friend's name first (letters only).");
      return;
    }
    const text = "I wrote your name in Egyptian hieroglyphs. Can you read it?";
    let method: "share" | "copy" | "shown" = "copy";
    let shared = false;
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: "Your name in hieroglyphs", text, url: link });
        shared = true;
        method = "share";
      } catch {
        // cancelled: copy the link instead
      }
    }
    if (shared) {
      setNote("Sent. Abu Simbel is unlocked in the backgrounds above.");
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${link}`);
        setNote("Link copied. Paste it to your friend. Abu Simbel is unlocked in the backgrounds above.");
      } catch {
        setNote(link);
        method = "shown";
      }
    }
    unlockBonus();
    trackEvent("referral_send", { method, page, friend_length: friend.trim().length });
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(null), 9000);
  };

  return (
    <div id="send-a-friend" className="mt-6 scroll-mt-28 border border-gold-700/30 bg-black/20 p-4">
      <p className="font-body text-sm text-sand-200">
        <span className="font-semibold text-gold-300">Send a friend their name.</span> We write it out for them{from ? ", from you," : ""} and you unlock a
        bonus background: Abu Simbel at sunrise.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor="friend-name" className="sr-only">
          Your friend&apos;s name
        </label>
        <input
          id="friend-name"
          value={friend}
          onChange={(e) => setFriend(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          maxLength={30}
          placeholder="Your friend's name"
          className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-3 py-2 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void send()}
          className="border border-gold-500 bg-gold-500/15 px-4 py-2 font-body text-sm font-semibold text-gold-200 transition-colors hover:bg-gold-500/25"
        >
          Send it
        </button>
      </div>
      {note && (
        <p role="status" className="mt-2 break-all font-body text-sm text-gold-300">
          {note}
        </p>
      )}
    </div>
  );
}
