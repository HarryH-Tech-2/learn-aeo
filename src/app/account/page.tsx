import type { Metadata } from "next";
import AccountContent from "./AccountContent";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Account");

export default function AccountPage() {
  return <AccountContent />;
}
