import type { BlogPost } from "@/lib/blog-posts";

export const post: BlogPost = {
  slug: "ai-mode-click-study",
  title: "Do AI Mode users click less? What the first field experiment found",
  metaTitle: "Do AI Mode users click less? The first field experiment",
  excerpt:
    "A preregistered experiment sent every Google search through AI Mode for a week. Clicks to outside websites fell 18.8 percentage points. Here is what the study measured, what it did not, and what to change.",
  quickAnswer:
    "Yes. In a preregistered field experiment with 1,100 US Google users, people whose searches were all sent to AI Mode clicked through to outside websites 18.8 percentage points less often than people using normal Google Search. They also trusted what they found less and were more likely to use another search engine.",
  date: "November 19, 2026",
  publishedAt: "2026-11-19",
  category: "Research",
  image: "/blog/ai-mode-click-study.webp",
  imageAlt: "Three streams of light leaving a search box, one of them thinning to a few faint lines",
  relatedSlugs: ["get-cited-in-google-ai-overviews", "how-chatgpt-chooses-sources", "is-aeo-worth-learning"],
  faqs: [
    {
      question: "Does AI Mode cut clicks by 18.8%?",
      answer:
        "No. The drop is 18.8 percentage points, not 18.8 percent. Click-through rate in the study is clicks to outside sites divided by Google searches, and the AI Mode group's rate was 18.8 points lower than the normal Google group's.",
    },
    {
      question: "Has the AI Mode click study been peer reviewed?",
      answer:
        "Not yet. It is a preprint posted to arXiv on August 18, 2026, by researchers at the University of Pennsylvania and Northeastern University. It was preregistered, which means the hypotheses were written down before the data came in.",
    },
    {
      question: "Did removing AI Overviews bring the clicks back?",
      answer:
        "Partly, and the evidence is weaker. Among people actually exposed to the change, click-through rose 8.8 percentage points, but the browser extension only managed to hide 51.1% of AI Overviews, so read that number with care.",
    },
    {
      question: "Does this mean AEO is pointless?",
      answer:
        "No. It means a click is a poor way to count what AI search does for you. If fewer people click, being named and cited inside the answer matters more, and you need to measure that directly.",
    },
  ],
  content: `## The short version

Researchers changed what about 1,100 people in the US saw on Google for a week. One group had every search sent to [AI Mode](/glossary/ai-mode). That group clicked through to outside websites far less often, by 18.8 percentage points, than the group that used Google as normal.

That is the headline, and it has been repeated a lot. The details are more useful than the headline, so this article goes through what the study did, what else it found, and what it cannot tell you.

## Who ran the study

The paper is "AI in Search Reduces Publisher Referrals Without Improving User Experience: Experimental Evidence." It was posted to arXiv on August 18, 2026. The authors are Stephanie T. Wang and Danaé Metaxa of the University of Pennsylvania, and Jeffrey Gleason, Yakov Bart and Christo Wilson of Northeastern University.

Two things set it apart from most numbers you see about AI search:

- **It is an experiment.** Most click studies compare searches that happened to show an AI answer with searches that did not. Those searches differ in other ways too. Here, people were put into groups, so the groups differ only in what Google showed them.
- **It was preregistered.** The paper describes itself as "a preregistered field experiment." The authors wrote down what they expected before they collected the data.

It is also a preprint. It has not been through peer review yet.

## How the experiment worked

The researchers recruited US adults who use Chrome as their main browser and Google as their main search engine. Recruitment ran from March 17 to March 19, 2026. Each person installed a browser extension. For three days it only watched. For the next seven days it changed Google Search, depending on the group:

| Group | What the extension did |
| --- | --- |
| No AI Search | Hid [AI Overviews](/glossary/ai-overviews) and sent AI Mode searches back to normal search |
| Current Search | Nothing. In the paper's words, "no modifications to Google Search" |
| AI Mode Search | In the paper's words, it "redirects all searches to AI Mode" |

In total, 1,444 people enrolled. The click results come from the 1,100 who made at least one search during the seven days. The survey results come from the 956 who filled in the closing survey.

## What happened to clicks

In the AI Mode group, click-through rate fell by 18.8 percentage points compared with normal Google. The 95% confidence interval runs from 22.2 to 15.3 points lower, so the drop is not a fluke of the sample.

The paper also breaks the drop down by where the clicks would have gone:

| Clicks to | Change in the AI Mode group |
| --- | --- |
| All outside websites | 18.8 points lower |
| News sites | 12.5 points lower |
| Reddit | 21.2 points lower |
| Wikipedia | 9.9 points lower |

Clicks on ads fell too, by 42.7 points. The authors explain why: "AI Mode did not surface ads at the time of our experiment." That number says more about Google's ad rollout in March than about how people behave.

### Percentage points, not percent

Several summaries of this study say AI Mode cut clicks "by 18.8%." That is a different claim. A fall from 50% to 31.2% is 18.8 percentage points, and it is also a fall of more than a third. The paper reports the gap between the two groups in points. Quote it that way.

## People did not like it more

You might expect the trade to be fewer clicks in return for a better experience. The study found the opposite. Compared with normal Google, the AI Mode group:

- rated their trust in the information they found 0.34 points lower on a 7-point scale
- rated Google as less useful and less satisfying
- felt less in control of their searching
- spent slightly longer in each search session, about 0.43 minutes more
- had fewer search sessions a day, about 0.92 fewer
- were 11.2 percentage points more likely to run searches on Bing, DuckDuckGo or Yahoo

That last point matters. When people were given only AI answers, some of them went elsewhere.

## What about AI Overviews?

The No AI Search group tested the other direction: what happens when you take AI answers away. The paper reports that removing them "increased click-through rate by 8.8pp" among people who were actually exposed to the change.

Treat that number carefully. Google changed its page code during the study, and the extension stopped working. The paper says: "Overall, 51.1% of AI Overviews were successfully hidden." By the end of the week it was hiding none. The 8.8-point figure is an estimate that corrects for this. It is weaker evidence than the AI Mode result, where 94.7% of searches were routed as planned.

Taking AI answers away did not make people less happy. The paper found no significant change in trust, usefulness or satisfaction for that group.

## What the study does not tell you

Good research is narrow. This study is too:

- **It forced AI Mode on every search.** Nobody uses Google that way by choice. People who open AI Mode themselves pick it for questions that suit it. The study shows what happens if AI Mode becomes the default, not what happens today.
- **It ran for one week in March 2026.** Habits take longer than a week to form, and AI Mode has changed since.
- **It covers US Chrome users** recruited mostly through a research panel. Your audience may behave differently.
- **It measures clicks, not business results.** A click-through rate does not tell you whether the people who still click are worth more, or whether being named in an answer drives a visit later.
- **It is not peer reviewed yet.** The numbers could change in a later version.

## What this means for your site

### Stop counting clicks alone

If Google moves more searches into AI Mode, traffic from Google will fall for most sites, even those that rank well. A report that only counts organic clicks will read that as failure when your visibility may not have changed. Start tracking how often you are named and cited in AI answers for the questions that matter to you. Lesson 7, [Measuring AI visibility](/lessons/measuring-ai-visibility), covers how to build that report.

### Aim to be the source, not just a result

When an answer engine writes the answer, your brand reaches the reader in two ways: as a [citation](/glossary/citation) under the answer, or as a name inside it. Both depend on the engine being able to fetch your page and lift a clear passage from it. That is the work covered in our guide to [getting cited in Google AI Overviews](/blog/get-cited-in-google-ai-overviews).

### Do not rely on one engine

The AI Mode group searched more on Bing, DuckDuckGo and Yahoo. Searchers move when they are unhappy. Check that the crawlers behind the other answer engines can reach your site, too. Our free [AI crawler checker](/tools/ai-crawler-checker) reads your robots.txt and tells you which ones are blocked.

### Put the answer where it can be seen

If a reader may never visit your page, the sentence the engine quotes is all they get from you. Make it one you would be happy to be known for: specific, correct, and with your name attached.

## The bottom line

This is the strongest evidence so far that a search experience built only on AI answers sends fewer people to websites. It is also evidence that searchers, for now, do not prefer it. Google has reasons to move carefully, and you have reasons to prepare anyway. Measure citations as well as clicks, and make your pages easy to quote.`,
  sources: [
    {
      title: "AI in Search Reduces Publisher Referrals Without Improving User Experience: Experimental Evidence",
      publisher: "arXiv (Wang, Gleason, Bart, Wilson and Metaxa)",
      url: "https://arxiv.org/abs/2608.18352",
      date: "2026-08-18",
      dateKind: "published",
      accessed: "2026-11-19",
    },
    {
      title: "AI in Search Reduces Publisher Referrals Without Improving User Experience: Experimental Evidence (full text)",
      publisher: "arXiv",
      url: "https://arxiv.org/html/2608.18352",
      date: "2026-08-18",
      dateKind: "published",
      accessed: "2026-11-19",
    },
    {
      title: "November 2026 State of Search & AI",
      publisher: "GPO",
      url: "https://gpo.com/blog/november-2026-state-of-search-ai/",
      date: "2026-11-09",
      dateKind: "published",
      accessed: "2026-11-19",
    },
  ],
};
