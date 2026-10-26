"use client";

/**
 * The two kinds of light a place can have. `Daylight` is the golden hour the
 * causeway was built under: the sky dome, the same sky as an environment map,
 * the low sun (its shadow box follows `playerPos`, which every place keeps up
 * to date) and the haze. `Indoors` is for the tomb, the workshop and the
 * passage: no sky, dark fog, and only as much fill as it is given.
 */
import { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { playerPos, SUN_DIR } from "./store";
import { SkyDome } from "./Sky";

const SUN_OFFSET = SUN_DIR.clone().multiplyScalar(70);

export function Daylight({ span = 30, haze = 0.0042 }: { /** half the side of the square the sun casts shadows over */ span?: number; haze?: number }) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const sun = useRef<THREE.DirectionalLight>(null);

  // (a layout effect: fog is part of every shader, so it has to be in place before Post compiles them for the first frame)
  useLayoutEffect(() => {
    // the haze is the colour of the sky at the horizon, so distance fades into it
    scene.fog = new THREE.FogExp2(new THREE.Color().setRGB(0.96, 0.6, 0.36), haze);
    scene.environmentIntensity = 0.75;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.92;
    return () => {
      scene.fog = null;
    };
  }, [scene, gl, haze]);

  // the sun's shadow box follows the player, snapped to stop the edges crawling
  useFrame(() => {
    const light = sun.current;
    if (!light) return;
    const snap = 0.5;
    const cx = Math.round(playerPos.x / snap) * snap;
    const cy = Math.round(Math.max(playerPos.y, 0) / snap) * snap;
    const cz = Math.round(playerPos.z / snap) * snap;
    light.target.position.set(cx, cy, cz);
    light.position.set(cx + SUN_OFFSET.x, cy + SUN_OFFSET.y, cz + SUN_OFFSET.z);
    light.target.updateMatrixWorld();
  });

  return (
    <>
      <SkyDome />
      {/* the same sky, without the sun's disc, lights every PBR surface (this is what makes the gold read as gold) */}
      <Environment resolution={128} frames={1} background={false}>
        <SkyDome env />
        <mesh position={[0, -30, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[60, 24]} />
          <meshBasicMaterial color={[0.55, 0.36, 0.2]} />
        </mesh>
      </Environment>
      <directionalLight
        ref={sun}
        position={SUN_OFFSET}
        color="#ffb26b"
        intensity={4.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.05}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-camera-near={1}
        shadow-camera-far={180}
      />
      <hemisphereLight args={["#8fa6ff", "#c8874a", 0.85]} />
    </>
  );
}

export function Indoors({ fog = "#090503", density = 0.045, fill = 0.12, fillColor = "#ffb877" }: { fog?: string; density?: number; fill?: number; fillColor?: string }) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  useLayoutEffect(() => {
    const before = scene.background;
    scene.background = new THREE.Color(fog);
    scene.fog = new THREE.FogExp2(new THREE.Color(fog), density);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.92;
    return () => {
      scene.background = before;
      scene.fog = null;
    };
  }, [scene, gl, fog, density]);
  return <ambientLight color={fillColor} intensity={fill} />;
}
