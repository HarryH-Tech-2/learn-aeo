/**
 * Every 3D "sign object" we have a Meshy model for, keyed by the hieroglyph it
 * depicts. Used by the glyph cards' "See the object in 3D" toggle and by the
 * Field Sketchbook / Counting House mechanics.
 *
 * Models: public/models/signs (batch 1, Sign Hunt) and public/models/objects
 * (batch 2, lessons) — meshopt + webp, ~130–300 KB each.
 */
import { SIGN_OBJECTS } from "@/lib/sign-hunt";

export type SignObjectModel = {
  glyph: string;
  name: string;
  model: string;
};

export const LESSON_OBJECTS: SignObjectModel[] = [
  { glyph: "𓆣", name: "Scarab beetle", model: "/models/objects/scarab.glb" }, // L1
  { glyph: "𓆸", name: "Blue lotus", model: "/models/objects/lotus.glb" }, // M9
  { glyph: "𓄿", name: "Egyptian vulture", model: "/models/objects/vulture.glb" }, // G1
  { glyph: "𓆗", name: "Rearing cobra (uraeus)", model: "/models/objects/cobra.glb" }, // I12
  { glyph: "𓏊", name: "Beer jar", model: "/models/objects/jar.glb" }, // W22
  { glyph: "𓃒", name: "Bull", model: "/models/objects/bull.glb" }, // E1
  // batch 3 — determinative objects for Tomb Wall Decode's reveal
  { glyph: "𓅬", name: "Goose", model: "/models/objects/goose.glb" }, // G38
  { glyph: "𓊛", name: "Boat", model: "/models/objects/boat.glb" }, // P1
  { glyph: "𓀀", name: "Seated man", model: "/models/objects/scribe.glb" }, // A1
  // the three-ripples water determinative shares the ripple model
  { glyph: "𓈗", name: "Water", model: "/models/signs/water.glb" }, // N35A
];

export const ALL_OBJECTS: SignObjectModel[] = [
  ...SIGN_OBJECTS.map((o) => ({ glyph: o.glyph, name: o.name, model: o.model })),
  ...LESSON_OBJECTS,
];

export const MODEL_BY_GLYPH: Record<string, SignObjectModel> = Object.fromEntries(
  ALL_OBJECTS.map((o) => [o.glyph, o])
);

export function modelForGlyph(glyph: string): SignObjectModel | undefined {
  return MODEL_BY_GLYPH[glyph];
}
