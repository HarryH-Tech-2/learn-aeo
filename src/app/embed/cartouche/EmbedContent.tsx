"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { transliterateName, getTransliteration } from "@/lib/hieroglyph-translator";
import { trackEvent } from "@/lib/analytics";
import { SITE_ORIGIN, TRANSLATOR_PATH, cartoucheSharePath, normaliseShareName } from "@/lib/share";

/**
 * Compact translator for iframes: input, cartouche, transliteration and a
 * credit link. No nav, no footer, no framer-motion. `?theme=light` for pale
 * pages, `?name=` to prefill.
 */
export default function EmbedContent() {
  const params = useSearchParams();
  const light = params.get("theme") === "light";
  const [name, setName] = useState("");

  useEffect(() => {
    const initial = normaliseShareName(params.get("name"));
    if (initial) setName(initial);
    trackEvent("embed_view", { referrer: document.referrer ? new URL(document.referrer).hostname : "(none)" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(() => (name.trim() ? transliterateName(name) : []), [name]);
  const translit = name.trim() ? getTransliteration(name) : "";
  const fullLink = `${SITE_ORIGIN}${name.trim() ? cartoucheSharePath(name) : TRANSLATOR_PATH}`;

  const c = light
    ? {
        bg: "#f7f1e3",
        fg: "#1c1a17",
        muted: "#6b6252",
        gold: "#8a6610",
        border: "rgba(138, 102, 16, 0.5)",
        input: "#fffdf8",
        inputBorder: "rgba(138, 102, 16, 0.35)",
      }
    : {
        bg: "#0b0b0f",
        fg: "#e8dcc0",
        muted: "#8a8070",
        gold: "#d4a832",
        border: "rgba(212, 168, 50, 0.6)",
        input: "#12121a",
        inputBorder: "rgba(212, 168, 50, 0.3)",
      };

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-6"
      style={{ background: c.bg, color: c.fg, fontFamily: "var(--font-body)" }}
    >
      <label htmlFor="embed-name" className="text-[11px] tracking-[0.25em] uppercase mb-3" style={{ color: c.gold }}>
        Write your name in hieroglyphs
      </label>
      <input
        id="embed-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type a name…"
        maxLength={30}
        autoComplete="off"
        className="w-full max-w-sm py-3 px-4 text-center text-lg tracking-wide focus:outline-none"
        style={{ background: c.input, border: `1px solid ${c.inputBorder}`, color: c.fg }}
      />

      <div className="mt-6 flex items-center justify-center min-h-[120px] w-full">
        {results.length > 0 ? (
          <div className="inline-flex flex-col items-center max-w-full">
            {/* Scroll wrapper carries the padding so the end bar never overflows it. */}
            <div className="max-w-full overflow-x-auto pl-1 pr-5 py-1">
              <div className="relative px-7 py-4 rounded-[50px] w-fit" style={{ border: `2px solid ${c.border}` }}>
                <div
                  className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-r-md"
                  style={{ border: `2px solid ${c.border}`, borderLeft: "none" }}
                />
                <div
                  className="flex items-center gap-1 text-3xl sm:text-4xl md:text-5xl whitespace-nowrap"
                  style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif", color: c.gold }}
                  aria-label={`${name} in hieroglyphs`}
                >
                  {results.map((r, i) => (
                    <span key={`${i}-${r.mapping.glyph}`} title={`${r.input.toUpperCase()} → ${r.mapping.signName}`}>
                      {r.mapping.glyph}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs mt-3 tracking-[0.15em] uppercase" style={{ color: c.muted }}>
              {name} · <span className="normal-case tracking-normal">{translit}</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-center max-w-xs" style={{ color: c.muted }}>
            The 25 alphabet signs the Egyptians used to spell foreign names, the same way Cleopatra&apos;s was
            written.
          </p>
        )}
      </div>

      <a
        href={fullLink}
        target="_blank"
        rel="noopener"
        onClick={() => trackEvent("embed_click_through", { has_name: name.trim() ? 1 : 0 })}
        className="mt-5 text-xs underline underline-offset-4"
        style={{ color: c.gold }}
      >
        {name.trim() ? "Download or share this cartouche" : "Open the full translator"} at learnhieroglyphics.com
      </a>
    </main>
  );
}
