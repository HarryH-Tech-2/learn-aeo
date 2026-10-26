import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * /teachers/privacy: privacy and safeguarding, written for a school's DPO, business manager or IT lead.
 * Every statement here describes what the code does; check it again when any of these change:
 *   classroom rooms (src/lib/classroom.ts ROOM_TTL_MS), consent (src/lib/consent.ts, layout.tsx gtag consent),
 *   licences and the roster (src/lib/licence.ts), invoices (src/lib/licence-invoice.ts), leaderboard names
 *   (src/lib/leaderboard.ts), community board (src/lib/community-server.ts), account deletion (src/app/api/account).
 */

const BASE = "https://www.learnhieroglyphics.com";
const UPDATED = "16 October 2026";

export const metadata: Metadata = {
  title: "Privacy & Safeguarding for Schools | Learn Hieroglyphics",
  description:
    "What Learn Hieroglyphics collects from teachers and pupils, which tools need no pupil accounts, cookies and analytics consent, who processes data, how long it is kept and how to ask for deletion.",
  alternates: { canonical: `${BASE}/teachers/privacy` },
};

type Section = { id: string; title: string; body: React.ReactNode };

const P = ({ children }: { children: React.ReactNode }) => <p className="font-body text-[15px] text-sand-300 leading-relaxed mb-3">{children}</p>;
const UL = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc pl-5 space-y-1.5 font-body text-[15px] text-sand-300 leading-relaxed mb-3">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);
const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
    {children}
  </Link>
);

const PROCESSORS: { name: string; what: string; data: string }[] = [
  { name: "Vercel", what: "Hosts the website and runs its server code", data: "Every request passes through it, including IP address and browser details in server logs" },
  { name: "Prisma Postgres", what: "The database", data: "Accounts (name, email), lesson progress, licences and class rosters, live quiz rooms while they run" },
  { name: "Google", what: "“Sign in with Google”, and Google Analytics (only where allowed, see below)", data: "Sign-in: name, email and profile picture from the Google account. Analytics: pages visited and events, a random visitor id, and the account id of a signed-in visitor" },
  { name: "Stripe", what: "Card payments and school invoices", data: "Card details (entered on Stripe's pages, never seen by us), the buyer's email, and for invoices the school's name, billing address, contact, PO and VAT numbers" },
  { name: "Resend", what: "Sends email", data: "The recipient's email address and the email itself (sign-in links, licence emails, receipts, a short welcome series)" },
];

const SECTIONS: Section[] = [
  {
    id: "no-pupil-accounts",
    title: "1. What pupils can use without an account",
    body: (
      <>
        <P>Most of what a class uses needs no pupil account and collects no personal information from pupils:</P>
        <UL
          items={[
            <>
              <strong className="text-sand-100">Classroom mode (the live quiz).</strong> Pupils open learnhieroglyphics.com/play/CODE and type a team name. We store that team name, the room code and the
              answers chosen while the room runs. Rooms expire after three hours and are then deleted. No email, real name, age or device identifier is asked for. Teachers choose
              appropriate team names (we suggest not using real names).
            </>,
            <>
              <strong className="text-sand-100">Printable worksheets.</strong> They are web pages you print. If a teacher asks for the worksheet by email, we keep that teacher&apos;s
              email address to send it and one follow-up.
            </>,
            <>
              <strong className="text-sand-100">The name translator and the hieroglyphics keyboard.</strong> They work without signing in. A typed name is not saved to any account; if
              someone chooses to have a picture emailed, that email address is kept so we can send it.
            </>,
            <>
              <strong className="text-sand-100">The free games</strong> can be played without an account; progress then stays in that browser only.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: "accounts",
    title: "2. When accounts are used: teachers, and pupils on a licence",
    body: (
      <>
        <P>
          <strong className="text-sand-100">Teachers.</strong> Running Classroom mode, buying a licence and seeing class progress need a teacher account: sign in with Google or with a
          one-time link sent to an email address. We keep the name and email address, and for a licence, its class code, seats, school name (if you add one) and Stripe customer id.
        </P>
        <P>
          <strong className="text-sand-100">Pupils joining a licence (optional).</strong> If you want pupils on the full course, each pupil signs in (Google or email link) and enters your
          class code. That account holds the pupil&apos;s name and email address and their lesson progress, XP and streak, and you see those on your licence page. If you would rather not
          create pupil accounts, Classroom mode, the worksheets, the translator and the keyboard work without them.
        </P>
        <P>Things to know about pupil accounts:</P>
        <UL
          items={[
            <>The public leaderboard shows anyone with XP by first name and last initial (never an email address). A pupil can change the name shown from their account page.</>,
            <>
              Accounts with full-course access, which includes pupils on a licence, can post questions and answers on the community board under the same kind of display name. There is
              no private messaging between users anywhere on the site.
            </>,
            <>New accounts receive a short series of welcome emails about the course, with an unsubscribe link in each.</>,
            <>A teacher can remove a pupil from the class at any time; a pupil can delete their own account from the account page.</>,
          ]}
        />
      </>
    ),
  },
  {
    id: "invoices",
    title: "3. Paying by card or by invoice",
    body: (
      <P>
        Card payments are taken on Stripe&apos;s own pages; we never see or store card numbers. When a school pays by invoice or purchase order, the school name, billing address,
        contact name and email, PO number and VAT number go to Stripe to produce and send the invoice. We keep the licence and the Stripe customer id in our database; the invoice
        details stay in Stripe. We use them only to bill the school.
      </P>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies and analytics",
    body: (
      <>
        <P>
          We use essential cookies to keep people signed in and to remember choices such as the theme and the cookie choice itself (<code className="text-sand-200">lh_consent</code>,
          kept for a year). We use Google Analytics to see which pages and lessons help people learn. There are no advertising cookies: Google&apos;s advertising storage and ad
          personalisation are switched off in our consent settings for every visitor.
        </P>
        <UL
          items={[
            <>
              <strong className="text-sand-100">UK, EU and EEA:</strong> Google Analytics stays off until someone chooses &ldquo;Accept all&rdquo; on the cookie notice. If we can&apos;t
              tell where a visitor is, we treat them the same way.
            </>,
            <>
              <strong className="text-sand-100">Elsewhere (including the US):</strong> Analytics is on unless the visitor chooses &ldquo;Essentials only&rdquo;.
            </>,
            <>Clearing cookies brings the notice back, so a choice can be changed at any time.</>,
          ]}
        />
        <P>On shared school devices, choosing &ldquo;Essentials only&rdquo; once in each browser keeps Analytics off for that browser.</P>
      </>
    ),
  },
  {
    id: "processors",
    title: "5. Who processes the data, and where",
    body: (
      <>
        <P>We don&apos;t sell personal information or use it for advertising. These services process it for us, each for the purpose listed:</P>
        <div className="overflow-x-auto mb-3">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="text-left text-[10px] tracking-[0.15em] uppercase text-sand-500 border-b border-gold-700/20">
                <th className="py-2 pr-4">Service</th>
                <th className="py-2 pr-4">What for</th>
                <th className="py-2">What it handles</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSORS.map((p) => (
                <tr key={p.name} className="border-b border-gold-700/10 align-top">
                  <td className="py-2.5 pr-4 text-sand-100 whitespace-nowrap">{p.name}</td>
                  <td className="py-2.5 pr-4 text-sand-300">{p.what}</td>
                  <td className="py-2.5 text-sand-400">{p.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Some of these providers store or process data outside the UK, including in the United States. Each publishes data processing terms covering international transfers. If a
          physical print is bought from the name translator, the postal address also goes to our print partner, Prodigi; schools buying licences never need this.
        </P>
      </>
    ),
  },
  {
    id: "retention",
    title: "6. How long we keep it",
    body: (
      <UL
        items={[
          <>Classroom mode rooms and team names: deleted after the room expires, three hours after it was opened.</>,
          <>Accounts and learning progress: while the account exists. Deleting an account removes it and its personal data from our systems within 30 days.</>,
          <>Email addresses given for a worksheet or picture: until the person unsubscribes or asks us to delete them.</>,
          <>Payment and invoice records: kept by Stripe and by us for as long as tax and accounting law requires.</>,
          <>Google Analytics event data: kept for a limited period under our Analytics settings, at most 14 months.</>,
        ]}
      />
    ),
  },
  {
    id: "laws",
    title: "7. UK GDPR, COPPA and FERPA",
    body: (
      <>
        <P>
          <strong className="text-sand-100">UK GDPR.</strong> We collect the minimum needed to run each feature and use it only for that. People can ask to see, correct or delete their
          data, or object to its use, by emailing us (below). If your school needs details for a data protection impact assessment, or wants to discuss a data processing agreement,
          email us and we&apos;ll answer with what we can provide.
        </P>
        <P>
          <strong className="text-sand-100">COPPA (US).</strong> The account-free tools (Classroom mode, worksheets, translator, keyboard) collect no personal information from children.
          Pupil accounts collect a name and email address. For pupils under 13 in the US, only create accounts where your school is able to authorise that for school use under its own
          policies; otherwise, use the account-free tools. A parent or school can ask us to delete a child&apos;s account and data at any time.
        </P>
        <P>
          <strong className="text-sand-100">FERPA (US).</strong> When pupils join a licence, the only education-related information we hold is their progress in our lessons. We use it
          only to provide the course and show it to their teacher. We don&apos;t sell it, use it for advertising or share it beyond the providers listed above, and we delete it when the
          school asks.
        </P>
        <P>
          We don&apos;t hold third-party privacy or security certifications, and this page doesn&apos;t claim any. It describes what the site actually does. Our general{" "}
          <A href="/privacy">privacy policy</A> covers everyone else who uses the site.
        </P>
      </>
    ),
  },
  {
    id: "contact",
    title: "8. Deletion requests and questions",
    body: (
      <P>
        Email <a href="mailto:contact@learnhieroglyphics.com" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">contact@learnhieroglyphics.com</a> with the
        account email address (or the class code, for a whole class) and what you&apos;d like removed. Deletions are completed within 30 days.
      </P>
    ),
  },
];

export default function SchoolsPrivacyPage() {
  return (
    <div className="min-h-screen bg-obsidian grain-overlay flex flex-col">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 flex-1 w-full">
        <p className="font-body text-xs tracking-[0.25em] uppercase text-gold-500 mb-2">
          <Link href="/teachers" className="hover:text-gold-300">
            Teachers
          </Link>
        </p>
        <h1 className="font-display text-4xl font-light text-sand-100 mb-3">
          Privacy &amp; <span className="text-gradient-gold font-medium">safeguarding</span> for schools
        </h1>
        <p className="font-body text-sand-400 mb-2">
          A plain account of what Learn Hieroglyphics collects when a class uses it, for teachers, data protection leads and school business managers.
        </p>
        <p className="font-body text-xs text-sand-500 mb-8">Last updated {UPDATED}</p>

        <div className="card-ancient p-5 mb-10 border border-gold-500/30">
          <p className="font-body text-sm text-sand-200 leading-relaxed">
            <strong className="text-gold-300">In short:</strong> the live class quiz, worksheets, name translator and keyboard need no pupil accounts and collect nothing personal from
            pupils. Pupil accounts are only needed if you put pupils on the full course with a class code. Analytics waits for consent in the UK and EU, and there are no advertising
            cookies. To delete anything, email contact@learnhieroglyphics.com.
          </p>
        </div>

        <nav aria-label="On this page" className="mb-10">
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 font-body text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sand-400 hover:text-gold-400">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="mb-10 scroll-mt-28">
            <h2 className="font-display text-2xl text-sand-100 mb-4">{s.title}</h2>
            {s.body}
          </section>
        ))}

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gold-700/15">
          <Link href="/teachers" className="btn-secondary py-2.5 px-5 text-sm">
            Back to Teachers
          </Link>
          <Link href="/teachers/licence?invoice=1#invoice" className="font-body text-sm text-sand-400 hover:text-gold-400 self-center underline underline-offset-4">
            Pay for a licence by invoice
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
