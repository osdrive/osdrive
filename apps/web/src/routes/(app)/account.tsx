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
    <main class="grid gap-6">
      <Title>Edit account | OpenDrive</Title>

      <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 grid grid-cols-[1.1fr_0.9fr] gap-6 max-lg:grid-cols-1">
        <div class="grid gap-4 content-start">
          <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Profile</div>
          <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em] max-lg:max-w-none">
            Edit your account details.
          </h1>
          <p class="m-0 max-w-[64ch] text-muted leading-relaxed">
            Update the name and email stored on your Better Auth account, then head back to the dashboard.
          </p>
        </div>

        <form class="grid gap-4 p-5 rounded-[1.35rem] bg-panel-strong border border-white/[0.07] content-start" onSubmit={handleSubmit}>
          <label class="grid gap-2">
            <span class="text-sm text-muted">Name</span>
            <input
              name="name"
              type="text"
              value={undefined}
              defaultValue={user()?.name ?? ""}
              maxLength={120}
              autocomplete="name"
              required
              disabled={isPending()}
              class="w-full px-4 py-3.5 rounded-2xl border border-border bg-white/[0.04] text-text disabled:opacity-70"
            />
          </label>

          <label class="grid gap-2">
            <span class="text-sm text-muted">Email</span>
            <input
              name="email"
              type="email"
              value={undefined}
              defaultValue={user()?.email ?? ""}
              autocomplete="email"
              required
              disabled={isPending()}
              class="w-full px-4 py-3.5 rounded-2xl border border-border bg-white/[0.04] text-text disabled:opacity-70"
            />
          </label>

          {errorMessage() ? <p class="m-0 text-sm text-danger">{errorMessage()}</p> : null}

          <div class="flex flex-wrap gap-3.5">
            <button
              type="submit"
              class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold disabled:cursor-wait disabled:opacity-70 disabled:transform-none"
              disabled={isPending()}
            >
              {isPending() ? "Saving..." : "Save account"}
            </button>
            <A
              href="/dashboard"
              class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
            >
              Cancel
            </A>
          </div>
        </form>
      </section>
    </main>
  );
}
