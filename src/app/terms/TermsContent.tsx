"use client";

import Navbar from "@/components/Navbar";
import { SITE } from "@/lib/site";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { PLANS, formatPlanPrice } from "@/lib/plans";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Learn AEO, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our services. We reserve the right to refuse service to anyone for any reason at any time.",
  },
  {
    id: "account-registration",
    title: "2. Account Registration",
    content:
      "To access personalized features and track your learning progress, you must create an account using Google OAuth. You are responsible for maintaining the security of your Google account credentials and for all activity that occurs under your account. You must provide accurate information and promptly update any changes. You must be at least 13 years of age to create an account. By registering, you represent that you meet this age requirement.",
  },
  {
    id: "purchase-and-billing",
    title: "3. Purchase & Billing",
    content:
      `Learn AEO offers lifetime access to the full course for a single one-time payment of ${formatPlanPrice(PLANS.lifetime, "USD")} (${formatPlanPrice(PLANS.lifetime, "GBP")}). After payment, your account is granted permanent access to all current and future course content at no additional cost.\n\nWe also offer a Monthly plan (${formatPlanPrice(PLANS.monthly, "USD")} / ${formatPlanPrice(PLANS.monthly, "GBP")} per month). It renews automatically until canceled from your account page or the billing portal; access continues to the end of the paid period.\n\n` +
      "Purchasing-power parity: visitors from countries with lower purchasing power are offered a percentage discount, applied automatically at checkout based on the country they browse from. We do not verify residence and we do not revoke access when a discount was claimed from elsewhere; we ask that you pay the full price if you can.\n\nWe offer a 14-day money-back guarantee. If you are unhappy with the course within 14 days of purchase, contact hello@learnaeo.com and we will issue a full refund.\n\nAll payments are processed securely by Stripe. By purchasing, you also agree to Stripe\u2019s terms of service.",
  },
  {
    id: "free-content",
    title: "4. Free Content",
    content:
      "Certain introductory lessons are available at no cost without a purchase. We reserve the right to change which content is freely available at our discretion.",
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property",
    content:
      "All lesson content, illustrations, interactive exercises, commentary, software code, and design elements on Learn AEO are the intellectual property of Learn AEO or its licensors and are protected by copyright and other intellectual property laws.\n\nYour purchase grants you a personal, non-transferable, non-exclusive license to access and use the content for your own private, non-commercial learning purposes. You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any content without our prior written consent.",
  },
  {
    id: "acceptable-use",
    title: "6. Acceptable Use",
    content:
      "You agree not to:\n\n\u2022 Share your account credentials or allow others to access your account\n\u2022 Use automated tools, bots, or scrapers to extract content from the platform\n\u2022 Attempt to reverse-engineer, decompile, or disassemble any part of the service\n\u2022 Upload or transmit viruses, malware, or any harmful code\n\u2022 Use the platform for any unlawful purpose or in violation of any applicable laws\n\u2022 Harass, abuse, or harm other users or our staff\n\nWe reserve the right to suspend or terminate your account if you violate these terms.",
  },
  {
    id: "disclaimers",
    title: "7. Disclaimers",
    content:
      'Learn AEO is provided on an "as is" and "as available" basis. While we strive for accuracy in our educational content, we make no warranties, express or implied, regarding the completeness, reliability, or suitability of the content for any particular purpose. Our lessons are intended for educational enrichment and do not constitute formal academic accreditation.',
  },
  {
    id: "limitation-of-liability",
    title: "8. Limitation of Liability",
    content:
      "To the maximum extent permitted by applicable law, Learn AEO and its owners, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, arising out of or in connection with your use of the service. Our total liability for any claim arising from these terms or your use of the service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.",
  },
  {
    id: "changes-to-terms",
    title: "9. Changes to These Terms",
    content:
      "We may update these Terms of Service from time to time. When we make material changes, we will notify you by email or by posting a notice on the platform at least 14 days before the changes take effect. Your continued use of Learn AEO after the updated terms become effective constitutes your acceptance of the changes.",
  },
  {
    id: "governing-law",
    title: "10. Governing Law",
    content:
      "These Terms of Service shall be governed by and construed in accordance with applicable law, without regard to conflict-of-law principles. Any disputes arising from these terms shall be resolved through good-faith negotiation before pursuing formal legal proceedings.",
  },
  {
    id: "contact",
    title: "11. Contact Us",
    content:
      "If you have any questions about these Terms of Service, please contact us at:\n\nhello@learnaeo.com",
  },
];

export default function TermsContent() {
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
                item: SITE.url,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Terms of Service",
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
            <span className="mx-auto block h-px w-16 bg-gold-500/60" aria-hidden="true" />
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-display text-4xl md:text-5xl font-semibold text-gradient-gold mb-4 text-center"
          >
            Terms of Service
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="font-body text-sm text-sand-500 text-center"
          >
            Last updated: March 2026
          </motion.p>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="font-body text-sand-300 mt-8 leading-relaxed"
          >
            Welcome to Learn AEO. These Terms of Service
            (&ldquo;Terms&rdquo;) govern your access to and use of the Learn
            AEO website, applications, and services. Please read them
            carefully before using our platform.
          </motion.p>
        </div>
      </section>

      {/* Sections */}
      <section className="relative pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-14">
          {sections.map((section) => (
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
              <p className="font-body text-sm text-sand-400 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
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
