import type { Metadata } from "next";
import Link from "next/link";
import ToolPage, { type ToolFaq } from "@/components/tools/ToolPage";
import ShareOfVoiceTracker from "./ShareOfVoiceTracker";
import { pageMetadata } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

const TOOL = TOOLS.find((t) => t.slug === "share-of-voice-tracker")!;

export const metadata: Metadata = pageMetadata({
  title: "AI Share of Voice Tracker: free, no sign-up",
  description:
    "Paste ChatGPT, Perplexity and Google AI answers for your prompts to see how often each brand is named and cited, and your share of voice over time. Free.",
  path: "/tools/share-of-voice-tracker",
});

// Definitions are the course's own (lesson 7, The Observatory), so the tool and the lesson agree.
const FAQS: ToolFaq[] = [
  {
    question: "What is share of voice in AI search?",
    answer:
      "The share of brand mentions that goes to you. Run a fixed set of prompts, then divide the answers that name your brand by the brand mentions across every brand you track, in the same answers. It shows how you compare with competitors, not just whether you appear.",
  },
  {
    question: "What's the difference between mention rate, citation rate and share of voice?",
    answer:
      "Mention rate is the share of answers that name your brand. Citation rate is the share that link to your site as a source. Share of voice compares your mentions with your competitors' mentions across the same answers.",
  },
  {
    question: "Why paste answers instead of fetching them automatically?",
    answer:
      "Pasting answers from the apps themselves records what a person actually sees, on the platforms you care about, with no API keys and nothing to pay. It also means the tool never sends your prompts or brands anywhere.",
  },
  {
    question: "How many prompts should I track?",
    answer:
      "Enough to cover the questions your buyers really ask: 20 to 30 is a workable start. Keep the same set from run to run, because AI answers vary between runs and a changing prompt set makes the trend meaningless.",
  },
  {
    question: "Is my data saved?",
    answer:
      "Only in your browser. Your setup, pasted answers and saved runs stay on this device; download a CSV to keep them elsewhere or share them.",
  },
];

export default function ShareOfVoiceTrackerPage() {
  return (
    <ToolPage
      tool={TOOL}
      faqs={FAQS}
      intro={
        <>
          <p>
            Track how often ChatGPT, Perplexity, Google&rsquo;s AI features and other assistants name your brand compared with your
            competitors. Add your brand and rivals, list the prompts your buyers ask, and paste each answer. The tracker counts
            mentions and citations and works out your share of voice, mention rate and citation rate.
          </p>
          <p className="text-base text-sand-400">
            Save each run and come back weekly or monthly with the same prompts to see whether your work is moving the numbers.
          </p>
        </>
      }
      howItWorks={
        <>
          <p>
            Each brand is matched by its name and any other names you give it, as whole words and ignoring case, so
            &ldquo;Acme&rdquo; doesn&rsquo;t match &ldquo;Acmeville&rdquo;. A brand counts once per answer however often it&rsquo;s
            repeated, so one long answer can&rsquo;t swamp the rest. A citation counts when the answer contains the brand&rsquo;s
            website, bare or in a link, including subdomains, so paste the sources along with the answer.
          </p>
          <p>
            Share of voice is your mentions divided by every tracked brand&rsquo;s mentions, so it depends on who you track: add the
            competitors that actually show up. &ldquo;Named first&rdquo; counts the answers where a brand comes before the others,
            which often means it&rsquo;s the main recommendation.
          </p>
          <p>
            Lesson 7,{" "}
            <Link href="/lessons/measuring-ai-visibility" className="text-cyan-400 underline underline-offset-2">The Observatory</Link>,
            shows how to build a prompt set, measure AI referral traffic in GA4 and report the results.
          </p>
        </>
      }
    >
      <ShareOfVoiceTracker />
    </ToolPage>
  );
}
