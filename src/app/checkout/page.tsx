import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Checkout");

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
