# The Causeway of Thoth (prototype)

Lesson 1 as a game, from zero. The whole twelve-level game is dev only: `/dev/platformer` exists under `next dev` and returns 404 in a production build. Level 1 alone is live on the site: `/lessons/expedition-begins` mounts `game/Game` with `mode="lesson"` (see `src/app/lessons/[id]/LessonContent.tsx`), where the finish card offers level 2 to everyone: a learner who has paid (`paid` prop, from `/api/stripe/check-subscription`) plays on through the levels, anyone else is told level 2 onwards is paid and only a yes goes to the checkout (`onUpgrade`). `game.begin` refuses any level past the first until `paid` is true, and the `__causeway` console aids are not registered in production. Khety’s recorded lines and the sign sounds live in `public/dev-audio/`.

- Loading: the stone textures are worked out in workers (`game/textureMath.ts`, `game/textures.worker.ts`), every place but the causeway is a lazy chunk (`game/places/index.tsx`), the physics has a Suspense of its own so the river shows first, and the lesson page starts the game chunk and the models downloading as soon as it opens.
- No new dependencies: three, @react-three/fiber, drei and rapier were already installed.
- It reads from the app but nothing in the app reads from it: the lesson content
  (`@/lib/content/uniliteral-words`, `uniliterals`, `door-name`), the `SignState` type, `@/lib/speech`, global styles and the hieroglyph font.
- It calls one existing API, `/api/srs`: GET to find the signed-in learner's weakest signs, and POST at the finish to file
  how each sign went (a real review entry). Guests get a lucky dip and nothing is written.
- Models come from `public/models` (already shipped for the lessons).
- Nothing else in the app links to or imports from this folder.

## Twelve levels, eight kinds of place

Only level 1 is the causeway. After it, each level is played in the place that suits what it teaches. The table that
decides this is `PLACES` in `game/lesson.ts`: change a level's place there and the plan, the briefing and the scene follow.

| Level | Place (`Layout`) | What is played | What it is for |
| --- | --- | --- | --- |
| 1 | `causeway` | Platforming across pillars in the Nile; tablets, beams of light, the temple gate | The learner's own name: signs are sounds |
| 2, 8 | `felucca` | The boat sails on its own; steer through the arch that carries the sign for the called sound | Fast sound-to-sign recognition (idea: no vowels) |
| 3, 9 | `workshop` | A calm grid puzzle: push sign blocks into a cartouche, first sound first; Z undoes, R resets | Spelling order without reflexes (idea: silent pictures) |
| 4, 10 | `tomb` | On foot in the dark with a lamp; slabs carry signs; a wall of figures and a column decide which slab is real | Reading direction, columns top down (idea: which way to read) |
| 5, 11 | `market` | Carry goods from the quay to the stall that hangs out the right sign or silent picture; old orders at the end | Determinatives by meaning (idea: what kind of word?) |
| 6 | `brush` | Drag to brush sand off a wall, then read what is uncovered: sign shown, sound chosen | From spelling to reading |
| 7 | `passage` | An auto-run with two doors per wall and the roof coming down behind; five old signs come back | Review, fast |
| 12 | `wall` | Climb a wall of four lines: start each at the end its figures face, then take the hold with each sign's sound | The final test, read unaided; Khufu's name is the top line |

Every place reads the same `LevelPlan` and answers through the same path, so the bar at the top, the teaching card, the
finish card, the campaign save and the review filing work the same everywhere:

- `game/lesson.ts` (pure, tested in `lesson.test.ts`): signs, phrases, `LEVELS`, `LAYOUTS` (the words each place uses in
  the HUD), `planLevel` (stations, reviews; the market's silent pictures and old orders; the last wall's lines).
- `game/answers.ts`: `teach`, `answer`, `answerReview`, `slip`, `finished`, `complete`. A scene decides HOW a choice is
  made; what it means is decided here.
- `game/kit.tsx`: canvas faces (`useFace`), `Tablet`, `Plaque`, `TeachBeam`/`BeamOfLight`, `WordSlab`.
- `game/Light.tsx` (`Daylight`, `Indoors`), `game/Avatar.tsx` (`Explorer`, and `Walker` for places with no physics),
  `game/controls.ts` (keyboard), `game/Player.tsx` (the physics explorer: causeway, tomb, market).
- `game/places/*.tsx`: one file per place, mounted by `Game.tsx` with a key of layout and run, so every run is a fresh mount.

How it teaches (unchanged in spirit):

- **Teach before asking.** A new sign is first met in a way that cannot be failed or missed: a beam of light on foot, a
  band of light across the river, the first bump of a block, the moment the brush uncovers it, a quiet stretch of the
  passage. `answer()` refuses a station whose sign has not been met.
- **One idea per level**, in a briefing before the run, stated where the place that teaches it first appears. A second
  visit to a place only says how the place works.
- **Silent pictures** are asked for from level 3; in the market every word is asked for its picture, with three stalls to choose from.
- **Names use letters, words use real sounds**, and old signs return as reviews, as before.
- **Gentle mode** (title screen): forgiving falls on the causeway, a slower river, and a passage that never catches you.

Company and help while playing (added 2026-09-17, second pass):

- **Khety the mummy** (`game/Mascot.tsx` draws him in SVG, `game/khety.ts` holds his lines, tested). He sees the learner
  off at the start of a run, reacts in the corner to right and wrong answers (more for three, five and eight in a row),
  announces new signs, and congratulates by name on the finish card. He never teaches: facts stay in the messages and cards.
- **He can be talked to.** Click him (or press K) for a small menu: a hint for whatever is wanted now (it names the
  picture to look for, or rules a sound out; never the tablet to take; hints are counted on the finish card), the sound
  again, the sign list, or something true about Egypt. Clicks in quick succession are pokes: he is ticklish.
- **Two voices** (`game/voice.ts`). By default this is the browser's own speech (the Web Speech API), which is only as
  good as the voices the machine has: natural in Edge, robotic in Chrome on Windows. A voice picker (title screen and
  sign list) chooses among what is installed. For a voice that is good everywhere, record clips: every fixed line is
  listed by `spokenLines()` with a key; put the files in `public/dev-audio/` with a `manifest.json` of key to file name,
  and they are played instead of the browser's speech. (That folder is the one thing outside this folder; none exist yet.)
- **Sign list** (button top left, or G; Esc closes): all 25 signs with sound, picture, how it is said and a hook, the
  silent pictures, and the four rules of the script. The run is paused while it is open (`status: "paused"`, the clock
  leaves the pause out) and the finish card says how often it was opened.
- The briefing and the finish card scroll as a whole and their text can be selected.
- **The river has banks** (`game/places/Riverbank.tsx`): reed and papyrus beds, lily pads, fields in strips with ditch
  lines between them, palm groves, sycamores and acacias, mud-brick villages with awnings, beehive granaries, low walls,
  grain heaps and cooking smoke, shadufs, a sphinx avenue and shrine, a colonnaded temple with a landing stage, two
  seated colossi, moored boats and papyrus skiffs, cattle, geese, egrets that dip and a skein of ibises.
  - The banks are built from a `RiverPlan` (where the water's edge is, which way the river bends, what stands where and
    how much of it). There are two: `FELUCCA_RIVER` for level 2 and `CAUSEWAY_RIVER` for level 1, which follows
    `riverCentre` and is wide enough for the course. The causeway turns the shared palm groves off
    (`<Landscape groves={false}>`), since they would stand half buried in its banks.
  - Cost: reeds, pads, houses, trees and heaps are instanced, and so are palms (`PalmStand` in `Scenery.tsx`: six shapes
    of tree, only the stand by the water casts shadows). Reed stalks are three-sided and cast no shadow; geese and jars
    cast none either (every GLB is some 6,000 triangles, drawn again to cast one). The smoke is soft-edged sprites that
    darken what is behind them, because the sky is brighter than white before tone mapping and a pale puff blended the
    usual way cannot be seen against it.
- **The picture steps down on a slow GPU** (`game/Post.tsx`): under 40 frames a second for two seconds running and it
  gives up MSAA, then resolution (to 80%, then 62%). It never steps back up within a visit.

Progress (name, level reached, signs known) is saved in `localStorage` under `lh:causeway:v1` only. It deliberately does
not mark Lesson 1 complete or touch lesson progress, certificates or offers.

## Dev aids

In the browser console: `__causeway.unlock()` opens every level with every sign known; `__causeway.begin(n)` then
`__causeway.play()` starts level n+1; `__causeway.state()`, `__causeway.pos()`, `__causeway.input`. On foot,
`__causeway.go(x, y, z, yaw?)` teleports (yaw π looks back down the course), `await __causeway.info()` is the draw calls
and triangles of a frame, `__causeway.quality()` the step the picture has come down to, and `__causeway.scene` the
three.js scene. In every place but the causeway, `__causeway.place.auto()` makes the next correct
thing happen through the same code a player's input ends in (call it repeatedly to walk a level through).

## Not verified

Checked in a headless browser, which runs at a few frames a second: every place completes from briefing to finish
card, and real input was tried for the river, the workshop, the brush and the wall. Frame rate was measured for levels 1
and 2 only, in a visible window at 1440 × 810 on an integrated AMD Radeon, dev build: level 1 about 43 a second after
stepping down to no MSAA and 80% resolution (about 16 before the banks were made cheaper), level 2 about 56 with MSAA
off. No discrete GPU, phone or production build has been measured. Touch controls, speech,
the feel of each place at full speed, narrow screens for the new places and the signed-in `/api/srs` path have not been
checked by hand.

To delete it: remove `src/app/dev/platformer`. If `src/app/dev` is then empty, remove that too.
