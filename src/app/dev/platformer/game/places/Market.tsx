"use client";

/**
 * The market: silent pictures chosen by meaning, not by sound. A square on a
 * stone quay in the river, on foot. Goods wait on a pedestal at the quay under
 * a label; the learner lifts them and carries them to the stall that hangs
 * out the right sign: by sound while a word is being spelled, by meaning when
 * the label is a whole word. Every station is a delivery, in order, and then
 * the old orders (earlier words, asked for their silent picture) come round.
 * A new sign waits in a beam of light on the pedestal itself, so the goods
 * cannot be lifted before the sign has been met.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { Pillar } from "../course";
import { signInfo, type ReviewStation, type Station } from "../lesson";
import { game, playerPos, useGame, type Lesson } from "../store";
import { answer, answerReview, closeTeach, complete, finished, isTaught } from "../answers";
import { sfx } from "../audio";
import { say } from "../voice";
import { burst } from "../Particles";
import { Daylight } from "../Light";
import { Water } from "../Sky";
import { Brazier, Landscape, Model, Obelisk, Palm, TempleGate } from "../Scenery";
import { Plaque, TeachBeam, WordSlab, useFace } from "../kit";
import { worldBox, type GameTextures } from "../textures";
import PillarMesh from "../PillarMesh";
import Player from "../Player";

/** The quay: forty metres square, its top at y = 0, the gate at the north end and the goods at the south. */
const SQUARE: Pillar = { top: [0, 0, -2], size: [40, 40], kind: "plaza" };
const SPAWN: [number, number, number] = [0, 1.2, 13];
const PEDESTAL: [number, number, number] = [0, 0, 9];
const GATE_Z = -19;
const LIFT = 1.3;
const REACH = 1.8;

/** Six stalls, three a side, each turned to face the quay so its board can be read from where the label is. */
const SPOTS = (
  [
    [-14.5, 4],
    [-15, -5],
    [-11, -13.5],
    [14.5, 4],
    [15, -5],
    [11, -13.5],
  ] as [number, number][]
).map(([x, z]) => {
  const yaw = Math.atan2(0 - x, 10 - z);
  // where a customer stands: in front of the counter
  return { x, z, yaw, fx: x + Math.sin(yaw) * 1.5, fz: z + Math.cos(yaw) * 1.5 };
});

const AWNINGS = ["#b3402a", "#1f8f8a", "#d4a832", "#2f5f9e", "#5c7f3a", "#a8402c"];

const GOODS = [
  { url: "/models/objects/jar.glb", size: 0.85 },
  { url: "/models/objects/lotus.glb", size: 0.75 },
  { url: "/models/objects/goose.glb", size: 0.8 },
];

// ─── what is being carried ───

type Delivery = {
  key: string;
  /** its place in the whole run: picks which goods stand on the pedestal */
  ordinal: number;
  station: { index: number; station: Station } | null;
  review: { index: number; review: ReviewStation } | null;
  right: string;
  options: string[];
  /** the boards carry signs (or, for an old sign asked the other way round, sounds) */
  glyph: boolean;
};

function deliveryKey(l: Lesson): string {
  if (l.progress < l.stations.length) return `s${l.progress}`;
  const i = l.reviews.findIndex((_, k) => l.reviewed[k] === null || l.reviewed[k] === undefined);
  return i >= 0 ? `r${i}` : "none";
}

/** Every station in order, then every old order. */
function deliveryOf(l: Lesson | null): Delivery | null {
  if (!l) return null;
  const key = deliveryKey(l);
  if (key === "none") return null;
  const index = Number(key.slice(1));
  if (key[0] === "s") {
    const station = l.stations[index];
    const reading = station.kind === "read";
    return { key, ordinal: index, station: { index, station }, review: null, right: reading ? signInfo(station.target).sound : station.target, options: station.options, glyph: !reading };
  }
  const review = l.reviews[index];
  return { key, ordinal: l.stations.length + index, station: null, review: { index, review }, right: review.sound, options: review.options, glyph: review.kind === "det" };
}

/** Which stalls hang the options out: both sides of the square, chosen afresh for each delivery. */
function pickStalls(options: string[]): (string | null)[] {
  const mix = (a: number[]) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const west = mix([0, 1, 2]);
  const east = mix([3, 4, 5]);
  const [a, b] = Math.random() < 0.5 ? [west, east] : [east, west];
  const order = [a[0], b[0], a[1], b[1], a[2], b[2]];
  const out: (string | null)[] = SPOTS.map(() => null);
  options.slice(0, SPOTS.length).forEach((o, i) => (out[order[i]] = o));
  return out;
}

function question(l: Lesson, d: Delivery): { label: string; glyph: boolean; caption: string } {
  if (d.review) {
    const r = d.review.review;
    return r.kind === "det" ? { label: `“${r.word?.meaning ?? ""}”`, glyph: false, caption: "old order · the picture for" } : { label: r.sign, glyph: true, caption: "an old sign · what sound is" };
  }
  const st = d.station!.station;
  if (st.kind === "sign") return { label: st.sound, glyph: false, caption: "which sign writes" };
  if (st.kind === "read") return { label: st.target, glyph: true, caption: "what sound is" };
  return { label: `“${l.phrases[st.phrase].meaning.split(",")[0]}”`, glyph: false, caption: "the silent picture for" };
}

/** Once the goods are in hand the label is behind you: the line at the bottom of the screen carries the order. */
function carryingHint(l: Lesson, d: Delivery): string {
  if (d.review) {
    const r = d.review.review;
    return r.kind === "det"
      ? `An old order: ${r.word?.translit}, “${r.word?.meaning}”. Carry it to the stall that hangs out its silent picture.`
      : `An old sign: ${r.sign}. Carry it to the stall that names its sound.`;
  }
  const st = d.station!.station;
  if (st.kind === "sign") return `Carry it to the stall that hangs out the sign for “${st.sound}”.`;
  if (st.kind === "read") return `Carry it to the stall that names the sound of ${st.target}.`;
  const p = l.phrases[st.phrase];
  return `This label is a whole word: ${p.translit}, “${p.meaning.split(",")[0]}”. Carry it to the stall that hangs out its silent picture.`;
}

// ─── goods ───

function Crate() {
  return (
    <mesh position={[0, 0.3, 0]} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#8a6238" roughness={0.85} />
    </mesh>
  );
}

function Goods({ kind }: { kind: number }) {
  const g = GOODS[kind % GOODS.length];
  return (
    <Suspense fallback={<Crate />}>
      <Model key={g.url} url={g.url} size={g.size} position={[0, 0, 0]} />
    </Suspense>
  );
}

// ─── a stall ───

/** Read every frame by the board, written by the square: never React state. */
type StallState = { inside: boolean; shake: number; flash: number };

function Board({ label, glyph, tint, state }: { label: string; glyph: boolean; tint: string; state: StallState }) {
  const face = useFace(label, glyph, { tint });
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    state.shake = Math.max(0, state.shake - dt);
    state.flash = Math.max(0, state.flash - dt * 1.6);
    if (group.current) group.current.position.x = state.shake > 0 ? Math.sin(clock.elapsedTime * 70) * 0.08 * (state.shake / 0.4) : 0;
    if (mat.current) mat.current.emissive.setRGB(state.flash * 1.6, state.flash * 0.12, state.flash * 0.08);
  });
  return (
    <group ref={group}>
      <mesh position={[0, 2.9, 0.75]} castShadow>
        <boxGeometry args={[2.42, 2.97, 0.1]} />
        <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.9, 0.81]}>
        <planeGeometry args={[2.2, 2.75]} />
        <meshStandardMaterial ref={mat} map={face} roughness={0.8} emissive="#000000" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function Stall({
  spot,
  colour,
  board,
  state,
  goods,
  tex,
}: {
  spot: (typeof SPOTS)[number];
  colour: string;
  /** what this stall hangs out for the delivery in hand; null = plain cloth */
  board: { label: string; glyph: boolean; tint: string } | null;
  state: StallState;
  /** what has been delivered here, left on the counter */
  goods: number[];
  tex: GameTextures;
}) {
  const counter = useMemo(() => worldBox(3.4, 1.0, 1.0, 3), []);
  return (
    <group position={[spot.x, 0, spot.z]} rotation={[0, spot.yaw, 0]}>
      <mesh geometry={counter} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.03, 0]} castShadow>
        <boxGeometry args={[3.6, 0.08, 1.15]} />
        <meshStandardMaterial color="#7a5232" roughness={0.75} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 1.95, 2.35, sz * 1.35]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 4.7, 8]} />
            <meshStandardMaterial color="#6b4a2c" roughness={0.9} />
          </mesh>
        )),
      )}
      {/* the beam the board hangs from */}
      <mesh position={[0, 4.45, 1.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 4.0, 8]} />
        <meshStandardMaterial color="#6b4a2c" roughness={0.9} />
      </mesh>
      {/* a striped awning, lower at the front */}
      <group position={[0, 4.78, 0]} rotation={[0.14, 0, 0]}>
        {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
          <mesh key={k} position={[k * 0.62, 0, 0]} castShadow>
            <boxGeometry args={[0.62, 0.05, 3.3]} />
            <meshStandardMaterial color={k % 2 === 0 ? colour : "#efe4c8"} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      {board ? (
        <Board {...board} state={state} />
      ) : (
        <mesh position={[0, 2.9, 0.78]}>
          <planeGeometry args={[2.2, 2.75]} />
          <meshStandardMaterial color={colour} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      )}
      {goods.map((kind, k) => (
        <group key={k} position={[-1.2 + (k % 4) * 0.8, 1.07, k < 4 ? 0 : -0.35]}>
          <Goods kind={kind} />
        </group>
      ))}
    </group>
  );
}

// ─── the gate at the north end ───

function MarketDoor({ tex }: { tex: GameTextures }) {
  const body = useRef<RapierRigidBody>(null);
  const drop = useRef(0);
  const open = finished();
  useFrame((_, dtRaw) => {
    const b = body.current;
    if (!b) return;
    const dt = Math.min(dtRaw, 1 / 30);
    if (finished()) drop.current = Math.min(1, drop.current + dt / 2.4);
    const e = drop.current * drop.current * (3 - 2 * drop.current);
    b.setNextKinematicTranslation({ x: 0, y: 3.45 - e * 7.2, z: GATE_Z + 0.45 });
  });
  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[0, 3.45, GATE_Z + 0.45]}>
      <CuboidCollider args={[1.9, 3.45, 0.25]} />
      <WordSlab tex={tex} />
      {open && <Sparkles count={40} scale={[4, 7, 1.5]} position={[0, 0, 0.8]} size={6} speed={1.2} color="#ffd98a" />}
    </RigidBody>
  );
}

// ─── the square ───

export default function Market({ tex }: { tex: GameTextures }) {
  const g = useGame();
  const lesson = g.lesson;
  const delivery = useMemo(() => deliveryOf(lesson), [lesson]);
  // the stalls in play change with the delivery, not with every answer
  const dKey = delivery?.key ?? "none";
  const assign = useMemo(() => ({ key: dKey, stalls: delivery ? pickStalls(delivery.options) : SPOTS.map(() => null) }), [dKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [placed, setPlaced] = useState<{ stall: number; kind: number }[]>([]);
  const stalls = useMemo<StallState[]>(() => SPOTS.map(() => ({ inside: false, shake: 0, flash: 0 })), []);
  const run = useRef({ carrying: false, lifted: false, hint: null as string | null });
  const live = useRef({ delivery, assign });
  live.current = { delivery, assign };
  const goods = useRef<THREE.Group>(null);
  const pedestal = useMemo(() => worldBox(0.9, 0.7, 0.9, 3), []);
  const planter = useMemo(() => worldBox(1.7, 0.55, 1.7, 3), []);

  const advise = (hint: string | null) => {
    if (run.current.hint === hint) return;
    run.current.hint = hint;
    game.set({ hint });
  };

  // dev aid for headless checks: make the next correct thing happen through the real path
  useEffect(() => {
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    aid.place = {
      auto: (): string => {
        const go = aid.go as ((x: number, y: number, z: number, yaw?: number) => void) | undefined;
        if (!go) return "no player yet";
        if (game.get().status !== "playing") return "not playing";
        const { delivery: d, assign: a } = live.current;
        if (finished() || !d) {
          go(0, 1.2, GATE_Z - 1.2);
          return "through the gate";
        }
        if (!run.current.carrying) {
          go(PEDESTAL[0], 1.2, PEDESTAL[2] + 0.95);
          return `to the goods (${d.key})`;
        }
        const stall = a.stalls.indexOf(d.right);
        if (stall < 0) return "no stall carries the answer yet";
        go(SPOTS[stall].fx, 1.2, SPOTS[stall].fz);
        return `to stall ${stall} with ${d.key}`;
      },
    };
    return () => {
      delete aid.place;
      game.set({ hint: null });
    };
  }, []);

  useFrame(({ clock }) => {
    const state = game.get();
    const l = state.lesson;
    const st = run.current;
    const { delivery: d, assign: a } = live.current;
    const t = clock.elapsedTime;

    // the goods wait on the pedestal, or ride above the carrier's head
    const gg = goods.current;
    if (gg) {
      gg.visible = !!d;
      if (st.carrying) {
        gg.position.set(playerPos.x, playerPos.y + 0.95 + Math.sin(t * 6) * 0.03, playerPos.z);
      } else {
        gg.position.set(PEDESTAL[0], 0.72 + Math.sin(t * 1.7) * 0.04, PEDESTAL[2]);
        gg.rotation.y = t * 0.6;
      }
    }

    if (state.status !== "playing" || !l) return;

    // every order filled: out through the gate
    if (finished()) {
      advise("Every order is filled and the market gate is open: walk through it.");
      if (playerPos.z < GATE_Z + 0.3 && Math.abs(playerPos.x) < 1.9) complete(playerPos.clone());
      return;
    }

    // who is standing at which stall (kept up to date whatever is in hand, so one visit is one answer)
    let entered = -1;
    for (let i = 0; i < SPOTS.length; i++) {
      const dx = playerPos.x - SPOTS[i].fx;
      const dz = playerPos.z - SPOTS[i].fz;
      const touching = dx * dx + dz * dz < REACH * REACH;
      if (touching && !stalls[i].inside) entered = i;
      stalls[i].inside = touching;
    }

    // between an answer and the render that follows it, the delivery on hand is the old one: wait
    if (!d || d.key !== deliveryKey(l) || a.key !== d.key) return;

    if (!st.carrying) {
      const untaught = !!d.station && !isTaught(l, d.station.station);
      if (!st.lifted) advise(untaught ? "A new sign waits on the quay. Walk into the light to meet it, then lift the goods." : "Lift the goods on the quay: walk up to them and read the label.");
      else advise(null);
      const dx = playerPos.x - PEDESTAL[0];
      const dz = playerPos.z - PEDESTAL[2];
      // (a new sign is met in the beam on this very spot before the goods will come away)
      if (!untaught && dx * dx + dz * dz < LIFT * LIFT) {
        st.carrying = true;
        st.lifted = true;
        sfx.ankh(d.ordinal);
        if (d.station?.station.kind === "sign") say(signInfo(d.station.station.target).said);
      }
      return;
    }

    advise(carryingHint(l, d));
    if (entered < 0) return;
    const option = a.stalls[entered];
    if (option === null) return;
    const spot = SPOTS[entered];
    const at = new THREE.Vector3(spot.x, 1.6, spot.z);
    if (d.review) {
      const outcome = answerReview(d.review.index, option, at);
      if (outcome === "ignored") return;
      // an old order is over after one answer: the right stall takes the goods either way
      const home = outcome === "right" ? entered : a.stalls.indexOf(d.right);
      if (outcome === "wrong") {
        stalls[entered].shake = 0.4;
        stalls[entered].flash = 1;
      }
      st.carrying = false;
      setPlaced((p) => [...p, { stall: home >= 0 ? home : entered, kind: d.ordinal }]);
      return;
    }
    const outcome = answer(d.station!.index, option, at);
    if (outcome === "wrong") {
      stalls[entered].shake = 0.4;
      stalls[entered].flash = 1;
    } else if (outcome === "right") {
      st.carrying = false;
      closeTeach(d.station!.station.target);
      burst(at, 12, [0.5, 2.4, 2.2], 3);
      setPlaced((p) => [...p, { stall: entered, kind: d.ordinal }]);
    }
  });

  const ask = lesson && delivery ? question(lesson, delivery) : null;
  const teachHere = lesson && delivery?.station && delivery.station.station.teach ? delivery.station.station.target : null;

  return (
    <>
      <Daylight />
      <Water />
      <Landscape tex={tex} />

      <Physics gravity={[0, -28, 0]} paused={g.status === "won" || g.status === "paused"} timeStep="vary">
        <RigidBody type="fixed" colliders={false} friction={0.2}>
          {/* the quay, and rails nobody can see so nobody ends up in the river */}
          <CuboidCollider args={[20, 4.5, 20]} position={[0, -4.5, -2]} />
          <CuboidCollider args={[20, 2, 0.3]} position={[0, 2, 18.3]} />
          <CuboidCollider args={[20, 2, 0.3]} position={[0, 2, -22.3]} />
          <CuboidCollider args={[0.3, 2, 20]} position={[20.3, 2, -2]} />
          <CuboidCollider args={[0.3, 2, 20]} position={[-20.3, 2, -2]} />
          {/* the gate is solid: no way round the door */}
          <CuboidCollider args={[3.2, 6, 1]} position={[-5.4, 6, GATE_Z]} />
          <CuboidCollider args={[3.2, 6, 1]} position={[5.4, 6, GATE_Z]} />
          <CuboidCollider args={[6, 3, 0.3]} position={[-14, 3, GATE_Z]} />
          <CuboidCollider args={[6, 3, 0.3]} position={[14, 3, GATE_Z]} />
          <CuboidCollider args={[0.45, 0.35, 0.45]} position={[PEDESTAL[0], 0.35, PEDESTAL[2]]} />
          {SPOTS.map((s, i) => (
            <CuboidCollider key={i} args={[1.8, 0.55, 0.58]} position={[s.x, 0.55, s.z]} rotation={[0, s.yaw, 0]} />
          ))}
          <CuboidCollider args={[0.8, 2, 0.8]} position={[-8, 2, 15]} />
          <CuboidCollider args={[0.8, 2, 0.8]} position={[8, 2, 15]} />
        </RigidBody>
        <MarketDoor tex={tex} />
        <Player spawn={SPAWN} canJump={false} />
      </Physics>

      <PillarMesh pillar={SQUARE} tex={tex} />
      <TempleGate tex={tex} at={[0, 0, GATE_Z]} />

      {/* the pedestal on the quay, its label, and the light a new sign waits in */}
      <mesh geometry={pedestal} position={[PEDESTAL[0], 0.35, PEDESTAL[2]]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#fff1d2" />
      </mesh>
      <mesh position={[PEDESTAL[0], 0.66, PEDESTAL[2]]}>
        <boxGeometry args={[0.98, 0.08, 0.98]} />
        <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.28} />
      </mesh>
      {ask && <Plaque {...ask} lit position={[PEDESTAL[0], 3.5, PEDESTAL[2]]} scale={1.7} />}
      {teachHere && <TeachBeam key={teachHere} symbol={teachHere} position={PEDESTAL} />}
      <group ref={goods} position={[PEDESTAL[0], 0.72, PEDESTAL[2]]}>
        <Goods kind={delivery?.ordinal ?? 0} />
      </group>

      {SPOTS.map((spot, i) => {
        const option = assign.key === dKey ? assign.stalls[i] : null;
        return (
          <Stall
            key={i}
            spot={spot}
            colour={AWNINGS[i % AWNINGS.length]}
            board={option !== null && delivery ? { label: option, glyph: delivery.glyph, tint: delivery.review ? "#cfe3df" : "#ead9b4" } : null}
            state={stalls[i]}
            goods={placed.filter((p) => p.stall === i).map((p) => p.kind)}
            tex={tex}
          />
        );
      })}

      {/* dressing */}
      <Obelisk position={[-8, 0, 15]} height={7} tex={tex} />
      <Obelisk position={[8, 0, 15]} height={7} tex={tex} />
      <Brazier position={[-3.2, 0, 11.5]} lit={false} />
      <Brazier position={[3.2, 0, 11.5]} lit={false} />
      <Brazier position={[-3.4, 0, GATE_Z + 3.2]} />
      <Brazier position={[3.4, 0, GATE_Z + 3.2]} />
      {(
        [
          [-17.5, 15.5, 3],
          [17.5, 15.5, 8],
          [-17.5, -10, 14],
          [17.5, -10, 21],
        ] as [number, number, number][]
      ).map(([x, z, seed]) => (
        <group key={seed}>
          <mesh geometry={planter} position={[x, 0.275, z]} castShadow receiveShadow>
            <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
          </mesh>
          <Palm position={[x, 0.4, z]} seed={seed} scale={0.9} tex={tex} />
        </group>
      ))}
      <Suspense fallback={null}>
        <Model url="/models/objects/bull.glb" size={2.6} position={[-18, 0, -0.5]} rotation={0.4} />
        <Model url="/models/objects/goose.glb" size={0.9} position={[17.6, 0, 0.5]} rotation={-1.2} />
        <Model url="/models/objects/goose.glb" size={0.8} position={[16.8, 0, 1.6]} rotation={-2.1} />
        <Model url="/models/objects/jar.glb" size={1.1} position={[-17.2, 0, 7.5]} />
        <Model url="/models/objects/jar.glb" size={0.8} position={[-16.3, 0, 8.4]} rotation={1} />
        <Model url="/models/objects/jar.glb" size={1.2} position={[17.4, 0, -8.6]} rotation={2} />
        <Model url="/models/objects/jar.glb" size={0.9} position={[-13.6, 0, -16.2]} rotation={0.6} />
        <Model url="/models/objects/lotus.glb" size={0.9} position={[13.8, 0, -16]} />
        <Model url="/models/objects/jar.glb" size={1.0} position={[2.4, 0, 16.4]} rotation={1.4} />
        <Model url="/models/objects/lotus.glb" size={0.8} position={[-2.6, 0, 16.6]} />
      </Suspense>
      {/* dust hanging in the light over the square */}
      <Sparkles count={140} scale={[42, 12, 42]} position={[0, 5, -2]} size={3.2} speed={0.25} color="#ffdcaa" opacity={0.55} noise={1.2} />
    </>
  );
}
