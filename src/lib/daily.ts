/**
 * Cartouche of the Day — data, daily seeding, scoring, streak and share grid.
 *
 * One real royal cartouche a day. The player fills a sound value under every
 * sign; a Wordle-style check marks each slot right / elsewhere / absent, and
 * the puzzle resolves in at most MAX_ATTEMPTS rows. Everything in this module
 * is pure so it is unit-tested; the page component only renders it.
 *
 * Sign data: every cartouche was checked against two published renderings
 * (English + German/French Wikipedia infobox `<hiero>` markup, and for the
 * seven from Lesson 5 the existing CartoucheReader data). Each sign carries
 * its Gardiner code so scripts/audit-glyphs.py can confirm that the Unicode
 * character really is that sign.
 */

export type DailySign = {
  glyph: string;
  /** Gardiner code, audited against the Unicode name */
  gardiner: string;
  /** Sound / word value the player must supply — the tile label */
  value: string;
  /** What the picture is, shown on the reveal */
  name: string;
};

export type DailyCartouche = {
  id: string;
  king: string;
  /** Reading of the whole ring in Egyptological transliteration */
  translit: string;
  /** What the name means */
  meaning: string;
  /** Dynasty / period line */
  period: string;
  /** One-paragraph reveal fact */
  fact: string;
  signs: DailySign[];
  /** 1 = alphabet only, 3 = word-signs and transposition */
  difficulty: 1 | 2 | 3;
  /** Where to read more on the site */
  href?: string;
};

// prettier-ignore
const S = (glyph: string, gardiner: string, value: string, name: string): DailySign => ({ glyph, gardiner, value, name });

export const DAILY_CARTOUCHES: DailyCartouche[] = [
  {
    id: "khufu", king: "Khufu", translit: "ḫwfw", meaning: "‘(The god Khnum) protects me’ (shortened)",
    period: "4th Dynasty · c. 2580 BCE", difficulty: 1, href: "/blog/reading-your-first-cartouche",
    fact: "Four alphabet signs. The Greeks heard the name as ‘Cheops’. The only surviving statuette of the builder of the Great Pyramid is 7.5 cm tall.",
    signs: [S("𓐍", "Aa1", "ḫ", "sieve / placenta"), S("𓅱", "G43", "w", "quail chick"), S("𓆑", "I9", "f", "horned viper"), S("𓅱", "G43", "w", "quail chick")],
  },
  {
    id: "pepi", king: "Pepi II", translit: "ppy", meaning: "A personal name of unknown meaning",
    period: "6th Dynasty · c. 2280 BCE", difficulty: 1,
    fact: "Two stools and two reeds. Pepi II came to the throne as a child and is credited with one of the longest reigns in history, traditionally 94 years.",
    signs: [S("𓊪", "Q3", "p", "stool"), S("𓊪", "Q3", "p", "stool"), S("𓇋", "M17", "ꞽ", "reed leaf"), S("𓇋", "M17", "ꞽ", "reed leaf")],
  },
  {
    id: "ptolemy", king: "Ptolemy", translit: "ptwlmys", meaning: "The Greek name Ptolemaios, spelled by sound",
    period: "Ptolemaic period · 305–30 BCE", difficulty: 1, href: "/daily/decipher",
    fact: "A Greek name written letter by letter, exactly as it appears on the Rosetta Stone. This is the cartouche Thomas Young and Champollion used to prove hieroglyphs could spell sounds. Note the m: here it is the ‘rib’ sign, not the owl.",
    signs: [S("𓊪", "Q3", "p", "stool"), S("𓏏", "X1", "t", "bread loaf"), S("𓍯", "V4", "o", "lasso"), S("𓃭", "E23", "l", "lion"), S("𓐝", "Aa15", "m", "rib (a rarer m)"), S("𓇋𓇋", "M17", "i", "two reeds"), S("𓋴", "S29", "s", "folded cloth")],
  },
  {
    id: "cleopatra", king: "Cleopatra VII", translit: "qlꞽwpꜣdrꜣt", meaning: "The Greek name Kleopatra, ‘glory of her father’",
    period: "Ptolemaic period · reigned 51–30 BCE", difficulty: 2, href: "/daily/decipher",
    fact: "Spelled the same way as on the Philae obelisk that reached England in 1821, although that obelisk names an earlier Cleopatra, a queen of Ptolemy VIII. The t of Cleopatra is a hand, not the loaf used in Ptolemy: Champollion realised two signs could share a sound. The loaf and egg at the end mark a woman’s name.",
    signs: [S("𓈎", "N29", "k", "hill slope"), S("𓃭", "E23", "l", "lion"), S("𓇋", "M17", "e", "reed leaf"), S("𓍯", "V4", "o", "lasso"), S("𓊪", "Q3", "p", "stool"), S("𓄿", "G1", "a", "vulture"), S("𓂧", "D46", "t", "hand"), S("𓂋", "D21", "r", "mouth"), S("𓄿", "G1", "a", "vulture"), S("𓏏", "X1", "t", "loaf (feminine ending)"), S("𓆇", "H8", "♀", "egg (a woman’s name)")],
  },
  {
    id: "alexander", king: "Alexander the Great", translit: "ꜣlksꞽndrs", meaning: "The Greek name Alexandros",
    period: "Macedonian rule · 332–323 BCE", difficulty: 2,
    fact: "Alexander was crowned pharaoh and his name was carved in a cartouche like any king’s. Egyptian had more than one sign for s: here the door bolt, twice, does the job the folded cloth does elsewhere.",
    signs: [S("𓄿", "G1", "a", "vulture"), S("𓃭", "E23", "l", "lion"), S("𓎡", "V31", "k", "basket"), S("𓊃", "O34", "s", "door bolt"), S("𓇋", "M17", "i", "reed leaf"), S("𓈖", "N35", "n", "water ripple"), S("𓂧", "D46", "d", "hand"), S("𓂋", "D21", "r", "mouth"), S("𓊃", "O34", "s", "door bolt")],
  },
  {
    id: "thutmose", king: "Thutmose III", translit: "ḏḥwty-ms", meaning: "‘Thoth is born’",
    period: "18th Dynasty · reigned c. 1479–1425 BCE", difficulty: 2, href: "/blog/reading-your-first-cartouche",
    fact: "The ibis on its standard is the god Thoth written as one sign; ms ‘born’ follows with its sound-complement s. Thutmose III fought seventeen campaigns and built much of Karnak.",
    signs: [S("𓅝", "G26", "Thoth", "ibis on a standard"), S("𓄟", "F31", "ms", "three fox skins"), S("𓋴", "S29", "s", "folded cloth")],
  },
  {
    id: "menkheperre", king: "Thutmose III (throne name)", translit: "mn-ḫpr-rꜥ", meaning: "‘Lasting is the manifestation of Ra’: Menkheperre",
    period: "18th Dynasty · reigned c. 1479–1425 BCE", difficulty: 3,
    fact: "Ra is written first out of respect but read last. This throne name became so famous it was carved on scarabs for centuries after the king died.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓏠", "Y5", "mn", "gaming board"), S("𓆣", "L1", "ḫpr", "scarab beetle")],
  },
  {
    id: "maatkare", king: "Hatshepsut (throne name)", translit: "mꜣꜥt-kꜣ-rꜥ", meaning: "‘Truth is the spirit of Ra’: Maatkare",
    period: "18th Dynasty · reigned c. 1473–1458 BCE", difficulty: 3,
    fact: "The seated goddess with the feather is Maat, truth and right order; the two raised arms are ka, the life-force. Hatshepsut ruled as a full pharaoh and had herself shown with a king’s beard.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓁦", "C10", "Maat", "goddess Maat with feather"), S("𓂓", "D28", "ka", "two raised arms")],
  },
  {
    id: "amenhotep", king: "Amenhotep III", translit: "ꞽmn-ḥtp", meaning: "‘Amun is satisfied’",
    period: "18th Dynasty · reigned c. 1390–1352 BCE", difficulty: 2, href: "/blog/reading-your-first-cartouche",
    fact: "Reed, board and ripple spell Amun; the offering slab ḥtp ‘satisfied, at peace’ is the same word as in the offering formula. His mortuary temple survives as the Colossi of Memnon.",
    signs: [S("𓇋", "M17", "ꞽ", "reed leaf"), S("𓏠", "Y5", "mn", "gaming board"), S("𓈖", "N35", "n", "water ripple"), S("𓊵", "R4", "ḥtp", "offering slab"), S("𓏏", "X1", "t", "bread loaf"), S("𓊪", "Q3", "p", "stool")],
  },
  {
    id: "nebmaatre", king: "Amenhotep III (throne name)", translit: "nb-mꜣꜥt-rꜥ", meaning: "‘Ra is lord of truth’: Nebmaatre",
    period: "18th Dynasty · reigned c. 1390–1352 BCE", difficulty: 3,
    fact: "Three signs, three words: the sun is Ra, the goddess is Maat, the basket is nb ‘lord’. Read Ra last even though he is written first.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓁦", "C10", "Maat", "goddess Maat with feather"), S("𓎟", "V30", "nb", "basket")],
  },
  {
    id: "akhenaten", king: "Akhenaten", translit: "ꜣḫ-n-ꞽtn", meaning: "‘Effective for the Aten’",
    period: "18th Dynasty · reigned c. 1352–1336 BCE", difficulty: 3,
    fact: "The god’s name Aten (ꞽ-t-n plus the sun disc) is written first out of respect, then the crested ibis ꜣḫ ‘effective’ and n ‘for’. Read it Akh-en-Aten. The king changed his name from Amenhotep IV when he made the sun disc his only god.",
    signs: [S("𓇋", "M17", "ꞽ", "reed leaf"), S("𓏏", "X1", "t", "bread loaf"), S("𓈖", "N35", "n", "water ripple"), S("𓇳", "N5", "Aten", "sun disc"), S("𓅜", "G25", "ꜣḫ", "crested ibis"), S("𓐍", "Aa1", "ḫ", "sieve / placenta"), S("𓈖", "N35", "n", "water ripple")],
  },
  {
    id: "tutankhamun", king: "Tutankhamun", translit: "twt-ꜥnḫ-ꞽmn", meaning: "‘Living image of Amun’",
    period: "18th Dynasty · reigned c. 1336–1327 BCE", difficulty: 3, href: "/blog/reading-your-first-cartouche",
    fact: "Amun is carved first because a god outranks a king, but the name is read Tut-ankh-Amun. The loaf-chick-loaf spells twt ‘image’ and the ankh is ‘living’.",
    signs: [S("𓇋", "M17", "ꞽ", "reed leaf"), S("𓏠", "Y5", "mn", "gaming board"), S("𓈖", "N35", "n", "water ripple"), S("𓏏", "X1", "t", "bread loaf"), S("𓅱", "G43", "w", "quail chick"), S("𓏏", "X1", "t", "bread loaf"), S("𓋹", "S34", "ankh", "ankh (life)")],
  },
  {
    id: "nebkheperure", king: "Tutankhamun (throne name)", translit: "nb-ḫprw-rꜥ", meaning: "‘Lord of the manifestations of Ra’: Nebkheperure",
    period: "18th Dynasty · reigned c. 1336–1327 BCE", difficulty: 3,
    fact: "This is the name on most objects in the boy king’s tomb. The three strokes make the scarab plural: ‘manifestations’.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓆣", "L1", "ḫpr", "scarab beetle"), S("𓏥", "Z2", "plural", "three strokes"), S("𓎟", "V30", "nb", "basket")],
  },
  {
    id: "seti", king: "Seti I", translit: "stẖy mr-n-ptḥ", meaning: "‘He of Seth, beloved of Ptah’",
    period: "19th Dynasty · reigned c. 1294–1279 BCE", difficulty: 3,
    fact: "The god Ptah (p-t-ḥ) is written first out of respect. The Seth animal writes the king’s own name, Sety; the hoe is mr ‘beloved’. His tomb is the most completely decorated in the Valley of the Kings, painted from entrance to burial chamber.",
    signs: [S("𓊪", "Q3", "p", "stool"), S("𓏏", "X1", "t", "bread loaf"), S("𓎛", "V28", "ḥ", "wick of twisted flax"), S("𓁣", "C7", "Seth", "the god Seth"), S("𓇋𓇋", "M17", "y", "two reeds"), S("𓌸", "U6", "mr", "hoe"), S("𓈖", "N35", "n", "water ripple")],
  },
  {
    id: "menmaatre", king: "Seti I (throne name)", translit: "mn-mꜣꜥt-rꜥ", meaning: "‘Lasting is the truth of Ra’: Menmaatre",
    period: "19th Dynasty · reigned c. 1294–1279 BCE", difficulty: 3,
    fact: "Three word-signs. The temple of Seti at Abydos carries some of the finest painted relief in Egypt, and a king list naming 76 predecessors.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓁦", "C10", "Maat", "goddess Maat with feather"), S("𓏠", "Y5", "mn", "gaming board")],
  },
  {
    id: "ramesses", king: "Ramesses II", translit: "rꜥ-ms-sw", meaning: "‘Ra has fashioned him’",
    period: "19th Dynasty · reigned c. 1279–1213 BCE", difficulty: 2, href: "/blog/reading-your-first-cartouche",
    fact: "The sun is Ra, ms is ‘born / fashioned’, the sedge plant is sw ‘him’. This is the name Champollion read from copies of Abu Simbel on 14 September 1822. Ramesses reigned 66 years.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓄟", "F31", "ms", "three fox skins"), S("𓋴", "S29", "s", "folded cloth"), S("𓇓", "M23", "sw", "sedge plant")],
  },
  {
    id: "usermaatre", king: "Ramesses II (throne name)", translit: "wsr-mꜣꜥt-rꜥ stp-n-rꜥ", meaning: "‘Powerful is the truth of Ra, chosen of Ra’: Usermaatre Setepenre",
    period: "19th Dynasty · reigned c. 1279–1213 BCE", difficulty: 3,
    fact: "The Greeks turned Usermaatre into ‘Ozymandias’, the name in Shelley’s poem. The adze on a block is stp ‘chosen’; the second sun disc is read after it.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓄊", "F12", "wsr", "head and neck of an animal"), S("𓁦", "C10", "Maat", "goddess Maat with feather"), S("𓇳", "N5", "Ra", "sun disc"), S("𓍉", "U21", "stp", "adze on a block"), S("𓈖", "N35", "n", "water ripple")],
  },
  {
    id: "ramesses1", king: "Ramesses I", translit: "rꜥ-ms-sw", meaning: "‘Ra has fashioned him’",
    period: "19th Dynasty · reigned c. 1295–1294 BCE", difficulty: 2,
    fact: "Grandfather of Ramesses the Great and founder of the 19th Dynasty, he reigned for less than two years. Same name, one extra chick spelling out the w.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓄟", "F31", "ms", "three fox skins"), S("𓋴", "S29", "s", "folded cloth"), S("𓇓", "M23", "sw", "sedge plant"), S("𓅱", "G43", "w", "quail chick")],
  },
  {
    id: "ramesses3", king: "Ramesses III", translit: "rꜥ-ms-s ḥqꜣ-ꞽwnw", meaning: "‘Ra has fashioned him, ruler of Heliopolis’",
    period: "20th Dynasty · reigned c. 1184–1153 BCE", difficulty: 3,
    fact: "Here Ra is the seated god rather than the plain disc, s is doubled with door bolts, and the crook ḥqꜣ ‘ruler’ is followed by the pillar of Heliopolis. Ramesses III fought off the Sea Peoples.",
    signs: [S("𓁚", "C1", "Ra", "the god Ra, seated"), S("𓄟", "F31", "ms", "three fox skins"), S("𓊃", "O34", "s", "door bolt"), S("𓊃", "O34", "s", "door bolt"), S("𓋾", "S38", "ḥqꜣ", "crook"), S("𓈎", "N29", "q", "hill slope"), S("𓉺", "O28", "ꞽwn", "pillar (Heliopolis)")],
  },
  {
    id: "sneferu", king: "Sneferu", translit: "snfrw", meaning: "‘He has made (me) beautiful’",
    period: "4th Dynasty · c. 2600 BCE", difficulty: 2,
    fact: "The heart-and-windpipe sign nfr ‘beautiful, good’ is the same one in Nefertiti. Sneferu built three pyramids, including the first true one, the Red Pyramid at Dahshur.",
    signs: [S("𓋴", "S29", "s", "folded cloth"), S("𓄤", "F35", "nfr", "heart and windpipe"), S("𓂋", "D21", "r", "mouth"), S("𓅱", "G43", "w", "quail chick")],
  },
  {
    id: "neferkare", king: "Pepi II (throne name)", translit: "nfr-kꜣ-rꜥ", meaning: "‘Beautiful is the spirit of Ra’: Neferkare",
    period: "6th Dynasty · c. 2280 BCE", difficulty: 3,
    fact: "A throne name so popular that a dozen later kings borrowed it. Ra written first, read last.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓄤", "F35", "nfr", "heart and windpipe"), S("𓂓", "D28", "ka", "two raised arms")],
  },
  {
    id: "senusret", king: "Senusret I", translit: "s-n-wsrt", meaning: "‘Man of (the goddess) Wosret’",
    period: "12th Dynasty · reigned c. 1956–1911 BCE", difficulty: 3,
    fact: "The goddess Wosret (wsr-t) is written first; the s and n that mean ‘man of’ come at the end. The Greeks called him Sesostris. His White Chapel at Karnak is a jewel of Middle Kingdom carving.",
    signs: [S("𓄊", "F12", "wsr", "head and neck of an animal"), S("𓋴", "S29", "s", "folded cloth"), S("𓂋", "D21", "r", "mouth"), S("𓏏", "X1", "t", "bread loaf"), S("𓊃", "O34", "s", "door bolt"), S("𓈖", "N35", "n", "water ripple")],
  },
  {
    id: "amenemhat", king: "Amenemhat I", translit: "ꞽmn-m-ḥꜣt", meaning: "‘Amun is in front’",
    period: "12th Dynasty · reigned c. 1985–1956 BCE", difficulty: 3,
    fact: "Amun, then the owl m ‘in’, then the lion’s forepart ḥꜣt ‘front’ with its loaf. Founder of the 12th Dynasty; the Instruction written in his name warns his son to trust no one.",
    signs: [S("𓇋", "M17", "ꞽ", "reed leaf"), S("𓏠", "Y5", "mn", "gaming board"), S("𓈖", "N35", "n", "water ripple"), S("𓅓", "G17", "m", "owl"), S("𓄂", "F4", "ḥꜣt", "forepart of a lion"), S("𓏏", "X1", "t", "bread loaf")],
  },
  {
    id: "ahmose", king: "Ahmose I", translit: "ꞽꜥḥ-ms", meaning: "‘The moon is born’",
    period: "18th Dynasty · reigned c. 1550–1525 BCE", difficulty: 2,
    fact: "The crescent is the moon god Iah, then ms ‘born’ with its complement. Ahmose drove the Hyksos out of Egypt and founded the New Kingdom.",
    signs: [S("𓇹", "N11", "moon", "crescent moon"), S("𓄟", "F31", "ms", "three fox skins"), S("𓋴", "S29", "s", "folded cloth")],
  },
  {
    id: "aakheperkare", king: "Thutmose I (throne name)", translit: "ꜥꜣ-ḫpr-kꜣ-rꜥ", meaning: "‘Great is the manifestation of the spirit of Ra’: Aakheperkare",
    period: "18th Dynasty · reigned c. 1504–1492 BCE", difficulty: 3,
    fact: "The column ꜥꜣ ‘great’, the scarab ḫpr, the arms ka, and Ra written first. Thutmose I was the first king known to be buried in the Valley of the Kings.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓉻", "O29", "ꜥꜣ", "wooden column"), S("𓆣", "L1", "ḫpr", "scarab beetle"), S("𓂓", "D28", "ka", "two raised arms")],
  },
  {
    id: "taharqa", king: "Taharqa", translit: "thrq", meaning: "A Kushite (Nubian) name",
    period: "25th Dynasty · reigned c. 690–664 BCE", difficulty: 2,
    fact: "A Nubian king of Egypt, spelled with the land sign, a reed shelter h, the lion (here for r) and the hill slope q. He is named in the Bible as ‘Tirhakah’.",
    signs: [S("𓇿", "N17", "tꜣ", "land"), S("𓉔", "O4", "h", "reed shelter"), S("𓃭", "E23", "r", "lion"), S("𓈎", "N29", "q", "hill slope")],
  },
  {
    id: "psamtik", king: "Psamtik I", translit: "psmṯk", meaning: "A Libyan-Egyptian name, ‘Psammetichus’ to the Greeks",
    period: "26th Dynasty · reigned 664–610 BCE", difficulty: 2,
    fact: "Five alphabet signs including the tethering rope ṯ (a ‘ch’ sound). Psamtik reunited Egypt after the Assyrian invasions and founded the Saite dynasty.",
    signs: [S("𓊪", "Q3", "p", "stool"), S("𓊃", "O34", "s", "door bolt"), S("𓅓", "G17", "m", "owl"), S("𓍿", "V13", "ṯ", "tethering rope"), S("𓎡", "V31", "k", "basket")],
  },
  {
    id: "necho", king: "Necho II", translit: "nkꜣw", meaning: "‘Belonging to the bulls’ (the ka-spirits)",
    period: "26th Dynasty · reigned 610–595 BCE", difficulty: 2,
    fact: "A ripple, a bull and a chick. Necho sent a Phoenician fleet to sail round Africa, according to Herodotus, and began a canal from the Nile to the Red Sea.",
    signs: [S("𓈖", "N35", "n", "water ripple"), S("𓃒", "E1", "kꜣ", "bull"), S("𓅱", "G43", "w", "quail chick")],
  },
  {
    id: "wehemibre", king: "Necho II (throne name)", translit: "wḥm-ꞽb-rꜥ", meaning: "‘Carrying out the wish of Ra’: Wehemibre",
    period: "26th Dynasty · reigned 610–595 BCE", difficulty: 3,
    fact: "The ox leg wḥm ‘repeat, carry out’ and the heart ꞽb, with Ra written first. The heart sign is the same one in ‘Sobek is in the heart’ type names.",
    signs: [S("𓇳", "N5", "Ra", "sun disc"), S("𓄙", "F25", "wḥm", "leg of an ox"), S("𓄣", "F34", "ꞽb", "heart")],
  },
  {
    id: "piye", king: "Piye", translit: "pꜥnḫy", meaning: "‘The living one’ (Piankhy)",
    period: "25th Dynasty · reigned c. 744–714 BCE", difficulty: 2,
    fact: "A stool, an ankh and two reeds. The Kushite king Piye conquered Egypt from the south and recorded it on a great victory stela, now in Cairo.",
    signs: [S("𓊪", "Q3", "p", "stool"), S("𓋹", "S34", "ankh", "ankh (life)"), S("𓇋", "M17", "ꞽ", "reed leaf"), S("𓇋", "M17", "ꞽ", "reed leaf")],
  },
];

/** Puzzle #1 is 8 September 2026 (the day the game launched). */
export const DAILY_EPOCH_UTC = Date.UTC(2026, 8, 8);
export const MAX_ATTEMPTS = 4;
export const TILE_COUNT = 12;
export const DAILY_LESSON_ID = "game-daily";

const DAY_MS = 86_400_000;

/**
 * The puzzle number for a calendar date, using the player's local date the
 * way Wordle does: everyone in a time zone changes puzzle at their midnight.
 */
export function puzzleNumberFor(date: Date): number {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((local - DAILY_EPOCH_UTC) / DAY_MS) + 1;
}

/** The calendar day of puzzle n, as a UTC midnight (format it with timeZone "UTC"). */
export function dateForPuzzle(n: number): Date {
  return new Date(DAILY_EPOCH_UTC + (n - 1) * DAY_MS);
}

/** Puzzle numbers before today's, newest first: the archive. */
export function pastPuzzles(today: number): number[] {
  return Array.from({ length: Math.max(0, today - 1) }, (_, i) => today - 1 - i);
}

/** Milliseconds until the next local midnight. */
export function msUntilNextPuzzle(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return Math.max(0, next.getTime() - now.getTime());
}

/** Small deterministic PRNG (mulberry32) so tile order is the same for everyone. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const rnd = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Which cartouche is today's. A fixed-seed shuffle of the catalogue, cycled,
 * so consecutive days never repeat within a cycle and the first week is
 * deliberately easy (the shuffle is applied within difficulty bands for the
 * opening cycle, then freely).
 */
export function cartoucheForPuzzle(n: number, catalogue: DailyCartouche[] = DAILY_CARTOUCHES): DailyCartouche {
  const len = catalogue.length;
  if (len === 0) throw new Error("empty catalogue");
  const cycle = Math.floor((n - 1) / len);
  const pos = ((n - 1) % len + len) % len;
  if (cycle === 0) {
    // Opening cycle: easy → hard bands, shuffled inside each band.
    const banded = [1, 2, 3].flatMap((d) =>
      seededShuffle(catalogue.filter((c) => c.difficulty === d), 20260908 + d)
    );
    return banded[pos];
  }
  return seededShuffle(catalogue, 1822 * (cycle + 1))[pos];
}

/** Unique sound values, in the order they first occur. */
export function uniqueValues(signs: DailySign[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of signs) {
    if (!seen.has(s.value)) {
      seen.add(s.value);
      out.push(s.value);
    }
  }
  return out;
}

/**
 * The tile bank: every value the cartouche needs plus decoys drawn from the
 * other cartouches, shuffled with the puzzle number as seed.
 */
export function buildTileBank(
  cartouche: DailyCartouche,
  puzzleNumber: number,
  catalogue: DailyCartouche[] = DAILY_CARTOUCHES,
  size: number = TILE_COUNT
): string[] {
  const needed = uniqueValues(cartouche.signs);
  // A decoy must not be another reading of one of this cartouche's own signs (the hand is t in Cleopatra but d in
  // Alexander; the reed is i, e or y), or a right answer would be marked absent.
  const ownCodes = new Set(cartouche.signs.map((s) => s.gardiner));
  const sameSign = new Set(catalogue.flatMap((c) => c.signs).filter((s) => ownCodes.has(s.gardiner)).map((s) => s.value));
  const pool = uniqueValues(catalogue.flatMap((c) => c.signs)).filter((v) => !needed.includes(v) && !sameSign.has(v));
  const decoys = seededShuffle(pool, puzzleNumber * 31 + 7).slice(0, Math.max(0, size - needed.length));
  return seededShuffle([...needed, ...decoys], puzzleNumber * 17 + 3);
}

export type SlotResult = "correct" | "present" | "absent";

/**
 * Wordle-style marking. A value is "present" only as many times as it occurs
 * in unsolved positions, so a duplicated guess doesn't get two amber marks.
 */
export function scoreGuess(guess: readonly string[], signs: DailySign[]): SlotResult[] {
  const answer = signs.map((s) => s.value);
  const result: SlotResult[] = answer.map(() => "absent");
  const remaining = new Map<string, number>();
  answer.forEach((v, i) => {
    if (guess[i] === v) result[i] = "correct";
    else remaining.set(v, (remaining.get(v) ?? 0) + 1);
  });
  guess.forEach((g, i) => {
    if (result[i] === "correct") return;
    const left = remaining.get(g) ?? 0;
    if (left > 0) {
      result[i] = "present";
      remaining.set(g, left - 1);
    }
  });
  return result;
}

export function isSolved(result: SlotResult[]): boolean {
  return result.length > 0 && result.every((r) => r === "correct");
}

/** XP for a win: fewer rows, more XP. Losing still teaches, so it earns a little. */
export function xpForDaily(attemptsUsed: number, won: boolean, hintsUsed: number): number {
  if (!won) return 10;
  const base = 40 + 15 * Math.max(0, MAX_ATTEMPTS - attemptsUsed);
  return Math.max(15, base - 10 * hintsUsed);
}

// ─── Streak / stats (shared with Decipher) ───

export type DailyStats = {
  /** Puzzle number last completed */
  lastPlayed: number | null;
  /** Puzzle number of the last WIN that counted for the streak */
  lastWon: number | null;
  streak: number;
  maxStreak: number;
  played: number;
  won: number;
  /** wins by attempt count, index 0 = solved in 1 row */
  distribution: number[];
};

export const EMPTY_STATS: DailyStats = {
  lastPlayed: null,
  lastWon: null,
  streak: 0,
  maxStreak: 0,
  played: 0,
  won: 0,
  distribution: Array(MAX_ATTEMPTS).fill(0),
};

/**
 * Record the outcome of puzzle `n`. The streak survives only if the previous
 * puzzle was also won; a miss or a skipped day resets it. Recording the same
 * puzzle twice is a no-op.
 */
export function recordResult(stats: DailyStats, n: number, won: boolean, attempts: number): DailyStats {
  if (stats.lastPlayed === n) return stats;
  const consecutive = won && stats.lastWon === n - 1;
  const streak = won ? (consecutive ? stats.streak + 1 : 1) : 0;
  const distribution = [...stats.distribution];
  if (won) distribution[Math.min(attempts, MAX_ATTEMPTS) - 1] += 1;
  return {
    lastPlayed: n,
    lastWon: won ? n : stats.lastWon,
    streak,
    maxStreak: Math.max(stats.maxStreak, streak),
    played: stats.played + 1,
    won: stats.won + (won ? 1 : 0),
    distribution,
  };
}

/** The streak as it stands today: it lapses if yesterday's puzzle was missed. */
export function currentStreak(stats: DailyStats, todayNumber: number): number {
  if (stats.lastWon === null) return 0;
  return stats.lastWon >= todayNumber - 1 ? stats.streak : 0;
}

// ─── Share grid ───

const SQUARE: Record<SlotResult, string> = { correct: "🟩", present: "🟨", absent: "⬛" };

export function shareGrid(rows: SlotResult[][]): string {
  return rows.map((r) => r.map((s) => SQUARE[s]).join("")).join("\n");
}

export function buildShareText(input: {
  puzzleNumber: number;
  rows: SlotResult[][];
  won: boolean;
  hintsUsed?: number;
  url?: string;
}): string {
  const attempts = input.won ? String(input.rows.length) : "X";
  const hint = input.hintsUsed ? " 🔍" : "";
  return [
    `Cartouche of the Day #${input.puzzleNumber} · ${attempts}/${MAX_ATTEMPTS}${hint}`,
    shareGrid(input.rows),
    input.url ?? "https://www.learnhieroglyphics.com/daily",
  ].join("\n");
}
