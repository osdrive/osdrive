import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "cloudflare:workers";
import { getHeaders, getRequestURL } from "@solidjs/start/http";
import { getDb } from "~/lib/db";
import { authSchema } from "~/lib/db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "sqlite",
    schema: authSchema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await env.EMAIL.send({
        from: "noreply@osdrive.app",
        to: user.email,
        subject: "Reset your OSDrive password",
        text: [
          "Hi,",
          "",
          "You requested a password reset for your OSDrive account.",
          "",
          `Reset your password: ${url}`,
          "",
          "If you didn't request this, you can safely ignore this email.",
          "This link expires in 1 hour.",
        ].join("\n"),
        html: [
          "<p>Hi,</p>",
          "<p>You requested a password reset for your OSDrive account.</p>",
          `<p><a href="${url}">Reset your password</a></p>`,
          "<p>If you didn't request this, you can safely ignore this email.<br>This link expires in 1 hour.</p>",
        ].join(""),
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];

function toSafeReturnPath(value?: string | null) {
  if (!value) {
    return "/dashboard";
  }

  try {
    const requestUrl = getRequestURL();
    const candidate = new URL(value, requestUrl.origin);

    if (candidate.origin !== requestUrl.origin) {
      return "/dashboard";
    }

    return `${candidate.pathname}${candidate.search}${candidate.hash}` || "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export function getLoginPath(returnTo?: string | null) {
  return `/login?returnTo=${encodeURIComponent(toSafeReturnPath(returnTo))}`;
}

export function getCurrentPath() {
  const requestUrl = getRequestURL();
  return `${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`;
}

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: getHeaders(),
  });
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireCurrentUser(returnTo?: string | null) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error(getLoginPath(returnTo));
  }

  return user;
}

export function getSafeReturnTo(returnTo?: string | null) {
  return toSafeReturnPath(returnTo);
}
