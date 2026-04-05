import { A, createAsync, type RouteDefinition, type RouteSectionProps } from "@solidjs/router";
import { AuthControls } from "~/components/AuthControls";
import { getCurrentUserQuery } from "~/lib/auth";

export const route = {
  preload: () => getCurrentUserQuery(),
} satisfies RouteDefinition;

export default function AppLayout(props: RouteSectionProps) {
  const user = createAsync(() => getCurrentUserQuery());

  return (
    <div class="app-shell">
      <header class="site-header">
        <A href="/" class="brand-mark">
          <span class="brand-mark__glyph">OD</span>
          <span>OpenDrive</span>
        </A>
        <nav class="site-nav">
          <A href="/">Home</A>
          <A href="/share">Share a file</A>
          <A href="/dashboard">Dashboard</A>
        </nav>
        <AuthControls initialUser={user() ?? null} />
      </header>
      {props.children}
    </div>
  );
}
