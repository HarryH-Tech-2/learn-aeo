"use client";

/**
 * "Write your name": a small translator inside an article. Each letter typed appears straight away as
 * its hieroglyph inside a cartouche; the links carry the name on to the full translator (sign-by-sign
 * breakdown and the print) and into Lesson 1. Blog and chart readers came to read about the signs, not
 * to use a tool, and almost never clicked a plain "Write my name" link (alphabet: 62 banner views, 0
 * clicks, 1–9 Oct 2026), so the tool comes to them.
 *
 * The cartouche row keeps its height while empty, so typing never moves the page.
 *
 * GA4: name_box_view (half the box on screen, once per page view), name_box_type (the first letter),
 * name_box_click (target: translator | lesson). All carry location, and question_type
 * `name_box_<placement>` so the same box read at the top of a post and mid-article can be told apart
 * with the registered dimension.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { guestPlayHref } from "@/lib/guest-play";
import { TRANSLATOR_PATH, cartoucheSharePath } from "@/lib/share";

type Props = {
  location: "blog" | "alphabet";
  /** where in the page it sits, for comparing placements */
  placement: "top" | "inline";
  heading?: string;
  className?: string;
};

export default function NameBox({ location, placement, heading = "Try it: write your name in hieroglyphs", className = "" }: Props) {
  const [name, setName] = useState("");
  const typedOnce = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const variant = `name_box_${placement}`;
  const typed = name.trim();
  const glyphs = typed ? transliterateName(typed).map((r) => r.mapping.glyph) : [];

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          trackEvent("name_box_view", { location, question_type: variant });
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [location, variant]);

  function onChange(value: string) {
    setName(value);
    if (!typedOnce.current && value.trim()) {
      typedOnce.current = true;
      trackEvent("name_box_type", { location, question_type: variant });
    }
  }

  const click = (target: "translator" | "lesson") => () =>
    trackEvent("name_box_click", { location, question_type: variant, target, named: typed ? 1 : 0 });

  return (
    <div ref={boxRef} className={`border border-gold-600/50 bg-gold-500/10 p-5 sm:p-6 ${className}`}>
      <p className="font-display text-xl sm:text-2xl leading-tight text-sand-100 mb-3">{heading}</p>
      {/* Not a person's details: the same autofill opt-outs as the translator's own box (placeholder drawn
          over the box, no "name" in the label or field name, which is what Chrome offered saved cards on) */}
      <div className="relative">
      {!name && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-body text-base text-sand-600">
          Type a name…
        </span>
      )}
      <input
        type="search"
        name="glyph-script"
        aria-label="Text to write in hieroglyphs"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        data-form-type="other"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        maxLength={30}
        className="w-full py-3 px-4 bg-obsidian border border-gold-700/30 text-sand-100 font-body text-base focus:outline-none focus:border-gold-500/50 transition-colors"
      />
      </div>
      <div className="mt-4 flex min-h-[4.5rem] items-center justify-center" aria-live="polite">
        {glyphs.length > 0 ? (
          <div className="relative inline-flex max-w-full items-center px-6 py-3 border-2 border-gold-500/60 rounded-[40px] bg-obsidian-light/30">
            <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-6 border-2 border-gold-500/60 border-l-0 rounded-r-md" />
            <span className="hieroglyph-font text-3xl sm:text-4xl text-gold-400 tracking-wide break-all text-center" aria-label={`${typed} in hieroglyphs`}>
              {glyphs.join("")}
            </span>
          </div>
        ) : (
          <span className="font-body text-sm text-sand-500">Your cartouche appears here as you type.</span>
        )}
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <Link
          href={typed ? cartoucheSharePath(typed) : TRANSLATOR_PATH}
          onClick={click("translator")}
          className="btn-primary text-sm py-3 px-5 justify-center"
        >
          {typed ? `See what each sign in ${typed} means` : "Open the full translator"}
        </Link>
        <Link
          href={guestPlayHref(typed)}
          onClick={click("lesson")}
          className="font-body text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors"
        >
          Learn to read it yourself, free
        </Link>
      </div>
    </div>
  );
}
