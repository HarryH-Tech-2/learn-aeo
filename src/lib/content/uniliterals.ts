/**
 * Lesson 1 — the complete set of uniliteral ("alphabet") signs.
 *
 * 24 sounds, 25 signs (the double reed y is usually listed with ꞽ). Every
 * code point is the Unicode character for the Gardiner sign named in the
 * comment. Examples use attested spellings; where a word is more often
 * written with a different sign we say so.
 */
import type { GlyphGroup } from "@/lib/lessons";

const G = (s: string) => s; // readability marker for glyph strings

export const UNILITERAL_GROUPS: GlyphGroup[] = [
  // ─── Group 1: the first eight (mostly birds, body parts, things) ───
  {
    contextImage: "/lessons/expedition-begins/group-1.webp",
    glyphs: [
      {
        symbol: G("𓄿"), // G1
        transliteration: "ꜣ (aleph)",
        meaning: "Egyptian vulture: the glottal stop",
        pronunciation: "ah",
        origin: "A standing Egyptian vulture, the commonest large bird of the Nile valley; the bird’s name began with this sound.",
        history: "One of the oldest hieroglyphs in continuous use, appearing in the Pyramid Texts of Unas (c. 2350 BCE). It remained unchanged for over three millennia of Egyptian writing.",
        culture: "The vulture was sacred to Nekhbet of Upper Egypt and to Mut at Thebes. Modern readers say ‘a’ for it: Egyptologists simply needed a vowel to pronounce the consonant skeleton.",
        examples: ["𓄿𓊪𓂧𓅬 · ꜣpd (bird)", "𓋴𓃀𓄿𓇼 · sbꜣ (star)"],
      },
      {
        symbol: G("𓇋"), // M17
        transliteration: "ꞽ (yod)",
        meaning: "Reed leaf: a weak consonant, read ‘i’",
        pronunciation: "ee",
        origin: "A single flowering reed, the plant that grew everywhere along the river.",
        history: "Depicted on the earliest monuments, including the Narmer Palette (c. 3100 BCE). The single reed became one of the most frequently written signs in all periods.",
        culture: "Reeds grew everywhere along the river. The heraldic plant of the south in royal titles was a different one, the sedge 𓇓, as in nswt-bꞽty ‘King of Upper and Lower Egypt’.",
        examples: ["𓇋𓏏𓆑𓀀 · ꞽt (father)", "𓇋𓏠𓈖 · ꞽmn (Amun, the hidden god)"],
      },
      {
        symbol: G("𓇌"), // M17A
        transliteration: "y",
        meaning: "Two reed leaves: the sound y",
        pronunciation: "y / ee",
        origin: "Two reeds side by side: the reed sign doubled.",
        history: "The double reed is mainly a Middle Kingdom and later spelling; earlier texts often wrote y with two strokes 𓏭 instead.",
        culture: "It ends many words in -y and is common in pronouns; the Egyptians wrote grammar with the same little signs they used for sounds.",
        examples: ["𓎡𓇌 · ky (another)", "𓋴𓇌 · sy (she, it)"],
      },
      {
        symbol: G("𓂝"), // D36
        transliteration: "ꜥ (ayin)",
        meaning: "Forearm: a deep throat sound",
        pronunciation: "ah (guttural)",
        origin: "A forearm with the palm up, seen from the side, one of dozens of arm signs, each with its own value.",
        history: "Found in the earliest hieratic papyri from the Old Kingdom. The arm with open palm was a standard sign throughout all periods.",
        culture: "Arms and hands were among the most common body-part hieroglyphs. Different arm positions (bent, outstretched, holding a stick) represent distinct sounds and ideas.",
        examples: ["𓂝𓄿 · ꜥꜣ (great, large)", "𓂝𓈖𓐍 · ꜥnḫ (to live), spelled out sign by sign; usually written with the ankh 𓋹"],
      },
      {
        symbol: G("𓅱"), // G43
        transliteration: "w",
        meaning: "Quail chick: w, also ‘oo’",
        pronunciation: "oo / w",
        origin: "A quail chick; migrating quail arrived in Egypt each autumn in enormous flocks.",
        history: "The quail chick appears in texts from the earliest dynasties and in every period after. A curly-tailed shorthand 𓏲 was used in fast writing.",
        culture: "Quail were hunted with throw-nets and eaten everywhere. Despite its humble status the chick is essential to the script; it also marks plurals (-w).",
        examples: ["𓅱𓂝𓃀 · wꜥb (pure; a priest)", "𓅱𓄿𓆓 · wꜣḏ (green, fresh)"],
      },
      {
        symbol: G("𓃀"), // D58
        transliteration: "b",
        meaning: "Foot and lower leg: b",
        pronunciation: "b as in boy",
        origin: "A human lower leg and foot in profile.",
        history: "Attested from the very beginning of hieroglyphic writing and consistent in form across all periods.",
        culture: "In Egyptian art both feet were shown from the same side, a convention that carried into the script.",
        examples: ["𓃀𓄿𓎡𓀀 · bꜣk (servant)", "𓃀𓇋𓏏𓆤 · bꞽt (bee; honey)"],
      },
      {
        symbol: G("𓊪"), // Q3
        transliteration: "p",
        meaning: "Reed mat or stool: p",
        pronunciation: "p as in pen",
        origin: "A woven reed mat (or low stool) seen from above.",
        history: "Depicts a reed mat used in daily life; it appears unchanged from the Old Kingdom to the Ptolemies.",
        culture: "Mats and stools furnished even modest homes. The simple square was among the first signs apprentice scribes practised.",
        examples: ["𓊪𓏏 · pt (sky)", "𓊪𓏏𓎛 · ptḥ (Ptah, creator god of Memphis)"],
      },
      {
        symbol: G("𓆑"), // I9
        transliteration: "f",
        meaning: "Horned viper: f",
        pronunciation: "f as in fish",
        origin: "The horned viper of the desert, with its two little horns.",
        history: "A uniliteral from the Old Kingdom onward. The viper also serves as the suffix pronoun ‘he / his / him’, so it is everywhere in texts.",
        culture: "Dangerous and feared: in some Old and Middle Kingdom burial texts the snake was drawn cut in two or without a tail so it could not harm the dead.",
        examples: ["𓉐𓆑 · pr.f (his house)", "𓋴𓆑𓇳 · sf (yesterday)"],
      },
    ],
  },

  // ─── Group 2: the middle eight ───
  {
    contextImage: "/lessons/expedition-begins/group-2.webp",
    glyphs: [
      {
        symbol: G("𓅓"), // G17
        transliteration: "m",
        meaning: "Owl: m",
        pronunciation: "m as in mother",
        origin: "An owl, the only bird sign drawn with its face turned towards you.",
        history: "The owl is the single most common hieroglyph in the writing system, appearing on monuments, papyri and ostraca of every period.",
        culture: "Unlike in many cultures the owl carried no ill omen for Egyptians; it was chosen purely for its sound. It writes the preposition m ‘in, from, with’.",
        examples: ["𓅓𓄿𓂝𓏏 · mꜣꜥt (Maat: truth, order)", "𓅓𓇋𓅱 · mꞽw (cat)"],
      },
      {
        symbol: G("𓈖"), // N35
        transliteration: "n",
        meaning: "Ripple of water: n",
        pronunciation: "n as in name",
        origin: "A zigzag ripple on the surface of water.",
        history: "One of the oldest signs, found on pre-dynastic pottery before the formal script existed.",
        culture: "Water was the lifeblood of Egypt. The ripple writes the preposition n ‘to, for’ and the genitive ‘of’, so you will read it constantly.",
        examples: ["𓈖𓆓𓋴 · nḏs (small; a commoner)", "𓈖𓇋𓅱𓏏𓊖 · nꞽwt (town)"],
      },
      {
        symbol: G("𓂋"), // D21
        transliteration: "r",
        meaning: "Mouth: r",
        pronunciation: "r (lightly rolled)",
        origin: "A human mouth seen from the front.",
        history: "Attested from the earliest texts. Besides its sound it writes the word r ‘mouth’ and the preposition ‘to, towards’.",
        culture: "Placed over a numeral, the mouth sign turns it into a fraction: ‘r-10’ is one tenth. Scribes thought of fractions as ‘parts’.",
        examples: ["𓂋𓈖 · rn (name)", "𓂋𓂝𓇳 · rꜥ (Ra, the sun)"],
      },
      {
        symbol: G("𓉔"), // O4
        transliteration: "h",
        meaning: "Reed shelter: h",
        pronunciation: "h as in hat",
        origin: "The ground plan of a reed shelter or courtyard enclosure.",
        history: "Used throughout Egyptian history for the plain h sound, distinct from the emphatic ḥ.",
        culture: "Two different h sounds, two different signs: the reed shelter for the light breath, the twisted wick for the throatier one.",
        examples: ["𓉔𓄿𓇋𓂻 · hꜣꞽ (to descend)", "𓉔𓂋𓅱𓇳 · hrw (day)"],
      },
      {
        symbol: G("𓎛"), // V28
        transliteration: "ḥ",
        meaning: "Twisted wick: emphatic h",
        pronunciation: "h (breathy, from the throat)",
        origin: "A twisted wick of flax, as used in an oil lamp.",
        history: "The wick writes the pharyngeal ḥ, a sound English lacks. It begins ḥtp ‘offering, peace’, the first word of the offering formula.",
        culture: "Oil lamps with flax wicks lit every Egyptian house and tomb; the sign was an everyday object to the scribe.",
        examples: ["𓎛𓏏𓊪 · ḥtp (offering, peace), also written with the offering-slab 𓊵", "𓎛𓈖𓈎𓏏𓏊 · ḥnqt (beer)"],
      },
      {
        symbol: G("𓐍"), // Aa1
        transliteration: "ḫ",
        meaning: "Placenta or sieve: kh",
        pronunciation: "kh as in Scottish loch",
        origin: "A round object with a hatched surface; scholars still argue whether it is a placenta or a sieve.",
        history: "Found in all periods for the harsh ḫ sound, like the ch in ‘loch’ or ‘Bach’.",
        culture: "It is the last sound of ꜥnḫ ‘life’ and begins ḫpr ‘to become’, two of the most important words in Egyptian thought.",
        examples: ["𓐍𓏏 · ḫt (thing; wood)", "𓐍𓆑𓏏 · ḫft (in front of; according to)"],
      },
      {
        symbol: G("𓄡"), // F32
        transliteration: "ẖ",
        meaning: "Animal belly with teats: softer kh",
        pronunciation: "kh (softer, further forward)",
        origin: "The belly of an animal with its teats and tail.",
        history: "Distinct from ḫ in the Old and Middle Kingdoms; later the two sounds merged in some words.",
        culture: "Body parts of cattle gave the scribes many signs: the belly, the hide, the heart, the horns.",
        examples: ["𓄡𓂋𓂧𓀔 · ẖrd (child)", "𓄡𓏏 · ẖt (belly, body)"],
      },
      {
        symbol: G("𓋴"), // S29
        transliteration: "s",
        meaning: "Folded cloth: s",
        pronunciation: "s as in sun",
        origin: "A piece of folded linen.",
        history: "Very common in every period; it writes the causative prefix s- (‘to cause to’) and the suffix ‘she, her’.",
        culture: "Linen was Egypt’s great textile: wealth was measured in bolts of cloth, and the dead were wrapped in it.",
        examples: ["𓋴𓈙𓀀 · sš (scribe)", "𓋴𓃀𓄿𓇼 · sbꜣ (star)"],
      },
    ],
  },

  // ─── Group 3: the last nine ───
  {
    contextImage: "/lessons/expedition-begins/group-3.webp",
    glyphs: [
      {
        symbol: G("𓊃"), // O34
        transliteration: "z",
        meaning: "Door bolt: z, an older s",
        pronunciation: "z / s",
        origin: "A horizontal door bolt.",
        history: "In the Old Kingdom z and s were different sounds; by the Middle Kingdom they had merged and the two signs became interchangeable.",
        culture: "Scribes kept using both, so many words have two spellings: one with the bolt, one with the cloth.",
        examples: ["𓊃𓄿 · zꜣ (son), also written 𓅭", "𓊃𓏏𓁐 · zt (woman)"],
      },
      {
        symbol: G("𓈙"), // N37
        transliteration: "š",
        meaning: "Pool: sh",
        pronunciation: "sh as in ship",
        origin: "A rectangular garden pool seen from above.",
        history: "Used for š in all periods; it also writes the word š ‘pool, lake’.",
        culture: "Walled gardens with a central pool were the dream of every well-off Egyptian; tomb paintings show them in loving detail.",
        examples: ["𓈙𓂝𓈒 · šꜥ (sand)", "𓈙𓅓𓂻 · šm (to go), more often written 𓈝𓅓𓂻"],
      },
      {
        symbol: G("𓈎"), // N29
        transliteration: "q",
        meaning: "Hill-slope: q",
        pronunciation: "k (further back in the throat)",
        origin: "The slope of a hill or a sandy bank.",
        history: "A uniliteral throughout; distinct from k, as in Arabic qaf versus kaf.",
        culture: "It begins qd ‘to build’; the word for a builder, qd, shows a man shaping a wall.",
        examples: ["𓈎𓂧𓀨 · qd (to build)", "𓈎𓈖𓂡 · qn (brave, strong)"],
      },
      {
        symbol: G("𓎡"), // V31
        transliteration: "k",
        meaning: "Basket with handle: k",
        pronunciation: "k as in kite",
        origin: "A wicker basket with a handle, seen from the side.",
        history: "Common in every period; the suffix pronoun ‘you, your’ (masculine) is written with it.",
        culture: "Baskets carried grain, bread and earth on every building site; the scribes tallied the baskets, and the basket wrote ‘your’.",
        examples: ["𓎡𓏏 · kt (another, feminine)", "𓎡𓇌 · ky (another, masculine)"],
      },
      {
        symbol: G("𓎼"), // W11
        transliteration: "g",
        meaning: "Jar-stand: g",
        pronunciation: "g as in go",
        origin: "A ring stand that held a round-bottomed jar upright.",
        history: "Used for hard g from the Old Kingdom on.",
        culture: "Egyptian pottery was round-bottomed, so every house had stands like this; the scribe reached for the everyday object.",
        examples: ["𓎼𓅓 · gm (to find), usually with the ibis 𓅠", "𓎼𓂋𓎛𓇰 · grḥ (night)"],
      },
      {
        symbol: G("𓏏"), // X1
        transliteration: "t",
        meaning: "Bread loaf: t",
        pronunciation: "t as in top",
        origin: "A small round loaf of bread.",
        history: "Among the most frequent signs: it marks feminine nouns (-t) and appears in countless words.",
        culture: "Bread and beer were the basis of every meal and every wage. The little loaf is the feminine ending: snt ‘sister’ beside sn ‘brother’.",
        examples: ["𓋴𓈖𓏏𓁐 · snt (sister)", "𓏏𓄿𓇾 · tꜣ (land)"],
      },
      {
        symbol: G("𓍿"), // V13
        transliteration: "ṯ",
        meaning: "Tethering rope: tj",
        pronunciation: "ch as in church",
        origin: "A rope used to hobble or tether animals.",
        history: "A sound close to ‘ch’; in later Egyptian it often softened to plain t, and some words were re-spelled.",
        culture: "Herdsmen’s equipment (ropes, hobbles, crooks) supplied several signs to the script.",
        examples: ["𓍿𓄿𓇋𓀀 · ṯꜣꞽ (man, male)", "𓍿𓊃 · ṯz (to tie; a knot, a vertebra)"],
      },
      {
        symbol: G("𓂧"), // D46
        transliteration: "d",
        meaning: "Hand: d",
        pronunciation: "d as in dog",
        origin: "An open hand seen from the side.",
        history: "A standard uniliteral in every period; it writes the verb ‘to give’ (dꞽ) in its alphabetic spelling.",
        culture: "The hand appears in many signs: holding bread, holding a stick, giving, receiving. The plain hand is the sound d.",
        examples: ["𓂧𓊪𓏏𓊛 · dpt (boat)", "𓂧𓇋 · dꞽ (to give), also written 𓂞"],
      },
      {
        symbol: G("𓆓"), // I10
        transliteration: "ḏ",
        meaning: "Cobra: dj",
        pronunciation: "j as in judge",
        origin: "A cobra at rest, seen from the side.",
        history: "Writes the sound ḏ in all periods; in later Egyptian it often softened to d.",
        culture: "The cobra was Wadjet, protector of the king. As a sound-sign it begins ḏd ‘to say’ and ḏt ‘eternity’.",
        examples: ["𓆓𓂧 · ḏd (to say)", "𓆓𓏏𓇾 · ḏt (eternity)"],
      },
    ],
  },
];
