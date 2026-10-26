export type BlogFAQ = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  /** The search-result title, when it should differ from the on-page title (e.g. lead with the glyph people search for). */
  metaTitle?: string;
  excerpt: string;
  /** The search-result description, when it should differ from the excerpt shown on cards. */
  metaDescription?: string;
  /**
   * A direct, 1–3 sentence answer to the question the post title poses.
   * Rendered first on the page and used as the Article `abstract` so search
   * engines and AI assistants can quote it verbatim.
   */
  quickAnswer: string;
  date: string;
  /** ISO-8601 publish date (YYYY-MM-DD). Used for sitemap lastmod and Article JSON-LD. */
  publishedAt: string;
  /**
   * ISO-8601 date of the last substantive revision. Set this when you actually
   * change the content — it drives sitemap lastmod, Article dateModified and the
   * visible "Updated …" line. Leave unset for untouched posts.
   */
  updatedAt?: string;
  category: string;
  glyph: string;
  image: string;
  imageAlt: string;
  relatedSlugs: string[];
  faqs: BlogFAQ[];
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    // (2026-10-24, with /write-your-name-in-cuneiform: a test of demand for cuneiform before building a course)
    slug: "cuneiform-vs-hieroglyphs",
    title: "Cuneiform vs. Hieroglyphs: The World's Two Oldest Scripts",
    metaTitle: "Cuneiform vs. Hieroglyphs: Which Is Older, and How They Differ",
    excerpt:
      "Cuneiform and Egyptian hieroglyphs were invented within a century or two of each other. Which came first, how differently they work, and the moments the two scripts met.",
    metaDescription:
      "Is cuneiform older than hieroglyphs? Both date to about 3300–3200 BCE. How the world's two oldest scripts differ, where they met, and how both were deciphered.",
    quickAnswer:
      "Cuneiform and Egyptian hieroglyphs are the **two oldest writing systems** we know, and they appeared at almost the same time: cuneiform in Sumer (southern Iraq) around **3400–3200 BCE**, hieroglyphs in Egypt around **3250 BCE**. Neither is clearly first. Cuneiform is wedges pressed into clay, with signs for **syllables**; hieroglyphs are pictures carved or painted, with signs for **consonants**. Both also use word signs and silent classifiers.",
    date: "October 2026",
    publishedAt: "2026-10-24",
    category: "History",
    glyph: "𓏞",
    image: "/blog/cuneiform-and-hieroglyphs-side-by-side.webp",
    imageAlt: "The name Harry written twice, side by side: in Babylonian cuneiform wedges on a clay-coloured panel and in Egyptian hieroglyphs on a stone-coloured panel",
    relatedSlugs: ["hieroglyphs-vs-hieratic-vs-demotic", "how-the-rosetta-stone-changed-everything", "is-it-hard-to-learn-hieroglyphics"],
    faqs: [
      {
        question: "Which is older, cuneiform or hieroglyphs?",
        answer:
          "Neither is clearly older. The earliest cuneiform tablets, from the Eanna temple district at Uruk in southern Iraq, are dated to about 3400–3200 BCE. The earliest hieroglyphs, on small bone and ivory labels from tomb U-j at Abydos, are dated to about 3250 BCE. The ranges overlap, so the two scripts are best thought of as contemporaries.",
      },
      {
        question: "Is cuneiform the oldest language?",
        answer:
          "Cuneiform is a script, not a language. The first language written in it was Sumerian, which with Egyptian is one of the two oldest written languages. Which spoken language is oldest cannot be known, because speech leaves no trace before it is written down.",
      },
      {
        question: "Did Egyptian hieroglyphs come from cuneiform?",
        answer:
          "Probably not. Late Predynastic Egypt did trade with Mesopotamia and borrowed some things, such as cylinder seals and certain artistic motifs, so some scholars think the idea of writing may have travelled too. But Egyptian signs, materials and rules owe nothing visible to cuneiform, and since the Abydos labels were dated to about 3250 BCE most Egyptologists see two independent inventions.",
      },
      {
        question: "Did the ancient Egyptians use cuneiform?",
        answer:
          "Yes, for diplomacy. The Amarna letters, about 380 clay tablets from the 14th century BCE found at Akhenaten's capital in Egypt, are letters between the pharaohs and the kings of Babylon, Assyria, Mitanni and the Hittites and the rulers of Canaan, written in Akkadian cuneiform. Scribes in Egypt trained to read and write it.",
      },
      {
        question: "Is cuneiform harder to learn than hieroglyphs?",
        answer:
          "It is harder to start. Hieroglyphs have a core of 25 signs for single sounds, so a beginner can spell names within an hour. Cuneiform has no single-sound signs: even a short Babylonian text needs a hundred or more syllable signs, each with several possible readings. Both take years to read fluently.",
      },
    ],
    content: `## Cuneiform vs. Hieroglyphs at a Glance

Cuneiform and hieroglyphs are the world's two oldest scripts, born a century or two apart, about 1,500 kilometres from each other, and built on the same three kinds of sign. What separates them is the clay, the wedge and, above all, the vowels.

| | Cuneiform | Egyptian hieroglyphs |
|---|---|---|
| **First written** | c. 3400–3200 BCE, Uruk (Iraq) | c. 3250 BCE, Abydos (Egypt) |
| **Looks like** | Wedge-shaped marks | Pictures: birds, people, reeds |
| **Written on** | Clay, pressed with a reed | Stone, wood, papyrus |
| **Sound signs stand for** | Syllables, vowels included | Consonants only |
| **Signs in use** | About 600 | About 700 (Middle Egyptian) |
| **Languages** | Sumerian, Akkadian, Hittite and more | Egyptian only |
| **Direction** | Left to right | Usually right to left |
| **Last used** | c. 75 CE | 394 CE |
| **Deciphered** | 1850s (Behistun inscription) | 1822 (Rosetta Stone) |

You can see the difference on your own name: the [cuneiform name converter](/write-your-name-in-cuneiform) writes it in Babylonian syllables, and the [name translator](/translate-name-to-hieroglyphics) writes it in Egyptian hieroglyphs in a cartouche.

## Which Came First, Cuneiform or Hieroglyphs?

Neither, clearly. The oldest cuneiform tablets come from the temple district of Eanna at Uruk, a city of perhaps 40,000 people in what is now southern Iraq, and are dated to about 3400–3200 BCE. They are lists: sheep, grain, beer rations, workers, written in signs that are still mostly pictures.

In Egypt, German excavators working at Abydos in 1988 found more than 150 small bone and ivory labels in tomb U-j, once tied to goods buried with an early ruler. Their signs are already hieroglyphs, some of them sound signs spelling place names, and the tomb is dated to about 3250 BCE.

The two date ranges overlap. Anyone who tells you confidently which script is older is going further than the evidence. What is certain is that writing was invented in Mesopotamia and Egypt first, and later, quite separately, in China and in Mesoamerica.

## Did Egypt Borrow the Idea of Writing?

It is possible but unproven. Late Predynastic Egypt was in touch with Mesopotamia: Mesopotamian-style cylinder seals, a hero taming two lions on the ivory handle of the Gebel el-Arak knife, and niched brick walls all appear in Egypt around this time. So some scholars think Egyptians heard that the Sumerians wrote, and invented their own way of doing it, which is called stimulus diffusion.

Against that, nothing in the Egyptian system looks borrowed. The signs are Egyptian things (the Nile's reeds, Egyptian birds and tools), the materials are different, and the rules are different: hieroglyphs spell with consonants, cuneiform with syllables. Since the Abydos labels pushed Egyptian writing back to about the same date as Uruk, most Egyptologists see two independent inventions.

## How Do the Two Scripts Work?

Both mix three kinds of sign, and that shared design is the most striking thing about them.

**Word signs (logograms).** A single sign writes a whole word. In Egyptian the flag on a pole 𓊹 is *nṯr*, "god". In Sumerian the star 𒀭 is *dingir*, "god", and in Akkadian it reads *ilum*.

**Sound signs (phonograms).** Signs used for their sound alone, to spell. Here the scripts part ways. Egyptian sound signs write consonants and ignore vowels: there are [25 signs for single consonants](/hieroglyphic-alphabet) and more for pairs and triples. Cuneiform sound signs write syllables with their vowels, such as *ba*, *ri* or *ak*, and there are no signs for a consonant alone. So Egyptian *nfr*, "good", gives you no vowels at all, while a Babylonian spelling like *ḫa-am-mu-ra-bi* gives you every one.

**Silent classifiers (determinatives).** Signs that are not read but tell you what kind of word you are looking at. Egyptian puts them after the word: a man's name ends with a seated man 𓀀, a word for walking with a pair of legs. Cuneiform usually puts them before: the star 𒀭 before a god's name, a single upright wedge 𒁹 before a man's name, the sign for "wood" before anything wooden, and the sign for "place" 𒆠 after a city.

**Pictures that stayed pictures.** Cuneiform signs began as drawings scratched in clay, but pressing a reed into clay makes wedges, not curves, and within a few centuries the pictures became abstract groups of wedges. Hieroglyphs on monuments stayed recognisable pictures for 3,500 years; Egyptian scribes got their speed from a separate pen script, [hieratic](/blog/hieroglyphs-vs-hieratic-vs-demotic), instead.

## Why Did Cuneiform Spread and Hieroglyphs Not?

Because cuneiform was written by many peoples and hieroglyphs by one. Cuneiform was made for Sumerian, but the Akkadians who lived alongside the Sumerians adapted it to their own language, and from Akkadian it spread to the Hittites in Anatolia, the Elamites in Iran, the Hurrians and Urartians, and to every royal chancery of the Near East. A syllable script carries over to a new language more easily than one that writes only consonants and leans on the reader to know the words.

Hieroglyphs, by contrast, were bound to Egyptian and to Egyptian temples and tombs. Their great descendant is indirect: workers in Sinai borrowed a handful of Egyptian signs to write their own Semitic language around 1800 BCE, and that experiment became the ancestor of the alphabet you are reading now.

## Where Did Cuneiform and Hieroglyphs Meet?

At the courts of the pharaohs. In 1887 a local woman digging at Amarna, Akhenaten's short-lived capital, found clay tablets that turned out to be the Egyptian foreign office's archive: about 380 cuneiform letters from around 1360 to 1330 BCE. Kings of Babylon, Assyria, Mitanni and the Hittites write to the pharaoh as "my brother", haggle over gold and marriages, and complain about slow messengers, while the rulers of Canaanite cities beg for troops. All of it is in Akkadian, the diplomatic language of the age, and Egyptian scribes learned it: copies of Babylonian myths used for practice were found among the letters.

A century later, around 1259 BCE, Ramesses II and the Hittite king Hattusili III made peace after decades of war that included the battle of Kadesh. Both versions survive: the Hittite copy in Akkadian cuneiform on clay tablets from the Hittite capital, Hattusa, and the Egyptian version in hieroglyphs on the walls of Karnak and the Ramesseum. It is the oldest peace treaty we can read from both sides.

## How Were Cuneiform and Hieroglyphs Deciphered?

Both died out, and both were read again through inscriptions that repeated a text in several scripts. The last cuneiform tablets, astronomical records from Babylonia, date to around 75 CE; the [last hieroglyphic inscription](/blog/how-the-rosetta-stone-changed-everything) was carved at Philae in 394 CE.

For hieroglyphs the key was the Rosetta Stone, with Greek alongside two Egyptian scripts, and Champollion announced the breakthrough in 1822. For cuneiform it was a cliff face: the inscription of the Persian king Darius I at Behistun in western Iran, carved around 520 BCE in Old Persian, Elamite and Babylonian. Henry Rawlinson copied it, sometimes hanging from ropes, and Old Persian, the simplest of the three, gave the way into the others.

Babylonian proved so complicated, one sign with many readings, that many doubted it had really been read. So in 1857 the Royal Asiatic Society sent a newly found inscription of the Assyrian king Tiglath-Pileser I to four scholars, Rawlinson, Edward Hincks, William Henry Fox Talbot and Julius Oppert, to translate without consulting one another. Their versions agreed closely, and cuneiform was declared deciphered.

## Which Should You Learn First?

For most people, hieroglyphs. The 25 single-consonant signs let you spell names and read short words in your first hour, the signs are pictures you can remember, and museums everywhere are full of them. Cuneiform asks for more up front: you need a hundred or more syllable signs, and the habit of choosing between their readings, before a Babylonian sentence opens up.

If you want to try both, start with your own name: in [cuneiform](/write-your-name-in-cuneiform) and in [hieroglyphs](/translate-name-to-hieroglyphics). Then the [free first lesson](/lessons/expedition-begins) teaches you the Egyptian alphabet sign by sign, starting with the signs of that name.`,
  },
  {
    slug: "tutankhamun-tomb-discovery-anniversary",
    title: "4 November 1922: The Day Tutankhamun's Tomb Was Found",
    metaTitle: "Tutankhamun's Tomb Discovery: 4 November 1922, Day by Day",
    excerpt:
      "On 4 November 1922 a single step cut into the rock of the Valley of the Kings led Howard Carter to the only royal tomb found almost intact. Here is the discovery day by day, and what the seals on its door said.",
    metaDescription:
      "Tutankhamun's tomb was found on 4 November 1922. The discovery day by day, from the first step to 'wonderful things', and how Carter read the king's name on the sealed door.",
    quickAnswer:
      "Tutankhamun's tomb (KV62) was found on **4 November 1922**, when Howard Carter's workmen uncovered a step cut into the bedrock of the Valley of the Kings. Carter first looked inside on **26 November 1922**, and the burial chamber was officially opened on **16 February 1923**. It is the only royal tomb of the New Kingdom found with its treasure largely intact, and Carter knew whose it was before he went in: the king's name was stamped in hieroglyphs on the plaster of the sealed door.",
    date: "October 2026",
    publishedAt: "2026-10-20",
    category: "History",
    glyph: "𓃣",
    image: "/blog/tutankhamun-tomb-discovery-1922.webp",
    imageAlt: "A staircase cut into the limestone of the Valley of the Kings, leading down to a plastered doorway stamped with oval seals",
    relatedSlugs: ["tutankhamun-cartouche-explained", "reading-your-first-cartouche", "how-the-rosetta-stone-changed-everything"],
    faqs: [
      {
        question: "When was Tutankhamun's tomb discovered?",
        answer:
          "The first step of the staircase was found on 4 November 1922. Howard Carter first looked into the tomb by candlelight on 26 November 1922, the antechamber was officially opened on 29 November, and the sealed burial chamber was officially opened on 16 February 1923. Clearing and recording the more than 5,000 objects took until 1932.",
      },
      {
        question: "Who discovered Tutankhamun's tomb?",
        answer:
          "The British archaeologist Howard Carter, working for and funded by George Herbert, the 5th Earl of Carnarvon. The step itself was uncovered by the Egyptian workmen of Carter's team, who were clearing the remains of ancient workmen's huts below the tomb of Ramesses VI. A later, often repeated story credits a young water carrier, Hussein Abdel Rassoul, with finding it.",
      },
      {
        question: "How did Carter know it was Tutankhamun's tomb?",
        answer:
          "From the seals. The plaster blocking the doorway was stamped with two kinds of seal: the seal of the royal necropolis, a jackal crouching over nine bound captives, and lower down seals bearing Tutankhamun's throne name, Nebkheperure, inside a cartouche. Carter could read the cartouche, so he knew whose tomb it was before the door was opened.",
      },
      {
        question: "What did Carter say when he first saw inside the tomb?",
        answer:
          "In his published account, when Lord Carnarvon asked 'Can you see anything?', Carter replied 'Yes, wonderful things.' His own notebook records the moment a little differently, but the published words are the ones that became famous. He was looking through a small hole in the second doorway by the light of a candle, at the gilded furniture of the antechamber.",
      },
      {
        question: "Had Tutankhamun's tomb been robbed?",
        answer:
          "Yes, but only lightly. Robbers broke in at least twice not long after the burial, and the tomb was tidied and resealed by the necropolis officials. Carter saw the evidence on the very first door: patches of the plaster had been broken through and filled in again, stamped with the necropolis seal. Because the tomb was then buried under debris and later huts, it escaped the great robberies that emptied the other royal tombs.",
      },
      {
        question: "Where are Tutankhamun's treasures now?",
        answer:
          "Most of them are at the Grand Egyptian Museum in Giza, which brought the tomb's contents together in its own galleries. The king's mummy is still in his tomb, KV62, in the Valley of the Kings, where visitors can see it.",
      },
    ],
    content: `## One Step in the Rock

On the morning of **4 November 1922**, the men of Howard Carter's team were clearing the stone footings of some ancient workmen's huts below the tomb of Ramesses VI, in the Valley of the Kings. Under the first hut they found a step cut into the bedrock.

It was the last season Carter's patron, Lord Carnarvon, had agreed to pay for. Carter had been searching the valley since 1917 and had found nothing worth the money. Most Egyptologists believed the valley was exhausted: every royal tomb in it had been found, and every one had been robbed in antiquity.

The step led down. By the next evening the workmen had cleared twelve of them and reached the top of a doorway, blocked with stones and sealed with plaster. This year marks **104 years** since that first step, and the tomb at the bottom of it is still the most famous archaeological discovery ever made.

## The Discovery, Day by Day

- **4 November 1922:** the first step is found under the huts.
- **5 November:** the staircase is cleared to the top of a plastered doorway stamped with seals.
- **6 November:** Carter refills the staircase and cables Carnarvon in England: *"At last have made wonderful discovery in Valley; a magnificent tomb with seals intact; re-covered same for your arrival; congratulations."*
- **23 November:** Carnarvon arrives in Luxor with his daughter, Lady Evelyn Herbert.
- **24 November:** all sixteen steps are cleared. On the lower part of the door, seals carry the king's name.
- **25 November:** the first doorway is taken down. Behind it is a sloping corridor packed with rubble.
- **26 November:** at the end of the corridor is a second sealed door. Carter makes a small hole, holds up a candle and looks in. Carnarvon asks if he can see anything. In Carter's published words: *"Yes, wonderful things."*
- **29 November:** the antechamber is officially opened to officials and the press.
- **16 February 1923:** the sealed burial chamber is officially opened. Inside is a gilded shrine almost filling the room.
- **5 April 1923:** Lord Carnarvon dies in Cairo from an infected mosquito bite, and the legend of the "curse" is born in the newspapers.
- **28 October 1925:** the lid of the innermost coffin, of solid gold, is lifted, and the golden mask is seen for the first time in more than 3,200 years.

Clearing the four small rooms took ten years. Carter and his team recorded, photographed and conserved more than 5,000 objects before the last of them left the tomb in 1932.

## What the Seals Said

Carter did not need to open the door to know whose tomb he had found. He could read it.

The plaster over the blocked doorway had been stamped, while still wet, with oval seals, over and over. There were two kinds.

**The necropolis seal.** A jackal lying on a shrine, 𓃣, above nine bound captives. The jackal is Anubis, guardian of the dead and of the cemetery; the nine captives are the "Nine Bows", the traditional enemies of Egypt, held down beneath him. This was the seal of the officials who guarded the royal tombs. It said: this tomb is closed and under protection. It is the same jackal sign that writes the god's name in the offering formula, as on the [false door of Neferiu](/games/stela) in our Stela Reader.

**The king's own seals.** Lower on the door were seals with a cartouche, and inside it four signs: **𓇳𓎟𓆣𓏥**. The sun disc of Ra, a basket, a scarab beetle and three strokes: *nb-ḫprw-rꜥ*, **Nebkheperure**, the throne name of Tutankhamun. Carter knew it at once; the name had turned up on a few small objects found in the valley years before, which is part of why he believed the king's tomb was still there to be found.

Those two seals, the jackal and the cartouche, are the whole story of the tomb in miniature: a king's name, and a promise that the dead would be left alone. The [sign-by-sign guide to Tutankhamun's cartouches](/blog/tutankhamun-cartouche-explained) shows how to read both of his names.

## A Tomb That Had Been Robbed, and Saved

The seals told Carter something else, less welcome. In places the plaster had been broken through and patched, and the patches carried only the necropolis seal. Robbers had got in, probably within a few years of the burial, and the guards had tidied up after them and closed the door again.

The robbers were caught or disturbed early, and took mostly small things: metals, oils, linen. Then the entrance disappeared. When Ramesses VI's tomb was cut into the hillside above, about two hundred years later, its workmen built their huts right over Tutankhamun's staircase and buried it under their debris. That is why every other royal tomb in the valley was emptied and this one was not.

## Why It Still Matters

Tutankhamun was not an important king. He came to the throne as a boy, ruled for about ten years in the 14th century BCE, and died at around nineteen. His tomb is small and was finished in a hurry.

That is exactly what makes it astonishing. If this is what Egypt buried with a minor king in a small tomb, the burials of Ramesses II or Thutmose III must have been beyond imagining. The tomb gave Egyptology a complete royal burial to study for the first time: the coffins nested inside each other, the shrines, the chariots, the beds, the food, the clothes, the texts painted on the walls and written on the objects.

And almost all of those objects are labelled. The king's two cartouches appear hundreds of times, on the mask, the shrines, the throne and the smallest boxes. Once you can read a cartouche, a visit to the treasures stops being a walk past gold and becomes a conversation with the people who made them.

## Read It Like Carter Did

You do not need years of study to read what Carter read on that door. A royal name is spelled with a handful of signs, and most of them come from the same small alphabet.

- **Read his names.** [Tutankhamun's Cartouche Explained](/blog/tutankhamun-cartouche-explained) takes both rings apart sign by sign.
- **See your own name in a cartouche.** The [free name translator](/translate-name-to-hieroglyphics) spells any name with the alphabet signs Tutankhamun's scribes used.
- **Learn the signs.** The [free first lesson](/lessons/expedition-begins) starts with your own name on a sealed door, fittingly, and teaches all 25 alphabet signs through real Egyptian words.`,
  },
  {
    slug: "is-it-hard-to-learn-hieroglyphics",
    title: "Is It Hard to Learn Hieroglyphics? An Honest Difficulty Guide",
    excerpt:
      "Is it hard to learn hieroglyphics? The alphabet takes a weekend, the sign system takes a few months and the grammar takes a year or more. Here is what is easy, what is hard, and how it compares to Latin, Chinese and Japanese.",
    quickAnswer:
      "Learning hieroglyphics is **easy to start and hard to finish**. The 25 alphabet signs take a weekend, and with 15–20 minutes a day most people can read royal names, titles and the offering formula on a museum stela within about three months. The hard part is Middle Egyptian grammar, which has no written vowels and a verb system unlike English, and reading continuous texts takes a year or more. With around 750 signs in total, it is far less to memorise than Chinese or Japanese.",
    date: "September 2026",
    publishedAt: "2026-09-30",
    category: "Guide",
    glyph: "𓄤",
    image: "/blog/is-it-hard/hero.webp",
    imageAlt: "A staircase of five steps showing how hard it is to learn hieroglyphics: alphabet signs (easy), two- and three-consonant signs, determinatives, no written vowels, and Middle Egyptian grammar (hard)",
    relatedSlugs: ["should-i-learn-hieroglyphics", "how-to-learn-hieroglyphics-online", "best-courses-to-learn-hieroglyphics"],
    faqs: [
      { question: "Is it hard to learn hieroglyphics?", answer: "It is easy to start and hard to finish. The 25 single-consonant 'alphabet' signs can be learned in a weekend, and reading names, royal titles and offering formulae on museum objects is realistic within about three months of 15–20 minutes a day. Reading continuous Middle Egyptian texts is genuinely hard, because the vowels are not written and the grammar works differently from English, and takes a year or more of steady study." },
      { question: "How many hieroglyphs do you need to learn?", answer: "About 750 signs were in regular use in Middle Egyptian, the classical stage of the language, but you do not need all of them. The 25 alphabet signs come first, and a working set of roughly 200 common signs covers most of what appears on royal names, titles and funerary inscriptions in museums. Later Ptolemaic temple inscriptions use thousands of signs, but they are a specialist subject." },
      { question: "Is hieroglyphics harder than Japanese or Chinese?", answer: "For the script, no. Reading Japanese needs the 2,136 jōyō kanji plus two kana syllabaries, and reading Chinese needs around 3,500 common characters; Middle Egyptian has about 750 signs and a small core does most of the work. The grammar is a different story, because you are learning a dead language from books with no native speakers, but most learners only want to read, not speak or write." },
      { question: "Is hieroglyphics harder than Latin?", answer: "The grammar is roughly comparable in effort. Egyptian nouns have no cases, which makes it simpler than Latin in one big way, but the verb system is unfamiliar and the vowels are never written, so you learn words as consonant skeletons like nfr ('good', pronounced nefer by convention). Latin has far more teaching material, which is the bigger practical difference." },
      { question: "How long does it take to learn to read hieroglyphics?", answer: "At 15–20 minutes a day: a weekend for the alphabet signs and names spelled with them; about a month for common royal names and titles such as 'son of Ra' and 'given life'; about three months for the offering formula and other set phrases on museum stelae; and a year or more, with a grammar book, for continuous texts such as tomb autobiographies or the Tale of Sinuhe." },
      { question: "Can you teach yourself hieroglyphics?", answer: "Yes. Most people who read hieroglyphs today learned for pleasure as adults, from books, online courses and study groups. A sensible self-taught path is the alphabet signs first, then names and cartouches, then common multi-consonant signs and determinatives, then Collier and Manley's How to Read Egyptian Hieroglyphs, then James Allen's Middle Egyptian for full grammar." },
      { question: "Can children learn hieroglyphics?", answer: "Yes, and they are often quicker than adults at the first stage. Children pick up the alphabet signs fast and love writing their names in a cartouche, which is why hieroglyphs are a staple of primary school lessons on ancient Egypt. The grammar is best left to older learners." },
    ],
    content: `## The Short Answer: Easy to Start, Hard to Finish

Learning hieroglyphics is much easier to start than people expect and harder to finish than they hope. The first step, the **[25 alphabet signs](/hieroglyphic-alphabet)**, takes a weekend. Reading the names, titles and prayers carved on most museum objects takes a few months. Reading a full Middle Egyptian story with a dictionary open takes a year or more, and that last stage is where the difficulty lives.

The reputation for difficulty comes from two true facts. There are hundreds of signs, and the ancient Egyptians themselves found it hard: scribes trained for years, and Egyptologists estimate that perhaps one person in a hundred could read. But you are not trying to become a temple scribe. You are an adult with a sign list, a grammar book and 4,000 years of hindsight, which makes the job very different.

The rest of this guide breaks the difficulty down layer by layer, so you can see exactly which parts are hard and decide how far you want to go. If you would rather find out by trying, you can [learn hieroglyphics](/) here one sign at a time, starting with a free lesson.

## Why Do Hieroglyphics Look So Hard?

Hieroglyphics look hard because they look like pictures, and pictures seem to have no rules. In fact the system is highly regular. Most signs stand for sounds, not ideas, and the same few dozen signs appear again and again.

Three things make a first glance at a temple wall bewildering:

- **There are no spaces or punctuation.** Words run straight into each other, so you learn to spot where one ends, often by the silent sign that closes it.
- **The direction changes.** Text can run right to left, left to right or in columns. The rule is simple once you know it: read towards the faces of the people and animals.
- **Signs are stacked in blocks.** Scribes arranged signs in neat squares for beauty, so a tall sign may sit beside two short ones stacked on top of each other. You read top before bottom, front before back.

Each of these costs you an afternoon of practice, not a year. None of them is the real difficulty.

## The Five Layers of Difficulty

![Five kinds of hieroglyphic sign: an alphabet sign (the foot, b), a two-consonant sign (the house, pr), a three-consonant sign (nfr, 'good'), a word sign (the sun disc, Ra) and a silent determinative (a seated man)](/blog/is-it-hard/five-kinds-of-sign.webp)

Here is how the difficulty builds, from the first sign to fluent reading:

| Layer | What you learn | Difficulty | Time at 15–20 min a day |
|---|---|---|---|
| 1. Alphabet signs | 25 signs, one consonant each | Easy | A weekend |
| 2. Two- and three-consonant signs | About 80 two-consonant and a few dozen common three-consonant signs | Steady | Weeks, learned as you meet them |
| 3. Determinatives | Silent signs that show a word's category | Steady | Weeks, alongside layer 2 |
| 4. No written vowels | Reading words as consonant skeletons in transliteration | Tricky | A few weeks to feel natural |
| 5. Middle Egyptian grammar | Verb forms, word order, set constructions | Hard | A year or more |

### Layer 1: The Alphabet Signs (Easy)

Twenty-five signs each stand for a single consonant: the foot 𓃀 is *b*, the mouth 𓂋 is *r*, the water ripple 𓈖 is *n*. They are as easy to learn as any alphabet, and many are memorable pictures. Once you know them you can already read names written phonetically, which is how foreign rulers like [Cleopatra and Ptolemy](/blog/reading-your-first-cartouche) wrote theirs. You can try it on your own name in the [name translator](/translate-name-to-hieroglyphics).

### Layer 2: Signs for Two or Three Sounds (Steady)

This is the layer that surprises people. Many signs stand for two consonants, like the house 𓉐 *pr*, or three, like 𓄤 *nfr* "good, beautiful". Scribes usually added alphabet signs after them as a spelling check, so "good" is normally written 𓄤𓆑𓂋: *nfr* plus *f* plus *r*. These helpers are called phonetic complements, and they make the bigger signs much easier to learn, because the answer is written right next to them.

You do not learn these from a list. You meet them in real words and names, a few at a time.

### Layer 3: Determinatives (Steady)

A determinative is a silent sign at the end of a word that tells you what kind of thing it is: a seated man 𓀀 for people, a house plan for buildings, a papyrus roll for abstract ideas. The word for "scribe" is written 𓏞𓀀, the scribe's palette and a seated man. Determinatives look like extra work but they are a gift: they mark where words end and give you a clue to the meaning before you have read the sounds.

### Layer 4: No Written Vowels (Tricky)

Egyptian writing records consonants only. The word for "good" is written *nfr*, and nobody knows exactly how it was pronounced. Egyptologists fill the gaps with a conventional *e*, so *nfr* is said "nefer" (as in Nefertiti). This means learning a transliteration alphabet with a few unusual letters, such as ꜣ, ꜥ, ḥ and ḫ, which is fiddly for a few weeks and then becomes second nature.

### Layer 5: Middle Egyptian Grammar (Hard)

Here is the honest part. Middle Egyptian, the classical form of the language used on most monuments, puts the verb first and builds tenses by adding pieces to the verb. "He heard" is *sḏm.n.f*: *sḏm* "hear", *n* marking the past, *f* "he", written 𓋴𓄔𓅓𓈖𓆑. There is no one to talk to and you are learning from books, so it takes patience.

It also has mercies. Nouns have no cases, unlike Latin or Greek, and the texts on monuments repeat the same formulae endlessly, so you see the same constructions many times over.

## How Many Hieroglyphs Do You Need to Learn?

![Bar chart comparing how many signs you have to learn: English alphabet 26, hieroglyph alphabet signs 25, signs for most museum texts about 200, full Middle Egyptian sign list about 750, Japanese jōyō kanji 2,136 and Chinese common characters 3,500](/blog/is-it-hard/signs-compared.webp)

About 750 signs were in regular use in Middle Egyptian, and Alan Gardiner's standard sign list, still used by every student, catalogues around that many. But you do not need anything like all of them to start reading. The 25 alphabet signs come first, and a working set of **roughly 200 common signs** covers most of what appears on royal names, titles and funerary inscriptions in museums.

The figure you may have seen of "thousands of hieroglyphs" is also true, but it refers to the temples of the Greek and Roman periods, when priests invented new signs freely. That is a specialist subject you can ignore for years.

## Is Hieroglyphics Harder Than Other Languages?

It depends which half of the job you mean, the script or the language.

**Compared with Chinese and Japanese, the script is far lighter.** Reading Japanese needs the 2,136 jōyō kanji plus two syllabaries; reading Chinese needs about 3,500 common characters. Hieroglyphic writing is mostly sound-based and sits much closer to an alphabet.

**Compared with Latin, the grammar is similar in effort.** Egyptian has no noun cases, which removes one of Latin's biggest hurdles, but its verb system is unfamiliar and the missing vowels mean you learn words as consonant skeletons. Latin has far more textbooks, readers and teachers, which is the bigger practical difference.

**Compared with a modern language, it is easier in one crucial way.** You never have to speak, listen or keep up in conversation. Hieroglyphics is a reading skill, learned at your own pace, and you decide how far to take it.

## What Can You Read, and How Soon?

![Timeline of what you can read in hieroglyphics and when: names spelled with the alphabet after a weekend, royal names and titles after a month, the offering formula on a museum stela after three months, continuous Middle Egyptian texts after a year or more](/blog/is-it-hard/reading-timeline.webp)

At 15–20 minutes a day, a realistic path looks like this:

- **After a weekend:** names spelled with the alphabet signs, including your own and Cleopatra's.
- **After a month:** common royal names and titles, like "son of Ra" 𓅭𓇳 and "given life" 𓏙𓋹, which appear on almost every royal monument. [Tutankhamun's cartouche](/blog/tutankhamun-cartouche-explained) is a good milestone.
- **After three months:** the offering formula 𓇓𓏏𓊵𓏙 (*ḥtp-dj-nswt*, "an offering which the king gives") that opens most funerary stelae, plus the names and titles that follow it. This alone unlocks a large share of the inscriptions in any Egyptian gallery.
- **After a year or more:** continuous Middle Egyptian with a grammar and dictionary: tomb autobiographies, letters and literature such as the *Tale of Sinuhe*.

Most people who want to read museum objects are happy by the third stage, and that part is not hard at all. The fourth stage is a proper language course.

## Why Do People Give Up on Hieroglyphics?

Most people who give up do so because they studied in the wrong order, not because the script is too hard. The common traps:

- **Starting with a heavy grammar.** Gardiner's *Egyptian Grammar* is a classic reference but a brutal first book. Start with the signs and short real texts, and save full grammar for later.
- **Learning signs from a list without reading.** A list of 200 signs is dull and forgettable. Meeting the same signs in names and formulae makes them stick.
- **Stopping after the alphabet.** The first real inscriptions use two- and three-consonant signs, and the jump feels like a wall. Push through a few weeks of layer 2 and it becomes a pattern.
- **Studying in bursts.** Two hours once a week is worse than 15 minutes a day. Short, frequent sessions and flashcards beat marathon sessions.

## How to Make Learning Hieroglyphics Easier

The order matters more than the effort. This sequence keeps each step small:

1. **Learn the 25 alphabet signs.** The [free first lesson](/get-started) covers them as a short game, in three sections of about ten minutes.
2. **Read names.** Your own, then [cartouches](/blog/reading-your-first-cartouche) of Cleopatra, Ptolemy and Tutankhamun.
3. **Add common multi-consonant signs and determinatives** as they appear in names and titles.
4. **Learn the set phrases:** royal titles and the offering formula. You will see them everywhere.
5. **Pick up a beginner's grammar.** Collier and Manley's *How to Read Egyptian Hieroglyphs* is the gentlest; James Allen's *Middle Egyptian* is the thorough one. See [the best courses to learn hieroglyphics](/blog/best-courses-to-learn-hieroglyphics) for a full comparison.

Visit a museum, or browse an online collection, as soon as you know the alphabet. Recognising a single name on a real object does more for your motivation than any worksheet. For a longer plan, [how to learn hieroglyphics online](/blog/how-to-learn-hieroglyphics-online) sets out the steps in order, and [should I learn hieroglyphics?](/blog/should-i-learn-hieroglyphics) helps you decide whether it is worth it for you.

## So, Is It Hard?

Reading your first name in hieroglyphs is easy, and it happens in the first hour. Reading museum inscriptions is very achievable with a few months of short daily practice. Reading Egyptian literature is hard, rewarding work that takes a year or more. You choose the stopping point, and every stage along the way lets you read something real.

The quickest way to find out how hard it is for you is to try: [learn your first signs free](/get-started), and see how it feels.`,
  },
  {
    slug: "tutankhamun-cartouche-explained",
    title: "Tutankhamun's Cartouche Explained, Sign by Sign",
    excerpt:
      "Tutankhamun had two cartouches: the throne name Nebkheperure and the birth name Tutankhamun. Here is what each sign says, why Amun is written first, and how the boy king's name changed.",
    quickAnswer:
      "Tutankhamun's birth-name cartouche reads *twt-ꜥnḫ-ꞽmn*, 'living image of Amun': the god's name Amun (𓇋𓏠𓈖) is written first out of respect but spoken last, then *twt* 'image' (𓏏𓅱𓏏) and the ankh 𓋹 'living'. His throne-name cartouche, Nebkheperure (𓇳𓎟𓆣𓏥), means 'lord of the manifestations of Ra'. He was born Tutankhaten, 'living image of the Aten', and the name was changed when Egypt returned to the old gods.",
    date: "September 2026",
    publishedAt: "2026-09-09",
    category: "Tutorial",
    glyph: "𓋹",
    image: "/blog/tutankhamun-cartouche-explained.webp",
    imageAlt: "Tutankhamun's two cartouches in gold hieroglyphs on dark stone: the throne name Nebkheperure and the birth name Tutankhamun",
    relatedSlugs: ["reading-your-first-cartouche", "what-does-the-ankh-symbol-mean", "5-hieroglyphs-you-already-know"],
    faqs: [
      { question: "What does Tutankhamun's cartouche say?", answer: "His birth-name cartouche says twt-ꜥnḫ-ꞽmn, 'living image of Amun'. Reading the signs in the order they are spoken: twt (image) is written with a loaf, a quail chick and a loaf, ꜥnḫ (living) is the ankh sign, and ꞽmn (Amun) is a reed leaf, a game board and a ripple of water. On monuments the god's name is written first inside the ring, because gods are always given first place, so the cartouche looks like 'Amun-tut-ankh' but is read 'Tut-ankh-amun'." },
      { question: "Why does Tutankhamun have two cartouches?", answer: "Every pharaoh from the Middle Kingdom onward had two names in cartouches: a throne name taken at coronation and the birth name he was given as a child. Tutankhamun's throne name is Nebkheperure, 'lord of the manifestations of Ra', and his birth name is Tutankhamun. On the golden mask, the shrines and the throne, the two usually appear side by side, the throne name first." },
      { question: "What does Nebkheperure mean?", answer: "Nebkheperure is nb-ḫprw-rꜥ, 'lord of the manifestations of Ra' or 'Ra is the lord of forms'. It is written with four signs: the sun disc for Ra (written first, spoken last), a basket for nb 'lord', a scarab beetle for ḫpr 'form, manifestation', and three strokes to make the scarab plural. The scarab is why so many rings and amulets from his reign carry a beetle." },
      { question: "Why was Tutankhamun's name changed from Tutankhaten?", answer: "He was born during the reign of Akhenaten, who had replaced Egypt's gods with the sun disc, the Aten, so he was named Tutankhaten, 'living image of the Aten'. When the young king's court restored the old religion around the third year of his reign, Amun replaced Aten in his name and in his wife's, Ankhesenpaaten becoming Ankhesenamun. A few objects in the tomb, including a throne, still carry the earlier name." },
      { question: "Where can I see Tutankhamun's cartouche?", answer: "On almost everything from his tomb: the golden mask carries both cartouches on its back and shoulders, the gilded shrines and sarcophagus repeat them dozens of times, and they appear on the throne, the chariots and the jewellery. The treasures are displayed at the Grand Egyptian Museum in Giza. Outside Egypt you will find his cartouche on scarabs and rings in most large museum collections, and on the walls of the Luxor Temple colonnade he decorated." },
      { question: "Which way do you read a cartouche?", answer: "Towards the faces. The birds and people in a hieroglyphic text always look towards the beginning of the line, so if the reed leaf and the chick in Tutankhamun's cartouche face left, you read from the left. Inside a cartouche the rule is the same, with one extra habit: a god's name is written at the front whichever way the signs face, and you move it to the end when you say the name aloud." },
    ],
    content: `## Two Names in Two Rings

Tutankhamun is the most famous pharaoh in the world and the one whose name is easiest to find. It is on the golden mask, on the shrines that nested around his coffin, on his throne, his chariots and hundreds of smaller objects from the tomb Howard Carter opened in 1922. Yet almost nobody who has stood in front of the mask can read it, because his name is not written the way it is spoken, and because there are two of them.

Every pharaoh from the Middle Kingdom onward carried two names inside [cartouches](/blog/reading-your-first-cartouche): a **throne name** chosen at his coronation and the **birth name** he was given as a child. Tutankhamun's are Nebkheperure and Tutankhamun. On the mask and the shrines they sit side by side, and once you can read both you will recognise them anywhere, from a museum ring to a temple wall at Luxor.

Below is each one, sign by sign, followed by the story of the name he was born with and had to give up. If you want to read names like these yourself, you can [learn hieroglyphics](/) from the 25 alphabet signs up.

## The Birth Name: Tutankhamun

**𓇋𓏠𓈖𓏏𓅱𓏏𓋹**

This is the name everyone knows, *twt-ꜥnḫ-ꞽmn*, "living image of Amun". Seven signs, in three groups.

- **𓇋𓏠𓈖** *ꞽmn*, **Amun**. A reed leaf (*ꞽ*), the game board *mn* and a ripple of water (*n*). The god's name comes first in the ring even though it is spoken last, because a god is always given the place of honour. This is called honorific transposition and it is the single most common trap in reading royal names.
- **𓏏𓅱𓏏** *twt*, **image, likeness**. Loaf (*t*), quail chick (*w*), loaf (*t*). Three of the [25 alphabet signs](/hieroglyphic-alphabet), read exactly as they sound.
- **𓋹** *ꜥnḫ*, **living**. The [ankh](/blog/what-does-the-ankh-symbol-mean), one sign for a whole word.

Put the groups in spoken order and you have *twt* + *ꜥnḫ* + *ꞽmn*: **Tut-ankh-amun**.

On the mask, the shrines and most of the larger objects the ring holds three more signs after the name: **𓋾𓉺𓇗**, *ḥqꜣ ꞽwnw šmꜥ*, "ruler of Southern Heliopolis". Southern Heliopolis was a grand name for Thebes, the city of Amun, and the epithet ties the king to it. Museum labels leave it out; the objects do not, so the full ring you will see is **𓇋𓏠𓈖𓏏𓅱𓏏𓋹𓋾𓉺𓇗**.

## The Throne Name: Nebkheperure

**𓇳𓎟𓆣𓏥**

Four signs, *nb-ḫprw-rꜥ*, "lord of the manifestations of Ra".

- **𓇳** *rꜥ*, **Ra**. The sun disc. Written first for the same reason Amun was: the god goes at the front. Spoken last.
- **𓎟** *nb*, **lord**. A basket seen from the side. It is the same sign that writes "all" and "every" in offering texts.
- **𓆣** *ḫpr*, **to come into being, a form or manifestation**. The scarab beetle, which the Egyptians watched push a ball of dung across the sand and took as a picture of the sun being rolled across the sky each morning.
- **𓏥** three strokes, the plural mark, making it *ḫprw*, "manifestations".

Spoken order: *nb* + *ḫprw* + *rꜥ*, **Neb-kheperu-re**. The scarab at the heart of this name is why so many rings, pectorals and amulets from his reign carry a beetle: the beetle *is* his name.

If you only learn one of his cartouches, learn this one. Throne names were the official name of the reign, so on temple walls and official objects Nebkheperure often appears alone where the birth name does not.

## Born Tutankhaten

He was not born Tutankhamun. His father was almost certainly Akhenaten, the king who closed the temples of Egypt's gods and replaced them with a single sun god, the Aten, and the boy was named for that god: **Tutankhaten**, *twt-ꜥnḫ-ꞽtn*, "living image of the Aten".

In hieroglyphs the change is small. The Aten's name is written **𓇋𓏏𓈖𓇳**: reed leaf, loaf, water, and a sun disc as its silent picture sign. Swap those for Amun's **𓇋𓏠𓈖** and the cartouche is done. Around the third year of his reign, when the court abandoned Akhenaten's city and restored the old gods, that swap was made on every monument that could be reached. His wife's name changed the same way, from Ankhesenpaaten to Ankhesenamun.

A handful of objects in the tomb were never updated. The most famous is the golden throne, where the back panel shows the royal couple under the rays of the Aten and the king's earlier name still reads Tutankhaten. It is the clearest evidence we have that the name change happened in his own lifetime and not after his death.

## How to Spot Them in a Museum

**1. Look for the ring.** The oval with a bar at one end is the cartouche. On the mask there are two on the back of the headdress and more along the shoulders.

**2. Find the god.** A sun disc 𓇳 at the front means a throne name; a reed leaf, game board and water 𓇋𓏠𓈖 means Amun and a birth name. Both signal that you move the god to the end when you read.

**3. Check for the scarab.** A beetle with three strokes under it, 𓆣𓏥, next to a sun disc and a basket, is Nebkheperure. No other king's throne name looks quite like it.

**4. Check the direction.** The reed leaf and the quail chick face the start of the text. Read into their faces.

**5. Read the birth name in three chunks.** Amun, then *twt*, then the ankh. Say it backwards from the way it is written.

## Your Turn

Tutankhamun's two cartouches use one god's name, one scarab and four of the alphabet signs. If you can read them, you can read the throne names of Thutmose III and Hatshepsut, which are built the same way, and you are most of the way to reading any royal name in Egypt.

- **Read more cartouches.** [Reading your first cartouche](/blog/reading-your-first-cartouche) covers Cleopatra, Ramesses II, Khufu and Akhenaten with the same sign-by-sign method.
- **Write your own.** The [free name translator](/translate-name-to-hieroglyphics) spells your name with the alphabet signs Tutankhamun's scribes used for *twt*, and lets you forge it into a cartouche of your own.
- **Learn the alphabet properly.** The [free first lesson](/lessons/expedition-begins) starts with your name on a sealed door and teaches all 25 signs through real Egyptian words in three sections of about ten minutes, saving your place after each.`,
  },
  {
    slug: "best-courses-to-learn-hieroglyphics",
    title: "Best Hieroglyphics Courses 2026: Online, Books, Uni & Free",
    excerpt:
      "Best courses to learn Egyptian hieroglyphs in 2026, honestly compared: the standard textbooks, tutored online classes, a university certificate, free groups and apps.",
    quickAnswer:
      "For most people the best way to learn hieroglyphics is Collier & Manley's *How to Read Egyptian Hieroglyphs*, a book written for evening classes that teaches you to read real British Museum objects; James P. Allen's *Middle Egyptian* is the university grammar to move on to. If you want a tutor and marked work, City Lit and the Egypt Exploration Society run live online classes for roughly £100–£200, and the University of Manchester offers a three-year online Certificate in Egyptology. GlyphStudy runs free, volunteer-led study groups. Interactive courses, including our own, are a useful supplement for learning the signs but are not a substitute for a grammar.",
    date: "August 2026",
    publishedAt: "2026-08-25",
    updatedAt: "2026-09-07",
    category: "Guide",
    glyph: "𓏞",
    image: "/blog/best-hieroglyphics-courses-compared.webp",
    imageAlt: "A study desk with a notebook of hand-drawn hieroglyphs, a laptop showing a carved temple wall, a stack of textbooks and a magnifying glass",
    relatedSlugs: ["how-to-learn-hieroglyphics-online", "should-i-learn-hieroglyphics", "reading-your-first-cartouche"],
    faqs: [
      { question: "What is the best way to learn hieroglyphics for a complete beginner?", answer: "Buy Collier & Manley's How to Read Egyptian Hieroglyphs and work through it with a pencil, doing every exercise. It teaches from real museum objects and only the grammar you need for each one. Use an app or interactive course alongside it to drill the 25 uniliteral (one-sound) signs, because that is the tedious part a book cannot make you practise. Do not start with Allen's Middle Egyptian; it is excellent but built for a classroom." },
      { question: "Can I learn hieroglyphics for free?", answer: "Partly. GlyphStudy runs free volunteer-led study groups that work through the standard textbooks, the Thesaurus Linguae Aegyptiae gives you a free searchable corpus of real texts, and several online courses (ours included) offer a free first lesson. What the free options rarely give you is structure and correction, and that is what most people who give up were missing. The book is the one purchase worth making." },
      { question: "How long does it take to learn to read hieroglyphs?", answer: "Reading royal names in cartouches takes a few hours once you know the alphabet signs. Reading simple monumental inscriptions (offering formulae, titles, short tomb texts) is realistically two to three months of regular practice with Collier & Manley. Reading literary Middle Egyptian (stories, wisdom texts) fluently is a multi-year project that needs a proper grammar course and, ideally, other people." },
      { question: "Is a university or tutored course worth it?", answer: "If you want a tutor who marks your translations and a cohort, yes. City Lit and the Egypt Exploration Society run live online classes of five or six sessions for roughly £100–£200; the University of Manchester's three-year online Certificate in Egyptology is the accredited route and costs university tuition. If you just want to read inscriptions on your next museum visit, one good book and a few weeks of practice will get you there for under £20." },
      { question: "Which course is best for children or a school class?", answer: "For Key Stage 2 (ages 7–11) the goal is recognition and fun, not grammar: writing their own name in a cartouche, spotting animal signs, and understanding that the signs stand for sounds. A name translator and a printable alphabet worksheet cover a lesson, and the British Museum's online resources on Egypt are excellent for context. Keener children of ten and up can manage the first chapter of Manley's Complete Beginners book with an adult." },
      { question: "Which textbook should I buy first, Collier & Manley or Allen?", answer: "Collier & Manley first. It is written for evening-class learners, works from real British Museum objects and teaches only the grammar needed to read each one, so you finish able to read a Middle Kingdom stela. Allen's Middle Egyptian is the complete university grammar and the right second book; most people who start with it alone stall when the verbal system arrives around lesson 12." },
    ],
    content: `## Key Takeaways

- There is no single "best" course; the right one depends on whether you want to read names on a museum visit, work through real inscriptions, or study Middle Egyptian grammar properly
- For most beginners the best route is still **one good book** (Collier & Manley), read with a pencil, plus something that drills the signs
- **James P. Allen's *Middle Egyptian*** is the serious grammar; treat it as the second step, not the first
- **Tutored classes** (City Lit, the Egypt Exploration Society, Bloomsbury Summer School) give you a teacher and marked work for £100–£200 a course; Manchester's **Certificate in Egyptology** is the accredited, three-year route
- **Free options exist** (GlyphStudy, open text corpora, free first lessons) but they trade structure for price
- **Interactive courses and apps**, including our own way to [learn hieroglyphics](/) online, are good at the sign-learning stage and weak on grammar; use them as a supplement, not the whole plan
- Whatever you pick, the thing that predicts success is the same: you read and write signs every week, rather than watch someone else do it

---

## How Did I Judge These Courses?

Each course is rated on whether it makes you read, whether it starts with the right signs, whether it uses real inscriptions early, and what it costs in money and time.

I've been through most of what's on this list as a learner, and I built one of the entries, so read the whole thing knowing that. I wasn't looking for the most comprehensive option; I was looking for the one most likely to get *you* from zero to reading something real. Each course below is rated on four things:

1. **Does it make you read?** Reading hieroglyphs is a skill, not a body of facts. Courses that only show you signs teach recognition, not reading.
2. **Does it start with the right signs?** The 25 [uniliteral signs](/hieroglyphic-alphabet) (one sign, one sound) unlock names and most of what you'll meet on a monument. Courses that begin with the Gardiner sign list's 700+ signs lose people in a week.
3. **Does it use real inscriptions early?** Made-up sentences are demoralising because they never look like the wall in front of you.
4. **What does it cost, in money and in time?** Some of these are £12; some are a year of evenings.

The list runs roughly in the order I'd recommend for an adult beginner working towards reading real texts. The children's option sits at the end because it answers a different question.

## 1. Collier & Manley, *How to Read Egyptian Hieroglyphs*: best overall

![Two open textbooks on a desk with pencil annotations, a magnifying glass and a desk lamp](/blog/best-courses/textbooks.webp)

**Format:** Book (British Museum Press, 1998; still in print)
**Cost:** Around £15–20
**Best for:** Almost everyone starting out: it is the book that Egyptologists, evening-class tutors and study groups all point beginners to

If you only buy one thing, [buy this](https://en.wikipedia.org/wiki/How_to_Read_Egyptian_Hieroglyphs). Mark Collier and Bill Manley wrote it for British Museum evening classes, and it shows: every chapter works from real objects in the museum's collection (stelae, coffins, statues) and teaches only the grammar you need to read *that* object. By the end you can read a standard Middle Kingdom funerary stela, which is a genuinely useful skill in any museum in the world. It has been the default recommendation for over twenty-five years for a reason.

**Where it wins:** real inscriptions from page one; the right amount of grammar; exercises with answers; cheap.

**Where it doesn't:** it is a book, so nothing corrects your mistakes in real time, and the pace can feel steep around chapter four when the verb forms arrive. The sign-learning stage is dull on paper; most people do better pairing the first two chapters with something that drills the alphabet for them (an app, flashcards or an interactive course).

## 2. James P. Allen, *Middle Egyptian*: the university textbook

**Format:** Textbook (Cambridge University Press, 3rd ed. 2014)
**Cost:** Around £35–45
**Best for:** Anyone who wants to read Middle Egyptian literature properly, or is heading for formal study

[Allen's *Middle Egyptian*](https://www.cambridge.org/gb/universitypress/subjects/languages-linguistics/arabic-and-middle-eastern-language-and-linguistics/middle-egyptian-introduction-language-and-culture-hieroglyphs-3rd-edition) is what universities teach from. It is comprehensive, rigorous and beautifully organised: 26 lessons, each with an essay on Egyptian culture, followed by exercises drawn from real texts, plus a sign list and dictionary.

**Where it wins:** everything is here. If you finish it, you can read Middle Egyptian.

**Where it doesn't:** it's designed for a classroom with a tutor and a cohort. Working alone, most people stall between chapters 12 and 18, where the verbal system arrives in force. Do Collier & Manley first, then Allen, ideally with a study group (see GlyphStudy below) or a tutored class.

## 3. City Lit and the Egypt Exploration Society: best tutored online classes

![A small university evening seminar with a tutor sketching hieroglyphs on a whiteboard](/blog/best-courses/university.webp)

**Format:** Live online classes over Zoom, five or six weekly sessions, taught by working Egyptologists
**Cost:** Roughly £100–£200 per course (City Lit's introduction is £169 at the time of writing, with concessions)
**Best for:** Learners who want a real tutor, questions answered live and a timetable

Two London institutions run the tutored online classes I'd point a beginner to. [City Lit's *Ancient Egyptian Hieroglyphs: An Introduction*](https://www.citylit.ac.uk/courses/ancient-egyptian-hieroglyphs-an-introduction-online) is six live sessions built around British Museum objects, with the stated goal of reading simple texts in any museum. The [Egypt Exploration Society](https://www.ees.ac.uk/learn/courses.html) runs five-session Zoom courses at beginner, beyond-beginner and intermediate level several times a year, with a discount for members. The feedback loop of a tutor is exactly what books and apps can't give you, and it's why people who've bounced off self-study twice often succeed here. Courses run on fixed dates and fill up, so book a term ahead.

## 4. Bloomsbury Summer School & Academy: best intensive

**Format:** Five-day intensive courses at UCL in London each summer (late June to July), plus online courses and one-day tasters through the year
**Cost:** Course fee plus, for the in-person weeks, a week in London
**Best for:** People who learn best in a room with others and want a concentrated push

[Bloomsbury Summer School & Academy](https://www.bssac.uk/) has run since 1990 and is the UK's long-standing Egyptology summer school. Its 2026 programme includes a one-day online *Taste of Hieroglyphs*, the five-day *Beginning Hieroglyphs* (Stage I) and *Hieroglyphs: The Next Step* (Stage II), and an advanced reading class, taught by working Egyptologists. A week of daily classes will move you further than three months of occasional evenings, and you meet the people who become your study group afterwards.

## 5. University of Manchester: Certificate in Egyptology (online)

**Format:** Part-time online certificate over three years, with hieroglyphs taught throughout alongside history and archaeology
**Cost:** University tuition, paid per year; check the current fee
**Best for:** Committed learners who want a recognised qualification and the full picture of Egyptology, not just the language

Manchester's [Certificate in Egyptology](https://www.manchester.ac.uk/study/undergraduate/courses/2026/07735/ugcert-egyptology/course-details/) is delivered entirely online with pre-recorded lectures, draws on the Manchester Museum's collection, and asks for about ten hours a week in term time. The study of hieroglyphs is described as integral to the course, but it sits within a wider programme, so this is the choice if you want context (religion, chronology, archaeology) as well as reading skill. It's also the longest and most expensive commitment on this list, so it's not where I'd start.

## 6. GlyphStudy: best free option (with a catch)

![A hand holding a phone showing a hieroglyph flashcard at a café table](/blog/best-courses/free-and-apps.webp)

**Format:** Free, student-led online study groups that work through a standard textbook (Allen, Hoch, or Collier & Manley) over a year or more
**Cost:** Free, apart from the book
**Best for:** Self-motivated learners who want a cohort and a schedule without paying for a tutor

[GlyphStudy](https://glyphstudy.groups.io/g/main) is a remarkable thing: a free, student-led group, running since the Yahoo Groups era and now on Groups.io, whose sections go through a grammar chapter by chapter with homework and discussion. There are no teachers, only more experienced students acting as moderators, and it now covers Middle Egyptian, Late Egyptian and Coptic. The catch is pace and drop-out: groups move slowly by design, start only a few times a year, and rely on your own discipline to keep up. If you can, it's the cheapest way to get the "study group" that makes Allen workable.

**Free resources worth bookmarking alongside it:** the [Thesaurus Linguae Aegyptiae](https://thesaurus-linguae-aegyptiae.de/) (the Berlin-Brandenburg Academy's searchable corpus of Egyptian texts, essential once you're reading real inscriptions), and a good [sign chart](/hieroglyphic-alphabet) for the alphabet.

## 7. Bill Manley, *Egyptian Hieroglyphs for Complete Beginners*: gentlest book

**Format:** Book (Thames & Hudson, 2012)
**Cost:** Around £12–15
**Best for:** People who found Collier & Manley too brisk, or who want to read monuments rather than study language

Manley's solo follow-up is slower and more visual than the 1998 book, again built entirely around real museum objects. It spends longer on the signs themselves and on how monumental inscriptions are laid out, which makes it the friendlier starting point for anyone who's nervous about grammar. It stops earlier than Collier & Manley, so treat it as a stepping stone rather than a destination. It sits this low only because most people can go straight to Collier & Manley.

## 8. Interactive online courses and apps (including this one)

![A learner at a laptop working through an interactive 3D temple-wall hieroglyph lesson](/blog/best-courses/online-course.webp)

**Format:** Self-paced, browser or phone, with exercises that mark themselves
**Cost:** Free to about £15
**Best for:** The sign-learning stage, and for people who need something to make them practise

Declaration of interest first: I built [Learn Hieroglyphics](/), the site you are reading. It is a small, new course: eight browser lessons of 20–35 minutes covering the 25 alphabet signs, common animal and plant signs, determinatives, numerals, [royal cartouches](/blog/reading-your-first-cartouche), the offering formula, a monumental temple text and how multi-sound signs combine into words, with 3D practice games. The first lesson is free and the rest is a one-off $100 / £80. It does not teach the verbal system or take you through a full grammar, and it is not a substitute for Collier & Manley. What it and the better apps do well is the part a book does badly: making you produce signs, correcting you immediately, and keeping you practising until the alphabet is automatic.

**Flashcard apps** are fine for drilling signs, and Bob Brier's [*Decoding the Secrets of Egyptian Hieroglyphs*](https://plus.thegreatcourses.com/decoding-the-secrets-of-egyptian-hieroglyphs) (The Great Courses, 24 lectures, subscription) is an enjoyable overview. But an app that only asks you to match signs to meanings is teaching letter recognition, not reading, and a video series you watch on the sofa won't teach you to read any more than watching a pianist teaches you the piano. Use any of this category, ours included, as a supplement to something that makes you read real texts.

## 9. For children and schools: best classroom starting point

![A primary school classroom with children colouring cartouches while a teacher points at a hieroglyph poster](/blog/best-courses/classroom.webp)

**Format:** Name translator, printable worksheet, museum resources
**Cost:** Free
**Best for:** Key Stage 2 Ancient Egypt units (ages 7–11), home educators, and museum-trip preparation

Children don't need grammar; they need to discover that the signs stand for sounds and that they can write their own name in a [cartouche](/blog/reading-your-first-cartouche). That single realisation carries a whole lesson. Our [teachers' page](/teachers) has a print-ready three-page alphabet worksheet and a lesson outline mapped to the KS2 unit, and the [name translator](/translate-name-to-hieroglyphics) works on the classroom whiteboard. The [British Museum's Egyptian galleries](https://www.britishmuseum.org/collection/galleries/egyptian-sculpture) and their online collection give you the real objects to show alongside.

## Comparison at a Glance

| Course | Format | Cost | Best for | Gets you to |
|---|---|---|---|---|
| Collier & Manley | Book | ~£15–20 | Almost every beginner | Reading a Middle Kingdom stela |
| Allen, *Middle Egyptian* | Textbook | ~£35–45 | Serious grammar | Reading Middle Egyptian literature |
| City Lit / EES | Live online, 5–6 sessions | ~£100–£200 | A tutor, live questions, a timetable | Reading simple museum texts with feedback |
| Bloomsbury Summer School & Academy | 5-day intensive (London or online) | ££ (+ London) | Intensive push, meeting people | A big jump at whatever level you enter |
| Manchester Certificate | Online, 3 years | University tuition | A qualification + full Egyptology | Accredited reading competence |
| GlyphStudy | Free cohort | Free | Disciplined self-learners | Allen, slowly, with company |
| Manley, *Complete Beginners* | Book | ~£12–15 | Nervous beginners | Signs and monument layout |
| Interactive courses & apps (incl. ours) | Self-paced online | Free–£15 | Drilling signs, staying motivated | Alphabet, names, short formulae |
| Kids: translator + worksheet | Free | Free | KS2 classes, families | Names in cartouches, sound-sign idea |

## Which Hieroglyphics Course Should You Choose?

Pick by what you want to be able to read, then by how much correction you need.

**"I want to read the names and captions on my next museum visit."** Collier & Manley, chapters one to three, plus an app or [free lesson](/get-started) to drill the alphabet. A few weeks of light practice is enough to read cartouches and titles.

**"I want to properly learn the language."** Collier & Manley for the first two or three months, then Allen, with a GlyphStudy group or a tutored class so someone marks your work. Plan on a year or more.

**"I want a teacher."** City Lit or the EES for a first course; Bloomsbury for an intensive week; Manchester if you want the qualification.

**"I want a qualification."** Manchester. Read Collier & Manley first so you arrive already knowing the alphabet; it makes the first year far less bruising.

**"I'm teaching a class."** [Worksheet](/teachers) plus translator for the lesson, and the British Museum's online collection for real objects.

**"I have no money to spend."** GlyphStudy, a library copy of Collier & Manley, and the Thesaurus Linguae Aegyptiae as your reading corpus. Free first lessons (ours and others') will get the alphabet into your head.

## The Bottom Line

The course that will teach you hieroglyphs is the one that makes you read and write signs this week and next week and the week after. Everything above can do that; they differ in how much structure and correction they give you and what they cost. For most people the honest answer is a £15 book and a pencil, with something interactive to make the sign-learning less of a grind, and a tutor or study group when the grammar gets hard. Still unsure whether it's for you? Read [should I learn hieroglyphics?](/blog/should-i-learn-hieroglyphics) first, or [how to learn hieroglyphics online](/blog/how-to-learn-hieroglyphics-online) for the order to tackle things in.`,
  },
  {
    slug: "what-does-the-ankh-symbol-mean",
    title: "What Does the Ankh Symbol Mean in Egyptian Hieroglyphics?",
    metaTitle: "𓋹 Ankh Meaning: The Egyptian Hieroglyph for \"Life\"",
    metaDescription:
      "𓋹 is the ankh, the Egyptian hieroglyph for 'life'. What it pictures, why gods hold it to the pharaoh's nose, and how it became the Coptic cross.",
    excerpt:
      "The ankh (𓋹) is the Egyptian hieroglyph for 'life'. What it meant, why gods hold it to the pharaoh's nose, what it depicts and how it became the Coptic cross.",
    quickAnswer:
      "The ankh (𓋹, Gardiner sign S34) is the ancient Egyptian hieroglyph for the word ꜥnḫ, \"life\", meaning life as a gift granted and sustained by the gods, not merely being alive. That is why deities are shown holding it to a pharaoh's nose: the gesture means \"I give you life.\" The loop-topped cross shape was later adopted by Egyptian Christians as the crux ansata, a form of the Coptic cross.",
    date: "April 2026",
    publishedAt: "2026-04-15",
    updatedAt: "2026-09-07",
    category: "Symbols",
    glyph: "𓋹",
    image: "/blog/ankh-symbol-hieroglyph-meaning.webp",
    imageAlt: "Golden ankh symbol held by an ancient Egyptian deity in a painted temple scene with hieroglyphic inscriptions",
    relatedSlugs: ["5-hieroglyphs-you-already-know", "the-book-of-the-dead-a-readers-guide", "how-the-rosetta-stone-changed-everything"],
    faqs: [
      { question: "What does the ankh symbolise?", answer: "The ankh is the ancient Egyptian hieroglyph for the word 'life' (ꜥnḫ). It represented life as a sacred, divinely granted condition: not just biological existence, but participation in the cosmic order (Ma'at) maintained by the gods. It appears in temples, tombs and religious art spanning more than 3,000 years, and is the most widely recognised hieroglyph today." },
      { question: "What does it mean when a god holds an ankh to the pharaoh's nose?", answer: "Gods and goddesses are shown holding the ankh or pressing it to a pharaoh's nose to symbolise the divine gift of life. The gesture means 'I grant you life' and is a statement that the king rules by divine authority. In Old and Middle Kingdom art only deities and royalty are depicted holding the ankh; ordinary people were not shown with it." },
      { question: "What object did the ankh originally depict?", answer: "Nobody knows for certain. Gardiner's standard sign list describes S34 as a sandal strap, and the Egyptian word for a sandal strap was also ꜥnḫ, which makes this the most widely cited theory. Others have proposed a ceremonial knot of cloth, a mirror (also called ꜥnḫ), or a combination of male and female symbols, though the last has little mainstream support." },
      { question: "Is the ankh a religious symbol?", answer: "In ancient Egypt, yes: it was a deeply religious symbol associated with divine power and the afterlife, found almost exclusively in temples, tombs and royal inscriptions. Egyptian Christians later adopted the shape as the crux ansata, a form of the Coptic cross. Today the ankh is also worn in spiritual, cultural and fashion contexts with no religious intent." },
      { question: "Is the ankh a letter in the hieroglyphic alphabet?", answer: "No. The ankh is not one of the 25 single-consonant alphabet signs; it is a triliteral sign that writes the three consonants ꜥ-n-ḫ, and it also works as a logogram for the whole word 'life'. It appears in thousands of inscriptions, in royal names, titles, offering formulae and religious texts, so it is one of the first non-alphabet signs learners meet." },
    ],
    content: `## Key Takeaways

- The ankh (𓋹) is the hieroglyph for "life", the single most important concept in ancient Egyptian religion and culture
- It represented divinely granted life, not just biological existence but life as participation in cosmic order ([Ma'at](https://en.wikipedia.org/wiki/Maat))
- Gods are shown offering the ankh to pharaohs, symbolising the divine gift of life and legitimising royal power
- The physical origin of the ankh shape remains debated among Egyptologists; leading theories include a sandal strap, cloth knot, or combined male-female symbol
- The ankh survived ancient Egypt: Egyptian Christians adopted it as the crux ansata, a form of the [Coptic cross](https://en.wikipedia.org/wiki/Coptic_cross), and it remains one of the most recognised symbols worldwide
- The ankh is one of the first signs you meet when you [learn Egyptian hieroglyphs](/), because it spells the word *ankh* itself and turns up in royal names such as Tutankhamun

---

## Why Is the Ankh the Most Famous Hieroglyph?

If you asked someone to draw a hieroglyph, any hieroglyph, most people would draw the ankh. It's on jewellery, tattoos, album covers, and fashion brands worldwide. But most people who wear or display the ankh have a vague sense that it means "life" or "eternal life" without understanding what that actually meant to the people who created it.

The ankh isn't just a symbol of life the way a heart emoji is a symbol of love. To the ancient Egyptians, the ankh represented something specific and profound: **life as a divinely granted, cosmically sustained condition**. It was inseparable from their understanding of how the universe worked, what the gods did, and what happened after death.

## What Does the Ankh Symbol Mean?

The ankh (transliterated as *ꜥnḫ*) is the [hieroglyphic sign](https://en.wikipedia.org/wiki/Ankh) for the word "life." It's classified as **Gardiner sign S34** in [Sir Alan Gardiner's](https://en.wikipedia.org/wiki/Alan_Gardiner) standard sign list, the international reference system for hieroglyphs that every Egyptologist uses. It is one of a handful of signs, alongside the [Eye of Horus and the scarab](/blog/5-hieroglyphs-you-already-know), that most people can recognise without ever having studied the script (there is a short guide to each in [Egyptian symbol meanings](/hieroglyph-meaning)).

But "life" in the Egyptian sense was not what we mean when we say the word casually. For the Egyptians, life was not a biological accident. It was a **sacred condition** that existed only when the universe was in balance, when [Ma'at](https://en.wikipedia.org/wiki/Maat) (truth, justice, cosmic order) was upheld. Life was something the gods created, sustained, and could withdraw.

This is why the ankh appears overwhelmingly in religious contexts. You don't find it scratched into domestic pottery or scribbled in personal letters. You find it in **temples, tombs, and royal inscriptions**, the places where the relationship between gods, kings, and the cosmic order was made visible.

## Why Do Egyptian Gods Hold the Ankh?

Gods hold the ankh because life was theirs to give. The most common way the ankh appears in Egyptian art is in scenes where a deity holds it out to a pharaoh. The god or goddess extends the ankh towards the king's nose or mouth, a gesture that means, quite literally, "I give you life."

This wasn't symbolic in the way we use the word. The Egyptians believed the pharaoh's authority to rule came directly from the gods, and that authority was expressed as life itself. When [Amun-Ra](https://en.wikipedia.org/wiki/Amun) presses the ankh to Ramesses II's face on the walls of [Karnak](https://en.wikipedia.org/wiki/Karnak), the scene is a political and theological statement: this king rules because the supreme god has granted him the breath of life.

In the Old and Middle Kingdoms, **only gods and royalty were depicted holding the ankh**. This restriction was deliberate. The ankh was not just a nice symbol; it was a marker of divine status. Ordinary people appear in tomb art, but they don't hold ankhs. That privilege belonged to beings who existed at the intersection of the human and the divine.

## What Did the Ankh Mean for the Afterlife?

In funerary contexts the ankh stood for the **continuity of life across death**, not just life in this world. This is where I think most popular explanations fall short. The Egyptians did not believe death was an ending; they believed it was a transformation. A person who died correctly (with proper mummification, burial rites, and moral conduct) would continue to live in the afterlife, specifically in the [Field of Reeds](https://en.wikipedia.org/wiki/Field_of_Reeds).

The ankh appears in the [Book of the Dead](/blog/the-book-of-the-dead-a-readers-guide) and in funerary inscriptions because it represents this unbroken thread of existence. When you see an ankh in a tomb, it's not a memorial; it's an active agent. The Egyptians believed that the symbols carved into tomb walls had real power. The ankh carved into a burial chamber was meant to **ensure** continued life for the deceased.

This is fundamentally different from how we think about symbols. We see a cross on a gravestone as a marker of faith. The Egyptians saw a carved ankh as a working technology, a device that helped maintain the conditions necessary for eternal life.

## What Does the Ankh Depict? The Origin Debate

The ankh's distinctive shape (a cross with a loop at the top) is immediately recognisable, but nobody knows for certain what object it originally depicted. This is one of the longest-running debates in Egyptology.

**The sandal strap theory** is the most widely cited in academic literature. Gardiner's sign list itself describes S34 as a sandal strap, with the loop going around the ankle. The word *ꜥnḫ* can mean both "life" and "sandal strap", a case of the [rebus principle](https://en.wikipedia.org/wiki/Rebus) where a sign for a concrete object comes to represent an abstract concept that sounds the same.

**The knot theory** suggests the ankh is a ceremonial knot made of cloth or reeds, similar to other Egyptian tied symbols like the [tyet](https://en.wikipedia.org/wiki/Tyet) (the "Knot of Isis"). This theory has support from the way the ankh is drawn in earliest hieroglyphic inscriptions, where the loop appears more like wrapped material than a rigid shape.

**The combined symbol theory** proposes the ankh combines male and female elements (the loop representing the womb and the cross representing the phallus), symbolising the union that creates life. This interpretation is popular in alternative history but has limited support in mainstream Egyptology.

My own view, for what it's worth: the sandal strap theory is the most linguistically sound, but I suspect the Egyptians themselves had long forgotten the original referent by the time of the great temple-building periods. The ankh had become a purely abstract symbol of life, much as our letter A no longer makes anyone think of the ox head it originally depicted in [Proto-Sinaitic script](https://en.wikipedia.org/wiki/Proto-Sinaitic_script).

## How Is the Ankh Used in Hieroglyphic Writing?

In the script, the ankh is a triliteral sign writing the consonants *ꜥ-n-ḫ* and a logogram for the word "life" itself. It is not one of the [25 alphabet signs](/hieroglyphic-alphabet), but if you're learning to read hieroglyphics (and [you should](/blog/should-i-learn-hieroglyphics)) it is one of the first signs you'll encounter because it appears **constantly**.

It shows up in:

- **Royal names and titles.** The word *ꜥnḫ* appears in phrases like *ꜥnḫ wḏꜣ snb* ("life, prosperity, health"), a formulaic blessing that follows pharaoh names in inscriptions.
- **Offering formulae.** The standard *ḥtp-dj-nsw* ("an offering which the king gives") formula in tombs often includes wishes for the deceased to have "life" in the afterlife.
- **Compound words.** The ankh forms part of words like *ꜥnḫ.t* ("mirror", which was also loop-shaped) and names like [Tutankhamun](https://en.wikipedia.org/wiki/Tutankhamun) (*twt-ꜥnḫ-jmn*, "living image of Amun").
- **The word "oath."** *ꜥnḫ* also means "oath" or "to swear": you swore by life.

You can [try translating your own name into hieroglyphics](/translate-name-to-hieroglyphics) using our free tool to see how the phonetic system works.

## What Happened to the Ankh After Ancient Egypt?

The ankh didn't die with the pharaohs. When Egypt became Christian in the early centuries CE, Egyptian Christians adopted a version of the ankh, the *crux ansata* (Latin for "cross with a handle"), which survives as one form of the [Coptic cross](https://en.wikipedia.org/wiki/Coptic_cross). This wasn't coincidence. The early Egyptian Christians drew a direct line between the ankh as a symbol of eternal life and the Christian promise of resurrection. Knowledge of the script itself was lost soon after, and was not recovered until the [Rosetta Stone](/blog/how-the-rosetta-stone-changed-everything) was deciphered in 1822.

In the 20th and 21st centuries, the ankh has been adopted by various subcultures and spiritual movements. It's a common symbol in Afrocentric art, gothic fashion, New Age spirituality, and popular culture. Whether these modern uses honour or distort the original meaning is a debate I'll leave to others, but I do think that anyone who wears an ankh should know what the people who created it actually believed.

## Why I Think the Ankh Matters

The ankh is more than an aesthetic object. It's a window into how the ancient Egyptians understood existence itself. For them, life was not a given; it was a gift from the gods, maintained by cosmic order, and capable of continuing beyond death if the proper conditions were met.

When you learn to read the ankh in its original context, surrounded by offering formulae, divine speeches, and funerary texts, you start to understand the Egyptian worldview from the inside. And that's ultimately what learning hieroglyphics gives you: not just the ability to decode symbols, but the ability to think, even briefly, the way a civilisation thought 4,000 years ago.

If you're interested in going deeper, the [free first lesson](/get-started) teaches the alphabet signs, and the full course covers the ankh and dozens of other signs in [structured, interactive lessons](/pricing) that take you from complete beginner to reading real inscriptions.`,
  },
  {
    slug: "how-to-learn-hieroglyphics-online",
    title: "How to Learn Hieroglyphics Online: A Step-by-Step Guide",
    excerpt:
      "How to learn Egyptian hieroglyphics online in five steps: the 25 alphabet signs, the right course or book, grammar, real inscriptions and the mistakes to avoid.",
    quickAnswer:
      "To learn hieroglyphics online, start with the hieroglyphic \"alphabet\" (24 consonant sounds written with 25 uniliteral signs), which you can learn in a single sitting, then move on to biliteral signs, determinatives and royal cartouches. Use an interactive course with built-in exercises rather than a grammar textbook alone; Allen's *Middle Egyptian* is the academic standard but is written for university classrooms. Most learners can read simple names and short inscriptions within a few weeks of 15–20-minute daily sessions.",
    date: "April 2026",
    publishedAt: "2026-04-10",
    updatedAt: "2026-09-07",
    category: "Guide",
    glyph: "𓏛",
    image: "/blog/learn-hieroglyphics-online-guide.webp",
    imageAlt: "Laptop screen showing hieroglyphic lessons with ancient Egyptian temple imagery in the background",
    relatedSlugs: ["best-courses-to-learn-hieroglyphics", "reading-your-first-cartouche", "should-i-learn-hieroglyphics"],
    faqs: [
      { question: "Can you learn hieroglyphics online for free?", answer: "You can learn the basics for free using resources such as EgyptianHieroglyphs.net, Mark-Jan Nederhof's grammar exercises at St Andrews, GlyphStudy's volunteer study groups and open text corpora. Free resources are fragmented and lack correction, so most people who rely on them alone stall. A structured course with interactive exercises gets you further, faster; Learn Hieroglyphics offers its first lesson free, with the full course a one-time $100 / £80." },
      { question: "How long does it take to learn hieroglyphics?", answer: "You can learn the 25 uniliteral signs (the alphabet) in a few hours and start reading simple names within days. Reaching a comfortable level with common inscriptions such as offering formulae, titles and royal names takes two to three months of regular practice. Reading literary Middle Egyptian with a full grammar takes one to two years of dedicated study." },
      { question: "What is the best book for learning hieroglyphics?", answer: "For beginners, Mark Collier and Bill Manley's How to Read Egyptian Hieroglyphs (British Museum Press, 1998) is the most accessible and works from real museum objects. For serious study, James P. Allen's Middle Egyptian: An Introduction to the Language and Culture of Hieroglyphs (3rd ed., 2014) is the university standard. Gardiner's Egyptian Grammar (3rd ed., 1957) remains the definitive reference but is not a teaching book." },
      { question: "Should I learn Middle Egyptian or Late Egyptian?", answer: "Start with Middle Egyptian, also called Classical Egyptian. It was the prestige written form from roughly 2000 BCE and remained the language of monumental and religious texts for over 1,500 years, so it is what most inscriptions, textbooks and courses use. Late Egyptian, Demotic and Coptic are later stages of the same language that you can explore once you have the classical grammar." },
      { question: "Is hieroglyphics a language or a writing system?", answer: "Hieroglyphics is a writing system, not a language. The language is ancient Egyptian, which was written in three scripts: hieroglyphs on monuments, cursive hieratic on papyrus and, later, the abbreviated demotic script. Learning to read hieroglyphs therefore means learning both the signs and the grammar and vocabulary of Middle Egyptian, which is why sign-matching apps alone never get you reading." },
    ],
    content: `## Key Takeaways

- Start with the [25 uniliteral signs](/hieroglyphic-alphabet) (the hieroglyphic alphabet); you can learn these in a single sitting and they unlock basic reading immediately
- Use a structured course with interactive exercises, not just textbooks; the difference in retention and motivation is enormous
- The standard academic textbook is [James P. Allen's *Middle Egyptian*](https://www.cambridge.org/gb/universitypress/subjects/languages-linguistics/arabic-and-middle-eastern-language-and-linguistics/middle-egyptian-introduction-language-and-culture-hieroglyphs-3rd-edition) (3rd ed., 2014), but it's designed for university classrooms, not self-study beginners
- Avoid the two biggest beginner mistakes: trying to memorise all 700+ signs at once, and skipping grammar in favour of "just reading"
- Practise with real inscriptions as early as possible; reading actual ancient text is what makes the difference between studying and learning
- If you want to [learn hieroglyphics](/) with exercises rather than a textbook alone, our free first lesson covers the alphabet signs in one sitting

---

## Why Do Most People Fail at Learning Hieroglyphics?

Most people who try to learn hieroglyphics give up not because it's too hard, but because they use the wrong resources in the wrong order.

Here's the typical failure pattern I've seen: someone gets excited about hieroglyphics, Googles "learn hieroglyphics," finds a sign list with 700 symbols, tries to memorise them all, gets overwhelmed within a week, and quits. They walk away thinking hieroglyphics are impossibly complex. They're not; the approach was wrong.

The hieroglyphic writing system is genuinely learnable. But you need to approach it in the right sequence, with the right tools, and with realistic expectations about what "learning hieroglyphics" actually means.

## Step 1: Learn the Hieroglyphic Alphabet First

The first thing to learn is the hieroglyphic alphabet: 24 consonant sounds written with 25 single-consonant signs called [uniliterals](https://en.wikipedia.org/wiki/Egyptian_uniliteral_signs). This is non-negotiable, and it's where every serious Egyptology programme starts.

Ancient Egyptian hieroglyphics include over 700 signs, but these 25 are the foundation. They function like an alphabet: each one represents a single consonant sound (the double reed is usually listed as a 25th sign alongside the single reed, which is why you'll see both "24" and "25" quoted). You can learn them all in a few hours; our [alphabet chart](/hieroglyphic-alphabet) lists every sign with its sound and Gardiner code.

Why start here? Because once you know the uniliterals, you can immediately start reading **royal names**. Pharaoh names in cartouches are often spelled phonetically, so if you know the alphabet, you can decode them. Try [Cleopatra's cartouche](/blog/reading-your-first-cartouche); it's purely phonetic and is the classic first exercise.

Our [hieroglyphic name translator](/translate-name-to-hieroglyphics) uses these same signs and is a good way to see the alphabet in action before you start formal study.

## Step 2: Choose Your Primary Resource

The resource you choose will determine whether you succeed or give up, so pick one primary course or book and stick with it. I compare nine options in detail in [the best courses to learn hieroglyphics](/blog/best-courses-to-learn-hieroglyphics); the short version is below.

### The Best Options in 2026

**For complete beginners (my recommendation):** Start with an interactive online course that teaches progressively. [Learn Hieroglyphics](/get-started) is what I built for exactly this purpose: 8 structured lessons with interactive exercises, real inscription practice, and progressive difficulty. You start with the alphabet and end up reading actual ancient texts. The first lesson is free, and [lifetime access](/pricing) to the rest is a one-time $100 / £80.

**For self-study with a textbook:** [Mark Collier and Bill Manley's *How to Read Egyptian Hieroglyphs*](https://en.wikipedia.org/wiki/How_to_Read_Egyptian_Hieroglyphs) is the best entry point. It's written for non-specialists, uses real inscriptions from the start, and progresses at a manageable pace. If you only buy one book, make it this one.

**For serious academic study:** [James P. Allen's *Middle Egyptian*](https://www.cambridge.org/gb/universitypress/subjects/languages-linguistics/arabic-and-middle-eastern-language-and-linguistics/middle-egyptian-introduction-language-and-culture-hieroglyphs-3rd-edition) (3rd ed., 2014) is the standard university textbook worldwide. It's comprehensive, rigorous, and well-structured, but it's designed for classroom use with an instructor. Self-study is possible but challenging. I'd recommend starting with Collier & Manley or an interactive course first, then moving to Allen when you have the basics down.

**For the reference shelf:** [Sir Alan Gardiner's *Egyptian Grammar*](https://en.wikipedia.org/wiki/Egyptian_Grammar:_Being_an_Introduction_to_the_Study_of_Hieroglyphs) (3rd ed., 1957) is the foundational reference that every Egyptologist owns. It's not a teaching book; it's a grammar and sign list. You'll use it as a reference once you're past the beginner stage.

### Other Online Resources

- **[EgyptianHieroglyphs.net](https://www.egyptianhieroglyphs.net/egyptian-hieroglyphs/)** (free): Simple, straightforward Middle Egyptian lessons. Good as a supplement but not comprehensive enough on its own.
- **[Thesaurus Linguae Aegyptiae](https://thesaurus-linguae-aegyptiae.de/)** (free): The Berlin-Brandenburg Academy's digital corpus of Egyptian texts. Essential once you're reading real texts.
- **[GlyphStudy](https://glyphstudy.groups.io/g/main)** (free): Student-led online study groups that work through Allen, Hoch or Collier & Manley chapter by chapter. Slow but serious, and the cheapest way to get a cohort.
- **[The Great Courses: Decoding the Secrets of Egyptian Hieroglyphs](https://plus.thegreatcourses.com/decoding-the-secrets-of-egyptian-hieroglyphs)** (subscription): Bob Brier's 24-lecture video series. Entertaining and informative, but more of a survey than a hands-on course.

### What I'd Avoid

**YouTube videos with no structure.** There are plenty of "learn hieroglyphics" videos online, and some are excellent, but watching videos without practising is like watching someone play piano and expecting to learn. You need to actively read and write signs, not just watch someone else do it.

**Apps that gamify without teaching.** Some apps treat hieroglyphics like a matching game: swipe to match the sign to its meaning. This teaches recognition but not reading. Reading hieroglyphics requires understanding grammar, word order, determinatives, and context. An app that only drills sign identification is teaching you the equivalent of letter recognition without ever teaching you to read words.

## Step 3: Learn the Grammar (Don't Skip This)

You cannot read hieroglyphics without learning Middle Egyptian grammar, and this is where most self-taught learners go wrong.

I know that sounds obvious, but the temptation to skip grammar and "just start reading" is strong. And for the first few weeks, it seems to work: you can pick out individual signs, recognise common words, and feel like you're making progress. But then you hit a real inscription and realise you can't tell where one word ends and another begins, you can't parse the verb forms, and you don't know why certain signs are there at all.

Middle Egyptian grammar is not like English grammar. Key differences:

- **Verb-Subject-Object word order** (not Subject-Verb-Object like English)
- **No written vowels**: you need to learn how words are structured around consonants
- **Determinatives**: silent signs at the end of words that classify the word's meaning (a walking-legs sign after a verb of motion, a house sign after a building, etc.)
- **Stative and narrative forms**: Egyptian has verb forms that don't exist in English

This sounds daunting, but it's learnable with the right approach. The key is to learn grammar **alongside** reading practice, not in isolation. Every grammar point should be immediately applied to real text.

## Step 4: Read Real Inscriptions Early

Here's my strongest opinion in this entire guide: **start reading real ancient Egyptian text as early as possible, even if you can only understand fragments.**

Don't wait until you feel "ready." You'll never feel ready. Instead, start with well-published inscriptions that have translations available:

- **Royal cartouches**: The names of pharaohs are short, clearly bounded and everywhere. Our guide to [reading your first cartouche](/blog/reading-your-first-cartouche) walks through Tutankhamun, Cleopatra and Ramesses II sign by sign.
- **The [Rosetta Stone](/blog/how-the-rosetta-stone-changed-everything)**: Yes, it's the obvious choice, and yes, the hieroglyphic portion is damaged, but working through even a few lines with [the British Museum's object page](https://www.britishmuseum.org/collection/object/Y_EA24) is invaluable.
- **Tomb autobiographies**: Middle Kingdom tomb inscriptions are written in standard Middle Egyptian and are the texts most university courses use for reading practice.
- **The [Pyramid Texts](https://en.wikipedia.org/wiki/Pyramid_Texts)**: The oldest substantial body of Egyptian religious literature (c. 2400-2300 BCE). Challenging but fascinating.
- **Offering formulae**: The *ḥtp-dj-nsw* formula appears on thousands of stelae and follows a predictable pattern. Once you learn it, you can read it on almost any museum stela.

There's something that happens when you read a real inscription that no textbook exercise can replicate. You're not just practising a skill; you're hearing a human voice across millennia. That's what keeps you going through the difficult parts. We wrote about this experience in our post on [why learning hieroglyphics is worth the effort](/blog/why-learn-hieroglyphics).

## Step 5: Build a Practice Routine

Consistency matters more than intensity. Here's what I recommend:

- **Daily:** 15-20 minutes reviewing signs and reading practice (use flashcards or an app for sign drill)
- **Weekly:** One longer session (45-60 minutes) working through new grammar and reading a new passage
- **Monthly:** Attempt to read an inscription you haven't seen before, using a dictionary and grammar reference

The biggest risk is burnout. Hieroglyphics are intellectually demanding, and if you try to do too much too fast, you'll exhaust yourself. The people who succeed are the ones who study regularly in small amounts, not the ones who do marathon sessions once a month.

## Common Mistakes to Avoid

After teaching this subject and watching hundreds of learners, here are the patterns that consistently lead to failure:

**Trying to memorise every sign before reading.** You'll learn most signs through context, not memorisation. Focus on the 25 uniliterals, the most common biliterals and triliterals, and the key determinatives. The rest will come with reading practice.

**Ignoring determinatives.** These "silent" signs at the end of words are not optional extras; they're essential for reading. Without them, you can't distinguish between words that are spelled the same way. Learn to love determinatives.

**Only studying grammar without reading.** Grammar in isolation is dry and forgettable. Always apply grammar points to real text immediately.

**Comparing yourself to academics.** Professional Egyptologists have spent years or decades with these texts. You're not trying to become them (unless you are, in which case, go to grad school). You're trying to read well enough to engage with ancient Egyptian civilisation directly. That's achievable in months, not decades.

## The Bottom Line

Learning hieroglyphics online in 2026 is more accessible than it has ever been. The resources exist, from [interactive online courses](/get-started) to university textbooks to [free digital corpora](https://thesaurus-linguae-aegyptiae.de/). The writing system is complex but logical. The grammar is demanding but learnable.

What you need is the right sequence (alphabet → grammar → reading → practice), the right primary resource (something interactive and structured, supplemented by a good textbook), and the consistency to show up for 15-20 minutes a day.

If you're ready to start, [try our free lesson](/get-started) or [unlock the full course](/pricing) for a one-time $100 / £80. You'll learn the 25 uniliteral signs, decode your first cartouche, and read your first real inscription, all in the first week.`,
  },

  {
    slug: "should-i-learn-hieroglyphics",
    title: "Should I Learn Hieroglyphics? An Honest Answer",
    excerpt:
      "Should you learn hieroglyphics? An honest look at how hard it is, how long it takes, what you can realistically read after a month or a year, and who it suits.",
    quickAnswer:
      "Yes, if you enjoy ancient Egypt, puzzles or languages: hieroglyphics are far more learnable than their reputation suggests, because the core alphabet is only 25 signs and most museum inscriptions use a small, repetitive vocabulary. You will not become fluent in Middle Egyptian quickly, but reading names, titles and offering formulae on real monuments is a realistic goal within a few weeks of casual study. It is not a career skill unless you are heading into Egyptology.",
    date: "April 2026",
    publishedAt: "2026-04-05",
    updatedAt: "2026-09-07",
    category: "Opinion",
    glyph: "𓂋",
    image: "/blog/should-i-learn-hieroglyphics.webp",
    imageAlt: "Person studying ancient Egyptian hieroglyphics at a desk with glowing symbols and temple wall paintings",
    relatedSlugs: ["is-it-hard-to-learn-hieroglyphics", "why-learn-hieroglyphics", "how-to-learn-hieroglyphics-online"],
    faqs: [
      { question: "Is learning hieroglyphics hard?", answer: "The basics are surprisingly accessible. The core alphabet is 25 single-consonant signs that you can learn in a few hours, and common inscriptions repeat a small vocabulary. The hard part comes later: Middle Egyptian grammar has no written vowels, verb-first word order and verb forms English lacks. Most learners find the system logical once they get past the initial unfamiliarity, but reading literature takes years." },
      { question: "How long does it take to learn hieroglyphics?", answer: "You can learn the 25 uniliteral signs in a few hours and start reading simple names within days. Reaching a comfortable reading level for common inscriptions, such as royal names, titles and offering formulae, typically takes two to three months of regular practice. Reading literary Middle Egyptian with a full grammar takes one to two years of steady study." },
      { question: "Is hieroglyphics a real language?", answer: "Hieroglyphics is a writing system; the language it records is ancient Egyptian, spoken and written for over 3,000 years and surviving today as Coptic, the liturgical language of the Coptic Church. Learners usually study Middle Egyptian, the classical stage of the language used for most monuments and literature, which is why it is often called a dead language even though the script is fully understood." },
      { question: "Is it too late to learn hieroglyphics as an adult?", answer: "No. Most people who learn hieroglyphics are adults studying for pleasure, and evening classes, summer schools and online courses are built for them. Unlike a spoken language there is no pronunciation to master and no conversation to keep up with; it is a reading skill, learned at your own pace. The main requirements are curiosity and 15 to 20 minutes a day." },
      { question: "Can I learn hieroglyphics online?", answer: "Yes. Options range from free resources (sign lists, GlyphStudy's volunteer groups, open text corpora) to interactive courses and live tutored classes over Zoom. Learn Hieroglyphics is a self-paced online course of 8 lessons with a free first lesson; Collier and Manley's book is the standard self-study text; City Lit and the Egypt Exploration Society run tutored online classes." },
    ],
    content: `## Is Learning Hieroglyphics Worth It?

For most people who enjoy ancient Egypt, puzzles or languages, yes. That is my honest answer after months of learning the script, though not for the reasons you might expect. If you just want to try it, you can [learn hieroglyphics](/) here, starting with a free first lesson.

When I first started looking into hieroglyphics, I had one question on repeat: is this actually worth my time? It's a dead language. Nobody speaks ancient Egyptian at the coffee shop. There's no "Business Hieroglyphics" course on LinkedIn Learning. So why bother?

## Will It Help My Career?

Almost certainly not, unless you're planning a career in Egyptology. Let me be upfront about that. I didn't learn it for practical reasons. I learned it because I was genuinely curious, and that curiosity turned into one of the most rewarding intellectual experiences of my life.

There's something deeply satisfying about looking at symbols that have been carved into stone for over 4,000 years and being able to read them. The first time I decoded a cartouche on my own, I felt a connection to the ancient world that no documentary or museum visit had ever given me.

## Is Hieroglyphics Hard to Learn?

Hieroglyphics are easier to start than their reputation suggests and harder to finish than most people expect. One thing that held me back at first was the assumption that they would be impossibly difficult. I pictured thousands of mysterious symbols with no logic behind them. The reality is quite different.

The core of the system is built on **[25 single-consonant signs](/hieroglyphic-alphabet)** that work like an alphabet. Once you memorise those, you can start sounding out words almost immediately. Yes, there are hundreds of additional signs (logograms, biliterals, triliterals, determinatives), but you build up to those gradually. It's like learning any language: you start with the basics and layer on complexity over time.

I found the learning curve steep at the beginning but surprisingly manageable after the first few weeks. The writing system has an internal logic that starts to click once you get past the initial overwhelm. What slows people down later is the grammar, not the signs. For a layer-by-layer breakdown, see [is it hard to learn hieroglyphics?](/blog/is-it-hard-to-learn-hieroglyphics)

## What Can You Realistically Read, and How Soon?

Here is roughly what regular, light study (15–20 minutes a day) gets you:

| After | You can read | Example |
|---|---|---|
| A weekend | Names spelled with the alphabet signs | Cleopatra's and Ptolemy's cartouches |
| A month | Common royal names, titles and epithets | Tutankhamun, Ramesses II, "Son of Ra", "given life" |
| Three months | Formulaic monumental text | The offering formula on a museum stela |
| A year or more | Continuous Middle Egyptian with a grammar and dictionary | Tomb autobiographies, the *Tale of Sinuhe* |

If the first three rows are all you want, a short course and one good book will get you there. The fourth row needs a proper grammar and, ideally, a tutor or study group; see [the best courses to learn hieroglyphics](/blog/best-courses-to-learn-hieroglyphics).

## What Do You Actually Gain?

Here's what learning hieroglyphics has given me that I didn't expect:

**A new way of thinking about language.** Hieroglyphics combine sound, meaning, and classification in ways that no modern writing system does. A single word might include phonetic signs (spelling out sounds), a logogram (representing the whole concept), and a determinative (a silent sign that tells you what category the word belongs to). Wrapping my head around this system completely changed how I think about writing and communication.

**Real access to ancient texts.** Before I learned hieroglyphics, ancient Egypt was something I experienced through other people's translations and interpretations. Now I can read inscriptions directly. It's the difference between hearing someone describe a song and actually listening to it yourself.

**A genuine sense of accomplishment.** In a world where most of what I learn is immediately practical (a new framework, a productivity hack), learning hieroglyphics felt like a pure intellectual challenge. There's no shortcut, no AI tool that does it for you. You just have to sit down, study, and build the knowledge piece by piece. That process has been incredibly rewarding.

**Better museum visits.** This one sounds small, but it's been one of my favourite side effects. Walking through the Egyptian galleries at a museum and being able to read even fragments of the inscriptions transforms the experience entirely.

I go into these in more depth in [why learn hieroglyphics](/blog/why-learn-hieroglyphics); this post is about deciding, that one is about the payoff.

## Who Should Learn Hieroglyphics?

Hieroglyphics suit curious people with patience and no need for a quick practical return. It's a great fit if you:

- Have a genuine interest in ancient Egypt (even a casual one)
- Enjoy puzzles and pattern recognition
- Want an intellectual challenge that's completely different from your day job
- Like the idea of reading primary sources from one of history's greatest civilisations
- Are patient enough to stick with something that takes time to master

It's probably not for you if you need immediate practical returns on every hour you invest. But if you have room in your life for something that's purely enriching, I can't recommend it enough.

## How Do I Decide? Start Small

Start small. Learn the 25 uniliteral signs (the [free first lesson](/get-started) covers them in three sections of about ten minutes). Try to read a cartouche or two; [Cleopatra's name](/blog/reading-your-first-cartouche) is a great first exercise because it's spelled purely phonetically. Or type your own name into the [name translator](/translate-name-to-hieroglyphics) and see how the sound-signs work. You'll know pretty quickly whether this is something that excites you or not.

For me, the moment I realised I could read "Tutankhamun" in the original script, I was hooked. That single moment of recognition turned a casual curiosity into a genuine passion. If you decide to go on, [how to learn hieroglyphics online](/blog/how-to-learn-hieroglyphics-online) lays out the order to do things in.

So should you learn hieroglyphics? If the question keeps nagging at you, that's probably your answer right there.`,
  },
  {
    slug: "why-learn-hieroglyphics",
    title: "Why Learn Hieroglyphics? Seven Real Benefits",
    excerpt:
      "Why learn hieroglyphics? Seven real benefits, from reading 3,000 years of Egyptian texts in the original to rewiring how you think about writing itself.",
    quickAnswer:
      "Learning hieroglyphics lets you read 3,000 years of Egyptian history in the original (names on cartouches, temple inscriptions, the Book of the Dead) instead of relying on museum captions. It also trains visual memory and pattern recognition in a way alphabetic languages do not, and because the sign list is finite and the texts formulaic, beginners see results quickly: royal names within days, formulaic inscriptions within months.",
    date: "April 2026",
    publishedAt: "2026-04-01",
    updatedAt: "2026-09-07",
    category: "Motivation",
    glyph: "𓋹",
    image: "/blog/why-learn-egyptian-hieroglyphics.webp",
    imageAlt: "Sunlight streaming through ancient Egyptian temple columns illuminating hieroglyphic inscriptions on stone walls",
    relatedSlugs: ["should-i-learn-hieroglyphics", "how-to-learn-hieroglyphics-online", "reading-your-first-cartouche"],
    faqs: [
      { question: "What are the benefits of learning hieroglyphics?", answer: "Learning hieroglyphics gives you direct access to 3,000 years of ancient Egyptian texts without relying on translations. It trains visual memory and pattern recognition, because signs carry sound, meaning and category at once; it deepens your understanding of how writing systems work; and it transforms museum visits and travel to Egypt from looking at objects into reading them." },
      { question: "Do I need to know another language first?", answer: "No. Hieroglyphics is taught in English (or whichever language your course uses) and assumes no prior knowledge of any ancient or modern language. Knowing a little grammar terminology (noun, verb, suffix) helps, and Coptic or Arabic are useful later for vocabulary, but complete beginners start with the 25 alphabet signs and build from there." },
      { question: "Will learning hieroglyphics help me in Egyptology?", answer: "Yes. Reading hieroglyphs is a foundational skill in Egyptology, and university programmes teach Middle Egyptian in the first year. Even basic reading ability lets you engage with primary sources, follow academic debates about translations and form your own interpretations, which is the difference between reading about ancient Egypt and reading ancient Egypt." },
      { question: "How is learning hieroglyphics different from learning a modern language?", answer: "You only need to read, not speak or listen, so there is no pronunciation or conversation to master and progress is entirely at your own pace. The script mixes sound-signs with picture-signs, so you learn a system of writing as well as a vocabulary and grammar. The texts are also formulaic: once you know the offering formula you can read it on thousands of monuments." },
      { question: "What is the fastest reward when learning hieroglyphics?", answer: "Reading a royal name. Once you know the alphabet signs, names spelled phonetically, such as Cleopatra and Ptolemy, can be sounded out within a day or two, and with honorific transposition understood, Tutankhamun and Ramesses follow soon after. Because pharaohs' names appear on almost every monument, this single skill immediately changes what you see in a museum." },
    ],
    content: `## Why I Started (and Why I Stayed)

I'll admit it: when I first decided to learn hieroglyphics, part of me thought it was a novelty. Something fun to try for a few weeks before moving on to the next thing. But here I am, months later, still studying, still reading, and more motivated than ever. The reasons I started aren't the reasons I stayed.

If you're still weighing up whether to start at all, [should I learn hieroglyphics?](/blog/should-i-learn-hieroglyphics) covers how hard it is and how long it takes. This post is about the payoff: seven things learning hieroglyphics has actually given me. If it convinces you, you can [learn hieroglyphics](/) here, starting with a free lesson.

## 1. You Get Direct Access to 3,000 Years of History

Learning hieroglyphics means reading Egyptian texts in the original rather than through someone else's translation. This is the big one. Ancient Egypt produced an extraordinary volume of written material: temple inscriptions, tomb texts, medical treatises, love poetry, legal contracts, royal decrees, philosophical dialogues, and funerary literature. Most people only ever encounter this material through translations, and translations always involve interpretation.

When I started reading hieroglyphic texts myself, even simple ones, I realised how much nuance gets lost in translation. The word choices, the visual puns, the way determinatives add layers of meaning that simply don't exist in English. Reading the original is a fundamentally different experience from reading a translation, and it gave me a much deeper appreciation for the sophistication of ancient Egyptian thought.

## 2. It Rewires How You Think About Writing

Hieroglyphic writing encodes sound, meaning and category in the same word, which no modern script does. Before I studied hieroglyphics, I took the alphabet for granted. Letters represent sounds. You string sounds together to make words. Simple.

Hieroglyphics shattered that assumption. In this system, a single inscription might contain:

- **Phonetic signs** that represent one, two, or three consonants
- **Logograms** that represent entire words
- **Determinatives** that silently classify what kind of thing a word refers to
- **Phonetic complements** that partially repeat a sign's sound value to aid reading
- **Honorific transposition**, where a god's name is written first out of respect but spoken later

This layered approach to encoding meaning is unlike anything in modern writing. Learning it didn't just teach me about ancient Egypt. It fundamentally changed how I think about the relationship between symbols and meaning, between writing and language.

## 3. It's a Genuine Intellectual Challenge

I spend most of my time learning things that have immediate practical applications. Hieroglyphics is different. There's no shortcut. No way to skim. You have to build the knowledge methodically: memorise the signs, learn the grammar, practise reading real texts.

And honestly? That's what makes it so satisfying. Every inscription I can read, every new sign I recognise, every grammatical construction I understand feels like a real achievement. In a world full of quick wins and dopamine hits, hieroglyphics forces you to slow down and engage deeply with something. That process has been more rewarding than I expected.

## 4. It Connects You to Real People

One of the things that surprised me most about learning hieroglyphics is how human the texts feel. Ancient Egyptian writing isn't all grand religious declarations and royal propaganda. There are love poems, letters between friends, complaints about bad neighbours, and the attendance registers kept by [scribes at Deir el-Medina](/blog/the-scribes-egypts-most-powerful-class) recording why workers were absent ("bitten by a scorpion," "brewing beer," "drinking with Khonsu").

Reading these texts in the original script collapsed the distance between me and the people who wrote them. These weren't abstract historical figures. They were real people with real concerns, and their words have survived for thousands of years. Being able to read those words directly, without a translator in between, is an extraordinary experience.

## 5. It Makes History Physical

I used to walk through museum galleries full of Egyptian artefacts and see beautiful but mysterious objects. Now I can read (some of) what's written on them. That single change transformed how I experience museums, documentaries, and even travel.

When I visited the Egyptian collection at the [British Museum](https://www.britishmuseum.org/collection/galleries/egyptian-sculpture) after a few months of study, I could pick out royal names, identify offering formulae, and read fragments of funerary texts. I was no longer just looking at artefacts. I was reading them. That shift from observer to reader is hard to describe, but it's genuinely powerful.

## 6. It's a Gateway to Egyptology

If you've ever been curious about ancient Egypt but felt like the academic world of Egyptology was inaccessible, learning hieroglyphics is the key that opens the door. So much of the field is built on reading primary sources. Once you can engage with those sources yourself, even at a basic level, you can participate in the conversation rather than just observing it from the outside.

I've found myself reading academic papers, following debates about translations, and forming my own opinions about textual interpretations. That level of engagement simply wasn't possible before I learned the script.

## 7. The Payoff Comes Quickly

Unlike most languages, hieroglyphics reward you within days. The alphabet is 25 signs; foreign royal names such as Cleopatra's are spelled with those signs alone; and the offering formula that covers thousands of museum stelae follows one fixed pattern. You read something real almost immediately, and that early success is what carries you through the grammar later.

## Which Reasons Matter Most?

If I had to boil it down, I'd say the real reasons to learn hieroglyphics are:

1. **It gives you unmediated access to one of humanity's greatest civilisations.** No translator, no interpretation layer. Just you and the original text.
2. **It changes how you think.** The writing system is so different from anything modern that it genuinely expands your cognitive framework.
3. **It's deeply rewarding in a way that practical skills aren't.** Not everything worth learning needs to be useful. Some things are worth learning because they're beautiful, challenging, and profound.
4. **It connects you to real human beings across thousands of years.** That connection is something no amount of reading about history can replicate.

## How Do I Get Started?

If any of this resonates with you, my advice is simple: start. Learn the [uniliteral signs](/hieroglyphic-alphabet). Try [reading a cartouche or two](/blog/reading-your-first-cartouche). See if the spark catches. For me, it caught almost immediately, and it hasn't gone out since. When you're ready for a plan, [how to learn hieroglyphics online](/blog/how-to-learn-hieroglyphics-online) sets out the order, and the [first lesson here is free](/get-started).

The ancient Egyptians believed that speaking someone's name kept them alive in the afterlife. When you learn to read hieroglyphics, you're doing exactly that. You're giving voice to people who lived thousands of years ago. I can't think of a better reason to learn.`,
  },
  {
    slug: "how-the-rosetta-stone-changed-everything",
    title: "How the Rosetta Stone Was Deciphered and Why It Mattered",
    excerpt:
      "What the Rosetta Stone is, what its 196 BCE decree says, how Young and Champollion used its Greek text to decipher hieroglyphs in 1822, and why it mattered.",
    quickAnswer:
      "The Rosetta Stone is a granodiorite slab carrying a priestly decree of 196 BCE in three scripts: hieroglyphic, demotic and Greek. Because scholars could read the Greek, it provided the key that let Thomas Young and then Jean-François Champollion (1822) prove hieroglyphs recorded sounds as well as ideas, which reopened all of ancient Egyptian literature after some 1,400 years of silence. It was found at Rashid (Rosetta) in 1799 and has been in the British Museum since 1802.",
    date: "March 2026",
    publishedAt: "2026-03-20",
    updatedAt: "2026-09-07",
    category: "History",
    glyph: "𓋴",
    image: "/blog/rosetta-stone-decipherment.webp",
    imageAlt: "The Rosetta Stone showing ancient Egyptian hieroglyphics, Demotic script, and Greek text",
    relatedSlugs: ["hieroglyphs-vs-hieratic-vs-demotic", "reading-your-first-cartouche", "the-scribes-egypts-most-powerful-class"],
    faqs: [
      { question: "Where is the Rosetta Stone now?", answer: "The Rosetta Stone has been in the British Museum in London since 1802, where it is registered as object EA24. It stands in the Egyptian Sculpture Gallery (Room 4) on the ground floor and can be seen free of charge. Egypt has periodically requested its return; a full-size replica is displayed in the Rashid (Rosetta) museum." },
      { question: "Who deciphered the Rosetta Stone?", answer: "Jean-François Champollion, a French linguist, made the decisive breakthrough in September 1822 and published it in his Lettre à M. Dacier. He built on Thomas Young's earlier identification of the phonetic signs in Ptolemy's cartouche, and used his knowledge of Coptic, the latest form of the Egyptian language, to read native Egyptian names and words as well as foreign ones." },
      { question: "What does the Rosetta Stone say?", answer: "The stone carries a decree issued by a council of priests at Memphis in 196 BCE, on the first anniversary of the coronation of Ptolemy V Epiphanes. It records the king's gifts and tax concessions to the temples and his military successes, and establishes a royal cult in his honour. The same text appears in 14 lines of hieroglyphs, 32 of demotic and 54 of Greek." },
      { question: "What languages are on the Rosetta Stone?", answer: "Two languages in three scripts. The top and middle registers are ancient Egyptian, written first in hieroglyphs (the formal monumental script) and then in demotic (the everyday cursive script of the period). The bottom register is ancient Greek, the language of Egypt's Ptolemaic rulers. Greek was the only one of the three that scholars could still read in 1799." },
      { question: "Why is the Rosetta Stone so important?", answer: "It was the first text found that gave the same content in a known language (Greek) and in hieroglyphs, so it made decipherment possible. Once Champollion had cracked the system, more than 3,000 years of Egyptian inscriptions, literature, medicine and administration became readable. The phrase 'a Rosetta Stone' now means any key that unlocks a previously unreadable body of knowledge." },
    ],
    content: `## What Is the Rosetta Stone?

The Rosetta Stone is a broken slab of dark granodiorite, about 112 cm tall and weighing roughly 760 kilograms, carrying the same priestly decree of 196 BCE in three scripts: Egyptian hieroglyphs, Egyptian demotic and ancient Greek. It is the object that made the decipherment of hieroglyphs possible. Every sign value you use when you [learn Egyptian hieroglyphs](/) today goes back to that decipherment.

In July 1799, during Napoleon Bonaparte's military campaign in Egypt, a French officer named Pierre-François Bouchard was supervising the demolition of an old wall at Fort Julien near the town of Rashid (known to Europeans as Rosetta) in the western Nile Delta. Buried within the rubble, his team unearthed the stone, covered in three distinct bands of text.

Nobody could have predicted that this single artefact would become the most famous linguistic key in human history.

| Register | Script | Language | Lines surviving |
|---|---|---|---|
| Top | Hieroglyphic | Egyptian | 14 (badly damaged) |
| Middle | Demotic | Egyptian | 32 |
| Bottom | Greek | Greek | 54 |

Because scholars could already read Greek, this trilingual inscription offered a tantalising possibility: a way to finally crack the hieroglyphic code that had been lost for nearly 1,400 years. (For how the three Egyptian scripts relate to one another, see [hieroglyphs vs. hieratic vs. demotic](/blog/hieroglyphs-vs-hieratic-vs-demotic).)

## Why Could Nobody Read Hieroglyphs?

Knowledge of hieroglyphs died out in late antiquity because the priests who used them did, and for over a thousand years nobody could read a single sign. To appreciate the significance of the Rosetta Stone, you need to understand how thoroughly that knowledge had vanished. The last known hieroglyphic inscription was carved in 394 CE at the Temple of Philae near Aswan. After that, the ability to read the script disappeared entirely.

For over a millennium, European scholars speculated wildly about hieroglyphs. Many believed each symbol represented a mystical concept or philosophical idea rather than sounds in a language. Horapollo, an Egyptian writing in Greek in about the fifth century CE, whose *Hieroglyphica* was rediscovered in 1419, reinforced the notion that hieroglyphs were purely symbolic, an error that sent researchers down the wrong path for centuries.

By the time Napoleon's expedition arrived in Egypt, hieroglyphic writing was an impenetrable mystery. Temples, tombs, and monuments across the country were covered in thousands of inscriptions that no living person could read. Three and a half millennia of literature, history, poetry, science, and religion were locked away behind a wall of beautiful but incomprehensible symbols.

## Who Deciphered the Rosetta Stone: Young or Champollion?

Thomas Young made the first real progress and Jean-François Champollion completed the decipherment in 1822. After the British defeated the French in Egypt in 1801, the Rosetta Stone was surrendered under the terms of the Capitulation of Alexandria. It was shipped to London, where it has remained in the [British Museum](https://www.britishmuseum.org/collection/object/Y_EA24) since 1802.

Copies of the inscriptions were distributed to scholars across Europe, sparking an intense competition to be the first to decipher the hieroglyphs. Two figures emerged at the forefront of this intellectual race.

**Thomas Young**, a brilliant English polymath, made the first significant breakthrough. Working from the Demotic section, he identified that some hieroglyphs in the [cartouches](/blog/reading-your-first-cartouche) (oval enclosures) on the stone represented the sounds of a royal name, specifically Ptolemy. Young proposed that hieroglyphs might be phonetic, at least when spelling foreign names. However, he didn't extend this principle further, assuming that the bulk of the script was still symbolic.

**[Jean-François Champollion](https://en.wikipedia.org/wiki/Jean-Fran%C3%A7ois_Champollion)**, a young French linguist, took the decisive leap. Born in 1790, Champollion had been obsessed with Egypt since childhood and had mastered Coptic, the final stage of the Egyptian language, still used in the liturgy of the Coptic Church. This knowledge of Coptic proved to be his secret weapon.

## What Was Champollion's Breakthrough?

Champollion's breakthrough was realising that hieroglyphs spelled sounds for native Egyptian words too, not just for foreign names. On 14 September 1822, he received copies of inscriptions from the temple of Abu Simbel that contained cartouches not found on the Rosetta Stone. Working rapidly, he identified the cartouche of Ramesses II by recognising the Coptic word for "sun" (*ra*) represented by the sun disc hieroglyph, combined with phonetic signs spelling *m-s-s*.

The realisation struck him like lightning: hieroglyphs were not purely symbolic. They were a sophisticated writing system that combined phonetic signs (representing sounds), logograms (representing whole words), and determinatives (silent classifiers indicating meaning categories). This mixed system was far more complex and elegant than anyone had imagined.

According to legend, Champollion burst into his brother's office shouting "Je tiens l'affaire!" ("I've got it!") before collapsing in a dead faint from the excitement.

He published his findings in the famous *Lettre à M. Dacier* later that month, laying the groundwork for every Egyptologist who followed.

## What Is Written on the Rosetta Stone?

The inscription is a priestly decree issued in 196 BCE during the reign of **Ptolemy V Epiphanes**, a pharaoh of the Greek Ptolemaic dynasty that ruled Egypt after Alexander the Great's conquests. The decree was issued by a council of priests gathered at Memphis to honour Ptolemy V on the first anniversary of his coronation.

The text records tax exemptions granted to temples, describes the king's military victories, and establishes a new cult in his honour. By modern standards, it is bureaucratic and unremarkable, essentially a piece of royal propaganda. But its mundane content is precisely what made it so valuable. Because the same text appeared in three scripts, it provided the parallel needed to decode the hieroglyphs.

## What Did the Decipherment Unlock?

Everything the Egyptians ever wrote. Champollion's decipherment did not happen overnight. He spent the remaining decade of his life (he died in 1832, aged just 41) refining the hieroglyphic grammar and building a comprehensive sign list. Subsequent scholars, including Karl Richard Lepsius, Heinrich Brugsch, Adolf Erman, and Alan Gardiner, expanded and corrected his work over the following century.

The consequences were staggering. Once scholars could read hieroglyphs, the entire corpus of ancient Egyptian literature, science, and history opened up:

- **The Pyramid Texts**, the oldest religious writings in the world, could finally be translated.
- **Medical papyri** revealed that Egyptian physicians practised sophisticated surgery and pharmacology thousands of years before Hippocrates.
- **Love poetry and wisdom literature** showed that ancient Egyptians grappled with the same emotions and philosophical questions we do today.
- **Administrative records**, kept by the [scribes](/blog/the-scribes-egypts-most-powerful-class) who ran the state, revealed the complex bureaucracy that built the pyramids, not with slave labour, as long believed, but with organised teams of paid workers.

## Why Does the Rosetta Stone Matter for Learners Today?

The Rosetta Stone is more than a museum piece. It is a reminder that languages can be lost and recovered, that scripts carry civilisations within them, and that one determined individual with the right tools can crack a code that defeated scholars for a thousand years.

You can retrace the decipherment yourself in about twenty minutes: [Decipher](/daily/decipher) is a free five-chapter puzzle that hands you the Ptolemy cartouche, then Cleopatra's, then the Abu Simbel copies, and lets you deduce the sign values in the order Young and Champollion did.

When I began learning hieroglyphics, I found it inspiring to know that I was walking the path that Champollion opened. The same phonetic principles he discovered, the [uniliteral signs](/hieroglyphic-alphabet), the determinatives, the phonetic complements, are exactly what you study in your first lessons. You have an advantage he never had: a structured curriculum, centuries of subsequent scholarship, and a complete understanding of the grammar he spent his life reconstructing.

The Rosetta Stone didn't just change Egyptology. It proved that the past is never truly lost. It simply waits for someone curious enough to learn its language.`,
  },
  {
    slug: "5-hieroglyphs-you-already-know",
    title: "5 Egyptian Hieroglyphs You Already Know (and What They Mean)",
    metaTitle: "𓂀 Eye of Horus, 𓋹 Ankh & 3 More Hieroglyphs You Know",
    metaDescription:
      "𓂀 is the Eye of Horus and 𓋹 the ankh. What those two, the scarab, the djed pillar and the sun disc really meant, and how each worked as a sign in the script.",
    excerpt:
      "Five Egyptian hieroglyphs you already recognise (ankh, Eye of Horus, scarab, djed, sun disc), what each actually meant and how it worked in the script.",
    quickAnswer:
      "Five hieroglyphs survive as everyday symbols: the ankh (life), the Eye of Horus or wedjat (protection and healing), the scarab beetle (the verb 'to come into being', and the sun god Khepri), the djed pillar (stability, the backbone of Osiris) and the sun disc (Ra, sun, day). Each was a working sign in the script with a real phonetic or ideographic value, not just a decorative symbol.",
    date: "March 2026",
    publishedAt: "2026-03-05",
    updatedAt: "2026-09-07",
    category: "Beginner",
    glyph: "𓂀",
    image: "/blog/five-egyptian-hieroglyphs-you-already-know.webp",
    imageAlt: "Five famous Egyptian hieroglyphics symbols including the ankh, Eye of Horus, scarab beetle, djed pillar, and sun disc",
    relatedSlugs: ["what-does-the-ankh-symbol-mean", "reading-your-first-cartouche", "the-book-of-the-dead-a-readers-guide"],
    faqs: [
      { question: "What does the ankh symbol mean?", answer: "The ankh is the hieroglyphic sign for the word ꜥnḫ, 'life'. It appears throughout Egyptian art and inscriptions, often held by gods who extend it toward the pharaoh's nose to grant the breath of life. In the script it works as a logogram for 'life' and as a triliteral sound-sign in other words, and it follows royal names in the phrase 'given life'." },
      { question: "What is the Eye of Horus used for?", answer: "The Eye of Horus (wedjat) symbolised healing, restoration and protection, recalling the myth in which Horus's eye was injured by Seth and restored by Thoth. Ancient Egyptians wore it as an amulet, painted it on coffins and boats as a protective ward, and used it in the offering ritual. Today it is a popular jewellery and tattoo motif." },
      { question: "What does the scarab beetle mean in hieroglyphs?", answer: "The scarab (Gardiner L1) is a triliteral sign writing the consonants ḫ-p-r, the verb ḫpr, 'to come into being' or 'to transform'. It also stands for Khepri, the god of the rising sun, because the beetle rolling its ball of dung was seen as a parallel to the sun being pushed across the sky. Heart scarabs inscribed with Spell 30B were placed on mummies." },
      { question: "What is the djed pillar?", answer: "The djed is a column with four horizontal bars near the top, one of the oldest Egyptian symbols. It represented stability and endurance and was identified with the backbone of the god Osiris, so it stood for his resurrection and the promise of eternal life. In writing it is the logogram for ḏd, 'stable', and the ceremonial Raising of the Djed renewed cosmic order." },
      { question: "How many hieroglyphic symbols are there?", answer: "The classical Middle Egyptian script used roughly 700 distinct signs, catalogued in Gardiner's sign list; Ptolemaic and Roman temple inscriptions expanded that to several thousand. In practice about 130 to 150 signs cover the vast majority of common texts, and the core alphabet of single-consonant signs is only 25, which is why beginners can start reading names within days." },
    ],
    content: `## Which Egyptian Hieroglyphs Do People Already Recognise?

The ankh, the Eye of Horus, the scarab beetle, the djed pillar and the sun disc are the five hieroglyphs most people can recognise without ever having studied the script. You've already encountered them dozens of times: on jewellery, tattoos, film posters, video games, and even pharmaceutical packaging. These symbols have survived for over 5,000 years because they are visually striking and carry powerful meanings that still resonate today.

But how well do you really know them? The popular understanding of these symbols is often simplified or distorted. Here is what each one truly meant to the people who created it, and how it worked as a sign in the writing system. They make a good first step if you want to [learn Egyptian hieroglyphs](/) properly.

| Sign | Name | Gardiner code | Core meaning | Role in the script |
|---|---|---|---|---|
| 𓋹 | Ankh | S34 | Life | Logogram for *ꜥnḫ*; triliteral *ꜥ-n-ḫ* |
| 𓂀 | [Eye of Horus (wedjat)](/hieroglyph-meaning/eye-of-horus) | D10 | Protection, healing, wholeness | Logogram for *wḏꜣt*, the restored eye |
| 𓆣 | [Scarab](/hieroglyph-meaning/scarab) | L1 | To come into being; Khepri | Triliteral *ḫ-p-r* |
| 𓊽 | [Djed pillar](/hieroglyph-meaning/djed-pillar) | R11 | Stability, endurance | Logogram for *ḏd* |
| 𓇳 | Sun disc | N5 | Ra, sun, day | Logogram and determinative |

## 1. The Ankh (𓋹) - The Key of Life

**What you think it means:** Life, or some vague spiritual energy.

**What it actually means:** The ankh is the hieroglyphic sign for the word *ꜥnḫ*, which translates simply as "life." But in ancient Egyptian context, its significance was profound and multifaceted; I've written a [full guide to the ankh](/blog/what-does-the-ankh-symbol-mean).

The ankh appears in virtually every temple and tomb in Egypt. Gods are shown holding it by the loop, often extending it towards the nose of a pharaoh, literally giving the breath of life. Osiris, Isis, Hathor, Amun, and Ra are all depicted carrying the ankh, marking it as an attribute of divine power.

In the hieroglyphic writing system, the ankh functions as both a **logogram** (representing the entire word "life") and as a sound-sign in other words. It appears in words like *ꜥnḫ.w* ("the living") and in the phrase *dj ꜥnḫ* ("given life"), which follows royal names in inscriptions.

The exact origin of the ankh's shape is debated. Theories include a sandal strap, a mirror, a knot of cloth, or a combined male-female symbol. Whatever its origin, it became Egypt's most powerful written symbol of life, vitality, and eternal existence.

## 2. The Eye of Horus (𓂀) - The Wedjat Eye

**What you think it means:** Protection, or a cool-looking eye symbol.

**What it actually means:** The *wedjat* (meaning "the whole one" or "the restored one") represents the left eye of the falcon god Horus. According to myth, Horus lost his eye in a fierce battle with his uncle Seth, who had murdered Horus's father Osiris. The god Thoth, patron of scribes and wisdom, magically restored the damaged eye, making it whole again.

This myth gave the wedjat its symbolic power: **healing, restoration, and protection**. Egyptians painted it on coffins, carved it into amulets, and inscribed it on temple walls as a protective ward against evil. For the full story, including how it differs from the Eye of Ra, see [what 𓂀 means](/hieroglyph-meaning/eye-of-horus).

You will often read that the parts of the [Eye of Horus](https://en.wikipedia.org/wiki/Eye_of_Horus) were also the signs for the grain fractions 1/2, 1/4, 1/8, 1/16, 1/32 and 1/64, which add up to 63/64, with the missing 1/64 supplied by Thoth's magic. It is a lovely story, proposed by the Egyptologist Georg Möller in 1911, but recent work on the hieratic fraction signs has undermined it and most specialists now treat it as a modern myth. The same goes for the claim that the pharmacist's "Rx" descends from the wedjat: the standard explanation is that it abbreviates the Latin *recipe*, "take".

## 3. The Scarab Beetle (𓆣) - Symbol of Transformation

**What you think it means:** A lucky beetle, or rebirth.

**What it actually means:** The scarab beetle (*Scarabaeus sacer*) was one of the most important symbols in all of Egyptian religion and writing. The Egyptians observed how the dung beetle rolled balls of dung across the ground and saw a cosmic parallel: just as the beetle pushed its ball, the god **Khepri** pushed the sun across the sky each morning.

In the hieroglyphic script, the scarab is a **triliteral sign**, one of the most sophisticated types of hieroglyph. It represents three consonants: **ḫ-p-r**, spelling the verb *ḫpr*, meaning "to come into being" or "to transform." This single sign encodes an entire concept of creation and metamorphosis.

Khepri, the scarab-headed god, represented the rising sun and the idea of self-creation. The Egyptians believed the beetle spontaneously generated from its dung ball, just as the sun appeared to create itself anew each dawn. This made the scarab a symbol of **rebirth, renewal, and resurrection**.

Scarab amulets were placed over the hearts of mummies during the embalming process. These "heart scarabs" bore inscriptions from the [Book of the Dead](/blog/the-book-of-the-dead-a-readers-guide), specifically Spell 30B, which implored the heart not to testify against its owner during the judgement of the dead. There is more on scarab seals and Khepri in [what 𓆣 means](/hieroglyph-meaning/scarab).

## 4. The Djed Pillar (𓊽) - The Backbone of Osiris

**What you think it means:** You might recognise this one from Egyptian artwork without knowing its name. It looks like a column with horizontal bars.

**What it actually means:** The djed pillar is one of the oldest symbols in Egyptian iconography, predating the unification of Egypt around 3100 BCE. It represents **stability, endurance, and the backbone of the god Osiris**.

According to myth, after Seth murdered Osiris and scattered his body parts across Egypt, Isis gathered them and reassembled her husband. The djed pillar symbolises Osiris's spine, and by extension, his resurrection and the promise of eternal life for all who followed proper funerary rites.

The "Raising of the Djed" was an important annual ceremony performed at Memphis, where the pharaoh and priests physically erected a large djed column as a ritual act of cosmic renewal. This ceremony symbolised the triumph of order (*maat*) over chaos (*isfet*) and Osiris's victory over death.

In hieroglyphic writing, the djed functions as a **logogram** for the word *ḏd*, meaning "stability" or "endurance." It appears in royal titles, temple inscriptions, and funerary texts as a powerful invocation of permanence. I go further into the ritual and the djed's origins in [what 𓊽 means](/hieroglyph-meaning/djed-pillar).

## 5. The Sun Disc (𓇳) - Ra and the Cycle of Days

**What you think it means:** The sun.

**What it actually means:** The simple circle that represents the sun disc is far more nuanced than it first appears. In the hieroglyphic writing system, this sign works on multiple levels simultaneously.

As a **logogram**, it can mean "Ra" (the sun god), "sun," "day," or "time." As a **determinative**, it appears at the end of words related to the sun, light, and time to classify their meaning. A small stroke beneath it indicates when it should be read as the word itself rather than as part of a phonetic spelling.

The sun disc appears in some of the most important royal names in Egyptian history. It opens the [cartouche of Ramesses II](/blog/reading-your-first-cartouche) (*Ra-mes-su*, "Ra bore him") through a scribal convention called **honorific transposition**: the name of the god is written first out of respect, even though it is spoken later in the name.

Perhaps the most dramatic use of the sun disc came during the reign of Akhenaten (c. 1353-1336 BCE), who elevated the sun disc, called the **Aten**, to the status of sole god. Akhenaten's religious revolution, sometimes called the world's first monotheism, placed this simple hieroglyph at the centre of an entirely new theology.

## How Do You Start Reading These Symbols in Context?

Knowing these five symbols gives you a head start, but none of them is a letter. In the hieroglyphic system, every sign has multiple functions. It might be a sound, a word, or a silent classifier depending on its position and context. The ankh can spell the sound *ꜥnḫ* in other words. The scarab writes the sounds *ḫ-p-r* in verbs that have nothing to do with beetles.

That layered complexity is what makes hieroglyphics such a rewarding script to learn. You're not just memorising an alphabet. You're entering a system of writing that encodes sound, meaning, and classification simultaneously, in ways that no modern writing system attempts.

These five symbols are your first steps. The next is the actual alphabet: the [25 single-consonant signs](/hieroglyphic-alphabet) that spell out names. Try [writing your own name in hieroglyphs](/translate-name-to-hieroglyphics) to see them in action, then learn them properly in the [free first lesson](/get-started).`,
  },
  {
    slug: "reading-your-first-cartouche",
    title: "Reading Your First Cartouche: A Step-by-Step Guide",
    metaTitle: "What Is a Royal Cartouche? Read Tutankhamun & Cleopatra",
    metaDescription:
      "A royal cartouche is the oval rope ring around a pharaoh's name. Learn to read one step by step, then sound out Tutankhamun, Cleopatra and Ramesses II.",
    excerpt:
      "How to read a royal cartouche step by step: find the reading direction, spot honorific transposition, then sound out Tutankhamun, Cleopatra and Ramesses II.",
    quickAnswer:
      "A cartouche is the oval rope loop with a bar at one end that surrounds a pharaoh's throne name and birth name. To read one, find the direction the animal and human signs face (they look towards the start of the text), then sound out the signs one by one, remembering that a god's name is written first out of respect (honorific transposition). Tutankhamun's cartouche, for instance, reads twt-ꜥnḫ-ꞽmn, 'living image of Amun', with Amun written first but spoken last.",
    date: "February 2026",
    publishedAt: "2026-02-20",
    updatedAt: "2026-09-09",
    category: "Tutorial",
    glyph: "𓇳",
    image: "/blog/egyptian-cartouche-royal-name-hieroglyphs.webp",
    imageAlt: "Ancient Egyptian cartouche containing hieroglyphic symbols spelling a pharaoh's royal name",
    relatedSlugs: ["tutankhamun-cartouche-explained", "5-hieroglyphs-you-already-know", "how-the-rosetta-stone-changed-everything"],
    faqs: [
      { question: "What is a cartouche in ancient Egypt?", answer: "A cartouche is an oval ring with a horizontal bar at the base that encloses a pharaoh's name in hieroglyphic inscriptions. The Egyptians called it shenu, from the verb meaning 'to encircle', and it represented a loop of rope tied at one end. It marked the two most important royal names, the throne name and birth name, and served as a magical protective boundary around them." },
      { question: "How do you read a cartouche?", answer: "First determine the reading direction by noting which way the animal and human signs face; they look toward the start of the text. Then watch for honorific transposition, where a god's name such as Ra or Amun is written first but spoken later. Finally, sound out each sign, using the 25 uniliteral alphabet signs as your foundation and recognising the ideograms that stand for whole words." },
      { question: "What is honorific transposition?", answer: "Honorific transposition is the scribal convention of writing the name of a god (or the word for 'king') at the beginning of a name or phrase out of respect, even though it is spoken later. In Tutankhamun's cartouche, Amun is written first but the name is read Tut-ankh-Amun; in Ramesses II's throne name, Ra appears first but is spoken at the end of each element." },
      { question: "Why do pharaohs have two cartouches?", answer: "From the Middle Kingdom onward every king had a formal titulary of five names, and two of them were written in cartouches: the prenomen or throne name, given at coronation and usually containing the name of Ra, and the nomen or birth name, introduced by 'Son of Ra'. On monuments the two cartouches often appear side by side, so identifying either one will tell you which king built or usurped a monument." },
      { question: "Which cartouche is easiest to read for a beginner?", answer: "Cleopatra's or Ptolemy's. Greek rulers' names were spelled out sound by sound with alphabet signs, with no ideograms and no honorific transposition, so once you know the 25 uniliteral signs you can sound them out directly. This is exactly why Champollion started with them. Among native Egyptian names, Khufu's is the easiest: four alphabet signs and no god's name to transpose." },
    ],
    content: `## What Is a Cartouche?

A cartouche is the elongated oval, with a horizontal bar at the base, that encloses a pharaoh's name in hieroglyphic inscriptions. If you've ever seen a photograph of an Egyptian temple or a display case in a museum, you've almost certainly noticed them. They are among the most recognisable features of Egyptian inscriptions, and they serve a very specific purpose: they mark **royal names**.

The word "cartouche" itself is French. Napoleon's soldiers in Egypt noticed that the oval shape resembled the paper cartridges (*cartouches*) they used in their muskets, and the name stuck. The Egyptians had their own term: *shenu*, derived from the verb *sheni*, meaning "to encircle." The cartouche was a protective ring, a magical boundary that encircled and safeguarded the pharaoh's name for eternity.

I think reading cartouches is one of the most practical skills to pick up when you [learn hieroglyphics](/), because royal names appear on virtually every monument in Egypt. Once you can read them, you can identify who built a temple, when a tomb was constructed, and which dynasty left its mark on the landscape.

## What Are the Five Royal Names?

From the Middle Kingdom onward every pharaoh held a formal titulary of **five names**, each introduced by a specific title (the full set developed gradually through the Old Kingdom):

1. **Horus name**, the oldest royal title, written inside a *serekh* (a rectangular frame representing the palace facade)
2. **Nebty name** (Two Ladies), invoking the protective goddesses Nekhbet (vulture) and Wadjet (cobra)
3. **Golden Horus name**, the least understood, possibly referring to the eternal nature of the king
4. **Prenomen** (throne name), enclosed in a cartouche, given at coronation, always containing the name of Ra
5. **Nomen** (birth name), enclosed in a cartouche, the personal name given at birth

The two cartouche names, the **prenomen** and **nomen**, are what you'll encounter most frequently on monuments. The prenomen typically precedes the title *nswt-bjtj* ("King of Upper and Lower Egypt"), while the nomen follows *sꜣ Rꜥ* ("Son of Ra").

## Decoding Tutankhamun's Cartouche

Let's start with one of the most famous names in history. Tutankhamun's nomen (birth name) cartouche reads:

**𓇋𓏠𓈖𓏏𓅱𓏏𓋹𓋾𓉺𓇗**

Reading hieroglyphs in a cartouche requires knowing the direction of reading (signs face the beginning of the text) and understanding **honorific transposition**, where divine names are written first but spoken later.

Breaking it down step by step:

- **𓇋𓏠𓈖** these signs spell *jmn* (Amun), written first due to honorific transposition
- **𓏏𓅱𓏏** these spell *twt*, meaning "image" or "likeness"
- **𓋹** the [ankh sign](/blog/what-does-the-ankh-symbol-mean), meaning "living"
- **𓋾𓉺𓇗** *ḥqꜣ ꞽwnw šmꜥ*, "ruler of Southern Heliopolis" (that is, Thebes), an epithet Tutankhamun's scribes routinely wrote inside the cartouche after the name itself. On the golden mask and the shrines you will see it; on a museum label you usually won't.

Reassembled in spoken order: **Tut-ankh-amun**, "Living image of Amun," followed by the epithet. His other cartouche, the throne name Nebkheperure, and the story of how he was born Tutankhaten are covered sign by sign in [Tutankhamun's cartouche explained](/blog/tutankhamun-cartouche-explained).

Notice how the god's name (Amun) appears at the start of the cartouche out of respect, even though it is spoken last. This scribal convention is called honorific transposition, and it appears in almost every royal cartouche. Once you're aware of it, you'll spot it immediately.

## Decoding Cleopatra's Cartouche

Cleopatra VII (the famous queen who allied with Julius Caesar and Mark Antony) was of Greek Ptolemaic origin, so her name is spelled purely phonetically, with no honorific transposition needed. This makes it an ideal beginner exercise.

Her cartouche reads: **𓈎𓃭𓇋𓅱𓊪𓄿𓂧𓂋𓄿𓏏**

Reading each sign for its sound value:

- **𓈎** q (hill slope)
- **𓃭** l (lion)
- **𓇋** i (reed leaf)
- **𓅱** w/o (quail chick)
- **𓊪** p (stool)
- **𓄿** a (vulture)
- **𓂧** d (hand)
- **𓂋** r (mouth)
- **𓄿** a (vulture)
- **𓏏** t (bread loaf)

Sounding it out: **Q-L-I-O-P-A-D-R-A-T**, or as we know it, **Cleopatra**.

This is remarkably straightforward compared to native Egyptian names because it uses only **uniliteral signs**, the [single-consonant hieroglyphs that function like an alphabet](/hieroglyphic-alphabet). [Champollion](https://en.wikipedia.org/wiki/Jean-Fran%C3%A7ois_Champollion) used exactly this cartouche, along with Ptolemy's from the [Rosetta Stone](/blog/how-the-rosetta-stone-changed-everything), as his initial key to the phonetic values of hieroglyphs.

## Decoding Ramesses II's Cartouche

Now let's tackle a more complex example. Ramesses II, often called [Ramesses the Great](https://en.wikipedia.org/wiki/Ramesses_II), left his cartouches on more monuments than any other pharaoh. His prenomen (throne name) reads:

**𓇳𓄊𓁧𓍉𓈖**

Only five signs, but they pack in a lot:

- **𓇳** Ra (sun disc), written first by honorific transposition, and read *twice*, once in *wsr-mꜣꜥt-rꜥ* and once in *stp-n-rꜥ*
- **𓄊** *wsr* (powerful): the head and neck of an animal, a single picture standing for a whole word
- **𓁧** *mꜣꜥt*: the goddess Maat herself, seated with her feather, standing for "truth, order"
- **𓍉** *stp* (chosen): a carpenter's adze
- **𓈖** *n* (by)

In spoken order: **User-Maat-Ra Setep-en-Ra**, "Powerful is the truth of Ra, chosen by Ra."

His birth-name cartouche is **𓇋𓏠𓈖𓌸𓇳𓄟𓋴𓇓**, *rꜥ-ms-sw mry-ꞽmn*, "Ra has borne him, beloved of Amun." Both gods (Amun 𓇋𓏠𓈖 and Ra 𓇳) are pulled to the front; 𓌸 is *mry* (beloved), 𓄟 is *ms* (born), and 𓋴𓇓 spell *sw* (him).

These two cartouches demonstrate the features that make royal names harder than Cleopatra's: honorific transposition (a god's name written first, here twice in one ring), **ideograms** (one picture standing for the whole word *wsr* or *mꜣꜥt* rather than spelling it out), and a goddess folded into the king's title. Reading them correctly means recognising which signs are letters and which are whole words.

## More Royal Cartouches to Practise On

Once you can manage the three names above, these are the cartouches you will meet most often in museums and on scarabs. Each is written the way it appears on the monuments, reading left to right:

- **Khufu** (Cheops), builder of the Great Pyramid: **𓐍𓅱𓆑𓅱**, *ḫwfw*, "he protects me" (short for Khnum-khuf, "Khnum protects me"). Four alphabet signs, no transposition: the easiest native Egyptian name to read.
- **Thutmose III**, throne name: **𓇳𓏠𓆣**, *mn-ḫpr-rꜥ*, "Lasting is the manifestation of Ra" (Menkheperre). This is the single most common cartouche on Egyptian scarabs; if you learn one throne name, learn this one.
- **Hatshepsut**, throne name: **𓇳𓁧𓂓**, *mꜣꜥt-kꜣ-rꜥ*, "Truth is the ka of Ra" (Maatkare). Ra first by transposition, then Maat, then the pair of upraised arms that write *kꜣ*.
- **Akhenaten**: **𓇋𓏏𓈖𓇳𓅜𓈖**, *ꜣḫ-n-ꞽtn*, "Effective for the Aten." The sun-disc god's name (*ꞽtn*, with the disc as its determinative) is written first; the crested ibis 𓅜 writes *ꜣḫ*.
- **Ptolemy** (Ptolemaios): **𓊪𓏏𓍯𓃭𓐝𓇌𓋴**, *ptwlmys*. A Greek name spelled sound by sound: p-t-w-l-m-y-s. This was the first cartouche Champollion cracked, using the Greek text of the Rosetta Stone.
- **Alexander the Great**: **𓄿𓃭𓎡𓋴𓇋𓈖𓂧𓂋𓋴**, *ꜣlksꞽndrs*. Nine alphabet signs, no gods, no surprises.

Notice the pattern: foreign rulers (Ptolemy, Cleopatra, Alexander) are spelled out with the [25 alphabet signs](/hieroglyphic-alphabet) alone, while native pharaohs lean on ideograms and honorific transposition. That is why Champollion started with the foreigners, and why you should too.

## How Do You Read a Cartouche in the Wild?

Five habits will get you through most cartouches you meet on a monument or in a museum.

**1. Determine reading direction.** Hieroglyphs face the beginning of the line. If the birds and people face left, read left to right. If they face right, read right to left. Inside cartouches, the same rule applies.

**2. Look for honorific transposition.** If you see a sun disc (𓇳) or the signs for Amun (𓇋𓏠𓈖) at the start, they are probably written first out of respect but spoken later in the name.

**3. Identify the title before the cartouche.** The signs *nswt-bjtj* (sedge plant and bee) before a cartouche indicate the prenomen. The signs *sꜣ Rꜥ* (duck and sun disc) indicate the nomen.

**4. Start with Ptolemaic names.** Greek and Roman names in cartouches (Ptolemy, Cleopatra, Alexander, Augustus) are spelled phonetically without honorific transposition. They are the easiest to decode and are how Champollion started too.

**5. Use the uniliteral signs as your foundation.** If you memorise the [25 single-consonant signs](/hieroglyphic-alphabet), you can sound out most foreign names and begin to recognise common phonetic patterns in Egyptian names.

## Your Turn

Cartouches are everywhere, in museums, textbooks, documentaries, and on the walls of every major Egyptian monument. They are the most accessible entry point into reading real hieroglyphic inscriptions because they are clearly bounded, relatively short, and often well-documented.

Pick up any book on ancient Egypt, find a cartouche, and try to sound it out. You now have the tools to begin. The pharaohs wrote their names to last for eternity, and thanks to what you've just learned, their wish is being fulfilled.

Two ways to keep going:

- **Write your own cartouche.** Type your name into the [free hieroglyphics name translator](/translate-name-to-hieroglyphics) and it will spell it with the same alphabet signs Cleopatra's scribes used. Then forge it into a 3D cartouche you can download.
- **Learn all 25 alphabet signs properly.** The [free first lesson](/get-started) teaches the full uniliteral alphabet in three sections of about ten minutes, with a quick check after every few signs, so that the next cartouche you meet reads itself. After that, [how to learn hieroglyphics online](/blog/how-to-learn-hieroglyphics-online) covers what to tackle next.`,
  },
  {
    slug: "the-scribes-egypts-most-powerful-class",
    title: "Scribes in Ancient Egypt: The Most Powerful Class",
    excerpt:
      "Who the scribes of ancient Egypt were, how they trained, what they did all day, the tools they used and why, with so few literate, writing meant power.",
    quickAnswer:
      "Scribes were the literate administrative class of ancient Egypt, perhaps 1 to 5 percent of the population, trained from childhood in schools attached to temples and palaces to write hieratic and hieroglyphs. Because every tax record, legal ruling, temple ritual and royal inscription passed through them, literacy was a direct route to wealth, exemption from manual labour and political power.",
    date: "February 2026",
    publishedAt: "2026-02-05",
    updatedAt: "2026-09-07",
    category: "Culture",
    glyph: "𓁐",
    image: "/blog/ancient-egyptian-scribes-at-work.webp",
    imageAlt: "Ancient Egyptian scribe writing hieroglyphics on papyrus with reed pen and ink palette",
    relatedSlugs: ["hieroglyphs-vs-hieratic-vs-demotic", "the-book-of-the-dead-a-readers-guide", "how-the-rosetta-stone-changed-everything"],
    faqs: [
      { question: "What percentage of ancient Egyptians could read?", answer: "Estimates range from about 1 to 5 percent of the population, rising somewhat in the New Kingdom and in specialist communities such as Deir el-Medina, where many of the tomb workers could read at least hieratic. Scribes therefore formed a tiny but enormously influential elite who served as administrators, accountants, lawyers, doctors and diplomats, and the title 'scribe' was itself a mark of status." },
      { question: "How long did scribal training take?", answer: "Nobody recorded a fixed length, but training is usually estimated at around a decade, beginning in childhood, perhaps at five to ten years old. Pupils copied classic texts in hieratic on ostraca and writing boards until the signs were automatic, then learned mathematics, letter-writing and administration. Formal hieroglyphs came later and were mastered mainly by those destined for temple or monumental work." },
      { question: "What is the per ankh or House of Life?", answer: "The per ankh ('House of Life') was the temple institution where sacred and scholarly texts were composed, copied and stored: part library, part scriptorium, part centre of learning. Senior scribes and priests worked there on religious, medical and astronomical texts. Basic scribal schooling for children mostly happened elsewhere, in schools attached to temples, palaces and government offices." },
      { question: "What tools did Egyptian scribes use?", answer: "Scribes used thin reed pens with the tip chewed or cut into a brush, cakes of black ink made from carbon soot and red ink from ochre, both bound with gum, and a rectangular wooden palette with two ink wells and a slot for pens. They wrote on papyrus for documents that mattered and practised on ostraca, the cheap flakes of limestone and broken pottery found by the thousand at Deir el-Medina." },
      { question: "What is the Satire of the Trades?", answer: "The Satire of the Trades, also called the Instruction of Dua-Khety, is a Middle Kingdom text in which a father taking his son to scribal school describes every other occupation as miserable, from the mud-caked potter to the beaten soldier, before praising the scribe who 'sits at ease'. It was copied endlessly by student scribes, which is why so many fragments survive, and it shows how the Egyptians themselves saw literacy as the route to comfort." },
    ],
    content: `## Why Did Literacy Mean Power in Ancient Egypt?

Literacy meant power because only a tiny minority could read and write, and everything the Egyptian state did ran on written records. In a civilisation that built the Great Pyramids, developed one of the first calendar systems, and administered a kingdom stretching over a thousand kilometres along the Nile, one skill underpinned everything: **the ability to read and write**. Today it no longer takes a childhood at scribal school: you can [learn to read hieroglyphs](/) in a few months with a screen and some patience.

Only about **1 to 5 percent** of ancient Egyptians were literate. In a population that may have numbered between 1.5 and 5 million people at various points in the kingdom's history, scribes formed a tiny but enormously influential elite. They were the administrators, accountants, lawyers, doctors, architects, and diplomats of their world. Without them, the entire apparatus of the Egyptian state would have collapsed.

The scribe's position is captured perfectly in a famous ancient text known as the *Satire of the Trades*, written during the Middle Kingdom (c. 2000 BCE). In it, a father brings his son to the scribal school and describes every other profession in the most miserable terms (the potter is caked in mud, the fisherman risks crocodiles, the soldier endures beatings) but the scribe "sits at ease" and commands respect. The message is clear: literacy was the path to comfort, status, and power.

## How Were Egyptian Scribes Trained?

Scribes were trained from childhood in schools attached to temples, palaces and government offices, by copying classic texts until the signs were automatic. The most learned worked in the temple institution called the **per ankh** (𓉐𓋹), literally "House of Life": part library, part scriptorium, where religious, medical and astronomical texts were composed and copied. The most prestigious were at Memphis, Thebes, and Heliopolis.

Boys, and in some rare cases girls, could enter scribal training young, perhaps at **five to ten years old**. No source records a fixed length of training, but it is usually estimated at **around a decade**, making it one of the longest educational programmes in the ancient world. By comparison, a modern UK medical degree takes five to six years.

The curriculum was gruelling. Students began by learning the **hieratic script**, a cursive form of the signs used for everyday writing on papyrus, before progressing to the formal hieroglyphic signs used for monumental inscriptions ([the three Egyptian scripts](/blog/hieroglyphs-vs-hieratic-vs-demotic) are compared here). They practised on **ostraca** (broken pottery shards and limestone flakes), which were cheaper than papyrus and could be reused.

Early lessons focused on **copying classical texts** repeatedly until the signs became automatic. Students copied wisdom literature, letters, mathematical problems, and administrative documents. Surviving ostraca from the village of [Deir el-Medina](https://en.wikipedia.org/wiki/Deir_el-Medina) (home to the workers who built the royal tombs in the Valley of the Kings) show student exercises with teacher corrections marked in red ink.

## What Did Scribes Learn?

A fully trained scribe learned far more than reading and writing: the scripts, mathematics, law, and often medicine and religious literature. Specifically, a scribe was expected to master:

**The writing systems.** Egypt used three scripts simultaneously: hieroglyphs for formal monuments and religious texts, hieratic for daily administration and literature, and eventually demotic for legal and commercial documents. A senior scribe needed fluency in at least two of these.

**Mathematics.** Scribes learned arithmetic, geometry, and basic algebra. They calculated grain volumes, land areas after the annual Nile flood, the number of bricks needed for construction projects, and the wages owed to work gangs. The Rhind Mathematical Papyrus (c. 1550 BCE) preserves exactly the type of problems scribal students solved.

**Law and administration.** Egypt's bureaucracy was enormous. Scribes drafted contracts, recorded court proceedings, managed tax collection, conducted censuses, and maintained the granaries that fed the nation. The title *sesh* (𓏟, "scribe") carried legal authority; a scribe's written record was binding.

**Medicine.** Medical papyri such as the Edwin Smith Papyrus (surgical cases) and the Ebers Papyrus (prescriptions and diagnoses) were composed and copied by medically trained scribes. Egyptian medicine was remarkably sophisticated, including surgical techniques, pharmacology, and anatomical knowledge.

**Religion and literature.** Senior scribes produced copies of the [*Book of the Dead*](/blog/the-book-of-the-dead-a-readers-guide), temple liturgies, and hymns. They also composed original literary works: stories, poetry, and philosophical dialogues that rank among the oldest literature in the world.

## What Did a Scribe Do All Day?

Most working scribes were administrators: measuring, recording and calculating for the state. Archaeological evidence and surviving texts give us a remarkably detailed picture of daily life.

A scribe working in the **granary administration** would arrive at the storehouse at dawn. He would oversee the measurement of grain deliveries using standardised measuring vessels, record each transaction on a papyrus roll, and calculate running totals. Every bushel of wheat and barley in the kingdom was accounted for. Egypt's tax system ran on grain, not money.

A scribe in the **royal court** might draft diplomatic correspondence. [The Amarna Letters](https://en.wikipedia.org/wiki/Amarna_letters) (c. 1350 BCE), found in Akhenaten's capital, show Egyptian scribes communicating in Akkadian cuneiform with foreign kings, evidence that elite scribes were trained in foreign scripts and languages as well.

A scribe at **Deir el-Medina** kept daily attendance records of tomb workers, noting who was absent and why. Reasons recorded on surviving ostraca include "bitten by a scorpion," "brewing beer," "embalming his mother," and simply "drinking with Khonsu," ancient Egypt's equivalent of calling in sick.

## What Tools Did Scribes Use?

A scribe's kit was a reed pen, two cakes of ink, a wooden palette and a roll of papyrus. The tools of the trade were simple but refined:

- **Reed pens** (*gash*), thin reeds cut to a point and frayed to create a brush-like tip
- **Ink cakes**, black ink made from carbon (soot) and red ink from ochre, both mixed with gum arabic and water
- **A scribe's palette** (*gesty*), a rectangular wooden board with two ink wells (one for black, one for red) and a central groove to hold reed pens
- **Papyrus**, the famous writing material made from the pith of the papyrus plant, which grew abundantly in the Nile Delta

Red ink had a special function: it was used for headings, dates, names of dangerous entities (like the chaos serpent Apophis), and to mark corrections in student exercises. This convention is the origin of our modern practice of "red-lining" edits and corrections.

## Could Women Be Scribes?

Rarely, but some women were literate. While the scribal profession was overwhelmingly male, Queen Nefertari, the wife of Ramesses II, is shown in her tomb playing senet and, more significantly, standing before Thoth, god of writing, with a scribe's palette and water pot beside her, illustrating a Book of the Dead spell for obtaining those very tools. Letters from Deir el-Medina suggest that some women in the community could read and write at a functional level, and a handful of women bear the title "scribe" in the Middle Kingdom.

The goddess **Seshat**, the divine patroness of writing, record-keeping, and measurement, was always depicted as female, suggesting that the Egyptians themselves associated literacy with both genders at a mythological level, even if social practice restricted access.

## What Is the Scribes' Legacy?

The scribal tradition lasted for over 3,000 years, one of the longest continuous literate traditions in human history. When the last hieroglyphic inscription was carved in 394 CE and the last demotic text written in the fifth century, a chain of transmission that had begun before the pyramids were built was finally broken, and stayed broken until the [Rosetta Stone was deciphered](/blog/how-the-rosetta-stone-changed-everything) in 1822.

But the scribes' legacy endures. Every time you pick up a pen, use red ink for corrections, or consult a written record as legal evidence, you are participating in practices that Egyptian scribes established millennia ago.

Learning hieroglyphics today is, in a very real sense, resuming a conversation that was interrupted 1,600 years ago. If you want to pick it up, the [first lesson is free](/get-started) and starts where every scribe started: with the signs for single sounds. I think the scribes would approve.`,
  },
  {
    slug: "hieroglyphs-vs-hieratic-vs-demotic",
    title: "Hieroglyphs vs. Hieratic vs. Demotic: Egypt's Three Scripts",
    metaDescription:
      "Hieroglyphs were carved on monuments, hieratic was the scribes' fast pen script, and demotic the later everyday hand. Here's how to tell the three apart.",
    excerpt:
      "Hieroglyphs, hieratic and demotic compared: what each Egyptian script was, when and by whom it was used, and why one language needed three ways of writing.",
    quickAnswer:
      "They are three ways of writing the same Egyptian language. **Hieroglyphs** are detailed pictures carved on monuments. **Hieratic** is the same signs written fast in ink on papyrus, so they look like quick sketches. **Demotic** (from c. 650 BCE) abbreviated hieratic so far that the pictures disappear; it is the middle text on the Rosetta Stone.",
    date: "January 2026",
    publishedAt: "2026-01-25",
    updatedAt: "2026-10-16",
    category: "History",
    glyph: "𓏏",
    image: "/blog/hieroglyphs-hieratic-demotic-scripts.webp",
    imageAlt: "Comparison of ancient Egyptian writing systems showing hieroglyphics, hieratic, and demotic scripts side by side",
    relatedSlugs: ["how-the-rosetta-stone-changed-everything", "the-scribes-egypts-most-powerful-class", "how-to-learn-hieroglyphics-online"],
    faqs: [
      { question: "What is the difference between hieroglyphs and hieratic?", answer: "Hieroglyphs are the formal, pictorial script carved and painted on monuments, temples and tombs, and can run in any direction. Hieratic is a cursive form of the same signs, written quickly with a reed pen on papyrus, always from right to left. They record the same language; hieratic was simply the everyday script for administration, letters and literature, much as handwriting relates to print." },
      { question: "What is Demotic script?", answer: "Demotic is a heavily abbreviated script that evolved from hieratic in the 26th Dynasty, around 650 BCE, and was used for legal documents, contracts, letters and literature for roughly a thousand years. Its signs are so simplified that their hieroglyphic ancestors are often unrecognisable, and it records a later stage of the Egyptian language. It is the middle text on the Rosetta Stone." },
      { question: "Did ancient Egyptians use all three scripts at the same time?", answer: "Yes, for the last thousand years or so of Egyptian writing. Hieroglyphs were used for monumental and sacred inscriptions, hieratic mainly for religious texts on papyrus, and demotic for everyday legal and commercial documents. Before demotic appeared, hieroglyphs and hieratic coexisted for over 2,000 years. A senior scribe was expected to be fluent in at least two scripts." },
      { question: "Which Egyptian script should I learn first?", answer: "Hieroglyphs. Almost every textbook and course teaches Middle Egyptian in hieroglyphs, because the signs are clear, the monuments you see in museums are written in them, and hieratic texts are normally published in hieroglyphic transcription anyway. Hieratic is a palaeography skill you add later if you want to read papyri in the original; demotic is a specialism in its own right." },
      { question: "What is Coptic and how is it related?", answer: "Coptic is the final stage of the Egyptian language, written from about the third century CE in the Greek alphabet plus six or seven letters borrowed from demotic for sounds Greek lacked. It survived as a spoken language into the early modern period and remains the liturgical language of the Coptic Orthodox Church. Because its vowels are written, it is the main evidence for how Egyptian was pronounced." },
    ],
    content: `## Hieroglyphs vs. Hieratic vs. Demotic at a Glance

All three are the same Egyptian language written three ways: hieroglyphs for stone, hieratic for the pen, demotic for the paperwork of the last thousand years.

**How to tell them apart in one look:**
- **You can name the animals and objects?** Hieroglyphs.
- **Ink on papyrus, signs look like quick sketches of pictures?** Hieratic.
- **Ink, and nothing looks like a picture at all?** Demotic.

| | Hieroglyphs | Hieratic | Demotic |
|---------|-------------|----------|---------|
| **What it looks like** | Detailed pictures: birds, people, reeds | Joined-up pen strokes; signs still traceable | Short dashes and hooks; pictures gone |
| **Written on** | Stone, wood, metal | Papyrus, ostraca | Papyrus, ostraca |
| **Direction** | Any direction | Right to left | Right to left |
| **Used for** | Temples, tombs, monuments | Letters, literature, religious papyri | Contracts, tax and legal records |
| **Dates** | c. 3200 BCE to 394 CE | c. 3200 BCE to 3rd c. CE | c. 650 BCE to 5th c. CE |

The Egyptians did what Japanese writers do with kanji, hiragana and katakana, or what you do switching between print and handwriting: one language, the script chosen by the job. Most people [learn hieroglyphics](/) first, and that makes the other two far easier, because hieratic and demotic grew out of the same signs.

## What Are Hieroglyphs?

**Period of use:** c. 3200 BCE to 394 CE (approximately 3,600 years)

Hieroglyphs (*medu netjer*, "words of the god") are the formal pictorial script of ancient Egypt, carved and painted on monuments, and the script most people picture when they think of Egyptian writing. These are the beautifully carved and painted signs that cover temple walls, tomb chambers, obelisks, and sarcophagi.

Each hieroglyph is a miniature work of art: an owl, a reed, a human arm, a seated god, rendered in meticulous detail. The visual precision was intentional. Egyptians believed that hieroglyphic signs had **magical power**: writing something made it real. A hieroglyph of a bird could, in magical terms, *become* that bird. This is why dangerous animals depicted in tomb inscriptions were sometimes carved incomplete or with knives through them, to neutralise their magical threat.

Hieroglyphs could be written in any direction: left to right, right to left, or top to bottom. The reader determined the direction by noting which way the animal and human signs faced; they always look toward the beginning of the text.

The system included approximately **700 signs** in the Middle Kingdom (the "classical" period of the language), expanding to several thousand in the Ptolemaic and Roman periods as priests created new signs for temple inscriptions. Only [25 of them](/hieroglyphic-alphabet) write single consonants; the rest write two or three consonants, whole words, or act as silent classifiers.

**Hieroglyphs were used for:**
- Temple and tomb inscriptions
- Royal monuments and obelisks
- Religious texts carved in stone
- Formal state decrees
- Decorative and ceremonial purposes

Carving hieroglyphs was slow, skilled work. A master craftsman might spend an entire day carving a single column of text. For everyday communication, a faster system was needed.

## What Is Hieratic?

**Period of use:** c. 3200 BCE to 3rd century CE (parallel to hieroglyphs for most of Egyptian history)

Hieratic is the cursive, handwritten form of the hieroglyphic script, developed alongside hieroglyphs from the very beginning of Egyptian writing. It is not a separate language. It is a **cursive version of hieroglyphs**, adapted for writing quickly with a reed pen on papyrus or ostraca. The name is Greek, given by Clement of Alexandria around 200 CE, and means "priestly", because by his day it survived mainly in temple use.

The relationship between hieroglyphs and hieratic is similar to the relationship between printed letters and handwriting in English. The same signs are represented, but their forms are simplified and abstracted for speed. An owl (𓅓) in hieroglyphic becomes a few quick brush strokes in hieratic. A seated man becomes a simple squiggle.

Hieratic was always written **right to left** (unlike hieroglyphs, which could go in any direction). In the earliest periods, it was sometimes written in vertical columns, but by the Middle Kingdom, horizontal lines had become standard.

This script was the **workhorse of Egyptian literacy**. While hieroglyphs adorned temple walls, hieratic was the script of daily life:

**Hieratic was used for:**
- Administrative records and tax documents
- Letters (personal and official)
- Literary texts (stories, poetry, wisdom literature)
- Medical, mathematical, and scientific papyri
- Religious texts written on papyrus (including early Books of the Dead)
- Legal contracts and court records
- Student exercises in scribal schools

Most of the great works of Egyptian literature that survive, the *Tale of Sinuhe*, the *Eloquent Peasant*, the *Instructions of Ptahhotep*, were composed and transmitted in hieratic. When [scribal students](/blog/the-scribes-egypts-most-powerful-class) practised writing, they learned hieratic first because it was the practical script they would use every day.

By the Late Period (c. 664 BCE onward), hieratic had evolved into a highly specialised script used mainly by priests for religious documents. For secular purposes, it had been largely replaced by a new, even more simplified script.

## What Is Demotic?

**Period of use:** c. 650 BCE to 5th century CE (approximately 1,000 years)

Demotic is the heavily abbreviated everyday script that emerged in the 26th Dynasty as a further simplification of hieratic. The Egyptians called it *sḫ n šꜥt*, "document writing". The Greek name, from *demotikos* ("popular" or "of the people"), goes back to Herodotus, who distinguished the Egyptians' "sacred" and "popular" scripts.

If hieratic is like handwriting, demotic is like **shorthand**. The signs are so heavily abbreviated that individual hieroglyphic ancestors are often impossible to identify. Demotic developed its own conventions, ligatures (connected signs), and even some grammatical structures that differ from earlier stages of the language.

Demotic represents a later stage of the **Egyptian language itself**, just as Middle English differs from Old English, Demotic Egyptian differs from earlier phases. The grammar had evolved: word order shifted, the verbal system changed, and new vocabulary entered the language.

**Demotic was used for:**
- Legal documents (marriage contracts, property deeds, court records)
- Commercial transactions and receipts
- Letters and personal correspondence
- Literary and wisdom texts
- Scientific texts (including the famous Demotic mathematical papyri)
- Tax records and administrative documents
- The middle band of the Rosetta Stone

The [Rosetta Stone](/blog/how-the-rosetta-stone-changed-everything), in fact, provides a perfect snapshot of the situation in 196 BCE: hieroglyphs for the formal religious version, Demotic for the everyday Egyptian version, and Greek for the ruling Ptolemaic government.

## How Did the Three Scripts Coexist?

They coexisted by division of labour: each script had its own users, materials and occasions (the table at the top sums it up). At their peak overlap, roughly 650 BCE to 394 CE, all three were in active use in Egypt, but by different people, for different purposes. Hieroglyphs belonged to priests and royal craftsmen, hieratic to priests and scribes, and demotic to the wider literate population.

This coexistence was not chaotic. It was highly organised. An Egyptian priest might read hieroglyphs on the temple wall during morning ritual, write a theological commentary in hieratic during the afternoon, and review a land lease in demotic before dinner. The script matched the context, just as a modern professional might use formal English in a legal brief, casual English in an email, and abbreviations in a text message.

## When Did Egyptian Writing End?

Hieroglyphs died out at the end of the fourth century CE and demotic in the fifth; the language itself lived on as Coptic. The last known hieroglyphic inscription was carved on 24 August 394 CE at the [Temple of Philae](https://en.wikipedia.org/wiki/Philae), by a priest named Esmet-Akhom. The last known demotic inscription dates to 452 CE, also from Philae. After that, knowledge of all three scripts vanished from living memory.

The Egyptian language itself did not die. It evolved into **Coptic**, written in the Greek alphabet with a few additional characters from demotic. Coptic survived as a spoken language until the 17th century and remains in use today as the liturgical language of the [Coptic Orthodox Church](https://en.wikipedia.org/wiki/Coptic_Orthodox_Church_of_Alexandria). It was Champollion's knowledge of Coptic that gave him the crucial insight needed to decipher hieroglyphs in 1822.

## Which Script Should a Learner Study?

Start with hieroglyphs: they are what every course and textbook teaches, and what you will meet in museums. When you study hieroglyphics, you are learning the monumental script, the most visually striking and culturally significant of the three. But knowing that hieratic and demotic exist changes how you understand the writing system. Hieroglyphs were not the everyday script of ancient Egypt. They were the formal, sacred, and deliberately beautiful form, reserved for eternity.

Understanding this distinction helps explain why hieroglyphs are so detailed and pictorial: they were meant to be seen, admired, and to last forever. The cursive scripts handled the business of daily life; hieroglyphs handled the business of the gods. If you want to begin, [how to learn hieroglyphics online](/blog/how-to-learn-hieroglyphics-online) sets out the order, and the [free first lesson](/get-started) covers the 25 alphabet signs.`,
  },
  {
    slug: "the-book-of-the-dead-a-readers-guide",
    title: "The Egyptian Book of the Dead: A Reader's Guide",
    excerpt:
      "What the Egyptian Book of the Dead really is: around 190 funerary spells chosen per owner, the weighing of the heart, the Papyrus of Ani and how to read it.",
    quickAnswer:
      "The Egyptian Book of the Dead (its Egyptian title means the Book of Going Forth by Day) is not a single book but a collection of around 190 funerary spells, from which each owner's scribe chose a personal selection to be buried with them. Its spells guided the dead through the underworld and the weighing of the heart; the best-known copy is the Papyrus of Ani (c. 1250 BCE) in the British Museum.",
    date: "January 2026",
    publishedAt: "2026-01-10",
    updatedAt: "2026-09-07",
    category: "Advanced",
    glyph: "𓆣",
    image: "/blog/book-of-the-dead-papyrus-guide.webp",
    imageAlt: "Egyptian Book of the Dead papyrus showing the weighing of the heart ceremony with hieroglyphic spells",
    relatedSlugs: ["5-hieroglyphs-you-already-know", "what-does-the-ankh-symbol-mean", "the-scribes-egypts-most-powerful-class"],
    faqs: [
      { question: "What is the Book of the Dead about?", answer: "Despite its name, the Book of the Dead is about survival after death, not death itself. The ancient Egyptians called it the Book of Coming Forth by Day. Its spells, prayers and instructions were designed to protect the deceased, get them safely past the gatekeepers and demons of the underworld, see them through the judgement of the heart, and let them emerge into the daylight of the afterlife." },
      { question: "Is the Book of the Dead a single book?", answer: "No. It is a modern name for a collection of roughly 190 individual spells, numbered by scholars since Lepsius's 1842 edition, and no single papyrus contains all of them. Each copy was a bespoke commission: the owner or their family chose which spells to include, according to what they could afford and which dangers they most wanted protection against." },
      { question: "How old is the Book of the Dead?", answer: "The Book of the Dead proper dates from about 1550 to 50 BCE, from the start of the New Kingdom to the Ptolemaic period. It grew out of older traditions: the Pyramid Texts carved in royal pyramids from about 2400 BCE and the Coffin Texts painted on Middle Kingdom coffins from about 2100 BCE, which makes the funerary tradition it belongs to more than 4,000 years old." },
      { question: "What is the weighing of the heart?", answer: "The weighing of the heart is the judgement scene described in Spell 125. The deceased's heart is weighed on a balance against the feather of Maat, truth, while Anubis checks the scales and Thoth records the result. A heart no heavier than the feather means the person is 'true of voice' and passes into the afterlife; a heavy heart is eaten by the monster Ammit and the person ceases to exist." },
      { question: "What is the Papyrus of Ani?", answer: "The Papyrus of Ani is the most famous and most lavishly illustrated copy of the Book of the Dead, made around 1250 BCE for Ani, a scribe and accountant of Thebes, and his wife Tutu. It is nearly 24 metres long, was bought for the British Museum in 1888 by E. A. Wallis Budge, and has been the standard text for translations and facsimiles ever since." },
    ],
    content: `## What Is the Book of the Dead?

The Book of the Dead is a modern name for the collection of ancient Egyptian funerary spells written on papyrus and buried with the dead from about 1550 BCE onward, to see them safely into the afterlife. It is one of the most widely known yet deeply misunderstood texts from the ancient world. Its modern name, coined by the German Egyptologist Karl Richard Lepsius in 1842, is misleading on both counts. It is not a single, unified book, and its subject is not death but **survival after death**.

The ancient Egyptians called it *pert em heru* (𓊪𓂋𓏏𓅓𓉔𓂋𓅱), which translates as **"Coming Forth by Day"**, a title that reveals its true purpose. These were spells, prayers, and instructions designed to help the deceased navigate the dangers of the underworld and emerge into the eternal sunlight of the afterlife. Far from being a morbid text, it was essentially a **survival manual for eternity**. Many copies were written in cursive hieroglyphs, so once you [learn hieroglyphics](/) you can start picking out the gods' names and the spell titles yourself.

## Where Did the Book of the Dead Come From?

The Book of the Dead descends from the Pyramid Texts and the Coffin Texts, a funerary tradition stretching back over a thousand years before the first papyrus copies:

**The Pyramid Texts (c. 2400-2300 BCE)** are the oldest religious texts in the world. Carved inside the burial chambers of Old Kingdom pyramids at Saqqara, beginning with the pyramid of Unas, these spells were exclusively for pharaohs. They describe the king's ascent to the sky, his transformation into a star, and his reception among the gods.

**The Coffin Texts (c. 2100-1650 BCE)** democratised the afterlife. During the Middle Kingdom, funerary spells began appearing on the coffins of non-royal officials and nobles. The exclusivity of the Pyramid Texts had been broken. Now wealthy commoners could also hope for eternal life.

**The Book of the Dead (c. 1550-50 BCE)** took this process further. Written on papyrus scrolls and placed in the burial chamber, these collections of spells became available to anyone who could afford to commission one. The "democratisation of the afterlife" was complete: eternal life was no longer a royal prerogative but an aspiration open to all Egyptians.

## What Does the Book of the Dead Contain?

The Book of the Dead is a collection of approximately **192 individual spells** (scholars number them from Spell 1 to Spell 192, though no single papyrus contains all of them). Each spell served a specific purpose in the afterlife journey. Some of the most important include:

**Spell 1: The Procession to the Necropolis.** This opening spell describes the funeral procession and the deceased's arrival at the tomb. It sets the scene for the journey to come.

**Spell 6: The Shabti Spell.** One of the most practically minded spells, this text commands *shabti* figurines (small servant statues placed in the tomb) to perform manual labour in the afterlife on behalf of the deceased. When the gods called for workers to tend the fields of the underworld, the shabti would answer: "Here I am!"

**Spell 17: The Declaration of Knowledge.** A complex theological text in which the deceased demonstrates knowledge of the gods, creation, and the cosmic order. Correct answers prove worthiness to enter the afterlife.

**Spell 30B: The Heart Scarab Spell.** Perhaps the most anxious spell in the entire collection. Inscribed on a [scarab amulet](/blog/5-hieroglyphs-you-already-know) placed over the mummy's heart, it implores the heart not to betray its owner during the judgement: "O my heart of my mother, O my heart of my being! Do not stand against me as a witness! Do not oppose me in the tribunal!"

**Spell 125: The Weighing of the Heart.** The most famous and most illustrated spell. The deceased enters the Hall of Two Truths and makes the **Negative Confession**, a declaration of 42 sins they have not committed ("I have not stolen," "I have not killed," "I have not told lies"). Their heart is then weighed on a scale against the feather of Maat (truth and cosmic order).

If the heart is lighter than or equal to the feather, the deceased is declared *maa kheru* ("true of voice" or "justified") and admitted to the paradise of the Field of Reeds. If the heart is heavier, weighed down by sin, it is devoured by **Ammit**, a terrifying hybrid creature with the head of a crocodile, the body of a lion, and the hindquarters of a hippopotamus. The sinner ceases to exist entirely, a fate the Egyptians considered far worse than any concept of hell.

**Spell 137: The Spell of the Four Torches.** Placed at the four cardinal points around the burial, this spell created a protective ring of magical fire to ward off hostile forces in the underworld.

**Spell 175: The Dialogue with Atum.** A surprisingly philosophical text in which the deceased speaks with Atum, the creator god, about the nature of existence. Atum reveals that one day, even the gods will die, and the created world will return to the primordial waters. Only Atum and Osiris will survive, transformed into serpents. It is one of the most profound meditations on mortality in all of ancient literature.

## Why Is Every Copy Different?

Every copy is different because each was a custom commission. One of the most important things to understand about the Book of the Dead is that **no two copies are identical**. Each papyrus was a custom commission. Wealthy Egyptians would visit a scribal workshop and select which spells to include based on their personal concerns, their budget, and the advice of priests.

A wealthy official might commission a scroll 20 metres long, lavishly illustrated with coloured vignettes (illustrations) accompanying each spell. A person of modest means might afford only a few essential spells on a shorter roll, with minimal illustration. Some budget versions left the owner's name blank, a fill-in-the-blank template to be personalised after purchase.

The quality of the calligraphy varied enormously. The finest examples, such as the [Papyrus of Ani](https://www.historyofinformation.com/detail.php?id=3184) (now in the British Museum) or the Papyrus of Hunefer, are masterpieces of ancient art, with elaborate painted scenes and flawless hieroglyphic text. Others are riddled with scribal errors, suggesting they were mass-produced by [scribal workshops](/blog/the-scribes-egypts-most-powerful-class) more interested in quantity than accuracy.

## What Does the Weighing of the Heart Reveal About Egyptian Morality?

Spell 125, the Weighing of the Heart, deserves special attention because it reveals the **moral framework** of ancient Egyptian society. The 42 Negative Confessions provide a detailed catalogue of what the Egyptians considered sinful or antisocial behaviour. Selected confessions include:

- "I have not committed robbery."
- "I have not been greedy."
- "I have not stolen the offerings in the temples."
- "I have not committed adultery."
- "I have not made anyone weep."
- "I have not polluted the water."
- "I have not raised my voice in anger."
- "I have not turned a deaf ear to words of truth."

This list reveals a society that valued honesty, generosity, respect for sacred spaces, emotional restraint, environmental responsibility, and justice. Many of these moral principles are strikingly modern in their concerns.

## How Do You Start Reading the Book of the Dead?

Start with a well-published papyrus, ideally the Papyrus of Ani, alongside a scholarly translation, once you can already read formulaic monumental text. For students of hieroglyphics, the Book of the Dead is simultaneously one of the most rewarding and most challenging texts to read.

**Why it's rewarding:** The vocabulary is rich, the subject matter is fascinating, and the illustrations provide visual context that aids comprehension. Many spells use formulaic language that becomes recognisable with practice, building your reading confidence.

**Why it's challenging:** The texts span nearly 1,500 years, so spelling conventions and grammar vary between copies. Religious vocabulary is dense and allusive. Some passages are deliberately obscure; their power was believed to lie partly in their mystery.

The best approach for beginners is to start with well-published papyri that include scholarly translations and commentaries. The Papyrus of Ani, available in numerous editions, is the standard starting point. [Raymond Faulkner's](https://en.wikipedia.org/wiki/Raymond_O._Faulkner) *The Ancient Egyptian Book of the Dead* provides a complete translation with hieroglyphic text. Before any of that, you need the [alphabet signs](/hieroglyphic-alphabet), the [ankh](/blog/what-does-the-ankh-symbol-mean) and the other common signs, and the offering formula, which is roughly what the [first lessons here](/get-started) cover.

## Why Does the Book of the Dead Still Matter?

The Book of the Dead endures because it addresses questions that every civilisation grapples with: What happens after we die? How should we live? What does it mean to be judged?

The ancient Egyptians answered these questions with a document of extraordinary imagination, theological sophistication, and human vulnerability. The heart scarab spell, "Do not stand against me as a witness!", is the voice of someone genuinely afraid that their flaws might be exposed. The Negative Confessions are an attempt to codify a moral life. The paradise of the Field of Reeds is a vision of eternal peace.

When you learn to read these texts in the original hieroglyphs, you are hearing those voices without a translator standing between you. That directness, across 3,500 years, is what makes learning hieroglyphics worth the effort.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
