"use client";

import type { ReactNode } from "react";
import NameToolLanding from "@/components/NameToolLanding";
import { keyboardStyleById } from "@/lib/keyboard-card";

/** Black on white, across the page or down it: the two stencils, and nothing that would get in a tattoo artist's way. */
const STENCILS = (["stencil", "stencil-tall"] as const).map(keyboardStyleById);

export default function TattooTool({ children }: { children: ReactNode }) {
  return (
    <NameToolLanding
      page="tattoo"
      kicker="Free preview · stencil in HD"
      title={
        <>
          Hieroglyphics <span className="text-gradient-gold font-medium">Tattoo</span> Stencil
        </>
      }
      intro="Type a name and get it in clean black Egyptian signs, across the page or in a column, with the reading checked sign by sign before it goes on your skin."
      placeholder="Name for the tattoo..."
      inputLabel="Text for the tattoo stencil"
      studio={{
        initialStyle: "stencil-tall",
        styles: STENCILS,
        templates: [],
        kicker: "Your stencil",
        heading: "Black on white, ready for your tattoo artist",
        print: false,
      }}
    >
      {children}
    </NameToolLanding>
  );
}
