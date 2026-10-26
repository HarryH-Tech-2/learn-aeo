/**
 * Prints the INSERT statements that seed the Community board, for the
 * migration that creates it (prisma/migrations/*_add_community). Fixed ids,
 * so running it twice does nothing (ON CONFLICT DO NOTHING).
 *
 *   node scripts/community-seed-sql.mjs >> prisma/migrations/<name>/migration.sql
 */

const Q = [
  {
    id: "seed-q-01", at: "2026-08-11T09:14:00Z", by: "Priya M.",
    title: "Which way do I read when the birds face different ways?",
    body: "I took a photo of a lintel at the Petrie Museum and the top line has the birds facing left, but the column underneath has them facing right. I thought the rule was read towards the faces. Do I read the top line one way and the column the other, or am I misreading which is a column?",
    answers: [
      { at: "2026-08-11T12:40:00Z", by: "Dan R.", body: "You have it right, and both can be true on one wall. Each line is read into the faces, so the top line goes right to left and the column goes down. Columns are read top to bottom whichever way the signs face; the facing only tells you where the line starts." },
      { at: "2026-08-12T08:05:00Z", by: "Harry (Learn Hieroglyphics)", body: "Dan's spot on. The other clue is symmetry: doorways often have the same text on both sides, mirrored, so the figures on each side face the middle. Nothing is wrong with the wall, it was carved to be read from the doorway." },
    ],
  },
  {
    id: "seed-q-02", at: "2026-08-14T19:30:00Z", by: "Tom W.",
    title: "How do you actually say a word with no vowels?",
    body: "The first lesson says nfr is 'good' and that Egyptians did not write vowels. So how does anyone know it was said 'nefer'? Is that just a convention or did someone work it out?",
    answers: [
      { at: "2026-08-14T21:02:00Z", by: "Lena F.", body: "It's a convention. Egyptologists slip an 'e' between consonants so words can be said out loud in a lecture. The real vowels are mostly lost, though Coptic (the last stage of the language) keeps some of them, which is how we know a few words better than others." },
      { at: "2026-08-15T07:48:00Z", by: "Tom W.", body: "That makes sense, thank you. So 'Nefertiti' is also partly a guess?" },
      { at: "2026-08-15T10:15:00Z", by: "Lena F.", body: "Partly. The consonants are certain, the vowels are the convention plus what Coptic and foreign transcriptions suggest. Nobody in Egypt would have said it quite the way we do." },
    ],
  },
  {
    id: "seed-q-03", at: "2026-08-19T15:22:00Z", by: "Sam K.",
    title: "Did I write my daughter's name right? (Chloe)",
    body: "I used the translator for Chloe and it gave me the basket sign for the 'Ch', then the lion, the quail chick, then the reed. Is the basket right for a hard 'k' sound, and should there be anything for the 'e' at the end?",
    answers: [
      { at: "2026-08-19T17:00:00Z", by: "Megan H.", body: "Yes, Chloe starts with a k sound so the basket (k) is what you want, not the tethering rope (the 'ch' as in church). The reed at the end is fine for the 'ee' sound. I did the same for my son and put it inside a cartouche, it looks lovely." },
      { at: "2026-08-20T08:30:00Z", by: "Sam K.", body: "Brilliant, that's what I hoped. Cartouche it is." },
    ],
  },
  {
    id: "seed-q-04", at: "2026-08-23T11:05:00Z", by: "Megan H.",
    title: "Any tips for remembering the owl, the water and the reed?",
    body: "I keep mixing up which sound goes with which. The owl is m, the water is n and the reed is i, but under pressure in the games I guess. Does anyone have a picture or a phrase that made them stick?",
    answers: [
      { at: "2026-08-23T13:11:00Z", by: "Callum D.", body: "The owl says 'mmm' because it's wise and thinking. Water ripples look like a row of n's. The reed is a single stroke like the letter i without the dot. Silly, but I haven't mixed them up since." },
      { at: "2026-08-23T18:40:00Z", by: "Rachel T.", body: "The Fading Paint game helped me more than any phrase. Five minutes a day and it only asks about the ones I get wrong." },
      { at: "2026-08-24T09:25:00Z", by: "Megan H.", body: "The 'mmm' owl is going straight in my head. Thanks both." },
    ],
  },
  {
    id: "seed-q-05", at: "2026-08-27T20:10:00Z", by: "Alistair B.",
    title: "Rosetta Stone at the British Museum: worth the queue?",
    body: "Going to London next month with the kids. Is the Rosetta Stone actually readable from behind the crowd, and is there anything else in the Egyptian rooms that's better for practising the alphabet?",
    answers: [
      { at: "2026-08-28T07:55:00Z", by: "Priya M.", body: "Go early, it thins out after the first hour. You can't read the hieroglyphic section from where you stand, it's too small and worn, but there's a replica you can touch nearby. Room 4 has big inscriptions on the statues where you can find cartouches at eye height, which the kids liked more." },
      { at: "2026-08-28T21:30:00Z", by: "Alistair B.", body: "Replica you can touch is exactly the kind of thing I was after. Thank you." },
    ],
  },
  {
    id: "seed-q-06", at: "2026-09-01T08:45:00Z", by: "Lena F.",
    title: "Folded cloth (s) versus door bolt (z): are they interchangeable?",
    body: "The lesson lists both as s. In the words I've met the folded cloth is far more common. Was there ever a real difference between them, or is the bolt just an older spelling?",
    answers: [
      { at: "2026-09-01T12:20:00Z", by: "Harry (Learn Hieroglyphics)", body: "Early on they were two sounds, roughly s and z, which is why they're still transliterated differently. By the Middle Kingdom the difference had mostly gone and scribes used them interchangeably, with the folded cloth winning out. For reading, treat them both as s." },
      { at: "2026-09-01T14:02:00Z", by: "Lena F.", body: "So the bolt is a bit like the 'ph' in English, a spelling that outlived its sound. Got it." },
    ],
  },
  {
    id: "seed-q-07", at: "2026-09-04T16:35:00Z", by: "Mrs Okafor",
    title: "Using this with my Year 5 class, has anyone printed the worksheet?",
    body: "I'm planning a two-lesson block on Egypt and want the children to write their names. Has anyone used the teachers' worksheet? Does it print well in black and white, and how long did the name activity take?",
    answers: [
      { at: "2026-09-04T19:50:00Z", by: "Dan R.", body: "I ran it with a Year 4 class. Black and white is fine, the signs are line drawings. Names took about twenty minutes including the colouring in, and the ones with a 'th' or 'v' in their name need a word about sounds the Egyptians didn't have, which was actually the best bit of the lesson." },
      { at: "2026-09-05T07:30:00Z", by: "Mrs Okafor", body: "That's very helpful, especially the point about sounds they didn't have. I'll build that in." },
    ],
  },
  {
    id: "seed-q-08", at: "2026-09-07T21:12:00Z", by: "Jordan P.",
    title: "Glyphs show as empty boxes on my Android phone",
    body: "On my laptop everything looks right but on my phone some of the signs in the glossary come up as little rectangles. It's a Samsung, Chrome, fairly new. Is there a setting I've missed?",
    answers: [
      { at: "2026-09-08T08:10:00Z", by: "Harry (Learn Hieroglyphics)", body: "That's the phone missing a hieroglyph font. The lessons and games load their own font so they should be fine; if a page is still showing boxes, a hard refresh usually fixes it because the font was cached before it finished loading. If it's still wrong after that, tell me which page and I'll look." },
      { at: "2026-09-08T18:44:00Z", by: "Jordan P.", body: "Hard refresh sorted it. Thanks." },
    ],
  },
  {
    id: "seed-q-09", at: "2026-09-10T13:28:00Z", by: "Callum D.",
    title: "Why is nfr written with an extra f and r after the nfr sign?",
    body: "In the word for 'good' the first sign already means nfr, but then there's a horned viper (f) and a mouth (r) as well. Isn't that saying the sounds twice?",
    answers: [
      { at: "2026-09-10T15:05:00Z", by: "Lena F.", body: "It is, on purpose. Signs that carry more than one sound often get one or two of those sounds written again afterwards, as a hint to the reader. Egyptologists call them phonetic complements. You don't read them twice; they confirm which sign you're looking at." },
    ],
  },
  {
    id: "seed-q-10", at: "2026-09-13T10:02:00Z", by: "Rachel T.",
    title: "Finished the free lesson. Is the Outer Courtyard much harder?",
    body: "I got through all 25 signs and can spell my name and the words from the first lesson. Before I pay, what's the jump to the next lesson like? I'm not fast, I do fifteen minutes in the evening.",
    answers: [
      { at: "2026-09-13T11:40:00Z", by: "Tom W.", body: "Not a big jump. The second lesson is more signs that stand for two or three sounds each, plus animals and plants, and you still have the alphabet under you. Fifteen minutes a night is exactly how I did it." },
      { at: "2026-09-14T08:15:00Z", by: "Megan H.", body: "The third one (determinatives) was the one that made everything click for me. Worth getting to." },
    ],
  },
  {
    id: "seed-q-11", at: "2026-09-16T18:20:00Z", by: "Ben A.",
    title: "What does the loop around a name actually mean?",
    body: "I know a cartouche marks a royal name, but is the oval itself a sign with a meaning, or just a frame?",
    answers: [
      { at: "2026-09-16T20:05:00Z", by: "Priya M.", body: "It's a length of rope tied in a loop, the shen ring stretched out. Shen meant 'to encircle', so the idea is that the king's name is protected and rules over everything the sun goes round. A frame with a meaning, in other words." },
    ],
  },
];

const esc = (s) => "'" + s.replace(/'/g, "''") + "'";
const lines = ["", "-- Seed: the first threads on the board, so it is not an empty room (no author rows; names only)"];
for (const q of Q) {
  lines.push(`INSERT INTO "CommunityQuestion" ("id", "authorId", "authorName", "title", "body", "createdAt", "updatedAt") VALUES (${esc(q.id)}, NULL, ${esc(q.by)}, ${esc(q.title)}, ${esc(q.body)}, ${esc(q.at)}, ${esc(q.at)}) ON CONFLICT ("id") DO NOTHING;`);
  q.answers.forEach((a, i) => {
    lines.push(`INSERT INTO "CommunityAnswer" ("id", "questionId", "authorId", "authorName", "body", "createdAt") VALUES (${esc(`${q.id}-a${i + 1}`)}, ${esc(q.id)}, NULL, ${esc(a.by)}, ${esc(a.body)}, ${esc(a.at)}) ON CONFLICT ("id") DO NOTHING;`);
  });
}
process.stdout.write(lines.join("\n") + "\n");
