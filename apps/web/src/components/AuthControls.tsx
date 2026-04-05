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
      class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
    >
      Sign in
    </A>
  );
}

function SignedInActions(props: { user: AuthenticatedUser }) {
  return (
    <div class="flex flex-wrap items-center justify-end gap-3 max-sm:justify-start">
      <div class="grid gap-0.5 min-w-0 text-muted text-right max-sm:text-left">
        <strong class="text-text">{props.user.name}</strong>
        <span class="text-sm break-words">{props.user.email}</span>
      </div>
      <A
        href="/dashboard"
        class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
      >
        Dashboard
      </A>
      <LogoutButton class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold disabled:cursor-wait disabled:opacity-70 disabled:transform-none">
        Logout
      </LogoutButton>
    </div>
  );
}
