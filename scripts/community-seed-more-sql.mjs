/**
 * Prints INSERT statements for a second batch of Community board threads
 * (Sept–Oct 2026), so the board does not look like it stopped in September.
 * Same shape as scripts/community-seed-sql.mjs: fixed ids, no author rows,
 * ON CONFLICT DO NOTHING, so running it twice does nothing. Data only, not a
 * migration.
 *
 *   node scripts/community-seed-more-sql.mjs > scripts/community-seed-2026-10.sql
 *   npx prisma db execute --file scripts/community-seed-2026-10.sql --schema prisma/schema.prisma
 */

const Q = [
  {
    id: "seed2-q-01", at: "2026-09-20T10:42:00Z", by: "Tasha G.",
    title: "Homeschooling two kids (8 and 11) - how are you pacing it?",
    body: "We're doing ancient Egypt as our autumn topic. My 11 year old flew through the first lesson but my 8 year old gets frustrated when there are lots of new signs at once. Has anyone split the lessons up for younger children? How often do you do it?",
    answers: [
      { at: "2026-09-20T14:15:00Z", by: "Ruth A.", body: "I do it with my 9 year old. We do one section of a lesson a day, never more, and on the days in between she just writes her name and her brother's name on the whiteboard from memory. The name thing is what keeps her interested, she now labels everything in the house." },
      { at: "2026-09-21T08:30:00Z", by: "Dan R.", body: "For the younger one I'd pick five signs a week that appear in names in your family and ignore the rest until those are solid. The quail chick, the mouth, the bread loaf and the reed leaf turn up in almost everything." },
      { at: "2026-09-21T19:02:00Z", by: "Tasha G.", body: "Family-name signs first is a great idea, thank you both. Going to try that this week." },
    ],
  },
  {
    id: "seed2-q-02", at: "2026-09-22T21:05:00Z", by: "Marcus L.",
    title: "h, ḥ, ḫ and ẖ - four h's??",
    body: "ok so I've reached the bit where the transliteration has dots and little marks under the h. What is the actual difference between them, and which sign goes with which? I keep writing them all as plain h in my notes.",
    answers: [
      { at: "2026-09-22T22:40:00Z", by: "Lena F.", body: "They were four different sounds:\n\nh - the reed shelter (O4), an ordinary h as in 'house'\nḥ - the twisted wick of flax (V28), a stronger h from the throat, like the Arabic ḥ\nḫ - the round sign usually called the placenta or sieve (Aa1), 'ch' as in Scottish 'loch'\nẖ - the animal's belly with teats (F32), a softer version of that, like the German 'ich'\n\nIn your own notes it's fine to simplify, but keep the marks when you copy words out, because words can differ only by which h they use." },
      { at: "2026-09-23T07:55:00Z", by: "Marcus L.", body: "The belly one is ẖ?? I'd never have guessed that. Thanks, this is going on a sticky note above my desk." },
      { at: "2026-09-23T12:20:00Z", by: "Farah K.", body: "If it helps, the dot under ḥ and the line under ẖ just mean 'a different h'. The marks don't tell you how to say it, you have to learn that per letter. Same idea as the line under ḏ and ṯ." },
    ],
  },
  {
    id: "seed2-q-03", at: "2026-09-24T16:18:00Z", by: "Ewan J.",
    title: "Getting my dad's name as a tattoo, what should I check first?",
    body: "My dad Robert passed away in the spring and he loved Egypt. The translator gave me mouth, quail chick, foot, reed leaf, mouth, bread loaf. I want it in a cartouche on my forearm. Is there anything an artist usually gets wrong? I'd hate to have it backwards.",
    answers: [
      { at: "2026-09-24T18:47:00Z", by: "Priya M.", body: "Sorry about your dad. A few things I'd check:\n\n1. All the signs must face the same way, and that way is the start of the line. If you want it read left to right, the quail chick faces left.\n2. Artists sometimes flip one sign to 'balance' the design. Don't let them, a flipped bird in the middle reads as a mistake.\n3. If it runs vertically down the arm, read top to bottom, the signs still all face the same way.\n4. Take a full-size image or a printout to the studio rather than a cropped phone screenshot, the lines are cleaner." },
      { at: "2026-09-25T09:10:00Z", by: "Megan H.", body: "Also worth knowing: the cartouche was originally for kings, so purists will tell you a normal person shouldn't have one. Lots of people do it anyway as a tribute and I think it's a lovely use of it. Just know the history if anyone asks." },
      { at: "2026-09-26T20:33:00Z", by: "Ewan J.", body: "Thank you both, really. Booked in for next month, I'll take the printout and make sure the chick faces the right way." },
    ],
  },
  {
    id: "seed2-q-04", at: "2026-09-26T11:27:00Z", by: "Sofia R.",
    title: "Why does 'house' have a little stroke under it?",
    body: "In the lessons the house plan sign sometimes appears on its own with a single vertical stroke under it. Other times the same sign is inside a longer word with no stroke. Is the stroke a number? It's not one house is it",
    answers: [
      { at: "2026-09-26T13:50:00Z", by: "Callum D.", body: "Not a number, although it's the same shape as the numeral 1. Under a sign like that it means 'read this picture as the thing it shows'. So the house plan plus the stroke is the word pr, 'house'. Inside other words the same sign is just being used for its sound, pr, so it doesn't get the stroke." },
      { at: "2026-09-27T08:12:00Z", by: "Sofia R.", body: "Oh that's clever. So the stroke is basically telling me 'this one means what it looks like'." },
    ],
  },
  {
    id: "seed2-q-05", at: "2026-09-28T19:40:00Z", by: "Kwame A.",
    title: "Writing 1999 in Egyptian numerals, is this right?",
    body: "Trying to write the year my son was born for a card. I've got 1 lotus flower, 9 coils of rope, 9 hobbles and 9 strokes. That's 28 signs which seems like a lot? Also, did they have a zero?",
    answers: [
      { at: "2026-09-28T21:15:00Z", by: "Lena F.", body: "That's right: lotus = 1000, coil of rope = 100, hobble (the upside-down U) = 10, stroke = 1. 28 signs is just what it takes, the system adds signs up rather than using place value. Scribes stacked them in neat groups of three or four, so 9 strokes would be three rows of three, which makes it look a lot tidier than 28 in a line. Biggest units go first in the reading direction." },
      { at: "2026-09-29T10:02:00Z", by: "Pete M.", body: "No zero sign in the numbers themselves, because with additive numerals you never need one, you just leave that unit out. There are building and accounting records where the nfr sign is used to mark a zero level or a balance that comes to nothing, but that's not a digit like our 0. The numerals converter on the site will draw 1999 for you if you want to check your stacking." },
      { at: "2026-09-29T17:44:00Z", by: "Kwame A.", body: "Groups of three makes a massive difference, it looks properly Egyptian now. Thanks!" },
    ],
  },
  {
    id: "seed2-q-06", at: "2026-10-01T08:55:00Z", by: "Niamh O.",
    title: "Is Coptic worth learning alongside this?",
    body: "I've seen Coptic mentioned a few times as the 'last stage' of Egyptian. Would it help to learn some alongside hieroglyphs, or is it a totally separate thing? And where would you even start?",
    answers: [
      { at: "2026-10-01T12:30:00Z", by: "Tom W.", body: "It's the same language, just about 2,000 years later, written in the Greek alphabet plus a handful of extra letters taken from Demotic. The big win is that it writes vowels, so it's where a lot of our guesses about pronunciation come from. It's still used in the liturgy of the Coptic Church today." },
      { at: "2026-10-02T09:18:00Z", by: "Farah K.", body: "Most people start with the Sahidic dialect. Lambdin's Introduction to Sahidic Coptic is the classic beginner book, and Layton's grammar if you want something deeper later. I'd get comfortable with hieroglyphs first though, the vocabulary has changed a lot and it's easier to see the links once you know the older words." },
    ],
  },
  {
    id: "seed2-q-07", at: "2026-10-03T20:22:00Z", by: "Ollie P.",
    title: "hill slope vs basket vs jar stand - q, k, g",
    body: "These three get me every time in the games. I know one is q one is k and one is g but they're all sort of bumpy shapes to me. Help",
    answers: [
      { at: "2026-10-03T22:05:00Z", by: "Megan H.", body: "Basket with a handle = k (think 'kettle', it has a handle). Jar stand = g (think 'goblet' sitting on it). Hill slope = q, a k said further back in the throat. The hill is the one that looks like a little mound with a sharp edge, the basket is a half circle with a loop on the side." },
      { at: "2026-10-05T07:41:00Z", by: "Ollie P.", body: "kettle and goblet, perfect. got 10/10 on them in Fading Paint this morning" },
    ],
  },
  {
    id: "seed2-q-08", at: "2026-10-05T14:10:00Z", by: "Hannah C.",
    title: "Saw ḥtp-dj-nsw on a stela at the Ashmolean, what does it say?",
    body: "There was a limestone stela with a row of signs at the top that the label translated as 'an offering which the king gives'. I recognised the bread and the reed leaf but the plant at the very start confused me, because the label put 'king' in the middle of the sentence.",
    answers: [
      { at: "2026-10-05T17:36:00Z", by: "Dan R.", body: "That's the offering formula, the opening of nearly every Middle Kingdom stela. The plant is the sedge, nsw, 'king'. It's written first out of respect, even though it's read after: ḥtp dj nsw, 'an offering which the king gives'. Then you have the loaf on a reed mat for ḥtp (offering) and the triangular loaf for dj (gives). Egyptologists call writing a royal or divine word first 'honorific transposition'." },
      { at: "2026-10-06T10:20:00Z", by: "Hannah C.", body: "So the king jumps the queue in writing but not in reading. That explains the label!" },
      { at: "2026-10-07T08:48:00Z", by: "Lena F.", body: "And usually the next part names a god, often Osiris or Anubis, and then a list of what the dead person should receive: bread, beer, oxen, fowl. The Sacred Chapel lesson goes through the whole thing if you want to read the rest of your photo." },
    ],
  },
  {
    id: "seed2-q-09", at: "2026-10-07T21:30:00Z", by: "gemma_b",
    title: "daily puzzle streak - who's on one?",
    body: "just hit 21 days on the daily puzzle without missing one 🙌 my husband thinks I've joined a cult. anyone higher? also is it just me or was yesterday's really hard",
    answers: [
      { at: "2026-10-07T22:12:00Z", by: "Pete M.", body: "18 here. Yesterday's took me five goes, you're not alone." },
      { at: "2026-10-08T06:58:00Z", by: "Rachel T.", body: "Lost mine at 30-something on holiday with no signal. Still bitter. The archive is good for practice on the days I want more than one though." },
      { at: "2026-10-09T19:25:00Z", by: "gemma_b", body: "noooo 30 is heartbreaking. ok aiming for 31 to avenge you" },
    ],
  },
  {
    id: "seed2-q-10", at: "2026-10-10T09:15:00Z", by: "Diego S.",
    title: "How much did Champollion actually get from the Rosetta Stone?",
    body: "Everyone says the Rosetta Stone 'cracked' hieroglyphs, but the hieroglyphic part is broken off at the top. Did he really work it all out from that one stone?",
    answers: [
      { at: "2026-10-10T13:44:00Z", by: "Priya M.", body: "Not from that one stone. The Rosetta Stone is a priestly decree from 196 BC for Ptolemy V, in hieroglyphs, Demotic and Greek. Its value was the Greek: it proved the three texts said the same thing, and the cartouches had to contain Ptolemy's name. Thomas Young had already guessed that much.\n\nChampollion then compared Ptolemy with the name Cleopatra from an obelisk found at Philae. The two names share p, t, l and o, and the signs matched, which gave him a set of sound values. The real breakthrough in 1822 was with copies of temple cartouches like Ramesses and Thutmose, which showed the script mixed sound signs with signs for whole words. His knowledge of Coptic is what let him recognise the words." },
      { at: "2026-10-11T08:03:00Z", by: "Diego S.", body: "So the stone was the key to the door but not the whole house. Great answer, thank you." },
    ],
  },
  {
    id: "seed2-q-11", at: "2026-10-12T17:50:00Z", by: "Ines D.",
    title: "How do you type ꜣ and ꜥ for your notes?",
    body: "I keep my vocab in a spreadsheet and copying ꜣ and ꜥ from websites every time is driving me mad. What do people use?",
    answers: [
      { at: "2026-10-12T20:31:00Z", by: "Marcus L.", body: "A lot of people use the Manuel de Codage letters: A for ꜣ, a for ꜥ, H for ḥ, x for ḫ, X for ẖ, S for š, D for ḏ, T for ṯ, q for the hill-slope q. Ugly but fast, and you can find-and-replace later." },
      { at: "2026-10-13T09:05:00Z", by: "Farah K.", body: "Or set up text replacement on your phone/laptop, e.g. typing ;3 gives ꜣ and ;a gives ꜥ. They're in Unicode (ꜣ is U+A723, ꜥ is U+A725), so they'll show in any spreadsheet with a decent font." },
    ],
  },
  {
    id: "seed2-q-12", at: "2026-10-14T12:08:00Z", by: "Josie L.",
    title: "Tutankhamun's cartouche starts with Amun?",
    body: "In the Royal Hall lesson the cartouche begins with the reed leaf, game board and water (jmn, Amun) and THEN twt and the ankh. But the name is Tut-ankh-amun, not Amun-tut-ankh. Is the order just flexible?",
    answers: [
      { at: "2026-10-14T15:22:00Z", by: "Hannah C.", body: "Same thing I asked about on the stela! It's honorific transposition: the god's name goes first out of respect, but you read it in its proper place. So it's written jmn twt ꜥnḫ but read twt-ꜥnḫ-jmn, 'living image of Amun'." },
      { at: "2026-10-15T08:40:00Z", by: "Callum D.", body: "And on a lot of his monuments there's more inside the cartouche after that, ḥqꜣ jwnw šmꜥ, 'ruler of Upper Egyptian Heliopolis'. Look for the crook sign (ḥqꜣ) near the end." },
      { at: "2026-10-15T21:16:00Z", by: "Josie L.", body: "Found the crook on a photo of one of his cartouches. This is the best feeling." },
    ],
  },
  {
    id: "seed2-q-13", at: "2026-10-17T15:30:00Z", by: "Mr Whitfield",
    title: "Did scribes really write all these pictures on papyrus?",
    body: "A Year 3 pupil asked me today whether Egyptians wrote little birds and owls every time they wrote a shopping list. I said I'd find out. Did they?",
    answers: [
      { at: "2026-10-17T18:12:00Z", by: "Ruth A.", body: "Mostly no. For everyday writing on papyrus scribes used hieratic, a quick joined-up form of the same signs written with a reed brush, a bit like our handwriting versus capital letters. Full hieroglyphs were for monuments, tombs and special religious texts. Later on (from about 650 BC) there was an even faster script called Demotic, which is the middle text on the Rosetta Stone." },
      { at: "2026-10-18T09:30:00Z", by: "Mr Whitfield", body: "Perfect, that's exactly the level they'll enjoy. The 'handwriting versus capitals' comparison will go down well." },
    ],
  },
  {
    id: "seed2-q-14", at: "2026-10-19T20:45:00Z", by: "Aiyana W.",
    title: "Why is there a duck before the second cartouche?",
    body: "On a photo of a temple wall I can see two cartouches next to each other. Before the second one there's a duck and a circle. Is that part of the name?",
    answers: [
      { at: "2026-10-20T07:14:00Z", by: "Lena F.", body: "Not part of the name, it's a title: sꜣ rꜥ, 'son of Ra'. The duck is the pintail duck, sꜣ (son), and the circle with a dot is the sun, Ra. It always introduces the king's birth name, the second cartouche. The first cartouche is the throne name, usually introduced by the sedge and bee, 'king of Upper and Lower Egypt'." },
    ],
  },
  {
    id: "seed2-q-15", at: "2026-10-22T11:02:00Z", by: "Kev",
    title: "Anyone else got a Luxor trip coming up?",
    body: "Going to Luxor in February, Karnak, Valley of the Kings, the lot. Hoping to be through at least the Royal Hall lesson by then so I can pick out cartouches. Any tips on which tombs have the clearest inscriptions for a beginner?",
    answers: [],
  },
  {
    id: "seed2-q-16", at: "2026-10-24T18:20:00Z", by: "Farah K.",
    title: "What's the difference between the arm (ꜥ) and the vulture (ꜣ)?",
    body: "Both get described as 'a sort of a' sound in beginner books. I know they're different letters but if both are vowel-ish, why does it matter which one a word uses?",
    answers: [
      { at: "2026-10-25T09:37:00Z", by: "Tom W.", body: "Neither was really a vowel, they're both consonants we don't have in English. The vulture (ꜣ) was probably an r- or l-like sound early on and later a glottal stop, and the arm (ꜥ) is the ayin, a sound made by squeezing the throat, as in Arabic. Egyptologists just say 'ah' for both to keep it simple. It matters because they're separate letters: swap them and you get a different word, or no word at all." },
    ],
  },
];

const esc = (s) => "'" + s.replace(/'/g, "''") + "'";
const lines = ["-- Community board, second batch of threads (Sept–Oct 2026). Data only; no author rows; names only."];
for (const q of Q) {
  if (q.title.length > 120 || q.body.length > 2000) throw new Error(`too long: ${q.id}`);
  let last = q.at;
  lines.push(`INSERT INTO "CommunityQuestion" ("id", "authorId", "authorName", "title", "body", "createdAt", "updatedAt") VALUES (${esc(q.id)}, NULL, ${esc(q.by)}, ${esc(q.title)}, ${esc(q.body)}, ${esc(q.at)}, ${esc(q.at)}) ON CONFLICT ("id") DO NOTHING;`);
  q.answers.forEach((a, i) => {
    if (a.body.length > 2000) throw new Error(`too long: ${q.id}-a${i + 1}`);
    if (a.at <= last) throw new Error(`out of order: ${q.id}-a${i + 1}`);
    last = a.at;
    lines.push(`INSERT INTO "CommunityAnswer" ("id", "questionId", "authorId", "authorName", "body", "createdAt") VALUES (${esc(`${q.id}-a${i + 1}`)}, ${esc(q.id)}, NULL, ${esc(a.by)}, ${esc(a.body)}, ${esc(a.at)}) ON CONFLICT ("id") DO NOTHING;`);
  });
}
process.stdout.write(lines.join("\n") + "\n");
