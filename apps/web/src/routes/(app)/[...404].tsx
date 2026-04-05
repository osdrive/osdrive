import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
  return (
    <main class="page page--centered">
      <Title>Not Found | OpenDrive</Title>
      <HttpStatusCode code={404} />
      <section class="empty-state">
        <div class="eyebrow">404</div>
        <h1>That file route is missing.</h1>
        <p>
          The page you requested is gone, invalid, or the share link was copied incorrectly.
        </p>
        <div class="hero-actions">
          <A href="/" class="button button--primary">
            Back to home
          </A>
          <A href="/share" class="button button--ghost">
            Upload a file
          </A>
        </div>
      </section>
    </main>
  );
}
