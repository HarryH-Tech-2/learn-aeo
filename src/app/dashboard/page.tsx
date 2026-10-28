import type { Metadata } from "next";
import DashboardContent from "./DashboardContent";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Dashboard");

export default function DashboardPage() {
  return <DashboardContent />;
}
