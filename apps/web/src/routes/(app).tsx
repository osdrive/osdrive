import { A, createAsync, type RouteDefinition, type RouteSectionProps } from "@solidjs/router";
import { createEffect } from "solid-js";
import { AuthControls } from "~/components/AuthControls";
import { getCurrentUserQuery } from "~/lib/auth";
import { clearUserIdentity, identifyUser } from "~/lib/posthog-client";

export const route = {
  preload: () => getCurrentUserQuery(),
} satisfies RouteDefinition;

export default function AppLayout(props: RouteSectionProps) {
  const user = createAsync(() => getCurrentUserQuery());

  createEffect(() => {
    const currentUser = user();

    if (currentUser) {
      identifyUser({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
      });
      return;
    }

    clearUserIdentity();
  });

  return (
    <div class="w-[min(1180px,calc(100vw-2rem))] mx-auto py-4 pb-16">
      <header class="flex items-center justify-between flex-wrap gap-4 pb-6">
        <A href="/" class="inline-flex items-center gap-3.5 font-bold tracking-wide">
          <span class="inline-grid place-items-center w-10 h-10 rounded-xl bg-[linear-gradient(135deg,var(--color-primary-strong),#5eead4)] text-[#08111f] shadow-[0_16px_42px_rgba(92,128,255,0.28)]">
            OD
          </span>
          <span>OpenDrive</span>
        </A>
        <nav class="flex items-center gap-4 text-muted">
          <A href="/" class="hover:text-text [&[aria-current='page']]:text-text">Home</A>
          <A href="/share" class="hover:text-text [&[aria-current='page']]:text-text">Share a file</A>
          <A href="/dashboard" class="hover:text-text [&[aria-current='page']]:text-text">Dashboard</A>
        </nav>
        <AuthControls initialUser={user() ?? null} />
      </header>
      {props.children}
    </div>
  );
}
