"use client";

/**
 * Ways to keep the card (src/lib/keyboard-card.ts), shared by the English keyboard
 * (src/app/hieroglyphics-keyboard/KeyboardTool.tsx) and the name translator (src/components/NameCardStudio.tsx):
 * the finish and gift-card pickers, the keep panel (email it free, or HD without our address), the print
 * offer, and "can you read it back?". The money ladder: plain picture free → a finish by email (a lead) →
 * the HD picture ($3.99, free to course members) → the Cartouche Print → the course.
 *
 * GA4 (every event carries style; the prefix is the page, keyboard_ or translator_; see src/lib/analytics.ts):
 *   keyboard_style / keyboard_template — a finish or card picked
 *   keyboard_keep_open                 — the keep panel shown (reason: finish | saved | link)
 *   keyboard_email                     — "email it to me" sent (lead source "keyboard")
 *   keyboard_hd_click                  — HD bought (then begin_checkout, location keyboard); keyboard_hd_member for members
 *   keyboard_print_open                — the print card opened (then the cartouche_print_* events, source keyboard)
 *   keyboard_read_back_open            — "can you read it back?" started (then the read-back exercise events)
 */
import { useEffect, useState } from "react";
import CartouchePrintOffer from "@/components/CartouchePrintOffer";
import ReadItBack from "@/components/ReadItBack";
import { trackEvent } from "@/lib/analytics";
import { GIFT_UPDATES_LABEL } from "@/lib/gift-updates";
import { NAME_DRIP_LABEL } from "@/lib/name-drip";
import { signForKey } from "@/lib/hieroglyph-keyboard";
import type { TransliterationResult } from "@/lib/hieroglyph-translator";
import type { Currency } from "@/lib/pricing";
import { REFERRAL_UNLOCK_EVENT, isBonusUnlocked } from "@/lib/referral";
import {
  BONUS_KEYBOARD_STYLES,
  KEYBOARD_HD,
  OFFERED_KEYBOARD_STYLES,
  encodeMessage,
  isFinish,
  keyboardHdPrice,
  keyboardImageFilename,
  keyboardStyleById,
  offeredStyles,
  offeredTemplates,
  type CardSpell,
  type KeyboardStyle,
  type KeyboardStyleId,
  type KeyboardTemplate,
  type KeyboardTemplateId,
} from "@/lib/keyboard-card";

/** Fetch a picture and hand it over as a download (the routes draw it; the browser saves it). */
export async function downloadPicture(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
    return true;
  } catch {
    return false;
  }
}

export function memberHdUrl(typed: string[], style: KeyboardStyleId, template: KeyboardTemplateId, spell: CardSpell = "keys", letters = false): string {
  const q = new URLSearchParams({ m: encodeMessage(typed), s: style, g: template });
  if (spell === "name") q.set("t", "n");
  if (letters) q.set("l", "1");
  return `/api/keyboard-image/hd?${q.toString()}`;
}

/**
 * The HD picture's checkout ($3.99/£2.99, Stripe, no account): `{prefix}_hd_click` then begin_checkout, and off to
 * Stripe. Resolves to an error to show if it could not start. `at`: the keep panel, or the translator box's own HD button.
 */
export async function startHdCheckout({
  typed,
  style,
  template,
  spell,
  letters,
  currency,
  prefix,
  at,
  page,
}: {
  typed: string[];
  style: KeyboardStyleId;
  template: KeyboardTemplateId;
  spell: CardSpell;
  letters: boolean;
  currency: Currency;
  prefix: "keyboard" | "translator";
  at: "panel" | "studio";
  /** The name box's page (translator | pet | tattoo | couple), when it is the box's button. */
  page?: string;
}): Promise<string | null> {
  trackEvent(`${prefix}_hd_click`, { style, template, currency, at, ...(page ? { page } : {}) });
  try {
    const res = await fetch("/api/keyboard-image/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys: typed.join(""), style, template, spell, letters }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !data.url) return data.error || "Could not start the checkout. Please try again.";
    trackEvent("begin_checkout", { value: currency === "GBP" ? KEYBOARD_HD.gbp : KEYBOARD_HD.usd, currency, plan: KEYBOARD_HD.id, location: prefix });
    window.location.assign(data.url);
    return null;
  } catch {
    return "Could not start the checkout. Please try again.";
  }
}

/** Course members get the HD picture free: asked once the visitor is known to be signed in. */
export function useCardMember(enabled: boolean, status: string): boolean {
  const [member, setMember] = useState(false);
  useEffect(() => {
    if (!enabled || status !== "authenticated") return;
    fetch("/api/keyboard-image/access")
      .then((r) => (r.ok ? r.json() : { member: false }))
      .then((d: { member?: boolean }) => setMember(d.member === true))
      .catch(() => {});
  }, [enabled, status]);
  return member;
}

/* ── Pickers ───────────────────────────────────────────────────────── */

/** Has this browser sent a friend their name (src/lib/referral.ts)? Read after mount, and live when it happens. */
export function useBonusUnlocked(): boolean {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    setUnlocked(isBonusUnlocked());
    const on = () => setUnlocked(true);
    window.addEventListener(REFERRAL_UNLOCK_EVENT, on);
    return () => window.removeEventListener(REFERRAL_UNLOCK_EVENT, on);
  }, []);
  return unlocked;
}

export function FinishPicker({
  style,
  onPick,
  styles: only,
  onLocked,
}: {
  style: KeyboardStyleId;
  onPick: (id: KeyboardStyleId) => void;
  /** The finishes to offer (the tattoo page offers its stencils first); default: today's, an event's scene first. */
  styles?: readonly KeyboardStyle[];
  /** Show the bonus finishes, locked until a friend is sent their name; called when a locked one is tapped. */
  onLocked?: () => void;
}) {
  // The season is read after mount, as the card picker does, so the server's date never disagrees mid-hydration.
  const [seasonal, setSeasonal] = useState<readonly KeyboardStyle[]>(OFFERED_KEYBOARD_STYLES);
  useEffect(() => setSeasonal(offeredStyles()), []);
  const styles = only ?? seasonal;
  const chosen = keyboardStyleById(style);
  const unlocked = useBonusUnlocked();
  const bonus = onLocked ? BONUS_KEYBOARD_STYLES.filter((b) => !styles.some((s) => s.id === b.id)) : [];
  return (
    <div>
      <div role="radiogroup" aria-label="Finish" className="grid w-full grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2">
        {bonus.map((s) =>
          unlocked ? null : (
            <button
              key={s.id}
              type="button"
              aria-label={`${s.label}: locked. Send a friend their name to unlock it.`}
              title={`${s.label}: send a friend their name to unlock it`}
              onClick={onLocked}
              className="group relative order-last aspect-[1200/630] w-full overflow-hidden border-2 border-dashed border-gold-600/50 opacity-90 transition-all hover:border-gold-400"
              style={{ backgroundColor: s.page, backgroundImage: s.thumb ? `url(${s.thumb})` : undefined, backgroundSize: "100% 100%" }}
            >
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-black/55 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-200 sm:text-[11px]">
                🔒 Bonus
              </span>
            </button>
          ),
        )}
        {[...styles, ...(unlocked ? bonus : [])].map((s) => {
          const on = s.id === style;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={s.label}
              title={s.label}
              onClick={() => onPick(s.id)}
              className={`group relative aspect-[1200/630] w-full overflow-hidden border-2 transition-all ${
                on ? "border-gold-400 shadow-[0_0_0_2px_rgba(212,168,50,0.25)]" : "border-gold-700/30 opacity-80 hover:border-gold-500/70 hover:opacity-100"
              }`}
              style={{ backgroundColor: s.page, backgroundImage: s.thumb ? `url(${s.thumb})` : undefined, backgroundSize: "100% 100%" }}
            >
              <span lang="egy" aria-hidden="true" className="hieroglyph-font absolute inset-0 flex items-center justify-center text-lg sm:text-2xl" style={{ color: s.ink[0] }}>
                𓋹
              </span>
              {s.frame && <span aria-hidden="true" className="absolute inset-[3px] border border-gold-500/70" />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 font-body text-[13px] text-sand-400">
        <span className="font-semibold text-sand-200">{chosen.label}.</span> {chosen.blurb}
        {isFinish(style) && " Preview free; keep it by email, or in HD."}
        {bonus.length > 0 && !unlocked && " The locked one opens when you send a friend their name."}
      </p>
    </div>
  );
}

export function CardPicker({
  template,
  onPick,
  templates,
  label = "Make it a card:",
}: {
  template: KeyboardTemplateId;
  onPick: (id: KeyboardTemplateId) => void;
  /** The cards to offer instead of the season's general ones (the pet page offers dog, cat and any pet). */
  templates?: readonly KeyboardTemplate[];
  label?: string;
}) {
  // The season is read after mount, so the server's date and the visitor's can never disagree mid-hydration.
  const [seasonal, setCards] = useState(() => offeredTemplates(new Date(2000, 5, 1)));
  useEffect(() => setCards(offeredTemplates()), []);
  const cards = templates ?? seasonal;
  if (cards.length === 0) return null;
  return (
    <div role="radiogroup" aria-label={label.replace(/:$/, "")} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 font-body text-[13px] text-sand-400">{label}</span>
      {cards.map((t) => {
        const on = t.id === template;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(t.id)}
            className={`border px-2.5 py-1 font-body text-xs transition-colors ${
              on ? "border-gold-400 bg-gold-500/20 text-gold-200" : "border-gold-700/30 text-sand-300 hover:border-gold-500/60"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Keep panel ────────────────────────────────────────────────────── */

/** The finishes shown after a plain picture is saved: the scenes first. */
const SAVED_TEASERS: KeyboardStyleId[] = ["pyramids", "stars", "treasure", "papyrus"];

export function KeepPanel({
  typed,
  style,
  template,
  member,
  currency,
  signedInEmail,
  onPickStyle,
  onClose,
  spell = "keys",
  letters = false,
  prefix = "keyboard",
}: {
  /** "name": the translator's spelling, in a cartouche. */
  spell?: CardSpell;
  /** The English letters under each sign. */
  letters?: boolean;
  /** The page, for the events: keyboard_email, translator_email… */
  prefix?: "keyboard" | "translator";
  typed: string[];
  style: KeyboardStyleId;
  template: KeyboardTemplateId;
  member: boolean;
  currency: Currency;
  signedInEmail: string | null;
  onPickStyle: (id: KeyboardStyleId) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(signedInEmail ?? "");
  // The Christmas prints email: only for those who tick it (src/lib/gift-updates.ts)
  const [updates, setUpdates] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "email" | "hd">("");
  const [error, setError] = useState<string | null>(null);
  const s = keyboardStyleById(style);
  const keys = typed.join("");

  // Plain, just saved: show what the other finishes look like.
  if (!isFinish(style)) {
    return (
      <div className="relative mt-4 border border-gold-600/40 bg-gold-500/[0.07] px-5 py-4">
        <CloseButton onClose={onClose} />
        <p className="pr-8 font-body text-sm text-sand-100 sm:text-base">Saved. Want it over the pyramids, among the stars or in pharaoh&rsquo;s gold?</p>
        <div className="mt-3 flex gap-2">
          {SAVED_TEASERS.map(keyboardStyleById).map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => onPickStyle(x.id)}
              className="aspect-[1200/630] w-1/4 max-w-[120px] border border-gold-700/40 transition-colors hover:border-gold-400"
              style={{ backgroundImage: `url(${x.thumb})`, backgroundSize: "100% 100%" }}
              aria-label={`Try ${x.label}`}
              title={x.label}
            />
          ))}
        </div>
      </div>
    );
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy("email");
    setError(null);
    try {
      const res = await fetch("/api/keyboard-image/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, keys, style, template, spell, letters, updates }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not send it. Please try again.");
      setSent(email);
      trackEvent(`${prefix}_email`, { style, template, total: typed.filter((k) => k !== " ").length, updates });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send it. Please try again.");
    } finally {
      setBusy("");
    }
  }

  async function buyHd() {
    if (busy) return;
    if (member) {
      setBusy("hd");
      trackEvent(`${prefix}_hd_member`, { style, template, at: "panel" });
      const ok = await downloadPicture(memberHdUrl(typed, style, template, spell, letters), keyboardImageFilename(typed, style, true));
      if (!ok) setError("Could not build the picture. Please try again.");
      setBusy("");
      return;
    }
    setBusy("hd");
    setError(null);
    const failed = await startHdCheckout({ typed, style, template, spell, letters, currency, prefix, at: "panel" });
    if (failed) {
      setError(failed);
      setBusy("");
    }
  }

  return (
    <div id="keep" className="relative mt-4 scroll-mt-28 border border-gold-500/50 bg-gradient-to-b from-gold-500/[0.1] to-obsidian-light/60 px-5 py-5 sm:px-6">
      <CloseButton onClose={onClose} />
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">Keep it on {s.label.toLowerCase()}</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {/* HD first: the cheap instant one is the lead (2026-10-20); the free email copy beside it */}
        <div className="border border-gold-500/50 bg-gold-500/[0.08] p-4">
          <p className="font-display text-lg text-sand-100">
            HD, without our address{" "}
            <span className="font-body text-sm font-normal text-gold-400">· {member ? "included with your course" : keyboardHdPrice(currency)}</span>
          </p>
          <p className="mt-1 font-body text-[13px] leading-relaxed text-sand-400">
            2400 × 1260, sharp enough to print or set as a wallpaper. {member ? "Yours as a course member." : "In your inbox and ready to download in a minute."}
          </p>
          <button
            type="button"
            onClick={buyHd}
            disabled={busy !== ""}
            className="mt-3 inline-flex items-center justify-center bg-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-black transition-colors hover:bg-gold-400 disabled:opacity-60"
          >
            {busy === "hd" ? (member ? "Drawing it…" : "Opening checkout…") : member ? "Download HD" : `Get it in HD · ${keyboardHdPrice(currency)}`}
          </button>
        </div>
        {/* Free, for an email address */}
        <div className="border border-gold-700/30 bg-obsidian/40 p-4">
          <p className="font-display text-lg text-sand-100">Email it to me <span className="font-body text-sm font-normal text-gold-400">· free</span></p>
          <p className="mt-1 font-body text-[13px] leading-relaxed text-sand-400">The picture, ready to share, with our web address in the corner. No newsletter.</p>
          {sent ? (
            <p role="status" className="mt-3 font-body text-sm text-gold-300">
              Sent to {sent}. It should land in a minute; check the spam folder if not.
            </p>
          ) : (
            <form onSubmit={sendEmail} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="kb-keep-email" className="sr-only">
                Email address
              </label>
              <input
                id="kb-keep-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-3 py-2 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none"
              />
              <button type="submit" disabled={busy !== ""} className="border border-gold-500 px-4 py-2 font-body text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/15 disabled:opacity-50">
                {busy === "email" ? "Sending…" : "Send it"}
              </button>
            </form>
          )}
          {!sent && <GiftUpdatesBox id="kb-keep-updates" checked={updates} onChange={setUpdates} name={spell === "name"} />}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 font-body text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * "Also email me once when Christmas prints open": unticked unless the visitor ticks it. On a name (`name`), the
 * same box also asks for the three-email name follow-up (src/lib/name-drip.ts), which includes the Christmas news.
 */
export function GiftUpdatesBox({
  id,
  checked,
  onChange,
  name = false,
  large = false,
}: {
  id: string;
  checked: boolean;
  onChange: (on: boolean) => void;
  name?: boolean;
  large?: boolean;
}) {
  // `large`: a bigger tick and text, for the translator's email box where few ticked the small one
  return (
    <label
      htmlFor={id}
      className={`mt-2.5 flex cursor-pointer items-start font-body leading-snug ${large ? "gap-2.5 text-sm text-sand-300" : "gap-2 text-xs text-sand-400"}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`shrink-0 accent-[#d4a832] ${large ? "mt-px h-5 w-5" : "mt-0.5"}`}
      />
      {name ? NAME_DRIP_LABEL : GIFT_UPDATES_LABEL}
    </label>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} aria-label="Close" className="absolute right-2 top-2 px-2 py-1 font-body text-lg leading-none text-sand-500 hover:text-gold-300">
      ×
    </button>
  );
}

/* ── The print ─────────────────────────────────────────────────────── */

export function PrintTeaser({ name, gift, open, onOpen }: { name: string; gift: boolean; open: boolean; onOpen: () => void }) {
  if (open) {
    return (
      <div id="print-offer" className="scroll-mt-24">
        <CartouchePrintOffer name={name} source="keyboard" bleed={false} />
        <p className="mt-2 font-body text-xs text-sand-500">
          Prints spell a name by its sounds, like the name translator: SH, CH and TH become one sign, so a sign or two can differ from the keyboard.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 flex flex-col gap-3 border border-gold-700/40 bg-obsidian-light/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-body text-sm leading-snug text-sand-100 sm:text-base">
        {gift ? (
          <>
            Giving it? <span className="text-gold-300">{name.toUpperCase()}</span> in a pharaoh&rsquo;s cartouche, printed on fine-art paper and posted, framed or not.
          </>
        ) : (
          <>
            Put it on the wall: <span className="text-gold-300">{name.toUpperCase()}</span> in a pharaoh&rsquo;s cartouche, as a framed print.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex shrink-0 items-center justify-center border border-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/15"
      >
        See it as a print
      </button>
    </div>
  );
}

/* ── Can you read it back? ─────────────────────────────────────────── */

export function keyResults(typed: string[]): TransliterationResult[] {
  return typed.flatMap((k) => {
    const mapping = k === " " ? null : signForKey(k);
    return mapping ? [{ input: k, mapping }] : [];
  });
}

export function ReadBackNudge({ typed, quiz, onStart }: { typed: string[]; quiz: string[] | null; onStart: () => void }) {
  if (quiz) {
    const name = quiz.join("").trim().slice(0, 30);
    return <ReadItBack key={name} name={name} results={keyResults(quiz)} kicker={`You wrote ${name.toUpperCase()}. Can you read it back?`} bleed={false} />;
  }
  const text = typed.join("").trim().toUpperCase();
  return (
    <div className="flex flex-col gap-3 border border-gold-600/50 bg-gold-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-body text-sm leading-snug text-sand-100 sm:text-base">
        You just wrote <span className="text-gold-300">{text.length > 28 ? `${text.slice(0, 28)}…` : text}</span>. Could you read it back without the letters?
      </p>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex shrink-0 items-center justify-center bg-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-black transition-colors hover:bg-gold-400"
      >
        Try it
      </button>
    </div>
  );
}
