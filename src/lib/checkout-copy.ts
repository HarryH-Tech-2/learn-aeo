/**
 * The line Stripe Checkout shows beside the Pay button (custom_text.submit).
 * Nobody who left checkout had a card declined (Stripe, May to Oct 2026): they
 * read the page and went, so it repeats what they are getting and the refund.
 * The refund terms match the pricing page (PricingSection, PricingFAQ).
 *
 * No amounts here on purpose: Stripe shows the price beside this line, and with a parity coupon or an offer
 * applied that price is lower than the plan's list price, so naming "$100" would contradict it.
 */
import type { Plan } from "@/lib/plans";

export function checkoutSubmitText(plan: Pick<Plan, "id">): string {
  switch (plan.id) {
    case "lifetime":
      return "One payment, no subscription: every lesson, yours for life. Not for you? Email us within 14 days for a full refund.";
    case "monthly":
      return "The full course, month by month. Cancel any time from your account. Not for you? Email us within 14 days for a full refund.";
  }
}
