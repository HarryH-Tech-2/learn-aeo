import type { Metadata } from "next";
import Link from "next/link";
import { OG_LOCALE, SITE, TOOL_PATHS, toolAlternates, toolUrl } from "@/lib/i18n";
import LocalizedKeyboardPage, { type KeyboardPageCopy } from "@/app/hieroglyphics-keyboard/LocalizedKeyboardPage";

const URL = toolUrl("keyboard", "es");

export const metadata: Metadata = {
  title: "Teclado de jeroglíficos egipcios: escribe online gratis",
  description:
    "Teclado de jeroglíficos gratis: pulsa una letra y verás el jeroglífico egipcio de su sonido, con su nombre y significado. Cópialo y pégalo o guárdalo como imagen.",
  alternates: toolAlternates("keyboard", "es"),
  openGraph: {
    title: "Teclado de jeroglíficos: escribe en egipcio antiguo",
    description:
      "Pulsa una tecla y aparece el jeroglífico. Un teclado egipcio online y gratuito, con el nombre, el sonido y la historia de cada signo. Copia, pega o guarda como imagen.",
    url: URL,
    type: "website",
    locale: OG_LOCALE.es,
    alternateLocale: [OG_LOCALE.en, OG_LOCALE.fr],
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
    q: "¿Existe un teclado de jeroglíficos egipcios?",
    a: "Sí. El teclado de esta página escribe jeroglíficos egipcios desde un teclado normal: pulsas una letra y aparece el signo de ese sonido; en el móvil se tocan las teclas en pantalla. Los antiguos egipcios no tenían alfabeto fijo: los escribas elegían entre unos 700 signos de uso común, y este teclado usa los signos de un solo sonido con los que escribían los nombres extranjeros.",
  },
  {
    q: "¿Se pueden copiar y pegar los jeroglíficos?",
    a: "Sí. Los jeroglíficos egipcios forman parte de Unicode desde 2009 (el bloque U+13000 a U+1342F), así que se copian y pegan como cualquier texto. Pulsa «Copiar jeroglíficos» y pégalos en un mensaje, un documento o una red social. Si ves cuadraditos vacíos, ese dispositivo no tiene una fuente de jeroglíficos: guárdalos como imagen o instala la fuente gratuita Noto Sans Egyptian Hieroglyphs.",
  },
  {
    q: "¿Por qué la E, la I y la Y escriben el mismo jeroglífico?",
    a: "Porque la escritura egipcia solo anotaba consonantes: no hay un signo para la e. El junco 𓇋 representaba un sonido débil parecido a la y, y es el que usaban los escribas cuando un nombre extranjero necesitaba una i o una e. Del mismo modo, la O, la U y la W comparten el polluelo de codorniz 𓅱, y la A es el buitre 𓄿.",
  },
  {
    q: "¿Por qué la J escribe una placenta y no una cobra?",
    a: "Porque el teclado sigue los sonidos del español. La J de jamón es un sonido áspero, al fondo de la garganta, que el egipcio tenía y escribía ḫ con el signo de la placenta 𓐍. En la versión inglesa del teclado la J suena «dy» y escribe la cobra 𓆓.",
  },
  {
    q: "¿Este teclado traduce del español al egipcio?",
    a: "No. Escribe las letras con signos egipcios de sonido, que es como los escribas escribían los nombres extranjeros, pero no traduce el significado. Las palabras egipcias de verdad mezclaban signos de uno, dos y tres sonidos con signos mudos llamados determinativos: la palabra «casa» es 𓉐, no las letras c-a-s-a.",
  },
  {
    q: "¿Cómo escribo jeroglíficos en Word, Google Docs o el móvil?",
    a: "Lo más rápido es escribirlos aquí, copiarlos y pegarlos. Para que se vean, el ordenador o el móvil necesita una fuente de jeroglíficos: Windows incluye Segoe UI Historic, y Noto Sans Egyptian Hieroglyphs es gratuita para Word, Google Docs, Mac y Android. Los egiptólogos que componen inscripciones completas usan JSesh, un editor jeroglífico gratuito.",
  },
  {
    q: "¿Cuánto se tarda en aprender el alfabeto jeroglífico?",
    a: "Una media hora. El «alfabeto» son 25 signos de un solo sonido, y la mayoría de la gente los aprende de una sentada si cada signo se enseña como un dibujo con su sonido: el búho es la m, las ondas de agua la n, la boca la r. En el alfabeto jeroglífico de esta web tienes los 25 con un ejemplo real de cada uno.",
  },
];

const copy: KeyboardPageCopy = {
  home: "Inicio",
  breadcrumb: "Teclado de jeroglíficos",
  h1: "Teclado de jeroglíficos egipcios",
  intro: "Escribe en jeroglíficos egipcios. Pulsa una tecla y verás el signo que un escriba usaría para ese sonido.",
  quickAnswerLabel: "Respuesta rápida",
  quickAnswer: (
    <>
      Un <strong className="text-sand-100 font-medium">teclado de jeroglíficos</strong> convierte cada letra que escribes
      en el jeroglífico egipcio de ese sonido: la M es el búho {g("𓅓")}, la N las ondas de agua {g("𓈖")}, la R la boca{" "}
      {g("𓂋")}. Usa los signos de un solo sonido, el llamado alfabeto jeroglífico, con los que los escribas escribían los
      nombres extranjeros. Como el egipcio no escribía vocales, la A, la E/I y la O/U toman prestados el buitre, el junco y
      el polluelo de codorniz. Los signos son texto Unicode: se pueden copiar y pegar.
    </>
  ),
  chartHeading: "¿Qué jeroglífico escribe cada tecla?",
  chartIntro:
    "Las 26 letras, el signo que escribe cada una y por qué. Varias letras comparten signo porque el teclado sigue los sonidos, y el egipcio tenía menos sonidos que letras tiene el español. La Ñ escribe el mismo signo que la N, y las vocales con tilde, el de su vocal.",
  chartCaption:
    "Tabla del teclado de jeroglíficos: cada tecla, el jeroglífico que escribe, lo que representa el signo, su sonido en transliteración egiptológica, su código Gardiner y por qué se usa ese signo.",
  chartColumns: ["Tecla", "Signo", "Representa", "Sonido", "Por qué este signo"],
  chartFootnote: (
    <>
      Los códigos son de la lista de signos de Gardiner, la numeración que usan los egiptólogos para cada jeroglífico. La
      tabla completa de los 25 signos del alfabeto, con palabras de ejemplo, está en el{" "}
      <Link href={TOOL_PATHS.alphabet.es} className={inline}>
        alfabeto jeroglífico
      </Link>
      .
    </>
  ),
  howHeading: "Cómo usar el teclado de jeroglíficos",
  howSteps: [
    <>
      <strong className={strong}>Escribe.</strong> Pulsa cualquier letra o toca las teclas en pantalla. Cada pulsación añade
      un signo al muro. El espacio separa palabras y la tecla de borrar quita el último signo.
    </>,
    <>
      <strong className={strong}>Lee el signo.</strong> El panel junto al muro dice qué representa el signo que acabas de
      escribir, cómo sonaba y por qué corresponde a esa letra.
    </>,
    <>
      <strong className={strong}>Copia o guarda.</strong> «Copiar jeroglíficos» los pone en el portapapeles como texto.
      «Guardar como imagen» descarga una imagen, la opción más segura para compartir porque cualquier móvil la muestra.
    </>,
  ],
  pasteHeading: "Jeroglíficos para copiar y pegar",
  paste: (
    <>
      <p className={`${para} mb-4`}>
        Los jeroglíficos que copias aquí son caracteres Unicode de verdad, no imágenes, así que puedes pegarlos en WhatsApp,
        Instagram, Word o Google Docs. Lo que necesita el otro lado es una fuente que los dibuje:
      </p>
      <ul className={`${para} list-disc pl-5 space-y-1.5`}>
        <li>
          <strong className={strong}>Windows</strong> trae Segoe UI Historic, que los muestra en Word y en el navegador.
        </li>
        <li>
          <strong className={strong}>Word, Google Docs, Mac y Android:</strong> instala o elige la fuente gratuita Noto Sans
          Egyptian Hieroglyphs de Google Fonts.
        </li>
        <li>
          <strong className={strong}>iPhone y redes sociales:</strong> si aparecen cuadraditos, usa «Guardar como imagen» y
          comparte la imagen.
        </li>
      </ul>
    </>
  ),
  realHeading: "¿Así escribían de verdad los egipcios?",
  real: (
    <>
      <p className={`${para} mb-4`}>
        Para los nombres, sí. Cuando un escriba tenía que escribir un nombre extranjero como Ptolomeo, Cleopatra o Alejandro,
        lo deletreaba sonido a sonido con signos de una sola consonante, los mismos que escribe este teclado. Esa costumbre es
        la que permitió a Champollion descifrar la escritura en 1822: comparó los signos de los nombres reales con su
        escritura en griego.
      </p>
      <p className={para}>
        Las palabras corrientes eran distintas. El escriba tenía signos para dos y tres consonantes a la vez, y terminaba casi
        todas las palabras con un dibujo mudo que indicaba de qué tipo de cosa se trataba. Escribir g-a-t-o aquí te da los
        sonidos {g("𓎼𓄿𓏏𓅱")}, mientras que la palabra egipcia para gato, <em>miu</em>, se escribía {g("𓏇𓇋𓅱𓃠")}: una jarra
        de leche para <em>mi</em>, un junco, un polluelo de codorniz y un gato sentado al final.
      </p>
    </>
  ),
  nameHeading: "¿Vas a escribir un nombre? Usa el traductor",
  name: (
    <p>
      El teclado escribe exactamente lo que pulsas: una tecla, un signo. El traductor de nombres escucha los sonidos: junta
      las letras que suenan como una sola, elige el signo de cada sonido y dibuja el cartucho real alrededor del resultado,
      como en los nombres de los faraones.
    </p>
  ),
  nameButton: "Escribir mi nombre en jeroglíficos",
  alphabetButton: "Ver el alfabeto jeroglífico",
  gameLead:
    "¿Prefieres aprender jugando? Este juego gratuito en 3D enseña los signos mientras cruzas una calzada egipcia. Está en inglés, pero los jeroglíficos son los mismos.",
  faqHeading: "Preguntas frecuentes",
  faq: FAQ,
  schemaName: "Teclado de jeroglíficos egipcios",
  schemaDescription:
    "Un teclado online que escribe jeroglíficos egipcios: cada tecla muestra el jeroglífico de un solo sonido correspondiente, con su nombre, su transliteración y su código Gardiner. El resultado se copia como texto Unicode o se guarda como imagen.",
  features: [
    "Escribe un jeroglífico por cada letra de la A a la Z, con la Ñ y las vocales con tilde",
    "Teclas en pantalla para móviles y tabletas",
    "Muestra el nombre, el sonido y el código Gardiner de cada signo",
    "Copia los jeroglíficos como texto Unicode",
    "Guarda los jeroglíficos como imagen PNG",
  ],
};

export default function TecladoJeroglificosPage() {
  return <LocalizedKeyboardPage locale="es" copy={copy} />;
}
