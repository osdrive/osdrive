import { MetaProvider, Title } from "@solidjs/meta";
import { A, Router, createAsync } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { SignedInActions, SignedOutActions } from "~/components/AuthControls";
import { getCurrentUserServer } from "~/lib/auth";
import "./app.css";

export default function App() {
  const user = createAsync(() => getCurrentUserServer());

  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>OpenDrive</Title>
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
              {user() ? <SignedInActions user={user()!} /> : <SignedOutActions />}
            </header>
            <Suspense>{props.children}</Suspense>
          </div>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
