"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { senderFrom } from "@/lib/referral";
import { reveal } from "@/components/reveal";
import Link from "next/link";
import AlphabetTable from "@/components/AlphabetTable";
import Price from "@/components/Price";
import Navbar from "@/components/Navbar";
import GuestPlayBanner from "@/components/GuestPlayBanner";
import NameLessonAsk from "@/components/NameLessonAsk";
import Footer from "@/components/Footer";
import NameCardStudio from "@/components/NameCardStudio";
import { EmailMyCartouche, KeepNameBar, PharaohTitle } from "@/components/TranslatorExtras";
import ClassVisitStrip from "@/components/ClassVisitStrip";
import { useAuthPrompt } from "@/components/useAuthPrompt";
import AuthPromptCard from "@/components/AuthPromptCard";
import { trackEvent } from "@/lib/analytics";
import { lessonHrefForName, FREE_LESSON_PATH } from "@/lib/translator-bridge";
import { embedSnippet, type EmbedTheme } from "@/lib/share";
import NameTranslatorTool from "@/components/NameTranslatorTool";
import TranslatorBackdrop from "@/components/TranslatorBackdrop";
import FreeCourseCta from "@/components/FreeCourseCta";
import { useFreeCourseGuest } from "@/components/useFreeCourseGuest";
import NameToolLinks from "@/components/NameToolLinks";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { transliterateName, type TransliterationResult } from "@/lib/hieroglyph-translator";

// three.js is only fetched when the visitor asks for the 3D view.

type Props = {
  /** Pre-written name for shared links (/translate-name-to-hieroglyphics/<name>). */
  initialName?: string;
};

/** A link from "Send a friend their name" (src/lib/referral.ts): who wrote this name out, read from ?from= after mount. */
function FriendSentBanner({ name }: { name: string }) {
  const [from, setFrom] = useState<string | null>(null);
  useEffect(() => {
    const sender = senderFrom(window.location.search);
    setFrom(sender);
    if (sender) trackEvent("referral_open", { name_length: name.trim().length });
  }, [name]);
  if (!from) return null;
  return (
    <div role="note" className="mb-6 border border-gold-500/40 bg-gold-500/10 px-5 py-4 text-center">
      <p className="font-display text-xl text-sand-100">
        <span className="text-gold-300">{from}</span> wrote your name in Egyptian hieroglyphs
      </p>
      <p className="mt-1 font-body text-sm text-sand-300">
        Here it is, {name.trim()}, the way a scribe would have carved it. The breakdown below shows the sound of every sign. Then send someone
        their own.
      </p>
    </div>
  );
}

export default function TranslateContent({ initialName = "" }: Props) {
  const [name, setName] = useState(initialName);
  const freeGuest = useFreeCourseGuest();
  const [results, setResults] = useState<TransliterationResult[] | null>(() =>
    initialName.trim() ? transliterateName(initialName) : null
  );
  const [embedTheme, setEmbedTheme] = useState<EmbedTheme>("dark");
  const [embedCopied, setEmbedCopied] = useState(false);
  const copyEmbed = async () => {
    const html = embedSnippet(embedTheme);
    try {
      await navigator.clipboard.writeText(html);
      setEmbedCopied(true);
      window.setTimeout(() => setEmbedCopied(false), 2200);
    } catch {
      // Clipboard blocked: select the code in the box so they can copy it.
      const box = document.querySelector<HTMLTextAreaElement>("#embed textarea");
      box?.focus();
      box?.select();
    }
    trackEvent("embed_copy", { theme: embedTheme });
  };
  const prompt = useAuthPrompt("translator_complete");
  const distinctSigns = results ? new Set(results.map((r) => r.mapping.glyph)).size : 0;
  const lessonHref = results ? lessonHrefForName(name, results) : FREE_LESSON_PATH;

  return (
    <main className="grain-overlay">
      <TranslatorBackdrop />
      {/* Everything sits over the fixed backdrop, so the footer and other unpositioned blocks paint above it */}
      <div className="relative z-[1]">
      <Navbar />
      {results && results.length > 0 && <KeepNameBar name={name.trim()} glyphs={results.map((r) => r.mapping.glyph).join("")} />}

      <div className="min-h-screen pt-24 md:pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 is-inview">
          {/* Only for visits from a school's learning platform */}
          <ClassVisitStrip className="mb-10" />

          <LanguageSwitcher page="translator" current="en" className="justify-center mb-4 md:mb-6" />

          {/* Header */}
          <div className="reveal text-center mb-8 md:mb-12" style={reveal(0, { y: 20 })}>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-sand-100 mb-4 md:mb-6">
              Write Your Name in{" "}
              <span className="text-gradient-gold font-medium">
                Hieroglyphics
              </span>
            </h1>
            <p className="font-body text-lg text-sand-400 font-light max-w-2xl mx-auto">
              Type your name below to see it transliterated into ancient
              Egyptian hieroglyphs using the same signs carved into temple walls
              over 3,000 years ago.
            </p>
          </div>

          {initialName && <FriendSentBanner name={initialName} />}

          <NameTranslatorTool
            initialName={initialName}
            onChange={(n, r) => {
              setName(n);
              setResults(r);
            }}
            afterCartouche={(n, r) => (
              <>
                {/* Before anyone scrolls away: the cartouche by email (it went quiet when the lesson card sat above it) */}
                <EmailMyCartouche name={n.trim()} />
                {/* Then, while the name is still on screen: read it yourself in Lesson 1, no sign-up */}
                <NameLessonAsk name={n} results={r} />
                <PharaohTitle name={n.trim()} />
                {/* The name as a picture or a print, in one box: backgrounds, gift cards, keep it by email or in HD,
                    send it as a puzzle, or order it printed on the same scene (Stripe, no account) */}
                <NameCardStudio name={n.trim()} />
              </>
            )}
          />

          {/* The game being played, for everyone who scrolls on, name typed or not */}
          <div className="mt-16 -mb-8">
            <GuestPlayBanner location="translator" name={name} game />
          </div>

          {/* Teacher callout */}
          <div className="mt-16 border border-gold-500/30 bg-gold-500/5 p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="flex-1">
              <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-2">
                Teaching Ancient Egypt?
              </p>
              <p className="font-body text-sm text-sand-300 leading-relaxed">
                Get the free printable worksheet (alphabet chart, write-your-name
                cartouche, names to decode and an answer key) plus a ready-made
                50-minute lesson. No pupil accounts needed.
              </p>
            </div>
            <Link href="/teachers" className="btn-secondary py-3 px-6 text-sm whitespace-nowrap">
              Teacher resources
            </Link>
          </div>

          {/* The other name tools: pets, couples, tattoo stencils, the gift */}
          <NameToolLinks current="translator" className="mt-16" />

          {/* Educational content — always visible, good for SEO */}
          <div className="mt-16 pt-12 border-t border-gold-700/20">
            <h2 className="font-display text-3xl font-semibold text-sand-100 mb-8 text-center">
              How Does Name Translation{" "}
              <span className="text-gradient-gold">Work?</span>
            </h2>

            <div className="space-y-8 max-w-3xl mx-auto">
              <div>
                <h3 className="font-display text-xl font-medium text-gold-400 mb-3">
                  Egyptian Hieroglyphs Are Consonantal
                </h3>
                <p className="font-body text-sand-400 font-light leading-relaxed">
                  Unlike English, ancient Egyptian hieroglyphic writing records
                  only consonants; there are no true vowel signs. When
                  Egyptologists need to pronounce Egyptian words, they insert an
                  &lsquo;e&rsquo; between consonants by convention. For example,
                  the name{" "}
                  <span className="text-sand-200">nfr</span> is
                  pronounced &ldquo;nefer&rdquo; (meaning &ldquo;beautiful&rdquo;).
                </p>
              </div>

              <div>
                <h3 className="font-display text-xl font-medium text-gold-400 mb-3">
                  The 24 Uniliteral Signs
                </h3>
                <p className="font-body text-sand-400 font-light leading-relaxed">
                  The core of the hieroglyphic writing system is a set of 24
                  single-consonant signs called{" "}
                  <span className="text-sand-200">uniliterals</span>. These work
                  like an alphabet: each sign represents one consonant sound.
                  This translator uses these 24 signs to approximate your name,
                  matching each letter to the closest Egyptian equivalent.
                </p>
              </div>

              <div>
                <h3 className="font-display text-xl font-medium text-gold-400 mb-3">
                  How We Handle Vowels
                </h3>
                <p className="font-body text-sand-400 font-light leading-relaxed">
                  Since Egyptian has no vowel signs, we use standard
                  Egyptological approximations. The vowels &lsquo;a&rsquo; maps
                  to the vulture sign (a glottal stop called{" "}
                  <span className="text-sand-200">aleph</span>).
                  The vowels &lsquo;e&rsquo; and &lsquo;i&rsquo; use the reed
                  sign (the semi-vowel{" "}
                  <span className="text-sand-200">j/y</span>). The vowels
                  &lsquo;o&rsquo; and &lsquo;u&rsquo; use the quail chick (the
                  semi-vowel <span className="text-sand-200">w</span>). These
                  conventions are used by museums, universities, and
                  Egyptologists worldwide.
                </p>
              </div>

              <div>
                <h3 className="font-display text-xl font-medium text-gold-400 mb-3">
                  The Cartouche
                </h3>
                <p className="font-body text-sand-400 font-light leading-relaxed">
                  Your name is displayed inside a{" "}
                  <span className="text-sand-200">cartouche</span> (Egyptian:{" "}
                  <em>shenu</em>), an oval enclosure with a horizontal line at
                  one end. In ancient Egypt, cartouches were reserved exclusively
                  for royal names: the pharaoh&apos;s throne name and birth name.
                  Ordinary Egyptians&apos; names were written without cartouches.
                  We use it here because it&apos;s the most recognisable
                  hieroglyphic element and clearly marks the text as a name.
                </p>
              </div>

              <div>
                <h3 className="font-display text-xl font-medium text-gold-400 mb-3">
                  Why It&apos;s Not an Exact Translation
                </h3>
                <p className="font-body text-sand-400 font-light leading-relaxed">
                  This tool produces a{" "}
                  <span className="text-sand-200">phonetic transliteration</span>,
                  not a translation. We&apos;re approximating the{" "}
                  <em>sounds</em> of your name using ancient Egyptian signs, not
                  translating the <em>meaning</em>. Some English sounds simply
                  didn&apos;t exist in Egyptian. For example, &lsquo;l&rsquo;
                  had no sign of its own (it borrows the &lsquo;r&rsquo;), &lsquo;v&rsquo;
                  didn&apos;t exist (we use &lsquo;f&rsquo;), and vowels are
                  only approximated. This is the same approach ancient Egyptian
                  scribes used when writing foreign names: they did their best
                  with the sounds available to them.
                </p>
              </div>

              <div>
                <h3 className="font-display text-xl font-medium text-gold-400 mb-3">
                  Academic Sources
                </h3>
                <p className="font-body text-sand-400 font-light leading-relaxed">
                  The sign mappings in this translator follow the conventions
                  established in Sir Alan Gardiner&apos;s{" "}
                  <em>Egyptian Grammar</em> (3rd ed., 1957) and James P.
                  Allen&apos;s{" "}
                  <em>Middle Egyptian: An Introduction to the Language and
                  Culture of Hieroglyphs</em>{" "}
                  (3rd ed., 2014). The Gardiner Sign List codes (e.g. G1, D21,
                  M17) are the international standard for referencing individual
                  hieroglyphs.
                </p>
              </div>
            </div>
          </div>

          {/* The alphabet as real HTML — crawlable, unlike the canvas cartouche */}
          <section className="mt-16 pt-12 border-t border-gold-700/20" aria-labelledby="alphabet-heading">
            <h2 id="alphabet-heading" className="font-display text-3xl font-semibold text-sand-100 mb-4 text-center">
              The 25 Signs Behind{" "}
              <span className="text-gradient-gold">Your Name</span>
            </h2>
            <p className="font-body text-sand-400 font-light leading-relaxed max-w-3xl mx-auto text-center mb-8">
              Every name the translator writes is built from these single-sound hieroglyphs, the
              &ldquo;hieroglyphic alphabet&rdquo;. Egyptian wrote consonants only, so several English letters
              share a sign (<em>c</em> and <em>k</em>, <em>v</em> and <em>f</em>) and the vowels borrow the weak
              consonants <span className="hieroglyph-font">𓄿 𓇋 𓅱</span>. There was no native <em>L</em>: the
              lion <span className="hieroglyph-font">𓃭</span> was pressed into service for Greek and Roman names
              such as Cleopatra and Ptolemy.
            </p>
            <div className="max-w-3xl mx-auto">
              <AlphabetTable variant="compact" />
              <p className="mt-4 font-body text-sm text-sand-400 text-center">
                Want to type more than a name? The{" "}
                <Link href="/hieroglyphics-keyboard" className="text-gold-400 hover:text-gold-300 underline underline-offset-2">
                  hieroglyphics keyboard
                </Link>{" "}
                shows the sign for every key you press.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-gold-700/20">
            <div className="relative border border-gold-700/20 bg-obsidian-light/50 p-8 md:p-10 text-center">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold-500/30" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold-500/30" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold-500/30" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold-500/30" />
              <h3 className="font-display text-2xl md:text-3xl font-light text-sand-100 mb-3">
                Want to learn to read{" "}
                <span className="text-gradient-gold font-medium">
                  real inscriptions?
                </span>
              </h3>
              <p className="font-body text-sand-400 font-light mb-6 max-w-lg mx-auto">
                Go beyond your name. Learn the full hieroglyphic writing system,
                from the alphabet to temple inscriptions and the Book of the
                Dead.
              </p>
              {freeGuest ? (
                <FreeCourseCta location="translator" compact label="Get the whole course free" />
              ) : (
                <Link
                  href="/get-started?next=checkout"
                  className="btn-primary inline-flex justify-center text-base py-4 px-8"
                >
                  Get Lifetime Access for <Price />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embed on your own site (teachers, bloggers) */}
      <section
        id="embed"
        aria-labelledby="embed-heading"
        className="max-w-4xl mx-auto px-6 lg:px-8 pb-20 -mt-8"
      >
        <div className="border border-gold-700/20 bg-obsidian-light/40 p-6 md:p-8">
          <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-500 mb-2">For teachers &amp; bloggers</p>
          <h2 id="embed-heading" className="font-display text-2xl font-semibold text-sand-100 mb-3">
            Put this translator on your own page
          </h2>
          <p className="font-body text-sm text-sand-400 font-light leading-relaxed mb-5 max-w-2xl">
            Paste the code below into a class page, blog post or school website and your readers can write their
            names in hieroglyphs without leaving it. Free to use; the credit line under the box is the only thing
            we ask you to keep.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-body text-xs text-sand-500">Theme:</span>
            {(["dark", "light"] as EmbedTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setEmbedTheme(t)}
                aria-pressed={embedTheme === t}
                className={`font-body text-xs px-3 py-1.5 border transition-colors ${
                  embedTheme === t
                    ? "border-gold-500/60 text-gold-300"
                    : "border-gold-700/30 text-sand-500 hover:text-sand-300"
                }`}
              >
                {t === "dark" ? "Dark" : "Light"}
              </button>
            ))}
          </div>
          <textarea
            readOnly
            value={embedSnippet(embedTheme)}
            rows={4}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Embed code"
            className="w-full font-mono text-xs leading-relaxed p-3 bg-obsidian border border-gold-700/30 text-sand-300 focus:outline-none focus:border-gold-500/50 resize-none"
          />
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <button type="button" onClick={copyEmbed} className="btn-secondary py-2 px-5 text-xs">
              {embedCopied ? "Copied ✓" : "Copy embed code"}
            </button>
            <a
              href={`/embed/cartouche${embedTheme === "light" ? "?theme=light" : ""}`}
              target="_blank"
              rel="noopener"
              className="font-body text-xs text-gold-500 hover:text-gold-300 underline underline-offset-4"
            >
              Preview the embed
            </a>
          </div>
        </div>
      </section>

      {prompt.visible && (
        <AuthPromptCard
          title={`Uncover ${name.trim() || "your name"} on a sealed door`}
          body={`You've just used ${distinctSigns} of the 25 alphabet signs. Lesson 1 has you read them yourself, one sound at a time, then the rest of the alphabet. Free, and no sign-up to start.`}
          ctaLabel="Start Lesson 1"
          next={lessonHref}
          playHref={lessonHref}
          onAccept={prompt.accept}
          onDismiss={prompt.dismiss}
        />
      )}
      <Footer />
      </div>
    </main>
  );
}
