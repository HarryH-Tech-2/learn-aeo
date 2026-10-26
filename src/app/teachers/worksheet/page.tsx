import type { Metadata } from "next";
import Link from "next/link";
import {
  getAlphabetMappings,
  transliterateName,
  getTransliteration,
} from "@/lib/hieroglyph-translator";
import PrintButton from "./PrintButton";
import WorksheetOffers from "./WorksheetOffers";
import SeasonPromo from "@/components/teachers/SeasonPromo";
import UnitPackOffer from "@/components/teachers/UnitPackOffer";

const BASE = "https://www.learnhieroglyphics.com";

export const metadata: Metadata = {
  title: "Free Hieroglyphics Worksheet | Write Your Name in Hieroglyphs (KS2 printable)",
  description:
    "Printable A4 hieroglyphics worksheet for KS2 and KS3: the 24-sign hieroglyphic alphabet chart, a cartouche to write your own name in, four famous names to decode, a challenge and a teacher answer key. Free to copy for classroom use.",
  alternates: { canonical: `${BASE}/teachers/worksheet` },
};

/** Names for the decode activity — short, famous, and using a good spread of signs. */
const DECODE_NAMES = ["Tut", "Nile", "Isis", "Rameses"];

const SHARED_SIGN_PAIRS = [
  ["L and R", "the mouth"],
  ["C (hard) and K", "the basket"],
  ["F and V", "the horned viper"],
  ["O, U and W", "the quail chick"],
  ["E, I and Y", "the reed"],
];

function Glyph({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`glyph-font ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

function Cartouche({ label }: { label: string }) {
  return (
    <div className="ws-cartouche-wrap">
      <div className="ws-cartouche" aria-label={label} />
    </div>
  );
}

/**
 * The line at the foot of each printed page. Pupils' pages carry the short address of the name translator
 * (/name, a redirect in next.config.ts that tags the visit as coming from a printed sheet), because those
 * pages go home in a school bag; the teacher's page points at the class resources.
 */
function PageFooter({ page, forTeacher = false }: { page: number; forTeacher?: boolean }) {
  return (
    <footer className="ws-footer">
      <div className="ws-footer-site">
        <Glyph className="ws-footer-glyph">𓂀</Glyph>
        <div>
          <span className="ws-footer-label">
            {forTeacher ? "Live class quiz and more lessons" : "See your name in Hieroglyphics"}
          </span>
          <span className="ws-footer-url">learnhieroglyphics.com/{forTeacher ? "teachers" : "name"}</span>
        </div>
      </div>
      <div className="ws-footer-meta">
        <span className="ws-footer-page">Page {page} of 3</span>
      </div>
    </footer>
  );
}

export default function WorksheetPage() {
  const mappings = getAlphabetMappings();
  const letters = mappings.filter((m) => m.input.length === 1);
  const digraphs = mappings.filter((m) => m.input.length > 1);

  return (
    <main className="worksheet">
      {/* Screen-only panel: what this is and the print button, then the email box and the class offer */}
      <div className="no-print ws-top">
        <div className="ws-toolbar">
          <div>
            <p className="font-display text-xl text-sand-100 mb-1">Classroom worksheet</p>
            <p className="font-body text-sm text-sand-300">
              Three A4 pages: alphabet chart, activities, answer key. Print double-sided and keep page 3 for yourself.
            </p>
          </div>
          <div className="ws-toolbar-actions">
            <Link href="/teachers" className="btn-secondary py-3 px-5 text-sm">
              Teacher page
            </Link>
            <PrintButton />
          </div>
        </div>
        <WorksheetOffers />
        {/* After the free worksheet: the five-lesson unit (screen only, like the panel it sits in) */}
        <SeasonPromo location="worksheet" packHref="#unit-pack-ws" className="mt-4" />
        <div id="unit-pack-ws" className="mt-4 scroll-mt-24">
          <UnitPackOffer location="worksheet" variant="compact" />
        </div>
      </div>

      {/* ── Page 1: alphabet chart ── */}
      <section className="ws-page">
        <header className="ws-header">
          <div>
            <h1 className="ws-title">Write Your Name in Hieroglyphs</h1>
            <p className="ws-subtitle">The hieroglyphic alphabet: the 24 signs Egyptian scribes used for single sounds</p>
          </div>
          <Glyph className="ws-header-glyph">𓂀</Glyph>
        </header>

        <div className="ws-namebar">
          <span>Name: ______________________________</span>
          <span>Class: ____________</span>
          <span>Date: ____________</span>
        </div>

        <div className="ws-rules">
          <h2>Rules of the scribes</h2>
          <ol>
            <li>
              <strong>Egyptian wrote no vowels.</strong> Use the vulture for <strong>A</strong>, the reed for{" "}
              <strong>E, I</strong> and <strong>Y</strong>, and the quail chick for <strong>O</strong> and{" "}
              <strong>U</strong>.
            </li>
            <li>
              <strong>There was no L sign</strong>, so L borrows the mouth sign for R.
            </li>
            <li>
              <strong>Double letters are written once.</strong> Harry becomes H-A-R-Y.
            </li>
            <li>
              <strong>C</strong> sounds like K before A, O or U (basket) and like S before E, I or Y (folded cloth).
            </li>
            <li>
              <strong>SH, CH, TH</strong> and <strong>PH</strong> are one sign each.
            </li>
          </ol>
        </div>

        <div className="ws-chart">
          {letters.map((m) => (
            <div key={m.input} className="ws-cell">
              <span className="ws-cell-letter">{m.input.toUpperCase()}</span>
              <Glyph className="ws-cell-glyph">{m.glyph}</Glyph>
              <span className="ws-cell-name">{m.signName}</span>
            </div>
          ))}
          {digraphs.map((m) => (
            <div key={m.input} className="ws-cell ws-cell-digraph">
              <span className="ws-cell-letter">{m.input.toUpperCase()}</span>
              <Glyph className="ws-cell-glyph">{m.glyph}</Glyph>
              <span className="ws-cell-name">{m.signName}</span>
            </div>
          ))}
        </div>

        <PageFooter page={1} />
      </section>

      {/* ── Page 2: activities ── */}
      <section className="ws-page">
        <header className="ws-header">
          <div>
            <h1 className="ws-title">Activities</h1>
            <p className="ws-subtitle">Use the alphabet chart on page 1. Write from left to right, like the scribes often did.</p>
          </div>
          <Glyph className="ws-header-glyph">𓏞</Glyph>
        </header>

        <div className="ws-activity">
          <h2>
            <span className="ws-num">1</span> Write your name in a cartouche
          </h2>
          <p>
            Only pharaohs had their names written inside a cartouche, an oval rope
            with a knot at the end. Today, you are the pharaoh. Draw your name, one sign for
            each sound.
          </p>
          <Cartouche label="Empty cartouche for the pupil's name" />
          <p className="ws-line">
            How Egyptologists would write the sounds of your name (e.g. Harry = h-a-r-y):
            ____________________________________
          </p>
        </div>

        <div className="ws-activity">
          <h2>
            <span className="ws-num">2</span> Decode these famous names
          </h2>
          <p>Which pharaoh, river or goddess is written here? Use the chart to work out each sound.</p>
          <div className="ws-decode">
            {DECODE_NAMES.map((name) => (
              <div key={name} className="ws-decode-row">
                <div className="ws-decode-cartouche">
                  <Glyph className="ws-decode-glyphs">
                    {transliterateName(name).map((r) => r.mapping.glyph).join("")}
                  </Glyph>
                </div>
                <span className="ws-decode-blank">
                  {Array.from({ length: transliterateName(name).length }).map((_, i) => (
                    <span key={i} className="ws-blank-box" />
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="ws-activity">
          <h2>
            <span className="ws-num">3</span> A friend&apos;s name
          </h2>
          <p>Swap sheets with a partner. Write their name in the cartouche and then say it aloud from the signs.</p>
          <Cartouche label="Empty cartouche for a partner's name" />
        </div>

        <div className="ws-activity ws-challenge">
          <h2>
            <span className="ws-num">★</span> Challenge
          </h2>
          <p>
            Some English letters share one hieroglyph. Find <strong>three pairs</strong> of letters on the chart that use the same sign, and write them here:
          </p>
          <p className="ws-line">1. _____ and _____ &nbsp;&nbsp; 2. _____ and _____ &nbsp;&nbsp; 3. _____ and _____</p>
          <p>
            Why do you think the Egyptians had no sign for the letter E? Write one sentence.
          </p>
          <p className="ws-line">______________________________________________________________________</p>
        </div>

        <PageFooter page={2} />
      </section>

      {/* ── Page 3: answer key ── */}
      <section className="ws-page ws-key">
        <header className="ws-header">
          <div>
            <h1 className="ws-title">Teacher&apos;s answer key</h1>
            <p className="ws-subtitle">Plus a 50-minute lesson outline. Full teacher notes at learnhieroglyphics.com/teachers</p>
          </div>
          <Glyph className="ws-header-glyph">𓋹</Glyph>
        </header>

        <div className="ws-activity">
          <h2>
            <span className="ws-num">2</span> Decode these famous names
          </h2>
          <table className="ws-table">
            <thead>
              <tr>
                <th>Signs</th>
                <th>Reading</th>
                <th>Answer</th>
              </tr>
            </thead>
            <tbody>
              {DECODE_NAMES.map((name) => (
                <tr key={name}>
                  <td>
                    <Glyph className="ws-table-glyphs">
                      {transliterateName(name).map((r) => r.mapping.glyph).join("")}
                    </Glyph>
                  </td>
                  <td>{getTransliteration(name)}</td>
                  <td>
                    <strong>{name}</strong>
                    {name === "Tut" && " (Tutankhamun's nickname)"}
                    {name === "Nile" && " (the river)"}
                    {name === "Isis" && " (the goddess)"}
                    {name === "Rameses" && " (eleven pharaohs had this name)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ws-note">
            Accept any answer that gets the consonants right; the vowels are guesses
            for the Egyptians too. &ldquo;Tut&rdquo; uses the quail chick for U; pupils may
            read it as &ldquo;Twt&rdquo;, which is exactly how an Egyptologist writes it.
          </p>
        </div>

        <div className="ws-activity">
          <h2>
            <span className="ws-num">★</span> Challenge
          </h2>
          <p>Letters that share one sign (any three pairs):</p>
          <ul className="ws-pairs">
            {SHARED_SIGN_PAIRS.map(([pair, sign]) => (
              <li key={pair}>
                <strong>{pair}</strong>: {sign}
              </li>
            ))}
          </ul>
          <p>
            <strong>Why no E?</strong> Egyptian writing recorded only consonants; readers
            supplied the vowels from knowing the language, just as we can read
            &ldquo;txt msg&rdquo;. Egyptologists add an <em>e</em> between consonants by
            convention so that words can be spoken aloud.
          </p>
        </div>

        <div className="ws-activity">
          <h2>
            <span className="ws-num">⏱</span> 50-minute lesson outline
          </h2>
          <table className="ws-table ws-plan">
            <tbody>
              <tr>
                <td>Starter &middot; 10 min</td>
                <td>
                  Type a volunteer&apos;s name into the translator on the whiteboard
                  (learnhieroglyphics.com/translate-name-to-hieroglyphics). Class works
                  out the rules: no vowels, L = R.
                </td>
              </tr>
              <tr>
                <td>Main &middot; 25 min</td>
                <td>Pages 1&ndash;2 of this sheet. Fast finishers take the challenge.</td>
              </tr>
              <tr>
                <td>Plenary &middot; 10 min</td>
                <td>
                  Swap and decode a partner&apos;s cartouche. Discuss: how do we know how
                  Egyptian sounded? (Mostly we don&apos;t, hence Nefertiti, not Nfrtt.)
                </td>
              </tr>
              <tr>
                <td>Extension</td>
                <td>
                  Lesson one of the course (free with an account) teaches all 25 signs
                  with audio in ~25 minutes: learnhieroglyphics.com/get-started
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PageFooter page={3} forTeacher />
      </section>
    </main>
  );
}
