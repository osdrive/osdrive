import { Title } from "@solidjs/meta";
import { A, createAsync, type RouteDefinition } from "@solidjs/router";
import { LogoutButton } from "~/components/LogoutButton";
import { requireCurrentUserQuery } from "~/lib/auth";

export const route = {
  preload: () => requireCurrentUserQuery("/dashboard"),
} satisfies RouteDefinition;

export default function DashboardPage() {
  const user = createAsync(() => requireCurrentUserQuery("/dashboard"));

  return (
    <main class="grid gap-6">
      <Title>Dashboard | OSDrive</Title>

      <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 grid gap-4">
        <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Protected route</div>
        <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em] max-lg:max-w-none">
          {user()?.name ?? "Loading account..."}
        </h1>
        <p class="m-0 max-w-[64ch] text-muted leading-relaxed">
          This dashboard is only available when a valid Better Auth session is present.
        </p>

        <div class="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
          <div>
            <span class="block mb-1.5 text-sm text-muted">Name</span>
            <strong class="block break-words">{user()?.name}</strong>
          </div>
          <div>
            <span class="block mb-1.5 text-sm text-muted">Email</span>
            <strong class="block break-words">{user()?.email}</strong>
          </div>
        </div>

        <div class="flex flex-wrap gap-3.5">
          <A
            href="/account"
            class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
          >
            Edit account
          </A>
          <LogoutButton class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold disabled:cursor-wait disabled:opacity-70 disabled:transform-none">
            Logout
          </LogoutButton>
        </div>
      </section>
    </main>
  );
}
