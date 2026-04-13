// Why?
//  - Batching for performance (Eg. `/api/me` and `/api/users` at same time)
//  - Single flight mutations
//
// Without any special RPC definitions, or per-page server function.
//

import { Context, Effect, flow, Layer, Request, RequestResolver, Stream } from "effect";
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
import { fetchWithEvent } from "@solidjs/start/http";

type BatchedServerRequest = readonly [string, globalThis.RequestInit];

type BatchedServerResponse = {
  readonly status: number;
  readonly statusText: string;
  readonly headers: ReadonlyArray<readonly [string, string]>;
  readonly body: string;
};

async function serverFetch(
  requests: ReadonlyArray<BatchedServerRequest>,
): Promise<ReadonlyArray<BatchedServerResponse>> {
  "use server";

  // TODO - Debug why this is???
  // * **Security:** Never pass unsanitized user input as the `url`. Callers are
  // * responsible for validating and restricting the URL.

  // TODO: Can we make the result way more efficient???
  console.log("demo3 batched fetch size", requests.length);

  return await Promise.all(
    requests.map(async (request) => {
      const response = await fetchWithEvent(...request);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Array.from(response.headers.entries()),
        body: await response.text(), // TODO: Handle streaming bytes
      };
    }),
  );
}

interface BatchedFetchRequest extends Request.Request<BatchedServerResponse, Error> {
  readonly _tag: "BatchedFetchRequest";
  readonly payload: BatchedServerRequest;
}

const BatchedFetchRequest = Request.tagged<BatchedFetchRequest>("BatchedFetchRequest");

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
          return Request.succeed(entry, response);
        }

        return Request.fail(entry, new Error("Missing batched response"));
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
      (response) =>
        HttpClientResponse.fromWeb(
          request,
          new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers.map(([key, value]) => [key, value] as [string, string]),
          }),
        ),
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
      transformClient: (client) =>
        // TODO: Remove this when using server-function backend
        client.pipe(
          HttpClient.mapRequest(flow(HttpClientRequest.prependUrl("http://localhost:5173"))),

          // TODO: I think Tanstack Query will do this for us?
          // HttpClient.retryTransient({
          //   schedule: Schedule.exponential(100),
          //   times: 3,
          // }),
        ),
    }),
  ).pipe(
    Layer.provide(FetchHttpClient.layer),
    // Layer.provide(customFetchLayer),  // TODO: Make this work with streaming bytes
  );
}

export const runApi = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromise(
    effect.pipe(Effect.provide(ApiClient.layer as never)) as Effect.Effect<A, E, never>,
  );
