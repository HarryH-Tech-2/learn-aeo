import InView from "@/components/InView";
import { reveal } from "@/components/reveal";

const GLYPH_FONT = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" };

const timeline = [
  {
    era: "c. 3200 BCE",
    title: "Birth of Hieroglyphic Writing",
    description:
      "The earliest known hieroglyphs appear on the Narmer Palette and ivory tags from Abydos, marking the dawn of one of humanity's first writing systems.",
    glyph: "𓇋",
  },
  {
    era: "c. 2600 BCE",
    title: "The Pyramid Texts",
    description:
      "The oldest surviving religious texts in the world are carved inside the pyramids of Saqqara, containing spells to help pharaohs ascend to the afterlife.",
    glyph: "𓉐",
  },
  {
    era: "c. 1550 BCE",
    title: "The Book of the Dead",
    description:
      "Papyrus scrolls containing funerary spells become widespread during the New Kingdom, featuring some of the finest hieroglyphic calligraphy ever produced.",
    glyph: "𓂀",
  },
  {
    era: "196 BCE",
    title: "The Rosetta Stone",
    description:
      "A decree inscribed in hieroglyphs, Demotic, and Greek is carved at Memphis. This trilingual stone would become the key to deciphering hieroglyphs nearly 2,000 years later.",
    glyph: "𓋴",
  },
  {
    era: "394 CE",
    title: "The Last Hieroglyph",
    description:
      "The final known hieroglyphic inscription is carved at the Temple of Philae by a priest named Esmet-Akhom. The knowledge of reading hieroglyphs is lost for 1,400 years.",
    glyph: "𓁐",
  },
  {
    era: "1822 CE",
    title: "Champollion's Breakthrough",
    description:
      "Jean-François Champollion deciphers the hieroglyphic script using the Rosetta Stone, unlocking millennia of Egyptian history, literature, and science.",
    glyph: "𓇳",
  },
];

// Server component: no state, so it ships no JS beyond the tiny <InView>
// observer. Scroll-reveal is CSS (`.reveal`, see globals.css / reveal.ts).
export default function AboutHieroglyphics() {
  return (
    <section id="about" className="relative py-20 overflow-hidden">
      <InView className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <div className="reveal inline-flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold-700" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">
              The Story of Hieroglyphics
            </span>
          </div>

          <h2
            className="reveal font-display text-4xl md:text-5xl font-light text-sand-100 mb-6"
            style={reveal(0.1, { y: 30 })}
          >
            What Are Egyptian{" "}
            <span className="text-gradient-gold font-medium">Hieroglyphs</span>?
          </h2>

          <div
            className="reveal space-y-4 font-body text-sand-400 font-light leading-relaxed"
            style={reveal(0.2)}
          >
            <p>
              Hieroglyphics (from the Greek <em>hieroglyphika</em>, meaning
              &ldquo;sacred carvings&rdquo;) are the formal writing system of
              ancient Egypt. Combining logographic, syllabic, and alphabetic
              elements, this remarkable script was used for over 3,500 years,
              from approximately 3200 BCE to the end of the 4th century CE.
            </p>
            <p>
              Unlike modern alphabets, hieroglyphs can represent individual
              sounds (phonograms), whole words (logograms), or act as silent
              classifiers (determinatives) that indicate a word&apos;s category
              of meaning. A single inscription might contain all three types
              working together, making hieroglyphic writing one of the most
              sophisticated systems ever devised.
            </p>
            <p>
              The ancient Egyptians called their script <em>medu neter</em>, the
              &ldquo;words of the gods&rdquo;, reflecting their belief that
              writing was a divine gift from Thoth, the ibis-headed god of
              wisdom. Scribes who mastered hieroglyphs held elite positions in
              Egyptian society, trained for years in the <em>per ankh</em> (House
              of Life) attached to every major temple.
            </p>
          </div>
        </div>

        {/* How Hieroglyphs Work */}
        <div
          className="reveal grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
          style={reveal(0.3, { y: 30 })}
        >
          <div className="card-ancient p-8">
            <h3 className="font-display text-2xl font-semibold text-sand-100 mb-3 flex items-center gap-3">
              <span className="text-4xl" style={GLYPH_FONT}>𓄿</span>
              Phonograms
            </h3>
            <p className="font-body text-sm text-sand-400 font-light leading-relaxed">
              Signs that represent sounds, similar to letters. There are 24
              uniliteral (single-consonant) signs that form a hieroglyphic
              &ldquo;alphabet,&rdquo; plus biliteral and triliteral signs
              representing two or three consonants.
            </p>
          </div>
          <div className="card-ancient p-8">
            <h3 className="font-display text-2xl font-semibold text-sand-100 mb-3 flex items-center gap-3">
              <span className="text-4xl" style={GLYPH_FONT}>𓇳</span>
              Logograms
            </h3>
            <p className="font-body text-sm text-sand-400 font-light leading-relaxed">
              Signs that represent entire words or concepts. The sun disc 𓇳
              can mean &ldquo;Ra&rdquo; (the sun god), &ldquo;sun,&rdquo; or
              &ldquo;day.&rdquo; A small stroke beneath a sign marks it as a
              logogram rather than a phonetic sign.
            </p>
          </div>
          <div className="card-ancient p-8">
            <h3 className="font-display text-2xl font-semibold text-sand-100 mb-3 flex items-center gap-3">
              <span className="text-4xl" style={GLYPH_FONT}>𓀀</span>
              Determinatives
            </h3>
            <p className="font-body text-sm text-sand-400 font-light leading-relaxed">
              Silent signs placed at the end of a word to indicate its meaning
              category. The seated man 𓀀 tells you a word refers to a male
              person, while walking legs 𓂻 indicate motion or movement.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="reveal" style={reveal(0.4, { y: 30 })}>
          <h3 className="font-display text-3xl font-light text-sand-100 mb-12">
            A Timeline of{" "}
            <span className="text-gradient-gold font-medium">
              Hieroglyphic Writing
            </span>
          </h3>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-0 md:left-8 top-3 bottom-0 w-px bg-gradient-to-b from-gold-700/40 via-gold-500/20 to-transparent" />

            <div className="space-y-10">
              {timeline.map((event, i) => (
                <div
                  key={event.era}
                  className="reveal relative pl-10 md:pl-24"
                  style={reveal(0.5 + i * 0.1, { x: -30, dur: 0.6 })}
                >
                  {/* Dot */}
                  <div className="absolute left-0 md:left-8 top-1 w-2 h-2 -translate-x-[3px] bg-gold-500 rounded-full shadow-[0_0_8px_rgba(212,168,50,0.4)]" />

                  {/* Era badge */}
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-lg text-gold-500/60" style={GLYPH_FONT}>
                      {event.glyph}
                    </span>
                    <span className="font-body text-xs tracking-[0.15em] uppercase text-gold-500 px-2 py-0.5 border border-gold-700/30">
                      {event.era}
                    </span>
                  </div>

                  <h4 className="font-display text-xl font-semibold text-sand-100 mb-2">
                    {event.title}
                  </h4>
                  <p className="font-body text-sm text-sand-400 font-light leading-relaxed max-w-2xl">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
}
