"use client";

/**
 * Client side of the expedition state: a localStorage copy for instant load,
 * merged with the GameState row ("expedition") once the session is known,
 * and written back on every change. Mirrors the Decipher pattern.
 *
 * The activity log ("expedition-log") is written by the server (recordXP)
 * and only read here.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchJson } from "@/lib/fetch-json";
import { EMPTY_EXPEDITION, isExpeditionState, isExpeditionLog, mergeExpedition, type ExpeditionState, type ExpeditionLog } from "@/lib/expedition";

const LOCAL_KEY = "lh:expedition";

function loadLocal(): ExpeditionState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return isExpeditionState(parsed) ? parsed : EMPTY_EXPEDITION;
  } catch {
    return EMPTY_EXPEDITION;
  }
}

function saveLocal(s: ExpeditionState) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
  } catch {}
}

function putRemote(s: ExpeditionState) {
  return fetch("/api/game-state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game: "expedition", state: s }),
  }).catch(() => null);
}

export type ExpeditionOptions = {
  /** false: don't fetch; merge from `remote` once it is defined (the dashboard gets it from /api/me) */
  fetch?: boolean;
  remote?: unknown;
};

/** synced: the signed-in learner's saved state has been merged in (or there is no account to merge from), so decisions that depend on it can be made. */
export function useExpedition(opts: ExpeditionOptions = {}): { state: ExpeditionState; ready: boolean; synced: boolean; update: (fn: (s: ExpeditionState) => ExpeditionState) => void } {
  const selfFetch = opts.fetch !== false;
  const { data: session, status } = useSession();
  const [state, setState] = useState<ExpeditionState>(EMPTY_EXPEDITION);
  const [ready, setReady] = useState(false);
  const [merged, setMerged] = useState(false);
  const synced = useRef(false);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    setState(loadLocal());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!session?.user || synced.current || !ready) return;
    const apply = (raw: unknown) => {
      const remote = isExpeditionState(raw) ? raw : EMPTY_EXPEDITION;
      const merged = mergeExpedition(latest.current, remote);
      setState(merged);
      saveLocal(merged);
      void putRemote(merged);
      setMerged(true);
    };
    if (selfFetch) {
      synced.current = true;
      fetchJson<{ state: unknown }>("/api/game-state?game=expedition")
        .then((d) => apply(d.state))
        .catch(() => setMerged(true));
      return;
    }
    if (opts.remote === undefined) return; // /api/me not back yet
    synced.current = true;
    apply(opts.remote);
  }, [session, ready, selfFetch, opts.remote]);

  const update = useCallback(
    (fn: (s: ExpeditionState) => ExpeditionState) => {
      setState((prev) => {
        const next = fn(prev);
        if (next === prev) return prev;
        saveLocal(next);
        if (session?.user) void putRemote(next);
        return next;
      });
    },
    [session],
  );

  return { state, ready, synced: ready && (status === "unauthenticated" || merged), update };
}

/** Pass `preloaded` (from /api/me) to skip the fetch; undefined = fetch it here. */
export function useExpeditionLog(preloaded?: unknown): ExpeditionLog | null {
  const { data: session } = useSession();
  const [log, setLog] = useState<ExpeditionLog | null>(null);
  useEffect(() => {
    if (!session?.user) return;
    if (preloaded !== undefined) {
      setLog(isExpeditionLog(preloaded) ? preloaded : { days: [] });
      return;
    }
    fetchJson<{ state: unknown }>("/api/game-state?game=expedition-log")
      .then((d) => setLog(isExpeditionLog(d.state) ? d.state : { days: [] }))
      .catch(() => setLog({ days: [] }));
  }, [session, preloaded]);
  return log;
}
