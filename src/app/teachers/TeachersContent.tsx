"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getHieroglyphs } from "@/lib/hieroglyph-translator";
import { TEACHER_FAQ } from "./faq";
import { trackEvent } from "@/lib/analytics";
import StartTrialButton from "@/components/classroom/StartTrial";
import SeasonPromo from "@/components/teachers/SeasonPromo";
import UnitPackOffer from "@/components/teachers/UnitPackOffer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const GLYPH_FONT = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif" };

const LESSON_PLAN = [
  {
    time: "10 min",
    title: "Starter: a name on the wall",
    body: "Open the name translator on the whiteboard and type a volunteer's name. Ask the class to work out the rules from what they see: Why is there no letter E? Why do L and R look the same? Reveal the answers (Egyptian wrote consonants only; there was no L sign, so L borrows the R).",
    href: "/translate-name-to-hieroglyphics",
    cta: "Open the translator",
  },
  {
    time: "25 min",
    title: "Main: write your name in a cartouche",
    body: "Hand out the worksheet. Pupils use the alphabet chart to write their own name inside the cartouche, then decode four famous names. The chart is on page one, activities on page two, answer key on page three (keep that one!).",
    href: "/teachers/worksheet",
    cta: "Open the worksheet",
  },
  {
    time: "10 min",
    title: "Plenary: swap and decode",
    body: "Pupils swap sheets and read a partner's cartouche aloud. Finish on the big question: if Egyptian only wrote consonants, how do we know how the words sounded? (We mostly don't; Egyptologists insert an 'e' by convention, which is why it is Nefer-titi and not Nfrtt.)",
  },
  {
    time: "Extension",
    title: "Homework: lesson one, free",
    body: "The first lesson of the course teaches all 25 alphabet signs with audio, sign-by-sign quick checks and a spelling game, in about 25 minutes. It needs a free account, so it suits older pupils at home or the teacher on the board.",
    href: "/get-started",
    cta: "Start the free lesson",
  },
];

const CURRICULUM = [
  {
    subject: "History (KS2)",
    text: "The achievements of the earliest civilisations: a depth study of Ancient Egypt. Hieroglyphs are the most concrete achievement pupils can hold in their hands.",
  },
  {
    subject: "English",
    text: "Phonics in reverse: pupils break their own name into sounds and discover that some English letters share a sound (C/K, S/Z, F/V).",
  },
  {
    subject: "Art & Design",
    text: "The cartouche is a ready-made design brief: pupils can paint, carve into clay or stitch their finished name.",
  },
  {
    subject: "History (KS3)",
    text: "Writing systems, the Rosetta Stone and how historians decode the past: a strong transition or enrichment lesson.",
  },
];

export default function TeachersContent() {
  const sampleName = "Cleopatra";
  return (
    <main className="grain-overlay">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          {/* Ancient Egypt season only (US autumn, UK spring); renders nothing otherwise */}
          <SeasonPromo location="teachers" packHref="#unit-pack" className="mb-8 text-left" />
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="font-body text-xs tracking-[0.25em] uppercase text-gold-500 mb-5"
          >
            For teachers &middot; KS2 &amp; KS3 Ancient Egypt
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-sand-100 mb-6"
          >
            Bring real <span className="text-gradient-gold font-medium">hieroglyphs</span> into your classroom
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="font-body text-lg md:text-xl text-sand-300 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            A whiteboard name translator, a printable write-your-name worksheet with
            answer key, and a ready-made 50-minute lesson. Free, accurate, and no pupil
            accounts needed.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <StartTrialButton location="teachers_hero" label="Try Classroom mode free for 7 days" />
            <Link href="/teachers/worksheet" className="btn-secondary">
              Get the free worksheet
            </Link>
            <Link href="/pricing#teachers" className="btn-secondary">
              Classroom licences
            </Link>
          </motion.div>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mt-5 font-body text-sm text-sand-400">
            Teaching a whole unit?{" "}
            <a href="#unit-pack" className="text-gold-400 underline underline-offset-4 hover:text-gold-300">
              Five ready-to-teach lessons, with a free Lesson 1
            </a>
          </motion.p>

          {/* Sample cartouche */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mt-14 flex flex-col items-center"
          >
            <div className="relative px-8 py-4 border-2 border-gold-500/60 rounded-[50px] bg-obsidian-light/30">
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-8 border-2 border-gold-500/60 border-l-0 rounded-r-md" />
              <span className="text-4xl md:text-5xl text-gold-400" style={GLYPH_FONT}>
                {getHieroglyphs(sampleName)}
              </span>
            </div>
            <p className="font-body text-xs text-sand-600 mt-3 tracking-[0.15em] uppercase">
              {sampleName}, as a scribe would write it
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick answer */}
      <section className="relative pb-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="border border-gold-500/30 bg-gold-500/5 p-6 md:p-8">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-3">
              Quick answer
            </p>
            <p className="font-body text-sand-200 leading-relaxed">
              Learn Hieroglyphics offers free classroom resources for teaching Ancient
              Egypt: a name-to-hieroglyphs translator that needs no sign-in, a printable
              A4 worksheet where pupils write their own name in a cartouche using the 24
              real alphabet signs, a teacher answer key, and a 50-minute lesson outline
              mapped to the KS2 History depth study of Ancient Egypt.
            </p>
          </div>
        </div>
      </section>

      {/* Three ways */}
      <section className="relative py-16 border-t border-gold-700/20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-sand-100 mb-10 text-center">
            Three ways to use it <span className="text-gradient-gold">tomorrow</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                glyph: "𓏞",
                title: "On the whiteboard",
                body: "Type any name and watch it appear sign by sign, then tap each sign for a one-line explanation. Pupils love seeing their own name; it is what brought a whole class from one UK school to this site in a single morning.",
                href: "/translate-name-to-hieroglyphics",
                cta: "Name translator",
              },
              {
                glyph: "𓏛",
                title: "On paper",
                body: "A three-page A4 worksheet: alphabet chart, write-your-name cartouche, four names to decode, a challenge for fast finishers, and an answer key. Print it or save it as a PDF.",
                href: "/teachers/worksheet",
                cta: "Printable worksheet",
              },
              {
                glyph: "𓊹",
                title: "As a live quiz",
                body: "Classroom mode: a six-character room code on the projector, pupils join from any phone with a team name (no accounts), ten KS2-friendly questions with a countdown and a team leaderboard with confetti. Free for 7 days with no card, then part of the Classroom licence; pupils never sign in.",
                href: "/teachers/class",
                cta: "Try Classroom mode free",
              },
              {
                glyph: "𓂀",
                title: "As a full lesson",
                body: "Lesson one of the course teaches all 25 alphabet signs with audio and quick checks in about 25 minutes. Free with an account. Run it from the front, or set it as homework for older pupils.",
                href: "/get-started",
                cta: "Free lesson",
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i}
                className="border border-gold-700/20 bg-obsidian-light/40 p-7 flex flex-col"
              >
                <span className="text-4xl text-gold-400 mb-4" style={GLYPH_FONT}>
                  {c.glyph}
                </span>
                <h3 className="font-display text-xl font-medium text-sand-100 mb-3">{c.title}</h3>
                <p className="font-body text-sm text-sand-400 font-light leading-relaxed flex-1">
                  {c.body}
                </p>
                <Link
                  href={c.href}
                  className="font-body text-sm text-gold-500 hover:text-gold-300 underline underline-offset-4 mt-5"
                >
                  {c.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lesson plan */}
      <section className="relative py-16 border-t border-gold-700/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-sand-100 mb-3 text-center">
            A ready-made <span className="text-gradient-gold">50-minute lesson</span>
          </h2>
          <p className="font-body text-sand-400 text-center max-w-2xl mx-auto mb-12">
            Learning objective: <em>to understand how the ancient Egyptians wrote sounds,
            and to write my own name as a scribe would.</em>
          </p>
          <ol className="space-y-6">
            {LESSON_PLAN.map((step, i) => (
              <motion.li
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i}
                className="grid md:grid-cols-[110px_1fr] gap-4 md:gap-8 border-l-2 border-gold-500/40 pl-6"
              >
                <span className="font-display text-gold-400 text-lg">{step.time}</span>
                <div>
                  <h3 className="font-display text-xl text-sand-100 mb-2">{step.title}</h3>
                  <p className="font-body text-sm text-sand-400 font-light leading-relaxed">
                    {step.body}
                  </p>
                  {step.href && (
                    <Link
                      href={step.href}
                      className="inline-block font-body text-sm text-gold-500 hover:text-gold-300 underline underline-offset-4 mt-3"
                    >
                      {step.cta}
                    </Link>
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* The paid five-lesson unit, after the free one-lesson plan */}
      <section className="relative py-16 border-t border-gold-700/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-sand-100 mb-3 text-center">
            Want the <span className="text-gradient-gold">whole unit</span>?
          </h2>
          <p className="font-body text-sand-400 text-center max-w-2xl mx-auto mb-10">
            The lesson above is one hour. The Ancient Egypt Writing Unit is five: the Rosetta Stone, the
            alphabet, real royal cartouches, determinatives and an assessment, each with a worksheet.
          </p>
          <UnitPackOffer location="teachers" />
          {/* the Class Cartouche Set (src/lib/class-set.ts): the thing to buy after the name lesson */}
          <Link
            href="/teachers/class-set?from=teachers"
            className="mt-6 flex flex-col gap-1 border border-gold-700/30 p-5 transition-colors hover:border-gold-400 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              <span className="block font-display text-xl text-sand-100">Every pupil&rsquo;s name in a cartouche</span>
              <span className="block font-body text-sm text-sand-400">
                Paste your class list: one printable PDF with each name in hieroglyphs on its own page, for display or to take home.
              </span>
            </span>
            <span className="shrink-0 font-body text-sm font-semibold text-gold-300">Make a class set &rarr;</span>
          </Link>
        </div>
      </section>

      {/* Curriculum */}
      <section className="relative py-16 border-t border-gold-700/20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-sand-100 mb-10 text-center">
            Where it fits the <span className="text-gradient-gold">curriculum</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {CURRICULUM.map((c) => (
              <div key={c.subject} className="border border-gold-700/20 bg-obsidian-light/40 p-6">
                <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-2">
                  {c.subject}
                </p>
                <p className="font-body text-sm text-sand-300 font-light leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accuracy */}
      <section className="relative py-16 border-t border-gold-700/20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-sand-100 mb-6">
            Accurate, not just <span className="text-gradient-gold">decorative</span>
          </h2>
          <div className="space-y-4 font-body text-sand-400 font-light leading-relaxed">
            <p>
              Every sign on the worksheet and in the translator is a genuine uniliteral
              from Gardiner&apos;s sign list: the owl for <em>m</em>, the water ripple for{" "}
              <em>n</em>, the vulture for the glottal stop Egyptologists read as{" "}
              <em>a</em>. The vowel, L/R and double-letter conventions are the ones the
              British Museum and university departments use when they write modern names.
            </p>
            <p>
              We are honest with pupils about the limits: this is a{" "}
              <span className="text-sand-200">phonetic transliteration</span> of the sounds
              of a name, not a translation of its meaning, and cartouches were reserved for
              royalty, which is exactly why children enjoy putting their own name in one.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 border-t border-gold-700/20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-sand-100 mb-10 text-center">
            Teacher <span className="text-gradient-gold">FAQ</span>
          </h2>
          <dl className="space-y-8">
            {TEACHER_FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-display text-lg text-gold-400 mb-2">{f.q}</dt>
                <dd className="font-body text-sm text-sand-400 font-light leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 border-t border-gold-700/20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-5xl text-gold-400 block mb-6" style={GLYPH_FONT}>
            𓋹
          </span>
          <h2 className="font-display text-3xl font-semibold text-sand-100 mb-4">
            Want it for a whole class or school?
          </h2>
          <p className="font-body text-sand-400 max-w-xl mx-auto mb-8">
            If you would like class access to the full course, a school visit, or a
            worksheet adapted to your scheme of work, tell us what you need; we reply
            to every teacher.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-primary"
              onClick={() => trackEvent("teachers_contact", { location: "teachers_cta" })}
            >
              Contact us
            </Link>
            <Link href="/teachers/worksheet" className="btn-secondary">
              Get the worksheet
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
