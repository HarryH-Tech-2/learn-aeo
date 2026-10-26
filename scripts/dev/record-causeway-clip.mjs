// The guest-play card's gameplay clip (public/causeway-loop.v4.mp4), rendered offline.
//
// Level 1's opening, frame by frame, on a virtual clock: performance.now and requestAnimationFrame
// are replaced in the page, each captured frame advances the game exactly 1/30 s (two 60 Hz steps),
// and a small driver steers __causeway.input through waypoints and jump cues. Nothing depends on
// the machine's frame rate, so the clip never stutters, and the HUD is hidden with CSS so only the
// scene is filmed. Dev server only (the dev aid `window.__causeway` is not in production builds).
//
//   1. npm run dev
//   2. a separate Chrome with remote debugging, on the guest-play URL:
//      chrome --remote-debugging-port=9333 --user-data-dir=<temp profile> --window-size=1320,900 //        --disable-backgrounding-occluded-windows --disable-renderer-backgrounding //        "http://localhost:3000/lessons/expedition-begins?play=1&name=Cleo"
//      (an occluded window stops producing frames and Page.captureScreenshot hangs; the flags stop that.
//       Do NOT taskkill chrome.exe afterwards: that closes every Chrome. Browser.close over CDP instead.)
//   3. node scripts/dev/record-causeway-clip.mjs 9333 frames 11.5 30
//   4. ffmpeg -framerate 30 -i frames/f%04d.jpg -t 10.5 -vf scale=720:450:flags=lanczos -c:v libx264 //        -profile:v high -crf 32 -preset slower -tune film -pix_fmt yuv420p -movflags +faststart -an causeway-loop.v5.mp4
//      ffmpeg -i frames/f0000.jpg -vf scale=720:450 -frames:v 1 -c:v libwebp -quality 82 causeway-loop-poster.v5.webp
//   5. New file names every time (the files carry a one-week cache header, next.config.ts), then point
//      GuestPlayBanner.tsx and next.config.ts at them.
//
// The route: plaza → three pillars → first landing → the beam of light (the sign is met) → the right tablet.
// Waypoint coordinates come from game/course.ts (PILLARS, STATION_SITES, BEACON_OFFSET); the station's site is read live.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [port = "9333", outDir = "frames", secondsArg = "10", fpsArg = "30"] = process.argv.slice(2);
const SECONDS = Number(secondsArg);
const FPS = Number(fpsArg);
const SUBSTEPS = 2; // physics/anim at 60 Hz, capture every second step
const W = 1280;
const H = 800; // 16:10, the card's aspect

const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find((t) => t.type === "page" && /localhost:3000/.test(t.url));
if (!page) throw new Error("no localhost:3000 page target; tabs: " + targets.map((t) => t.url).join(", "));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(m.error.message)) : resolve(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error("page: " + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text));
  return r.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, what) => Promise.race([p, sleep(ms).then(() => { throw new Error(what + " timed out"); })]);
async function capture() {
  try {
    return await withTimeout(send("Page.captureScreenshot", { format: "jpeg", quality: 95 }), 8000, "captureScreenshot");
  } catch (e) {
    console.log("\n" + e.message + ", bringing the tab to the front and retrying");
    await send("Page.bringToFront");
    return withTimeout(send("Page.captureScreenshot", { format: "jpeg", quality: 95 }), 15000, "captureScreenshot retry");
  }
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send("Page.bringToFront");

// 0. a fresh page for every take
await send("Page.reload", { ignoreCache: false });
await sleep(4000);

// 1. wait for the game and its first drawn frame
for (let i = 0; i < 120; i++) {
  const st = await evaluate(`(() => { const a = window.__causeway; if (!a) return "no-aid"; const c = document.querySelector("canvas"); return a.state().status + "/" + (c ? getComputedStyle(c).opacity : "no-canvas"); })()`);
  process.stdout.write(`\rready? ${st}      `);
  if (/\/1$/.test(st)) break;
  await sleep(1000);
}
console.log();

// 2. hide everything but the scene, and install the virtual clock + the driver
await evaluate(`(() => {
  const css = document.createElement("style");
  css.textContent = "nextjs-portal{display:none!important} .hero-media > *:not(:has(canvas)){display:none!important} body{cursor:none}";
  document.head.appendChild(css);
  const vt = { t: performance.now(), cbs: [] };
  window.__vt = vt;
  performance.now = () => vt.t;
  window.requestAnimationFrame = (cb) => { vt.cbs.push(cb); return vt.cbs.length; };
  window.cancelAnimationFrame = () => {};
  vt.step = (ms) => { vt.t += ms; const cbs = vt.cbs; vt.cbs = []; for (const cb of cbs) { try { cb(vt.t); } catch (e) { console.error(e); } } };
  return "ok";
})()`);

// begin level 1 and start playing
for (let i = 0; i < 40; i++) {
  const st = await evaluate(`(() => { const a = window.__causeway; const s = a.state().status; if (s === "title") a.begin(0); else if (s === "brief") a.play(); window.__vt.step(1000/60); return a.state().status; })()`);
  if (st === "playing") break;
  await sleep(200);
}
console.log("status:", await evaluate(`window.__causeway.state().status`));

// the driver: steering through waypoints, jump cues, on the virtual clock
await evaluate(`(() => {
  const a = window.__causeway;
  const st = a.state();
  const station = st.lesson.stations[0];
  const SITES = [
    { at: [0, 1.35, -4.8], spread: 2.8 }, { at: [0, 2.55, -26], spread: 2.6 }, { at: [-4, 7.35, -64.6], spread: 2.3 },
    { at: [0, 10.85, -87.6], spread: 2.1 }, { at: [0, 12.55, -117.8], spread: 2.9 }, { at: [0, 12.55, -120.9], spread: 2.9 }, { at: [0, 12.55, -124.0], spread: 2.4 },
  ];
  const site = SITES[station.site];
  const n = station.options.length;
  const idx = station.options.indexOf(station.target);
  const tabletX = site.at[0] + (idx - (n - 1) / 2) * site.spread;
  const beaconZ = site.at[2] + 2.3;
  const plan = [
    { kind: "goto", x: 0, z: -7.2, jumpAt: -5.4 },                // plaza edge → pillar 1 (0, -9.2)
    { kind: "goto", x: 0, z: -9.2, hold: 0 },
    { kind: "goto", x: 2.6, z: -13.8, jumpAt: -10.2 },            // → pillar 2 (2.6, -13.8)
    { kind: "goto", x: -1, z: -18.4, jumpAt: -14.9 },             // → pillar 3 (-1, -18.4)
    { kind: "goto", x: -0.3, z: -22.6, jumpAt: -19.4 },           // → landing (0, -24.5)
    { kind: "goto", x: site.at[0], z: beaconZ, hold: 2.2 },       // into the beam of light: the sign is met
    { kind: "goto", x: tabletX, z: site.at[2] + 0.45, hold: 4 },  // the right tablet (1 m touch radius)
  ];
  const d = { i: 0, holdUntil: 0, jumped: false, jumpStart: 0, log: [] };
  window.__drive = d;
  d.tick = () => {
    const now = performance.now();
    const [px, py, pz] = a.pos();
    const step = plan[d.i];
    if (!step) { a.input.x = 0; a.input.y = 0; a.input.jumpHeld = false; return; }
    const dx = step.x - px, dz = step.z - pz;
    const dist = Math.hypot(dx, dz);
    // steer (camera yaw ~0: x right, -z ahead)
    let ix = dx, iy = -dz;
    const m = Math.hypot(ix, iy) || 1;
    const gain = dist < 1.2 ? dist / 1.2 : 1;
    a.input.x = (ix / m) * gain;
    a.input.y = (iy / m) * gain;
    // jump cue: press at the z line, hold for height, re-press until the game takes it
    if (step.jumpAt !== undefined && !d.jumped && pz <= step.jumpAt) {
      d.jumped = true; d.jumpStart = now;
      a.input.jumpHeld = true; a.input.jumpPressedAt = now;
      d.log.push([+(now/1000).toFixed(2), "jump", +px.toFixed(2), +pz.toFixed(2)]);
    }
    if (d.jumped) {
      if (a.input.jumpPressedAt !== -1 && now - d.jumpStart < 400) a.input.jumpPressedAt = now;
      if (now - d.jumpStart > 520) a.input.jumpHeld = false;
    }
    // arrival
    if (dist < 0.35 || (step.jumpAt !== undefined && pz < step.z + 0.3)) {
      if (!d.holdUntil) d.holdUntil = now + (step.hold ?? 0) * 1000;
      a.input.x = 0; a.input.y = 0;
      if (now >= d.holdUntil) { d.i++; d.holdUntil = 0; d.jumped = false; d.log.push([+(now/1000).toFixed(2), "next", d.i, +px.toFixed(2), +py.toFixed(2), +pz.toFixed(2)]); }
    }
  };
  return { site: station.site, n, idx, tabletX, beaconZ, target: station.target, options: station.options.join("") };
})()`).then((info) => console.log("plan:", JSON.stringify(info)));

// 3. settle: step virtual time until a screenshot is a real picture (the canvas fades in on a real-time CSS transition)
for (let i = 0; i < 60; i++) {
  await evaluate(`(() => { for (let s = 0; s < 6; s++) window.__vt.step(1000/60); return 1; })()`);
  await sleep(150);
  const shot = await capture();
  const bytes = Buffer.from(shot.data, "base64").length;
  process.stdout.write(`
settling ${i}: ${bytes} B   `);
  if (bytes > 120000) break;
}
console.log();
// the canvas fades in over the title still on a real-time CSS transition: let it finish
await sleep(3000);
await evaluate(`(() => { for (let s = 0; s < 30; s++) window.__vt.step(1000/60); return 1; })()`);

// 4. step + capture
mkdirSync(outDir, { recursive: true });
const total = Math.round(SECONDS * FPS);
const t0 = Date.now();
for (let f = 0; f < total; f++) {
  await evaluate(`(() => { for (let s = 0; s < ${SUBSTEPS}; s++) { window.__drive.tick(); window.__vt.step(1000/60); } return 1; })()`);
  const shot = await capture();
  writeFileSync(join(outDir, `f${String(f).padStart(4, "0")}.jpg`), Buffer.from(shot.data, "base64"));
  if (f % 30 === 0) {
    const p = await evaluate(`(() => { const [x,y,z] = window.__causeway.pos(); return [x.toFixed(2), y.toFixed(2), z.toFixed(2), window.__drive.i, window.__causeway.state().lesson.progress, window.__causeway.state().falls].join(" "); })()`);
    process.stdout.write(`\rframe ${f}/${total}  pos/step/progress/falls: ${p}   ${((Date.now() - t0) / 1000).toFixed(0)}s   `);
  }
}
console.log();
console.log("log:", await evaluate(`JSON.stringify(window.__drive.log)`));
console.log("falls:", await evaluate(`window.__causeway.state().falls`), "progress:", await evaluate(`window.__causeway.state().lesson.progress`), "taught:", await evaluate(`window.__causeway.state().lesson.taught.join("")`));
ws.close();
