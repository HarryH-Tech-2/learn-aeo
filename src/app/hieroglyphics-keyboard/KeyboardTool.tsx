"use client";

/**
 * The keyboard itself: press a letter (or tap a key on screen) and its sign is added to the wall, with the
 * sign's name and sound beside it. See src/lib/hieroglyph-keyboard.ts for what each key types. The same tool
 * runs the Spanish and French pages (`locale`), with their words from src/lib/hieroglyph-keyboard-i18n.ts.
 *
 * GA4: keyboard_first_key (once per page view, method: keys | screen), keyboard_copy and keyboard_image
 * (total: how many signs), keyboard_to_lesson and keyboard_to_translator (total). Every event carries `locale`.
 *
 * The English page also has (2026-10-16) finishes and gift cards for the wall, the keep panel, the print
 * offer, the secret-message link, "can you read it back?" and the transliteration with real-word spotting:
 * see src/components/CardKeep.tsx and src/lib/keyboard-card.ts. keyboard_share (method: share | copy; style) and
 * keyboard_word_found (word) are counted here. Spanish and French keep the original page.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import KeyboardCard from "@/components/KeyboardCard";
import { useLocalCurrency } from "@/components/Price";
import {
  isFinish,
  keyboardImageFilename,
  keyboardImagePath,
  keyboardMessagePath,
  printableName,
  readCardParams,
  spotWord,
  typedTransliteration,
  type KeyboardStyleId,
  type KeyboardTemplateId,
} from "@/lib/keyboard-card";
import { CardPicker, FinishPicker, KeepPanel, PrintTeaser, ReadBackNudge, downloadPicture, memberHdUrl } from "@/components/CardKeep";
import { trackEvent } from "@/lib/analytics";
import { guestPlayHref } from "@/lib/guest-play";
import { MAX_TYPED, appendKey, signForKey, typedToHieroglyphs, wrapTyped, type KeyboardLocale } from "@/lib/hieroglyph-keyboard";
import { KEYBOARD_STRINGS, keyRows, localizedSign } from "@/lib/hieroglyph-keyboard-i18n";
import { TOOL_PATHS } from "@/lib/i18n";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";
/** Signs typed before the page suggests learning to read them. */
const LESSON_NUDGE_AT = 4;

export default function KeyboardTool({ locale = "en" }: { locale?: KeyboardLocale }) {
  const t = KEYBOARD_STRINGS[locale];
  const [typed, setTyped] = useState<string[]>([]);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [showLetters, setShowLetters] = useState(true);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);
  const pressTimer = useRef<number | undefined>(undefined);

  // The English page's extras (see the header)
  const en = locale === "en";
  const { data: session, status } = useSession();
  const currency = useLocalCurrency();
  const [style, setStyle] = useState<KeyboardStyleId>("plain");
  const [template, setTemplate] = useState<KeyboardTemplateId>("none");
  const [keepOpen, setKeepOpen] = useState(false);
  const [keepIntent, setKeepIntent] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [quiz, setQuiz] = useState<string[] | null>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState(false);
  const wordsFound = useRef(new Set<string>());
  const cardMode = en && (style !== "plain" || template !== "none");

  const signCount = typed.filter((k) => k !== " ").length;
  const last = lastKey ? signForKey(lastKey, locale) : null;
  const lastText = last && lastKey ? localizedSign(last, lastKey, locale) : null;
  const translit = en && signCount > 0 ? typedTransliteration(typed) : "";
  const printName = en ? printableName(typed) : null;
  // A real Egyptian word, while it is the word being typed (or the last one typed)
  const spotted = useMemo(() => {
    if (!en) return null;
    const word = spotWord(typed);
    const lastWord = typed.join("").trim().split(" ").pop();
    return word && word.typed === lastWord ? word : null;
  }, [en, typed]);

  useEffect(() => {
    if (spotted && !wordsFound.current.has(spotted.translit)) {
      wordsFound.current.add(spotted.translit);
      trackEvent("keyboard_word_found", { word: spotted.translit, locale });
    }
  }, [spotted, locale]);

  // Course members get the HD picture free; ask once they are known to be signed in.
  useEffect(() => {
    if (!en || status !== "authenticated") return;
    fetch("/api/keyboard-image/access")
      .then((r) => (r.ok ? r.json() : { member: false }))
      .then((d: { member?: boolean }) => setMember(d.member === true))
      .catch(() => {});
  }, [en, status]);

  // Links back from the emails and checkouts restore the wall: ?m=&s=&g= and keep=hd | print | cancelled.
  useEffect(() => {
    if (!en) return;
    const q = new URLSearchParams(window.location.search);
    const card = readCardParams((k) => q.get(k));
    if (card.typed.length > 0) {
      setTyped(card.typed);
      setStyle(card.style);
      setTemplate(card.template ?? "none");
      setShowLetters(card.letters);
      const lastSign = [...card.typed].reverse().find((k) => k !== " ");
      if (lastSign) setLastKey(lastSign);
    }
    const keep = q.get("keep");
    if (card.typed.length > 0 && (keep === "hd" || keep === "cancelled")) {
      setKeepIntent(true);
      setKeepOpen(true);
      window.setTimeout(() => document.getElementById("keep")?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
    if (card.typed.length > 0 && keep === "print") {
      setKeepIntent(true);
      setPrintOpen(true);
      window.setTimeout(() => document.getElementById("print-offer")?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [en]);

  const flash = (key: string) => {
    setPressed(key);
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(null), 170);
  };

  const type = useCallback(
    (key: string, method: "keys" | "screen") => {
      // the key as stored: lower case, with Spanish and French accents folded to the plain letter
      const k = key === " " ? " " : (appendKey([], key, locale)[0] ?? null);
      if (!k) return;
      if (!started.current) {
        started.current = true;
        trackEvent("keyboard_first_key", { method, locale });
      }
      setTyped((sofar) => appendKey(sofar, k, locale));
      if (k !== " ") setLastKey(k);
      flash(k);
    },
    [locale]
  );

  const erase = useCallback(() => {
    setTyped((sofar) => sofar.slice(0, -1));
    flash("backspace");
  }, []);

  const clear = () => {
    setTyped([]);
    setLastKey(null);
    setQuiz(null);
    setKeepOpen(false);
    setPrintOpen(false);
  };

  const pickStyle = (id: KeyboardStyleId) => {
    if (id === style) return;
    setStyle(id);
    trackEvent("keyboard_style", { style: id, total: signCount, locale });
  };

  const pickTemplate = (id: KeyboardTemplateId) => {
    if (id === template) return;
    setTemplate(id);
    trackEvent("keyboard_template", { template: id, style, total: signCount, locale });
  };

  /** English: the picture is drawn by /keyboard-image (or the HD route), the same card as on screen. */
  const savePicture = async () => {
    if (signCount === 0 || saving) return;
    setKeepIntent(true);
    if (isFinish(style) && !member) {
      setKeepOpen(true);
      trackEvent("keyboard_keep_open", { reason: "finish", style, template, total: signCount, locale });
      window.setTimeout(() => document.getElementById("keep")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
      return;
    }
    setSaving(true);
    const hd = isFinish(style) && member;
    const ok = await downloadPicture(
      hd ? memberHdUrl(typed, style, template, "keys", showLetters) : keyboardImagePath({ typed, style, template, letters: showLetters }),
      keyboardImageFilename(typed, style, hd),
    );
    setSaving(false);
    if (ok) {
      trackEvent("keyboard_image", { total: signCount, locale, style, template, hd, letters: showLetters });
      if (!isFinish(style)) {
        setKeepOpen(true);
        trackEvent("keyboard_keep_open", { reason: "saved", style, template, total: signCount, locale });
      }
    }
  };

  /** The secret message: a link to a page that shows the signs and asks the friend to read them. */
  const shareMessage = async () => {
    if (signCount === 0) return;
    setKeepIntent(true);
    const url = `${window.location.origin}${keyboardMessagePath(typed, style)}`;
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: "A secret message in hieroglyphs", text: "I wrote you a message in hieroglyphs. Can you read it?", url });
        trackEvent("keyboard_share", { method: "share", style, total: signCount, locale });
        return;
      } catch {
        // cancelled, or not allowed: fall through to copying the link
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied. Send it to someone and see if they can read it.");
    } catch {
      setShareNote(url);
    }
    trackEvent("keyboard_share", { method: "copy", style, total: signCount, locale });
    window.setTimeout(() => setShareNote(null), 6000);
  };

  // The whole page is the keyboard: letters typed anywhere land on the wall, unless the visitor is in a
  // form field or holding a shortcut key. e.key is the letter typed, not the key's position, so AZERTY and
  // every other layout type the letter printed on the key.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        erase();
      } else if (e.key === " ") {
        // (on a focused button or link the space bar presses it, as it should)
        if (tag === "BUTTON" || tag === "A" || tag === "SUMMARY") return;
        e.preventDefault();
        type(" ", "keys");
      } else if (signForKey(e.key, locale)) {
        type(e.key, "keys");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [type, erase, locale]);

  useEffect(() => () => window.clearTimeout(pressTimer.current), []);

  const copy = async () => {
    const text = typedToHieroglyphs(typed, locale);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      trackEvent("keyboard_copy", { total: signCount, locale });
    } catch {
      // Clipboard blocked: select the signs on the wall so they can be copied by hand.
      const wall = document.getElementById("kb-wall-signs");
      if (wall) {
        const range = document.createRange();
        range.selectNodeContents(wall);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const saveImage = async () => {
    if (en) return savePicture();
    const lines = wrapTyped(typed, 14);
    if (lines.length === 0) return;
    const W = 1200;
    const H = 630;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const texts = lines.map((line) => line.map((k) => (k === " " ? "  " : (signForKey(k, locale)?.glyph ?? ""))).join(""));
    // Paint whether or not the webfont arrives: the system fallback still draws the signs.
    try {
      await document.fonts.load(`100px ${GLYPH_FONT}`, typedToHieroglyphs(typed, locale));
    } catch {}
    // The largest size at which every line fits inside the frame.
    let size = Math.floor(Math.min(150, (H - 230) / (lines.length * 1.35)));
    for (; size > 24; size -= 2) {
      ctx.font = `${size}px ${GLYPH_FONT}`;
      if (Math.max(...texts.map((tx) => ctx.measureText(tx).width)) <= W - 200) break;
    }
    const font = `${size}px ${GLYPH_FONT}`;
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#d4a832";
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.lineWidth = 1;
    ctx.strokeRect(48, 48, W - 96, H - 96);
    ctx.fillStyle = "#e8c460";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font;
    const lineH = size * 1.35;
    const top = (H - 60) / 2 - ((lines.length - 1) * lineH) / 2;
    texts.forEach((text, i) => ctx.fillText(text, W / 2, top + i * lineH));
    ctx.fillStyle = "#b09070";
    ctx.font = "22px 'Open Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
    ctx.fillText(`learnhieroglyphics.com${TOOL_PATHS.keyboard[locale]}`, W / 2, H - 78);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = t.imageFile;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
    trackEvent("keyboard_image", { total: signCount, locale });
  };

  const keyCap = (k: string) => {
    const sign = signForKey(k, locale)!;
    const on = pressed === k;
    return (
      <button
        key={k}
        type="button"
        onClick={() => type(k, "screen")}
        aria-label={`${k.toUpperCase()}: ${localizedSign(sign, k, locale).signName}`}
        className={`kb-key relative flex min-w-0 flex-1 flex-col items-center justify-center border pb-1.5 pt-3.5 sm:pb-3 sm:pt-5 ${
          on ? "is-pressed border-gold-400 bg-gold-500/25" : "border-gold-700/30 bg-obsidian-light/60 hover:border-gold-500/60"
        }`}
      >
        <span className="absolute left-1 top-0.5 font-body text-[9px] font-semibold uppercase text-sand-500 sm:left-1.5 sm:top-1 sm:text-[11px]">
          {k}
        </span>
        <span
          aria-hidden="true"
          lang="egy"
          className={`hieroglyph-font text-lg leading-none sm:text-3xl ${on ? "text-gold-300" : "text-gold-400"}`}
        >
          {sign.glyph}
        </span>
      </button>
    );
  };

  const actionClass =
    "border border-gold-700/40 px-4 py-2 font-body text-sm text-sand-200 transition-colors hover:border-gold-400 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gold-700/40 disabled:hover:text-sand-200";

  return (
    <section aria-label={t.sectionLabel} className="mb-14">
      <div id="kb-top" className="grid scroll-mt-24 gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
        {/* The wall: what has been typed */}
        {cardMode ? (
          <div className="relative self-start">
            <KeyboardCard
              typed={typed}
              style={style}
              template={template}
              letters={showLetters}
              caret
              className="border border-gold-600/40 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)]"
              label={signCount > 0 ? `${typed.join("").trim().toUpperCase()} in hieroglyphs` : t.wallEmpty}
            />
            {signCount === 0 && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center font-body text-sm text-sand-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] sm:text-lg">
                {t.wallEmpty}
              </p>
            )}
          </div>
        ) : (
          <div className="kb-wall relative flex min-h-[170px] flex-col border border-gold-600/40 bg-obsidian-light/85 sm:min-h-[210px]">
            <div aria-hidden="true" className="mx-4 mt-3 border-t border-gold-600/40" />
            <div aria-hidden="true" className="mx-4 mt-1 border-t border-gold-700/25" />
            <div className="flex flex-1 items-center px-5 py-5 sm:px-8">
              {typed.length === 0 ? (
                <p className="font-body text-base text-sand-400 sm:text-lg">
                  {t.wallEmpty}
                  <span aria-hidden="true" className="kb-caret ml-2 inline-block h-6 w-[2px] translate-y-1 bg-gold-400" />
                </p>
              ) : (
                <div id="kb-wall-signs" className="flex flex-wrap items-end gap-x-1.5 gap-y-4 sm:gap-x-2.5">
                  {typed.map((k, i) => {
                    if (k === " ") return <span key={i} className="w-5 sm:w-8" aria-hidden="true">{" "}</span>;
                    const sign = signForKey(k, locale)!;
                    return (
                      <span key={i} className={`flex flex-col items-center ${i === typed.length - 1 ? "kb-carve" : ""}`}>
                        <span
                          lang="egy"
                          title={`${k.toUpperCase()}: ${localizedSign(sign, k, locale).signName}`}
                          className="hieroglyph-font text-4xl leading-[1.25] text-gold-400 sm:text-6xl"
                        >
                          {sign.glyph}
                        </span>
                        {showLetters && (
                          <span aria-hidden="true" className="mt-1 select-none font-body text-[10px] font-semibold uppercase tracking-wider text-sand-500 sm:text-xs">
                            {k}
                          </span>
                        )}
                      </span>
                    );
                  })}
                  <span aria-hidden="true" className="kb-caret mb-6 inline-block h-9 w-[2px] bg-gold-400 sm:h-14" />
                </div>
              )}
            </div>
            <div aria-hidden="true" className="mx-4 mb-1 border-t border-gold-700/25" />
            <div aria-hidden="true" className="mx-4 mb-3 border-t border-gold-600/40" />
          </div>
        )}

        {/* The sign just typed */}
        <div className="flex items-center gap-4 border border-gold-700/25 bg-obsidian-light/80 px-5 py-3 sm:gap-5 sm:py-5 lg:flex-col lg:items-start lg:gap-2">
          {spotted ? (
            <>
              <span key={`word-${spotted.translit}`} lang="egy" aria-hidden="true" className="kb-carve hieroglyph-font shrink-0 text-5xl leading-[1.15] text-gold-300 sm:text-6xl">
                {spotted.glyphs}
              </span>
              <div className="min-w-0">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-400">A real Egyptian word</p>
                <p className="mt-1 font-display text-xl text-sand-100">
                  {spotted.typed.toUpperCase()} &rarr; <span className="italic">{spotted.translit}</span>, &ldquo;{spotted.meaning}&rdquo;
                </p>
                <p className="mt-1 font-body text-sm text-sand-400">
                  Say it &lsquo;{spotted.say}&rsquo;. Egyptian wrote no vowels.
                </p>
                <p className="mt-2 hidden font-body text-[13px] font-light leading-relaxed text-sand-300 sm:block">{spotted.why}</p>
              </div>
            </>
          ) : last && lastText ? (
            <>
              <span key={`${lastKey}-${typed.length}`} lang="egy" aria-hidden="true" className="kb-carve hieroglyph-font shrink-0 text-5xl leading-[1.15] text-gold-300 sm:text-6xl">
                {last.glyph}
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl text-sand-100">{t.lastSign(lastKey!.toUpperCase(), lastText.signName)}</p>
                <p className="mt-1 font-body text-sm text-sand-400">
                  {t.sound} <span className="font-semibold text-sand-200">{last.transliteration}</span>
                  <span className="mx-2 text-sand-600">|</span>
                  Gardiner {last.gardiner}
                </p>
                <p className="mt-2 hidden font-body text-[13px] font-light leading-relaxed text-sand-300 sm:block">{lastText.note}</p>
              </div>
            </>
          ) : (
            <>
              <span lang="egy" aria-hidden="true" className="hieroglyph-font shrink-0 text-5xl leading-[1.15] text-gold-700 sm:text-6xl">
                𓅓
              </span>
              <p className="font-body text-sm font-light leading-relaxed text-sand-400">{t.panelEmpty}</p>
            </>
          )}
        </div>
      </div>

      {en && (
        <div className="mt-3 space-y-3">
          <p className="min-h-[1.25rem] font-body text-sm text-sand-400">
            {translit ? (
              <>
                Egyptologists would write it <span className="italic text-sand-200">{translit}</span>
              </>
            ) : (
              "Type a word like PET, REN or NEFER and see what it meant to an Egyptian."
            )}
          </p>
          <FinishPicker style={style} onPick={pickStyle} />
          <CardPicker template={template} onPick={pickTemplate} />
        </div>
      )}

      {/* Screen readers hear each sign as it lands */}
      <p aria-live="polite" className="sr-only">
        {last && lastKey && lastText ? t.spoken(lastKey.toUpperCase(), lastText.signName, last.transliteration, signCount) : ""}
      </p>

      {/* The keys: straight under the wall, so a phone shows both at once */}
      <div className="mx-auto mt-5 max-w-3xl space-y-1 sm:space-y-1.5">
        {keyRows(locale).map((row, r) => (
          // shorter rows sit indented, 5% per missing key, like a real keyboard
          <div key={r} className="flex gap-1 sm:gap-1.5" style={{ paddingInline: `${(10 - row.length) * 5}%` }}>
            {row.map(keyCap)}
          </div>
        ))}
        <div className="flex gap-1 px-[15%] sm:gap-1.5">
          <button
            type="button"
            onClick={() => type(" ", "screen")}
            className={`kb-key flex-1 border py-3 font-body text-xs uppercase tracking-[0.2em] text-sand-400 sm:py-4 ${
              pressed === " " ? "is-pressed border-gold-400 bg-gold-500/25" : "border-gold-700/30 bg-obsidian-light/60 hover:border-gold-500/60"
            }`}
          >
            {t.space}
          </button>
          <button
            type="button"
            onClick={erase}
            aria-label={t.deleteLabel}
            className={`kb-key w-1/4 min-w-fit border px-2 py-3 font-body text-xs uppercase tracking-[0.12em] text-sand-400 sm:py-4 sm:tracking-[0.2em] ${
              pressed === "backspace" ? "is-pressed border-gold-400 bg-gold-500/25" : "border-gold-700/30 bg-obsidian-light/60 hover:border-gold-500/60"
            }`}
          >
            {t.del}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={copy} disabled={signCount === 0} className={actionClass}>
          {copied ? t.copied : t.copy}
        </button>
        <button
          type="button"
          onClick={saveImage}
          disabled={signCount === 0 || saving}
          className={en ? "border border-gold-500 bg-gold-500/15 px-4 py-2 font-body text-sm font-semibold text-gold-200 transition-colors hover:bg-gold-500/25 disabled:cursor-not-allowed disabled:opacity-40" : actionClass}
        >
          {saving ? "Drawing it…" : en && isFinish(style) && !member ? "Keep this picture" : t.saveImage}
        </button>
        {en && (
          <button type="button" onClick={shareMessage} disabled={signCount === 0} className={actionClass}>
            Send as a secret message
          </button>
        )}
        <button type="button" onClick={clear} disabled={typed.length === 0} className={actionClass}>
          {t.clear}
        </button>
        {/* On the wall, and on the card and the picture saved from it */}
        <label className="ml-auto flex cursor-pointer items-center gap-2 font-body text-sm text-sand-400">
          <input
            type="checkbox"
            checked={showLetters}
            onChange={(e) => {
              setShowLetters(e.target.checked);
              trackEvent("keyboard_letters", { on: e.target.checked, style, locale });
            }}
            className="accent-[#d4a832]"
          />
          {en ? "English letters under the signs" : t.showLetters}
        </label>
      </div>
      {typed.length >= MAX_TYPED && <p className="mt-2 font-body text-sm text-sand-400">{t.full(MAX_TYPED)}</p>}
      {shareNote && (
        <p role="status" className="mt-2 break-all font-body text-sm text-gold-300">
          {shareNote}
        </p>
      )}
      {en && keepOpen && signCount > 0 && (
        <KeepPanel
          typed={typed}
          style={style}
          template={template}
          member={member}
          currency={currency}
          signedInEmail={session?.user?.email ?? null}
          letters={showLetters}
          onPickStyle={(id) => {
            pickStyle(id);
            setKeepOpen(false);
            document.getElementById("kb-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          onClose={() => setKeepOpen(false)}
        />
      )}

      {/* Where to go next, once there is something on the wall */}
      <div className="mt-6 min-h-[3.5rem]">
        {en && (signCount >= LESSON_NUDGE_AT || quiz) ? (
          <ReadBackNudge
            typed={typed}
            quiz={quiz}
            onStart={() => {
              setQuiz(typed);
              trackEvent("keyboard_read_back_open", { total: signCount, locale });
            }}
          />
        ) : signCount >= LESSON_NUDGE_AT ? (
          <div className="flex flex-col gap-3 border border-gold-600/50 bg-gold-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-body text-sm leading-snug text-sand-100 sm:text-base">{t.nudge(signCount)}</p>
            <Link
              href={guestPlayHref()}
              onClick={() => trackEvent("keyboard_to_lesson", { total: signCount, locale })}
              className="inline-flex shrink-0 items-center justify-center bg-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-black transition-colors hover:bg-gold-400"
            >
              {t.nudgeButton}
            </Link>
          </div>
        ) : (
          <p className="font-body text-sm text-sand-500">
            {t.translatorBefore}{" "}
            <Link
              href={TOOL_PATHS.translator[locale]}
              onClick={() => trackEvent("keyboard_to_translator", { total: signCount, locale })}
              className="text-gold-400 underline underline-offset-2 hover:text-gold-300"
            >
              {t.translatorLink}
            </Link>{" "}
            {t.translatorAfter}
          </p>
        )}
      </div>

      {/* The print: once they have shown they want to keep it, or are making a gift of it */}
      {en && printName && (keepIntent || template !== "none") && (
        <PrintTeaser
          name={printName}
          gift={template !== "none"}
          open={printOpen}
          onOpen={() => {
            setPrintOpen(true);
            trackEvent("keyboard_print_open", { style, template, total: signCount, locale });
          }}
        />
      )}
    </section>
  );
}
