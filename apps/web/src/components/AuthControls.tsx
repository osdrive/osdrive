import { A, useLocation } from "@solidjs/router";
import { logoutAction } from "~/lib/auth";

type AuthenticatedUser = {
  name: string;
  email: string;
};

export function SignedOutActions() {
  const location = useLocation();

  return (
    <A
      href={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}${location.hash}` || "/dashboard")}`}
      class="button button--ghost"
    >
      Sign in
    </A>
  );
}

export function SignedInActions(props: { user: AuthenticatedUser }) {
  return (
    <div class="auth-actions">
      <div class="auth-copy">
        <strong>{props.user.name}</strong>
        <span>{props.user.email}</span>
      </div>
      <A href="/dashboard" class="button button--ghost">
        Dashboard
      </A>
      <form action={logoutAction} method="post" class="inline-form">
        <button type="submit" class="button button--primary">
          Logout
        </button>
      </form>
    </div>
  );
}
