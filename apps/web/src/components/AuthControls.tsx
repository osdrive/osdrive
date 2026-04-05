import { A, useLocation } from "@solidjs/router";
import { LogoutButton } from "~/components/LogoutButton";

type AuthenticatedUser = {
  name: string;
  email: string;
};

export function AuthControls(props: { initialUser: AuthenticatedUser | null }) {
  return props.initialUser ? <SignedInActions user={props.initialUser} /> : <SignedOutActions />;
}

function SignedOutActions() {
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

function SignedInActions(props: { user: AuthenticatedUser }) {
  return (
    <div class="auth-actions">
      <div class="auth-copy">
        <strong>{props.user.name}</strong>
        <span>{props.user.email}</span>
      </div>
      <A href="/dashboard" class="button button--ghost">
        Dashboard
      </A>
      <LogoutButton class="button button--primary">Logout</LogoutButton>
    </div>
  );
}
