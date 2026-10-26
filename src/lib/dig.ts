/**
 * The Dig — the hub map. Pure rules: which chamber (lesson) is cleared, open,
 * sealed or still under the sand for a given visitor, where each room sits on
 * the isometric plan, and which side rooms (games) branch off which chamber.
 * The SVG is drawn in src/app/dig/DigMap.tsx from what this module returns.
 */
import { GAMES, type GameInfo } from "@/lib/games";
import { lessons, type Lesson } from "@/lib/lessons";

export type ChamberState = "cleared" | "open" | "sealed" | "unexcavated";
export type SealReason = "signin" | "paywall" | null;

export type Chamber = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  duration: string;
  state: ChamberState;
  /** Why it is sealed (only when state === "sealed") */
  seal: SealReason;
  started: boolean;
  bestScore: number | null;
  /** Where the card's button goes */
  href: string;
  isFree: boolean;
  /** Screen position of the room centre on the plan */
  x: number;
  y: number;
  /** Games that practise this chamber's signs */
  games: GameInfo[];
};

export type SideRoom = {
  game: GameInfo;
  /** Chamber it branches from (order) */
  anchor: number;
  x: number;
  y: number;
  /** Visitor can open it right now */
  open: boolean;
  /** Not built yet (route missing): drawn as a blocked doorway */
  comingSoon?: boolean;
};

export type Visitor = { signedIn: boolean; paid: boolean };

export type LessonProgressMap = Record<string, { started: boolean; bestScore: number | null; completed: boolean }>;

/** Lesson icons, same as the dashboard cards. */
export const CHAMBER_ICON: Record<string, string> = {
  "expedition-begins": "𓄿",
  "outer-courtyard": "𓃭",
  "pilgrims-gallery": "𓀀",
  "the-treasury": "𓏤",
  "royal-hall": "𓇳",
  "sacred-chapel": "𓂀",
  "hypostyle-hall": "𓉐",
  "inner-sanctum": "𓐍",
};

/**
 * Serpentine isometric path: chambers 1–4 step right-down, 5–7 step back
 * left-down, 8 steps right again, so the plan stays roughly square and fits
 * a phone. Coordinates are in the SVG viewBox (see PLAN).
 */
export const PLAN = { width: 860, height: 860 } as const;
const STEP = { x: 170, y: 85 };
const START = { x: 170, y: 150 };

export function chamberPosition(order: number): { x: number; y: number } {
  const k = order - 1; // 0..7
  if (k < 4) return { x: START.x + STEP.x * k, y: START.y + STEP.y * k };
  const turn = { x: START.x + STEP.x * 3, y: START.y + STEP.y * 3 };
  if (k < 7) {
    const m = k - 3; // 1..3
    return { x: turn.x - STEP.x * m, y: turn.y + STEP.y * m };
  }
  const seven = { x: turn.x - STEP.x * 3, y: turn.y + STEP.y * 3 };
  return { x: seven.x + STEP.x, y: seven.y + STEP.y };
}

/** The outward side of the corridor at each chamber (unit isometric direction). */
function outward(order: number): { x: number; y: number } {
  if (order <= 4) return { x: 1, y: -1 }; // up-right
  if (order <= 7) return { x: -1, y: -1 }; // up-left
  return { x: 1, y: 1 }; // down-right
}

/**
 * Which chamber each game branches from, and how far out along the outward
 * axis (slot 0 = nearest). Games not listed hang off the first lesson in
 * their lessonIds. Positions were chosen so no two rooms sit within 70 px.
 */
const ANCHORS: Record<string, { order: number; slot: number }> = {
  daily: { order: 1, slot: 0 },
  "cartouche-forge": { order: 2, slot: 0 },
  decipher: { order: 2, slot: 1 },
  "sign-hunt": { order: 3, slot: 0 },
  scribe: { order: 3, slot: 1 },
  wall: { order: 4, slot: 0 },
  "tomb-wall": { order: 5, slot: 0 },
  stela: { order: 6, slot: 0 },
  descent: { order: 8, slot: 0 },
};

export function sideRoomPosition(order: number, slot: number): { x: number; y: number } {
  const c = chamberPosition(order);
  const o = outward(order);
  const dist = 0.62 + slot * 0.55;
  return { x: c.x + o.x * STEP.x * dist, y: c.y + o.y * STEP.y * dist };
}

function orderedLessons(): Lesson[] {
  return [...lessons].sort((a, b) => a.order - b.order);
}

/** The lesson the visitor should dig next: first not completed, in order. */
export function nextLessonId(progress: LessonProgressMap | null): string {
  const ordered = orderedLessons();
  for (const l of ordered) if (!progress?.[l.id]?.completed) return l.id;
  return ordered[ordered.length - 1].id;
}

export function computeChambers(visitor: Visitor, progress: LessonProgressMap | null): Chamber[] {
  const next = nextLessonId(progress);
  return orderedLessons().map((l) => {
    const p = progress?.[l.id];
    const completed = !!p?.completed;
    const canEnter = l.isFree || visitor.paid;
    let state: ChamberState;
    let seal: SealReason = null;
    if (completed) state = "cleared";
    else if (!canEnter) {
      // Guests see one sign-in wall right after the free chamber; signed-in
      // but unpaid members see the paywall on the next chamber only.
      if (!visitor.signedIn) {
        state = "sealed";
        seal = "signin";
      } else if (l.id === next) {
        state = "sealed";
        seal = "paywall";
      } else state = "unexcavated";
    } else if (l.id === next) state = "open";
    else state = "unexcavated";

    const href = !canEnter
      ? visitor.signedIn
        ? "/checkout"
        : `/lessons/${l.id}`
      : `/lessons/${l.id}`;
    const pos = chamberPosition(l.order);
    return {
      id: l.id,
      order: l.order,
      title: l.title,
      subtitle: l.subtitle,
      icon: CHAMBER_ICON[l.id] ?? "𓊖",
      duration: l.duration,
      state,
      seal,
      started: !!p?.started,
      bestScore: p?.bestScore ?? null,
      href,
      isFree: l.isFree,
      x: pos.x,
      y: pos.y,
      games: GAMES.filter((g) => g.lessonIds.includes(l.id)),
    };
  });
}

export function computeSideRooms(visitor: Visitor, games: GameInfo[] = GAMES): SideRoom[] {
  const used = new Map<number, number>();
  const ordered = orderedLessons();
  return games.map((g) => {
    let anchor = ANCHORS[g.id];
    if (!anchor) {
      const order = ordered.find((l) => g.lessonIds.includes(l.id))?.order ?? 1;
      anchor = { order, slot: (used.get(order) ?? 0) + 2 };
    }
    used.set(anchor.order, Math.max(used.get(anchor.order) ?? 0, anchor.slot));
    const pos = sideRoomPosition(anchor.order, anchor.slot);
    return { game: g, anchor: anchor.order, x: pos.x, y: pos.y, open: !!g.free || visitor.paid };
  });
}

/** How far in the visitor is, for the headline. */
export function digSummary(chambers: Chamber[]): { cleared: number; total: number; next: Chamber | null; deepest: number } {
  const cleared = chambers.filter((c) => c.state === "cleared").length;
  const next = chambers.find((c) => c.state === "open" || c.state === "sealed") ?? null;
  const deepest = chambers.reduce((d, c) => (c.state === "cleared" ? Math.max(d, c.order) : d), 0);
  return { cleared, total: chambers.length, next, deepest };
}
