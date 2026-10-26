import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "How to run a classroom quiz session | Learn Hieroglyphics",
  description: "A printable one-page guide to running a live hieroglyph quiz with room codes: what to set up, what pupils need, timings and follow-up activities.",
  alternates: { canonical: "https://www.learnhieroglyphics.com/teachers/class/guide" },
};

const STEPS = [
  { t: "Before the lesson (5 min)", b: "Open learnhieroglyphics.com/teachers/class on the classroom computer and sign in (free; Google or email). Put the projector on. Check pupils can reach learnhieroglyphics.com on their phones or tablets; the join page is tiny and works on any browser." },
  { t: "Open the room (1 min)", b: "Click “Open a room”. A six-character code and the address learnhieroglyphics.com/play/CODE appear in large type. Leave them on screen." },
  { t: "Pupils join (3 min)", b: "In pairs or threes, one device per team. They open the address, type a team name (2–20 characters, no personal details needed) and tap Join. Names appear on the projector as they arrive; up to 60 teams." },
  { t: "Play (10–12 min)", b: "Click Start. Each of the ten questions shows on the projector with a 20-second countdown; teams tap one of four colour-and-shape buttons on their device. Fast correct answers score up to 1000 points, slower ones down to 500. Click “Reveal now” to end a question early, then “Next question”. The leaderboard updates after every question." },
  { t: "Podium (2 min)", b: "After question ten the podium appears with confetti. Screenshots welcome. Pupils see their own rank on their device." },
  { t: "Follow up", b: "Hand out the printable worksheet (learnhieroglyphics.com/teachers/worksheet) or put the name translator on the board and write the class’s names in cartouches." },
];

const QUESTIONS = ["Name the sign: what does this hieroglyph show? (owl, reed leaf, water ripple…)", "Animal signs: which of these four signs is the vulture / owl / horned viper?", "Spot the sound: which sound does this sign write?", "Royal names: whose name is in this cartouche? (Khufu, Cleopatra, Ramesses…)"];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-white text-[#1c1a17] print:bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8 print:py-4">
        <div className="no-print flex items-center justify-between mb-6">
          <Link href="/teachers/class" className="font-body text-sm text-[#8a6610] underline underline-offset-4">
            Classroom mode
          </Link>
          <PrintButton />
        </div>
        <p className="font-body text-xs tracking-[0.3em] uppercase text-[#8a6610]">Learn Hieroglyphics · for teachers</p>
        <h1 className="font-display text-3xl font-semibold mt-1 mb-2">How to run a classroom quiz session</h1>
        <p className="font-body text-sm text-[#5a5248] mb-6">A 20-minute live quiz on the hieroglyphic alphabet for KS2 and KS3. No pupil accounts, no app to install: a room code on the projector and any web browser.</p>

        <ol className="space-y-3 mb-6">
          {STEPS.map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span className="font-display text-xl text-[#8a6610] w-6 shrink-0">{i + 1}</span>
              <div>
                <p className="font-display text-base font-semibold">{s.t}</p>
                <p className="font-body text-sm text-[#3a342c] leading-relaxed">{s.b}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="font-display text-lg font-semibold mb-2">The four question types</h2>
        <ul className="list-disc pl-5 font-body text-sm text-[#3a342c] space-y-1 mb-6">
          {QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>

        <h2 className="font-display text-lg font-semibold mb-2">Good to know</h2>
        <ul className="list-disc pl-5 font-body text-sm text-[#3a342c] space-y-1 mb-6">
          <li>Rooms close themselves after three hours and all team names are deleted then. Nothing else about pupils is stored.</li>
          <li>A device that drops off the Wi-Fi can reopen the same address and carries on as the same team.</li>
          <li>Colour is never the only cue: every answer button also has a shape (▲ ◆ ● ■) and its text.</li>
          <li>Curriculum: the questions use the 25 uniliteral (“alphabet”) signs and real royal cartouches, the same content as the free first lesson at learnhieroglyphics.com/lessons/expedition-begins.</li>
        </ul>

        <p className="font-body text-xs text-[#7a7268]">Questions or a scheme-of-work tie-in: contact@learnhieroglyphics.com · Printed from learnhieroglyphics.com/teachers/class/guide</p>
      </div>
    </main>
  );
}
