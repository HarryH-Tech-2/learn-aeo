import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign In - Learn AEO",
  description: "Sign in to your Learn AEO account to continue your lessons.",
};

export default function LoginPage() {
  return (
    <main className="grain-overlay min-h-screen flex flex-col">
      <Navbar />
      <LoginContent />
      <Footer />
    </main>
  );
}
