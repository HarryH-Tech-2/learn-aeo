/**
 * Spanish and French for the name translator (src/lib/hieroglyph-translator.ts): what each sign is called, why a
 * letter gets its sign, and the spelling-by-sound rules for names in those languages. Only signs the translator
 * already uses appear here, so the subset fonts behind the cartouche images never meet a sign they lack.
 */

export type TranslatorLocale = "en" | "es" | "fr";
export type IntlLocale = Exclude<TranslatorLocale, "en">;

/** Sign names by Gardiner code (two-sign pairs such as V31+S29 are named half by half). */
export const SIGN_NAMES: Record<IntlLocale, Record<string, string>> = {
  es: {
    G1: "Buitre",
    M17: "Junco",
    G43: "Polluelo de codorniz",
    D58: "Pie",
    Q3: "Taburete",
    I9: "Víbora cornuda",
    G17: "Búho",
    N35: "Onda de agua",
    D21: "Boca",
    O4: "Cobertizo de juncos",
    Aa1: "Placenta",
    S29: "Tela doblada",
    O34: "Cerrojo",
    V13: "Cuerda para atar",
    N37: "Estanque",
    N29: "Ladera",
    V31: "Cesta con asa",
    W11: "Soporte de vasija",
    X1: "Hogaza de pan",
    D46: "Mano",
    I10: "Cobra",
  },
  fr: {
    G1: "Vautour",
    M17: "Roseau",
    G43: "Poussin de caille",
    D58: "Pied",
    Q3: "Tabouret",
    I9: "Vipère à cornes",
    G17: "Chouette",
    N35: "Filet d'eau",
    D21: "Bouche",
    O4: "Abri de roseaux",
    Aa1: "Placenta",
    S29: "Étoffe pliée",
    O34: "Verrou",
    V13: "Corde d'attache",
    N37: "Bassin",
    N29: "Pente de colline",
    V31: "Panier à anse",
    W11: "Support de jarre",
    X1: "Pain",
    D46: "Main",
    I10: "Cobra",
  },
};

/** Why a letter (or English digraph) gets its sign, when no locale rule wrote a note of its own. */
export const LETTER_NOTES: Record<IntlLocale, Record<string, string>> = {
  es: {
    a: "El buitre representa el álef egipcio (ꜣ), una oclusión glotal y lo más parecido a nuestra «a». El egipcio no escribía vocales.",
    b: "El pie representa la «b»: el mismo sonido en egipcio y en español.",
    c: "La «c» fuerte (como en «casa») suena «k», así que se escribe con la cesta con asa.",
    d: "La mano representa la «d»: el mismo sonido en egipcio.",
    e: "El egipcio no tenía vocales. El junco (j/y), una semivocal, sirve para aproximar la «e» y la «i».",
    f: "La víbora cornuda representa la «f»: el mismo sonido en egipcio.",
    g: "El soporte de vasija representa la «g» fuerte (como en «gato»).",
    h: "El cobertizo de juncos representa la «h» aspirada.",
    i: "El egipcio no tenía vocales. El junco (j/y), una semivocal, sirve para aproximar la «i» y la «e».",
    j: "La cobra representa el sonido egipcio ḏ, parecido a «dy».",
    k: "La cesta con asa representa la «k»: el mismo sonido en egipcio.",
    l: "El egipcio clásico no tenía un signo propio para la «l»: se escribía con la boca (r). Mucho más tarde, el león 𓃭 escribió la «l» en nombres griegos como Cleopatra.",
    m: "El búho representa la «m». Es uno de los jeroglíficos más reconocibles.",
    n: "La onda de agua representa la «n»: el mismo sonido en egipcio.",
    o: "El egipcio no tenía vocales. El polluelo de codorniz (w), una semivocal, aproxima la «o» y la «u».",
    p: "El taburete representa la «p»: el mismo sonido en egipcio.",
    q: "La ladera representa la «q», una «k» enfática del egipcio.",
    r: "La boca representa la «r» (y también la «l»: el egipcio no las distinguía).",
    s: "La tela doblada representa la «s»: el mismo sonido en egipcio.",
    t: "La hogaza de pan representa la «t». El pan era la base de la vida y de las ofrendas en Egipto.",
    u: "El egipcio no tenía vocales. El polluelo de codorniz (w), una semivocal, aproxima la «u» y la «o».",
    v: "El egipcio no tenía «v». El sonido más cercano es la «f», la víbora cornuda.",
    w: "El polluelo de codorniz representa la «w»: el mismo sonido en egipcio.",
    x: "La «x» no existía en egipcio: se descompone en sus sonidos, «k» (cesta) + «s» (tela doblada).",
    y: "La «y» se escribe con el junco (j/y), una semivocal del egipcio.",
    z: "En el Reino Medio la «z» y la «s» egipcias ya sonaban igual, así que la tela doblada sirve para las dos.",
    sh: "El estanque representa el sonido «sh», que en egipcio era una sola consonante.",
    th: "El egipcio no tenía el sonido «th». Se simplifica a «t», la hogaza de pan.",
    ph: "«Ph» suena «f», así que se escribe con la víbora cornuda.",
  },
  fr: {
    a: "Le vautour note l'aleph égyptien (ꜣ), un coup de glotte, ce qui se rapproche le plus de notre « a ». L'égyptien n'écrivait pas les voyelles.",
    b: "Le pied note le « b » : le même son en égyptien et en français.",
    c: "Le « c » dur (comme dans « carte ») se prononce « k » : on l'écrit avec le panier à anse.",
    d: "La main note le « d » : le même son en égyptien.",
    e: "L'égyptien n'avait pas de voyelles. Le roseau (j/y), une semi-voyelle, sert à rendre le « e » et le « i ».",
    f: "La vipère à cornes note le « f » : le même son en égyptien.",
    g: "Le support de jarre note le « g » dur (comme dans « gare »).",
    h: "L'abri de roseaux note le « h » aspiré.",
    i: "L'égyptien n'avait pas de voyelles. Le roseau (j/y), une semi-voyelle, sert à rendre le « i » et le « e ».",
    j: "La cobra note le son égyptien ḏ, proche de « dj ».",
    k: "Le panier à anse note le « k » : le même son en égyptien.",
    l: "L'égyptien classique n'avait pas de signe propre pour le « l » : on l'écrivait avec la bouche (r). Bien plus tard, le lion 𓃭 a noté le « l » dans des noms grecs comme Cléopâtre.",
    m: "La chouette note le « m ». C'est l'un des hiéroglyphes les plus connus.",
    n: "Le filet d'eau note le « n » : le même son en égyptien.",
    o: "L'égyptien n'avait pas de voyelles. Le poussin de caille (w), une semi-voyelle, rend le « o » et le « ou ».",
    p: "Le tabouret note le « p » : le même son en égyptien.",
    q: "La pente de colline note le « q », un « k » emphatique en égyptien.",
    r: "La bouche note le « r » (et aussi le « l » : l'égyptien ne les distinguait pas).",
    s: "L'étoffe pliée note le « s » : le même son en égyptien.",
    t: "Le pain note le « t ». Le pain était au cœur de la vie et des offrandes égyptiennes.",
    u: "L'égyptien n'avait pas de voyelles. Le poussin de caille (w), une semi-voyelle, rend le « u » et le « o ».",
    v: "L'égyptien n'avait pas de « v ». Le son le plus proche est le « f », la vipère à cornes.",
    w: "Le poussin de caille note le « w » : le même son en égyptien.",
    x: "Le « x » n'existait pas en égyptien : on le décompose en « k » (panier) + « s » (étoffe pliée).",
    y: "Le « y » s'écrit avec le roseau (j/y), une semi-voyelle de l'égyptien.",
    z: "Le verrou notait le « z » égyptien. Au Moyen Empire, il se prononçait déjà comme le « s ».",
    sh: "Le bassin note le son « ch » (comme dans « chat »), une seule consonne en égyptien.",
    th: "L'égyptien n'avait pas de « th » : on le simplifie en « t », le pain.",
    ph: "« Ph » se prononce « f » : on l'écrit avec la vipère à cornes.",
  },
};

/**
 * One spelling rule: at position i of the cleaned name, `match` returns how many letters it uses (0 = no match).
 * `sign` is the letter whose usual sign it writes (a key of the translator's letter table, or "sh", or "ny");
 * null means the letters are silent and write nothing.
 */
export type SpellingRule = {
  /** the letters shown in the breakdown, e.g. "qu" */
  label: (s: string, i: number, n: number) => string;
  match: (s: string, i: number) => number;
  sign: string | null;
  note: string;
};

const VOWELS = "aeiouyéèêëàâîïôûù";
const isVowel = (c: string | undefined) => !!c && VOWELS.includes(c);
const front = (c: string | undefined) => c === "e" || c === "i" || c === "y" || c === "é" || c === "è" || c === "ê" || c === "ë" || c === "î" || c === "ï";
const lit = (str: string) => (s: string, i: number) => (s.startsWith(str, i) ? str.length : 0);
const plain = (s: string, i: number, n: number) => s.slice(i, i + n);

/** Spanish: names spelled the way they sound in Spanish. */
export const SPANISH_RULES: SpellingRule[] = [
  { label: plain, match: lit("ch"), sign: "sh", note: "La «ch» española (como en «Chema») no existía en egipcio. El sonido más cercano es «sh», el estanque." },
  { label: plain, match: lit("ll"), sign: "y", note: "La «ll» suena «y» en casi todo el mundo hispanohablante, así que se escribe con el junco (j/y)." },
  { label: plain, match: lit("ñ"), sign: "ny", note: "La «ñ» suena «ny»: se escribe con la onda de agua (n) y el junco (j/y)." },
  { label: plain, match: (s, i) => (s.startsWith("qu", i) && front(s[i + 2]) ? 2 : 0), sign: "k", note: "«Qu» antes de «e» o «i» suena «k»: la «u» no se pronuncia, así que basta la cesta con asa." },
  { label: plain, match: (s, i) => (s.startsWith("gu", i) && front(s[i + 2]) ? 2 : 0), sign: "g", note: "«Gu» antes de «e» o «i» suena «g» fuerte: la «u» no se pronuncia." },
  { label: plain, match: lit("j"), sign: "kh", note: "La «j» española es un sonido gutural, como el de «loch». El egipcio tenía uno muy parecido, ḫ, que se escribe con la placenta." },
  { label: plain, match: (s, i) => (s[i] === "g" && front(s[i + 1]) ? 1 : 0), sign: "kh", note: "La «g» antes de «e» o «i» suena como la «j» española, un sonido gutural: es la ḫ egipcia, la placenta." },
  { label: plain, match: (s, i) => (s[i] === "c" && front(s[i + 1]) ? 1 : 0), sign: "s", note: "La «c» antes de «e» o «i» suena «s» (o «z»): el egipcio no distinguía esos sonidos, así que se usa la tela doblada." },
  { label: plain, match: lit("z"), sign: "s", note: "La «z» suena «s» (o como la «c» suave): el egipcio no los distinguía, así que se usa la tela doblada." },
  { label: plain, match: lit("h"), sign: null, note: "" },
  { label: plain, match: lit("v"), sign: "b", note: "En español la «v» suena igual que la «b», así que se escribe con el pie." },
];

/** French: names spelled the way they sound in French. Silent endings are handled before these run. */
export const FRENCH_RULES: SpellingRule[] = [
  { label: plain, match: lit("eau"), sign: "o", note: "« Eau » se prononce « o » : on l'écrit avec le poussin de caille (w)." },
  { label: plain, match: (s, i) => (s.startsWith("ch", i) && (s[i + 2] === "r" || s[i + 2] === "l") ? 2 : 0), sign: "k", note: "Devant « r » ou « l » (Christophe, Chloé), « ch » se prononce « k » : le panier à anse." },
  { label: plain, match: lit("ch"), sign: "sh", note: "Le « ch » français (comme dans « chat ») était une seule consonne en égyptien : le bassin, š." },
  { label: plain, match: lit("cqu"), sign: "k", note: "« Cqu » se prononce simplement « k » (Jacques) : le panier à anse." },
  { label: plain, match: lit("qu"), sign: "k", note: "« Qu » se prononce « k » : le « u » est muet, le panier à anse suffit." },
  { label: plain, match: lit("ck"), sign: "k", note: "« Ck » se prononce « k » : un seul panier à anse." },
  { label: plain, match: (s, i) => (s.startsWith("gu", i) && front(s[i + 2]) ? 2 : 0), sign: "g", note: "« Gu » devant « e » ou « i » se prononce « g » dur : le « u » est muet." },
  { label: plain, match: lit("gn"), sign: "ny", note: "« Gn » se prononce « ny » (Agnès) : le filet d'eau (n) suivi du roseau (j/y)." },
  // -ill- after a vowel says "y" (Guillaume, Mireille, Maillard); after a consonant it keeps its l (Camille, Gilles)
  { label: plain, match: (s, i) => (s.startsWith("ill", i) && isVowel(s[i - 1]) ? 3 : 0), sign: "y", note: "Après une voyelle, « ill » se prononce « y » (Guillaume, Mireille) : le roseau (j/y)." },
  { label: plain, match: lit("au"), sign: "o", note: "« Au » se prononce « o » : on l'écrit avec le poussin de caille (w)." },
  { label: plain, match: lit("ou"), sign: "o", note: "« Ou » se prononce comme un « w » : un seul poussin de caille (w)." },
  { label: plain, match: lit("oi"), sign: "wa", note: "« Oi » se prononce « oua » : le poussin de caille (w) puis le vautour (ꜣ)." },
  { label: plain, match: lit("ai"), sign: "e", note: "« Ai » se prononce « è » : un seul roseau (j/y)." },
  { label: plain, match: lit("ei"), sign: "e", note: "« Ei » se prononce « è » : un seul roseau (j/y)." },
  { label: plain, match: lit("j"), sign: "j", note: "Le « j » français (« zh ») n'existait pas en égyptien. Le signe le plus proche est la cobra, ḏ, un « dj »." },
  { label: plain, match: (s, i) => (s[i] === "g" && front(s[i + 1]) ? 1 : 0), sign: "j", note: "Le « g » devant « e » ou « i » se prononce comme le « j » (« zh »). Le signe le plus proche est la cobra, ḏ." },
  { label: plain, match: lit("h"), sign: null, note: "" },
];

/**
 * French names drop their last letters in speech: a final plain -e (Joséphine, Guillaume), and a final -s, -t, -x
 * or -d (Louis, Benoît, Margaux, Arnaud). A final -s after an accented vowel is said (Inès, Agnès), and so is an
 * -é (Chloé). Returns the name without its silent ending; never shortens it below two letters.
 */
export function dropFrenchSilentEnding(s: string): string {
  let out = s;
  if (out.length > 2 && /[stxd]$/.test(out) && !(out.endsWith("s") && /[éèêë]$/.test(out.slice(-2, -1)))) out = out.slice(0, -1);
  if (out.length > 2 && out.endsWith("e")) out = out.slice(0, -1);
  return out;
}
