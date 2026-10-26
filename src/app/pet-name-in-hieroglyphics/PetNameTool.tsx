"use client";

import type { ReactNode } from "react";
import NameToolLanding from "@/components/NameToolLanding";
import { keyboardTemplateById } from "@/lib/keyboard-card";

/** The pet cards: the dog or the seated cat after the name, any pet, or no card. */
const PET_TEMPLATES = (["dog", "cat", "pet", "none"] as const).map(keyboardTemplateById);

export default function PetNameTool({ children }: { children: ReactNode }) {
  return (
    <NameToolLanding
      page="pet"
      kicker="Free · cats, dogs and every pet"
      title={
        <>
          Your Pet&apos;s Name in <span className="text-gradient-gold font-medium">Hieroglyphics</span>
        </>
      }
      intro="Type your pet's name and see it written the way an Egyptian scribe would have: sound by sound, finished with the seated cat or the dog."
      placeholder="Your pet's name..."
      inputLabel="Your pet, in hieroglyphs"
      studio={{
        initialTemplate: "dog",
        templates: PET_TEMPLATES,
        templatesLabel: "Pick the card:",
        kicker: "Make it a picture or a print",
        heading: "Your pet's cartouche, with the sign for cat or dog",
      }}
    >
      {children}
    </NameToolLanding>
  );
}
