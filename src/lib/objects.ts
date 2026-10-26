/**
 * Every 3D "sign object" we have a Meshy model for, keyed by the hieroglyph it
 * depicts. Used by the glyph cards' "See the object in 3D" toggle and by the
 * Field Sketchbook / Counting House mechanics.
 *
 * Models: public/models/signs (batches 1 and 3, alphabet) and public/models/objects
 * (batch 2, lessons) — meshopt + webp, ~130–300 KB each.
 */
export type SignObjectModel = {
  glyph: string;
  name: string;
  model: string;
};

/** The alphabet objects (batch 1 and 3), first made for the Sign Hunt game. */
export const ALPHABET_OBJECTS: SignObjectModel[] = [
  { glyph: "𓅓", name: "Owl", model: "/models/signs/owl.glb" },
  { glyph: "𓅱", name: "Quail chick", model: "/models/signs/chick.glb" },
  { glyph: "𓇋", name: "Reed leaf", model: "/models/signs/reed.glb" },
  { glyph: "𓏏", name: "Bread loaf", model: "/models/signs/loaf.glb" },
  { glyph: "𓎡", name: "Basket with handle", model: "/models/signs/basket.glb" },
  { glyph: "𓆑", name: "Horned viper", model: "/models/signs/viper.glb" },
  { glyph: "𓂧", name: "Hand", model: "/models/signs/hand.glb" },
  { glyph: "𓃭", name: "Lion", model: "/models/signs/lion.glb" },
  { glyph: "𓃀", name: "Foot and lower leg", model: "/models/signs/leg.glb" },
  { glyph: "𓈖", name: "Ripple of water", model: "/models/signs/water.glb" },
  { glyph: "𓄿", name: "Egyptian vulture", model: "/models/signs/vulture.glb" },
  { glyph: "𓂝", name: "Forearm", model: "/models/signs/forearm.glb" },
  { glyph: "𓊪", name: "Reed mat", model: "/models/signs/mat.glb" },
  { glyph: "𓉔", name: "Reed shelter", model: "/models/signs/shelter.glb" },
  { glyph: "𓎛", name: "Lamp wick", model: "/models/signs/lamp.glb" },
  { glyph: "𓋴", name: "Folded cloth", model: "/models/signs/linen.glb" },
  { glyph: "𓊃", name: "Door bolt", model: "/models/signs/bolt.glb" },
  { glyph: "𓈙", name: "Garden pool", model: "/models/signs/pool.glb" },
  { glyph: "𓎼", name: "Jar-stand", model: "/models/signs/stand.glb" },
  { glyph: "𓍿", name: "Tethering rope", model: "/models/signs/tether.glb" },
  { glyph: "𓆓", name: "Resting cobra", model: "/models/signs/cobra.glb" },
];

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
  ...ALPHABET_OBJECTS,
  ...LESSON_OBJECTS,
];

export const MODEL_BY_GLYPH: Record<string, SignObjectModel> = Object.fromEntries(
  ALL_OBJECTS.map((o) => [o.glyph, o])
);

export function modelForGlyph(glyph: string): SignObjectModel | undefined {
  return MODEL_BY_GLYPH[glyph];
}
