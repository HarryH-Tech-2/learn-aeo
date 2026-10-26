import InView from "@/components/InView";
import { reveal } from "@/components/reveal";

const features = [
  {
    icon: "𓂀",
    title: "Eye of Discovery",
    description:
      "Interactive lessons that reveal the meaning behind every stroke. Learn how ancient scribes encoded language into art over millennia.",
    accent: "from-gold-500/20 to-transparent",
  },
  {
    icon: "𓇳",
    title: "Living History",
    description:
      "Study real inscriptions from the Valley of the Kings, Karnak, and the Book of the Dead. Context that textbooks can't provide.",
    accent: "from-turquoise/20 to-transparent",
  },
  {
    icon: "𓋴",
    title: "Progressive Mastery",
    description:
      "From single signs to complete sentences. Our curriculum builds systematically from uniliteral glyphs to complex grammar.",
    accent: "from-terracotta/20 to-transparent",
  },
  {
    icon: "𓁐",
    title: "Cultural Immersion",
    description:
      "Understand the mythology, rituals, and daily life encoded in hieroglyphic texts. Language is the gateway to civilization.",
    accent: "from-lapis-light/20 to-transparent",
  },
  {
    icon: "𓆣",
    title: "Sacred Symbols",
    description:
      "Master determinatives, logograms, and phonetic complements. Learn why the scarab means transformation and how the ankh grants life.",
    accent: "from-gold-500/20 to-transparent",
  },
  {
    icon: "𓉐",
    title: "Temple Reading",
    description:
      "Graduate to reading monumental inscriptions in their original context. From tomb walls to temple pylons, read what the ancients wrote.",
    accent: "from-turquoise/20 to-transparent",
  },
];

// Server component; scroll-reveal is CSS via <InView> + .reveal.
export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 overflow-hidden">
      <InView className="max-w-7xl mx-auto px-6 lg:px-8" margin="-100px">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="reveal inline-flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold-700" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">
              Why Learn With Us
            </span>
            <span className="h-px w-12 bg-gold-700" />
          </div>

          <h2
            className="reveal font-display text-4xl md:text-5xl lg:text-6xl font-light text-sand-100 mb-6"
            style={reveal(0.1, { y: 30 })}
          >
            A <span className="text-gradient-gold font-medium">Scholar&apos;s Path</span>
            <br />
            to Ancient Wisdom
          </h2>

          <p
            className="reveal font-body text-lg text-sand-400 max-w-2xl mx-auto font-light"
            style={reveal(0.2)}
          >
            Our curriculum mirrors the training of ancient Egyptian scribes:
            methodical, immersive, and deeply rewarding.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="reveal card-ancient p-8"
              style={reveal(0.3 + i * 0.1, { y: 40, dur: 0.6 })}
            >
              {/* Icon */}
              <div className="mb-6 hidden md:block">
                <span
                  className="text-5xl block"
                  style={{
                    fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif",
                  }}
                >
                  {feature.icon}
                </span>
              </div>

              {/* Text */}
              <h3 className="font-display text-xl font-semibold text-sand-100 mb-3">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-sand-400 leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </InView>
    </section>
  );
}
