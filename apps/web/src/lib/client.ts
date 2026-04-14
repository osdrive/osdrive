// Why?
//  - Batching for performance (Eg. `/api/me` and `/api/users` at same time)
//  - Single flight mutations
//
// Without any special RPC definitions, or per-page server function.
//

import { Context, Effect, flow, Layer, Request as EffectRequest, RequestResolver, Stream } from "effect";
import {
  HttpClient,
  HttpClientError,
  HttpClientResponse,
  Headers,
  FetchHttpClient,
  HttpClientRequest,
} from "effect/unstable/http";
import { RequestInit } from "effect/unstable/http/FetchHttpClient";
import { HttpApiClient } from "effect/unstable/httpapi";
import { osDriveApi } from "~/server/domain";
import { getRequestURL } from "@solidjs/start/http";
import { waitUntil } from "cloudflare:workers";
import { isServer } from "solid-js/web";

import { HttpRouter } from "effect/unstable/http";
import { appLayerLive } from "~/routes/api/[...api]"

type BatchedServerRequest = readonly [string, globalThis.RequestInit];
type BatchedServerResponse = Response;

async function serverFetch(
  requests: ReadonlyArray<BatchedServerRequest>,
): Promise<ReadonlyArray<BatchedServerResponse>> {
  "use server";

  return await Promise.all(
    requests.map(async ([path, init]) => {
      const requestUrl = getRequestURL();
      const absoluteUrl = new URL(path, requestUrl.origin);

      const { handler, dispose } = HttpRouter.toWebHandler(appLayerLive);
      const response = await handler(new globalThis.Request(absoluteUrl, init), Context.empty() as any);
      waitUntil(dispose().catch((cause) => console.error("OTEL shutdown failed", cause)));
      return response;
    }),
  );
}

interface BatchedFetchRequest extends EffectRequest.Request<BatchedServerResponse, Error> {
  readonly _tag: "BatchedFetchRequest";
  readonly payload: BatchedServerRequest;
}

const BatchedFetchRequest = EffectRequest.tagged<BatchedFetchRequest>("BatchedFetchRequest");

const batchedFetchResolver = RequestResolver.make<BatchedFetchRequest>((entries) =>
  Effect.gen(function* () {
    const requests = entries.map((entry) => entry.request.payload);
    const responses = yield* Effect.tryPromise({
      try: () => serverFetch(requests),
      catch: (cause) => (cause instanceof Error ? cause : new Error(String(cause))),
    });

    yield* Effect.forEach(
      entries,
      (entry, index) => {
        const response = responses[index];

        if (response) {
          return EffectRequest.succeed(entry, response);
        }

        return EffectRequest.fail(entry, new Error("Missing batched response"));
      },
      { discard: true },
    );
  }),
);

const customFetch: HttpClient.HttpClient = HttpClient.make((request, url, _signal, fiber) => {
  const options: globalThis.RequestInit = fiber.context.mapUnsafe.get(RequestInit.key) ?? {};
  const headers = options.headers
    ? Headers.merge(Headers.fromInput(options.headers), request.headers)
    : request.headers;

  const send = (body: BodyInit | undefined) =>
    Effect.map(
      Effect.request(
        BatchedFetchRequest({
          payload: [
            `${url.pathname}${url.search}${url.hash}`,
            {
              ...options,
              method: request.method,
              headers,
              body,
              duplex: request.body._tag === "Stream" ? "half" : undefined,
              // signal
            } as any,
          ],
        }),
        batchedFetchResolver,
      ).pipe(
        Effect.mapError(
          (cause) =>
            new HttpClientError.HttpClientError({
              reason: new HttpClientError.TransportError({
                request,
                cause,
              }),
            }),
        ),
      ),
      (response) => HttpClientResponse.fromWeb(request, response),
    );
  switch (request.body._tag) {
    case "Raw":
    case "Uint8Array":
      return send(request.body.body as any);
    case "FormData":
      return send(request.body.formData);
    case "Stream":
      return Effect.flatMap(Stream.toReadableStreamEffect(request.body.stream), send);
  }
  return send(undefined);
});

const customFetchLayer: Layer.Layer<HttpClient.HttpClient> = HttpClient.layerMergedContext(
  Effect.succeed(customFetch),
);

export class ApiClient extends Context.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof osDriveApi>
>()("acme/ApiClient") {
  static readonly layer = Layer.effect(
    ApiClient,
    HttpApiClient.make(osDriveApi, {
      // Use transformClient to apply middleware to the generated client. This
      // is useful for settings the base url and applying retry policies.
      // transformClient:(client) =>
      //   // TODO: Remove this when using server-function backend
      //   client.pipe(
      //     HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("http://localhost:5173"))),
      //     // TODO: I think Tanstack Query will do this for us?
      //     // HttpClient.retryTransient({
      //     //   schedule: Schedule.exponential(100),
      //     //   times: 3,
      //     // }),
      //   ),
    }),
  ).pipe(
    // TODO: `customFetchLayer` is having problems with streaming bytes but is required for server-rendering so we use it just for now, temporarily.
    // Layer.provide(isServer ? customFetchLayer : FetchHttpClient.layer),
    Layer.provide(customFetchLayer),  // TODO: Make this work with streaming bytes
  );
}

export const runApi = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromise(
    effect.pipe(Effect.provide(ApiClient.layer as never)) as Effect.Effect<A, E, never>,
  );
