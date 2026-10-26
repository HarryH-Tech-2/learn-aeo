/**
 * A small client for Buffer's GraphQL API (https://developers.buffer.com), used to queue the Pinterest pins.
 * The key lives in .env.local as BUFFER_API_KEY and is never printed.
 *
 *   node scripts/marketing/buffer.mjs query '<graphql>'     run any query (prints the JSON)
 */
import { readFileSync } from "node:fs";

function key() {
  if (process.env.BUFFER_API_KEY) return process.env.BUFFER_API_KEY;
  const line = readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("BUFFER_API_KEY="));
  const k = line?.slice("BUFFER_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
  if (!k) throw new Error("BUFFER_API_KEY is not set in .env.local");
  return k;
}

export async function gql(query, variables = {}) {
  const res = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key()}` },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Buffer answered ${res.status}: ${text.slice(0, 300)}`);
  }
  if (json.errors?.length) throw new Error(`Buffer error: ${JSON.stringify(json.errors).slice(0, 800)}`);
  return json.data;
}

if (process.argv[2] === "query") {
  gql(process.argv[3]).then((d) => console.log(JSON.stringify(d, null, 1))).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
