import type { NextAuthOptions } from "next-auth";
import { SITE } from "@/lib/site";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { notifyOwner } from "@/lib/notify";
import { EMAIL_COLORS, brandFrom, button, emailLayout, paragraph } from "@/lib/email-layout";
import { cookies } from "next/headers";
import { CAMPAIGN_COOKIE, decodeCampaign } from "@/lib/campaign";
import { REFERRER_COOKIE, decodeReferrer } from "@/lib/referrer";

/**
 * Copies the aeo_utm cookie (the marketing post that brought them, src/lib/campaign.ts) and the aeo_ref cookie
 * (the site they first came from, src/lib/referrer.ts) onto a new account.
 */
/** The free-unlock test group this browser was shown (src/lib/access-test.ts), if any. */
async function accessCookie(): Promise<string | null> {
  try {
    return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

async function recordSignupCampaign(userId: string) {
  try {
    const jar = await cookies();
    const c = decodeCampaign(jar.get(CAMPAIGN_COOKIE)?.value);
    const r = decodeReferrer(jar.get(REFERRER_COOKIE)?.value);
    if (!c && !r) return;
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(c ? { signupSource: c.source, signupCampaign: c.campaign } : {}),
        ...(r ? { signupReferrer: r.host, signupLanding: r.landing } : {}),
      },
    });
  } catch (e) {
    // never block a sign-up over attribution
    console.error("[auth:campaign]", e);
  }
}
import { enrolInNurture } from "@/lib/nurture-run";
import { ACCESS_COOKIE, assignAccessTest } from "@/lib/access-test";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      maxAge: 24 * 60 * 60, // 24 hours
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const result = await getResend().emails.send({
          from: brandFrom(),
          to: email,
          subject: "Sign in to Learn AEO",
          html: emailLayout({
            baseUrl: (process.env.NEXTAUTH_URL ?? SITE.url).replace(/\/$/, ""),
            preheader: "Your sign-in link for Learn AEO. It expires in 24 hours.",
            body: `${paragraph("Click the button below to sign in to your account.", { align: "center" })}
              ${button(url, "Sign In", { center: true })}
              ${paragraph("This link expires in 24 hours.<br/>If you didn't request this, you can safely ignore it.", { size: 13, color: EMAIL_COLORS.muted, align: "center" })}`,
            signature: false,
            reason: "You asked to sign in to learnaeo.com. If it wasn't you, ignore this email.",
          }),
        });

        if (result.error) {
          console.error("[auth:email] Resend error:", result.error);
          throw new Error(`Failed to send email: ${result.error.message}`);
        }
        console.log("[auth:email] Magic link sent to:", email);
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  events: {
    // Every new account: record the marketing post that brought them, then
    // enrol in the nurture sequence, which sends the day-0 welcome (replaces
    // the old standalone welcome; see src/lib/nurture-run.ts).
    async createUser({ user }) {
      if (!user.id) return;
      await recordSignupCampaign(user.id);
      // (the free-unlock test's group, while ACCESS_TEST_FREE_PERCENT is on: src/lib/access-test.ts)
      await assignAccessTest(user.id, await accessCookie());
      try {
        await enrolInNurture(user.id);
      } catch (err) {
        console.error("[auth:createUser] nurture enrolment failed:", err);
      }
    },
    // Google verifies email ownership during OAuth, but the Prisma adapter
    // leaves emailVerified null for OAuth sign-ins. Backfill it so the data
    // reflects reality (magic-link users get it set by NextAuth itself).
    async signIn({ user, account, isNewUser }) {
      if (account?.provider === "google" && user.id) {
        await prisma.user.updateMany({
          where: { id: user.id, emailVerified: null },
          data: { emailVerified: new Date() },
        });
      }
      if (isNewUser) {
        void notifyOwner({
          subject: `New account: ${user.email ?? "(no email)"}`,
          text: [
            `A new account was created.`,
            `Email: ${user.email ?? "(none)"}`,
            `Name: ${user.name ?? "(none)"}`,
            `Provider: ${account?.provider ?? "unknown"}`,
          ].join("\n"),
          ...(user.email ? { replyTo: user.email } : {}),
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/get-started?verify=true",
    // The sign-in that creates an account goes here (with ?callbackUrl=), and on to Lesson 1 unless
    // the sign-up asked for somewhere specific: src/app/welcome/route.ts, src/lib/new-user-landing.ts.
    newUser: "/welcome",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "email") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        });
        if (existingUser?.accounts.some((a) => a.provider === "google")) {
          return true;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user }) {
      if (session.user) {
        const sessionUser = session.user as { id?: string; status?: string };
        sessionUser.id = user.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { status: true },
        });
        sessionUser.status = dbUser?.status || "PENDING";
      }
      return session;
    },
  },
};
