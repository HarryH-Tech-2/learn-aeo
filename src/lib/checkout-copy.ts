/**
 * The line Stripe Checkout shows beside the Pay button (custom_text.submit).
 * Nobody who left checkout had a card declined (Stripe, May to Oct 2026): they
 * read the page and went, so it repeats what they are getting and the refund.
 * The refund terms match the pricing page (PricingSection, PricingFAQ).
 */
import type { Plan } from "@/lib/plans";

export function checkoutSubmitText(plan: Pick<Plan, "id">): string {
  switch (plan.id) {
    case "lifetime":
      return "One payment, no subscription: every lesson, yours for life. Not for you? Email us within 14 days for a full refund.";
    case "monthly":
      return "The full course while your pass runs. Cancel any time from your account. Not for you? Email us within 14 days for a full refund.";
    default:
      return "A year of the full course for your class or school. Not for you? Email us within 14 days for a full refund.";
  }
}
