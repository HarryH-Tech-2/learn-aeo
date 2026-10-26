"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { buildGlossary, filterGlossary, shortMeaning, type GlossaryEntry } from "@/lib/glossary";

const GLYPH_FONT = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;

type Props = {
  /** Lesson ids the scholar has completed — their glyphs are marked as learned. */
  completedLessonIds?: string[];
  /** null while unknown; false hides the deep notes on members-only lessons. */
  hasSubscription: boolean | null;
};

export default function GlyphGlossary({ completedLessonIds = [], hasSubscription }: Props) {
  const all = useMemo(() => buildGlossary(), []);
  const [query, setQuery] = useState("");
  const [lessonFilter, setLessonFilter] = useState<string>("all");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const lessonsInOrder = useMemo(() => {
    const seen = new Map<string, { id: string; title: string; subtitle: string }>();
    for (const e of all) if (!seen.has(e.lessonId)) seen.set(e.lessonId, { id: e.lessonId, title: e.lessonTitle, subtitle: e.lessonSubtitle });
    return [...seen.values()];
  }, [all]);

  const visible = useMemo(() => {
    const byLesson = lessonFilter === "all" ? all : all.filter((e) => e.lessonId === lessonFilter);
    return filterGlossary(byLesson, query);
  }, [all, lessonFilter, query]);

  // Group visible entries by lesson, preserving lesson order. Each entry keeps
  // its index into `visible` so the modal can step previous/next.
  const groups = useMemo(() => {
    const map = new Map<string, { entry: GlossaryEntry; idx: number }[]>();
    visible.forEach((entry, idx) => {
      const list = map.get(entry.lessonId) ?? [];
      list.push({ entry, idx });
      map.set(entry.lessonId, list);
    });
    return lessonsInOrder.filter((l) => map.has(l.id)).map((l) => ({ lesson: l, items: map.get(l.id)! }));
  }, [visible, lessonsInOrder]);

  const learned = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const learnedCount = all.filter((e) => learned.has(e.lessonId)).length;

  const open = openIdx !== null ? visible[openIdx] : null;
  const close = useCallback(() => setOpenIdx(null), []);
  const [direction, setDirection] = useState(1);
  const step = useCallback(
    (delta: number) => {
      setDirection(delta);
      setOpenIdx((i) => (i === null ? null : (i + delta + visible.length) % visible.length));
    },
    [visible.length],
  );

  // Escape closes; arrow keys step.
  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, close, step]);

  // Lock page scroll while the modal is up. Kept apart from the keys, so stepping between signs does
  // not unlock and relock the page; the scrollbar's width is padded back in, or the page jumps sideways.
  const isOpen = openIdx !== null;
  useEffect(() => {
    if (!isOpen) return;
    const { overflow, paddingRight } = document.body.style;
    const bar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (bar > 0) document.body.style.paddingRight = `${bar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [isOpen]);

  // If the filter changes underneath an open modal, drop it rather than show a stale index.
  useEffect(() => setOpenIdx(null), [query, lessonFilter]);

  return (
    <div className="card-ancient p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-5">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-1">Glossary</p>
          <h2 className="font-display text-2xl text-sand-100">
            Every sign on the course
            <span className="text-gold-400 text-base align-middle ml-2">· {all.length} signs</span>
          </h2>
        </div>
        <p className="font-body text-xs text-sand-500">
          <span className="text-gold-400 font-medium">{learnedCount}</span>
          <span className="text-sand-600"> / {all.length} learned</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <label className="flex-1">
          <span className="sr-only">Search signs</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by sound, meaning, or paste a sign…"
            className="w-full bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-4 py-2.5 font-body text-sm text-sand-100 placeholder:text-sand-600"
          />
        </label>
        <label>
          <span className="sr-only">Filter by lesson</span>
          <select
            value={lessonFilter}
            onChange={(e) => setLessonFilter(e.target.value)}
            className="w-full sm:w-auto bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-4 py-2.5 font-body text-sm text-sand-100"
          >
            <option value="all">All lessons</option>
            {lessonsInOrder.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} · {l.subtitle}
              </option>
            ))}
          </select>
        </label>
      </div>

      {groups.length === 0 && (
        <p className="font-body text-sm text-sand-500 py-8 text-center">No signs match “{query}”.</p>
      )}

      {groups.map(({ lesson, items }) => (
        <section key={lesson.id} className="mb-8 last:mb-0">
          <div className="flex items-baseline gap-3 mb-3">
            <h3 className="font-display text-lg text-sand-100">{lesson.title}</h3>
            <span className="font-body text-xs text-sand-500">{lesson.subtitle}</span>
            <span className="font-body text-[10px] tracking-[0.15em] uppercase text-sand-600 ml-auto">{items.length} signs</span>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {items.map(({ entry: e, idx }) => (
              <li key={`${e.lessonId}:${e.symbol}`}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(idx)}
                  className="group w-full h-full flex flex-col items-center text-center gap-1.5 p-4 border border-gold-700/20 bg-obsidian-lighter hover:border-gold-500/50 hover:bg-gold-500/5 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="text-5xl leading-none text-gold-300 group-hover:text-gold-200 transition-colors" style={GLYPH_FONT} aria-hidden="true">
                    {e.symbol}
                  </span>
                  <span className="font-body text-sm text-gold-400 font-medium mt-1">{e.transliteration}</span>
                  <span className="font-body text-xs text-sand-300 line-clamp-2">{shortMeaning(e.meaning)}</span>
                  {learned.has(e.lessonId) && (
                    <span className="font-body text-[9px] tracking-[0.15em] uppercase text-turquoise border border-turquoise/30 px-1.5 py-0.5 mt-1">
                      Learned
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <GlossaryModal
        entry={open}
        index={openIdx ?? 0}
        total={visible.length}
        direction={direction}
        learned={!!open && learned.has(open.lessonId)}
        locked={!!open && !open.lessonFree && hasSubscription === false}
        onClose={close}
        onStep={step}
      />
    </div>
  );
}

type ModalProps = {
  entry: GlossaryEntry | null;
  index: number;
  total: number;
  /** which way the last step went, so the next sign slides in from that side */
  direction: number;
  learned: boolean;
  locked: boolean;
  onClose: () => void;
  onStep: (delta: number) => void;
};

/**
 * The card for one sign. Rendered into <body>: the glossary sits inside a card
 * that lifts on hover, and a transformed ancestor captures `position: fixed`
 * and clips the modal. Only opacity and transform are animated, and the
 * backdrop is a plain wash (an animated backdrop blur is what made it stutter).
 */
function GlossaryModal({ entry, index, total, direction, learned, locked, onClose, onStep }: ModalProps) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const slide = reduce ? 0 : 28;
  return createPortal(
    <AnimatePresence>
      {entry && (
        <div key="glossary-modal" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-8">
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-modal-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.16, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
            style={{ willChange: "transform, opacity" }}
            className="relative flex flex-col w-full sm:max-w-2xl h-[88dvh] sm:h-[min(42rem,88vh)] bg-obsidian-light border border-gold-500/40 rounded-t-xl sm:rounded-sm shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* gold hairline across the top */}
            <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full border border-gold-700/40 bg-obsidian/70 text-sand-300 hover:text-gold-300 hover:border-gold-500/70 transition-colors"
            >
              <span aria-hidden="true" className="text-lg leading-none">×</span>
            </button>

            {/* the frame stays put; only the sign inside it changes, sliding the way the learner stepped */}
            <div className="relative flex-1 min-h-0">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={`${entry.lessonId}:${entry.symbol}`}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * slide }),
                    centre: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: -d * slide }),
                  }}
                  initial="enter"
                  animate="centre"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 overflow-y-auto overscroll-contain"
                >
                  <GlossaryDetail entry={entry} learned={learned} locked={locked} />
                </motion.div>
              </AnimatePresence>
            </div>

            {total > 1 && (
              <div className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-t border-gold-700/25 bg-obsidian/60">
                <button type="button" onClick={() => onStep(-1)} className="px-3 py-2 font-body text-xs tracking-[0.15em] uppercase text-sand-300 hover:text-gold-300 hover:bg-gold-500/10 transition-colors">
                  Previous
                </button>
                <span className="font-body text-[11px] tracking-[0.15em] uppercase text-sand-500 tabular-nums">
                  {index + 1} / {total}
                </span>
                <button type="button" onClick={() => onStep(1)} className="px-3 py-2 font-body text-xs tracking-[0.15em] uppercase text-sand-300 hover:text-gold-300 hover:bg-gold-500/10 transition-colors">
                  Next
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-gold-600/50 pl-4">
      <dt className="font-body text-[11px] tracking-[0.2em] uppercase text-gold-400 mb-1">{title}</dt>
      <dd className="font-body text-[15px] leading-relaxed text-sand-200">{children}</dd>
    </div>
  );
}

function GlossaryDetail({ entry: e, learned, locked }: { entry: GlossaryEntry; learned: boolean; locked: boolean }) {
  return (
    <div>
      <div className="px-6 md:px-8 pt-8 pb-6 border-b border-gold-700/20 bg-[radial-gradient(ellipse_at_top_left,rgba(212,168,50,0.14),transparent_60%)]">
        <div className="flex items-center gap-5 sm:gap-6 pr-10">
          <span
            className="shrink-0 flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 border border-gold-500/40 bg-obsidian/60 text-7xl sm:text-[5.5rem] leading-none text-gold-300 shadow-[inset_0_0_30px_rgba(212,168,50,0.12)]"
            style={GLYPH_FONT}
            aria-hidden="true"
          >
            {e.symbol}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-gold-400 mb-2">
              {e.lessonSubtitle}
              {learned && <span className="border border-turquoise/40 text-turquoise px-1.5 py-0.5 tracking-[0.15em]">Learned</span>}
            </p>
            <h3 id="glossary-modal-title" className="font-display text-2xl sm:text-3xl text-sand-100 leading-tight">
              <span className="text-gold-400 italic">{e.transliteration}</span>
              <span className="text-sand-500 mx-2">·</span>
              {shortMeaning(e.meaning)}
            </h3>
            <p className="inline-block mt-3 border border-gold-700/40 bg-obsidian/50 px-2.5 py-1 font-body text-sm text-sand-200">
              <span className="text-sand-400">Say it:</span> {e.pronunciation}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6">
        <p className="font-body text-base leading-relaxed text-sand-100 mb-6">{e.meaning}</p>

        {locked ? (
          <p className="font-body text-sm text-sand-300 border border-gold-700/30 bg-obsidian-lighter p-4">
            The origin, history and cultural notes for this sign are part of{" "}
            <span className="text-sand-100">{e.lessonTitle}</span>.{" "}
            <Link href="/pricing" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
              Unlock the full course
            </Link>
          </p>
        ) : (
          <dl className="space-y-5">
            {e.origin && <Note title="Why this picture?">{e.origin}</Note>}
            <Note title="History">{e.history}</Note>
            <Note title="Culture">{e.culture}</Note>
            {e.examples.length > 0 && (
              <Note title="Examples">
                <span className="flex flex-wrap gap-2 mt-1">
                  {e.examples.map((ex) => (
                    <span key={ex} className="border border-gold-700/30 bg-obsidian-lighter px-3 py-1.5 font-body text-lg text-sand-100">
                      {ex}
                    </span>
                  ))}
                </span>
              </Note>
            )}
          </dl>
        )}

        <p className="mt-7 font-body text-sm text-sand-400">
          Taught in{" "}
          <Link href={`/lessons/${e.lessonId}`} className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
            {e.lessonTitle}
          </Link>
        </p>
      </div>
    </div>
  );
}
