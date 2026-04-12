import { Effect, Layer, Schema, SchemaIssue } from "effect";
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http";
import { OtlpLogger, OtlpSerialization, OtlpTracer } from "effect/unstable/observability";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";
import { waitUntil } from "cloudflare:workers";
import type { APIEvent } from "@solidjs/start/server";
import { demoApi } from "~/server/effect";
import { serverEnv } from "~/server/lib/env";
import { name, version } from "../../../package.json" with { type: 'json' };

const demoGroupLayer = HttpApiBuilder.group(demoApi, "demo", (handlers) =>
	handlers.handle(
		"hello",
		({ params }) =>
			Effect.gen(function* () {
				yield* Effect.log("starting");

				return {
					message: `Hello, ${params.name}!`,
					name: params.name,
				};
			}).pipe(Effect.withSpan("demo.hello")),
	)
		.handle(
			"errors",
			() =>
				Effect.gen(function* () {
					if (Math.random() < 0.5) {
						const error = Schema.decodeUnknownSync(
							Schema.Struct({
								message: Schema.String,
							}),
						)({
							message: 123,
						});

						yield* Effect.fail({
							_tag: "MyErrorResponse" as const,
							message: error instanceof Error ? error.message : "Schema validation failed",
							issues: [
								Schema.isSchemaError(error)
									? SchemaIssue.makeFormatterDefault()(error.issue)
									: String(error),
							],
						});
					}

					return {
						message: "success",
					};
				}).pipe(Effect.withSpan("demo.errors")),
		),
);

const appLayer = Layer.mergeAll(
	HttpApiBuilder.layer(demoApi, { openapiPath: "/api/openapi.json" }),
	HttpApiScalar.layerCdn(demoApi, { path: "/api/docs" }),
).pipe(Layer.provideMerge(demoGroupLayer));

const makeTelemetryParams = (suffix: string) => ({
  url: `${serverEnv.AXIOM_DOMAIN}${suffix}`,
  headers: {
    Authorization: `Bearer ${serverEnv.AXIOM_TOKEN}`,
    "X-Axiom-Dataset": serverEnv.AXIOM_DATASET,
  },
	exportInterval: "1 second",
	shutdownTimeout: "5 seconds",
	resource: {
		serviceName: name,
		serviceVersion: version,
		attributes: {
			"deployment.environment": import.meta.env.MODE,
		},
},
} as const);

const telemetry = serverEnv.AXIOM_DATASET ? Layer.merge(
  OtlpTracer.layer(makeTelemetryParams("/v1/traces")),
  OtlpLogger.layer(makeTelemetryParams("/v1/logs")),
).pipe(
		Layer.provide(OtlpSerialization.layerJson),
		Layer.provide(FetchHttpClient.layer),
	) : Layer.empty;

const appLayerTemp = appLayer.pipe(Layer.provide(HttpServer.layerServices));
const appLayerLive = Layer.mergeAll(appLayerTemp, telemetry);

export async function GET({ request }: APIEvent) {
  const { handler, dispose } = HttpRouter.toWebHandler(appLayerLive);
	const response = await handler(request);
	waitUntil(dispose().catch((cause) => console.error("OTEL shutdown failed", cause)));
	return response;
}

export const POST = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
export const OPTIONS = GET;
