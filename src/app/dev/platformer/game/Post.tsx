"use client";

/**
 * The post chain, from three's own examples (no extra dependency):
 * HDR render with MSAA → bloom on anything brighter than white (sun, fire,
 * gold, the gate) → ACES tone mapping → a light grade (vignette, a little
 * contrast and warmth, fine grain to hide banding in the sky).
 *
 * It also keeps the frame rate up on a weak GPU: when the game has run slow
 * for a couple of seconds it gives up MSAA first (the dearest thing here,
 * with thousands of reeds and fronds on the banks), then resolution, a step
 * at a time, and never climbs back within a visit so it cannot flicker
 * between two looks.
 *
 * And it keeps the page alive while shaders compile. A first visit has to
 * compile every shader in the scene (about 80; on Windows each goes through
 * a slow translation), and drawing with one that is not ready blocks the
 * whole page until it is: measured at 15 s of freezes on a cold browser,
 * with the name box dead under the learner's fingers. So when part of the
 * scene has just been mounted (it says so with <Compile />), the shaders are
 * compiled in the background first and the last picture is held meanwhile.
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { trackEvent } from "@/lib/analytics";
import { padInstances } from "./instancePad";
import { game } from "./store";

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      // gentle S-curve and a touch more saturation
      c = mix(c, c * c * (3.0 - 2.0 * c), 0.35);
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, 1.12);
      // warm highlights, cool shadows
      c += (l - 0.5) * vec3(0.035, 0.008, -0.04);
      vec2 q = vUv - 0.5;
      float vig = smoothstep(0.95, 0.25, length(q * vec2(1.0, 0.85)));
      c *= mix(0.62, 1.0, vig);
      c += (hash(vUv * 1024.0 + uTime) - 0.5) * 0.018;
      gl_FragColor = vec4(c, 1.0);
    }`,
};

/** what each step down costs the picture: MSAA samples, and the share of the device's pixels drawn */
const QUALITY = [
  { samples: 4, pixels: 1 },
  { samples: 0, pixels: 1 },
  { samples: 0, pixels: 0.8 },
  { samples: 0, pixels: 0.62 },
];
/** slower than this over a whole window of frames and the next step down is taken */
const SLOW_FPS = 40;
const WINDOW_S = 2;
/** a compile that has not reported back by now is drawn anyway (the old, blocking way) */
const COMPILE_LIMIT_MS = 15000;

/**
 * Can this GPU really draw into a target of this kind? Plenty of phones accept a half-float target, and MSAA, but not
 * the two together: nothing is reported, and the scene comes out black under a HUD that works. So a small target is
 * cleared to a colour, resolved and read back, and only a kind that returns the colour is used.
 */
function draws(gl: THREE.WebGLRenderer, type: THREE.TextureDataType, samples: number): boolean {
  const target = new THREE.WebGLRenderTarget(4, 4, { type, samples });
  const before = gl.getRenderTarget();
  const colour = gl.getClearColor(new THREE.Color());
  const alpha = gl.getClearAlpha();
  try {
    gl.setRenderTarget(target);
    const ctx = gl.getContext();
    if (ctx.checkFramebufferStatus(ctx.FRAMEBUFFER) !== ctx.FRAMEBUFFER_COMPLETE) return false;
    gl.setClearColor(0xffffff, 1);
    gl.clear(true, false, false);
    // (three resolves a multisampled target only at the end of a render, so it is done by hand here)
    const fb = gl.properties.get(target) as { __webglFramebuffer: WebGLFramebuffer; __webglMultisampledFramebuffer?: WebGLFramebuffer };
    const gl2 = ctx as WebGL2RenderingContext;
    if (samples > 0 && fb.__webglMultisampledFramebuffer) {
      gl2.bindFramebuffer(gl2.READ_FRAMEBUFFER, fb.__webglMultisampledFramebuffer);
      gl2.bindFramebuffer(gl2.DRAW_FRAMEBUFFER, fb.__webglFramebuffer);
      gl2.blitFramebuffer(0, 0, 4, 4, 0, 0, 4, 4, gl2.COLOR_BUFFER_BIT, gl2.NEAREST);
    }
    gl2.bindFramebuffer(gl2.FRAMEBUFFER, fb.__webglFramebuffer);
    const px = type === THREE.HalfFloatType ? new Float32Array(4) : new Uint8Array(4);
    gl2.readPixels(1, 1, 1, 1, gl2.RGBA, type === THREE.HalfFloatType ? gl2.FLOAT : gl2.UNSIGNED_BYTE, px);
    return px[0] > 0 && ctx.getError() === ctx.NO_ERROR;
  } catch {
    return false;
  } finally {
    gl.resetState();
    gl.setRenderTarget(before);
    gl.setClearColor(colour, alpha);
    target.dispose();
  }
}

/** The best kind of target this GPU can draw into, and the quality step to start from. */
function pickTarget(gl: THREE.WebGLRenderer): { type: THREE.TextureDataType; step: number; hdr: boolean } {
  // a phone starts without MSAA: its screen is dense enough to hide the edges, and it is the dearest thing here
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  let pick = { type: THREE.UnsignedByteType as THREE.TextureDataType, step: 1, hdr: false };
  if (DIAG === "bytes") return pick;
  if (!touch && draws(gl, THREE.HalfFloatType, 4)) pick = { type: THREE.HalfFloatType, step: 0, hdr: true };
  else if (draws(gl, THREE.HalfFloatType, 0)) pick = { type: THREE.HalfFloatType, step: 1, hdr: true };
  if (process.env.NODE_ENV !== "production") (window as unknown as { __causewayTarget?: unknown }).__causewayTarget = { touch, ...pick };
  // (a GPU that fell short of what was first asked of it is worth knowing about)
  if (!pick.hdr || (pick.step > 0 && !touch)) {
    const dbg = gl.getContext().getExtension("WEBGL_debug_renderer_info");
    trackEvent("game_gpu_fallback", { hdr: pick.hdr, gpu: dbg ? String(gl.getContext().getParameter(dbg.UNMASKED_RENDERER_WEBGL)).slice(0, 90) : "unknown" });
  }
  return pick;
}

/**
 * For a phone that draws nothing, where there is no console to look at: add ?gl=info to the address and what the GPU
 * says of itself, and what the scene really renders to, is written over the game. ?gl=off draws with no post chain at
 * all, ?gl=nobloom leaves only the bloom out, ?gl=bytes gives up HDR: whichever of them brings the picture back is the culprit.
 */
const DIAG = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("gl");
const diag = { lost: 0, shaderErrors: [] as string[], pick: "" };

/** Render the scene small into a target of this kind and say what came out: nothing but zeros, or NaN, is the finding. */
function sample(gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, type: THREE.TextureDataType): string {
  const N = 48;
  const target = new THREE.WebGLRenderTarget(N, N, { type });
  const before = gl.getRenderTarget();
  try {
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    const half = type === THREE.HalfFloatType;
    const px = half ? new Uint16Array(N * N * 4) : new Uint8Array(N * N * 4);
    gl.readRenderTargetPixels(target, 0, 0, N, N, px);
    let nan = 0, inf = 0, zero = 0, max = 0, sum = 0;
    for (let i = 0; i < px.length; i += 4) {
      let lum = 0;
      for (let c = 0; c < 3; c++) {
        const v = half ? THREE.DataUtils.fromHalfFloat(px[i + c]) : px[i + c] / 255;
        if (Number.isNaN(v)) nan++;
        else if (!Number.isFinite(v)) inf++;
        else lum += v;
      }
      if (lum === 0) zero++;
      max = Math.max(max, lum / 3);
      sum += lum / 3;
    }
    const n = N * N;
    return `mean ${(sum / n).toFixed(3)} max ${max.toFixed(2)} black ${Math.round((zero / n) * 100)}% NaN ${nan} inf ${inf} glErr ${gl.getContext().getError()}`;
  } catch (e) {
    return "threw: " + String(e).slice(0, 120);
  } finally {
    gl.setRenderTarget(before);
    target.dispose();
  }
}

// how many parts of the scene have asked to be compiled; Post compiles again whenever it has grown
let compileAsked = 0;

/** Mounted inside a part of the scene that arrives on its own (behind a Suspense): has Post compile its shaders before drawing it. */
export function Compile() {
  useLayoutEffect(() => {
    compileAsked++;
  }, []);
  return null;
}

export default function Post({ onDrawn }: { /** told once, when the first picture is on the canvas */ onDrawn?: () => void }) {
  const drawn = useRef(false);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const setDpr = useThree((s) => s.setDpr);
  const quality = useRef({ step: 0, frames: 0, time: 0, settle: 3, dpr: 0 });
  const compiling = useRef({ seen: -1, busy: false });

  const { composer, grade } = useMemo(() => {
    const pick = pickTarget(gl);
    quality.current.step = Math.max(quality.current.step, pick.step);
    const target = new THREE.WebGLRenderTarget(4, 4, { type: pick.type, samples: QUALITY[quality.current.step].samples });
    const composer = new EffectComposer(gl, target);
    composer.addPass(new RenderPass(scene, camera));
    // (bloom works in half-float targets of its own, and without HDR nothing is brighter than white anyway)
    diag.pick = `${pick.hdr ? "half-float" : "bytes"}, step ${quality.current.step}`;
    if (pick.hdr && DIAG !== "nobloom") composer.addPass(new UnrealBloomPass(new THREE.Vector2(4, 4), 0.3, 0.55, 1.0));
    composer.addPass(new OutputPass());
    const grade = new ShaderPass(GradeShader);
    composer.addPass(grade);
    return { composer, grade };
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(dpr);
    composer.setSize(size.width, size.height);
  }, [composer, size, dpr]);

  useEffect(() => () => composer.dispose(), [composer]);

  // ?gl=…: the findings, written over the game (see DIAG)
  const wantSample = useRef(false);
  const report = useRef<HTMLPreElement | null>(null);
  useEffect(() => {
    if (!DIAG) return;
    const ctx = gl.getContext() as WebGL2RenderingContext;
    const dbg = ctx.getExtension("WEBGL_debug_renderer_info");
    const head = [
      `gl=${DIAG} · ${dbg ? ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "gpu unknown"}`,
      `${ctx.getParameter(ctx.VERSION)} · max samples ${ctx.getParameter(ctx.MAX_SAMPLES)} · frag uniforms ${ctx.getParameter(ctx.MAX_FRAGMENT_UNIFORM_VECTORS)} · varyings ${ctx.getParameter(ctx.MAX_VARYING_VECTORS)} · tex units ${ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS)}`,
      `ext: float ${!!ctx.getExtension("EXT_color_buffer_float")} half ${!!ctx.getExtension("EXT_color_buffer_half_float")} blend ${!!ctx.getExtension("EXT_float_blend")} linear ${!!ctx.getExtension("OES_texture_float_linear")}`,
    ];
    const el = document.createElement("pre");
    el.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;margin:0;padding:6px 8px;background:rgba(0,0,0,.85);color:#9f9;font:11px/1.35 monospace;white-space:pre-wrap;pointer-events:none";
    el.dataset.head = head.join("\n");
    el.textContent = el.dataset.head;
    document.body.appendChild(el);
    report.current = el;
    const onLost = () => void diag.lost++;
    gl.domElement.addEventListener("webglcontextlost", onLost);
    gl.debug.onShaderError = (c, program, vs, fs) => {
      const log = [c.getProgramInfoLog(program), c.getShaderInfoLog(vs), c.getShaderInfoLog(fs)].filter(Boolean).join(" | ");
      if (diag.shaderErrors.length < 3) diag.shaderErrors.push(log.slice(0, 260));
    };
    const t = setInterval(() => (wantSample.current = true), 2000);
    return () => {
      clearInterval(t);
      gl.domElement.removeEventListener("webglcontextlost", onLost);
      gl.debug.onShaderError = null;
      el.remove();
    };
  }, [gl]);

  // the canvas puts its own pixel ratio back whenever the page around it renders again: hold the step that was taken
  useEffect(() => {
    const want = quality.current.dpr;
    if (want && Math.abs(dpr - want) > 0.01) setDpr(want);
  }, [dpr, setDpr]);

  // dev aid: __causeway.quality() is the step the picture has come down to (0 is everything on)
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __causeway?: Record<string, unknown> };
    const aid = (w.__causeway ??= {});
    aid.quality = () => ({ ...QUALITY[quality.current.step], step: quality.current.step });
    // DIAG (phone that draws NaN): draw the scene one material at a time and say which of them the bad numbers come from
    aid.sample = () => sample(gl, scene, camera, THREE.HalfFloatType);
    aid.bisect = () => {
      const mats = new Map<THREE.Material, string>();
      scene.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        if (!m) return;
        for (const x of Array.isArray(m) ? m : [m]) if (!mats.has(x)) mats.set(x, `${o.type}:${o.name || o.parent?.name || "?"}`);
      });
      const all = [...mats.keys()];
      const was = all.map((m) => m.visible);
      const out: string[] = [];
      all.forEach((m) => (m.visible = false));
      out.push(`nothing drawn (background, fog) → ${sample(gl, scene, camera, THREE.HalfFloatType)}`);
      all.forEach((m, i) => {
        m.visible = was[i];
        if (was[i]) {
          const r = sample(gl, scene, camera, THREE.HalfFloatType);
          const sm = m as THREE.MeshStandardMaterial;
          const drawn = !/black 100% NaN 0 /.test(r);
          if (drawn) out.push(`${/NaN 0 inf 0/.test(r) ? "ok " : "BAD"} ${m.type} normalMap=${!!sm.normalMap} map=${!!sm.map} flat=${!!sm.flatShading} side=${m.side} vc=${!!m.vertexColors} obc=${m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile} on ${mats.get(m)} → ${r.replace(/ inf.*/, "")}`);
        }
        m.visible = false;
      });
      all.forEach((m, i) => (m.visible = was[i]));
      out.push(`${all.length} materials tried; everything → ${sample(gl, scene, camera, THREE.HalfFloatType)}`);
      return out;
    };
    return () => {
      delete aid.quality;
      delete aid.bisect;
      delete aid.sample;
    };
  }, []);

  // priority 1: R3F stops rendering on its own and this runs after every update
  useFrame((_, dt) => {
    // (every frame, so a part of the scene that has just arrived is never drawn without it: see instancePad.ts)
    padInstances(scene);
    const c = compiling.current;
    if (c.seen !== compileAsked && !c.busy) {
      c.seen = compileAsked;
      c.busy = true;
      const done = () => {
        c.busy = false;
        quality.current.settle = 1.5; // (the frames around a compile say nothing about the GPU's pace)
      };
      const limit = setTimeout(done, COMPILE_LIMIT_MS);
      // a shader depends on where it draws to: compile for the HDR target the scene is rendered into, not for the canvas
      const target = gl.getRenderTarget();
      gl.setRenderTarget(composer.renderTarget1);
      gl.compileAsync(scene, camera)
        .catch(() => null)
        .then(() => {
          clearTimeout(limit);
          done();
        });
      gl.setRenderTarget(target);
    }
    if (c.busy) return; // the last picture stays up
    const q = quality.current;
    // (a frame of a quarter second is a hidden tab or a hitch while something loads, not the GPU's pace; and behind the
    // title the scene is drawn at a slow pace on purpose, see Game.tsx)
    if (dt < 0.25 && q.step < QUALITY.length - 1 && game.get().status !== "title") {
      if (q.settle > 0) q.settle -= dt;
      else {
        q.frames++;
        q.time += dt;
        if (q.time >= WINDOW_S) {
          if (q.frames / q.time < SLOW_FPS) {
            const next = QUALITY[++q.step];
            for (const t of [composer.renderTarget1, composer.renderTarget2]) {
              if (t.samples === next.samples) continue;
              t.samples = next.samples;
              t.dispose();
            }
            q.dpr = Math.min(Math.max(window.devicePixelRatio, 1), 1.75) * next.pixels;
            setDpr(q.dpr);
            q.settle = 1.5;
          }
          q.frames = 0;
          q.time = 0;
        }
      }
    }
    grade.uniforms.uTime.value = (grade.uniforms.uTime.value + dt) % 100;
    if (DIAG === "off") gl.render(scene, camera);
    else composer.render(dt);
    if (wantSample.current && report.current) {
      wantSample.current = false;
      report.current.textContent = [
        report.current.dataset.head,
        `target: ${diag.pick} · context lost ${diag.lost} · programs ${gl.info.programs?.length ?? 0} · draw calls ${gl.info.render.calls}`,
        `scene → half-float: ${sample(gl, scene, camera, THREE.HalfFloatType)}`,
        `scene → bytes: ${sample(gl, scene, camera, THREE.UnsignedByteType)}`,
        `shader errors ${diag.shaderErrors.length}${diag.shaderErrors.length ? ": " + diag.shaderErrors.join(" || ") : ""}`,
      ].join("\n");
    }
    if (!drawn.current) {
      drawn.current = true;
      onDrawn?.();
    }
  }, 1);

  return null;
}
