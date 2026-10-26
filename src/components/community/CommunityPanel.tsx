"use client";

/**
 * The Community tab on the dashboard: learners' questions, answered by
 * other learners. Every account reads the list; opening a thread, asking
 * and answering are for members, and the server enforces that whatever the
 * client shows (src/app/api/community).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson, HttpError } from "@/lib/fetch-json";
import { BODY_MAX, TITLE_MAX, whenPosted, type Answer, type QuestionSummary, type QuestionThread } from "@/lib/community";
import { trackEvent } from "@/lib/analytics";

type Props = {
  /** null while the dashboard is still finding out */
  hasSubscription: boolean | null;
};

const FIELD = "w-full border border-gold-700/30 bg-obsidian-lighter px-3 py-2 font-body text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-500/60 outline-none";

export default function CommunityPanel({ hasSubscription }: Props) {
  const [questions, setQuestions] = useState<QuestionSummary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, QuestionThread | "loading" | "failed">>({});
  const [asking, setAsking] = useState(false);
  const paid = hasSubscription === true;

  useEffect(() => {
    fetchJson<{ questions: QuestionSummary[] }>("/api/community")
      .then((d) => setQuestions(d.questions))
      .catch(() => setFailed(true));
  }, []);

  const toggle = (id: string) => {
    if (open === id) return setOpen(null);
    setOpen(id);
    trackEvent("community_open", { locked: paid ? 0 : 1 });
    if (!paid || threads[id]) return;
    setThreads((t) => ({ ...t, [id]: "loading" }));
    fetchJson<{ thread: QuestionThread }>(`/api/community/${id}`)
      .then((d) => setThreads((t) => ({ ...t, [id]: d.thread })))
      .catch(() => setThreads((t) => ({ ...t, [id]: "failed" })));
  };

  const asked = (id: string, title: string, body: string) => {
    const q: QuestionSummary = { id, title, snippet: body.slice(0, 140), authorName: "You", createdAt: new Date().toISOString(), answers: 0, mine: true };
    setQuestions((qs) => [q, ...(qs ?? [])]);
    setThreads((t) => ({ ...t, [id]: { id, title, body, authorName: "You", createdAt: q.createdAt, answers: [] } }));
    setAsking(false);
    setOpen(id);
  };

  const answered = (id: string, answer: Answer) => {
    setThreads((t) => {
      const th = t[id];
      return typeof th === "object" ? { ...t, [id]: { ...th, answers: [...th.answers, answer] } } : t;
    });
    setQuestions((qs) => qs?.map((q) => (q.id === id ? { ...q, answers: q.answers + 1 } : q)) ?? null);
  };

  return (
    <div className="card-ancient p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-1">Community</p>
          <h2 className="font-display text-2xl text-sand-100">
            Ask the dig team{" "}
            {questions && <span className="text-gold-400 text-base align-middle ml-1">· {questions.length} {questions.length === 1 ? "question" : "questions"}</span>}
          </h2>
          <p className="font-body text-sm text-sand-400 mt-1 max-w-xl">Stuck on a sign, a reading, or a name? Other learners have probably wondered the same. Ask, or answer someone else.</p>
        </div>
        {paid ? (
          <button type="button" onClick={() => setAsking((a) => !a)} className="btn-primary py-3 px-5 text-sm">
            {asking ? "Never mind" : "Ask a question"}
          </button>
        ) : hasSubscription === false ? (
          <MembersNote what="Asking a question" />
        ) : null}
      </div>

      {asking && paid && <AskForm onAsked={asked} />}

      {failed ? (
        <p className="font-body text-sm text-terracotta">The board could not be reached. Try again in a moment.</p>
      ) : !questions ? (
        <p className="font-body text-sm text-sand-500">Fetching the questions…</p>
      ) : questions.length === 0 ? (
        <p className="font-body text-sm text-sand-500">No questions yet. Yours would be the first.</p>
      ) : (
        <ul className="divide-y divide-gold-700/20 border-t border-gold-700/20">
          {questions.map((q) => {
            const isOpen = open === q.id;
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => toggle(q.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left py-4 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-display text-lg text-sand-100 group-hover:text-gold-300 transition-colors leading-snug">{q.title}</p>
                    <span className="shrink-0 font-body text-xs text-sand-500 border border-gold-700/30 px-2 py-0.5 tabular-nums">
                      {q.answers} {q.answers === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                  {!isOpen && <p className="font-body text-sm text-sand-400 mt-1 leading-relaxed">{q.snippet}</p>}
                  <p className="font-body text-xs text-sand-500 mt-1.5">
                    {q.mine ? "You" : q.authorName} · {whenPosted(q.createdAt)}
                    {!paid && hasSubscription === false && <span className="ml-2 text-gold-500">· Members open the thread</span>}
                  </p>
                </button>
                {isOpen && (paid ? <Thread id={q.id} state={threads[q.id]} onAnswered={answered} /> : hasSubscription === false ? <LockedThread /> : null)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MembersNote({ what }: { what: string }) {
  return (
    <p className="font-body text-xs text-sand-500 max-w-[16rem] text-right">
      {what} comes with membership.{" "}
      <Link href="/pricing" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
        See plans
      </Link>
    </p>
  );
}

/** What a free account sees inside a thread: the door, not the room. */
function LockedThread() {
  return (
    <div className="mb-4 border border-gold-500/30 bg-gold-500/5 p-5">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-1">Members only</p>
      <p className="font-display text-xl text-sand-100 mb-2">The answers are inside</p>
      <p className="font-body text-sm text-sand-300 leading-relaxed mb-4 max-w-xl">
        Every account can read the question list. Opening a thread, asking your own question and answering others come with a paid plan, along with the seven sealed lessons.
      </p>
      <Link href="/pricing" className="btn-primary py-3 px-5 text-sm">
        See the plans
      </Link>
    </div>
  );
}

function Thread({ id, state, onAnswered }: { id: string; state: QuestionThread | "loading" | "failed" | undefined; onAnswered: (id: string, a: Answer) => void }) {
  if (!state || state === "loading") return <p className="font-body text-sm text-sand-500 pb-4">Opening the thread…</p>;
  if (state === "failed") return <p className="font-body text-sm text-terracotta pb-4">This thread could not be opened. Try again in a moment.</p>;
  return (
    <div className="pb-5">
      <p className="font-body text-sm text-sand-200 leading-relaxed whitespace-pre-line mb-5">{state.body}</p>
      {state.answers.length > 0 && (
        <ol className="space-y-3 mb-5">
          {state.answers.map((a) => (
            <li key={a.id} className="border-l-2 border-gold-700/40 pl-4">
              <p className="font-body text-sm text-sand-200 leading-relaxed whitespace-pre-line">{a.body}</p>
              <p className="font-body text-xs text-sand-500 mt-1">
                {a.mine ? "You" : a.authorName} · {whenPosted(a.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
      <ReplyForm id={id} onAnswered={onAnswered} />
    </div>
  );
}

function AskForm({ onAsked }: { onAsked: (id: string, title: string, body: string) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const { id } = await fetchJson<{ id: string }>("/api/community", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, body }) });
      trackEvent("community_ask");
      onAsked(id, title.trim(), body.trim());
    } catch (err) {
      setError(err instanceof HttpError && err.status === 403 ? "Asking a question comes with membership." : "That did not post. Check both fields and try again.");
    } finally {
      setSending(false);
    }
  };
  return (
    <form onSubmit={submit} className="mb-6 border border-gold-700/30 p-4 md:p-5 space-y-3">
      <label className="block">
        <span className="font-body text-xs tracking-[0.2em] uppercase text-sand-500">Your question</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX} required placeholder="e.g. Which way do I read this wall?" className={FIELD + " mt-1"} />
      </label>
      <label className="block">
        <span className="font-body text-xs tracking-[0.2em] uppercase text-sand-500">Details</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={BODY_MAX} required rows={4} placeholder="What you tried, what you saw, what you expected." className={FIELD + " mt-1"} />
      </label>
      {error && <p className="font-body text-sm text-terracotta">{error}</p>}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={sending || !title.trim() || !body.trim()} className="btn-primary py-3 px-5 text-sm disabled:opacity-50">
          {sending ? "Posting…" : "Post the question"}
        </button>
        <span className="font-body text-xs text-sand-500">Posted under your account name.</span>
      </div>
    </form>
  );
}

function ReplyForm({ id, onAnswered }: { id: string; onAnswered: (id: string, a: Answer) => void }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const { answer } = await fetchJson<{ answer: Answer }>(`/api/community/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      trackEvent("community_answer");
      onAnswered(id, answer);
      setBody("");
    } catch {
      setError("That reply did not post. Try again in a moment.");
    } finally {
      setSending(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={BODY_MAX} required rows={3} placeholder="Answer, or add what you found out." className={FIELD} />
      {error && <p className="font-body text-sm text-terracotta">{error}</p>}
      <button type="submit" disabled={sending || !body.trim()} className="border border-gold-500/50 px-4 py-2 font-body text-sm text-gold-300 hover:bg-gold-500/10 disabled:opacity-50">
        {sending ? "Posting…" : "Reply"}
      </button>
    </form>
  );
}
