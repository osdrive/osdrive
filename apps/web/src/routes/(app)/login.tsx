import { Title } from "@solidjs/meta";
import { A, useNavigate, useSearchParams, type RouteDefinition } from "@solidjs/router";
import { createSignal } from "solid-js";
import { redirectAuthenticatedQuery } from "~/lib/auth";
import { authClient } from "~/lib/auth-client";

type AuthMode = "signin" | "signup";

export const route = {
  preload: ({ location }) => redirectAuthenticatedQuery(location.query.returnTo ?? "/dashboard"),
} satisfies RouteDefinition;

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = createSignal<AuthMode>("signin");
  const [isPending, setIsPending] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const returnTo = () => (searchParams.returnTo?.startsWith("/") ? searchParams.returnTo : "/dashboard");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    if (isPending()) {
      return;
    }

    const form = event.currentTarget;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    setIsPending(true);
    setErrorMessage(null);

    if (mode() === "signup" && !name) {
      setErrorMessage("Name is required to create an account.");
      setIsPending(false);
      return;
    }

    if (mode() === "signin") {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: returnTo(),
      });

      if (result.error) {
        setErrorMessage(getErrorMessage(result.error));
        setIsPending(false);
        return;
      }

      if (typeof window !== "undefined") {
        window.location.assign(returnTo());
        return;
      }

      void navigate(returnTo(), { replace: true });

      return;
    }

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: returnTo(),
    });

    if (result.error) {
      setErrorMessage(getErrorMessage(result.error));
      setIsPending(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.location.assign(returnTo());
      return;
    }

    void navigate(returnTo(), { replace: true });
  };

  return (
    <main class="grid min-h-[calc(100vh-8rem)] place-items-center py-4">
      <Title>Login | OpenDrive</Title>

      <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 w-[min(68rem,100%)] grid grid-cols-[minmax(0,1.1fr)_minmax(22rem,28rem)] gap-6 items-start max-lg:grid-cols-1">
        <div class="grid gap-4 content-start">
          <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Better Auth</div>
          <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em] max-lg:max-w-none">
            {mode() === "signin" ? "Sign in and open your dashboard." : "Create an account in one step."}
          </h1>
          <p class="m-0 max-w-[64ch] text-muted leading-relaxed">
            Email and password authentication is now handled directly in OpenDrive. New accounts land
            in the protected dashboard immediately.
          </p>
        </div>

        <form class="grid gap-4 p-5 rounded-[1.35rem] bg-panel-strong border border-white/[0.07]" onSubmit={handleSubmit}>
          <div class="grid grid-cols-2 gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              class={`min-h-11 border-0 rounded-full cursor-pointer ${mode() === "signin" ? "text-[#08111f] bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] font-bold" : "text-muted bg-transparent"}`}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              class={`min-h-11 border-0 rounded-full cursor-pointer ${mode() === "signup" ? "text-[#08111f] bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] font-bold" : "text-muted bg-transparent"}`}
              onClick={() => setMode("signup")}
            >
              Create account
            </button>
          </div>

          {mode() === "signup" ? (
            <label class="grid gap-2">
              <span class="text-sm text-muted">Name</span>
              <input
                name="name"
                type="text"
                maxLength={120}
                autocomplete="name"
                disabled={isPending()}
                class="w-full px-4 py-3.5 rounded-2xl border border-border bg-white/[0.04] text-text disabled:opacity-70"
              />
            </label>
          ) : null}

          <label class="grid gap-2">
            <span class="text-sm text-muted">Email</span>
            <input
              name="email"
              type="email"
              autocomplete="email"
              required
              disabled={isPending()}
              class="w-full px-4 py-3.5 rounded-2xl border border-border bg-white/[0.04] text-text disabled:opacity-70"
            />
          </label>

          <label class="grid gap-2">
            <span class="text-sm text-muted">Password</span>
            <input
              name="password"
              type="password"
              autocomplete={mode() === "signin" ? "current-password" : "new-password"}
              minLength={8}
              required
              disabled={isPending()}
              class="w-full px-4 py-3.5 rounded-2xl border border-border bg-white/[0.04] text-text disabled:opacity-70"
            />
          </label>

          {errorMessage() ? <p class="m-0 text-sm text-danger">{errorMessage()}</p> : null}

          <button
            type="submit"
            class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold disabled:cursor-wait disabled:opacity-70 disabled:transform-none"
            disabled={isPending()}
          >
            {isPending()
              ? mode() === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode() === "signin"
                ? "Sign in"
                : "Create account"}
          </button>

          <p class="m-0 text-muted leading-relaxed">
            Return to <A href="/" class="text-primary-strong">home</A> or head straight to <A href="/dashboard" class="text-primary-strong">dashboard</A> once
            your session is active.
          </p>
        </form>
      </section>
    </main>
  );
}
