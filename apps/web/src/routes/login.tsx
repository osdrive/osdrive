import { Title } from "@solidjs/meta";
import { type RouteDefinition } from "@solidjs/router";
import { startLoginQuery } from "~/lib/auth";

export const route = {
  preload: ({ location }) => startLoginQuery(location.query.returnTo ?? null),
} satisfies RouteDefinition;

export default function LoginPage() {
  return (
    <main class="page page--centered">
      <Title>Sign in | OpenDrive</Title>
      <section class="panel panel--centered">
        <div class="eyebrow">AuthKit</div>
        <h1>Redirecting to WorkOS...</h1>
        <p>Hold tight while we send you to the hosted sign-in flow.</p>
      </section>
    </main>
  );
}
