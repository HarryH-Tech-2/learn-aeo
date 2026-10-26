/**
 * Sign Hunt — game data and pure rules.
 *
 * A 3D object (owl, reed, loaf…) is shown; the player must pick the
 * hieroglyph that depicts it. Teaches the pictographic origin of the
 * uniliteral ("alphabet") signs. Models live in public/models/signs/
 * (generated with Meshy; see scripts/meshy-generate-signs.py).
 */

export type SignObject = {
  id: string;
  /** Unicode hieroglyph */
  glyph: string;
  /** Egyptological transliteration */
  translit: string;
  /** Rough modern sound */
  sound: string;
  /** What the sign depicts */
  name: string;
  /** One-line teaching note shown after answering */
  note: string;
  /** Public URL of the GLB model */
  model: string;
};

export const SIGN_OBJECTS: SignObject[] = [
  { id: "owl", glyph: "𓅓", translit: "m", sound: "m", name: "Owl",
    note: "The owl is the sign for m, one of the most common signs you'll read, used in the preposition m (\"in / from\").",
    model: "/models/signs/owl.glb" },
  { id: "chick", glyph: "𓅱", translit: "w", sound: "w / oo", name: "Quail chick",
    note: "The quail chick writes w. It doubles as a plural marker and appears in countless words.",
    model: "/models/signs/chick.glb" },
  { id: "reed", glyph: "𓇋", translit: "ꞽ", sound: "ee / y", name: "Reed leaf",
    note: "A single flowering reed writes ꞽ (often rendered i or j). Two reeds 𓇌 write y.",
    model: "/models/signs/reed.glb" },
  { id: "loaf", glyph: "𓏏", translit: "t", sound: "t", name: "Bread loaf",
    note: "The small bread loaf writes t and marks feminine nouns, as in nbt \"lady\".",
    model: "/models/signs/loaf.glb" },
  { id: "basket", glyph: "𓎡", translit: "k", sound: "k", name: "Basket with handle",
    note: "The wicker basket with a handle writes k, as in kꜣ \"spirit / life-force\".",
    model: "/models/signs/basket.glb" },
  { id: "viper", glyph: "𓆑", translit: "f", sound: "f", name: "Horned viper",
    note: "The horned viper writes f and is also the suffix pronoun \"he / his\".",
    model: "/models/signs/viper.glb" },
  { id: "hand", glyph: "𓂧", translit: "d", sound: "d", name: "Hand",
    note: "The open hand writes d, as in dpt \"boat\" and dšrt \"the Red Land\".",
    model: "/models/signs/hand.glb" },
  { id: "lion", glyph: "𓃭", translit: "rw / l", sound: "l", name: "Lion",
    note: "The recumbent lion writes rw; in later names like Cleopatra (Ptolemaic) it carries the l sound.",
    model: "/models/signs/lion.glb" },
  { id: "leg", glyph: "𓃀", translit: "b", sound: "b", name: "Foot and lower leg",
    note: "The lower leg and foot write b, as in bꜣ \"soul\", the human-headed bird.",
    model: "/models/signs/leg.glb" },
  { id: "water", glyph: "𓈖", translit: "n", sound: "n", name: "Ripple of water",
    note: "The zigzag ripple writes n: the preposition \"to / for\" and the genitive \"of\".",
    model: "/models/signs/water.glb" },
  // ── batch 3 (2026-08-22): the rest of the alphabet objects ──
  { id: "vulture", glyph: "𓄿", translit: "ꜣ", sound: "ah", name: "Egyptian vulture",
    note: "The vulture writes ꜣ (aleph), the first sign in the order Egyptologists use for the alphabet; reading it as \"ah\" is a modern teaching convention.",
    model: "/models/signs/vulture.glb" },
  { id: "forearm", glyph: "𓂝", translit: "ꜥ", sound: "ah (throaty)", name: "Forearm",
    note: "The forearm with open palm writes ꜥ (ayin), a deep throat sound English lacks, as in ꜥnḫ \"life\".",
    model: "/models/signs/forearm.glb" },
  { id: "mat", glyph: "𓊪", translit: "p", sound: "p", name: "Reed mat",
    note: "A woven reed mat (or low stool) writes p, as in pr \"house\" and the god Ptah.",
    model: "/models/signs/mat.glb" },
  { id: "shelter", glyph: "𓉔", translit: "h", sound: "h", name: "Reed shelter",
    note: "The plan of a reed shelter writes plain h, as in hrw \"day\", distinct from the throatier ḥ of the wick.",
    model: "/models/signs/shelter.glb" },
  { id: "lamp", glyph: "𓎛", translit: "ḥ", sound: "h (breathy)", name: "Lamp wick",
    note: "A twisted flax lamp-wick writes ḥ, the emphatic h that opens ḥtp \"offering, peace\".",
    model: "/models/signs/lamp.glb" },
  { id: "linen", glyph: "𓋴", translit: "s", sound: "s", name: "Folded cloth",
    note: "A folded piece of linen writes s, and also the causative prefix s- \"to cause to\".",
    model: "/models/signs/linen.glb" },
  { id: "bolt", glyph: "𓊃", translit: "z", sound: "z / s", name: "Door bolt",
    note: "The door bolt writes z, an older s; by the Middle Kingdom bolt and cloth were interchangeable.",
    model: "/models/signs/bolt.glb" },
  { id: "pool", glyph: "𓈙", translit: "š", sound: "sh", name: "Garden pool",
    note: "A rectangular garden pool seen from above writes š, as in sš \"scribe\".",
    model: "/models/signs/pool.glb" },
  { id: "stand", glyph: "𓎼", translit: "g", sound: "g", name: "Jar-stand",
    note: "The ring stand that held a round-bottomed jar writes hard g, as in grḥ \"night\".",
    model: "/models/signs/stand.glb" },
  { id: "tether", glyph: "𓍿", translit: "ṯ", sound: "ch", name: "Tethering rope",
    note: "A hobble-rope writes ṯ, close to English ch; in later Egyptian it often softened to t.",
    model: "/models/signs/tether.glb" },
  { id: "cobra", glyph: "𓆓", translit: "ḏ", sound: "j", name: "Resting cobra",
    note: "The resting cobra writes ḏ, like English j, as in ḏd \"to say\" and ḏt \"eternity\".",
    model: "/models/signs/cobra.glb" },
];

export const ROUNDS = 10;
export const ROUND_MS = 12_000;
export const OPTIONS_PER_ROUND = 4;

export type Round = {
  target: SignObject;
  options: SignObject[];
};

export type Rng = () => number;

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Build `count` rounds; each target appears before any repeats. */
export function buildRounds(
  objects: readonly SignObject[] = SIGN_OBJECTS,
  count: number = ROUNDS,
  rng: Rng = Math.random
): Round[] {
  if (objects.length < 2) throw new Error("Need at least two sign objects");
  const rounds: Round[] = [];
  let order: SignObject[] = [];
  while (rounds.length < count) {
    if (order.length === 0) order = shuffle(objects, rng);
    const target = order.shift()!;
    const distractors = shuffle(objects.filter((o) => o.id !== target.id), rng).slice(
      0,
      OPTIONS_PER_ROUND - 1
    );
    rounds.push({ target, options: shuffle([target, ...distractors], rng) });
  }
  return rounds;
}

export const BASE_POINTS = 100;
export const MAX_TIME_BONUS = 50;
export const STREAK_BONUS_PER = 10;
export const STREAK_BONUS_CAP = 5;

export function scoreAnswer(input: {
  correct: boolean;
  msLeft: number;
  roundMs?: number;
  streak: number;
  /** Revealing the hint forfeits the speed bonus (base + streak still count). */
  hintUsed?: boolean;
}): { points: number; streak: number } {
  if (!input.correct) return { points: 0, streak: 0 };
  const roundMs = input.roundMs ?? ROUND_MS;
  const frac = Math.max(0, Math.min(1, input.msLeft / roundMs));
  const timeBonus = input.hintUsed ? 0 : Math.round(frac * MAX_TIME_BONUS);
  const streakBonus = Math.min(input.streak, STREAK_BONUS_CAP) * STREAK_BONUS_PER;
  return { points: BASE_POINTS + timeBonus + streakBonus, streak: input.streak + 1 };
}

export const MAX_GAME_XP = 150;

/** XP awarded for a finished game: ~1 XP per 10 points, capped. */
export function xpForGame(totalPoints: number): number {
  return Math.max(0, Math.min(MAX_GAME_XP, Math.round(totalPoints / 10)));
}

export const GAME_LESSON_ID = "game-sign-hunt";
