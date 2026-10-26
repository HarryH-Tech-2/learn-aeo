"use client";

/**
 * The tomb: dark, slow and on foot. One straight hall runs away from the
 * entrance, cut into bays by cross walls, and every way on is sealed by stone
 * slabs. The lamp shows only what is close, so a slab has to be walked up to
 * before its sign can be read; touching it chooses it. The right slab grinds
 * up out of the way; a wrong one only shakes.
 *
 * Reading direction belongs here. Between the two words stand two plain
 * slabs with a line of figures carved between them (the true way begins where
 * the writing begins), and before the last seal a known word is carved in a
 * column, to be read from the top down. New signs wait where light falls
 * through the roof, in the middle of the hall, before the wall that asks for them.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WORDS } from "@/lib/content/uniliteral-words";
import { FACING_SIGNS, columnWord, signInfo, type Station } from "../lesson";
import { game, playerPos, playerVel, useGame, type Lesson } from "../store";
import { answer, answerReview, complete, finished } from "../answers";
import { sfx } from "../audio";
import { Indoors } from "../Light";
import Player from "../Player";
import { Brazier, Model } from "../Scenery";
import { Plaque, TeachBeam, WordSlab, drawLabel, stoneFill, useCanvasTexture, useFace, type TouchResult } from "../kit";
import { worldBox, type GameTextures } from "../textures";

const HALL_W = 9;
const HALL_H = 5.5;
const BAY = 15;
const FIRST_WALL = -11;
const BACK_Z = 8;
const THICK = 1;
const DOOR_W = 2;
const DOOR_H = 3.2;
const CHAMBER = 16;
const SPAWN: [number, number, number] = [0, 1.2, 4];

const DIRECTION_HINT = "Two plain slabs, and only one is a way on. The writing between them says which: people, birds and snakes always face the START of the line, and the true way begins where the writing begins.";
const COLUMN_HINT = "A column of signs, and two readings of it. A column is read from the top down: touch the slab that has the sounds in that order.";

type Column = { signs: string[]; right: string; wrong: string; meaning: string };

type Gate = { kind: "station"; z: number; index: number; station: Station } | { kind: "direction"; z: number } | { kind: "column"; z: number };

/** The walls in the order they are met: one per station, the direction wall where the second word begins, the column before the last seal. */
function layOut(lesson: Lesson, column: boolean): Gate[] {
  const kinds: ({ kind: "station"; index: number; station: Station } | { kind: "direction" } | { kind: "column" })[] = [];
  let turned = false;
  const last = lesson.stations.length - 1;
  lesson.stations.forEach((station, index) => {
    const before = lesson.stations[index - 1];
    if (!turned && before && before.phrase !== station.phrase) {
      turned = true;
      kinds.push({ kind: "direction" });
    }
    if (column && index === last && index > 0) kinds.push({ kind: "column" });
    kinds.push({ kind: "station", index, station });
  });
  return kinds.map((k, i) => ({ ...k, z: FIRST_WALL - i * BAY }));
}

function doorXs(n: number): number[] {
  return n >= 3 ? [-3, 0, 3] : n === 2 ? [-2.5, 2.5] : [0];
}

/** The masonry between and beside the doorways. */
function piersFor(doors: number[]): { x: number; w: number }[] {
  const out: { x: number; w: number }[] = [];
  let left = -HALL_W / 2;
  [...doors]
    .sort((a, b) => a - b)
    .forEach((x) => {
      const l = x - DOOR_W / 2;
      if (l - left > 0.01) out.push({ x: (l + left) / 2, w: l - left });
      left = x + DOOR_W / 2;
    });
  if (HALL_W / 2 - left > 0.01) out.push({ x: (HALL_W / 2 + left) / 2, w: HALL_W / 2 - left });
  return out;
}

function isRight(station: Station, option: string): boolean {
  return station.kind === "read" ? option === signInfo(station.target).sound : option === station.target;
}

// ─── a slab ───

/**
 * A stone that is chosen by walking up to it: a seal in a doorway (`rotY` 0,
 * faces the way you come from) or a small slab let into a side wall. One
 * touch, one answer; it re-arms when the player steps back.
 */
function Slab({
  label,
  glyph,
  tint,
  position,
  rotY = 0,
  size,
  depth = 0.5,
  reach,
  open = false,
  gone = false,
  solid = false,
  onTouch,
  tex,
}: {
  label: string;
  glyph: boolean;
  tint: string;
  /** the centre of the slab */
  position: [number, number, number];
  rotY?: number;
  size: [number, number];
  depth?: number;
  /** how far in front of its centre a touch counts */
  reach: number;
  /** chosen rightly: it grinds up out of the way */
  open?: boolean;
  /** no longer wanted: it sinks into the floor */
  gone?: boolean;
  /** blocks the way until it has opened */
  solid?: boolean;
  onTouch: () => TouchResult;
  tex: GameTextures;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const st = useRef({ inside: false, shake: 0, flash: 0, lift: 0, sink: 0, ground: false });
  const [clear, setClear] = useState(false);
  const face = useFace(label, glyph, { tint, w: 320, h: Math.round((320 * size[1]) / size[0]) });
  const axis = useMemo(() => ({ sin: Math.sin(rotY), cos: Math.cos(rotY) }), [rotY]);

  useFrame(({ clock }, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 20);
    const s = st.current;
    if (open) {
      if (!s.ground) {
        s.ground = true;
        sfx.crumble();
      }
      s.lift = Math.min(1, s.lift + dt / 1.6);
      if (s.lift > 0.75 && !clear) setClear(true);
    }
    if (gone) s.sink = Math.min(1, s.sink + dt / 0.6);
    s.shake = Math.max(0, s.shake - dt);
    s.flash = Math.max(0, s.flash - dt * 1.6);
    const e = s.lift * s.lift * (3 - 2 * s.lift);
    const wob = s.shake > 0 ? Math.sin(clock.elapsedTime * 70) * 0.05 * (s.shake / 0.4) : 0;
    g.position.set(position[0] + wob * axis.cos, position[1] + e * (size[1] + 0.1) - s.sink * (size[1] + 0.4), position[2] - wob * axis.sin);
    g.visible = s.sink < 1;
    // a little of its own light, so a sign can be made out just before the lamp reaches it
    if (mat.current) mat.current.emissive.setRGB(0.13 + s.flash * 1.5, 0.11 + s.flash * 0.1, 0.08 + s.flash * 0.06);

    if (open || gone || game.get().status !== "playing") {
      s.inside = false;
      return;
    }
    const dx = playerPos.x - position[0];
    const dz = playerPos.z - position[2];
    const front = dx * axis.sin + dz * axis.cos;
    const lat = dx * axis.cos - dz * axis.sin;
    const touching = front > 0 && front < reach && Math.abs(lat) < size[0] / 2 - 0.05 && Math.abs(playerPos.y - position[1]) < 2.5;
    const entered = touching && !s.inside;
    s.inside = touching;
    if (!entered) return;
    if (onTouch() === "wrong") {
      s.shake = 0.4;
      s.flash = 1;
    }
  });

  return (
    <>
      <group ref={group} position={position} rotation={[0, rotY, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[size[0], size[1], depth]} />
          <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#d9c39a" />
        </mesh>
        <mesh position={[0, 0, depth / 2 + 0.006]}>
          <planeGeometry args={[size[0] - 0.12, size[1] - 0.12]} />
          <meshStandardMaterial ref={mat} map={face} emissiveMap={face} emissive="#211c14" emissiveIntensity={1} roughness={0.8} />
        </mesh>
      </group>
      {solid && !clear && (
        <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotY, 0]}>
          <CuboidCollider args={[size[0] / 2, size[1] / 2, depth / 2]} />
        </RigidBody>
      )}
    </>
  );
}

// ─── a cross wall ───

type Door = { label: string; glyph: boolean; open: boolean; onTouch: () => TouchResult };

/** A wall across the hall with a sealed doorway for each choice. `children` are what is carved or hung on it, in the wall's own space. */
function CrossWall({ z, doors, tex, children }: { z: number; doors: Door[]; tex: GameTextures; children?: React.ReactNode }) {
  const xs = useMemo(() => doorXs(doors.length), [doors.length]);
  const piers = useMemo(() => piersFor(xs), [xs]);
  const geo = useMemo(
    () => ({
      piers: piers.map((p) => worldBox(p.w, DOOR_H, THICK, 4)),
      lintel: worldBox(HALL_W, HALL_H - DOOR_H, THICK, 4),
      band: worldBox(HALL_W, 0.5, THICK + 0.08, 4, 0.5),
    }),
    [piers],
  );
  return (
    <>
      <RigidBody type="fixed" colliders={false} position={[0, 0, z]}>
        {piers.map((p, i) => (
          <CuboidCollider key={i} args={[p.w / 2, DOOR_H / 2, THICK / 2]} position={[p.x, DOOR_H / 2, 0]} />
        ))}
        <CuboidCollider args={[HALL_W / 2, (HALL_H - DOOR_H) / 2, THICK / 2]} position={[0, (HALL_H + DOOR_H) / 2, 0]} />
        {piers.map((p, i) => (
          <mesh key={i} geometry={geo.piers[i]} position={[p.x, DOOR_H / 2, 0]} receiveShadow>
            <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
          </mesh>
        ))}
        <mesh geometry={geo.lintel} position={[0, (HALL_H + DOOR_H) / 2, 0]} receiveShadow>
          <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
        </mesh>
        <mesh geometry={geo.band} position={[0, DOOR_H + 0.27, 0]}>
          <meshStandardMaterial map={tex.band.map} normalMap={tex.band.normalMap} roughness={0.8} />
        </mesh>
        {xs.map((x) => (
          <mesh key={x} position={[x, DOOR_H + 0.01, 0]}>
            <boxGeometry args={[DOOR_W + 0.3, 0.1, THICK + 0.12]} />
            <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.3} emissive="#ff9a1f" emissiveIntensity={0.12} />
          </mesh>
        ))}
        {children}
      </RigidBody>
      {doors.map((d, i) => (
        <Slab key={i} label={d.label} glyph={d.glyph} tint="#ead9b4" position={[xs[i], DOOR_H / 2, z]} size={[DOOR_W, DOOR_H]} reach={1.5} open={d.open} solid onTouch={d.onTouch} tex={tex} />
      ))}
    </>
  );
}

// ─── the three kinds of wall ───

function StationWall({ gate, tex }: { gate: Extract<Gate, { kind: "station" }>; tex: GameTextures }) {
  const lesson = useGame().lesson;
  const nag = useRef(0);
  if (!lesson) return null;
  const { station, index, z } = gate;
  const phrase = lesson.phrases[station.phrase];
  const done = lesson.progress > index;
  const taught = !station.teach || lesson.taught.includes(station.target);
  const options = station.options.slice(0, 3);
  const xs = doorXs(options.length);

  const touch = (option: string, x: number): TouchResult => {
    const l = game.get().lesson;
    if (!l || l.progress !== index) return "ignored";
    if (station.teach && !l.taught.includes(station.target)) {
      const now = performance.now();
      if (now - nag.current > 3000) {
        nag.current = now;
        game.toast("You have not met this sign yet. Step into the light that falls through the roof, back down the hall, first.", "info");
      }
      return "ignored";
    }
    return answer(index, option, new THREE.Vector3(x, 1.6, z + 0.8));
  };

  const question =
    station.kind === "sign"
      ? { label: station.sound, glyph: false, caption: "which sign writes" }
      : station.kind === "read"
        ? { label: station.target, glyph: true, caption: "what sound is" }
        : { label: `“${phrase.meaning.split(",")[0]}”`, glyph: false, caption: "the silent picture for" };

  return (
    <>
      <CrossWall
        z={z}
        tex={tex}
        doors={options.map((option, i) => ({ label: option, glyph: station.kind !== "read", open: done && isRight(station, option), onTouch: () => touch(option, xs[i]) }))}
      />
      {!done && <Plaque {...question} lit={lesson.progress === index && taught} position={[0, 4.35, z + THICK / 2 + 0.06]} scale={1.1} />}
      {/* where a new sign is met: light through the roof, in the middle of the hall, on the way to the wall that asks for it */}
      {station.teach && <TeachBeam symbol={station.target} position={[0, 0, z + 5]} height={HALL_H} />}
    </>
  );
}

/** A line of figures between two plain slabs. Unmirrored, the font's figures face left: the line, and the way on, begin on the left. */
function DirectionWall({ z, mirrored, done, onRight, tex }: { z: number; mirrored: boolean; done: boolean; onRight: () => void; tex: GameTextures }) {
  const side = mirrored ? "right" : "left";
  const face = useCanvasTexture(
    1024,
    360,
    (ctx) => {
      stoneFill(ctx, 1024, 360, "#e2cfa6", 7);
      ctx.strokeStyle = "rgba(150,105,30,0.9)";
      ctx.lineWidth = 8;
      ctx.strokeRect(18, 18, 988, 324);
      ctx.save();
      // a right-to-left line is the same line mirrored: every figure turns to face the other way
      if (mirrored) {
        ctx.translate(1024, 0);
        ctx.scale(-1, 1);
      }
      FACING_SIGNS.forEach((g, i) => drawLabel(ctx, g, true, 140 + i * 248, 190, 230, "#24170b"));
      ctx.restore();
    },
    [mirrored],
    FACING_SIGNS.join(""),
  );

  const touch = (which: "left" | "right"): TouchResult => {
    const l = game.get().lesson;
    if (!l || done) return "ignored";
    if (which === side) {
      game.lesson({ fork: l.fork === "fell" ? "recovered" : l.fork === "unread" ? "read" : l.fork });
      sfx.right();
      game.toast(`Well read. The birds face ${side}, so the line begins on the ${side}, and so does the way on.`, "good");
      onRight();
      return "right";
    }
    if (l.fork === "unread") game.lesson({ fork: "fell" });
    sfx.wrong();
    game.toast(`Behind that slab there is only rock. Look at the writing again. The birds face ${side}. Figures always look toward the START of the line, and the true way starts where the writing starts.`, "bad");
    return "wrong";
  };

  return (
    <CrossWall
      z={z}
      tex={tex}
      doors={[
        { label: "", glyph: false, open: done && side === "left", onTouch: () => touch("left") },
        { label: "", glyph: false, open: done && side === "right", onTouch: () => touch("right") },
      ]}
    >
      <mesh position={[0, 1.9, THICK / 2 + 0.012]}>
        <planeGeometry args={[2.7, 0.95]} />
        <meshStandardMaterial map={face} emissiveMap={face} emissive="#2a2419" emissiveIntensity={1} roughness={0.8} />
      </mesh>
    </CrossWall>
  );
}

/** A word the learner has already spelled, carved in a column between two slabs: its sounds from the top down, and from the bottom up. */
function ColumnWall({ z, column, rightOnLeft, done, onRight, tex }: { z: number; column: Column; rightOnLeft: boolean; done: boolean; onRight: () => void; tex: GameTextures }) {
  const text = column.signs.join("");
  const face = useCanvasTexture(
    320,
    900,
    (ctx) => {
      stoneFill(ctx, 320, 900, "#e2cfa6", 13);
      ctx.strokeStyle = "rgba(150,105,30,0.9)";
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, 288, 868);
      const n = column.signs.length;
      const cell = 840 / n;
      column.signs.forEach((g, i) => drawLabel(ctx, g, true, 160, 30 + cell * (i + 0.5), Math.min(230, cell * 0.78), "#24170b"));
    },
    [text],
    text,
  );

  const touch = (right: boolean): TouchResult => {
    if (!game.get().lesson || done) return "ignored";
    if (right) {
      sfx.right();
      game.toast(`From the top down: ${column.signs.join(" ")} reads ${column.right}, “${column.meaning}”.`, "good");
      onRight();
      return "right";
    }
    sfx.wrong();
    game.toast(`That is the column read from the bottom up. A column is read from the top down: ${column.right}, “${column.meaning}”.`, "bad");
    return "wrong";
  };

  const left = rightOnLeft ? column.right : column.wrong;
  const right = rightOnLeft ? column.wrong : column.right;
  return (
    <>
      <CrossWall
        z={z}
        tex={tex}
        doors={[
          { label: left, glyph: false, open: done && rightOnLeft, onTouch: () => touch(rightOnLeft) },
          { label: right, glyph: false, open: done && !rightOnLeft, onTouch: () => touch(!rightOnLeft) },
        ]}
      >
        <mesh position={[0, 1.72, THICK / 2 + 0.012]}>
          <planeGeometry args={[0.95, 2.67]} />
          <meshStandardMaterial map={face} emissiveMap={face} emissive="#2a2419" emissiveIntensity={1} roughness={0.8} />
        </mesh>
      </CrossWall>
      {!done && <Plaque label={`“${column.meaning}”`} glyph={false} caption="read the column" lit position={[0, 4.35, z + THICK / 2 + 0.06]} scale={1.1} />}
    </>
  );
}

// ─── reviews ───

/** An old sign on a plaque, and three small slabs let into the side wall with sounds on them. Off the line through the hall, so it is never touched by accident. */
function ReviewNiche({ index, z, side, tex }: { index: number; z: number; side: -1 | 1; tex: GameTextures }) {
  const lesson = useGame().lesson;
  if (!lesson) return null;
  const review = lesson.reviews[index];
  const done = lesson.reviewed[index] !== null;
  const x = side * (HALL_W / 2 - 0.13);
  const rotY = side === -1 ? Math.PI / 2 : -Math.PI / 2;
  const n = review.options.length;
  return (
    <>
      {!done && <Plaque label={review.sign} glyph caption="an old sign · what sound is" lit position={[side * (HALL_W / 2 - 0.3), 3.05, z]} rotation={rotY} scale={0.9} />}
      {review.options.map((option, i) => {
        const sz = z + (i - (n - 1) / 2) * 1.9;
        return (
          <Slab
            key={i}
            label={option}
            glyph={false}
            tint="#cfe3df"
            position={[x, 1.3, sz]}
            rotY={rotY}
            size={[1.5, 1.9]}
            depth={0.24}
            reach={1.2}
            gone={done}
            onTouch={() => answerReview(index, option, new THREE.Vector3(x - side * 0.6, 1.4, sz))}
            tex={tex}
          />
        );
      })}
    </>
  );
}

// ─── the lamp ───

/** The only real light: held out to the explorer's right, it flickers and reaches about a dozen metres. */
function Lamp() {
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Mesh>(null);
  const dust = useRef<THREE.Group>(null);
  const heading = useRef(Math.PI);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (playerVel.x * playerVel.x + playerVel.z * playerVel.z > 1) heading.current = Math.atan2(playerVel.x, playerVel.z);
    const fx = Math.sin(heading.current);
    const fz = Math.cos(heading.current);
    const f = 0.86 + Math.sin(t * 9) * 0.07 + Math.sin(t * 23.7) * 0.04;
    if (light.current) {
      // (the light itself rides high and a little behind: close to a pale slab it would burn the whole view out)
      light.current.position.set(playerPos.x - fx * 1.3, playerPos.y + 2.7, playerPos.z - fz * 1.3);
      light.current.intensity = 24 * f;
    }
    if (flame.current) {
      flame.current.position.set(playerPos.x - fz * 0.45 + fx * 0.25, playerPos.y + 0.45, playerPos.z + fx * 0.45 + fz * 0.25);
      flame.current.scale.setScalar(0.8 + f * 0.3);
    }
    if (dust.current) dust.current.position.set(playerPos.x, playerPos.y + 1.2, playerPos.z);
  });
  return (
    <>
      <pointLight ref={light} color="#ffb066" intensity={30} distance={13} decay={2} />
      <mesh ref={flame}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshBasicMaterial color={[6, 3.2, 0.9]} toneMapped={false} />
      </mesh>
      <group ref={dust}>
        <Sparkles count={36} scale={[7, 3.4, 7]} size={1.3} speed={0.25} color="#ffd9a0" opacity={0.45} noise={1} />
      </group>
    </>
  );
}

// ─── the hall and the burial chamber ───

function Hall({ endZ, tex }: { endZ: number; tex: GameTextures }) {
  const z1 = endZ - THICK;
  const length = BACK_Z - z1;
  const mid = (BACK_Z + z1) / 2;
  const geo = useMemo(
    () => ({
      floor: worldBox(HALL_W + 2, 1, length, 3),
      roof: worldBox(HALL_W + 2, 1, length, 4),
      side: worldBox(1, HALL_H, length, HALL_H),
      end: worldBox(HALL_W + 2, HALL_H, THICK, HALL_H),
    }),
    [length],
  );
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[HALL_W / 2 + 1, 0.5, length / 2]} position={[0, -0.5, mid]} />
      <CuboidCollider args={[HALL_W / 2 + 1, 0.5, length / 2]} position={[0, HALL_H + 0.5, mid]} />
      <CuboidCollider args={[0.5, HALL_H / 2, length / 2]} position={[-HALL_W / 2 - 0.5, HALL_H / 2, mid]} />
      <CuboidCollider args={[0.5, HALL_H / 2, length / 2]} position={[HALL_W / 2 + 0.5, HALL_H / 2, mid]} />
      <CuboidCollider args={[HALL_W / 2 + 1, HALL_H / 2, THICK / 2]} position={[0, HALL_H / 2, BACK_Z + THICK / 2]} />
      <CuboidCollider args={[HALL_W / 2 + 1, HALL_H / 2, THICK / 2]} position={[0, HALL_H / 2, endZ - THICK / 2]} />
      <mesh geometry={geo.floor} position={[0, -0.5, mid]} receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.9} color="#cdb98f" />
      </mesh>
      <mesh geometry={geo.roof} position={[0, HALL_H + 0.5, mid]}>
        <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.95} color="#8f7a58" />
      </mesh>
      {/* the side walls are carved from end to end: the lamp brings the inscriptions out as it passes */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.side} position={[s * (HALL_W / 2 + 0.5), HALL_H / 2, mid]} receiveShadow>
          <meshStandardMaterial map={tex.relief.map} normalMap={tex.relief.normalMap} normalScale={new THREE.Vector2(1.5, 1.5)} roughness={0.85} />
        </mesh>
      ))}
      <mesh geometry={geo.end} position={[0, HALL_H / 2, BACK_Z + THICK / 2]}>
        <meshStandardMaterial map={tex.relief.map} normalMap={tex.relief.normalMap} roughness={0.85} />
      </mesh>
      <mesh geometry={geo.end} position={[0, HALL_H / 2, endZ - THICK / 2]}>
        <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}

/** Where the hall ends: the sarcophagus, and a false door in the end wall that carries the words as they were spelled. */
function BurialChamber({ z, endZ, tex }: { z: number; endZ: number; tex: GameTextures }) {
  const glow = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const lit = useRef(0);
  useFrame(({ clock }, dt) => {
    lit.current = THREE.MathUtils.damp(lit.current, finished() ? 1 : 0, 1.4, Math.min(dt, 0.1));
    if (glow.current) glow.current.intensity = (34 + Math.sin(clock.elapsedTime * 2.1) * 6) * lit.current;
    if (halo.current) halo.current.opacity = lit.current * (0.3 + Math.sin(clock.elapsedTime * 1.7) * 0.06);
  });
  return (
    <>
      <RigidBody type="fixed" colliders={false} position={[0, 0, z]}>
        <CuboidCollider args={[0.85, 0.8, 1.65]} position={[0, 0.8, 0]} />
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <boxGeometry args={[1.7, 0.5, 3.3]} />
          <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#e6d6b0" />
        </mesh>
        <mesh position={[0, 0.9, 0]} receiveShadow>
          <boxGeometry args={[1.35, 0.8, 2.9]} />
          <meshStandardMaterial map={tex.band.map} normalMap={tex.band.normalMap} roughness={0.75} color="#f0d9a8" />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[1.5, 0.24, 3.05]} />
          <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.3} emissive="#ff9a1f" emissiveIntensity={0.2} />
        </mesh>
        {[-1, 0, 1].map((k) => (
          <mesh key={k} position={[0, 0.9, k * 1.1]}>
            <boxGeometry args={[1.39, 0.84, 0.12]} />
            <meshStandardMaterial color="#1f8f8a" roughness={0.5} />
          </mesh>
        ))}
        <pointLight position={[0, 2.6, 0]} color="#ffc878" intensity={9} distance={9} decay={2} />
      </RigidBody>

      {/* the false door: the words stand on it, and it shines once everything has been read */}
      <group position={[0, 0, endZ]}>
        <group position={[0, 2.68, 0.22]}>
          <WordSlab tex={tex} width={2.9} height={5.3} />
        </group>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.68, 2.68, 0.3]}>
            <boxGeometry args={[0.34, 5.36, 0.6]} />
            <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.32} emissive="#ff9a1f" emissiveIntensity={0.15} />
          </mesh>
        ))}
        <mesh position={[0, 1.6, 0.5]}>
          <planeGeometry args={[3.2, 3.2]} />
          <meshBasicMaterial ref={halo} color={[0.5, 2.2, 2.0]} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <pointLight ref={glow} position={[0, 2.4, 2.6]} color="#7ff0e0" intensity={0} distance={16} decay={2} />
      </group>
      <Brazier position={[-3.4, 0, endZ + 1.6]} lit={false} />
      <Brazier position={[3.4, 0, endZ + 1.6]} lit={false} />
    </>
  );
}

// ─── the tomb ───

export default function Tomb({ tex }: { tex: GameTextures }) {
  const g = useGame();
  const lesson = g.lesson;
  // which way the line at the direction wall runs, and which slab at the column has the true reading: decided once per run
  const [mirrored] = useState(() => Math.random() < 0.5);
  const [rightOnLeft] = useState(() => Math.random() < 0.5);
  const [dirDone, setDirDone] = useState(false);
  const [colDone, setColDone] = useState(false);
  const first = lesson?.spec.words[0];
  const column = useMemo<Column | null>(() => (first ? columnWord(WORDS.slice(0, Math.max(0, WORDS.indexOf(first)))) : null), [first]);
  const gates = useMemo(() => (lesson ? layOut(lesson, !!column) : []), [lesson?.stations, column]); // eslint-disable-line react-hooks/exhaustive-deps
  const lastZ = gates.length > 0 ? gates[gates.length - 1].z : FIRST_WALL;
  const endZ = lastZ - CHAMBER;
  const hinting = useRef<string | null>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // old signs wait in niches in the side walls, in the bays behind the first and third walls
  const niches = useMemo(() => {
    if (!lesson) return [];
    return lesson.reviews
      .map((r, i) => ({ r, i }))
      .filter((x) => x.r.kind === "sound")
      .map((x, k) => {
        const gate = gates[Math.max(0, Math.min(k * 2, gates.length - 2))];
        return { index: x.i, z: (gate?.z ?? FIRST_WALL) - 5.4, side: (k % 2 === 0 ? -1 : 1) as -1 | 1 };
      });
  }, [lesson?.reviews, gates]); // eslint-disable-line react-hooks/exhaustive-deps

  // what the dev aid needs to know about the run, kept where a stale closure cannot hide it
  const live = useRef({ gates, endZ, mirrored, rightOnLeft, dirDone, colDone });
  live.current = { gates, endZ, mirrored, rightOnLeft, dirDone, colDone };

  useEffect(() => {
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    aid.place = {
      /** make the next right thing happen, through the real path: stand the explorer where the game itself will notice */
      auto(): string {
        const s = game.get();
        const l = s.lesson;
        const go = aid.go as ((x: number, y: number, z: number, yaw?: number) => void) | undefined;
        if (!l || s.status !== "playing" || !go) return "not playing";
        const v = live.current;
        for (const gate of v.gates) {
          if (gate.kind === "direction") {
            if (v.dirDone) continue;
            go(v.mirrored ? 2.5 : -2.5, 1.0, gate.z + 1.0);
            return `direction wall: the ${v.mirrored ? "right" : "left"} slab`;
          }
          if (gate.kind === "column") {
            if (v.colDone) continue;
            go(v.rightOnLeft ? -2.5 : 2.5, 1.0, gate.z + 1.0);
            return `column wall: the ${v.rightOnLeft ? "left" : "right"} slab`;
          }
          if (l.progress > gate.index) continue;
          if (gate.station.teach && !l.taught.includes(gate.station.target)) {
            go(0, 1.0, gate.z + 5);
            return `beam: met ${gate.station.target}`;
          }
          const options = gate.station.options.slice(0, 3);
          const k = options.findIndex((o) => isRight(gate.station, o));
          go(doorXs(options.length)[Math.max(0, k)], 1.0, gate.z + 1.0);
          return `station ${gate.index}: slab ${k} (${options[k]})`;
        }
        go(0, 1.0, v.endZ + 1.6);
        return "the false door";
      },
    };
    return () => {
      delete aid.place;
      if (game.get().hint) game.set({ hint: null });
    };
  }, []);

  useFrame(() => {
    const s = game.get();
    const playing = s.status === "playing";
    // standing advice in the two bays where the wall itself is the question
    let want: string | null = null;
    if (playing) {
      for (const gate of gates) {
        if (gate.kind === "station") continue;
        if (gate.kind === "direction" ? dirDone : colDone) continue;
        if (playerPos.z > gate.z && playerPos.z < gate.z + BAY - 1.5) want = gate.kind === "direction" ? DIRECTION_HINT : COLUMN_HINT;
      }
    }
    if (want !== hinting.current) {
      hinting.current = want;
      game.set({ hint: want });
    }
    // through everything, and at the false door: out
    if (playing && finished() && playerPos.z < endZ + 2.4 && Math.abs(playerPos.x) < 2.2) complete(tmp.set(playerPos.x, playerPos.y + 0.6, playerPos.z).clone());
  });

  if (!lesson) return null;

  return (
    <>
      <Indoors density={0.05} fill={0.05} />
      <Lamp />
      <Physics gravity={[0, -28, 0]} paused={g.status === "won" || g.status === "paused"} timeStep="vary">
        <Hall endZ={endZ} tex={tex} />
        {gates.map((gate, i) =>
          gate.kind === "station" ? (
            <StationWall key={i} gate={gate} tex={tex} />
          ) : gate.kind === "direction" ? (
            <DirectionWall key={i} z={gate.z} mirrored={mirrored} done={dirDone} onRight={() => setDirDone(true)} tex={tex} />
          ) : column ? (
            <ColumnWall key={i} z={gate.z} column={column} rightOnLeft={rightOnLeft} done={colDone} onRight={() => setColDone(true)} tex={tex} />
          ) : null,
        )}
        {niches.map((n) => (
          <ReviewNiche key={n.index} index={n.index} z={n.z} side={n.side} tex={tex} />
        ))}
        <BurialChamber z={lastZ - CHAMBER / 2} endZ={endZ} tex={tex} />
        <Player spawn={SPAWN} enclosed distance={5.2} canJump={false} />
      </Physics>

      {/* the entrance, and what was left along the way */}
      <Brazier position={[-3.6, 0, 6.4]} lit={false} />
      <Brazier position={[3.6, 0, 6.4]} lit={false} />
      <Suspense fallback={null}>
        {gates.map((gate, i) => (
          <Model key={i} url="/models/objects/jar.glb" size={i % 3 === 0 ? 1.15 : 0.85} position={[(i % 2 === 0 ? 1 : -1) * 3.95, 0, gate.z + 9.2]} rotation={i * 1.3} />
        ))}
        <Model url="/models/objects/jar.glb" size={1.2} position={[-3.7, 0, endZ + 4.2]} rotation={0.7} />
        <Model url="/models/objects/jar.glb" size={0.9} position={[-2.9, 0, endZ + 3.4]} rotation={2.1} />
        <Model url="/models/objects/lotus.glb" size={0.8} position={[3.6, 0, endZ + 4]} />
      </Suspense>
    </>
  );
}
