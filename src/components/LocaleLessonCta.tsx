"use client";

/**
 * The free-lesson ask on the Spanish and French tool pages (2026-10-23): until then they linked nowhere into the
 * course, so their search visitors (about 24 landings in the week to 22 Oct) had no way on. Sits under each page's
 * quick answer (TranslatorLocalePage, TranslatedAlphabetPage, LocalizedKeyboardPage). The course is in English, and
 * the card says so before the click. Opens Lesson 1 without an account (?play=1, src/lib/guest-play.ts), the same
 * door the English pages' lesson card opens; the sign-up is asked at the end, as there.
 *
 * GA4: guest_play_banner_view (once per page view, half on screen) and guest_play_banner_click, with location
 * "<locale>_<page>" (es_translator, fr_alphabet …) and question_type "locale_card", so they read beside the English cards.
 * Signed-in learners do not see it: they have the dashboard.
 */
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { guestPlayHref } from "@/lib/guest-play";

type Page = "translator" | "alphabet" | "keyboard";

const COPY = {
  es: {
    eyebrow: "Lección gratis",
    heading: "Aprende a leer los jeroglíficos tú mismo",
    body: "Los 25 signos del alfabeto, en partes cortas, empezando por tu propio nombre en una puerta sellada. Sin registrarte para empezar.",
    note: "La lección está en inglés.",
    button: "Abrir la primera lección",
  },
  fr: {
    eyebrow: "Leçon gratuite",
    heading: "Apprenez à lire les hiéroglyphes vous-même",
    body: "Les 25 signes de l'alphabet, en courtes étapes, en commençant par votre propre prénom sur une porte scellée. Sans inscription pour commencer.",
    note: "La leçon est en anglais.",
    button: "Ouvrir la première leçon",
  },
} as const;

export default function LocaleLessonCta({ locale, page, className = "" }: { locale: "es" | "fr"; page: Page; className?: string }) {
  const { status } = useSession();
  const ref = useRef<HTMLDivElement>(null);
  // (the session check finishing re-runs the effect: one view per page view all the same)
  const viewed = useRef(false);
  const t = COPY[locale];
  const event = { location: `${locale}_${page}`, question_type: "locale_card" };

  useEffect(() => {
    if (status === "authenticated" || viewed.current) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          if (viewed.current) return;
          viewed.current = true;
          trackEvent("guest_play_banner_view", event);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [status, locale, page]);

  if (status === "authenticated") return null;

  return (
    <div ref={ref} lang={locale} className={`border border-gold-600/50 bg-gold-500/10 p-5 sm:p-6 text-left ${className}`}>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">{t.eyebrow}</p>
      <p className="mt-1 font-display text-xl leading-tight text-sand-100 sm:text-2xl">{t.heading}</p>
      <p className="mt-2 font-body text-sm leading-relaxed text-sand-300">{t.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={guestPlayHref()}
          hrefLang="en"
          onClick={() => trackEvent("guest_play_banner_click", event)}
          className="gp-ring inline-flex items-center bg-gold-500 px-5 py-2.5 font-body text-sm font-semibold text-black shadow-lg transition-colors hover:bg-gold-400"
        >
          {t.button}
        </Link>
        <span className="font-body text-xs text-sand-500">{t.note}</span>
      </div>
    </div>
  );
}
