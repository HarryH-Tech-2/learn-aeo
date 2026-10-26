"use client";

/**
 * The shell of the name-tool landing pages (2026-10-19): /pet-name-in-hieroglyphics and /hieroglyphics-tattoo.
 * Each is the name translator (src/components/NameTranslatorTool.tsx) with its own heading, and the picture box
 * (src/components/NameCardStudio.tsx) set up for the page: pet cards and the cat or dog sign, or black stencils.
 * The page's own text (how-to, FAQ) comes in as children, server-rendered, so it is in the HTML search engines read.
 */
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NameCardStudio, { type NameCardStudioProps } from "@/components/NameCardStudio";
import NameTranslatorTool, { ENGLISH_TOOL_STRINGS } from "@/components/NameTranslatorTool";
import ReadItBack from "@/components/ReadItBack";
import { reveal } from "@/components/reveal";

type Props = {
  page: "pet" | "tattoo";
  kicker: string;
  title: ReactNode;
  intro: ReactNode;
  placeholder: string;
  inputLabel: string;
  studio: Omit<NameCardStudioProps, "name" | "page">;
  children?: ReactNode;
};

export default function NameToolLanding({ page, kicker, title, intro, placeholder, inputLabel, studio, children }: Props) {
  return (
    <main className="grain-overlay">
      <Navbar />
      <div className="min-h-screen pt-24 pb-20 md:pt-32">
        <div className="is-inview mx-auto max-w-4xl px-6 lg:px-8">
          <div className="reveal mb-8 text-center md:mb-12" style={reveal(0, { y: 20 })}>
            <p className="mb-3 font-body text-xs uppercase tracking-[0.25em] text-gold-500">{kicker}</p>
            <h1 className="mb-4 font-display text-3xl font-light text-sand-100 sm:text-4xl md:mb-6 md:text-5xl">{title}</h1>
            <div className="mx-auto max-w-2xl font-body text-lg font-light text-sand-400">{intro}</div>
          </div>

          <NameTranslatorTool
            strings={{ ...ENGLISH_TOOL_STRINGS, placeholder, inputLabel }}
            afterCartouche={(n, r) => (
              <>
                <NameCardStudio name={n.trim()} page={page} {...studio} />
                <ReadItBack key={n.trim().toLowerCase()} name={n} results={r} />
              </>
            )}
          />

          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
