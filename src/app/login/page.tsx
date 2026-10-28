import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginContent from "./LoginContent";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Sign in");

export default function LoginPage() {
  return (
    <main className="grain-overlay min-h-screen flex flex-col">
      <Navbar />
      <LoginContent />
      <Footer />
    </main>
  );
}
