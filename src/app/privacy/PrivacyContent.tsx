"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

interface ContentBlock {
  subtitle?: string;
  text: string;
}

const sections: { id: string; title: string; content: ContentBlock[] }[] = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you sign in with Google OAuth, we receive your name, email address, and profile picture from your Google account. We do not receive or store your Google password.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with the platform, including lessons viewed, quiz scores, progress milestones, and session duration. This data is associated with your account and used to personalise your learning experience.",
      },
      {
        subtitle: "Classroom Mode (Pupils)",
        text: "When a teacher runs a live quiz at /teachers/class, pupils join from /play/<room code> by typing a team name only. We store that team name, the room code, the answers chosen and their timing for the life of the room, which is deleted automatically three hours after it was opened. No account, email, name, age or device identifier is collected from pupils, and the join page sets no advertising cookies. Teachers are responsible for choosing team names appropriate for their class.",
      },
      {
        subtitle: "Device & Browser Information",
        text: "We collect standard log data such as your IP address, browser type, operating system, and referring URL. This helps us diagnose technical issues and improve site performance.",
      },
    ],
  },
  {
    id: "how-we-use-your-information",
    title: "2. How We Use Your Information",
    content: [
      {
        text: "We use the information we collect to:",
      },
      {
        text: "\u2022 Authenticate your identity and maintain your account session\n\u2022 Track your lesson progress and provide personalised recommendations\n\u2022 Process payments securely through Stripe\n\u2022 Improve our lesson content, user interface, and overall platform quality\n\u2022 Send transactional emails related to your account or purchase (you may opt out of non-essential communications at any time)",
      },
    ],
  },
  {
    id: "payment-data",
    title: "3. Payment & Billing Data",
    content: [
      {
        text: "All payment processing is handled by Stripe, Inc. When you make a purchase, your payment card details are transmitted directly to Stripe and are never stored on our servers. We retain only a Stripe customer ID and a record of your purchase to manage your access. Please review Stripe\u2019s privacy policy at stripe.com/privacy for details on how they handle your payment information.",
      },
    ],
  },
  {
    id: "cookies",
    title: "4. Cookies & Local Storage",
    content: [
      {
        text: "We use essential cookies to maintain your authentication session and remember your preferences (such as theme selection). We also use local storage to cache lesson progress for a faster experience. We also use Google Analytics cookies to count visits and see which pages and lessons help people learn. If you are in the UK or the EU/EEA, Analytics stays off until you choose “Accept all” on the cookie notice. Elsewhere it is on unless you choose “Essentials only”; the choice is kept in a cookie named lh_consent for a year, and clearing your cookies brings the notice back. Under the same rule, we keep three measurement cookies of our own: lh_ref (the website that first sent you here, as a domain name only, and the page you landed on; 90 days), lh_utm (which of our own marketing links you followed; 30 days) and lh_vid (a random visitor number so a link visit is counted once; one year). If you create an account or buy, we store that source with your account and purchase record so we can see which places bring people who stay. Choosing “Essentials only” deletes them. After you sign up we may also ask how you found us; answering is optional. We do not use advertising cookies.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "5. Data Sharing",
    content: [
      {
        text: "We do not sell, rent, or trade your personal information. We share data only with the following service providers, strictly for the purposes described in this policy:",
      },
      {
        text: "\u2022 Google: authentication via OAuth\n\u2022 Stripe: payment processing\n\u2022 Vercel: hosting and serverless infrastructure\n\nWe may also disclose information if required by law or to protect our legal rights.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "6. Data Retention & Deletion",
    content: [
      {
        text: "We retain your account data and learning progress for as long as your account remains active. If you wish to delete your account and all associated data, you may do so from your dashboard settings or by contacting us at the email address below. Upon deletion, your personal data will be permanently removed from our systems within 30 days, except where retention is required by law.",
      },
    ],
  },
  {
    id: "security",
    title: "7. Security",
    content: [
      {
        text: "We implement industry-standard security measures, including HTTPS encryption, secure OAuth token handling, and access controls on our infrastructure. While no system can guarantee absolute security, we are committed to protecting your data to the best of our ability.",
      },
    ],
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    content: [
      {
        text: "We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or through a prominent notice on the platform. Your continued use of Learn Hieroglyphics after changes are posted constitutes acceptance of the updated policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: [
      {
        text: "If you have questions or concerns about this Privacy Policy or your personal data, please contact us at:\n\ncontact@learnhieroglyphics.com",
      },
    ],
  },
];

export default function PrivacyContent() {
  return (
    <main className="grain-overlay">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.learnhieroglyphics.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Privacy Policy",
              },
            ],
          }),
        }}
      />
      <Navbar />

      {/* Header */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-6 text-center"
          >
            <span className="text-4xl">𓅓</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-display text-4xl md:text-5xl font-semibold text-gradient-gold mb-4 text-center"
          >
            Privacy Policy
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="font-body text-sm text-sand-500 text-center"
          >
            Last updated: October 2026
          </motion.p>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="font-body text-sand-300 mt-8 leading-relaxed"
          >
            Learn Hieroglyphics (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) is committed to protecting your privacy. This
            Privacy Policy explains what information we collect, how we use it,
            and the choices you have regarding your data when you use our
            website and services.
          </motion.p>
        </div>
      </section>

      {/* Sections */}
      <section className="relative pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-14">
          {sections.map((section, sIdx) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={0}
            >
              <h2 className="font-display text-2xl font-semibold text-sand-100 mb-4">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.content.map((block, bIdx) => (
                  <div key={bIdx}>
                    {block.subtitle && (
                      <h3 className="font-body text-sm font-semibold text-gold-400 mb-1">
                        {block.subtitle}
                      </h3>
                    )}
                    <p className="font-body text-sm text-sand-400 leading-relaxed whitespace-pre-line">
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Back to home */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="pt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-body text-sm text-sand-400 hover:text-gold-400 transition-colors"
            >
              <span>Back to home</span>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
