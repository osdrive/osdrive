import { Context, Effect, Layer, Schedule, Stream } from "effect"
import {  HttpClient, HttpClientError, HttpClientRequest, HttpClientResponse, Headers } from "effect/unstable/http"
import { Fetch, RequestInit } from "effect/unstable/http/FetchHttpClient"
import { HttpApiClient, } from "effect/unstable/httpapi"
import { onMount } from "solid-js"
import { demoApi } from "~/server/effect"
import { fetchWithEvent } from "@solidjs/start/http";

// TODO: Allow multiple w/ batching???
async function serverFetch(request: any) {
  "use server";

  // TODO - Debug why this is???
  // * **Security:** Never pass unsanitized user input as the `url`. Callers are
  // * responsible for validating and restricting the URL.

  // TODO: Can we make the result way more efficient???
  return await fetchWithEvent(...request);
}

const customFetch: HttpClient.HttpClient = HttpClient.make((request, url, signal, fiber) => {
  const fetch = fiber.getRef(Fetch)
  const options: globalThis.RequestInit = fiber.context.mapUnsafe.get(RequestInit.key) ?? {}
  const headers = options.headers ? Headers.merge(Headers.fromInput(options.headers), request.headers) : request.headers



  const send = (body: BodyInit | undefined) =>
    Effect.map(
      Effect.tryPromise({
        try: () =>
          serverFetch([
                  `${url.pathname}${url.search}${url.hash}`,
											{
												...options,
												method: request.method,
												headers,
												body,
												duplex:
													request.body._tag === "Stream" ? "half" : undefined,
												// signal
											} as any,
										]),
        catch: (cause) =>
          new HttpClientError.HttpClientError({
            reason: new HttpClientError.TransportError({
              request,
              cause
            })
          })
      }),
      (response) => HttpClientResponse.fromWeb(request, response)
    )
  switch (request.body._tag) {
    case "Raw":
    case "Uint8Array":
      return send(request.body.body as any)
    case "FormData":
      return send(request.body.formData)
    case "Stream":
      return Effect.flatMap(Stream.toReadableStreamEffect(request.body.stream), send)
  }
  return send(undefined)
})

const customFetchLayer: Layer.Layer<HttpClient.HttpClient> = HttpClient.layerMergedContext(Effect.succeed(customFetch))

export class ApiClient extends Context.Service<ApiClient, HttpApiClient.ForApi<typeof demoApi>>()("acme/ApiClient") {
  static readonly layer = Layer.effect(
    ApiClient,
    HttpApiClient.make(demoApi, {
      // Use transformClient to apply middleware to the generated client. This
      // is useful for settings the base url and applying retry policies.
      transformClient: (client) =>
        client.pipe(
          // HttpClient.mapRequest(flow(
          //   HttpClientRequest.prependUrl("http://localhost:5173")
          // )),
          HttpClient.retryTransient({
            schedule: Schedule.exponential(100),
            times: 3
          })
        )
    })
  ).pipe(
    // Layer.provide(FetchHttpClient.layer)
    Layer.provide(customFetchLayer)
  )
}


export default function Page() {
  // TODO: hook this up properly w/ SSR streaming
  onMount(() => {
    const callApi = Effect.gen(function* () {
      const client = yield* ApiClient

      const result = yield* client.demo.hello({ params: { name: "Oscar!" } });
      console.log(result);
    }).pipe(
      Effect.provide(ApiClient.layer)
    );

    Effect.runPromise(callApi);
  });


  return <h1>Hello World!</h1>
}
