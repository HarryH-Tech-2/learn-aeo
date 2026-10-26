import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.learnhieroglyphics.com",
  },
};

export default function Home() {
  return <HomePage />;
}
