import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import "./app.css";

const client = new QueryClient()

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <QueryClientProvider client={client}>
            <Title>OSDrive</Title>
            <Suspense>{props.children}</Suspense>

            {import.meta.env.DEV && <SolidQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
