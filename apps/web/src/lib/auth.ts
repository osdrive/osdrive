import { action, query, redirect } from "@solidjs/router";
import {
  beginLogin,
  completeLogin,
  getCurrentUser,
  getLoginPath,
  getLogoutUrl,
  updateCurrentUserProfile,
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
    throw redirect(getLoginPath(returnTo));
  }

  return user;
}, "auth.requireCurrentUser");

export const startLoginQuery = query(async (returnTo?: string | null) => {
  "use server";

  throw redirect(beginLogin(returnTo));
}, "auth.startLogin");

export const completeLoginQuery = query(async (code?: string | null, state?: string | null) => {
  "use server";

  throw redirect(await completeLogin(code, state));
}, "auth.completeLogin");

export const logoutAction = action(async () => {
  "use server";

  throw redirect(await getLogoutUrl(), {
    revalidate: [getCurrentUserQuery.key],
  });
}, "auth.logout");

export const updateAccountAction = action(async (formData: FormData) => {
  "use server";

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");

  if (typeof firstName !== "string" || typeof lastName !== "string") {
    throw new Error("Invalid profile form submission.");
  }

  const updated = await updateCurrentUserProfile(firstName, lastName);

  if (!updated) {
    throw redirect(getLoginPath("/account"));
  }

  throw redirect("/dashboard", {
    revalidate: [getCurrentUserQuery.key, requireCurrentUserQuery.key],
  });
}, "auth.updateAccount");
