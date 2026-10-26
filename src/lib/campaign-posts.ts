/**
 * Names for the tagged marketing links, so /admin/marketing reads "r/homeschool: worksheet" instead of
 * "reddit / homeschool". Add a row whenever a new post goes out (the drafts live in Postiz; the copy in
 * docs/marketing-kit.md). Campaigns not listed here still show, under their raw tags.
 */
export type CampaignPost = { source: string; campaign: string; label: string; where: string; date: string };

export const CAMPAIGN_POSTS: CampaignPost[] = [
  { source: "reddit", campaign: "iib", label: "Name translator", where: "r/InternetIsBeautiful", date: "2026-10-02" },
  { source: "x", campaign: "olivia", label: "“Olivia” cartouche", where: "X", date: "2026-10-02" },
  { source: "x", campaign: "hard", label: "Is it hard to learn hieroglyphics?", where: "X", date: "2026-10-04" },
  { source: "reddit", campaign: "homeschool", label: "Worksheet + translator", where: "r/homeschool", date: "2026-10-05" },
  { source: "x", campaign: "reply-name", label: "Reply with your name", where: "X", date: "2026-10-06" },
  { source: "reddit", campaign: "ancientegypt", label: "Is it hard? (blog post)", where: "r/ancientegypt", date: "2026-10-08" },
  // The classroom worksheet: the address printed on pupils' pages, and the email a teacher asks for there.
  { source: "worksheet", campaign: "name", label: "Printed worksheet (/name)", where: "Paper", date: "2026-10-05" },
  { source: "worksheet-email", campaign: "worksheet", label: "Worksheet + lesson plan email", where: "Email", date: "2026-10-05" },
  { source: "worksheet-email", campaign: "worksheet-trial", label: "Worksheet follow-up: free class quiz trial", where: "Email", date: "2026-10-16" },
  // The nurture emails (src/lib/nurture-emails.ts): visitors here are clicks; the readers already have accounts.
  { source: "nurture", campaign: "welcome", label: "Day 0: welcome", where: "Email", date: "2026-10-05" },
  { source: "nurture", campaign: "door-sealed", label: "Day 1: door still sealed", where: "Email", date: "2026-10-05" },
  { source: "nurture", campaign: "next-door", label: "Day 1: behind the next door", where: "Email", date: "2026-10-05" },
  { source: "nurture", campaign: "free-stuff", label: "Day 3: three free things", where: "Email", date: "2026-10-05" },
  { source: "nurture", campaign: "offer", label: "Day 5: 33% offer", where: "Email", date: "2026-10-05" },
  { source: "nurture", campaign: "offer-expires", label: "Day 7: offer ends soon", where: "Email", date: "2026-10-05" },
  { source: "nurture", campaign: "coffee", label: "Day 5: coffee ask (free-unlock group)", where: "Email", date: "2026-10-23" },
  // Pinterest pins (public/pins, made by scripts/dev/make-pins.py; pins.csv has the copy and tagged links)
  { source: "pinterest", campaign: "pin-name-olivia", label: "Pin: Olivia cartouche", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-name-emma", label: "Pin: Emma cartouche", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-name-amelia", label: "Pin: Amelia cartouche", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-name-sophia", label: "Pin: Sophia cartouche", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-name-liam", label: "Pin: Liam cartouche", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-name-noah", label: "Pin: Noah cartouche", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-name-oliver", label: "Pin: Oliver cartouche", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-name-james", label: "Pin: James cartouche", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-alphabet-chart", label: "Pin: alphabet chart", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-free-lesson", label: "Pin: free lesson", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-teacher-worksheet", label: "Pin: teacher worksheet", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-pet-name", label: "Pin: pet names", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-couple-names", label: "Pin: couple names", where: "Pinterest", date: "2026-10-26" },
  { source: "pinterest", campaign: "pin-tattoo-stencil", label: "Pin: tattoo stencil", where: "Pinterest", date: "2026-10-26" },
];
