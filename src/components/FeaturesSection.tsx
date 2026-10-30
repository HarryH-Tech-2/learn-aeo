import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
import { LESSON_CATALOG } from "@/lib/lesson-catalog";

/** Six "what you'll learn" cards. Each names the districts (lessons) it comes from; the district names, lesson
 *  numbers and live / coming-soon status are read from the catalog, so they never drift from the course. */
const features: { title: string; description: string; lessons: number[] }[] = [
  {
    title: "How AI answers get built",
    description:
      "Follow a question through retrieval, grounding and query fan-out, and learn the difference between being cited and being mentioned.",
    lessons: [1],
  },
  {
    title: "Let the right bots in",
    description:
      "Tell training crawlers from search bots and user-triggered fetchers, then check robots.txt, rendering and CDN rules so they can reach your pages.",
    lessons: [2],
  },
  {
    title: "Write passages engines can lift",
    description:
      "Lead with the answer, use question headings, lists and tables, and keep each section clear enough to stand on its own when it is quoted.",
    lessons: [3],
  },
  {
    title: "Structured data and entities",
    description:
      "Get the JSON-LD essentials right and make your brand one unambiguous entity, with consistent names and sameAs links.",
    lessons: [4],
  },
  {
    title: "Authority and platforms",
    description:
      "Look at the mentions, reviews and lists AI search tools lean on, then at what each major engine tends to favor and how to test it.",
    lessons: [5, 6],
  },
  {
    title: "Measure it and run it",
    description:
      "Track whether you appear in AI answers and what that sends you, then turn it into an audit, a roadmap and a 90-day plan.",
    lessons: [7, 8],
  },
];

function lessonsFor(orders: number[]) {
  return orders.map((order) => {
    const lesson = LESSON_CATALOG.find((l) => l.order === order);
    if (!lesson) throw new Error(`FeaturesSection: no lesson ${order} in the catalog`);
    return lesson;
  });
}

// Server component; scroll-reveal is CSS via <InView> + .reveal.
export default function FeaturesSection() {
  const first = LESSON_CATALOG[0];
  const last = LESSON_CATALOG[LESSON_CATALOG.length - 1];
  return (
    <section id="features" className="relative py-20 overflow-hidden">
      <InView className="max-w-7xl mx-auto px-6 lg:px-8" margin="-100px">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="reveal inline-flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gold-700" />
            <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">What you&apos;ll learn</span>
            <span className="h-px w-12 bg-gold-700" />
          </div>

          <h2
            className="reveal font-display text-4xl md:text-5xl lg:text-6xl font-light text-sand-100 mb-6"
            style={reveal(0.1, { y: 30 })}
          >
            From the first prompt <br />
            to a <span className="text-gradient-gold font-medium">plan you can run</span>
          </h2>

          <p className="reveal font-body text-lg text-sand-400 max-w-2xl mx-auto font-light" style={reveal(0.2)}>
            The course is a City of Answers with {LESSON_CATALOG.length} districts, one lesson each. You come in at{" "}
            {first.district} and finish at {last.district}.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="reveal card-ancient p-8"
              style={reveal(0.3 + i * 0.1, { y: 40, dur: 0.6 })}
            >
              <ul className="mb-5 flex flex-wrap gap-2">
                {lessonsFor(feature.lessons).map((lesson) => (
                  <li
                    key={lesson.id}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-3 py-1 font-body text-xs text-cyan-500"
                  >
                    <span>
                      Lesson {lesson.order} · {lesson.district}
                    </span>
                    {lesson.status === "coming-soon" && <span className="text-sand-400">· coming soon</span>}
                  </li>
                ))}
              </ul>
              <h3 className="font-display text-xl font-semibold text-sand-100 mb-3">{feature.title}</h3>
              <p className="font-body text-sm text-sand-400 leading-relaxed font-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </InView>
    </section>
  );
}
