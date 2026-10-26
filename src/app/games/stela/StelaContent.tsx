"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Price from "@/components/Price";
import GuaranteeNote from "@/components/GuaranteeNote";
import { useAuthModal } from "@/components/AuthModal";
import { trackEvent, trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { MUSEUMS, STELA_LESSON_ID, STELA_OBJECTS, assembled, objectsFor, tapSign, xpForPhrase, type Museum, type Phrase, type StelaObject } from "@/lib/stela";

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif" } as const;

type Props = { paid: boolean };

export default function StelaContent({ paid }: Props) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [museum, setMuseum] = useState<Museum | "all">("all");
  const [museumMode, setMuseumMode] = useState(false);
  const [objectId, setObjectId] = useState<string | null>(null);
  const object = useMemo(() => STELA_OBJECTS.find((o) => o.id === objectId) ?? null, [objectId]);

  useEffect(() => {
    try {
      const m = new URLSearchParams(window.location.search).get("museum");
      if (m === "met" || m === "bm" || m === "louvre") {
        setMuseum(m);
        setMuseumMode(true);
      }
    } catch {}
  }, []);

  const list = objectsFor(museum);

  return (
    <main className="min-h-screen bg-obsidian text-sand-100">
      <Navbar />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="text-center mb-6">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 mb-2">Scribe’s Games · real objects</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light">
            Stela <span className="text-gradient-gold font-medium">Reader</span>
          </h1>
          <p className="font-body text-sand-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Real inscribed objects from museum collections. Zoom into the photograph and tap the signs in reading order; the transliteration and translation assemble as you go.
          </p>
        </div>

        {/* Museum filter + museum mode */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {(["all", ...MUSEUMS.map((m) => m.id)] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMuseum(m)}
              aria-pressed={museum === m}
              className={`font-body text-[11px] tracking-[0.15em] uppercase px-3 py-2 border transition-colors ${museum === m ? "border-gold-500 text-gold-300 bg-gold-500/10" : "border-gold-700/30 text-sand-300 hover:border-gold-500/50"}`}
            >
              {m === "all" ? "All museums" : MUSEUMS.find((x) => x.id === m)!.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMuseumMode((v) => !v);
              trackEvent("stela_museum_mode", { on: museumMode ? 0 : 1 });
            }}
            aria-pressed={museumMode}
            className={`font-body text-[11px] tracking-[0.15em] uppercase px-3 py-2 border transition-colors ${museumMode ? "border-turquoise text-turquoise bg-turquoise/10" : "border-gold-700/30 text-sand-300 hover:border-gold-500/50"}`}
            title="For standing in front of the case: big signs, no photo"
          >
            {museumMode ? "Museum mode: on" : "Museum mode"}
          </button>
        </div>

        {!object ? (
          <ObjectPicker objects={list} paid={paid} onPick={(o) => { setObjectId(o.id); trackEvent("game_start", { game: "stela", object: o.id }); }} onSignIn={() => openAuthModal({ next: "/games/stela" })} signedIn={!!session?.user} />
        ) : (
          <ObjectReader key={object.id} object={object} paid={paid} museumMode={museumMode} signedIn={!!session?.user} onBack={() => setObjectId(null)} onSignIn={() => openAuthModal({ next: "/games/stela" })} />
        )}

        <p className="font-body text-xs text-sand-500 text-center mt-8">
          <Link href="/dig" className="text-gold-500 underline underline-offset-4">
            Back to The Dig
          </Link>
          {" · "}
          Photographs of Met objects are Open Access (CC0); every object is credited on screen. Museum names are trademarks of their institutions and no endorsement is implied.
        </p>
      </section>
      <Footer />
    </main>
  );
}

function ObjectPicker({ objects, paid, signedIn, onPick, onSignIn }: { objects: StelaObject[]; paid: boolean; signedIn: boolean; onPick: (o: StelaObject) => void; onSignIn: () => void }) {
  return (
    <div>
      {objects.length === 0 && <p className="font-body text-sm text-sand-500 text-center card-ancient p-8">No objects from this museum yet. More are added as CC0 photographs become available.</p>}
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label="Objects">
        {objects.map((o) => {
          const playable = !!o.image && o.phrases.length > 0;
          const can = playable && (o.free || paid);
          return (
            <li key={o.id} className="card-ancient p-3 flex flex-col">
              {o.image ? (
                <button type="button" onClick={() => (can ? onPick(o) : undefined)} className="relative block aspect-[4/3] overflow-hidden bg-black/40" aria-label={can ? `Read ${o.title}` : `${o.title} (members)`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.image.src} alt={o.title} className={`w-full h-full object-cover transition-transform ${can ? "hover:scale-105" : "opacity-60"}`} loading="lazy" width={o.image.width} height={o.image.height} />
                  {!can && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-obsidian/85 border border-gold-700/40 px-3 py-1 font-body text-[10px] tracking-[0.25em] uppercase text-gold-400">Members</span>
                    </span>
                  )}
                </button>
              ) : (
                <a href={o.objectUrl} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] bg-obsidian-lighter border border-gold-700/20 flex items-center justify-center text-center p-4">
                  <span className="font-body text-xs text-sand-400">
                    Photograph not free to reuse.
                    <br />
                    <span className="text-gold-500 underline underline-offset-4">See it on the museum site</span>
                  </span>
                </a>
              )}
              <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mt-3">
                {o.museumName.split(",")[0]} · {o.accession}
                {o.free && playable && <span className="ml-2 text-sand-500">· Free</span>}
              </p>
              <p className="font-display text-base text-sand-100 leading-snug mt-1">{o.title}</p>
              <p className="font-body text-xs text-sand-500 mt-1 flex-1">{o.date}</p>
              {playable && (
                <p className="font-body text-xs text-sand-400 mt-2">
                  {o.phrases.length} phrase{o.phrases.length === 1 ? "" : "s"} · {o.phrases.reduce((n, p) => n + p.hotspots.length, 0)} signs
                </p>
              )}
              {playable && !can && (
                <div className="mt-3">
                  {signedIn ? (
                    <>
                      <Link href="/checkout" className="btn-primary w-full justify-center text-xs py-2">
                        Unlock (<Price />)
                      </Link>
                      <GuaranteeNote className="!mt-1.5" />
                    </>
                  ) : (
                    <button type="button" onClick={onSignIn} className="btn-secondary w-full justify-center text-xs py-2">
                      Sign in
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Reading one object ───

function ObjectReader({ object, paid, museumMode, signedIn, onBack, onSignIn }: { object: StelaObject; paid: boolean; museumMode: boolean; signedIn: boolean; onBack: () => void; onSignIn: () => void }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phrase = object.phrases[phraseIdx];
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [lastTapped, setLastTapped] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [xp, setXp] = useState<{ amount: number; status: "idle" | "saving" | "saved" | "guest" | "error" }>({ amount: 0, status: "idle" });
  const [showAll, setShowAll] = useState(false);
  const [finishedPhrases, setFinishedPhrases] = useState<string[]>([]);
  const locked = !object.free && !paid;

  function reset(i: number) {
    setPhraseIdx(i);
    setIndex(0);
    setMistakes(0);
    setDone(false);
    setFlash(null);
    setLastTapped(null);
    setShowAll(false);
    setXp({ amount: 0, status: "idle" });
  }

  function tap(id: string) {
    if (done) return;
    const r = tapSign(phrase, index, id);
    setLastTapped(id);
    setFlash({ id, ok: r.ok });
    window.setTimeout(() => setFlash(null), 500);
    trackExerciseAnswer({ exercise: "stela", questionType: "tap-in-order", question: `${object.id}/${phrase.id}/${id}`, correct: r.ok });
    if (!r.ok) {
      setMistakes((m) => m + 1);
      return;
    }
    setIndex(r.index);
    if (r.done) finish();
  }

  function finish() {
    setDone(true);
    setFinishedPhrases((f) => Array.from(new Set([...f, phrase.id])));
    const amount = xpForPhrase(phrase.hotspots.length, mistakes);
    trackExerciseComplete({ exercise: "stela", score: phrase.hotspots.length, total: phrase.hotspots.length, attempts: mistakes + phrase.hotspots.length });
    if (!signedIn) {
      setXp({ amount, status: "guest" });
      return;
    }
    setXp({ amount, status: "saving" });
    fetch("/api/progress/xp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: STELA_LESSON_ID, xp: amount }) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(() => setXp({ amount, status: "saved" }))
      .catch(() => setXp({ amount, status: "error" }));
  }

  const expected = phrase.hotspots[index];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <button type="button" onClick={onBack} className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4">
          All objects
        </button>
        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500">
          {object.museumName.split(",")[0]} · {object.accession}
          {object.gallery && <span className="text-sand-500"> · {object.gallery}</span>}
        </p>
      </div>
      <h2 className="font-display text-xl sm:text-2xl text-sand-100 leading-snug">{object.title}</h2>
      <p className="font-body text-xs text-sand-500 mt-1">{object.date}</p>

      {locked ? (
        <div className="card-ancient p-6 mt-4 text-center">
          <p className="font-body text-sm text-sand-300 mb-4">This object is part of the full course. The first object is free to read.</p>
          {signedIn ? (
            <div className="flex flex-col items-center">
              <Link href="/checkout" className="btn-primary text-sm py-3 px-8">
                Get lifetime access · <Price />
              </Link>
              <GuaranteeNote />
            </div>
          ) : (
            <button type="button" onClick={onSignIn} className="btn-primary text-sm py-3 px-8">
              Sign in
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 mt-4 ${museumMode ? "" : "lg:grid-cols-[1fr_340px]"}`}>
          {!museumMode && object.image && (
            <PhotoPanel object={object} phrase={phrase} index={index} flash={flash} lastTapped={lastTapped} done={done} showAll={showAll} onTap={tap} />
          )}

          <div className="card-ancient p-4 sm:p-5" aria-live="polite">
            {object.phrases.length > 1 && (
              <div className="flex flex-wrap gap-1 mb-3" role="tablist" aria-label="Phrases on this object">
                {object.phrases.map((p, i) => (
                  <button key={p.id} type="button" role="tab" aria-selected={i === phraseIdx} onClick={() => reset(i)} className={`font-body text-[10px] tracking-[0.15em] uppercase px-2 py-1 border ${i === phraseIdx ? "border-gold-500 text-gold-300" : "border-gold-700/30 text-sand-400"}`}>
                    {finishedPhrases.includes(p.id) ? "✓ " : ""}
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-1">{phrase.title}</p>
            <p className="font-body text-xs text-sand-500 mb-3">
              Reads {phrase.direction === "ltr" ? "left to right" : phrase.direction === "rtl" ? "right to left" : "top to bottom"} · {phrase.hotspots.length} signs
            </p>

            {/* The sign strip: in museum mode this IS the puzzle */}
            <ol className={`flex flex-wrap gap-1 ${museumMode ? "text-4xl" : "text-2xl"}`} aria-label="Signs in reading order">
              {phrase.hotspots.map((h, i) => {
                const state = i < index ? "read" : i === index ? "next" : "later";
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => (museumMode ? tap(h.id) : undefined)}
                      disabled={!museumMode || done}
                      className={`glyph-cell px-2 py-1 border transition-colors ${state === "read" ? "border-turquoise/60 bg-turquoise/10 text-sand-50" : state === "next" ? "border-gold-500 bg-gold-500/10" : "border-gold-700/20 text-sand-500"} ${museumMode ? "cursor-pointer" : ""}`}
                      aria-label={state === "read" ? `${h.value}, read` : museumMode ? "sign, tap when it is next" : "sign"}
                      style={GLYPH}
                    >
                      {museumMode && state === "later" && !done ? h.glyph : h.glyph}
                    </button>
                  </li>
                );
              })}
            </ol>
            {museumMode && !done && <p className="font-body text-xs text-sand-500 mt-2">Museum mode: find the signs on the object in front of you and tap them here in reading order.</p>}

            {/* Assembling text */}
            <div className="mt-4 border-t border-gold-700/20 pt-3">
              <p className="font-display italic text-lg text-gold-300 min-h-[1.75rem]">{assembled(phrase, index) || <span className="text-sand-600 not-italic text-sm font-body">Tap the first sign…</span>}</p>
              {done ? (
                <p className="font-body text-sm text-sand-100 mt-1">{phrase.translation}</p>
              ) : (
                <p className="font-body text-xs text-sand-500 mt-1">
                  {expected && lastTapped && flash && !flash.ok ? "Not that one. " : ""}
                  Next: <span className="text-sand-300">{index === 0 ? "the first sign" : `sign ${index + 1} of ${phrase.hotspots.length}`}</span>
                  {mistakes >= 2 && expected && (
                    <>
                      {" "}· hint: look for <span className="glyph-cell text-lg align-middle">{expected.glyph}</span> ({expected.name})
                    </>
                  )}
                </p>
              )}
            </div>

            {done && (
              <div className="mt-4 enter-fade">
                <p className="font-body text-sm text-sand-300 leading-relaxed">{phrase.note}</p>
                <ul className="mt-3 space-y-1">
                  {phrase.hotspots.map((h) => (
                    <li key={h.id} className="flex items-center gap-2 font-body text-xs text-sand-300">
                      <span className="glyph-cell text-xl w-8 shrink-0">{h.glyph}</span>
                      <span className="text-sand-100 font-medium w-16 shrink-0">{h.value}</span>
                      <span>{h.name}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-body text-sm text-sand-300 mt-4 min-h-[1.5rem]">
                  {xp.status === "saving" && "Recording your XP…"}
                  {xp.status === "saved" && (
                    <>
                      <span className="text-gold-400 font-medium">+{xp.amount} XP</span> · {mistakes === 0 ? "a clean read." : `${mistakes} slip${mistakes === 1 ? "" : "s"}.`}
                    </>
                  )}
                  {xp.status === "guest" && (
                    <>
                      <span className="text-gold-400 font-medium">+{xp.amount} XP</span>.{" "}
                      <button type="button" onClick={onSignIn} className="text-gold-400 underline underline-offset-4">
                        Sign in
                      </button>{" "}
                      to keep it.
                    </>
                  )}
                  {xp.status === "error" && "Couldn't save XP this time."}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  {phraseIdx + 1 < object.phrases.length ? (
                    <button type="button" onClick={() => reset(phraseIdx + 1)} className="btn-primary text-sm py-3 px-6 justify-center">
                      Next phrase
                    </button>
                  ) : (
                    <button type="button" onClick={onBack} className="btn-primary text-sm py-3 px-6 justify-center">
                      Another object
                    </button>
                  )}
                  <button type="button" onClick={() => reset(phraseIdx)} className="btn-secondary text-sm py-3 px-6 justify-center">
                    Read again
                  </button>
                  <ShareButton object={object} phrase={phrase} mistakes={mistakes} />
                </div>
              </div>
            )}

            {!done && !museumMode && (
              <label className="flex items-center gap-2 mt-4 font-body text-xs text-sand-500 cursor-pointer">
                <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="accent-[#d4a832]" />
                Show every hotspot (easier)
              </label>
            )}

            <div className="mt-5 border-t border-gold-700/20 pt-3">
              <p className="font-body text-xs text-sand-400 leading-relaxed">{object.about}</p>
              <p className="font-body text-[11px] text-sand-600 mt-2">
                {object.credit}.{" "}
                <a href={object.objectUrl} target="_blank" rel="noopener noreferrer" className="text-gold-500 underline underline-offset-4">
                  Object page
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareButton({ object, phrase, mistakes }: { object: StelaObject; phrase: Phrase; mistakes: number }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const text = `I read “${phrase.translit}” (${phrase.translation}) on ${object.title} at ${object.museumName.split(",")[0]}${mistakes === 0 ? ", first time" : ""} 𓏞\nhttps://www.learnhieroglyphics.com/games/stela`;
    trackEvent("stela_share", { object: object.id, phrase: phrase.id });
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  return (
    <button type="button" onClick={share} className="btn-secondary text-sm py-3 px-6 justify-center">
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

// ─── Pan / zoom photograph with hotspots ───

function PhotoPanel({ object, phrase, index, flash, lastTapped, done, showAll, onTap }: { object: StelaObject; phrase: Phrase; index: number; flash: { id: string; ok: boolean } | null; lastTapped: string | null; done: boolean; showAll: boolean; onTap: (id: string) => void }) {
  const img = object.image!;
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; scale: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());

  const aspect = img.width / img.height;
  // The frame is the column's width and at most 70vh tall; the photo inside is laid out at the frame's width
  // (so a tall stela runs below the frame and is panned, instead of shrinking into a strip with black either side).
  const [size, setSize] = useState({ W: 0, H: 0 });
  const photoH = size.W / aspect;
  // Smallest zoom shows the whole photo; never zoom out past it.
  const minScale = size.W && photoH ? Math.min(1, size.H / photoH) : 1;
  const clampScale = useCallback((s: number) => Math.min(6, Math.max(minScale, s)), [minScale]);
  // Keep the photo covering the frame: no black bands from panning past an edge; centred when smaller than it.
  const clampPan = useCallback(
    (t: number, sc: number, frame: number, content: number) => {
      const c = content * sc;
      if (c <= frame) return (frame - c) / 2;
      return Math.min(0, Math.max(frame - c, t));
    },
    [],
  );
  const place = useCallback(
    (sc: number, x: number, y: number) => {
      setScale(sc);
      setTx(clampPan(x, sc, size.W, size.W));
      setTy(clampPan(y, sc, size.H, photoH));
    },
    [clampPan, size, photoH],
  );

  // Zoom towards the current phrase when it changes
  const focus = useCallback(() => {
    if (!size.W || phrase.hotspots.length === 0) return;
    const xs = phrase.hotspots.map((h) => h.x);
    const ys = phrase.hotspots.map((h) => h.y);
    const minX = Math.min(...xs) - 0.04;
    const maxX = Math.max(...xs) + 0.04;
    const minY = Math.min(...ys) - 0.04;
    const maxY = Math.max(...ys) + 0.04;
    const s = clampScale(Math.min(size.W / ((maxX - minX) * size.W), size.H / ((maxY - minY) * photoH)) * 0.9);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    place(s, size.W / 2 - cx * size.W * s, size.H / 2 - cy * photoH * s);
  }, [phrase, size, photoH, clampScale, place]);

  const showWhole = () => place(minScale, 0, 0);

  // The transform is in pixels, so measure the frame and re-frame the phrase when it resizes (rotation, sidebar).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    focus();
  }, [focus]);

  function zoomBy(factor: number, cx?: number, cy?: number) {
    if (!size.W) return;
    const px = cx ?? size.W / 2;
    const py = cy ?? size.H / 2;
    const next = clampScale(scale * factor);
    const k = next / scale;
    place(next, px - (px - tx) * k, py - (py - ty) * k);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) drag.current = { x: e.clientX, y: e.clientY, tx, ty, moved: false };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), scale };
      drag.current = null;
    }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const next = clampScale((pinch.current.scale * d) / pinch.current.d);
      place(next, tx, ty);
      return;
    }
    if (drag.current) {
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;
      place(scale, drag.current.tx + dx, drag.current.ty + dy);
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const rect = wrap.current?.getBoundingClientRect();
    zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, rect ? e.clientX - rect.left : undefined, rect ? e.clientY - rect.top : undefined);
  }

  return (
    <div className="card-ancient p-2 sm:p-3 [container-type:inline-size]">
      <div
        ref={wrap}
        className="relative w-full overflow-hidden bg-black select-none touch-none"
        style={{ height: `min(70vh, ${(100 / aspect).toFixed(3)}cqw)`, cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        role="application"
        aria-label="Photograph of the object. Drag to pan, scroll or pinch to zoom, tap a sign to read it."
      >
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: size.W || "100%", height: photoH || "100%", transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={object.title} width={img.width} height={img.height} className="w-full h-full object-contain block pointer-events-none" draggable={false} />
          {phrase.hotspots.map((h, i) => {
            const read = i < index;
            const visible = showAll || read || i === index || done;
            const isFlash = flash?.id === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  if (drag.current?.moved) return;
                  onTap(h.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 rounded-sm transition-colors ${
                  isFlash ? (flash!.ok ? "border-turquoise bg-turquoise/30" : "border-terracotta bg-terracotta/30") : read ? "border-turquoise/80 bg-turquoise/15" : visible ? "border-gold-400/80 bg-gold-400/10 hover:bg-gold-400/25" : "border-transparent"
                }`}
                style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%`, minWidth: 18, minHeight: 18 }}
                aria-label={read ? `${h.value}, read` : `sign ${i + 1}`}
              >
                {read && <span className="sr-only">{h.value}</span>}
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          <button type="button" onClick={() => zoomBy(1.4)} className="w-9 h-9 bg-obsidian/85 border border-gold-700/40 text-sand-100 font-body" aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={() => zoomBy(1 / 1.4)} className="w-9 h-9 bg-obsidian/85 border border-gold-700/40 text-sand-100 font-body" aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={focus} className="h-9 px-2 bg-obsidian/85 border border-gold-700/40 text-sand-100 font-body text-xs" aria-label="Zoom to the phrase">
            Phrase
          </button>
          <button type="button" onClick={showWhole} className="h-9 px-2 bg-obsidian/85 border border-gold-700/40 text-sand-100 font-body text-xs" aria-label="Whole object">
            All
          </button>
        </div>
      </div>
      <p className="font-body text-[11px] text-sand-600 mt-2">
        Drag to pan · scroll or pinch to zoom · tap the gold boxes in reading order. {lastTapped === null && "The next sign is outlined in gold."}
      </p>
    </div>
  );
}
