import { describe, it, expect } from "vitest";
import { newsletterWelcomeHtml } from "@/lib/newsletter-email";
import { leadUnsubscribeUrl } from "@/lib/unsubscribe";

process.env.NEXTAUTH_SECRET ??= "test-secret";

describe("newsletter welcome email", () => {
  it("carries the subscriber's unsubscribe link", () => {
    const site = "https://www.learnaeo.com";
    const html = newsletterWelcomeHtml(site, "reader@example.com");
    const url = leadUnsubscribeUrl("reader@example.com", site);
    expect(html).toContain(`href="${url}"`);
  });
});
