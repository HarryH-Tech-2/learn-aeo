import type { Metadata } from "next";
import TranslatedAlphabetPage, { G, type AlphabetCopy } from "@/components/TranslatedAlphabetPage";
import { OG_LOCALE, SITE, toolAlternates, toolUrl } from "@/lib/i18n";

const TITLE = "Alfabeto jeroglífico egipcio: los 25 signos y su sonido";
const DESCRIPTION =
  "Los 25 signos del alfabeto jeroglífico egipcio en una tabla: cómo suena cada uno en español, qué dibuja y una palabra real. Y por qué no hay vocales ni L.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: toolAlternates("alphabet", "es"),
  openGraph: {
    title: "El alfabeto jeroglífico egipcio: los 25 signos",
    description:
      "Cada jeroglífico de un solo sonido con su pronunciación en español, su código de Gardiner, qué representa y una palabra egipcia real.",
    url: toolUrl("alphabet", "es"),
    type: "article",
    locale: OG_LOCALE.es,
    alternateLocale: [OG_LOCALE.en, OG_LOCALE.fr],
    images: [`${SITE}/og-homepage.jpg`],
  },
};

const QUICK_TEXT =
  "El alfabeto jeroglífico egipcio es el conjunto de 25 signos uniliterales (jeroglíficos que escriben una sola consonante) con los que los escribas del antiguo Egipto deletreaban palabras y, más tarde, nombres extranjeros como Cleopatra. No escribe vocales: el alimoche, el junco y el polluelo de codorniz hacen de a, i y u, y el león se usó para la L, un sonido que el egipcio clásico no escribía.";

const COPY: AlphabetCopy = {
  home: "Inicio",
  here: "Alfabeto jeroglífico",
  eyebrow: "Tabla de referencia",
  h1Lead: "El alfabeto jeroglífico egipcio:",
  h1Gold: "los 25 signos",
  intro:
    "Cada jeroglífico de un solo sonido, con su pronunciación en español, su código de Gardiner, lo que dibuja y una palabra egipcia real que lo usa.",
  by: "Por",
  published: "Publicado el",
  publishedLabel: "15 de octubre de 2026",
  testLink: "¿Ya te los sabes? Ponte a prueba con los 25",
  quickLabel: "Respuesta rápida",
  quickAnswerText: QUICK_TEXT,
  quickAnswer: (
    <>
      El <strong className="text-sand-100 font-medium">alfabeto jeroglífico egipcio</strong> es el conjunto de 25
      signos <em>uniliterales</em> (jeroglíficos que escriben una sola consonante) con los que los escribas del
      antiguo Egipto deletreaban palabras y, más tarde, nombres extranjeros como Cleopatra. No escribe vocales: el
      alimoche <G>𓄿</G>, el junco <G>𓇋</G> y el polluelo de codorniz <G>𓅱</G> hacen de <em>a</em>, <em>i</em> y{" "}
      <em>u</em>, y el león <G>𓃭</G> se usó para la <em>L</em>, un sonido que el egipcio clásico no escribía. Es lo
      primero que hay que aprender, aunque la escritura también usaba cientos de signos de dos y tres consonantes y
      determinativos que no se leen.
    </>
  ),
  chartNote: (
    <>
      Los signos miran a la izquierda, para leer de izquierda a derecha. La transliteración sigue la{" "}
      <em>Egyptian Grammar</em> de Gardiner; la columna «se dice» da la pronunciación convencional de los egiptólogos
      y la columna «Español» el sonido más parecido en español, no una reconstrucción del habla antigua.
    </>
  ),
  sections: [
    {
      heading: "¿Por qué los jeroglíficos no tienen vocales?",
      body: (
        <>
          <p>
            El egipcio pertenece a la familia afroasiática, como el árabe y el hebreo, y como ellos escribía el
            esqueleto de consonantes de cada palabra y dejaba las vocales al lector. Un egipcio que veía{" "}
            <G>𓊪𓂋</G> <em>pr</em> sabía por el contexto si significaba «casa» o «salir», igual que nosotros
            entendemos «q» por «que» en un mensaje.
          </p>
          <p>
            Como nunca se escribieron, nadie sabe exactamente cómo sonaban la mayoría de las palabras. Los
            egiptólogos meten una <em>e</em> convencional entre consonantes para poder pronunciarlas: <em>nfr</em> se
            dice «nefer» y <em>ꞽmn</em>, «Amón». Al escribir un nombre moderno, los tres signos débiles{" "}
            <G>𓄿 𓇋 𓅱</G> hacen de <em>a</em>, <em>i/e</em> y <em>u/o</em>, justo lo que hacían los escribas
            ptolemaicos con los nombres griegos.
          </p>
        </>
      ),
    },
    {
      heading: "Letras del español que no existen en jeroglíficos",
      body: (
        <>
          <p>
            El alfabeto egipcio no coincide letra por letra con el español: se escribe por sonido, no por
            ortografía. Así se resuelven las letras que faltan:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-sand-200">L</strong>: el egipcio clásico usaba <G>𓂋</G> <em>r</em>; desde
              época ptolemaica, el león <G>𓃭</G>, como en Cleopatra y Ptolomeo.
            </li>
            <li>
              <strong className="text-sand-200">V y B</strong>: la <em>b</em> es el pie <G>𓃀</G>; la <em>v</em>{" "}
              española suena como <em>b</em>, así que se escribe igual (en otras lenguas se usa la víbora{" "}
              <G>𓆑</G> <em>f</em>).
            </li>
            <li>
              <strong className="text-sand-200">J y G suave</strong>: la jota de «jamón» existe en egipcio: es la
              placenta <G>𓐍</G> <em>ḫ</em>.
            </li>
            <li>
              <strong className="text-sand-200">Ñ y LL</strong>: <em>ñ</em> se escribe <em>n</em> + <em>y</em>{" "}
              (<G>𓈖𓇌</G>) y <em>ll</em> como <em>y</em> (<G>𓇌</G>).
            </li>
            <li>
              <strong className="text-sand-200">C, Q, Z y X</strong>: <em>c</em> fuerte y <em>qu</em> son{" "}
              <G>𓎡</G> <em>k</em>; <em>c</em> suave y <em>z</em> se escriben <G>𓋴</G> <em>s</em>; la <em>x</em> es{" "}
              <G>𓎡𓋴</G> <em>ks</em>.
            </li>
            <li>
              <strong className="text-sand-200">H</strong>: la <em>h</em> española es muda, así que no se
              escribe. Los signos <G>𓉔</G> y <G>𓎛</G> son haches que sí suenan.
            </li>
          </ul>
        </>
      ),
    },
  ],
  name: {
    heading: "Cómo escribir tu nombre en jeroglíficos",
    body: (
      <p>
        Deletrea el nombre por cómo suena: <em>Jorge</em> empieza por <G>𓐍</G> (la jota), <em>Guillermo</em> lleva{" "}
        <G>𓎼</G> (<em>g</em> de «gato»), la <em>h</em> muda desaparece y una letra doble se escribe una sola vez.
        Mantén las vocales solo donde suenan con fuerza y encierra el resultado en un cartucho, el lazo de cuerda que
        marcaba los nombres reales. El traductor lo hace por ti y explica cada signo.
      </p>
    ),
    cta: "Escribe tu nombre en jeroglíficos",
  },
  learn: {
    heading: "Cómo aprender los 25 signos",
    body: (
      <p>
        La mayoría de la gente aprende el alfabeto en una sola sesión si aprende cada signo como un dibujo con un
        sonido, no como una forma. El búho <G>𓅓</G> es <em>m</em>; la onda de agua <G>𓈖</G> es <em>n</em>; la boca{" "}
        <G>𓂋</G> es <em>r</em>. Una vez fijados los dibujos, el siguiente paso es leerlos dentro de palabras reales y
        de nombres de faraones.
      </p>
    ),
    keyboard: "El teclado de jeroglíficos",
    keyboardNote: "escribe el signo de cada tecla que pulsas, con su nombre y su sonido.",
    lesson: "La primera lección gratis",
    lessonNote: "(en inglés) enseña los 25 signos jugando, sin registrarte, en unos diez minutos.",
  },
  faqHeading: "Preguntas frecuentes",
  faq: [
    {
      q: "¿Cuántas letras tiene el alfabeto egipcio?",
      a: "Veinticuatro sonidos escritos con veinticinco signos: el doble junco (y) suele ir junto al junco simple (ꞽ). Se llaman signos uniliterales porque cada uno escribe exactamente una consonante. El egipcio usaba además cientos de signos de dos y tres consonantes y determinativos mudos, así que el «alfabeto» es solo la primera capa de la escritura.",
    },
    {
      q: "¿Qué significan los jeroglíficos egipcios del alfabeto?",
      a: "Cada signo es un dibujo de algo cotidiano cuyo nombre empezaba por ese sonido: un búho (m), una onda de agua (n), una boca (r), un pan (t), una mano (d), una cobra (dy). En el alfabeto el dibujo no significa la cosa, solo su sonido. La tabla de esta página da el significado de los 25.",
    },
    {
      q: "¿Por qué no hay vocales en los jeroglíficos?",
      a: "El egipcio solo escribía consonantes, como el árabe y el hebreo todavía hoy; el lector ponía las vocales por el contexto. Por eso los egiptólogos añaden una «e» convencional al pronunciar (nfr se dice «nefer»). Para nombres modernos, los signos débiles 𓄿, 𓇋 y 𓅱 hacen de a, i/e y u/o.",
    },
    {
      q: "¿Existe la letra L en jeroglíficos?",
      a: "No en el egipcio clásico, que usaba 𓂋 (r) donde esperaríamos una l. Desde la época ptolemaica, los escribas que deletreaban nombres griegos y romanos usaron el león echado 𓃭 para la l; así se escriben Cleopatra y Ptolomeo, y así la escribe el traductor de esta web.",
    },
    {
      q: "¿Cómo se escriben la ñ, la ll y la j en jeroglíficos?",
      a: "Por sonido. La ñ se escribe n + y (𓈖𓇌), la ll como y (𓇌) y la j de «jamón» con la placenta 𓐍, que tenía justo ese sonido. La v española suena como b y se escribe con el pie 𓃀; la h muda no se escribe.",
    },
    {
      q: "¿En qué dirección se leen los jeroglíficos?",
      a: "Hacia las caras. Los signos de personas y animales miran hacia el principio de la línea: si los pájaros miran a la izquierda, se lee de izquierda a derecha, y si miran a la derecha, de derecha a izquierda. Las columnas se leen de arriba abajo.",
    },
  ],
  headline: "El alfabeto jeroglífico egipcio: los 25 signos, su sonido y su significado",
  description: DESCRIPTION,
};

export default function AlfabetoJeroglificoPage() {
  return <TranslatedAlphabetPage locale="es" copy={COPY} />;
}
