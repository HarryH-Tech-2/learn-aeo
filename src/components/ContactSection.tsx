"use client";

import Link from "next/link";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
import ContactForm from "@/components/ContactForm";

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-20">
      <InView className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="reveal font-display text-4xl md:text-5xl font-light text-sand-100 mb-4" style={reveal(0.1, { y: 30 })}>
            Write to us
          </h2>
          <p className="reveal font-body text-sand-400 font-light max-w-xl mx-auto" style={reveal(0.2)}>
            A question about the lessons, help with your account, or a sign you can&apos;t read. A real person answers, usually the same day.
          </p>
        </div>

        <div className="reveal max-w-3xl mx-auto" style={reveal(0.3, { y: 30, dur: 0.6 })}>
          <ContactForm idPrefix="home-contact" />
          <p className="font-body text-sm text-sand-500 text-center mt-5">
            Rather use email? <a href="mailto:hello@learnaeo.com" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">hello@learnaeo.com</a>
            {" · "}
            <Link href="/contact" className="text-gold-400 hover:text-gold-300 underline underline-offset-4">
              More ways to reach us
            </Link>
          </p>
        </div>
      </InView>
    </section>
  );
}
