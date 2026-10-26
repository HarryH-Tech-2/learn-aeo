/**
 * Khety, the mummy who keeps the learner company. (The name is a real one:
 * a Khety wrote the "Satire of the Trades", the schoolroom text that tells
 * boys to become scribes.) Pure text, no React: what he says, and when.
 *
 * He never teaches: the facts stay in the messages and the cards. He cheers,
 * commiserates, and says something when a level starts and ends.
 */
import { LAYOUTS, signInfo, thePicture, type Layout, type LevelPlan } from "./lesson";

/**
 * One of these, but never the same one twice running: each list is dealt like a hand of cards, and only
 * when every line has been said is it dealt again (without opening on the line that closed the last hand).
 * With four ways to announce a new sign and a sign every minute, plain chance repeated itself all the time.
 */
const hands = new WeakMap<object, { left: unknown[]; last?: unknown }>();
function pick<T>(items: T[], rand: () => number): T {
  if (items.length < 2) return items[0];
  let hand = hands.get(items);
  if (!hand) hands.set(items, (hand = { left: [] }));
  if (hand.left.length === 0) hand.left = items.filter((i) => i !== hand!.last);
  const at = Math.floor(rand() * hand.left.length) % hand.left.length;
  const chosen = hand.left.splice(at, 1)[0] as T;
  hand.last = chosen;
  return chosen;
}

const RIGHT = ["Yes!", "Nailed it!", "That’s the one!", "Spot on!", "Scribe material!", "Thoth would be proud!", "Carved in stone!", "Beautiful!"];
const WRONG = [
  "Oops! Even royal scribes smudged their papyrus.",
  "Not that one. Have another look!",
  "So close! Try again, I believe in you.",
  "Hmm, no. My bandages are in a twist too.",
  "Nope! Good thing stone is patient.",
];
const TEACH = ["Ooh, a new sign!", "New sign alert!", "Fresh from the chisel!", "Here’s one you haven’t met!"];
const REVIEW_RIGHT = ["Still got it!", "An old friend, remembered!", "Four thousand years and you still know it!"];
const REVIEW_WRONG = ["That one slipped away. It’ll be back!", "Forgotten? Happens to the best mummies."];

const START: Record<Layout, string> = {
  causeway: "Off we go! Mind the gaps: I can’t swim.",
  felucca: "All aboard! I’ll try not to unravel in the wind.",
  workshop: "Shh, the scribe is working. Push gently!",
  tomb: "Ah, home sweet home! Stay close to the lamp.",
  market: "Market day! Don’t drop the goods.",
  brush: "Brush gently. I know how fragile old things are!",
  passage: "Run! I’ve been buried once, and once was plenty!",
  wall: "Last one! Don’t look down. I never do.",
};

/** Poked: once is a greeting, again and again is tickling. */
const POKED = ["Hello! Need a hand? I’ve two, somewhere in here.", "That tickles!", "Careful! Pull the wrong end and I unravel.", "Hee hee! Stop it, I’m four thousand years old!", "Right, that’s it. I’m telling Anubis."];

const HINT_LEAD = ["Here’s a hint!", "Psst, a little help.", "Let me whisper."];

/** True things worth a moment between signs. */
export const FACTS = [
  "The Egyptians called hieroglyphs ‘medu netjer’: the god’s words.",
  "The last hieroglyphic inscription we know of was carved at Philae in the year 394.",
  "For everyday notes, scribes used hieratic: hieroglyphs in joined-up handwriting.",
  "There were over seven hundred signs in common use. You’re learning the twenty-five that do the most work.",
  "The Rosetta Stone says the same thing three times: in hieroglyphs, in demotic and in Greek.",
  "Champollion cracked the code in 1822, and he started with the royal names in cartouches.",
  "A cartouche is a loop of rope, tied round the king’s name to protect it.",
  "No vowels were written, so nobody knows exactly how Egyptian sounded. Not even me, and I was there.",
  "Thoth, the god with the head of an ibis, was said to have invented writing.",
  "Scribes wrote headings in red ink and everything else in black.",
  "A mummy like me was wrapped in hundreds of metres of linen. It took days.",
  "Becoming a scribe took years of school, copying the same texts over and over. You’re getting off lightly!",
];

export const pokeLine = (times: number) => POKED[Math.min(POKED.length - 1, Math.max(0, times - 1))];
export const hintLead = (rand: () => number = Math.random) => pick(HINT_LEAD, rand);
export const factLine = (rand: () => number = Math.random) => pick(FACTS, rand);

/**
 * A hint for whatever is being asked now. It names the PICTURE to look for, never the tablet to take,
 * so the learner still has to find it; when a sign is shown and a sound is wanted, it rules one sound out.
 */
export function hintFor(l: LevelPlan & { progress: number; taught: string[] }, rand: () => number = Math.random): string {
  const layout = l.spec.layout;
  const st = l.stations[l.progress];
  if (!st) return l.reviews.length > 0 && layout === "market" ? "Old orders now: read the label, then find the stall that hangs out the picture for that kind of thing." : "Everything is answered. Head for the way out!";
  if (st.teach && !l.taught.includes(st.target)) return `There’s a new sign to meet first. ${LAYOUTS[layout].newSigns}`;
  const phrase = l.phrases[st.phrase];
  if (st.kind === "det") return `“${phrase.meaning.split(",")[0]}”: which picture shows that kind of thing? Look for the ${phrase.det?.name}.`;
  const backwards = st.kind === "read" || layout === "brush";
  if (!backwards) return `You want the sound “${st.sound}”. Look for ${thePicture(st.target)}.`;
  const right = st.kind === "read" ? signInfo(st.target).sound : st.sound;
  const sounds = st.options.map((o) => (st.kind === "read" ? o : o === st.target ? st.sound : signInfo(o).sound)).filter((x) => x !== right);
  const not = sounds.length > 0 ? ` And it is not “${pick(sounds, rand)}”.` : "";
  return `That sign is ${thePicture(st.target)}.${not}`;
}

/** Every fixed line Khety can say, so that recordings can be made of them (voice.ts files them by `clipKey`). */
export const ALL_LINES: string[] = [
  ...RIGHT,
  "Three in a row! You’re on a roll. Of papyrus.",
  "Five in a row! Are you sure you’re not four thousand years old?",
  "Eight! Somebody fetch this scribe a gold collar!",
  ...WRONG,
  ...TEACH,
  ...REVIEW_RIGHT,
  ...REVIEW_WRONG,
  ...Object.values(START),
  ...POKED,
  ...HINT_LEAD,
  ...FACTS,
  "You can read the alphabet! Four and a half thousand years late to class, and still top of it.",
  "Flawless! Not a single smudge. I’m unravelling with joy!",
  "So nearly perfect! One little smudge. The wall will never tell.",
  "You did it! The rest will stick next time. They always do.",
];

export function startLine(layout: Layout): string {
  return START[layout];
}

/** Right answers: a short cheer, and a bigger one when they come in a row. */
export function rightLine(streak: number, rand: () => number = Math.random): string {
  // (these three are repeated in ALL_LINES: keep them the same)
  if (streak === 3) return "Three in a row! You’re on a roll. Of papyrus.";
  if (streak === 5) return "Five in a row! Are you sure you’re not four thousand years old?";
  if (streak === 8) return "Eight! Somebody fetch this scribe a gold collar!";
  return pick(RIGHT, rand);
}

export const wrongLine = (rand: () => number = Math.random) => pick(WRONG, rand);
export const teachLine = (rand: () => number = Math.random) => pick(TEACH, rand);
export const reviewLine = (ok: boolean, rand: () => number = Math.random) => pick(ok ? REVIEW_RIGHT : REVIEW_WRONG, rand);

/** What he says aloud at the finish: the same, without the name and the score, so that a recording can exist. */
export function finishSpoken(o: { clean: number; total: number; last: boolean }): string {
  if (o.last) return "You can read the alphabet! Four and a half thousand years late to class, and still top of it.";
  if (o.clean === o.total) return "Flawless! Not a single smudge. I’m unravelling with joy!";
  if (o.clean >= o.total - 1) return "So nearly perfect! One little smudge. The wall will never tell.";
  return "You did it! The rest will stick next time. They always do.";
}

/** What he says on the finish card. */
export function finishLine(o: { clean: number; total: number; last: boolean; name: string }): string {
  const you = o.name ? `, ${o.name}` : "";
  if (o.last) return `You can read the alphabet${you}! Four and a half thousand years late to class, and still top of it.`;
  if (o.clean === o.total) return `Flawless${you}! Not a single smudge. I’m unravelling with joy!`;
  if (o.clean >= o.total - 1) return `So nearly perfect${you}! One little smudge. The wall will never tell.`;
  return `You did it${you}! ${o.clean} of ${o.total} first time, and the rest will stick next time. They always do.`;
}
