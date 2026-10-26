/**
 * The 25 alphabet signs in Spanish and French, for the translated chart pages (src/lib/i18n.ts).
 *
 * `equivalent` is the closest letter in that language, not a copy of the English column: Spanish has no "sh"
 * and a silent h, French has no breathed h and no "j as in judge", so those rows say so. Its first letter
 * groups sounds for the self-test (soundFamily in src/lib/sign-quiz.ts), so similar sounds start alike.
 * Gardiner codes, transliteration and the Egyptian example words stay as they are; only the meanings change.
 */
import type { Locale } from "@/lib/i18n";

export type LocalSign = {
  /** Closest letter(s) in this language. */
  equivalent: string;
  /** How to say it, for the "Sound" column. */
  say: string;
  /** What the picture shows. */
  name: string;
  /** What the sign writes, after the name. */
  desc: string;
  origin: string;
  /** The example word: glyphs · transliteration (meaning in this language). */
  example: string;
};

type Table = Record<string, LocalSign>;

const ES: Table = {
  "𓄿": { equivalent: "a", say: "a", name: "Alimoche (buitre egipcio)", desc: "el golpe de glotis", origin: "Un alimoche de pie, el ave grande más común del valle del Nilo; su nombre empezaba por este sonido.", example: "𓄿𓊪𓂧𓅬 · ꜣpd (ave)" },
  "𓇋": { equivalent: "i, e", say: "i", name: "Hoja de junco", desc: "una consonante débil que se lee «i»", origin: "Un junco en flor, la planta que crecía por todas partes junto al río.", example: "𓇋𓏏𓆑𓀀 · ꞽt (padre)" },
  "𓇌": { equivalent: "y (i)", say: "y / i", name: "Dos hojas de junco", desc: "el sonido y", origin: "Dos juncos juntos: el signo del junco duplicado.", example: "𓎡𓇌 · ky (otro)" },
  "𓂝": { equivalent: "a (gutural)", say: "a gutural", name: "Antebrazo", desc: "un sonido de garganta que no existe en español (como la ʿayn árabe)", origin: "Un antebrazo con la palma hacia arriba, visto de lado: uno de los muchos signos de brazo, cada uno con su propio valor.", example: "𓂝𓄿 · ꜥꜣ (grande)" },
  "𓅱": { equivalent: "u, o, w", say: "u / w", name: "Polluelo de codorniz", desc: "w, y también «u»", origin: "Un polluelo de codorniz; las codornices migratorias llegaban a Egipto cada otoño en bandadas enormes.", example: "𓅱𓂝𓃀 · wꜥb (puro; sacerdote)" },
  "𓃀": { equivalent: "b, v", say: "b como en «boca»", name: "Pie y pierna", desc: "b", origin: "La parte baja de una pierna humana con el pie, de perfil.", example: "𓃀𓄿𓎡𓀀 · bꜣk (sirviente)" },
  "𓊪": { equivalent: "p", say: "p como en «pan»", name: "Estera de juncos o taburete", desc: "p", origin: "Una estera de juncos trenzados (o un taburete bajo) vista desde arriba.", example: "𓊪𓏏 · pt (cielo)" },
  "𓆑": { equivalent: "f", say: "f como en «fuego»", name: "Víbora cornuda", desc: "f", origin: "La víbora cornuda del desierto, con sus dos cuernecillos.", example: "𓉐𓆑 · pr.f (su casa)" },
  "𓅓": { equivalent: "m", say: "m como en «madre»", name: "Búho", desc: "m", origin: "Un búho, el único signo de ave que se dibuja con la cara mirando de frente.", example: "𓅓𓄿𓂝𓏏 · mꜣꜥt (Maat: verdad, orden)" },
  "𓈖": { equivalent: "n", say: "n como en «nombre»", name: "Onda de agua", desc: "n", origin: "Una onda en zigzag sobre la superficie del agua.", example: "𓈖𓆓𓋴 · nḏs (pequeño; hombre común)" },
  "𓂋": { equivalent: "r, l", say: "r suave, como en «pero»", name: "Boca", desc: "r", origin: "Una boca humana vista de frente.", example: "𓂋𓈖 · rn (nombre)" },
  "𓉔": { equivalent: "h (aspirada)", say: "h aspirada, como la h inglesa de «hat»", name: "Refugio de juncos", desc: "h (que sí se pronuncia, a diferencia de la h española)", origin: "La planta de un refugio de juncos o de un patio cercado.", example: "𓉔𓄿𓇋𓂻 · hꜣꞽ (bajar)" },
  "𓎛": { equivalent: "h (fuerte)", say: "h soplada desde la garganta", name: "Mecha trenzada", desc: "una h enfática", origin: "Una mecha de lino trenzada, como la de una lámpara de aceite.", example: "𓎛𓏏𓊪 · ḥtp (ofrenda, paz)" },
  "𓐍": { equivalent: "j (jamón)", say: "j como en «jamón»", name: "Placenta o criba", desc: "el sonido de la jota", origin: "Un objeto redondo con la superficie rayada; los especialistas aún discuten si es una placenta o una criba.", example: "𓐍𓏏 · ḫt (cosa; madera)" },
  "𓄡": { equivalent: "j (suave)", say: "j más suave, más adelante en la boca", name: "Vientre de animal con ubres", desc: "una jota más suave", origin: "El vientre de un animal con sus ubres y su cola.", example: "𓄡𓂋𓂧𓀔 · ẖrd (niño)" },
  "𓋴": { equivalent: "s", say: "s como en «sol»", name: "Tela doblada", desc: "s", origin: "Una pieza de lino doblada.", example: "𓋴𓈙𓀀 · sš (escriba)" },
  "𓊃": { equivalent: "z, s", say: "s sonora, como la z inglesa de «zoo»", name: "Cerrojo", desc: "z, una antigua s", origin: "El cerrojo horizontal de una puerta.", example: "𓊃𓄿 · zꜣ (hijo)" },
  "𓈙": { equivalent: "sh", say: "sh, como en inglés «ship» (no existe en español)", name: "Estanque", desc: "sh", origin: "Un estanque rectangular de jardín visto desde arriba.", example: "𓈙𓂝𓈒 · šꜥ (arena)" },
  "𓈎": { equivalent: "q, c (dura)", say: "k pronunciada más atrás, en la garganta", name: "Ladera de colina", desc: "q", origin: "La ladera de una colina o una orilla de arena.", example: "𓈎𓂧𓀨 · qd (construir)" },
  "𓎡": { equivalent: "k", say: "k como en «kilo»", name: "Cesta con asa", desc: "k", origin: "Una cesta de mimbre con asa, vista de lado.", example: "𓎡𓏏 · kt (otra)" },
  "𓎼": { equivalent: "g (gato)", say: "g como en «gato»", name: "Soporte de jarra", desc: "g", origin: "Un aro que sostenía de pie una jarra de fondo redondo.", example: "𓎼𓅓 · gm (encontrar)" },
  "𓏏": { equivalent: "t", say: "t como en «taza»", name: "Pan", desc: "t", origin: "Un pequeño pan redondo.", example: "𓋴𓈖𓏏𓁐 · snt (hermana)" },
  "𓍿": { equivalent: "ch", say: "ch como en «chico»", name: "Cuerda para atar animales", desc: "ch (tj)", origin: "Una cuerda para trabar o atar animales.", example: "𓍿𓄿𓇋𓀀 · ṯꜣꞽ (hombre, varón)" },
  "𓂧": { equivalent: "d", say: "d como en «dedo»", name: "Mano", desc: "d", origin: "Una mano abierta vista de lado.", example: "𓂧𓊪𓏏𓊛 · dpt (barco)" },
  "𓆓": { equivalent: "dy", say: "dy, como la y enfática de «¡yo!» o la j inglesa de «jeans»", name: "Cobra", desc: "dy", origin: "Una cobra en reposo, vista de lado.", example: "𓆓𓂧 · ḏd (decir)" },
};

const FR: Table = {
  "𓄿": { equivalent: "a", say: "a", name: "Vautour percnoptère", desc: "le coup de glotte", origin: "Un vautour percnoptère debout, le plus courant des grands oiseaux de la vallée du Nil ; son nom commençait par ce son.", example: "𓄿𓊪𓂧𓅬 · ꜣpd (oiseau)" },
  "𓇋": { equivalent: "i, é", say: "i", name: "Feuille de roseau", desc: "une consonne faible, lue « i »", origin: "Un roseau en fleur, la plante qui poussait partout le long du fleuve.", example: "𓇋𓏏𓆑𓀀 · ꞽt (père)" },
  "𓇌": { equivalent: "y (i)", say: "y / i", name: "Deux feuilles de roseau", desc: "le son y", origin: "Deux roseaux côte à côte : le signe du roseau redoublé.", example: "𓎡𓇌 · ky (autre)" },
  "𓂝": { equivalent: "a (guttural)", say: "a guttural", name: "Avant-bras", desc: "un son de gorge qui n’existe pas en français (comme le ʿayn arabe)", origin: "Un avant-bras paume vers le haut, vu de profil : l’un des nombreux signes de bras, chacun avec sa propre valeur.", example: "𓂝𓄿 · ꜥꜣ (grand)" },
  "𓅱": { equivalent: "ou, w, o", say: "ou / w", name: "Poussin de caille", desc: "w, et aussi « ou »", origin: "Un poussin de caille ; les cailles migratrices arrivaient en Égypte chaque automne par immenses vols.", example: "𓅱𓂝𓃀 · wꜥb (pur ; prêtre)" },
  "𓃀": { equivalent: "b", say: "b comme dans « bateau »", name: "Pied et jambe", desc: "b", origin: "Le bas d’une jambe humaine avec le pied, de profil.", example: "𓃀𓄿𓎡𓀀 · bꜣk (serviteur)" },
  "𓊪": { equivalent: "p", say: "p comme dans « pain »", name: "Natte de roseau ou tabouret", desc: "p", origin: "Une natte de roseaux tressés (ou un tabouret bas) vue de dessus.", example: "𓊪𓏏 · pt (ciel)" },
  "𓆑": { equivalent: "f, v", say: "f comme dans « feu »", name: "Vipère à cornes", desc: "f", origin: "La vipère à cornes du désert, avec ses deux petites cornes.", example: "𓉐𓆑 · pr.f (sa maison)" },
  "𓅓": { equivalent: "m", say: "m comme dans « mère »", name: "Chouette", desc: "m", origin: "Une chouette, le seul oiseau dessiné la tête tournée vers le lecteur.", example: "𓅓𓄿𓂝𓏏 · mꜣꜥt (Maât : vérité, ordre)" },
  "𓈖": { equivalent: "n", say: "n comme dans « nom »", name: "Ondulation de l’eau", desc: "n", origin: "Une ondulation en zigzag à la surface de l’eau.", example: "𓈖𓆓𓋴 · nḏs (petit ; homme du peuple)" },
  "𓂋": { equivalent: "r, l", say: "r légèrement roulé", name: "Bouche", desc: "r", origin: "Une bouche humaine vue de face.", example: "𓂋𓈖 · rn (nom)" },
  "𓉔": { equivalent: "h (expiré)", say: "h soufflé, comme le h anglais de « hat »", name: "Abri de roseaux", desc: "un h qui se prononce, contrairement au h français", origin: "Le plan d’un abri de roseaux ou d’une cour fermée.", example: "𓉔𓄿𓇋𓂻 · hꜣꞽ (descendre)" },
  "𓎛": { equivalent: "h (fort)", say: "h soufflé du fond de la gorge", name: "Mèche tressée", desc: "un h emphatique", origin: "Une mèche de lin tressée, comme celle d’une lampe à huile.", example: "𓎛𓏏𓊪 · ḥtp (offrande, paix)" },
  "𓐍": { equivalent: "kh", say: "kh comme le « ch » allemand de « Bach »", name: "Placenta ou tamis", desc: "kh", origin: "Un objet rond à la surface hachurée ; les spécialistes se demandent encore s’il s’agit d’un placenta ou d’un tamis.", example: "𓐍𓏏 · ḫt (chose ; bois)" },
  "𓄡": { equivalent: "kh (doux)", say: "kh plus doux, plus en avant dans la bouche", name: "Ventre d’animal avec mamelles", desc: "un kh plus doux", origin: "Le ventre d’un animal avec ses mamelles et sa queue.", example: "𓄡𓂋𓂧𓀔 · ẖrd (enfant)" },
  "𓋴": { equivalent: "s", say: "s comme dans « soleil »", name: "Étoffe pliée", desc: "s", origin: "Une pièce de lin pliée.", example: "𓋴𓈙𓀀 · sš (scribe)" },
  "𓊃": { equivalent: "z, s", say: "z comme dans « zéro »", name: "Verrou", desc: "z, un ancien s", origin: "Le verrou horizontal d’une porte.", example: "𓊃𓄿 · zꜣ (fils)" },
  "𓈙": { equivalent: "ch", say: "ch comme dans « chat »", name: "Bassin", desc: "ch", origin: "Un bassin de jardin rectangulaire vu de dessus.", example: "𓈙𓂝𓈒 · šꜥ (sable)" },
  "𓈎": { equivalent: "q, k", say: "k prononcé au fond de la gorge", name: "Pente de colline", desc: "q", origin: "La pente d’une colline ou une berge de sable.", example: "𓈎𓂧𓀨 · qd (construire)" },
  "𓎡": { equivalent: "k, c (dur)", say: "k comme dans « kilo »", name: "Corbeille à anse", desc: "k", origin: "Une corbeille en osier munie d’une anse, vue de profil.", example: "𓎡𓏏 · kt (autre, au féminin)" },
  "𓎼": { equivalent: "g (dur)", say: "g comme dans « gare »", name: "Support de jarre", desc: "g", origin: "Un anneau qui maintenait debout une jarre à fond rond.", example: "𓎼𓅓 · gm (trouver)" },
  "𓏏": { equivalent: "t", say: "t comme dans « table »", name: "Pain", desc: "t", origin: "Un petit pain rond.", example: "𓋴𓈖𓏏𓁐 · snt (sœur)" },
  "𓍿": { equivalent: "tch", say: "tch comme dans « tchèque »", name: "Corde d’entrave", desc: "tch", origin: "Une corde servant à entraver ou attacher les animaux.", example: "𓍿𓄿𓇋𓀀 · ṯꜣꞽ (homme, mâle)" },
  "𓂧": { equivalent: "d", say: "d comme dans « dent »", name: "Main", desc: "d", origin: "Une main ouverte vue de profil.", example: "𓂧𓊪𓏏𓊛 · dpt (bateau)" },
  "𓆓": { equivalent: "dj", say: "dj comme dans « djinn »", name: "Cobra", desc: "dj", origin: "Un cobra au repos, vu de profil.", example: "𓆓𓂧 · ḏd (dire)" },
};

export const ALPHABET_I18N: Record<Exclude<Locale, "en">, Table> = { es: ES, fr: FR };

/** The chart's own words in each language. */
export const TABLE_LABELS: Record<Locale, { caption: (full: boolean) => string; sign: string; sound: string; equivalent: string; shows: string; example: string; say: string; quote: [string, string]; more: string; moreLink: string }> = {
  en: {
    caption: (full) => `The 25 uniliteral hieroglyphs (the hieroglyphic alphabet): sign, Gardiner code, transliteration, closest English sound, what the sign depicts${full ? ", and an example word" : ""}.`,
    sign: "Sign",
    sound: "Sound",
    equivalent: "English",
    shows: "What it shows",
    example: "Example",
    say: "say",
    quote: ["“", "”"],
    more: "Full chart with origins and example words:",
    moreLink: "the hieroglyphic alphabet",
  },
  es: {
    caption: (full) => `Los 25 jeroglíficos uniliterales (el alfabeto jeroglífico): signo, código de Gardiner, transliteración, sonido más parecido en español, qué representa el signo${full ? " y una palabra de ejemplo" : ""}.`,
    sign: "Signo",
    sound: "Sonido",
    equivalent: "Español",
    shows: "Qué representa",
    example: "Ejemplo",
    say: "se dice",
    quote: ["«", "»"],
    more: "Tabla completa con origen y palabras de ejemplo:",
    moreLink: "el alfabeto jeroglífico",
  },
  fr: {
    caption: (full) => `Les 25 hiéroglyphes unilitères (l’alphabet hiéroglyphique) : signe, code de Gardiner, translittération, son le plus proche en français, ce que représente le signe${full ? " et un mot d’exemple" : ""}.`,
    sign: "Signe",
    sound: "Son",
    equivalent: "Français",
    shows: "Ce qu’il représente",
    example: "Exemple",
    say: "se dit",
    quote: ["« ", " »"],
    more: "Tableau complet avec origines et mots d’exemple :",
    moreLink: "l’alphabet hiéroglyphique",
  },
};
