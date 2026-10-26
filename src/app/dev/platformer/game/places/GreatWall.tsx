"use client";

/**
 * The great wall: the last test, read with no help. A huge inscription stands
 * out of the river, one word to a line, a real king's name in a cartouche at
 * the top. The learner climbs it a line at a time, by reading it:
 *
 *   • on a ledge, decide which END the line above begins at (figures look
 *     toward the start of the line), walk there and press up;
 *   • on the line, take the signs in reading order: round the sign in hand
 *     three holds fan out, each carrying a sound, and the right one swings
 *     the climber on. A wrong hold breaks off;
 *   • after the last sign the climber scrambles up to the next ledge alone,
 *     and after the top line goes over the parapet to look at the view.
 *
 * No physics: the climber is the `Walker`, moved from here. Every answer goes
 * through answers.ts, so the bar, the finish card and the filing still work.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WATER_Y } from "../course";
import { FACING_SIGNS, signInfo, stationOfSocket, type Socket } from "../lesson";
import { game, input, playerPos, useGame, type Lesson } from "../store";
import { answer, complete, slip } from "../answers";
import { sfx } from "../audio";
import { burst } from "../Particles";
import { Daylight } from "../Light";
import { Water } from "../Sky";
import { Brazier, Landscape, Obelisk } from "../Scenery";
import { Walker, type Pose } from "../Avatar";
import { useFace } from "../kit";
import { worldBox, type GameTextures } from "../textures";

/** The carved face looks up the river (+Z); the climber and the camera are on that side of it. */
const WALL_Z = -120;
const WALL_W = 30;
const WALL_D = 10;
const TIER = 7;
/** A line's signs stand this far above its ledge, and this far apart. */
const LINE_UP = 3.6;
const PITCH = 3.6;
const CELL_W = 2.2;
const CELL_H = 2.4;
/** Feet below the middle of a sign when hanging from it (the figure is drawn at 1.6 times life size). */
const HANG = 2.2;
const SCALE = 1.6;
const LEDGE_Z = WALL_Z + 0.85;
const CLING_Z = WALL_Z + 0.42;
const REACH = 1.9;
/** Where the climber ends up: on top of the wall, back from the parapet. */
const OVER_Z = WALL_Z - 2.6;

/** Signs with a front nobody could miss: what a line's direction can fairly be read from. */
const FRONTED = [...FACING_SIGNS, "𓆓", "𓃀"];

type Line = {
  phrase: number;
  sockets: Socket[];
  /** written right to left: every sign mirrored, and the first sign on the right */
  rtl: boolean;
  /** has at least one sign with an obvious front, so its direction can be read */
  faces: boolean;
  /** where each sign stands, by reading order */
  xs: number[];
  ledgeY: number;
  lineY: number;
  leftEnd: number;
  rightEnd: number;
  /** the first station of the line: a wrong end counts against it */
  first: number;
  royal: boolean;
};

function makeLine(lesson: Lesson, phrase: number, rtl: boolean, faces: boolean): Line {
  const sockets = lesson.phrases[phrase].sockets;
  const n = sockets.length;
  const xs = sockets.map((_, j) => ((rtl ? n - 1 - j : j) - (n - 1) / 2) * PITCH);
  const half = ((n - 1) / 2) * PITCH + PITCH;
  const first = sockets.map((sk) => stationOfSocket(lesson, phrase, sk)).find((i) => i >= 0) ?? -1;
  return { phrase, sockets, rtl, faces, xs, ledgeY: phrase * TIER, lineY: phrase * TIER + LINE_UP, leftEnd: -half, rightEnd: half, first, royal: phrase === lesson.phrases.length - 1 };
}

/** Each line runs one way or the other at random; a line with nothing to tell its direction by is printed left to right. */
function layOut(lesson: Lesson): Line[] {
  const lines = lesson.phrases.map((p, pi) => {
    const faces = p.sockets.some((sk) => FRONTED.includes(sk.symbol));
    return makeLine(lesson, pi, faces && Math.random() < 0.5, faces);
  });
  // never a wall that reads all one way: the top line is turned round if need be
  const told = lines.filter((l) => l.faces);
  if (told.length >= 2 && told.every((l) => l.rtl === told[0].rtl)) {
    const top = told[told.length - 1];
    lines[top.phrase] = makeLine(lesson, top.phrase, !top.rtl, true);
  }
  return lines;
}

type Slot = "left" | "up" | "right";
const SLOTS: Slot[] = ["left", "up", "right"];
const SLOT_AT: Record<Slot, [number, number]> = { left: [-PITCH / 2, 0], up: [0, CELL_H / 2 + 0.72], right: [PITCH / 2, 0] };

/** Three sounds take the three holds; two take the sides; one hangs above. */
function toSlots(options: string[]): Record<Slot, string | null> {
  if (options.length >= 3) return { left: options[0], up: options[1], right: options[2] };
  if (options.length === 2) return { left: options[0], up: null, right: options[1] };
  return { left: null, up: options[0] ?? null, right: null };
}

// ─── the inscription ───

function Cell({ symbol, sound, mirrored, read, x, y }: { symbol: string; sound: string; mirrored: boolean; read: boolean; x: number; y: number }) {
  const face = useFace(symbol, true, { w: 256, h: 280, mirrored, tint: read ? "#f0cf7a" : "#ead9b4" });
  const tag = useFace(sound, false, { w: 160, h: 80, border: false, tint: "#2a1d0c", ink: "#ffd56b" });
  return (
    <group position={[x, y, WALL_Z]}>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[CELL_W + 0.24, CELL_H + 0.24, 0.12]} />
        <meshStandardMaterial color="#8a6a3c" roughness={0.9} />
      </mesh>
      {/* a little of its own light, because the low sun is behind the wall */}
      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[CELL_W, CELL_H]} />
        <meshStandardMaterial map={face} emissiveMap={face} emissive="#ffffff" emissiveIntensity={0.2} roughness={0.85} />
      </mesh>
      {/* the sound is carved under a sign once it has been read */}
      <mesh position={[0, -CELL_H / 2 - 0.42, 0.1]} visible={read}>
        <planeGeometry args={[1.2, 0.6]} />
        <meshBasicMaterial map={tag} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** The ring round a king's name. The bar stands at the END of the name. */
function Cartouche({ line }: { line: Line }) {
  const n = line.sockets.length;
  const halfW = ((n - 1) / 2) * PITCH + CELL_W / 2 + 0.3;
  const lo = -CELL_H / 2 - 0.95;
  const hi = CELL_H / 2 + 0.3;
  const geometry = useMemo(() => {
    const round = (p: THREE.Shape | THREE.Path, w: number, y0: number, y1: number) => {
      const r = Math.min(1.1, (y1 - y0) / 2);
      p.moveTo(-w + r, y0);
      p.lineTo(w - r, y0);
      p.absarc(w - r, y0 + r, r, -Math.PI / 2, 0, false);
      p.lineTo(w, y1 - r);
      p.absarc(w - r, y1 - r, r, 0, Math.PI / 2, false);
      p.lineTo(-w + r, y1);
      p.absarc(-w + r, y1 - r, r, Math.PI / 2, Math.PI, false);
      p.lineTo(-w, y0 + r);
      p.absarc(-w + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
    };
    const shape = new THREE.Shape();
    round(shape, halfW + 0.24, lo - 0.24, hi + 0.24);
    const hole = new THREE.Path();
    round(hole, halfW, lo, hi);
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape, 10);
  }, [halfW, lo, hi]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const endX = (line.rtl ? -1 : 1) * (halfW + 0.5);
  return (
    <group position={[0, line.lineY, WALL_Z + 0.09]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#e2b23e" metalness={1} roughness={0.3} emissive="#ff9a1f" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[endX, (lo + hi) / 2, 0.04]}>
        <boxGeometry args={[0.24, hi - lo + 0.6, 0.12]} />
        <meshStandardMaterial color="#e2b23e" metalness={1} roughness={0.3} emissive="#ff9a1f" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function Inscription({ line, progress, lesson }: { line: Line; progress: number; lesson: Lesson }) {
  return (
    <>
      {line.sockets.map((sk, j) => {
        const si = stationOfSocket(lesson, line.phrase, sk);
        return <Cell key={j} symbol={sk.symbol} sound={sk.sound} mirrored={line.rtl} read={si < 0 || si < progress} x={line.xs[j]} y={line.lineY} />;
      })}
      {/* a rung at each end, to start from (both ends look the same) */}
      {[line.leftEnd, line.rightEnd].map((x) => (
        <mesh key={x} position={[x, line.lineY - 0.1, WALL_Z + 0.16]} castShadow>
          <boxGeometry args={[0.9, 0.2, 0.32]} />
          <meshStandardMaterial color="#5a4326" roughness={0.8} />
        </mesh>
      ))}
      {line.royal && <Cartouche line={line} />}
    </>
  );
}

/** A stone that sticks out of the wall with a sound on it. Broken, it drops away. */
function Hold({ label, position, broken, onTake, tex }: { label: string; position: [number, number, number]; broken: boolean; onTake: () => void; tex: GameTextures }) {
  const face = useFace(label, false, { w: 192, h: 128, tint: "#f1e2bd" });
  const group = useRef<THREE.Group>(null);
  const fall = useRef({ v: 0, y: 0 });
  useFrame(({ clock }, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 20);
    if (!broken) {
      g.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.03;
      return;
    }
    fall.current.v += 24 * dt;
    fall.current.y += fall.current.v * dt;
    g.position.y = position[1] - fall.current.y;
    g.rotation.z += dt * 3.5;
    g.visible = fall.current.y < 16;
  });
  useEffect(
    () => () => {
      document.body.style.cursor = "auto";
    },
    [],
  );
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!broken) onTake();
  };
  return (
    <group
      ref={group}
      position={position}
      scale={1.45}
      onClick={click}
      onPointerOver={() => {
        if (!broken) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.84, 0.5]} />
        <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#f3e3bd" />
      </mesh>
      <mesh position={[0, 0, 0.255]}>
        <planeGeometry args={[1.1, 0.74]} />
        <meshStandardMaterial map={face} emissiveMap={face} emissive="#ffffff" emissiveIntensity={0.3} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** The frame that glows round the sign in hand. */
function Frame({ x, y }: { x: number; y: number }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = 0.65 + Math.sin(clock.elapsedTime * 4) * 0.3;
  });
  const geometry = useMemo(() => {
    const w = CELL_W / 2 + 0.2;
    const h = CELL_H / 2 + 0.2;
    const shape = new THREE.Shape();
    shape.moveTo(-w, -h).lineTo(w, -h).lineTo(w, h).lineTo(-w, h).lineTo(-w, -h);
    const hole = new THREE.Path();
    hole.moveTo(-w + 0.14, -h + 0.14).lineTo(-w + 0.14, h - 0.14).lineTo(w - 0.14, h - 0.14).lineTo(w - 0.14, -h + 0.14).lineTo(-w + 0.14, -h + 0.14);
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} position={[x, y, WALL_Z + 0.2]}>
      <meshBasicMaterial ref={mat} color={[0.4, 2.4, 2.1]} transparent opacity={0.8} toneMapped={false} />
    </mesh>
  );
}

// ─── the wall itself ───

function Masonry({ lines, tex }: { lines: Line[]; tex: GameTextures }) {
  const topY = lines.length * TIER;
  const footY = WATER_Y - 3;
  const height = topY - footY;
  const geo = useMemo(
    () => ({
      body: worldBox(WALL_W, height, WALL_D, 4),
      field: worldBox(16, height, 0.1, 3.6),
      ledge: worldBox(WALL_W, 0.5, 1.7, 3.6),
      quay: worldBox(WALL_W + 6, 0 - footY, 7, 3.6),
      cornice: worldBox(WALL_W + 0.8, 0.7, WALL_D + 0.8, 3.6),
    }),
    [height, footY],
  );
  const relief = useMemo(() => {
    const map = tex.relief.map.clone();
    const normalMap = tex.relief.normalMap.clone();
    for (const t of [map, normalMap]) {
      t.repeat.set(1, height / 7);
      t.needsUpdate = true;
    }
    return { map, normalMap };
  }, [tex, height]);

  // notches up from both ends of every line to the ledge above: the way the climber goes up alone
  const notches = useRef<THREE.InstancedMesh>(null);
  const places = useMemo(() => {
    const out: [number, number][] = [];
    lines.forEach((l) => {
      const n = l.sockets.length;
      const end = ((n - 1) / 2) * PITCH;
      for (let y = l.lineY + CELL_H / 2 + 0.5; y < l.ledgeY + TIER - 0.5; y += 0.62) out.push([-end, y], [end, y]);
    });
    return out;
  }, [lines]);
  useEffect(() => {
    const m = notches.current;
    if (!m) return;
    const dummy = new THREE.Object3D();
    places.forEach(([x, y], i) => {
      dummy.position.set(x + (i % 4 < 2 ? -0.22 : 0.22), y, WALL_Z + 0.06);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [places]);

  return (
    <>
      <mesh geometry={geo.body} position={[0, footY + height / 2, WALL_Z - WALL_D / 2]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
      </mesh>
      {/* the dressed field the inscription is cut into, and a panel of relief either side of it */}
      <mesh geometry={geo.field} position={[0, footY + height / 2, WALL_Z + 0.02]} receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.88} color="#f4e4c0" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 11.5, footY + height / 2, WALL_Z + 0.04]} receiveShadow>
          <planeGeometry args={[7, height]} />
          <meshStandardMaterial {...relief} roughness={0.85} color="#f4dcae" normalScale={new THREE.Vector2(1.4, 1.4)} />
        </mesh>
      ))}
      {/* the foot of the wall is a quay out of the river; above it, one narrow ledge to a line */}
      <mesh geometry={geo.quay} position={[0, footY / 2, WALL_Z + 3.5]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#fff1d2" />
      </mesh>
      {lines.slice(1).map((l) => (
        <group key={l.phrase} position={[0, l.ledgeY, LEDGE_Z]}>
          <mesh geometry={geo.ledge} position={[0, -0.25, 0]} castShadow receiveShadow>
            <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#fff1d2" />
          </mesh>
          <mesh position={[0, -0.47, 0]}>
            <boxGeometry args={[WALL_W + 0.06, 0.09, 1.76]} />
            <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.28} />
          </mesh>
        </group>
      ))}
      <mesh geometry={geo.cornice} position={[0, topY - 0.35, WALL_Z - WALL_D / 2]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} roughness={0.85} color="#f2e2be" />
      </mesh>
      <mesh position={[0, topY - 0.85, WALL_Z - WALL_D / 2]}>
        <boxGeometry args={[WALL_W + 0.5, 0.3, WALL_D + 0.5]} />
        <meshStandardMaterial color="#1f8f8a" roughness={0.5} />
      </mesh>
      <instancedMesh ref={notches} args={[undefined, undefined, places.length]} frustumCulled={false}>
        <boxGeometry args={[0.34, 0.16, 0.12]} />
        <meshStandardMaterial color="#4a3720" roughness={0.9} />
      </instancedMesh>
      {lines.map((l, i) => (
        <group key={l.phrase}>
          <Brazier position={[-WALL_W / 2 + 1.2, l.ledgeY, LEDGE_Z + (i === 0 ? 1.6 : 0)]} lit={i === 0} />
          <Brazier position={[WALL_W / 2 - 1.2, l.ledgeY, LEDGE_Z + (i === 0 ? 1.6 : 0)]} lit={false} />
        </group>
      ))}
      <Obelisk position={[-WALL_W / 2 - 4.5, WATER_Y - 0.6, WALL_Z + 3]} height={topY * 0.8 + 8} tex={tex} />
      <Obelisk position={[WALL_W / 2 + 4.5, WATER_Y - 0.6, WALL_Z + 3]} height={topY * 0.8 + 8} tex={tex} />
    </>
  );
}

// ─── the climb ───

type Mode = "ledge" | "move" | "hang" | "slip" | "top";
type View = { line: number; k: number; hanging: boolean; broken: string[] };

export default function GreatWall({ tex }: { tex: GameTextures }) {
  const g = useGame();
  const lesson = g.lesson;
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const lines = useMemo(() => (lesson ? layOut(lesson) : []), [lesson?.phrases]); // eslint-disable-line react-hooks/exhaustive-deps
  const [view, setView] = useState<View>({ line: 0, k: 0, hanging: false, broken: [] });

  const pose = useRef<Pose>({ x: 0, y: 0, z: LEDGE_Z, facing: Math.PI, speed: 0, armsUp: false, climbing: false });
  const s = useRef({
    mode: "ledge" as Mode,
    line: 0,
    k: 0,
    x: 0,
    y: 0,
    z: LEDGE_Z,
    vx: 0,
    // a move from one place on the wall to another, and what happens when it ends
    fx: 0,
    fy: 0,
    tx: 0,
    ty: 0,
    tz: CLING_Z,
    t: 0,
    dur: 1,
    arc: 0,
    then: null as null | (() => void),
    timer: 0,
    shake: 0,
    armedX: false,
    armedY: false,
    nag: 0,
  });
  const lamp = useRef<THREE.PointLight>(null);
  const look = useMemo(() => new THREE.Vector3(0, LINE_UP - 0.6, WALL_Z), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const advise = (text: string | null) => {
    if (game.get().hint !== text) game.set({ hint: text });
  };
  const ledgeAdvice = (l: Line) => (l.faces ? "Which end does this line begin at? Walk there and press up." : "Nothing in this line has a face to go by. It is printed the way this page is: start at the left end, and press up.");

  const moveTo = (tx: number, ty: number, tz: number, dur: number, arc: number, then: () => void) => {
    const st = s.current;
    st.mode = "move";
    st.fx = st.x;
    st.fy = st.y;
    st.tx = tx;
    st.ty = ty;
    st.tz = tz;
    st.t = 0;
    st.dur = dur;
    st.arc = arc;
    st.then = then;
  };

  /** At a place on the line: read the next sign, pass over one already read, or go up when the line is done. */
  const settle = () => {
    const st = s.current;
    const l = game.get().lesson;
    const line = lines[st.line];
    if (!l || !line) return;
    if (st.k >= line.sockets.length) {
      advise(null);
      setView({ line: st.line, k: st.k, hanging: false, broken: [] });
      const last = st.line >= lines.length - 1;
      moveTo(st.x, line.ledgeY + TIER, last ? CLING_Z : LEDGE_Z, 1.7, 0, () => {
        sfx.checkpoint();
        if (last) {
          // over the parapet, and a moment to look at where all this was written
          moveTo(st.x, line.ledgeY + TIER, OVER_Z, 0.9, 0.5, () => {
            st.mode = "top";
            st.timer = 3.2;
          });
          return;
        }
        st.line += 1;
        st.k = 0;
        st.mode = "ledge";
        st.armedY = false;
        setView({ line: st.line, k: 0, hanging: false, broken: [] });
        advise(ledgeAdvice(lines[st.line]));
      });
      return;
    }
    const si = stationOfSocket(l, line.phrase, line.sockets[st.k]);
    if (si < 0 || si < l.progress) {
      // a sign already read (it comes round twice), or one that was never asked for: across it, with a chime
      const k = st.k;
      moveTo(line.xs[k], line.lineY - HANG, CLING_Z, 0.5, 0.45, () => {
        sfx.ankh(k);
        st.k = k + 1;
        settle();
      });
      return;
    }
    st.mode = "hang";
    st.armedX = false;
    st.armedY = false;
    setView({ line: st.line, k: st.k, hanging: true, broken: [] });
    advise("Take the hold that carries this sign’s sound: left, up or right arrow, or click it.");
  };

  /** Press up at one end of the line: the line begins where its figures face. */
  const begin = (side: "left" | "right") => {
    const st = s.current;
    const l = game.get().lesson;
    const line = lines[st.line];
    if (!l || !line || st.mode !== "ledge" || game.get().status !== "playing") return;
    const right = line.rtl ? "right" : "left";
    const at = new THREE.Vector3(side === "left" ? line.leftEnd : line.rightEnd, line.lineY - 0.4, WALL_Z + 0.5);
    if (side !== right) {
      st.shake = 0.5;
      sfx.crumble();
      burst(at, 16, [0.9, 0.75, 0.5], 2.6, { up: 1, size: 0.13, life: 0.8, gravity: -6 });
      if (!line.faces) {
        game.toast("Nothing in this line has a face, so there is nothing to tell its direction by: it is printed left to right. Start at the left end.", "info");
        return;
      }
      slip(line.first);
      if (l.fork === "unread") game.lesson({ fork: "fell" });
      const way = line.rtl ? "right" : "left";
      game.toast(`The rung comes away in your hand. Figures look toward the START of the line: these face ${way}, so the line begins on the ${way}.`, "bad");
      return;
    }
    if (line.faces) {
      if (l.fork === "unread") game.lesson({ fork: "read" });
      else if (l.fork === "fell") game.lesson({ fork: "recovered" });
    }
    sfx.jump();
    st.x = side === "left" ? line.leftEnd : line.rightEnd;
    st.k = 0;
    moveTo(st.x, line.lineY - HANG, CLING_Z, 0.7, 0, settle);
  };

  /** Take a hold: the sound it carries is the answer for the sign in hand. */
  const take = (option: string) => {
    const st = s.current;
    const l = game.get().lesson;
    const line = lines[st.line];
    if (!l || !line || st.mode !== "hang" || game.get().status !== "playing") return;
    const k = st.k;
    const si = stationOfSocket(l, line.phrase, line.sockets[k]);
    const at = new THREE.Vector3(line.xs[k], line.lineY, WALL_Z + 0.6);
    const outcome = answer(si, option, at);
    if (outcome === "right") {
      advise(null);
      setView((v) => ({ ...v, hanging: false }));
      moveTo(line.xs[k], line.lineY - HANG, CLING_Z, 0.55, 0.5, () => {
        st.k = k + 1;
        settle();
      });
    } else if (outcome === "wrong") {
      sfx.crumble();
      burst(at, 18, [0.9, 0.75, 0.5], 3, { up: 1.2, size: 0.13, life: 0.8, gravity: -7 });
      setView((v) => ({ ...v, broken: [...v.broken, option] }));
      st.mode = "slip";
      st.timer = 0.5;
    }
  };

  // the handlers the dev aid drives are the ones input drives
  const api = useRef({ begin, take });
  api.current = { begin, take };

  useEffect(() => {
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    aid.place = {
      auto: (): string => {
        const st = s.current;
        const l = game.get().lesson;
        const line = lines[st.line];
        if (!l || !line || game.get().status !== "playing") return "not playing";
        if (st.mode === "ledge") {
          const side = line.rtl ? "right" : "left";
          st.x = side === "left" ? line.leftEnd : line.rightEnd;
          api.current.begin(side);
          return `line ${st.line + 1}: started from the ${side}`;
        }
        if (st.mode === "hang") {
          const sound = signInfo(line.sockets[st.k].symbol).sound;
          api.current.take(sound);
          return `line ${st.line + 1}, sign ${st.k + 1}: took “${sound}”`;
        }
        return `busy (${st.mode})`;
      },
    };
    return () => {
      delete aid.place;
    };
  }, [lines]);

  useEffect(() => {
    camera.position.set(3, 1, WALL_Z + 20);
    return () => {
      if (game.get().hint) game.set({ hint: null });
    };
  }, [camera]);

  // the advice for the first ledge goes up when the run starts
  const playing = g.status === "playing";
  useEffect(() => {
    if (playing && s.current.mode === "ledge" && lines[s.current.line]) advise(ledgeAdvice(lines[s.current.line]));
  }, [playing, lines]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const st = s.current;
    const line = lines[st.line];
    const p = pose.current;
    if (!line) return;
    const live = game.get().status === "playing";
    st.shake = Math.max(0, st.shake - dt);

    if (live) {
      if (Math.abs(input.x) < 0.3) st.armedX = true;
      if (Math.abs(input.y) < 0.3) st.armedY = true;

      if (st.mode === "ledge") {
        st.vx += (input.x * 5 - st.vx) * Math.min(1, dt * 10);
        st.x = THREE.MathUtils.clamp(st.x + st.vx * dt, line.leftEnd, line.rightEnd);
        st.y = line.ledgeY;
        if (st.armedY && input.y > 0.5) {
          st.armedY = false;
          if (Math.abs(st.x - line.leftEnd) < REACH) begin("left");
          else if (Math.abs(st.x - line.rightEnd) < REACH) begin("right");
          else if (performance.now() - st.nag > 4000) {
            st.nag = performance.now();
            game.toast("A line is started from one of its ends. Walk to the end it begins at, then press up.", "info");
          }
        }
      } else if (st.mode === "hang") {
        const l = game.get().lesson;
        const si = l ? stationOfSocket(l, line.phrase, line.sockets[st.k]) : -1;
        const slots = l && si >= 0 ? toSlots(l.stations[si].options) : null;
        let slot: Slot | null = null;
        if (st.armedX && Math.abs(input.x) > 0.5) {
          st.armedX = false;
          slot = input.x < 0 ? "left" : "right";
        } else if (st.armedY && input.y > 0.5) {
          st.armedY = false;
          slot = "up";
        }
        const option = slot && slots ? slots[slot] : null;
        if (option && !view.broken.includes(option)) take(option);
      } else if (st.mode === "slip") {
        st.timer -= dt;
        if (st.timer <= 0) st.mode = "hang";
      } else if (st.mode === "top") {
        st.timer -= dt;
        if (st.timer <= 0) {
          st.timer = 1e9;
          complete(tmp.set(st.x, st.y + 1.5, st.z).clone());
        }
      }

      if (st.mode === "move") {
        st.t = Math.min(1, st.t + dt / st.dur);
        const e = st.t * st.t * (3 - 2 * st.t);
        st.x = st.fx + (st.tx - st.fx) * e;
        st.y = st.fy + (st.ty - st.fy) * e + Math.sin(e * Math.PI) * st.arc;
        if (st.t >= 1) {
          const then = st.then;
          st.then = null;
          st.mode = "hang";
          if (then) then();
        }
      }
    }
    st.z += ((st.mode === "ledge" ? LEDGE_Z : st.tz) - st.z) * Math.min(1, dt * 7);

    // the figure
    const dip = st.mode === "slip" ? -Math.sin((1 - st.timer / 0.5) * Math.PI) * 0.4 : 0;
    p.x = st.x + (st.shake > 0 ? Math.sin(performance.now() * 0.06) * 0.06 * (st.shake / 0.5) : 0);
    p.y = st.y + dip;
    p.z = st.z;
    const walking = st.mode === "ledge";
    p.speed = walking ? Math.abs(st.vx) : 0;
    p.facing = walking && Math.abs(st.vx) > 0.4 ? (st.vx > 0 ? Math.PI / 2 : -Math.PI / 2) : Math.PI;
    p.climbing = st.mode === "move" && st.tz !== OVER_Z;
    p.armsUp = st.mode === "hang" || st.mode === "slip" || st.mode === "top";
    playerPos.set(st.x, st.y, st.z);
    if (lamp.current) lamp.current.position.set(st.x, st.y + 2.4, WALL_Z + 4.5);

    // the camera: behind the climber, low and looking up at first, further back and level as the wall falls away below
    const cdt = Math.min(dtRaw, 0.25);
    if (st.mode === "top") {
      camera.position.lerp(tmp.set(st.x * 0.3 + 7, st.y + 4.5, WALL_Z + 11), 1 - Math.exp(-1.6 * cdt));
      look.lerp(tmp.set(-90, st.y - 8, WALL_Z - 300), 1 - Math.exp(-1.4 * cdt));
    } else {
      const aspect = size.width / Math.max(1, size.height);
      const back = THREE.MathUtils.clamp(13 / (0.975 * aspect), 17, 34) + st.line * 1.6;
      const focusY = line.lineY - 0.6 + (st.y - (st.mode === "ledge" ? line.ledgeY : line.lineY - HANG)) * 0.5;
      camera.position.lerp(tmp.set(st.x * 0.75, focusY - 2.6 + st.line * 1.1, WALL_Z + back), 1 - Math.exp(-4 * cdt));
      look.lerp(tmp.set(st.x * 0.85, focusY, WALL_Z), 1 - Math.exp(-6 * cdt));
    }
    camera.lookAt(look);
  });

  if (!lesson) return null;
  const line = lines[view.line];
  const target = view.hanging && line ? line.sockets[view.k] : null;
  const si = target ? stationOfSocket(lesson, line.phrase, target) : -1;
  const slots = si >= 0 ? toSlots(lesson.stations[si].options) : null;
  const topY = lines.length * TIER;

  return (
    <>
      <Daylight span={28} />
      <Water />
      <Landscape tex={tex} />
      <Masonry lines={lines} tex={tex} />
      {lines.map((l) => (
        <Inscription key={l.phrase} line={l} progress={lesson.progress} lesson={lesson} />
      ))}
      {target && line && slots && (
        <>
          <Frame x={line.xs[view.k]} y={line.lineY} />
          {SLOTS.map((slot) => {
            const option = slots[slot];
            if (option === null) return null;
            const [dx, dy] = SLOT_AT[slot];
            return (
              <Hold
                key={`${view.line}:${view.k}:${slot}`}
                label={option}
                position={[line.xs[view.k] + dx, line.lineY + dy, WALL_Z + 0.4]}
                broken={view.broken.includes(option)}
                onTake={() => take(option)}
                tex={tex}
              />
            );
          })}
        </>
      )}
      <Walker pose={pose} scale={SCALE} />
      {/* a lantern's worth of light on the stone in front of the climber: the sun is behind the wall */}
      <pointLight ref={lamp} color="#ffd9a0" intensity={46} distance={17} decay={2} position={[0, 2.4, WALL_Z + 4.5]} />
      <Sparkles count={160} scale={[WALL_W + 10, topY + 12, 14]} position={[0, topY / 2, WALL_Z + 6]} size={3.4} speed={0.3} color="#ffdcaa" opacity={0.55} noise={1.2} />
    </>
  );
}
