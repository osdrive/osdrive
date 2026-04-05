import { MetaProvider, Title } from "@solidjs/meta";
import { A, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
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
              </nav>
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
