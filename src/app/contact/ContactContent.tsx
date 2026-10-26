"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

const GLYPH_FONT = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', serif" } as const;

/** Where to go for the common questions, so people with a quick answer don't wait for a reply. */
const ROUTES = [
  {
    glyph: "𓏞",
    title: "Email us directly",
    body: (
      <>
        <a href="mailto:contact@learnhieroglyphics.com" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
          contact@learnhieroglyphics.com
        </a>{" "}
        reaches the same inbox as the form.
      </>
    ),
  },
  {
    glyph: "𓊹",
    title: "Teachers and schools",
    body: (
      <>
        Purchase orders, invoices and class licences. The{" "}
        <Link href="/teachers" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
          teachers&rsquo; page
        </Link>{" "}
        has the free worksheet and licence details.
      </>
    ),
  },
  {
    glyph: "𓋹",
    title: "Billing and refunds",
    body: (
      <>
        Every purchase has a 14-day money-back guarantee. Manage a subscription from{" "}
        <Link href="/account" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
          your account
        </Link>
        .
      </>
    ),
  },
];

export default function ContactContent() {
  return (
    <div className="min-h-screen bg-obsidian grain-overlay">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.learnhieroglyphics.com" },
              { "@type": "ListItem", position: 2, name: "Contact" },
            ],
          }),
        }}
      />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-10 font-body text-sm text-sand-500">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-sand-400">Contact</span>
        </nav>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-light text-sand-100 leading-[1.05]">Write to the scribes</h1>
            <p className="font-body text-lg text-sand-400 font-light mt-5 max-w-md leading-relaxed">
              Questions about the course, a stuck lesson, a sign you can&rsquo;t read, or an idea for something we should make. A real person reads every message and replies within a day.
            </p>

            <dl className="mt-10 space-y-7 border-t border-gold-700/25 pt-8">
              {ROUTES.map((r) => (
                <div key={r.title} className="flex gap-4">
                  <span className="text-3xl leading-none text-gold-500 w-9 shrink-0 text-center" style={GLYPH_FONT} aria-hidden="true">
                    {r.glyph}
                  </span>
                  <div>
                    <dt className="font-display text-lg text-sand-100">{r.title}</dt>
                    <dd className="font-body text-sm text-sand-400 mt-1 leading-relaxed">{r.body}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <ContactForm idPrefix="contact" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
