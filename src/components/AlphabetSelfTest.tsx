"use client";

/**
 * The self-test under the alphabet chart: a sign, four sounds, one tap. After five right answers
 * it says how much of the alphabet that is and asks for a free account to learn the rest in
 * Lesson 1; they can also carry on through all 25. A missed sign comes round again at the end.
 * Why: src/lib/sign-quiz.ts.
 *
 * GA4 (exercise "alphabet-test"):
 *   alphabet_test_view — half the card on screen, once per page view
 *   exercise_answer    — each tap (question_type: sound; question: the sign; correct)
 *   exercise_complete  — the fifth right answer (score 5, total = answers given), and again if
 *                        they finish all 25 (score 25)
 *   alphabet_test_cta  — a button on the result (question_type: signup | lesson | continue; score)
 *
 * The order is drawn in the browser after the page has loaded, so the server-rendered chart page
 * stays static; until then the card shows its heading and a quiet line.
 *
 * On the Spanish and French chart pages (src/lib/i18n.ts) it speaks that language and every event above
 * also carries `locale`. Lesson 1 itself is in English, and the buttons say so.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/AuthModal";
import SignQuestion, { type SignQuestionLabels } from "@/components/SignQuestion";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";
import { chartQuestion, shuffled, type ChartSign, type QuizQuestion } from "@/lib/sign-quiz";
import { FREE_LESSON_PATH } from "@/lib/translator-bridge";

const GOAL = 5;

type Strings = {
  heading: string;
  known: (known: number, total: number) => string;
  idle: string;
  allDone: (total: number) => string;
  someDone: (known: number, total: number) => string;
  allDoneBody: string;
  someDoneBody: (left: number) => string;
  openLesson: string;
  startLesson: string;
  again: string;
  keepGoing: (left: number) => string;
  prompt: string;
  next: string;
  reveal: (sign: ChartSign) => string;
  labels?: SignQuestionLabels;
};

const STRINGS: Record<Locale, Strings> = {
  en: {
    heading: "Test yourself",
    known: (k, t) => `${k} of ${t} signs known`,
    idle: "One sign at a time: which sound does it write? Cover the chart first.",
    allDone: (t) => `All ${t} signs. That is the whole alphabet.`,
    someDone: (k, t) => `That is ${k} of the ${t} signs, from memory.`,
    allDoneBody:
      "The next step is reading them inside real words. Lesson 1 does that, starting with your own name on a sealed door. It is free.",
    someDoneBody: (left) =>
      `Lesson 1 teaches the other ${left} by using them: your own name on a sealed door, then real Egyptian words. It is free, and an account keeps your place.`,
    openLesson: "Open Lesson 1",
    startLesson: "Start Lesson 1 free",
    again: "Go round again",
    keepGoing: (left) => `Keep testing: ${left} to go`,
    prompt: "Which sound does this sign write?",
    next: "Next sign",
    reveal: (s) => `${s.glyph} is the ${s.name.toLowerCase()}: ${s.english}.`,
  },
  es: {
    heading: "Ponte a prueba",
    known: (k, t) => `${k} de ${t} signos aprendidos`,
    idle: "Un signo cada vez: ¿qué sonido escribe? Tapa primero la tabla.",
    allDone: (t) => `Los ${t} signos. Es el alfabeto completo.`,
    someDone: (k, t) => `Ya sabes ${k} de los ${t} signos de memoria.`,
    allDoneBody:
      "El siguiente paso es leerlos dentro de palabras reales. La lección 1 lo hace, empezando por tu propio nombre en una puerta sellada. Es gratis y está en inglés.",
    someDoneBody: (left) =>
      `La lección 1 te enseña los ${left} restantes usándolos: tu nombre en una puerta sellada y luego palabras egipcias reales. Es gratis y está en inglés.`,
    openLesson: "Abrir la lección 1 (en inglés)",
    startLesson: "Lección 1 gratis (en inglés)",
    again: "Empezar otra vez",
    keepGoing: (left) => `Seguir: faltan ${left}`,
    prompt: "¿Qué sonido escribe este signo?",
    next: "Siguiente signo",
    reveal: (s) => `${s.glyph} es: ${s.name.toLowerCase()}. Suena ${s.english}.`,
    labels: { right: "¡Bien! ", wrong: "No exactamente. ", answers: "Respuestas", sign: "Signo" },
  },
  fr: {
    heading: "Testez-vous",
    known: (k, t) => `${k} signes sur ${t} connus`,
    idle: "Un signe à la fois : quel son écrit-il ? Cachez d’abord le tableau.",
    allDone: (t) => `Les ${t} signes. C’est tout l’alphabet.`,
    someDone: (k, t) => `Vous connaissez déjà ${k} signes sur ${t}, de mémoire.`,
    allDoneBody:
      "L’étape suivante : les lire dans de vrais mots. La leçon 1 le fait, en commençant par votre propre prénom sur une porte scellée. Elle est gratuite et en anglais.",
    someDoneBody: (left) =>
      `La leçon 1 vous apprend les ${left} autres en les utilisant : votre prénom sur une porte scellée, puis de vrais mots égyptiens. Gratuite, en anglais.`,
    openLesson: "Ouvrir la leçon 1 (en anglais)",
    startLesson: "Leçon 1 gratuite (en anglais)",
    again: "Recommencer",
    keepGoing: (left) => `Continuer : encore ${left}`,
    prompt: "Quel son écrit ce signe ?",
    next: "Signe suivant",
    reveal: (s) => `${s.glyph} : ${s.name.toLowerCase()}. Il se lit ${s.english}.`,
    labels: { right: "Bravo ! ", wrong: "Pas tout à fait. ", answers: "Réponses", sign: "Signe" },
  },
};

type Props = {
  signs: ChartSign[];
  /** Language of the card; the English page leaves it out. */
  locale?: Locale;
};

export default function AlphabetSelfTest({ signs, locale = "en" }: Props) {
  const t = STRINGS[locale];
  // the translated pages tag every event with their language
  const loc = locale === "en" ? {} : { locale };
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const cardRef = useRef<HTMLElement>(null);
  /** Signs still to get right, in the order they will be asked. */
  const [queue, setQueue] = useState<ChartSign[] | null>(null);
  const [turn, setTurn] = useState(0);
  const [known, setKnown] = useState(0);
  const [answers, setAnswers] = useState(0);
  /** The pause after the fifth right answer, and the end of the deck. */
  const [offer, setOffer] = useState(false);
  const [offered, setOffered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  useEffect(() => {
    setQueue(shuffled(signs, Math.random));
  }, [signs]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          trackEvent("alphabet_test_view", { exercise: "alphabet-test", ...loc });
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const current = queue?.[0];
  const question: QuizQuestion | null = useMemo(
    () => (current ? { ...chartQuestion(current, signs, Math.random), reveal: t.reveal(current) } : null),
    // A new draw for each turn, including a missed sign coming round again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, turn],
  );

  const total = signs.length;
  const finished = queue !== null && queue.length === 0;
  const signedIn = status === "authenticated";
  const cta = (type: "signup" | "lesson" | "continue") =>
    trackEvent("alphabet_test_cta", { exercise: "alphabet-test", question_type: type, score: known, ...loc });

  const onAnswer = (correct: boolean) => {
    if (!current) return;
    if (locale === "en") trackExerciseAnswer({ exercise: "alphabet-test", questionType: "sound", question: current.glyph, correct });
    else trackEvent("exercise_answer", { exercise: "alphabet-test", question_type: "sound", question: current.glyph, correct: correct ? 1 : 0, locale });
    const nowKnown = known + (correct ? 1 : 0);
    setAnswers(answers + 1);
    setLastCorrect(correct);
    if (correct) setKnown(nowKnown);
    if (correct && (nowKnown === GOAL || nowKnown === total)) {
      if (locale === "en") trackExerciseComplete({ exercise: "alphabet-test", score: nowKnown, total: answers + 1 });
      else
        trackEvent("exercise_complete", {
          exercise: "alphabet-test",
          score: nowKnown,
          total: answers + 1,
          pct: Math.round((nowKnown / (answers + 1)) * 100),
          locale,
        });
    }
  };

  const onNext = () => {
    if (!queue || !current) return;
    // Right: the sign leaves the deck. Wrong: it goes to the back.
    const rest = queue.slice(1);
    setQueue(lastCorrect ? rest : [...rest, current]);
    setTurn(turn + 1);
    if (lastCorrect && known === GOAL && !offered) {
      setOffer(true);
      setOffered(true);
    }
  };

  const restart = () => {
    setQueue(shuffled(signs, Math.random));
    setKnown(0);
    setAnswers(0);
    setTurn(turn + 1);
    setOffer(false);
  };

  return (
    <section
      ref={cardRef}
      id="test-yourself"
      aria-labelledby="test-heading"
      className="mb-14 scroll-mt-28 border border-gold-600/50 bg-gold-500/10 p-5 md:p-7"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="test-heading" className="font-display text-2xl md:text-3xl font-semibold text-sand-100">
          {t.heading}
        </h2>
        <p className="font-body text-xs text-sand-400" aria-live="polite">
          {t.known(known, total)}
        </p>
      </div>

      {/* One pip per sign, filling as they get them right */}
      <div className="mb-5 flex gap-1" aria-hidden="true">
        {signs.map((s, i) => (
          <span key={s.glyph} className={`h-1.5 flex-1 ${i < known ? "bg-gold-400" : "bg-gold-700/25"}`} />
        ))}
      </div>

      {queue === null ? (
        <p className="font-body text-sm text-sand-400 min-h-[13rem]">
          {t.idle}
        </p>
      ) : offer || finished ? (
        <div className="text-center min-h-[13rem] flex flex-col items-center justify-center">
          <p className="font-display text-2xl md:text-3xl text-sand-100 leading-tight">
            {finished ? t.allDone(total) : t.someDone(known, total)}
          </p>
          <p className="font-body text-sm md:text-base text-sand-300 leading-relaxed mt-3 max-w-xl">
            {finished ? t.allDoneBody : t.someDoneBody(total - known)}
          </p>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row">
            {signedIn ? (
              <Link href={FREE_LESSON_PATH} onClick={() => cta("lesson")} className="btn-primary justify-center px-6 py-3 text-sm">
                {t.openLesson}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  cta("signup");
                  openAuthModal({ next: FREE_LESSON_PATH });
                }}
                className="btn-primary justify-center px-6 py-3 text-sm"
              >
                {t.startLesson}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                cta("continue");
                if (finished) restart();
                else setOffer(false);
              }}
              className="btn-secondary justify-center px-6 py-3 text-sm"
            >
              {finished ? t.again : t.keepGoing(total - known)}
            </button>
          </div>
        </div>
      ) : (
        question && (
          <div className="min-h-[13rem]">
            <SignQuestion
              key={turn}
              question={question}
              prompt={t.prompt}
              nextLabel={t.next}
              labels={t.labels}
              onAnswer={onAnswer}
              onNext={onNext}
            />
          </div>
        )
      )}
    </section>
  );
}
