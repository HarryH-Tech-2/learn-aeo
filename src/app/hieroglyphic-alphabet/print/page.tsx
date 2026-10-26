import type { Metadata } from "next";
import Link from "next/link";
import { ENGLISH_EQUIVALENT, GARDINER_CODES, UNILITERALS } from "@/components/AlphabetTable";
import PrintButton from "./PrintButton";

const BASE = "https://www.learnhieroglyphics.com";

// The chart on /hieroglyphic-alphabet as one A4 sheet, for learners who keep paper notes.
// Not a page of its own for search: it points at the chart page.
export const metadata: Metadata = {
  title: "Printable Hieroglyphic Alphabet Chart (A4)",
  description: "The 25 signs of the hieroglyphic alphabet on one printable A4 page, with sounds, English letters and room for notes.",
  alternates: { canonical: `${BASE}/hieroglyphic-alphabet` },
  robots: { index: false, follow: true },
};

export default function PrintableAlphabetPage() {
  return (
    <main className="worksheet">
      <div className="no-print ws-top">
        <div className="ws-toolbar">
          <div>
            <p className="font-display text-xl text-sand-100 mb-1">Printable alphabet chart</p>
            <p className="font-body text-sm text-sand-300">
              One A4 page, black on white, with a column for your own notes. Choose &ldquo;Save as PDF&rdquo; in the print
              window to keep a copy.
            </p>
          </div>
          <div className="ws-toolbar-actions">
            <Link href="/hieroglyphic-alphabet" className="btn-secondary py-3 px-5 text-sm">
              Back to the alphabet
            </Link>
            <PrintButton />
          </div>
        </div>
      </div>

      <section className="ws-page ap-page">
        <header className="ap-header">
          <h1 className="ap-title">The Hieroglyphic Alphabet</h1>
          <p className="ap-subtitle">
            25 signs, each for one consonant. Egyptologists write the sounds with the letters in the second column.
          </p>
        </header>
        <table className="ap-table">
          <thead>
            <tr>
              <th scope="col">Sign</th>
              <th scope="col">Sound</th>
              <th scope="col">Say</th>
              <th scope="col">English</th>
              <th scope="col">Picture</th>
              <th scope="col" className="ap-notes-col">Notes</th>
            </tr>
          </thead>
          <tbody>
            {UNILITERALS.map((g) => (
              <tr key={g.symbol}>
                <th scope="row">
                  <span className="glyph-font ap-glyph" lang="egy">
                    {g.symbol}
                  </span>
                  <span className="ap-code">{GARDINER_CODES[g.symbol]}</span>
                </th>
                <td className="ap-sound">{g.transliteration}</td>
                <td>&ldquo;{g.pronunciation}&rdquo;</td>
                <td>{ENGLISH_EQUIVALENT[g.symbol] ?? "–"}</td>
                <td>{g.meaning.split(/: | — /)[0]}</td>
                <td className="ap-notes" />
              </tr>
            ))}
          </tbody>
        </table>
        <footer className="ap-footer">
          <span>Read right to left or left to right: the signs face the start of the line.</span>
          <span>learnhieroglyphics.com/hieroglyphic-alphabet</span>
        </footer>
      </section>
    </main>
  );
}
