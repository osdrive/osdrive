import { Effect, Layer, Schema } from "effect";
import * as WebSdk from "@effect/opentelemetry/WebSdk";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiScalar,
	OpenApi,
} from "effect/unstable/httpapi";
import { waitUntil } from "cloudflare:workers";
import type { APIEvent } from "@solidjs/start/server";
import { serverEnv } from "~/server/lib/env";
import { name, version } from "../../../package.json" with { type: 'json' };

const HelloResponse = Schema.Struct({
	message: Schema.String,
	name: Schema.String,
}).annotate({ identifier: "HelloResponse" });

const helloEndpoint = HttpApiEndpoint.get("hello", "/hello/:name", {
	params: {
		name: Schema.String,
	},
	success: HelloResponse,
}).annotateMerge(
	OpenApi.annotations({
		summary: "Say hello",
		description: "Returns a demo JSON response using Effect HttpApi and Effect Schema.",
	}),
);

const api = HttpApi.make("OSDriveApi")
	.add(
		HttpApiGroup.make("demo")
			.add(helloEndpoint)
			.annotateMerge(
				OpenApi.annotations({
					title: "Demo",
					description: "Demo endpoints for the Cloudflare Worker.",
				}),
			),
	)
	.prefix("/api")
	.annotateMerge(
		OpenApi.annotations({
			title: "OSDrive API",
			version,
			description: "OSDrive Web API",
			servers: [{ url: "/" }],
		}),
	);

const demoGroupLayer = HttpApiBuilder.group(api, "demo", (handlers) =>
	handlers.handle("hello", ({ params }) =>
		Effect.succeed({
			message: `Hello, ${params.name}!`,
			name: params.name,
		}),
	),
);

const appLayer = Layer.mergeAll(
	HttpApiBuilder.layer(api, { openapiPath: "/api/openapi.json" }),
	HttpApiScalar.layerCdn(api, { path: "/api/docs" }),
).pipe(Layer.provideMerge(demoGroupLayer));

const makeTelemetryLayer = () => {
	if (!serverEnv.AXIOM_DATASET || !serverEnv.AXIOM_DOMAIN || !serverEnv.AXIOM_TOKEN) return;

	const exporter = new OTLPTraceExporter({
		url: `https://${serverEnv.AXIOM_DOMAIN}/v1/traces`,
		headers: {
			Authorization: `Bearer ${serverEnv.AXIOM_TOKEN}`,
			"X-Axiom-Dataset": serverEnv.AXIOM_DATASET,
		},
	});

	const spanProcessor = new BatchSpanProcessor(
	  new OTLPTraceExporter({
  		url: `https://${serverEnv.AXIOM_DOMAIN}/v1/traces`,
  		headers: {
  			Authorization: `Bearer ${serverEnv.AXIOM_TOKEN}`,
  			"X-Axiom-Dataset": serverEnv.AXIOM_DATASET,
  		},
  	}), {
  		scheduledDelayMillis: 1_000,
  		exportTimeoutMillis: 10_000,
  		maxExportBatchSize: 32,
  		maxQueueSize: 256,
  	}
	);

	return {
		forceFlush: () => spanProcessor.forceFlush(),
		layer: WebSdk.layer(() => ({
			resource: {
				serviceName: name,
				serviceVersion: version,
			},
			spanProcessor,
		})),
	};
};

export async function GET({ request }: APIEvent) {
  const telemetry = makeTelemetryLayer();
	const handlerLayer = (telemetry ? Layer.mergeAll(appLayer, telemetry.layer) : appLayer).pipe(
		Layer.provide(HttpServer.layerServices),
	);
	const handler = HttpRouter.toWebHandler(handlerLayer).handler;
	const response = await handler(request);

	if (telemetry?.forceFlush)
		waitUntil(telemetry.forceFlush().catch((cause) => console.error("OTEL forceFlush failed", cause)));

	return response;
}

export const POST = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
