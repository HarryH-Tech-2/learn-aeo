/**
 * The learning layer. Pure logic, no three.js, so it can be tested.
 *
 * The game is meant to stand in for Lesson 1, for someone starting from
 * zero, so it TEACHES before it asks:
 *
 *   • a sign is first met in a way that cannot be failed (what the picture
 *     is, the sound it writes, a hook to remember it by); only then is it
 *     asked for;
 *   • the first choice ever has one tablet, the rest of the first level two,
 *     and from then on three; decoys are only ever signs already met;
 *   • level 0 spells the learner's own name, then ten levels take the 19
 *     Lesson 1 words in their teaching order, two at a time, and a last
 *     level is read with no help at all;
 *   • each level opens with one idea about the script (signs are sounds, no
 *     vowels, silent pictures, which way to read);
 *   • old signs come back as review stations (sign → sound), chosen from the
 *     learner's weakest, and every answer can be filed as a review;
 *   • only the first level is the causeway. After it, each level is played
 *     in the place that suits what it teaches (`Layout`). Every place reads
 *     the same `LevelPlan` and answers through the same path (answers.ts).
 */
import { WORDS, type Word } from "@/lib/content/uniliteral-words";
import { UNILITERAL_GROUPS } from "@/lib/content/uniliterals";
import { DEFAULT_DOOR_NAME, doorForName } from "@/lib/content/door-name";
import type { SignState } from "@/lib/srs";

// ─── signs ───

export type SignInfo = {
  symbol: string;
  /** the sound as transliterated, e.g. "r", "ꜣ" */
  sound: string;
  /** what the picture is, e.g. "Mouth" */
  picture: string;
  /** how to say it, e.g. "r as in run" */
  said: string;
  /** one line to remember it by */
  hook: string;
  /** a playful way to pin the sound to the picture */
  trick: string;
};

const GLYPHS = UNILITERAL_GROUPS.flatMap((g) => g.glyphs);

/** Picture → sound, the silly way: what the teaching card says so the sign sticks. One for every alphabet sign (tested). */
const TRICKS: Record<string, string> = {
  "𓄿": "The vulture throws its beak wide open: “aaah!”",
  "𓇋": "One thin reed, thin as the letter i. It says “ee”.",
  "𓇌": "Two reeds, like the two arms of a Y.",
  "𓂝": "Hold out your arm for the doctor and say “aah”, from deep in the throat.",
  "𓅱": "A wobbly little chick, cheeping “woo, woo”.",
  "𓃀": "A foot, ready for its boot: b for boot.",
  "𓊪": "A square mat, spread out for a picnic: p for picnic.",
  "𓆑": "A viper with fangs. Listen to it hiss: “ffff”.",
  "𓅓": "The only bird that stares straight at you. It hums “mmm” while it does.",
  "𓈖": "Ripples on the Nile: n for Nile. The zigzag is NNNN written without lifting the pen.",
  "𓂋": "An open mouth, mid-roar: “rrrr”.",
  "𓉔": "A little hut seen from above: h for hut.",
  "𓎛": "A twisted lamp wick. Huff on a cold window, “hhh”: that breathy sound is ḥ.",
  "𓐍": "A striped ball. Say “loch” the Scottish way: the scrape at the end is ḫ.",
  "𓄡": "An animal’s belly. A softer scrape than ḫ, like a cat’s quiet hiss.",
  "𓋴": "Folded cloth, hanging like a scarf on a hook: s for scarf.",
  "𓊃": "A door bolt sliding shut: “zzzip”.",
  "𓈙": "A still garden pool. “Shhh”, don’t disturb the water.",
  "𓈎": "A hillside cut away, like a quarry: q for quarry.",
  "𓎡": "A basket with a handle. Hear it in the middle of the word: bas-K-et.",
  "𓎼": "A stand that grips a round jar so it cannot roll: g for grip.",
  "𓏏": "A small round loaf, just right for toast: t for toast.",
  "𓍿": "A tethering rope, the Egyptian’s chain: ch for chain.",
  "𓂧": "A hand, drumming on the table: d, d, d.",
  "𓆓": "A cobra means danger, and its sound is the j hiding in the middle of “danger”.",
};

const SIGNS = new Map<string, SignInfo>(
  GLYPHS.map((g) => [
    g.symbol,
    {
      symbol: g.symbol,
      sound: g.transliteration.split(" ")[0],
      picture: g.meaning.split(/[:—]/)[0].trim(),
      said: g.pronunciation,
      hook: (g as { origin?: string }).origin ?? g.meaning,
      trick: TRICKS[g.symbol] ?? "",
    },
  ]),
);

/** "the hand", "the Egyptian vulture": a picture's name inside a sentence (proper adjectives keep their capital). */
export function thePicture(symbol: string): string {
  const p = signInfo(symbol).picture;
  return "the " + (/^Egyptian\b/.test(p) ? p : p.charAt(0).toLowerCase() + p.slice(1));
}

export function signInfo(symbol: string): SignInfo {
  return SIGNS.get(symbol) ?? { symbol, sound: "?", picture: "sign", said: "", hook: "", trick: "" };
}

export const ALL_SIGNS: string[] = [...SIGNS.keys()];

// ─── what the gate asks for ───

export type Socket = {
  symbol: string;
  /** the sound this socket wants (for a name, the letters it writes) */
  sound: string;
  /** already carved: not an alphabet sign, or beyond what one level can teach */
  given?: boolean;
};

export type Phrase = {
  id: string;
  sockets: Socket[];
  translit: string;
  say: string;
  meaning: string;
  why: string;
  story: string;
  det?: { symbol: string; name: string };
  /** said while this word is being worked on: the one thing about it that needs saying first */
  note?: string;
};

export function phraseFromWord(w: Word): Phrase {
  const sockets: Socket[] = [];
  if (w.extra) sockets.push({ symbol: w.extra.symbol, sound: w.translit, given: true });
  w.core.forEach((s) => sockets.push({ symbol: s, sound: signInfo(s).sound }));
  const asked = w.core.map((s) => `“${signInfo(s).sound}”`).join(" and ");
  return {
    id: w.id,
    sockets,
    translit: w.translit,
    say: w.say,
    meaning: w.meaning,
    why: w.extra ? `${w.why} The first sign, the ${w.extra.name}, ${w.extra.note}; it is already in place.` : w.why,
    story: w.story,
    det: w.det,
    note: w.extra
      ? `${w.extra.symbol} is already in place: the ${w.extra.name}, one sign that ${w.extra.note}. The alphabet is not the whole script: some signs carry two or three sounds at once, and scribes often wrote alphabet signs after them to repeat the ending. You supply ${asked}.`
      : undefined,
  };
}

/** The most signs one level teaches from a name; longer names have the rest carved already. */
export const MAX_NAME_SIGNS = 5;

export function phraseFromName(rawName: string): Phrase {
  const door = doorForName(rawName, GLYPHS);
  const teach = new Set(door.signs.slice(0, MAX_NAME_SIGNS).map((g) => g.symbol));
  // no name given (or none that could be spelled): the gate carries Khufu's, and says so
  const khufu = door.name === DEFAULT_DOOR_NAME && rawName.trim().toLowerCase() !== DEFAULT_DOOR_NAME.toLowerCase();
  return {
    id: "name",
    sockets: door.cells.map((c) => ({ symbol: c.glyph.symbol, sound: c.letter, given: !teach.has(c.glyph.symbol) })),
    translit: door.name,
    say: door.name,
    meaning: khufu ? "Khufu, builder of the Great Pyramid" : "your name",
    // (the finish card sets the signs out one by one above this, so it does not list them again)
    why: "Scribes spelled foreign names exactly like this: one sign for each sound, and no vowels unless a name needed them.",
    story: "A name was a part of you, as real as your heart. Carved on a wall, you lived as long as the wall did. That is why kings wrote theirs everywhere, inside the oval ring we call a cartouche.",
  };
}

/** The real inscription read at the end: the builder of the Great Pyramid, four alphabet signs. */
export const FINAL_PHRASE: Phrase = {
  id: "khufu",
  sockets: ["𓐍", "𓅱", "𓆑", "𓅱"].map((s) => ({ symbol: s, sound: signInfo(s).sound })),
  translit: "ḫwfw",
  say: "Khufu",
  meaning: "Khufu, builder of the Great Pyramid",
  why: "𓐍 is ḫ, 𓅱 is w, 𓆑 is f, 𓅱 is w again: ḫ-w-f-w. No vowels were written, so we say ‘Khufu’ by convention; the Greeks heard ‘Cheops’.",
  story: "This is a real royal name, painted in red ochre inside the relieving chambers of the Great Pyramid by the work gangs who built it. You have just read a 4,500-year-old word with nothing but the alphabet.",
};

// ─── places ───

/** Where a level is played. Only the first level is the causeway; the rest swap jumping for play that suits what they teach. */
export type Layout = "causeway" | "felucca" | "workshop" | "tomb" | "market" | "brush" | "passage" | "wall";

export type LayoutInfo = {
  place: string;
  /** the button that starts the run */
  begin: string;
  /** after "Spell it to …" / "Read it to …" */
  goal: string;
  /** the bar at the top, once everything is answered */
  open: string;
  /** added to the message for the last answer */
  opened: string;
  /** "One sign left, a silent one: …" */
  detAt: string;
  /** on the teaching card: what to do with the sign just met */
  teachNext: string;
  /** on the briefing: how new signs present themselves here */
  newSigns: string;
  /** the keyboard line at the bottom of the screen */
  controls: string;
  /** what a touch screen gets */
  touch: "stick+jump" | "stick" | "none";
  /** how the place is played, for the briefing of a level that has no new idea to state */
  how: string;
  /** how many old signs come back (the causeway is also limited by its free sites) */
  reviews: number;
};

export const LAYOUTS: Record<Layout, LayoutInfo> = {
  causeway: {
    place: "The causeway",
    begin: "Begin the crossing",
    goal: "open the gate",
    open: "The gate is open",
    opened: "The gate is opening.",
    detAt: "choose the picture at the gate",
    teachNext: "Now walk on and choose its tablet.",
    newSigns: "Each waits in a beam of light.",
    controls: "WASD or arrows to run · Space to jump, again in the air to double jump · drag to look · H to hear the sound · K to ask Khety",
    touch: "stick+jump",
    how: "Cross the river on the stone pillars. Walk into a beam of light to meet a sign, then choose its tablet to carve it on the gate.",
    reviews: 2,
  },
  felucca: {
    place: "The river",
    begin: "Cast off",
    goal: "open the water gate",
    open: "The water gate is open",
    opened: "The water gate is opening.",
    detAt: "steer for its picture at the last arches",
    teachNext: "Arches ahead: steer for the one that carries it.",
    newSigns: "Each meets you in a band of light across the water.",
    controls: "A / D or the arrow keys to steer · H to hear the sound · K to ask Khety",
    touch: "stick",
    how: "You are on the river. Stone arches stand in the water ahead, each carrying a sign. A sound is called: steer the felucca through the arch that writes it. A wrong arch is barred, and costs you way.",
    reviews: 2,
  },
  workshop: {
    place: "The scribe’s workshop",
    begin: "Go in",
    goal: "finish the cartouche",
    open: "The cartouche is finished",
    opened: "The cartouche is finished, and the door at the back is open.",
    detAt: "push its picture into the last place",
    teachNext: "Now push its block into the cartouche.",
    newSigns: "Walk up to a block that glows to meet its sign before you push it.",
    controls: "WASD or arrows to walk and push · Z takes a move back · R puts the blocks back · K to ask Khety",
    touch: "stick",
    how: "Nothing hurries in the scribe’s workshop. Push the sign blocks into the cartouche on the floor, first sound first. A block in the wrong place is carried back to where it started.",
    reviews: 0,
  },
  tomb: {
    place: "The tomb",
    begin: "Light the lamp",
    goal: "open the burial chamber",
    open: "The burial chamber is open",
    opened: "The last seal is broken: the burial chamber is open.",
    detAt: "touch its picture on the last slabs",
    teachNext: "Now find its slab and touch it.",
    newSigns: "Each waits where light falls through the roof.",
    controls: "WASD or arrows to walk · drag to look · H to hear the sound · K to ask Khety",
    touch: "stick",
    how: "The tomb is dark and your lamp shows only what is close. Each way on is sealed by slabs with a sign on them: touch the one the wall asks for. Where two plain slabs stand side by side, the writing between them says which is real.",
    reviews: 2,
  },
  market: {
    place: "The market",
    begin: "Go to market",
    goal: "fill the orders",
    open: "Every order is filled",
    opened: "Every order is filled: the market gate is opening.",
    detAt: "carry the word to the stall that hangs out its picture",
    teachNext: "Lift the goods and carry them to the stall that hangs out this sign.",
    newSigns: "Each is introduced on the quay, where the goods wait.",
    controls: "WASD or arrows to walk · walk into the goods to lift them, and into a stall to deliver · H to hear the sound · K to ask Khety",
    touch: "stick",
    how: "Every stall hangs out a sign. Lift the goods on the quay, read the label, and carry them to the right stall: by sound while you are spelling, by meaning when the label is a whole word.",
    reviews: 0,
  },
  brush: {
    place: "The buried wall",
    begin: "Pick up the brush",
    goal: "read the wall",
    open: "The wall is read",
    opened: "The wall is read.",
    detAt: "choose the picture that ends the word",
    teachNext: "Keep brushing: when the whole word is clear, you will read it.",
    newSigns: "Each introduces itself as it comes out of the sand.",
    controls: "Drag across the wall to brush the sand away · click a stone to choose, or press 1, 2, 3 · K to ask Khety",
    touch: "none",
    how: "A wall lies under the sand. Brush it clear, a sign at a time, then read what you have uncovered: for each sign, choose its sound.",
    reviews: 0,
  },
  passage: {
    place: "The collapsing passage",
    begin: "Run",
    goal: "get out",
    open: "The way out is clear",
    opened: "Daylight ahead: run for it.",
    detAt: "take the door with its picture",
    teachNext: "Doors ahead: take the one that carries it.",
    newSigns: "Each is shown to you in a quiet stretch before its doors.",
    controls: "A / D or the arrow keys to pick a side · you run on your own · H to hear the sound · K to ask Khety",
    touch: "stick",
    how: "The passage is coming down behind you, and you run on your own. Steer left or right to take the door with the right sign. A wrong door costs you ground.",
    reviews: 5,
  },
  wall: {
    place: "The great wall",
    begin: "Start climbing",
    goal: "reach the top",
    open: "You are at the top",
    opened: "That was the last sign: up and over.",
    detAt: "",
    teachNext: "",
    newSigns: "",
    controls: "left / right arrows along a ledge, up to start the line above you · then left, up or right arrow (or a click) to take a hold · K to ask Khety",
    touch: "stick",
    how: "Climb the wall a line at a time. Start each line at the end its figures face, then at every sign take the hold that carries its sound.",
    reviews: 0,
  },
};

// ─── levels ───

export type ForkMode = "off" | "gentle" | "real";

export type LevelSpec = {
  index: number;
  kind: "name" | "words" | "final";
  layout: Layout;
  title: string;
  words: Word[];
  brief: { title: string; body: string[] };
  /** the causeway's fork (only the causeway has one) */
  fork: ForkMode;
  /** ask for the silent picture once the sounds are spelled */
  askDet: boolean;
};

const PAIRS: Word[][] = [];
for (let i = 0; i < WORDS.length; i += 2) PAIRS.push(WORDS.slice(i, i + 2));

/**
 * The place each word level is played in, in Harry's order. Change a level's
 * place here and nothing else: the plan, the briefing and the scene follow.
 */
const PLACES: Layout[] = ["felucca", "workshop", "tomb", "market", "brush", "passage", "felucca", "workshop", "tomb", "market"];

/** One idea per level, stated where the place that teaches it first appears. The second paragraph is how the place is played. */
const IDEAS: Partial<Record<Layout, { title: string; body: string[] }>> = {
  felucca: {
    title: "No vowels were written",
    body: [
      "Egyptian wrote consonants only. The word for ‘name’ is just r and n; we say ‘ren’ because a word needs a vowel to be spoken, and ‘e’ is the convention.",
      "Today you are on the river. Stone arches stand in the water ahead, each carrying a sign. A sound is called: steer the felucca through the arch that writes it. New signs meet you first, in a band of light across the water.",
    ],
  },
  workshop: {
    title: "Silent pictures",
    body: [
      "Many words end in a picture that is never read aloud. It tells the reader what kind of word it is: a sky after ‘pet’, three ripples after ‘mu’. Egyptologists call it a determinative.",
      "This is the scribe’s workshop, and nothing here hurries. Push the sign blocks into the cartouche on the floor, first sound first. When the sounds are in place, the last space is for the silent picture: the one block you choose by meaning, not by sound.",
    ],
  },
  tomb: {
    title: "Which way to read",
    body: [
      "Hieroglyphs can run left to right, right to left, or top to bottom. The rule never changes: people, birds and snakes look toward the START of the line. You read into their faces. A column is read from the top down.",
      "The tomb is dark and your lamp shows only what is close. Each way on is sealed by slabs with a sign on them: touch the one the wall asks for. Where two plain slabs stand side by side, the writing between them says which is real: the true way begins where the writing begins.",
    ],
  },
  market: {
    title: "What kind of word?",
    body: [
      "A silent picture sorts words into kinds. A seated man ends words for people and their trades, three strokes mean ‘many’, a sun ends words about time. Words that were spelled alike were told apart by that last picture.",
      "Every stall in the market hangs out a sign. Lift the goods on the quay, read the label, and carry them to the right stall: by sound while you are spelling, by meaning when the label is a whole word. Old orders come back at the end.",
    ],
  },
  brush: {
    title: "From spelling to reading",
    body: [
      "So far you have been given the sounds and found the signs. Reading goes the other way: the signs are in front of you, and you supply the sounds. That is the whole job of an epigrapher at a wall.",
      "A wall lies under the sand. Brush it clear, a sign at a time, then read what you have uncovered: for each sign, choose its sound. New signs introduce themselves as they come out of the sand.",
    ],
  },
  passage: {
    title: "Quick, now",
    body: [
      "Reading gets fast only by doing it fast. The passage behind you is coming down, so there is no time to work a sign out: see it, know it, go.",
      "You run on your own. Steer left or right to take the door with the right sign. Between the new words, old signs come back: there you are shown the sign, and the doors carry sounds. A wrong door costs you ground.",
    ],
  },
};

export const LEVELS: LevelSpec[] = [
  {
    index: 0,
    kind: "name",
    layout: "causeway",
    title: "Your name on the gate",
    words: [],
    brief: {
      title: "Signs are sounds",
      body: [
        "Most hieroglyphs are not pictures of what they mean. They are sounds. The owl is not an owl; it is the sound m. Twenty-five signs like that make an alphabet, and with it you can write anything, starting with your own name.",
        "Walk into a beam of light to meet a sign. Then choose its tablet to carve it on the gate. When your name is spelled, the gate opens.",
      ],
    },
    fork: "off",
    askDet: false,
  },
  ...PAIRS.map((words, i): LevelSpec => {
    const layout = PLACES[i] ?? "causeway";
    // an idea is stated the first time its place comes up; after that the briefing only says how the place works
    const idea = PLACES.indexOf(layout) === i ? IDEAS[layout] : undefined;
    const meanings = words.map((w) => `“${w.meaning}”`).join(" and ");
    return {
      index: i + 1,
      kind: "words",
      layout,
      title: words.map((w) => w.meaning.split(",")[0]).join(" · "),
      words,
      brief: idea ?? {
        title: `${words.length > 1 ? "Two more words" : "One more word"}: ${meanings}`,
        body: [LAYOUTS[layout].how, "Signs you already know are not introduced again: recall them."],
      },
      // the false steps only dip for the first three word levels; once the rule has been stated outright, they sink
      fork: i < 3 ? "gentle" : "real",
      askDet: i >= 1,
    };
  }),
  {
    index: PAIRS.length + 1,
    kind: "final",
    layout: "wall",
    title: "Read it yourself",
    words: [],
    brief: {
      title: "Read it yourself",
      body: [
        "One last wall, and its top line is real: a king’s name, written by the men who built his pyramid. Below it are words you have met. Nothing is labelled.",
        "Climb a line at a time. Start each line at the end its figures face, then at every sign take the hold that carries its sound. No beams, no hints. You know all 25 signs now.",
      ],
    },
    fork: "real",
    askDet: false,
  },
];

// ─── stations ───

export type Station = {
  /** sign: choose the sign for a sound · det: choose the silent picture · read: choose the sound of a sign */
  kind: "sign" | "det" | "read";
  phrase: number;
  /** the right answer: a sign (sign, det) or a sign whose sound is wanted (read) */
  target: string;
  /** the sound as the gate names it: the transliteration for a word, the letters of the name on the name level */
  sound: string;
  /** what the tablets carry: signs (sign, det) or sounds (read) */
  options: string[];
  /** new to the learner, or known only under another sound: it is taught before it is asked for */
  teach: boolean;
  /** the sound the learner knew this sign by until now (a letter of their name), when the word needs its true one */
  metAs?: string;
  /** where on the causeway (other places lay stations out in order and ignore this) */
  site: number;
};

export type ReviewStation = {
  /** sound: an old sign, asked the other way round · det: an old word, asked for its silent picture (the market) */
  kind: "sound" | "det";
  /** the sign shown (sound), or the silent picture wanted (det) */
  sign: string;
  /** the right one of `options`: the sound the learner knows this sign by, or the silent picture */
  sound: string;
  options: string[];
  /** the word a silent picture belongs to */
  word?: { translit: string; meaning: string; name: string };
  site: number;
};

export type LevelPlan = { spec: LevelSpec; phrases: Phrase[]; stations: Station[]; reviews: ReviewStation[]; newSigns: string[] };

const BASELINE = 0.3;

/** How shaky a sign is for this learner: forgotten often, low ease, or due now. */
export function weakness(state: SignState | undefined, now: number): number {
  if (!state) return BASELINE;
  return state.lapses * 1.5 + Math.max(0, 2.5 - state.ease) * 2 + (state.due <= now ? 1 : 0) + (state.reps === 0 ? 0.5 : 0);
}

function shuffled<T>(items: T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sites along the causeway, in the order you reach them; the last is kept for the silent picture at the gate. */
export const SIGN_SITE_COUNT = 6;
export const DET_SITE = 6;
const SITES_FOR: Record<number, number[]> = { 1: [1], 2: [1, 3], 3: [1, 2, 3], 4: [0, 1, 2, 3], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5] };

/** How many tablets a station shows: one for the very first choice, two for the rest of the name level, then three. */
export function optionCount(levelIndex: number, stationIndex: number): number {
  if (levelIndex === 0) return stationIndex === 0 ? 1 : 2;
  return 3;
}

const OTHER_DETS = [...new Set(WORDS.filter((w) => w.det).map((w) => w.det!.symbol))];

/** How many earlier words the last wall carries under the king's name, and how many old orders the market brings back. */
export const WALL_WORDS = 3;
export const MARKET_ORDERS = 3;

/** `knownAs`: the sound each known sign was learned under. A name teaches 𓄿 as “a”; a word later needs it as “ꜣ”. */
export type PlanInput = { level: number; name: string; known: string[]; knownAs?: Record<string, string>; review: SignState[] | null; now: number; rand?: () => number };

export function planLevel({ level, name, known, knownAs = {}, review, now, rand = Math.random }: PlanInput): LevelPlan {
  const as: Record<string, string> = { ...knownAs };
  const spec = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level))];
  const causeway = spec.layout === "causeway";
  const byGlyph = new Map((review ?? []).map((s) => [s.glyph, s]));
  const weakFirst = (signs: string[]) =>
    signs
      .map((s) => ({ s, w: weakness(byGlyph.get(s), now) + rand() * 0.25 }))
      .sort((a, b) => b.w - a.w)
      .map((x) => x.s);

  let phrases: Phrase[];
  if (spec.kind === "name") phrases = [phraseFromName(name)];
  else if (spec.kind === "words") phrases = spec.words.map(phraseFromWord);
  else if (spec.layout === "wall") {
    // the wall is read from the bottom line up: words whose signs are shakiest, in the order they were taught, then the king's name
    const worth = (w: Word) => Math.max(...w.core.map((s) => weakness(byGlyph.get(s), now))) + rand() * 0.25;
    const old = WORDS.filter((w) => !w.extra && w.core.length >= 2)
      .map((w) => ({ w, score: worth(w) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, WALL_WORDS)
      .map((x) => x.w)
      .sort((a, b) => WORDS.indexOf(a) - WORDS.indexOf(b));
    phrases = [...old.map(phraseFromWord), FINAL_PHRASE];
  } else phrases = [FINAL_PHRASE];

  // what each phrase asks for: its distinct ungiven signs, in reading order
  const wanted: { phrase: number; symbol: string; sound: string }[] = [];
  phrases.forEach((p, pi) => {
    const seen = new Set<string>();
    p.sockets.forEach((sk) => {
      if (sk.given || seen.has(sk.symbol)) return;
      seen.add(sk.symbol);
      wanted.push({ phrase: pi, symbol: sk.symbol, sound: sk.sound });
    });
  });
  // the causeway has six places to stand tablets; nowhere else is short of room
  const trimmed = causeway ? wanted.slice(0, SIGN_SITE_COUNT) : wanted;
  const sites = causeway ? (SITES_FOR[trimmed.length] ?? SITES_FOR[SIGN_SITE_COUNT]) : trimmed.map((_, i) => i);

  const met = new Set(known.filter((s) => SIGNS.has(s)));
  const newSigns: string[] = [];
  const signStations: Station[] = trimmed.map((w, i) => {
    const reading = spec.kind === "final";
    // known, but only as a letter of the learner's name: the word wants its real sound, so it is taught again under that
    const relabel = !reading && met.has(w.symbol) && as[w.symbol] !== undefined && as[w.symbol] !== w.sound;
    const teach = !reading && (!met.has(w.symbol) || relabel);
    const metAs = relabel ? as[w.symbol] : undefined;
    if (teach && !relabel) newSigns.push(w.symbol);
    if (!reading) as[w.symbol] = w.sound;
    const count = optionCount(spec.index, i);
    let options: string[];
    if (reading) {
      const right = signInfo(w.symbol).sound;
      const others = shuffled(ALL_SIGNS.map((s) => signInfo(s).sound).filter((x) => x !== right), rand).slice(0, 2);
      options = shuffled([right, ...others], rand);
    } else {
      // decoys are only ever signs the learner has met; the word's own next sign is the best trap
      const next = trimmed.slice(i + 1).find((x) => x.phrase === w.phrase && x.symbol !== w.symbol && met.has(x.symbol))?.symbol;
      const pool = weakFirst([...met].filter((s) => s !== w.symbol && s !== next));
      options = shuffled([w.symbol, ...(next ? [next] : []), ...pool].slice(0, count), rand);
    }
    met.add(w.symbol);
    return { kind: reading ? "read" : "sign", phrase: w.phrase, target: w.symbol, sound: w.sound, options, teach, metAs, site: sites[i] };
  });

  const detStation = (pi: number, wrongs: number): Station => {
    const right = phrases[pi].det!.symbol;
    const wrong = shuffled(OTHER_DETS.filter((d) => d !== right && !phrases.some((p) => p.det?.symbol === d)), rand).slice(0, wrongs);
    return { kind: "det", phrase: pi, target: right, sound: "silent", options: shuffled([right, ...wrong], rand), teach: false, site: DET_SITE };
  };

  let stations = signStations;
  if (spec.askDet && spec.layout === "market") {
    // the market is about silent pictures: every word that has one is asked for it, as soon as the word is spelled
    stations = phrases.flatMap((p, pi) => [...signStations.filter((s) => s.phrase === pi), ...(p.det ? [detStation(pi, 2)] : [])]);
  } else if (spec.askDet) {
    // the silent picture of the word just spelled: the last word that has one, so the order at the gate makes sense
    const pi = phrases.map((p) => !!p.det).lastIndexOf(true);
    if (pi >= 0) stations = [...signStations, detStation(pi, 1)];
  }

  // reviews: old signs, weakest first, asked the other way round (sign → sound)
  const targets = new Set(trimmed.map((w) => w.symbol));
  const old = weakFirst(known.filter((s) => SIGNS.has(s) && !targets.has(s)));
  // on the causeway they stand at the sites the level is not using (not the last forecourt site: tablets there crowd the view of the gate)
  const used = new Set(stations.map((s) => s.site));
  const free = [0, 1, 2, 3, 4].filter((s) => !used.has(s));
  const count = Math.min(LAYOUTS[spec.layout].reviews, old.length, causeway ? free.length : Infinity);
  // a review asks for the sound the learner actually learned the sign under
  const label = (s: string) => knownAs[s] ?? signInfo(s).sound;
  const reviews: ReviewStation[] =
    spec.kind === "words" && old.length >= 3
      ? old.slice(0, count).map((sign, i) => {
          const right = label(sign);
          const others = shuffled(old.filter((s) => s !== sign).map(label).filter((x, k, arr) => x !== right && arr.indexOf(x) === k), rand).slice(0, 2);
          return { kind: "sound", sign, sound: right, options: shuffled([right, ...others], rand), site: causeway ? free[i] : -1 };
        })
      : [];

  // the market's old orders: words from earlier levels, carried to the stall of their silent picture
  if (spec.layout === "market" && spec.kind === "words") {
    const before = WORDS.slice(0, Math.max(0, WORDS.indexOf(spec.words[0]))).filter((w) => w.det && !phrases.some((p) => p.det?.symbol === w.det!.symbol));
    const distinct = shuffled(before, rand).filter((w, k, arr) => arr.findIndex((x) => x.det!.symbol === w.det!.symbol) === k);
    distinct.slice(0, MARKET_ORDERS).forEach((w) => {
      const right = w.det!.symbol;
      const others = shuffled(OTHER_DETS.filter((d) => d !== right), rand).slice(0, 2);
      reviews.push({ kind: "det", sign: right, sound: right, options: shuffled([right, ...others], rand), word: { translit: w.translit, meaning: w.meaning.split(",")[0], name: w.det!.name }, site: -1 });
    });
  }

  return { spec, phrases, stations, reviews, newSigns };
}

/** Is there anything left to do? The market also wants its old orders filled; everywhere else reviews are optional. */
export function allDone(l: { spec: LevelSpec; stations: Station[]; reviews: ReviewStation[] }, progress: number, reviewed: (null | "right" | "wrong")[]): boolean {
  if (progress < l.stations.length) return false;
  return l.spec.layout !== "market" || l.reviews.every((_, i) => reviewed[i] !== null && reviewed[i] !== undefined);
}

/** Is this socket filled yet? Given sockets always are; the rest fill when their sign's station is done. */
export function socketFilled(plan: { stations: Station[] }, phrase: number, socket: Socket, progress: number): boolean {
  if (socket.given) return true;
  const i = plan.stations.findIndex((s) => s.phrase === phrase && s.kind !== "det" && s.target === socket.symbol);
  return i >= 0 && i < progress;
}

/** The station that answers for a socket (a sign that comes round twice in a word has one station for both places). */
export function stationOfSocket(plan: { stations: Station[] }, phrase: number, socket: Socket): number {
  return socket.given ? -1 : plan.stations.findIndex((s) => s.phrase === phrase && s.kind !== "det" && s.target === socket.symbol);
}

/**
 * When the question is a sign and the answers are sounds (the buried wall):
 * the sounds of a station's options, the wanted one under the name the gate gives it.
 */
export function soundChoices(station: Station): { option: string; sound: string }[] {
  const out: { option: string; sound: string }[] = [];
  station.options.forEach((o) => {
    const sound = o === station.target ? station.sound : signInfo(o).sound;
    if (!out.some((x) => x.sound === sound)) out.push({ option: o, sound });
  });
  return out;
}

export type SocketView = {
  symbol: string;
  sound: string;
  showSymbol: boolean;
  showSound: boolean;
  state: "given" | "filled" | "next" | "empty";
  /** the silent picture at the end of a word */
  silent?: boolean;
};

/**
 * What the gate (and the bar at the top of the screen) shows for one phrase.
 * Spelling: the sounds are the question, the signs appear as they are found.
 * Reading (the last level): the signs are the question, the sounds appear as they are read.
 */
export function viewSockets(plan: { stations: Station[]; phrases: Phrase[] }, progress: number, phrase: number): SocketView[] {
  const p = plan.phrases[phrase];
  const current = plan.stations[progress];
  const reading = plan.stations.some((s) => s.kind === "read");
  const out: SocketView[] = p.sockets.map((sk) => {
    const filled = socketFilled(plan, phrase, sk, progress);
    const next = !!current && current.kind !== "det" && current.phrase === phrase && current.target === sk.symbol && !sk.given;
    return {
      symbol: sk.symbol,
      sound: sk.sound,
      showSymbol: reading || filled,
      showSound: reading ? filled : true,
      state: sk.given ? "given" : filled ? "filled" : next ? "next" : "empty",
    };
  });
  const di = plan.stations.findIndex((s) => s.kind === "det" && s.phrase === phrase);
  if (di >= 0) out.push({ symbol: plan.stations[di].target, sound: "silent", showSymbol: di < progress, showSound: true, state: di < progress ? "filled" : di === progress ? "next" : "empty", silent: true });
  return out;
}

/** The phrase the learner is working on (the last one once everything is done). */
export function currentPhrase(plan: { stations: Station[]; phrases: Phrase[] }, progress: number): number {
  return plan.stations[Math.min(progress, plan.stations.length - 1)]?.phrase ?? 0;
}

/** SM-2 quality to file for a sign after the run: clean recall is "good", a wrong pick is a lapse. */
export function qualityAfterRun(mistakes: number): 2 | 4 {
  return mistakes > 0 ? 2 : 4;
}

/** Signs with an obvious front, for the stele at the fork. Unmirrored, the font draws them facing left. */
export const FACING_SIGNS = ["𓅓", "𓅱", "𓆑", "𓄿"];

/**
 * A word the learner has already spelled whose signs, read the wrong way up,
 * give a different string: what the tomb carves in a column, to be read from the top down.
 */
export function columnWord(before: Word[], rand: () => number = Math.random): { signs: string[]; right: string; wrong: string; meaning: string } | null {
  const ok = before.filter((w) => !w.extra && w.core.length >= 2 && w.core.join("") !== [...w.core].reverse().join(""));
  if (ok.length === 0) return null;
  const w = ok[Math.floor(rand() * ok.length)];
  const sounds = w.core.map((s) => signInfo(s).sound);
  return { signs: w.core, right: sounds.join(" "), wrong: [...sounds].reverse().join(" "), meaning: w.meaning.split(",")[0] };
}
