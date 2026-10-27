import type { Metadata } from "next";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard - Learn AEO",
  description: "Track your progress through the Learn AEO course.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
