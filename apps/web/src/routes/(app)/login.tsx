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
    <main class="page page--centered auth-page">
      <Title>Login | OpenDrive</Title>

      <section class="panel auth-panel">
        <div class="auth-panel__copy">
          <div class="eyebrow">Better Auth</div>
          <h1>{mode() === "signin" ? "Sign in and open your dashboard." : "Create an account in one step."}</h1>
          <p>
            Email and password authentication is now handled directly in OpenDrive. New accounts land
            in the protected dashboard immediately.
          </p>
        </div>

        <form class="auth-form" onSubmit={handleSubmit}>
          <div class="auth-switcher" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              class={`auth-switcher__button ${mode() === "signin" ? "auth-switcher__button--active" : ""}`}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              class={`auth-switcher__button ${mode() === "signup" ? "auth-switcher__button--active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Create account
            </button>
          </div>

          {mode() === "signup" ? (
            <label class="field">
              <span>Name</span>
              <input name="name" type="text" maxLength={120} autocomplete="name" disabled={isPending()} />
            </label>
          ) : null}

          <label class="field">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" required disabled={isPending()} />
          </label>

          <label class="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autocomplete={mode() === "signin" ? "current-password" : "new-password"}
              minLength={8}
              required
              disabled={isPending()}
            />
          </label>

          {errorMessage() ? <p class="message message--error">{errorMessage()}</p> : null}

          <button type="submit" class="button button--primary" disabled={isPending()}>
            {isPending()
              ? mode() === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode() === "signin"
                ? "Sign in"
                : "Create account"}
          </button>

          <p class="auth-note">
            Return to <A href="/">home</A> or head straight to <A href="/dashboard">dashboard</A> once
            your session is active.
          </p>
        </form>
      </section>
    </main>
  );
}
