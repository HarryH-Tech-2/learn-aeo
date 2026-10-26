/**
 * Game state without a state library: a tiny external store for the HUD,
 * plus plain mutable objects for things read every frame (input, positions).
 *
 * Campaign progress (name, level reached, signs learned) lives in
 * localStorage only. The prototype is not wired into the site's lesson
 * progress on purpose.
 */
import { useSyncExternalStore } from "react";
import * as THREE from "three";
import type { SignState } from "@/lib/srs";
import { LEVELS, planLevel, type LevelPlan } from "./lesson";

/** paused: the sign list is open; every place stands still because none of them is "playing" */
export type Status = "title" | "brief" | "playing" | "paused" | "won";

/**
 * campaign: the whole twelve-level game (the dev playground at /dev/platformer).
 * lesson: level 1 only, mounted as Lesson 1 on the site; the finish card hands
 * over to the written lesson instead of level 2.
 */
export type Mode = "campaign" | "lesson";

/** What the page that mounts the game wants done when the learner chooses the written lesson instead. */
/** …and when a guest (playing level 1 without an account) asks to save their progress and go on. */
export const hooks: {
  onClassic?: () => void;
  onUpgrade?: () => void;
  onSignUp?: () => void;
  /** a level was won: the level index, stations right first time, and stations in all */
  onLevelComplete?: (level: number, score: number, total: number) => void;
} = {};

/** Khety the mummy: how he looks, and what he has just said. */
export type Mood = "idle" | "happy" | "oops" | "point" | "cheer" | "giggle";
export type MascotSay = { id: number; mood: Mood; line: string };

export type Toast = { id: number; text: string; tone: "good" | "bad" | "info" };

export type Campaign = {
  name: string;
  /** the furthest level unlocked */
  level: number;
  /** alphabet signs the learner has been taught and has carved at least once */
  known: string[];
  /** the sound each was learned under: a letter of the name at first, its true sound once a word has needed it */
  knownAs: Record<string, string>;
  /** falling puts you back where you last stood, and the false steps never drown you */
  gentle: boolean;
  /** Khety keeps his lines to the speech bubble: no voice for the mummy, the sign sounds still play. On unless the learner turns his voice on. */
  hush: boolean;
  /** the learner has set `hush` themselves (saves from before he was quiet by default carry hush: false that nobody chose) */
  hushSet?: boolean;
};

/** One run of one level: the plan, and how it is going. */
export type Lesson = LevelPlan & {
  /** required stations done, in order */
  progress: number;
  /** wrong picks at each required station */
  mistakes: number[];
  /** new signs met at their beacon this run */
  taught: string[];
  /** optional review stations: untouched, or how the first answer went */
  reviewed: (null | "right" | "wrong")[];
  trueSide: "left" | "right";
  /** read = true steps first time · fell = trusted the false ones · recovered = fell, then read it right */
  fork: "unread" | "read" | "fell" | "recovered";
};

export type GameState = {
  status: Status;
  mode: Mode;
  /** may the learner go past level 1? Always in the campaign; in lesson mode only once they have paid (null = not known yet) */
  paid: boolean | null;
  /** lesson mode: playing level 1 without an account (arrived from a blog post or the name translator); the finish card asks for one */
  guest: boolean;
  /** a name the page already knows (the account name), offered in the title’s name box */
  suggestedName: string;
  ankhs: number;
  ankhTotal: number;
  scarabs: number;
  scarabTotal: number;
  falls: number;
  checkpoint: number;
  startedAt: number;
  finishedAt: number;
  /** bumps on every new run so the level remounts its collectibles */
  run: number;
  muted: boolean;
  ready: boolean;
  /** the learner's review record from /api/srs; null when signed out or not loaded */
  review: SignState[] | null;
  campaign: Campaign;
  /** the level being played (may be an earlier one replayed) */
  playing: number;
  lesson: Lesson | null;
  toast: Toast | null;
  /** standing advice while the player is somewhere that needs it (the fork) */
  hint: string | null;
  /** the sign whose teaching card is up (the player is standing in its beacon) */
  teaching: string | null;
  /** what the mascot last said (a short line in a bubble; the teaching itself stays in the toast) */
  mascot: MascotSay | null;
  /** when the run was paused (performance.now), so the clock can leave the pause out */
  pausedAt: number;
  /** how often the sign list was opened this run */
  peeks: number;
  /** how often Khety was asked for a hint this run */
  hints: number;
  /** the learner has walked off the start this run (coach.ts) */
  moved: boolean;
  /** causeway: stood in a beam meeting a new sign. The explorer stays put until the card is put away (answers.ts dismissTeach) */
  hold: boolean;
  /** causeway: falls since the learner last stood on new ground; at CARRY_AFTER Khety offers a carry (journey.ts) */
  stuck: number;
  /** causeway: how often Khety carried the learner to the next landing this run */
  assists: number;
};

const SAVE_KEY = "lh:causeway:v1";
const FRESH: Campaign = { name: "", level: 0, known: [], knownAs: {}, gentle: false, hush: true };

function loadCampaign(): Campaign {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(SAVE_KEY);
    const c = raw ? (JSON.parse(raw) as Partial<Campaign>) : null;
    if (!c || typeof c.level !== "number" || !Array.isArray(c.known)) return { ...FRESH };
    const knownAs = c.knownAs && typeof c.knownAs === "object" ? (c.knownAs as Record<string, string>) : {};
    return { name: String(c.name ?? ""), level: Math.max(0, Math.min(LEVELS.length, c.level)), known: c.known.filter((s) => typeof s === "string"), knownAs, gentle: !!c.gentle, hush: c.hushSet ? !!c.hush : true, hushSet: !!c.hushSet };
  } catch {
    return { ...FRESH };
  }
}

function saveCampaign(c: Campaign) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(c));
  } catch {}
}

let state: GameState = {
  status: "title",
  mode: "campaign",
  paid: true,
  guest: false,
  suggestedName: "",
  ankhs: 0,
  ankhTotal: 0,
  scarabs: 0,
  scarabTotal: 0,
  falls: 0,
  checkpoint: 0,
  startedAt: 0,
  finishedAt: 0,
  run: 0,
  muted: false,
  ready: false,
  review: null,
  campaign: { ...FRESH },
  playing: 0,
  lesson: null,
  toast: null,
  hint: null,
  teaching: null,
  mascot: null,
  pausedAt: 0,
  peeks: 0,
  hints: 0,
  moved: false,
  hold: false,
  stuck: 0,
  assists: 0,
};

const listeners = new Set<() => void>();
let toastId = 0;
let mascotId = 0;

export const game = {
  get: () => state,
  set(patch: Partial<GameState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** read the saved campaign (client only) */
  load() {
    game.set({ campaign: loadCampaign() });
  },
  campaign(patch: Partial<Campaign>) {
    const campaign = { ...state.campaign, ...patch };
    saveCampaign(campaign);
    game.set({ campaign });
  },
  resetCampaign() {
    const kept = { gentle: state.campaign.gentle, hush: state.campaign.hush, hushSet: state.campaign.hushSet };
    saveCampaign({ ...FRESH, ...kept });
    game.set({ campaign: { ...FRESH, ...kept }, status: "title", lesson: null });
  },
  /** Set a level up and show its briefing. The run starts when the learner says so. */
  begin(level: number) {
    // (level 1 is the free one: nothing past it starts until the learner is known to have paid)
    const index = state.paid ? Math.max(0, Math.min(LEVELS.length - 1, level)) : 0;
    const plan = planLevel({ level: index, name: state.campaign.name, known: state.campaign.known, knownAs: state.campaign.knownAs, review: state.review, now: Date.now() });
    const lesson: Lesson = {
      ...plan,
      progress: 0,
      mistakes: plan.stations.map(() => 0),
      taught: [],
      reviewed: plan.reviews.map(() => null),
      trueSide: Math.random() < 0.5 ? "left" : "right",
      fork: "unread",
    };
    game.set({ status: "brief", playing: index, ankhs: 0, scarabs: 0, falls: 0, checkpoint: 0, startedAt: 0, finishedAt: 0, run: state.run + 1, lesson, toast: null, hint: null, teaching: null, mascot: null, peeks: 0, hints: 0, moved: false, hold: false, stuck: 0, assists: 0 });
  },
  play() {
    if (state.status === "brief") game.set({ status: "playing", startedAt: performance.now() });
  },
  win() {
    if (state.status !== "playing" || !state.lesson) return;
    // what was carved is now known; finishing the furthest level unlocks the next
    const carved = state.lesson.stations.filter((s) => s.kind === "sign");
    const known = [...new Set([...state.campaign.known, ...carved.map((s) => s.target)])];
    const knownAs = { ...state.campaign.knownAs };
    carved.forEach((s) => (knownAs[s.target] = s.sound));
    const level = Math.max(state.campaign.level, Math.min(LEVELS.length, state.playing + 1));
    const campaign = { ...state.campaign, known, knownAs, level };
    saveCampaign(campaign);
    game.set({ status: "won", finishedAt: performance.now(), campaign, hint: null, teaching: null, hold: false });
  },
  /** Open the sign list: everything stands still, and the clock leaves the pause out. */
  pause() {
    if (state.status === "playing") game.set({ status: "paused", pausedAt: performance.now(), peeks: state.peeks + 1 });
  },
  resume() {
    if (state.status === "paused") game.set({ status: "playing", startedAt: state.startedAt + (performance.now() - state.pausedAt) });
  },
  /** The mascot says a short line (shown in his bubble; voice.ts speaks it). */
  mascot(mood: Mood, line: string) {
    game.set({ mascot: { id: ++mascotId, mood, line } });
  },
  toTitle() {
    game.set({ status: "title", lesson: null, toast: null, hint: null, teaching: null, hold: false });
  },
  toast(text: string, tone: Toast["tone"] = "info") {
    game.set({ toast: { id: ++toastId, text, tone } });
  },
  lesson(patch: Partial<Lesson>) {
    if (state.lesson) game.set({ lesson: { ...state.lesson, ...patch } });
  },
};

export function useGame(): GameState {
  return useSyncExternalStore(game.subscribe, game.get, game.get);
}

/** Read every frame by the player; written by the keyboard and the touch controls. */
export const input = { x: 0, y: 0, jumpHeld: false, jumpPressedAt: -1 };

/**
 * The way along the causeway, kept by the player every frame (no React involved): the furthest
 * solid ground stood on this run, and a carry the HUD has asked for (journey.ts).
 */
export const journey: { run: number; furthestZ: number; carryTo: [number, number, number] | null } = { run: -1, furthestZ: Infinity, carryTo: null };

/** Shared per-frame positions (no React involved). */
export const playerPos = new THREE.Vector3(0, 2, 0);
export const playerVel = new THREE.Vector3();

/** rigid-body handle → current velocity of a moving platform, so the player can ride it */
export const moverVelocity = new Map<number, THREE.Vector3>();

/** Low sun, ahead and to the left of the course: long shadows and a glitter path on the river. */
export const SUN_DIR = new THREE.Vector3(-0.56, 0.25, -0.79).normalize();
