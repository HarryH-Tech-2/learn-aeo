"use client";

/**
 * The coffee ask for the free-unlock test's free group (src/lib/access-test.ts), in the places the paid group is asked
 * to buy: the end of each Lesson 1 section and its outro (UpgradePanel) and the dashboard. Says the course is open to
 * them, then asks for a coffee (Harry's Buy Me a Coffee page, the same as the corner seal).
 * GA4: coffee_ask_view (once per mount) and coffee_click, both with location (section_1 | section_2 | lesson_outro |
 * dashboard), so the two groups' asks read side by side with upgrade_panel_shown / upgrade_panel_click.
 */
import Image from "next/image";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { COFFEE_URL } from "@/components/CoffeeSeal";

export default function CoffeeAsk({ location, progressLine }: { location: string; progressLine?: string }) {
  const pathname = usePathname();
  useEffect(() => {
    trackEvent("coffee_ask_view", { location });
  }, [location]);

  return (
    <section aria-label="Buy me a coffee" className="card-ancient p-6 md:p-8 text-left border border-gold-500/30">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-gold-500 mb-2">The whole course is open to you</p>
      <h3 className="font-display text-2xl md:text-3xl text-sand-100 font-light mb-3">
        All eight lessons, <span className="text-gradient-gold font-medium">free</span>
      </h3>
      <div className="flex items-start gap-4">
        <Image
          src="/about/harry-320.webp"
          alt=""
          width={320}
          height={360}
          sizes="64px"
          loading="lazy"
          className="hidden h-16 w-16 shrink-0 rounded-full object-cover object-top shadow-[0_0_0_2px_rgba(214,170,80,0.8)] sm:block"
        />
        <p className="font-body text-sm text-sand-300 font-light leading-relaxed max-w-2xl">
          {progressLine ? `${progressLine}. ` : ""}Every chamber of the dig is unlocked on your account, with nothing to pay.
          I build and look after this site on my own, so if it is helping you, a coffee keeps it going. Harry
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <a
          href={COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("coffee_click", { location, page: pathname ?? "" })}
          className="btn-primary text-sm py-3 px-6 justify-center"
        >
          Buy me a coffee
        </a>
        <span className="font-body text-xs text-sand-500">Opens Buy Me a Coffee in a new tab. Your place is saved.</span>
      </div>
    </section>
  );
}
