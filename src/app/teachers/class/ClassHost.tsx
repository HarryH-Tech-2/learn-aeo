"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent } from "@/lib/analytics";
import { POLL_MS } from "@/lib/classroom";
import type { RoomView } from "@/lib/classroom-server";
import { Backdrop, COLOURS, Confetti, CountUp, GLYPH, GetReady, KIND_LABEL, SHAPES, TimerRing, teamGlyph, useFlip, useQuizSound, useSmoothClock, type QuizSound } from "@/components/classroom/shared";
import { useStartTrial } from "@/components/classroom/StartTrial";
import type { ClassroomAccess } from "@/lib/licence";
import ClassFeedback from "./ClassFeedback";
import ClassWelcome from "./ClassWelcome";

type Before = Record<string, { score: number; rank: number }>;

/**
 * Classroom mode is part of the Classroom and School licences, or the free 7-day trial: `access.licensed` says
 * this teacher can open a room now; `trialAvailable` puts the trial first on the locked screen.
 */
export default function ClassHost({ signedIn, access, price }: { signedIn: boolean; access: ClassroomAccess; price: string }) {
  const { licensed, trialAvailable, trial } = access;
  const { openAuthModal } = useAuthModal();
  const startTrial = useStartTrial("class_page");
  const [code, setCode] = useState<string | null>(null);
  const [view, setView] = useState<RoomView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // each team's score and place before the question on screen, so the reveal can show what changed
  const [before, setBefore] = useState<Before>({});
  const timer = useRef<number | null>(null);
  const { sound, muted, toggle: toggleSound } = useQuizSound();

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("lh_class_code");
      if (saved) setCode(saved);
    } catch {}
    // back from the sign-in box that a "Start free trial" button opened: start it without a second click
    if (signedIn && !licensed && trialAvailable && new URLSearchParams(window.location.search).get("trial") === "1") {
      // (drops only ?trial, so campaign tags on the address are still there for CampaignTracker)
      const url = new URL(window.location.href);
      url.searchParams.delete("trial");
      window.history.replaceState(null, "", url.pathname + url.search);
      void startTrial.start({ fromClick: false });
    }
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const poll = useCallback(async () => {
    if (!code) return;
    try {
      const r = await fetch(`/api/class/${code}`, { cache: "no-store" });
      if (r.status === 404 || r.status === 410) {
        setError("That room has closed. Open a new one.");
        setCode(null);
        try {
          window.sessionStorage.removeItem("lh_class_code");
        } catch {}
        return;
      }
      const v = (await r.json()) as RoomView;
      setView(v);
    } catch {}
  }, [code]);

  useEffect(() => {
    if (!code) return;
    poll();
    timer.current = window.setInterval(poll, POLL_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [code, poll]);

  const { ms, lead } = useSmoothClock(view);
  const phase = view?.phase;
  const questionIndex = view?.questionIndex;
  const teamCount = view?.teams.length ?? 0;
  const leadSec = phase === "question" && lead > 0 ? Math.ceil(lead / 1000) : 0;
  const thinking = phase === "question" && lead === 0 && ms > 0;
  const secs = Math.ceil(ms / 1000);
  const urgent = thinking && secs <= 5;

  // The clock here reached zero: ask the server now, not at the next poll, so the answer shows on the beat.
  const timeUp = phase === "question" && lead === 0 && ms === 0;
  useEffect(() => {
    if (timeUp) poll();
  }, [timeUp, poll]);

  useEffect(() => {
    if (phase !== "question" || !view) return;
    setBefore(Object.fromEntries(view.standings.map((s) => [s.id, { score: s.score, rank: s.rank }])));
    // scores only change at a reveal: one snapshot per question is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex]);

  // ── sound ──
  const lastTeams = useRef(0);
  useEffect(() => {
    if (teamCount > lastTeams.current && phase === "lobby") sound.join();
    lastTeams.current = teamCount;
  }, [teamCount, phase, sound]);
  const lastLead = useRef(0);
  useEffect(() => {
    if (leadSec > 0) sound.count();
    else if (lastLead.current > 0 && phase === "question") sound.count(true);
    lastLead.current = leadSec;
  }, [leadSec, phase, sound]);
  useEffect(() => {
    sound.music(thinking, urgent);
    return () => sound.music(false);
  }, [thinking, urgent, sound]);
  useEffect(() => {
    if (urgent) sound.tick();
  }, [urgent, secs, sound]);
  useEffect(() => {
    if (phase === "reveal") sound.reveal();
  }, [phase, questionIndex, sound]);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/class", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not open a room");
      setCode(d.code);
      try {
        window.sessionStorage.setItem("lh_class_code", d.code);
      } catch {}
      trackEvent("class_room_created", {});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function act(action: "start" | "reveal" | "next" | "end") {
    if (!code) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/class/${code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (r.ok) setView((await r.json()) as RoomView);
      trackEvent("class_host_action", { action, question: view?.questionIndex ?? -1 });
    } finally {
      setBusy(false);
    }
  }

  function closeRoom() {
    act("end");
    try {
      window.sessionStorage.removeItem("lh_class_code");
    } catch {}
  }

  function toggleFullscreen() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch {}
  }

  if (!signedIn) {
    return (
      <Shell>
        <ClassWelcome
          action={{
            label: "Sign in to try it free",
            sub: "7-day free trial · no card needed",
            onClick: () => {
              trackEvent("class_trial_click", { location: "class_page_signed_out" });
              openAuthModal({ next: "/teachers/class?trial=1" });
            },
          }}
        />
      </Shell>
    );
  }

  if (!licensed && trialAvailable) {
    return (
      <Shell>
        <ClassWelcome
          locked
          error={startTrial.error}
          action={{
            label: startTrial.busy ? "Starting your trial…" : "Start free 7-day trial",
            sub: "No card needed · then a Classroom licence to carry on",
            busy: startTrial.busy,
            onClick: () => void startTrial.start(),
          }}
          secondary={{
            label: `Or buy the Classroom licence · ${price} a year`,
            onClick: () => {
              trackEvent("class_paywall_click", { location: "trial_offer" });
              window.location.href = "/checkout?plan=classroom";
            },
          }}
        />
      </Shell>
    );
  }

  if (!licensed) {
    return (
      <Shell>
        <ClassWelcome
          locked
          note={trial ? "Your free trial has ended. Your rooms and the quiz are waiting: the Classroom licence opens them again." : undefined}
          action={{
            label: "Unlock Classroom mode",
            sub: `Classroom licence · ${price} a year · 30 pupils`,
            onClick: () => {
              trackEvent("class_paywall_click", {});
              window.location.href = "/checkout?plan=classroom";
            },
          }}
        />
      </Shell>
    );
  }

  if (!code || !view) {
    return (
      <Shell>
        <ClassWelcome
          action={{ label: busy ? "Opening…" : code ? "Reconnecting…" : "Open a room", sub: "Ready in ten seconds", busy, onClick: open }}
          error={error}
          trialBadge={trial?.active ? { daysLeft: trial.daysLeft, price } : undefined}
        />
      </Shell>
    );
  }

  const joinUrl = `learnhieroglyphics.com/play/${view.code}`;
  const q = view.question;
  const revealed = view.phase === "reveal";
  const answeredAll = view.teams.length > 0 && view.answered >= view.teams.length;

  return (
    // The stage: always the dark colours (hero-media), no site navigation, the quiz and nothing else.
    <main className="hero-media relative min-h-screen bg-obsidian text-sand-100 flex flex-col">
      <Backdrop danger={urgent} />
      {confetti && <Confetti count={140} />}
      <h1 className="sr-only">Classroom mode: live quiz</h1>

      {/* Top bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 sm:px-8 py-3 font-body text-xs tracking-[0.2em] uppercase text-sand-400">
        <span className="flex items-center gap-2 text-gold-400">
          <span className="text-2xl leading-none" style={GLYPH} aria-hidden="true">
            𓂀
          </span>
          <span className="hidden sm:inline">Learn Hieroglyphics</span>
        </span>
        {view.phase !== "lobby" && (
          <span>
            Join at <span className="normal-case tracking-normal text-sand-200 text-sm">{joinUrl}</span>
          </span>
        )}
        <span className="flex items-center gap-4">
          <span>
            Teams <span className="text-sand-100 text-base align-middle">{view.teams.length}</span>
          </span>
          <button type="button" onClick={toggleSound} aria-pressed={!muted} className="cq-chip">
            {muted ? "Sound off" : "Sound on"}
          </button>
          <button type="button" onClick={toggleFullscreen} className="cq-chip hidden sm:inline-flex">
            {fullscreen ? "Exit full screen" : "Full screen"}
          </button>
          <button type="button" onClick={closeRoom} className="underline underline-offset-4 hover:text-terracotta">
            Close room
          </button>
        </span>
      </header>

      <section className="relative z-10 flex-1 flex flex-col justify-center w-full max-w-7xl mx-auto px-4 sm:px-8 pb-8">
        {view.phase === "lobby" && <Lobby view={view} joinUrl={joinUrl} busy={busy} onStart={() => act("start")} />}

        {view.phase === "question" && lead > 0 && q && (
          <div className="py-10">
            <GetReady lead={lead} index={view.questionIndex} total={view.total} kind={q.kind} />
          </div>
        )}

        {((view.phase === "question" && lead === 0) || revealed) && q && (
          <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-6 items-start">
            <div className="cq-panel overflow-x-clip p-6 sm:p-8 text-center">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="text-left min-w-0">
                  <span className="font-body text-xs tracking-[0.25em] uppercase text-gold-500">{KIND_LABEL[q.kind] ?? "Question"}</span>
                  {/* one pip per question: done, this one, still to come */}
                  <span className="mt-2 flex gap-1.5" role="img" aria-label={`Question ${view.questionIndex + 1} of ${view.total}`}>
                    {Array.from({ length: view.total }, (_, i) => (
                      <span key={i} className={`h-2 transition-all duration-500 ${i < view.questionIndex ? "w-2 sm:w-4 bg-gold-600/70" : i === view.questionIndex ? "w-5 sm:w-9 bg-gold-300" : "w-2 sm:w-4 bg-gold-700/20"}`} />
                    ))}
                  </span>
                </div>
                <TimerRing ms={ms} total={view.questionMs} done={revealed} />
              </div>

              {/* keyed by question, so each one arrives fresh */}
              <div key={view.questionIndex}>
                <h2 className="cq-rise font-display text-3xl sm:text-4xl text-sand-100">{q.prompt}</h2>
                {q.glyph && (
                  <div className="relative my-5">
                    {/* rays turning behind the sign */}
                    <span className="cq-rays" aria-hidden="true" />
                    <p className={`cq-glyph-in relative ${q.glyph.length > 4 ? "text-6xl sm:text-7xl" : "text-8xl sm:text-9xl"} text-gold-300 leading-none`} style={GLYPH} aria-hidden="true">
                      {q.kind === "cartouche" ? <span className="cartouche-ring inline-block px-6">{q.glyph}</span> : <span className={revealed ? "" : "cq-bob inline-block"}>{q.glyph}</span>}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4 mt-5 pb-1.5">
                  {q.options.map((o, i) => {
                    const right = revealed && q.answer === i;
                    const chose = view.distribution?.[i] ?? 0;
                    return (
                      <div
                        key={i}
                        className={`cq-rise cq-answer ${COLOURS[i]} ${revealed && !right ? "opacity-40 saturate-50" : ""} ${right ? "cq-correct" : ""} text-white p-4 sm:p-5 text-left flex items-center gap-4 transition-[opacity,filter] duration-500`}
                        style={{ animationDelay: `${0.15 + i * 0.09}s` }}
                      >
                        {/* at the reveal: how much of the class chose this one */}
                        {revealed && view.teams.length > 0 && <span className="cq-share absolute inset-y-0 left-0 bg-black/25" style={{ width: `${(chose / view.teams.length) * 100}%` }} aria-hidden="true" />}
                        <span className="cq-opt-mark" aria-hidden="true">
                          {SHAPES[i]}
                        </span>
                        <span className="cq-opt-badge" aria-hidden="true">
                          {SHAPES[i]}
                        </span>
                        <span className={`relative ${q.optionsAreGlyphs ? "text-5xl sm:text-6xl" : "font-display text-xl sm:text-3xl"}`} style={q.optionsAreGlyphs ? GLYPH : undefined}>
                          {o}
                        </span>
                        {revealed && (
                          <span className="cq-pop relative ml-auto flex items-center gap-2 font-display text-2xl sm:text-3xl tabular-nums" style={{ animationDelay: "0.3s" }}>
                            {chose}
                            {right && <span className="text-4xl">✓</span>}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {revealed && (
                <div className="mt-5">
                  {q.explain && <p className="cq-rise font-body text-lg sm:text-xl text-sand-200">{q.explain}</p>}
                  {view.fastest && (
                    <p className="cq-pop inline-block mt-3 px-4 py-1.5 border border-gold-400/60 bg-gold-500/15 font-body text-sm sm:text-base text-gold-300" style={{ animationDelay: "0.6s" }}>
                      Fastest: <span className="text-sand-100 font-semibold">{view.fastest.name}</span> in {(view.fastest.ms / 1000).toFixed(1)} s
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 min-w-0">
              <Leaderboard view={view} before={before} />
              {view.phase === "question" ? (
                <button type="button" onClick={() => act("reveal")} disabled={busy} className={`${answeredAll ? "btn-primary gp-ring" : "btn-secondary"} w-full justify-center text-sm py-3 px-6`}>
                  {answeredAll ? "Everyone’s in: reveal" : "Reveal now"}
                </button>
              ) : (
                <button type="button" onClick={() => act("next")} disabled={busy} className="btn-primary gp-ring w-full justify-center text-base py-4 px-6">
                  {view.questionIndex + 1 >= view.total ? "Show the podium" : "Next question"}
                </button>
              )}
            </div>
          </div>
        )}

        {view.phase === "finished" && (
          <>
            <Podium view={view} sound={sound} onWinner={() => setConfetti(true)} />
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <button type="button" onClick={() => { setCode(null); setView(null); setConfetti(false); try { window.sessionStorage.removeItem("lh_class_code"); } catch {} }} className="btn-primary text-sm py-3 px-8">
                Open a new room
              </button>
              <Link href="/teachers/worksheet" className="btn-secondary text-sm py-3 px-8">
                Hand out the worksheet
              </Link>
            </div>
            <div className="w-full max-w-2xl mx-auto mt-10">
              <ClassFeedback teams={view.teams.length} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Lobby({ view, joinUrl, busy, onStart }: { view: RoomView; joinUrl: string; busy: boolean; onStart: () => void }) {
  const n = view.teams.length;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-stretch">
      <div className="cq-panel p-5 sm:p-10 text-center">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-sand-400">On your phone, go to</p>
        <p className="font-display text-2xl sm:text-5xl text-sand-100 mt-3 break-all">{joinUrl}</p>
        <p className="font-body text-sm tracking-[0.3em] uppercase text-sand-400 mt-8">Room code</p>
        <p className="mt-3 flex justify-center gap-1.5 sm:gap-2.5" aria-label={`Room code ${view.code.split("").join(" ")}`}>
          {view.code.split("").map((ch, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="cq-code-tile grid place-items-center w-10 h-14 sm:w-20 sm:h-28 border border-gold-500/60 bg-obsidian-lighter font-display text-4xl sm:text-7xl font-medium text-gold-300"
              style={{ animationDelay: `${i * 0.09}s, ${1 + i * 0.25}s` }}
            >
              {ch}
            </span>
          ))}
        </p>
        <button type="button" onClick={onStart} disabled={busy || n === 0} className={`btn-primary text-base sm:text-lg py-4 px-6 sm:px-12 mt-9 disabled:opacity-40 ${n > 0 ? "gp-ring" : ""}`}>
          {n === 0 ? "Waiting for teams…" : `Start with ${n} team${n === 1 ? "" : "s"}`}
        </button>
      </div>
      <div className="cq-panel p-6 sm:p-8 min-h-[18rem]">
        <p className="flex items-center justify-between font-body text-xs tracking-[0.25em] uppercase text-gold-500 mb-5">
          <span>Teams in the room</span>
          <span key={n} className="cq-pop font-display text-4xl tracking-normal text-sand-100">
            {n}
          </span>
        </p>
        {n === 0 ? (
          <p className="font-body text-base text-sand-400">
            Nobody yet. Type a team name on your phone and you will appear here
            <span className="cq-dots" aria-hidden="true">
              <i>.</i>
              <i>.</i>
              <i>.</i>
            </span>
          </p>
        ) : (
          <ul className="flex flex-wrap gap-3" aria-live="polite">
            {view.teams.map((t, i) => (
              <li key={t.id} className="cq-pop max-w-full">
                {/* each team bobs to its own beat */}
                <span className={`cq-bob flex items-center gap-2 max-w-full font-display text-xl text-white pl-2 pr-4 py-2 ${COLOURS[i % COLOURS.length]} cq-answer`} style={{ animationDelay: `${-((i * 0.37) % 2)}s` }}>
                  <span className="relative grid place-items-center w-9 h-9 shrink-0 rounded-full bg-black/25 text-2xl" style={GLYPH} aria-hidden="true">
                    {teamGlyph(t.id)}
                  </span>
                  <span className="relative truncate">{t.name}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Leaderboard({ view, before }: { view: RoomView; before: Before }) {
  const rows = view.standings.slice(0, 8);
  const revealed = view.phase === "reveal";
  const list = useFlip<HTMLOListElement>(rows.map((s) => s.id).join(","));
  return (
    <aside className="cq-panel p-5" aria-live="polite">
      <p className="font-body text-xs tracking-[0.25em] uppercase text-gold-500 mb-3">{revealed ? "Leaderboard" : "Standings so far"}</p>
      {rows.length === 0 && <p className="font-body text-sm text-sand-500">No teams yet.</p>}
      <ol ref={list} className="space-y-1.5">
        {rows.map((s) => {
          const was = before[s.id];
          const won = revealed ? s.score - (was?.score ?? 0) : 0;
          const moved = revealed && was ? was.rank - s.rank : 0;
          const leading = s.rank === 1 && s.score > 0;
          return (
            <li key={s.id} data-id={s.id} className={`flex items-center justify-between gap-2 font-body text-base px-2.5 py-2 border ${leading ? "border-gold-400/70 bg-gold-500/15" : "border-gold-700/15 bg-obsidian/40"}`}>
              <span className="flex items-center gap-2 min-w-0 text-sand-100">
                <span className="w-5 text-center text-gold-500 tabular-nums shrink-0">{s.rank}</span>
                <span className={`grid place-items-center w-8 h-8 rounded-full text-xl shrink-0 ${leading ? "bg-gold-400 text-obsidian" : "bg-gold-700/20 text-gold-300"}`} style={GLYPH} aria-hidden="true">
                  {teamGlyph(s.id)}
                </span>
                <span className="truncate">{s.name}</span>
                {/* only climbs are shown: a class does not need its falls pointed out */}
                {moved > 0 && (
                  <span className="cq-pop text-xs shrink-0 text-turquoise" aria-label={`up ${moved}`}>
                    ▲{moved}
                  </span>
                )}
                {revealed && s.streak >= 2 && (
                  <span className="cq-pop text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-terracotta text-white shrink-0">{s.streak} in a row</span>
                )}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {revealed && s.lastCorrect !== null && (
                  <span key={`${view.questionIndex}-${won}`} className={`cq-pop text-sm font-semibold ${s.lastCorrect ? "text-turquoise" : "text-sand-500"}`}>
                    {s.lastCorrect ? (won > 0 && won <= 1000 ? `+${won}` : "✓") : "✕"}
                  </span>
                )}
                <CountUp value={s.score} className="text-gold-300 tabular-nums font-semibold" />
              </span>
            </li>
          );
        })}
      </ol>
      {view.phase === "question" && view.teams.length > 0 && (
        <div className="mt-4">
          {/* one dot per team, lit as the answers come in */}
          <div className="flex flex-wrap gap-1.5" aria-hidden="true">
            {view.teams.map((t, i) => (
              <span key={t.id} className={`h-3 w-3 rounded-full transition-all duration-300 ${i < view.answered ? "bg-turquoise scale-125" : "bg-gold-700/25"}`} />
            ))}
          </div>
          <p className="font-body text-xs text-sand-500 mt-2">
            {view.answered} of {view.teams.length} answered
          </p>
        </div>
      )}
    </aside>
  );
}

/**
 * The end of the quiz, told slowly: a drum roll, then third place steps up, another roll and second,
 * a longer roll and the winner, with the fanfare and the confetti. `shown` counts the steps revealed.
 */
function Podium({ view, sound, onWinner }: { view: RoomView; sound: QuizSound; onWinner: () => void }) {
  const [first, second, third] = view.standings;
  const places = [third, second, first].filter(Boolean).length;
  const [shown, setShown] = useState(0);
  const done = useRef(onWinner);
  useEffect(() => {
    done.current = onWinner;
  });

  useEffect(() => {
    if (places === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(places);
      done.current();
      return;
    }
    const timers: number[] = [];
    let t = 300;
    for (let step = 1; step <= places; step++) {
      const last = step === places;
      const roll = last ? 2600 : 1500;
      timers.push(window.setTimeout(() => sound.drumRoll(roll / 1000), t));
      t += roll;
      timers.push(
        window.setTimeout(() => {
          setShown(step);
          if (last) {
            sound.fanfare();
            done.current();
          } else sound.step3();
        }, t),
      );
      t += 500;
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [places, sound]);

  // revealed from the bottom place up: with three teams, third is step 1, second step 2, first step 3
  const stepOf = (rank: number) => places - rank + 1;
  const steps = [
    { s: second, height: "h-28 sm:h-40", tone: "bg-[#8d99a8]" },
    { s: first, height: "h-40 sm:h-56", tone: "bg-[#c9962e]" },
    { s: third, height: "h-20 sm:h-28", tone: "bg-[#a8653a]" },
  ];
  const rest = view.standings.slice(3, 12);
  const finished = shown >= places;
  return (
    <div className="cq-panel p-6 sm:p-10 text-center">
      <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Final standings</p>
      <h2 className="font-display text-4xl sm:text-6xl text-sand-100 mb-8 min-h-[1.2em]">
        {!first ? (
          "Quiz over"
        ) : finished ? (
          <span key="won" className="cq-pop inline-block">
            {first.name} take the gold!
          </span>
        ) : (
          <span className="text-sand-400">
            And the winners are
            <span className="cq-dots" aria-hidden="true">
              <i>.</i>
              <i>.</i>
              <i>.</i>
            </span>
          </span>
        )}
      </h2>
      {first && (
        <div className="flex items-end justify-center gap-2 sm:gap-4 max-w-3xl mx-auto min-h-[20rem]">
          {steps.map(({ s, height, tone }, i) => {
            if (!s) return <div key={i} className="flex-1" />;
            const up = shown >= stepOf(s.rank);
            return (
              <div key={s.id} className="flex-1 min-w-0">
                {up ? (
                  <div className="cq-pop">
                    <p className={`mx-auto grid place-items-center rounded-full mb-2 ${s.rank === 1 ? "cq-halo w-20 h-20 text-5xl bg-gold-400 text-obsidian" : "w-14 h-14 text-3xl bg-gold-700/25 text-gold-300"}`} style={GLYPH} aria-hidden="true">
                      {teamGlyph(s.id)}
                    </p>
                    <p className={`font-display text-sand-100 leading-tight break-words ${s.rank === 1 ? "text-lg sm:text-4xl" : "text-base sm:text-3xl"}`}>{s.name}</p>
                    <p className="font-body text-sm sm:text-lg text-gold-300 tabular-nums mb-2">{s.score}</p>
                  </div>
                ) : (
                  <p className="cq-urgent font-display text-5xl text-gold-500/60 mb-4" aria-hidden="true">
                    ?
                  </p>
                )}
                <div className={`cq-step ${height} ${tone} ${up ? "" : "opacity-40"} grid place-items-center font-display text-4xl sm:text-6xl text-white/90 transition-opacity duration-500`} style={{ animationDelay: `${0.15 * i}s` }}>
                  {s.rank}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {rest.length > 0 && finished && (
        <ol className="max-w-lg mx-auto space-y-2 mt-8">
          {rest.map((s, i) => (
            <li key={s.id} className="cq-rise flex items-center justify-between gap-3 px-4 py-2.5 border border-gold-700/20" style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
              <span className="font-display text-lg text-sand-100 min-w-0 truncate">
                <span className="text-gold-500 mr-3">{s.rank}</span>
                {s.name}
              </span>
              <span className="font-body text-sm text-gold-300 tabular-nums shrink-0">{s.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** The page around the quiz before a room is open: the site's own navigation and footer. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 lg:pt-28 pb-16">{children}</section>
      <Footer />
    </main>
  );
}
