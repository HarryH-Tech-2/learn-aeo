"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Price from "@/components/Price";
import FreeCourseCta from "@/components/FreeCourseCta";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
import { useAuthModal } from "@/components/AuthModal";

const previewLessons = [
  {
    id: "expedition-begins",
    title: "The Expedition Begins",
    subtitle: "Uniliteral Signs",
    category: "Fundamentals",
    difficulty: "beginner",
    duration: "15 min",
    glyphs: ["𓄿", "𓇋", "𓅱", "𓂝", "𓃀", "𓊪"],
    description: "Begin your journey with the 24 uniliteral signs, the single-consonant building blocks that act as the Egyptian alphabet. You'll learn each glyph's shape, sound value, and how scribes combined them to spell out names, titles, and prayers on temple walls.",
    isFree: true,
  },
  {
    id: "outer-courtyard",
    title: "The Outer Courtyard",
    subtitle: "Flora & Fauna",
    category: "Fundamentals",
    difficulty: "beginner",
    duration: "20 min",
    glyphs: ["𓃭", "𓆣", "𓅓", "𓆭", "𓈗"],
    description: "Step into the garden of signs the Egyptians drew from the world around them: lions, owls, vipers, reeds, lotus blossoms, and the rippling waters of the Nile. You'll learn how each creature and plant carried both a sound and a symbolic meaning scribes leaned on daily.",
    isFree: false,
  },
  {
    id: "pilgrims-gallery",
    title: "The Pilgrim's Gallery",
    subtitle: "Determinatives",
    category: "Fundamentals",
    difficulty: "beginner",
    duration: "20 min",
    glyphs: ["𓀀", "𓁀", "𓂻", "𓁐", "𓂧"],
    description: "Meet the silent signs that quietly decide meaning. Determinatives sit at the end of words to tell you whether you're reading about a man, a woman, a god, a motion, or an abstract idea. They are the secret to telling apart words that share identical spellings.",
    isFree: false,
  },
  {
    id: "the-treasury",
    title: "The Treasury",
    subtitle: "Egyptian Numerals",
    category: "Applied",
    difficulty: "intermediate",
    duration: "20 min",
    glyphs: ["𓏤", "𓏥", "𓍯", "𓆣", "𓂋"],
    description: "Master the base-10 numeral system that surveyed the pyramids, tallied grain harvests, and measured the annual flood of the Nile. You'll read inventories, regnal years, and offering counts the way a Middle Kingdom accountant would have seen them.",
    isFree: false,
  },
  {
    id: "royal-hall",
    title: "The Royal Hall",
    subtitle: "Pharaoh Names",
    category: "Applied",
    difficulty: "intermediate",
    duration: "25 min",
    glyphs: ["𓇳", "𓈖", "𓏏", "𓋴", "𓊃"],
    description: "Decode the oval cartouches that ring every pharaoh's name. You'll sound out Tutankhamun, Ramesses, Hatshepsut, and Cleopatra glyph by glyph, and learn the throne-name conventions (\"Son of Ra,\" \"Beloved of Amun\") that declared a king's divine lineage.",
    isFree: false,
  },
  {
    id: "sacred-chapel",
    title: "The Sacred Chapel",
    subtitle: "Funerary Formulas",
    category: "Advanced",
    difficulty: "advanced",
    duration: "30 min",
    glyphs: ["𓂀", "𓁑", "𓎛", "𓐍", "𓌳"],
    description: "Read the offering formulas, hymns, and spells scribes chiselled into tomb walls to carry a soul safely through the Duat. You'll parse the classic \"hetep di nesu\" invocation, name the gods of the afterlife, and recognise the recurring phrases of the Book of the Dead.",
    isFree: false,
  },
];

const difficultyColors: Record<string, string> = {
  beginner: "text-turquoise border-turquoise/30",
  intermediate: "text-gold-400 border-gold-500/30",
  advanced: "text-terracotta border-terracotta/30",
};

export default function LessonsPreview() {
  const { data: session } = useSession();
  const freeGuest = useFreeCourseGuest();
  const { openAuthModal } = useAuthModal();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="lessons" className="relative py-20">

      <InView className="max-w-4xl mx-auto px-6 lg:px-8" margin="-100px">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold-700" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">
              Curriculum
            </span>
            <span className="h-px w-12 bg-gold-700" />
          </div>

          <h2
            className="reveal font-display text-4xl md:text-5xl lg:text-6xl font-light text-sand-100 mb-6"
            style={reveal(0.1, { y: 30 })}
          >
            Your Journey Through
            <br />
            <span className="text-gradient-gold font-medium">3,000 Years</span>
          </h2>
        </div>

        {/* Lessons Accordion */}
        <div className="flex flex-col gap-3">
          {previewLessons.map((lesson, i) => {
            const isOpen = openId === lesson.id;
            return (
              <div
                key={lesson.id}
                className="reveal card-ancient overflow-hidden"
                style={reveal(0.2 + i * 0.05, { dur: 0.5 })}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : lesson.id)}
                  aria-expanded={isOpen}
                  aria-controls={`lesson-panel-${lesson.id}`}
                  className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:bg-gold-500/5 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-sand-500 block">
                      {lesson.category}
                    </span>
                    <h3 className="font-display text-base md:text-lg font-semibold text-sand-100 mt-0.5 truncate">
                      {lesson.title}
                    </h3>
                    <p className="font-body text-xs text-sand-500 mt-0.5 truncate">
                      {lesson.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <svg
                      className={`w-4 h-4 text-gold-400 transition-transform duration-300${isOpen ? " rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Always in the DOM (crawlable); .accordion-panel animates open/closed */}
                <div
                  id={`lesson-panel-${lesson.id}`}
                  className="accordion-panel"
                  data-open={isOpen ? "true" : "false"}
                >
                  <div>
                    <div className="px-5 md:px-6 pb-5 md:pb-6 pt-1">
                        <p className="font-body text-sm text-sand-300 font-light leading-relaxed mb-5">
                          {lesson.description}
                        </p>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-body text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border ${
                                difficultyColors[lesson.difficulty]
                              }`}
                            >
                              {lesson.difficulty}
                            </span>
                            {(lesson.isFree || freeGuest) && (
                              <span className="font-body text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border border-turquoise/30 text-turquoise">
                                Free
                              </span>
                            )}
                          </div>
                          {!session && !lesson.isFree ? (
                            <button
                              onClick={() => openAuthModal({ next: `/lessons/${lesson.id}` })}
                              className="font-body text-xs text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1"
                            >
                              Start lesson
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          ) : (
                            <Link
                              href={`/lessons/${lesson.id}`}
                              className="font-body text-xs text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1"
                            >
                              Start lesson
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </Link>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA below lessons */}
        <div className="reveal text-center mt-16" style={reveal(0.8, { y: 30 })}>
          {!session && freeGuest && <FreeCourseCta location="lessons_preview" compact label="All Lessons Free · Create My Account" />}
          {!session && !freeGuest && (
            <button
              onClick={() => openAuthModal({ next: "checkout" })}
              className="btn-primary text-base py-4 px-10"
            >
              Unlock All Lessons · <Price /> Lifetime
            </button>
          )}
        </div>
      </InView>
    </section>
  );
}
