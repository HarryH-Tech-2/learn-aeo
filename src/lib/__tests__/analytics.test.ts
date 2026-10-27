import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  trackEvent,
  trackEventWhenReady,
  trackExerciseAnswer,
  trackExerciseComplete,
  setAnalyticsUserId,
} from "@/lib/analytics";

type GtagWindow = { gtag?: (...args: unknown[]) => void };

describe("analytics", () => {
  let gtag: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    gtag = vi.fn();
    (globalThis as unknown as { window: GtagWindow }).window = {
      gtag: gtag as unknown as GtagWindow["gtag"],
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: GtagWindow }).window;
  });

  it("forwards events to window.gtag", () => {
    trackEvent("thing_happened", { foo: "bar" });
    expect(gtag).toHaveBeenCalledWith("event", "thing_happened", { foo: "bar" });
  });

  it("is a no-op when gtag is missing (no throw)", () => {
    (globalThis as unknown as { window: GtagWindow }).window = {};
    expect(() => trackEvent("x")).not.toThrow();
  });

  it("is a no-op on the server (no window)", () => {
    delete (globalThis as unknown as { window?: GtagWindow }).window;
    expect(() => trackEvent("x")).not.toThrow();
  });

  it("sends exercise_answer with correct as 0/1 and clipped question", () => {
    trackExerciseAnswer({
      exercise: "check",
      questionType: "choice",
      question: "🙂".repeat(200),
      correct: true,
    });
    expect(gtag).toHaveBeenCalledTimes(1);
    const [, name, params] = gtag.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(name).toBe("exercise_answer");
    expect(params.exercise).toBe("check");
    expect(params.question_type).toBe("choice");
    expect(params.correct).toBe(1);
    expect((params.question as string).length).toBeLessThanOrEqual(100);
  });

  it("sends exercise_complete with score/total/pct and optional attempts", () => {
    trackExerciseComplete({ exercise: "exercise", score: 4, total: 4, attempts: 6 });
    expect(gtag).toHaveBeenCalledWith("event", "exercise_complete", {
      exercise: "exercise",
      score: 4,
      total: 4,
      pct: 100,
      attempts: 6,
    });
  });

  it("omits attempts when not provided and rounds pct", () => {
    trackExerciseComplete({ exercise: "audit", score: 2, total: 3 });
    const [, , params] = gtag.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(params).toEqual({ exercise: "audit", score: 2, total: 3, pct: 67 });
  });

  describe("setAnalyticsUserId", () => {
    it("sets user_id on gtag when it is loaded", () => {
      setAnalyticsUserId("cm_user_1");
      expect(gtag).toHaveBeenCalledWith("set", { user_id: "cm_user_1" });
      expect((window as unknown as { __lhUserId?: string }).__lhUserId).toBe("cm_user_1");
    });

    it("parks the id for the gtag-init script when gtag has not loaded yet", () => {
      (globalThis as unknown as { window: GtagWindow }).window = {};
      expect(() => setAnalyticsUserId("cm_user_2")).not.toThrow();
      expect((window as unknown as { __lhUserId?: string }).__lhUserId).toBe("cm_user_2");
    });

    it("sends the same id only once", () => {
      setAnalyticsUserId("cm_user_3");
      setAnalyticsUserId("cm_user_3");
      expect(gtag).toHaveBeenCalledTimes(1);
    });
  });
});

describe("trackEventWhenReady", () => {
  type TimerWindow = GtagWindow & { setInterval: typeof setInterval; clearInterval: typeof clearInterval };
  let win: TimerWindow;

  beforeEach(() => {
    vi.useFakeTimers();
    win = { setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval };
    (globalThis as unknown as { window: TimerWindow }).window = win;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (globalThis as unknown as { window?: GtagWindow }).window;
  });

  it("sends straight away when gtag is already there", () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    trackEventWhenReady("coffee_view", { page: "/" });
    expect(gtag).toHaveBeenCalledWith("event", "coffee_view", { page: "/" });
  });

  it("waits for gtag to load, then sends once", () => {
    trackEventWhenReady("class_strip_view", { question_type: "schoology.com" });
    vi.advanceTimersByTime(1500);
    const gtag = vi.fn();
    win.gtag = gtag;
    vi.advanceTimersByTime(2000);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "class_strip_view", { question_type: "schoology.com" });
  });

  it("gives up after 20 s and can be cancelled", () => {
    const cancel = trackEventWhenReady("coffee_view");
    cancel();
    win.gtag = vi.fn();
    vi.advanceTimersByTime(5000);
    expect(win.gtag).not.toHaveBeenCalled();
    delete win.gtag;
    trackEventWhenReady("coffee_view");
    vi.advanceTimersByTime(21_000);
    const late = vi.fn();
    win.gtag = late;
    vi.advanceTimersByTime(5000);
    expect(late).not.toHaveBeenCalled();
  });
});
