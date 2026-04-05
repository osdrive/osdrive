import { Title } from "@solidjs/meta";
import { A, createAsync, type RouteDefinition } from "@solidjs/router";
import { logoutAction, requireCurrentUserQuery } from "~/lib/auth";

export const route = {
  preload: () => requireCurrentUserQuery("/dashboard"),
} satisfies RouteDefinition;

export default function DashboardPage() {
  const user = createAsync(() => requireCurrentUserQuery("/dashboard"));

  return (
    <main class="page">
      <Title>Dashboard | OpenDrive</Title>

      <section class="panel account-panel">
        <div class="eyebrow">Protected route</div>
        <h1>{user()?.name ?? "Loading account..."}</h1>
        <p>
          This dashboard is only available after authenticating with WorkOS AuthKit.
        </p>

        <div class="account-grid">
          <div>
            <span class="meta-label">Name</span>
            <strong>{user()?.name}</strong>
          </div>
          <div>
            <span class="meta-label">Email</span>
            <strong>{user()?.email}</strong>
          </div>
        </div>

        <div class="hero-actions">
          <A href="/account" class="button button--ghost">
            Edit account
          </A>
          <form action={logoutAction} method="post" class="inline-form">
            <button type="submit" class="button button--primary">
              Logout
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
