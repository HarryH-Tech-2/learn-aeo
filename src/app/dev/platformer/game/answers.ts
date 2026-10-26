/**
 * The one path every place answers through. A scene decides HOW a choice is
 * made (a tablet touched, an arch sailed through, a block pushed home); what
 * the choice means is decided here, so the bar at the top, the finish card
 * and the review filing work the same everywhere.
 */
import * as THREE from "three";
import { LAYOUTS, allDone, qualityAfterRun, signInfo, thePicture, type Station } from "./lesson";
import { game, type Lesson } from "./store";
import { sfx } from "./audio";
import { khety, say } from "./voice";
import { factLine, finishLine, finishSpoken, hintFor, hintLead, pokeLine, reviewLine, rightLine, teachLine, wrongLine } from "./khety";
import { burst } from "./Particles";

export type Outcome = "right" | "wrong" | "ignored";

/** Right answers in a row this run: Khety makes more of the third, the fifth and the eighth. */
let streak = 0;
let streakRun = -1;
function inARow(right: boolean): number {
  if (game.get().run !== streakRun) {
    streakRun = game.get().run;
    streak = 0;
  }
  streak = right ? streak + 1 : 0;
  return streak;
}

/** Has the learner met this station's sign yet? Until then it must not be asked for. */
export function isTaught(l: Lesson, st: Station): boolean {
  return !st.teach || l.taught.includes(st.target);
}

/** The station being asked for now, if any. */
export function currentStation(): { station: Station; index: number } | null {
  const l = game.get().lesson;
  if (!l || l.progress >= l.stations.length) return null;
  return { station: l.stations[l.progress], index: l.progress };
}

/** Is everything answered (the way out may open)? */
export function finished(): boolean {
  const l = game.get().lesson;
  return !!l && allDone(l, l.progress, l.reviewed);
}

/** Meet a sign: it is shown, named and spoken, and from now on it may be asked for. Cannot go wrong. */
export function teach(symbol: string, at?: THREE.Vector3): void {
  const l = game.get().lesson;
  if (!l) return;
  if (!l.taught.includes(symbol)) {
    game.lesson({ taught: [...l.taught, symbol] });
    sfx.checkpoint();
    if (at) burst(at, 16, [2.6, 2.0, 0.6], 3);
    // Khety announces it, then the sign voice gives the sound. He says so aloud for every other new sign only
    // (the first, the third…): his bubble still shows the line, but hearing a lead-in before each sound wore thin.
    const line = teachLine();
    game.mascot("point", line);
    if (l.taught.length % 2 === 0) khety(line, signInfo(symbol).said);
    else say(signInfo(symbol).said);
  } else say(signInfo(symbol).said);
  // On the causeway a first meeting stops the explorer in the beam until the card is put away: walking on at a run
  // carried players out of the ring (and into the tablets, 2.3 m on) before the card had been read.
  const first = !l.taught.includes(symbol) && l.spec.layout === "causeway";
  game.set({ teaching: symbol, ...(first ? { hold: true } : {}) });
}

/** A sign already known, shown again in its beam as a reminder: the card and the sound, nothing new, and no hold. */
export function remind(symbol: string): void {
  if (!game.get().lesson) return;
  say(signInfo(symbol).said);
  game.set({ teaching: symbol });
}

/** Take the teaching card down again (only if it is still this sign's). */
export function closeTeach(symbol: string): void {
  if (game.get().teaching === symbol) game.set({ teaching: null, hold: false });
}

/** The learner has read the card (Got it, or Enter): it goes, and the explorer may walk on. */
export function dismissTeach(): void {
  if (game.get().teaching || game.get().hold) game.set({ teaching: null, hold: false });
}

function phraseDoneAfter(l: Lesson, index: number): boolean {
  const next = l.stations[index + 1];
  return !next || next.phrase !== l.stations[index].phrase || next.kind === "det";
}

/**
 * Answer the station at `index` with one of its options. `picked` says what
 * the learner was choosing between: signs (the usual way round) or sounds
 * (the buried wall asks a "sign" station backwards: the sign is shown).
 * For sounds, `option` is still the option's sign: the sound is looked up.
 */
export function answer(index: number, option: string, at?: THREE.Vector3, picked: "sign" | "sound" = "sign"): Outcome {
  const l = game.get().lesson;
  if (!l || l.progress !== index || game.get().status !== "playing") return "ignored";
  const station = l.stations[index];
  if (!isTaught(l, station)) return "ignored";
  const info = signInfo(station.target);
  const phrase = l.phrases[station.phrase];
  const place = LAYOUTS[l.spec.layout];
  const correct = station.kind === "read" ? option === info.sound : option === station.target;
  // a choice has been made: the card steps aside for what is said about it (on a phone the two share a place)
  if (game.get().teaching) game.set({ teaching: null, hold: false });

  if (!correct) {
    const mistakes = [...l.mistakes];
    mistakes[index] += 1;
    game.lesson({ mistakes });
    sfx.wrong();
    inARow(false);
    const oops = wrongLine();
    game.mascot("oops", oops);
    khety(oops);
    if (station.kind === "sign" && picked === "sound") {
      game.toast(`Not “${signInfo(option).sound}”: that is ${option}, ${thePicture(option)}. Look at the sign again: ${station.target}, ${thePicture(station.target)}.`, "bad");
    } else if (station.kind === "sign") {
      const me = signInfo(option);
      // on the name level the learner met each sign as a letter of their name (the reed as "e"), not as ꞽ
      const meSound = l.spec.kind === "name" ? (phrase.sockets.find((s) => s.symbol === option)?.sound ?? me.sound) : me.sound;
      const later = l.stations.slice(index + 1).some((s) => s.phrase === station.phrase && s.kind === "sign" && s.target === option);
      game.toast(
        later
          ? `${option} is “${meSound}”, and it is in the word, but not yet. Signs are taken in reading order: “${station.sound}” comes first.`
          : `That is ${option}, “${meSound}”: ${thePicture(option)}. You are after the sound “${station.sound}”.`,
        "bad",
      );
    } else if (station.kind === "det") {
      game.toast(`That picture belongs to a different word. ${phrase.translit} means “${phrase.meaning}”: which picture says that?`, "bad");
    } else {
      game.toast(`Not “${option}”. Look at the sign again: ${station.target}, ${thePicture(station.target)}.`, "bad");
    }
    return "wrong";
  }

  game.lesson({ progress: index + 1 });
  sfx.right();
  if (at) burst(at, 22, [3.2, 2.1, 0.5], 4);
  const cheer = rightLine(inARow(true));
  game.mascot("happy", cheer);
  khety(cheer, station.kind !== "det" ? info.said : undefined);
  // asked backwards, a spelling station is a reading: the message must not name the next sound, which is the next answer
  const reads = station.kind === "read" || picked === "sound";
  const lastOfAll = finished();
  const tail = lastOfAll ? ` ${place.opened}` : "";
  if (lastOfAll) sfx.door();
  const nextUp = l.stations[index + 1];
  if (station.kind === "det") {
    const more = lastOfAll ? tail : nextUp ? " Now the next word." : "";
    game.toast(`${station.target} is the ${phrase.det?.name}. It is never read aloud: it tells the reader what kind of word “${phrase.translit}” is.${more}`, "good");
  } else if (phraseDoneAfter(l, index)) {
    const more = lastOfAll ? tail : !nextUp ? "" : nextUp.kind === "det" && nextUp.phrase === station.phrase ? ` One sign left, a silent one: ${place.detAt}.` : " Now the next word.";
    game.toast(`${station.target} is “${station.sound}”. That ${reads ? "reads" : "spells"} ${phrase.translit}: “${phrase.meaning}”.${more}`, "good");
  } else {
    game.toast(`${station.target} is “${station.sound}”: ${thePicture(station.target)}. ${reads ? "Read the next sign." : `Next sound: “${nextUp.sound}”.`}`, "good");
  }
  return "right";
}

/** A slip that is not a choice between options (a wrong end of a line, a repeat of a sign pushed home wrongly): it still counts against the station. */
export function slip(index: number): void {
  const l = game.get().lesson;
  if (!l || index < 0 || index >= l.mistakes.length) return;
  const mistakes = [...l.mistakes];
  mistakes[index] += 1;
  game.lesson({ mistakes });
  sfx.wrong();
}

/** Answer a review. Only the first answer counts; right or wrong, it is over. */
export function answerReview(index: number, option: string, at?: THREE.Vector3): Outcome {
  const l = game.get().lesson;
  if (!l || l.reviewed[index] !== null || game.get().status !== "playing") return "ignored";
  const review = l.reviews[index];
  const ok = option === review.sound;
  const reviewed = [...l.reviewed];
  reviewed[index] = ok ? "right" : "wrong";
  game.lesson({ reviewed });
  const done = finished();
  const tail = done ? ` ${LAYOUTS[l.spec.layout].opened}` : "";
  if (done) sfx.door();
  const line = reviewLine(ok);
  game.mascot(ok ? "happy" : "oops", line);
  khety(line, review.kind === "sound" ? signInfo(review.sign).said : undefined);
  if (review.kind === "det") {
    const w = review.word!;
    if (ok) {
      sfx.right();
      if (at) burst(at, 14, [0.5, 2.4, 2.2], 3.4);
      game.toast(`Right: ${w.translit}, “${w.meaning}”, ends in ${review.sign}, the ${w.name}.${tail}`, "good");
      return "right";
    }
    sfx.wrong();
    game.toast(`${w.translit}, “${w.meaning}”, ends in ${review.sign}, the ${w.name}. It will come round again.${tail}`, "bad");
    return "wrong";
  }
  if (ok) {
    sfx.right();
    if (at) burst(at, 14, [0.5, 2.4, 2.2], 3.4);
    game.toast(`Still got it: ${review.sign} is “${review.sound}”, ${thePicture(review.sign)}.${tail}`, "good");
    return "right";
  }
  sfx.wrong();
  game.toast(`${review.sign} is “${review.sound}”: ${thePicture(review.sign)}. Not “${option}”. It will come round again.${tail}`, "bad");
  return "wrong";
}

/**
 * The run was a review: tell the learner's record how each sign went, so the
 * next word is chosen from fresher data. Signed-in learners only; a sign that
 * is not on their wall yet is refused by the API, which is fine.
 */
function fileReviews() {
  const { lesson, review } = game.get();
  if (!lesson || !review) return;
  const worst = new Map<string, number>();
  lesson.stations.forEach((st, i) => {
    if (st.kind !== "det") worst.set(st.target, Math.max(worst.get(st.target) ?? 0, lesson.mistakes[i]));
  });
  lesson.reviews.forEach((r, i) => {
    if (r.kind === "sound" && lesson.reviewed[i]) worst.set(r.sign, Math.max(worst.get(r.sign) ?? 0, lesson.reviewed[i] === "wrong" ? 1 : 0));
  });
  worst.forEach((mistakes, glyph) => {
    fetch("/api/srs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ glyph, quality: qualityAfterRun(mistakes) }) }).catch(() => null);
  });
}

/** The way out has been taken: file the reviews, save the campaign, show the finish card. */
export function complete(at?: THREE.Vector3): void {
  if (game.get().status !== "playing" || !finished()) return;
  fileReviews();
  const l = game.get().lesson;
  game.win();
  sfx.win();
  if (l) {
    const how = { clean: l.mistakes.filter((m) => m === 0).length, total: l.stations.length, last: l.spec.kind === "final" };
    game.mascot("cheer", finishLine({ ...how, name: game.get().campaign.name }));
    khety(finishSpoken(how));
  }
  if (at) burst(at, 40, [3.0, 2.2, 0.6], 6);
}

// ─── talking to Khety ───

/** Ask Khety for a hint about whatever is wanted now. It is counted, and the finish card says so. */
export function askHint(): void {
  const { lesson, status, hints } = game.get();
  if (!lesson || status !== "playing") return;
  game.set({ hints: hints + 1 });
  game.mascot("point", hintFor(lesson));
  khety(hintLead());
}

/** Ask him to tell you something: a true thing about Egypt or its writing. */
export function askFact(): void {
  const line = factLine();
  game.mascot("point", line);
  khety(line);
}

/** Poke him. */
export function poke(times: number): void {
  const line = pokeLine(times);
  game.mascot(times > 1 ? "giggle" : "happy", line);
  khety(line);
}
