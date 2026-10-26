import { describe, it, expect } from "vitest";
import {
  QUESTION_MS,
  ROOM_TTL_MS,
  buildQuiz,
  canAnswer,
  cleanTeamName,
  effectivePhase,
  generateCode,
  initialRoom,
  isExpired,
  isValidCode,
  msLeft,
  pointsFor,
  distribution,
  fastest,
  leadLeft,
  publicQuestion,
  reduceRoom,
  scoreTeam,
  standings,
  type Team,
} from "../classroom";
import { seededRandom } from "../daily";

describe("codes and names", () => {
  it("makes 6-character codes without ambiguous letters", () => {
    for (let i = 0; i < 50; i++) {
      const c = generateCode(seededRandom(i));
      expect(c).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
      expect(isValidCode(c)).toBe(true);
    }
    expect(isValidCode("ABC01O")).toBe(false);
    expect(isValidCode("abcdef")).toBe(false);
  });
  it("cleans team names", () => {
    expect(cleanTeamName("  The   Scarabs ")).toBe("The Scarabs");
    expect(cleanTeamName("x")).toBeNull();
    expect(cleanTeamName("http://evil")).toBeNull();
    expect(cleanTeamName("<script>")).toBeNull();
    expect(cleanTeamName("Team Ra’s Kids!")).toBe("Team Ra’s Kids!");
  });
});

describe("quiz bank", () => {
  it("builds a mixed, deterministic bank with four unique options each", () => {
    const a = buildQuiz(11);
    const b = buildQuiz(11);
    expect(a).toEqual(b);
    expect(a.length).toBe(10);
    const kinds = new Set(a.map((q) => q.kind));
    expect(kinds.has("name")).toBe(true);
    expect(kinds.has("sound")).toBe(true);
    expect(kinds.has("animal")).toBe(true);
    expect(kinds.has("cartouche")).toBe(true);
    for (const q of a) {
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      if (q.kind === "animal") expect(q.optionsAreGlyphs).toBe(true);
      if (q.kind !== "animal") expect(q.glyph).toBeTruthy();
    }
  });
  it("hides the answer until revealed", () => {
    const q = buildQuiz(2)[0];
    expect(publicQuestion(q, false)).not.toHaveProperty("answer");
    expect(publicQuestion(q, true).answer).toBe(q.answer);
  });
});

describe("room state machine", () => {
  it("walks lobby → question → reveal → … → finished", () => {
    let s = initialRoom(2);
    expect(reduceRoom(s, "next", 0)).toBe(s);
    s = reduceRoom(s, "start", 1000);
    expect(s.phase).toBe("question");
    expect(s.questionIndex).toBe(0);
    expect(msLeft(s, 6000)).toBe(QUESTION_MS - 5000);
    expect(canAnswer(s, 0, 6000)).toBe(true);
    expect(canAnswer(s, 1, 6000)).toBe(false);
    expect(effectivePhase(s, 1000 + QUESTION_MS)).toBe("reveal");
    expect(canAnswer(s, 0, 1000 + QUESTION_MS)).toBe(false);
    s = reduceRoom(s, "reveal", 5000);
    expect(s.phase).toBe("reveal");
    s = reduceRoom(s, "next", 9000);
    expect(s.questionIndex).toBe(1);
    s = reduceRoom(s, "next", 30000);
    expect(s.phase).toBe("finished");
    expect(reduceRoom(initialRoom(3), "end", 0).phase).toBe("finished");
  });

  it("scores fast correct answers higher and ranks teams", () => {
    expect(pointsFor(true, 0)).toBe(1000);
    expect(pointsFor(true, QUESTION_MS)).toBe(500);
    expect(pointsFor(true, QUESTION_MS / 2)).toBe(750);
    expect(pointsFor(false, 0)).toBe(0);
    const quiz = buildQuiz(5, 2);
    let s = reduceRoom(initialRoom(2), "start", 0);
    s = reduceRoom(s, "next", 1000);
    const right = quiz[0].answer;
    const wrong = (right + 1) % 4;
    const teams: Team[] = [
      { id: "a", name: "Scarabs", answers: { "0": { choice: right, at: 2000 }, "1": { choice: quiz[1].answer, at: 1000 + 10000 } }, lastSeenAt: 0 },
      { id: "b", name: "Cobras", answers: { "0": { choice: wrong, at: 500 } }, lastSeenAt: 0 },
    ];
    expect(scoreTeam(quiz, teams[1].answers, s)).toBe(0);
    const st = standings(quiz, teams, s);
    expect(st[0].name).toBe("Scarabs");
    expect(st[0].rank).toBe(1);
    expect(st[0].score).toBeGreaterThan(1000);
    // a slow answer stays slow once the next question has opened
    const slow = { "0": { choice: right, at: 20000, ms: QUESTION_MS } };
    expect(scoreTeam(quiz, slow, s)).toBe(500);
    expect(st[0].lastCorrect).toBe(true);
    expect(st[0].streak).toBe(2);
    expect(st[1].streak).toBe(0);
    expect(distribution(quiz, teams, 0)[right]).toBe(1);
    expect(distribution(quiz, teams, 0)[wrong]).toBe(1);
    expect(fastest(quiz, [{ ...teams[0], answers: slow }], 0)).toEqual({ name: "Scarabs", ms: QUESTION_MS });
    // a question opened in the future (the "get ready" count) cannot be answered yet
    const soon = reduceRoom(initialRoom(2), "start", 5000);
    expect(leadLeft(soon, 2000)).toBe(3000);
    expect(canAnswer(soon, 0, 2000)).toBe(false);
    expect(msLeft(soon, 2000)).toBe(QUESTION_MS);
    expect(canAnswer(soon, 0, 5000)).toBe(true);
    expect(st[1].lastCorrect).toBeNull();
  });

  it("expires after three hours", () => {
    expect(isExpired(0, ROOM_TTL_MS - 1)).toBe(false);
    expect(isExpired(0, ROOM_TTL_MS)).toBe(true);
  });
});
