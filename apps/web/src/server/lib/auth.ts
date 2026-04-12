import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "~/drizzle/schema";
import { db } from "~/server/lib/db";
import { serverEnv } from "./env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log("RESET EMAIL", user, url);
      // await sendEmail({
      //   from: "noreply@osdrive.app",
      //   to: user.email,
      //   subject: "Reset your OSDrive password",
      //   text: [
      //     "Hi,",
      //     "",
      //     "You requested a password reset for your OSDrive account.",
      //     "",
      //     `Reset your password: ${url}`,
      //     "",
      //     "If you didn't request this, you can safely ignore this email.",
      //     "This link expires in 1 hour.",
      //   ].join("\n"),
      //   html: [
      //     "<p>Hi,</p>",
      //     "<p>You requested a password reset for your OSDrive account.</p>",
      //     `<p><a href="${url}">Reset your password</a></p>`,
      //     "<p>If you didn't request this, you can safely ignore this email.<br>This link expires in 1 hour.</p>",
      //   ].join(""),
      // });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (params: { user: { email: string }; newEmail: string; url: string }) => {
        const { user, newEmail, url } = params;
        console.log("CHANGE EMAIL VERIFICATION", user.email, "->", newEmail, url);
        // TODO: send verification email
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];
