// The City of Answers: the homepage hero's Three.js scene. A question types into a search bar,
// the bar swings open like double doors, the camera flies into a city of towers, and settles
// into a slow orbit of the golden "cited source" that citation streams flow into.
// Loaded by CityHero with a dynamic import so `three` stays out of the page's first-load JS.

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export type CityScene = {
  /** Start the intro again from the search bar. */
  replay(): void;
  /** Pause (off-screen, hidden tab) or resume the render loop. */
  setActive(active: boolean): void;
  /** Stop for good and free every GPU resource. */
  dispose(): void;
};

export type CitySceneOptions = {
  mode: "animate" | "still";
  /** Called once the intro has played (at once in "still" mode). */
  onReveal: () => void;
  /** A full-cover element the scene flashes white-gold as the camera enters the doorway. */
  flash?: HTMLElement | null;
};

// ---------- timeline ----------
// 0.5–2.5s  question types into the search bar
// 2.7s      light cracks through the seam
// 2.9–4.4s  bar swings open like double doors
// 4.4–10s   camera flies through into the city of answers
// 10s+      slow orbit around the cited source (loop)
const QUESTION = "How do I get cited by ChatGPT?";
const OPEN_START = 2.9, OPEN_END = 4.4, INTRO_END = 10.0, REVEAL_AT = 8.6;
/** The still frame: a moment into the orbit. */
const STILL_AT = INTRO_END + 2;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const phase = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function startCityScene(canvas: HTMLCanvasElement, opts: CitySceneOptions): CityScene {
  const COL = {
    bg: new THREE.Color(0x04060d),
    cyan: new THREE.Color(0x6fe3ff),
    gold: new THREE.Color(0xffc76b),
  };
  const host = canvas.parentElement ?? canvas;
  const isSmall = Math.min(window.innerWidth, window.innerHeight) < 700;
  // The site's body font (next/font gives it a generated family name), for the search bar text.
  const uiFont = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

  // ---------- renderer ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = COL.bg;
  scene.fog = new THREE.FogExp2(COL.bg, 0.016);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.7, 0.55, 0.32);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- shared textures ----------
  function radialTexture(inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)") {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.25, "rgba(255,255,255,.35)");
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const dotTex = radialTexture();

  // ---------- dust ----------
  const dust = (() => {
    const n = isSmall ? 900 : 1600;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = rand(-70, 70);
      pos[i * 3 + 1] = rand(-6, 40);
      pos[i * 3 + 2] = rand(-180, 20);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.12, map: dotTex, color: 0x9fdfff, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    scene.add(points);
    return points;
  })();

  // ---------- search bar (the door) ----------
  const barCanvas = document.createElement("canvas");
  barCanvas.width = 2048;
  barCanvas.height = 256;
  let fontsReady = false;
  let lastBarKey = "";

  function drawBar(text: string, caret: boolean) {
    const g = barCanvas.getContext("2d")!, W = barCanvas.width, H = barCanvas.height;
    g.clearRect(0, 0, W, H);
    roundRect(g, 14, 14, W - 28, H - 28, 114);
    g.fillStyle = "rgba(14,24,46,0.92)";
    g.fill();
    const border = g.createLinearGradient(0, 0, W, 0);
    border.addColorStop(0, "#6fe3ff");
    border.addColorStop(0.55, "#b9ecff");
    border.addColorStop(1, "#ffc76b");
    g.save();
    g.shadowColor = "#6fe3ff";
    g.shadowBlur = 24;
    g.lineWidth = 6;
    g.strokeStyle = border;
    g.stroke();
    g.restore();
    // magnifier
    g.strokeStyle = "#9fe9ff";
    g.lineWidth = 9;
    g.beginPath();
    g.arc(150, 118, 34, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(175, 143);
    g.lineTo(205, 173);
    g.stroke();
    // question
    g.font = `500 86px ${fontsReady ? uiFont : "system-ui, sans-serif"}`;
    g.fillStyle = "#eaf3ff";
    g.textBaseline = "middle";
    g.fillText(text, 260, H / 2 + 4);
    if (caret) {
      const w = g.measureText(text).width;
      g.fillStyle = "#6fe3ff";
      g.fillRect(268 + w, H / 2 - 44, 7, 90);
    }
    // send button
    g.fillStyle = "rgba(255,199,107,0.95)";
    g.beginPath();
    g.arc(W - 128, H / 2, 62, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#1a1205";
    g.lineWidth = 10;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(W - 128, H / 2 + 30);
    g.lineTo(W - 128, H / 2 - 28);
    g.stroke();
    g.beginPath();
    g.moveTo(W - 154, H / 2 - 4);
    g.lineTo(W - 128, H / 2 - 30);
    g.lineTo(W - 102, H / 2 - 4);
    g.stroke();
  }

  const texL = new THREE.CanvasTexture(barCanvas), texR = new THREE.CanvasTexture(barCanvas);
  for (const t of [texL, texR]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(0.5, 1);
    t.anisotropy = 4;
  }
  texR.offset.set(0.5, 0);

  const bar = new THREE.Group();
  scene.add(bar);
  const doorMats: THREE.MeshBasicMaterial[] = [];
  function makeDoor(tex: THREE.Texture, side: number) {
    const pivot = new THREE.Group();
    pivot.position.x = side * -4; // hinge on the outer edge
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, toneMapped: false, fog: false });
    doorMats.push(mat);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), mat);
    mesh.position.x = side * 2;
    pivot.add(mesh);
    bar.add(pivot);
    return pivot;
  }
  const doorL = makeDoor(texL, 1), doorR = makeDoor(texR, -1);

  const seamMat = new THREE.ShaderMaterial({
    uniforms: { uI: { value: 0 }, uC: { value: new THREE.Color(1.0, 0.86, 0.6) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec2 vUv; uniform float uI; uniform vec3 uC;
      void main(){ float dx = abs(vUv.x-.5)*2.; float dy = abs(vUv.y-.5)*2.;
        float a = pow(1.-dx, 3.) * pow(1.-dy, 1.5) * uI;
        gl_FragColor = vec4(uC * a * 3., a); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  const seam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), seamMat);
  seam.position.z = -0.05;
  bar.add(seam);

  const barHaloMat = new THREE.SpriteMaterial({
    map: dotTex, color: COL.cyan, transparent: true, opacity: 0.18,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  });
  const barHalo = new THREE.Sprite(barHaloMat);
  barHalo.scale.set(16, 5, 1);
  barHalo.position.z = -0.1;
  bar.add(barHalo);

  // dark wall with a doorway the size of the bar: hides the city until the doors open
  const wallMat = (() => {
    const wall = new THREE.Shape();
    wall.moveTo(-200, -200);
    wall.lineTo(200, -200);
    wall.lineTo(200, 200);
    wall.lineTo(-200, 200);
    wall.lineTo(-200, -200);
    const hole = new THREE.Path();
    hole.moveTo(-3.95, -0.47);
    hole.lineTo(3.95, -0.47);
    hole.lineTo(3.95, 0.47);
    hole.lineTo(-3.95, 0.47);
    hole.lineTo(-3.95, -0.47);
    wall.holes.push(hole);
    const mat = new THREE.MeshBasicMaterial({ color: COL.bg, fog: false, transparent: true });
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(wall), mat);
    mesh.position.z = -0.25;
    bar.add(mesh);
    return mat;
  })();

  // ---------- city of answers ----------
  const GROUND_Y = -6;
  const SOURCE = new THREE.Vector3(0, GROUND_Y, -90);
  const SOURCE_TOP = new THREE.Vector3(0, 13, -90);

  // ground grid
  {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uFog: { value: COL.bg }, uSrc: { value: SOURCE } },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `varying vec3 vW; uniform vec3 uFog; uniform vec3 uSrc;
        float grid(vec2 p){ vec2 g = abs(fract(p - .5) - .5) / fwidth(p); return 1. - min(min(g.x, g.y), 1.); }
        void main(){
          float l = grid(vW.xz / 6.);
          float d = length(vW.xz - uSrc.xz);
          vec3 col = vec3(.25,.75,1.) * l * .35 + vec3(1.,.7,.35) * exp(-d * .14) * .3;
          float dist = length(vW - cameraPosition);
          float fog = 1. - exp(-pow(.016 * dist, 2.));
          gl_FragColor = vec4(mix(col + uFog, uFog, fog), 1.);
        }`,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, GROUND_Y, -80);
    scene.add(ground);
  }

  // towers: footprints with setback tiers and the odd antenna
  type Box = { x: number; z: number; w: number; h: number; d: number; y: number; style: number; seed: number };
  const towers: { x: number; z: number; top: number }[] = []; // one per building, anchors the citation streams
  const boxes: Box[] = []; // every box drawn (base, tiers, antenna masts)
  const beacons: number[] = []; // antenna tip lights
  // facade styles: 0 window grid, 1 floor bands, 2 vertical light strips, 3 antenna mast
  for (let x = -66; x <= 66; x += 6) {
    for (let z = -16; z >= -176; z -= 6) {
      if (Math.abs(x) < 7) continue; // keep the flight avenue clear
      if (Math.hypot(x - SOURCE.x, z - SOURCE.z) < 13) continue; // plaza around the source
      if (Math.random() < 0.4) continue;
      const bx = x + rand(-1, 1), bz = z + rand(-1, 1);
      const w = rand(2.4, 4.4), d = rand(2.4, 4.4);
      let h = 3 + Math.pow(Math.random(), 1.6) * 22 + Math.min(Math.abs(x), 30) * 0.12;
      if (Math.hypot(bx - SOURCE.x, bz - SOURCE.z) < 34) h = Math.min(h, 8); // low district keeps the orbit clear
      const r = Math.random(), style = r < 0.5 ? 0 : r < 0.78 ? 1 : 2;
      const seed = Math.random();
      let top = GROUND_Y + h;
      boxes.push({ x: bx, z: bz, w, h, d, y: GROUND_Y + h / 2, style, seed });
      if (h > 9 && Math.random() < 0.6) {
        const w2 = w * rand(0.55, 0.78), d2 = d * rand(0.55, 0.78), h2 = h * rand(0.18, 0.38);
        boxes.push({ x: bx, z: bz, w: w2, h: h2, d: d2, y: top + h2 / 2, style, seed: seed + 0.37 });
        top += h2;
        if (Math.random() < 0.4) {
          const w3 = w2 * 0.6, d3 = d2 * 0.6, h3 = h2 * 0.55;
          boxes.push({ x: bx, z: bz, w: w3, h: h3, d: d3, y: top + h3 / 2, style, seed: seed + 0.71 });
          top += h3;
        }
      }
      if (h > 13 && Math.random() < 0.4) {
        const ah = rand(2, 4.5);
        boxes.push({ x: bx, z: bz, w: 0.14, h: ah, d: 0.14, y: top + ah / 2, style: 3, seed });
        beacons.push(bx, top + ah + 0.1, bz);
      }
      towers.push({ x: bx, z: bz, top });
    }
  }

  const towerMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uFog: { value: COL.bg }, uSrc: { value: SOURCE }, uGround: { value: GROUND_Y } },
    vertexShader: `attribute float aSeed; attribute float aStyle; attribute vec3 aSize;
      varying vec3 vW; varying vec3 vN; varying vec3 vL; varying vec3 vSize; varying float vSeed; varying float vStyle;
      void main(){ mat4 m = modelMatrix * instanceMatrix; vec4 w = m * vec4(position,1.);
        vW = w.xyz; vL = position; vN = normalize(mat3(m) * normal);
        vSize = aSize; vSeed = aSeed; vStyle = aStyle;
        gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `varying vec3 vW; varying vec3 vN; varying vec3 vL; varying vec3 vSize; varying float vSeed; varying float vStyle;
      uniform float uTime; uniform vec3 uFog; uniform vec3 uSrc; uniform float uGround;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec3 trim = vec3(.3,.8,1.);
        float side = 1. - abs(vN.y);
        float roof = step(.5, vN.y);
        bool xFace = abs(vN.x) > .5;
        float faceId = xFace ? (vN.x > 0. ? 1. : 2.) : (vN.z > 0. ? 3. : 4.);
        float faceW = xFace ? vSize.z : vSize.x;
        float across = (xFace ? vL.z : vL.x) * faceW;            // meters from the face center
        float edge = faceW * .5 - abs(across);                    // meters to the vertical corner
        float fromTop = (.5 - vL.y) * vSize.y;                    // meters below the roofline
        float hNorm = clamp((vW.y - uGround) / 34., 0., 1.);

        // dark glass that lifts slightly with height, plus faint vertical mullions
        vec3 col = mix(vec3(.01,.016,.032), vec3(.028,.05,.09), hNorm);
        col += trim * smoothstep(.44, .5, abs(fract(across * 1.25) - .5)) * side * .05;

        // lights
        vec2 g = vec2(across * 1.25, vW.y * 1.6);
        vec2 cell = floor(g), f = fract(g);
        float rnd = hash(cell + vSeed * 41. + faceId * 7.);
        float win = 0.;
        if (vStyle < .5)        win = step(.2,f.x) * step(f.x,.8) * step(.28,f.y) * step(f.y,.72) * step(.74, rnd);
        else if (vStyle < 1.5)  win = step(.32,f.y) * step(f.y,.6) * step(.5, hash(vec2(cell.y, vSeed * 13. + faceId))) * (.55 + .45 * rnd);
        else if (vStyle < 2.5)  win = step(.42,f.x) * step(f.x,.58) * step(.4, hash(vec2(cell.x, floor(cell.y / 5.)) + vSeed * 9. + faceId));
        win *= side * step(.25, edge) * step(.35, fromTop);       // dark margin at corners and roof
        float flick = .8 + .2 * sin(uTime * .5 + rnd * 40.);
        vec3 wc = mix(vec3(.45,.85,1.), vec3(1.,.8,.5), step(.82, hash(cell * 1.3 + vSeed)));
        col += wc * win * flick * .9;

        // neon trim on the corners and roofline, brighter higher up
        float cornerGlow = (1. - smoothstep(0., .07, edge)) * side;
        float roofGlow = (1. - smoothstep(0., .1, fromTop)) * side;
        float rimTop = min(vSize.x * .5 - abs(vL.x * vSize.x), vSize.z * .5 - abs(vL.z * vSize.z));
        float roofRim = (1. - smoothstep(0., .1, rimTop)) * roof;
        col += trim * (cornerGlow * .3 + roofGlow * .8 + roofRim * .7) * (.35 + .65 * hNorm);

        // warm light from the cited source on faces turned toward it
        vec3 toSrc = uSrc + vec3(0., 12., 0.) - vW;
        float dS = length(toSrc);
        col += vec3(1.,.66,.3) * max(dot(vN, toSrc / dS), 0.) * exp(-dS * .06) * .3;

        if (vStyle > 2.5) col = vec3(.04,.06,.1) + trim * .12;   // antenna mast

        float dist = length(vW - cameraPosition);
        float fog = 1. - exp(-pow(.016 * dist, 2.));
        gl_FragColor = vec4(mix(col, uFog, fog), 1.);
      }`,
  });
  {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(boxes.map((b) => b.seed)), 1));
    geo.setAttribute("aStyle", new THREE.InstancedBufferAttribute(new Float32Array(boxes.map((b) => b.style)), 1));
    geo.setAttribute("aSize", new THREE.InstancedBufferAttribute(new Float32Array(boxes.flatMap((b) => [b.w, b.h, b.d])), 3));
    const mesh = new THREE.InstancedMesh(geo, towerMat, boxes.length);
    const m = new THREE.Matrix4();
    boxes.forEach((b, i) => {
      m.makeScale(b.w, b.h, b.d).setPosition(b.x, b.y, b.z);
      mesh.setMatrixAt(i, m);
    });
    scene.add(mesh);
  }

  const beaconMat = new THREE.PointsMaterial({
    size: 0.9, map: dotTex, color: new THREE.Color(1, 0.35, 0.28).multiplyScalar(1.6), transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  {
    const beaconGeo = new THREE.BufferGeometry();
    beaconGeo.setAttribute("position", new THREE.Float32BufferAttribute(beacons, 3));
    scene.add(new THREE.Points(beaconGeo, beaconMat));
  }

  // the cited source: a golden crystal on a plinth with a beam of light
  for (const [r, o] of [[5, 0.9], [8, 0.45], [12, 0.22]]) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r - 0.12, r, 96),
      new THREE.MeshBasicMaterial({ color: COL.gold, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(SOURCE.x, GROUND_Y + 0.05, SOURCE.z);
    scene.add(ring);
  }

  const sourceCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.6, 0),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.7, 0.3).multiplyScalar(0.9), toneMapped: false })
  );
  sourceCrystal.scale.set(1, 3.6, 1);
  sourceCrystal.position.set(SOURCE.x, 5.8, SOURCE.z);
  scene.add(sourceCrystal);

  const beamMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){ float a = pow(1. - vUv.y, 2.2) * (.55 + .1 * sin(uTime * 2. + vUv.y * 30.));
        gl_FragColor = vec4(vec3(1.,.78,.45) * a * .9, a); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
  });
  {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.2, 120, 24, 1, true), beamMaterial);
    beam.position.set(SOURCE.x, 10 + 60, SOURCE.z);
    scene.add(beam);

    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: dotTex, color: COL.gold, transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      })
    );
    halo.scale.set(16, 16, 1);
    halo.position.copy(SOURCE_TOP).setY(6);
    scene.add(halo);
  }

  // citation streams: light flowing from towers into the source
  const streams: { lut: THREE.Vector3[]; speed: number; offset: number }[] = [];
  {
    const candidates = towers
      .filter((t) => Math.hypot(t.x - SOURCE.x, t.z - SOURCE.z) < 75)
      .sort(() => Math.random() - 0.5)
      .slice(0, isSmall ? 30 : 46);
    const lineMat = new THREE.LineBasicMaterial({ color: COL.cyan, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false });
    for (const t of candidates) {
      const start = new THREE.Vector3(t.x, t.top + 0.3, t.z);
      const mid = start.clone().lerp(SOURCE_TOP, 0.5).add(new THREE.Vector3(rand(-4, 4), rand(8, 18), rand(-4, 4)));
      const curve = new THREE.CatmullRomCurve3([start, mid, SOURCE_TOP.clone().setY(9)]);
      const lut = curve.getSpacedPoints(127);
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(lut), lineMat));
      streams.push({ lut, speed: rand(0.06, 0.12), offset: Math.random() });
    }
  }
  const PER_STREAM = 16;
  const flowGeo = new THREE.BufferGeometry();
  const flowPos = new Float32Array(streams.length * PER_STREAM * 3);
  const flowCol = new Float32Array(streams.length * PER_STREAM * 3);
  flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPos, 3));
  flowGeo.setAttribute("color", new THREE.BufferAttribute(flowCol, 3));
  scene.add(
    new THREE.Points(
      flowGeo,
      new THREE.PointsMaterial({
        size: 0.55, map: dotTex, vertexColors: true, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
      })
    )
  );
  const tmpCol = new THREE.Color();
  function updateStreams(t: number) {
    let k = 0;
    for (const s of streams) {
      for (let j = 0; j < PER_STREAM; j++, k++) {
        const p = (t * s.speed + s.offset + j / PER_STREAM) % 1;
        const f = p * 127, i0 = Math.floor(f), i1 = Math.min(127, i0 + 1), a = f - i0;
        const A = s.lut[i0], B = s.lut[i1];
        flowPos[k * 3] = A.x + (B.x - A.x) * a;
        flowPos[k * 3 + 1] = A.y + (B.y - A.y) * a;
        flowPos[k * 3 + 2] = A.z + (B.z - A.z) * a;
        tmpCol.copy(COL.cyan).lerp(COL.gold, p).multiplyScalar(1.4);
        flowCol[k * 3] = tmpCol.r;
        flowCol[k * 3 + 1] = tmpCol.g;
        flowCol[k * 3 + 2] = tmpCol.b;
      }
    }
    flowGeo.attributes.position.needsUpdate = true;
    flowGeo.attributes.color.needsUpdate = true;
  }

  // floating answer pages
  const pages: { x: number; y: number; z: number; ry: number; spin: number; bob: number; s: number }[] = [];
  const pageMesh = (() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 340;
    const g = c.getContext("2d")!;
    roundRect(g, 6, 6, 244, 328, 18);
    g.fillStyle = "rgba(40,90,140,.25)";
    g.fill();
    g.lineWidth = 4;
    g.strokeStyle = "rgba(140,225,255,.9)";
    g.stroke();
    g.fillStyle = "rgba(255,199,107,.95)";
    g.fillRect(30, 36, 120, 16);
    g.fillStyle = "rgba(170,230,255,.8)";
    for (let i = 0; i < 9; i++) g.fillRect(30, 80 + i * 26, 196 - (i % 3) * 34, 9);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const n = isSmall ? 70 : 120;
    const mesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1.33),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      n
    );
    for (let i = 0; i < n; i++) {
      let x: number;
      do {
        x = rand(-50, 50);
      } while (Math.abs(x) < 3);
      pages.push({ x, y: rand(0, 18), z: rand(-20, -150), ry: rand(0, 6.28), spin: rand(-0.3, 0.3), bob: rand(0, 6.28), s: rand(0.7, 1.4) });
    }
    scene.add(mesh);
    return mesh;
  })();
  const pm = new THREE.Matrix4(), pq = new THREE.Quaternion(), pe = new THREE.Euler(), pv = new THREE.Vector3(), ps = new THREE.Vector3();
  function updatePages(t: number) {
    pages.forEach((p, i) => {
      pe.set(Math.sin(t * 0.3 + p.bob) * 0.15, p.ry + t * p.spin, 0);
      pq.setFromEuler(pe);
      pv.set(p.x, p.y + Math.sin(t * 0.5 + p.bob) * 0.6, p.z);
      ps.setScalar(p.s);
      pageMesh.setMatrixAt(i, pm.compose(pv, pq, ps));
    });
    pageMesh.instanceMatrix.needsUpdate = true;
  }

  // ---------- camera choreography ----------
  const LOOP_TARGET = new THREE.Vector3(0, 5, -90);
  const ORBIT_R = 26, ORBIT_H = 9, ORBIT_A0 = 0.28, ORBIT_SPEED = 0.03;
  const orbitPos = (a: number, out: THREE.Vector3) =>
    out.set(SOURCE.x + Math.sin(a) * ORBIT_R, ORBIT_H, SOURCE.z + Math.cos(a) * ORBIT_R);
  const flyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 6.5),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 1.8, -16),
    new THREE.Vector3(1.5, 5, -38),
    orbitPos(ORBIT_A0, new THREE.Vector3()),
  ]);
  const DOOR_LOOK = new THREE.Vector3(0, 0, -10);
  /** How far up the search bar is drawn during the intro, as a fraction of the view height. */
  const BAR_LIFT = 0.2;
  let viewW = 1, viewH = 1, lastLift = -1;
  const look = new THREE.Vector3();

  function updateCamera(t: number) {
    if (t < OPEN_END) {
      camera.position.set(0, 0, 9 - 2.5 * easeInOut(phase(t, 0, OPEN_END)));
      look.copy(DOOR_LOOK);
    } else if (t < INTRO_END) {
      camera.position.copy(flyCurve.getPointAt(easeInOut(phase(t, OPEN_END, INTRO_END))));
      look.copy(DOOR_LOOK).lerp(LOOP_TARGET, easeInOut(phase(t, OPEN_END + 0.4, INTRO_END)));
    } else {
      orbitPos(ORBIT_A0 + (t - INTRO_END) * ORBIT_SPEED, camera.position);
      look.copy(LOOP_TARGET);
    }
    // aim low so the source rises above the headline instead of sitting behind it
    const fly = easeInOut(phase(t, OPEN_END, INTRO_END));
    look.y -= (camera.aspect < 0.8 ? 11 : 8) * fly;
    camera.lookAt(look);
    // The site's copy sits over the lower half from the start, so the search bar is drawn
    // higher up (the view is shifted, not the camera aimed) and eases back to center for the orbit.
    const lift = Math.round(viewH * BAR_LIFT * (1 - fly));
    if (lift !== lastLift) {
      lastLift = lift;
      if (lift) camera.setViewOffset(viewW, viewH, 0, lift, viewW, viewH);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
  }

  function updateBar(t: number) {
    const n = Math.round(phase(t, 0.5, 2.5) * QUESTION.length);
    const caret = t < OPEN_START && (n < QUESTION.length || Math.floor(t * 2.4) % 2 === 0);
    const key = `${n}|${caret}|${fontsReady}`;
    if (key !== lastBarKey) {
      lastBarKey = key;
      drawBar(QUESTION.slice(0, n), caret);
      texL.needsUpdate = texR.needsUpdate = true;
    }
    const open = easeInOut(phase(t, OPEN_START, OPEN_END));
    doorL.rotation.y = open * 1.75;
    doorR.rotation.y = -open * 1.75;
    // light cracks through, swells as the doors part, then settles so the city shows through
    const crack = phase(t, 2.6, OPEN_START);
    seamMat.uniforms.uI.value = crack * 0.8 * (1 - open) + Math.sin(open * Math.PI) * 0.7;
    seam.scale.set(0.12 + crack * 0.1 + open * 9, 1.1 + open * 3, 1);
    barHaloMat.opacity = 0.18 * (1 - open);
    // the wall dissolves behind the flash so the world opens up around the camera
    const dissolve = phase(t, 4.9, 5.7);
    wallMat.opacity = 1 - dissolve;
    for (const m of doorMats) m.opacity = 1 - dissolve;
    bar.visible = camera.position.z > -1.5;
  }

  // ---------- per-frame ----------
  function draw(t: number) {
    updateCamera(t);
    updateBar(t);
    updateStreams(t);
    updatePages(t);
    towerMat.uniforms.uTime.value = t;
    beaconMat.opacity = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.4), 6);
    beamMaterial.uniforms.uTime.value = t;
    sourceCrystal.rotation.y = t * 0.4;
    dust.rotation.y = Math.sin(t * 0.02) * 0.05;

    // white-gold flash as the camera enters the doorway
    if (opts.flash) {
      const fd = (t - 5.3) / 0.4;
      opts.flash.style.opacity = (Math.exp(-fd * fd) * 0.6).toFixed(3);
    }
    composer.render();
  }

  // Scene time advances only while the loop runs, so a paused hero resumes where it stopped.
  let time = opts.mode === "still" ? STILL_AT : 0;
  let revealed = false;
  let rafId = 0;
  let lastNow: number | null = null;
  let active = true;
  let disposed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    opts.onReveal();
  }

  function frame(now: number) {
    rafId = 0;
    if (disposed || !active) return;
    if (lastNow !== null) time += Math.min((now - lastNow) / 1000, 0.25); // a long gap (background tab) doesn't skip the intro
    lastNow = now;
    draw(time);
    if (time >= REVEAL_AT) reveal();
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (opts.mode !== "animate" || rafId || disposed) return;
    lastNow = null;
    rafId = requestAnimationFrame(frame);
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 64 : 50;
    viewW = w;
    viewH = h;
    lastLift = -1; // re-apply the view offset at the new size
    camera.updateProjectionMatrix();
    // keep the search bar inside the viewport on narrow screens, measured where the camera is
    // when the question finishes typing (it eases from z 9 toward 6.5 as the doors open)
    const typedZ = 9 - 2.5 * easeInOut(phase(2.5, 0, OPEN_END));
    const visW = 2 * typedZ * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    bar.scale.setScalar(Math.min(1, (visW * 0.88) / 8));
    if (opts.mode === "still" || !active) draw(time); // the loop isn't running to redraw it
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  document.fonts.ready.then(() => {
    if (disposed) return;
    fontsReady = true;
    lastBarKey = "";
    if (opts.mode === "still") draw(time);
  });

  if (opts.mode === "still") {
    draw(time);
    reveal();
  } else {
    startLoop();
  }

  return {
    replay() {
      if (opts.mode !== "animate" || disposed) return;
      time = 0;
      startLoop();
    },
    setActive(next) {
      active = next;
      if (next) startLoop();
      else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    dispose() {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      resizeObserver.disconnect();
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const m of mats) {
          (m as THREE.MeshBasicMaterial).map?.dispose();
          m.dispose();
        }
      });
      for (const t of [dotTex, texL, texR]) t.dispose();
      bloom.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
