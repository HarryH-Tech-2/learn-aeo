/**
 * Stela Reader — real inscribed objects, photographed, with sign hotspots.
 *
 * Every playable object is a Metropolitan Museum of Art Open Access (CC0)
 * image, downloaded from images.metmuseum.org, resized to ≤1800 px and saved
 * as webp in public/stela/. Attribution (accession number, credit line,
 * object URL) lives here and is shown on screen. British Museum photographs
 * are non-commercial only, so BM objects are link-only entries.
 *
 * Hotspot coordinates are fractions of the image (0–1). They were placed by
 * eye from the full-resolution photographs and can be refined with the
 * dev-only editor at /games/stela/editor (LH_DEV_BYPASS_AUTH=1), which
 * exports JSON in exactly this shape.
 */

export type Museum = "met" | "bm" | "louvre";

export type Hotspot = {
  id: string;
  /** centre, as a fraction of image width / height */
  x: number;
  y: number;
  /** size, as a fraction of image width / height */
  w: number;
  h: number;
  /** Unicode rendering of the sign(s) under the hotspot */
  glyph: string;
  /** transliteration / value read at this step */
  value: string;
  /** what it is / means, shown when tapped */
  name: string;
};

export type Phrase = {
  id: string;
  title: string;
  /** Hotspots in READING order */
  hotspots: Hotspot[];
  translit: string;
  translation: string;
  /** Which way the line runs on the object */
  direction: "ltr" | "rtl" | "ttb";
  note: string;
};

export type StelaObject = {
  id: string;
  title: string;
  museum: Museum;
  museumName: string;
  accession: string;
  date: string;
  credit: string;
  objectUrl: string;
  /** Gallery / room where it is displayed, if known */
  gallery?: string;
  /** Local optimised image; absent for link-only (non-CC0) objects */
  image?: { src: string; width: number; height: number };
  free: boolean;
  phrases: Phrase[];
  /** One-paragraph "what you are looking at" */
  about: string;
};

const H = (id: string, x: number, y: number, w: number, h: number, glyph: string, value: string, name: string): Hotspot => ({ id, x, y, w, h, glyph, value, name });

export const STELA_OBJECTS: StelaObject[] = [
  {
    id: "son-of-re",
    title: "Relief fragment with the Son of Re name of Amenemhat I",
    museum: "met",
    museumName: "The Metropolitan Museum of Art, New York",
    accession: "08.200.11",
    date: "Middle Kingdom, reign of Amenemhat I, c. 1981–1952 BCE",
    credit: "Rogers Fund, 1908. Image: Open Access (CC0), The Metropolitan Museum of Art",
    objectUrl: "https://www.metmuseum.org/art/collection/search/544137",
    gallery: "Gallery 109",
    image: { src: "/stela/son-of-re.webp", width: 1631, height: 1800 },
    free: true,
    about:
      "Two signs fill most of a block: a pintail duck and the sun disc, the title that introduces a king’s birth name, ‘Son of Ra’. Above them is the bottom of a palace-façade panel; below, the top of the cartouche survives, with the gaming board mn and the tip of the reed leaf, the start of Amenemhat’s name.",
    phrases: [
      {
        id: "sa-ra",
        title: "The royal title",
        direction: "ttb",
        translit: "sꜣ Rꜥ",
        translation: "Son of Ra",
        note: "The duck faces right, so it is read first: sꜣ ‘son’. The sun disc tucked behind its back is Rꜥ. Unlike Ra inside a cartouche, here the god’s name keeps its spoken order. The title first appears in the 4th Dynasty and from the 5th Dynasty on introduces every king’s birth name.",
        hotspots: [
          H("goose", 0.475, 0.525, 0.52, 0.4, "𓅭", "sꜣ", "pintail duck: ‘son’"),
          H("disc", 0.336, 0.396, 0.25, 0.22, "𓇳", "Rꜥ", "sun disc: the god Ra"),
        ],
      },
    ],
  },
  {
    id: "amenemhat-block",
    title: "Relief block with the names of Amenemhat I and Senwosret I",
    museum: "met",
    museumName: "The Metropolitan Museum of Art, New York",
    accession: "08.200.9",
    date: "Middle Kingdom, c. 1962–1952 BCE (co-regency of Amenemhat I and Senwosret I)",
    credit: "Rogers Fund, 1908. Image: Open Access (CC0), The Metropolitan Museum of Art",
    objectUrl: "https://www.metmuseum.org/art/collection/search/544139",
    gallery: "Gallery 108",
    image: { src: "/stela/amenemhat-block.webp", width: 1800, height: 865 },
    free: false,
    about:
      "Father and son ruled together for a decade, and this block from a temple at Lisht names both: Amenemhat’s cartouche on the left, Senwosret’s throne name Kheperkare on the right, with a Golden Horus title between them.",
    phrases: [
      {
        id: "amenemhat",
        title: "Cartouche of Amenemhat",
        direction: "ttb",
        translit: "(ꞽ)mn-m-ḥꜣt",
        translation: "Amenemhat: ‘Amun is in front’",
        note: "Read from the top: the reed ꞽ and the water ripple n of Amun’s name, then the owl m ‘in’, the forepart of a lion ḥꜣt ‘front’ with its loaf. The gaming board mn that normally sits above the water has been lost to the worn stone at the top of the ring.",
        hotspots: [
          H("i", 0.556, 0.18, 0.04, 0.17, "𓇋", "ꞽ", "reed leaf: ꞽ"),
          H("n", 0.506, 0.245, 0.09, 0.08, "𓈖", "n", "water ripple: n"),
          H("m", 0.523, 0.378, 0.07, 0.14, "𓅓", "m", "owl: m, ‘in’"),
          H("hat", 0.523, 0.548, 0.08, 0.16, "𓄂", "ḥꜣt", "forepart of a lion: ḥꜣt, ‘front’"),
          H("t", 0.523, 0.633, 0.06, 0.06, "𓏏", "t", "bread loaf: t"),
        ],
      },
      {
        id: "kheperkare",
        title: "Cartouche of Kheperkare",
        direction: "ttb",
        translit: "ḫpr-kꜣ-rꜥ",
        translation: "Kheperkare: ‘The ka of Ra comes into being’ (Senwosret I)",
        note: "The sun disc is carved at the top of the ring but read last. Start with the scarab ḫpr, then the raised arms kꜣ, then Ra.",
        hotspots: [
          H("kheper", 0.923, 0.35, 0.09, 0.2, "𓆣", "ḫpr", "scarab beetle: ḫpr, ‘come into being’"),
          H("ka", 0.923, 0.567, 0.1, 0.16, "𓂓", "kꜣ", "two raised arms: kꜣ, the life-force"),
          H("ra", 0.923, 0.18, 0.08, 0.14, "𓇳", "Rꜥ", "sun disc: the god Ra, written first"),
        ],
      },
      {
        id: "golden-horus",
        title: "The Golden Horus title",
        direction: "ttb",
        translit: "Ḥr-nbw",
        translation: "Golden Horus (the third of a king’s five names)",
        note: "A falcon perched on the collar sign for gold. Every full titulary had five names; this is the one that introduces the third.",
        hotspots: [
          H("horus", 0.79, 0.17, 0.11, 0.13, "𓅃", "Ḥr", "falcon: the god Horus"),
          H("gold", 0.76, 0.282, 0.125, 0.1, "𓋞", "nbw", "beaded collar: nbw, ‘gold’"),
        ],
      },
    ],
  },
  {
    id: "intef",
    title: "Stela of the Overseer of the Fortress Intef",
    museum: "met",
    museumName: "The Metropolitan Museum of Art, New York",
    accession: "57.95",
    date: "Middle Kingdom, Dynasty 11, c. 2000–1988 BCE; names King Nebhepetre Mentuhotep II",
    credit: "Harris Brisbane Dick Fund, 1957. Image: Open Access (CC0), The Metropolitan Museum of Art",
    objectUrl: "https://www.metmuseum.org/art/collection/search/545393",
    gallery: "Gallery 107",
    image: { src: "/stela/intef.webp", width: 1800, height: 1049 },
    free: false,
    about:
      "Intef’s memorial, but the names in this puzzle are not his. The top line names the king he served, Nebhepetre Mentuhotep II, who reunited Egypt; Intef himself, an overseer of a fortress in the Herakleopolis region (a post that only existed after that victory), is named in the text below it. The top line is a complete royal titulary: all five of the king’s names, from the Horus name at the right end to the two cartouches, ending with the wish that he live. It runs from right to left; this puzzle reads its last part, the two cartouches and the titles that introduce them.",
    phrases: [
      {
        id: "titulary",
        title: "King Mentuhotep II’s names (top line, right to left)",
        direction: "rtl",
        translit: "nsw-bity Nb-ḥpt-Rꜥ sꜣ Rꜥ Mnṯw-ḥtp ꜥnḫ",
        translation: "The King of Upper and Lower Egypt Nebhepetre, Son of Ra Mentuhotep, living",
        note: "Two cartouches, two titles. The sedge and bee introduce the throne name, Nebhepetre, ‘Ra is lord of the steering oar’; the goose and disc introduce the birth name. Inside the second ring, Montu, the war god of Thebes, is written before ḥtp ‘is satisfied’.",
        hotspots: [
          H("nswbity", 0.789, 0.094, 0.04, 0.07, "𓇓𓏏𓆤", "nsw-bity", "sedge and bee: ‘King of Upper and Lower Egypt’"),
          H("nb", 0.736, 0.094, 0.028, 0.06, "𓎟", "nb", "basket: nb, ‘lord’"),
          H("hpt", 0.719, 0.094, 0.02, 0.07, "𓐑", "ḥpt", "steering oar: ḥpt"),
          H("ra1", 0.754, 0.094, 0.025, 0.06, "𓇳", "Rꜥ", "sun disc, written first in the ring, read last"),
          H("goose", 0.69, 0.1, 0.03, 0.06, "𓅭", "sꜣ", "goose: ‘son’"),
          H("ra2", 0.681, 0.078, 0.018, 0.028, "𓇳", "Rꜥ", "sun disc: ‘of Ra’"),
          H("mn", 0.652, 0.094, 0.028, 0.07, "𓏠𓈖𓍿", "mnṯ", "gaming board, ripple and tethering rope: Montu’s name begins"),
          H("w", 0.634, 0.094, 0.025, 0.07, "𓅱", "w", "bird: w, completing Montu"),
          H("htp", 0.614, 0.092, 0.03, 0.07, "𓊵𓏏𓊪", "ḥtp", "offering slab, loaf, stool: ḥtp, ‘is satisfied’"),
          H("ankh", 0.589, 0.094, 0.018, 0.07, "𓋹", "ꜥnḫ", "ankh: ‘living’"),
        ],
      },
    ],
  },
  {
    id: "mentuwoser",
    title: "Stela of the Steward Mentuwoser",
    museum: "met",
    museumName: "The Metropolitan Museum of Art, New York",
    accession: "12.184",
    date: "Middle Kingdom, reign of Senwosret I, year 17, c. 1944 BCE",
    credit: "Gift of Edward S. Harkness, 1912. Image: Open Access (CC0), The Metropolitan Museum of Art",
    objectUrl: "https://www.metmuseum.org/art/collection/search/544320",
    gallery: "Gallery 110",
    image: { src: "/stela/mentuwoser.webp", width: 942, height: 1800 },
    free: false,
    about:
      "One of the finest painted stelae of the Middle Kingdom. Its first line is a date: regnal year 17 of Senwosret I (Horus Ankhmesut, throne name Kheperkare). The dating formula is the same one used on documents for two thousand years.",
    phrases: [
      {
        id: "date",
        title: "The date line (top line, right to left)",
        direction: "rtl",
        translit: "rnpt-sp 17 ḫr ḥm n Ḥr ꜥnḫ-mswt nṯr nfr Ḫpr-kꜣ-Rꜥ ꜥnḫ ḏt",
        translation: "Regnal year 17 under the majesty of the Horus Ankhmesut, the good god Kheperkare, living forever",
        note: "Read from the right, the way the birds face. rnpt-sp is ‘regnal year’, the ten-sign and seven strokes make 17, ḫr ḥm n is ‘under the majesty of’. The king is named twice: by his Horus name ꜥnḫ-mswt after the falcon, then as nṯr nfr ‘the good god’ with his throne name Kheperkare, the same cartouche you can read on the Lisht block.",
        hotspots: [
          H("rnpt", 0.88, 0.0775, 0.04, 0.024, "𓆳𓊗", "rnpt-sp", "palm rib and threshing floor: ‘regnal year’"),
          H("17", 0.835, 0.083, 0.054, 0.026, "𓎆𓐂", "17", "the ten-sign and seven strokes"),
          H("khr", 0.78, 0.0765, 0.045, 0.017, "𓐍𓂋", "ḫr", "sieve and mouth: ‘under’"),
          H("hm", 0.745, 0.079, 0.014, 0.022, "𓍛", "ḥm", "laundryman’s club: ‘majesty’"),
          H("n", 0.77, 0.0905, 0.034, 0.009, "𓈖", "n", "ripple: ‘of’"),
          H("horus", 0.703, 0.08, 0.045, 0.023, "𓅃", "Ḥr", "falcon: Horus, introducing the Horus name"),
          H("ankh1", 0.682, 0.077, 0.022, 0.016, "𓋹", "ꜥnḫ", "ankh: ‘living’"),
          H("ms", 0.66, 0.08, 0.02, 0.022, "𓄟𓏏", "ms(w)t", "three fox skins and loaf: ‘births’"),
          H("w", 0.629, 0.081, 0.036, 0.024, "𓅱", "w", "bird: w, ending ꜥnḫ-mswt"),
          H("ntr", 0.6, 0.08, 0.016, 0.023, "𓊹", "nṯr", "flag on a pole: ‘god’"),
          H("nfr", 0.577, 0.08, 0.014, 0.023, "𓄤", "nfr", "heart and windpipe: ‘good’"),
          H("kheper", 0.514, 0.079, 0.022, 0.019, "𓆣", "ḫpr", "scarab: ḫpr"),
          H("ka", 0.479, 0.079, 0.024, 0.012, "𓂓", "kꜣ", "raised arms: kꜣ"),
          H("ra", 0.548, 0.079, 0.018, 0.012, "𓇳", "Rꜥ", "sun disc: Ra, written first, read last"),
          H("ankh", 0.437, 0.08, 0.024, 0.023, "𓋹", "ꜥnḫ", "ankh: ‘living’"),
          H("djet", 0.408, 0.079, 0.038, 0.022, "𓆓𓏏𓇾", "ḏt", "cobra, loaf and land sign: ‘forever’"),
        ],
      },
    ],
  },
  {
    id: "aafenmut",
    title: "Stela of Aafenmut",
    museum: "met",
    museumName: "The Metropolitan Museum of Art, New York",
    accession: "28.3.35",
    date: "Third Intermediate Period, reign of Osorkon I, c. 924–891 BCE",
    credit: "Rogers Fund, 1928. Image: Open Access (CC0), The Metropolitan Museum of Art",
    objectUrl: "https://www.metmuseum.org/art/collection/search/548518",
    gallery: "Gallery 126",
    image: { src: "/stela/aafenmut.webp", width: 1635, height: 1800 },
    free: false,
    about:
      "A small painted wooden stela from Thebes. The scribe Aafenmut offers to the falcon-headed sun god, whose name is written in the first column above the scene. The columns read from the top down.",
    phrases: [
      {
        id: "ra-horakhty",
        title: "The god’s name (first column, top down)",
        direction: "ttb",
        translit: "Rꜥ-Ḥr(-ꜣḫty)",
        translation: "Ra-Horakhty, ‘Ra, Horus of the two horizons’",
        note: "The sun disc writes Ra, the falcon writes Horus. Look at the figure on the left: a falcon head wearing the sun disc, the god named in the text.",
        hotspots: [
          H("ra", 0.439, 0.336, 0.05, 0.035, "𓇳", "Rꜥ", "sun disc: Ra"),
          H("horus", 0.43, 0.365, 0.05, 0.04, "𓅃", "Ḥr", "falcon: Horus"),
        ],
      },
    ],
  },
  {
    id: "neferiu",
    title: "False Door of the Royal Sealer Neferiu",
    museum: "met",
    museumName: "The Metropolitan Museum of Art, New York",
    accession: "12.183.8",
    date: "Old Kingdom–First Intermediate Period, c. 2150–2010 BCE",
    credit: "Gift of J. Pierpont Morgan, 1912. Image: Open Access (CC0), The Metropolitan Museum of Art",
    objectUrl: "https://www.metmuseum.org/art/collection/search/543863",
    gallery: "Gallery 103",
    image: { src: "/stela/neferiu.webp", width: 1117, height: 1800 },
    free: false,
    about:
      "A painted false door: the magical doorway through which the dead received offerings. The lintel above the door opens with the phrase found on almost every Egyptian funerary monument, the offering formula.",
    phrases: [
      {
        id: "htp-di-nsw",
        title: "The offering formula opens (lower lintel)",
        direction: "rtl",
        translit: "ḥtp dj nsw Inpw",
        translation: "An offering which the king gives, and Anubis…",
        note: "Read from the right, the way the birds face. The sedge plant nsw ‘king’ is written first out of respect; ḥtp ‘offering’ is the loaf on its mat, and the conical loaf is dj ‘gives’. The god named here is Anubis, the jackal on his shrine. The formula goes on to list bread, beer, oxen and fowl for the dead man.",
        hotspots: [
          H("nsw", 0.735, 0.481, 0.032, 0.032, "𓇓", "nsw", "sedge plant: ‘king’, written first"),
          H("htp", 0.691, 0.481, 0.054, 0.03, "𓊵𓏏", "ḥtp", "loaf on a mat: ‘offering’"),
          H("di", 0.6455, 0.481, 0.027, 0.032, "𓏙", "dj", "conical loaf: dj, ‘gives’"),
          H("inpw", 0.609, 0.481, 0.052, 0.032, "𓃣", "Inpw", "jackal on a shrine: the god Anubis"),
        ],
      },
    ],
  },
  {
    id: "rosetta-stone",
    title: "The Rosetta Stone",
    museum: "bm",
    museumName: "The British Museum, London",
    accession: "EA 24",
    date: "Ptolemaic period, 196 BCE",
    credit: "Photographs of British Museum objects are not free for commercial use, so this entry links to the museum’s own page.",
    objectUrl: "https://www.britishmuseum.org/collection/object/Y_EA24",
    gallery: "Room 4",
    free: true,
    about: "The trilingual decree that made decipherment possible. Read its Ptolemy cartouche in Decipher, chapter 1.",
    phrases: [],
  },
];

export const STELA_LESSON_ID = "game-stela";
export const MUSEUMS: { id: Museum; label: string }[] = [
  { id: "met", label: "The Met" },
  { id: "bm", label: "British Museum" },
  { id: "louvre", label: "Louvre" },
];

export function objectsFor(museum: Museum | "all"): StelaObject[] {
  return museum === "all" ? STELA_OBJECTS : STELA_OBJECTS.filter((o) => o.museum === museum);
}

export function playableObjects(): StelaObject[] {
  return STELA_OBJECTS.filter((o) => o.image && o.phrases.length > 0);
}

/** The hotspot under a tap, in image fractions. Smallest hit wins when boxes overlap. */
export function hitTest(phrase: Phrase, x: number, y: number): Hotspot | null {
  let best: Hotspot | null = null;
  for (const h of phrase.hotspots) {
    if (Math.abs(x - h.x) <= h.w / 2 && Math.abs(y - h.y) <= h.h / 2) {
      if (!best || h.w * h.h < best.w * best.h) best = h;
    }
  }
  return best;
}

export type TapResult = { ok: boolean; index: number; done: boolean; expected: Hotspot };

/** The player has read `index` signs; they tap `hotspotId`. */
export function tapSign(phrase: Phrase, index: number, hotspotId: string): TapResult {
  const expected = phrase.hotspots[index];
  const ok = !!expected && expected.id === hotspotId;
  const next = ok ? index + 1 : index;
  return { ok, index: next, done: next >= phrase.hotspots.length, expected };
}

/** Transliteration assembled so far. */
export function assembled(phrase: Phrase, index: number): string {
  return phrase.hotspots
    .slice(0, index)
    .map((h) => h.value)
    .join(" ");
}

/**
 * For the editor: sort hotspots into reading order from their positions,
 * given the direction. Rows/columns are grouped with a tolerance.
 */
export function sortByDirection(hotspots: Hotspot[], direction: Phrase["direction"], tolerance = 0.03): Hotspot[] {
  const hs = [...hotspots];
  if (direction === "ttb") {
    // columns first (left to right), then top to bottom inside a column
    return hs.sort((a, b) => (Math.abs(a.x - b.x) > tolerance ? a.x - b.x : a.y - b.y));
  }
  const sign = direction === "rtl" ? -1 : 1;
  return hs.sort((a, b) => (Math.abs(a.y - b.y) > tolerance ? a.y - b.y : sign * (a.x - b.x)));
}

export function xpForPhrase(hotspots: number, mistakes: number): number {
  return Math.max(10, 10 + hotspots * 5 - mistakes * 5);
}

/** Editor export / import shape check. */
export function isHotspotList(x: unknown): x is Hotspot[] {
  return (
    Array.isArray(x) &&
    x.every(
      (h) =>
        h && typeof h === "object" && typeof (h as Hotspot).id === "string" && ["x", "y", "w", "h"].every((k) => typeof (h as Record<string, unknown>)[k] === "number") && typeof (h as Hotspot).glyph === "string"
    )
  );
}
