import type { Metadata } from "next";
import TranslatedAlphabetPage, { G, type AlphabetCopy } from "@/components/TranslatedAlphabetPage";
import { OG_LOCALE, SITE, toolAlternates, toolUrl } from "@/lib/i18n";

const TITLE = "Alphabet hiéroglyphique égyptien : 25 signes et leurs sons";
const DESCRIPTION =
  "Les 25 signes de l’alphabet hiéroglyphique égyptien en un tableau : leur son en français, ce qu’ils représentent, un vrai mot égyptien. Et pourquoi ni voyelles ni L.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: toolAlternates("alphabet", "fr"),
  openGraph: {
    title: "L’alphabet hiéroglyphique égyptien : les 25 signes",
    description:
      "Chaque hiéroglyphe à un seul son avec sa prononciation en français, son code de Gardiner, ce qu’il représente et un vrai mot égyptien.",
    url: toolUrl("alphabet", "fr"),
    type: "article",
    locale: OG_LOCALE.fr,
    alternateLocale: [OG_LOCALE.en, OG_LOCALE.es],
    images: [`${SITE}/og-homepage.jpg`],
  },
};

const QUICK_TEXT =
  "L’alphabet hiéroglyphique égyptien est l’ensemble des 25 signes unilitères (des hiéroglyphes qui notent une seule consonne) avec lesquels les scribes de l’Égypte ancienne écrivaient les mots puis, plus tard, les noms étrangers comme Cléopâtre. Il ne note pas les voyelles : le vautour, le roseau et le poussin de caille servent de a, i et ou, et le lion a été utilisé pour le L, un son que l’égyptien classique n’écrivait pas.";

const COPY: AlphabetCopy = {
  home: "Accueil",
  here: "Alphabet hiéroglyphique",
  eyebrow: "Tableau de référence",
  h1Lead: "L’alphabet hiéroglyphique égyptien :",
  h1Gold: "les 25 signes",
  intro:
    "Chaque hiéroglyphe à un seul son, avec sa prononciation en français, son code de Gardiner, ce qu’il représente et un vrai mot égyptien qui l’utilise.",
  by: "Par",
  published: "Publié le",
  publishedLabel: "15 octobre 2026",
  testLink: "Vous les connaissez déjà ? Testez-vous sur les 25",
  quickLabel: "Réponse rapide",
  quickAnswerText: QUICK_TEXT,
  quickAnswer: (
    <>
      L’<strong className="text-sand-100 font-medium">alphabet hiéroglyphique égyptien</strong> est l’ensemble des
      25 signes <em>unilitères</em> (des hiéroglyphes qui notent une seule consonne) avec lesquels les scribes de
      l’Égypte ancienne écrivaient les mots puis, plus tard, les noms étrangers comme Cléopâtre. Il ne note pas les
      voyelles : le vautour <G>𓄿</G>, le roseau <G>𓇋</G> et le poussin de caille <G>𓅱</G> servent de <em>a</em>,{" "}
      <em>i</em> et <em>ou</em>, et le lion <G>𓃭</G> a été utilisé pour le <em>L</em>, un son que l’égyptien
      classique n’écrivait pas. C’est la première chose à apprendre, même si l’écriture comptait aussi des centaines
      de signes de deux et trois consonnes et des déterminatifs muets.
    </>
  ),
  chartNote: (
    <>
      Les signes regardent vers la gauche, pour une lecture de gauche à droite. La translittération suit
      l’<em>Egyptian Grammar</em> de Gardiner ; la colonne « se dit » donne la prononciation conventionnelle des
      égyptologues et la colonne « Français » le son le plus proche en français, pas une reconstitution de la
      langue parlée.
    </>
  ),
  sections: [
    {
      heading: "Pourquoi les hiéroglyphes n’ont-ils pas de voyelles ?",
      body: (
        <>
          <p>
            L’égyptien appartient à la famille afro-asiatique, comme l’arabe et l’hébreu, et comme eux il écrivait le
            squelette de consonnes des mots en laissant les voyelles au lecteur. Un Égyptien qui lisait <G>𓊪𓂋</G>{" "}
            <em>pr</em> savait par le contexte s’il s’agissait de « maison » ou de « sortir », comme nous lisons
            « bcp » pour « beaucoup » dans un SMS.
          </p>
          <p>
            Comme elles n’ont jamais été écrites, personne ne sait exactement comment sonnaient la plupart des mots.
            Les égyptologues glissent un <em>e</em> conventionnel entre les consonnes pour les prononcer :{" "}
            <em>nfr</em> se dit « néfer » et <em>ꞽmn</em>, « Amon ». Pour écrire un prénom moderne, les trois signes
            faibles <G>𓄿 𓇋 𓅱</G> servent de <em>a</em>, <em>i/é</em> et <em>ou/o</em>, exactement comme le faisaient
            les scribes ptolémaïques pour les noms grecs.
          </p>
        </>
      ),
    },
    {
      heading: "Les lettres françaises qui n’existent pas en hiéroglyphes",
      body: (
        <>
          <p>
            L’alphabet égyptien ne correspond pas lettre pour lettre au français : on écrit ce qu’on entend, pas
            l’orthographe. Voici comment se règlent les lettres qui manquent :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-sand-200">L</strong> : l’égyptien classique utilisait <G>𓂋</G> <em>r</em> ;
              à partir de l’époque ptolémaïque, le lion <G>𓃭</G>, comme dans Cléopâtre et Ptolémée.
            </li>
            <li>
              <strong className="text-sand-200">V</strong> : la vipère à cornes <G>𓆑</G> <em>f</em> ; l’égyptien ne
              distinguait pas le <em>f</em> du <em>v</em>.
            </li>
            <li>
              <strong className="text-sand-200">J et G doux</strong> : le <em>j</em> de « jardin » n’existe pas en
              égyptien ; on prend le son le plus proche, <G>𓈙</G> <em>ch</em>, ou le cobra <G>𓆓</G> <em>dj</em>.
            </li>
            <li>
              <strong className="text-sand-200">É, È, Ê</strong> : les accents disparaissent ; un <em>é</em>{" "}
              prononcé s’écrit avec le roseau <G>𓇋</G>, et le <em>e</em> muet final ne s’écrit pas.
            </li>
            <li>
              <strong className="text-sand-200">C, Q, X et CH</strong> : <em>c</em> dur et <em>qu</em> sont{" "}
              <G>𓎡</G> <em>k</em> ; <em>c</em> doux et <em>ç</em> sont <G>𓋴</G> <em>s</em> ; <em>x</em> s’écrit{" "}
              <G>𓎡𓋴</G> <em>ks</em> ; et le <em>ch</em> de « chat » existe : c’est le bassin <G>𓈙</G>.
            </li>
            <li>
              <strong className="text-sand-200">H et OU</strong> : le <em>h</em> français est muet et ne s’écrit
              pas ; le son <em>ou</em> est le poussin de caille <G>𓅱</G>.
            </li>
          </ul>
        </>
      ),
    },
  ],
  name: {
    heading: "Comment écrire son prénom en hiéroglyphes",
    body: (
      <p>
        Écrivez le prénom tel qu’il se prononce : <em>Charlotte</em> commence par <G>𓈙</G> (<em>ch</em>),{" "}
        <em>Philippe</em> par <G>𓆑</G> (<em>f</em>), les lettres muettes disparaissent et une lettre double ne
        s’écrit qu’une fois. Gardez les voyelles seulement là où elles s’entendent, puis entourez le tout d’un
        cartouche, la boucle de corde qui encadrait les noms royaux. Le traducteur le fait pour vous et explique
        chaque signe.
      </p>
    ),
    cta: "Écrire mon prénom en hiéroglyphes",
  },
  learn: {
    heading: "Comment apprendre les 25 signes",
    body: (
      <p>
        La plupart des gens retiennent l’alphabet en une seule séance s’ils apprennent chaque signe comme une image
        associée à un son, et non comme une forme. La chouette <G>𓅓</G> est <em>m</em> ; l’ondulation de l’eau{" "}
        <G>𓈖</G> est <em>n</em> ; la bouche <G>𓂋</G> est <em>r</em>. Une fois les images fixées, l’étape suivante
        consiste à les lire dans de vrais mots et dans les noms des pharaons.
      </p>
    ),
    keyboard: "Le clavier hiéroglyphique",
    keyboardNote: "tape le signe de chaque touche, avec son nom et son son.",
    lesson: "La première leçon gratuite",
    lessonNote: "(en anglais) enseigne les 25 signes en jouant, sans inscription, en une dizaine de minutes.",
  },
  faqHeading: "Questions fréquentes",
  faq: [
    {
      q: "Combien de lettres compte l’alphabet égyptien ?",
      a: "Vingt-quatre sons écrits avec vingt-cinq signes : le double roseau (y) est en général listé avec le roseau simple (ꞽ). On les appelle signes unilitères parce que chacun note exactement une consonne. L’égyptien utilisait aussi des centaines de signes de deux et trois consonnes et des déterminatifs muets : l’« alphabet » n’est que la première couche de l’écriture.",
    },
    {
      q: "Que signifient les hiéroglyphes de l’alphabet ?",
      a: "Chaque signe est le dessin d’un objet du quotidien dont le nom commençait par ce son : une chouette (m), une ondulation de l’eau (n), une bouche (r), un pain (t), une main (d), un cobra (dj). Dans l’alphabet, le dessin ne désigne pas l’objet, seulement son son. Le tableau de cette page donne la signification des 25.",
    },
    {
      q: "Pourquoi n’y a-t-il pas de voyelles en hiéroglyphes ?",
      a: "L’égyptien n’écrivait que les consonnes, comme l’arabe et l’hébreu aujourd’hui encore ; le lecteur restituait les voyelles grâce au contexte. C’est pourquoi les égyptologues ajoutent un « e » conventionnel pour prononcer (nfr se dit « néfer »). Pour les prénoms modernes, les signes faibles 𓄿, 𓇋 et 𓅱 servent de a, i/é et ou/o.",
    },
    {
      q: "Existe-t-il une lettre L en hiéroglyphes ?",
      a: "Pas en égyptien classique, qui utilisait 𓂋 (r) là où l’on attendrait un l. À partir de l’époque ptolémaïque, les scribes qui écrivaient des noms grecs et romains ont utilisé le lion couché 𓃭 pour le l : c’est ainsi que s’écrivent Cléopâtre et Ptolémée, et ainsi que le traducteur de ce site écrit un L.",
    },
    {
      q: "Comment écrire le J, le V et les accents en hiéroglyphes ?",
      a: "Au son. Le j de « jardin » n’existe pas en égyptien : on prend ch (𓈙) ou dj (𓆓). Le v s’écrit avec la vipère 𓆑, comme le f. Les accents disparaissent : un é prononcé devient le roseau 𓇋 et le e muet final ne s’écrit pas.",
    },
    {
      q: "Dans quel sens lit-on les hiéroglyphes ?",
      a: "Vers les visages. Les signes représentant des personnes ou des animaux regardent vers le début de la ligne : si les oiseaux regardent à gauche, on lit de gauche à droite ; s’ils regardent à droite, de droite à gauche. Les colonnes se lisent de haut en bas.",
    },
  ],
  headline: "L’alphabet hiéroglyphique égyptien : les 25 signes, leur son et leur signification",
  description: DESCRIPTION,
};

export default function AlphabetHieroglyphiquePage() {
  return <TranslatedAlphabetPage locale="fr" copy={COPY} />;
}
