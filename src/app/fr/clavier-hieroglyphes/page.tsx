import type { Metadata } from "next";
import Link from "next/link";
import { OG_LOCALE, SITE, TOOL_PATHS, toolAlternates, toolUrl } from "@/lib/i18n";
import LocalizedKeyboardPage, { type KeyboardPageCopy } from "@/app/hieroglyphics-keyboard/LocalizedKeyboardPage";

const URL = toolUrl("keyboard", "fr");

export const metadata: Metadata = {
  title: "Clavier hiéroglyphes : écrire en égyptien en ligne",
  description:
    "Clavier hiéroglyphique gratuit : tapez une lettre et voyez le hiéroglyphe égyptien de ce son, avec son nom et son sens. Copier-coller ou image, sans inscription.",
  alternates: toolAlternates("keyboard", "fr"),
  openGraph: {
    title: "Clavier hiéroglyphique : tapez en égyptien ancien",
    description:
      "Une touche, un hiéroglyphe. Un clavier égyptien en ligne et gratuit, avec le nom, le son et l'histoire de chaque signe. À copier-coller ou à enregistrer en image.",
    url: URL,
    type: "website",
    locale: OG_LOCALE.fr,
    alternateLocale: [OG_LOCALE.en, OG_LOCALE.es],
    images: [`${SITE}/og-homepage.jpg`],
  },
};

const g = (s: string) => (
  <span className="hieroglyph-font" lang="egy">
    {s}
  </span>
);
const strong = "text-sand-200 font-medium";
const para = "font-body text-sand-300 font-light leading-relaxed";
const inline = "text-gold-400 hover:text-gold-300 underline underline-offset-2";

const FAQ = [
  {
    q: "Existe-t-il un clavier pour écrire en hiéroglyphes ?",
    a: "Oui. Le clavier de cette page tape des hiéroglyphes égyptiens depuis un clavier ordinaire, AZERTY compris : appuyez sur une lettre et le signe de ce son apparaît ; sur mobile, touchez les touches à l'écran. Les Égyptiens n'avaient pas d'alphabet fixe : les scribes choisissaient parmi quelque 700 signes courants, et ce clavier utilise les signes à un seul son qui servaient à écrire les noms étrangers.",
  },
  {
    q: "Peut-on copier-coller des hiéroglyphes ?",
    a: "Oui. Les hiéroglyphes égyptiens font partie d'Unicode depuis 2009 (le bloc U+13000 à U+1342F), donc ils se copient et se collent comme n'importe quel texte. Cliquez sur « Copier les hiéroglyphes » et collez-les dans un message, un document ou une publication. S'ils s'affichent en petits carrés vides, l'appareil n'a pas de police de hiéroglyphes : enregistrez-les en image, ou installez la police gratuite Noto Sans Egyptian Hieroglyphs.",
  },
  {
    q: "Pourquoi E, I et Y donnent-ils le même hiéroglyphe ?",
    a: "Parce que l'écriture égyptienne ne notait que les consonnes : il n'existe pas de signe pour le e. Le roseau 𓇋 notait un son faible proche du y, et c'est lui que les scribes employaient quand un nom étranger demandait un i ou un e. De la même façon, O, U et W partagent le poussin de caille 𓅱, et le A est le vautour 𓄿. Les lettres accentuées (é, è, à, ê…) tapent le signe de leur voyelle.",
  },
  {
    q: "Pourquoi certaines lettres partagent-elles un signe, comme L et R ?",
    a: "Les touches suivent les sons, pas l'orthographe. L'égyptien classique n'avait pas de l distinct et l'écrivait avec la bouche 𓂋 (r). C et K sont le même son, noté par le panier 𓎡 ; F et V partagent la vipère à cornes 𓆑 ; S, Z et Ç partagent l'étoffe pliée 𓋴. Le X n'a pas de signe propre : il en tape deux, 𓎡𓋴 (k + s).",
  },
  {
    q: "Ce clavier traduit-il le français en égyptien ?",
    a: "Non. Il écrit les lettres avec des signes égyptiens de son, comme les scribes écrivaient les noms étrangers, mais il ne traduit pas le sens. Les vrais mots égyptiens mêlaient des signes à un, deux et trois sons et des signes muets appelés déterminatifs : le mot « maison » s'écrit 𓉐, pas avec les lettres m-a-i-s-o-n.",
  },
  {
    q: "Comment écrire des hiéroglyphes dans Word, Google Docs ou sur mobile ?",
    a: "Le plus simple est de les taper ici, de les copier puis de les coller. Pour qu'ils s'affichent, il faut une police de hiéroglyphes : Windows inclut Segoe UI Historic, et Noto Sans Egyptian Hieroglyphs est gratuite pour Word, Google Docs, Mac et Android. Les égyptologues qui composent des inscriptions entières utilisent JSesh, un éditeur hiéroglyphique gratuit.",
  },
  {
    q: "Combien de temps faut-il pour apprendre l'alphabet hiéroglyphique ?",
    a: "Environ une demi-heure. L'« alphabet » compte 25 signes à un seul son, et la plupart des gens les retiennent en une séance quand chaque signe est présenté comme une image associée à un son : la chouette est le m, l'ondulation d'eau le n, la bouche le r. L'alphabet hiéroglyphique de ce site les donne tous les 25, avec un vrai mot égyptien pour chacun.",
  },
];

const copy: KeyboardPageCopy = {
  home: "Accueil",
  breadcrumb: "Clavier hiéroglyphique",
  h1: "Clavier hiéroglyphique égyptien",
  intro: "Écrivez en hiéroglyphes égyptiens. Appuyez sur une touche et voyez le signe qu'un scribe aurait utilisé pour ce son.",
  quickAnswerLabel: "En bref",
  quickAnswer: (
    <>
      Un <strong className="text-sand-100 font-medium">clavier hiéroglyphique</strong> transforme chaque lettre tapée en
      hiéroglyphe égyptien du même son : le M est la chouette {g("𓅓")}, le N l&apos;ondulation d&apos;eau {g("𓈖")}, le R
      la bouche {g("𓂋")}. Il utilise les signes à un seul son, ce qu&apos;on appelle l&apos;alphabet hiéroglyphique, avec
      lesquels les scribes écrivaient les noms étrangers. L&apos;égyptien n&apos;écrivant pas les voyelles, A, E/I et O/U
      empruntent le vautour, le roseau et le poussin de caille. Les signes sont du texte Unicode : ils se copient et se
      collent.
    </>
  ),
  chartHeading: "Quel hiéroglyphe tape chaque touche ?",
  chartIntro:
    "Les 26 lettres, le signe que tape chacune et pourquoi. Plusieurs lettres partagent un signe, car le clavier suit les sons et l'égyptien avait moins de sons que le français n'a de lettres. Le clavier à l'écran est en AZERTY ; un clavier physique QWERTZ ou QWERTY fonctionne aussi, puisque c'est la lettre tapée qui compte.",
  chartCaption:
    "Tableau du clavier hiéroglyphique : chaque touche, le hiéroglyphe qu'elle tape, ce que représente le signe, son son en translittération égyptologique, son code Gardiner et la raison de ce choix.",
  chartColumns: ["Touche", "Signe", "Représente", "Son", "Pourquoi ce signe"],
  chartFootnote: (
    <>
      Les codes viennent de la liste de signes de Gardiner, la numérotation qu&apos;utilisent les égyptologues pour chaque
      hiéroglyphe. Le tableau complet des 25 signes de l&apos;alphabet, avec des mots d&apos;exemple, se trouve sur la page{" "}
      <Link href={TOOL_PATHS.alphabet.fr} className={inline}>
        alphabet hiéroglyphique
      </Link>
      .
    </>
  ),
  howHeading: "Comment utiliser le clavier hiéroglyphique",
  howSteps: [
    <>
      <strong className={strong}>Tapez.</strong> Appuyez sur n&apos;importe quelle lettre ou touchez les touches à
      l&apos;écran. Chaque frappe ajoute un signe sur le mur. L&apos;espace sépare les mots et la touche Retour arrière
      efface le dernier signe.
    </>,
    <>
      <strong className={strong}>Lisez le signe.</strong> Le panneau à côté du mur indique ce que représente le signe que
      vous venez de taper, comment il se prononçait et pourquoi il correspond à cette lettre.
    </>,
    <>
      <strong className={strong}>Copiez ou enregistrez.</strong> « Copier les hiéroglyphes » les place dans le
      presse-papiers sous forme de texte. « Enregistrer en image » télécharge une image, le choix le plus sûr pour partager,
      car tous les téléphones l&apos;affichent.
    </>,
  ],
  pasteHeading: "Hiéroglyphes à copier-coller",
  paste: (
    <>
      <p className={`${para} mb-4`}>
        Les hiéroglyphes copiés ici sont de vrais caractères Unicode, pas des images : vous pouvez les coller dans WhatsApp,
        Instagram, Word ou Google Docs. Il faut seulement, de l&apos;autre côté, une police capable de les dessiner :
      </p>
      <ul className={`${para} list-disc pl-5 space-y-1.5`}>
        <li>
          <strong className={strong}>Windows</strong> fournit Segoe UI Historic, qui les affiche dans Word et le navigateur.
        </li>
        <li>
          <strong className={strong}>Word, Google Docs, Mac et Android :</strong> installez ou choisissez la police gratuite
          Noto Sans Egyptian Hieroglyphs (Google Fonts).
        </li>
        <li>
          <strong className={strong}>iPhone et réseaux sociaux :</strong> si des carrés vides apparaissent, utilisez
          « Enregistrer en image » et partagez l&apos;image.
        </li>
      </ul>
    </>
  ),
  realHeading: "Les Égyptiens écrivaient-ils vraiment ainsi ?",
  real: (
    <>
      <p className={`${para} mb-4`}>
        Pour les noms, oui. Quand un scribe devait écrire un nom étranger comme Ptolémée, Cléopâtre ou Alexandre, il
        l&apos;épelait son par son avec des signes à une seule consonne, ceux-là mêmes que tape ce clavier. C&apos;est cette
        habitude qui a permis à Champollion de déchiffrer l&apos;écriture en 1822 : il a comparé les signes des noms royaux à
        leur graphie grecque.
      </p>
      <p className={para}>
        Les mots courants, eux, s&apos;écrivaient autrement. Le scribe disposait de signes notant deux ou trois consonnes à la
        fois et terminait la plupart des mots par une image muette qui indiquait de quel genre de chose il s&apos;agissait.
        Taper c-h-a-t ici donne les sons {g("𓎡𓉔𓄿𓏏")}, alors que le mot égyptien pour chat, <em>miou</em>, s&apos;écrivait{" "}
        {g("𓏇𓇋𓅱𓃠")} : une cruche à lait pour <em>mi</em>, un roseau, un poussin de caille et un chat assis pour finir.
      </p>
    </>
  ),
  nameHeading: "Vous écrivez un prénom ? Utilisez le traducteur",
  name: (
    <p>
      Le clavier tape exactement ce que vous pressez : une touche, un signe. Le traducteur de prénoms écoute les sons : il
      regroupe les lettres qui se prononcent comme une seule, choisit le signe de chaque son et dessine le cartouche royal
      autour du résultat, comme pour les noms des pharaons.
    </p>
  ),
  nameButton: "Écrire mon prénom en hiéroglyphes",
  alphabetButton: "Voir l'alphabet hiéroglyphique",
  gameLead:
    "Envie d'apprendre en jouant ? Ce jeu gratuit en 3D enseigne les signes pendant que vous traversez une chaussée égyptienne. Il est en anglais, mais les hiéroglyphes sont les mêmes.",
  faqHeading: "Questions fréquentes",
  faq: FAQ,
  schemaName: "Clavier hiéroglyphique égyptien",
  schemaDescription:
    "Un clavier en ligne qui tape des hiéroglyphes égyptiens : chaque touche affiche le hiéroglyphe à un seul son correspondant, avec son nom, sa translittération et son code Gardiner. Le résultat se copie en texte Unicode ou s'enregistre en image.",
  features: [
    "Tape un hiéroglyphe pour chaque lettre de A à Z, avec les accents et le Ç",
    "Clavier à l'écran en AZERTY pour mobile et tablette",
    "Affiche le nom, le son et le code Gardiner de chaque signe",
    "Copie les hiéroglyphes en texte Unicode",
    "Enregistre les hiéroglyphes en image PNG",
  ],
};

export default function ClavierHieroglyphesPage() {
  return <LocalizedKeyboardPage locale="fr" copy={copy} />;
}
