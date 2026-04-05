import { WorkOS } from "@workos-inc/node";
import { env } from "cloudflare:workers";
import {
  deleteCookie,
  getCookie,
  getRequestURL,
  setCookie,
} from "@solidjs/start/http";

const SESSION_COOKIE_NAME = "wos-session";
const AUTH_STATE_COOKIE_NAME = "wos-auth-state";
const RETURN_TO_COOKIE_NAME = "wos-return-to";
const CALLBACK_PATH = "/callback";
const DEFAULT_RETURN_TO = "/dashboard";

type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
};

function readRequiredEnv(name: "WORKOS_API_KEY" | "WORKOS_CLIENT_ID" | "WORKOS_COOKIE_PASSWORD") {
  const value = env[name] ?? process.env[name];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required auth secret: ${name}`);
  }

  return value;
}

function getWorkOS() {
  return new WorkOS(readRequiredEnv("WORKOS_API_KEY"), {
    clientId: readRequiredEnv("WORKOS_CLIENT_ID"),
  });
}

function getCookieOptions() {
  const requestUrl = getRequestURL();

  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: requestUrl.protocol === "https:",
  };
}

function getCallbackUrl() {
  return new URL(CALLBACK_PATH, getRequestURL()).toString();
}

function toSafeReturnPath(value?: string | null) {
  if (!value) {
    return DEFAULT_RETURN_TO;
  }

  try {
    const requestUrl = getRequestURL();
    const candidate = new URL(value, requestUrl.origin);

    if (candidate.origin !== requestUrl.origin) {
      return DEFAULT_RETURN_TO;
    }

    return `${candidate.pathname}${candidate.search}${candidate.hash}` || DEFAULT_RETURN_TO;
  } catch {
    return DEFAULT_RETURN_TO;
  }
}

function getCurrentPath() {
  const requestUrl = getRequestURL();
  return `${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`;
}

function setSessionCookie(sealedSession: string) {
  setCookie(SESSION_COOKIE_NAME, sealedSession, getCookieOptions());
}

function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE_NAME, getCookieOptions());
}

function clearLoginCookies() {
  const options = getCookieOptions();
  deleteCookie(AUTH_STATE_COOKIE_NAME, options);
  deleteCookie(RETURN_TO_COOKIE_NAME, options);
}

function setLoginCookies(state: string, returnTo: string) {
  const options = {
    ...getCookieOptions(),
    maxAge: 60 * 10,
  };

  setCookie(AUTH_STATE_COOKIE_NAME, state, options);
  setCookie(RETURN_TO_COOKIE_NAME, returnTo, options);
}

async function loadAuthenticatedSession() {
  const sessionData = getCookie(SESSION_COOKIE_NAME);

  if (!sessionData) {
    return null;
  }

  const workos = getWorkOS();
  const session = workos.userManagement.loadSealedSession({
    sessionData,
    cookiePassword: readRequiredEnv("WORKOS_COOKIE_PASSWORD"),
  });
  const authenticated = await session.authenticate();

  if (authenticated.authenticated) {
    return authenticated;
  }

  try {
    const refreshed = await session.refresh();

    if (refreshed.authenticated) {
      setSessionCookie(refreshed.sealedSession);
      return refreshed;
    }
  } catch {
    // Invalid or expired refresh tokens should fall through to a clean logout.
  }

  clearSessionCookie();
  return null;
}

function toSessionUser(user: {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const firstName = user.firstName?.trim() || null;
  const lastName = user.lastName?.trim() || null;
  const name = [firstName, lastName].filter(Boolean).join(" ") || user.email;

  return {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
    name,
  } satisfies SessionUser;
}

export async function getCurrentUser() {
  const authenticated = await loadAuthenticatedSession();

  if (!authenticated?.user?.id) {
    return null;
  }

  const user = await getWorkOS().userManagement.getUser(authenticated.user.id);
  return toSessionUser(user);
}

export async function updateCurrentUserProfile(firstName: string, lastName: string) {
  const authenticated = await loadAuthenticatedSession();

  if (!authenticated?.user?.id) {
    return null;
  }

  const user = await getWorkOS().userManagement.updateUser({
    userId: authenticated.user.id,
    firstName: firstName.trim() || undefined,
    lastName: lastName.trim() || undefined,
  });

  return toSessionUser(user);
}

export function getLoginPath(returnTo?: string | null) {
  const safeReturnTo = toSafeReturnPath(returnTo ?? getCurrentPath());
  return `/login?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function beginLogin(returnTo?: string | null) {
  const workos = getWorkOS();
  const state = crypto.randomUUID();
  const safeReturnTo = toSafeReturnPath(returnTo);

  setLoginCookies(state, safeReturnTo);

  return workos.userManagement.getAuthorizationUrl({
    provider: "authkit",
    redirectUri: getCallbackUrl(),
  });
}

export async function completeLogin(code?: string | null, state?: string | null) {
  const expectedState = getCookie(AUTH_STATE_COOKIE_NAME);
  const returnTo = toSafeReturnPath(getCookie(RETURN_TO_COOKIE_NAME));

  clearLoginCookies();

  if (!code || !state || !expectedState || state !== expectedState) {
    clearSessionCookie();
    return getLoginPath(returnTo);
  }

  const response = await getWorkOS().userManagement.authenticateWithCode({
    code,
    redirectUri: getCallbackUrl(),
    session: {
      sealSession: true,
      cookiePassword: readRequiredEnv("WORKOS_COOKIE_PASSWORD"),
    },
  });

  setSessionCookie(response.sealedSession);
  return returnTo;
}

export async function getLogoutUrl() {
  const authenticated = await loadAuthenticatedSession();

  clearSessionCookie();

  if (!authenticated?.sessionId) {
    return "/";
  }

  return getWorkOS().userManagement.getLogoutUrl({
    sessionId: authenticated.sessionId,
    returnTo: new URL("/", getRequestURL()).toString(),
  });
}
