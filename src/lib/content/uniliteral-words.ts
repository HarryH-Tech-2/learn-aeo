/**
 * Lesson 1 after the door: the alphabet taught through real words.
 *
 * Each entry is a common Egyptian word spelled (mostly) with alphabet signs.
 * A word introduces one or two signs the learner has not met; the rest are
 * ones they already know, so every card is reading, not memorising. A
 * determinative (a silent picture sign) is shown faded and named, so the
 * idea is planted before Lesson 3 makes it the subject.
 *
 * Order matters: signs are introduced roughly in frequency order, and the
 * words are chunked into short groups (see GROUP_SIZES) with a quick check after each.
 */
import type { GlyphGroup, Hieroglyph } from "@/lib/lessons";

export type Word = {
  id: string;
  /** Alphabet signs of the word, in reading order */
  core: string[];
  /** Any sign that is not an alphabet sign but carries the word (e.g. nfr) */
  extra?: { symbol: string; name: string; note: string };
  /** Silent picture sign at the end, if the word usually carries one */
  det?: { symbol: string; name: string };
  translit: string;
  /** How to say it aloud, vowels filled in by convention */
  say: string;
  meaning: string;
  /** Why it is spelled the way it is: the sound-by-sound reading */
  why: string;
  /** What the word meant to the people who wrote it */
  story: string;
};

export const WORDS: Word[] = [
  {
    id: "rn",
    core: ["𓂋", "𓈖"],
    translit: "rn",
    say: "ren",
    meaning: "name",
    why: "Two sounds, two signs. The mouth 𓂋 is r; the ripple of water 𓈖 is n. No vowels were written, so we say ‘ren’ by convention.",
    story: "Your name was a part of you, as real as your heart. Carve it on a wall and you lived as long as the wall did; chisel it out and you were gone. That is why kings wrote their names everywhere, and why their enemies hacked them off.",
  },
  {
    id: "snt",
    core: ["𓋴", "𓈖", "𓏏"],
    det: { symbol: "𓁐", name: "seated woman" },
    translit: "snt",
    say: "senet",
    meaning: "sister",
    why: "Folded cloth 𓋴 is s, water 𓈖 is n: sn, brother. Add the loaf of bread 𓏏, t, and a brother becomes a sister. That little loaf turns almost any word feminine.",
    story: "Egyptian love poems call the beloved ‘my sister’ and ‘my brother’. It was not about family: it was the warmest word they had for someone close.",
  },
  {
    id: "pt",
    core: ["𓊪", "𓏏"],
    det: { symbol: "𓇯", name: "sky" },
    translit: "pt",
    say: "pet",
    meaning: "sky",
    why: "The stool 𓊪 is p, the loaf 𓏏 is t. The sign that follows is not read at all: it is a picture of the sky, hung on the end so a reader knows which ‘pet’ is meant.",
    story: "The sky was a goddess, Nut, arched over the earth on her fingertips and toes, swallowing the sun each evening and giving birth to it each dawn.",
  },
  {
    id: "mw",
    core: ["𓅓", "𓅱"],
    det: { symbol: "𓈗", name: "three ripples" },
    translit: "mw",
    say: "moo",
    meaning: "water",
    why: "The owl 𓅓 is m, the quail chick 𓅱 is w. Egyptians heard ‘moo’. The three ripples at the end are the picture of water itself, silent.",
    story: "One word for water was enough, because there was really only one water: the Nile. When it rose, the year began. When it failed, people starved.",
  },
  {
    id: "aa",
    core: ["𓂝", "𓄿"],
    translit: "ꜥꜣ",
    say: "aa",
    meaning: "great, big",
    why: "The forearm 𓂝 is a deep throat sound we write ꜥ; the vulture 𓄿 is the catch in the throat we write ꜣ. Together, ‘aa’. Scribes usually wrote a wooden column 𓉻 in front: not a silent picture, but one sign that carries both sounds, ꜥꜣ, at once.",
    story: "‘Great house’, pr-ꜥꜣ, meant the palace. Then it came to mean the man inside it, the way we say ‘the White House said’. The Greeks heard it as pharaoh.",
  },
  {
    id: "nfr",
    core: ["𓆑", "𓂋"],
    extra: { symbol: "𓄤", name: "heart and windpipe", note: "carries the whole word nfr" },
    translit: "nfr",
    say: "nefer",
    meaning: "good, beautiful",
    why: "The heart-and-windpipe sign 𓄤 says the whole word, nfr. The viper 𓆑, f, and the mouth 𓂋, r, are written after it to confirm the sounds: scribes liked to spell a word and picture it at once.",
    story: "Nefertiti is nfrt-ꞽꞽtꞽ, ‘the beautiful one has come’. Nefertari, nfrt-ꞽry, ‘beautiful companion’. The word is in half the names you already know.",
  },
  {
    id: "ib",
    core: ["𓇋", "𓃀"],
    det: { symbol: "𓄣", name: "heart" },
    translit: "ꞽb",
    say: "ib",
    meaning: "heart",
    why: "A single reed 𓇋 is the weak sound we write ꞽ, said ‘i’. The lower leg 𓃀 is b. The heart at the end is a real drawing of the organ, an ox’s heart, silent.",
    story: "The heart was where you thought and remembered. Embalmers threw the brain away but left the heart in place, because at judgement it was weighed against a feather.",
  },
  {
    id: "bak",
    core: ["𓃀", "𓄿", "𓎡"],
    det: { symbol: "𓀀", name: "seated man" },
    translit: "bꜣk",
    say: "bak",
    meaning: "servant",
    why: "Leg 𓃀, vulture 𓄿, and the basket with a handle 𓎡, which is k. The seated man at the end says: this word is a person.",
    story: "Officials called themselves ‘servant of the king’ and meant it as a boast. The same word wrote ‘work’: bꜣkw, what servants do.",
  },
  {
    id: "hnqt",
    core: ["𓎛", "𓈖", "𓈎", "𓏏"],
    det: { symbol: "𓏊", name: "beer jar" },
    translit: "ḥnqt",
    say: "henqet",
    meaning: "beer",
    why: "The twisted wick 𓎛 is a breathy h we write ḥ; water 𓈖 is n; the hill slope 𓈎 is q, made at the back of the mouth; the loaf 𓏏 is t. Then the jar.",
    story: "Pyramid builders were paid in bread and beer, and beer was food: thick, low in alcohol, drunk through a straw. ‘A thousand of bread and beer’ is asked for in every offering prayer.",
  },
  {
    id: "kht",
    core: ["𓐍", "𓏏"],
    det: { symbol: "𓏥", name: "three strokes (plural)" },
    translit: "ḫt",
    say: "khet",
    meaning: "thing, things",
    why: "The sieve 𓐍 is a rasping sound like the ch in ‘loch’, written ḫ. The loaf 𓏏 is t. Three strokes at the end mean ‘more than one’.",
    story: "‘Every good and pure thing’, ḫt nbt nfrt wꜥbt, is what the dead asked for on their tomb walls: bread, beer, oxen, birds, linen, oil, and anything else you could think of.",
  },
  {
    id: "zp",
    core: ["𓊃", "𓊪"],
    translit: "zp",
    say: "zep",
    meaning: "time, occasion",
    why: "The door bolt 𓊃 is z, a buzzing s. The stool 𓊪 is p. Two signs, one very useful word.",
    story: "Written after a phrase with the number two, zp 2, it means ‘say it twice’: the scribe’s ditto mark. Every ‘hail, hail’ in a hymn is one ‘hail’ and a zp 2.",
  },
  {
    id: "ss",
    core: ["𓋴", "𓈙"],
    det: { symbol: "𓀀", name: "seated man" },
    translit: "sš",
    say: "sesh",
    meaning: "scribe",
    why: "Folded cloth 𓋴 is s; the pool 𓈙 is sh. Drop the seated man and add a papyrus roll 𓏛 and the same two sounds mean ‘writing’.",
    story: "Perhaps one Egyptian in a hundred could read. Scribes ran the country and knew it: ‘Be a scribe,’ says one school text, ‘it saves you from labour and protects you from all work.’",
  },
  {
    id: "dpt",
    core: ["𓂧", "𓊪", "𓏏"],
    det: { symbol: "𓊛", name: "boat" },
    translit: "dpt",
    say: "depet",
    meaning: "boat",
    why: "The hand 𓂧 is d, the stool 𓊪 is p, the loaf 𓏏 is t. Then a picture of a boat, so nobody mistakes it.",
    story: "There were no roads worth the name. Stone for the pyramids, grain for the granaries, the king himself: everything moved by boat. Even the sun crossed the sky in one.",
  },
  {
    id: "djd",
    core: ["𓆓", "𓂧"],
    translit: "ḏd",
    say: "djed",
    meaning: "to say, to speak",
    why: "The cobra 𓆓 is a j sound, written ḏ; the hand 𓂧 is d. Same two sounds as the djed pillar 𓊽, a different word.",
    story: "‘Words spoken’, ḏd mdw, opens thousands of spells and prayers: it is the cue that what follows should be said aloud. Kings such as Djedefre and Djedkare carry the other ḏd, ‘stable, enduring’.",
  },
  {
    id: "hrw",
    core: ["𓉔", "𓂋", "𓅱"],
    det: { symbol: "𓇳", name: "sun" },
    translit: "hrw",
    say: "heru",
    meaning: "day",
    why: "The reed shelter 𓉔 is a plain h, the mouth 𓂋 is r, the chick 𓅱 is w. The sun at the end tells you which kind of word this is.",
    story: "hrw nfr, ‘a good day’, was a holiday: a feast, a river trip, a day off. It is the phrase on a thousand tomb walls showing people drinking and listening to music.",
  },
  {
    id: "kht2",
    core: ["𓄡", "𓏏"],
    det: { symbol: "𓄹", name: "piece of flesh" },
    translit: "ẖt",
    say: "khet",
    meaning: "belly, body",
    why: "The animal belly with teats 𓄡 is a softer ch, written ẖ. The loaf 𓏏 is t. A piece of flesh at the end says this is a body part.",
    story: "‘From the belly’ meant from birth. ‘In one belly’ meant of the same generation. And the whole body of a people, everyone at once, was also a ẖt.",
  },
  {
    id: "gb",
    core: ["𓎼", "𓃀"],
    det: { symbol: "𓅬", name: "goose (Geb’s bird)" },
    translit: "gb",
    say: "geb",
    meaning: "Geb, the earth",
    why: "The jar stand 𓎼 is a hard g, the leg 𓃀 is b. The goose after it is the god’s own bird, and often writes his name on its own.",
    story: "Geb was the ground you stood on, lying on his back under the sky goddess. Earthquakes were his laughter. Everything that grew, grew out of him.",
  },
  {
    id: "tjaw",
    core: ["𓍿", "𓄿", "𓅱"],
    det: { symbol: "𓊡", name: "sail" },
    translit: "ṯꜣw",
    say: "tjau",
    meaning: "wind, breath",
    why: "The tethering rope 𓍿 is a ch sound like in ‘church’, written ṯ; then the vulture and the chick. A sail at the end: what wind does.",
    story: "The prayer for the dead asks for ‘the sweet breath of the north wind’. Alive, the same wind pushed boats upstream against the current, which is why sailing south was easy.",
  },
  {
    id: "ky",
    core: ["𓎡", "𓇌"],
    translit: "ky",
    say: "kee",
    meaning: "another, other",
    why: "The basket 𓎡 is k; two reeds together 𓇌 are y. You have now met every alphabet sign there is.",
    story: "‘Another says’, ky ḏd, is how scribes noted a different version of a spell: the ancient equivalent of a footnote. Twenty-five signs, and you can read the whole alphabet.",
  },
];

export type WordGroup = {
  words: Word[];
  /** Alphabet signs first met in this group (in order of appearance) */
  glyphs: Hieroglyph[];
};

/**
 * Words per group. The first set is short, so part 1 (the door and this set) ends on a win in about five minutes
 * (2026-10-24: 10 of 14 new accounts quit inside the old five-word part 1). Words past the listed sizes are chunked
 * by the last size.
 */
const GROUP_SIZES = [3, 5, 5, 6];

/**
 * Chunk the words into groups and work out which alphabet signs each group
 * introduces, given the signs already known (the ones on the door).
 */
export function buildWordGroups(known: Iterable<string>, lessonGlyphs: Hieroglyph[], sizes: number[] = GROUP_SIZES): WordGroup[] {
  const bySymbol = new Map(lessonGlyphs.map((g) => [g.symbol, g]));
  const seen = new Set(known);
  const groups: WordGroup[] = [];
  for (let i = 0, n = 0; i < WORDS.length; n++) {
    const size = sizes[Math.min(n, sizes.length - 1)];
    const words = WORDS.slice(i, i + size);
    i += size;
    const glyphs: Hieroglyph[] = [];
    for (const w of words) {
      for (const s of w.core) {
        if (seen.has(s)) continue;
        const g = bySymbol.get(s);
        if (!g) continue;
        seen.add(s);
        glyphs.push(g);
      }
    }
    groups.push({ words, glyphs });
  }
  return groups;
}

/** The lesson's sign groups when it opens on the door: the name, then the words. */
export function doorLessonGroups(doorSigns: Hieroglyph[], lessonGlyphs: Hieroglyph[], contextImage: string): { groups: GlyphGroup[]; wordGroups: WordGroup[] } {
  const wordGroups = buildWordGroups(
    doorSigns.map((g) => g.symbol),
    lessonGlyphs,
  );
  const groups: GlyphGroup[] = [{ glyphs: doorSigns, contextImage }, ...wordGroups.map((g) => ({ glyphs: g.glyphs, contextImage }))];
  return { groups, wordGroups };
}

/** Signs the learner has met before a given word: the door, earlier groups, earlier words in this group. */
export function knownBefore(doorSigns: Iterable<string>, wordGroups: WordGroup[], groupIndex: number, wordIndex: number): Set<string> {
  const known = new Set(doorSigns);
  wordGroups.forEach((g, gi) => {
    if (gi >= groupIndex) return;
    g.words.forEach((w) => w.core.forEach((s) => known.add(s)));
  });
  wordGroups[groupIndex]?.words.slice(0, wordIndex).forEach((w) => w.core.forEach((s) => known.add(s)));
  return known;
}
