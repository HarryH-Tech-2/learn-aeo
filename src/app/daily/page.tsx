import type { Metadata } from "next";
import DailyContent from "./DailyContent";
import { DAILY_CARTOUCHES, MAX_ATTEMPTS } from "@/lib/daily";

const URL = "https://www.learnhieroglyphics.com/daily";
const OG = "https://www.learnhieroglyphics.com/cartouche-image?name=Cleopatra";

export const metadata: Metadata = {
  title: "Cartouche of the Day: free daily hieroglyph puzzle | Learn Hieroglyphics",
  description: `A new pharaoh's cartouche every day. Put the right sound under each hieroglyph and read the royal name in ${MAX_ATTEMPTS} tries. Free, no account needed, with a streak and a shareable grid.`,
  alternates: { canonical: URL },
  openGraph: {
    title: "Cartouche of the Day: a free daily hieroglyph puzzle",
    description: "Read a real pharaoh's name sign by sign. One cartouche a day, four tries, share your grid.",
    url: URL,
    type: "website",
    images: [{ url: OG, width: 1200, height: 630, alt: "A royal cartouche written in hieroglyphs" }],
  },
  twitter: { card: "summary_large_image", title: "Cartouche of the Day", description: "One real pharaoh's name a day. Can you read it?", images: [OG] },
};

// The puzzle itself is chosen on the client from the visitor's date, so the
// page can be fully static and cached.
export const dynamic = "force-static";

const FAQ = [
  {
    q: "What is a cartouche?",
    a: "A cartouche is the oval ring, ending in a knot, that Egyptian scribes drew around a king's or queen's name. It is the reason royal names can be spotted on any monument, and the reason the Rosetta Stone could be deciphered: scholars knew which signs must spell 'Ptolemy'.",
  },
  {
    q: "How do you read a cartouche?",
    a: "Signs read in the direction the animals and people face, usually from the top. Most signs in a royal name are sound-signs (one, two or three consonants), some stand for a whole word such as the god Ra, and a few are silent markers. A god's name is often written first out of respect even though it is read last.",
  },
  {
    q: "Is Cartouche of the Day free?",
    a: `Yes. The daily puzzle and the Decipher campaign are free and need no account. Signing in (also free) keeps your streak across devices and adds XP to your scholar level. The full course of ${8} lessons is a one-time purchase.`,
  },
  {
    q: "Where do the cartouches come from?",
    a: `Each of the ${DAILY_CARTOUCHES.length} names is spelled as on a published rendering of a real monument or object (long epithets such as ‘beloved of Amun’ are left out), and checked against a second source. The Unicode code points are audited against the Gardiner sign list before a name goes live.`,
  },
];

export default function DailyPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Cartouche of the Day",
      url: URL,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: "A free daily puzzle: read a real pharaoh's cartouche sign by sign in four tries.",
      provider: { "@type": "Organization", name: "Learn Hieroglyphics", url: "https://www.learnhieroglyphics.com" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DailyContent>
        {/* FAQ as real HTML for readers and crawlers (the client component holds the game). */}
        <section className="mt-12 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl text-sand-100 mb-4">Questions people ask</h2>
          <dl className="space-y-4 font-body text-sm text-sand-300 leading-relaxed">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="text-sand-100 font-medium">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </DailyContent>
    </>
  );
}
