"use client";

/**
 * LessonStage — the lesson flow.
 *
 *   intro → choice point → Field Notes (review of earlier signs, lessons 2+;
 *   "clearing the rubble" after the collapse) → sign cards (group by group,
 *   each with a quick check in the chamber's format) → choice point → the
 *   lesson's signature mechanic → Read it (a real inscription on the 3D wall)
 *   → Site Report → letter home → boss inscription (end of a category)
 *   outro: the sealed-door fragment uncovered (+ Practice in 3D)
 *
 *   Second pass (?pass=2, once cleared): intro → a harder, different
 *   inscription → outro with the seal.
 *
 * Lesson 1 is taken in three sections (src/lib/content/lesson-sections.ts):
 * a section ends on a quick check, saves the learner's place in the
 * expedition state and shows the upgrade screen; the intro offers to pick
 * up at the next section on return.
 *
 * Each chamber has a narrator and a shape (src/lib/expedition.ts
 * LESSON_SHAPES): object-first cards in the courtyard, listen-and-pick in
 * the chapel, a timer in the treasury and the hall, silence in the sanctum.
 */

import { Fragment, useState, useMemo, useEffect, useRef, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Lesson, Hieroglyph } from "@/lib/lessons";
import { getLessonGlyphs } from "@/lib/lessons";
import { generateSiteReport } from "@/lib/exercises";
import { XP_REWARDS } from "@/lib/gamification";
import { modelForGlyph } from "@/lib/objects";
import { getLessonMechanic, getLessonReading, type LessonMechanic } from "@/lib/content/lesson-extras";
import { primeSpeech, speak, speechSupported, toSpeakable } from "@/lib/speech";
import { trackEvent, trackExerciseComplete } from "@/lib/analytics";
import { useAuthModal } from "@/components/AuthModal";
import MiniExercise from "@/components/exercises/MiniExercise";
import SiteReport from "@/components/exercises/SiteReport";
import WallReader from "@/components/exercises/WallReader";
import { TextWithTooltips } from "@/components/LinguisticTooltip";
import type { MechanicProps } from "@/components/mechanics/types";
import ChoicePoint from "@/components/lesson/ChoicePoint";
import LetterHome from "@/components/lesson/LetterHome";
import BossReading from "@/components/lesson/BossReading";
import NameGate from "@/components/lesson/NameGate";
import DoorReveal from "@/components/lesson/DoorReveal";
import { doorForName, type DoorName } from "@/lib/content/door-name";
import { doorLessonGroups, knownBefore, type WordGroup } from "@/lib/content/uniliteral-words";
import WordCard from "@/components/lesson/WordCard";
import TorchRun from "@/components/lesson/TorchRun";
import UpgradePanel, { type UpgradeInfo } from "@/components/lesson/UpgradePanel";
import ScribeLadder from "@/components/lesson/ScribeLadder";
import { firstGroupOfSection, resumableSection, sectionEndingAtGroup, sectionOfGroup, sectionPlan } from "@/lib/content/lesson-sections";
import {
  bossAfterLesson,
  choicesForLesson,
  fragmentForLesson,
  lessonShape,
  letterForLesson,
  narratorFor,
  SECOND_PASS,
  withBoss,
  withChoice,
  withLetter,
  withSeal,
  withSection,
  type ExpeditionState,
} from "@/lib/expedition";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', serif";

// 3D object viewer for signs we have a Meshy model of — lazy so lesson pages stay light.
const SignStage = dynamic(() => import("@/components/three/SignStage"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square sm:aspect-[4/3] border border-gold-700/20 bg-obsidian-light/40 flex items-center justify-center">
      <p className="font-body text-sm text-sand-500 animate-pulse font-semibold">Carving…</p>
    </div>
  ),
});

const mechanicLoading = () => (
  <div className="lesson-sheet p-10 flex items-center justify-center">
    <p className="font-body text-sm text-sand-500 animate-pulse font-semibold">Preparing the work…</p>
  </div>
);

const MECHANICS: Record<LessonMechanic, ComponentType<MechanicProps>> = {
  "spell-it": dynamic(() => import("@/components/mechanics/SpellIt"), { ssr: false, loading: mechanicLoading }),
  "field-sketchbook": dynamic(() => import("@/components/mechanics/FieldSketchbook"), { ssr: false, loading: mechanicLoading }),
  "pick-the-ending": dynamic(() => import("@/components/mechanics/PickTheEnding"), { ssr: false, loading: mechanicLoading }),
  "counting-house": dynamic(() => import("@/components/mechanics/CountingHouse"), { ssr: false, loading: mechanicLoading }),
  "cartouche-reader": dynamic(() => import("@/components/mechanics/CartoucheReader"), { ssr: false, loading: mechanicLoading }),
  "stela-builder": dynamic(() => import("@/components/mechanics/StelaBuilder"), { ssr: false, loading: mechanicLoading }),
  "walk-the-hall": dynamic(() => import("@/components/mechanics/WalkTheHall"), { ssr: false, loading: mechanicLoading }),
  "word-anatomy": dynamic(() => import("@/components/mechanics/WordAnatomy"), { ssr: false, loading: mechanicLoading }),
};

const MECHANIC_TITLE: Record<LessonMechanic, { title: string; blurb: string }> = {
  "spell-it": { title: "Spell It", blurb: "Sound to sign, and sign back to sound: the alphabet in both directions." },
  "field-sketchbook": { title: "Field Sketchbook", blurb: "Object first, sign second: see what the scribes saw." },
  "pick-the-ending": { title: "Pick the Ending", blurb: "The silent sign decides the meaning. You decide the silent sign." },
  "counting-house": { title: "Counting House", blurb: "Count the goods in the storeroom and write the tally like a scribe." },
  "cartouche-reader": { title: "Cartouche Reader", blurb: "Real royal names. Read them in the order they are read, not written." },
  "stela-builder": { title: "Stela Builder", blurb: "Assemble the offering formula block by block." },
  "walk-the-hall": { title: "Walk the Hall", blurb: "The same epithet on both jambs of a door. Read it each way." },
  "word-anatomy": { title: "Word Anatomy", blurb: "Take a word apart by the job each sign does, then build one yourself." },
};

// ─── Stage types ───

type Stage =
  | { type: "intro" }
  | { type: "choice"; at: "after-intro" | "before-mechanic" }
  | { type: "name" }
  | { type: "door" }
  | { type: "word"; groupIndex: number; wordIndex: number }
  | { type: "review" }
  | { type: "glyph-group"; groupIndex: number; glyphIndex: number }
  | { type: "mini-exercise"; groupIndex: number }
  | { type: "section-break"; section: number; nextGroup: number }
  /** Read by torchlight at the end of a part; nextGroup -1 = the lesson's last part (then the boss or the outro) */
  | { type: "torch"; section: number; nextGroup: number }
  | { type: "door-offer" }
  | { type: "guest-gate" }
  | { type: "mechanic" }
  | { type: "reading" }
  | { type: "site-report" }
  | { type: "letter" }
  | { type: "boss" }
  | { type: "second-pass" }
  | { type: "narrative-outro" };

/** The analytics name of a step on Lesson 1's door run (lesson_step / lesson_leave). Group 0 is the door's own signs. */
function stepOf(stage: Stage): string | null {
  switch (stage.type) {
    case "mini-exercise":
      return stage.groupIndex === 0 ? "door_check" : `check_${stage.groupIndex}`;
    case "word":
      return `w${stage.groupIndex}.${stage.wordIndex + 1}`;
    case "section-break":
      return `part_${stage.section}_done`;
    case "torch":
      return `torch_${stage.section}`;
    case "door-offer":
      return "door_offer";
    case "guest-gate":
      return "signup_gate";
    case "choice":
      return `choice_${stage.at}`;
    default:
      return stage.type;
  }
}

type Props = {
  lesson: Lesson & { review?: Hieroglyph[] };
  onXPEarned: (xp: number) => void;
  onReportComplete: (score: number, total: number) => void;
  /** Not signed in: the first sign group is open, then a sign-in wall. */
  guest?: boolean;
  /** Expedition state (choices, torches, letters, seals, bosses) and its updater */
  expedition: ExpeditionState;
  onExpedition: (fn: (s: ExpeditionState) => ExpeditionState) => void;
  /** 2 = second pass: a harder inscription for a gold seal (only once cleared) */
  pass?: 1 | 2;
  /** What the upgrade screen shows at section ends and on the free lesson's outro */
  upgrade?: UpgradeInfo;
  /** A section (1-based) of a sectioned lesson was just finished */
  onSectionComplete?: (section: number) => void;
  /** The account's XP when the page opened (ready: false while it is fetched) and what this sitting has earned */
  xp?: { base: number; session: number; ready: boolean };
  /** The saved expedition state has loaded (this browser's copy at least): a ?part= link can rebuild the learner's door */
  placeReady?: boolean;
};

/** Signs the visitor arrived with (from the name translator: ?signs=𓄿𓅓…). */
function signsFromQuery(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = new URLSearchParams(window.location.search).get("signs");
  return new Set(raw ? [...raw] : []);
}

/** The name the visitor arrived with (?name=, from the translator page). */
function nameFromQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("name") ?? "";
}

/** Development aid: /lessons/<id>?stage=review|mechanic|reading|report jumps straight to that stage. Ignored in production. */
function initialStage(): Stage {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return { type: "intro" };
  const s = new URLSearchParams(window.location.search).get("stage");
  if (s === "review") return { type: "review" };
  if (s === "cards") return { type: "glyph-group", groupIndex: 0, glyphIndex: 0 };
  if (s === "mechanic") return { type: "mechanic" };
  if (s === "reading") return { type: "reading" };
  if (s === "report") return { type: "site-report" };
  if (s === "outro") return { type: "narrative-outro" };
  if (s === "choice") return { type: "choice", at: "after-intro" };
  if (s === "letter") return { type: "letter" };
  if (s === "boss") return { type: "boss" };
  if (s === "pass2") return { type: "second-pass" };
  return { type: "intro" };
}

export default function LessonStage({ lesson, onXPEarned, onReportComplete, guest = false, expedition, onExpedition, pass = 1, upgrade, onSectionComplete, xp, placeReady = true }: Props) {
  const { openAuthModal } = useAuthModal();
  const [stage, setStage] = useState<Stage>(initialStage);
  const shape = lessonShape(lesson.id);
  const narrator = narratorFor(lesson.id);
  const choices = choicesForLesson(lesson.id);
  const letter = letterForLesson(lesson.id);
  const boss = bossAfterLesson(lesson.id);
  const fragment = fragmentForLesson(lesson.id);
  const secondPass = SECOND_PASS[lesson.id];
  const [secondPassResult, setSecondPassResult] = useState<{ mistakes: number } | null>(null);
  const [bossClean, setBossClean] = useState<boolean | null>(null);
  const [nameSigns, setNameSigns] = useState<Set<string>>(() => new Set());
  useEffect(() => setNameSigns(signsFromQuery()), []);
  // the recorded "Hear it" clips: their list is fetched now, so the first tap plays at once
  useEffect(() => primeSpeech(), []);
  // Lesson 1 opens on a sealed door carrying the learner's name; those signs become the first group.
  const hasDoor = lesson.id === "expedition-begins" && pass === 1;
  const [door, setDoor] = useState<DoorName | null>(null);
  // What the learner typed at the door ("" = Khufu's door): saved with their place so the same door is rebuilt on return.
  const [doorInput, setDoorInput] = useState("");
  // Signs brushed clear on the door so far: they light up on the progress bar one by one.
  const [doorUncovered, setDoorUncovered] = useState<Set<string>>(() => new Set());
  // Sections only exist on the door run of a sectioned lesson (not the second pass).
  const plan = hasDoor ? sectionPlan(lesson.id) : null;
  const savedPlace = plan ? expedition.sections?.[lesson.id] : undefined;
  const resumeAt = plan ? resumableSection(lesson.id, savedPlace?.done) : null;
  const { data: session } = useSession();
  const [queryName, setQueryName] = useState("");
  useEffect(() => setQueryName(nameFromQuery()), []);
  // Straight into a part, not the intro: ?part=2|3 (the dashboard's part cards), or ?at=words&name= (back from
  // signing up after the door: the name rides in the link, so it works from an email opened in another browser).
  const enteredFromQuery = useRef(false);
  useEffect(() => {
    if (enteredFromQuery.current || guest || !plan || !placeReady || stage.type !== "intro") return;
    const q = new URLSearchParams(window.location.search);
    const part = Number(q.get("part"));
    if (q.get("at") === "words") {
      enteredFromQuery.current = true;
      buildDoor(q.get("name") ?? savedPlace?.name ?? "");
      trackEvent("lesson_signup_return", { lesson_id: lesson.id });
      setStage({ type: "door-offer" });
    } else if (part >= 2 && part <= plan.sections.length) {
      enteredFromQuery.current = true;
      handleResume(part);
    } else return;
    window.history.replaceState({}, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest, placeReady]);
  // A fresh start on the door lesson opens on the name box: no intro screen, no reading-direction question
  // (2026-10-24: 3 of 14 new accounts left before reaching the name). A saved place still gets the intro's resume card.
  useEffect(() => {
    if (!hasDoor || !placeReady || enteredFromQuery.current) return;
    // (the account's saved place can arrive after this browser's copy: back to the resume card if it does)
    if (resumeAt && stage.type === "name" && !door) setStage({ type: "intro" });
    if (stage.type !== "intro" || resumeAt) return;
    if (new URLSearchParams(window.location.search).has("part")) return;
    setStage({ type: "name" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeReady, resumeAt]);
  const [showMeaning, setShowMeaning] = useState(false);
  const [show3D, setShow3D] = useState(!!shape.objectFirst);
  const [mechanicDone, setMechanicDone] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  useEffect(() => setCanSpeak(speechSupported()), []);

  useEffect(() => {
    if (guest && stage.type === "mini-exercise") {
      trackEvent("signup_wall_shown", { location: "lesson_quick_check" });
    }
  }, [guest, stage]);

  // Where learners stop on the door run: lesson_step once per step per visit, and lesson_leave with the last
  // step when the page closes (GA4 dimension "step"). Steps: name, door, door_check, door_offer, signup_gate,
  // w<set>.<word>, check_<set>, part_<n>_done, then the later stages by name.
  const lastStep = useRef<string | null>(null);
  const stepsSent = useRef(new Set<string>());
  useEffect(() => {
    if (!hasDoor) return;
    const step = stepOf(stage);
    if (!step) return;
    lastStep.current = step;
    if (stepsSent.current.has(step)) return;
    stepsSent.current.add(step);
    trackEvent("lesson_step", { lesson_id: lesson.id, step });
  }, [stage, hasDoor, lesson.id]);
  useEffect(() => {
    if (!hasDoor) return;
    const leaving = () => {
      const step = lastStep.current;
      if (step && step !== "narrative-outro") trackEvent("lesson_leave", { lesson_id: lesson.id, step });
    };
    // (gtag sends by beacon, so an event raised as the page goes still arrives)
    window.addEventListener("pagehide", leaving);
    return () => window.removeEventListener("pagehide", leaving);
  }, [hasDoor, lesson.id]);

  const allGlyphs = useMemo(() => getLessonGlyphs(lesson), [lesson]);
  // With the door: group 0 is the name's signs, then sets of real words that
  // introduce the rest of the alphabet. Without it: the lesson's own groups.
  const doorGroups = useMemo(() => (door ? doorLessonGroups(door.signs, allGlyphs, lesson.glyphGroups[0]?.contextImage ?? "") : null), [door, allGlyphs, lesson.glyphGroups]);
  const groups = doorGroups ? doorGroups.groups : lesson.glyphGroups;
  const wordGroups: WordGroup[] = doorGroups ? doorGroups.wordGroups : [];
  const glyphBySymbol = useMemo(() => new Map(allGlyphs.map((g) => [g.symbol, g])), [allGlyphs]);
  const reviewGlyphs = lesson.review ?? [];
  const mechanic = getLessonMechanic(lesson.id);
  const reading = getLessonReading(lesson.id);
  const siteReportQuestions = useMemo(() => generateSiteReport(allGlyphs, lesson.exerciseConfig), [allGlyphs, lesson.exerciseConfig]);

  // ─── Stage transitions ───

  function choiceAt(at: "after-intro" | "before-mechanic") {
    return choices.find((c) => c.at === at);
  }

  function handleBeginExcavation() {
    if (pass === 2 && secondPass) {
      setStage({ type: "second-pass" });
      return;
    }
    // (the door lesson goes straight to the name: its reading-direction question was cut 2026-10-24)
    if (!hasDoor && choiceAt("after-intro")) setStage({ type: "choice", at: "after-intro" });
    else afterFirstChoice();
  }
  function afterFirstChoice() {
    if (hasDoor) setStage({ type: "name" });
    else if (reviewGlyphs.length >= 3) setStage({ type: "review" });
    else startGlyphs();
  }
  function handleNameSubmit(name: string) {
    const d = doorForName(name, allGlyphs);
    setDoor(d);
    setDoorInput(name);
    setNameSigns(new Set(d.signs.map((g) => g.symbol)));
    setDoorUncovered(new Set());
    trackEvent("door_name_set", { own_name: name.length > 0, signs: d.cells.length });
    setStage({ type: "door" });
  }
  /** Back after a break: rebuild the same door from the saved name and open the lesson at the next section. */
  /** Rebuild the door from a name (the same door the learner opened: the word sets depend on its signs). */
  function buildDoor(name: string) {
    const d = doorForName(name, allGlyphs);
    setDoor(d);
    setDoorInput(name);
    setNameSigns(new Set(d.signs.map((g) => g.symbol)));
    setShowMeaning(false);
  }
  function handleResume(section: number) {
    buildDoor(savedPlace?.name ?? "");
    trackEvent("lesson_section_resume", { lesson_id: lesson.id, section });
    setStage({ type: "word", groupIndex: firstGroupOfSection(lesson.id, section), wordIndex: 0 });
  }
  function handleDoorOpen() {
    // The door taught the name's signs; the quick check on them is group 1.
    setStage({ type: "mini-exercise", groupIndex: 0 });
  }
  function startGlyphs() {
    if (groups.length > 0) setStage({ type: "glyph-group", groupIndex: 0, glyphIndex: 0 });
    else afterGlyphs();
  }
  function afterGlyphs() {
    if (choiceAt("before-mechanic")) setStage({ type: "choice", at: "before-mechanic" });
    else afterSecondChoice();
  }
  function afterSecondChoice() {
    if (mechanic) setStage({ type: "mechanic" });
    else if (reading) setStage({ type: "reading" });
    else setStage({ type: "site-report" });
  }
  function afterSiteReport() {
    if (letter) setStage({ type: "letter" });
    else afterLetter();
  }
  function afterLetter() {
    // the door lesson's last part closes on a torch run over every word, like the parts before it
    if (plan && door && torchWords(plan.sections.length, -1).words.length >= 2) setStage({ type: "torch", section: plan.sections.length, nextGroup: -1 });
    else afterTorch();
  }
  /** The words a torch run asks about (the part's own; every word for the last part) and every word met by then, for wrong choices. */
  function torchWords(section: number, nextGroup: number) {
    // group g of the door run is word set g - 1
    const last = nextGroup < 0 ? wordGroups.length : nextGroup - 1;
    const first = nextGroup < 0 ? 1 : Math.max(1, firstGroupOfSection(lesson.id, section));
    return {
      words: wordGroups.slice(first - 1, last).flatMap((g) => g.words),
      known: wordGroups.slice(0, last).flatMap((g) => g.words),
    };
  }
  function afterTorch() {
    if (stage.type === "torch" && stage.nextGroup >= 0) {
      setStage({ type: "section-break", section: stage.section, nextGroup: stage.nextGroup });
      return;
    }
    if (boss && !expedition.bosses[boss.category]?.clean) setStage({ type: "boss" });
    else setStage({ type: "narrative-outro" });
  }
  function afterMechanic() {
    if (reading) setStage({ type: "reading" });
    else setStage({ type: "site-report" });
  }

  function handleGlyphNext(groupIndex: number, glyphIndex: number) {
    const group = groups[groupIndex];
    onXPEarned(XP_REWARDS.glyphStudy);
    setShow3D(!!shape.objectFirst);
    if (glyphIndex + 1 < group.glyphs.length) {
      setShowMeaning(false);
      setStage({ type: "glyph-group", groupIndex, glyphIndex: glyphIndex + 1 });
    } else {
      setStage({ type: "mini-exercise", groupIndex });
    }
  }

  /** Guests get the first sign group free of charge, then we ask them to sign in. */
  function renderGuestWall(groupIndex: number) {
    const learned = groups.slice(0, groupIndex + 1).reduce((n, g) => n + g.glyphs.length, 0);
    const returnTo = typeof window !== "undefined" ? window.location.pathname + window.location.search : `/lessons/${lesson.id}`;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lesson-sheet p-8 md:p-12 text-center">
        <div className="flex justify-center gap-2 mb-6" style={{ fontFamily: GLYPH_FONT }}>
          {groups[groupIndex].glyphs.map((g) => (
            <span key={g.symbol} className="text-3xl md:text-4xl text-gold-400">{g.symbol}</span>
          ))}
        </div>
        <p className="font-body text-sm text-gold-500 mb-3 font-semibold">{learned} of {allGlyphs.length} signs met</p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-4">
          Keep these <span className="text-gradient-gold font-medium">{learned} signs</span>
        </h2>
        <p className="font-body text-sand-300 font-light max-w-xl mx-auto mb-8 leading-relaxed">
          The quick check, your XP and the rest of this lesson need somewhere to live. A free account takes ten seconds
          with Google or a magic link, and you come straight back here with these signs already counted.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              trackEvent("signup_wall_click", { location: "lesson_quick_check" });
              openAuthModal({ next: returnTo });
            }}
            className="lesson-btn text-sm py-3.5 px-8 justify-center"
          >
            Sign in free &amp; continue
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMeaning(false);
              setStage({ type: "glyph-group", groupIndex, glyphIndex: 0 });
            }}
            className="lesson-btn-quiet text-sm py-3.5 px-8 justify-center"
          >
            Review the signs again
          </button>
        </div>
        <p className="font-body text-xs text-sand-500 mt-6">The full first lesson stays free. Lifetime access to all eight is one payment, later, if you want it.</p>
      </motion.div>
    );
  }

  function handleGlyphPrev(groupIndex: number, glyphIndex: number) {
    if (glyphIndex > 0) {
      setShowMeaning(false);
      setShow3D(!!shape.objectFirst);
      setStage({ type: "glyph-group", groupIndex, glyphIndex: glyphIndex - 1 });
    }
  }

  /** Guests take the door and its quick check; the account is asked for before the words. */
  function guestMayTake(groupIndex: number): boolean {
    return !!plan && !!door && groupIndex === 0;
  }
  /** The sign-up modal after the door. It cannot be closed: the words need an account. Signing up comes back to the first word. */
  function openWordsSignUp() {
    // (percent-encoded throughout: the modal only honours a return path of [\w-./?=&%], so no "+" for a space, no apostrophes)
    const name = encodeURIComponent(doorInput).replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    openAuthModal({
      next: `/lessons/${lesson.id}?at=words${doorInput ? `&name=${name}` : ""}`,
      dismissible: false,
      intro: `Create a free account to keep ${door?.name ? `${door.name}’s door` : "your door"} and the signs on it, and go straight on to your first words. Ten seconds with Google or a magic link.`,
    });
  }

  function handleMiniExerciseComplete(groupIndex: number) {
    if (guest && guestMayTake(groupIndex)) {
      trackEvent("signup_wall_shown", { location: "lesson_after_door" });
      openWordsSignUp();
      setStage({ type: "guest-gate" });
      return;
    }
    // The door is open: the price, once, before the first words (2026-10-24: 10 of 14 new accounts quit inside part 1, before any price)
    if (plan && door && groupIndex === 0) {
      setStage({ type: "door-offer" });
      return;
    }
    const ended = plan && door ? sectionEndingAtGroup(lesson.id, groupIndex) : null;
    if (ended && groupIndex + 1 < groups.length) {
      onExpedition((s) => withSection(s, lesson.id, ended, doorInput));
      trackEvent("lesson_section_complete", { lesson_id: lesson.id, section: ended });
      onSectionComplete?.(ended);
      setStage(torchWords(ended, groupIndex + 1).words.length >= 2 ? { type: "torch", section: ended, nextGroup: groupIndex + 1 } : { type: "section-break", section: ended, nextGroup: groupIndex + 1 });
      return;
    }
    continueAfterGroup(groupIndex);
  }

  function continueAfterGroup(groupIndex: number) {
    if (groupIndex + 1 < groups.length) {
      setShowMeaning(false);
      // Word sets live at groups[1..] when the lesson opened on the door.
      if (door && wordGroups[groupIndex]) setStage({ type: "word", groupIndex: groupIndex + 1, wordIndex: 0 });
      else setStage({ type: "glyph-group", groupIndex: groupIndex + 1, glyphIndex: 0 });
    } else {
      afterGlyphs();
    }
  }

  /** Word sets: groups[g] ↔ wordGroups[g - 1]. */
  function handleWordNext(groupIndex: number, wordIndex: number) {
    const wg = wordGroups[groupIndex - 1];
    if (!wg) return;
    onXPEarned(XP_REWARDS.glyphStudy);
    if (wordIndex + 1 < wg.words.length) {
      setStage({ type: "word", groupIndex, wordIndex: wordIndex + 1 });
    } else if (groups[groupIndex].glyphs.length > 0) {
      setStage({ type: "mini-exercise", groupIndex });
    } else {
      // Every sign in this set was already known (a long name): no check needed.
      handleMiniExerciseComplete(groupIndex);
    }
  }

  function renderWord(groupIndex: number, wordIndex: number) {
    const wg = wordGroups[groupIndex - 1];
    if (!wg || !door) return null;
    const word = wg.words[wordIndex];
    const doorSymbols = door.signs.map((g) => g.symbol);
    const known = knownBefore(doorSymbols, wordGroups, groupIndex - 1, wordIndex);
    const met = new Set(known);
    word.core.forEach((s) => met.add(s));
    return (
      <WordCard
        word={word}
        known={known}
        bySymbol={glyphBySymbol}
        wordIndex={wordIndex}
        wordCount={wg.words.length}
        groupIndex={groupIndex}
        groupCount={wordGroups.length}
        groupWords={wg.words}
        signsMet={[...met].filter((s) => glyphBySymbol.has(s)).length}
        signsTotal={allGlyphs.length}
        canSpeak={canSpeak}
        onJump={(i) => setStage({ type: "word", groupIndex, wordIndex: i })}
        onPrev={() => wordIndex > 0 && setStage({ type: "word", groupIndex, wordIndex: wordIndex - 1 })}
        onNext={() => handleWordNext(groupIndex, wordIndex)}
      />
    );
  }

  function handleSiteReportComplete(score: number, total: number) {
    onXPEarned(score * XP_REWARDS.siteReportCorrect);
    if (score === total) onXPEarned(XP_REWARDS.perfectReport);
    onReportComplete(score, total);
    if (plan) onExpedition((s) => withSection(s, lesson.id, plan.sections.length, doorInput));
    afterSiteReport();
  }

  // ─── Render helpers ───

  function renderIntro() {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto">
        <div className="relative w-full aspect-[21/9] mb-8 overflow-hidden rounded-2xl border border-gold-600/30 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.75)]">
          <img src={lesson.sceneImage} alt={`${lesson.areaName}: the setting of the lesson ${lesson.title}, an illustrated Egyptian excavation scene`} className="w-full h-full object-cover" />
          {lesson.areaName !== lesson.title && (
            <>
              {/* (a fixed dark fade: the page colour would wash the picture milky in the light theme) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <p className="absolute bottom-4 left-6 font-body text-sm text-[#f5d890] font-semibold tracking-wide [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">{lesson.areaName}</p>
            </>
          )}
        </div>

        <div className="lesson-sheet p-8 md:p-10 mb-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="font-body text-sm text-sand-600 font-semibold">Field Journal</p>
            <p className="font-body text-sm text-gold-500 font-semibold">{pass === 2 ? "Second pass" : shape.shape}</p>
          </div>
          {pass === 2 && secondPass ? (
            <p className="font-body text-base text-sand-300 leading-relaxed italic">
              You have cleared this chamber once. {narrator.name} hands you the lamp and points at a line you did not read the first time: {secondPass.title.toLowerCase()}. No cards, no notes. Read it without a wrong tap and the chamber's relic is polished gold.
            </p>
          ) : (
            <p className="font-body text-base text-sand-300 leading-relaxed italic">
              <TextWithTooltips text={lesson.narrativeIntro} />
            </p>
          )}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gold-700/15">
            <span className="text-2xl text-gold-400" style={{ fontFamily: GLYPH_FONT }} aria-hidden="true">
              {narrator.glyph}
            </span>
            <div>
              <p className="font-body text-sm text-sand-100">{narrator.name}</p>
              <p className="font-body text-xs text-sand-500">
                {narrator.role} · {narrator.voice}
              </p>
            </div>
            <p className="ml-auto font-body text-xs text-sand-500" aria-label={`${expedition.torches} lamps`}>
              <span className="text-gold-400">🔥</span> {expedition.torches}
            </p>
          </div>
        </div>

        {plan && resumeAt ? (
          <div className="lesson-sheet p-6 md:p-8 max-w-3xl mx-auto text-center border border-gold-500/30">
            <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
              Next lesson · part {resumeAt} of {plan.sections.length}
            </p>
            <h3 className="font-display text-2xl text-sand-100 font-light mb-2">
              Welcome back{savedPlace?.name ? `, ${savedPlace.name}` : ""}. Part {resumeAt}: {plan.sections[resumeAt - 1].title}
            </h3>
            <p className="font-body text-sm text-sand-400 mb-6">{plan.sections[resumeAt - 1].blurb} About ten minutes.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button type="button" onClick={() => handleResume(resumeAt)} className="lesson-btn py-4 px-10 text-sm justify-center">
                Start part {resumeAt}
              </button>
              <button type="button" onClick={handleBeginExcavation} className="lesson-btn-quiet py-4 px-8 text-sm justify-center">
                Start again from the door
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button onClick={handleBeginExcavation} className="lesson-btn py-4 px-10 text-sm">
              {pass === 2 ? "Raise the lamp" : "Begin Excavation"}
            </button>
            {plan && (
              <p className="font-body text-xs text-sand-500 mt-4">
                Part 1 of {plan.sections.length}: {plan.sections[0].title.toLowerCase()}. About ten minutes.
              </p>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  function renderReview() {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <p className="font-body text-sm text-gold-500 mb-2 font-semibold">{shape.rubble ? "The collapse" : "Field Notes"}</p>
          <h2 className="font-display text-2xl text-sand-100 font-light">
            {shape.rubble ? "Clearing the rubble: the old walls on the way round" : "Before you dig: signs from earlier chambers"}
          </h2>
          <p className="font-body text-sm text-sand-400 mt-2">
            {shape.rubble
              ? `The passage roof is down. Going round by the courtyard means re-reading ${reviewGlyphs.length} signs from earlier chambers. Saleh says it is quicker than digging.`
              : `A minute of review is worth an hour of re-learning. ${reviewGlyphs.length} quick questions.`}
          </p>
        </div>
        <MiniExercise
          glyphs={reviewGlyphs}
          title={shape.rubble ? "Rubble" : "Field Notes"}
          exercise="field-notes"
          onComplete={(correct) => {
            onXPEarned(correct * XP_REWARDS.reviewCorrect);
            setTimeout(startGlyphs, 1200);
          }}
        />
        <div className="text-center mt-4">
          <button type="button" onClick={startGlyphs} className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4">
            Skip review
          </button>
        </div>
      </motion.div>
    );
  }

  function renderGlyphGroup(groupIndex: number, glyphIndex: number) {
    const group = groups[groupIndex];
    const glyph = group.glyphs[glyphIndex];
    const totalGlyphsSoFar = groups.slice(0, groupIndex).reduce((acc, g) => acc + g.glyphs.length, 0) + glyphIndex + 1;
    const totalGlyphs = allGlyphs.length;
    const model3d = modelForGlyph(glyph.symbol);
    const showing3D = show3D && !!model3d;

    const goTo = (i: number) => {
      setShowMeaning(false);
      setShow3D(!!shape.objectFirst);
      setStage({ type: "glyph-group", groupIndex, glyphIndex: i });
    };
    const notes = [
      { label: "Where it comes from", text: glyph.history },
      { label: "What it meant to them", text: glyph.culture },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lesson-sheet p-5 sm:p-8">
        {/* The group's signs, and how far through the lesson this one is */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-3">
          <p className="lesson-label">
            Signs {groupIndex + 1} of {groups.length}
          </p>
          <div className="flex gap-1.5" role="list" aria-label="Signs in this group">
            {group.glyphs.map((g, i) => (
              <button
                key={i}
                type="button"
                role="listitem"
                onClick={() => goTo(i)}
                aria-current={glyphIndex === i ? "step" : undefined}
                aria-label={`${g.transliteration}${nameSigns.has(g.symbol) ? ", in your name" : ""}`}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
 glyphIndex === i ? "bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/50" : "text-gold-600/60 hover:text-gold-400 hover:bg-gold-500/5"
 }`}
                style={{ fontFamily: GLYPH_FONT }}
              >
                {g.symbol}
                {nameSigns.has(g.symbol) && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-gold-500" aria-hidden="true" />}
              </button>
            ))}
          </div>
          <p className="ml-auto font-body text-xs text-sand-500">
            {totalGlyphsSoFar} of {totalGlyphs} signs
          </p>
        </div>
        <div className="lesson-track mb-6 sm:mb-8" aria-hidden="true">
          <motion.div animate={{ width: `${(totalGlyphsSoFar / totalGlyphs) * 100}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
        </div>

        <div className="grid gap-6 md:gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start">
          {/* The sign itself, gold on lapis, or the object it depicts, in 3D */}
          <div className="lesson-inlay p-6 sm:p-8 md:sticky md:top-24">
            <div className="flex items-center justify-center min-h-[13rem] sm:min-h-[16rem]">
              {showing3D && model3d ? (
                <motion.div key={`model-${groupIndex}-${glyphIndex}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full">
                  <SignStage model={model3d.model} variant="compact" stageKey={`lesson-${groupIndex}-${glyphIndex}`} />
                  <p className="font-body text-xs text-sand-400 mt-2 text-center">
                    The {model3d.name.toLowerCase()} that <span className="lesson-inlay-glyph">{glyph.symbol}</span> pictures. Drag to turn it.
                  </p>
                </motion.div>
              ) : (
                <motion.span
                  key={`symbol-${groupIndex}-${glyphIndex}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="lesson-inlay-glyph text-[8rem] sm:text-[10rem]"
                  aria-label={`The sign ${glyph.transliteration}`}
                >
                  {glyph.symbol}
                </motion.span>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gold-400/20 text-center">
              <p className="font-display text-3xl text-gold-300 italic">
                <TextWithTooltips text={glyph.transliteration} />
              </p>
              <p className="font-body text-sm text-sand-300 mt-1">
                said <TextWithTooltips text={glyph.pronunciation} />
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {canSpeak && (
                  <button
                    type="button"
                    onClick={() => speak(toSpeakable(glyph.pronunciation))}
                    className="font-body text-sm text-sand-100 rounded-full bg-gold-400/15 hover:bg-gold-400/25 ring-1 ring-gold-400/40 px-4 py-1.5 transition-colors"
                    title={`Hear: ${glyph.pronunciation}`}
                  >
                    ▶ Hear it
                  </button>
                )}
                {model3d && (
                  <button
                    type="button"
                    onClick={() => setShow3D((v) => !v)}
                    className="font-body text-sm text-sand-200 rounded-full hover:bg-gold-400/10 ring-1 ring-gold-400/25 px-4 py-1.5 transition-colors"
                  >
                    {showing3D ? "Show the sign" : "See the object in 3D"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* What to know about it */}
          <motion.div key={`info-${groupIndex}-${glyphIndex}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-6">
            <div>
              <p className="lesson-label mb-1.5">What it pictures</p>
              {showMeaning ? (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl text-sand-100 leading-snug">
                  <TextWithTooltips text={glyph.meaning} />
                </motion.p>
              ) : (
                <button type="button" onClick={() => setShowMeaning(true)} className="lesson-option w-full text-left px-4 py-3 font-body text-sm">
                  Have a guess, then tap to see
                </button>
              )}
            </div>

            {glyph.origin && (
              <div className="border-l-2 border-gold-500/60 pl-4">
                <p className="lesson-label mb-1">Why this picture?</p>
                <p className="font-body text-base text-sand-100 leading-relaxed">
                  <TextWithTooltips text={glyph.origin} />
                </p>
              </div>
            )}

            {notes.map((n) => (
              <div key={n.label}>
                <p className="lesson-label mb-1">{n.label}</p>
                <p className="lesson-prose">
                  <TextWithTooltips text={n.text} />
                </p>
              </div>
            ))}

            {glyph.examples.length > 0 && (
              <div>
                <p className="lesson-label mb-2">Words it is in</p>
                <ul className="flex flex-wrap gap-2">
                  {glyph.examples.map((ex, i) => (
                    // (font-body: its stack has the hieroglyph font after Open Sans, so the gloss is not set in a fallback serif)
                    <li key={i} className="rounded-lg bg-obsidian-lighter/70 px-3 py-2 font-body text-sm text-sand-200">
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gold-700/15">
          <button onClick={() => handleGlyphPrev(groupIndex, glyphIndex)} disabled={glyphIndex === 0} className="lesson-btn-quiet justify-center py-3 px-6 text-sm disabled:invisible">
            <span className="lesson-btn-glyph" data-glyph="back" aria-hidden="true">𓂻</span>
            Back
          </button>
          <button onClick={() => handleGlyphNext(groupIndex, glyphIndex)} className="lesson-btn flex-1 sm:flex-none sm:ml-auto justify-center py-3 px-8 text-sm">
            {glyphIndex === group.glyphs.length - 1 ? "Check these signs" : "Next sign"}
            <span className="lesson-btn-glyph" data-glyph="next" aria-hidden="true">𓂻</span>
          </button>
        </div>
      </motion.div>
    );
  }

  function renderMiniExercise(groupIndex: number) {
    const group = groups[groupIndex];
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
            Quick Check · {door && groupIndex === 0 ? `The signs on ${door.name}’s door` : door ? `Word set ${groupIndex}` : `Group ${groupIndex + 1}`}
          </p>
          <p className="font-body text-sm text-sand-400">
            {door && groupIndex === 0
              ? "Straight from the lintel. Dr Rashid wants to see that they stuck before you meet the rest."
              : door
                ? `The ${group.glyphs.length === 1 ? "sign" : `${group.glyphs.length} signs`} you just met in those words. Sound to sign and back.`
                : shape.quickCheck === "object"
              ? "Saleh holds up the thing itself. Which sign did the scribes cut for it?"
              : shape.quickCheck === "listen"
                ? "Call and response: hear the sound, pick the sign."
                : shape.quickCheck === "speed"
                  ? "Nour is waiting. Seven seconds a question."
                  : shape.quickCheck === "silent"
                    ? "No feedback until the end. Dr Rashid is watching."
                      : "Test what you just learned before moving on."}
          </p>
        </div>
        <MiniExercise
          glyphs={group.glyphs}
          distractors={allGlyphs}
          mode={shape.quickCheck}
          exercise={shape.quickCheck === "standard" ? "mini" : (`quick-${shape.quickCheck}` as const)}
          onComplete={(correctCount) => {
            onXPEarned(correctCount * XP_REWARDS.miniExerciseCorrect);
            setTimeout(() => handleMiniExerciseComplete(groupIndex), 1500);
          }}
        />
      </motion.div>
    );
  }

  /** End of a part (a section of the lesson, presented as a short lesson of its own): the win, the upgrade screen, then the next part or the dashboard. */
  function renderSectionBreak(section: number, nextGroup: number) {
    if (!plan) return null;
    const done = groups.slice(0, nextGroup);
    const signsMet = done.reduce((n, g) => n + g.glyphs.length, 0);
    const wordsMet = wordGroups.slice(0, nextGroup - 1).reduce((n, g) => n + g.words.length, 0);
    const next = plan.sections[section];
    const sectionStart = firstGroupOfSection(lesson.id, section);
    const newSigns = done.slice(sectionStart).reduce((n, g) => n + g.glyphs.length, 0);
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
        <div className="lesson-sheet p-8 md:p-10 text-center mb-6">
          <p className="font-body text-sm text-gold-500 mb-3 font-semibold">
            Lesson 1 · part {section} of {plan.sections.length} complete
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-4">
            <span className="text-gradient-gold font-medium">{signsMet} signs</span> and {wordsMet} words read
          </h2>
          <div className="flex flex-wrap justify-center gap-2 mb-2" style={{ fontFamily: GLYPH_FONT }} aria-hidden="true">
            {done.flatMap((g, gi) => g.glyphs.map((x) => ({ x, fresh: gi >= sectionStart }))).map(({ x, fresh }) => (
              <span key={x.symbol} className={`text-2xl md:text-3xl ${fresh ? "text-gold-300" : "text-gold-600/50"}`}>{x.symbol}</span>
            ))}
          </div>
          <p className="font-body text-xs text-gold-500 mb-5">+{newSigns} new in this part</p>
          <p className="font-body text-sm text-sand-300 font-light max-w-xl mx-auto leading-relaxed">
            {signsMet} of the {allGlyphs.length} signs of the alphabet are yours. Your place is saved: stop here and part {section + 1} is waiting on your dashboard.
          </p>
        </div>

          {upgrade && (
            <div className="mb-6">
              <UpgradePanel {...upgrade} location={`section_${section}`} progressLine={`${signsMet} signs and ${wordsMet} words in`} />
            </div>
          )}

          <div className="lesson-sheet p-6 md:p-8 text-center">
            <p className="font-body text-sm text-sand-500 mb-2 font-semibold">
              Next lesson · part {section + 1}: {next.title}
            </p>
            <p className="font-body text-sm text-sand-400 mb-5">{next.blurb} About ten minutes, and still free.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  trackEvent("lesson_section_continue", { lesson_id: lesson.id, section: section + 1 });
                  continueAfterGroup(nextGroup - 1);
                }}
                className="lesson-btn py-4 px-10 text-sm justify-center"
              >
                Start part {section + 1}
              </button>
              <Link href="/dashboard" className="lesson-btn-quiet py-4 px-8 text-sm justify-center">
                Back to the dashboard
              </Link>
            </div>
          </div>
      </motion.div>
    );
  }

  /** Straight after the door: what the rest of the course costs, with the free words one click on. Payers and the free-unlock group go straight on. */
  const skipDoorOffer = stage.type === "door-offer" && (upgrade?.paid === true || !!upgrade?.freeUnlock || !upgrade);
  useEffect(() => {
    if (skipDoorOffer) continueAfterGroup(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipDoorOffer]);
  function renderDoorOffer() {
    if (!upgrade || upgrade.paid !== false || upgrade.freeUnlock) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
        <div className="lesson-sheet p-6 md:p-8 text-center mb-6">
          <p className="font-body text-sm text-gold-500 mb-3 font-semibold">The door is open</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-3">
            {door?.name ? <><span className="text-gradient-gold font-medium">{door.name}</span>&rsquo;s signs are yours</> : "Your first signs are yours"}
          </h2>
          <p className="font-body text-sm text-sand-300 font-light max-w-xl mx-auto leading-relaxed mb-5">
            Next come your first real Egyptian words, free. Before you go in, here is the whole dig.
          </p>
          <button
            type="button"
            onClick={() => {
              trackEvent("door_offer_continue", { lesson_id: lesson.id });
              continueAfterGroup(0);
            }}
            className="lesson-btn py-4 px-10 text-sm justify-center"
          >
            Carry on to your first words, free
          </button>
        </div>
        <UpgradePanel {...upgrade} location="after_door" progressLine={`${door?.signs.length ?? 0} signs in`} />
      </motion.div>
    );
  }

  /** Read by torchlight: the words of the part just finished (every word, at the end of the lesson). */
  function renderTorch(section: number, nextGroup: number) {
    const { words, known } = torchWords(section, nextGroup);
    return <TorchRun section={section} finale={nextGroup < 0} words={words} known={known} onXPEarned={onXPEarned} onDone={afterTorch} />;
  }

  /** Which part of a sectioned lesson this is: one line above the stage (each part is presented as a short lesson of its own). */
  function renderPartLabel() {
    if (!plan || pass === 2) return null;
    let active: number;
    if (stage.type === "word" || stage.type === "mini-exercise") active = sectionOfGroup(lesson.id, stage.groupIndex);
    else if (stage.type === "section-break") return null;
    else if (stage.type === "torch") active = stage.section;
    else if (stage.type === "intro") active = resumeAt ?? 1;
    else if (stage.type === "name" || stage.type === "door" || stage.type === "door-offer" || stage.type === "guest-gate" || (stage.type === "choice" && stage.at === "after-intro")) active = 1;
    else if (stage.type === "narrative-outro") return null;
    else active = plan.sections.length;
    // each part numbered in Egyptian strokes (one, two, three...)
    const strokes = ["\u{133FA}", "\u{133FB}", "\u{133FC}", "\u{133FD}", "\u{133FE}"];
    return (
      <nav aria-label={`Part ${active} of ${plan.sections.length}: ${plan.sections[active - 1].title}`} className="part-track">
        {plan.sections.map((section, i) => {
          const n = i + 1;
          const state = n < active ? "done" : n === active ? "now" : "later";
          return (
            <Fragment key={section.title}>
              {i > 0 && <span className="part-link" data-done={n <= active} aria-hidden="true" />}
              <span className="part-step" data-state={state} aria-current={state === "now" ? "step" : undefined}>
                <span className="part-step-num" aria-hidden="true">{strokes[i] ?? n}</span>
                <span className="part-step-title">{section.title}</span>
              </span>
            </Fragment>
          );
        })}
      </nav>
    );
  }

  /** A guest after the door: the sign-up modal is open over this (and cannot be closed); this is what shows behind it. */
  function renderGuestGate() {
    const signs = groups[0]?.glyphs ?? [];
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lesson-sheet p-8 md:p-12 text-center max-w-3xl mx-auto">
        <div className="flex justify-center gap-2 mb-6" style={{ fontFamily: GLYPH_FONT }} aria-hidden="true">
          {signs.map((g) => (
            <span key={g.symbol} className="text-3xl md:text-4xl text-gold-400">{g.symbol}</span>
          ))}
        </div>
        <p className="font-body text-sm text-gold-500 mb-3 font-semibold">The door is open</p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-4">
          Keep {door?.name ? <span className="text-gradient-gold font-medium">{door.name}</span> : "your name"} and carry on
        </h2>
        <p className="font-body text-sand-300 font-light max-w-xl mx-auto mb-8 leading-relaxed">
          Next are your first three words. A free account keeps your door, your signs and your place, and brings you straight back here.
        </p>
        <button
          type="button"
          onClick={() => {
            trackEvent("signup_wall_click", { location: "lesson_after_door" });
            openWordsSignUp();
          }}
          className="lesson-btn text-sm py-3.5 px-8 justify-center"
        >
          Sign up free &amp; continue
        </button>
        <p className="font-body text-xs text-sand-500 mt-6">The whole first lesson stays free.</p>
      </motion.div>
    );
  }

  function renderMechanic() {
    if (!mechanic) return null;
    const M = MECHANICS[mechanic];
    const meta = MECHANIC_TITLE[mechanic];
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <p className="font-body text-sm text-gold-500 mb-2 font-semibold">The Work · {narrator.name}</p>
          <h2 className="font-display text-2xl text-sand-100 font-light">{shape.workTitle || meta.title}</h2>
          <p className="font-body text-sm text-sand-400 mt-1">{shape.workBlurb || meta.blurb}</p>
        </div>
        <M
          lessonId={lesson.id}
          glyphs={allGlyphs}
          onXPEarned={onXPEarned}
          onComplete={(s) => {
            trackExerciseComplete({ exercise: mechanic, score: s.correct, total: s.total });
            setMechanicDone(true);
          }}
        />
        <AnimatePresence>
          {mechanicDone && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
              <button type="button" onClick={afterMechanic} className="lesson-btn py-4 px-10 text-sm">
                {reading ? "Now read the wall" : "File Site Report"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  function renderReading() {
    if (!reading) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Read it</p>
          <h2 className="font-display text-2xl text-sand-100 font-light">{reading.title}</h2>
          <p className="font-body text-sm text-sand-400 mt-1">{reading.source}</p>
        </div>
        <div className="lesson-sheet p-4 md:p-6">
          <WallReader
            stageKey={`reading-${lesson.id}`}
            signs={reading.signs}
            written={reading.written}
            rtl={reading.rtl}
            exercise="read-it"
            question={reading.translit}
            prompt={shape.silentReading ? "Read it." : reading.written ? "Tap the signs in the order they are READ, not carved" : "Tap the signs in reading order"}
            tip={
              shape.silentReading
                ? undefined
                : reading.written
                  ? "Honorific transposition: the god or king is carved first out of respect, but read later."
                  : reading.rtl
                    ? "The figures face right, so this line begins on the right."
                    : "The figures face left, so this line begins on the left."
            }
            reveal={{ translit: reading.translit, meaning: reading.meaning, note: reading.note }}
            continueLabel="File Site Report"
            onComplete={(r) => {
              onXPEarned(r.mistakes === 0 ? XP_REWARDS.readingComplete : Math.round(XP_REWARDS.readingComplete / 2));
              setStage({ type: "site-report" });
            }}
          />
        </div>
      </motion.div>
    );
  }

  function renderSiteReport() {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Site Report</p>
          <h2 className="font-display text-2xl text-sand-100 font-light">Final Assessment</h2>
        </div>
        <SiteReport questions={siteReportQuestions} onComplete={handleSiteReportComplete} />
      </motion.div>
    );
  }

  function renderChoice(at: "after-intro" | "before-mechanic") {
    const c = choiceAt(at);
    if (!c) return null;
    return (
      <ChoicePoint
        choice={c}
        chosen={expedition.choices[c.id]}
        torches={expedition.torches}
        onChoose={(o) => onExpedition((s) => withChoice(s, c.id, o.id, o.torches))}
        onContinue={() => (at === "after-intro" ? afterFirstChoice() : afterSecondChoice())}
      />
    );
  }

  function renderLetter() {
    if (!letter) return null;
    return (
      <div>
        <LetterHome
          letter={letter}
          glyphs={allGlyphs}
          sent={expedition.letters[lesson.id]}
          onSend={(glyphsUsed, ok) => {
            onExpedition((s) => withLetter(s, lesson.id, glyphsUsed));
            if (ok) onXPEarned(XP_REWARDS.reviewCorrect * letter.gaps.length);
          }}
        />
        <div className="text-center mt-6">
          <button type="button" onClick={afterLetter} className="lesson-btn py-3 px-8 text-sm justify-center">
            {boss && !expedition.bosses[boss.category]?.clean ? "On to the boss inscription" : "Close the notebook"}
          </button>
        </div>
      </div>
    );
  }

  function renderBoss() {
    if (!boss) return null;
    return (
      <div>
        <BossReading
          boss={boss}
          torches={expedition.torches}
          onXPEarned={onXPEarned}
          onComplete={(clean) => {
            setBossClean(clean);
            onExpedition((s) => withBoss(s, boss.category, clean));
          }}
        />
        {bossClean !== null && (
          <div className="text-center mt-6">
            <button type="button" onClick={() => setStage({ type: "narrative-outro" })} className="lesson-btn py-3 px-8 text-sm justify-center">
              Leave the chamber
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderSecondPass() {
    if (!secondPass) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Second pass · no notes</p>
          <h2 className="font-display text-2xl text-sand-100 font-light">{secondPass.title}</h2>
          <p className="font-body text-sm text-sand-400 mt-1">{secondPass.source}</p>
        </div>
        <div className="lesson-sheet p-4 md:p-6">
          <WallReader
            stageKey={`second-pass-${lesson.id}`}
            signs={secondPass.signs}
            written={secondPass.written}
            rtl={secondPass.rtl}
            exercise="second-pass"
            question={secondPass.translit}
            prompt="Read it."
            reveal={{ translit: secondPass.translit, meaning: secondPass.meaning, note: secondPass.note }}
            continueLabel="Lower the lamp"
            onComplete={(r) => {
              const total = secondPass.signs.length;
              const score = Math.max(0, total - r.mistakes);
              onXPEarned(r.mistakes === 0 ? XP_REWARDS.readingComplete * 2 : XP_REWARDS.readingComplete);
              onExpedition((s) => withSeal(s, lesson.id, score, total));
              setSecondPassResult({ mistakes: r.mistakes });
              setStage({ type: "narrative-outro" });
            }}
          />
        </div>
      </motion.div>
    );
  }

  function renderNarrativeOutro() {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
        <div className="lesson-sheet p-8 md:p-12 mb-8">
          <span className="text-5xl block mb-6">&#x1308C;</span>
          {pass === 2 && secondPassResult ? (
            <>
              <h2 className="font-display text-3xl text-sand-100 font-light mb-4">
                {secondPassResult.mistakes === 0 ? "Gold seal" : "Second pass read"}
              </h2>
              <p className="font-body text-base text-sand-300 leading-relaxed italic mb-8 max-w-xl mx-auto">
                {secondPassResult.mistakes === 0
                  ? `${narrator.name} presses the seal into the wax. The chamber's relic goes back in the tray polished gold.`
                  : `${secondPassResult.mistakes} wrong tap${secondPassResult.mistakes === 1 ? "" : "s"}. The line is read, and the seal waits for a clean run. The Journey tab keeps the door open.`}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl text-sand-100 font-light mb-4">Excavation Complete</h2>
              <p className="font-body text-base text-sand-300 leading-relaxed italic mb-8 max-w-xl mx-auto">
                <TextWithTooltips text={lesson.narrativeOutro} />
              </p>
            </>
          )}
          <Link href="/dashboard" className="lesson-btn py-4 px-10 text-sm inline-flex items-center gap-2">
            Back to the Journey
          </Link>
        </div>

        {pass !== 2 && lesson.isFree && upgrade && (
          <div className="mb-8">
            <UpgradePanel {...upgrade} location="lesson_outro" progressLine={`All ${allGlyphs.length} signs of the alphabet read`} />
          </div>
        )}

        {pass !== 2 && fragment && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lesson-sheet p-6 md:p-8 mb-8 text-left border border-gold-500/30">
            <p className="font-body text-sm text-gold-500 mb-1 font-semibold">The sealed door · fragment {fragment.slot + 1} of 8 uncovered</p>
            <p className="font-body text-sm text-sand-400 mb-4">Saleh brushes the sand off another stretch of the door at the bottom of the shaft. You can read it now.</p>
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="text-4xl text-gold-300 leading-none" style={{ fontFamily: GLYPH_FONT }}>
                {fragment.signs.map((g) => g.glyph).join("")}
              </span>
              <span className="font-display italic text-lg text-sand-100">{fragment.translit}</span>
              <span className="font-body text-sm text-sand-300">{fragment.english}</span>
            </div>
            <p className="font-body text-xs text-sand-400 mt-3">{fragment.note}</p>
          </motion.div>
        )}

      </motion.div>
    );
  }

  /** The signs of the alphabet met by this point of the door run (the same count the word cards show). */
  function metSigns(): Set<string> {
    const met = new Set<string>();
    if (!door) return met;
    const doorSymbols = door.signs.map((g) => g.symbol);
    const upTo = (last: number) => groups.slice(0, last + 1).forEach((g) => g.glyphs.forEach((x) => met.add(x.symbol)));
    switch (stage.type) {
      case "intro":
      case "name":
        break;
      case "choice":
        if (stage.at === "before-mechanic") upTo(groups.length - 1);
        break;
      case "door":
        doorUncovered.forEach((s) => met.add(s));
        break;
      case "guest-gate":
        upTo(0);
        break;
      case "word": {
        knownBefore(doorSymbols, wordGroups, stage.groupIndex - 1, stage.wordIndex).forEach((s) => met.add(s));
        wordGroups[stage.groupIndex - 1]?.words[stage.wordIndex]?.core.forEach((s) => met.add(s));
        break;
      }
      case "mini-exercise":
        upTo(stage.groupIndex);
        break;
      case "section-break":
        upTo(stage.nextGroup - 1);
        break;
      case "torch":
        upTo(stage.nextGroup >= 0 ? stage.nextGroup - 1 : groups.length - 1);
        break;
      case "door-offer":
        upTo(0);
        break;
      default:
        upTo(groups.length - 1);
    }
    return new Set([...met].filter((s) => glyphBySymbol.has(s)));
  }

  /** Level, XP and the 25 signs lighting up: shown through the door run once the door is built. */
  function renderLadder() {
    if (!plan || !door || stage.type === "intro" || stage.type === "name") return null;
    return (
      <ScribeLadder
        signs={allGlyphs}
        met={metSigns()}
        nameSigns={nameSigns}
        xp={(xp?.base ?? 0) + (xp?.session ?? 0)}
        sessionXP={xp?.session ?? 0}
        xpReady={xp?.ready ?? true}
      />
    );
  }

  // ─── Main render ───

  return (
    <div className="max-w-5xl mx-auto">
    {renderPartLabel()}
    {renderLadder()}
    <AnimatePresence mode="wait">
      {stage.type === "intro" && <div key="intro">{renderIntro()}</div>}
      {stage.type === "choice" && <div key={`choice-${stage.at}`}>{renderChoice(stage.at)}</div>}
      {stage.type === "name" && (
        <div key="name">
          <NameGate initialName={queryName || session?.user?.name?.split(" ")[0] || ""} narrator={`${narrator.name} · ${narrator.role}`} onSubmit={handleNameSubmit} />
        </div>
      )}
      {stage.type === "door" && door && (
        <div key="door">
          <DoorReveal door={door} canSpeak={canSpeak} onReveal={(i) => {
              onXPEarned(XP_REWARDS.glyphStudy);
              const sym = door.cells[i]?.glyph.symbol;
              if (sym) setDoorUncovered((u) => new Set(u).add(sym));
            }} onOpen={handleDoorOpen} />
        </div>
      )}
      {stage.type === "word" && <div key={`word-${stage.groupIndex}-${stage.wordIndex}`}>{renderWord(stage.groupIndex, stage.wordIndex)}</div>}
      {stage.type === "review" && <div key="review">{renderReview()}</div>}
      {stage.type === "glyph-group" && <div key={`glyph-${stage.groupIndex}-${stage.glyphIndex}`}>{renderGlyphGroup(stage.groupIndex, stage.glyphIndex)}</div>}
      {stage.type === "mini-exercise" && (
        <div key={`mini-${stage.groupIndex}`}>{guest && !guestMayTake(stage.groupIndex) ? renderGuestWall(stage.groupIndex) : renderMiniExercise(stage.groupIndex)}</div>
      )}
      {stage.type === "torch" && <div key={`torch-${stage.section}`}>{renderTorch(stage.section, stage.nextGroup)}</div>}
      {stage.type === "section-break" && <div key={`section-break-${stage.section}`}>{renderSectionBreak(stage.section, stage.nextGroup)}</div>}
      {stage.type === "door-offer" && <div key="door-offer">{renderDoorOffer()}</div>}
      {stage.type === "guest-gate" && <div key="guest-gate">{renderGuestGate()}</div>}
      {stage.type === "mechanic" && <div key="mechanic">{renderMechanic()}</div>}
      {stage.type === "reading" && <div key="reading">{renderReading()}</div>}
      {stage.type === "site-report" && <div key="site-report">{renderSiteReport()}</div>}
      {stage.type === "letter" && <div key="letter">{renderLetter()}</div>}
      {stage.type === "boss" && <div key="boss">{renderBoss()}</div>}
      {stage.type === "second-pass" && <div key="second-pass">{renderSecondPass()}</div>}
      {stage.type === "narrative-outro" && <div key="narrative-outro">{renderNarrativeOutro()}</div>}
    </AnimatePresence>
    </div>
  );
}
