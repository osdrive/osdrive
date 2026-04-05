import { Title } from "@solidjs/meta";
import { type RouteDefinition } from "@solidjs/router";
import { completeLoginQuery } from "~/lib/auth";

export const route = {
  preload: ({ location }) => completeLoginQuery(location.query.code ?? null, location.query.state ?? null),
} satisfies RouteDefinition;

export default function CallbackPage() {
  return (
    <main class="page page--centered">
      <Title>Signing in | OpenDrive</Title>
      <section class="panel panel--centered">
        <div class="eyebrow">AuthKit</div>
        <h1>Finishing sign-in...</h1>
        <p>We are sealing your session and sending you back into the app.</p>
      </section>
    </main>
  );
}
