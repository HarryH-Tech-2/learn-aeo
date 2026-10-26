"use client";

/**
 * The parts of the causeway that teach (logic in lesson.ts, answers in
 * answers.ts, the tablets, plaques and beams of light in kit.tsx):
 *
 *   RequiredStation tablets for the next thing the gate wants: the sign for
 *                   a sound, the silent picture for a meaning, or (last
 *                   level) the sound of a sign. A plaque above asks the question.
 *   ReviewSpot      an old sign, asked the other way round; optional.
 *   ForkInTheRoad   two flights of steps and a stele: figures face the start
 *                   of the line, and the real flight starts where the writing does.
 *   GateDoor        the stone door: the words build on it, and it opens when
 *                   they can be read.
 *   FirstSteps      level 1 until station 1 is answered: what to do next, in
 *                   words (coach.ts).
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { BEACON_OFFSET, FORK, FORK_LANDING, GATE, PILLAR_FOOT_Y, START, STATION_SITES, STELE, type Pillar } from "./course";
import { MOVED_R2, coachLine } from "./coach";
import { FACING_SIGNS, signInfo, type ForkMode, type ReviewStation, type Station } from "./lesson";
import { game, moverVelocity, playerPos, useGame } from "./store";
import { answer, answerReview } from "./answers";
import { sfx } from "./audio";
import { burst } from "./Particles";
import PillarMesh from "./PillarMesh";
import { Plaque, Tablet, TeachBeam, WordSlab, drawLabel, stoneFill, useCanvasTexture, type TouchResult } from "./kit";
import type { GameTextures } from "./textures";

// ─── required stations ───

function RequiredStation({ station, index, tex }: { station: Station; index: number; tex: GameTextures }) {
  const lesson = useGame().lesson;
  const nag = useRef(0);
  if (!lesson) return null;
  const site = STATION_SITES[station.site];
  const taught = !station.teach || lesson.taught.includes(station.target);
  const mode = lesson.progress > index ? "done" : lesson.progress === index && taught ? "active" : "dormant";
  const phrase = lesson.phrases[station.phrase];
  const info = signInfo(station.target);
  const n = station.options.length;

  const touch = (option: string): TouchResult => {
    const l = game.get().lesson;
    if (!l || l.progress > index) return "ignored";
    const now = performance.now();
    if (l.progress < index) {
      if (now - nag.current > 4000) {
        nag.current = now;
        const want = l.stations[l.progress];
        game.toast(want.kind === "det" ? "These wait for later. The gate still wants its silent picture." : `These wait for later. First the sound “${want.sound}”, back the way you came.`, "info");
      }
      return "ignored";
    }
    if (station.teach && !l.taught.includes(station.target)) {
      if (now - nag.current > 3000) {
        nag.current = now;
        game.toast("You have not met this sign yet. Step into the beam of light in front of the tablets first.", "info");
      }
      return "ignored";
    }
    return answer(index, option, new THREE.Vector3(site.at[0], site.at[1], site.at[2]));
  };

  const question =
    station.kind === "sign"
      ? { label: station.sound, glyph: false, caption: "which sign writes" }
      : station.kind === "read"
        ? { label: station.target, glyph: true, caption: "what sound is" }
        : { label: `“${phrase.meaning.split(",")[0]}”`, glyph: false, caption: "the silent picture for" };

  return (
    <>
      {mode !== "done" && <Plaque {...question} lit={mode === "active"} position={[site.at[0], site.at[1] + 1.75, site.at[2]]} />}
      {station.options.map((option, oi) => (
        <Tablet
          key={oi}
          label={option}
          glyph={station.kind !== "read"}
          tint="#ead9b4"
          phase={oi * 1.3 + index}
          mode={mode}
          right={station.kind === "read" ? option === info.sound : option === station.target}
          onTouch={() => touch(option)}
          tex={tex}
          position={[site.at[0] + (oi - (n - 1) / 2) * site.spread, site.at[1], site.at[2]]}
        />
      ))}
      {/* where a new sign is met: nothing to get wrong, and its tablets wake */}
      {/* a sign already known gets a fainter beam: its card again as a reminder, without holding the explorer */}
      {(station.teach || (station.kind === "sign" && mode !== "done")) && (
        <TeachBeam symbol={station.target} known={!station.teach} position={[site.at[0], site.at[1] - 1.35, site.at[2] + BEACON_OFFSET]} />
      )}
    </>
  );
}

// ─── the first steps ───

export function FirstSteps() {
  const said = useRef<string | null>(null);
  const touch = useMemo(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches, []);

  useFrame(() => {
    const s = game.get();
    if (s.status !== "playing") return;
    if (!s.moved) {
      const dx = playerPos.x - START[0];
      const dz = playerPos.z - START[2];
      if (dx * dx + dz * dz > MOVED_R2) game.set({ moved: true });
    }
    // (only our own line is replaced or cleared: the fork and the other places have theirs)
    const line = coachLine(game.get(), touch);
    if (line !== said.current) {
      if (game.get().hint === said.current) game.set({ hint: line });
      said.current = line;
    }
  });

  // a line left standing when the run ends goes with it
  useEffect(
    () => () => {
      if (said.current && game.get().hint === said.current) game.set({ hint: null });
    },
    [],
  );

  return null;
}

// ─── reviews ───

function ReviewSpot({ review, index, tex }: { review: ReviewStation; index: number; tex: GameTextures }) {
  const lesson = useGame().lesson;
  if (!lesson || review.site < 0) return null;
  const site = STATION_SITES[review.site];
  const done = lesson.reviewed[index] !== null;
  const n = review.options.length;
  return (
    <>
      {!done && <Plaque label={review.sign} glyph caption="review · what sound is" lit position={[site.at[0], site.at[1] + 1.75, site.at[2]]} />}
      {review.options.map((option, oi) => (
        <Tablet
          key={oi}
          label={option}
          glyph={false}
          tint="#cfe3df"
          phase={oi * 1.1 + index * 2}
          mode={done ? "done" : "active"}
          right={option === review.sound}
          onTouch={() => answerReview(index, option, new THREE.Vector3(...site.at))}
          tex={tex}
          position={[site.at[0] + (oi - (n - 1) / 2) * site.spread, site.at[1], site.at[2]]}
        />
      ))}
    </>
  );
}

export function SignStations({ tex }: { tex: GameTextures }) {
  const lesson = useGame().lesson;
  if (!lesson) return null;
  return (
    <>
      {lesson.stations.map((station, i) => (
        <RequiredStation key={`s${i}`} station={station} index={i} tex={tex} />
      ))}
      {lesson.reviews.map((review, i) => (
        <ReviewSpot key={`r${i}`} review={review} index={i} tex={tex} />
      ))}
    </>
  );
}

// ─── the fork ───

function ForkPillar({ pillar, real, mode, tex }: { pillar: Pillar; real: boolean; mode: ForkMode; tex: GameTextures }) {
  const body = useRef<RapierRigidBody>(null);
  const s = useRef({ armed: -1, sink: 0, v: 0, since: 0 });
  const vel = useMemo(() => new THREE.Vector3(), []);
  const [x, y, z] = pillar.top;
  const [w, d] = pillar.size;
  const h = y - PILLAR_FOOT_Y;

  useEffect(() => {
    const b = body.current;
    return () => {
      if (b) moverVelocity.delete(b.handle);
    };
  }, []);

  useFrame((_, dtRaw) => {
    const b = body.current;
    const lesson = game.get().lesson;
    if (!b || !lesson) return;
    const dt = Math.min(dtRaw, 1 / 30);
    const st = s.current;
    const top = y - st.sink;
    const on = Math.abs(playerPos.x - x) < w / 2 + 0.1 && Math.abs(playerPos.z - z) < d / 2 + 0.1 && playerPos.y - top > 0.2 && playerPos.y - top < 1.2;
    const facing = lesson.trueSide;
    // the first forks only dip; so does every fork in gentle mode
    const forgiving = mode === "gentle" || game.get().campaign.gentle;
    const depth = forgiving ? 1.4 : 18;

    if (mode !== "off" && on && real && lesson.fork === "unread") {
      game.lesson({ fork: "read" });
      sfx.right();
      game.toast(`Well read. The birds on the stone face ${facing}, so the line begins on the ${facing}, and so did the path.`, "good");
    } else if (mode !== "off" && on && real && lesson.fork === "fell") {
      game.lesson({ fork: "recovered" });
      sfx.right();
      game.toast(`That is the one. The birds face ${facing}: the line begins on the ${facing}, and so does the path.`, "good");
    }
    if (mode !== "off" && on && !real && st.armed < 0 && st.sink === 0) {
      st.armed = 0.3;
      sfx.crumble();
      burst(new THREE.Vector3(x, y, z), 18, [0.9, 0.75, 0.5], 3, { up: 1.5, size: 0.14, life: 0.8, gravity: -5 });
      if (lesson.fork === "unread") game.lesson({ fork: "fell" });
      game.toast(
        `False steps${forgiving ? ": hop back." : "!"} Look at the stone again. The birds face ${facing}. Figures always look toward the START of the line, and the true path starts where the writing starts.`,
        "bad",
      );
    }
    if (st.armed >= 0) {
      st.armed -= dt;
      if (st.armed < 0) {
        st.armed = -1;
        st.v = 1;
      }
    }
    if (st.v > 0) {
      st.v += (forgiving ? 3 : 20) * dt;
      st.sink = Math.min(depth, st.sink + st.v * dt);
      st.since = 0;
      if (st.sink >= depth) st.v = 0;
    } else if (st.sink > 0) {
      // wait, then come back up for the next try
      st.since += dt;
      if (st.since > 2.5 && !on) st.sink = Math.max(0, st.sink - 7 * dt);
    }
    vel.set(0, st.v > 0 ? -st.v : 0, 0);
    moverVelocity.set(b.handle, vel);
    b.setNextKinematicTranslation({ x: 0, y: -st.sink, z: 0 });
  });

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} friction={0.2}>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} position={[x, y - h / 2, z]} />
      <PillarMesh pillar={pillar} tex={tex} />
    </RigidBody>
  );
}

function Stele({ mirrored, tex }: { mirrored: boolean; tex: GameTextures }) {
  const face = useCanvasTexture(
    1024,
    512,
    (ctx) => {
      stoneFill(ctx, 1024, 512, "#ecdcb8", 7);
      ctx.strokeStyle = "rgba(150,105,30,0.9)";
      ctx.lineWidth = 10;
      ctx.strokeRect(26, 26, 972, 460);
      ctx.strokeStyle = "rgba(90,60,25,0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(46, 46, 932, 420);
      ctx.save();
      // an RTL line is the same line mirrored: every figure turns to face the other way
      if (mirrored) {
        ctx.translate(1024, 0);
        ctx.scale(-1, 1);
      }
      FACING_SIGNS.forEach((g, i) => drawLabel(ctx, g, true, 150 + i * 241, 270, 250, "#24170b"));
      ctx.restore();
    },
    [mirrored],
    FACING_SIGNS.join(""),
  );
  return (
    <group position={STELE}>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.44, 0.9]} />
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 2.1, 0.36]} />
        <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.3, 0.34, 0.6]} />
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0.19]}>
        <planeGeometry args={[3.7, 1.85]} />
        <meshStandardMaterial map={face} roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.72, 0.305]}>
        <circleGeometry args={[0.13, 24]} />
        <meshStandardMaterial color="#e2b23e" metalness={1} roughness={0.25} emissive="#ff8a1a" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

export function ForkInTheRoad({ tex }: { tex: GameTextures }) {
  const lesson = useGame().lesson;
  const hinting = useRef(false);
  const mode: ForkMode = lesson?.spec.fork ?? "off";

  useFrame(() => {
    const l = game.get().lesson;
    const inZone =
      !!l &&
      l.spec.fork !== "off" &&
      (l.fork === "unread" || l.fork === "fell") &&
      game.get().status === "playing" &&
      Math.abs(playerPos.x - FORK_LANDING.x) < FORK_LANDING.half + 0.3 &&
      Math.abs(playerPos.z - FORK_LANDING.z) < FORK_LANDING.half + 0.3 &&
      Math.abs(playerPos.y - FORK_LANDING.y - 0.55) < 1.6;
    if (inZone !== hinting.current) {
      hinting.current = inZone;
      game.set({
        hint: inZone ? "Two flights of steps, and only one is real. The stone says which: people, birds and snakes always face the START of the line, and the true path begins where the writing begins." : null,
      });
    }
  });

  const trueSide = lesson?.trueSide ?? "left";
  return (
    <>
      {(["left", "right"] as const).map((side) => FORK[side].map((p, i) => <ForkPillar key={`${side}${i}`} pillar={p} real={mode === "off" || side === trueSide} mode={mode} tex={tex} />))}
      {/* unmirrored, the font's figures face left: the line starts on the left. No stone until the fork means something. */}
      {mode !== "off" && <Stele mirrored={trueSide === "right"} tex={tex} />}
    </>
  );
}

// ─── the door that the words open ───

export function GateDoor({ tex }: { tex: GameTextures }) {
  const g = useGame();
  const lesson = g.lesson;
  const body = useRef<RapierRigidBody>(null);
  const drop = useRef(0);
  const done = !!lesson && lesson.progress >= lesson.stations.length;

  // a new run shuts the door again
  useEffect(() => {
    drop.current = 0;
  }, [g.run]);

  useFrame((_, dtRaw) => {
    const b = body.current;
    if (!b) return;
    const dt = Math.min(dtRaw, 1 / 30);
    if (done) drop.current = Math.min(1, drop.current + dt / 2.4);
    const e = drop.current * drop.current * (3 - 2 * drop.current);
    b.setNextKinematicTranslation({ x: GATE[0], y: GATE[1] + 3.45 - e * 7.2, z: GATE[2] + 0.45 });
  });

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[GATE[0], GATE[1] + 3.45, GATE[2] + 0.45]}>
      <CuboidCollider args={[1.9, 3.45, 0.25]} />
      <WordSlab tex={tex} />
      {done && <Sparkles count={40} scale={[4, 7, 1.5]} position={[0, 0, 0.8]} size={6} speed={1.2} color="#ffd98a" />}
    </RigidBody>
  );
}
