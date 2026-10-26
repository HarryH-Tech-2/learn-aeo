"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { POLL_MS, isValidCode } from "@/lib/classroom";
import type { RoomView } from "@/lib/classroom-server";
import { Backdrop, COLOURS, Confetti, CountUp, GLYPH, GetReady, SHAPES, TEAM_GLYPHS, buzz, ordinal, teamGlyph, useSmoothClock } from "@/components/classroom/shared";

type Me = { teamId: string; name: string };

/** Offered under the name box for teams that cannot agree on one. All pass cleanTeamName. */
const NAME_IDEAS = ["The Scarabs", "Team Anubis", "Nile Crocs", "Sphinx Squad", "Pyramid Kids", "Golden Owls", "Team Horus", "Desert Foxes", "Mummy Crew", "The Pharaohs", "Cobra Club", "Ra Rockets", "Lotus Legends", "Team Thoth"];

/** Shown one at a time while the class waits for the first question. */
const WAITING_FACTS = [
  "A cartouche is the oval ring drawn around a king’s or queen’s name.",
  "The animals and people in hieroglyphs face the start of the line, so you read towards their faces.",
  "The owl writes the sound m. You will meet it in a minute.",
  "Hieroglyphs were cracked in 1822, with the help of the Rosetta Stone.",
  "Scribes wrote the consonants and left the vowels out.",
];

/**
 * The first screen on a pupil's phone: the room they are joining, a name box with ideas to tap, a
 * look at how the team will appear on the teacher's screen, and Join.
 */
function JoinForm({ code, name, setName, busy, error, onSubmit }: { code: string; name: string; setName: (v: string) => void; busy: boolean; error: string | null; onSubmit: (e: React.FormEvent) => void }) {
  // the badge runs through the team signs until one is dealt at Join
  const [sign, setSign] = useState(0);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setSign((s) => (s + 1) % TEAM_GLYPHS.length), 900);
    return () => window.clearInterval(id);
  }, []);
  const typed = name.trim();
  const ideas = Array.from({ length: 4 }, (_, i) => NAME_IDEAS[(offset + i) % NAME_IDEAS.length]);

  return (
    <form onSubmit={onSubmit} className="mt-4 text-center">
      <p className="cq-float cq-halo inline-grid place-items-center w-24 h-24 rounded-full bg-obsidian-lighter text-5xl text-gold-300" style={GLYPH} aria-hidden="true">
        <span key={sign} className="cq-pop">
          {TEAM_GLYPHS[sign]}
        </span>
      </p>
      <h1 className="cq-rise font-display text-4xl text-sand-100 mt-4">
        Join the <span className="text-gradient-gold font-medium">quiz</span>
      </h1>
      <p className="mt-3 flex justify-center gap-1" aria-label={`Room ${code.split("").join(" ")}`}>
        {code.split("").map((ch, i) => (
          <span key={i} aria-hidden="true" className="cq-code-tile grid place-items-center w-8 h-10 border border-gold-500/50 bg-obsidian-lighter font-display text-2xl text-gold-300" style={{ animationDelay: `${i * 0.07}s, ${1 + i * 0.25}s` }}>
            {ch}
          </span>
        ))}
      </p>

      <div className="cq-rise cq-panel p-5 mt-6 text-left" style={{ animationDelay: "0.15s" }}>
        <label htmlFor="team-name" className="block font-body text-xs tracking-[0.25em] uppercase text-gold-500 mb-2">
          Your team name
        </label>
        <div className="relative">
          <input
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            required
            minLength={2}
            placeholder="e.g. The Scarabs"
            className="cq-name-input w-full bg-obsidian border border-gold-600/50 pl-4 pr-14 py-4 font-display text-2xl text-sand-100 placeholder:text-sand-600 focus:outline-none"
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="go"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-body text-xs text-sand-500 tabular-nums" aria-hidden="true">
            {name.length}/20
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 mb-2">
          <span className="font-body text-xs text-sand-400">Stuck? Tap one:</span>
          <button type="button" onClick={() => setOffset((o) => (o + 4) % NAME_IDEAS.length)} className="font-body text-xs text-gold-400 underline underline-offset-4">
            More ideas
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ideas.map((idea) => (
            <button key={idea} type="button" onClick={() => setName(idea)} className={`cq-pop font-body text-sm px-3 py-2 border transition-colors ${typed === idea ? "border-gold-400 bg-gold-500/20 text-sand-100" : "border-gold-700/40 text-sand-200"}`}>
              {idea}
            </button>
          ))}
        </div>

        {/* how the team will look on the teacher's screen */}
        <div className="mt-5 pt-4 border-t border-gold-700/25">
          <p className="font-body text-xs text-sand-400 mb-2">On your teacher’s screen:</p>
          <span className={`cq-answer cq-opt-1 inline-flex items-center gap-2 max-w-full font-display text-xl text-white pl-2 pr-4 py-2 ${typed.length >= 2 ? "cq-bob" : "opacity-50"}`}>
            <span className="relative grid place-items-center w-9 h-9 shrink-0 rounded-full bg-black/25 text-2xl" style={GLYPH} aria-hidden="true">
              {TEAM_GLYPHS[sign]}
            </span>
            <span className="relative truncate">{typed || "Your team"}</span>
          </span>
        </div>
      </div>

      {error && (
        <p className="cq-shake font-body text-sm text-terracotta mt-4" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || typed.length < 2} className="hero-cta w-full justify-center mt-6 disabled:opacity-40 disabled:saturate-50">
        <span className="hero-cta-text items-center">
          <span className="hero-cta-label">{busy ? "Joining…" : "Join the quiz"}</span>
          <span className="hero-cta-sub">No account · no email</span>
        </span>
      </button>
      <p className="font-body text-[11px] text-sand-500 mt-4">Your team name is shown on the teacher’s screen and deleted with the room after three hours.</p>
    </form>
  );
}

export default function PlayContent({ code: rawCode }: { code: string }) {
  const code = rawCode.toUpperCase();
  const valid = isValidCode(code);
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [view, setView] = useState<RoomView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<{ q: number; choice: number } | null>(null);
  const [fact, setFact] = useState(0);
  // this team's score and place before the question on screen, so the reveal can show what changed
  const [before, setBefore] = useState({ score: 0, rank: 0 });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`lh_play_${code}`);
      if (saved) setMe(JSON.parse(saved));
    } catch {}
  }, [code]);

  const poll = useCallback(async () => {
    try {
      const r = await fetch(`/api/class/${code}`, { cache: "no-store" });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error || "Room not found");
        return;
      }
      setError(null);
      setView((await r.json()) as RoomView);
    } catch {}
  }, [code]);

  useEffect(() => {
    if (!valid) return;
    poll();
    timer.current = window.setInterval(poll, POLL_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [valid, poll]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/class/${code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", name }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not join");
      const m = { teamId: d.teamId, name: d.name };
      setMe(m);
      try {
        window.localStorage.setItem(`lh_play_${code}`, JSON.stringify(m));
      } catch {}
      trackEvent("class_join", {});
      poll();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function answer(choice: number) {
    if (!me || !view || picked) return;
    const q = view.questionIndex;
    setPicked({ q, choice });
    buzz(30);
    try {
      await fetch(`/api/class/${code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "answer", teamId: me.teamId, questionIndex: q, choice }) });
      trackEvent("class_answer", { question: q });
    } catch {}
  }

  // reset the pick when a new question opens
  useEffect(() => {
    if (view && picked && picked.q !== view.questionIndex) setPicked(null);
  }, [view, picked]);

  const mine = view?.standings.find((s) => s.id === me?.teamId) ?? null;
  const q = view?.question;
  const phase = view?.phase;
  const questionIndex = view?.questionIndex;
  const { ms, lead } = useSmoothClock(view);

  // The clock here reached zero: ask the server now, not at the next poll.
  const timeUp = phase === "question" && lead === 0 && ms === 0;
  useEffect(() => {
    if (timeUp) poll();
  }, [timeUp, poll]);

  const score = mine?.score ?? 0;
  const rank = mine?.rank ?? 0;
  const lastCorrect = mine?.lastCorrect ?? null;
  useEffect(() => {
    if (phase === "question") setBefore({ score, rank });
    // the phone answers the reveal with a buzz: two short for right, one long for wrong
    if (phase === "reveal" && lastCorrect !== null) buzz(lastCorrect ? [40, 60, 40] : 220);
    // scores only change at a reveal: one snapshot per question is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex]);

  useEffect(() => {
    if (phase !== "lobby") return;
    const id = window.setInterval(() => setFact((f) => (f + 1) % WAITING_FACTS.length), 5000);
    return () => window.clearInterval(id);
  }, [phase]);

  const secs = Math.ceil(ms / 1000);
  const answering = phase === "question" && lead === 0;
  const urgent = answering && secs <= 5;
  const won = score - before.score;
  const moved = before.rank && rank ? before.rank - rank : 0;
  const avatar = me ? teamGlyph(me.teamId) : "𓂀";

  return (
    // always the dark colours (hero-media), like the projector's stage
    <main className="hero-media relative min-h-screen bg-obsidian text-sand-100 flex flex-col">
      <Backdrop sparse danger={urgent && !picked} />
      {me && view?.phase === "finished" && mine && mine.rank <= 3 && <Confetti count={60} />}
      <header className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between font-body text-[11px] tracking-[0.2em] uppercase text-sand-500">
        <span>
          Room <span className="text-gold-300">{code}</span>
        </span>
        {me && (
          <span className="flex items-center gap-2 min-w-0 max-w-[70%] text-sand-200 normal-case tracking-normal text-sm">
            <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-gold-700/25 text-gold-300 text-lg" style={GLYPH} aria-hidden="true">
              {avatar}
            </span>
            <span className="truncate">{me.name}</span>
            {mine && view && view.phase !== "lobby" && (
              <>
                {" "}· <CountUp value={mine.score} className="text-gold-300 tabular-nums" />
              </>
            )}
          </span>
        )}
      </header>

      <section className="relative z-10 flex-1 px-4 pb-8 max-w-md w-full mx-auto">
        {!valid && <p className="font-body text-sm text-terracotta text-center mt-10">That doesn’t look like a room code. Codes are six letters or numbers.</p>}
        {valid && error && !view && <p className="font-body text-sm text-terracotta text-center mt-10">{error}</p>}

        {valid && !me && (
          <JoinForm code={code} name={name} setName={setName} busy={busy} error={error} onSubmit={join} />
        )}

        {me && view && view.phase === "lobby" && (
          <div className="text-center mt-14">
            <p className="cq-float cq-halo inline-grid place-items-center w-32 h-32 rounded-full bg-obsidian-lighter text-7xl text-gold-300 mb-5" style={GLYPH} aria-hidden="true">
              {avatar}
            </p>
            <p className="cq-pop font-display text-3xl text-sand-100 break-words">You’re in, {me.name}.</p>
            <p className="font-body text-base text-sand-400 mt-2">
              Watch your teacher’s screen. The first question is coming
              <span className="cq-dots" aria-hidden="true">
                <i>.</i>
                <i>.</i>
                <i>.</i>
              </span>
            </p>
            <p className="font-body text-xs text-sand-600 mt-4">
              {view.teams.length} team{view.teams.length === 1 ? "" : "s"} in the room
            </p>
            <div className="cq-panel p-4 mt-8 text-left">
              <p className="font-body text-[11px] tracking-[0.2em] uppercase text-gold-500 mb-1">While you wait</p>
              <p key={fact} className="cq-rise font-body text-sm text-sand-200 min-h-[2.5rem]">
                {WAITING_FACTS[fact]}
              </p>
            </div>
          </div>
        )}

        {me && view && view.phase === "question" && lead > 0 && q && (
          <div className="mt-12">
            <GetReady lead={lead} index={view.questionIndex} total={view.total} kind={q.kind} small />
          </div>
        )}

        {me && view && answering && q && (
          <div className="mt-3">
            <div className="flex items-center justify-between font-body text-xs text-sand-500 mb-1.5">
              <span>
                Question {view.questionIndex + 1} of {view.total}
              </span>
              <span className={`font-display text-xl tabular-nums ${urgent ? "text-terracotta cq-urgent" : "text-sand-100"}`}>{secs}</span>
            </div>
            <div className="h-2 bg-gold-700/15 mb-4 overflow-hidden" aria-hidden="true">
              <div className={`h-full ${urgent ? "bg-terracotta" : "bg-gold-500"}`} style={{ width: `${(ms / view.questionMs) * 100}%`, transition: "width 0.12s linear" }} />
            </div>
            <div key={view.questionIndex}>
              <p className="cq-rise font-display text-xl text-sand-100 text-center mb-3">{q.prompt}</p>
              {q.glyph && (
                <p className="cq-glyph-in text-6xl text-gold-300 text-center mb-4 leading-none" style={GLYPH} aria-hidden="true">
                  {q.glyph}
                </p>
              )}
              {picked ? (
                <div className={`cq-pop cq-answer ${COLOURS[picked.choice]} text-white p-6 text-center`}>
                  <span className="cq-opt-mark" aria-hidden="true">
                    {SHAPES[picked.choice]}
                  </span>
                  <p className="cq-opt-badge mx-auto" aria-hidden="true">
                    {SHAPES[picked.choice]}
                  </p>
                  <p className={q.optionsAreGlyphs ? "text-5xl mt-1" : "font-display text-2xl mt-1"} style={q.optionsAreGlyphs ? GLYPH : undefined}>
                    {q.options[picked.choice]}
                  </p>
                  <p className="font-body text-sm text-white/85 mt-3">Locked in. Eyes on your teacher’s screen.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-4 pb-1.5" role="group" aria-label="Answers">
                  {q.options.map((o, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => answer(i)}
                      className={`cq-rise cq-answer ${COLOURS[i]} text-white p-4 min-h-[7.5rem] flex flex-col items-center justify-center gap-2`}
                      style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                      aria-label={`Answer ${SHAPES[i]}: ${o}`}
                    >
                      <span className="cq-opt-mark" aria-hidden="true">
                        {SHAPES[i]}
                      </span>
                      <span className="cq-opt-badge" aria-hidden="true">
                        {SHAPES[i]}
                      </span>
                      <span className={q.optionsAreGlyphs ? "relative text-4xl" : "relative font-display text-lg leading-tight"} style={q.optionsAreGlyphs ? GLYPH : undefined}>
                        {o}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {me && view && view.phase === "reveal" && q && (
          <div key={view.questionIndex} className="mt-8 text-center" aria-live="polite">
            {mine?.lastCorrect === true && (
              <>
                <p className="cq-pop inline-grid place-items-center w-24 h-24 rounded-full bg-turquoise text-white text-5xl mb-3">✓</p>
                <p className="font-display text-3xl text-turquoise">Correct!</p>
                {mine.streak >= 2 && (
                  <p className="cq-pop inline-block mt-2 px-3 py-1 bg-terracotta text-white font-body text-sm font-semibold uppercase tracking-wider" style={{ animationDelay: "0.4s" }}>
                    {mine.streak} in a row
                  </p>
                )}
                {won > 0 && won <= 1000 && (
                  <p className="cq-pop font-display text-4xl text-gold-300 mt-1 tabular-nums" style={{ animationDelay: "0.25s" }}>
                    +{won}
                  </p>
                )}
              </>
            )}
            {mine?.lastCorrect === false && (
              <>
                <p className="cq-shake inline-grid place-items-center w-24 h-24 rounded-full bg-terracotta text-white text-5xl mb-3">✕</p>
                <p className="font-display text-3xl text-sand-200">Not this time.</p>
              </>
            )}
            {mine?.lastCorrect === null && <p className="cq-rise font-display text-3xl text-sand-300">Too slow that time.</p>}
            {q.answer !== undefined && (
              <p className="cq-rise font-body text-sm text-sand-300 mt-4" style={{ animationDelay: "0.3s" }}>
                The answer was <span className="text-sand-100 font-medium" style={q.optionsAreGlyphs ? GLYPH : undefined}>{q.options[q.answer]}</span>. {q.explain}
              </p>
            )}
            {mine && (
              <p className="cq-rise font-body text-base text-gold-300 mt-5" style={{ animationDelay: "0.45s" }}>
                {mine.score} points · {mine.rank === 1 ? "in the lead" : `${ordinal(mine.rank)} place`}
                {moved > 0 && <span className="ml-2 font-semibold text-turquoise">▲ up {moved}</span>}
              </p>
            )}
          </div>
        )}

        {me && view && view.phase === "finished" && (
          <div className="mt-10 text-center">
            <p className={`cq-glyph-in inline-grid place-items-center w-32 h-32 rounded-full text-7xl mb-4 ${mine?.rank === 1 ? "cq-halo bg-gold-400 text-obsidian" : "bg-obsidian-lighter text-gold-300"}`} style={GLYPH} aria-hidden="true">
              {avatar}
            </p>
            <p className="cq-pop font-display text-4xl text-sand-100" style={{ animationDelay: "0.3s" }}>
              {mine?.rank === 1 ? "Gold!" : mine ? `${ordinal(mine.rank)} place` : "Quiz over"}
            </p>
            {mine && <p className="font-body text-base text-gold-300 mt-2">{mine.score} points</p>}
            <p className="font-body text-sm text-sand-400 mt-6">Write your name in hieroglyphs at home:</p>
            <Link href="/translate-name-to-hieroglyphics?utm_source=classroom" className="btn-primary text-sm py-3 px-6 mt-3 inline-flex">
              Name translator
            </Link>
          </div>
        )}
      </section>
      <footer className="relative z-10 px-4 pb-4 text-center font-body text-[11px] text-sand-600">
        <Link href="/" className="text-gold-500 underline underline-offset-4">
          learnhieroglyphics.com
        </Link>{" "}
        · no accounts, no tracking beyond the team name
      </footer>
    </main>
  );
}
