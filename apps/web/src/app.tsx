import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { RegistryProvider } from "@effect/atom-solid";
import { Suspense } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import "./app.css";

const client = new QueryClient();

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <RegistryProvider>
            <QueryClientProvider client={client}>
              <Title>OSDrive</Title>

              <Suspense>{props.children}</Suspense>

              <SolidQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </RegistryProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
