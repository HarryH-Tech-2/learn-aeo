"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { LessonMeta, Question } from "@/lib/lesson-types";
import type { LiveLesson } from "@/lib/lessons";
import { lessonPath } from "@/lib/lesson-catalog";
import { buildSteps, clampResume, progressFraction, resumeKey, type Step } from "@/lib/lesson-flow";
import { isLessonComplete } from "@/lib/pass-mark";
import { XP_REWARDS } from "@/lib/gamification";
import { trackEvent } from "@/lib/analytics";
import UpgradePanel from "@/components/lesson/UpgradePanel";
import type { OfferData } from "@/components/OfferBanner";
import ConceptCard from "./ConceptCard";
import QuestionCard from "./QuestionCard";
import ExampleDissect from "./ExampleDissect";
import AuditResult, { passMark } from "./AuditResult";
import { BTN_PRIMARY, BTN_SECONDARY, EYEBROW, FOCUS, HEADING, PROSE } from "./ui";
import { claimXp } from "./xp";

export type LessonPlayerProps = {
  lesson: LiveLesson;
  onXP: (xp: number) => void;
  onAuditComplete: (score: number, total: number) => void;
  upgrade: { paid: boolean | null; offer: OfferData | null };
  /** For the outro's "next district" link. */
  next?: LessonMeta;
  /** Default true: save and restore the step in localStorage[resumeKey(id)]. */
  persist?: boolean;
};

const STEP_LABEL: Record<Step["kind"], string> = {
  intro: "Introduction",
  concept: "Concept",
  check: "Quick check",
  exercise: "Exercise",
  example: "Example",
  audit: "Audit",
  outro: "Wrap-up",
};

/** Questions one at a time in practice mode, then `done` once they are all answered. */
function PracticeSet({
  questions,
  onAnswered,
  onFinish,
  done,
}: {
  questions: Question[];
  onAnswered: (q: Question, firstTryRight: boolean) => void;
  onFinish?: (allFirstTry: boolean) => void;
  done: ReactNode;
}) {
  const [at, setAt] = useState(0);
  const clean = useRef(true);
  const q = questions[at];
  if (!q) return <>{done}</>;
  return (
    <div className="space-y-4">
      {questions.length > 1 && (
        <p className="font-sans text-sm text-sand-400">
          Question {at + 1} of {questions.length}
        </p>
      )}
      <QuestionCard
        key={`${at}:${q.id}`}
        question={q}
        mode="practice"
        onAnswered={(right) => {
          onAnswered(q, right);
          if (!right) clean.current = false;
          if (at + 1 >= questions.length) onFinish?.(clean.current);
          setAt(at + 1);
        }}
      />
    </div>
  );
}

/** The final audit: one answer per question, no feedback until the end. */
function AuditRunner({ questions, onFinish }: { questions: Question[]; onFinish: (answers: boolean[]) => void }) {
  const [answers, setAnswers] = useState<boolean[]>([]);
  const q = questions[answers.length];
  if (!q) return null;
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className={EYEBROW}>Final audit</p>
        <h2 className={HEADING}>
          Question {answers.length + 1} of {questions.length}
        </h2>
        {answers.length === 0 && (
          <p className={PROSE}>
            One answer per question, and no feedback until the end. You pass with {passMark(questions.length)} of{" "}
            {questions.length}.
          </p>
        )}
        <p className="font-sans text-sm text-sand-400">Leaving the audit restarts it.</p>
      </header>
      <QuestionCard
        key={`${answers.length}:${q.id}`}
        question={q}
        mode="audit"
        onAnswered={(right) => {
          const next = [...answers, right];
          if (next.length >= questions.length) onFinish(next);
          else setAnswers(next);
        }}
      />
    </div>
  );
}

export default function LessonPlayer({ lesson, onXP, onAuditComplete, upgrade, next, persist = true }: LessonPlayerProps) {
  const content = lesson.content;
  const steps = useMemo(() => buildSteps(content), [content]);
  const auditIndex = steps.findIndex((s) => s.kind === "audit");
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  // with persistence on, saving waits until the saved step has been read back
  const [restored, setRestored] = useState(!persist);
  const [auditAnswers, setAuditAnswers] = useState<boolean[] | null>(null);
  const [auditRun, setAuditRun] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const awarded = useRef(new Set<string>());
  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  /**
   * Claim an XP key once per sitting, paid or not (claimXp), so going Back and
   * answering again earns nothing, and a wrong first try stays unpaid.
   */
  const award = useCallback(
    (key: string, xp: number) => {
      const paid = claimXp(awarded.current, key, xp);
      if (paid <= 0) return;
      setSessionXp((x) => x + paid);
      onXP(paid);
    },
    [onXP],
  );

  useEffect(() => {
    if (!persist) return;
    try {
      const raw = window.localStorage.getItem(resumeKey(lesson.id));
      if (raw !== null) setIndex(clampResume(JSON.parse(raw), steps));
    } catch {
      // storage blocked or a corrupt value: start at the beginning
    }
    setRestored(true);
  }, [persist, lesson.id, steps]);

  useEffect(() => {
    if (!persist || !restored) return;
    try {
      window.localStorage.setItem(resumeKey(lesson.id), JSON.stringify(index));
    } catch {
      // storage unavailable: the lesson still works, it just will not resume
    }
  }, [persist, restored, index, lesson.id]);

  useEffect(() => {
    if (!restored) return;
    trackEvent("lesson_step", { step_kind: steps[index]?.kind });
  }, [restored, index, steps]);

  // Bring the top of the player back into view when a step changes below the fold.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = topRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }, [index, reduceMotion]);

  const step = steps[index] ?? steps[0];

  const goNext = () => {
    if (step.kind === "concept") award(`concept:${step.group}:${step.concept}`, XP_REWARDS.conceptRead);
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  };
  const goBack = () => setIndex((i) => Math.max(i - 1, 0));

  const finishAudit = (answers: boolean[]) => {
    const total = answers.length;
    const score = answers.filter(Boolean).length;
    const passed = isLessonComplete(score, total);
    setAuditAnswers(answers);
    onAuditComplete(score, total);
    trackEvent("lesson_audit_complete", { score, total, passed: passed ? 1 : 0 });
    // the first audit of the sitting earns XP; a retake improves the score, not the XP
    award("audit", score * XP_REWARDS.auditCorrect + (total > 0 && score === total ? XP_REWARDS.perfectAudit : 0));
  };

  const retakeAudit = () => {
    setAuditAnswers(null);
    setAuditRun((r) => r + 1);
    if (auditIndex >= 0) setIndex(auditIndex);
  };

  const canGoNext = step.kind !== "outro" && !(step.kind === "audit" && auditAnswers === null);

  function renderStep(s: Step): ReactNode {
    switch (s.kind) {
      case "intro":
        return (
          <article className="space-y-6">
            <header className="space-y-2">
              <p className={EYEBROW}>
                Lesson {lesson.order} · {lesson.level} · {lesson.minutes} minutes
              </p>
              <h2 className={HEADING}>{lesson.title}</h2>
            </header>
            <p className={`${PROSE} text-lg text-sand-200`}>{content.intro}</p>
            <p className={`${PROSE} text-sm text-sand-400`}>
              {content.groups.length} sets of concepts, each with a quick check, then an exercise, a real-world example
              and a final audit. Your place is saved as you go.
            </p>
          </article>
        );
      case "concept": {
        const group = content.groups[s.group];
        return (
          <ConceptCard
            concept={group.concepts[s.concept]}
            eyebrow={`${group.title} · ${s.concept + 1} of ${group.concepts.length}`}
          />
        );
      }
      case "check": {
        const group = content.groups[s.group];
        return (
          <section className="space-y-6">
            <header className="space-y-2">
              <p className={EYEBROW}>Quick check · {group.title}</p>
              <h2 className={HEADING}>Check what you have just read</h2>
            </header>
            <PracticeSet
              key={`check-${s.group}`}
              questions={group.check}
              onAnswered={(q, right) => award(`q:${q.id}`, right ? XP_REWARDS.checkCorrect : 0)}
              done={<p className={`${PROSE} text-sand-200`}>Check done. Press Next to carry on.</p>}
            />
          </section>
        );
      }
      case "exercise": {
        const x = content.exercise;
        return (
          <section className="space-y-6">
            <header className="space-y-2">
              <p className={EYEBROW}>Exercise</p>
              <h2 className={HEADING}>{x.title}</h2>
              <p className={PROSE}>{x.brief}</p>
            </header>
            <PracticeSet
              key="exercise"
              questions={x.steps}
              onAnswered={(q, right) => award(`q:${q.id}`, right ? XP_REWARDS.exerciseCorrect : 0)}
              onFinish={(clean) => award(`exercise-clean:${x.id}`, clean ? XP_REWARDS.exerciseClean : 0)}
              done={
                <div className="max-w-[68ch] rounded-xl border-l-2 border-cyan-500 bg-cyan-500/5 py-3 pl-4 pr-4">
                  <h3 className="mb-1.5 font-sans text-sm font-semibold text-cyan-400">Debrief</h3>
                  <p className={PROSE}>{x.debrief}</p>
                </div>
              }
            />
          </section>
        );
      }
      case "example":
        return <ExampleDissect example={content.example} />;
      case "audit":
        return auditAnswers ? (
          <AuditResult questions={content.audit} answers={auditAnswers} onRetake={retakeAudit} onContinue={goNext} />
        ) : (
          <AuditRunner key={auditRun} questions={content.audit} onFinish={finishAudit} />
        );
      case "outro":
        return (
          <Outro
            lesson={lesson}
            auditAnswers={auditAnswers}
            xp={sessionXp}
            upgrade={upgrade}
            next={next}
            onRetake={retakeAudit}
          />
        );
    }
  }

  const pct = Math.round(progressFraction(index, steps) * 100);

  return (
    <div ref={topRef} className="mx-auto w-full max-w-3xl scroll-mt-24 font-sans">
      <header className="mb-5 space-y-3">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-sand-400">
          <span className="font-semibold text-cyan-400">{lesson.district}</span>
          <span aria-hidden="true">·</span>
          <span>{STEP_LABEL[step.kind]}</span>
        </p>
        <div
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-1.5 overflow-hidden rounded-full bg-obsidian-lighter"
        >
          <div
            className="h-full rounded-full bg-cyan-500 transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <div className="rounded-2xl border border-sand-500/20 bg-obsidian-light p-5 sm:p-8 md:p-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            {renderStep(step)}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav aria-label="Lesson steps" className="mt-5 flex items-center justify-between gap-3">
        <button type="button" className={BTN_SECONDARY} onClick={goBack} disabled={index === 0}>
          <span aria-hidden="true">←</span>
          Back
        </button>
        <span className="text-sm text-sand-400" aria-live="polite">
          Step {index + 1} of {steps.length}
        </span>
        {step.kind !== "outro" ? (
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={goNext}
            disabled={!canGoNext}
            title={canGoNext ? undefined : "Finish the audit to carry on"}
          >
            Next
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <span className="w-[5.5rem]" aria-hidden="true" />
        )}
      </nav>
    </div>
  );
}

function Outro({
  lesson,
  auditAnswers,
  xp,
  upgrade,
  next,
  onRetake,
}: {
  lesson: LiveLesson;
  auditAnswers: boolean[] | null;
  xp: number;
  upgrade: LessonPlayerProps["upgrade"];
  next?: LessonMeta;
  onRetake: () => void;
}) {
  const total = auditAnswers?.length ?? 0;
  const score = auditAnswers?.filter(Boolean).length ?? 0;
  const passed = auditAnswers !== null && isLessonComplete(score, total);
  const showUpgrade = lesson.isFree && upgrade.paid === false;
  // A free lesson waits for the subscription check rather than flashing a link at someone about to see the pitch.
  const waiting = lesson.isFree && upgrade.paid === null;

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className={EYEBROW}>{lesson.district}</p>
        <h2 className={HEADING}>{passed ? "Lesson complete" : "Nearly there"}</h2>
      </header>

      {auditAnswers && (
        <p className={`${PROSE} text-lg text-sand-200`}>
          {passed
            ? `You passed the audit with ${score} of ${total}.`
            : `You scored ${score} of ${total} on the audit. You need ${passMark(total)} to pass this lesson.`}
        </p>
      )}
      {auditAnswers && !passed && (
        <button type="button" className={BTN_PRIMARY} onClick={onRetake}>
          Retake the audit
        </button>
      )}
      {!auditAnswers && (
        <div className="space-y-3">
          <p className={`${PROSE} text-lg text-sand-200`}>
            You have not taken the audit in this sitting. Take it to finish the lesson.
          </p>
          <button type="button" className={BTN_PRIMARY} onClick={onRetake}>
            Take the audit
          </button>
        </div>
      )}

      <p className={PROSE}>{lesson.content.outro}</p>

      <p className="font-sans text-sm text-sand-300">
        You earned <span className="font-semibold text-gold-400">{xp} XP</span> this sitting.
      </p>

      {showUpgrade ? (
        <UpgradePanel paid={upgrade.paid} offer={upgrade.offer} location="lesson_outro" />
      ) : waiting ? null : next ? (
        next.status === "coming-soon" ? (
          <p className="rounded-xl border border-sand-500/30 bg-obsidian-lighter p-4 font-sans text-sm text-sand-300">
            Next: <span className="font-semibold text-sand-100">{next.district}</span>, {next.title}. Coming soon.
          </p>
        ) : (
          <Link
            href={lessonPath(next.id)}
            className={`inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-sans text-sm font-semibold text-obsidian transition-colors hover:bg-cyan-400 ${FOCUS}`}
          >
            Continue to {next.district}
            <span aria-hidden="true">→</span>
          </Link>
        )
      ) : null}
    </article>
  );
}
