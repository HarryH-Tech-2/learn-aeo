/**
 * The Ancient Egypt Writing Unit: five lessons, pupil worksheets, an end-of-unit quiz and the answers, as data.
 * src/lib/unit-pack/pdf.ts lays it out; the TpT listing (docs/tpt/ancient-egypt-writing-unit.md) describes it.
 *
 * Accuracy: every fact here is one the site already teaches (the Rosetta Stone and cartouche posts in
 * src/lib/blog-posts.ts, the alphabet in src/lib/content/uniliterals.ts, the words and determinatives in
 * src/lib/content/uniliteral-words.ts, the name rules in src/lib/hieroglyph-translator.ts). Sign code points
 * are the Gardiner signs named beside them, checked with Python's unicodedata (2026-10-16).
 *
 * Text is set in the PDF's standard fonts (WinAnsi), so it avoids the Egyptological letters (ꜣ ꜥ ḥ ḫ š …):
 * pupils get plain sound spellings (kh, sh, dj), the way a school textbook writes them. Hieroglyphs may
 * appear inline in any text; the layout sets them in the hieroglyph font.
 */
import { transliterateName } from "@/lib/hieroglyph-translator";

/* ── Blocks the layout knows how to draw ─────────────────────────────── */

export type Block =
  /** A numbered task heading on a pupil sheet ("1", "2", "★"). */
  | { k: "task"; n: string; title: string; text?: string }
  | { k: "h"; text: string }
  | { k: "p"; text: string; muted?: boolean }
  | { k: "bullets"; items: string[] }
  /** Ruled writing lines. */
  | { k: "lines"; n: number }
  /** A cartouche, empty (for writing in) or holding signs; `boxes` adds answer boxes beneath. */
  | { k: "cartouche"; glyphs?: string; boxes?: number; caption?: string }
  /** Rows of signs, each with answer boxes (one box per sign) and an optional hint. */
  | { k: "decode"; rows: { glyphs: string; boxes: number; hint?: string }[] }
  /** A table; widths are fractions of the text width. Cells may hold hieroglyphs. */
  | { k: "table"; head?: string[]; rows: string[][]; widths: number[]; rowHeight?: number; big?: number[] }
  | { k: "tf"; items: string[] }
  | { k: "mcq"; items: { q: string; options: string[] }[]; start?: number }
  /** Join each sign on the left to a word on the right. */
  | { k: "match"; left: string[]; right: string[] }
  /** The Rosetta Stone, three bands with blank labels. */
  | { k: "rosetta" }
  /** The 25 alphabet signs, as a chart. */
  | { k: "chart" }
  /** A tinted box: a key, a fact, a reminder. */
  | { k: "box"; title: string; text: string }
  | { k: "space"; h: number }
  | { k: "break" };

export type Step = { min: number; title: string; body: string; say?: string[] };

export type Lesson = {
  n: number;
  title: string;
  /** One line for the overview table. */
  short: string;
  bigQuestion: string;
  objectives: string[];
  successCriteria: string[];
  england: string[];
  us: string[];
  resources: string[];
  tool: { name: string; url: string; use: string };
  vocabulary: [string, string][];
  steps: Step[];
  support: string[];
  stretch: string[];
  exitTicket: string;
  /** Pupil pages: a "break" block starts a new page. */
  worksheet: Block[];
  answers: Block[];
};

/* ── Curriculum wording ──────────────────────────────────────────────── */

/** England, National Curriculum (2013), history programme of study, Key Stage 2. */
export const ENGLAND_KS2 =
  "KS2 History: the achievements of the earliest civilizations, an overview of where and when the first civilizations appeared and a depth study of Ancient Egypt.";
export const ENGLAND_SOURCES = "KS2 History: understand how our knowledge of the past is constructed from a range of sources.";

/** US: the C3 Framework's history indicators for grades 6-8 (codes with a short paraphrase), and Common Core literacy in history. */
export const C3 = {
  his1: "C3 D2.His.1.6-8: connections among events and developments in a broader historical context",
  his3: "C3 D2.His.3.6-8: why individuals and groups, and the developments they shaped, are historically significant",
  his4: "C3 D2.His.4.6-8: factors that shaped the perspectives of people in a past era",
  his10: "C3 D2.His.10.6-8: limitations in the historical record",
  his12: "C3 D2.His.12.6-8: questions about sources that lead to further inquiry",
  his16: "C3 D2.His.16.6-8: organize evidence into a coherent argument about the past",
  rh4: "CCSS RH.6-8.4: domain-specific vocabulary in history",
  rh7: "CCSS RH.6-8.7: integrate visual information with print text",
} as const;

/* ── The alphabet chart (25 signs, the same set as Lesson 1 of the course) ── */

export type ChartSign = { glyph: string; sound: string; picture: string; gardiner: string };

export const ALPHABET_CHART: ChartSign[] = [
  { glyph: "𓄿", sound: "a", picture: "vulture", gardiner: "G1" },
  { glyph: "𓇋", sound: "i", picture: "reed", gardiner: "M17" },
  { glyph: "𓇌", sound: "y", picture: "two reeds", gardiner: "M17A" },
  { glyph: "𓂝", sound: "a (deep)", picture: "forearm", gardiner: "D36" },
  { glyph: "𓅱", sound: "w / o / u", picture: "quail chick", gardiner: "G43" },
  { glyph: "𓃀", sound: "b", picture: "foot", gardiner: "D58" },
  { glyph: "𓊪", sound: "p", picture: "stool", gardiner: "Q3" },
  { glyph: "𓆑", sound: "f / v", picture: "horned viper", gardiner: "I9" },
  { glyph: "𓅓", sound: "m", picture: "owl", gardiner: "G17" },
  { glyph: "𓈖", sound: "n", picture: "water", gardiner: "N35" },
  { glyph: "𓂋", sound: "r / l", picture: "mouth", gardiner: "D21" },
  { glyph: "𓉔", sound: "h", picture: "reed shelter", gardiner: "O4" },
  { glyph: "𓎛", sound: "h (breathy)", picture: "twisted wick", gardiner: "V28" },
  { glyph: "𓐍", sound: "kh", picture: "sieve", gardiner: "Aa1" },
  { glyph: "𓄡", sound: "kh (soft)", picture: "animal belly", gardiner: "F32" },
  { glyph: "𓋴", sound: "s", picture: "folded cloth", gardiner: "S29" },
  { glyph: "𓊃", sound: "z", picture: "door bolt", gardiner: "O34" },
  { glyph: "𓈙", sound: "sh", picture: "pool", gardiner: "N37" },
  { glyph: "𓈎", sound: "q", picture: "hill slope", gardiner: "N29" },
  { glyph: "𓎡", sound: "k", picture: "basket", gardiner: "V31" },
  { glyph: "𓎼", sound: "g", picture: "jar stand", gardiner: "W11" },
  { glyph: "𓏏", sound: "t", picture: "bread loaf", gardiner: "X1" },
  { glyph: "𓍿", sound: "ch / tj", picture: "tethering rope", gardiner: "V13" },
  { glyph: "𓂧", sound: "d", picture: "hand", gardiner: "D46" },
  { glyph: "𓆓", sound: "j / dj", picture: "cobra", gardiner: "I10" },
];

/* ── Names and words used on the sheets (computed, so the sheet and the key always agree) ── */

/** Lesson 2's four names to decode, spelled by the site's translator rules. */
export const LESSON2_NAMES = ["Ben", "Mia", "Oscar", "Zara"] as const;
export const nameGlyphs = (name: string) => transliterateName(name).map((r) => r.mapping.glyph).join("");
export const nameSignCount = (name: string) => transliterateName(name).length;
/** The key's reading of a name: "foot (b), reed (e), water (n)". */
export const nameKey = (name: string) => transliterateName(name).map((r) => `${r.mapping.signName.toLowerCase()} (${r.input})`).join(", ");
/** The letters a pupil writes in the boxes: "B-E-N". */
export const nameLetters = (name: string) => transliterateName(name).map((r) => r.input.toUpperCase()).join("-");

/** Lesson 1: Champollion's two cartouches (src/lib/blog-posts.ts, "reading-your-first-cartouche"). */
export const PTOLEMY = "𓊪𓏏𓍯𓃭𓐝𓇌𓋴";
export const CLEOPATRA = "𓈎𓃭𓇋𓅱𓊪𓄿𓂧𓂋𓄿𓏏";
/** Lesson 3. */
export const KHUFU = "𓐍𓅱𓆑𓅱";
export const TUTANKHAMUN = "𓇋𓏠𓈖𓏏𓅱𓏏𓋹";
export const RAMESSES = "𓇋𓏠𓈖𓌸𓇳𓄟𓋴𓇓";

/** Lesson 4: real words (src/lib/content/uniliteral-words.ts), sound signs then the silent determinative. */
export const LESSON4_WORDS = [
  { glyphs: "𓊪𓏏𓇯", sounds: "p-t", say: "pet", meaning: "sky", det: "sky" },
  { glyphs: "𓅓𓅱𓈗", sounds: "m-w", say: "moo", meaning: "water", det: "three ripples of water" },
  { glyphs: "𓉔𓂋𓅱𓇳", sounds: "h-r-w", say: "heru", meaning: "day", det: "sun" },
  { glyphs: "𓂧𓊪𓏏𓊛", sounds: "d-p-t", say: "depet", meaning: "boat", det: "boat" },
  { glyphs: "𓃀𓄿𓎡𓀀", sounds: "b-a-k", say: "bak", meaning: "servant", det: "seated man" },
  { glyphs: "𓎛𓈖𓈎𓏏𓏊", sounds: "h-n-q-t", say: "henqet", meaning: "beer", det: "beer jar" },
] as const;

/** Lesson 4's determinatives and what kind of word each one marks. */
export const DETERMINATIVES = [
  { glyph: "𓀀", name: "seated man", marks: "a man or a person" },
  { glyph: "𓁐", name: "seated woman", marks: "a woman" },
  { glyph: "𓇳", name: "sun", marks: "the sun, light or time" },
  { glyph: "𓈗", name: "three ripples", marks: "water or a liquid" },
  { glyph: "𓊛", name: "boat", marks: "a boat or travel by river" },
  { glyph: "𓉐", name: "house plan", marks: "a building" },
  { glyph: "𓏛", name: "papyrus roll", marks: "writing or an idea" },
  { glyph: "𓏥", name: "three strokes", marks: "more than one (plural)" },
] as const;

/* ── The five lessons ────────────────────────────────────────────────── */

export const LESSONS: Lesson[] = [
  {
    n: 1,
    title: "What are hieroglyphs? The Rosetta Stone",
    short: "What hieroglyphs were, and how the Rosetta Stone let us read them again",
    bigQuestion: "How did we learn to read a script that nobody could read for 1,400 years?",
    objectives: [
      "Explain what hieroglyphs were, who wrote them and for how long they were used.",
      "Describe the Rosetta Stone: when and where it was found, and the three scripts on it.",
      "Explain how Thomas Young and Jean-François Champollion used royal names to crack the code.",
    ],
    successCriteria: [
      "I can name the three scripts on the Rosetta Stone.",
      "I can explain why the Greek text was the key.",
      "I can use signs I know to work out a name I do not know.",
    ],
    england: [ENGLAND_KS2, ENGLAND_SOURCES],
    us: [C3.his1, C3.his10, C3.rh7],
    resources: [
      "Worksheet 1 (one per pupil)",
      "A picture of the Rosetta Stone on the board (the British Museum's collection page, object EA24)",
      "The name translator on the whiteboard for the plenary",
    ],
    tool: {
      name: "Decipher (free puzzle) and the name translator",
      url: "learnhieroglyphics.com/daily/decipher",
      use: "Decipher hands pupils Ptolemy's cartouche, then Cleopatra's, in the order Young and Champollion met them: ideal homework or a fast-finisher task. Use the translator (learnhieroglyphics.com/translate-name-to-hieroglyphics) in the plenary to tease Lesson 2.",
    },
    vocabulary: [
      ["hieroglyph", "a sign in the ancient Egyptian picture script; from the Greek for 'sacred carving'"],
      ["scribe", "a person trained to read and write"],
      ["demotic", "the quick, joined-up everyday script of late Egypt"],
      ["decree", "an official announcement"],
      ["cartouche", "the oval rope loop drawn round a royal name"],
      ["decipher", "to work out the meaning of a code or script"],
    ],
    steps: [
      {
        min: 5,
        title: "Starter: the mystery wall",
        body: "Show Cleopatra's cartouche (Worksheet 1, task 2) large on the board without saying whose it is. Pairs decide: is it pictures, letters, or something else?",
        say: [
          "For over 1,400 years, nobody on Earth could read signs like these. By the end of today you will read this one.",
          "What clues do you notice? Which way are the birds facing?",
        ],
      },
      {
        min: 10,
        title: "Teach: what were hieroglyphs?",
        body: "The Egyptians carved and painted hieroglyphs for more than 3,000 years, from before 3000 BCE until the last known inscription at the temple of Philae in 394 CE. Perhaps one Egyptian in a hundred could read; scribes ran the country. Some signs stand for sounds, some for whole words, and some are silent clues (Lesson 4). Signs that face a direction look towards the start of the line.",
        say: [
          "Hieroglyph comes from Greek words meaning 'sacred carving'. Where would you expect to see sacred carvings?",
          "If only one person in a hundred could read, who held the power?",
        ],
      },
      {
        min: 10,
        title: "Teach: the Rosetta Stone",
        body: "July 1799: French soldiers under Pierre-François Bouchard, pulling down an old wall at Fort Julien near Rashid (Rosetta), found a broken slab of dark stone. It carries one decree of 196 BCE, issued by priests to honour the young king Ptolemy V, written three times: in hieroglyphs (14 lines survive), demotic (32) and Greek (54). Scholars could still read Greek. It has been in the British Museum since 1802.",
        say: [
          "Why does it matter that the same message is written three times?",
          "Which of the three scripts could people in 1799 already read?",
        ],
      },
      {
        min: 18,
        title: "Activity: think like Champollion (Worksheet 1)",
        body: "Task 1: label the stone. Task 2: Thomas Young showed that the oval rings held a royal name, Ptolemy, spelled with sound signs. Pupils use Ptolemy's signs to fill in the same signs in a second cartouche, then the extra signs in the key, and read the name: Cleopatra. Task 3: true or false. Fast finishers: the challenge.",
        say: [
          "You know Ptolemy's signs. Which of them can you find again in the second cartouche?",
          "Champollion did exactly this in 1822. You are repeating a famous discovery.",
        ],
      },
      {
        min: 7,
        title: "Plenary: 'I've got it!'",
        body: "Tell the legend: in September 1822 Champollion ran into his brother's office shouting 'Je tiens l'affaire!' ('I've got it!') and fainted. His secret weapon was Coptic, the last stage of the Egyptian language. Type a pupil's name into the translator on the whiteboard as a teaser for next lesson. Exit ticket.",
        say: ["Next lesson, you will write your own name the way a scribe would."],
      },
    ],
    support: [
      "Pre-fill the Ptolemy signs in task 2 and let pupils work in pairs.",
      "Give the three script names as a word bank for task 1: hieroglyphs, demotic, Greek.",
    ],
    stretch: [
      "Why did scholars before Champollion think every sign was a symbol for an idea? (A writer called Horapollo said so, and people believed him for centuries.)",
      "Play the free Decipher puzzle and record how many sign values you worked out.",
    ],
    exitTicket: "Why was the Greek writing on the Rosetta Stone the key to reading hieroglyphs?",
    worksheet: [
      { k: "p", text: "Name: ______________________    Class: __________    Date: __________" },
      { k: "task", n: "1", title: "Label the Rosetta Stone", text: "The same message is written three times. Write the name of each script on its line. Word bank: Greek, hieroglyphs, demotic." },
      { k: "rosetta" },
      {
        k: "task",
        n: "2",
        title: "Think like Champollion",
        text: "Thomas Young worked out that this cartouche spells the Greek king's name PTOLEMY. Here are its signs and their sounds:",
      },
      {
        k: "table",
        head: ["𓊪", "𓏏", "𓍯", "𓃭", "𓐝", "𓇌", "𓋴"],
        rows: [["p", "t", "o", "l", "m", "y", "s"]],
        widths: [1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7, 1 / 7],
        big: [0, 1, 2, 3, 4, 5, 6],
      },
      {
        k: "p",
        text: "Now look at this second cartouche. Write the sounds you already know from PTOLEMY in the boxes. Then use the key to fill in the rest.",
      },
      { k: "cartouche", glyphs: CLEOPATRA, boxes: 10 },
      { k: "box", title: "Key: signs Champollion knew from other names", text: "𓈎 k  ·  𓇋 i  ·  𓅱 o  ·  𓄿 a  ·  𓂧 d or t  ·  𓂋 r" },
      { k: "p", text: "Whose name is it? ______________________________" },
      { k: "break" },
      { k: "task", n: "3", title: "True or false?", text: "Tick one box for each sentence." },
      {
        k: "tf",
        items: [
          "The Egyptians used hieroglyphs for more than 3,000 years.",
          "The Rosetta Stone has the same message written in three scripts.",
          "The Rosetta Stone was found by archaeologists digging in a tomb.",
          "In 1799, scholars could already read the Greek on the stone.",
          "Every hieroglyph is a picture of the thing it means.",
          "Champollion knew Coptic, the last stage of the Egyptian language.",
        ],
      },
      { k: "task", n: "4", title: "Explain", text: "Why was the Greek writing on the Rosetta Stone so important? Use the word 'same' in your answer." },
      { k: "lines", n: 4 },
      { k: "task", n: "★", title: "Challenge", text: "The last sign in the second cartouche, the loaf 𓏏, is not part of the Greek name. Egyptian put a t on the end of words for women. Why do you think the scribe added it here?" },
      { k: "lines", n: 3 },
    ],
    answers: [
      { k: "h", text: "Worksheet 1" },
      { k: "p", text: "**Task 1.** Top band: hieroglyphs. Middle band: demotic. Bottom band: Greek." },
      {
        k: "p",
        text: "**Task 2.** From PTOLEMY pupils can fill in 𓃭 l, 𓊪 p and 𓏏 t. With the key the whole cartouche reads k-l-i-o-p-a-d-r-a-t: **Cleopatra** (Kleopatra in Greek). Accept 'Cleopatra' however it is spelled. The hand 𓂧 stands for the t of the Greek name.",
      },
      {
        k: "p",
        text: "**Task 3.** 1 True. 2 True. 3 False: French soldiers found it in 1799 while pulling down an old wall at Fort Julien near Rosetta. 4 True. 5 False: most signs used in writing stand for sounds. 6 True.",
      },
      { k: "p", text: "**Task 4.** The Greek could still be read, and it said the same thing as the hieroglyphs, so scholars could compare the two and match names and words." },
      { k: "p", text: "**Challenge.** The loaf 𓏏 is the feminine ending -t: it marks the name as a woman's (a queen's). Any answer that links it to Cleopatra being a woman is correct." },
    ],
  },
  {
    n: 2,
    title: "The alphabet signs: write your name in a cartouche",
    short: "The 25 sound signs, the scribes' spelling rules, and your own name in a cartouche",
    bigQuestion: "How did the Egyptians write sounds?",
    objectives: [
      "Recognise that about 25 hieroglyphs each stand for one consonant sound.",
      "Apply the scribes' rules: no vowels written, L and R share one sign, double letters written once.",
      "Write their own name in a cartouche and explain their choice of signs.",
    ],
    successCriteria: [
      "I can find the sign for a sound on the chart.",
      "I can decode a name written in sound signs.",
      "I can write my name in a cartouche and say why I chose each sign.",
    ],
    england: [ENGLAND_KS2],
    us: [C3.his1, C3.rh4],
    resources: ["The alphabet chart (one per pupil or one per pair)", "Worksheet 2", "The name translator on the whiteboard"],
    tool: {
      name: "Name translator, and the free worksheet",
      url: "learnhieroglyphics.com/translate-name-to-hieroglyphics",
      use: "Type volunteers' names on the whiteboard and tap each sign for a one-line explanation. The free three-page worksheet at learnhieroglyphics.com/teachers/worksheet is a second, ready-printed version of this lesson for another class or a cover lesson.",
    },
    vocabulary: [
      ["consonant", "a sound like b, m or t, made by blocking the breath; Egyptian wrote only these"],
      ["vowel", "a sound like a, e, i, o, u; Egyptian did not write them"],
      ["uniliteral", "a sign that stands for one consonant (Egyptologists' word for an 'alphabet sign')"],
      ["transliteration", "writing the sounds of one script in the letters of another"],
      ["cartouche", "the oval rope loop round a royal name"],
    ],
    steps: [
      {
        min: 8,
        title: "Starter: names on the wall",
        body: "Type two volunteers' names into the translator on the whiteboard, one with an L and one with an E if you can. The class works out the rules from what appears.",
        say: ["Why is there no sign for the E?", "Why do the L and the R look the same?"],
      },
      {
        min: 12,
        title: "Teach: the alphabet signs",
        body: "Hand out the chart. Egyptian had 24 consonant sounds written with 25 signs (two reeds 𓇌 for y). Many are memorable pictures: the owl 𓅓 m, the ripple of water 𓈖 n, the mouth 𓂋 r. Vowels were not written: readers filled them in from knowing the language, as we can read 'txt msg'. Egyptologists put an e between consonants so they can say words aloud: nfr becomes 'nefer'.",
        say: [
          "Read this text message: 'c u l8r'. How did you know what it said? That is how Egyptians read words without vowels.",
          "Which sign would you choose for the start of your own name?",
        ],
      },
      {
        min: 20,
        title: "Activity: Worksheet 2",
        body: "Task 1: decode four names. Task 2: write your name in the cartouche, then the sounds the way an Egyptologist would. Task 3: the scribes' rules check. Fast finishers: the challenge.",
        say: ["Say your name slowly. How many sounds can you hear? You need one sign per consonant sound."],
      },
      {
        min: 10,
        title: "Plenary: swap and decode",
        body: "Pupils swap sheets and read a partner's cartouche aloud. The Egyptians called the cartouche shenu, from a word meaning 'to encircle': a protective ring round a royal name. Only pharaohs had one, which is why it is a treat to put your own name in one. Exit ticket.",
        say: ["Could you read your partner's name? Which sign caused trouble, and why?"],
      },
    ],
    support: [
      "Give pupils their name already split into sounds (H-A-R-Y) so they only have to find the signs.",
      "Pair a confident reader with a pupil who needs help for task 1.",
    ],
    stretch: [
      "Write a friend's or family member's name, then a famous person's.",
      "Find all the letters that share one sign (C and K, F and V, L and R).",
    ],
    exitTicket: "Write one rule the scribes followed, and give an example from your own name.",
    worksheet: [
      { k: "p", text: "Name: ______________________    Class: __________    Date: __________" },
      { k: "h", text: "The hieroglyphic alphabet: 25 signs for 24 sounds" },
      { k: "chart" },
      {
        k: "box",
        title: "Rules of the scribes",
        text: "1. Egyptian wrote no vowels. Use the vulture 𓄿 for A, the reed 𓇋 for E, I and Y, and the quail chick 𓅱 for O and U.   2. There was no L sign: L borrows the mouth 𓂋 for R.   3. Double letters are written once: Harry is H-A-R-Y.   4. C sounds like K before A, O or U (basket 𓎡) and like S before E, I or Y (folded cloth 𓋴).   5. SH, CH, TH and PH are one sign each.",
      },
      { k: "break" },
      { k: "task", n: "1", title: "Decode these names", text: "Use the chart. Write one letter in each box, then the name." },
      { k: "decode", rows: LESSON2_NAMES.map((n) => ({ glyphs: nameGlyphs(n), boxes: nameSignCount(n) })) },
      { k: "task", n: "2", title: "Your name in a cartouche", text: "Only pharaohs had their names in a cartouche. Today, you are the pharaoh. Write one sign for each sound." },
      { k: "cartouche" },
      { k: "p", text: "How an Egyptologist would write the sounds (Harry = h-a-r-y): ______________________" },
      { k: "task", n: "3", title: "Rules check" },
      {
        k: "mcq",
        items: [
          { q: "Which sign do L and R share?", options: ["𓅓 owl", "𓂋 mouth", "𓈖 water"] },
          { q: "Why does Harry have only one R in hieroglyphs?", options: ["The scribe ran out of room", "Double letters are written once", "R is a vowel"] },
          { q: "Why is there no sign for E?", options: ["Egyptian wrote no vowels", "E had not been invented", "It was a secret sign"] },
        ],
      },
      { k: "task", n: "★", title: "Challenge", text: "Find three pairs of English letters that share one sign on the chart.  1. _____ and _____    2. _____ and _____    3. _____ and _____" },
    ],
    answers: [
      { k: "h", text: "Worksheet 2" },
      {
        k: "table",
        head: ["Signs", "Read as", "Name"],
        rows: LESSON2_NAMES.map((n) => [nameGlyphs(n), nameKey(n), `**${n}** (${nameLetters(n)})`]),
        widths: [0.3, 0.45, 0.25],
        big: [0],
      },
      {
        k: "p",
        text: "Accept any answer that gets the consonants right: the vowels were a guess for the Egyptians too. In Oscar, the C comes before A, so it is the basket 𓎡 (k).",
      },
      { k: "p", text: "**Task 2.** Check one sign per consonant sound, vowels as in the rules, and double letters written once." },
      { k: "p", text: "**Task 3.** 1 the mouth 𓂋. 2 Double letters are written once. 3 Egyptian wrote no vowels." },
      { k: "p", text: "**Challenge.** Any three of: L and R (mouth), C and K (basket), F and V (horned viper), O, U and W (quail chick), E, I and Y (reed)." },
    ],
  },
  {
    n: 3,
    title: "Reading real cartouches",
    short: "Khufu, Cleopatra, Tutankhamun and Ramesses II, sign by sign",
    bigQuestion: "What can a pharaoh's name tell us?",
    objectives: [
      "Explain what a cartouche is and why a name mattered so much to an Egyptian.",
      "Read cartouches spelled with sound signs (Khufu, Cleopatra).",
      "Use word signs and 'gods first' (honorific transposition) to read Tutankhamun and Ramesses II.",
    ],
    successCriteria: [
      "I can say what a cartouche is and why pharaohs wrote their names everywhere.",
      "I can read a royal name spelled with sound signs.",
      "I can explain why a god's name is written first.",
    ],
    england: [ENGLAND_KS2, ENGLAND_SOURCES],
    us: [C3.his3, C3.his4, C3.rh7],
    resources: ["Worksheet 3", "The alphabet chart from Lesson 2", "Photos of a cartouche on a monument (optional)"],
    tool: {
      name: "Name translator, and the cartouche guide",
      url: "learnhieroglyphics.com/blog/reading-your-first-cartouche",
      use: "Teacher background on all four names, sign by sign. Type CLEOPATRA into the translator and compare it with the real cartouche: the translator uses the mouth for L, as early scribes did, while Greek-era scribes used the lion 𓃭. A good discussion point.",
    },
    vocabulary: [
      ["cartouche", "the oval rope loop round a royal name; the Egyptians called it shenu, 'to encircle'"],
      ["pharaoh", "the king of Egypt; from per-aa, 'great house', first the palace, then the man in it"],
      ["word sign", "a sign that stands for a whole word, like the ankh 𓋹 for 'life'"],
      ["honorific transposition", "writing a god's name first, out of respect, even when it is said later"],
    ],
    steps: [
      {
        min: 5,
        title: "Starter: why write your name everywhere?",
        body: "To an Egyptian your name, ren, was a part of you, as real as your heart. Carve it on a wall and you lived as long as the wall did; chisel it out and you were gone. That is why kings wrote their names everywhere, and why their enemies hacked them off.",
        say: ["If your name kept you alive, where would you carve it?", "Why might someone chisel a pharaoh's name off a wall?"],
      },
      {
        min: 12,
        title: "Teach: cartouches, word signs and gods first",
        body: "Napoleon's soldiers thought the oval looked like the paper cartridges (cartouches) for their muskets, and the name stuck. A pharaoh had five names; two went in cartouches, the throne name and the birth name. Foreign rulers like Cleopatra were spelled out with sound signs. Egyptian kings also used word signs (the ankh 𓋹 'life', the sun 𓇳 'Ra') and wrote a god's name first out of respect.",
        say: ["Which would be easier to read: a name spelled sound by sound, or one with whole-word signs? Why?"],
      },
      {
        min: 25,
        title: "Activity: Worksheet 3",
        body: "Task 1: Khufu, builder of the Great Pyramid (four sound signs). Task 2: Cleopatra, with the lion for L. Task 3: Tutankhamun with the word-sign key. Task 4: Ramesses II with the key. Task 5: explain 'gods first'.",
        say: ["Tutankhamun's cartouche starts with Amun. Why is the god's name at the front when we say it at the end?"],
      },
      {
        min: 8,
        title: "Plenary: which was hardest?",
        body: "Foreign rulers (Ptolemy, Cleopatra) are spelled sound by sound; Egyptian kings lean on word signs and gods first. That is why Champollion started with the foreigners. On 14 September 1822 he read Ramesses' name from the sun sign 𓇳 (Ra, as in Coptic) and the sounds m-s. Exit ticket.",
        say: ["Why do you think Champollion started with Greek rulers' names?"],
      },
    ],
    support: [
      "Do task 1 together on the board before pupils start.",
      "Give pupils the spoken order for Tutankhamun (Tut-ankh-Amun) and ask them to match the signs to it.",
    ],
    stretch: [
      "Ramesses II's throne name is 𓇳𓄊𓁧𓍉𓈖, User-maat-Ra Setep-en-Ra, 'powerful is the truth of Ra, chosen by Ra'. Which sign appears once but is read twice?",
      "Tutankhamun was born Tutankhaten. What changed in his name, and what might that tell us about his reign?",
    ],
    exitTicket: "Name one way an Egyptian king's cartouche is harder to read than Cleopatra's.",
    worksheet: [
      { k: "p", text: "Name: ______________________    Class: __________    Date: __________" },
      { k: "p", text: "Use your alphabet chart from Lesson 2. The birds and people face the start: read towards their faces." },
      { k: "task", n: "1", title: "Khufu, builder of the Great Pyramid", text: "Four sound signs. Write a sound in each box." },
      { k: "cartouche", glyphs: KHUFU, boxes: 4 },
      { k: "task", n: "2", title: "Cleopatra", text: "In Greek times scribes used the lion 𓃭 for L. Write the sounds, then check: is it Cleopatra?" },
      { k: "cartouche", glyphs: CLEOPATRA, boxes: 10 },
      { k: "task", n: "3", title: "Tutankhamun", text: "Use the key. Write the three parts in the order we say them." },
      { k: "cartouche", glyphs: TUTANKHAMUN },
      { k: "box", title: "Key", text: "𓇋𓏠𓈖 Amun (said 'Imen'), the king of the gods  ·  𓏏𓅱𓏏 tut, 'image'  ·  𓋹 ankh, 'living'" },
      { k: "p", text: "Said in this order: ____________ - ____________ - ____________    Meaning: 'Living image of Amun'" },
      { k: "break" },
      { k: "task", n: "4", title: "Ramesses II, 'the Great'", text: "Two gods are pulled to the front of this cartouche. Use the key." },
      { k: "cartouche", glyphs: RAMESSES },
      {
        k: "box",
        title: "Key",
        text: "𓇋𓏠𓈖 Amun  ·  𓌸 mery, 'beloved'  ·  𓇳 Ra, the sun god  ·  𓄟 mes, 'born'  ·  𓋴𓇓 su, 'him'",
      },
      { k: "p", text: "Fill in the spoken order: Ra - ______ - ______    mery - ______" },
      { k: "p", text: "What does it mean? 'Ra has ________ him, ________ of Amun.'" },
      { k: "task", n: "5", title: "Gods first", text: "Why did scribes write the name of a god at the start of a cartouche, even when it was said at the end?" },
      { k: "lines", n: 3 },
      { k: "task", n: "★", title: "Challenge", text: "Which of the four names were easiest to read? Explain why using the words 'sound signs' and 'word signs'." },
      { k: "lines", n: 3 },
    ],
    answers: [
      { k: "h", text: "Worksheet 3" },
      { k: "p", text: "**Task 1.** 𓐍 kh, 𓅱 w (u), 𓆑 f, 𓅱 w (u): kh-w-f-w, **Khufu** ('he protects me', short for Khnum-khuf, 'the god Khnum protects me')." },
      { k: "p", text: "**Task 2.** k (q), l, i, o, p, a, d (t), r, a, t: **Cleopatra**. The last loaf 𓏏 is the feminine ending." },
      {
        k: "p",
        text: "**Task 3.** Written: Amun, tut, ankh. Said: **Tut-ankh-Amun**, 'living image of Amun'. On his golden objects the cartouche often goes on with 'ruler of southern Heliopolis' (Thebes); pupils do not need it.",
      },
      {
        k: "p",
        text: "**Task 4.** Said: **Ra-mes-su mery-Amun**, 'Ra has borne him (Ra has given birth to him), beloved of Amun'. Accept 'born', 'made' or 'given birth to'. Amun and Ra are written first out of respect.",
      },
      { k: "p", text: "**Task 5.** Out of respect for the god (honorific transposition). Accept any answer about honouring or respecting the god." },
      {
        k: "p",
        text: "**Challenge.** Khufu and Cleopatra are easiest: they are spelled with sound signs only. Tutankhamun and Ramesses use word signs (the ankh, the sun) and put gods first. **Stretch answer** (throne name): the sun 𓇳, Ra, is read twice.",
      },
    ],
  },
  {
    n: 4,
    title: "Determinatives and real Egyptian words",
    short: "Silent picture clues, and reading real words: sky, water, day, boat, beer",
    bigQuestion: "Without vowels, how did a reader know which word was meant?",
    objectives: [
      "Explain that a determinative is a silent sign at the end of a word that shows what kind of thing it is.",
      "Read real Egyptian words made of sound signs and a determinative.",
      "Explain how the loaf -t changes a word (brother to sister).",
    ],
    successCriteria: [
      "I can say what a determinative is and why scribes used them.",
      "I can read the sounds of a real word and use its determinative to work out the meaning.",
      "I can invent a determinative for a new word.",
    ],
    england: [ENGLAND_KS2],
    us: [C3.his12, C3.rh4, C3.rh7],
    resources: ["Worksheet 4", "The alphabet chart", "The hieroglyphics keyboard on the whiteboard"],
    tool: {
      name: "Hieroglyphics keyboard",
      url: "learnhieroglyphics.com/hieroglyphics-keyboard",
      use: "One key, one sign. Type PET, SENET or DEPET and the keyboard recognises the real Egyptian word and shows its meaning: a quick way to show that the same sounds are real vocabulary.",
    },
    vocabulary: [
      ["determinative", "a silent picture sign at the end of a word that shows what kind of thing it is"],
      ["category", "a group of things that are alike (people, water, buildings)"],
      ["feminine", "for a woman or girl; in Egyptian, words for women often end in t"],
      ["plural", "more than one"],
    ],
    steps: [
      {
        min: 5,
        title: "Starter: what is 'bt'?",
        body: "Write 'bt' on the board. What word is it? Bat, bet, bit, boat, but, beat... Without vowels, many words look the same.",
        say: ["How could a writer help the reader know which word they meant, without adding vowels?"],
      },
      {
        min: 12,
        title: "Teach: determinatives",
        body: "Scribes added a silent picture at the end of a word, a determinative, to show what kind of thing it was: a seated man 𓀀 for people, the sun 𓇳 for time, three ripples 𓈗 for water. Determinatives also show where one word ends, because Egyptian left no spaces. Show sn, brother: 𓋴𓈖 + 𓀀. Add the loaf, t, and the seated woman: 𓋴𓈖𓏏𓁐 snt, sister. That little loaf turns almost any word feminine.",
        say: ["Why would a silent sign be useful if Egyptian had no spaces between words?"],
      },
      {
        min: 23,
        title: "Activity: Worksheet 4",
        body: "Task 1: match each determinative to its kind of word. Task 2: read six real words (sounds first, then use the determinative to guess the meaning). Task 3: brother and sister. Task 4: be a scribe and invent a determinative.",
        say: ["Read the sounds first. Then look at the last sign: what kind of word is it?"],
      },
      {
        min: 10,
        title: "Plenary: the keyboard",
        body: "Type PET, SENET and DEPET on the hieroglyphics keyboard; it recognises the real words. Share the most inventive determinatives from task 4. Exit ticket.",
      },
    ],
    support: [
      "Give the determinative meanings as a word bank before task 2.",
      "Do the first word of task 2 together.",
    ],
    stretch: [
      "Two words are both said 'khet': 𓐍𓏏𓏥 (things) and 𓄡𓏏𓄹 (belly). How do the determinatives tell them apart?",
      "Write your own name, then add a seated man 𓀀 or seated woman 𓁐 at the end, as an Egyptian would.",
    ],
    exitTicket: "What is a determinative, and why did Egyptian writing need them?",
    worksheet: [
      { k: "p", text: "Name: ______________________    Class: __________    Date: __________" },
      { k: "task", n: "1", title: "Match the determinative", text: "Draw a line from each silent sign to the kind of word it marks." },
      {
        k: "match",
        left: ["𓀀", "𓁐", "𓇳", "𓈗", "𓊛", "𓉐"],
        right: ["water or a liquid", "a building", "a man or a person", "a boat", "the sun, light or time", "a woman"],
      },
      { k: "task", n: "2", title: "Read real Egyptian words", text: "Write the sounds (use your chart), then use the last sign to work out the meaning." },
      {
        k: "table",
        head: ["Word", "Sounds", "Meaning"],
        rows: LESSON4_WORDS.map((w) => [w.glyphs, "", ""]),
        widths: [0.34, 0.33, 0.33],
        rowHeight: 34,
        big: [0],
      },
      { k: "box", title: "Meaning bank", text: "boat  ·  beer  ·  day  ·  servant  ·  sky  ·  water" },
      { k: "break" },
      { k: "task", n: "3", title: "Brother and sister", text: "𓋴𓈖𓀀 is sn, 'brother'. What two changes make 𓋴𓈖𓏏𓁐, 'sister'?" },
      { k: "lines", n: 3 },
      { k: "task", n: "4", title: "Be a scribe", text: "Choose an English word (for example 'cat', 'pizza' or 'school'). Write its consonants in hieroglyphs, then draw your own determinative at the end. Explain your choice." },
      { k: "cartouche", caption: "No cartouche needed for ordinary words: use this box for your word." },
      { k: "lines", n: 3 },
      { k: "task", n: "★", title: "Challenge", text: "𓐍𓏏𓏥 and 𓄡𓏏𓄹 are both said 'khet'. One means 'things', the other 'belly'. Which is which, and how do you know?" },
      { k: "lines", n: 3 },
    ],
    answers: [
      { k: "h", text: "Worksheet 4" },
      { k: "p", text: "**Task 1.** 𓀀 a man or a person.  𓁐 a woman.  𓇳 the sun, light or time.  𓈗 water or a liquid.  𓊛 a boat.  𓉐 a building." },
      {
        k: "table",
        head: ["Word", "Sounds (said)", "Meaning, and its determinative"],
        rows: LESSON4_WORDS.map((w) => [w.glyphs, `${w.sounds} (${w.say})`, `${w.meaning}: ${w.det}`]),
        widths: [0.3, 0.3, 0.4],
        big: [0],
      },
      { k: "p", text: "Sounds: accept h for the twisted wick 𓎛 in 'beer', and k or q for the hill slope 𓈎. In 'servant', the vulture 𓄿 is the a." },
      { k: "p", text: "**Task 3.** Add the loaf 𓏏 (t), the feminine ending, and change the seated man 𓀀 to a seated woman 𓁐." },
      { k: "p", text: "**Task 4.** Any word whose consonants are written with chart signs, with a determinative that fits its meaning and a sensible reason." },
      { k: "p", text: "**Challenge.** 𓐍𓏏𓏥 is 'things': three strokes mean more than one. 𓄡𓏏𓄹 is 'belly': the piece of flesh marks a part of the body." },
    ],
  },
  {
    n: 5,
    title: "Assessment and creative task: be a scribe",
    short: "End-of-unit quiz, then a scribe's tablet that uses everything learned",
    bigQuestion: "What have we learned about Egyptian writing, and why does it matter?",
    objectives: [
      "Recall the key facts of the unit: hieroglyphs, the Rosetta Stone, sound signs, cartouches, determinatives.",
      "Apply the rules to write and read hieroglyphs independently.",
      "Explain, in writing, how we came to read hieroglyphs again.",
    ],
    successCriteria: [
      "I can answer questions on everything in the unit.",
      "My tablet uses a cartouche, a real Egyptian word and a determinative.",
      "My museum label explains my tablet to a visitor.",
    ],
    england: [ENGLAND_KS2, ENGLAND_SOURCES],
    us: [C3.his16, C3.his3, C3.rh4],
    resources: ["The end-of-unit quiz (one per pupil)", "Worksheet 5: the scribe's tablet", "Alphabet charts", "Classroom quiz on the whiteboard (optional)"],
    tool: {
      name: "Classroom quiz game show",
      url: "learnhieroglyphics.com/teachers/class",
      use: "A full-screen hieroglyph quiz for the whiteboard: pupils join from any device with a team name, no accounts. Free for 7 days, then part of the Classroom licence. Use it for the retrieval starter or as the finale.",
    },
    vocabulary: [
      ["stela", "an upright carved stone slab with writing and pictures"],
      ["scribe", "a person trained to read and write"],
      ["evidence", "facts or objects that show something is true"],
    ],
    steps: [
      {
        min: 5,
        title: "Starter: retrieval",
        body: "Five quick questions on the board, or the Classroom quiz: the three scripts, the sign for m, what a cartouche is, gods first, a determinative.",
      },
      {
        min: 15,
        title: "End-of-unit quiz",
        body: "Pupils complete the quiz alone, with the alphabet chart allowed for section B. 20 marks. The answer key is at the back of this pack.",
        say: ["Use your chart for section B. Read each question twice."],
      },
      {
        min: 22,
        title: "Creative task: the scribe's tablet (Worksheet 5)",
        body: "Pupils make a stela for themselves: their name in a cartouche, a title using a real Egyptian word from the unit (nefer 'good', sesh 'scribe'), one word with a determinative, and a museum label explaining it all. Use the checklist; the rubric is with the answers.",
        say: ["Imagine a museum visitor in 3,000 years. What would they need to know to read your tablet?"],
      },
      {
        min: 8,
        title: "Plenary: gallery walk",
        body: "Tablets on desks; pupils walk round and read each other's names. Finish on the big question: why does it matter that we can read hieroglyphs again?",
      },
    ],
    support: [
      "Read the quiz questions aloud for pupils who need it; the marks are for knowledge, not reading speed.",
      "Give a tablet frame with the cartouche already drawn and a word bank for the label.",
    ],
    stretch: [
      "Add the title 'Son of Ra' or 'Daughter of Ra' in English above the cartouche and explain why pharaohs used it.",
      "Write the label in two scripts: your own hieroglyphs and English, like a modern Rosetta Stone.",
    ],
    exitTicket: "One thing I learned in this unit that I will remember in a year's time is...",
    worksheet: [
      { k: "p", text: "Name: ______________________    Class: __________    Date: __________" },
      { k: "h", text: "Worksheet 5: your scribe's tablet" },
      { k: "p", text: "A stela was a carved stone slab with a name, a title and a message, made to last for ever. Plan yours in the box, then make your best copy on card or clay." },
      { k: "cartouche", caption: "1. Your name in a cartouche" },
      { k: "p", text: "2. A title for yourself, using a real Egyptian word: 𓄤 nefer, 'good' or 'beautiful';  𓋴𓈙𓀀 sesh, 'scribe';  𓋹 ankh, 'living'." },
      { k: "lines", n: 2 },
      { k: "p", text: "3. One word with a determinative (from Lesson 4, or one you invent):" },
      { k: "lines", n: 2 },
      { k: "p", text: "4. Your museum label: explain to a visitor what your tablet says and how to read it." },
      { k: "lines", n: 5 },
      {
        k: "box",
        title: "Checklist",
        text: "[  ] My name is in a cartouche, one sign per sound.   [  ] I used a real Egyptian word.   [  ] I used a determinative.   [  ] My label explains how to read it.   [  ] My signs face the start of the line.",
      },
    ],
    answers: [
      { k: "h", text: "Worksheet 5: rubric for the scribe's tablet" },
      {
        k: "table",
        head: ["", "Working towards", "Expected", "Greater depth"],
        rows: [
          ["Signs", "Some signs match sounds", "Every sound has the right sign; rules followed", "Rules followed, and pupil explains choices (C/K, L/R, doubles)"],
          ["Words", "Copies a word", "Uses a real word and a determinative", "Invents a fitting determinative and explains it"],
          ["Label", "Names what is on the tablet", "Explains how to read it", "Links it to how Champollion read names"],
        ],
        widths: [0.16, 0.28, 0.28, 0.28],
        rowHeight: 40,
      },
    ],
  },
];

/* ── The end-of-unit quiz (20 marks) ─────────────────────────────────── */

export const QUIZ_A = [
  { q: "The word 'hieroglyph' comes from Greek. What does it mean?", options: ["sacred carving", "picture book", "king's letters"], answer: 0 },
  { q: "Where is the Rosetta Stone today?", options: ["the Egyptian Museum, Cairo", "the British Museum, London", "the Louvre, Paris"], answer: 1 },
  { q: "Which three scripts are on the Rosetta Stone?", options: ["hieroglyphs, Latin, Greek", "demotic, Arabic, Latin", "hieroglyphs, demotic, Greek"], answer: 2 },
  { q: "Who cracked the code of hieroglyphs in 1822?", options: ["Napoleon", "Jean-François Champollion", "Howard Carter"], answer: 1 },
  { q: "Which sign is the sound m?", options: ["𓈖", "𓂋", "𓅓"], answer: 2 },
  { q: "What is a cartouche?", options: ["a pharaoh's crown", "an oval rope loop round a royal name", "a scribe's pen"], answer: 1 },
  { q: "In Tutankhamun's cartouche, why is Amun written first?", options: ["out of respect for the god", "because it is said first", "the scribe made a mistake"], answer: 0 },
  { q: "What is a determinative?", options: ["a vowel sign", "a number", "a silent sign showing what kind of word it is"], answer: 2 },
] as const;

export const QUIZ_B = [
  { glyphs: "𓅓𓅱𓈗", answer: "m-w (moo): water. 1 mark for the sounds, 1 for the meaning (the three ripples)." },
  { glyphs: "𓊪𓏏𓇯", answer: "p-t (pet): sky. 1 mark for the sounds, 1 for the meaning (the sky sign)." },
] as const;

/** Section B's name to write: the translator's own spelling, so the key matches the site. */
export const QUIZ_WRITE_NAME = "Sam";

export const QUIZ_C = [
  {
    q: "Explain why the Rosetta Stone helped scholars to read hieroglyphs. (2 marks)",
    answer: "1 mark: the same text is written in hieroglyphs and in Greek. 1 mark: scholars could read Greek, so they could compare the two (for example, match the names in cartouches).",
  },
  {
    q: "Egyptian wrote no vowels. Give one problem this causes, and one way scribes helped readers. (2 marks)",
    answer: "1 mark: different words look the same (e.g. 'bt' could be bat, bet, boat). 1 mark: determinatives, silent signs that show what kind of word it is (also accept: readers knew the language).",
  },
  {
    q: "Why did pharaohs want their names carved on monuments? (2 marks)",
    answer: "1 mark: a name was part of a person; while it survived, they lived on. 1 mark: to show who built or owned the monument, or to be remembered for ever. Accept 'enemies chiselled names off to destroy them'.",
  },
] as const;

export const QUIZ_MARKS = QUIZ_A.length + QUIZ_B.length * 2 + 2 + QUIZ_C.length * 2;

/* ── Licence and contents lines ──────────────────────────────────────── */

export const LICENCE_LINE =
  "One purchase covers one teacher and their own classes, year after year. Please do not post the PDF on a public website; colleagues can buy their own copy, or ask about a school price at learnhieroglyphics.com/contact.";

export const UNIT_CONTENTS = [
  "5 lesson plans, about 50 minutes each, with timings, teacher script prompts and differentiation",
  "Curriculum links: England KS2 history and US grade 6 (C3 Framework, Common Core literacy)",
  "6 pupil worksheets, including the 25-sign alphabet chart",
  "End-of-unit quiz (20 marks) and a creative assessment task with a rubric",
  "Full answer key",
  "Which free Learn Hieroglyphics tool to use in each lesson",
] as const;
