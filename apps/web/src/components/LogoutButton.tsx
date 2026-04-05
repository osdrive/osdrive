import { useNavigate } from "@solidjs/router";
import { createSignal, type JSX } from "solid-js";
import { authClient } from "~/lib/auth-client";
import { clearUserIdentity } from "~/lib/posthog-client";

export function LogoutButton(props: { children: JSX.Element; class?: string; redirectTo?: string }) {
  const navigate = useNavigate();
  const [isPending, setIsPending] = createSignal(false);

  const handleClick = async () => {
    if (isPending()) {
      return;
    }

    setIsPending(true);

    const result = await authClient.signOut();

    if (result.error) {
      setIsPending(false);
      return;
    }

    clearUserIdentity();

    if (typeof window !== "undefined") {
      window.location.assign(props.redirectTo ?? "/");
      return;
    }

    void navigate(props.redirectTo ?? "/", { replace: true });
  };

  return (
    <button type="button" class={props.class} disabled={isPending()} onClick={handleClick}>
      {isPending() ? "Logging out..." : props.children}
    </button>
  );
}
