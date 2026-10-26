/**
 * Tomb Wall Decode — game data and pure rules.
 *
 * A word is carved into a torch-lit wall. The player must (1) tap the signs
 * in reading order — signs face the *start* of the line, so a wall carved
 * right-to-left shows every sign mirrored — and then (2) tap the
 * determinative: the silent sign at the end that tells you what kind of
 * thing the word is (a person, a god, motion, a place…).
 *
 * This is the core skill of actually *reading* hieroglyphs, as opposed to
 * recognising single signs (Sign Hunt) — it pairs with Lesson 3
 * (Determinatives) and the monumental-text lessons.
 */

export type SignRole =
  /** carries sound */
  | "phon"
  /** repeats a sound already written by a multi-consonant sign */
  | "comp"
  /** silent classifier */
  | "det"
  /** writes the whole word by picture (ideogram / logogram) */
  | "ideo";

export type WallSign = {
  /** Unicode hieroglyph */
  glyph: string;
  /** What it contributes: a sound value, or a short label for determinatives */
  value: string;
  role: SignRole;
  /** What the sign depicts (for feedback) */
  name: string;
};

export type WallWord = {
  id: string;
  translit: string;
  meaning: string;
  /** Signs in reading order */
  signs: WallSign[];
  /** One-line teaching note shown after the round */
  note: string;
};

/* ───────────────────────── sign shorthands ───────────────────────── */
// Every glyph below is the Unicode character for the Gardiner sign named in
// the comment (verified against the Unicode character database).

const s = (glyph: string, value: string, name: string, role: SignRole = "phon"): WallSign => ({
  glyph,
  value,
  role,
  name,
});
const comp = (glyph: string, value: string, name: string) => s(glyph, value, name, "comp");
const det = (glyph: string, value: string, name: string) => s(glyph, value, name, "det");

// uniliterals
const A = (v = "ꜣ") => s("𓄿", v, "Egyptian vulture"); // G1
const I = (v = "ꞽ") => s("𓇋", v, "reed leaf"); // M17
const AYIN = () => s("𓂝", "ꜥ", "forearm"); // D36
const W = () => s("𓅱", "w", "quail chick"); // G43
const B = () => s("𓃀", "b", "foot"); // D58
const P = () => s("𓊪", "p", "stool"); // Q3
const M = () => s("𓅓", "m", "owl"); // G17
const N = () => s("𓈖", "n", "ripple of water"); // N35
const R = () => s("𓂋", "r", "mouth"); // D21
const H_DOT = () => s("𓎛", "ḥ", "twisted wick"); // V28
const KH = () => s("𓐍", "ḫ", "placenta / sieve"); // Aa1
const KH2 = () => s("𓄡", "ẖ", "animal belly"); // F32
const S = () => s("𓋴", "s", "folded cloth"); // S29
const SH = () => s("𓈙", "š", "pool"); // N37
const Q = () => s("𓈎", "q", "hill-slope"); // N29
const T = () => s("𓏏", "t", "bread loaf"); // X1
const D = () => s("𓂧", "d", "hand"); // D46

// determinatives
const MAN = () => det("𓀀", "person (man)", "seated man"); // A1
const WOMAN = () => det("𓁐", "person (woman)", "seated woman"); // B1
const GOD = () => det("𓀭", "god", "seated god"); // A40
const CHILD = () => det("𓀔", "child", "seated child"); // A17
const LEGS = () => det("𓂻", "motion", "walking legs"); // D54
const SUN = () => det("𓇳", "sun / time", "sun disc"); // N5
const WATER = () => det("𓈗", "liquid", "three ripples of water"); // N35A
const STAR = () => det("𓇼", "star / heavens", "star"); // N14
const HEART = () => det("𓄣", "heart", "heart"); // F34
const BULL = () => det("𓃒", "cattle", "bull"); // E1
const JUG = () => det("𓏊", "drink", "beer jug"); // W22
const BOAT = () => det("𓊛", "boat", "boat"); // P1
const EYE = () => det("𓁹", "seeing", "eye"); // D4
const TOWN = () => det("𓊖", "town / place", "crossroads in a circle"); // O49
const HOUSE = () => det("𓉐", "building", "house plan"); // O1
const DESERT = () => det("𓈉", "desert / foreign land", "three hills"); // N25
const BIRD = () => det("𓅬", "bird", "goose"); // G38
const STRIKE = () => det("𓂡", "force / effort", "arm holding a stick"); // D40
const HIDE = () => det("𓄛", "animal", "animal hide"); // F27

/* ───────────────────────────── words ───────────────────────────── */

export const WALL_WORDS: WallWord[] = [
  {
    id: "ss",
    translit: "sš",
    meaning: "scribe",
    signs: [s("𓏞", "sš", "scribe's kit (palette, water pot, reed holder)"), MAN()],
    note: "The scribe's kit writes sš on its own; the seated man is silent and tells you the word is a person, here a man's profession.",
  },
  {
    id: "mwt",
    translit: "mwt",
    meaning: "mother",
    signs: [s("𓅐", "mwt", "vulture"), comp("𓏏", "t", "bread loaf"), WOMAN()],
    note: "One vulture sign writes all three sounds m-w-t; the loaf repeats the t, and the seated woman says ‘female person’.",
  },
  {
    id: "sn",
    translit: "sn",
    meaning: "brother",
    signs: [s("𓌢", "sn", "arrowhead"), comp("𓈖", "n", "ripple of water"), MAN()],
    note: "Arrowhead = sn. The ripple is a phonetic complement (it repeats the n) and the man classifies the word.",
  },
  {
    id: "snt",
    translit: "snt",
    meaning: "sister",
    signs: [s("𓌢", "sn", "arrowhead"), comp("𓈖", "n", "ripple of water"), T(), WOMAN()],
    note: "Same word as ‘brother’ plus the feminine -t, and the determinative swaps to a seated woman.",
  },
  {
    id: "hmt",
    translit: "ḥmt",
    meaning: "wife, woman",
    signs: [s("𓈞", "ḥm", "well full of water"), T(), WOMAN()],
    note: "Without the seated woman you could not tell ḥmt ‘wife’ from ḥmt ‘copper’: determinatives disambiguate.",
  },
  {
    id: "ntr",
    translit: "nṯr",
    meaning: "god",
    signs: [s("𓊹", "nṯr", "cloth wound on a pole"), GOD()],
    note: "The flag-pole writes nṯr; the seated god is the divine determinative that follows gods’ names.",
  },
  {
    id: "imn",
    translit: "ꞽmn",
    meaning: "Amun",
    signs: [I(), s("𓏠", "mn", "gaming board"), comp("𓈖", "n", "ripple of water"), GOD()],
    note: "Amun ‘the hidden one’: reed + gaming-board (mn) + complement n, then the seated god.",
  },
  {
    id: "ra",
    translit: "rꜥ",
    meaning: "Ra, the sun",
    signs: [R(), AYIN(), SUN()],
    note: "Mouth r + forearm ꜥ spell the sound; the sun disc at the end tells you it is the sun itself.",
  },
  {
    id: "mw",
    translit: "mw",
    meaning: "water",
    signs: [M(), W(), WATER()],
    note: "Owl + chick spell m-w; the three ripples are the determinative for anything liquid.",
  },
  {
    id: "itrw",
    translit: "ꞽtrw",
    meaning: "river",
    signs: [I(), T(), R(), W(), WATER()],
    note: "Four sound-signs then the water determinative. Coptic eioor and Hebrew ye’or (‘the Nile’) both descend from ꞽtrw.",
  },
  {
    id: "sba",
    translit: "sbꜣ",
    meaning: "star",
    signs: [S(), B(), A(), STAR()],
    note: "s-b-ꜣ spelled out, then a five-pointed star as the determinative.",
  },
  {
    id: "ib",
    translit: "ꞽb",
    meaning: "heart",
    signs: [I(), B(), HEART()],
    note: "The heart sign is a determinative here; on its own it can also write the whole word ꞽb.",
  },
  {
    id: "ka",
    translit: "kꜣ",
    meaning: "bull",
    signs: [s("𓂓", "kꜣ", "two raised arms"), comp("𓄿", "ꜣ", "vulture"), BULL()],
    note: "kꜣ ‘bull’ and kꜣ ‘spirit’ sound alike; only the bull determinative tells them apart.",
  },
  {
    id: "hnqt",
    translit: "ḥnqt",
    meaning: "beer",
    signs: [H_DOT(), N(), Q(), T(), JUG()],
    note: "Beer was a staple ration. The jug determinative marks drinks and liquids in jars.",
  },
  {
    id: "dpt",
    translit: "dpt",
    meaning: "boat",
    signs: [D(), P(), T(), BOAT()],
    note: "Hand, stool, loaf spell d-p-t; the boat classifies it. Boat determinatives also follow words for ‘travel’.",
  },
  {
    id: "pri",
    translit: "prꞽ",
    meaning: "to go out",
    signs: [s("𓉐", "pr", "house plan"), comp("𓂋", "r", "mouth"), LEGS()],
    note: "The same house sign that means ‘house’, but walking legs turn it into a verb of motion.",
  },
  {
    id: "aq",
    translit: "ꜥq",
    meaning: "to enter",
    signs: [s("𓅧", "ꜥq", "cormorant"), comp("𓈎", "q", "hill-slope"), LEGS()],
    note: "Legs = motion. Verbs of going, coming, entering and following all take this determinative.",
  },
  {
    id: "ii",
    translit: "ꞽꞽ",
    meaning: "to come",
    signs: [s("𓇍", "ꞽꞽ", "reed leaf with walking legs"), comp("𓇋", "ꞽ", "reed leaf"), LEGS()],
    note: "A very common verb in tomb texts: ‘come in peace’. The legs say ‘this is about moving’.",
  },
  {
    id: "shms",
    translit: "šms",
    meaning: "to follow",
    signs: [s("𓌞", "šms", "crook with knife and pouch"), comp("𓋴", "s", "folded cloth"), LEGS()],
    note: "šms ‘follow’ (as in šmsw, the followers of Horus): walking legs for a verb of motion.",
  },
  {
    id: "aha",
    translit: "ꜥḥꜥ",
    meaning: "to stand",
    signs: [s("𓊢", "ꜥḥꜥ", "mast"), comp("𓂝", "ꜥ", "forearm"), LEGS()],
    note: "Even ‘stand up’ takes the walking legs; the legs mark the whole class of movement and posture verbs.",
  },
  {
    id: "maa",
    translit: "mꜣꜣ",
    meaning: "to see",
    signs: [s("𓌳", "mꜣ", "sickle"), comp("𓄿", "ꜣ", "vulture"), EYE()],
    note: "A sickle writes mꜣ and the vulture repeats its ꜣ; the eye is the determinative for seeing.",
  },
  {
    id: "kmt",
    translit: "kmt",
    meaning: "Egypt (the Black Land)",
    signs: [s("𓆎", "km", "crocodile skin"), comp("𓅓", "m", "owl"), T(), TOWN()],
    note: "Kemet, the black silt of the Nile valley. The crossroads-in-a-circle marks towns and inhabited places.",
  },
  {
    id: "dshrt",
    translit: "dšrt",
    meaning: "the Red Land (desert)",
    signs: [D(), SH(), R(), T(), DESERT()],
    note: "The opposite of Kemet: the three hills classify deserts and foreign lands.",
  },
  {
    id: "khrd",
    translit: "ẖrd",
    meaning: "child",
    signs: [KH2(), R(), D(), CHILD()],
    note: "A seated child with hand to mouth is the determinative for children and youth.",
  },
  {
    id: "wsir",
    translit: "wsꞽr",
    meaning: "Osiris",
    signs: [s("𓊨", "ws / st", "throne"), s("𓁹", "ꞽr", "eye"), GOD()],
    note: "Throne + eye spell the god’s name; the seated god at the end is the divine determinative.",
  },
  {
    id: "pth",
    translit: "ptḥ",
    meaning: "Ptah",
    signs: [P(), T(), H_DOT(), GOD()],
    note: "Ptah of Memphis, patron of craftsmen: three alphabetic signs and the god determinative.",
  },
  {
    id: "hwt",
    translit: "ḥwt",
    meaning: "enclosure, temple estate",
    signs: [s("𓉗", "ḥwt", "enclosure plan"), T(), HOUSE()],
    note: "The house plan classifies buildings, as in ḥwt-nṯr ‘god’s mansion’, i.e. temple.",
  },
  {
    id: "apd",
    translit: "ꜣpd",
    meaning: "bird",
    signs: [A(), P(), D(), BIRD()],
    note: "Vulture, stool, hand spell ꜣ-p-d; the goose is the general determinative for birds.",
  },
  {
    id: "nkht",
    translit: "nḫt",
    meaning: "strong, victorious",
    signs: [N(), KH(), T(), STRIKE()],
    note: "The arm with a stick marks force and effort; it follows words for strength, striking and seizing.",
  },
  {
    id: "khnmw",
    translit: "ẖnmw",
    meaning: "Khnum (ram god)",
    signs: [s("𓎸", "ẖnm", "water jar"), comp("𓅓", "m", "owl"), W(), GOD()],
    note: "Khnum, the potter god who shapes people on his wheel: jar ẖnm, complement m, the ending w, then the seated god.",
  },
  {
    id: "miw",
    translit: "mꞽw",
    meaning: "cat",
    signs: [M(), I(), W(), HIDE()],
    note: "m-ꞽ-w: the Egyptian word for cat really was ‘miu’. The hide classifies mammals.",
  },
];

/* ──────────────────────── reading direction ──────────────────────── */

/**
 * Glyphs that clearly face one way (people, animals, body parts, tools).
 * When a wall is carved right-to-left these are mirrored, and the player
 * can tell where to start. Words with only symmetrical signs (𓊪𓏏𓈖…) are
 * kept out of the pool because direction would be a guess.
 */
export const ASYMMETRIC_GLYPHS: ReadonlySet<string> = new Set(
  // for…of iterates by code point, so astral hieroglyphs stay whole
  Array.from("𓀀𓁐𓀭𓀔𓂻𓃒𓅐𓅧𓌞𓊢𓊛𓁹𓆎𓂝𓂧𓃀𓅓𓅱𓇋𓈎𓄿𓊹𓄡𓌳𓊨𓇍𓉐𓉗𓅬𓂡𓄛𓎸𓏞")
);

export function hasDirectionClue(word: WallWord): boolean {
  return word.signs.some((sg) => ASYMMETRIC_GLYPHS.has(sg.glyph));
}

/** The first asymmetric sign — used for the "which way?" hint. */
export function directionClueSign(word: WallWord): WallSign | null {
  return word.signs.find((sg) => ASYMMETRIC_GLYPHS.has(sg.glyph)) ?? null;
}

export function determinativeIndex(word: WallWord): number {
  return word.signs.findIndex((sg) => sg.role === "det");
}

/* ───────────────────────────── rounds ───────────────────────────── */

export const ROUNDS = 8;
/** Time after which the speed bonus has fully decayed. */
export const SPEED_WINDOW_MS = 20_000;

/**
 * Which way the font's default (unmirrored) glyphs face. Signs face the
 * *start* of a line, so left-facing glyphs belong to left-to-right text.
 * Verified against the Noto Sans Egyptian Hieroglyphs rendering.
 */
export const GLYPHS_FACE_LEFT = true;

export type Round = {
  word: WallWord;
  /** Carved right-to-left: first sign on the right, signs facing right. */
  rtl: boolean;
  /** Whether each glyph must be drawn flipped to face the line start. */
  mirrored: boolean;
  /** Sign indices in left-to-right display order. */
  display: number[];
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

export function makeRound(word: WallWord, rtl: boolean): Round {
  const n = word.signs.length;
  const display = Array.from({ length: n }, (_, i) => (rtl ? n - 1 - i : i));
  return { word, rtl, mirrored: GLYPHS_FACE_LEFT ? rtl : !rtl, display };
}

/** Build `count` rounds of distinct words; roughly half carved right-to-left. */
export function buildRounds(
  words: readonly WallWord[] = WALL_WORDS,
  count: number = ROUNDS,
  rng: Rng = Math.random
): Round[] {
  const pool = words.filter(hasDirectionClue);
  if (pool.length < 2) throw new Error("Need at least two wall words");
  const rounds: Round[] = [];
  let order: WallWord[] = [];
  // Alternate directions (shuffled) so a game never happens to be all one way.
  const dirs: boolean[] = [];
  while (rounds.length < count) {
    if (order.length === 0) order = shuffle(pool, rng);
    if (dirs.length === 0) dirs.push(...shuffle([true, false, true, false], rng));
    rounds.push(makeRound(order.shift()!, dirs.shift()!));
  }
  return rounds;
}

/** Which display slot the player should tap next, given how many are done. */
export function expectedSlot(round: Round, step: number): number {
  // reading-order sign `step` sits at display position display.indexOf(step)
  return round.display.indexOf(step);
}

/* ───────────────────────────── scoring ───────────────────────────── */

export const ORDER_POINTS = 100;
export const DET_POINTS = 50;
export const MAX_SPEED_BONUS = 50;
export const STREAK_BONUS_PER = 10;
export const STREAK_BONUS_CAP = 5;

export function scoreRound(input: {
  /** Wrong taps during the reading-order step */
  orderMistakes: number;
  /** Tapped the right determinative on the first try */
  detCorrect: boolean;
  /** Wall time for the whole round */
  elapsedMs: number;
  /** Current run of perfect rounds */
  streak: number;
  /** Revealing the direction hint forfeits the speed bonus */
  hintUsed?: boolean;
}): { points: number; perfect: boolean; streak: number } {
  const order =
    input.orderMistakes === 0 ? ORDER_POINTS : input.orderMistakes <= 2 ? Math.round(ORDER_POINTS * 0.6) : Math.round(ORDER_POINTS * 0.3);
  const detPts = input.detCorrect ? DET_POINTS : 0;
  const perfect = input.orderMistakes === 0 && input.detCorrect;
  let speed = 0;
  if (perfect && !input.hintUsed) {
    const frac = Math.max(0, Math.min(1, 1 - input.elapsedMs / SPEED_WINDOW_MS));
    speed = Math.round(frac * MAX_SPEED_BONUS);
  }
  const streakBonus = perfect ? Math.min(input.streak, STREAK_BONUS_CAP) * STREAK_BONUS_PER : 0;
  return {
    points: order + detPts + speed + streakBonus,
    perfect,
    streak: perfect ? input.streak + 1 : 0,
  };
}

export const MAX_GAME_XP = 150;

/** XP for a finished game: ~1 XP per 10 points, capped. */
export function xpForGame(totalPoints: number): number {
  return Math.max(0, Math.min(MAX_GAME_XP, Math.round(totalPoints / 10)));
}

export const GAME_LESSON_ID = "game-tomb-wall";
