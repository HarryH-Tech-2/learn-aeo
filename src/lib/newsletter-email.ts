import { FIRST_LESSON_PATH } from "@/lib/lesson-catalog";
import { button, emailLayout, heading, paragraph } from "@/lib/email-layout";
import { leadUnsubscribeUrl } from "@/lib/unsubscribe";

/** The welcome email, in the shared email look, with the subscriber's one-click unsubscribe link. */
export function newsletterWelcomeHtml(site: string, email: string): string {
  return emailLayout({
    baseUrl: site,
    preheader: "Course news from Learn AEO, and a free first lesson to start with.",
    body: [
      heading("Welcome to Learn AEO"),
      paragraph("Thanks for subscribing. We will email you when there is news about the course, such as a new lesson opening."),
      paragraph("While you wait, Lesson 1 is free: how AI search tools like Google's AI Overviews, ChatGPT search and Perplexity build an answer, and how they choose which pages to cite."),
      button(`${site}${FIRST_LESSON_PATH}`, "Start Lesson 1"),
    ].join(""),
    signature: false,
    reason: "You are getting this because you subscribed at learnaeo.com.",
    unsubscribeUrl: leadUnsubscribeUrl(email, site),
  });
}
