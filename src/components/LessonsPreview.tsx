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
import { LESSON_CATALOG, courseParts, lessonPath } from "@/lib/lesson-catalog";

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
            {LESSON_CATALOG.length} districts,
            <br />
            <span className="text-gradient-gold font-medium">one City of Answers</span>
          </h2>
        </div>

        {/* The course in parts, each an accordion of its lessons */}
        <div className="flex flex-col gap-12">
          {courseParts().map(({ part, number, lessons }) => (
            <div key={part.title}>
              <div className="reveal mb-4" style={reveal(0.15 + number * 0.05, { dur: 0.5 })}>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-gold-500">Part {number}</span>
                <h3 className="font-display text-2xl md:text-3xl font-light text-sand-100 mt-1">{part.title}</h3>
                <p className="font-body text-sm text-sand-400 mt-1">{part.summary}</p>
              </div>
              <div className="flex flex-col gap-3">
                {lessons.map((lesson) => {
                  const isOpen = openId === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      className="reveal card-ancient overflow-hidden"
                      style={reveal(0.2 + lesson.order * 0.05, { dur: 0.5 })}
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
                            {lesson.order} · {lesson.district}
                          </span>
                          <h4 className="font-display text-base md:text-lg font-semibold text-sand-100 mt-0.5 truncate">
                            {lesson.title}
                          </h4>
                          <p className="font-body text-xs text-sand-500 mt-0.5 truncate">
                            {lesson.summary}
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
                                      difficultyColors[lesson.level]
                                    }`}
                                  >
                                    {lesson.level}
                                  </span>
                                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-sand-500">
                                    {lesson.minutes} min
                                  </span>
                                  {lesson.status === "coming-soon" ? (
                                    <span className="font-body text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border border-sand-500/30 text-sand-500">
                                      Coming soon
                                    </span>
                                  ) : (
                                    (lesson.isFree || freeGuest) && (
                                      <span className="font-body text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border border-turquoise/30 text-turquoise">
                                        Free
                                      </span>
                                    )
                                  )}
                                </div>
                                {lesson.status === "live" && (
                                  <>
                                {!session && !lesson.isFree ? (
                                  <button
                                    onClick={() => openAuthModal({ next: lessonPath(lesson.id) })}
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
                                    href={lessonPath(lesson.id)}
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
                                  </>
                                )}
                              </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
