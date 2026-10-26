import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

export const metadata: Metadata = {
  title: "Checkout - Learn Hieroglyphics",
  description: "Complete your purchase to unlock the full Learn Hieroglyphics course.",
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
