import { Title } from "@solidjs/meta";
import { A, createAsync, useNavigate, type RouteDefinition } from "@solidjs/router";
import { createSignal } from "solid-js";
import { authClient } from "~/lib/auth-client";
import { requireCurrentUserQuery } from "~/lib/auth";

export const route = {
  preload: () => requireCurrentUserQuery("/account"),
} satisfies RouteDefinition;

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Unable to update your account right now.";
}

export default function AccountPage() {
  const navigate = useNavigate();
  const user = createAsync(() => requireCurrentUserQuery("/account"));
  const [isPending, setIsPending] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    if (isPending() || !user()) {
      return;
    }

    const form = event.currentTarget;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const currentUser = user();

    if (!name) {
      setErrorMessage("Name is required.");
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    if (name !== currentUser?.name) {
      const result = await authClient.updateUser({ name });

      if (result.error) {
        setErrorMessage(getErrorMessage(result.error));
        setIsPending(false);
        return;
      }
    }

    if (email !== currentUser?.email) {
      const result = await authClient.changeEmail({ newEmail: email });

      if (result.error) {
        setErrorMessage(getErrorMessage(result.error));
        setIsPending(false);
        return;
      }
    }

    if (typeof window !== "undefined") {
      window.location.assign("/dashboard");
      return;
    }

    void navigate("/dashboard", { replace: true });
  };

  return (
    <main class="page">
      <Title>Edit account | OpenDrive</Title>

      <section class="panel panel--upload">
        <div class="panel-copy">
          <div class="eyebrow">Profile</div>
          <h1>Edit your account details.</h1>
          <p>Update the name and email stored on your Better Auth account, then head back to the dashboard.</p>
        </div>

        <form class="upload-form" onSubmit={handleSubmit}>
          <label class="field">
            <span>Name</span>
            <input
              name="name"
              type="text"
              value={undefined}
              defaultValue={user()?.name ?? ""}
              maxLength={120}
              autocomplete="name"
              required
              disabled={isPending()}
            />
          </label>

          <label class="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={undefined}
              defaultValue={user()?.email ?? ""}
              autocomplete="email"
              required
              disabled={isPending()}
            />
          </label>

          {errorMessage() ? <p class="message message--error">{errorMessage()}</p> : null}

          <div class="hero-actions">
            <button type="submit" class="button button--primary" disabled={isPending()}>
              {isPending() ? "Saving..." : "Save account"}
            </button>
            <A href="/dashboard" class="button button--ghost">
              Cancel
            </A>
          </div>
        </form>
      </section>
    </main>
  );
}
