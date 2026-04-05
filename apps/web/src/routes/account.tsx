import { Title } from "@solidjs/meta";
import { A, createAsync, type RouteDefinition } from "@solidjs/router";
import { requireCurrentUserQuery, updateAccountAction } from "~/lib/auth";

export const route = {
  preload: () => requireCurrentUserQuery("/account"),
} satisfies RouteDefinition;

export default function AccountPage() {
  const user = createAsync(() => requireCurrentUserQuery("/account"));

  return (
    <main class="page">
      <Title>Edit account | OpenDrive</Title>

      <section class="panel panel--upload">
        <div class="panel-copy">
          <div class="eyebrow">Profile</div>
          <h1>Edit your account details.</h1>
          <p>
            This demo updates your WorkOS AuthKit profile directly, then sends you back to the
            protected dashboard.
          </p>
        </div>

        <form action={updateAccountAction} method="post" class="upload-form">
          <label class="field">
            <span>First name</span>
            <input
              name="firstName"
              type="text"
              value={undefined}
              defaultValue={user()?.firstName ?? ""}
              maxLength={80}
            />
          </label>

          <label class="field">
            <span>Last name</span>
            <input
              name="lastName"
              type="text"
              value={undefined}
              defaultValue={user()?.lastName ?? ""}
              maxLength={80}
            />
          </label>

          <label class="field">
            <span>Email</span>
            <input type="email" value={user()?.email ?? ""} disabled />
          </label>

          <div class="hero-actions">
            <button type="submit" class="button button--primary">
              Save profile
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
