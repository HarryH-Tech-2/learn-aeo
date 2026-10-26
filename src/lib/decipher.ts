/**
 * Decipher — the Champollion campaign inside Cartouche of the Day.
 *
 * Five short chapters retrace the 1814–1822 decipherment: the player places
 * the letters of Greek royal names onto the signs of real cartouches and so
 * deduces each sign's value, exactly as Young and Champollion did. Every
 * sign deduced enters a permanent "unlocked" set.
 *
 * Sign sequences were taken from the Wikipedia infobox `<hiero>` markup of
 * the relevant ruler in two language editions (en + de/fr) and cross-checked
 * against Champollion's own readings as described in the Rosetta Stone,
 * Philae obelisk and Champollion articles; see docs/decipher-sources.md.
 * Gardiner codes are audited against Unicode names by scripts/audit-glyphs.py.
 */

export type DecipherSign = {
  glyph: string;
  gardiner: string;
  /** Letter tile the player must place; null for signs that are not letters */
  letter: string | null;
  /** Egyptological value shown on the flip */
  sound: string;
  /** What the picture is */
  name: string;
  /** A feminine ending, not a letter: shown greyed, revealed at the end */
  ending?: boolean;
};

export type DecipherPuzzle = {
  id: string;
  ruler: string;
  /** The name as the Greeks wrote it */
  greek: string;
  /** Object the cartouche is copied from */
  source: string;
  /** Short brief shown above the cartouche */
  brief: string;
  /** Extra clue card (Champollion's Coptic) */
  clue?: { title: string; body: string };
  signs: DecipherSign[];
  /** Pre-fill slots whose sign is already unlocked (chapter 2 onwards) */
  prefillKnown: boolean;
  /** Shown once the row is solved */
  reveal: string;
};

export type QuizOption = { text: string; correct: boolean; explanation: string };
export type DecipherQuiz = { id: string; prompt: string; options: QuizOption[] };

export type ReadRound = {
  id: string;
  /** Cartouche signs, reading order */
  glyphs: string;
  answer: string;
  options: string[];
  note: string;
};

export type DecipherChapter = {
  number: 1 | 2 | 3 | 4 | 5;
  id: string;
  title: string;
  date: string;
  intro: string[];
  puzzles: DecipherPuzzle[];
  quiz?: DecipherQuiz;
  reading?: ReadRound[];
  outro: { title: string; body: string[] };
};

// prettier-ignore
const S = (glyph: string, gardiner: string, letter: string | null, sound: string, name: string, ending?: boolean): DecipherSign =>
  ending ? { glyph, gardiner, letter, sound, name, ending } : { glyph, gardiner, letter, sound, name };

export const CHAPTERS: DecipherChapter[] = [
  {
    number: 1,
    id: "ptolemy",
    title: "Ptolemy",
    date: "1814–1819",
    intro: [
      "The Rosetta Stone carries one decree in three scripts. Its Greek text can be read, and it names the king: ΠΤΟΛΕΜΑΙΟΣ, Ptolemaios.",
      "Two things were known, or at least strongly suspected. A ring around a group of signs marks a royal name. And a Greek name has no Egyptian meaning, so it can only have been spelled by its sounds.",
      "Thomas Young matched this cartouche to Ptolemy first. Do what he did: place the sounds of the name onto the signs, in order. Egyptian writing skips most vowels, so the letters that survive are P T O L M I S.",
    ],
    puzzles: [
      {
        id: "ptolemy",
        ruler: "Ptolemy V",
        greek: "ΠΤΟΛΕΜΑΙΟΣ",
        source: "The Rosetta Stone, 196 BCE (British Museum EA 24)",
        brief: "Drag each letter under the sign you think spells it. Nothing is marked until the whole row is placed.",
        prefillKnown: false,
        signs: [
          S("𓊪", "Q3", "P", "p", "stool"),
          S("𓏏", "X1", "T", "t", "bread loaf"),
          S("𓍯", "V4", "O", "w (o)", "lasso"),
          S("𓃭", "E23", "L", "l", "lion"),
          S("𓐝", "Aa15", "M", "m", "rib (a rare m)"),
          S("𓇋𓇋", "M17", "I", "y (i)", "two reeds"),
          S("𓋴", "S29", "S", "s", "folded cloth"),
        ],
        reveal:
          "Seven signs, seven sounds. Young published readings for this cartouche in 1819 and got most of them right; Champollion fixed the rest. You now hold the values of seven signs, but one cartouche proves nothing on its own: these could be a special code for foreign names, which is exactly what Young believed.",
      },
    ],
    outro: {
      title: "Seven signs unlocked",
      body: [
        "The stone gives you Ptolemy and nothing else: the Rosetta Stone does not name Cleopatra. To test the alphabet you need a second name that shares some letters with the first.",
      ],
    },
  },
  {
    number: 2,
    id: "cleopatra",
    title: "Cleopatra",
    date: "1821–1822",
    intro: [
      "In December 1821 an obelisk from the temple at Philae reached England, shipped by William Bankes. Its Greek base names Ptolemy and Cleopatra, and its shaft carries two cartouches.",
      "Bankes pencilled ‘Cleopatra’ next to the second ring. Copies reached Champollion in Paris in 1822. The signs you already know are filled in for you. Place the rest of ΚΛΕΟΠΑΤΡΑ.",
    ],
    puzzles: [
      {
        id: "cleopatra",
        ruler: "Cleopatra",
        greek: "ΚΛΕΟΠΑΤΡΑ",
        source: "The Bankes obelisk from Philae, now at Kingston Lacy, Dorset",
        brief: "Known signs are already in place. The last two signs are greyed out: they are not letters, and you will meet them at the end.",
        prefillKnown: true,
        signs: [
          S("𓈎", "N29", "K", "q (k)", "hill slope"),
          S("𓃭", "E23", "L", "l", "lion"),
          S("𓇋", "M17", "E", "ꞽ (e / i)", "reed leaf"),
          S("𓍯", "V4", "O", "w (o)", "lasso"),
          S("𓊪", "Q3", "P", "p", "stool"),
          S("𓄿", "G1", "A", "ꜣ (a)", "vulture"),
          S("𓂧", "D46", "T", "d (t)", "hand"),
          S("𓂋", "D21", "R", "r", "mouth"),
          S("𓄿", "G1", "A", "ꜣ (a)", "vulture"),
          S("𓏏", "X1", null, "t (feminine)", "bread loaf", true),
          S("𓆇", "H8", null, "female name", "egg", true),
        ],
        reveal:
          "The lion, the lasso and the stool sit exactly where Ptolemy said they would: the alphabet holds across two names. Six more signs join your set.",
      },
    ],
    quiz: {
      id: "homophone",
      prompt:
        "Look at the T in each name. In Ptolemy the t is a bread loaf 𓏏. In Cleopatra it is a hand 𓂧. Both cartouches are carved by careful scribes. What is going on?",
      options: [
        {
          text: "One of the stonecutters made a mistake.",
          correct: false,
          explanation: "Both spellings recur on other monuments, so neither is an error.",
        },
        {
          text: "Two different signs can stand for the same sound.",
          correct: true,
          explanation:
            "Yes. Egyptian had several signs for some sounds (the hand is really d, close enough to Greek t). Champollion drew exactly this conclusion: the script has homophones, so an ‘alphabet’ of one sign per sound was never going to be the whole story.",
        },
        {
          text: "The hand shows Cleopatra was not really Egyptian.",
          correct: false,
          explanation: "Both rulers were Greek by descent; the sign choice has nothing to do with ancestry.",
        },
      ],
    },
    outro: {
      title: "The egg and the loaf",
      body: [
        "The two greyed signs at the end, the loaf 𓏏 and the egg 𓆇, are not letters at all. Together they mark a woman’s name, the way ‘-a’ does in Latin. Signs, then, can also be silent labels: a first hint that the system mixes sounds with meanings.",
      ],
    },
  },
  {
    number: 3,
    id: "greeks",
    title: "Alexander and Philip",
    date: "1822",
    intro: [
      "With thirteen signs in hand, Champollion attacked every Greek and Roman name he could find in copies from Egypt’s temples. Each new name tested the old values and added new signs.",
      "Nothing is filled in this time. Use what you know, and work out the rest from the Greek.",
    ],
    puzzles: [
      {
        id: "alexander",
        ruler: "Alexander the Great",
        greek: "ΑΛΕΞΑΝΔΡΟΣ",
        source: "Cartouche of Alexander, who built a shrine inside Luxor Temple",
        brief: "The Egyptian spelling keeps A L K S I N D R S. Watch for a new sign for s.",
        prefillKnown: false,
        signs: [
          S("𓄿", "G1", "A", "ꜣ (a)", "vulture"),
          S("𓃭", "E23", "L", "l", "lion"),
          S("𓎡", "V31", "K", "k", "basket"),
          S("𓊃", "O34", "S", "s (z)", "door bolt"),
          S("𓇋", "M17", "I", "ꞽ (i)", "reed leaf"),
          S("𓈖", "N35", "N", "n", "water ripple"),
          S("𓂧", "D46", "D", "d", "hand"),
          S("𓂋", "D21", "R", "r", "mouth"),
          S("𓊃", "O34", "S", "s (z)", "door bolt"),
        ],
        reveal:
          "Three new signs: the basket k, the ripple n, and the door bolt, a second sign for s. Homophones again. The hand that read as t in Cleopatra is a proper d here.",
      },
      {
        id: "philip",
        ruler: "Philip Arrhidaeus",
        greek: "ΦΙΛΙΠΠΟΣ",
        source: "Cartouche of Philip Arrhidaeus, Alexander’s half-brother, from his shrine at Karnak",
        brief: "The scribes wrote P L P O I S: the ph became p, the doubled p was written once.",
        prefillKnown: false,
        signs: [
          S("𓊪", "Q3", "P", "p", "stool"),
          S("𓃭", "E23", "L", "l", "lion"),
          S("𓊪", "Q3", "P", "p", "stool"),
          S("𓏲", "Z7", "O", "w (o / u)", "coil (a cursive w)"),
          S("𓇋𓇋", "M17", "I", "y (i)", "two reeds"),
          S("𓐠", "Aa18", "S", "s", "a third sign for s"),
        ],
        reveal:
          "Two more signs, both variants of ones you knew: a coil that writes w like the lasso, and a third s. By now the pattern is clear: the values hold, but the Egyptians had more than one sign for many sounds.",
      },
    ],
    outro: {
      title: "Eighteen signs, and a wall",
      body: [
        "Every name so far is Greek or Macedonian. Young had stopped here on purpose: he believed the Egyptians only spelled foreign names by sound and wrote their own language in pictures. To go further you need a native Egyptian name.",
      ],
    },
  },
  {
    number: 4,
    id: "leap",
    title: "The leap",
    date: "14 September 1822",
    intro: [
      "On 14 September 1822 Champollion was studying copies of reliefs from Abu Simbel that the architect Jean-Nicolas Huyot had brought back, from a temple far to the south, built long before any Greek ruled Egypt. One cartouche caught his eye.",
      "It begins with a sun and ends with two signs you know. Champollion had one thing the Egyptians left him: Coptic, the last stage of their language, still spoken in church. Use his clue.",
    ],
    puzzles: [
      {
        id: "ramesses",
        ruler: "Ramesses",
        greek: "",
        source: "Cartouche from the temple of Abu Simbel, copied by Huyot",
        brief: "Two signs are already yours. Deduce the other two from the clue, then place all four.",
        clue: {
          title: "Champollion’s Coptic",
          body: "In Coptic the sun is ⲣⲏ, ‘re’. And the sign 𓄟 appears on the Rosetta Stone in the group the Greek text calls ‘birthday’: in Coptic, ‘to be born’ is ⲙⲓⲥⲉ, ‘mise’, m-s.",
        },
        prefillKnown: true,
        signs: [
          S("𓇳", "N5", "RA", "rꜥ (the sun god Ra)", "sun disc"),
          S("𓄟", "F31", "MS", "ms ‘born’", "three fox skins"),
          S("𓋴", "S29", "S", "s", "folded cloth"),
          S("𓋴", "S29", "S", "s", "folded cloth"),
        ],
        reveal:
          "RA-MS-S-S: Ramesses, a name every reader of Greek history knew. A native Egyptian king, spelled partly by sound, partly by a picture that stands for a whole word. Young’s wall has just come down.",
      },
      {
        id: "thutmose",
        ruler: "Thutmose",
        greek: "",
        source: "A second cartouche from the copies, with the same ending",
        brief: "The bird on a standard is the ibis, sacred to the god Thoth. Place the three values.",
        prefillKnown: true,
        signs: [
          S("𓅝", "G26", "THOTH", "ḏḥwty (the god Thoth)", "ibis on a standard"),
          S("𓄟", "F31", "MS", "ms ‘born’", "three fox skins"),
          S("𓋴", "S29", "S", "s", "folded cloth"),
        ],
        reveal:
          "Thoth-ms: Thutmose, ‘Thoth is born’. Young had already guessed the ibis meant Thoth; Champollion could now read the rest, and the same ms proved the system was one system, from the pyramids to the Ptolemies.",
      },
    ],
    outro: {
      title: "‘Je tiens l’affaire!’",
      body: [
        "This is why 14 September mattered. Greek names had shown that signs could spell sounds. Ramesses and Thutmose showed that Egyptian names, and so Egyptian words, were spelled the same way, with pictures standing for whole words mixed in. The entire script could be read, not just the cartouches of foreigners.",
        "Champollion ran to his brother’s office at the Institut, said ‘Je tiens l’affaire!’ (‘I’ve got it!’) and collapsed. Over the following week he wrote it all up; on 27 September he read his Lettre à M. Dacier to the Académie des Inscriptions; the full system followed in the Précis of 1824.",
      ],
    },
  },
  {
    number: 5,
    id: "wall",
    title: "Read a wall",
    date: "Today",
    intro: [
      "Twenty-one signs are yours. On temple walls and obelisks the same cartouches are carved in a column instead of a row, and from right to left as often as left to right. Read each one and name the ruler.",
    ],
    puzzles: [],
    reading: [
      {
        id: "read-ptolemy",
        glyphs: "𓊪𓏏𓍯𓃭𓐝𓇋𓇋𓋴",
        answer: "Ptolemy",
        options: ["Ptolemy", "Philip", "Cleopatra", "Alexander", "Ramesses", "Thutmose"],
        note: "As on the Rosetta Stone: p-t-o-l-m-i-s.",
      },
      {
        id: "read-cleopatra",
        glyphs: "𓈎𓃭𓇋𓍯𓊪𓄿𓂧𓂋𓄿𓏏𓆇",
        answer: "Cleopatra",
        options: ["Berenike", "Arsinoe", "Cleopatra", "Ptolemy", "Alexander", "Philip"],
        note: "k-l-e-o-p-a-t-r-a, then the loaf and egg of a woman’s name.",
      },
      {
        id: "read-alexander",
        glyphs: "𓄿𓃭𓎡𓊃𓇋𓈖𓂧𓂋𓊃",
        answer: "Alexander",
        options: ["Alexander", "Antiochos", "Philip", "Ptolemy", "Ramesses", "Cleopatra"],
        note: "a-l-k-s-i-n-d-r-s: Alexandros.",
      },
      {
        id: "read-ramesses",
        glyphs: "𓇳𓄟𓋴𓋴",
        answer: "Ramesses",
        options: ["Thutmose", "Ramesses", "Amenhotep", "Ahmose", "Ptolemy", "Philip"],
        note: "Ra-ms-s-s, the Abu Simbel spelling.",
      },
      {
        id: "read-thutmose",
        glyphs: "𓅝𓄟𓋴",
        answer: "Thutmose",
        options: ["Ramesses", "Thutmose", "Ahmose", "Amenhotep", "Cleopatra", "Alexander"],
        note: "Thoth-ms: ‘Thoth is born’.",
      },
    ],
    outro: {
      title: "You read the wall",
      body: [
        "Everything you just did, Champollion did with pencil copies and a dictionary of Coptic. What he built from it, the recognition that a sign can be a sound, a word or a silent classifier, often in the same line, is the system every Egyptologist still uses. The free first lesson teaches the twenty-five sound-signs he started with.",
      ],
    },
  },
];

export const TOTAL_CHAPTERS = CHAPTERS.length;
export const DECIPHER_LESSON_ID = "game-decipher";
export const DECIPHER_STORAGE_KEY = "lh_decipher";
export const XP_PER_CHAPTER = 60;
export const XP_PER_SIGN = 5;

// ─── Pure rules ───

/** All the glyphs a puzzle contributes to the unlocked set (letters and endings). */
export function signsUnlockedBy(puzzle: DecipherPuzzle): string[] {
  return Array.from(new Set(puzzle.signs.map((s) => s.glyph)));
}

/** Every glyph the whole campaign can unlock, in order of first appearance. */
export function allUnlockableSigns(chapters: DecipherChapter[] = CHAPTERS): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ch of chapters) for (const p of ch.puzzles) for (const g of signsUnlockedBy(p)) {
    if (!seen.has(g)) {
      seen.add(g);
      out.push(g);
    }
  }
  return out;
}

/** Look up how a glyph was taught (first puzzle that contains it). */
export function signInfo(glyph: string, chapters: DecipherChapter[] = CHAPTERS): DecipherSign | undefined {
  for (const ch of chapters) for (const p of ch.puzzles) {
    const s = p.signs.find((x) => x.glyph === glyph);
    if (s) return s;
  }
  return undefined;
}

export type Placement = (string | null)[];

/**
 * The starting row: prefilled where the sign is already unlocked (if the
 * puzzle allows), null where the player must place a letter, and the ending
 * signs' letters set to null permanently (they never take a tile).
 */
export function initialPlacement(puzzle: DecipherPuzzle, unlocked: ReadonlySet<string>): Placement {
  return puzzle.signs.map((s) => {
    if (s.ending || s.letter === null) return null;
    if (puzzle.prefillKnown && unlocked.has(s.glyph)) return s.letter;
    return null;
  });
}

/** Which slot indices the player has to fill. */
export function openSlots(puzzle: DecipherPuzzle, unlocked: ReadonlySet<string>): number[] {
  const start = initialPlacement(puzzle, unlocked);
  return puzzle.signs
    .map((s, i) => (s.ending || s.letter === null || start[i] !== null ? -1 : i))
    .filter((i) => i >= 0);
}

/** The letter tiles offered: one per open slot, sorted so they don't give the order away. */
export function tilesFor(puzzle: DecipherPuzzle, unlocked: ReadonlySet<string>): string[] {
  const letters = openSlots(puzzle, unlocked).map((i) => puzzle.signs[i].letter as string);
  return [...letters].sort((a, b) => a.localeCompare(b));
}

export function isComplete(puzzle: DecipherPuzzle, placement: Placement): boolean {
  return puzzle.signs.every((s, i) => s.ending || s.letter === null || placement[i] !== null);
}

/** Per-slot correctness; only meaningful once the row is complete. */
export function checkPlacement(puzzle: DecipherPuzzle, placement: Placement): { correct: boolean[]; allCorrect: boolean } {
  const correct = puzzle.signs.map((s, i) => s.ending || s.letter === null || placement[i] === s.letter);
  return { correct, allCorrect: correct.every(Boolean) };
}

/** Put `letter` in the first open slot (or a chosen slot). Returns the new row and the letter it displaced. */
export function placeLetter(
  puzzle: DecipherPuzzle,
  placement: Placement,
  letter: string,
  slot: number | null,
  unlocked: ReadonlySet<string>
): { placement: Placement; displaced: string | null } {
  const open = openSlots(puzzle, unlocked);
  const target = slot !== null && open.includes(slot) ? slot : open.find((i) => placement[i] === null) ?? null;
  if (target === null) return { placement, displaced: letter };
  const next = [...placement];
  const displaced = next[target];
  next[target] = letter;
  return { placement: next, displaced };
}

export function clearSlot(puzzle: DecipherPuzzle, placement: Placement, slot: number, unlocked: ReadonlySet<string>): Placement {
  if (!openSlots(puzzle, unlocked).includes(slot)) return placement;
  const next = [...placement];
  next[slot] = null;
  return next;
}

export function quizAnswer(quiz: DecipherQuiz, index: number): QuizOption | undefined {
  return quiz.options[index];
}

// ─── Progress ───

export type DecipherProgress = {
  /** Chapters finished, e.g. [1, 2] */
  completed: number[];
  /** Glyphs deduced so far */
  unlocked: string[];
  /** Puzzle ids solved (so a reload doesn't re-ask inside a chapter) */
  solved: string[];
};

export const EMPTY_PROGRESS: DecipherProgress = { completed: [], unlocked: [], solved: [] };

export function nextChapter(progress: DecipherProgress): number {
  const done = new Set(progress.completed);
  for (const ch of CHAPTERS) if (!done.has(ch.number)) return ch.number;
  return TOTAL_CHAPTERS;
}

export function isChapterOpen(progress: DecipherProgress, n: number): boolean {
  return n === 1 || progress.completed.includes(n - 1) || progress.completed.includes(n);
}

export function withPuzzleSolved(progress: DecipherProgress, puzzle: DecipherPuzzle): DecipherProgress {
  return {
    ...progress,
    solved: Array.from(new Set([...progress.solved, puzzle.id])),
    unlocked: Array.from(new Set([...progress.unlocked, ...signsUnlockedBy(puzzle)])),
  };
}

export function withChapterComplete(progress: DecipherProgress, n: number): DecipherProgress {
  return { ...progress, completed: Array.from(new Set([...progress.completed, n])).sort((a, b) => a - b) };
}

/** Union of two progress records (local storage + account). */
export function mergeProgress(a: DecipherProgress, b: DecipherProgress): DecipherProgress {
  return {
    completed: Array.from(new Set([...a.completed, ...b.completed])).sort((x, y) => x - y),
    unlocked: Array.from(new Set([...a.unlocked, ...b.unlocked])),
    solved: Array.from(new Set([...a.solved, ...b.solved])),
  };
}

export function isProgress(x: unknown): x is DecipherProgress {
  if (!x || typeof x !== "object") return false;
  const p = x as Record<string, unknown>;
  return (
    Array.isArray(p.completed) && p.completed.every((n) => typeof n === "number") &&
    Array.isArray(p.unlocked) && p.unlocked.every((s) => typeof s === "string") &&
    Array.isArray(p.solved) && p.solved.every((s) => typeof s === "string")
  );
}

export function xpForChapter(chapter: DecipherChapter, newSigns: number): number {
  return XP_PER_CHAPTER + XP_PER_SIGN * newSigns + (chapter.number === TOTAL_CHAPTERS ? 40 : 0);
}

export function decipherShareText(signCount: number, url = "https://www.learnhieroglyphics.com/daily/decipher"): string {
  return `I deciphered ${signCount} hieroglyphs the way Champollion did in 1822 𓊪𓏏𓍯𓃭\n${url}`;
}
