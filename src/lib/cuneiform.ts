/**
 * A name in Babylonian cuneiform (2026-10-24, a demand test for a cuneiform course: /write-your-name-in-cuneiform).
 *
 * Cuneiform has no alphabet: its sound signs stand for whole syllables (ba, ri, ak). Babylonian scribes wrote a
 * foreign name the same way, syllable by syllable, so the converter does too:
 *   1. English spelling → the sounds of Akkadian, which has only four vowels (a e i u) and no f, v, j, o or th
 *      (nameToSounds).
 *   2. Sounds → syllables: consonant + vowel where it can (ha, ri), vowel + consonant to close a syllable (ak),
 *      and a helper vowel for a consonant left over (syllabify).
 *   3. Each syllable → its Old Babylonian sign (SIGNS). One sign can have several readings, so a syllable is
 *      sometimes written with a sign named for another (pi with the BI sign, ši with IGI): that is real cuneiform.
 *
 * Every code point was checked against its Unicode name (U+12000 block, "CUNEIFORM SIGN …"); the reading values
 * follow the standard sign lists (Borger, Mesopotamisches Zeichenlexikon). Where a closing VC sign is unusual or
 * missing (uk, is, us…), the converter writes the consonant with a helper vowel instead, as scribes often did.
 */
import { normaliseName } from "@/lib/hieroglyph-translator";

export type CuneiformSign = {
  /** The sign's standard name (Unicode / sign lists), e.g. "BI" */
  name: string;
  glyph: string;
};

const S = (name: string, cp: number): CuneiformSign => ({ name, glyph: String.fromCodePoint(cp) });

// The signs used, by Unicode name.
const A = S("A", 0x12000), E = S("E", 0x1208a), I = S("I", 0x1213f), U = S("U", 0x1230b);
const BA = S("BA", 0x12040), BI = S("BI", 0x12049), BU = S("BU", 0x1204d);
const DA = S("DA", 0x12055), DI = S("DI", 0x12072), DU = S("DU", 0x1207a);
const GA = S("GA", 0x120b5), GI = S("GI", 0x12100), GU = S("GU", 0x12116);
const HA = S("ḪA", 0x12129), HI = S("ḪI", 0x1212d), HU = S("ḪU", 0x12137);
const KA = S("KA", 0x12157), KI = S("KI", 0x121a0), KU = S("KU", 0x121aa);
const LA = S("LA", 0x121b7), LI = S("LI", 0x121f7), LU = S("LU", 0x121fb);
const MA = S("MA", 0x12220), ME = S("ME", 0x12228), MI = S("MI", 0x1222a), MU = S("MU", 0x1222c);
const NA = S("NA", 0x1223e), NE = S("NE", 0x12248), NI = S("NI", 0x1224c), NU = S("NU", 0x12261);
const PA = S("PA", 0x1227a), PI = S("PI", 0x1227f);
const RA = S("RA", 0x1228f), RI = S("RI", 0x12291), RU = S("RU", 0x12292);
const SA = S("SA", 0x12293), SI = S("SI", 0x122db), SU = S("SU", 0x122e2);
const SHA = S("ŠA", 0x122ad), SHE = S("ŠE", 0x122ba), IGI = S("IGI", 0x12146), SHU = S("ŠU", 0x122d7);
const TA = S("TA", 0x122eb), TE = S("TE", 0x122fc), TI = S("TI", 0x122fe), TU = S("TU", 0x12305);
const ZA = S("ZA", 0x1235d), ZI = S("ZI", 0x12363), ZU = S("ZU", 0x1236a);
const IA = S("I.A", 0x12140);
const AB = S("AB", 0x1200a), AD = S("AD", 0x1201c), AK = S("AK", 0x1201d), AL = S("AL", 0x12020), AM = S("AM", 0x12120);
const AN = S("AN", 0x1202d), AR = S("AR", 0x12148), ASH = S("AŠ", 0x12038), AZ = S("AZ", 0x1228d), AH = S("AḪ", 0x12134);
const IB = S("IB", 0x12141), A2 = S("A₂", 0x12009), IG = S("IG", 0x12145), IL = S("IL", 0x1214b), IM = S("IM", 0x1214e);
const IN = S("IN", 0x12154), IR = S("IR", 0x12155), ISH = S("IŠ", 0x12156);
const UB = S("UB", 0x12312), UD = S("UD", 0x12313), UL = S("UL", 0x1230c), UM = S("UM", 0x1231d), UN = S("UN", 0x12326);
const UR = S("UR", 0x12328), USH = S("UŠ", 0x12351), EL = S("EL", 0x12096), EN = S("EN", 0x12097);

/** The marker scribes put before a personal name: DIŠ for a man (ᵐ), MUNUS (SAL) for a woman (ᶠ). */
export const NAME_MARKERS = {
  man: { sign: S("DIŠ", 0x12079), sup: "ᵐ", label: "a man's name" },
  woman: { sign: S("MUNUS", 0x122a9), sup: "ᶠ", label: "a woman's name" },
} as const;
export type NameMarker = keyof typeof NAME_MARKERS | "none";

type Vowel = "a" | "e" | "i" | "u";
const VOWELS = new Set(["a", "e", "i", "u"]);

/** Consonant + vowel. Akkadian e is often written with the i sign (be with BI, re with RI). */
const CV: Record<string, Record<Vowel, CuneiformSign>> = {
  b: { a: BA, e: BI, i: BI, u: BU },
  d: { a: DA, e: DI, i: DI, u: DU },
  g: { a: GA, e: GI, i: GI, u: GU },
  ḫ: { a: HA, e: HI, i: HI, u: HU },
  k: { a: KA, e: KI, i: KI, u: KU },
  l: { a: LA, e: LI, i: LI, u: LU },
  m: { a: MA, e: ME, i: MI, u: MU },
  n: { a: NA, e: NE, i: NI, u: NU },
  // (Old Babylonian writes pi and pu with the BI and BU signs; the PI sign mostly reads wa)
  p: { a: PA, e: BI, i: BI, u: BU },
  r: { a: RA, e: RI, i: RI, u: RU },
  s: { a: SA, e: SI, i: SI, u: SU },
  š: { a: SHA, e: SHE, i: IGI, u: SHU },
  t: { a: TA, e: TE, i: TI, u: TU },
  z: { a: ZA, e: ZI, i: ZI, u: ZU },
  w: { a: PI, e: PI, i: PI, u: PI },
  y: { a: IA, e: I, i: I, u: U },
};
const V: Record<Vowel, CuneiformSign> = { a: A, e: E, i: I, u: U };

/** Vowel + consonant, the signs that close a syllable. Missing pairs fall back to a helper vowel. */
const VC: Record<string, CuneiformSign> = {
  ab: AB, ap: AB, ad: AD, at: AD, ak: AK, ag: AK, al: AL, am: AM, an: AN, ar: AR, aš: ASH, az: AZ, as: AZ, aḫ: AH,
  ib: IB, ip: IB, eb: IB, ep: IB, id: A2, it: A2, ed: A2, et: A2, ig: IG, ik: IG, eg: IG, ek: IG,
  il: IL, el: EL, im: IM, em: IM, in: IN, en: EN, ir: IR, er: IR, iš: ISH, eš: ISH, iḫ: AH, eḫ: AH,
  ub: UB, up: UB, ud: UD, ut: UD, ul: UL, um: UM, un: UN, ur: UR, uš: USH, uḫ: AH,
};

export type Syllable = {
  /** How the sign is read here, e.g. "ri" */
  reading: string;
  sign: CuneiformSign;
};

/**
 * English spelling → Akkadian sounds, one token per sound: a e i u and the consonants b d g ḫ k l m n p r s š t w y z.
 * An approximation by sound: a name spelled the way it is said ("Mikel" for Michael) comes out best.
 */
export function nameToSounds(name: string): string[] {
  let s = normaliseName(name)
    .slice(0, 30)
    .replace(/ch(?=[lr])/g, "k") // Chris, Chloe
    .replace(/tch|sch|sh|ch/g, "š")
    .replace(/ck/g, "k")
    .replace(/c(?=[eiy])/g, "s") // (before the silent e goes: Grace, Alice)
    .replace(/c/g, "k");
  if (s.length > 3 && /[^aeiouy]e$/.test(s)) s = s.slice(0, -1); // a silent final e: Kate, Steve
  s = s
    .replace(/ph/g, "p")
    .replace(/th/g, "t")
    .replace(/gh/g, "")
    .replace(/wh/g, "w")
    .replace(/qu/g, "kw")
    .replace(/q/g, "k")
    .replace(/x/g, "ks")
    // vowel pairs read as one sound
    .replace(/ee|ea|ie|ei/g, "i")
    .replace(/oo|ou|ew/g, "u")
    .replace(/ai|ay|au|aw/g, "a")
    .replace(/ow$/, "u")
    .replace(/ey$/, "i")
    // y: a consonant before a vowel at the start of the name, otherwise the vowel i
    .replace(/^y(?=[aeiou])/, "Y")
    .replace(/y/g, "i")
    .replace(/Y/g, "y")
    // Akkadian has no o, f, v or j: o is written u, f as p, v as b, j as y (Babylonian scribes wrote the Hebrew
    // names that became our J names, like Judah, with ia-)
    .replace(/o/g, "u")
    .replace(/f/g, "p")
    .replace(/v/g, "b")
    .replace(/j/g, "y");
  // h after a vowel and not before one is silent (Sarah, John); otherwise it is ḫ
  s = s.replace(/([aeiu])h(?![aeiu])/g, "$1").replace(/h/g, "ḫ");
  // w not before a vowel (Andrew already became u) is dropped
  s = s.replace(/w(?![aeiu])/g, "");
  // doubled letters are one sound
  s = s.replace(/(.)\1+/gu, "$1");
  return Array.from(s);
}

/** Sounds → syllables, each with its sign. */
export function syllabify(sounds: string[]): Syllable[] {
  const out: Syllable[] = [];
  const nextVowel = (from: number): Vowel | null => {
    for (let j = from; j < sounds.length; j++) if (VOWELS.has(sounds[j])) return sounds[j] as Vowel;
    return null;
  };
  for (let i = 0; i < sounds.length; ) {
    const t = sounds[i];
    if (VOWELS.has(t)) {
      out.push({ reading: t, sign: V[t as Vowel] });
      i++;
      continue;
    }
    if (!CV[t]) {
      i++;
      continue;
    }
    const after = sounds[i + 1];
    if (after && VOWELS.has(after)) {
      const v = after as Vowel;
      if (t === "y" && v !== "a") {
        // ya has its own sign (I.A); yi and ye are written i, and yu i-u
        out.push({ reading: "i", sign: I });
        if (v === "u") out.push({ reading: "u", sign: U });
      } else {
        out.push({ reading: t === "y" ? "ia" : t + v, sign: CV[t][v] });
      }
      i += 2;
      continue;
    }
    // a consonant with no vowel after it: close the syllable before (ak), or give it a helper vowel
    const last = out[out.length - 1];
    const lastVowel = last && VOWELS.has(last.reading.slice(-1)) ? (last.reading.slice(-1) as Vowel) : null;
    const closing = lastVowel ? VC[lastVowel + t] : undefined;
    if (closing) {
      out.push({ reading: lastVowel + t, sign: closing });
    } else if (t !== "y" && t !== "w") {
      const helper = nextVowel(i + 1) ?? lastVowel ?? "a";
      out.push({ reading: t + helper, sign: CV[t][helper] });
    }
    i++;
  }
  return out;
}

export type CuneiformName = {
  syllables: Syllable[];
  /** The marker sign, if one was chosen */
  marker: (typeof NAME_MARKERS)[keyof typeof NAME_MARKERS] | null;
  /** Scholars' transliteration, e.g. "ᵐḫa-ri" */
  transliteration: string;
  /** The signs as Unicode text, marker first */
  text: string;
};

export function cuneiformName(name: string, markerChoice: NameMarker = "none"): CuneiformName {
  const syllables = syllabify(nameToSounds(name));
  const marker = markerChoice === "none" || syllables.length === 0 ? null : NAME_MARKERS[markerChoice];
  return {
    syllables,
    marker,
    transliteration: (marker ? marker.sup : "") + syllables.map((s) => s.reading).join("-"),
    text: (marker ? marker.sign.glyph : "") + syllables.map((s) => s.sign.glyph).join(""),
  };
}
