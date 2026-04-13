import { query, redirect } from "@solidjs/router";
import { getHeaders, getRequestURL } from "@solidjs/start/http";
import { auth } from "./lib/auth";

export const requireCurrentUserQuery = query(async (returnTo?: string | null) => {
  "use server";

  const user = await getCurrentUser();
  if (!user) throw redirect(getLoginPath(returnTo ?? getCurrentPath()));

  return user;
}, "auth.requireCurrentUser");

export const redirectAuthenticatedQuery = query(async (returnTo?: string | null) => {
  "use server";

  const user = await getCurrentUser();
  if (user) throw redirect(getSafeReturnTo(returnTo));

  return null;
}, "auth.redirectAuthenticated");

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

function getLoginPath(returnTo?: string | null) {
  return `/login?returnTo=${encodeURIComponent(toSafeReturnPath(returnTo))}`;
}

function getCurrentPath() {
  const requestUrl = getRequestURL();
  return `${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`;
}

async function getCurrentSession() {
  return auth.api.getSession({
    headers: getHeaders(),
  });
}

async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

function getSafeReturnTo(returnTo?: string | null) {
  return toSafeReturnPath(returnTo);
}
