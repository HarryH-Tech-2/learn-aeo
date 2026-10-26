import { prisma } from "@/lib/db";
import { devBypassAuth } from "@/lib/dev-bypass";
import {
  LEAD_MS,
  ROOM_TTL_MS,
  buildQuiz,
  distribution,
  effectivePhase,
  fastest,
  generateCode,
  leadLeft,
  msLeft,
  publicQuestion,
  reduceRoom,
  standings,
  type HostAction,
  type QuizQuestion,
  type RoomState,
  type Team,
  type TeamAnswers,
} from "@/lib/classroom";

type RoomRow = { id: string; code: string; hostUserId: string; phase: string; questionIndex: number; questionStartedAt: Date | null; questionMs: number; quiz: unknown; createdAt: Date; expiresAt: Date };
type TeamRow = { id: string; name: string; answers: unknown; lastSeenAt: Date };

function toState(r: RoomRow): RoomState {
  const quiz = r.quiz as QuizQuestion[];
  return { phase: r.phase as RoomState["phase"], questionIndex: r.questionIndex, questionStartedAt: r.questionStartedAt?.getTime() ?? null, questionMs: r.questionMs, total: quiz.length };
}

function toTeam(t: TeamRow): Team {
  return { id: t.id, name: t.name, answers: (t.answers as TeamAnswers) ?? {}, lastSeenAt: t.lastSeenAt.getTime() };
}

/** Opportunistic cleanup: rooms older than three hours go when a new one is opened. */
async function sweep(now: number) {
  await prisma.classRoom.deleteMany({ where: { expiresAt: { lte: new Date(now) } } }).catch(() => null);
}

export async function createRoom(hostUserId: string, now = Date.now()): Promise<{ code: string }> {
  await sweep(now);
  const quiz = buildQuiz(now);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      await prisma.classRoom.create({ data: { code, hostUserId, quiz, expiresAt: new Date(now + ROOM_TTL_MS) } });
      return { code };
    } catch {
      /* code collision, try again */
    }
  }
  throw new Error("could not allocate a room code");
}

export async function findRoom(code: string) {
  return prisma.classRoom.findUnique({ where: { code }, include: { teams: true } });
}

export type RoomView = {
  code: string;
  phase: RoomState["phase"];
  questionIndex: number;
  total: number;
  msLeft: number;
  /** "get ready": time before the question on its way opens */
  leadMs: number;
  questionMs: number;
  question: ReturnType<typeof publicQuestion> | null;
  /** once revealed: how many teams chose each option, and the quickest right answer */
  distribution: number[] | null;
  fastest: { name: string; ms: number } | null;
  teams: { id: string; name: string }[];
  answered: number;
  standings: ReturnType<typeof standings>;
  serverNow: number;
  expiresAt: number;
};

export function buildView(room: RoomRow & { teams: TeamRow[] }, now: number): RoomView {
  const state = toState(room);
  const quiz = room.quiz as QuizQuestion[];
  const phase = effectivePhase(state, now);
  const teams = room.teams.map(toTeam);
  const q = state.questionIndex >= 0 ? quiz[state.questionIndex] : undefined;
  const answered = state.questionIndex >= 0 ? teams.filter((t) => t.answers[String(state.questionIndex)]).length : 0;
  const shown = phase === "reveal" || phase === "finished";
  return {
    code: room.code,
    phase,
    questionIndex: state.questionIndex,
    total: state.total,
    msLeft: msLeft(state, now),
    leadMs: leadLeft(state, now),
    questionMs: state.questionMs,
    question: q ? publicQuestion(q, shown) : null,
    distribution: shown && q ? distribution(quiz, teams, state.questionIndex) : null,
    fastest: shown && q ? fastest(quiz, teams, state.questionIndex) : null,
    teams: teams.map((t) => ({ id: t.id, name: t.name })),
    answered,
    standings: phase === "reveal" || phase === "finished" ? standings(quiz, teams, state) : standings(quiz, teams, { ...state, questionIndex: state.questionIndex - (phase === "question" ? 1 : 0) }),
    serverNow: now,
    expiresAt: room.expiresAt.getTime(),
  };
}

export async function hostAction(code: string, hostUserId: string, action: HostAction, now = Date.now()) {
  const room = await findRoom(code);
  if (!room) return { error: "not found", status: 404 } as const;
  if (room.hostUserId !== hostUserId) return { error: "not your room", status: 403 } as const;
  // Start and Next open the question a few seconds from now: the screens count the class in.
  const next = reduceRoom(toState(room), action, action === "start" || action === "next" ? now + LEAD_MS : now);
  const updated = await prisma.classRoom.update({
    where: { id: room.id },
    data: { phase: next.phase, questionIndex: next.questionIndex, questionStartedAt: next.questionStartedAt === null ? null : new Date(next.questionStartedAt) },
    include: { teams: true },
  });
  return { view: buildView(updated, now) } as const;
}

export async function joinRoom(code: string, name: string, now = Date.now()) {
  const room = await findRoom(code);
  if (!room) return { error: "not found", status: 404 } as const;
  if (room.phase === "finished") return { error: "this quiz has finished", status: 410 } as const;
  if (room.teams.length >= 60) return { error: "room is full", status: 409 } as const;
  const existing = room.teams.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (existing) return { error: "that team name is taken", status: 409 } as const;
  const team = await prisma.classTeam.create({ data: { roomId: room.id, name, lastSeenAt: new Date(now) } });
  return { teamId: team.id } as const;
}

export async function answer(code: string, teamId: string, questionIndex: number, choice: number, now = Date.now()) {
  const room = await findRoom(code);
  if (!room) return { error: "not found", status: 404 } as const;
  const state = toState(room);
  if (effectivePhase(state, now) !== "question" || state.questionIndex !== questionIndex) return { error: "too late", status: 409 } as const;
  const team = room.teams.find((t) => t.id === teamId);
  if (!team) return { error: "team not in this room", status: 404 } as const;
  const answers = ((team.answers as TeamAnswers) ?? {}) as TeamAnswers;
  if (answers[String(questionIndex)]) return { ok: true, already: true } as const;
  answers[String(questionIndex)] = { choice, at: now, ms: Math.max(0, now - (state.questionStartedAt ?? now)) };
  await prisma.classTeam.update({ where: { id: team.id }, data: { answers, lastSeenAt: new Date(now) } });
  return { ok: true, already: false } as const;
}

/**
 * Local preview only (LH_DEV_BYPASS_AUTH=1): there is no session, so the
 * host of a preview room is the first user in the database. Never active in
 * production builds.
 */
export async function devHostId(): Promise<string | null> {
  if (!devBypassAuth()) return null;
  const u = await prisma.user.findFirst({ select: { id: true }, orderBy: { id: "asc" } });
  return u?.id ?? null;
}
