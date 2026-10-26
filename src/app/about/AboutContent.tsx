"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const methodologies = [
  {
    glyph: "𓇳",
    title: "Progressive",
    description:
      "Each lesson builds naturally on the last, guiding you from single signs to full sentences at your own pace, just as scribes learned in the ancient Houses of Life.",
  },
  {
    glyph: "𓂀",
    title: "Immersive",
    description:
      "Real inscriptions, authentic tomb texts, and genuine artefact readings replace contrived exercises. You engage with the same words carved in stone thousands of years ago.",
  },
  {
    glyph: "𓆣",
    title: "Authentic",
    description:
      "Our curriculum is rooted in the latest Egyptological scholarship. Every sign list, grammar note, and translation is reviewed by specialists in Middle Egyptian.",
  },
];

export default function AboutContent() {
  return (
    <main className="grain-overlay">
      <Navbar />

      {/* Hero / Mission */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-6"
          >
            <span className="text-5xl">𓂀</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-gradient-gold mb-6"
          >
            About Us
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="font-body text-lg md:text-xl text-sand-300 leading-relaxed max-w-2xl mx-auto"
          >
            We believe the language of ancient Egypt should be accessible to
            everyone. Not locked behind academic paywalls or impenetrable
            textbooks.
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-gold-500">𓇳</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-sand-100">
                Our Story
              </h2>
            </div>
            <div className="mb-8" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={1}
            className="space-y-6 font-body text-sand-400 leading-relaxed"
          >
            <p>
              Learn AEO was founded by a small team of Egyptology
              enthusiasts, scholars, and software engineers who shared a common
              frustration: the world&rsquo;s oldest monumental writing system had no
              truly modern, interactive learning platform.
            </p>
            <p>
              Traditional resources like Gardiner&rsquo;s grammar, Allen&rsquo;s{" "}
              <em>Middle Egyptian</em>, and scattered university lecture notes are
              invaluable to specialists, yet they can feel impenetrable to
              newcomers. We set out to bridge that gap, combining rigorous
              academic content with the kind of engaging, step-by-step
              experience that modern learners expect.
            </p>
            <p>
              What started as a side project in 2024 has grown into a
              comprehensive curriculum covering the full Middle Egyptian sign
              list, grammar, and reading practice drawn from real historical
              inscriptions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Philosophy */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-gold-500">𓁐</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-sand-100">
                Our Philosophy
              </h2>
            </div>
            <div className="mb-8" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={1}
            className="space-y-6 font-body text-sand-400 leading-relaxed"
          >
            <p>
              We believe that academic rigor and modern interactive learning are
              not at odds. They amplify each other. Every lesson is written or
              reviewed by scholars with postgraduate training in Egyptology, then
              refined by UX designers and educators to ensure clarity and
              engagement.
            </p>
            <p>
              Our team operates at the intersection of humanities and technology.
              We treat hieroglyphic signs not just as data, but as a living
              connection to one of humanity&rsquo;s greatest civilisations. That
              respect for the source material informs every design decision, from
              the authentic sign renderings to the carefully curated reading
              passages.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Methodology */}
      <section className="relative py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-gradient-gold mb-4">
              Our Teaching Methodology
            </h2>
            <p className="font-body text-sand-400 max-w-xl mx-auto">
              Three principles guide every lesson we create.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {methodologies.map((m, i) => (
              <motion.div
                key={m.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i + 1}
                className="relative rounded-2xl border border-gold-700/20 bg-obsidian-light/40 p-8 backdrop-blur-sm"
              >
                <span
                  className="block text-4xl mb-4"
                  style={{
                    fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif",
                  }}
                >
                  {m.glyph}
                </span>
                <h3 className="font-display text-xl font-semibold text-gold-400 mb-3">
                  {m.title}
                </h3>
                <p className="font-body text-sm text-sand-400 leading-relaxed">
                  {m.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic References */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-gold-500">𓏛</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-sand-100">
                Our Sources
              </h2>
            </div>
            <div className="mb-8" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={1}
            className="space-y-4 font-body text-sand-400 leading-relaxed"
          >
            <p>
              Our curriculum draws on the foundational works of Egyptology.
              These are the primary references we consult when building lessons
              and verifying translations:
            </p>
            <ul className="space-y-3 ml-4">
              <li className="flex gap-2">
                <span className="text-gold-500 mt-1.5 flex-shrink-0">&#x2022;</span>
                <span>
                  Sir Alan Gardiner, <em>Egyptian Grammar: Being an Introduction
                  to the Study of Hieroglyphs</em> (3rd ed., 1957), the
                  standard reference grammar and sign list
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500 mt-1.5 flex-shrink-0">&#x2022;</span>
                <span>
                  James P. Allen, <em>Middle Egyptian: An Introduction to the
                  Language and Culture of Hieroglyphs</em> (3rd ed., 2014), a
                  modern pedagogical grammar widely used in universities
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500 mt-1.5 flex-shrink-0">&#x2022;</span>
                <span>
                  Mark Collier &amp; Bill Manley, <em>How to Read Egyptian
                  Hieroglyphs</em> (revised ed., 2003), an accessible
                  introduction with real inscription exercises
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500 mt-1.5 flex-shrink-0">&#x2022;</span>
                <span>
                  Raymond O. Faulkner, <em>A Concise Dictionary of Middle
                  Egyptian</em> (1962), the standard hieroglyphic dictionary
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500 mt-1.5 flex-shrink-0">&#x2022;</span>
                <span>
                  The Thesaurus Linguae Aegyptiae (Berlin-Brandenburgische
                  Akademie der Wissenschaften), digital corpus of Egyptian texts
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Decorative divider + CTA */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="flex justify-center gap-4 text-3xl text-gold-700/30 mb-12"
          >
            {[..."𓂀𓇳𓆣𓋴𓄿𓅓𓉐"].map((g, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif",
                }}
              >
                {g}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="space-y-4"
          >
            <Link
              href="/get-started"
              className="btn-primary inline-flex justify-center text-base py-4 px-8"
            >
              Start Your Free Lesson
            </Link>
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-body text-sm text-sand-400 hover:text-gold-400 transition-colors"
              >
                <span>Back to home</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
