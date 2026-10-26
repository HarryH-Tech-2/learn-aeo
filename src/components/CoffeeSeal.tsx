"use client";

/**
 * "Buy me a coffee" (2026-10-21): a dark seal with a gold rim in the bottom-right corner, where the feedback seal
 * used to be. Opens Harry's Buy Me a Coffee page in a new tab. Hidden where it would sit on top of the action
 * (full-screen games and lessons, the class stage, embeds, checkout) and on pricing, so it doesn't compete with
 * buying the course.
 * GA4, each with the page: coffee_view (the seal was shown on a page), coffee_hover (the note opened, once per page),
 * coffee_click (went to the page). CTR = coffee_click / coffee_view.
 */
import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { trackEvent, trackEventWhenReady } from "@/lib/analytics";

export const COFFEE_URL = "https://buymeacoffee.com/harryhh";
const HIDDEN_ON = ["/embed", "/play", "/lessons/", "/teachers/class", "/dev", "/admin", "/checkout", "/cartouche-print", "/pricing", "/get-started"];

export default function CoffeeSeal() {
  const pathname = usePathname();
  const hidden = HIDDEN_ON.some((p) => pathname?.startsWith(p));
  const hoveredOn = useRef<string | null>(null);

  // one view per page the seal appears on (client-side navigation included); waits for the lazily loaded gtag
  useEffect(() => {
    if (hidden) return;
    return trackEventWhenReady("coffee_view", { page: pathname ?? "" });
  }, [pathname, hidden]);

  if (hidden) return null;

  const noteHover = () => {
    if (hoveredOn.current === pathname) return;
    hoveredOn.current = pathname;
    trackEvent("coffee_hover", { page: pathname ?? "" });
  };

  return (
    <a
      href={COFFEE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("coffee_click", { page: pathname ?? "" })}
      onMouseEnter={noteHover}
      onFocus={noteHover}
      aria-label="Buy me a coffee (opens in a new tab)"
      className="coffee-seal group fixed bottom-4 right-4 z-[60] flex items-center sm:bottom-6 sm:right-6 print:hidden"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#3d2b12,#1a1206_75%)] text-[#f3cf72] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.7),inset_0_0_0_2px_rgba(214,170,80,0.8)] transition-transform group-hover:-translate-y-0.5 sm:h-14 sm:w-14">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
          <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16" />
          <path d="M8 3.5c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5" />
        </svg>
      </span>
      {/* a note above the seal on hover or keyboard focus (pointer devices); on phones a tap goes straight to the page.
          The transparent pb-3 bridges the gap so the pointer can move up onto the note without it closing. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 hidden pb-3 opacity-0 translate-y-1 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:block"
      >
        <span className="flex w-80 items-start gap-3 border border-[#b98a3a] bg-[#1a1206]/95 p-4 text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]">
          {/* served at 56px by next/image (a couple of KB); on phones the note is display:none, so lazy skips it */}
          <Image
            src="/about/harry-320.webp"
            alt=""
            width={320}
            height={360}
            sizes="56px"
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-full object-cover object-top shadow-[0_0_0_2px_rgba(214,170,80,0.8)]"
          />
          <span className="block">
            <span className="block font-display text-base font-semibold text-[#f3cf72]">Buy me a coffee</span>
            <span className="mt-1.5 block font-body text-sm leading-relaxed text-[#e8d9b5]">
              I build and look after this site on my own. If it has helped you, a coffee lets me keep building and
              improving it.
            </span>
            <span className="mt-2 block font-body text-xs text-sand-400">Harry</span>
          </span>
        </span>
      </span>
    </a>
  );
}
