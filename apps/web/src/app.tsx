import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { RegistryProvider } from "@effect/atom-solid";
import { Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import "./app.css";

const queryClient = new QueryClient();
if (!isServer) (window as any).__TANSTACK_QUERY_CLIENT__ = queryClient;

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <RegistryProvider>
            <QueryClientProvider client={queryClient}>
              <Title>OSDrive</Title>

              <Suspense fallback="Loading...">{props.children}</Suspense>
            </QueryClientProvider>
          </RegistryProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
