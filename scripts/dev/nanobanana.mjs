/**
 * Generate an image with nanobananaapi.ai (Nano Banana Pro) and save it.
 *
 *   node scripts/dev/nanobanana.mjs <out.png> "<prompt>" [aspectRatio=16:9] [resolution=2K]
 *
 * Reads NANOBANANA_API_KEY from .env.local (never commit it). The API is asynchronous: submit, then poll
 * /record-info until successFlag is 1. callBackUrl is required by the API but unused here (we poll).
 */
import { readFileSync, writeFileSync } from "node:fs";

const [out, prompt, aspectRatio = "16:9", resolution = "2K"] = process.argv.slice(2);
if (!out || !prompt) {
  console.error('usage: node scripts/dev/nanobanana.mjs <out.png> "<prompt>" [aspectRatio] [resolution]');
  process.exit(1);
}
const key = (process.env.NANOBANANA_API_KEY ?? readFileSync(".env.local", "utf8").match(/^NANOBANANA_API_KEY="?([^"\n]+)/m)?.[1])?.trim();
if (!key) throw new Error("NANOBANANA_API_KEY missing (.env.local)");

const API = "https://api.nanobananaapi.ai/api/v1";
const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const submit = await fetch(`${API}/nanobanana/generate-pro`, {
  method: "POST",
  headers,
  body: JSON.stringify({ prompt, aspectRatio, resolution, callBackUrl: "https://www.learnhieroglyphics.com/api/noop" }),
}).then((r) => r.json());
const taskId = submit?.data?.taskId;
if (!taskId) throw new Error(`submit failed: ${JSON.stringify(submit)}`);
console.log("task", taskId);

for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const info = await fetch(`${API}/nanobanana/record-info?taskId=${taskId}`, { headers }).then((r) => r.json());
  const d = info?.data;
  if (d?.successFlag === 1) {
    const url = d.response?.resultImageUrl ?? d.response?.originImageUrl;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    writeFileSync(out, buf);
    console.log(`saved ${out} (${Math.round(buf.length / 1024)} KB)`);
    process.exit(0);
  }
  if (d?.successFlag > 1) throw new Error(`generation failed: ${JSON.stringify(d)}`);
}
throw new Error("timed out waiting for the image");
