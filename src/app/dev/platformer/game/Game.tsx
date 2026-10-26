"use client";

/**
 * The Causeway of Thoth: root of the prototype. Builds the textures, then
 * mounts the canvas with the place the current level is played in (the
 * causeway for level 1 and the title; see places/), particles and post.
 */
import { Suspense, lazy, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { buildTextures, type GameTextures } from "./textures";
import { game, hooks, input, playerPos, useGame, type Mode } from "./store";
import { watchGame } from "./telemetry";
import { answer, answerReview, complete, teach } from "./answers";
import { useKeyboard } from "./controls";
import { Daylight } from "./Light";
import { Water } from "./Sky";
import Scenery from "./Scenery";
import Particles from "./Particles";
import Post, { Compile } from "./Post";
import { LEVEL_LIT_BRAZIERS, MOVERS } from "./course";
import Hud from "./Hud";
import { PLACES } from "./places";
import Riverbanks, { CAUSEWAY_RIVER } from "./places/Riverbank";

// The course and the player come with the physics engine, which is most of the game's download: fetched
// apart from this file, so the title is on screen without it (see CausewayPhysics.tsx).
/** The title view as a picture (62 KB), shown until the scene itself is drawn; the lesson page fetches it early. */
export const TITLE_STILL = "/causeway-title.webp";

/** how long the scene takes to fade in over the still */
const SCENE_FADE_MS = 1800;
/** the title only drifts behind text: drawn at this pace, the page in front stays smooth on a weak GPU */
const BACKDROP_FPS = 20;

const isBackdrop = () => game.get().status === "title";

/**
 * While the scene is a backdrop the canvas draws on demand; this asks for a frame at the backdrop's pace. (The physics
 * asks for one at every step while a body is awake, so it is paused behind the title: see Causeway.)
 */
function BackdropPace() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const id = setInterval(() => invalidate(), 1000 / BACKDROP_FPS);
    return () => clearInterval(id);
  }, [invalidate]);
  return null;
}

const loadPhysics = () => import("./CausewayPhysics");
const CausewayPhysics = lazy(loadPhysics);

/** Stand in for the course's lights until it is here (see LEVEL_LIT_BRAZIERS in course.ts). */
function DarkLights() {
  return (
    <>
      {Array.from({ length: MOVERS.length + LEVEL_LIT_BRAZIERS }, (_, i) => (
        <pointLight key={i} intensity={0} distance={1} position={[0, -50, 0]} />
      ))}
    </>
  );
}

/** Level 1, and the view behind the title: pillars out of the Nile, up to the temple gate. */
function Causeway({ tex, run, paused }: { tex: GameTextures; run: number; paused: boolean }) {
  return (
    <>
      {/* (the shadow box is wide enough to reach the near bank, so the villages and colossi stand in the low sun too) */}
      <Daylight span={46} />
      <Water />
      <Scenery tex={tex} />
      <Riverbanks tex={tex} plan={CAUSEWAY_RIVER} />
      {/* the physics engine is a download of its own: the river and its banks are on screen while it arrives */}
      <Compile />
      <Suspense fallback={<DarkLights />}>
        <CausewayPhysics tex={tex} run={run} paused={paused} />
      </Suspense>
    </>
  );
}

function World({ tex, onDrawn }: { tex: GameTextures; onDrawn: () => void }) {
  const g = useGame();
  // only level 1 is the causeway; every other level is played in the place lesson.ts gives it
  const layout = g.lesson?.spec.layout ?? "causeway";
  const Place = layout === "causeway" ? null : PLACES[layout];
  return (
    <>
      {/* a place is built afresh for every run; the causeway resets itself, so the title can sit in front of it */}
      {Place ? (
        <Suspense fallback={null}>
          <Place key={`${layout}:${g.run}`} tex={tex} />
          <Compile key={`compile:${layout}:${g.run}`} />
        </Suspense>
      ) : <Causeway tex={tex} run={g.run} paused={g.status === "won" || g.status === "paused" || g.status === "title"} />}
      <Particles />
      <Post onDrawn={onDrawn} />
    </>
  );
}

/** Dev aids for the console and for headless checks. Not on the live site, where they would open the paid levels. */
function useDevAid() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    Object.assign(aid, {
      state: () => game.get(),
      pos: () => [playerPos.x, playerPos.y, playerPos.z],
      input,
      begin: (level: number) => game.begin(level),
      play: () => game.play(),
      teach,
      answer,
      answerReview,
      /** open the gate once every station is answered (the causeway does this when the player walks through) */
      complete,
      /** open every level, with every sign known, to try any place directly */
      unlock: () => game.campaign({ level: 12, name: game.get().campaign.name || "Harry", known: [..."𓄿𓇋𓇌𓂝𓅱𓃀𓊪𓆑𓅓𓈖𓂋𓉔𓎛𓐍𓄡𓊃𓋴𓈙𓈎𓎡𓎼𓏏𓍿𓂧𓆓"] }),
    });
    return () => {
      delete w.__causeway;
    };
  }, []);
}

export type GameProps = {
  /** "lesson": level 1 only, as Lesson 1 on the site; default "campaign", the whole game */
  mode?: Mode;
  /** offered in the name box when the learner has not carved a name yet */
  suggestedName?: string;
  /** lesson mode: what to do when the learner chooses the written lesson instead */
  onClassic?: () => void;
  /** lesson mode: has the learner paid? Level 1 is free; level 2 onwards asks for this (null = not known yet) */
  paid?: boolean | null;
  /** lesson mode: the learner said yes to the checkout from the level 2 offer */
  onUpgrade?: () => void;
  /** lesson mode: playing without an account; level 1 only, and the finish card asks for a free account */
  guest?: boolean;
  /** lesson mode: the guest asked to save their progress */
  onSignUp?: () => void;
  /** a level was won (level index, stations right first time, stations in all) */
  onLevelComplete?: (level: number, score: number, total: number) => void;
};

export default function Game({ mode = "campaign", suggestedName = "", onClassic, paid = null, onUpgrade, guest = false, onSignUp, onLevelComplete }: GameProps) {
  // (a yes/no, not the whole state: the game root renders again only when the scene stops or starts being a backdrop)
  const backdrop = useSyncExternalStore(game.subscribe, isBackdrop, () => true);
  const [tex, setTex] = useState<GameTextures | null>(null);
  // the still fades up when it has loaded, the scene fades in over it at its first frame, and then the still is let go
  const [stillUp, setStillUp] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [settled, setSettled] = useState(false);
  const still = useRef<HTMLImageElement>(null);
  const onDrawn = useCallback(() => setDrawn(true), []);
  useEffect(() => {
    // (an image already in the cache can finish before React is listening)
    if (still.current?.complete) setStillUp(true);
  }, []);
  useEffect(() => {
    if (!drawn) return;
    const t = setTimeout(() => setSettled(true), SCENE_FADE_MS + 200);
    return () => clearTimeout(t);
  }, [drawn]);
  useKeyboard();
  useDevAid();
  useEffect(() => watchGame(), []);
  hooks.onClassic = onClassic;
  hooks.onUpgrade = onUpgrade;
  hooks.onSignUp = onSignUp;
  hooks.onLevelComplete = onLevelComplete;
  // a win is told to the page once, as it happens (the lesson page records Lesson 1 as done)
  useEffect(() => {
    let was = game.get().status;
    const unsubscribe = game.subscribe(() => {
      const s = game.get();
      if (s.status === "won" && was !== "won" && s.lesson) {
        hooks.onLevelComplete?.(s.playing, s.lesson.mistakes.filter((m) => m === 0).length, s.lesson.stations.length);
      }
      was = s.status;
    });
    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    game.set({ paid: mode === "campaign" ? true : paid, guest: mode === "lesson" && guest });
  }, [mode, paid, guest]);

  // the page may mount the game before the session answers, so the account name can arrive after the title is up
  useEffect(() => {
    game.set({ suggestedName: suggestedName.trim().slice(0, 24) });
  }, [suggestedName]);

  useEffect(() => {
    let alive = true;
    game.set({ status: "title", ready: false, mode, suggestedName: suggestedName.trim().slice(0, 24) });
    game.load();
    // a phone plays in silence: no effects, no voices, and no switch for them (the Hear buttons and the voice picker are hidden there too)
    if (window.matchMedia("(pointer: coarse)").matches) game.set({ muted: true });
    // the learner's own review record decides which word the run is about (signed-in only; guests get a lucky dip)
    fetch("/api/srs")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { signs?: unknown } | null) => {
        if (alive && d && Array.isArray(d.signs)) game.set({ review: d.signs });
      })
      .catch(() => null);
    // the scene is shown as soon as its textures are drawn; ready means playable, which needs the physics engine too
    const textures = buildTextures().then((t) => {
      if (alive) setTex(t);
    });
    Promise.all([textures, loadPhysics()])
      .then(() => {
        if (alive) game.set({ ready: true });
      })
      .catch(() => null);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="hero-media fixed inset-0 bg-[#140d07] overflow-hidden">
      {/* a still of the title view, up within the first second, and the scene itself fades in over it once its textures
          are drawn and its shaders compiled: the wait reads as a slow dawn, not as loading. Retake the still if the view changes. */}
      {!settled && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={still}
          src={TITLE_STILL}
          alt=""
          aria-hidden="true"
          onLoad={() => setStillUp(true)}
          className={"absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out " + (stillUp ? "opacity-100" : "opacity-0")}
        />
      )}
      <Canvas
        // (named, not just on: the default is a soft type three no longer has, which it swaps for this one during the
        // first frame, after the shaders were compiled for the other)
        shadows="percentage"
        dpr={[1, 1.75]}
        frameloop={backdrop ? "demand" : "always"}
        gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 52, near: 0.3, far: 2200, position: [9.5, 4.6, 12.5] }}
        style={{ opacity: drawn ? 1 : 0, transition: `opacity ${SCENE_FADE_MS}ms ease-in-out` }}
      >
        {backdrop && <BackdropPace />}
        <Suspense fallback={null}>{tex && <World tex={tex} onDrawn={onDrawn} />}</Suspense>
      </Canvas>
      <Hud />
    </div>
  );
}
