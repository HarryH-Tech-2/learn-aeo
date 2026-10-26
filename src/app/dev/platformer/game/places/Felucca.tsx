"use client";

/**
 * The felucca run: fast sound-to-sign recognition, no jumping. The boat sails
 * down the Nile on its own; rows of stone arches stand in the water, each
 * arch carrying a sign. A sound is called, and the learner steers through the
 * arch that writes it. A wrong arch is barred: the boat is thrown back and
 * tries again. New signs are met first in a band of light that spans the
 * river, so it cannot be missed, and the boat idles while the card is read.
 */
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WATER_Y } from "../course";
import { signInfo, type Station } from "../lesson";
import { game, input, playerPos, useGame, type Lesson } from "../store";
import { answer, answerReview, closeTeach, complete, teach } from "../answers";
import { sfx } from "../audio";
import { say } from "../voice";
import { burst } from "../Particles";
import { Daylight } from "../Light";
import { Water } from "../Sky";
import { Landscape, Obelisk, TempleGate, useFitted } from "../Scenery";
import { Plaque, WordSlab, drawLabel, useCanvasTexture, useFace } from "../kit";
import { worldBox, type GameTextures } from "../textures";
import Riverbanks from "./Riverbank";

const LANES = [-7, 0, 7];
const OPENING = 5.2;
const POSTS = [-10.5, -3.5, 3.5, 10.5];
const LIMIT = 10.2;
const START_Z = 130;
const RUN = 300;

type Row =
  | { kind: "teach"; z: number; symbol: string }
  | { kind: "ask"; z: number; index: number; station: Station; lanes: (string | null)[] }
  | { kind: "review"; z: number; index: number; lanes: (string | null)[] };

/** What happens to a row as the boat meets it; read every frame by the meshes, never by React. */
type RowState = { passed: boolean; barred: boolean[]; flash: number; called: boolean };

/** Two options take the outer arches and the middle one is walled up; one option stands alone in the middle. */
function toLanes(options: string[]): (string | null)[] {
  if (options.length >= 3) return options.slice(0, 3);
  if (options.length === 2) return [options[0], null, options[1]];
  return [null, options[0] ?? null, null];
}

function layOut(lesson: Lesson): { rows: Row[]; gateZ: number } {
  const asks = lesson.stations.length + lesson.reviews.length;
  const gap = Math.min(52, RUN / Math.max(1, asks));
  const rows: Row[] = [];
  let z = START_Z - 46;
  let review = 0;
  lesson.stations.forEach((station, index) => {
    if (station.teach) rows.push({ kind: "teach", z: z + gap * 0.5, symbol: station.target });
    rows.push({ kind: "ask", z, index, station, lanes: toLanes(station.options) });
    z -= gap;
    // an old sign comes back after every second arch
    if (index % 2 === 1 && review < lesson.reviews.length) {
      rows.push({ kind: "review", z, index: review, lanes: toLanes(lesson.reviews[review].options) });
      review += 1;
      z -= gap;
    }
  });
  return { rows, gateZ: z - 8 };
}

// ─── one row of arches ───

/** The sign hangs in the opening on a cloth, low enough to be read under the bar at the top of the screen; the boat sails through it. */
function ArchFace({ label, glyph, x, tint }: { label: string; glyph: boolean; x: number; tint: string }) {
  const face = useFace(label, glyph, { tint, border: false });
  const cloth = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (cloth.current) cloth.current.rotation.x = Math.sin(clock.elapsedTime * 1.3 + x) * 0.05;
  });
  return (
    <group position={[x, 5.25, 0]}>
      <mesh ref={cloth} position={[0, -2.05, 0]}>
        <planeGeometry args={[3.3, 4.1]} />
        <meshStandardMaterial map={face} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ArchRow({ row, state, tex }: { row: Extract<Row, { kind: "ask" | "review" }>; state: RowState; tex: GameTextures }) {
  const lesson = useGame().lesson;
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const geo = useMemo(() => ({ post: worldBox(1.8, 12, 2.2, 4), lintel: worldBox(24.6, 1.5, 2.4, 4), wall: worldBox(OPENING, 7, 1.6, 4) }), []);

  useFrame((_, dt) => {
    state.flash = Math.max(0, state.flash - dt * 1.4);
    bars.current.forEach((m, i) => {
      if (m) m.visible = state.barred[i];
    });
    if (glow.current) glow.current.opacity = state.flash * 0.8;
  });

  if (!lesson) return null;
  const review = row.kind === "review" ? lesson.reviews[row.index] : null;
  const station = row.kind === "ask" ? row.station : null;
  const phrase = station ? lesson.phrases[station.phrase] : null;
  const done = row.kind === "ask" ? lesson.progress > row.index : lesson.reviewed[row.index] !== null;
  const active = row.kind === "ask" ? lesson.progress === row.index : !done;
  const question = review
    ? { label: review.sign, glyph: true, caption: "an old sign · what sound is" }
    : station!.kind === "sign"
      ? { label: station!.sound, glyph: false, caption: "which sign writes" }
      : station!.kind === "read"
        ? { label: station!.target, glyph: true, caption: "what sound is" }
        : { label: `“${phrase!.meaning.split(",")[0]}”`, glyph: false, caption: "the silent picture for" };
  const glyphFaces = !review && station!.kind !== "read";

  return (
    <group position={[0, WATER_Y, row.z]}>
      {POSTS.map((x) => (
        <mesh key={x} geometry={geo.post} position={[x, 3, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} />
        </mesh>
      ))}
      <mesh geometry={geo.lintel} position={[0, 6.0, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={tex.limestone.map} normalMap={tex.limestone.normalMap} roughness={0.85} color="#fff1d2" />
      </mesh>
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[24.7, 0.16, 2.5]} />
        <meshStandardMaterial color="#d9a935" metalness={1} roughness={0.28} />
      </mesh>
      {row.lanes.map((option, i) =>
        option === null ? (
          // no third choice: this arch is walled up
          <mesh key={i} geometry={geo.wall} position={[LANES[i], 2.2, 0]} castShadow receiveShadow>
            <meshStandardMaterial map={tex.sandstone.map} normalMap={tex.sandstone.normalMap} roughness={0.9} color="#d9c39a" />
          </mesh>
        ) : (
          <group key={i}>
            <ArchFace label={option} glyph={glyphFaces} x={LANES[i]} tint={done ? "#a89b80" : review ? "#cfe3df" : "#ead9b4"} />
            {/* the bar that drops across a wrong arch */}
            <mesh
              ref={(m) => {
                bars.current[i] = m;
              }}
              position={[LANES[i], 1.5, 0.4]}
              visible={false}
            >
              <boxGeometry args={[OPENING, 0.5, 0.5]} />
              <meshBasicMaterial color={[2.6, 0.35, 0.2]} toneMapped={false} />
            </mesh>
          </group>
        ),
      )}
      {!done && <Plaque {...question} lit={active} position={[0, 8.6, 0.7]} scale={2.6} hideNear={false} />}
      {/* a wash of gold over the water when the right arch is taken */}
      <mesh position={[0, 0.12, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 14]} />
        <meshBasicMaterial ref={glow} color={[2.2, 1.6, 0.5]} transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/** Where a new sign is met on the water: a band of light from bank to bank, with the sign hanging in it. */
function LightBand({ z, symbol }: { z: number; symbol: string }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  // the sign alone, with nothing behind it: the boat sails straight through
  const face = useCanvasTexture(
    256,
    256,
    (ctx) => {
      ctx.clearRect(0, 0, 256, 256);
      drawLabel(ctx, symbol, true, 128, 136, 200, "#ffe08a");
    },
    [symbol],
    symbol,
  );
  useFrame(({ clock }) => {
    const met = !!game.get().lesson?.taught.includes(symbol);
    if (mat.current) mat.current.opacity = (met ? 0.07 : 0.26) + Math.sin(clock.elapsedTime * 2.4) * (met ? 0.01 : 0.06);
  });
  return (
    <group position={[0, WATER_Y, z]}>
      <mesh position={[0, 4, 0]}>
        <planeGeometry args={[30, 8]} />
        <meshBasicMaterial ref={mat} color={[1.6, 1.25, 0.5]} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 4.6, 0.05]}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial map={face} transparent depthWrite={false} toneMapped={false} color={[1.5, 1.5, 1.5]} side={THREE.DoubleSide} />
      </mesh>
      <Sparkles count={50} scale={[28, 6, 2]} position={[0, 3.4, 0]} size={6} speed={0.8} color="#ffe2a0" />
    </group>
  );
}

// ─── the boat ───

function Boat({ boat }: { boat: React.RefObject<{ x: number; z: number; lean: number; shake: number }> }) {
  const ref = useRef<THREE.Group>(null);
  // the model lies along X: turned a quarter so it sails away from the camera
  const hull = useFitted("/models/objects/boat.glb", 6.2);
  useFrame(({ clock }) => {
    const g = ref.current;
    const b = boat.current;
    if (!g || !b) return;
    const t = clock.elapsedTime;
    g.position.set(b.x + (b.shake > 0 ? Math.sin(t * 60) * 0.12 * b.shake : 0), WATER_Y - 0.35 + Math.sin(t * 1.3) * 0.1, b.z);
    g.rotation.set(Math.sin(t * 1.1) * 0.03, -b.lean * 0.5, b.lean * 0.22 + Math.sin(t * 0.9) * 0.025);
  });
  return (
    <group ref={ref}>
      <primitive object={hull} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

// ─── the run ───

export default function Felucca({ tex }: { tex: GameTextures }) {
  const g = useGame();
  const lesson = g.lesson;
  const camera = useThree((s) => s.camera);
  const plan = useMemo(() => (lesson ? layOut(lesson) : { rows: [], gateZ: 0 }), [lesson?.stations, lesson?.reviews]); // eslint-disable-line react-hooks/exhaustive-deps
  const states = useMemo<RowState[]>(() => plan.rows.map(() => ({ passed: false, barred: [false, false, false], flash: 0, called: false })), [plan]);
  const boat = useRef({ x: 0, z: START_Z, lean: 0, shake: 0 });
  const s = useRef({ vx: 0, speed: 0, idle: 0, back: 0, next: 0, teaching: "", wake: 0, posts: 0 });
  const door = useRef<THREE.Group>(null);
  const look = useMemo(() => new THREE.Vector3(0, WATER_Y + 2, START_Z - 14), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.position.set(4, WATER_Y + 5, START_Z + 13);
  }, [camera]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const b = boat.current;
    const st = s.current;
    const state = game.get();
    const l = state.lesson;
    const playing = state.status === "playing" && !!l;
    playerPos.set(b.x, WATER_Y, b.z);

    if (playing && l) {
      const gentle = state.campaign.gentle;
      const row = plan.rows[st.next];
      const closing = !row && b.z < plan.gateZ + 30;

      // way on: the river carries the boat; it idles in a band of light and is thrown back by a barred arch
      st.idle = Math.max(0, st.idle - dt);
      if (st.idle === 0 && st.teaching) {
        closeTeach(st.teaching);
        st.teaching = "";
      }
      const cruise = (gentle ? 6.5 : 9) + Math.min(3, l.progress * 0.4);
      const want = st.idle > 0 ? 1.6 : cruise;
      st.speed += (want - st.speed) * Math.min(1, dt * 2.2);
      if (st.back > 0) {
        const step = Math.min(st.back, 16 * dt);
        st.back -= step;
        b.z += step;
      } else b.z -= st.speed * dt;

      // steering, with a little help lining up on an arch (and on the gate at the end)
      const steer = closing ? 0 : input.x;
      st.vx += (steer * 9 - st.vx) * Math.min(1, dt * 6);
      b.x = THREE.MathUtils.clamp(b.x + st.vx * dt, -LIMIT, LIMIT);
      if (closing) b.x += (0 - b.x) * Math.min(1, dt * 1.6);
      else if (row && row.kind !== "teach" && b.z - row.z < 14 && Math.abs(steer) < 0.3) {
        const lane = LANES.reduce((best, x) => (Math.abs(x - b.x) < Math.abs(best - b.x) ? x : best), LANES[0]);
        b.x += (lane - b.x) * Math.min(1, dt * 1.8);
      }
      b.lean += (st.vx / 9 - b.lean) * Math.min(1, dt * 5);
      b.shake = Math.max(0, b.shake - dt * 2.5);

      // the sound is called as its arches come up
      if (row && row.kind === "ask" && !states[st.next].called && b.z - row.z < 34 && st.idle === 0) {
        states[st.next].called = true;
        if (row.station.kind === "sign") say(signInfo(row.station.target).said);
      }

      // meeting the next thing on the water
      if (row && b.z - 2.6 <= row.z && st.back === 0) {
        const rs = states[st.next];
        if (row.kind === "teach") {
          teach(row.symbol, tmp.set(b.x, WATER_Y + 1.5, b.z).clone());
          st.teaching = row.symbol;
          st.idle = 4.6;
          rs.passed = true;
          st.next += 1;
        } else {
          const lane = LANES.findIndex((x) => Math.abs(x - b.x) < OPENING / 2 - 0.7);
          const option = lane >= 0 ? row.lanes[lane] : null;
          const at = tmp.set(b.x, WATER_Y + 2, row.z).clone();
          if (option === null || rs.barred[lane]) {
            // a post, a walled arch or a bar already down: no harm, but no way through
            st.back = 7;
            b.shake = 1;
            sfx.land();
            if (performance.now() - st.posts > 5000) {
              st.posts = performance.now();
              game.toast(lane < 0 ? "Mind the posts: line the boat up with an arch." : option === null ? "That arch is walled up. Steer for an open one." : "That arch is barred now. Steer for another.", "info");
            }
          } else if (row.kind === "review") {
            answerReview(row.index, option, at);
            rs.flash = 1;
            rs.passed = true;
            st.next += 1;
          } else {
            const outcome = answer(row.index, option, at);
            if (outcome === "wrong") {
              rs.barred[lane] = true;
              st.back = 11;
              st.speed = 0;
              b.shake = 1;
              burst(at, 18, [0.9, 0.95, 1.0], 4, { up: 4, size: 0.12, life: 0.7, gravity: -10 });
            } else {
              rs.flash = 1;
              rs.passed = true;
              st.next += 1;
            }
          }
        }
      }

      // a wake behind the stern
      st.wake -= dt;
      if (st.wake <= 0 && st.speed > 3) {
        st.wake = 0.16;
        burst(tmp.set(b.x + (Math.random() - 0.5) * 0.8, WATER_Y + 0.05, b.z + 3.1), 2, [0.8, 0.95, 1.0], 0.9, { up: 0.6, size: 0.1, life: 0.7, gravity: -1 });
      }

      if (b.z < plan.gateZ - 3) complete(tmp.set(b.x, WATER_Y + 2, b.z).clone());
    }

    // the stone in the water gate sinks as the boat comes up to it
    if (door.current) {
      const open = THREE.MathUtils.clamp((plan.gateZ + 55 - b.z) / 30, 0, 1);
      const e = open * open * (3 - 2 * open);
      door.current.position.y = WATER_Y + 2.9 - e * 7.4;
    }

    // the camera rides behind and above, and leans a little into the turn
    const cdt = Math.min(dtRaw, 0.25);
    tmp.set(b.x * 0.55, WATER_Y + 5.6, b.z + 13.5);
    camera.position.lerp(tmp, 1 - Math.exp(-5 * cdt));
    look.lerp(tmp.set(b.x * 0.8, WATER_Y + 2.6, b.z - 16), 1 - Math.exp(-8 * cdt));
    camera.lookAt(look);
  });

  return (
    <>
      <Daylight span={34} />
      <Water />
      <Landscape tex={tex} />
      {/* banks close enough to look at: reeds, fields, villages, a temple, colossi (Riverbank.tsx) */}
      <Riverbanks tex={tex} />
      <Obelisk position={[-15, WATER_Y - 0.6, START_Z - 20]} height={17} tex={tex} />
      <Obelisk position={[15, WATER_Y - 0.6, START_Z - 20]} height={17} tex={tex} />
      {plan.rows.map((row, i) => (row.kind === "teach" ? <LightBand key={i} z={row.z} symbol={row.symbol} /> : <ArchRow key={i} row={row} state={states[i]} tex={tex} />))}
      <TempleGate tex={tex} at={[0, WATER_Y - 1.2, plan.gateZ]} />
      <group ref={door} position={[0, WATER_Y + 2.9, plan.gateZ + 0.45]}>
        <WordSlab tex={tex} />
      </group>
      <Suspense fallback={null}>
        <Boat boat={boat} />
      </Suspense>
      <Sparkles count={200} scale={[60, 18, RUN + 120]} position={[0, 4, START_Z - RUN / 2]} size={3.2} speed={0.25} color="#ffdcaa" opacity={0.5} noise={1.2} />
    </>
  );
}
