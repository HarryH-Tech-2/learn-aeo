"use client";

/**
 * Counting House — Lesson 4's signature mechanic.
 *
 * Three kinds of round:
 *   count — loaves / jars / oxen pile up in 3D (in rows of ten, the way a
 *           scribe would tally them); write the number with numeral tiles.
 *   write — a number in digits ("the scribe counts 246 jars"); write it.
 *   read  — a number in hieroglyphs; pick what it says.
 *   audit — four docket lines, digits beside hieroglyphs; one clerk has
 *           falsified his tally. Find him.
 * Ends with the mouth-sign rule for fractions.
 */

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { NUMERAL_SIGNS, toHieroglyphic, decompose, fromHieroglyphic, wellFormed, randomNumber, unitFraction } from "@/lib/numerals";
import { XP_REWARDS } from "@/lib/gamification";
import { trackExerciseAnswer, trackExerciseComplete } from "@/lib/analytics";
import { GLYPH_STYLE, shuffle, type MechanicProps } from "./types";

/* ───────────────────────────── 3D pile ───────────────────────────── */

const GOODS = [
  { id: "loaf", label: "loaves of bread", model: "/models/signs/loaf.glb", size: 0.45 },
  { id: "jar", label: "jars of beer", model: "/models/objects/jar.glb", size: 0.5 },
  { id: "bull", label: "oxen", model: "/models/objects/bull.glb", size: 0.7 },
] as const;

type Good = (typeof GOODS)[number];

function Turntable({ children }: { children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.12;
  });
  return <group ref={g}>{children}</group>;
}

/** n copies of the GLB, normalised to `size`, laid out in rows of ten. */
function Pile({ url, n, size }: { url: string; n: number; size: number }) {
  const { scene } = useGLTF(url);
  const base = useMemo(() => {
    const o = scene.clone(true);
    const box = new THREE.Box3().setFromObject(o);
    const s = new THREE.Vector3();
    box.getSize(s);
    const k = size / Math.max(s.x, s.y, s.z, 1e-3);
    o.scale.setScalar(k);
    const box2 = new THREE.Box3().setFromObject(o);
    const c = new THREE.Vector3();
    box2.getCenter(c);
    o.position.set(-c.x, -box2.min.y, -c.z);
    return o;
  }, [scene, size]);
  const copies = useMemo(() => Array.from({ length: n }, () => base.clone(true)), [base, n]);
  const layout = useMemo(() => positions(n, size), [n, size]);
  return (
    <group>
      {copies.map((o, i) => (
        <primitive key={i} object={o} position={layout[i]} rotation={[0, ((i * 37) % 360) * (Math.PI / 180) * 0.15, 0]} />
      ))}
    </group>
  );
}

/** rows of ten, each row of ten pushed back; rows are slightly separated so the tens read at a glance */
function positions(n: number, size: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const gap = size * 1.15;
  const rows = Math.ceil(n / 10);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const inRow = Math.min(10, n - row * 10);
    const x = (col - (inRow - 1) / 2) * gap;
    const z = (row - (rows - 1) / 2) * gap * 1.35;
    out.push([x, 0, z]);
  }
  return out;
}

function FallbackPile({ n, size }: { n: number; size: number }) {
  const layout = useMemo(() => positions(n, size), [n, size]);
  return (
    <group>
      {layout.map((p, i) => (
        <mesh key={i} position={[p[0], size * 0.3, p[2]]} castShadow>
          <sphereGeometry args={[size * 0.3, 12, 10]} />
          <meshStandardMaterial color="#d4a832" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

class PileBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function CameraFit({ n, size }: { n: number; size: number }) {
  // pull back as the pile grows: frame the widest row plus the depth of the rows
  const ref = useRef(0);
  useFrame(({ camera }, d) => {
    const rows = Math.ceil(n / 10);
    const width = Math.min(10, n) * size * 1.15;
    const target = Math.max(3.2, width * 0.95 + rows * 0.65);
    ref.current += (target - ref.current) * Math.min(1, d * 3);
    camera.position.set(0, ref.current * 0.6, ref.current);
    camera.lookAt(0, size * 0.3, 0);
  });
  return null;
}

function PileStage({ good, n }: { good: Good; n: number }) {
  return (
    <div className="relative w-full aspect-[16/10] border border-gold-700/20 bg-obsidian-light/40 overflow-hidden">
      <Canvas dpr={[1, 1.5]} shadows camera={{ position: [0, 3.5, 6.5], fov: 38 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <hemisphereLight args={["#fff3dc", "#4a3416", 0.45]} />
          <directionalLight position={[4, 7, 5]} intensity={1.6} color="#fff1d6" castShadow shadow-mapSize={[1024, 1024]} />
          <Environment resolution={64} frames={1}>
            <Lightformer intensity={1.6} position={[0, 5, -6]} scale={[12, 5, 1]} color="#fff4de" />
            <Lightformer intensity={0.8} position={[6, -1, 3]} scale={[5, 7, 1]} color="#b8832c" />
          </Environment>
          {/* table */}
          <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#8d7048" roughness={1} />
          </mesh>
          <Turntable>
            <PileBoundary fallback={<FallbackPile n={n} size={good.size} />}>
              <Suspense fallback={<FallbackPile n={n} size={good.size} />}>
                <Pile url={good.model} n={n} size={good.size} />
              </Suspense>
            </PileBoundary>
          </Turntable>
          <ContactShadows position={[0, 0.01, 0]} opacity={0.4} blur={2} scale={14} far={3} />
          <CameraFit n={n} size={good.size} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ───────────────────────────── rounds ───────────────────────────── */

type AuditLine = { clerk: string; good: Good; claimed: number; written: number };
type Round =
  | { kind: "count"; good: Good; n: number }
  | { kind: "write"; good: Good; n: number }
  | { kind: "read"; n: number; options: number[] }
  | { kind: "audit"; lines: AuditLine[]; cheat: number };

const CLERKS = ["Ipi", "Nakht", "Senbi", "Hori", "Ankhu", "Meru"];

/** Four dockets; one hieroglyphic tally disagrees with the digits beside it. */
function buildAudit(): Round {
  const clerks = shuffle(CLERKS).slice(0, 4);
  const cheat = Math.floor(Math.random() * 4);
  const lines: AuditLine[] = clerks.map((clerk, i) => {
    const good = GOODS[i % GOODS.length];
    const claimed = randomNumber(12, 999, Math.random, 9);
    let written = claimed;
    if (i === cheat) {
      // the classic fiddle: one sign of a different magnitude
      const parts = decompose(claimed);
      const p = parts[Math.floor(Math.random() * parts.length)];
      const delta = p.sign.value * (Math.random() < 0.5 ? 1 : -1);
      written = claimed + delta >= 1 ? claimed + delta : claimed + p.sign.value;
      if (written === claimed) written = claimed + 1;
    }
    return { clerk, good, claimed, written };
  });
  return { kind: "audit", lines, cheat };
}

function buildRounds(): Round[] {
  const goods = shuffle(GOODS);
  const rounds: Round[] = [
    { kind: "count", good: goods[0], n: randomNumber(3, 9) },
    { kind: "count", good: goods[1], n: randomNumber(11, 19) },
    { kind: "count", good: goods[2], n: randomNumber(20, 39, Math.random, 12) },
    { kind: "write", good: goods[0], n: randomNumber(40, 99, Math.random, 10) },
    { kind: "write", good: goods[1], n: randomNumber(100, 999, Math.random, 9) },
    { kind: "write", good: goods[2], n: randomNumber(1000, 9999, Math.random, 9) },
  ];
  for (const range of [[10, 99], [100, 999], [1000, 99_999]] as const) {
    const n = randomNumber(range[0], range[1], Math.random, 8);
    const opts = new Set<number>([n]);
    while (opts.size < 4) {
      // distractors: swap a digit's magnitude (the classic mistake), or nearby
      const parts = decompose(n);
      const p = parts[Math.floor(Math.random() * parts.length)];
      const alt = Math.random() < 0.5 ? n + p.sign.value * (Math.random() < 0.5 ? 1 : -1) : n * 10 + (Math.random() < 0.5 ? 0 : -9 * n);
      if (alt >= 1 && alt !== n && alt <= 9_999_999) opts.add(alt);
      else opts.add(randomNumber(range[0], range[1]));
    }
    rounds.push({ kind: "read", n, options: shuffle([...opts]) });
  }
  rounds.push(buildAudit());
  return rounds;
}

const TILE_SIGNS = NUMERAL_SIGNS.slice(0, 5); // up to 10,000 is enough for the rounds

export default function CountingHouse({ onXPEarned, onComplete }: MechanicProps) {
  const [rounds] = useState<Round[]>(() => buildRounds());
  const [idx, setIdx] = useState(0);
  const [tiles, setTiles] = useState<string[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<"play" | "fractions" | "done">("play");
  const round = rounds[idx];

  useEffect(() => {
    GOODS.forEach((g) => {
      try {
        useGLTF.preload(g.model);
      } catch {
        /* fallback pile */
      }
    });
  }, []);

  const tileGroups = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tiles) m.set(t, (m.get(t) ?? 0) + 1);
    return [...NUMERAL_SIGNS].reverse().filter((s) => m.has(s.glyph)).map((s) => ({ sign: s, count: m.get(s.glyph)! }));
  }, [tiles]);
  const tileValue = fromHieroglyphic(tiles.join("")) ?? 0;

  function checkWrite() {
    if (!round || round.kind === "read" || round.kind === "audit" || checked !== null) return;
    const ok = tileValue === round.n && wellFormed(tiles);
    setChecked(ok);
    if (ok) {
      setCorrectCount((c) => c + 1);
      onXPEarned(XP_REWARDS.mechanicCorrect);
    }
    trackExerciseAnswer({ exercise: "counting-house", questionType: round.kind, question: String(round.n), correct: ok });
  }

  function chooseRead(n: number) {
    if (!round || round.kind !== "read" || picked !== null) return;
    setPicked(n);
    const ok = n === round.n;
    setChecked(ok);
    if (ok) {
      setCorrectCount((c) => c + 1);
      onXPEarned(XP_REWARDS.mechanicCorrect);
    }
    trackExerciseAnswer({ exercise: "counting-house", questionType: "read", question: String(round.n), correct: ok });
  }

  function chooseAudit(i: number) {
    if (!round || round.kind !== "audit" || picked !== null) return;
    setPicked(i);
    const ok = i === round.cheat;
    setChecked(ok);
    if (ok) {
      setCorrectCount((c) => c + 1);
      onXPEarned(XP_REWARDS.mechanicCorrect);
    }
    trackExerciseAnswer({ exercise: "audit", questionType: "find-cheat", question: round.lines[round.cheat].clerk, correct: ok });
  }

  function next() {
    if (idx + 1 >= rounds.length) {
      trackExerciseComplete({ exercise: "counting-house", score: correctCount, total: rounds.length });
      if (correctCount === rounds.length) onXPEarned(XP_REWARDS.mechanicPerfect);
      setPhase("fractions");
      return;
    }
    setIdx((i) => i + 1);
    setTiles([]);
    setPicked(null);
    setChecked(null);
  }

  useEffect(() => {
    if (phase === "done") onComplete({ correct: correctCount, total: rounds.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "fractions") {
    return (
      <div className="lesson-sheet p-6 md:p-8">
        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Counting house · one more thing</p>
        <h3 className="font-display text-2xl text-sand-100 mb-1">Fractions: put the mouth on top</h3>
        <p className="font-body text-sm text-sand-400 mb-5">
          The mouth sign 𓂋 read as r means ‘part’. Written over a number it makes a unit fraction: 𓂋 over 10 is one tenth. Egyptians built every
          other fraction from unit fractions (⅔ and ½ had signs of their own).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[3, 5, 10, 12].map((d) => (
            <div key={d} className="p-4 border border-gold-700/20 bg-obsidian-lighter text-center rounded-xl">
              <span className="block text-4xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                {unitFraction(d)}
              </span>
              <span className="block font-body text-xs text-sand-300 mt-2">1 / {d}</span>
            </div>
          ))}
        </div>
        <p className="font-body text-xs text-sand-500 mb-5">
          You scored {correctCount}/{rounds.length} in the counting house.
        </p>
        <div className="text-right">
          <button type="button" onClick={() => setPhase("done")} className="lesson-btn py-2.5 px-6 text-sm justify-center">
            Close the ledger
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done" || !round) {
    return (
      <div className="lesson-sheet p-6 md:p-8 text-center">
        <p className="font-body text-sm text-gold-500 mb-2 font-semibold">Counting house · complete</p>
        <h3 className="font-display text-2xl text-sand-100">{correctCount}/{rounds.length} tallies correct.</h3>
      </div>
    );
  }

  return (
    <div className="lesson-sheet p-6 md:p-8">
      <p className="font-body text-sm text-gold-500 mb-2 font-semibold">
        Counting house <span className="text-sand-500 normal-case tracking-normal ml-2">· tally {idx + 1}/{rounds.length}</span>
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {round.kind === "count" && (
            <>
              <h3 className="font-display text-2xl text-sand-100 mb-1">Count the {round.good.label} and write the number</h3>
              <p className="font-body text-sm text-sand-400 mb-4">They are laid out in rows of ten, the way a scribe would tally them. Tap the numeral tiles, then check.</p>
              <PileStage good={round.good} n={round.n} />
            </>
          )}
          {round.kind === "write" && (
            <>
              <h3 className="font-display text-2xl text-sand-100 mb-1">
                The scribe counts <span className="text-gold-300">{round.n.toLocaleString()}</span> {round.good.label}. Write it.
              </h3>
              <p className="font-body text-sm text-sand-400 mb-4">Largest signs first; each sign at most nine times. Order doesn’t change the value, but the tidy scribe groups them.</p>
            </>
          )}
          {round.kind === "read" && (
            <>
              <h3 className="font-display text-2xl text-sand-100 mb-1">What number is this?</h3>
              <p className="font-body text-sm text-sand-400 mb-4">Add up the signs; there is no place value, only repetition.</p>
              <p className="text-center text-5xl text-gold-400 leading-none my-6 break-words" style={GLYPH_STYLE}>
                {toHieroglyphic(round.n)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {round.options.map((o) => {
                  let cls = "p-4 border text-center font-display text-xl transition-all ";
                  if (picked !== null) {
                    if (o === round.n) cls += "border-green-500/60 bg-green-500/10 text-sand-100";
                    else if (o === picked) cls += "border-red-500/60 bg-red-500/10 text-sand-300";
                    else cls += "border-gold-700/10 bg-obsidian-lighter opacity-50 text-sand-400";
                  } else cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40 text-sand-100";
                  return (
                    <button key={o} type="button" onClick={() => chooseRead(o)} disabled={picked !== null} className={cls}>
                      {o.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {round.kind === "audit" && (
            <>
              <h3 className="font-display text-2xl text-sand-100 mb-1">The audit: which clerk cooked the docket?</h3>
              <p className="font-body text-sm text-sand-400 mb-4">
                Four dockets from the storeroom. Each clerk wrote the count in digits for Nour and in hieroglyphs for the wall. One pair does not match. Tap the clerk who fiddled it.
              </p>
              <div className="space-y-2">
                {round.lines.map((ln, i) => {
                  let cls = "w-full grid grid-cols-[6rem_1fr_auto] sm:grid-cols-[8rem_1fr_auto] items-center gap-3 p-3 border text-left transition-all ";
                  if (picked !== null) {
                    if (i === round.cheat) cls += "border-green-500/60 bg-green-500/10";
                    else if (i === picked) cls += "border-red-500/60 bg-red-500/10";
                    else cls += "border-gold-700/10 bg-obsidian-lighter opacity-60";
                  } else cls += "border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40";
                  return (
                    <button key={ln.clerk} type="button" onClick={() => chooseAudit(i)} disabled={picked !== null} className={cls}>
                      <span>
                        <span className="block font-display text-base text-sand-100">{ln.clerk}</span>
                        <span className="block font-body text-[10px] text-sand-500">{ln.good.label}</span>
                      </span>
                      <span className="text-2xl sm:text-3xl text-gold-400 leading-none break-words" style={GLYPH_STYLE}>
                        {toHieroglyphic(ln.written)}
                      </span>
                      <span className="font-display text-lg text-sand-200 tabular-nums">{ln.claimed.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <p className="font-body text-sm text-sand-300 mt-4">
                  {checked ? `${round.lines[round.cheat].clerk} it was. ` : `Not ${round.lines[picked].clerk}: his docket adds up. It was ${round.lines[round.cheat].clerk}. `}
                  The wall says <span className="text-gold-300">{round.lines[round.cheat].written.toLocaleString()}</span>, the docket says{" "}
                  <span className="text-gold-300">{round.lines[round.cheat].claimed.toLocaleString()}</span>: one sign of the wrong size, four thousand years ago.
                </p>
              )}
              {picked !== null && (
                <div className="text-right mt-3">
                  <button type="button" onClick={next} className="lesson-btn py-2.5 px-6 text-sm justify-center">
                    {idx + 1 >= rounds.length ? "Finish the tally" : "Next tally"}
                  </button>
                </div>
              )}
            </>
          )}

          {round.kind !== "read" && round.kind !== "audit" && (
            <>
              {/* tally line */}
              <div className="mt-4 min-h-[4.5rem] p-3 border border-dashed border-gold-700/40 bg-obsidian-lighter flex flex-wrap items-center justify-center gap-4 rounded-xl" style={GLYPH_STYLE}>
                {tileGroups.length === 0 && <span className="font-body text-sm text-sand-600" style={{ fontFamily: "inherit" }}>tap tiles below…</span>}
                {tileGroups.map(({ sign, count }) => (
                  <button
                    key={sign.glyph}
                    type="button"
                    title={`remove one ${sign.name}`}
                    disabled={checked !== null}
                    onClick={() => {
                      const i = tiles.lastIndexOf(sign.glyph);
                      if (i >= 0) setTiles((t) => t.filter((_, j) => j !== i));
                    }}
                    className="text-4xl text-gold-400 leading-none tracking-tight hover:text-red-300"
                  >
                    {sign.glyph.repeat(count)}
                  </button>
                ))}
              </div>
              <p className="font-body text-xs text-sand-500 text-center mt-1">
                {tiles.length > 0 ? `= ${tileValue.toLocaleString()}${wellFormed(tiles) ? "" : " (a sign is repeated more than nine times)"}` : " "}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {TILE_SIGNS.map((s) => (
                  <button
                    key={s.glyph}
                    type="button"
                    disabled={checked !== null}
                    onClick={() => setTiles((t) => [...t, s.glyph])}
                    className="w-16 p-2 border border-gold-700/15 bg-obsidian-lighter hover:border-gold-500/40 disabled:opacity-50 text-center rounded-xl"
                    title={s.name}
                  >
                    <span className="block text-3xl text-gold-400 leading-none" style={GLYPH_STYLE}>
                      {s.glyph}
                    </span>
                    <span className="block font-body text-[10px] text-sand-500 mt-1">{s.value.toLocaleString()}</span>
                  </button>
                ))}
              </div>

              {checked === null && (
                <div className="flex justify-between items-center mt-3">
                  <button type="button" onClick={() => setTiles([])} className="font-body text-xs text-sand-500 hover:text-gold-400 underline underline-offset-4">
                    Clear
                  </button>
                  <button type="button" onClick={checkWrite} disabled={tiles.length === 0} className="lesson-btn py-2.5 px-6 text-sm justify-center disabled:opacity-40">
                    Check
                  </button>
                </div>
              )}
            </>
          )}

          <AnimatePresence>
            {checked !== null && round.kind !== "audit" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 border ${checked ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"} rounded-xl`}
              >
                <p className="font-body text-sm text-sand-100">
                  {checked ? (
                    <>
                      Correct · <span className="text-gold-400">+{XP_REWARDS.mechanicCorrect} XP</span>
                    </>
                  ) : (
                    <>It is {round.n.toLocaleString()}:</>
                  )}{" "}
                  <span className="text-2xl align-middle text-gold-400 ml-1" style={GLYPH_STYLE}>
                    {toHieroglyphic(round.n)}
                  </span>
                </p>
                <p className="font-body text-xs text-sand-400 mt-1">
                  {decompose(round.n)
                    .map((p) => `${p.count} × ${p.sign.value.toLocaleString()} (${p.sign.name})`)
                    .join(" + ")}
                </p>
                <div className="text-right mt-3">
                  <button type="button" onClick={next} className="lesson-btn py-2.5 px-6 text-sm justify-center">
                    {idx + 1 >= rounds.length ? "Finish the tally" : "Next tally"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
