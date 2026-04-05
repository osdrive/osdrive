import { query, redirect } from "@solidjs/router";
import {
  getCurrentPath,
  getCurrentUser,
  getLoginPath,
  getSafeReturnTo,
} from "~/lib/auth-server";

export async function getCurrentUserServer() {
  "use server";

  return getCurrentUser();
}

export const getCurrentUserQuery = query(async () => {
  "use server";

  return getCurrentUser();
}, "auth.currentUser");

export const requireCurrentUserQuery = query(async (returnTo?: string | null) => {
  "use server";

  const user = await getCurrentUser();

  if (!user) {
    throw redirect(getLoginPath(returnTo ?? getCurrentPath()));
  }

  return user;
}, "auth.requireCurrentUser");

export const redirectAuthenticatedQuery = query(async (returnTo?: string | null) => {
  "use server";

  const user = await getCurrentUser();

  if (user) {
    throw redirect(getSafeReturnTo(returnTo));
  }

  return null;
}, "auth.redirectAuthenticated");
