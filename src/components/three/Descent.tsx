"use client";

/**
 * Scribe's Descent — the 3D side-view platformer scene.
 *
 * react-three-fiber + @react-three/rapier. The player is a capsule with
 * locked rotations; floors are fixed cuboids carrying a sign painted into
 * ONE shared canvas atlas (one texture for every block, UV-offset per
 * block, same trick as Tomb Wall). Decoy blocks crumble 250 ms after the
 * player lands on them: their collider becomes a sensor and the mesh drops
 * away. Assets: three existing Meshy GLBs for set dressing (~0.7 MB), no
 * new generation. No shadows, dpr capped at 1.5, so a mid phone holds 60fps.
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Physics, RigidBody, CapsuleCollider, CuboidCollider, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { BLOCK_HALF_WIDTH, SHAFT_HALF_WIDTH, type DescentBlock, type Level } from "@/lib/descent";

const GLYPH_FONT = "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif";
const STONE_DARK = "#5d4c30";
const WALL = "#3a2b18";

export type Controls = { left: boolean; right: boolean; jump: boolean };

export type SceneEvents = {
  onLand: (block: DescentBlock) => void;
  onFall: () => void;
  onBottom: () => void;
};

type Props = {
  level: Level;
  controls: React.MutableRefObject<Controls>;
  /** ids of blocks that have crumbled */
  crumbled: Set<string>;
  respawn: { x: number; y: number; n: number };
  events: SceneEvents;
  interactive: boolean;
  paused: boolean;
  stageKey: string;
};

// ─── glyph atlas: one canvas for every block ───

const ATLAS_COLS = 8;
const ATLAS_CELL = 128;

function useGlyphAtlas(blocks: DescentBlock[]) {
  const glyphs = useMemo(() => Array.from(new Set(blocks.map((b) => b.glyph))), [blocks]);
  const rows = Math.max(1, Math.ceil(glyphs.length / ATLAS_COLS));
  const { texture, canvas } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = ATLAS_COLS * ATLAS_CELL;
    canvas.height = rows * ATLAS_CELL;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return { texture, canvas };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const paint = useCallback(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    glyphs.forEach((g, i) => {
      const x = (i % ATLAS_COLS) * ATLAS_CELL;
      const y = Math.floor(i / ATLAS_COLS) * ATLAS_CELL;
      // stone face
      const grad = ctx.createLinearGradient(x, y, x, y + ATLAS_CELL);
      grad.addColorStop(0, "#d2b98a");
      grad.addColorStop(1, "#a8905f");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, ATLAS_CELL, ATLAS_CELL);
      ctx.strokeStyle = "rgba(40,28,12,0.5)";
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, ATLAS_CELL - 4, ATLAS_CELL - 4);
      // sunk-relief sign: dark fill with a light rim offset
      ctx.font = `${Math.round(ATLAS_CELL * 0.62)}px ${GLYPH_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#1a1006";
      ctx.strokeText(g, x + ATLAS_CELL / 2, y + ATLAS_CELL / 2 + 4);
      ctx.fillStyle = "#3b2a10";
      ctx.fillText(g, x + ATLAS_CELL / 2, y + ATLAS_CELL / 2 + 4);
    });
    texture.needsUpdate = true;
  }, [canvas, glyphs, texture]);

  useEffect(() => {
    paint();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.load(`60px ${GLYPH_FONT}`).then(paint).catch(() => null);
    }
  }, [paint]);

  const uvFor = useCallback(
    (glyph: string) => {
      const i = Math.max(0, glyphs.indexOf(glyph));
      const u0 = (i % ATLAS_COLS) / ATLAS_COLS;
      const v0 = 1 - (Math.floor(i / ATLAS_COLS) + 1) / rows;
      return { u0, v0, du: 1 / ATLAS_COLS, dv: 1 / rows };
    },
    [glyphs, rows]
  );

  return { texture, uvFor };
}

/** Box geometry whose front (+z) and top faces sample one atlas cell. */
function useBlockGeometry(uv: { u0: number; v0: number; du: number; dv: number }) {
  return useMemo(() => {
    const g = new THREE.BoxGeometry(BLOCK_HALF_WIDTH * 2, 0.5, 0.9);
    const uvAttr = g.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < uvAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);
      uvAttr.setXY(i, uv.u0 + u * uv.du, uv.v0 + v * uv.dv);
    }
    uvAttr.needsUpdate = true;
    return g;
  }, [uv.u0, uv.v0, uv.du, uv.dv]);
}

// ─── blocks ───

function Block({ block, texture, uv, crumbled, onLand, interactive }: { block: DescentBlock; texture: THREE.Texture; uv: ReturnType<ReturnType<typeof useGlyphAtlas>["uvFor"]>; crumbled: boolean; onLand: (b: DescentBlock) => void; interactive: boolean }) {
  const geometry = useBlockGeometry(uv);
  const mesh = useRef<THREE.Mesh>(null);
  const fall = useRef(0);
  useFrame((_, dt) => {
    if (!crumbled || !mesh.current) return;
    fall.current += dt;
    mesh.current.position.y = block.y - fall.current * fall.current * 4;
    mesh.current.rotation.z += dt * 1.5;
    const s = Math.max(0, 1 - fall.current * 0.8);
    mesh.current.scale.setScalar(s);
    mesh.current.visible = s > 0.01;
  });
  // Albedo doubles as a mild emissive so the sign reads even between torches.
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.22, roughness: 0.9, metalness: 0.05 }), [texture]);
  const body = (
    <mesh ref={mesh} geometry={geometry} material={material} position={[block.x, block.y, 0]} />
  );
  if (!interactive) return body;
  return (
    <>
      {!crumbled && (
        <RigidBody type="fixed" colliders={false} position={[block.x, block.y, 0]} userData={{ blockId: block.id }} onCollisionEnter={({ other }) => {
          if (other.rigidBodyObject?.userData?.player) onLand(block);
        }}>
          <CuboidCollider args={[BLOCK_HALF_WIDTH, 0.25, 0.45]} />
        </RigidBody>
      )}
      {body}
    </>
  );
}

// ─── player ───

const SPEED = 4.2;
const JUMP = 7.4;

function Player({ controls, respawn, events, level, paused }: { controls: React.MutableRefObject<Controls>; respawn: { x: number; y: number; n: number }; events: SceneEvents; level: Level; paused: boolean }) {
  const body = useRef<RapierRigidBody>(null);
  const grounded = useRef(0);
  const lastJump = useRef(0);
  const bottomFired = useRef(false);
  const fellFired = useRef(false);
  const mesh = useRef<THREE.Group>(null);
  const facing = useRef(1);

  // teleport on respawn
  useEffect(() => {
    const b = body.current;
    if (!b) return;
    b.setTranslation({ x: respawn.x, y: respawn.y + 1.2, z: 0 }, true);
    b.setLinvel({ x: 0, y: 0, z: 0 }, true);
    fellFired.current = false;
  }, [respawn.n, respawn.x, respawn.y]);

  useFrame((state, dt) => {
    const b = body.current;
    if (!b) return;
    if (paused) {
      b.setLinvel({ x: 0, y: b.linvel().y, z: 0 }, true);
      return;
    }
    const c = controls.current;
    const v = b.linvel();
    const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
    if (dir !== 0) facing.current = dir;
    const now = state.clock.elapsedTime;
    const onGround = grounded.current > 0 && Math.abs(v.y) < 0.5;
    let vy = v.y;
    if (c.jump && onGround && now - lastJump.current > 0.25) {
      vy = JUMP;
      lastJump.current = now;
    }
    b.setLinvel({ x: dir * SPEED, y: vy, z: 0 }, true);
    const p = b.translation();
    // keep inside the shaft
    if (Math.abs(p.x) > SHAFT_HALF_WIDTH + 0.4) b.setTranslation({ x: Math.sign(p.x) * (SHAFT_HALF_WIDTH + 0.4), y: p.y, z: 0 }, true);
    if (mesh.current) {
      mesh.current.position.set(p.x, p.y, 0);
      mesh.current.scale.x = facing.current;
    }
    if (p.y < level.bottomY - 4 && !fellFired.current) {
      fellFired.current = true;
      events.onFall();
    }
    if (p.y <= level.bottomY + 0.9 && Math.abs(v.y) < 0.6 && !bottomFired.current) {
      bottomFired.current = true;
      events.onBottom();
    }
    void dt;
  });

  return (
    <>
      <RigidBody ref={body} colliders={false} lockRotations enabledRotations={[false, false, false]} position={[0, level.startY + 1.2, 0]} userData={{ player: true }} ccd
        onCollisionEnter={() => (grounded.current += 1)}
        onCollisionExit={() => (grounded.current = Math.max(0, grounded.current - 1))}>
        <CapsuleCollider args={[0.28, 0.26]} friction={0.2} />
      </RigidBody>
      {/* Visual scribe: a simple painted figure so we don't spend a GLB on the hero */}
      <group ref={mesh} name="player-visual">
        <mesh position={[0, 0.05, 0]}>
          <capsuleGeometry args={[0.24, 0.5, 4, 10]} />
          <meshStandardMaterial color="#e8d7b5" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#b9835a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#1c150c" roughness={1} />
        </mesh>
        <mesh position={[0.1, -0.02, 0.05]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.36, 0.06, 0.05]} />
          <meshStandardMaterial color="#c9962e" />
        </mesh>
      </group>
    </>
  );
}

// ─── camera + set dressing ───

function FollowCamera({ level }: { level: Level }) {
  const { camera, scene } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  // The player's visual group is found by name to avoid prop drilling.
  useFrame((_, dt) => {
    const g = scene.getObjectByName("player-visual") as THREE.Group | undefined;
    const y = g ? Math.max(level.bottomY + 1, Math.min(level.startY, g.position.y)) : 0;
    target.current.lerp(new THREE.Vector3(0, y - 0.6, 0), Math.min(1, dt * 4));
    camera.position.set(0, target.current.y + 1.2, 9.5);
    camera.lookAt(0, target.current.y, 0);
  });
  return null;
}

function useWallTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 1024;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "#2b1f10");
    g.addColorStop(0.5, "#4a3720");
    g.addColorStop(1, "#2b1f10");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 1024);
    // block courses
    ctx.strokeStyle = "rgba(20,12,4,0.6)";
    ctx.lineWidth = 3;
    for (let y = 0; y < 1024; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      const off = (y / 64) % 2 === 0 ? 0 : 64;
      for (let x = off; x < 256; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 64);
        ctx.stroke();
      }
    }
    // a column of painted signs down the middle
    ctx.font = `44px ${GLYPH_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const signs = ["𓋹", "𓊽", "𓌀", "𓇳", "𓅃", "𓆣", "𓁹", "𓏏", "𓈖", "𓄿", "𓅓", "𓂋", "𓊪", "𓋴", "𓎡", "𓆑"];
    signs.forEach((s, i) => {
      ctx.fillStyle = ["#9a3a24", "#2f4f8a", "#c9962e", "#3e7a4a"][i % 4];
      ctx.globalAlpha = 0.85;
      ctx.fillText(s, 128, 32 + i * 64);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 3);
    return t;
  }, []);
}

function Shaft({ level }: { level: Level }) {
  const tex = useWallTexture();
  const height = level.startY - level.bottomY + 8;
  const midY = (level.startY + level.bottomY) / 2 - 1;
  return (
    <group>
      {/* back wall */}
      <mesh position={[0, midY, -1.2]}>
        <planeGeometry args={[SHAFT_HALF_WIDTH * 2 + 2.4, height]} />
        <meshStandardMaterial map={tex} roughness={1} color="#cfbf9a" />
      </mesh>
      {/* side walls */}
      <mesh position={[-SHAFT_HALF_WIDTH - 1.2, midY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3, height]} />
        <meshStandardMaterial color={WALL} roughness={1} />
      </mesh>
      <mesh position={[SHAFT_HALF_WIDTH + 1.2, midY, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, height]} />
        <meshStandardMaterial color={WALL} roughness={1} />
      </mesh>
      {/* torches every other floor */}
      {level.floors.filter((f) => f.index % 2 === 0).map((f) => (
        <group key={f.index}>
          <pointLight position={[f.index % 4 === 0 ? -SHAFT_HALF_WIDTH - 0.6 : SHAFT_HALF_WIDTH + 0.6, f.y + 1.4, 0.6]} intensity={6} distance={7} color="#ffb347" decay={2} />
          <mesh position={[f.index % 4 === 0 ? -SHAFT_HALF_WIDTH - 0.7 : SHAFT_HALF_WIDTH + 0.7, f.y + 1.2, 0.4]}>
            <coneGeometry args={[0.12, 0.35, 6]} />
            <meshStandardMaterial color="#ffb347" emissive="#ff8c1a" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Sarcophagus({ level, interactive }: { level: Level; interactive: boolean }) {
  const y = level.bottomY;
  const lid = (
    <group position={[0, y, 0]}>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[SHAFT_HALF_WIDTH * 2 + 1, 0.6, 3]} />
        <meshStandardMaterial color={STONE_DARK} roughness={1} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.6, 0.9, 1.2]} />
        <meshStandardMaterial color="#c9a34a" metalness={0.5} roughness={0.4} emissive="#5a4010" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[2.2, 0.3, 1]} />
        <meshStandardMaterial color="#e8c460" metalness={0.6} roughness={0.35} />
      </mesh>
      <pointLight position={[0, 1.8, 1.5]} intensity={8} distance={8} color="#ffd27a" />
    </group>
  );
  if (!interactive) return lid;
  return (
    <>
      <RigidBody type="fixed" colliders={false} position={[0, y, 0]} userData={{ bottom: true }}>
        <CuboidCollider args={[SHAFT_HALF_WIDTH + 0.5, 0.3, 1.5]} position={[0, -0.3, 0]} />
        <CuboidCollider args={[1.3, 0.6, 0.6]} position={[0, 0.45, 0]} />
      </RigidBody>
      {lid}
    </>
  );
}

function Dressing({ level }: { level: Level }) {
  const urls = ["/models/objects/jar.glb", "/models/objects/scarab.glb", "/models/signs/lamp.glb"];
  const spots = [2, 5, 8];
  return (
    <>
      {urls.map((u, i) => {
        const f = level.floors[spots[i]];
        if (!f) return null;
        const side = i % 2 === 0 ? -1 : 1;
        return (
          <Suspense key={u} fallback={null}>
            <Glb url={u} position={[side * (SHAFT_HALF_WIDTH + 0.55), f.y + 0.2, -0.6]} scale={0.55} />
          </Suspense>
        );
      })}
    </>
  );
}

function Glb({ url, position, scale }: { url: string; position: [number, number, number]; scale: number }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const o = scene.clone(true);
    const box = new THREE.Box3().setFromObject(o);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = 1 / Math.max(size.x, size.y, size.z, 0.001);
    o.scale.setScalar(s);
    const centre = new THREE.Vector3();
    box.getCenter(centre);
    o.position.sub(centre.multiplyScalar(s));
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh && m.material) {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat.map) {
          mat.emissiveMap = mat.map;
          mat.emissive = new THREE.Color("#ffffff");
          mat.emissiveIntensity = 0.25;
        }
      }
    });
    return o;
  }, [scene]);
  return <primitive object={obj} position={position} scale={scale} />;
}

// ─── the scene ───

function Scene({ level, controls, crumbled, respawn, events, interactive, paused }: Omit<Props, "stageKey">) {
  const blocks = useMemo(() => level.floors.flatMap((f) => f.blocks), [level]);
  const { texture, uvFor } = useGlyphAtlas(blocks);
  const content = (
    <>
      <Shaft level={level} />
      {blocks.map((b) => (
        <Block key={b.id} block={b} texture={texture} uv={uvFor(b.glyph)} crumbled={crumbled.has(b.id)} onLand={events.onLand} interactive={interactive} />
      ))}
      <Sarcophagus level={level} interactive={interactive} />
      <Dressing level={level} />
      {interactive && <Player controls={controls} respawn={respawn} events={events} level={level} paused={paused} />}
    </>
  );
  return (
    <>
      <color attach="background" args={["#120c05"]} />
      <fog attach="fog" args={["#120c05", 8, 18]} />
      <ambientLight intensity={0.35} color="#ffe0b8" />
      <hemisphereLight args={["#6a5030", "#0d0803", 0.6]} />
      <directionalLight position={[2, 6, 6]} intensity={0.6} color="#e0b866" />
      <FollowCamera level={level} />
      {interactive ? (
        <Physics gravity={[0, -16, 0]} timeStep="vary" paused={paused}>
          {content}
        </Physics>
      ) : (
        content
      )}
    </>
  );
}

export default function Descent(props: Props) {
  const [ready, setReady] = useState(false);
  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] max-h-[78vh] border border-gold-700/20 bg-[#120c05] overflow-hidden">
      <Canvas
        key={props.stageKey}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 1, 9.5], fov: 46 }}
        style={{ touchAction: "none" }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
      {!ready && <p className="absolute inset-0 flex items-center justify-center font-body text-xs tracking-[0.2em] uppercase text-sand-500 animate-pulse">Lowering the rope…</p>}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(10,6,2,0.6) 100%)" }} />
    </div>
  );
}
