import type { Metadata } from "next";
import TranslatorLocalePage, { type TranslatorCopy } from "@/components/TranslatorLocalePage";
import { OG_LOCALE, SITE, TOOL_PATHS, toolAlternates, toolUrl } from "@/lib/i18n";
import { getHieroglyphs, getTransliteration } from "@/lib/hieroglyph-translator";

const TITLE = "Écrire son prénom en hiéroglyphes égyptiens : gratuit";
const DESCRIPTION =
  "Écrivez votre prénom en hiéroglyphes égyptiens dans un cartouche royal. Gratuit et instantané : découvrez quel signe note chaque son, et pourquoi.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: toolAlternates("translator", "fr"),
  openGraph: {
    title: "Écrire son prénom en hiéroglyphes égyptiens",
    description: DESCRIPTION,
    url: toolUrl("translator", "fr"),
    siteName: "Learn Hieroglyphics",
    type: "website",
    locale: OG_LOCALE.fr,
    alternateLocale: [OG_LOCALE.en, OG_LOCALE.es],
    images: [`${SITE}/og-homepage.jpg`],
  },
  twitter: { card: "summary_large_image", title: "Écrire son prénom en hiéroglyphes égyptiens", description: DESCRIPTION },
};

const glyph = (s: string) => <span className="hieroglyph-font text-gold-300">{s}</span>;

const COPY: TranslatorCopy = {
  h1Start: "Écrivez votre prénom en",
  h1Gold: "hiéroglyphes égyptiens",
  intro:
    "Tapez votre prénom et voyez-le en vrais hiéroglyphes, dans un cartouche comme ceux des pharaons. Chaque son s'écrit avec les signes gravés sur les murs des temples il y a plus de 3 000 ans.",
  quickAnswerLabel: "Réponse rapide",
  quickAnswer: (
    <>
      Pour écrire un prénom en hiéroglyphes, on le découpe en <strong>sons</strong> et on écrit chaque son avec l&apos;un des
      25 signes d&apos;une seule consonne, l&apos;« alphabet » hiéroglyphique. Les voyelles ne s&apos;écrivaient presque pas.
      Par exemple, <strong>Margaux</strong> s&apos;écrit {glyph(getHieroglyphs("Margaux", "fr"))} (
      {getTransliteration("Margaux", "fr")}) : la chouette pour le « m », le vautour pour le « a », la bouche pour le « r », le
      support de jarre pour le « g » et le poussin de caille pour le son « o » de « aux ». Le « x » final, muet, ne s&apos;écrit
      pas. Le prénom est entouré d&apos;un cartouche, l&apos;ovale réservé aux noms royaux.
    </>
  ),
  howHeading: "Comment écrire un prénom en hiéroglyphes ?",
  sections: [
    {
      h: "On écrit le son, pas l'orthographe",
      p: (
        <>
          Cet outil lit votre prénom tel qu&apos;il se prononce en français. Les lettres muettes disparaissent : le « e » final
          de Joséphine, le « s » de Louis, le « x » de Margaux. « Ch » s&apos;écrit avec le bassin {glyph("𓈙")}, le son « ch »
          de l&apos;égyptien. « Ou », « au » et « eau » prennent un seul poussin de caille {glyph("𓅱")}. « Gn » devient « ny »
          ({glyph("𓈖𓇋")}). Le « j » français n&apos;existait pas : on prend le signe le plus proche, la cobra {glyph("𓆓")}
          (« dj »). Beaucoup de traducteurs anglais lisent « Jacques » ou « Margaux » à l&apos;anglaise et écrivent toutes les
          lettres.
        </>
      ),
    },
    {
      h: "L'égyptien n'écrivait pas les voyelles",
      p: (
        <>
          L&apos;écriture hiéroglyphique notait surtout les consonnes. Pour rendre les voyelles, les égyptologues utilisent
          trois signes « faibles » : le vautour {glyph("𓄿")} pour le « a », le roseau {glyph("𓇋")} pour le « e » et le « i »,
          et le poussin de caille {glyph("𓅱")} pour le « o » et le « ou ». C&apos;est la convention des musées et des
          universités.
        </>
      ),
    },
    {
      h: "Pas de « l » en égyptien",
      p: (
        <>
          L&apos;égyptien ne distinguait pas le « l » du « r » : les deux s&apos;écrivent avec la bouche {glyph("𓂋")}. Pour les
          noms grecs comme Cléopâtre ou Ptolémée, les scribes ont emprunté le lion {glyph("𓃭")} pour noter le « l ».
        </>
      ),
    },
    {
      h: "Qu'est-ce qu'un cartouche ?",
      p: (
        <>
          Le cartouche (en égyptien <em>shenou</em>) est l&apos;ovale fermé par un trait qui entoure le nom. Dans l&apos;Égypte
          ancienne, il était réservé aux noms du pharaon et de la famille royale. Champollion s&apos;en est servi pour déchiffrer
          les hiéroglyphes, en comparant les cartouches de Ptolémée et de Cléopâtre.
        </>
      ),
    },
  ],
  faqHeading: "Questions fréquentes",
  faq: [
    {
      q: "Est-ce une traduction exacte de mon prénom ?",
      a: "Non. C'est une translittération : on écrit les sons de votre prénom avec des signes égyptiens, pas son sens. Les scribes faisaient de même avec les noms étrangers, en rapprochant chaque son des signes dont ils disposaient.",
    },
    {
      q: "Pourquoi mon prénom a-t-il moins de signes que de lettres ?",
      a: "Parce qu'on écrit ce qu'on entend. Les lettres muettes (le « e » final, le « s » ou le « x » final, le « h ») ne s'écrivent pas, et « ou », « au », « eau », « qu » ou « ch » ne font qu'un son, donc un seul signe.",
    },
    {
      q: "Comment écrire « ch », « ou » ou « gn » en hiéroglyphes ?",
      a: "« Ch » s'écrit avec le bassin (š), une seule consonne en égyptien. « Ou » s'écrit avec le poussin de caille (w). « Gn » s'écrit avec le filet d'eau et le roseau, comme « ny ».",
    },
    {
      q: "Les Égyptiens avaient-ils la lettre L ?",
      a: "Non. Le « l » et le « r » étaient un seul son, écrit avec la bouche. Pour les noms grecs comme Cléopâtre, les scribes ont plus tard utilisé le lion couché pour le « l ».",
    },
    {
      q: "Dans quel sens lit-on les hiéroglyphes ?",
      a: "Ils s'écrivaient de droite à gauche, de gauche à droite ou en colonnes. On commence la lecture du côté vers lequel regardent les personnages et les animaux.",
    },
    {
      q: "Puis-je copier mon prénom en hiéroglyphes ?",
      a: "Oui. Les signes sont du texte Unicode : vous pouvez les sélectionner, les copier et les coller. Pour les afficher, l'appareil a besoin d'une police qui contient les hiéroglyphes, comme Noto Sans Egyptian Hieroglyphs.",
    },
    {
      q: "Est-ce gratuit ?",
      a: "Oui, c'est gratuit et sans inscription. Vous pouvez écrire autant de prénoms que vous voulez.",
    },
  ],
  moreHeading: "Pour aller plus loin",
  links: [
    {
      href: TOOL_PATHS.alphabet.fr,
      label: "L'alphabet hiéroglyphique",
      desc: "Les 25 signes avec leur son, ce qu'ils représentent et un vrai mot égyptien.",
    },
    {
      href: TOOL_PATHS.keyboard.fr,
      label: "Clavier hiéroglyphes",
      desc: "Tapez du texte en hiéroglyphes : chaque touche écrit le signe de son son.",
    },
    {
      href: "/",
      hrefLang: "en",
      label: "Leçon 1 gratuite (en anglais)",
      desc: "Apprenez à lire les 25 signes vous-même grâce à un petit jeu, sans inscription.",
    },
  ],
  appName: "Traducteur de prénoms en hiéroglyphes",
  appDescription:
    "Tapez un prénom et voyez-le en hiéroglyphes égyptiens dans un cartouche, chaque son étant lu à la française.",
};

export default function EcrireSonPrenomEnHieroglyphesPage() {
  return <TranslatorLocalePage locale="fr" copy={COPY} />;
}
