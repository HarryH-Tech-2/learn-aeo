"use client";

/**
 * The scribe's workshop: spelling order without reflexes, for learners who
 * dislike action games. A calm block-pushing puzzle on a grid: sign blocks
 * are pushed into a cartouche inlaid in the floor, first sound first. A block
 * in the wrong place is carried back to where it started, so nothing can be
 * wedged for good; Z takes a move back and R puts the loose blocks back.
 *
 * A new sign is met by walking up to its block: the first bump shows the
 * card and moves nothing, so it cannot go wrong. When the sounds are in
 * place, the last space takes the silent picture, chosen by meaning.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { signInfo, stationOfSocket, type Phrase } from "../lesson";
import { game, input, playerPos, useGame, type Lesson } from "../store";
import { answer, closeTeach, complete, finished, slip, teach } from "../answers";
import { sfx } from "../audio";
import { burst } from "../Particles";
import { Indoors } from "../Light";
import { Brazier, Model } from "../Scenery";
import { Walker, type Pose } from "../Avatar";
import { WordSlab, useFace } from "../kit";
import { worldBox, type GameTextures } from "../textures";

// ─── the floor ───

const COLS = 11;
const ROWS = 9;
const CELL = 1.6;
const SLOT_ROW = 2;
const START: Cell = [5, 7];
const DOOR: Cell = [5, 0];
/** Where loose blocks start, and go back to: never next to one another, never against a wall. */
const HOMES: Cell[] = [
  [2, 4],
  [4, 4],
  [6, 4],
  [8, 4],
  [2, 6],
  [4, 6],
  [6, 6],
  [8, 6],
];

type Cell = [number, number];

const wx = (c: number) => (c - (COLS - 1) / 2) * CELL;
const wz = (r: number) => (r - (ROWS - 1) / 2) * CELL;
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
/** The rim of the room is for walking only: a block can never be pushed against a wall. */
const rim = (c: Cell) => c[0] <= 0 || c[0] >= COLS - 1 || c[1] <= 0 || c[1] >= ROWS - 1;
const inside = (c: Cell) => c[0] >= 0 && c[0] < COLS && c[1] >= 0 && c[1] < ROWS;

// ─── one cartouche ───

type Slot = { symbol: string; sound: string; cell: Cell; /** the station that answers for it; −1 when it is already carved */ station: number; silent: boolean; given: boolean };

type Block = { id: number; sign: string; silent: boolean; cell: Cell; home: Cell; locked: boolean; /** drawn position, eased toward the cell */ x: number; z: number; lift: number; shake: number };

type Stage = { phrase: number; slots: Slot[]; blocks: Block[] };

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A stage is one word's cartouche: its sockets in order, then (when it is asked for next) a last place for the silent picture. */
function buildStages(lesson: Lesson): Stage[] {
  let id = 0;
  const det = lesson.stations.findIndex((s) => s.kind === "det");
  const stages: Stage[] = [];
  const make = (pi: number, phrase: Phrase, withSigns: boolean, withDet: boolean): Stage => {
    const n = phrase.sockets.length + (withDet ? 1 : 0);
    const c0 = Math.round((COLS - n) / 2);
    const slots: Slot[] = phrase.sockets.map((sk, i) => ({ symbol: sk.symbol, sound: sk.sound, cell: [c0 + i, SLOT_ROW], station: stationOfSocket(lesson, pi, sk), silent: false, given: !!sk.given || !withSigns }));
    if (withDet) slots.push({ symbol: lesson.stations[det].target, sound: "silent", cell: [c0 + phrase.sockets.length, SLOT_ROW], station: det, silent: true, given: false });
    // the blocks: every sign the cartouche still wants, a decoy or two from the tablets' options, and the silent pictures
    const wanted = slots.filter((s) => !s.given && !s.silent).map((s) => s.symbol);
    const decoys = withSigns ? [...new Set(lesson.stations.filter((s) => s.kind === "sign" && s.phrase === pi).flatMap((s) => s.options))].filter((o) => !wanted.includes(o)).slice(0, 2) : [];
    const signs = [...wanted, ...decoys].map((sign) => ({ sign, silent: false }));
    const pictures = withDet ? lesson.stations[det].options.map((sign) => ({ sign, silent: true })) : [];
    const homes = shuffle(HOMES);
    const blocks: Block[] = [...signs, ...pictures].slice(0, HOMES.length).map((b, i) => ({ id: id++, ...b, cell: homes[i], home: homes[i], locked: false, x: wx(homes[i][0]), z: wz(homes[i][1]), lift: 0, shake: 0 }));
    // what is already carved sits in its place from the start
    slots.forEach((s) => {
      if (s.given) blocks.push({ id: id++, sign: s.symbol, silent: false, cell: s.cell, home: s.cell, locked: true, x: wx(s.cell[0]), z: wz(s.cell[1]), lift: 0, shake: 0 });
    });
    return { phrase: pi, slots, blocks };
  };
  lesson.phrases.forEach((phrase, pi) => {
    const lastSign = lesson.stations.reduce((last, s, i) => (s.phrase === pi && s.kind !== "det" ? i : last), -1);
    const detHere = det >= 0 && lesson.stations[det].phrase === pi && det === lastSign + 1;
    stages.push(make(pi, phrase, true, detHere));
  });
  // a silent picture asked for after ANOTHER word was spelled gets the word back, whole, with one place left
  if (det >= 0 && !stages.some((st) => st.slots.some((s) => s.silent))) stages.push(make(lesson.stations[det].phrase, lesson.phrases[lesson.stations[det].phrase], false, true));
  return stages;
}

// ─── drawing ───

function BlockMesh({ block, glowing, tex }: { block: Block; glowing: () => boolean; tex: GameTextures }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.MeshStandardMaterial>(null);
  const face = useFace(block.sign, true, { tint: block.silent ? "#d5e2dc" : "#ead9b4", w: 256, h: 256 });
  useFrame(({ clock }, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 20);
    const k = 1 - Math.exp(-14 * dt);
    block.x += (wx(block.cell[0]) - block.x) * k;
    block.z += (wz(block.cell[1]) - block.z) * k;
    // a block being carried home rides high; a block in its place sinks flush with the floor inlay
    const far = Math.hypot(wx(block.cell[0]) - block.x, wz(block.cell[1]) - block.z);
    block.lift += ((far > CELL * 1.2 ? 1.5 : 0) - block.lift) * k;
    block.shake = Math.max(0, block.shake - dt * 2.5);
    g.position.set(block.x + Math.sin(clock.elapsedTime * 60) * 0.06 * block.shake, (block.locked ? 0.42 : 0.62) + block.lift, block.z);
    if (body.current) {
      const pulse = glowing() ? 0.35 + Math.sin(clock.elapsedTime * 3) * 0.2 : 0;
      body.current.emissive.setRGB(block.shake * 1.2 + pulse * 1.4, pulse * 1.05, pulse * 0.4);
      body.current.color.set(block.locked ? "#f0c964" : "#fff1d2");
    }
  });
  return (
    <group ref={group}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.26, 1.24, 1.26]} />
        <meshStandardMaterial ref={body} map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.8} emissive="#000000" />
      </mesh>
      {/* the sign on top and on the side that faces the room, so it reads from above and from the door */}
      <mesh position={[0, 0.625, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.12, 1.12]} />
        <meshStandardMaterial map={face} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.635]}>
        <planeGeometry args={[1.12, 1.12]} />
        <meshStandardMaterial map={face} roughness={0.8} />
      </mesh>
    </group>
  );
}

function SlotTile({ slot, next }: { slot: Slot; next: () => boolean }) {
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const label = useFace(slot.sound, false, { tint: "#2a1d0c", ink: "#ffd56b", w: 256, h: 128, border: false });
  useFrame(({ clock }) => {
    if (glow.current) glow.current.opacity = next() ? 0.55 + Math.sin(clock.elapsedTime * 3.2) * 0.25 : 0;
  });
  return (
    <group position={[wx(slot.cell[0]), 0, wz(slot.cell[1])]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CELL * 0.92, CELL * 0.92]} />
        <meshStandardMaterial color="#3a2a16" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CELL * 0.92, CELL * 0.92]} />
        <meshBasicMaterial ref={glow} color={[0.3, 2.2, 2.0]} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* the sound this place wants, inlaid in the floor on the side the blocks come from */}
      <mesh position={[0, 0.03, CELL * 0.86]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CELL * 0.95, CELL * 0.6]} />
        <meshBasicMaterial map={label} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** The ring round the word: a rope loop with a bar at the end where the line finishes. */
function CartoucheRing({ slots }: { slots: Slot[] }) {
  const x0 = wx(slots[0].cell[0]) - CELL * 0.62;
  const x1 = wx(slots[slots.length - 1].cell[0]) + CELL * 0.62;
  const z = wz(SLOT_ROW);
  const gold = <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.3} emissive="#ff9a1f" emissiveIntensity={0.25} />;
  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(x0 + x1) / 2, 0.06, z + s * CELL * 0.6]} castShadow>
          <boxGeometry args={[x1 - x0, 0.12, 0.14]} />
          {gold}
        </mesh>
      ))}
      <mesh position={[x0, 0.06, z]} castShadow>
        <boxGeometry args={[0.14, 0.12, CELL * 1.2 + 0.14]} />
        {gold}
      </mesh>
      <mesh position={[x1 + 0.16, 0.08, z]} castShadow>
        <boxGeometry args={[0.2, 0.16, CELL * 1.5]} />
        {gold}
      </mesh>
      <mesh position={[x1, 0.06, z]} castShadow>
        <boxGeometry args={[0.14, 0.12, CELL * 1.2 + 0.14]} />
        {gold}
      </mesh>
    </group>
  );
}

function FloorButton({ label, position, onPress }: { label: string; position: [number, number, number]; onPress: () => void }) {
  const face = useFace(label, false, { tint: "#2a1d0c", ink: "#c9b48a", w: 256, h: 128, border: false });
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} onClick={onPress}>
      <planeGeometry args={[2.2, 1.1]} />
      <meshBasicMaterial map={face} toneMapped={false} />
    </mesh>
  );
}

function Room({ tex, open }: { tex: GameTextures; open: () => boolean }) {
  const door = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);
  const w = COLS * CELL;
  const d = ROWS * CELL;
  const geo = useMemo(() => ({ floor: worldBox(w, 0.6, d, 3.2), side: worldBox(0.8, 4.4, d, 4), back: worldBox((w - 2.4) / 2, 4.4, 0.8, 4), lintel: worldBox(2.4, 1.2, 0.8, 4), band: worldBox(w, 0.7, 0.2, 5.6, 0.7) }), [w, d]);
  useFrame((_, dt) => {
    if (door.current) door.current.position.y = THREE.MathUtils.damp(door.current.position.y, open() ? -1.7 : 1.6, 2.2, Math.min(dt, 0.1));
    if (glow.current) glow.current.intensity = THREE.MathUtils.damp(glow.current.intensity, open() ? 40 : 0, 2, Math.min(dt, 0.1));
  });
  const stoneWall = <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />;
  return (
    <group>
      <mesh geometry={geo.floor} position={[0, -0.3, 0]} receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#f3e3c2" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.side} position={[s * (w / 2 + 0.4), 2.2, 0]} castShadow receiveShadow>
          {stoneWall}
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.back} position={[s * ((w - 2.4) / 4 + 1.2), 2.2, -d / 2 - 0.4]} castShadow receiveShadow>
          {stoneWall}
        </mesh>
      ))}
      <mesh geometry={geo.lintel} position={[0, 3.8, -d / 2 - 0.4]} castShadow>
        {stoneWall}
      </mesh>
      <mesh geometry={geo.band} position={[0, 3.2, -d / 2 + 0.08]}>
        <meshStandardMaterial map={tex.band.map} normalMap={tex.band.normalMap} roughness={0.8} />
      </mesh>
      {/* the way out: a slab that sinks into the floor when the cartouches are done, and daylight behind it */}
      <mesh ref={door} position={[0, 1.6, -d / 2 - 0.35]} castShadow>
        <boxGeometry args={[2.4, 3.2, 0.5]} />
        <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#d8c49a" />
      </mesh>
      <mesh position={[0, 1.6, -d / 2 - 0.9]}>
        <planeGeometry args={[2.4, 3.2]} />
        <meshBasicMaterial color={[3.2, 2.5, 1.4]} toneMapped={false} />
      </mesh>
      <pointLight ref={glow} position={[0, 2, -d / 2 + 1]} color="#ffd9a0" intensity={0} distance={12} decay={2} />
    </group>
  );
}

// ─── the workshop ───

export default function Workshop({ tex }: { tex: GameTextures }) {
  const g = useGame();
  const lesson = g.lesson;
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const stages = useMemo(() => (lesson ? buildStages(lesson) : []), [lesson?.stations]); // eslint-disable-line react-hooks/exhaustive-deps
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[Math.min(stageIndex, stages.length - 1)];
  const pose = useRef<Pose>({ x: wx(START[0]), y: 0, z: wz(START[1]), facing: Math.PI, speed: 0 });
  const s = useRef({ cell: [...START] as Cell, busy: 0, advance: 0, taught: "", undo: [] as { cell: Cell; blocks: [number, Cell][] }[], hinted: false, nag: 0 });
  const look = useMemo(() => new THREE.Vector3(0, 0, -1.2), []);
  const eye = useMemo(() => new THREE.Vector3(), []);

  /** the first place still empty, or −1 when the cartouche is whole */
  const nextSlot = (st: Stage) => st.slots.findIndex((sl) => !st.blocks.some((b) => b.locked && same(b.cell, sl.cell)));
  const blockAt = (st: Stage, c: Cell) => st.blocks.find((b) => same(b.cell, c));

  const sendHome = (st: Stage, b: Block) => {
    const free = (c: Cell) => !blockAt(st, c) && !same(c, s.current.cell);
    const home = free(b.home) ? b.home : ([...HOMES].sort((p, q) => Math.hypot(p[0] - b.home[0], p[1] - b.home[1]) - Math.hypot(q[0] - b.home[0], q[1] - b.home[1])).find(free) ?? b.home);
    b.cell = home;
    b.shake = 1;
  };

  /** A block has been pushed onto a place in the cartouche: it stays if it is the right sign in the next empty place, and is carried back otherwise. */
  const arrive = (st: Stage, b: Block, k: number) => {
    const slot = st.slots[k];
    const at = new THREE.Vector3(wx(slot.cell[0]), 1.2, wz(slot.cell[1]));
    const want = nextSlot(st);
    const l = game.get().lesson;
    if (!l) return;
    if (k !== want) {
      game.toast("A word is written in order. Fill the cartouche from its start: the next empty place is the one that glows.", "info");
      sfx.land();
      return sendHome(st, b);
    }
    if (slot.silent !== b.silent) {
      game.toast(b.silent ? `${b.sign} is a silent picture: it goes last, after the sounds. This place wants the sound “${slot.sound}”.` : "The last place is for the silent picture: the one block you choose by meaning, not by sound.", "bad");
      slip(slot.station);
      return sendHome(st, b);
    }
    const asked = slot.station === l.progress;
    if (b.sign !== slot.symbol) {
      // the shared path words the message (and knows when the block is the word's NEXT sign, pushed too soon)
      if (asked) answer(slot.station, b.sign, at);
      else {
        slip(slot.station);
        game.toast(`That is ${b.sign}, “${signInfo(b.sign).sound}”. This place wants the sound “${slot.sound}” again.`, "bad");
      }
      return sendHome(st, b);
    }
    b.locked = true;
    s.current.undo = [];
    if (asked) answer(slot.station, b.sign, at);
    else {
      // a sign that comes round twice in the word: its station has been answered already
      sfx.right();
      burst(at, 14, [3.2, 2.1, 0.5], 3);
    }
    if (nextSlot(st) < 0) s.current.advance = 1.6;
  };

  const step = (dc: number, dr: number) => {
    const st = stage;
    const me = s.current;
    if (!st || me.busy > 0 || me.advance > 0) return;
    const to: Cell = [me.cell[0] + dc, me.cell[1] + dr];
    pose.current.facing = Math.atan2(dc, dr);
    if (!inside(to)) return;
    const b = blockAt(st, to);
    if (b) {
      if (b.locked) return;
      const l = game.get().lesson;
      const station = l?.stations.find((x) => x.kind === "sign" && x.target === b.sign && x.teach);
      if (l && station && !l.taught.includes(b.sign)) {
        // meeting a new sign: the first bump moves nothing
        teach(b.sign, new THREE.Vector3(wx(to[0]), 1.4, wz(to[1])));
        me.taught = b.sign;
        me.busy = 0.25;
        return;
      }
      const on: Cell = [to[0] + dc, to[1] + dr];
      if (!inside(on) || rim(on) || blockAt(st, on)) {
        if (performance.now() - me.nag > 4000 && rim(on)) {
          me.nag = performance.now();
          game.toast("The edge of the room is for walking. Go round the block and push it the other way.", "info");
        }
        return;
      }
      me.undo.push({ cell: [...me.cell] as Cell, blocks: st.blocks.filter((x) => !x.locked).map((x) => [x.id, [...x.cell] as Cell]) });
      if (me.undo.length > 60) me.undo.shift();
      b.cell = on;
      me.cell = to;
      me.busy = 0.24;
      const k = st.slots.findIndex((sl) => same(sl.cell, on));
      if (k >= 0) arrive(st, b, k);
    } else {
      me.cell = to;
      me.busy = 0.15;
    }
    if (same(me.cell, DOOR) && finished()) complete(new THREE.Vector3(wx(DOOR[0]), 1, wz(DOOR[1])));
  };

  const undo = () => {
    const st = stage;
    const last = s.current.undo.pop();
    if (!st || !last || s.current.advance > 0) return;
    s.current.cell = last.cell;
    last.blocks.forEach(([id, cell]) => {
      const b = st.blocks.find((x) => x.id === id);
      if (b && !b.locked) b.cell = cell;
    });
  };

  const reset = () => {
    const st = stage;
    if (!st || s.current.advance > 0) return;
    s.current.undo = [];
    s.current.cell = [...START] as Cell;
    st.blocks.forEach((b) => {
      if (!b.locked) b.cell = b.home;
    });
  };

  // Z, R, and the aid for headless checks: the next right block arrives at its place by the same code a push ends in
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || game.get().status !== "playing") return;
      if (e.code === "KeyZ") undo();
      if (e.code === "KeyR") reset();
    };
    window.addEventListener("keydown", onKey);
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    aid.place = {
      cell: () => s.current.cell,
      blocks: () => stage?.blocks.map((b) => ({ sign: b.sign, cell: b.cell, locked: b.locked })),
      auto: () => {
        const st = stage;
        const l = game.get().lesson;
        if (!st || !l) return "no stage";
        if (finished()) {
          s.current.cell = [...DOOR] as Cell;
          complete();
          return "walked out of the door";
        }
        const k = nextSlot(st);
        if (k < 0) return "waiting for the next cartouche";
        const slot = st.slots[k];
        const b = st.blocks.find((x) => !x.locked && x.sign === slot.symbol);
        if (!b) return "no block for " + slot.symbol;
        if (l.stations[slot.station]?.teach && !l.taught.includes(b.sign)) {
          teach(b.sign);
          return "met " + b.sign;
        }
        b.cell = slot.cell;
        arrive(st, b, k);
        return "pushed " + b.sign + " home";
      },
    };
    return () => {
      window.removeEventListener("keydown", onKey);
      delete aid.place;
    };
  }); // (every render: the handlers close over the current stage)

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const me = s.current;
    const state = game.get();
    const playing = state.status === "playing";

    if (playing) {
      if (!me.hinted) {
        me.hinted = true;
        game.toast("Push the sign blocks into the cartouche, first sound first. The sounds it wants are written on the floor.", "info");
      }
      me.busy = Math.max(0, me.busy - dt);
      if (me.busy === 0 && me.advance === 0) {
        const ax = Math.abs(input.x);
        const ay = Math.abs(input.y);
        if (Math.max(ax, ay) > 0.5) {
          if (ax > ay) step(Math.sign(input.x), 0);
          else step(0, -Math.sign(input.y));
        }
      }
      // the card for a sign just met goes once the learner has walked away from its block
      if (me.taught && stage) {
        const b = stage.blocks.find((x) => x.sign === me.taught && !x.locked);
        if (!b || Math.abs(b.cell[0] - me.cell[0]) + Math.abs(b.cell[1] - me.cell[1]) > 2) {
          closeTeach(me.taught);
          me.taught = "";
        }
      }
      // a finished cartouche is looked at for a moment, then the next word is laid out
      if (me.advance > 0) {
        me.advance = Math.max(0, me.advance - dt);
        if (me.advance === 0 && stageIndex < stages.length - 1) {
          me.undo = [];
          me.cell = [...START] as Cell;
          setStageIndex(stageIndex + 1);
        }
      }
    }

    // the explorer eases from cell to cell
    const p = pose.current;
    const tx = wx(me.cell[0]);
    const tz = wz(me.cell[1]);
    const dist = Math.hypot(tx - p.x, tz - p.z);
    const k = 1 - Math.exp(-16 * dt);
    p.x += (tx - p.x) * k;
    p.z += (tz - p.z) * k;
    p.speed = dist > 0.04 ? 5 : 0;
    playerPos.set(p.x, 0.55, p.z);

    // a fixed view from the open side of the room, pulled back on a narrow screen so the whole floor fits
    const aspect = size.width / Math.max(1, size.height);
    const half = Math.atan(Math.tan(THREE.MathUtils.degToRad(26)) * aspect);
    const back = Math.max(19, (COLS * CELL * 0.56) / Math.tan(half));
    camera.position.lerp(eye.set(look.x, look.y + back * 0.74, look.z + back * 0.68), 1 - Math.exp(-3 * Math.min(dtRaw, 0.25)));
    camera.lookAt(look);
  });

  if (!lesson || !stage) return null;

  return (
    <>
      <Indoors fog="#1a100a" density={0.012} fill={0.55} fillColor="#ffd9ae" />
      <directionalLight position={[-9, 16, 8]} color="#ffcf9a" intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.04} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-camera-near={1} shadow-camera-far={50} />
      <Room tex={tex} open={finished} />
      <group key={stageIndex}>
        <CartoucheRing slots={stage.slots} />
        {stage.slots.map((slot, i) => (
          <SlotTile key={i} slot={slot} next={() => nextSlot(stage) === i && game.get().status === "playing"} />
        ))}
        {stage.blocks.map((b) => (
          <BlockMesh key={b.id} block={b} tex={tex} glowing={() => !b.locked && !!game.get().lesson?.stations.some((x) => x.kind === "sign" && x.target === b.sign && x.teach) && !game.get().lesson?.taught.includes(b.sign)} />
        ))}
      </group>
      <Walker pose={pose} scale={1.25} />
      {/* the words as they stand, on the back wall; and the scribe whose room this is */}
      <group position={[-5.6, 2.15, -(ROWS * CELL) / 2 + 0.24]} scale={0.56}>
        <WordSlab tex={tex} />
      </group>
      <Suspense fallback={null}>
        <Model url="/models/objects/scribe.glb" size={2.1} position={[6.4, 0, -5.4]} rotation={-0.6} />
        <Model url="/models/objects/jar.glb" size={1.1} position={[7.9, 0, -3.6]} />
        <Model url="/models/objects/jar.glb" size={0.8} position={[7.6, 0, -2.6]} rotation={1.2} />
        <Model url="/models/objects/jar.glb" size={1.2} position={[-7.9, 0, 4.8]} rotation={2} />
        <Model url="/models/objects/lotus.glb" size={0.8} position={[-7.8, 0, -5.6]} />
      </Suspense>
      <Brazier position={[-8, 0, -6.2]} />
      <Brazier position={[8, 0, 5.8]} />
      <FloorButton label="Z · back" position={[-6.4, 0.03, wz(ROWS - 1)]} onPress={undo} />
      <FloorButton label="R · reset" position={[6.4, 0.03, wz(ROWS - 1)]} onPress={reset} />
      <Sparkles count={60} scale={[COLS * CELL, 4, ROWS * CELL]} position={[0, 2.4, 0]} size={2.6} speed={0.2} color="#ffdcaa" opacity={0.5} />
    </>
  );
}
