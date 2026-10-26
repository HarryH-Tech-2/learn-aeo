/**
 * Per-lesson additions to the generic lesson data: which signature mechanic
 * a lesson runs, and the real inscription it ends by reading ("Read it").
 *
 * Kept out of lessons.ts so the lesson API payload stays the same shape and
 * the client resolves these by lesson id.
 */
import type { WallSign } from "@/lib/tomb-wall";

export type LessonMechanic =
  | "spell-it"
  | "field-sketchbook"
  | "pick-the-ending"
  | "counting-house"
  | "cartouche-reader"
  | "stela-builder"
  | "walk-the-hall"
  | "word-anatomy";

export type LessonReading = {
  /** Short label shown above the wall */
  title: string;
  /** Where the text comes from */
  source: string;
  /** Signs in READING order */
  signs: WallSign[];
  /**
   * Sign indices in WRITTEN (left-to-right display) order when that differs
   * from reading order — honorific transposition. Defaults to reading order.
   */
  written?: number[];
  /** Carve it right-to-left (signs mirrored) */
  rtl?: boolean;
  translit: string;
  meaning: string;
  /** Teaching note shown once it is read */
  note: string;
};

const s = (glyph: string, value: string, name: string, role: WallSign["role"] = "phon"): WallSign => ({ glyph, value, name, role });

export const MECHANIC_BY_LESSON: Record<string, LessonMechanic> = {
  "expedition-begins": "spell-it",
  "outer-courtyard": "field-sketchbook",
  "pilgrims-gallery": "pick-the-ending",
  "the-treasury": "counting-house",
  "royal-hall": "cartouche-reader",
  "sacred-chapel": "stela-builder",
  "hypostyle-hall": "walk-the-hall",
  "inner-sanctum": "word-anatomy",
};

export const READING_BY_LESSON: Record<string, LessonReading> = {
  // Khufu — four alphabet signs, the Great Pyramid's builder.
  "expedition-begins": {
    title: "A king’s name",
    source: "Cartouche of Khufu (4th Dynasty), as carved in the Great Pyramid’s relieving chambers",
    signs: [s("𓐍", "ḫ", "placenta / sieve"), s("𓅱", "w", "quail chick"), s("𓆑", "f", "horned viper"), s("𓅱", "w", "quail chick")],
    translit: "ḫwfw",
    meaning: "Khufu (Cheops)",
    note: "Four alphabet signs spell the name of the builder of the Great Pyramid. The Greeks heard it as ‘Cheops’; Egyptian wrote no vowels, so we fill them in by convention.",
  },
  // mꜣꞽ — lion
  "outer-courtyard": {
    title: "An animal’s name",
    source: "Middle Kingdom spelling, e.g. the Tale of the Shipwrecked Sailor",
    signs: [s("𓌳", "mꜣ", "sickle"), s("𓄿", "ꜣ", "vulture", "comp"), s("𓇋", "ꞽ", "reed leaf"), s("𓃭", "lion", "recumbent lion", "det")],
    translit: "mꜣꞽ",
    meaning: "lion",
    note: "A sickle writes mꜣ, the vulture repeats the ꜣ, the reed adds ꞽ, and then the lion itself appears as the determinative. Picture-signs do double duty as sound and classifier.",
    rtl: true,
  },
  // sš — scribe
  "pilgrims-gallery": {
    title: "A title",
    source: "Stelae and tomb walls of every period (one of the commonest titles in Egypt)",
    signs: [s("𓋴", "s", "folded cloth"), s("𓈙", "š", "pool"), s("𓀀", "person (man)", "seated man", "det")],
    translit: "sš",
    meaning: "scribe",
    note: "The cloth and the pool spell the sounds; the seated man is silent and tells you the word is a man’s profession. Drop the man and the same sounds with a papyrus roll 𓏛 mean ‘writing’.",
  },
  // ḫꜣ t ḥnqt — a thousand of bread and beer
  "the-treasury": {
    title: "From an offering list",
    source: "The offering formula on countless Middle Kingdom stelae",
    signs: [
      s("𓆼", "1,000", "lotus plant"),
      s("𓏏", "t (bread)", "bread loaf", "ideo"),
      s("𓎛", "ḥ", "twisted wick"),
      s("𓈖", "n", "ripple of water"),
      s("𓈎", "q", "hill-slope"),
      s("𓏏", "t", "bread loaf"),
      s("𓏊", "drink", "beer jar", "det"),
    ],
    translit: "ḫꜣ t ḥnqt",
    meaning: "a thousand (of) bread and beer",
    note: "The lotus is the numeral 1,000; the loaf on its own is the word ‘bread’; ḥ-n-q-t spells ‘beer’ and the jar classifies it. Real offering lists run on: a thousand oxen, fowl, alabaster, linen…",
  },
  // Tutankhamun — honorific transposition
  "royal-hall": {
    title: "The boy king",
    source: "Nomen cartouche of Tutankhamun, Valley of the Kings tomb KV62",
    signs: [
      s("𓏏", "t", "bread loaf"),
      s("𓅱", "w", "quail chick"),
      s("𓏏", "t", "bread loaf"),
      s("𓋹", "ꜥnḫ", "ankh"),
      s("𓇋", "ꞽ", "reed leaf"),
      s("𓏠", "mn", "gaming board"),
      s("𓈖", "n", "ripple of water", "comp"),
    ],
    // Amun (signs 4,5,6) is WRITTEN first out of respect, but READ last.
    written: [4, 5, 6, 0, 1, 2, 3],
    translit: "twt-ꜥnḫ-ꞽmn",
    meaning: "Tutankhamun: ‘living image of Amun’",
    note: "Honorific transposition: the god’s name ꞽmn is carved first because a god outranks a king, but the name is read twt-ꜥnḫ-ꞽmn. Whenever a god or ‘king’ appears in a phrase, expect it to jump to the front.",
  },
  // ḥtp dj nswt — the offering formula's first words
  "sacred-chapel": {
    title: "The offering formula",
    source: "Opening of the ḥtp-dj-nswt formula, on virtually every funerary stela",
    signs: [s("𓊵", "ḥtp", "offering slab"), s("𓏙", "dj", "conical loaf (give)"), s("𓇓", "nsw(t)", "sedge plant (king)"), s("𓏏", "t", "bread loaf", "comp")],
    // nswt 'king' is written first (honorific), read last.
    written: [2, 3, 0, 1],
    translit: "ḥtp dj nswt",
    meaning: "an offering which the king gives",
    note: "The king’s sedge-plant is carved first out of respect, but the phrase is read ḥtp-dj-nswt: ‘an offering which the king gives’. Learn these four signs and you can begin almost any stela in any museum.",
  },
  // dj ꜥnḫ ḏd wꜣs — given life, stability, dominion
  "hypostyle-hall": {
    title: "A royal epithet",
    source: "Temple walls at Karnak and Luxor, after the king’s cartouche",
    signs: [s("𓏙", "dj", "conical loaf (given)"), s("𓋹", "ꜥnḫ", "ankh (life)"), s("𓊽", "ḏd", "djed pillar (stability)"), s("𓌀", "wꜣs", "was-sceptre (dominion)")],
    translit: "dj ꜥnḫ ḏd wꜣs",
    meaning: "given life, stability and dominion",
    note: "Three amulet-signs in a row (ankh, djed, was), each a whole word. On a doorway this phrase is carved once on each jamb, mirror-image, so that both face the entrance.",
    rtl: true,
  },
  // ꜥnḫ ḏd wꜣs — built of three multi-consonant signs
  "inner-sanctum": {
    title: "Three words, three signs",
    source: "The commonest blessing in Egyptian art, on amulets, thrones and temple walls",
    signs: [s("𓋹", "ꜥnḫ", "ankh", "ideo"), s("𓊽", "ḏd", "djed pillar", "ideo"), s("𓌀", "wꜣs", "was-sceptre", "ideo")],
    translit: "ꜥnḫ ḏd wꜣs",
    meaning: "life, stability, dominion",
    note: "Each sign writes a whole word of three consonants by itself: no complements, no determinatives. You now read signs at every level: sound, syllable, word.",
  },
};

export function getLessonMechanic(lessonId: string): LessonMechanic | undefined {
  return MECHANIC_BY_LESSON[lessonId];
}

export function getLessonReading(lessonId: string): LessonReading | undefined {
  return READING_BY_LESSON[lessonId];
}
