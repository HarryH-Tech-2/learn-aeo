import { cartoucheImagePath, cartoucheImageUrl, cartoucheSharePath } from "@/lib/share";

/**
 * Names shown as real cartouche images under the translator, so the page has something Google Images can index for
 * "<name> in hieroglyphics" searches (the translator's own output is text, which image search cannot see).
 * Famous Egyptian names first, then some of the most-given first names in the UK and US.
 */
export const GALLERY_NAMES = ["Cleopatra", "Nefertiti", "Tutankhamun", "Olivia", "Emma", "Sophia", "Noah", "Oliver", "Liam"];

export type GalleryImage = { name: string; src: string; url: string; href: string; alt: string };

export function galleryImages(): GalleryImage[] {
  return GALLERY_NAMES.map((name) => ({
    name,
    src: cartoucheImagePath(name),
    url: cartoucheImageUrl(name),
    href: cartoucheSharePath(name),
    alt: `The name ${name} written in Egyptian hieroglyphics inside a royal cartouche`,
  }));
}
