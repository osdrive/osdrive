import posthog from "posthog-js";

type AnalyticsUser = {
  id: string;
  email: string;
  name: string;
};

export function identifyUser(user: AnalyticsUser) {
  if (typeof window === "undefined") {
    return;
  }

  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
  });
}

export function clearUserIdentity() {
  if (typeof window === "undefined") {
    return;
  }

  posthog.reset();
}
