/**
 * Scribe's Games — the practice games (3D and 2D), and which lessons they reinforce.
 * Used by the dashboard, the lesson outro ("Practice in 3D"), and the sitemap.
 */

export type GameInfo = {
  id: string;
  /** Roman numeral in the series */
  numeral: string;
  title: string;
  href: string;
  /** One-line pitch */
  blurb: string;
  /** What the game trains, in the learner's terms */
  skill: string;
  /** Lessons after which this game is the natural practice */
  lessonIds: string[];
  /** Free to play (no purchase needed) */
  free?: boolean;
  /** Indexable without an account (listed in the sitemap) */
  public?: boolean;
  /** What renders it: shown as a hint on the dashboard cards */
  tech?: "3D" | "React" | "SVG" | "Canvas";
};

export const GAMES: GameInfo[] = [
  {
    // Lesson 1 as a game. Signed-in learners get the written lesson by default (LessonContent), so this is their way in.
    id: "causeway",
    numeral: "𓂻",
    title: "The Causeway of Thoth",
    href: "/lessons/expedition-begins?mode=game",
    blurb: "Lesson 1 as a 3D game: cross the causeway, carve each sign of your name, and open the temple gate.",
    skill: "The alphabet signs in your own name, spelled under time and gravity",
    lessonIds: ["expedition-begins"],
    free: true,
    tech: "3D",
  },
  {
    id: "daily",
    numeral: "☉",
    title: "Cartouche of the Day",
    href: "/daily",
    blurb: "One real pharaoh’s name a day. Put the right sound under every sign and read it in four tries.",
    skill: "Reading royal names sign by sign: sound-signs, word-signs and the god-first rule",
    lessonIds: ["expedition-begins", "royal-hall"],
    free: true,
    public: true,
    tech: "React",
  },
  {
    id: "decipher",
    numeral: "𓊪",
    title: "Decipher",
    href: "/daily/decipher",
    blurb: "Crack the script the way Champollion did: Ptolemy, Cleopatra, then Ramesses with a Coptic clue.",
    skill: "How sign values were deduced; homophones; sounds versus word-signs",
    lessonIds: ["expedition-begins", "royal-hall"],
    free: true,
    public: true,
    tech: "React",
  },
  {
    id: "stela",
    numeral: "𓉸",
    title: "Stela Reader",
    href: "/games/stela",
    blurb: "Zoom into a museum photograph of a real stela and tap the signs in reading order; the translation assembles beneath.",
    skill: "Reading real inscriptions: royal titularies, the offering formula, dates",
    lessonIds: ["royal-hall", "sacred-chapel", "hypostyle-hall"],
    public: true,
    tech: "React",
  },
  {
    id: "scribe",
    numeral: "𓏛",
    title: "Scribe’s Hand",
    href: "/games/scribe",
    blurb: "A sign shows for three seconds; draw it from memory with your finger and see your line over the true form.",
    skill: "Sign shapes in the hand, not just the eye: the 25 alphabet signs free, every sign for members",
    lessonIds: ["expedition-begins", "outer-courtyard", "pilgrims-gallery"],
    free: true,
    public: true,
    tech: "Canvas",
  },
  {
    id: "wall",
    numeral: "𓏞",
    title: "Fading Paint",
    href: "/games/wall",
    blurb: "Every sign you know is painted on your own tomb wall. Paint fades on a spaced-repetition schedule; tap a weathered sign to repaint it.",
    skill: "Long-term memory for every sign, without flashcards",
    lessonIds: ["expedition-begins", "outer-courtyard", "pilgrims-gallery", "the-treasury", "royal-hall", "sacred-chapel", "hypostyle-hall", "inner-sanctum"],
    tech: "Canvas",
  },
  {
    id: "descent",
    numeral: "𓊛",
    title: "Scribe’s Descent",
    href: "/games/descent",
    blurb: "A 3D platformer down a tomb shaft. A voice names a sound; only the blocks carrying that sign hold your weight.",
    skill: "Fast sign recall under pressure, sound to sign",
    lessonIds: ["expedition-begins", "outer-courtyard", "royal-hall"],
    tech: "3D",
  },
  {
    id: "sign-hunt",
    numeral: "I",
    title: "Sign Hunt",
    href: "/games/sign-hunt",
    blurb: "A carved object turns in the chamber. Pick the hieroglyph that depicts it.",
    skill: "Recognise the alphabet signs by the objects they picture",
    lessonIds: ["expedition-begins", "outer-courtyard", "royal-hall"],
  },
  {
    id: "tomb-wall",
    numeral: "II",
    title: "Tomb Wall Decode",
    href: "/games/tomb-wall",
    blurb: "Read a torch-lit inscription: tap the signs in reading order, then find the silent determinative.",
    skill: "Reading direction, sign order and determinatives: how real words are built",
    lessonIds: ["pilgrims-gallery", "sacred-chapel", "hypostyle-hall", "inner-sanctum"],
  },
  {
    id: "cartouche-forge",
    numeral: "★",
    title: "Cartouche Forge",
    href: "/translate-name-to-hieroglyphics",
    blurb: "Spell your own name in hieroglyphs and forge it into a 3D royal cartouche.",
    skill: "Sound-by-sound spelling with the uniliteral signs",
    lessonIds: ["expedition-begins", "royal-hall"],
    free: true,
  },
];

export function getGame(id: string): GameInfo | undefined {
  return GAMES.find((g) => g.id === id);
}

/** Games worth suggesting after finishing `lessonId` (members-only games first). */
export function gamesForLesson(lessonId: string): GameInfo[] {
  return GAMES.filter((g) => g.lessonIds.includes(lessonId)).sort((a, b) => Number(!!a.free) - Number(!!b.free));
}

/** Games a signed-out visitor (and Googlebot) can open: sitemap + llms.txt. */
export function publicGames(): GameInfo[] {
  return GAMES.filter((g) => g.public);
}
