export type Hieroglyph = {
  symbol: string;
  transliteration: string;
  meaning: string;
  pronunciation: string;
  /** "Why this picture?" — what the sign depicts and why it was chosen */
  origin?: string;
  history: string;
  culture: string;
  examples: string[];
};

export type GlyphGroup = {
  glyphs: Hieroglyph[];
  contextImage: string;
};

export type ExerciseConfig = {
  categories?: { name: string; glyphIndices: number[] }[];
  decodeAvailable: boolean;
  fillInBlanks: FillInBlankConfig[];
};

/** A sentence about the signs it shows, with ___ for each answer; distractors fill out the word bank. */
export type FillInBlankConfig = { inscription: string; answers: string[]; distractors: string[] };

export type Lesson = {
  id: string;
  title: string;
  areaName: string;
  subtitle: string;
  description: string;
  narrativeIntro: string;
  narrativeOutro: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  glyphGroups: GlyphGroup[];
  exerciseConfig: ExerciseConfig;
  sceneImage: string;
  introVideo: string;
  cutsceneVideo?: string;
  isFree: boolean;
  order: number;
  category: string;
};

import { UNILITERAL_GROUPS } from "@/lib/content/uniliterals";

// Helper to get all hieroglyphs from a lesson
export function getLessonGlyphs(lesson: Lesson): Hieroglyph[] {
  return lesson.glyphGroups.flatMap((g) => g.glyphs);
}

export const lessons: Lesson[] = [
  // ─── Lesson 1: The Expedition Begins (was alphabet-of-the-gods) ───
  {
    id: "expedition-begins",
    title: "The Expedition Begins",
    areaName: "Base Camp",
    subtitle: "Uniliteral Signs",
    description:
      "Your expedition into ancient Egyptian writing starts at Base Camp, where you master the foundational uniliteral signs -- single-consonant hieroglyphs that form the backbone of the script. These 24 signs (25 with the double reed) function much like an alphabet, and with them you can already spell names and read real words. They are the tool you will use in every chamber deeper in the ruins.",
    narrativeIntro:
      "The desert sun beats down as your convoy arrives at the excavation site. Tents are pitched beside a sand-swept ridge, and your chief epigrapher hands you a lamp and a worn field notebook. Before venturing into the ruins ahead, you must learn the fundamental signs that ancient scribes used every day.",
    narrativeOutro:
      "With the full set of uniliteral signs now committed to memory, you feel the ancient script beginning to come alive. Your epigrapher nods approvingly and points toward the outer wall of the temple complex. The real exploration is about to begin.",
    difficulty: "beginner",
    // Three sections of about ten minutes (src/lib/content/lesson-sections.ts). Keep "<n> min": it is parsed for schema.org and llms.txt.
    duration: "30 min",
    glyphGroups: UNILITERAL_GROUPS,
    exerciseConfig: {
      decodeAvailable: false,
      fillInBlanks: [
        {
          inscription: "The vulture \u{1313F} writes the sound ___, and the reed leaf \u{131CB} writes the sound ___",
          answers: ["ꜣ (aleph)", "ꞽ (yod)"],
          distractors: ["ꜥ (ayin)", "w"],
        },
      ],
    },
    sceneImage: "/lessons/expedition-begins/scene-door.webp",
    introVideo: "https://laaj85evae9yxbqi.public.blob.vercel-storage.com/expedition-begins-intro.mp4",
    cutsceneVideo: "/videos/cutscene-1.mp4",
    isFree: true,
    order: 1,
    category: "Fundamentals",
  },

  // ─── Lesson 2: The Outer Courtyard (was natures-vocabulary) ───
  {
    id: "outer-courtyard",
    title: "The Outer Courtyard",
    areaName: "The Outer Courtyard",
    subtitle: "Flora & Fauna",
    description:
      "Passing through the temple gates, you enter the Outer Courtyard where carved reliefs of animals and plants line the walls. The ancient Egyptians drew constant inspiration from the natural world -- many animal and plant signs serve double duty as phonetic signs and ideograms.",
    narrativeIntro:
      "Beyond Base Camp, a massive pylon gate frames the entrance to the temple complex. As you step into the Outer Courtyard, sunlight illuminates carved reliefs of lions, owls, scarab beetles, and lotus blossoms. Every surface tells a story of the natural world the Egyptians revered.",
    narrativeOutro:
      "The courtyard's menagerie of signs has revealed how deeply nature was woven into the Egyptian script. Ahead, a narrow corridor leads deeper into the complex -- the Pilgrim's Gallery awaits, where human figures and body parts take centre stage.",
    difficulty: "beginner",
    duration: "20 min",
    glyphGroups: [
      {
        contextImage: "/lessons/outer-courtyard/group-1.webp",
        glyphs: [
          {
            symbol: "\u{13153}",
            transliteration: "m",
            meaning: "Owl \u2014 one of the most common uniliteral signs",
            pronunciation: "m as in mother",
            origin: "An owl, the one bird sign that looks straight at you.",
            history: "Statistical analysis of hieroglyphic texts shows the owl is the single most frequently occurring sign. It appears in virtually every sentence ever written in ancient Egyptian.",
            culture: "The little owl (Athene noctua) was common in Egyptian fields and ruins. Unlike Greek tradition, where the owl symbolised wisdom, Egyptians valued it purely as a phonetic tool \u2014 perhaps the most utilitarian hieroglyph of all.",
            examples: [
              "\u{13153}\u{131CB}\u{13171} \u2014 mjw (cat)",
              "\u{13153}\u{1308B} \u2014 mr (pyramid, love)",
            ],
          },
          {
            symbol: "\u{131A3}",
            transliteration: "\u1E2Bpr",
            meaning: "Scarab beetle \u2014 triliteral sign meaning \u2018to come into being\u2019",
            pronunciation: "kheh-per",
            origin: "A scarab (dung) beetle seen from above. It rolls its ball of dung like the sun across the sky, so it came to mean ‘come into being’.",
            history: "The scarab became central to Egyptian religious symbolism by the Old Kingdom. Thousands of scarab amulets have been excavated from sites spanning three millennia, making them the most common Egyptian artefact worldwide.",
            culture: "Egyptians observed the dung beetle rolling its ball and saw a parallel to the sun god pushing the solar disc across the sky. The god Khepri, depicted as a scarab, represented the rising sun and the concept of self-creation.",
            examples: [
              "\u{131A3}\u{1308B}\u{131CB} \u2014 \u1E2Bprj (Khepri, the morning sun god)",
              "\u{131A3}\u{1308B} \u2014 \u1E2Bpr (to become, to transform)",
            ],
          },
          {
            symbol: "\u{131B8}",
            transliteration: "(det.)",
            meaning: "Lotus flower \u2014 determinative for plants, also symbol of Upper Egypt",
            pronunciation: "silent (determinative)",
            origin: "A blue lotus flower in bloom on its stem, the flower that opens with the sunrise.",
            history: "The blue lotus (Nymphaea caerulea) was among the first plants depicted in Egyptian art, appearing on pre-dynastic pottery. It remained the quintessential floral motif through the Ptolemaic period.",
            culture: "The lotus closes at night and sinks beneath the water, rising and opening again at dawn. Egyptians saw this as a metaphor for rebirth \u2014 in the creation myth, the sun itself first appeared from a giant lotus floating on the primordial waters.",
            examples: [
              "\u{132F4}\u{13219}\u{13216}\u{131B8} \u2014 s\u0161n (lotus)",
              "\u{131B8}\u{133E4} \u2014 the lotus as an ideogram, marked by the single stroke",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/outer-courtyard/group-2.webp",
        glyphs: [
          {
            symbol: "\u{130ED}",
            transliteration: "m\uA723\uA7BD",
            meaning: "Lion \u2014 word-sign and determinative for lion (m\uA723\uA7BD); as a sound sign it writes rw, later l in Greek names",
            pronunciation: "my",
            origin: "A lion lying down, head raised: the pose of the Sphinx.",
            history: "Lions roamed the deserts flanking the Nile Valley in ancient times. By the New Kingdom, royal lion hunts were commemorated on scarabs and temple walls \u2014 Amenhotep III claimed to have killed 102 lions in the first ten years of his reign.",
            culture: "The lion symbolised royal power and ferocity. Paired lions (Aker) guarded the eastern and western horizons where the sun rose and set. The sphinx \u2014 a human-headed lion \u2014 protected sacred spaces, most famously at Giza.",
            examples: [
              "\u{130ED}\u{131CB} \u2014 m3j (lion)",
              "\u{130ED}\u{1309D} \u2014 m3\uA725 (true, justified)",
            ],
          },
          {
            symbol: "\u{1313F}",
            transliteration: "\uA723",
            meaning: "Egyptian vulture \u2014 uniliteral sign and sacred bird of Mut",
            pronunciation: "ah",
            origin: "A standing Egyptian vulture, the commonest large bird of the Nile valley.",
            history: "The same vulture hieroglyph met in Lesson 1 appears here in a natural context. Egyptian scribes learned animal signs early, as nature vocabulary was central to both religious and administrative texts.",
            culture: "Vultures were protected in Egypt \u2014 harming one was considered an offence against the goddess Mut. The vulture headdress worn by queens symbolised divine motherhood and Upper Egyptian sovereignty.",
            examples: [
              "\u{1313F}\u{13171}\u{131CB} \u2014 3wj (long, extended)",
              "\u{1313F}\u{133CF}\u{131B8} \u2014 3\u1E2Bt (field, cultivated land)",
            ],
          },
          {
            symbol: "\u{13197}",
            transliteration: "\uA7BDꜥrt (uraeus)",
            meaning: "Rearing cobra (uraeus) \u2014 emblem of Wadjet; determinative for goddesses and royal protection",
            pronunciation: "ee-ah-ret",
            origin: "A cobra rearing up with its hood spread, the uraeus worn on the king’s brow.",
            history: "The uraeus cobra first appeared on the royal brow in the Early Dynastic Period. It remained the supreme symbol of pharaonic authority for over 3,000 years, appearing on every royal crown and headdress.",
            culture: "Wadjet, the cobra goddess, was patron of Lower Egypt. She was said to spit fire at the king\u2019s enemies. Together with Nekhbet the vulture (Upper Egypt), she formed the \u2018Two Ladies\u2019 \u2014 one of the five names in the royal titulary.",
            examples: [
              "\u{13197} \u2014 \uA7BDꜥrt (the uraeus on the royal brow)",
              "\u{131C5}\u{133CF}\u{13197} \u2014 w\uA723\u1E0Ft (Wadjet, cobra goddess of Lower Egypt)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/outer-courtyard/group-3.webp",
        glyphs: [
          {
            symbol: "\u{13217}",
            transliteration: "mw",
            meaning: "Water \u2014 three ripples representing water, the biliteral sign \u2018mw\u2019",
            pronunciation: "moo",
            origin: "Three ripples of water stacked up: water seen from above.",
            history: "The three-ripple water sign appears in the oldest known hieroglyphic inscriptions. It was essential in administrative texts recording the annual Nile flood levels (Nilometers) from the Early Dynastic period onward.",
            culture: "Water was the primordial element in Egyptian cosmology \u2014 the god Nun personified the infinite waters from which all creation emerged. Every temple was symbolically built on a mound rising from these waters.",
            examples: [
              "\u{13217}\u{13171} \u2014 mw (water)",
              "\u{13217}\u{131CB}\u{133CF} \u2014 mwt (mother)",
            ],
          },
          {
            symbol: "\u{131F3}",
            transliteration: "r\uA725",
            meaning: "Sun disc \u2014 ideogram for \u2018Ra\u2019 and \u2018day\u2019",
            pronunciation: "rah",
            origin: "The sun disc, with a dot (or circle) at its centre.",
            history: "The sun disc is attested from the very beginning of Egyptian writing. By the 5th Dynasty, the cult of Ra had become the state religion, and the sun disc appeared in virtually every royal inscription thereafter.",
            culture: "Ra was the supreme creator god. Each pharaoh was called \u2018Son of Ra\u2019 \u2014 the sun disc in a royal cartouche identified the king\u2019s birth name. The disc also served as a calendar marker, meaning \u2018day\u2019 in date formulae.",
            examples: [
              "\u{131F3}\u{13153}\u{132F4}\u{132F4} \u2014 r\uA725-msss (Ramesses, born of Ra)",
              "\u{131F3}\u{1308B}\u{133CF} \u2014 r\uA725 (day, sun)",
            ],
          },
        ],
      },
    ],
    exerciseConfig: {
      categories: [
        { name: "Animals", glyphIndices: [0, 3, 4, 5] },
        { name: "Plants", glyphIndices: [2, 6, 7] },
      ],
      decodeAvailable: false,
      fillInBlanks: [
        {
          inscription: "The scarab \u{131A3} is read ___, “to come into being”, and the lion \u{130ED} is read ___",
          answers: ["ḫpr", "mꜣꞽ"],
          distractors: ["ḥtp", "nfr"],
        },
      ],
    },
    sceneImage: "/lessons/outer-courtyard/scene.webp",
    introVideo: "https://laaj85evae9yxbqi.public.blob.vercel-storage.com/outer-courtyard-intro.mp4",
    cutsceneVideo: "/videos/cutscene-2.mp4",
    isFree: false,
    order: 2,
    category: "Fundamentals",
  },

  // ─── Lesson 3: The Pilgrim's Gallery (was signs-of-life) ───
  {
    id: "pilgrims-gallery",
    title: "The Pilgrim's Gallery",
    areaName: "The Pilgrim's Gallery",
    subtitle: "Determinatives",
    description:
      "A long corridor lined with carved human figures and body parts leads deeper into the complex. Determinatives are silent signs placed at the end of a word to indicate its category of meaning. Learn the human-figure and body-part determinatives that appear in thousands of Egyptian texts.",
    narrativeIntro:
      "A narrow passageway opens before you, its walls crowded with carved figures -- seated men, walking legs, outstretched arms. Your torch reveals centuries of pilgrim graffiti scratched into the lower registers. This gallery was where ancient visitors first encountered the human signs of the script.",
    narrativeOutro:
      "The silent determinatives have given you a new lens for reading hieroglyphs -- you can now identify categories of meaning at a glance. A glint of gold ahead signals the entrance to the Treasury, where numbers and counting shaped an empire's wealth.",
    difficulty: "beginner",
    duration: "20 min",
    glyphGroups: [
      {
        contextImage: "/lessons/pilgrims-gallery/group-1.webp",
        glyphs: [
          {
            symbol: "\u{13000}",
            transliteration: "(det.)",
            meaning: "Seated man \u2014 determinative for male persons and occupations",
            pronunciation: "silent (determinative)",
            origin: "A man seated on the ground with one knee raised, hand toward his mouth or lap.",
            history: "This determinative appears from the earliest Old Kingdom texts. It was placed at the end of male names and titles, helping readers quickly identify words referring to men.",
            culture: "The seated posture shows the figure at rest \u2014 a sign of status. Labourers and servants were often depicted standing or kneeling, while officials and gods sat. The hierarchy of posture reflected Egyptian social order.",
            examples: [
              "\u{132F4}\u{13216}\u{13000} \u2014 sn (brother)",
              "\u{13283}\u{13219}\u{13000} \u2014 s\u0161 (scribe)",
            ],
          },
          {
            symbol: "\u{13001}",
            transliteration: "(det.)",
            meaning: "Man with hand to mouth \u2014 determinative for eating, drinking, speaking",
            pronunciation: "silent (determinative)",
            origin: "A seated man with his hand raised to his mouth: anything done with the mouth.",
            history: "Attested in the Pyramid Texts of the 5th and 6th Dynasties, this sign helped distinguish verbs of consumption and speech from identically-spelled words with different meanings.",
            culture: "The gesture of hand to mouth was universally understood \u2014 it transcended literacy. Even those who could not read hieroglyphs could recognise this symbol\u2019s meaning on temple walls and tomb paintings.",
            examples: [
              "\u{13171}\u{13216}\u{13153}\u{13001} \u2014 wnm (to eat)",
              "\u{132F4}\u{13171}\u{1308B}\u{13001} \u2014 swr (to drink)",
            ],
          },
          {
            symbol: "\u{13050}",
            transliteration: "(det.)",
            meaning: "Seated woman \u2014 determinative for female persons and goddesses",
            pronunciation: "silent (determinative)",
            origin: "A seated woman, in the long sheath dress of Egyptian art.",
            history: "Used consistently from the Old Kingdom onward to mark female names, titles, and divine epithets. The knotted dress strap identifies the figure as female.",
            culture: "Egyptian women held significant legal and property rights. The seated woman determinative appeared after names of queens, priestesses, and goddesses alike \u2014 a reflection of the broad social roles women occupied.",
            examples: [
              "\u{132F4}\u{13216}\u{133CF}\u{13050} \u2014 snt (sister)",
              "\u{131CB}\u{132F4}\u{133CF}\u{13050} \u2014 jst (Isis)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/pilgrims-gallery/group-2.webp",
        glyphs: [
          {
            symbol: "\u{1308B}",
            transliteration: "r",
            meaning: "Mouth \u2014 also the uniliteral sign for \u2018r\u2019",
            pronunciation: "r as in Ra",
            origin: "A human mouth seen from the front.",
            history: "One of the 24 core uniliteral signs used throughout all periods. The mouth sign appears on the Rosetta Stone and was among the first hieroglyphs deciphered by Champollion in 1822.",
            culture: "The mouth held sacred significance \u2014 the Opening of the Mouth ceremony was performed on mummies to restore the ability to breathe, speak, and eat in the afterlife.",
            examples: [
              "\u{1308B}\u{1309D} \u2014 r\uA725 (Ra, the sun god)",
              "\u{1308B}\u{13216} \u2014 rn (name)",
            ],
          },
          {
            symbol: "\u{130A7}",
            transliteration: "d",
            meaning: "Hand \u2014 also the uniliteral sign for \u2018d\u2019",
            pronunciation: "d as in day",
            origin: "An open hand seen from the side.",
            history: "The hand hieroglyph has been in use since the Old Kingdom. It shows the hand palm-down with a visible thumb, a distinctive pose found on monuments throughout Egypt.",
            culture: "Hands played a key role in Egyptian ritual \u2014 the ka (life force) was written with two upraised arms, and the gesture of offering was always depicted with outstretched hands.",
            examples: [
              "\u{130A7}\u{13171}\u{1313F}\u{133CF} \u2014 dw\u0227t (underworld, Duat)",
              "\u{130A7}\u{130C0} \u2014 db (horn, replacement)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/pilgrims-gallery/group-3.webp",
        glyphs: [
          {
            symbol: "\u{130BB}",
            transliteration: "(det.)",
            meaning: "Walking legs \u2014 determinative for motion and movement",
            pronunciation: "silent (determinative)",
            origin: "A pair of legs in mid-stride: movement itself.",
            history: "A practical sign that gained wide use in Middle Kingdom literary texts, where verbs of motion and travel became more common in narrative storytelling.",
            culture: "Movement was deeply meaningful in Egyptian cosmology \u2014 the sun god Ra sailed across the sky by day and through the underworld by night. The walking legs determinative connected everyday verbs to this cosmic cycle of motion.",
            examples: [
              "\u{131CB}\u{13171}\u{130BB} \u2014 jw (to come)",
              "\u{13219}\u{13153}\u{130BB} \u2014 \u0161m (to go, to walk)",
            ],
          },
          {
            symbol: "\u{13080}",
            transliteration: "w\u1E0F\uA723t",
            meaning: "Eye of Horus (Wedjat) \u2014 symbol of protection and healing",
            pronunciation: "weh-jat",
            origin: "The eye of the falcon god Horus, with its markings, healed and made whole after his battle with Seth.",
            history: "According to myth, Seth tore out Horus\u2019s left eye during their battle for the throne. Thoth restored it, and the healed eye became a symbol of wholeness. Wedjat amulets are among the most common objects found in Egyptian tombs.",
            culture: "The six parts of the Wedjat eye each represented a fraction (1/2, 1/4, 1/8, 1/16, 1/32, 1/64), which together summed to 63/64. Scribes used these parts for measuring grain \u2014 the missing 1/64 was said to be supplied by Thoth\u2019s magic.",
            examples: [
              "\u{13080}\u{133CF} \u2014 w\u1E0F\uA723t (the sacred eye)",
              "\u{13080}\u{13283} \u2014 w\u1E0F3s (prosperity, well-being)",
            ],
          },
          {
            symbol: "\u{13051}",
            transliteration: "(det.)",
            meaning: "Woman with child \u2014 determinative for birth, pregnancy, nursing",
            pronunciation: "silent (determinative)",
            origin: "A woman with the swollen belly of pregnancy.",
            history: "This sign is found in medical papyri from the Middle Kingdom, particularly in texts about pregnancy and childbirth such as the Kahun Gynaecological Papyrus (c. 1825 BCE).",
            culture: "Motherhood was deeply honoured in Egyptian society. The goddess Isis nursing Horus became one of the most enduring images in Egyptian art, later influencing early Christian depictions of the Madonna and Child.",
            examples: [
              "\u{13153}\u{132F4}\u{13051} \u2014 ms (to give birth)",
              "\u{1308B}\u{13216}\u{13216}\u{13051} \u2014 rnn (to nurse, to rear)",
            ],
          },
        ],
      },
    ],
    exerciseConfig: {
      categories: [
        { name: "People", glyphIndices: [0, 1, 2, 7] },
        { name: "Body Parts", glyphIndices: [3, 4, 5, 6] },
      ],
      decodeAvailable: true,
      fillInBlanks: [
        {
          inscription: "The seated man \u{13000} is a ___ for male persons, and the walking legs \u{130BB} mark words of ___",
          answers: ["determinative", "motion"],
          distractors: ["sound sign", "eating"],
        },
      ],
    },
    sceneImage: "/lessons/pilgrims-gallery/scene.webp",
    introVideo: "https://laaj85evae9yxbqi.public.blob.vercel-storage.com/pilgrims-gallery-intro.mp4",
    cutsceneVideo: "/videos/cutscene-3.mp4",
    isFree: false,
    order: 3,
    category: "Fundamentals",
  },

  // ─── Lesson 4: The Treasury (was numbers-and-counting) ───
  {
    id: "the-treasury",
    title: "The Treasury",
    areaName: "The Treasury",
    subtitle: "Egyptian Numerals",
    description:
      "Deep within the complex lies the Treasury, where inventories of gold, grain, and gemstones were once tallied in hieroglyphic numerals. The ancient Egyptians used a base-10 numeral system with distinct hieroglyphs for powers of ten -- from single strokes for units to the god Heh for one million.",
    narrativeIntro:
      "A heavy stone door grinds open to reveal a chamber lined with shelves cut into the rock. Clay tablets and rolled papyri fill every niche -- records of tribute, trade, and temple wealth. The Treasury was the beating heart of the temple's economy, and its language is numbers.",
    narrativeOutro:
      "You can now read the quantities that underwrote pharaonic power -- tallies of bread, beer, gold, and cattle. The corridor ahead is flanked by royal cartouches; you are approaching the Royal Hall, where the names of kings are written for eternity.",
    difficulty: "intermediate",
    duration: "20 min",
    glyphGroups: [
      {
        contextImage: "/lessons/the-treasury/group-1.webp",
        glyphs: [
          {
            symbol: "\u{133E4}",
            transliteration: "w\uA725",
            meaning: "Single stroke \u2014 the number 1",
            pronunciation: "wah",
            origin: "A single upright stroke: a tally mark, or the ideogram marker that says ‘read the picture literally’.",
            history: "The single stroke is the most basic numeral sign, attested from pre-dynastic times. It appears on labels attached to goods in the earliest royal tombs at Abydos (c. 3100 BCE).",
            culture: "Egyptian numbers were additive \u2014 they wrote the number 3 as three strokes, 7 as seven strokes. This system was intuitive but space-consuming, which led to the creation of distinct signs for 10, 100, 1000, and higher powers of ten.",
            examples: [
              "\u{133E4}\u{133E4}\u{133E4} \u2014 3 (three)",
              "\u{133E4}\u{133E4}\u{133E4}\u{133E4}\u{133E4} \u2014 5 (five)",
            ],
          },
          {
            symbol: "\u{133E5}",
            transliteration: "(plural)",
            meaning: "Three strokes \u2014 plural marker, also represents the number 3",
            pronunciation: "silent (grammatical marker)",
            origin: "Three strokes: the plural, or the number three.",
            history: "The three-stroke plural marker dates to the Old Kingdom. It solved a practical problem: Egyptian had no written vowels, so many words looked identical \u2014 the plural strokes helped readers distinguish singular from plural at a glance.",
            culture: "Three was a number of completeness in Egyptian thought \u2014 the Ennead of Heliopolis had nine gods (three times three). Writing three strokes after a word indicated not just \u2018more than one\u2019 but a complete set or totality.",
            examples: [
              "\u{13216}\u{133CF}\u{1308B}\u{133E5} \u2014 n\u1E6Frw (gods, plural of god)",
              "\u{13283}\u{13219}\u{133E5} \u2014 s\u0161w (writings, documents)",
            ],
          },
          {
            symbol: "\u{13386}",
            transliteration: "m\u1E0F (10)",
            meaning: "Cattle hobble / heel bone \u2014 the number 10",
            pronunciation: "medj",
            origin: "An arch, read as a hobble for cattle (or a heel bone).",
            history: "The arch-shaped sign for ten is usually read as a cattle hobble (some scholars see a heel bone). Like the stroke for one, it was simply repeated: two hobbles are 20, nine hobbles are 90. The system is decimal but has no zero and no place value.",
            culture: "Scribes tallied grain, cattle and labour gangs in tens on ostraca and papyri. Numbers were written largest sign first, and each group was stacked neatly \u2014 a block of hobbles beside a block of strokes \u2014 so a tax inspector could read the total at a glance.",
            examples: [
              "\u{13386}\u{13386}\u{13386} \u2014 30 (three tens)",
              "\u{13386}\u{133E4}\u{133E4} \u2014 12 (one ten, two ones)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/the-treasury/group-2.webp",
        glyphs: [
          {
            symbol: "\u{13362}",
            transliteration: "\u0161t (100)",
            meaning: "Coil of rope \u2014 the number 100",
            pronunciation: "shet",
            origin: "A coiled measuring rope.",
            history: "A coiled measuring rope stands for one hundred. Surveyors re-measured every field after the Nile flood with knotted ropes \u2014 the rope-length unit (\u1E2Bt, one hundred cubits) made the coil a natural symbol for 100. Multiples were written by repeating the coil, up to nine times.",
            culture: "Do not confuse the numeral with the shen ring \u{13376} \u2014 a looped rope tied at the base that meant eternity and protection, and was stretched into the cartouche around royal names. Same material, different sign, different meaning.",
            examples: [
              "\u{13362}\u{13362} \u2014 200 (two hundreds)",
              "\u{13362}\u{13386}\u{13386}\u{133E4}\u{133E4}\u{133E4} \u2014 123 (hundred, two tens, three ones)",
            ],
          },
          {
            symbol: "\u{1308B}",
            transliteration: "r",
            meaning: "Mouth \u2014 used as a fraction marker (r + number = 1/n)",
            pronunciation: "r",
            origin: "A human mouth seen from the front.",
            history: "The mouth sign doubled as a fraction indicator in mathematical papyri. The Rhind Mathematical Papyrus (c. 1550 BCE) uses \u2018r\u2019 before a number to express unit fractions \u2014 \u2018r 3\u2019 means 1/3.",
            culture: "Egyptian fractions were always unit fractions (1/n), with the sole exception of 2/3. This system forced scribes to decompose values like 2/5 into sums of unit fractions (1/3 + 1/15), creating complex but elegant mathematical tables.",
            examples: [
              "\u{1308B} \u{133E4}\u{133E4}\u{133E4} \u2014 r 3 (one-third, 1/3)",
              "\u{1308B} \u{133E4}\u{133E4}\u{133E4}\u{133E4} \u2014 r 4 (one-quarter, 1/4)",
            ],
          },
          {
            symbol: "\u{133ED}",
            transliteration: "(dual)",
            meaning: "Two strokes \u2014 dual marker for a pair (also writes y)",
            pronunciation: "silent (grammatical marker)",
            origin: "Two small strokes: the dual, or the number two.",
            history: "Egyptian grammar distinguished singular, dual, and plural \u2014 a feature shared with Arabic and other Semitic languages. The two-stroke dual marker appears from the Old Kingdom in both formal and everyday texts.",
            culture: "Duality was central to Egyptian worldview \u2014 Upper and Lower Egypt, east and west bank, the living and the dead. The Two Lands (t3wy) was the standard name for the unified kingdom, always written with the dual strokes.",
            examples: [
              "\u{133CF}\u{1313F}\u{13171}\u{131CB}\u{133ED} \u2014 t3wy (the Two Lands, all of Egypt)",
              "\u{1308B}\u{130A7}\u{133ED} \u2014 rd.wy (two feet, a pair of feet)",
            ],
          },
        ],
      },
    ],
    exerciseConfig: {
      categories: [
        { name: "Units", glyphIndices: [0, 1, 5] },
        { name: "Large Numbers", glyphIndices: [2, 3, 4] },
      ],
      decodeAvailable: true,
      fillInBlanks: [
        {
          inscription: "The single stroke \u{133E4} counts ___, and the coil of rope \u{13362} counts ___",
          answers: ["1", "100"],
          distractors: ["10", "1,000"],
        },
      ],
    },
    sceneImage: "/lessons/the-treasury/scene.webp",
    introVideo: "https://laaj85evae9yxbqi.public.blob.vercel-storage.com/the-treasury-intro.mp4",
    cutsceneVideo: "/videos/cutscene-4.mp4",
    isFree: false,
    order: 4,
    category: "Applied",
  },

  // ─── Lesson 5: The Royal Hall (was royal-cartouches) ───
  {
    id: "royal-hall",
    title: "The Royal Hall",
    areaName: "The Royal Hall",
    subtitle: "Pharaoh Names",
    description:
      "The Royal Hall is dominated by towering columns carved with cartouches -- the oval rings enclosing the names of pharaohs. Learn to identify and decode the hieroglyphs found in the cartouches of Tutankhamun, Ramesses, and Cleopatra, and discover how scribes honoured their kings in stone.",
    narrativeIntro:
      "Massive columns rise into the shadows above you, each one inscribed with rows of royal cartouches. Gold leaf still clings to the deepest carvings. This was the Hall of Kings, where every pharaoh's name was recorded so that it might endure for eternity.",
    narrativeOutro:
      "You can now read the names of pharaohs who shaped history -- Tutankhamun, Ramesses, Hatshepsut. But kingship was only half the story; the Egyptians also prepared meticulously for the afterlife. The Sacred Chapel lies just ahead.",
    difficulty: "intermediate",
    duration: "25 min",
    glyphGroups: [
      {
        contextImage: "/lessons/royal-hall/group-1.webp",
        glyphs: [
          {
            symbol: "\u{131CB}",
            transliteration: "j",
            meaning: "Reed \u2014 appears in many royal names including Ramesses (r\uA725-ms-sw)",
            pronunciation: "ee",
            origin: "A single flowering reed.",
            history: "In royal contexts, the reed often appears as a phonetic complement confirming the reading of a preceding sign. The cartouche of Tutankhamun contains this reed as part of the sequence spelling \u2018Amun\u2019.",
            culture: "Scribes were meticulous about spelling royal names correctly \u2014 an error in a king\u2019s cartouche could be considered a grave offence. The reed\u2019s frequent appearance in divine names (Amun, Osiris) gave it added sacred weight.",
            examples: [
              "\u{131CB}\u{13153}\u{13216} \u2014 jmn (Amun, in Tutankhamun\u2019s name)",
              "\u{131CB}\u{133CF}\u{13216} \u2014 jtn (Aten, the sun disc worshipped by Akhenaten)",
            ],
          },
          {
            symbol: "\u{13153}",
            transliteration: "m",
            meaning: "Owl \u2014 phonetic complement in royal name compounds",
            pronunciation: "m",
            origin: "An owl, the one bird sign that looks straight at you.",
            history: "The owl appears in the cartouches of nearly every pharaoh as a phonetic complement. In Ramesses\u2019 cartouche, it confirms the \u2018m\u2019 in \u2018ms\u2019 (born). In Tutankhamun\u2019s, it spells part of \u2018Amun\u2019.",
            culture: "Royal cartouches were sacred enclosures \u2014 the oval ring symbolised eternity and protection. Everything within it was under the gods\u2019 safeguard. Damaging a cartouche was considered an attack on the king\u2019s immortal soul.",
            examples: [
              "\u{13153}\u{132F4} \u2014 ms (born, as in Ramesses)",
              "\u{13153}\u{13216} \u2014 mn (established, as in Tutankhamun)",
            ],
          },
          {
            symbol: "\u{13216}",
            transliteration: "n",
            meaning: "Water ripple \u2014 appears in Tutankhamun (twt-\uA725n\u1E2B-jmn)",
            pronunciation: "n",
            origin: "A zigzag ripple on the surface of water.",
            history: "In Tutankhamun\u2019s cartouche, the water ripple spells part of both \u2018Amun\u2019 and \u2018ankh\u2019 (life). When Howard Carter opened the tomb in 1922, this was one of the first signs identified on the golden shrine.",
            culture: "Tutankhamun\u2019s original name was Tutankhaten (living image of the Aten). When the Amun priesthood was restored, the \u2018Aten\u2019 was replaced with \u2018Amun\u2019 \u2014 the water ripple \u2018n\u2019 remained in both versions of the name.",
            examples: [
              "\u{13216}\u{130C0} \u2014 nb (lord, in the title \u2018Lord of the Two Lands\u2019)",
              "\u{13216}\u{132F4}\u{13171}\u{133CF} \u2014 nswt (king of Upper Egypt)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/royal-hall/group-2.webp",
        glyphs: [
          {
            symbol: "\u{131F3}",
            transliteration: "r\uA725",
            meaning: "Sun disc \u2014 the god Ra, first element of Ramesses\u2019 prenomen",
            pronunciation: "rah",
            origin: "The sun disc, with a dot (or circle) at its centre.",
            history: "The sun disc opens the prenomen (throne name) of Ramesses II: \u2018User-Maat-Ra Setep-en-Ra\u2019. It is always written first in the cartouche by honorific transposition, even though it is read later in the name.",
            culture: "Honorific transposition was a scribal convention where divine names were written first out of respect, regardless of pronunciation order. The sun disc before other signs signalled \u2018read me after, but I am the most important element here\u2019.",
            examples: [
              "\u{131F3}\u{13153}\u{132F4} \u2014 r\uA725-ms-s (Ramesses, born of Ra)",
              "\u{131F3}\u{131A3}\u{1308B} \u2014 r\uA725-\u1E2Bpr (a common royal prenomen element)",
            ],
          },
          {
            symbol: "\u{132F4}",
            transliteration: "s",
            meaning: "Folded cloth \u2014 common in royal names, appears in \u2018ms-s\u2019 (Ramesses)",
            pronunciation: "s as in sun",
            origin: "A folded piece of linen.",
            history: "The folded cloth is one of the 24 uniliteral signs. In Ramesses\u2019 cartouche, it appears twice \u2014 once as part of \u2018ms\u2019 (born) and once as the final \u2018s\u2019 that completes the name.",
            culture: "Linen cloth was a precious commodity in Egypt \u2014 it was used as currency, wrapped mummies, and clothed the gods\u2019 cult statues. The folded cloth hieroglyph reflected linen\u2019s central role in Egyptian daily and ritual life.",
            examples: [
              "\u{132F4}\u{133CF}\u{132AA} \u2014 stp (chosen, as in \u2018Setep-en-Ra\u2019)",
              "\u{132F4}\u{1309D} \u2014 s\uA725 (son, as in \u2018Son of Ra\u2019)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/royal-hall/group-3.webp",
        glyphs: [
          {
            symbol: "\u{13283}",
            transliteration: "s",
            meaning: "Door bolt \u2014 alternate \u2018s\u2019 sign, used in some royal name variants",
            pronunciation: "s as in sun",
            origin: "A horizontal door bolt.",
            history: "The door bolt and folded cloth both represent \u2018s\u2019 but come from different phases of the script\u2019s development. The door bolt is generally older and more common in certain word spellings.",
            culture: "Having two signs for the same sound was common in hieroglyphs. Scribes chose between them based on tradition, aesthetics, and space \u2014 royal cartouches often preferred whichever sign created a more balanced visual composition.",
            examples: [
              "\u{13283}\u{133CF} \u2014 st (seat, place, as in the name Isis: 3st)",
              "\u{13283}\u{13219} \u2014 s\u0161 (scribe, writing)",
            ],
          },
          {
            symbol: "\u{133CF}",
            transliteration: "t",
            meaning: "Bread loaf \u2014 feminine ending \u2018t\u2019, appears in Hatshepsut and Nefertiti",
            pronunciation: "t as in time",
            origin: "A small round loaf of bread.",
            history: "The bread loaf \u2018t\u2019 marks the feminine ending in Egyptian grammar. In the cartouche of Hatshepsut, it appears in \u2018Hat-shepsut\u2019 (foremost of noble women). In Nefertiti\u2019s name, it ends \u2018Nefer-neferu-Aten\u2019.",
            culture: "Bread was the staple food and primary offering in Egypt. The sign\u2019s association with femininity came from grammar, not symbolism \u2014 but the centrality of bread-making to household life (often women\u2019s work) created a cultural resonance.",
            examples: [
              "\u{133CF}\u{1313F}\u{13171}\u{131CB} \u2014 t3wy (the Two Lands, i.e. all of Egypt)",
              "\u{133CF}\u{133CF} \u2014 tt (image, likeness, as in Tutankhamun: twt)",
            ],
          },
        ],
      },
    ],
    exerciseConfig: {
      categories: [
        { name: "Old Kingdom", glyphIndices: [0, 1, 2, 5] },
        { name: "New Kingdom", glyphIndices: [3, 4, 6] },
      ],
      decodeAvailable: true,
      fillInBlanks: [
        {
          inscription: "The sun disc \u{131F3} stands for the god ___, and a king’s name is written inside a ___",
          answers: ["Ra", "cartouche"],
          distractors: ["Amun", "stela"],
        },
      ],
    },
    sceneImage: "/lessons/royal-hall/scene.webp",
    introVideo: "https://laaj85evae9yxbqi.public.blob.vercel-storage.com/royal-hall-intro.mp4",
    cutsceneVideo: "/videos/cutscene-5.mp4",
    isFree: false,
    order: 5,
    category: "Applied",
  },

  // ─── Lesson 6: The Sacred Chapel (was afterlife-texts) ───
  {
    id: "sacred-chapel",
    title: "The Sacred Chapel",
    areaName: "The Sacred Chapel",
    subtitle: "Funerary Formulas",
    description:
      "Beyond the Royal Hall, a solemn chapel is devoted to the afterlife. From the Pyramid Texts to the Book of the Dead, funerary literature is among the most abundant surviving Egyptian writing. Learn the standard offering formula, divine epithets, and key phrases that guided the deceased through the underworld.",
    narrativeIntro:
      "The air grows cooler as you descend a short flight of steps into the Sacred Chapel. Painted scenes of the weighing of the heart cover the walls, and an offering slab stands before a false door. This is where the living spoke to the dead through the power of words.",
    narrativeOutro:
      "The funerary formulas have revealed how language itself was believed to sustain the dead. Your expedition now approaches the grandest space in the complex -- the towering Hypostyle Hall, where monumental inscriptions proclaim the gods' eternal presence.",
    difficulty: "advanced",
    duration: "30 min",
    glyphGroups: [
      {
        contextImage: "/lessons/sacred-chapel/group-1.webp",
        glyphs: [
          {
            symbol: "\u{132B5}",
            transliteration: "\u1E25tp",
            meaning: "Offering slab \u2014 \u2018\u1E25tp\u2019 means \u2018offering\u2019 or \u2018to be satisfied\u2019, the first word in the offering formula",
            pronunciation: "heh-tep",
            origin: "A reed mat with a loaf of bread on it, the simplest offering.",
            history: "The \u2018\u1E25tp-dj-nswt\u2019 (an offering which the king gives) formula is the most common funerary text in ancient Egypt. It appears on virtually every tomb stela from the Old Kingdom onward \u2014 tens of thousands of examples survive.",
            culture: "Egyptians believed the dead needed food, drink, and goods to survive in the afterlife. The offering formula magically activated the listed provisions. Simply reading the formula aloud was thought to sustain the deceased.",
            examples: [
              "\u{132B5}\u{133CF}\u{132AA} \u2014 \u1E25tp (offering, peace, to be satisfied)",
              "\u{132B5}\u{133CF}\u{132AA} \u{130A7}\u{131CB} \u{131D3}\u{133CF}\u{13216} \u2014 \u1E25tp-dj-nswt (royal offering formula)",
            ],
          },
          {
            symbol: "\u{131F3}",
            transliteration: "r\uA725",
            meaning: "Sun disc \u2014 Ra, supreme deity invoked in afterlife texts",
            pronunciation: "rah",
            origin: "The sun disc, with a dot (or circle) at its centre.",
            history: "In funerary texts, Ra\u2019s nightly journey through the underworld (Duat) was the model for every soul\u2019s passage after death. The Book of the Dead and the Amduat describe this twelve-hour journey in elaborate detail.",
            culture: "The dead hoped to join Ra in his solar barque, travelling the sky by day and the underworld by night for eternity. Many coffin texts include spells to ensure the deceased could board the barque and not be turned away.",
            examples: [
              "\u{131F3}\u{1308B}\u{133CF}\u{131F3} \u2014 r\uA725-nb (every day, daily)",
              "\u{131F3}\u{13171}\u{1309D}\u{131CB} \u2014 r\uA725w (sunlight, daytime)",
            ],
          },
          {
            symbol: "\u{13080}",
            transliteration: "w\u1E0F\uA723t",
            meaning: "Eye of Horus \u2014 protective amulet placed on mummies, symbol of resurrection",
            pronunciation: "weh-jat",
            origin: "The eye of the falcon god Horus, with its markings, healed and made whole after his battle with Seth.",
            history: "Wedjat eyes were placed on mummies in enormous quantities \u2014 some royal burials contained hundreds. The eye also appeared painted on the left side of coffins so the deceased could \u2018look out\u2019 at the world of the living.",
            culture: "The restored Eye of Horus symbolised healing and wholeness \u2014 making it the perfect symbol for resurrection. In the offering formula, all provisions were metaphorically presented \u2018as the Eye of Horus\u2019, magically transforming ordinary food into divine sustenance.",
            examples: [
              "\u{13080}\u{133CF} \u2014 w\u1E0F\uA723t (the restored eye, healing)",
              "\u{13080}\u{13171}\u{130A7} \u2014 w\u1E0F (command, decree of the gods)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/sacred-chapel/group-2.webp",
        glyphs: [
          {
            symbol: "\u{131BC}",
            transliteration: "\u1E2B\uA723",
            meaning: "Lotus plant (1,000) \u2014 \u2018a thousand of bread, beer, oxen...\u2019 in the offering formula",
            pronunciation: "kha",
            origin: "A lotus plant on its stalk with leaves: the numeral 1,000.",
            history: "The lotus plant hieroglyph representing 1,000 appears in the standard offering formula requesting \u2018a thousand of bread, a thousand of beer, a thousand of oxen and fowl\u2019. These quantities were symbolic \u2014 meaning \u2018unlimited abundance\u2019.",
            culture: "The offering formula followed a rigid structure: after invoking the king and a god (usually Osiris or Anubis), it listed desired provisions in thousands. The number was aspirational \u2014 even modest tombs of commoners requested provisions in the thousands.",
            examples: [
              "\u{131BC} \u{133CF} \u{1339B}\u{13216}\u{1320E}\u{133CF} \u2014 \u1E2B\uA725 t \u1E25nqt (a thousand of bread and beer)",
              "\u{131BC} \u{131CB}\u{1309D}\u{133CF} \u2014 \u1E2B\uA725 j\uA725t (a thousand of every good thing)",
            ],
          },
          {
            symbol: "\u{13250}",
            transliteration: "pr",
            meaning: "House \u2014 biliteral sign \u2018pr\u2019, as in \u2018pr-\u1E2Brw\u2019 (voice offering)",
            pronunciation: "per",
            origin: "The ground plan of a house: a rectangle with a gap for the door.",
            history: "The house plan (a rectangle with an opening) is one of the clearest pictographic hieroglyphs. In funerary contexts, \u2018prt-\u1E2Brw\u2019 (going forth of the voice) meant the recitation of the offering formula by a priest or passing visitor.",
            culture: "The \u2018voice offering\u2019 concept was revolutionary \u2014 it meant even if physical offerings ceased, anyone who read the formula aloud could sustain the dead. This is why Egyptians inscribed the formula on highly visible tomb facades.",
            examples: [
              "\u{13250}\u{133CF}\u{1308B}\u{13171} \u2014 prt-\u1E2Brw (voice offering, invocation offering)",
              "\u{13250}\u{1309D}\u{13216}\u{1340D} \u2014 pr-\uA725n\u1E2B (House of Life, the temple scriptorium)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/sacred-chapel/group-3.webp",
        glyphs: [
          {
            symbol: "\u{13040}",
            transliteration: "(det.)",
            meaning: "Mummy on bed \u2014 determinative for death, burial, and the deceased",
            pronunciation: "silent (determinative)",
            origin: "A mummy lying on a lion-footed bed.",
            history: "This determinative appears in funerary texts from the Old Kingdom onward. It marks words related to death, mummification, and the state of being deceased \u2014 helping readers navigate the specialised vocabulary of mortuary literature.",
            culture: "The mummiform figure on a lion-headed bed depicts the moment of embalming. Anubis, the jackal god of mummification, was believed to attend to each body personally. The bed\u2019s lion shape served an apotropaic function \u2014 warding off evil during the vulnerable process.",
            examples: [
              "\u{13171}\u{13216}\u{13216}\u{13040} \u2014 wnn (to exist, said of the dead in the afterlife)",
              "\u{1320E}\u{1308B}\u{132F4}\u{13040} \u2014 qrs (burial, to bury)",
            ],
          },
          {
            symbol: "\u{13171}",
            transliteration: "w",
            meaning: "Quail chick \u2014 phonetic complement in many funerary terms",
            pronunciation: "oo / w",
            origin: "A quail chick.",
            history: "In afterlife texts, the quail chick frequently appears as a phonetic complement in words like \u2018wsjr\u2019 (Osiris) and \u2018w\uA725b\u2019 (pure). Its high frequency made it one of the first signs apprentice scribes mastered.",
            culture: "Purity was essential for the afterlife \u2014 the dead had to declare themselves \u2018w\uA725b\u2019 (pure) before 42 divine judges in the Hall of Maat. The \u2018negative confession\u2019 (declaring oneself free of sin) was a centrepiece of the Book of the Dead.",
            examples: [
              "\u{13171}\u{13283}\u{131CB}\u{1308B} \u2014 wsjr (Osiris, lord of the dead)",
              "\u{13171}\u{1309D}\u{130C0} \u2014 w\uA725b (pure, ritually clean)",
            ],
          },
        ],
      },
    ],
    exerciseConfig: {
      categories: [
        { name: "Protection", glyphIndices: [1, 2, 4] },
        { name: "Judgment", glyphIndices: [0, 3, 5, 6] },
      ],
      decodeAvailable: true,
      fillInBlanks: [
        {
          inscription: "The prayer for the dead opens with ḥtp, written with the bread-on-a-mat sign \u{132B5}, meaning ___, and the sun disc \u{131F3} names the god ___",
          answers: ["offering", "Ra"],
          distractors: ["life", "Thoth"],
        },
      ],
    },
    sceneImage: "/lessons/sacred-chapel/scene.webp",
    introVideo: "https://laaj85evae9yxbqi.public.blob.vercel-storage.com/sacred-chapel-intro.mp4",
    cutsceneVideo: "/videos/cutscene-6.mp4",
    isFree: false,
    order: 6,
    category: "Advanced",
  },

  // ─── Lesson 7: The Hypostyle Hall (was temple-inscriptions) ───
  {
    id: "hypostyle-hall",
    title: "The Hypostyle Hall",
    areaName: "The Hypostyle Hall",
    subtitle: "Monumental Texts",
    description:
      "A forest of massive columns rises before you, every surface inscribed with hieroglyphic texts recording divine rituals, royal victories, and theological narratives. Learn to recognize the standard phrases, divine titles, and formulaic patterns that appear on monuments from Karnak to Abu Simbel.",
    narrativeIntro:
      "You emerge into the largest chamber yet -- a vast hall of towering columns, each one wider than a man can embrace. Every inch of stone is carved with inscriptions in deep, confident strokes. Shafts of light fall from clerestory windows, illuminating the texts that proclaimed the gods' eternal presence.",
    narrativeOutro:
      "The monumental language of kings and gods is now within your grasp. One final chamber remains -- the Inner Sanctum, where the most advanced grammatical structures were employed by master scribes. Your expedition nears its culmination.",
    difficulty: "advanced",
    duration: "30 min",
    glyphGroups: [
      {
        contextImage: "/lessons/hypostyle-hall/group-1.webp",
        glyphs: [
          {
            symbol: "\u{13250}",
            transliteration: "pr",
            meaning: "House \u2014 \u2018pr\u2019 appears in temple names like \u2018pr-jmn\u2019 (Temple of Amun)",
            pronunciation: "per",
            origin: "The ground plan of a house: a rectangle with a gap for the door.",
            history: "Temple names always began with \u2018pr\u2019 (house/estate of the god). The great temple at Karnak was \u2018Ipet-isut\u2019 (most select of places), but was also called \u2018pr-jmn\u2019 \u2014 the House of Amun. (The modern town of Luxor takes its name from something else: the Arabic \u2018al-Uqsur\u2019, \u2018the palaces\u2019.)",
            culture: "Egyptian temples were not congregational spaces \u2014 ordinary people rarely entered beyond the outer court. The temple was literally the god\u2019s house: a dwelling where the deity lived, ate, and slept in the form of a cult statue.",
            examples: [
              "\u{13250}\u{131CB}\u{13153}\u{13216} \u2014 pr-jmn (Temple of Amun, Karnak)",
              "\u{13250}\u{13216}\u{130C0} \u2014 pr-nb (every temple, house of the lord)",
            ],
          },
          {
            symbol: "\u{131F3}",
            transliteration: "r\uA725",
            meaning: "Sun disc \u2014 Ra, frequently invoked in temple dedication texts",
            pronunciation: "rah",
            origin: "The sun disc, with a dot (or circle) at its centre.",
            history: "Temple dedication inscriptions typically credited the pharaoh with building the temple \u2018for his father Ra\u2019 or another deity. The sun disc appears in nearly every monumental inscription as part of the royal titulary.",
            culture: "Temples were oriented astronomically \u2014 many aligned to the rising sun on specific dates. At Abu Simbel, sunlight penetrates the inner sanctuary twice a year to illuminate the statues of Ra, Amun, and Ramesses, while the statue of Ptah (an underworld god) remains in shadow.",
            examples: [
              "\u{131F3}\u{13216}\u{130C0} \u2014 r\uA725-nb (every day, in daily offering inscriptions)",
              "\u{131F3}\u{1308B}\u{13171} \u2014 r\uA725w (daytime, when temple rituals were performed)",
            ],
          },
          {
            symbol: "\u{13333}",
            transliteration: "m\uA723",
            meaning: "Sickle \u2014 writes m\uA723, as in the word \u2018Maat\u2019 (truth, justice, cosmic order)",
            pronunciation: "mah",
            origin: "A sickle with a serrated blade, the harvest tool.",
            history: "Maat was the foundational concept of Egyptian civilisation. Temple inscriptions describe the pharaoh\u2019s duty to \u2018establish Maat\u2019 and \u2018drive out Isfet (chaos)\u2019. Virtually every temple wall scene reinforces this cosmic struggle.",
            culture: "The offering of Maat \u2014 depicted as a small figure the king presents to the gods \u2014 was the supreme temple ritual. It symbolised the pharaoh\u2019s role as maintainer of cosmic order. Without Maat, Egyptians believed the world would collapse into primordial chaos.",
            examples: [
              "\u{13333}\u{1309D}\u{133CF} \u2014 m3\uA725t (Maat, truth, justice, cosmic order)",
              "\u{13333}\u{1309D} \u2014 m3\uA725 (true, correct, justified)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/hypostyle-hall/group-2.webp",
        glyphs: [
          {
            symbol: "\u{1340D}",
            transliteration: "\u1E2B",
            meaning: "Placenta or sieve \u2014 uniliteral sign appearing in temple ritual terms",
            pronunciation: "kh (voiceless velar fricative)",
            origin: "A round object with a hatched surface: a placenta, or perhaps a sieve.",
            history: "The exact object this sign depicts is debated \u2014 scholars have proposed a placenta, a sieve, or a piece of animal skin. Regardless, it was a standard uniliteral sign from the Old Kingdom and appears frequently in temple vocabulary.",
            culture: "The sign appears in \u2018\u1E2Brp\u2019 (to control, to direct), a title held by temple administrators who oversaw ritual performances. The \u2018controller of the mysteries\u2019 (\u1E2Brp-\u0161\u1E6F3) was a senior priest at major temples.",
            examples: [
              "\u{1340D}\u{1308B}\u{132AA} \u2014 \u1E2Brp (to control, to administer)",
              "\u{1340D}\u{13171}\u{133CF} \u2014 \u1E2Bwt (temple precinct, enclosure)",
            ],
          },
          {
            symbol: "\u{132AA}",
            transliteration: "p",
            meaning: "Stool \u2014 phonetic sign in priestly titles like \u2018\u1E25m-n\u1E6Fr\u2019 (priest)",
            pronunciation: "p as in pen",
            origin: "A reed mat or stool seen from above.",
            history: "The stool appears in \u2018pr\u2019 (house), the most important word in temple epigraphy. It is also found in priestly titles inscribed on temple columns and doorways to record who served in each hall.",
            culture: "Egyptian priests were not full-time clergy \u2014 they served in rotating shifts (phylae), typically one month in four. During their service, they observed strict purity rules: shaving their bodies, abstaining from certain foods, and wearing only white linen.",
            examples: [
              "\u{132AA}\u{13171}\u{1308B} \u2014 pwr (to run, used in processional ritual texts)",
              "\u{132AA}\u{133CF}\u{1339B} \u2014 pt\u1E25 (Ptah, patron god of craftsmen, worshipped at Memphis)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/hypostyle-hall/group-3.webp",
        glyphs: [
          {
            symbol: "\u{131A3}",
            transliteration: "\u1E2Bpr",
            meaning: "Scarab \u2014 \u2018\u1E2Bpr\u2019 (to become), central to creation theology at Karnak",
            pronunciation: "kheh-per",
            origin: "A scarab (dung) beetle seen from above. It rolls its ball of dung like the sun across the sky, so it came to mean ‘come into being’.",
            history: "At Karnak, the giant granite scarab of Amenhotep III stands beside the sacred lake \u2014 one of the most photographed monuments in Egypt. Scarab imagery pervades temple decoration, symbolising the sun\u2019s daily rebirth.",
            culture: "The concept of \u2018\u1E2Bpr\u2019 (becoming, transformation) was central to temple theology. Morning rituals re-enacted creation \u2014 the priest opened the shrine at dawn, symbolically recreating the moment the sun first appeared. The scarab represented this eternal cycle.",
            examples: [
              "\u{131A3}\u{1308B} \u2014 \u1E2Bpr (to come into being, to transform)",
              "\u{131A3}\u{1308B}\u{13171} \u2014 \u1E2Bprw (manifestations, forms of a deity)",
            ],
          },
          {
            symbol: "\u{133CF}",
            transliteration: "t",
            meaning: "Bread loaf \u2014 ubiquitous feminine marker in offering lists on temple walls",
            pronunciation: "t as in time",
            origin: "A small round loaf of bread.",
            history: "Temple offering lists \u2014 carved on sanctuary walls \u2014 catalogued every item the god should receive daily. The bread loaf \u2018t\u2019 appears after every feminine noun in these lists, marking items like \u2018\u1E25nqt\u2019 (beer) and \u2018jrt\u2019 (milk).",
            culture: "Daily temple offerings were real \u2014 priests prepared food, placed it before the cult statue, then redistributed it to temple staff after the god had consumed its spiritual essence. This \u2018reversion of offerings\u2019 was a major economic institution.",
            examples: [
              "\u{133CF}\u{1313F} \u2014 t3 (bread, the staff of life)",
              "\u{133CF}\u{13171}\u{1309D} \u2014 tw\u0227 (to worship, to adore, with arms raised)",
            ],
          },
          {
            symbol: "\u{1308B}",
            transliteration: "r",
            meaning: "Mouth \u2014 preposition \u2018to/towards\u2019, extremely common in temple formulae",
            pronunciation: "r as in Ra",
            origin: "A human mouth seen from the front.",
            history: "As the preposition \u2018to\u2019 or \u2018towards\u2019, the mouth sign links virtually every verb to its object in temple inscriptions. \u2018Dj.n=j n=k\u2019 (I have given to you) is one of the most common phrases on temple walls.",
            culture: "Temple inscriptions are dialogues between king and god \u2014 the king offers Maat, food, or victories \u2018to\u2019 the god, and the god grants life, power, and stability \u2018to\u2019 the king in return. The mouth sign \u2018r\u2019 facilitates this reciprocal language.",
            examples: [
              "\u{1308B}\u{13216} \u2014 r-n (towards, for the benefit of)",
              "\u{1308B}\u{1309D} \u2014 r\uA725 (preposition + arm = a common compound)",
            ],
          },
        ],
      },
    ],
    exerciseConfig: {
      categories: [
        { name: "Royal Titles", glyphIndices: [0, 1, 3, 4] },
        { name: "Divine Names", glyphIndices: [2, 5, 6, 7] },
      ],
      decodeAvailable: true,
      fillInBlanks: [
        {
          inscription: "The house sign \u{13250} is read ___, as in the temple name “House of Amun”, and the sickle \u{13333} writes mꜣ, as in ___",
          answers: ["pr", "Maat"],
          distractors: ["nb", "Ankh"],
        },
      ],
    },
    sceneImage: "/lessons/hypostyle-hall/scene.webp",
    introVideo: "https://laaj85evae9yxbqi.public.blob.vercel-storage.com/hypostyle-hall-intro.mp4",
    cutsceneVideo: "/videos/cutscene-7.mp4",
    isFree: false,
    order: 7,
    category: "Advanced",
  },

  // ─── Lesson 8: The Inner Sanctum (was advanced-grammar) ───
  {
    id: "inner-sanctum",
    title: "The Inner Sanctum",
    areaName: "The Inner Sanctum",
    subtitle: "Complex Constructions",
    description:
      "At the heart of the temple lies the Inner Sanctum, where only the most learned scribes could compose the intricate texts inscribed on the shrine walls. Move beyond individual signs to understand how hieroglyphs combine into words, phrases, and sentences through biliteral and triliteral signs, phonetic complements, and honorific transposition.",
    narrativeIntro:
      "A final granite doorway opens into the smallest and most sacred chamber. The walls are covered with densely packed hieroglyphs -- complex sign groups that demand mastery of everything you have learned. This is the Inner Sanctum, and only a true scribe can read what is written here.",
    narrativeOutro:
      "You have reached the deepest chamber and deciphered its most complex texts. The expedition is complete. You now possess the skills of an ancient scribe -- the ability to read the words that pharaohs carved for eternity. The temple has given up its secrets.",
    difficulty: "advanced",
    duration: "35 min",
    glyphGroups: [
      {
        contextImage: "/lessons/inner-sanctum/group-1.webp",
        glyphs: [
          {
            symbol: "\u{131A3}",
            transliteration: "\u1E2Bpr",
            meaning: "Scarab \u2014 triliteral sign (three consonants in one glyph): \u1E2B + p + r",
            pronunciation: "kheh-per",
            origin: "A scarab (dung) beetle seen from above. It rolls its ball of dung like the sun across the sky, so it came to mean ‘come into being’.",
            history: "Triliteral signs were the pinnacle of scribal efficiency \u2014 one glyph replaced three separate consonant signs. The scarab \u2018\u1E2Bpr\u2019 was so commonly used that it became the textbook example of how triliterals work.",
            culture: "Learning triliterals was a milestone in scribal education. Students at the \u2018House of Life\u2019 (pr-\uA725n\u1E2B) spent years memorising which signs were uniliteral (1 consonant), biliteral (2), or triliteral (3). Mastering this was the difference between a novice and a competent scribe.",
            examples: [
              "\u{131A3}\u{1308B}\u{131CB} \u2014 \u1E2Bprj (Khepri, with phonetic complements r and j)",
              "\u{131A3}\u{1308B} \u2014 \u1E2Bpr (to become \u2014 r confirms the final consonant)",
            ],
          },
          {
            symbol: "\u{13250}",
            transliteration: "pr",
            meaning: "House \u2014 biliteral sign (two consonants): p + r",
            pronunciation: "per",
            origin: "The ground plan of a house: a rectangle with a gap for the door.",
            history: "The house plan is the most commonly cited example of a biliteral sign. It encodes two consonants (p + r) in a single glyph, appearing in thousands of words from \u2018house\u2019 to \u2018to go out\u2019 to \u2018hero\u2019.",
            culture: "Biliteral signs created a challenge for readers \u2014 how do you know if \u2018pr\u2019 means \u2018house\u2019, \u2018to go forth\u2019, or something else? The answer was determinatives: a house-shaped determinative after \u2018pr\u2019 meant the building, walking legs meant the action of going out.",
            examples: [
              "\u{13250}\u{1308B}\u{133CF} \u2014 prt (seed, offspring \u2014 r and t are phonetic complements)",
              "\u{13250}\u{1308B} \u2014 pr (to go forth \u2014 r confirms the reading)",
            ],
          },
          {
            symbol: "\u{131CC}",
            transliteration: "jj",
            meaning: "Double reed \u2014 biliteral sign used in verb forms and as dual marker",
            pronunciation: "ee",
            origin: "Two reeds side by side.",
            history: "The double reed evolved from simply writing the single reed twice. Over time, it became a distinct sign with its own grammatical functions, particularly in marking verb forms and the dual number.",
            culture: "The double reed is one of the clearest examples of how the hieroglyphic system evolved. What started as a practical shortcut (two reeds drawn together) became formalised into a grammatically distinct sign \u2014 a process called ligature.",
            examples: [
              "\u{131CC}\u{131CB} \u2014 jj (to come \u2014 a common verb in narrative texts)",
              "\u{131CC}\u{13171} \u2014 jw (particle marking statements of fact)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/inner-sanctum/group-2.webp",
        glyphs: [
          {
            symbol: "\u{132F4}",
            transliteration: "s",
            meaning: "Folded cloth \u2014 phonetic complement confirming final consonant of a word",
            pronunciation: "s as in sun",
            origin: "A folded piece of linen.",
            history: "Phonetic complements are single-consonant signs written after multi-consonant signs to confirm the reading. The folded cloth \u2018s\u2019 frequently appears after signs ending in \u2018s\u2019, removing ambiguity for the reader.",
            culture: "Phonetic complements were a scribal courtesy \u2014 they helped less experienced readers parse complex sign groups. Expert scribes sometimes omitted them in informal writing, but formal temple and tomb inscriptions almost always included them.",
            examples: [
              "\u{132F4}\u{1308B} \u2014 s + r (phonetic complement after a biliteral ending in s)",
              "\u{132F4}\u{133CF} \u2014 st (seat, place \u2014 s is the base, t is the feminine ending)",
            ],
          },
          {
            symbol: "\u{13216}",
            transliteration: "n",
            meaning: "Water \u2014 genitive particle \u2018n\u2019 (of/belonging to), crucial for grammar",
            pronunciation: "n as in name",
            origin: "A zigzag ripple on the surface of water.",
            history: "The genitive particle \u2018n\u2019 is one of the most important grammatical words in Egyptian \u2014 equivalent to the English word \u2018of\u2019. It appears in nearly every inscription linking a person to their title, a god to their temple, or a king to their epithet.",
            culture: "Understanding \u2018n\u2019 unlocks the structure of Egyptian sentences. \u2018s\u0227 n R\uA725\u2019 means \u2018son of Ra\u2019, \u2018pr n jmn\u2019 means \u2018temple of Amun\u2019. Without recognising this particle, even a reader who knows every hieroglyph cannot parse the grammar.",
            examples: [
              "\u{13216} \u{131F3} \u2014 n r\uA725 (of Ra, belonging to Ra)",
              "\u{13216} \u{13216}\u{133CF}\u{1308B} \u2014 n n\u1E6Fr (of the god, divine)",
            ],
          },
          {
            symbol: "\u{13153}",
            transliteration: "m",
            meaning: "Owl \u2014 preposition \u2018m\u2019 (in/from/with), one of the most common words",
            pronunciation: "m as in mother",
            origin: "An owl, the one bird sign that looks straight at you.",
            history: "The preposition \u2018m\u2019 is the second most common grammatical word after \u2018n\u2019. It means \u2018in\u2019, \u2018from\u2019, \u2018with\u2019, or \u2018as\u2019 depending on context \u2014 a flexibility that makes it essential but sometimes ambiguous for modern translators.",
            culture: "In royal inscriptions, \u2018m\u2019 often introduces epithets: \u2018the king as (m) lord of the Two Lands\u2019 or \u2018appearing in (m) glory upon the throne\u2019. Recognising whether \u2018m\u2019 means \u2018in\u2019, \u2018from\u2019, or \u2018as\u2019 is one of the key interpretive skills in reading hieroglyphs.",
            examples: [
              "\u{13153} \u{13250} \u2014 m pr (in the house)",
              "\u{13153} \u{132B5}\u{133CF}\u{132AA} \u2014 m \u1E25tp (in peace, peacefully)",
            ],
          },
        ],
      },
      {
        contextImage: "/lessons/inner-sanctum/group-3.webp",
        glyphs: [
          {
            symbol: "\u{133E5}",
            transliteration: "(plural)",
            meaning: "Three strokes \u2014 plural determinative, marks nouns as plural",
            pronunciation: "silent (grammatical marker)",
            origin: "Three strokes: the plural, or the number three.",
            history: "The plural strokes were among the first grammatical devices added to the early writing system. Before their introduction, readers had to rely entirely on context to determine if a word was singular or plural.",
            culture: "Egyptian distinguished three grammatical numbers: singular (no marker), dual (two strokes), and plural (three strokes). This three-way distinction was gradually lost in later stages of the language \u2014 Coptic (the final stage) only has singular and plural.",
            examples: [
              "\u{1308B}\u{13153}\u{133CF}\u{133E5} \u2014 rm\u1E6Fw (people, humans \u2014 plural of person)",
              "\u{131CB}\u{1339B}\u{133E5} \u2014 j\u1E25w (cattle, plural of ox)",
            ],
          },
          {
            symbol: "\u{1309D}",
            transliteration: "\uA725",
            meaning: "Arm \u2014 pharyngeal consonant, also appears in the suffix pronoun \u2018\uA725\u2019",
            pronunciation: "ah (guttural)",
            origin: "A forearm with the palm turned up.",
            history: "The arm sign reappears here in a grammatical context. As a suffix pronoun, it could mean \u2018his\u2019 or \u2018her\u2019 in certain verb forms \u2014 a usage that required students to distinguish it from the identical-looking consonant sign.",
            culture: "Context was king in Egyptian grammar. The same arm sign could be a consonant, a pronoun, a preposition, or part of a longer word. Scribes relied on determinatives, word order, and grammatical patterns to disambiguate \u2014 skills that took years of training to master.",
            examples: [
              "\u{1309D}\u{13216}\u{1340D} \u2014 \uA725n\u1E2B (to live \u2014 the ankh, most famous hieroglyph compound)",
              "\u{1309D}\u{1313F} \u2014 \uA7253 (great \u2014 adjective used in royal epithets)",
            ],
          },
        ],
      },
    ],
    exerciseConfig: {
      categories: [
        { name: "Biliteral", glyphIndices: [1, 2, 3] },
        { name: "Triliteral", glyphIndices: [0, 4, 5, 6, 7] },
      ],
      decodeAvailable: true,
      fillInBlanks: [
        {
          inscription: "The scarab \u{131A3} (ḫpr) is a ___ sign, and the house \u{13250} (pr) is a ___ sign",
          answers: ["triliteral", "biliteral"],
          distractors: ["uniliteral", "determinative"],
        },
      ],
    },
    sceneImage: "/lessons/inner-sanctum/scene.webp",
    introVideo: "https://laaj85evae9yxbqi.public.blob.vercel-storage.com/inner-sanctum-intro.mp4",
    isFree: false,
    order: 8,
    category: "Mastery",
  },
];
