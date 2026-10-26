#!/usr/bin/env node
/**
 * Download a generated image and save it as a sized WebP for the blog.
 *   node scripts/fetch-blog-image.mjs <url> <out.webp> <width> <height>
 * Hero images are 1024x1024; inline article images are 1280x720.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const [, , url, out, w, h] = process.argv;
if (!url || !out || !w || !h) {
  console.error("usage: fetch-blog-image.mjs <url> <out.webp> <width> <height>");
  process.exit(1);
}
const res = await fetch(url);
if (!res.ok) {
  console.error("HTTP", res.status, url);
  process.exit(1);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
const buf = Buffer.from(await res.arrayBuffer());
await sharp(buf).resize(Number(w), Number(h), { fit: "cover" }).webp({ quality: 82 }).toFile(out);
console.log(out, Math.round(fs.statSync(out).size / 1024) + "KB");
