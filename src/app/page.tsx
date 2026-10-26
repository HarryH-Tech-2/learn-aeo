import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  alternates: {
    canonical: SITE.url,
  },
};

export default function Home() {
  return <HomePage />;
}
