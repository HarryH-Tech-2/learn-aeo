import type { Metadata } from "next";
import TranslatorLocalePage, { type TranslatorCopy } from "@/components/TranslatorLocalePage";
import { OG_LOCALE, SITE, TOOL_PATHS, toolAlternates, toolUrl } from "@/lib/i18n";
import { getHieroglyphs, getTransliteration } from "@/lib/hieroglyph-translator";

const TITLE = "Escribe tu nombre en jeroglíficos egipcios: gratis";
const DESCRIPTION =
  "Escribe tu nombre en jeroglíficos egipcios dentro de un cartucho real. Gratis y al instante: descubre qué signo usa cada sonido y por qué.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: toolAlternates("translator", "es"),
  openGraph: {
    title: "Escribe tu nombre en jeroglíficos egipcios",
    description: DESCRIPTION,
    url: toolUrl("translator", "es"),
    siteName: "Learn Hieroglyphics",
    type: "website",
    locale: OG_LOCALE.es,
    alternateLocale: [OG_LOCALE.en, OG_LOCALE.fr],
    images: [`${SITE}/og-homepage.jpg`],
  },
  twitter: { card: "summary_large_image", title: "Escribe tu nombre en jeroglíficos egipcios", description: DESCRIPTION },
};

const glyph = (s: string) => <span className="hieroglyph-font text-gold-300">{s}</span>;

const COPY: TranslatorCopy = {
  h1Start: "Escribe tu nombre en",
  h1Gold: "jeroglíficos egipcios",
  intro:
    "Escribe tu nombre y míralo en jeroglíficos de verdad, dentro de un cartucho como los de los faraones. Cada sonido se escribe con los mismos signos que se tallaron en los templos hace más de 3000 años.",
  quickAnswerLabel: "Respuesta rápida",
  quickAnswer: (
    <>
      Para escribir un nombre en jeroglíficos se divide en <strong>sonidos</strong> y cada sonido se escribe con uno de
      los 25 signos de una sola consonante, el llamado «alfabeto» jeroglífico. Las vocales casi no se escribían. Por
      ejemplo, <strong>José</strong> se escribe {glyph(getHieroglyphs("José", "es"))} ({getTransliteration("José", "es")}):
      la placenta para la «j», que suena como el sonido egipcio ḫ, el polluelo de codorniz para la «o», la tela doblada
      para la «s» y el junco para la «e». El nombre se rodea con un cartucho, el óvalo reservado a los nombres reales.
    </>
  ),
  howHeading: "¿Cómo se escribe un nombre en jeroglíficos?",
  sections: [
    {
      h: "Se escribe el sonido, no las letras",
      p: (
        <>
          Esta herramienta lee tu nombre como suena en español. La «j» y la «g» ante «e» o «i» se escriben con la placenta{" "}
          {glyph("𓐍")}, un sonido gutural que el egipcio sí tenía. La «ll» suena «y» y se escribe con el junco {glyph("𓇋")}.
          La «h» es muda y no se escribe. La «v» suena como la «b», así que usa el pie {glyph("𓃀")}. La «ñ» se escribe con
          dos signos, la onda de agua y el junco ({glyph("𓈖𓇋")}, «ny»). Muchos traductores en inglés escriben José con una
          cobra, porque leen la «j» a la inglesa.
        </>
      ),
    },
    {
      h: "El egipcio no escribía vocales",
      p: (
        <>
          La escritura jeroglífica anotaba sobre todo consonantes. Para acercarse a las vocales, los egiptólogos usan tres
          signos «débiles»: el buitre {glyph("𓄿")} para la «a», el junco {glyph("𓇋")} para la «e» y la «i», y el polluelo
          de codorniz {glyph("𓅱")} para la «o» y la «u». Es la misma convención que siguen museos y universidades.
        </>
      ),
    },
    {
      h: "No había «l»",
      p: (
        <>
          El egipcio no distinguía la «l» de la «r»: las dos se escriben con la boca {glyph("𓂋")}. Cuando los escribas
          tuvieron que escribir nombres griegos como Cleopatra o Ptolomeo, usaron el león {glyph("𓃭")} para la «l».
        </>
      ),
    },
    {
      h: "¿Qué es el cartucho?",
      p: (
        <>
          El cartucho (en egipcio <em>shenu</em>) es el óvalo con una línea en un extremo que rodea el nombre. En el antiguo
          Egipto solo se usaba para los nombres del faraón y de la familia real. Lo usamos aquí porque es el elemento más
          reconocible de la escritura jeroglífica y deja claro que lo de dentro es un nombre.
        </>
      ),
    },
  ],
  faqHeading: "Preguntas frecuentes",
  faq: [
    {
      q: "¿Es una traducción exacta de mi nombre?",
      a: "No. Es una transliteración: se escriben los sonidos de tu nombre con signos egipcios, no su significado. Los propios escribas hacían lo mismo con los nombres extranjeros, aproximando cada sonido con los signos que tenían.",
    },
    {
      q: "¿Por qué mi nombre tiene menos signos que letras?",
      a: "Porque se escribe lo que suena. La «h» es muda, la «qu» y la «gu» ante «e» o «i» son un solo sonido, la «ll» es un solo sonido y las consonantes dobles como la «rr» se escriben una vez.",
    },
    {
      q: "¿Cómo se escribe la ñ en jeroglíficos?",
      a: "Con dos signos: la onda de agua (n) y el junco (j/y), es decir «ny». El egipcio no tenía un signo propio para la ñ, pero esos dos sonidos juntos la reproducen bien.",
    },
    {
      q: "¿Cómo se escribe la j de José o de Javier?",
      a: "Con la placenta (ḫ), un sonido gutural parecido a la «j» española, como en «loch». Es la misma solución para la «g» ante «e» o «i», como en Jorge o Gerardo.",
    },
    {
      q: "¿En qué dirección se leen los jeroglíficos?",
      a: "Se podían escribir de derecha a izquierda, de izquierda a derecha o en columnas. Se empieza a leer por el lado hacia el que miran las figuras de personas y animales.",
    },
    {
      q: "¿Puedo copiar mi nombre en jeroglíficos?",
      a: "Sí. Los signos son texto Unicode, así que puedes seleccionarlos, copiarlos y pegarlos donde quieras. Para verlos, el dispositivo necesita una fuente con jeroglíficos, como Noto Sans Egyptian Hieroglyphs.",
    },
    {
      q: "¿Es gratis?",
      a: "Sí, es gratis y no hace falta registrarse. Puedes escribir tantos nombres como quieras.",
    },
  ],
  moreHeading: "Sigue explorando",
  links: [
    {
      href: TOOL_PATHS.alphabet.es,
      label: "El alfabeto jeroglífico",
      desc: "Los 25 signos con su sonido, lo que representan y una palabra egipcia real.",
    },
    {
      href: TOOL_PATHS.keyboard.es,
      label: "Teclado de jeroglíficos",
      desc: "Escribe texto en jeroglíficos: cada tecla escribe el signo de su sonido.",
    },
    {
      href: "/",
      hrefLang: "en",
      label: "Lección 1 gratis (en inglés)",
      desc: "Aprende a leer los 25 signos tú mismo con un juego corto, sin registrarte.",
    },
  ],
  appName: "Traductor de nombres a jeroglíficos",
  appDescription:
    "Escribe un nombre y míralo en jeroglíficos egipcios dentro de un cartucho, con cada sonido leído a la española.",
};

export default function EscribirNombreEnJeroglificosPage() {
  return <TranslatorLocalePage locale="es" copy={COPY} />;
}
