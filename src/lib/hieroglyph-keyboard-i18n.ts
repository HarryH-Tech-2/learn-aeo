/**
 * The keyboard in Spanish and French (/es/teclado-jeroglificos, /fr/clavier-hieroglyphes): sign names, the
 * "why this sign" notes written for speakers of each language, and the tool's words. English keeps the
 * names and notes in src/lib/hieroglyph-translator.ts; the signs themselves are in src/lib/hieroglyph-keyboard.ts.
 */
import type { HieroglyphMapping } from "@/lib/hieroglyph-translator";
import { KEY_ROWS, type KeyboardLocale } from "@/lib/hieroglyph-keyboard";

type Translated = Exclude<KeyboardLocale, "en">;

/** Sign names by their English name in the translator's table. */
const SIGN_NAMES: Record<Translated, Record<string, string>> = {
  es: {
    Vulture: "Buitre",
    Foot: "Pie",
    "Basket with handle": "Cesta con asa",
    Hand: "Mano",
    Reed: "Junco",
    "Horned viper": "Víbora cornuda",
    "Jar stand": "Soporte de vasija",
    "Reed shelter": "Refugio de cañas",
    Cobra: "Cobra",
    Mouth: "Boca",
    Owl: "Búho",
    "Water ripple": "Ondas de agua",
    "Quail chick": "Polluelo de codorniz",
    Stool: "Taburete",
    "Hill slope": "Ladera",
    "Folded cloth": "Tela doblada",
    "Door bolt": "Cerrojo",
    "Tethering rope": "Cuerda para atar",
    "Bread loaf": "Pan",
    "Basket + Folded cloth": "Cesta + tela doblada",
    Placenta: "Placenta",
  },
  fr: {
    Vulture: "Vautour",
    Foot: "Pied",
    "Basket with handle": "Panier à anse",
    Hand: "Main",
    Reed: "Roseau",
    "Horned viper": "Vipère à cornes",
    "Jar stand": "Support de jarre",
    "Reed shelter": "Abri de roseaux",
    Cobra: "Cobra",
    Mouth: "Bouche",
    Owl: "Chouette",
    "Water ripple": "Ondulation d'eau",
    "Quail chick": "Poussin de caille",
    Stool: "Tabouret",
    "Hill slope": "Pente de colline",
    "Folded cloth": "Étoffe pliée",
    "Door bolt": "Verrou",
    "Tethering rope": "Corde d'attache",
    "Bread loaf": "Pain",
    "Basket + Folded cloth": "Panier + étoffe pliée",
    Placenta: "Placenta",
  },
};

/** Why each key types its sign, written for that language's own letters (Spanish H is silent, French J is soft…). */
const KEY_NOTES: Record<Translated, Record<string, string>> = {
  es: {
    a: "El buitre representa el álef egipcio (ꜣ), una oclusión glotal: es lo más parecido a nuestra a. El egipcio no escribía vocales.",
    b: "El pie representa la b, el mismo sonido en español y en egipcio.",
    c: "La C fuerte (como en casa) es la k egipcia, la cesta con asa. Ante e o i la C suena como s o z: el traductor de nombres lo tiene en cuenta, el teclado no.",
    d: "La mano representa la d, el mismo sonido.",
    e: "El egipcio no escribía vocales. El junco (j/y), una semivocal, se usaba para acercarse a la e y la i.",
    f: "La víbora cornuda representa la f.",
    g: "El soporte de vasija representa la g fuerte, como en gato.",
    h: "El refugio de cañas representa una h aspirada. En español la h es muda, pero en egipcio sí se pronunciaba.",
    i: "El junco (j/y) es una semivocal que se acerca a la i y a la e.",
    j: "La J española, la de jamón, es el sonido gutural que el egipcio escribía ḫ, con la placenta. Es el mismo sonido de la CH escocesa de loch.",
    k: "La cesta con asa representa la k.",
    l: "El egipcio no distinguía la l de la r: las dos se escriben con la boca (r). Es uno de los rasgos más conocidos de la lengua egipcia.",
    m: "El búho representa la m. Es uno de los jeroglíficos más reconocibles.",
    n: "Las ondas de agua representan la n. La Ñ se escribe con el mismo signo.",
    o: "El egipcio no escribía vocales. El polluelo de codorniz (w), una semivocal, se acerca a la o y la u.",
    p: "El taburete representa la p.",
    q: "La ladera representa la q egipcia, una k enfática pronunciada al fondo de la garganta.",
    r: "La boca representa la r, y también la l: el egipcio no las distinguía.",
    s: "La tela doblada representa la s.",
    t: "El pan representa la t. El pan era la base de la comida y de las ofrendas en Egipto.",
    u: "El polluelo de codorniz (w) se acerca a la u y la o.",
    v: "El egipcio no tenía el sonido v. Se usa la f, la víbora cornuda.",
    w: "El polluelo de codorniz representa la w, como en web.",
    x: "La x no existe en egipcio: se escribe con sus dos sonidos, k (cesta) + s (tela doblada).",
    y: "La y se escribe con el junco (j/y), una semivocal egipcia.",
    z: "El cerrojo escribía la z egipcia. En el Reino Medio ya sonaba igual que la s.",
  },
  fr: {
    a: "Le vautour note l'aleph égyptien (ꜣ), un coup de glotte : c'est ce qui se rapproche le plus de notre a. L'égyptien n'écrivait pas les voyelles.",
    b: "Le pied note le b, le même son en français et en égyptien.",
    c: "Le C dur (comme dans cap) est le k égyptien, le panier à anse. Devant e et i, le C se prononce s : le traducteur de prénoms en tient compte, pas le clavier. Le Ç tape l'étoffe pliée (s).",
    d: "La main note le d.",
    e: "L'égyptien n'écrivait pas les voyelles. Le roseau (j/y), une semi-voyelle, servait à approcher le e et le i. É, È et Ê tapent le même signe.",
    f: "La vipère à cornes note le f.",
    g: "Le support de jarre note le g dur, comme dans gare.",
    h: "L'abri de roseaux note un h expiré. Muet en français, il se prononçait bel et bien en égyptien.",
    i: "Le roseau (j/y) est une semi-voyelle qui approche le i et le e.",
    j: "Le J est noté par le cobra (ḏ, un son « dj »). Le j de jour n'existait pas en égyptien : le cobra est le signe le plus proche.",
    k: "Le panier à anse note le k.",
    l: "L'égyptien ne distinguait pas le l du r : les deux s'écrivent avec la bouche (r). C'est l'un des traits les plus connus de la langue égyptienne.",
    m: "La chouette note le m. C'est l'un des hiéroglyphes les plus reconnaissables.",
    n: "L'ondulation d'eau note le n.",
    o: "L'égyptien n'écrivait pas les voyelles. Le poussin de caille (w), une semi-voyelle, approche le o et le son « ou ».",
    p: "Le tabouret note le p.",
    q: "La pente de colline note le q égyptien, un k emphatique prononcé au fond de la gorge.",
    r: "La bouche note le r, et aussi le l, que l'égyptien ne distinguait pas.",
    s: "L'étoffe pliée note le s.",
    t: "Le pain note le t. Le pain était au cœur des repas et des offrandes égyptiennes.",
    u: "Le poussin de caille (w) approche le u et le o.",
    v: "L'égyptien n'avait pas de v. Le son le plus proche est le f, la vipère à cornes.",
    w: "Le poussin de caille note le w, comme dans web.",
    x: "Le x n'existe pas en égyptien : il s'écrit avec ses deux sons, k (panier) + s (étoffe pliée).",
    y: "Le y s'écrit avec le roseau (j/y), une semi-voyelle égyptienne.",
    z: "Le verrou notait le z égyptien. Au Moyen Empire, il se prononçait déjà comme le s.",
  },
};

/** A sign's name and note in the keyboard's language (English is the translator's own text). */
export function localizedSign(sign: HieroglyphMapping, key: string, locale: KeyboardLocale): { signName: string; note: string } {
  if (locale === "en") return { signName: sign.signName, note: sign.note };
  return {
    signName: SIGN_NAMES[locale][sign.signName] ?? sign.signName,
    note: KEY_NOTES[locale][key] ?? sign.note,
  };
}

/** The on-screen layout: AZERTY for French, the usual QWERTY otherwise. Typing reads the letter, so any layout works. */
export function keyRows(locale: KeyboardLocale): string[][] {
  if (locale === "fr")
    return [
      ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"],
      ["w", "x", "c", "v", "b", "n"],
    ];
  return KEY_ROWS;
}

export type KeyboardStrings = {
  sectionLabel: string;
  wallEmpty: string;
  panelEmpty: string;
  /** heading for the sign just typed, e.g. "M is the owl" */
  lastSign: (key: string, signName: string) => string;
  sound: string;
  spoken: (key: string, signName: string, sound: string, count: number) => string;
  space: string;
  del: string;
  deleteLabel: string;
  copy: string;
  copied: string;
  saveImage: string;
  clear: string;
  showLetters: string;
  full: (max: number) => string;
  nudge: (count: number) => string;
  nudgeButton: string;
  translatorBefore: string;
  translatorLink: string;
  translatorAfter: string;
  imageFile: string;
};

export const KEYBOARD_STRINGS: Record<KeyboardLocale, KeyboardStrings> = {
  en: {
    sectionLabel: "Hieroglyphics keyboard",
    wallEmpty: "Press any letter on your keyboard, or tap a key below.",
    panelEmpty:
      "Each key types the sign an Egyptian scribe would use for that sound. The sign's name, sound and story appear here as you type.",
    lastSign: (k, name) => `${k} is the ${name.toLowerCase()}`,
    sound: "Sound",
    spoken: (k, name, sound, n) => `${k}: ${name}, sound ${sound}. ${n} signs typed.`,
    space: "Space",
    del: "Delete",
    deleteLabel: "Delete the last sign",
    copy: "Copy hieroglyphs",
    copied: "Copied",
    saveImage: "Save as image",
    clear: "Clear",
    showLetters: "Show letters under signs",
    full: (max) => `The wall is full at ${max} keys. Clear it to keep typing.`,
    nudge: (n) =>
      `You have typed ${n} signs. Cover the letters: could you read them back? The free first lesson teaches all 25 signs of the alphabet.`,
    nudgeButton: "Start Lesson 1 free",
    translatorBefore: "Writing a name? The",
    translatorLink: "name translator",
    translatorAfter: "spells by sound (it knows SH, CH and soft C) and draws the cartouche around it.",
    imageFile: "hieroglyphs.png",
  },
  es: {
    sectionLabel: "Teclado de jeroglíficos",
    wallEmpty: "Pulsa cualquier letra de tu teclado o toca una tecla de abajo.",
    panelEmpty:
      "Cada tecla escribe el signo que un escriba egipcio usaría para ese sonido. Aquí verás el nombre del signo, su sonido y su historia mientras escribes.",
    lastSign: (k, name) => `Tecla ${k}: ${name.toLowerCase()}`,
    sound: "Sonido",
    spoken: (k, name, sound, n) => `${k}: ${name}, sonido ${sound}. ${n} signos escritos.`,
    space: "Espacio",
    del: "Borrar",
    deleteLabel: "Borrar el último signo",
    copy: "Copiar jeroglíficos",
    copied: "Copiado",
    saveImage: "Guardar como imagen",
    clear: "Vaciar",
    showLetters: "Mostrar las letras bajo los signos",
    full: (max) => `El muro está lleno (${max} teclas). Vacíalo para seguir escribiendo.`,
    nudge: (n) =>
      `Has escrito ${n} signos. Tapa las letras: ¿podrías leerlos? La primera lección es gratis y enseña los 25 signos del alfabeto (en inglés).`,
    nudgeButton: "Empezar la lección 1 gratis",
    translatorBefore: "¿Quieres escribir un nombre? El",
    translatorLink: "traductor de nombres",
    translatorAfter: "escribe por sonidos, no letra a letra, y dibuja el cartucho real alrededor.",
    imageFile: "jeroglificos.png",
  },
  fr: {
    sectionLabel: "Clavier hiéroglyphique",
    wallEmpty: "Appuyez sur une lettre de votre clavier, ou touchez une touche ci-dessous.",
    panelEmpty:
      "Chaque touche tape le signe qu'un scribe égyptien aurait utilisé pour ce son. Le nom du signe, son son et son histoire s'affichent ici au fil de la frappe.",
    lastSign: (k, name) => `Touche ${k} : ${name.toLowerCase()}`,
    sound: "Son",
    spoken: (k, name, sound, n) => `${k} : ${name}, son ${sound}. ${n} signes tapés.`,
    space: "Espace",
    del: "Effacer",
    deleteLabel: "Effacer le dernier signe",
    copy: "Copier les hiéroglyphes",
    copied: "Copié",
    saveImage: "Enregistrer en image",
    clear: "Tout effacer",
    showLetters: "Afficher les lettres sous les signes",
    full: (max) => `Le mur est plein (${max} touches). Videz-le pour continuer.`,
    nudge: (n) =>
      `Vous avez tapé ${n} signes. Cachez les lettres : sauriez-vous les relire ? La première leçon est gratuite et enseigne les 25 signes de l'alphabet (en anglais).`,
    nudgeButton: "Commencer la leçon 1",
    translatorBefore: "Vous écrivez un prénom ? Le",
    translatorLink: "traducteur de prénoms",
    translatorAfter: "écrit d'après les sons, pas lettre par lettre, et dessine le cartouche royal autour.",
    imageFile: "hieroglyphes.png",
  },
};
