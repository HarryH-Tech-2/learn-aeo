"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { fetchJson } from "@/lib/fetch-json";
import {
  CHAPTERS,
  DECIPHER_LESSON_ID,
  DECIPHER_STORAGE_KEY,
  EMPTY_PROGRESS,
  TOTAL_CHAPTERS,
  allUnlockableSigns,
  checkPlacement,
  clearSlot,
  decipherShareText,
  initialPlacement,
  isChapterOpen,
  isComplete,
  isProgress,
  mergeProgress,
  nextChapter,
  openSlots,
  placeLetter,
  signInfo,
  tilesFor,
  withChapterComplete,
  withPuzzleSolved,
  xpForChapter,
  type DecipherChapter,
  type DecipherProgress,
  type DecipherPuzzle,
  type Placement,
  type ReadRound,
} from "@/lib/decipher";

// ─── persistence ───

function loadProgress(): DecipherProgress {
  try {
    const raw = window.localStorage.getItem(DECIPHER_STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed = JSON.parse(raw);
    return isProgress(parsed) ? parsed : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

function saveProgress(p: DecipherProgress) {
  try {
    window.localStorage.setItem(DECIPHER_STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

type Step = { kind: "intro" } | { kind: "puzzle"; index: number } | { kind: "quiz" } | { kind: "reading"; index: number } | { kind: "outro" };

function stepsFor(ch: DecipherChapter): Step[] {
  const steps: Step[] = [{ kind: "intro" }];
  ch.puzzles.forEach((_, index) => steps.push({ kind: "puzzle", index }));
  if (ch.quiz) steps.push({ kind: "quiz" });
  (ch.reading ?? []).forEach((_, index) => steps.push({ kind: "reading", index }));
  steps.push({ kind: "outro" });
  return steps;
}

export default function DecipherContent({ children }: { children?: React.ReactNode }) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [progress, setProgress] = useState<DecipherProgress | null>(null);
  const [chapterNo, setChapterNo] = useState<number>(1);
  const [stepIdx, setStepIdx] = useState(0);
  const [xp, setXp] = useState<{ amount: number; status: "idle" | "saving" | "saved" | "guest" | "error" }>({ amount: 0, status: "idle" });
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const syncedRef = useRef(false);

  const chapter = CHAPTERS[chapterNo - 1];
  const steps = useMemo(() => stepsFor(chapter), [chapter]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const unlocked = useMemo(() => new Set(progress?.unlocked ?? []), [progress]);

  // Load local progress, then merge the account copy when signed in.
  useEffect(() => {
    const local = loadProgress();
    setProgress(local);
    setChapterNo(nextChapter(local));
  }, []);

  useEffect(() => {
    if (!session?.user || syncedRef.current || !progress) return;
    syncedRef.current = true;
    fetchJson<{ state: unknown }>("/api/game-state?game=decipher")
      .then((d) => {
        const remote = isProgress(d.state) ? d.state : EMPTY_PROGRESS;
        const merged = mergeProgress(progress, remote);
        setProgress(merged);
        saveProgress(merged);
        setChapterNo((c) => Math.max(c, Math.min(TOTAL_CHAPTERS, nextChapter(merged))));
        return fetch("/api/game-state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: "decipher", state: merged }) });
      })
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, progress === null]);

  const update = useCallback(
    (p: DecipherProgress) => {
      setProgress(p);
      saveProgress(p);
      if (session?.user) {
        fetch("/api/game-state", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: "decipher", state: p }) }).catch(() => null);
      }
    },
    [session]
  );

  function goChapter(n: number) {
    if (!progress || !isChapterOpen(progress, n)) return;
    setChapterNo(n);
    setStepIdx(0);
    setXp({ amount: 0, status: "idle" });
    trackEvent("game_start", { game: "decipher", chapter: n });
  }

  function next() {
    setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  }

  function solvedPuzzle(p: DecipherPuzzle) {
    if (!progress) return;
    update(withPuzzleSolved(progress, p));
  }

  function finishChapter() {
    if (!progress) return;
    const before = progress.unlocked.length;
    let p = progress;
    for (const pz of chapter.puzzles) p = withPuzzleSolved(p, pz);
    const already = p.completed.includes(chapter.number);
    p = withChapterComplete(p, chapter.number);
    update(p);
    if (!already) {
      const amount = xpForChapter(chapter, p.unlocked.length - before);
      trackExerciseComplete({ exercise: "decipher", score: chapter.number, total: TOTAL_CHAPTERS });
      trackEvent("decipher_chapter_complete", { chapter: chapter.number, signs: p.unlocked.length });
      if (session?.user) {
        setXp({ amount, status: "saving" });
        fetch("/api/progress/xp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: DECIPHER_LESSON_ID, xp: amount }) })
          .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
          .then(() => setXp({ amount, status: "saved" }))
          .catch(() => setXp({ amount, status: "error" }));
      } else {
        setXp({ amount, status: "guest" });
      }
    }
  }

  async function share() {
    const count = progress?.unlocked.length ?? 0;
    const text = decipherShareText(count);
    trackEvent("decipher_share", { signs: count });
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const total = allUnlockableSigns().length;

  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="text-center mb-6">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Cartouche of the Day · Champollion mode · free</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light">
            <span className="text-gradient-gold font-medium">Decipher</span> the hieroglyphs yourself
          </h1>
          <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Five short chapters. Match Greek royal names to real cartouches and deduce the sign values, the way Young and Champollion did between 1814 and 1822.
          </p>
        </div>

        {/* Chapter rail */}
        <nav aria-label="Chapters" className="flex flex-wrap justify-center gap-2 mb-6">
          {CHAPTERS.map((ch) => {
            const open = progress ? isChapterOpen(progress, ch.number) : ch.number === 1;
            const done = progress?.completed.includes(ch.number);
            const active = ch.number === chapterNo;
            return (
              <button
                key={ch.number}
                type="button"
                onClick={() => goChapter(ch.number)}
                disabled={!open}
                aria-current={active ? "step" : undefined}
                className={`font-body text-[11px] tracking-[0.15em] uppercase px-3 py-2 border transition-colors ${
                  active ? "border-gold-500 text-gold-300 bg-gold-500/10" : open ? "border-gold-700/30 text-sand-300 hover:border-gold-500/50" : "border-gold-700/15 text-sand-600 cursor-not-allowed"
                }`}
              >
                {done ? "✓ " : open ? "" : "🔒 "}
                {ch.number}. {ch.title}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center justify-between font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-3">
          <span>
            Signs deduced <span className="text-gold-400 text-base align-middle">{progress?.unlocked.length ?? 0}</span>/{total}
          </span>
          <button type="button" onClick={() => setShowKey((v) => !v)} className="underline underline-offset-4 hover:text-gold-400" aria-expanded={showKey}>
            {showKey ? "Hide my signs" : "My signs"}
          </button>
        </div>
        {showKey && (
          <div className="card-ancient p-4 mb-4 flex flex-wrap gap-2" aria-label="Signs you have deduced">
            {(progress?.unlocked ?? []).length === 0 && <p className="font-body text-xs text-sand-500">Nothing yet. Solve Ptolemy to start your key.</p>}
            {(progress?.unlocked ?? []).map((g) => {
              const info = signInfo(g);
              return (
                <span key={g} className="inline-flex items-center gap-2 border border-gold-700/25 bg-obsidian-lighter px-2 py-1">
                  <span className="glyph-cell text-2xl">{g}</span>
                  <span className="font-body text-xs text-sand-300">{info?.letter ?? info?.sound ?? ""}</span>
                </span>
              );
            })}
          </div>
        )}

        {!progress ? (
          <div className="card-ancient p-10 text-center font-body text-sm text-sand-500 animate-pulse">Opening the notebooks…</div>
        ) : (
          <div className="card-ancient p-4 sm:p-6 md:p-8" key={`${chapterNo}-${stepIdx}`}>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">
              Chapter {chapter.number} · {chapter.date}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-sand-100 mb-4">{chapter.title}</h2>

            {step.kind === "intro" && (
              <div className="enter-fade">
                {chapter.intro.map((p, i) => (
                  <p key={i} className="font-body text-sm sm:text-base text-sand-300 leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
                <button type="button" onClick={next} className="btn-primary py-3 px-8 text-sm mt-2">
                  {chapter.puzzles.length > 0 ? "Open the copy" : "Start reading"}
                </button>
              </div>
            )}

            {step.kind === "puzzle" && (
              <PuzzleView
                key={chapter.puzzles[step.index].id}
                puzzle={chapter.puzzles[step.index]}
                unlocked={unlocked}
                alreadySolved={progress.solved.includes(chapter.puzzles[step.index].id)}
                onSolved={() => solvedPuzzle(chapter.puzzles[step.index])}
                onNext={next}
              />
            )}

            {step.kind === "quiz" && chapter.quiz && <QuizView quiz={chapter.quiz} onNext={next} />}

            {step.kind === "reading" && chapter.reading && (
              <ReadingView key={chapter.reading[step.index].id} round={chapter.reading[step.index]} index={step.index} total={chapter.reading.length} onNext={next} />
            )}

            {step.kind === "outro" && (
              <OutroView
                chapter={chapter}
                progress={progress}
                xp={xp}
                copied={copied}
                onEnter={finishChapter}
                onShare={share}
                onNextChapter={() => goChapter(chapter.number + 1)}
                onSignIn={() => openAuthModal({ next: "/daily/decipher" })}
              />
            )}
          </div>
        )}

        <p className="font-body text-xs text-sand-500 text-center mt-6">
          <Link href="/daily" className="text-gold-500 underline underline-offset-4">
            Today’s Cartouche of the Day
          </Link>{" "}
          ·{" "}
          <Link href="/dig" className="text-gold-500 underline underline-offset-4">
            Back to The Dig
          </Link>
        </p>

        {children}
      </section>
      <Footer />
    </main>
  );
}

// ─── Puzzle ───

function PuzzleView({
  puzzle,
  unlocked,
  alreadySolved,
  onSolved,
  onNext,
}: {
  puzzle: DecipherPuzzle;
  unlocked: ReadonlySet<string>;
  alreadySolved: boolean;
  onSolved: () => void;
  onNext: () => void;
}) {
  const start = useMemo(() => initialPlacement(puzzle, unlocked), [puzzle, unlocked]);
  const open = useMemo(() => openSlots(puzzle, unlocked), [puzzle, unlocked]);
  const tiles = useMemo(() => tilesFor(puzzle, unlocked), [puzzle, unlocked]);
  const [row, setRow] = useState<Placement>(start);
  const [selected, setSelected] = useState<number | null>(open[0] ?? null);
  const [wrong, setWrong] = useState<boolean[] | null>(null);
  const [solved, setSolved] = useState(alreadySolved);
  const [attempts, setAttempts] = useState(0);
  const [dragging, setDragging] = useState<number | null>(null);

  // A solved puzzle (e.g. after a reload) shows the finished row.
  useEffect(() => {
    if (alreadySolved) setRow(puzzle.signs.map((s) => (s.ending ? null : s.letter)));
  }, [alreadySolved, puzzle]);

  // Remaining tiles = offered letters minus those placed in open slots.
  const remaining = useMemo(() => {
    const placed = open.map((i) => row[i]).filter((v): v is string => v !== null);
    const pool = [...tiles];
    for (const p of placed) {
      const idx = pool.indexOf(p);
      if (idx >= 0) pool.splice(idx, 1);
    }
    return pool;
  }, [tiles, open, row]);

  const complete = isComplete(puzzle, row);

  function place(letter: string, slot: number | null) {
    if (solved) return;
    const { placement } = placeLetter(puzzle, row, letter, slot, unlocked);
    setRow(placement);
    setWrong(null);
    const target = slot !== null && open.includes(slot) ? slot : open.find((i) => row[i] === null) ?? null;
    const after = open.find((i) => placement[i] === null && (target === null || i > target)) ?? open.find((i) => placement[i] === null) ?? null;
    setSelected(after);
  }

  function clear(slot: number) {
    if (solved) return;
    setRow(clearSlot(puzzle, row, slot, unlocked));
    setWrong(null);
    setSelected(slot);
  }

  function check() {
    if (!complete || solved) return;
    const res = checkPlacement(puzzle, row);
    setAttempts((a) => a + 1);
    trackExerciseAnswer({ exercise: "decipher", questionType: "place-letters", question: puzzle.id, correct: res.allCorrect });
    if (res.allCorrect) {
      setSolved(true);
      onSolved();
    } else {
      setWrong(res.correct.map((c) => !c));
      // send the wrong letters back to the bank
      setRow(row.map((v, i) => (res.correct[i] ? v : null)));
      setSelected(open.find((i) => !res.correct[i]) ?? null);
    }
  }

  const n = puzzle.signs.length;
  const glyphSize = Math.max(1.5, Math.min(3, 22 / n));

  return (
    <div className="enter-fade">
      <p className="font-body text-xs text-sand-500 mb-1">{puzzle.source}</p>
      {puzzle.greek && (
        <p className="font-display text-xl sm:text-2xl text-sand-100 tracking-[0.2em] mb-1" lang="grc">
          {puzzle.greek} <span className="font-body text-sm text-sand-500 tracking-normal">· the Greek text</span>
        </p>
      )}
      <p className="font-body text-sm text-sand-300 leading-relaxed mb-4">{puzzle.brief}</p>

      {puzzle.clue && (
        <div className="border border-gold-700/30 bg-gold-500/5 p-3 mb-4">
          <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">{puzzle.clue.title}</p>
          <p className="font-body text-sm text-sand-200 leading-relaxed">{puzzle.clue.body}</p>
        </div>
      )}

      <div className="flex justify-center">
        <div className="cartouche-ring inline-block max-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {puzzle.signs.map((s, i) => (
              <span key={i} className={`glyph-cell ${s.ending ? "opacity-40" : ""}`} style={{ fontSize: `${glyphSize}rem` }} aria-hidden="true">
                {s.glyph}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-1 mt-4" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} role="group" aria-label="Letters under each sign">
        {puzzle.signs.map((s, i) => {
          const isOpen = open.includes(i);
          const value = row[i];
          const state = s.ending ? "ending" : solved ? "correct" : !isOpen ? "prefilled" : undefined;
          return (
            <div key={i} className="flip-card" data-flipped={solved && !s.ending}>
              <div className="flip-card-inner">
                <button
                  type="button"
                  className="flip-face daily-slot w-full"
                  data-state={state}
                  data-selected={selected === i && isOpen && !solved}
                  data-shake={!!wrong?.[i]}
                  disabled={!isOpen || solved}
                  onClick={() => (value !== null ? clear(i) : setSelected(i))}
                  onDragOver={(e) => isOpen && !solved && e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const letter = e.dataTransfer.getData("text/plain");
                    if (letter) place(letter, i);
                    setDragging(null);
                  }}
                  aria-label={s.ending ? "Not a letter: revealed at the end" : `Sign ${i + 1}${value ? `, ${value}` : ", empty"}${!isOpen ? ", already known" : ""}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {s.ending ? "·" : value ?? "·"}
                </button>
                <div className="flip-face flip-face--back daily-slot flex-col leading-tight" data-state="correct" style={{ transitionDelay: `${i * 90}ms` }} aria-hidden={!solved}>
                  <span className="text-sand-50">{s.ending ? "—" : s.letter}</span>
                  <span className="text-[10px] text-sand-300 font-normal">{s.sound}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {solved ? (
        <div className="mt-5 enter-fade">
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {puzzle.signs.map((s, i) => (
              <li key={i} className="flex items-center gap-2 border border-gold-700/20 bg-obsidian-lighter p-2">
                <span className="glyph-cell text-2xl w-8 shrink-0">{s.glyph}</span>
                <span className="font-body text-[11px] text-sand-300">
                  <span className="text-sand-100 font-medium">{s.sound}</span> · {s.name}
                </span>
              </li>
            ))}
          </ul>
          <p className="font-body text-sm text-sand-300 leading-relaxed mt-4">{puzzle.reveal}</p>
          <button type="button" onClick={onNext} className="btn-primary py-3 px-8 text-sm mt-4">
            Continue
          </button>
        </div>
      ) : (
        <>
          <p className="font-body text-[11px] tracking-[0.2em] uppercase text-sand-500 text-center mt-5 mb-2">Letters to place · tap or drag</p>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Letter tiles">
            {remaining.map((letter, i) => (
              <button
                key={`${letter}-${i}`}
                type="button"
                className="daily-tile"
                draggable
                data-dragging={dragging === i}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", letter);
                  setDragging(i);
                }}
                onDragEnd={() => setDragging(null)}
                onClick={() => place(letter, selected)}
                aria-label={`Place ${letter}`}
              >
                {letter}
              </button>
            ))}
            {remaining.length === 0 && <span className="font-body text-xs text-sand-500">All placed. Check the row.</span>}
          </div>
          {wrong && (
            <p className="font-body text-sm text-sand-300 text-center mt-3" role="status">
              {wrong.filter(Boolean).length} of the letters are under the wrong sign. They are back in the bank; look again at the Greek.
            </p>
          )}
          <div className="flex justify-center mt-5">
            <button type="button" onClick={check} disabled={!complete} className="btn-primary py-3 px-8 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              Check the row
            </button>
          </div>
          {attempts >= 2 && (
            <p className="font-body text-xs text-sand-500 text-center mt-3">Hint: signs read in the same order as the Greek letters, left to right.</p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Quiz ───

function QuizView({ quiz, onNext }: { quiz: NonNullable<DecipherChapter["quiz"]>; onNext: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const option = picked === null ? null : quiz.options[picked];
  return (
    <div className="enter-fade">
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-2">The teaching beat</p>
      <p className="font-body text-sm sm:text-base text-sand-200 leading-relaxed mb-4">
        {quiz.prompt.split(/([𓀀-𓐮]+)/u).map((part, i) => (/^[𓀀-𓐮]+$/u.test(part) ? <span key={i} className="glyph-cell text-2xl align-middle mx-0.5">{part}</span> : part))}
      </p>
      <div className="space-y-2" role="group" aria-label="Choose an explanation">
        {quiz.options.map((o, i) => {
          const chosen = picked === i;
          const state = picked === null ? "" : o.correct ? "border-turquoise bg-turquoise/10" : chosen ? "border-terracotta/60 bg-terracotta/10" : "opacity-50";
          return (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => {
                setPicked(i);
                trackExerciseAnswer({ exercise: "decipher", questionType: "homophone-quiz", question: quiz.id, correct: o.correct });
              }}
              className={`w-full text-left font-body text-sm p-3 border border-gold-700/25 bg-obsidian-lighter hover:border-gold-500/50 transition-colors ${state}`}
            >
              <span className="text-gold-500 mr-2">{String.fromCharCode(65 + i)}.</span>
              {o.text}
              {picked !== null && o.correct && <span className="ml-2 text-turquoise">✓</span>}
              {picked !== null && chosen && !o.correct && <span className="ml-2 text-terracotta">✕</span>}
            </button>
          );
        })}
      </div>
      {option && (
        <div className="mt-4 enter-fade" role="status">
          <p className="font-body text-sm text-sand-200 leading-relaxed">{option.explanation}</p>
          {!option.correct && <p className="font-body text-sm text-sand-300 mt-2">{quiz.options.find((o) => o.correct)?.explanation}</p>}
          <button type="button" onClick={onNext} className="btn-primary py-3 px-8 text-sm mt-4">
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Reading (chapter 5) ───

function ReadingView({ round, index, total, onNext }: { round: ReadRound; index: number; total: number; onNext: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);
  const correct = picked === round.answer;
  const glyphs = Array.from(round.glyphs);
  return (
    <div className="enter-fade">
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-2">
        Cartouche {index + 1} of {total}
      </p>
      <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="flex justify-center">
          <div className="cartouche-ring cartouche-ring--vertical inline-flex flex-col items-center gap-1" aria-label="A cartouche carved as a column">
            {glyphs.map((g, i) => (
              <span key={i} className="glyph-cell text-3xl" aria-hidden="true">
                {g}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-body text-sm text-sand-300 mb-3">Read the column from the top. Whose name is this?</p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Rulers">
            {round.options.map((o) => {
              const state = picked === null ? "" : o === round.answer && correct ? "border-turquoise bg-turquoise/10" : o === picked ? "border-terracotta/60 bg-terracotta/10" : "";
              return (
                <button
                  key={o}
                  type="button"
                  disabled={correct}
                  onClick={() => {
                    setPicked(o);
                    const ok = o === round.answer;
                    if (!ok) setMisses((m) => m + 1);
                    trackExerciseAnswer({ exercise: "decipher", questionType: "read-cartouche", question: round.glyphs, correct: ok });
                  }}
                  className={`font-body text-sm p-3 border border-gold-700/25 bg-obsidian-lighter hover:border-gold-500/50 transition-colors ${state}`}
                >
                  {o}
                  {picked === o && (correct ? " ✓" : " ✕")}
                </button>
              );
            })}
          </div>
          {picked !== null && !correct && <p className="font-body text-xs text-sand-400 mt-3" role="status">Not that one. Sound the signs out with your key.</p>}
          {correct && (
            <div className="mt-4 enter-fade" role="status">
              <p className="font-body text-sm text-sand-200">
                <span className="text-gold-400 font-medium">{round.answer}.</span> {round.note}
                {misses === 0 && <span className="text-sand-500"> First time.</span>}
              </p>
              <button type="button" onClick={onNext} className="btn-primary py-3 px-8 text-sm mt-4">
                {index + 1 < total ? "Next cartouche" : "Finish"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Outro ───

function OutroView({
  chapter,
  progress,
  xp,
  copied,
  onEnter,
  onShare,
  onNextChapter,
  onSignIn,
}: {
  chapter: DecipherChapter;
  progress: DecipherProgress;
  xp: { amount: number; status: string };
  copied: boolean;
  onEnter: () => void;
  onShare: () => void;
  onNextChapter: () => void;
  onSignIn: () => void;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    onEnter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const last = chapter.number === TOTAL_CHAPTERS;
  const count = progress.unlocked.length;
  return (
    <div className="enter-fade">
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-2">{chapter.outro.title}</p>
      {chapter.outro.body.map((p, i) => (
        <p key={i} className="font-body text-sm sm:text-base text-sand-300 leading-relaxed mb-3">
          {p.split(/([𓀀-𓐮]+)/u).map((part, j) => (/^[𓀀-𓐮]+$/u.test(part) ? <span key={j} className="glyph-cell text-2xl align-middle mx-0.5">{part}</span> : part))}
        </p>
      ))}

      {last && (
        <div className="border border-gold-500/40 bg-gold-500/5 p-5 mt-4 text-center" aria-label="Your result card">
          <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-2">Result</p>
          <p className="font-display text-2xl sm:text-3xl text-sand-100">
            I deciphered <span className="text-gradient-gold font-medium">{count} signs</span>
          </p>
          <p className="font-body text-sm text-sand-400 mt-1">the way Champollion did in 1822</p>
          <p className="glyph-cell text-2xl sm:text-3xl mt-4 leading-relaxed break-words">{progress.unlocked.join(" ")}</p>
          <p className="font-body text-[11px] text-sand-500 mt-3">learnhieroglyphics.com/daily/decipher</p>
        </div>
      )}

      <p className="font-body text-sm text-sand-300 mt-5 text-center min-h-[1.5rem]" role="status">
        {xp.status === "saving" && "Recording your XP…"}
        {xp.status === "saved" && (
          <>
            <span className="text-gold-400 font-medium">+{xp.amount} XP</span> added to your scholar level.
          </>
        )}
        {xp.status === "guest" && (
          <>
            You earned <span className="text-gold-400 font-medium">+{xp.amount} XP</span>.{" "}
            <button type="button" onClick={onSignIn} className="text-gold-400 underline underline-offset-4">
              Create a free account
            </button>{" "}
            to keep it and sync your deciphered signs.
          </>
        )}
        {xp.status === "error" && "Couldn't save XP this time; your progress is kept in this browser."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
        {!last && (
          <button type="button" onClick={onNextChapter} className="btn-primary py-3 px-8 text-sm justify-center">
            Chapter {chapter.number + 1}: {CHAPTERS[chapter.number].title}
          </button>
        )}
        {last && (
          <button type="button" onClick={onShare} className="btn-primary py-3 px-8 text-sm justify-center">
            {copied ? "Copied!" : "Share your result"}
          </button>
        )}
        <Link href="/lessons/expedition-begins" className="btn-secondary py-3 px-6 text-sm justify-center">
          {last ? "Learn all 25 signs (free lesson)" : "Free lesson"}
        </Link>
      </div>
    </div>
  );
}
