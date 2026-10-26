"use client";

/**
 * The sky and the river share one analytic sunset: the dome draws it, the
 * water reflects it (so the glitter path always lines up with the sun), and
 * a small copy of the dome lights the scene's PBR materials as an
 * environment map. Values are linear HDR; the post chain tone-maps them.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUN_DIR } from "./store";
import { WATER_Y } from "./course";

export const SKY_GLSL = /* glsl */ `
  float skyHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float skyNoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(skyHash(i), skyHash(i + vec2(1.0, 0.0)), u.x), mix(skyHash(i + vec2(0.0, 1.0)), skyHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float skyFbm(vec2 p) {
    float s = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * skyNoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return s;
  }
  // disc: 1 draws the sun's disc (the dome), 0 leaves it out (environment map, to avoid fireflies)
  vec3 skyColor(vec3 d, vec3 sunDir, float time, float disc) {
    d = normalize(d);
    float h = max(d.y, 0.0);
    vec3 horizon = vec3(1.00, 0.60, 0.33);
    vec3 band    = vec3(0.86, 0.42, 0.44);
    vec3 zenith  = vec3(0.10, 0.19, 0.40);
    vec3 c = mix(horizon, band, smoothstep(0.0, 0.22, h));
    c = mix(c, zenith, smoothstep(0.12, 0.7, h));
    float s = max(dot(d, sunDir), 0.0);
    c += vec3(1.0, 0.50, 0.18) * pow(s, 6.0) * 0.38;
    c += vec3(1.0, 0.78, 0.45) * pow(s, 48.0) * 0.55;
    // high cirrus, lit from underneath by the low sun
    vec2 cp = d.xz / (d.y + 0.18) * 1.4 + vec2(time * 0.006, 0.0);
    float cl = skyFbm(cp * vec2(1.0, 2.4));
    float cover = smoothstep(0.52, 0.78, cl) * smoothstep(0.03, 0.28, d.y) * (1.0 - smoothstep(0.55, 0.95, d.y));
    vec3 cloudCol = mix(vec3(0.80, 0.40, 0.42), vec3(1.25, 0.85, 0.55), pow(s, 3.0));
    c = mix(c, cloudCol, cover * 0.75);
    c += vec3(1.0, 0.93, 0.78) * smoothstep(0.99935, 0.99975, s) * 9.0 * disc * (1.0 - cover);
    return c;
  }
`;

export function SkyDome({ env = false }: { env?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uSun: { value: SUN_DIR }, uTime: { value: 0 }, uDisc: { value: env ? 0 : 1 } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uSun; uniform float uTime; uniform float uDisc;
          varying vec3 vDir;
          ${SKY_GLSL}
          void main() { gl_FragColor = vec4(skyColor(vDir, uSun, uTime, uDisc), 1.0); }`,
      }),
    [env],
  );
  useFrame(({ camera, clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    // the dome rides with the camera so it is always "at infinity"
    if (!env && ref.current) ref.current.position.copy(camera.position);
  });
  return (
    <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[env ? 50 : 900, 48, 24]} />
    </mesh>
  );
}

/** The Nile: summed sine swells plus fine ripples, Fresnel-blended between deep water and the reflected sky. */
export function Water() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        fog: true,
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uSun: { value: SUN_DIR }, uTime: { value: 0 } }]),
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          #include <fog_pars_vertex>
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            vec4 mvPosition = viewMatrix * world;
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uSun; uniform float uTime;
          varying vec3 vWorld;
          #include <fog_pars_fragment>
          ${SKY_GLSL}
          vec2 swell(vec2 p, vec2 dir, float freq, float speed, float amp) {
            return dir * (amp * freq * cos(dot(dir, p) * freq + uTime * speed));
          }
          void main() {
            vec2 p = vWorld.xz;
            float dist = length(cameraPosition - vWorld);
            vec2 g = vec2(0.0);
            float far = 1.0 / (1.0 + dist * dist * 0.00012);
            g += swell(p, normalize(vec2(0.3, 1.0)), 0.22, 0.9, 0.30);
            g += swell(p, normalize(vec2(-0.7, 0.6)), 0.41, 1.3, 0.16);
            g += swell(p, normalize(vec2(0.9, 0.2)), 0.93, 1.9, 0.07);
            g += swell(p, normalize(vec2(-0.2, -1.0)), 1.7, 2.6, 0.035);
            g *= far;
            // fine ripples fade with distance so the far river does not shimmer into noise
            float fine = 1.0 / (1.0 + dist * 0.03);
            float e = 0.12;
            vec2 rp = p * 1.6 + vec2(uTime * 0.35, uTime * 0.22);
            float n0 = skyFbm(rp);
            g += vec2(skyFbm(rp + vec2(e, 0.0)) - n0, skyFbm(rp + vec2(0.0, e)) - n0) / e * 0.22 * fine;
            vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
            vec3 V = normalize(cameraPosition - vWorld);
            float fres = 0.03 + 0.97 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
            vec3 R = reflect(-V, N);
            R.y = abs(R.y) + 0.02;
            vec3 refl = skyColor(R, uSun, uTime, 1.0);
            vec3 deep = vec3(0.012, 0.06, 0.07);
            vec3 shallow = vec3(0.02, 0.12, 0.12);
            vec3 body = mix(deep, shallow, pow(max(dot(N, V), 0.0), 2.0));
            vec3 col = mix(body, min(refl, vec3(5.0)), fres);
            gl_FragColor = vec4(col, 1.0);
            #include <fog_fragment>
          }`,
      }),
    [],
  );
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, -200]} material={material}>
      <planeGeometry args={[1800, 1800, 1, 1]} />
    </mesh>
  );
}
