/**
 * What the game tells GA4, so a run that is abandoned says WHERE. The places
 * know nothing of it: the store is watched, and each change that matters
 * becomes one event. Guests, free accounts and payers all report alike.
 *
 *   game_title_view      the title became playable (its Begin button stopped saying Loading…);
 *                        seconds: since the page opened, so the download is in it
 *   game_load_quit       the page was left while the title still said Loading… (seconds: how long they waited)
 *   game_brief_view      a level was chosen and its briefing card is up
 *   game_level_start     the briefing was dismissed and the run began
 *   exercise_answer      every pick at a required station, right or wrong
 *   game_level_complete  the way out was taken
 *   game_quit            a run was left unfinished: back to the title, or the page closed
 *   game_assist          Khety carried the learner to the next landing after a run of falls
 *                        (how: carry; question_type: the station still ahead; falls so far)
 *
 * The details ride in parameters GA4 already has as custom dimensions
 * (exercise, question_type, question, correct, score, total, attempts), so
 * reports can split by them with nothing to register:
 *   exercise       "causeway-1" … "causeway-12" (the level)
 *   question_type  on a title view, load quit, briefing or start, who is playing (guest | free | paid); otherwise
 *                  the station, "station 2 of 5" (on a quit, the one not yet answered)
 *   question       the sign that station wants
 * and, on a quit, in parameters registered 2026-09-28 (not in reports before then):
 *   seconds        how long the run had lasted, pauses left out
 *   how            title (went back to it) | leave (closed or hid the page)
 *   falls          how often the player had fallen in the river this run
 *   assists        (also on game_level_complete; registered 2026-09-30) carries taken this run
 *   step           the causeway only: move (never walked off the start) | beam (never met the
 *                  station's sign) | tablet (met it, never chose) | gate (all spelled, not out)
 */
import { trackEvent } from "@/lib/analytics";
import { game, type GameState } from "./store";
import { stepOf } from "./coach";

export type GameEvent = { name: string; params: Record<string, string | number> };

const level = (s: GameState) => `causeway-${s.playing + 1}`;
const who = (s: GameState) => (s.guest ? "guest" : s.mode === "lesson" && !s.paid ? "free" : "paid");
const station = (s: GameState, i: number) => `station ${Math.min(i + 1, s.lesson?.stations.length ?? 0)} of ${s.lesson?.stations.length ?? 0}`;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const seconds = (s: GameState, now: number) => (s.startedAt ? Math.max(0, Math.round(((s.status === "paused" ? s.pausedAt : now) - s.startedAt) / 1000)) : 0);

/** A run that has begun and is not over. */
const underway = (s: GameState) => !!s.lesson && (s.status === "playing" || s.status === "paused");

function quit(s: GameState, how: "title" | "leave", now: number): GameEvent {
  const l = s.lesson!;
  return {
    name: "game_quit",
    params: {
      exercise: level(s),
      question_type: station(s, l.progress),
      question: l.stations[l.progress]?.target ?? "gate",
      score: l.progress,
      total: l.stations.length,
      seconds: seconds(s, now),
      how,
      falls: s.falls,
      assists: s.assists,
      // (the causeway alone watches for the first steps: move | beam | tablet | gate)
      ...(l.spec.layout === "causeway" ? { step: stepOf(s) ?? "gate" } : {}),
    },
  };
}

/** The events one change of state is worth. Pure, so it can be tested. */
export function eventsBetween(prev: GameState, next: GameState, now: number): GameEvent[] {
  const out: GameEvent[] = [];
  if (!prev.ready && next.ready && next.status === "title") {
    out.push({ name: "game_title_view", params: { question_type: who(next), seconds: Math.round(now / 1000) } });
  }
  if (prev.status === "title" && next.status === "brief" && next.lesson) {
    out.push({ name: "game_brief_view", params: { exercise: level(next), question_type: who(next), total: next.lesson.stations.length } });
  }
  if (prev.status === "brief" && next.status === "playing" && next.lesson) {
    out.push({ name: "game_level_start", params: { exercise: level(next), question_type: who(next), total: next.lesson.stations.length } });
  }
  // (the same run: a new one resets the counts, which is not an answer)
  if (prev.lesson && next.lesson && prev.run === next.run) {
    const answered = next.lesson.progress > prev.lesson.progress;
    if (answered || sum(next.lesson.mistakes) > sum(prev.lesson.mistakes)) {
      const i = prev.lesson.progress;
      out.push({ name: "exercise_answer", params: { exercise: "causeway", question_type: `${level(next)} ${station(next, i)}`, question: next.lesson.stations[i]?.target ?? "", correct: answered ? 1 : 0 } });
    }
  }
  if (prev.status === "playing" && next.status === "won" && next.lesson) {
    const l = next.lesson;
    out.push({
      name: "game_level_complete",
      params: { exercise: level(next), score: l.mistakes.filter((m) => m === 0).length, total: l.stations.length, attempts: sum(l.mistakes), seconds: Math.round((next.finishedAt - next.startedAt) / 1000), hints: next.hints, peeks: next.peeks, falls: next.falls, assists: next.assists },
    });
  }
  // Khety carried the learner to the next landing (journey.ts)
  if (prev.lesson && next.lesson && prev.run === next.run && next.assists > prev.assists) {
    out.push({ name: "game_assist", params: { exercise: level(next), question_type: station(next, next.lesson.progress), how: "carry", falls: next.falls } });
  }
  if (underway(prev) && next.status === "title") out.push(quit(prev, "title", now));
  return out;
}

/** Left before the title was playable: how long they had waited, from the page opening. */
export function loadQuit(s: GameState, now: number): GameEvent | null {
  return s.ready ? null : { name: "game_load_quit", params: { question_type: who(s), seconds: Math.round(now / 1000) } };
}

/** One quit per run: a page that was hidden and came back, or a game unmounted mid-run, must not count twice. */
let quitRun = -1;
let loadQuitSent = false;
function send(e: GameEvent, run: number) {
  if (e.name === "game_quit") {
    if (quitRun === run) return;
    quitRun = run;
  }
  if (e.name === "game_load_quit") {
    if (loadQuitSent) return;
    loadQuitSent = true;
  }
  trackEvent(e.name, e.params);
}

/** Watch the store for as long as the game is mounted. */
export function watchGame(): () => void {
  let prev = game.get();
  const unsubscribe = game.subscribe(() => {
    const next = game.get();
    eventsBetween(prev, next, performance.now()).forEach((e) => send(e, prev.run));
    prev = next;
  });
  // (gtag sends by beacon, so an event raised as the page goes still arrives)
  const leaving = () => {
    const s = game.get();
    if (underway(s)) send(quit(s, "leave", performance.now()), s.run);
    const waited = loadQuit(s, performance.now());
    if (waited) send(waited, s.run);
  };
  window.addEventListener("pagehide", leaving);
  return () => {
    // (unmounted mid-run: the learner chose the written lesson instead, or walked off to another page of the site)
    leaving();
    unsubscribe();
    window.removeEventListener("pagehide", leaving);
  };
}
