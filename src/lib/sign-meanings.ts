/**
 * "What does 𓂀 mean?" pages: one page per famous sign at /hieroglyph-meaning/[slug], plus the hub at
 * /hieroglyph-meaning. They catch people who paste the hieroglyph itself into Google ("𓂀 meaning"),
 * which until now landed on a five-sign blog post that never answered the one sign they asked about.
 *
 * The ankh has no page here on purpose: "𓋹 meaning" already ranks on /blog/what-does-the-ankh-symbol-mean,
 * so the hub and the related-signs strip link to that post instead (ANKH_POST).
 *
 * Code points were checked against the Unicode character names (python unicodedata: U+13080 is
 * EGYPTIAN HIEROGLYPH D010, U+131A3 L001, U+132BD R011), and the test in
 * src/lib/__tests__/sign-meanings.test.ts holds them to that.
 *
 * Text markup, kept deliberately small (rendered by src/app/hieroglyph-meaning/inline.tsx):
 * [text](/path) for a link, *text* for italics (transliterations), **text** for bold.
 */

export type SignSection = {
  heading: string;
  paragraphs: string[];
};

export type SignFaq = { q: string; a: string };

export type SignMeaning = {
  slug: string;
  glyph: string;
  /** "U+13080" */
  codePoint: string;
  /** Gardiner sign-list number, e.g. "D10" */
  gardiner: string;
  /** what Gardiner's list calls the picture */
  gardinerDescription: string;
  /** the everyday English name */
  name: string;
  /** other names people search for */
  otherNames: string[];
  /** Egyptological transliteration, e.g. wḏꜣt */
  transliteration: string;
  /** conventional pronunciation, e.g. "wedjat" */
  say: string;
  /** one line on how the sign worked in writing */
  reading: string;
  /** <title> — starts with the glyph */
  metaTitle: string;
  /** meta description: answers the question in one line */
  metaDescription: string;
  /** H1 text after the glyph */
  h1: string;
  /** 2–3 quotable sentences that answer "what does it mean?" */
  quickAnswer: string;
  sections: SignSection[];
  faqs: SignFaq[];
  /** one line under the sign on the hub page */
  hubBlurb: string;
};

export const PUBLISHED = "2026-10-16";
export const HUB_PATH = "/hieroglyph-meaning";
export const ANKH_POST = {
  glyph: "𓋹",
  name: "Ankh",
  href: "/blog/what-does-the-ankh-symbol-mean",
  blurb: "Life: the sign gods hold to the pharaoh's nose.",
  codePoint: "U+132F9",
  gardiner: "S34",
};

export const SIGN_MEANINGS: SignMeaning[] = [
  {
    slug: "eye-of-horus",
    glyph: "𓂀",
    codePoint: "U+13080",
    gardiner: "D10",
    gardinerDescription: "human eye with the markings of a falcon",
    name: "Eye of Horus",
    otherNames: ["wedjat", "udjat", "wadjet eye"],
    transliteration: "wḏꜣt",
    say: "wedjat",
    reading: "A word-sign for wḏꜣt, \"the sound (whole) eye\"; the same picture also served as a protective emblem in its own right.",
    metaTitle: "𓂀 Eye of Horus Meaning: The Wedjat Symbol Explained",
    metaDescription:
      "𓂀 is the Eye of Horus, or wedjat: the ancient Egyptian sign of protection and healing, from the myth of Horus's eye torn out by Seth and made whole again.",
    h1: "Eye of Horus meaning: the wedjat",
    quickAnswer:
      "𓂀 is the Eye of Horus, which the Egyptians called the wedjat (wḏꜣt), \"the sound one\" or \"the one made whole\". It stands for protection, healing and restoration, because in myth the falcon god Horus had his eye damaged by Seth and then made whole again. It was one of the most popular amulets in ancient Egypt, worn by the living and placed with the dead.",
    sections: [
      {
        heading: "What does 𓂀 depict?",
        paragraphs: [
          "A human eye and eyebrow with two markings underneath: a straight stripe hanging down and a curl that sweeps back. Those markings are the dark cheek patches of a falcon, the bird of Horus, so the sign is both a person's eye and a falcon's at once. In Gardiner's sign list it is D10, in the section for parts of the human body.",
          "Its Egyptian name, *wḏꜣt*, comes from the verb *wḏꜣ*, \"to be whole, sound, unharmed\". It is the same root as *wḏꜣ* in the blessing *ꜥnḫ wḏꜣ snb*, \"life, prosperity, health\", that follows a king's name.",
        ],
      },
      {
        heading: "What did the Eye of Horus mean?",
        paragraphs: [
          "The meaning comes from the struggle between Horus and his uncle Seth for the throne of Osiris, whom Seth had murdered. In the fighting Seth damages or tears out Horus's eye. In most versions the god Thoth heals it; in the New Kingdom story known as *The Contendings of Horus and Seth* it is Hathor who restores it, with gazelle milk. Either way, the eye that was broken is made whole, and that is what *wedjat* means.",
          "So the sign stands for **protection, healing and things restored to their proper state**. Horus then offers his restored eye to his dead father Osiris, and in the Pyramid Texts \"the Eye of Horus\" becomes a name for any offering presented to the dead. Many Egyptologists also link the injured and healed eye with the moon, which wanes and returns each month, though the texts are not consistent about which eye is which.",
          "You will often read that the parts of the eye were the signs for the fractions 1/2 to 1/64, adding up to 63/64. That idea goes back to Georg Möller in 1911, but later study of the hieratic fraction signs has undermined it, and most specialists now treat it as a modern story rather than an ancient one.",
        ],
      },
      {
        heading: "Where do you see the Eye of Horus?",
        paragraphs: [
          "**Amulets.** Wedjat amulets in faience, stone and gold are among the most common amulets ever found in Egypt, made for well over two thousand years. They were worn in life and wrapped into mummy bandages.",
          "**Coffins and tombs.** Middle Kingdom coffins often have a pair of eyes painted on the side by the head, so the dead person, lying on their side, could look out at the rising sun and the offerings brought to them.",
          "**Jewellery and tattoos today.** It is one of the most popular Egyptian designs for necklaces, rings and tattoos. There is no official Eye of Horus emoji, so people paste the Unicode sign 𓂀 instead, which is why so many people end up searching for it.",
        ],
      },
      {
        heading: "Eye of Horus or Eye of Ra?",
        paragraphs: [
          "The two are easy to mix up because Egyptian art often draws them the same way. The **Eye of Horus** is about healing and wholeness. The **Eye of Ra** is the sun god's eye as a fierce, often female, power that goes out into the world and punishes his enemies, personified by goddesses such as Sekhmet, Hathor and the cobra Wadjet. Some modern writers say the right eye is Ra's and the left is Horus's; that is a useful rule of thumb, but the ancient sources do not keep to it, and the difference shows up more in the texts than in the pictures.",
          "Two more look-alikes: the goddess **Wadjet** (*wꜣḏyt*) sounds like *wedjat* but is a different word; and the blue-and-white **nazar** bead 🧿 against the evil eye comes from Turkey and the eastern Mediterranean, not from Egypt.",
        ],
      },
    ],
    faqs: [
      {
        q: "What does 𓂀 mean?",
        a: "𓂀 is the Eye of Horus, the ancient Egyptian wedjat (wḏꜣt), meaning \"the sound one\" or \"the one made whole\". It stands for protection, healing and restoration, from the myth in which Horus's eye was damaged by Seth and made whole again by Thoth (or, in one version, Hathor). It was worn as an amulet by the living and placed with the dead.",
      },
      {
        q: "Is the Eye of Horus good or evil?",
        a: "Good. In ancient Egypt it was a protective and healing sign, worn for safety and good health and buried with the dead to keep them whole. The idea that it is sinister comes from modern conspiracy theories and films, not from Egyptian sources.",
      },
      {
        q: "Is the Eye of Horus the left or right eye?",
        a: "Usually described as the left eye, linked with the moon, while the right eye is linked with the sun and Ra. The ancient texts are not consistent about this, though, and wedjat amulets were made facing both ways, so either is authentic.",
      },
      {
        q: "How do I copy and paste the Eye of Horus symbol?",
        a: "Press Copy on this page, or copy this character: 𓂀. It is Unicode U+13080, EGYPTIAN HIEROGLYPH D010, so it pastes as text into messages and documents. If it shows as a box, the device lacks a hieroglyph font; Noto Sans Egyptian Hieroglyphs is free.",
      },
    ],
    hubBlurb: "Protection and healing: the eye Seth damaged and Thoth made whole.",
  },
  {
    slug: "scarab",
    glyph: "𓆣",
    codePoint: "U+131A3",
    gardiner: "L1",
    gardinerDescription: "dung beetle",
    name: "Scarab",
    otherNames: ["kheper", "khepri", "scarab beetle"],
    transliteration: "ḫpr",
    say: "kheper",
    reading: "A three-consonant sign spelling ḫ-p-r, the verb \"to come into being, to become\", and the name of the god Khepri.",
    metaTitle: "𓆣 Scarab Meaning: The Egyptian Beetle Hieroglyph Kheper",
    metaDescription:
      "𓆣 is the scarab beetle, the hieroglyph kheper (ḫpr): \"to come into being\" or \"to transform\". Why a dung beetle meant the rising sun, and what heart scarabs did.",
    h1: "Scarab meaning: the beetle that means \"to become\"",
    quickAnswer:
      "𓆣 is the scarab beetle, the hieroglyph that spells ḫpr (kheper), the Egyptian verb \"to come into being\", \"to become\" or \"to transform\". The Egyptians linked the dung beetle rolling its ball with the sun rolled across the sky, so the scarab was also Khepri, the god of the sun at dawn. It became a symbol of creation, renewal and new life, and the most common amulet and seal in Egypt.",
    sections: [
      {
        heading: "What does 𓆣 depict?",
        paragraphs: [
          "A dung beetle seen from above: the broad head with its toothed edge, the body and wing cases, and the legs. The species is usually identified as the sacred scarab, *Scarabaeus sacer*, which still lives in Egypt. It is L1, the first sign in Gardiner's section for invertebrates.",
          "In writing it is a **triliteral**: one sign standing for three consonants, *ḫ-p-r*. It writes the verb *ḫpr* \"to come into being, become, happen\", the noun *ḫprw* \"forms, transformations\", and the name of the god *Ḫprj*, Khepri.",
        ],
      },
      {
        heading: "What did the scarab mean?",
        paragraphs: [
          "The beetle rolls a ball of dung far larger than itself and buries it, and its young later dig their way out of the ground. The Egyptians saw the sun in this: a great ball pushed across the sky each day by an unseen force, and new life appearing, apparently by itself, out of the earth. Whether they truly thought beetles had no mothers is debated, but the image of **self-creation** is everywhere in their texts.",
          "So the scarab is Khepri, the sun at sunrise: Ra in the morning, newly born. The meaning widened from there to **coming into being, transformation and renewal**, including the renewal the dead hoped for. Kings used it in their names: Tutankhamun's throne name, Nebkheperure, means \"lord of the manifestations of Ra\", and Thutmose III's, Menkheperre, \"the manifestation of Ra endures\".",
        ],
      },
      {
        heading: "Where do you see the scarab?",
        paragraphs: [
          "**Scarab seals and amulets.** From the end of the Old Kingdom, a little before 2000 BCE, small stone and faience scarabs with a flat base were made in their hundreds of thousands. The underside carried a name, a title, a good-luck design or a king's name, and they were stamped into clay as seals or worn as charms. Amenhotep III even issued large \"commemorative scarabs\" announcing his marriage to Queen Tiye and his lion hunts.",
          "**Heart scarabs.** A larger scarab, usually of dark green stone, was laid on the chest of a mummy. Its base carried a version of Spell 30B of the [Book of the Dead](/blog/the-book-of-the-dead-a-readers-guide), asking the heart not to stand up as a witness against its owner when it was weighed in the judgement.",
          "**Royal jewellery and art.** Winged scarabs pushing the sun disc appear on pectorals (Tutankhamun's tomb has several), on tomb ceilings and over temple doors. Today the scarab is a favourite for rings, pendants and tattoos.",
        ],
      },
      {
        heading: "Scarab or just a beetle?",
        paragraphs: [
          "In jewellery shops \"scarab\" can mean any oval, beetle-backed bead, often a modern souvenir with made-up signs on the base. The ancient scarab is specifically the dung beetle, and real scarab seals have a carved flat underside. A few other beetles do appear in early Egyptian jewellery, such as the click beetle linked with the goddess Neith, but they are not scarabs and do not carry the meaning *ḫpr*.",
          "Two more mix-ups: the winged scarab is not the same as the **winged sun disc** (a sun with falcon wings, the emblem of Horus of Behdet), though the two are often shown together; and the god Khepri, shown with a scarab for a head, is not the same as the scarab amulet, which works on its own.",
        ],
      },
    ],
    faqs: [
      {
        q: "What does 𓆣 mean?",
        a: "𓆣 is the scarab beetle hieroglyph, Gardiner L1. It spells ḫpr (kheper), the Egyptian verb \"to come into being\", \"to become\" or \"to transform\", and stands for Khepri, the god of the rising sun. As an amulet it meant creation, renewal and new life.",
      },
      {
        q: "Why did the Egyptians worship the scarab beetle?",
        a: "They did not worship beetles as such; they saw in the dung beetle an image of the sun god. The beetle rolling its ball suggested the sun rolled across the sky, and young beetles emerging from the ground suggested life creating itself. That made the scarab the form of Khepri, the sun at dawn.",
      },
      {
        q: "What is a heart scarab?",
        a: "A large stone scarab placed on the chest of a mummy, inscribed with Spell 30B of the Book of the Dead. The spell asks the dead person's heart not to testify against them when it is weighed against the feather of Maat in the judgement of the dead.",
      },
      {
        q: "How do I copy and paste the scarab symbol?",
        a: "Press Copy on this page, or copy this character: 𓆣. It is Unicode U+131A3, EGYPTIAN HIEROGLYPH L001, and pastes as text. If it shows as a box, install a hieroglyph font such as the free Noto Sans Egyptian Hieroglyphs.",
      },
    ],
    hubBlurb: "Coming into being: the dung beetle that stood for the rising sun.",
  },
  {
    slug: "djed-pillar",
    glyph: "𓊽",
    codePoint: "U+132BD",
    gardiner: "R11",
    gardinerDescription: "djed pillar",
    name: "Djed pillar",
    otherNames: ["djed", "backbone of Osiris", "tet"],
    transliteration: "ḏd",
    say: "djed",
    reading: "A two-consonant sign spelling ḏ-d, used for the word ḏd \"stable, enduring\" and in the name of Osiris's town Djedu (Busiris).",
    metaTitle: "𓊽 Djed Pillar Meaning: The Egyptian Symbol of Stability",
    metaDescription:
      "𓊽 is the djed pillar, the Egyptian hieroglyph for \"stability\" (ḏd). Why it became the backbone of Osiris, what the Raising of the Djed was, and djed vs ankh.",
    h1: "Djed pillar meaning: the sign of stability",
    quickAnswer:
      "𓊽 is the djed pillar, the ancient Egyptian hieroglyph for ḏd, \"stable\" or \"enduring\". From at least the New Kingdom it was identified with the backbone of the god Osiris, so it also stood for his resurrection and for lasting life after death. Kings were wished \"life, stability and dominion\", written with the ankh, the djed and the was sceptre.",
    sections: [
      {
        heading: "What does 𓊽 depict?",
        paragraphs: [
          "A pillar with a broad base and four horizontal bars stacked near the top. Nobody is sure what object it started as. Suggestions include a pole with its branches lopped off, a sheaf of grain or bundle of reeds tied at the top, or a stylised tree, and it may have been a fertility or harvest emblem before it was anything else. It is one of the oldest Egyptian symbols, found from the early dynasties onwards.",
          "In Gardiner's list it is R11, among the temple furniture and sacred emblems. In writing it is a **biliteral** sign, spelling the two consonants *ḏ-d*, in words such as *ḏd* \"stable, enduring\" and *ḏdt* \"stability\", and in *Ḏdw*, Djedu (Greek Busiris), the Delta town that was a centre of the cult of Osiris.",
        ],
      },
      {
        heading: "What did the djed mean?",
        paragraphs: [
          "At heart it means **stability and permanence**: something that stands upright and stays standing. That is why it sits in the royal blessing *dj ꜥnḫ ḏd wꜣs*, \"given life, stability and dominion\", written 𓋹𓊽𓌀, one of the most repeated phrases in Egyptian inscriptions.",
          "Early on the djed belonged to the gods of Memphis: Ptah is called \"the noble djed\", and it was linked with the falcon god Sokar. Over time it was drawn into the story of Osiris, killed by Seth and brought back to life, and by the New Kingdom it was read as **Osiris's backbone**. A pillar standing upright meant Osiris standing up again: victory over death, and the hope of the same for every dead person.",
        ],
      },
      {
        heading: "Raising the djed",
        paragraphs: [
          "The ritual of \"raising the djed\" (*sꜥḥꜥ ḏd*) set a large djed upright with ropes. It belonged to the festivals of Osiris and Sokar at the end of the month of Khoiak, and to the king's jubilee. The best-known picture is in the Theban tomb of Kheruef (TT192), where Amenhotep III and Queen Tiye take part, and the temple of Seti I at Abydos shows the king raising one too. Setting the pillar up marked Osiris restored and order (*maat*) re-established.",
        ],
      },
      {
        heading: "Where do you see the djed?",
        paragraphs: [
          "**Amulets.** Djed amulets of faience, stone and gold were placed on mummies; [Book of the Dead](/blog/the-book-of-the-dead-a-readers-guide) Spell 155 is a spell for a golden djed set at the neck of the dead person. **Coffins.** Many later coffins have a djed painted on the floor of the base, right where the mummy's spine lay. **Temples and furniture.** Rows of djeds, often alternating with the tyet knot of Isis 𓎬, decorate friezes, shrines and Tutankhamun's furniture.",
        ],
      },
      {
        heading: "Djed, ankh or was?",
        paragraphs: [
          "These three appear together so often that people mix them up. The [ankh 𓋹](/blog/what-does-the-ankh-symbol-mean) is a cross with a loop on top and means **life**. The **djed** 𓊽 is a pillar with four crossbars and means **stability**. The **was** sceptre 𓌀 is a tall staff with an animal head at the top and a forked foot, and means **dominion** or power. On a temple wall a god will often hold all three combined in one staff.",
          "One modern myth to set aside: the claim that djed pillars in the Dendera temple reliefs show ancient electrical insulators. Egyptologists read those scenes, from the Ptolemaic temple of Hathor, as religious imagery of a lotus, a snake and the djed, with matching texts that say so.",
        ],
      },
    ],
    faqs: [
      {
        q: "What does 𓊽 mean?",
        a: "𓊽 is the djed pillar, Gardiner R11, the Egyptian hieroglyph for ḏd, \"stable\" or \"enduring\". It was identified with the backbone of Osiris, so it also meant his resurrection and lasting life after death. It appears in the royal blessing \"given life, stability and dominion\".",
      },
      {
        q: "Why is the djed called the backbone of Osiris?",
        a: "Its upright shape with stacked bars looks like a spine, and from at least the New Kingdom it was identified with Osiris's backbone. Raising the djed upright stood for Osiris rising again after Seth killed him, which is why djeds were painted on coffin floors under the mummy's spine.",
      },
      {
        q: "What is the difference between the djed and the ankh?",
        a: "The ankh 𓋹, a cross with a loop on top, means \"life\". The djed 𓊽, a pillar with four crossbars, means \"stability\". They often appear side by side with the was sceptre 𓌀 (\"dominion\") in the phrase \"given life, stability and dominion\".",
      },
      {
        q: "How do I copy and paste the djed symbol?",
        a: "Press Copy on this page, or copy this character: 𓊽. It is Unicode U+132BD, EGYPTIAN HIEROGLYPH R011, and pastes as text. If it shows as a box, install a hieroglyph font such as the free Noto Sans Egyptian Hieroglyphs.",
      },
    ],
    hubBlurb: "Stability: the pillar read as the backbone of Osiris.",
  },
];

export function getSignMeaning(slug: string): SignMeaning | undefined {
  return SIGN_MEANINGS.find((s) => s.slug === slug);
}

export function signMeaningPath(slug: string): string {
  return `${HUB_PATH}/${slug}`;
}

/** "U+13080" for a single character. */
export function codePointOf(glyph: string): string {
  const cp = glyph.codePointAt(0) ?? 0;
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

/** The Unicode character name a Gardiner number maps to: "D10" → "EGYPTIAN HIEROGLYPH D010". */
export function unicodeNameFor(gardiner: string): string {
  const m = /^([A-Z]+)(\d+)([A-Z]*)$/.exec(gardiner);
  if (!m) return "";
  return `EGYPTIAN HIEROGLYPH ${m[1]}${m[2].padStart(3, "0")}${m[3]}`;
}
