/**
 * Queue the Pinterest pins (public/pins/pins.csv, made by scripts/dev/make-pins.py) through Buffer.
 *
 *   node scripts/marketing/queue-pins.mjs --only pin-name-olivia          post one pin now
 *   node scripts/marketing/queue-pins.mjs --queue                          every pin not yet sent, into Buffer's queue
 *   node scripts/marketing/queue-pins.mjs --queue --dry-run                show what would be sent
 *
 * Each pin goes to the board named in its row (matched by name on the connected Pinterest account), with the
 * image from the live site, its alt text, title and tagged link. What has been sent is kept in
 * public/pins/sent.json, so a pin is never queued twice.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gql } from "./buffer.mjs";

const PINS = new URL("../../public/pins/pins.csv", import.meta.url);
const SENT = new URL("../../public/pins/sent.json", import.meta.url);

/** A CSV reader good enough for pins.csv (quoted fields, commas and quotes inside them). */
function readCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

async function pinterest() {
  const { account } = await gql("{ account { organizations { id } } }");
  for (const org of account.organizations) {
    const { channels } = await gql(
      `query($org: OrganizationId!) { channels(input: { organizationId: $org }) { id service isDisconnected metadata { ... on PinterestMetadata { boards { name serviceId } } } } }`,
      { org: org.id },
    );
    const ch = channels.find((c) => c.service === "pinterest" && !c.isDisconnected);
    if (ch) return { id: ch.id, boards: ch.metadata?.boards ?? [] };
  }
  throw new Error("No connected Pinterest channel in Buffer");
}

async function send(pin, channel, mode) {
  const board = channel.boards.find((b) => b.name.trim().toLowerCase() === pin.board.trim().toLowerCase());
  if (!board) throw new Error(`No Pinterest board called "${pin.board}" (boards: ${channel.boards.map((b) => b.name).join(", ") || "none"})`);
  const input = {
    channelId: channel.id,
    text: pin.description,
    schedulingType: "automatic",
    mode,
    needsApproval: false,
    assets: [{ image: { url: pin.media_url, metadata: { altText: pin.alt_text } } }],
    metadata: { pinterest: { boardServiceId: board.serviceId, title: pin.title, url: pin.link } },
  };
  const data = await gql(
    `mutation($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`,
    { input },
  );
  const r = data.createPost;
  if (!r.post) throw new Error(`Buffer refused "${pin.title}": ${r.message}`);
  return r.post;
}

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const dry = args.includes("--dry-run");
const pins = readCsv(readFileSync(PINS, "utf8"));
const sent = existsSync(SENT) ? JSON.parse(readFileSync(SENT, "utf8")) : {};
const todo = only ? pins.filter((p) => p.file.endsWith(`${only}.jpg`)) : pins.filter((p) => !sent[p.file]);
if (todo.length === 0) {
  console.log(only ? `No pin called ${only}` : "Every pin has already been sent");
  process.exit(0);
}
const channel = await pinterest();
for (const pin of todo) {
  if (dry) {
    console.log(`would send: ${pin.title} -> board "${pin.board}"`);
    continue;
  }
  const post = await send(pin, channel, only ? "shareNow" : "addToQueue");
  sent[pin.file] = { postId: post.id, dueAt: post.dueAt, at: new Date().toISOString() };
  writeFileSync(SENT, JSON.stringify(sent, null, 1));
  console.log(`sent: ${pin.title} (${post.dueAt ? `due ${post.dueAt}` : "now"})`);
}
