import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

export const metadata: Metadata = {
  title: "Checkout - Learn AEO",
  description: "Complete your purchase to unlock the full Learn AEO course.",
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
