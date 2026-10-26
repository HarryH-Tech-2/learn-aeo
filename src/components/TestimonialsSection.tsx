import Image from "next/image";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";

type Testimonial = {
  name: string;
  role: string;
  text: string;
  stars: number;
  /**
   * Optional real headshot, e.g. "/testimonials/sarah.jpg" (drop the file in
   * public/testimonials/). Only use photos you have permission to publish.
   * When absent, an initials avatar is rendered instead.
   */
  photo?: string;
  /** Optional "Reviewed …" line, e.g. "March 2026". */
  date?: string;
  /** Show the "Verified learner" chip — only for people who actually took the course. */
  verified?: boolean;
  /** Avatar accent hue (0–360) for the initials fallback. */
  hue: number;
};

const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    role: "London, UK",
    text: "The progressive approach made it click for me in a way free YouTube tutorials never did. The royal cartouche lesson was the moment I realised I was actually reading hieroglyphs, not just recognising shapes.",
    stars: 5,
    photo: "/testimonials/sarah-m.webp",
    hue: 28,
  },
  {
    name: "Marcus",
    role: "History buff, 34",
    text: "After working through the course I visited the British Museum and could actually read parts of the Rosetta Stone replica. That moment of recognition, seeing meaning emerge from 3,000-year-old symbols, was genuinely thrilling.",
    stars: 5,
    hue: 205,
  },
  {
    name: "Amara",
    role: "World History teacher",
    text: "I use bits of these lessons with my students. They're decoding pharaoh names within the first week. It's completely changed how they engage with the Egypt unit; they want to keep going instead of waiting for the bell.",
    stars: 5,
    hue: 160,
  },
];

const stats = [
  { value: "700+", label: "Hieroglyphs covered" },
  { value: "3,200", label: "Years of history" },
  { value: "4.9/5", label: "Average rating" },
];

function initials(name: string): string {
  const parts = name.replace(/\./g, "").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ t }: { t: Testimonial }) {
  if (t.photo) {
    return (
      <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-gold-400 to-gold-700 shrink-0">
        <Image
          src={t.photo}
          alt={`Portrait of ${t.name}`}
          width={56}
          height={56}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-gold-400 to-gold-700 shrink-0"
      aria-hidden="true"
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-display text-base font-semibold tracking-wide"
        style={{
          background: `radial-gradient(circle at 30% 25%, hsl(${t.hue} 45% 62%), hsl(${t.hue} 40% 34%) 70%)`,
          color: "#faf6f0",
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
        }}
      >
        {initials(t.name)}
      </div>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, si) => (
        <svg
          key={si}
          className={`w-4 h-4 ${si < count ? "text-gold-500" : "text-sand-500/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Server component; scroll-reveal is CSS via <InView> + .reveal.
export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-20">
      <InView className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Stats bar */}
        <div
          className="reveal grid grid-cols-1 md:grid-cols-3 gap-6 mb-24"
          style={reveal(0, { y: 30 })}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="reveal text-center p-6 border border-gold-700/10"
              style={reveal(0.1 + i * 0.08, { dur: 0.5 })}
            >
              <p className="font-display text-3xl md:text-4xl font-light text-gradient-gold mb-1">
                {stat.value}
              </p>
              <p className="font-body text-xs tracking-[0.15em] uppercase text-sand-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-3 mb-6" style={reveal(0.2)}>
            <span className="h-px w-12 bg-gold-700" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">
              Testimonials
            </span>
            <span className="h-px w-12 bg-gold-700" />
          </div>

          <h2
            className="reveal font-display text-4xl md:text-5xl font-light text-sand-100"
            style={reveal(0.3, { y: 30 })}
          >
            Voices from the{" "}
            <span className="text-gradient-gold font-medium">Academy</span>
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="reveal card-ancient card-shine p-8 flex flex-col relative"
              style={reveal(0.4 + i * 0.1, { y: 40, dur: 0.6 })}
            >
              {/* Author */}
              <figcaption className="flex items-center gap-4 mb-5">
                <Avatar t={t} />
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-sand-100 leading-tight truncate">
                    {t.name}
                  </p>
                  <p className="font-body text-xs text-sand-500 mt-0.5 truncate">
                    {t.role}
                  </p>
                  {t.verified && (
                    <p className="inline-flex items-center gap-1 mt-1.5 font-body text-[10px] tracking-[0.12em] uppercase text-emerald-400/90">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified learner
                    </p>
                  )}
                </div>
              </figcaption>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <Stars count={t.stars} />
                {t.date && (
                  <span className="font-body text-[11px] text-sand-500">Reviewed {t.date}</span>
                )}
              </div>

              {/* Quote */}
              <blockquote className="font-body text-sm text-sand-300 font-light leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </blockquote>
            </figure>
          ))}
        </div>
      </InView>
    </section>
  );
}
